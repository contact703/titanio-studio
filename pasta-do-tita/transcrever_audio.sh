#!/bin/bash
# Script para transcrever áudios do WhatsApp usando Whisper

AUDIO_FILE="$1"
OUTPUT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/transcricoes"

mkdir -p "$OUTPUT_DIR"

if [ -z "$AUDIO_FILE" ]; then
    echo "Uso: $0 <arquivo.ogg>"
    exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
    echo "Arquivo não encontrado: $AUDIO_FILE"
    exit 1
fi

echo "🎙️ Transcrevendo áudio: $AUDIO_FILE"
echo "⏳ Isso pode levar alguns segundos..."

# Converter OGG para WAV (Whisper aceita melhor) e transcrever
ffmpeg -i "$AUDIO_FILE" -ar 16000 -ac 1 -c:a pcm_s16le -f wav - 2>/dev/null | \
    whisper - --model base --language pt --output_format txt --output_dir "$OUTPUT_DIR" --fp16 False

# Mostrar resultado
BASE_NAME=$(basename "$AUDIO_FILE" .ogg)
TRANSCRIPTION_FILE="$OUTPUT_DIR/$BASE_NAME.txt"

if [ -f "$TRANSCRIPTION_FILE" ]; then
    echo ""
    echo "📝 TRANSCRIÇÃO:"
    echo "────────────────────────────────────────"
    cat "$TRANSCRIPTION_FILE"
    echo ""
    echo "────────────────────────────────────────"
    echo "✅ Salvo em: $TRANSCRIPTION_FILE"
else
    echo "❌ Erro na transcrição"
fi
