"""
Transcritor de áudio usando Whisper local.
Áudio → Texto com timestamps.
"""
import whisper
import json
import os

MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
_model = None

def get_model():
    global _model
    if _model is None:
        _model = whisper.load_model(MODEL_SIZE)
    return _model

def transcribe(audio_path: str, language: str = "pt") -> dict:
    """Transcreve áudio e retorna texto + segmentos com timestamps."""
    model = get_model()
    result = model.transcribe(audio_path, language=language, word_timestamps=True)
    
    segments = []
    for seg in result["segments"]:
        segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "text": seg["text"].strip()
        })
    
    return {
        "full_text": result["text"].strip(),
        "segments": segments,
        "language": result.get("language", language)
    }

def generate_srt(segments: list, output_path: str):
    """Gera arquivo SRT a partir dos segmentos."""
    with open(output_path, "w", encoding="utf-8") as f:
        for i, seg in enumerate(segments, 1):
            start = _format_time(seg["start"])
            end = _format_time(seg["end"])
            f.write(f"{i}\n{start} --> {end}\n{seg['text']}\n\n")

def _format_time(seconds: float) -> str:
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        result = transcribe(sys.argv[1])
        print(json.dumps(result, ensure_ascii=False, indent=2))
