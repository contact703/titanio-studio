#!/usr/bin/env python3
"""
🎬 Titanio Video Factory — Pipeline Principal
Script → Vídeo editado → WhatsApp

Uso:
    python pipeline.py "tema do vídeo"
    python pipeline.py "tema" --duration 60 --voice feminina
    python pipeline.py --audio input.mp3  (transcreve e cria vídeo)
"""
import os
import sys
import json
import time
import argparse
from datetime import datetime

# Adicionar src ao path
sys.path.insert(0, os.path.dirname(__file__))

from scriptwriter import generate_script
from illustrator import generate_images
from narrator import narrate_scenes
from renderer import render_video

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")


def run_pipeline(
    topic: str = None,
    audio_path: str = None,
    duration: int = 60,
    voice: str = "default",
    style: str = "informativo",
    music_path: str = None,
    format: str = "vertical"  # vertical (9:16) ou horizontal (16:9)
) -> dict:
    """Executa o pipeline completo."""
    
    start_time = time.time()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Dimensões
    if format == "vertical":
        width, height = 1080, 1920
    else:
        width, height = 1920, 1080
    
    result = {
        "status": "started",
        "steps": [],
        "timestamp": timestamp
    }
    
    try:
        # ═══════════════════════════════════════
        # PASSO 1: Transcrição (se áudio)
        # ═══════════════════════════════════════
        if audio_path:
            print("📝 Passo 1: Transcrevendo áudio...")
            from transcriber import transcribe
            transcription = transcribe(audio_path)
            topic = transcription["full_text"]
            result["steps"].append({"step": "transcription", "status": "ok", "text_length": len(topic)})
            print(f"   ✅ Transcrito: {len(topic)} caracteres")
        
        if not topic:
            raise ValueError("Precisa de um tema ou áudio!")
        
        # ═══════════════════════════════════════
        # PASSO 2: Gerar roteiro
        # ═══════════════════════════════════════
        print("✍️  Passo 2: Gerando roteiro...")
        script = generate_script(topic, duration, style)
        scenes = script.get("scenes", [])
        result["steps"].append({"step": "script", "status": "ok", "scenes": len(scenes), "title": script.get("title", "")})
        print(f"   ✅ Roteiro: {len(scenes)} cenas — \"{script.get('title', '')}\"")
        
        # Salvar roteiro
        script_path = os.path.join(OUTPUT_DIR, f"script_{timestamp}.json")
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        with open(script_path, "w", encoding="utf-8") as f:
            json.dump(script, f, ensure_ascii=False, indent=2)
        
        # ═══════════════════════════════════════
        # PASSO 3: Gerar ilustrações
        # ═══════════════════════════════════════
        print("🎨 Passo 3: Gerando ilustrações...")
        image_paths = generate_images(scenes, width, height)
        result["steps"].append({"step": "illustrations", "status": "ok", "count": len(image_paths)})
        print(f"   ✅ {len(image_paths)} imagens geradas")
        
        # ═══════════════════════════════════════
        # PASSO 4: Gerar narração
        # ═══════════════════════════════════════
        print("🎙️  Passo 4: Gerando narração...")
        audio_paths = narrate_scenes(scenes, voice)
        result["steps"].append({"step": "narration", "status": "ok", "count": len(audio_paths)})
        print(f"   ✅ {len(audio_paths)} áudios narrados")
        
        # ═══════════════════════════════════════
        # PASSO 5: Renderizar vídeo
        # ═══════════════════════════════════════
        print("🎬 Passo 5: Renderizando vídeo final...")
        output_name = f"video_{timestamp}.mp4"
        video_path = render_video(
            scenes=scenes,
            image_paths=image_paths,
            audio_paths=audio_paths,
            output_name=output_name,
            width=width,
            height=height,
            music_path=music_path
        )
        
        elapsed = time.time() - start_time
        
        result.update({
            "status": "completed",
            "video_path": video_path,
            "title": script.get("title", "Vídeo"),
            "scenes_count": len(scenes),
            "duration_seconds": sum(s.get("duration", 5) for s in scenes),
            "elapsed_seconds": round(elapsed, 1),
            "format": format,
            "resolution": f"{width}x{height}"
        })
        result["steps"].append({"step": "render", "status": "ok", "path": video_path})
        
        print(f"\n{'='*50}")
        print(f"✅ VÍDEO PRONTO!")
        print(f"   📁 {video_path}")
        print(f"   🎬 {len(scenes)} cenas")
        print(f"   ⏱️  {elapsed:.1f} segundos de produção")
        print(f"{'='*50}")
        
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        print(f"\n❌ Erro no pipeline: {e}")
        import traceback
        traceback.print_exc()
    
    # Salvar resultado
    result_path = os.path.join(OUTPUT_DIR, f"result_{timestamp}.json")
    with open(result_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    return result


def main():
    parser = argparse.ArgumentParser(description="🎬 Titanio Video Factory")
    parser.add_argument("topic", nargs="?", help="Tema do vídeo")
    parser.add_argument("--audio", help="Áudio para transcrever e criar vídeo")
    parser.add_argument("--duration", type=int, default=60, help="Duração em segundos (default: 60)")
    parser.add_argument("--voice", default="default", choices=["default", "masculina", "feminina"])
    parser.add_argument("--style", default="informativo", choices=["informativo", "storytelling", "humoristico", "educativo", "motivacional"])
    parser.add_argument("--music", help="Path para música de fundo")
    parser.add_argument("--format", default="vertical", choices=["vertical", "horizontal"])
    parser.add_argument("--json", action="store_true", help="Output em JSON")
    
    args = parser.parse_args()
    
    if not args.topic and not args.audio:
        parser.print_help()
        sys.exit(1)
    
    result = run_pipeline(
        topic=args.topic,
        audio_path=args.audio,
        duration=args.duration,
        voice=args.voice,
        style=args.style,
        music_path=args.music,
        format=args.format
    )
    
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
