#!/usr/bin/env python3
"""
Titanio Video Factory — Pipeline principal
==========================================
Gera vídeos verticais 1080x1920 (Reels/Shorts) a partir de texto.

Stack:
  - Claude/Ollama → roteiro (4 cenas)
  - Edge TTS → narração PT-BR neural
  - MoviePy + FFmpeg → renderização

Uso:
  python3 video_factory.py --tema "5 dicas de produtividade"
  python3 video_factory.py --roteiro exemplos/produtividade.json
  python3 video_factory.py --check   # verifica dependências

Autor: Tita (IA da Titanio Films)
Data: Março 2026
"""

import argparse
import asyncio
import json
import os
import sys
import tempfile
import time
import uuid
from pathlib import Path
from typing import Optional

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTES
# ─────────────────────────────────────────────────────────────────────────────

LARGURA = 1080
ALTURA = 1920
FPS = 30
DURACAO_TOTAL = 30.0  # segundos
N_CENAS = 4
DUR_CENA = DURACAO_TOTAL / N_CENAS  # 7.5s

VOZ_PADRAO = "pt-BR-FranciscaNeural"
VOZ_MASCULINA = "pt-BR-AntonioNeural"

# Paleta de fundos por cena (padrão: escuro/gradiente)
FUNDOS_PADRAO = [
    "#1a1a2e",  # Cena 1: Azul escuro profundo
    "#16213e",  # Cena 2: Azul marinho
    "#0f3460",  # Cena 3: Azul royal
    "#533483",  # Cena 4: Roxo vibrante
]


# ─────────────────────────────────────────────────────────────────────────────
# VERIFICAÇÃO DE DEPENDÊNCIAS
# ─────────────────────────────────────────────────────────────────────────────

def verificar_dependencias() -> bool:
    """Verifica se todas as dependências estão instaladas."""
    import subprocess
    erros = []
    ok = []

    # FFmpeg
    result = subprocess.run(["which", "ffmpeg"], capture_output=True)
    if result.returncode == 0:
        ok.append("✅ ffmpeg: " + result.stdout.decode().strip())
    else:
        erros.append("❌ ffmpeg: não encontrado (brew install ffmpeg)")

    # MoviePy
    try:
        import moviepy
        ok.append(f"✅ moviepy: {moviepy.__version__}")
    except ImportError:
        erros.append("❌ moviepy: não instalado (pip3 install moviepy==1.0.3)")

    # Edge TTS
    try:
        import edge_tts
        ok.append("✅ edge-tts: instalado")
    except ImportError:
        erros.append("❌ edge-tts: não instalado (pip3 install edge-tts)")

    # Pillow
    try:
        from PIL import Image
        ok.append("✅ Pillow: instalado")
    except ImportError:
        erros.append("❌ Pillow: não instalado (pip3 install Pillow)")

    # NumPy
    try:
        import numpy
        ok.append(f"✅ numpy: {numpy.__version__}")
    except ImportError:
        erros.append("❌ numpy: não instalado (pip3 install numpy)")

    # Anthropic (opcional)
    try:
        import anthropic
        ok.append("✅ anthropic: instalado")
    except ImportError:
        ok.append("⚠️  anthropic: não instalado (roteiro manual necessário)")

    print("\n=== Titanio Video Factory — Verificação de Dependências ===\n")
    for msg in ok:
        print(msg)
    for msg in erros:
        print(msg)

    if erros:
        print(f"\n⚠️  {len(erros)} dependência(s) faltando. Instale antes de continuar.")
        return False
    else:
        print("\n🎬 Todas as dependências OK! Pronto para produzir.")
        return True


# ─────────────────────────────────────────────────────────────────────────────
# GERAÇÃO DE ROTEIRO
# ─────────────────────────────────────────────────────────────────────────────

def gerar_roteiro_claude(tema: str, n_cenas: int = 4) -> dict:
    """Gera roteiro via Claude (Anthropic)."""
    import anthropic

    client = anthropic.Anthropic()

    prompt = f"""Crie um roteiro para um vídeo curto de {DURACAO_TOTAL:.0f} segundos sobre: "{tema}"

O vídeo tem {n_cenas} cenas de {DUR_CENA:.1f} segundos cada.

Retorne APENAS um JSON com este formato exato:
{{
  "titulo": "Título chamativo do vídeo",
  "tema": "{tema}",
  "cenas": [
    {{
      "numero": 1,
      "duracao": {DUR_CENA},
      "texto_tela": "Texto curto para exibir na tela (máx 8 palavras)",
      "narracao": "Narração falada para esta cena (1-2 frases impactantes)",
      "fundo": "#1a1a2e"
    }}
  ]
}}

Regras:
- texto_tela: máximo 8 palavras, impactante
- narracao: direto ao ponto, ganchos fortes
- Cena 1: gancho/problema
- Cenas 2-3: solução/conteúdo
- Cena 4: resultado/CTA (chamada pra ação)
- Tom: didático mas casual, para Instagram
- Fundos: use cores escuras/vibrantes (#1a1a2e, #16213e, #0f3460, #533483)

Responda SOMENTE o JSON, sem explicações."""

    print(f"🤖 Gerando roteiro via Claude para: '{tema}'...")
    msg = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    texto = msg.content[0].text.strip()
    # Limpa markdown se necessário
    if texto.startswith("```"):
        texto = texto.split("```")[1]
        if texto.startswith("json"):
            texto = texto[4:]

    return json.loads(texto.strip())


def gerar_roteiro_local(tema: str, n_cenas: int = 4) -> dict:
    """Gera roteiro simples sem IA (fallback)."""
    print(f"📝 Gerando roteiro local para: '{tema}'...")

    cenas_exemplo = [
        {
            "numero": 1,
            "duracao": DUR_CENA,
            "texto_tela": f"Você sabia sobre {tema.split()[0]}?",
            "narracao": f"Hoje vou te contar algo importante sobre {tema}.",
            "fundo": FUNDOS_PADRAO[0]
        },
        {
            "numero": 2,
            "duracao": DUR_CENA,
            "texto_tela": "Ponto #1: Começa aqui",
            "narracao": f"O primeiro passo para {tema} é entender o básico.",
            "fundo": FUNDOS_PADRAO[1]
        },
        {
            "numero": 3,
            "duracao": DUR_CENA,
            "texto_tela": "Ponto #2: Vai fundo",
            "narracao": "Aprofunde-se no tema e coloque em prática hoje mesmo.",
            "fundo": FUNDOS_PADRAO[2]
        },
        {
            "numero": 4,
            "duracao": DUR_CENA,
            "texto_tela": "Resultado: Você consegue!",
            "narracao": f"Segue para aprender mais sobre {tema}. Ativa o sino! 🔔",
            "fundo": FUNDOS_PADRAO[3]
        }
    ]

    return {
        "titulo": f"Guia: {tema}",
        "tema": tema,
        "cenas": cenas_exemplo[:n_cenas]
    }


# ─────────────────────────────────────────────────────────────────────────────
# NARRAÇÃO (EDGE TTS)
# ─────────────────────────────────────────────────────────────────────────────

async def gerar_audio_async(texto: str, saida: str, voz: str = VOZ_PADRAO) -> str:
    """Gera áudio MP3 com Edge TTS de forma assíncrona."""
    import edge_tts

    communicate = edge_tts.Communicate(texto, voz)
    await communicate.save(saida)
    return saida


def gerar_audio(texto: str, saida: str, voz: str = VOZ_PADRAO) -> str:
    """Wrapper síncrono para geração de áudio."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(gerar_audio_async(texto, saida, voz))
    finally:
        loop.close()


# ─────────────────────────────────────────────────────────────────────────────
# RENDERIZAÇÃO DE CENA
# ─────────────────────────────────────────────────────────────────────────────

def hex_para_rgb(hex_color: str) -> tuple:
    """Converte cor hex para tupla RGB."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def criar_frame_cena(texto: str, cor_fundo: str, largura: int = LARGURA, altura: int = ALTURA) -> "numpy.ndarray":
    """Cria um frame de imagem para a cena com texto centralizado."""
    from PIL import Image, ImageDraw, ImageFont
    import numpy as np

    # Cor de fundo
    rgb = hex_para_rgb(cor_fundo)
    img = Image.new("RGB", (largura, altura), rgb)
    draw = ImageDraw.Draw(img)

    # Fonte (tenta carregar Arial, fallback para default)
    tamanho_fonte = 80
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", tamanho_fonte)
        font_pequena = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 50)
    except Exception:
        font = ImageFont.load_default()
        font_pequena = font

    # Quebra o texto em linhas
    palavras = texto.split()
    linhas = []
    linha_atual = ""
    max_chars_por_linha = 18

    for palavra in palavras:
        if len(linha_atual + " " + palavra) <= max_chars_por_linha:
            linha_atual = (linha_atual + " " + palavra).strip()
        else:
            if linha_atual:
                linhas.append(linha_atual)
            linha_atual = palavra
    if linha_atual:
        linhas.append(linha_atual)

    # Renderiza texto centralizado
    y_total = len(linhas) * (tamanho_fonte + 20)
    y_start = (altura - y_total) // 2

    for i, linha in enumerate(linhas):
        try:
            bbox = draw.textbbox((0, 0), linha, font=font)
            text_w = bbox[2] - bbox[0]
        except Exception:
            text_w = len(linha) * 40

        x = (largura - text_w) // 2
        y = y_start + i * (tamanho_fonte + 20)

        # Sombra
        draw.text((x + 3, y + 3), linha, font=font, fill=(0, 0, 0, 150))
        # Texto principal (branco)
        draw.text((x, y), linha, font=font, fill=(255, 255, 255))

    # Marca Titanio Films no rodapé
    rodape = "Titanio Films"
    try:
        bbox_r = draw.textbbox((0, 0), rodape, font=font_pequena)
        rw = bbox_r[2] - bbox_r[0]
    except Exception:
        rw = len(rodape) * 25
    draw.text(((largura - rw) // 2, altura - 120), rodape, font=font_pequena, fill=(255, 255, 255, 128))

    return np.array(img)


def renderizar_cena(
    cena: dict,
    audio_path: str,
    duracao: float,
    voz: str = VOZ_PADRAO,
    tmp_dir: str = "/tmp"
) -> "moviepy.editor.VideoClip":
    """Renderiza uma cena completa (imagem + áudio)."""
    import moviepy.editor as mpe
    import numpy as np

    # Gera frame da cena
    texto = cena.get("texto_tela", "")
    cor = cena.get("fundo", FUNDOS_PADRAO[0])
    frame = criar_frame_cena(texto, cor)

    # Clip de imagem estático
    def make_frame(t):
        return frame

    video_clip = mpe.VideoClip(make_frame, duration=duracao)
    video_clip = video_clip.set_fps(FPS)

    # Carrega áudio (se existir)
    if os.path.exists(audio_path) and os.path.getsize(audio_path) > 0:
        try:
            audio_clip = mpe.AudioFileClip(audio_path)
            # Ajusta áudio para duração da cena
            if audio_clip.duration > duracao:
                audio_clip = audio_clip.subclip(0, duracao)
            video_clip = video_clip.set_audio(audio_clip)
        except Exception as e:
            print(f"  ⚠️  Áudio da cena não carregado: {e}")

    return video_clip


# ─────────────────────────────────────────────────────────────────────────────
# PIPELINE PRINCIPAL
# ─────────────────────────────────────────────────────────────────────────────

def produzir_video(
    roteiro: dict,
    saida: Optional[str] = None,
    voz: str = VOZ_PADRAO,
    duracao_total: float = DURACAO_TOTAL
) -> str:
    """
    Pipeline principal: roteiro → vídeo.

    Args:
        roteiro: Dict com título, tema e cenas
        saida: Caminho do arquivo de saída (None = /tmp/reel-XXXXX.mp4)
        voz: Voz do Edge TTS
        duracao_total: Duração total em segundos

    Returns:
        Caminho do vídeo gerado
    """
    import moviepy.editor as mpe

    t0 = time.time()

    # Saída padrão
    if not saida:
        uid = str(uuid.uuid4())[:8]
        saida = f"/tmp/reel-{uid}.mp4"

    cenas = roteiro.get("cenas", [])
    n = len(cenas)
    dur_cena = duracao_total / n

    print(f"\n🎬 Produzindo: {roteiro.get('titulo', 'Vídeo')}")
    print(f"   {n} cenas × {dur_cena:.1f}s = {duracao_total:.0f}s total")
    print(f"   Voz: {voz}")
    print(f"   Saída: {saida}\n")

    clips = []
    tmp_audios = []

    for i, cena in enumerate(cenas):
        num = cena.get("numero", i + 1)
        texto_narr = cena.get("narracao", cena.get("texto_tela", ""))

        print(f"  🎙️  Cena {num}/{n}: gerando narração...")
        audio_tmp = f"/tmp/narr_cena{num}_{uuid.uuid4().hex[:6]}.mp3"
        tmp_audios.append(audio_tmp)

        try:
            gerar_audio(texto_narr, audio_tmp, voz)
            print(f"  ✅  Cena {num}: áudio ok ({os.path.getsize(audio_tmp)} bytes)")
        except Exception as e:
            print(f"  ❌  Cena {num}: erro no TTS — {e}")
            audio_tmp = ""

        print(f"  🎨  Cena {num}/{n}: renderizando frame...")
        clip = renderizar_cena(cena, audio_tmp, dur_cena, voz)
        clips.append(clip)

    print(f"\n  🔗 Concatenando {n} cenas...")
    video_final = mpe.concatenate_videoclips(clips, method="compose")

    print(f"  💾 Exportando para {saida}...")
    video_final.write_videofile(
        saida,
        codec="libx264",
        audio_codec="aac",
        fps=FPS,
        preset="fast",
        verbose=False,
        logger=None
    )

    # Limpeza
    for f in tmp_audios:
        if f and os.path.exists(f):
            os.remove(f)

    t_total = time.time() - t0
    tamanho = os.path.getsize(saida) / 1024 / 1024

    print(f"\n✨ Vídeo produzido em {t_total:.1f}s!")
    print(f"   📁 {saida} ({tamanho:.1f}MB)")

    return saida


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Titanio Video Factory — Gerador de Reels 1080x1920",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python3 video_factory.py --tema "5 dicas de produtividade"
  python3 video_factory.py --roteiro exemplos/produtividade.json
  python3 video_factory.py --tema "Como ganhar dinheiro" --voz pt-BR-AntonioNeural
  python3 video_factory.py --check
        """
    )

    parser.add_argument("--tema", "-t", help="Tema do vídeo (gera roteiro automaticamente)")
    parser.add_argument("--roteiro", "-r", help="Arquivo JSON com roteiro pré-definido")
    parser.add_argument("--saida", "-o", help="Caminho de saída do vídeo (default: /tmp/reel-XXXX.mp4)")
    parser.add_argument("--voz", "-v", default=VOZ_PADRAO,
                        choices=["pt-BR-FranciscaNeural", "pt-BR-AntonioNeural"],
                        help="Voz do Edge TTS")
    parser.add_argument("--duracao", "-d", type=float, default=DURACAO_TOTAL,
                        help=f"Duração total em segundos (default: {DURACAO_TOTAL})")
    parser.add_argument("--cenas", "-c", type=int, default=N_CENAS,
                        help=f"Número de cenas (default: {N_CENAS})")
    parser.add_argument("--local", action="store_true",
                        help="Forçar roteiro local (sem Claude)")
    parser.add_argument("--check", action="store_true",
                        help="Verificar dependências e sair")

    args = parser.parse_args()

    # Verifica dependências
    if args.check:
        ok = verificar_dependencias()
        sys.exit(0 if ok else 1)

    # Carrega ou gera roteiro
    if args.roteiro:
        with open(args.roteiro) as f:
            roteiro = json.load(f)
        print(f"📄 Roteiro carregado: {args.roteiro}")

    elif args.tema:
        # Tenta Claude primeiro, depois fallback local
        if not args.local:
            try:
                roteiro = gerar_roteiro_claude(args.tema, args.cenas)
            except Exception as e:
                print(f"⚠️  Claude falhou ({e}), usando roteiro local...")
                roteiro = gerar_roteiro_local(args.tema, args.cenas)
        else:
            roteiro = gerar_roteiro_local(args.tema, args.cenas)

    else:
        # Roteiro demo
        print("ℹ️  Nenhum tema ou roteiro fornecido — usando demo de produtividade")
        roteiro = gerar_roteiro_local("produtividade e foco no trabalho", args.cenas)

    # Produz vídeo
    saida = produzir_video(
        roteiro=roteiro,
        saida=args.saida,
        voz=args.voz,
        duracao_total=args.duracao
    )

    print(f"\n🎉 Concluído! Seu Reel está em:\n   {saida}")
    return saida


if __name__ == "__main__":
    main()
