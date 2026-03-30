#!/bin/bash
###############################################################################
# 🎬 Titanio Auto-Post — Máquina de Conteúdo Instagram
#
# Gera e posta automaticamente no @titaniodashboard
# Roda via cron: 3 posts/dia (09h, 14h, 19h) + 1 Reels/dia (20h)
#
# Uso: titanio-auto-post.sh [post|reels|test]
###############################################################################

set -e

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
MEDIA_SCRIPT="$WORKSPACE/bin/titanio-media.py"
OUTPUT_DIR="$WORKSPACE/pasta-do-tita/projetos/titanio-media/outputs"
LOG="$WORKSPACE/pasta-do-tita/projetos/titanio-media/logs/auto-post.log"

mkdir -p "$(dirname "$LOG")"

log() { echo "[$(date '+%Y-%m-%d %H:%M')] $1" >> "$LOG"; echo "$1"; }

# Temas rotativos sobre IA/agentes/automação
TEMAS_POST=(
    "IA Agentes Autônomos trabalhando 24/7"
    "O futuro da automação com inteligência artificial"
    "Como agentes IA podem transformar negócios"
    "Robôs digitais: a revolução silenciosa"
    "IA que aprende sozinha e melhora todo dia"
    "Automação inteligente para pequenas empresas"
    "O poder dos multi-agentes: dividir pra conquistar"
    "IA gerando conteúdo: banners, vídeos, textos"
    "Agentes IA em 2026: o que mudou"
    "Memória persistente: IAs que nunca esquecem"
    "ComfyUI + FLUX: criando arte com IA"
    "Dashboard de comando: controlando 36 agentes"
    "De zero a produção: construindo com IA em 57 dias"
    "Open source > Cloud: nossa filosofia"
    "Mac Mini como servidor de IA: é possível"
)

ESTILOS=("neon" "fire" "ocean" "gradient" "dark")

# Hashtags padrão
HASHTAGS="#IA #InteligenciaArtificial #Agentes #Automação #Tech #Tecnologia #OpenSource #Inovação #DigitalTransformation #AIAgents #MachineLearning #Produtividade #Futuro #TitanioFilms #ComfyUI"

get_random_theme() {
    local idx=$((RANDOM % ${#TEMAS_POST[@]}))
    echo "${TEMAS_POST[$idx]}"
}

get_random_style() {
    local idx=$((RANDOM % ${#ESTILOS[@]}))
    echo "${ESTILOS[$idx]}"
}

generate_caption() {
    local tema="$1"
    # Usar Ollama pra gerar caption
    CAPTION=$(ollama run qwen2.5:7b "Gere uma caption curta e engajadora para Instagram sobre '$tema'. Máximo 3 linhas. Em português. Sem emojis excessivos. Termine com uma pergunta pro engajamento. Só a caption, nada mais." 2>/dev/null | head -5)
    
    if [ -z "$CAPTION" ]; then
        CAPTION="$tema 🤖✨

O futuro é agora — e é autônomo.

O que você automatizaria primeiro?"
    fi
    
    echo "$CAPTION

$HASHTAGS"
}

cmd_post() {
    local tema=$(get_random_theme)
    local estilo=$(get_random_style)
    
    log "📸 Gerando post: '$tema' (estilo: $estilo)"
    
    # 1. Gerar banner
    BANNER_OUTPUT=$(python3 "$MEDIA_SCRIPT" banner "$tema" --style "$estilo" 2>&1)
    BANNER_FILE=$(echo "$BANNER_OUTPUT" | grep -o "$OUTPUT_DIR/[^ ]*\.png" | head -1)
    
    if [ -z "$BANNER_FILE" ] || [ ! -f "$BANNER_FILE" ]; then
        # Pegar último banner gerado
        BANNER_FILE=$(ls -t "$OUTPUT_DIR"/banner_*.png 2>/dev/null | head -1)
    fi
    
    if [ -z "$BANNER_FILE" ]; then
        log "❌ Falha ao gerar banner"
        return 1
    fi
    
    log "✅ Banner: $BANNER_FILE"
    
    # 2. Gerar caption
    CAPTION=$(generate_caption "$tema")
    log "✅ Caption gerada"
    
    # 3. Postar via instagrapi
    python3 << PYEOF
from instagrapi import Client
import json, os

creds_file = "$WORKSPACE/pasta-do-tita/cofre/INSTAGRAM-TITA.md"
session_file = "$WORKSPACE/pasta-do-tita/cofre/tita-insta-session.json"

cl = Client()

# Tentar carregar sessão
if os.path.exists(session_file):
    try:
        cl.load_settings(session_file)
        cl.login("titaniodashboard", "Rita160679!")
        print("✅ Login via sessão")
    except:
        cl.login("titaniodashboard", "Rita160679!")
        cl.dump_settings(session_file)
        print("✅ Login fresh")
else:
    cl.login("titaniodashboard", "Rita160679!")
    cl.dump_settings(session_file)
    print("✅ Login fresh")

# Postar foto
caption = """$CAPTION"""
media = cl.photo_upload("$BANNER_FILE", caption)
print(f"✅ Post publicado! Media ID: {media.pk}")
PYEOF
    
    log "✅ Post publicado no @titaniodashboard"
}

cmd_reels() {
    local tema=$(get_random_theme)
    
    log "🎬 Gerando Reels: '$tema'"
    
    # Pipeline completa: banners + narração + vídeo
    python3 "$MEDIA_SCRIPT" pipeline "$tema" 2>&1
    
    # Pegar último vídeo gerado
    VIDEO_FILE=$(ls -t "$OUTPUT_DIR"/video_*.mp4 2>/dev/null | head -1)
    
    if [ -z "$VIDEO_FILE" ]; then
        log "❌ Falha ao gerar vídeo"
        return 1
    fi
    
    THUMBNAIL=$(ls -t "$OUTPUT_DIR"/banner_*.png 2>/dev/null | head -1)
    CAPTION=$(generate_caption "$tema")
    
    log "✅ Vídeo: $VIDEO_FILE"
    
    # Postar Reels via instagrapi
    python3 << PYEOF
from instagrapi import Client
import os

session_file = "$WORKSPACE/pasta-do-tita/cofre/tita-insta-session.json"
cl = Client()

if os.path.exists(session_file):
    try:
        cl.load_settings(session_file)
        cl.login("titaniodashboard", "Rita160679!")
    except:
        cl.login("titaniodashboard", "Rita160679!")
        cl.dump_settings(session_file)
else:
    cl.login("titaniodashboard", "Rita160679!")
    cl.dump_settings(session_file)

caption = """$CAPTION"""
thumbnail = "$THUMBNAIL" if os.path.exists("$THUMBNAIL") else None

media = cl.clip_upload("$VIDEO_FILE", caption, thumbnail_path=thumbnail)
print(f"✅ Reels publicado! Media ID: {media.pk}")
PYEOF
    
    log "✅ Reels publicado no @titaniodashboard"
}

cmd_test() {
    log "🧪 Testando pipeline..."
    
    tema=$(get_random_theme)
    estilo=$(get_random_style)
    
    echo "Tema: $tema"
    echo "Estilo: $estilo"
    echo ""
    
    echo "1. Gerando banner..."
    python3 "$MEDIA_SCRIPT" banner "$tema" --style "$estilo" 2>&1 | tail -3
    
    echo ""
    echo "2. Gerando caption..."
    generate_caption "$tema" | head -5
    
    echo ""
    echo "3. Último banner:"
    ls -lt "$OUTPUT_DIR"/banner_*.png 2>/dev/null | head -1
    
    echo ""
    echo "✅ Teste ok — use 'titanio-auto-post.sh post' pra postar de verdade"
}

case "${1:-test}" in
    post) cmd_post ;;
    reels) cmd_reels ;;
    test) cmd_test ;;
    *) echo "Uso: $0 [post|reels|test]" ;;
esac
