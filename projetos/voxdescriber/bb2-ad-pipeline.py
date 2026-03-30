#!/usr/bin/env python3
"""
BB2 Trailer — Pipeline de Audiodescrição Profissional
Ada Vox / VoxDescriber
"""

import json, subprocess, os, sys

SLOTS = [
    {
        "idx": 0, "start": 5.07, "end": 9.46, "duration": 4.39,
        "ad": "Jovem de bigode e argola no nariz fala para a câmera.",
    },
    {
        "idx": 1, "start": 14.7, "end": 24.18, "duration": 9.48,
        "ad": "Homem de chapéu de palha azul observa bandeiras coloridas numa festa ao ar livre. Texto na camiseta: apoio cultural.",
    },
    {
        "idx": 2, "start": 27.8, "end": 33.94, "duration": 6.14,
        "ad": "Mulher de blusa preta fala em depoimento. Ao fundo, um estúdio de gravação.",
    },
    {
        "idx": 3, "start": 46.4, "end": 47.9, "duration": 1.5,
        "ad": "Jovem caminha.",
    },
    # slot 52.06-53.28 (1.22s) FILTRADO
    {
        "idx": 5, "start": 54.2, "end": 62.45, "duration": 8.26,
        "ad": "No palco, cinco músicos. O mais velho, de túnica branca, para diante do microfone.",
    },
    # slot 64.04-65.49 (1.45s) FILTRADO
    # slot 69.26-70.24 (0.98s) FILTRADO
    {
        "idx": 8, "start": 70.59, "end": 74.27, "duration": 3.68,
        "ad": "Jovem de óculos canta emocionado ao ar livre.",
    },
    {
        "idx": 9, "start": 79.82, "end": 91.3, "duration": 11.48,
        "ad": "Vista panorâmica de rio ao entardecer. Barcos ancorados refletem na água dourada. Pessoas socializam na margem.",
    },
    {
        "idx": 10, "start": 94.11, "end": 100.88, "duration": 6.78,
        "ad": "Homem de boné bordô e óculos escuros fala ao ar livre. Casas coloridas ao fundo.",
    },
    {
        "idx": 11, "start": 103.79, "end": 105.5, "duration": 1.71,
        "ad": "Jovem caminha no viaduto.",
    },
    # slot 106.09-106.93 (0.83s) FILTRADO
    {
        "idx": 13, "start": 109.56, "end": 111.84, "duration": 2.28,
        "ad": "Homem sentado ao piano.",
    },
    {
        "idx": 14, "start": 120.22, "end": 127.13, "duration": 6.91,
        "ad": "Tela preta. Título: Brazilian Beats dois. Produção Titanio Films, dirigido por Tiago Arakilian.",
    },
]

WORK_DIR = "/tmp/bb2-ad-work"
OUT_DIR = "/Volumes/TITA_039/FILMS_AUDIODESCRICAO"
WA_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos"
VIDEO = "/tmp/bb2-proxy.mp4"

os.makedirs(WORK_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

def run(cmd, check=True):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if check and result.returncode != 0:
        print(f"ERRO:\n{result.stderr[-500:]}")
    return result

def get_duration(path):
    r = run(f'ffprobe -i "{path}" -show_entries format=duration -v quiet -of csv=p=0', check=False)
    try:
        return float(r.stdout.strip())
    except:
        return 0.0

print("="*60)
print("BB2 TRAILER — AUDIODESCRIÇÃO PROFISSIONAL — Ada Vox")
print("="*60)

report = []
audio_files = []

for slot in SLOTS:
    idx = slot["idx"]
    start = slot["start"]
    dur = slot["duration"]
    ad_text = slot["ad"]

    aiff = f"{WORK_DIR}/ad_{idx:02d}.aiff"
    wav  = f"{WORK_DIR}/ad_{idx:02d}.wav"

    print(f"\n[Slot {idx:02d}] {start:.2f}s–{slot['end']:.2f}s ({dur:.2f}s)")
    print(f"  → {ad_text}")

    run(f'say -v Luciana -r 150 "{ad_text}" -o "{aiff}"')
    run(f'afconvert "{aiff}" "{wav}" -d LEI16 -f WAVE')

    audio_dur = get_duration(wav)
    pct = (audio_dur / dur * 100) if dur > 0 else 0
    print(f"  Slot: {dur:.2f}s | Áudio: {audio_dur:.2f}s | {pct:.0f}%", end="")

    if pct > 90:
        print(" ⚠️  REDUZINDO...")
        words = ad_text.split()
        for n in range(len(words)-1, 2, -1):
            shorter = " ".join(words[:n]).rstrip(".,;") + "."
            run(f'say -v Luciana -r 150 "{shorter}" -o "{aiff}"')
            run(f'afconvert "{aiff}" "{wav}" -d LEI16 -f WAVE')
            new_dur = get_duration(wav)
            new_pct = (new_dur / dur * 100)
            if new_pct <= 90:
                ad_text = shorter
                audio_dur = new_dur
                pct = new_pct
                print(f"  → Ajustado: {shorter} ({new_dur:.2f}s, {new_pct:.0f}%)")
                break
    else:
        print(" ✓")

    audio_files.append((start, wav))
    report.append({
        "slot_idx": idx,
        "timestamp_inicio": start,
        "timestamp_fim": slot["end"],
        "slot_duracao": round(dur, 2),
        "ad_texto": ad_text,
        "audio_duracao": round(audio_dur, 2),
        "percent_slot": round(pct, 1),
    })

# ─── Construir trilha AD ────────────────────────────────────────────────────
print("\n" + "="*60)
print("MONTANDO TRILHA DE AD...")

video_dur = get_duration(VIDEO) or 127.0
silence = f"{WORK_DIR}/silence.wav"
run(f'ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t {video_dur:.3f} -ar 44100 "{silence}" -y -loglevel quiet')

# Montar via filter_complex com adelay
inputs_str = f'-i "{silence}"'
filter_parts = []
labels = []
for i, (t_start, wav_path) in enumerate(audio_files):
    inputs_str += f' -i "{wav_path}"'
    delay_ms = int(t_start * 1000)
    filter_parts.append(f"[{i+1}:a]adelay={delay_ms}|{delay_ms}[ad{i}]")
    labels.append(f"[ad{i}]")

n = len(audio_files)
mix_filter = ";".join(filter_parts) + f";{''.join(labels)}amix=inputs={n}:normalize=0:duration=first[adout]"

ad_track = f"{WORK_DIR}/ad_track.wav"
cmd = f'ffmpeg {inputs_str} -filter_complex "{mix_filter}" -map "[adout]" "{ad_track}" -y -loglevel quiet'
print("Gerando trilha...")
run(cmd)

# ─── Mixar com vídeo ────────────────────────────────────────────────────────
print("Mixando com vídeo (ducking 35%)...")
hd_out = f"{OUT_DIR}/BB2_TRAILER_AD.mp4"
wa_out = f"{WA_DIR}/BB2_TRAILER_AD_WA.mp4"

run(f'''ffmpeg -i "{VIDEO}" -i "{ad_track}" \
  -filter_complex "[0:a]volume=0.35[bg];[1:a]volume=1.6[fg];[bg][fg]amix=inputs=2:duration=first:normalize=0[mix]" \
  -map 0:v -map "[mix]" -c:v copy -c:a aac -b:a 192k "{hd_out}" -y -loglevel quiet''')

hd_sz = os.path.getsize(hd_out)/(1024*1024) if os.path.exists(hd_out) else 0
print(f"HD: {hd_out} ({hd_sz:.1f}MB)")

print("Gerando versão WhatsApp (<16MB)...")
run(f'ffmpeg -i "{hd_out}" -c:v libx264 -preset fast -crf 28 -vf scale=640:-2 -c:a aac -b:a 128k "{wa_out}" -y -loglevel quiet')
wa_sz = os.path.getsize(wa_out)/(1024*1024) if os.path.exists(wa_out) else 0
print(f"WA: {wa_out} ({wa_sz:.1f}MB)")

# ─── Relatório ──────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("RELATÓRIO FINAL")
print("="*60)
print(f"{'Slot':>4} | {'Início':>6} | {'Slot':>5} | {'Áudio':>5} | {'%':>4} | Texto AD")
print("-"*90)
for r in report:
    ts = f"{r['timestamp_inicio']:.1f}s"
    print(f"{r['slot_idx']:>4} | {ts:>6} | {r['slot_duracao']:>4.1f}s | {r['audio_duracao']:>4.1f}s | {r['percent_slot']:>3.0f}% | {r['ad_texto'][:60]}")

print(f"\nSlots filtrados (< 1.5s): idx 4 (1.22s), idx 6 (1.45s), idx 7 (0.98s), idx 12 (0.83s)")
print(f"\n✅ CONCLUÍDO")
print(f"📹 HD: {hd_out} ({hd_sz:.1f}MB)")
print(f"📱 WA: {wa_out} ({wa_sz:.1f}MB)")

rpt_path = f"{WA_DIR}/BB2_AD_REPORT.json"
with open(rpt_path, "w", encoding="utf-8") as f:
    json.dump({"total_slots_usados": len(SLOTS), "slots_filtrados": 4, "ads": report}, f, ensure_ascii=False, indent=2)
print(f"📄 Relatório JSON: {rpt_path}")
