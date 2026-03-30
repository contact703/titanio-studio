"""
Narrador — gera áudio de voz a partir do texto.
Usa Edge TTS (Microsoft, grátis) ou Piper TTS (local).
"""
import os
import asyncio
import edge_tts

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "audio")

# Vozes brasileiras do Edge TTS (grátis, qualidade excelente)
VOICES = {
    "masculina": "pt-BR-AntonioNeural",
    "feminina": "pt-BR-FranciscaNeural",
    "default": "pt-BR-AntonioNeural"
}


async def _generate_edge_tts(text: str, output_path: str, voice: str = "default"):
    """Gera áudio com Edge TTS (Microsoft, grátis)."""
    voice_name = VOICES.get(voice, VOICES["default"])
    communicate = edge_tts.Communicate(text, voice_name, rate="+0%", pitch="+0Hz")
    await communicate.save(output_path)


def narrate(text: str, output_path: str = None, voice: str = "default") -> str:
    """Gera narração do texto. Retorna path do arquivo de áudio."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    if output_path is None:
        output_path = os.path.join(OUTPUT_DIR, "narration.mp3")
    
    asyncio.run(_generate_edge_tts(text, output_path, voice))
    return output_path


def narrate_scenes(scenes: list, voice: str = "default") -> list:
    """Gera áudio para cada cena. Retorna lista de paths."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    paths = []
    
    for scene in scenes:
        text = scene.get("narration", "")
        number = scene.get("number", len(paths) + 1)
        if not text:
            continue
        
        path = os.path.join(OUTPUT_DIR, f"scene_{number:03d}.mp3")
        asyncio.run(_generate_edge_tts(text, path, voice))
        paths.append({"number": number, "path": path, "text": text})
    
    return paths


if __name__ == "__main__":
    import sys
    text = sys.argv[1] if len(sys.argv) > 1 else "Olá! Este é um teste do Titanio Video Factory."
    path = narrate(text)
    print(f"✅ Áudio gerado: {path}")
