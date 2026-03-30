# Como Ver Vídeos do Instagram — Setup pro OpenClaw do Tiago
# O OpenClaw deve executar tudo sem perguntar

---

## O problema
O OpenClaw não consegue "ver" vídeos diretamente — ele é um modelo de texto/imagem.
O truque é: **baixar o vídeo → extrair frames → analisar as imagens.**

---

## 1. Instalar ferramentas necessárias

```bash
# ffmpeg — extrai frames de vídeo
brew install ffmpeg

# yt-dlp — baixa vídeos do Instagram, YouTube, TikTok, etc
brew install yt-dlp

# Verificar
ffmpeg -version | head -1
yt-dlp --version
```

---

## 2. Criar script de análise de vídeo

```bash
mkdir -p ~/.openclaw/workspace/bin

cat > ~/.openclaw/workspace/bin/video-analyze.sh << 'SCRIPTEOF'
#!/bin/bash
# video-analyze.sh — Baixa vídeo e extrai frames pra análise
# Uso: bash video-analyze.sh <url-ou-arquivo> [num_frames]
# Ex:  bash video-analyze.sh https://www.instagram.com/reel/ABC123
# Ex:  bash video-analyze.sh /tmp/video.mp4 8

INPUT="$1"
NUM_FRAMES="${2:-6}"
OUTPUT_DIR="/tmp/video-frames-$(date +%s)"
mkdir -p "$OUTPUT_DIR"

# Se for URL, baixar primeiro
if [[ "$INPUT" == http* ]]; then
    echo "📥 Baixando vídeo..."
    VIDEO_FILE="$OUTPUT_DIR/video.mp4"
    
    # Tentar com yt-dlp (suporta Instagram, YouTube, TikTok, etc)
    yt-dlp \
        --no-check-certificates \
        --no-warnings \
        -f "best[ext=mp4]/best" \
        -o "$VIDEO_FILE" \
        "$INPUT" 2>/dev/null
    
    if [ ! -f "$VIDEO_FILE" ]; then
        echo "❌ Falha ao baixar. Tentando com cookies..."
        # Instagram às vezes precisa de cookies
        yt-dlp \
            --no-check-certificates \
            --cookies-from-browser chrome \
            -f "best[ext=mp4]/best" \
            -o "$VIDEO_FILE" \
            "$INPUT" 2>/dev/null
    fi
    
    if [ ! -f "$VIDEO_FILE" ]; then
        echo "❌ Não consegui baixar o vídeo"
        echo "Alternativa: salve o vídeo manualmente e rode:"
        echo "  bash video-analyze.sh /caminho/do/video.mp4"
        exit 1
    fi
    echo "✅ Vídeo baixado: $VIDEO_FILE"
else
    VIDEO_FILE="$INPUT"
fi

if [ ! -f "$VIDEO_FILE" ]; then
    echo "❌ Arquivo não encontrado: $VIDEO_FILE"
    exit 1
fi

# Info do vídeo
echo ""
echo "📊 Info do vídeo:"
DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$VIDEO_FILE" 2>/dev/null | cut -d. -f1)
echo "  Duração: ${DURATION}s"

# Extrair frames distribuídos uniformemente
echo ""
echo "🎬 Extraindo $NUM_FRAMES frames..."

if [ -n "$DURATION" ] && [ "$DURATION" -gt 0 ]; then
    INTERVAL=$((DURATION / (NUM_FRAMES + 1)))
    for i in $(seq 1 $NUM_FRAMES); do
        TIME=$((i * INTERVAL))
        FRAME_FILE="$OUTPUT_DIR/frame_$(printf '%02d' $i)_${TIME}s.jpg"
        ffmpeg -ss "$TIME" -i "$VIDEO_FILE" -frames:v 1 -q:v 2 "$FRAME_FILE" -y 2>/dev/null
        echo "  ✅ Frame $i: ${TIME}s → $FRAME_FILE"
    done
else
    # Fallback: extrair por fps
    ffmpeg -i "$VIDEO_FILE" -vf "fps=1/$((NUM_FRAMES))" -frames:v "$NUM_FRAMES" -q:v 2 "$OUTPUT_DIR/frame_%02d.jpg" -y 2>/dev/null
    echo "  ✅ $NUM_FRAMES frames extraídos"
fi

echo ""
echo "📁 Frames salvos em: $OUTPUT_DIR"
echo ""
echo "🔍 Para analisar, use o comando image do OpenClaw:"
echo "   Analise as imagens em $OUTPUT_DIR"
ls "$OUTPUT_DIR"/*.jpg 2>/dev/null | head -10
SCRIPTEOF

chmod +x ~/.openclaw/workspace/bin/video-analyze.sh
echo "✅ Script criado: ~/.openclaw/workspace/bin/video-analyze.sh"
```

---

## 3. Testar com um vídeo

```bash
# Teste com URL do Instagram
bash ~/.openclaw/workspace/bin/video-analyze.sh "https://www.instagram.com/reel/EXEMPLO"

# Teste com arquivo local
bash ~/.openclaw/workspace/bin/video-analyze.sh /tmp/algum-video.mp4 8
```

---

## 4. Como usar no dia a dia

Quando alguém mandar um vídeo do Instagram ou qualquer URL de vídeo:

### Passo 1 — Baixar e extrair frames
```bash
bash ~/.openclaw/workspace/bin/video-analyze.sh "URL_DO_VIDEO"
```

### Passo 2 — Analisar os frames
Use o tool `image` do OpenClaw pra analisar os frames extraídos:
```
Analise as imagens em /tmp/video-frames-XXXXX/
```

O modelo de visão (Claude) vai ver cada frame e descrever o que está acontecendo no vídeo.

### Para áudio do vídeo
Se precisar da transcrição do áudio:
```bash
# Extrair áudio
ffmpeg -i /tmp/video-frames-XXXXX/video.mp4 -vn -acodec pcm_s16le -ar 16000 /tmp/audio.wav

# Transcrever com Whisper (se instalado)
whisper /tmp/audio.wav --model small --language pt --output_format txt
```

Se não tiver Whisper instalado:
```bash
brew install openai-whisper
```

---

## 5. Skill video-frames (já vem com OpenClaw)

O OpenClaw já tem uma skill chamada `video-frames` que extrai frames. O agente pode usar automaticamente quando recebe um vídeo como mídia no chat.

Para garantir que funciona:
```bash
# Verificar se ffmpeg está instalado
which ffmpeg || brew install ffmpeg

# A skill é ativada automaticamente quando o agente detecta um arquivo de vídeo
```

---

## 6. Dica Instagram — Cookies

Se o yt-dlp não conseguir baixar (Instagram privado ou bloqueio):

```bash
# Opção 1: usar cookies do Chrome
yt-dlp --cookies-from-browser chrome "URL"

# Opção 2: usar cookies do Safari
yt-dlp --cookies-from-browser safari "URL"

# Opção 3: login no yt-dlp
yt-dlp --username SEU_USER --password SUA_SENHA "URL"
```

---

## 7. Adicionar ao AGENTS.md

Adicionar esta referência ao AGENTS.md do agente:
```bash
cat >> ~/.openclaw/workspace/AGENTS.md << 'EOF'

## Vídeos
- Para analisar vídeos: `bash ~/.openclaw/workspace/bin/video-analyze.sh "URL"`
- Extrai frames automaticamente e depois usa image tool pra analisar
- Suporta: Instagram, YouTube, TikTok, arquivos locais
- Para áudio: ffmpeg extrai + whisper transcreve
EOF
```

---

## Verificação

```bash
echo "=== CHECK VÍDEO ==="
echo -n "ffmpeg: "; which ffmpeg > /dev/null && echo "✅" || echo "❌ (brew install ffmpeg)"
echo -n "yt-dlp: "; which yt-dlp > /dev/null && echo "✅" || echo "❌ (brew install yt-dlp)"
echo -n "whisper: "; which whisper > /dev/null && echo "✅ (opcional)" || echo "❌ (brew install openai-whisper)"
echo -n "script: "; [ -x ~/.openclaw/workspace/bin/video-analyze.sh ] && echo "✅" || echo "❌"
```

**Todos devem ser ✅ (whisper é opcional).**
