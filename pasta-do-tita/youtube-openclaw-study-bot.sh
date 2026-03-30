#!/bin/bash
# ============================================================
# YOUTUBE OPENCLAW STUDY BOT
# Estuda os 5 vídeos do @codingknowledge sobre OpenClaw
# Leva conhecimento para o especialista OpenClaw Expert
# NÃO modifica o especialista — apenas adiciona à biblioteca
# Modelo: OpenRouter GRATUITO
# Criado: 2026-03-26 por Eduardo/Zica
# ============================================================

OPENROUTER_KEY="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"
MODEL="meta-llama/llama-3.3-8b-instruct:free"
WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
SPECIALIST_DIR="$WORKSPACE/pasta-do-tita/memoria-especialistas/openclaw-specialist"
LIBRARY_DIR="$SPECIALIST_DIR/biblioteca"
LOG="/tmp/youtube-openclaw-study.log"

mkdir -p "$LIBRARY_DIR"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }

ask_openrouter() {
    local prompt="$1"
    curl -s -X POST "https://openrouter.ai/api/v1/chat/completions" \
        -H "Authorization: Bearer $OPENROUTER_KEY" \
        -H "Content-Type: application/json" \
        -H "HTTP-Referer: https://titanio.studio" \
        -d "{
            \"model\": \"$MODEL\",
            \"messages\": [{\"role\": \"user\", \"content\": $(echo "$prompt" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}],
            \"max_tokens\": 3000
        }" 2>/dev/null | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    print(d['choices'][0]['message']['content'])
except Exception as e:
    print(f'ERROR: {e}')
" 2>/dev/null
}

get_transcript() {
    local url="$1"
    local title="$2"
    log "📥 Baixando transcrição/descrição: $title"
    
    # Pegar descrição + metadados via yt-dlp
    local meta=$(yt-dlp --no-check-certificates --dump-json "$url" 2>/dev/null)
    
    if [ -n "$meta" ]; then
        echo "$meta" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print('TÍTULO:', d.get('title',''))
print('CANAL:', d.get('uploader',''))
print('DURAÇÃO:', d.get('duration_string',''))
print('VIEWS:', d.get('view_count',''))
print('DATA:', d.get('upload_date',''))
print('DESCRIÇÃO:')
print(d.get('description','')[:3000])
print('CAPÍTULOS:')
for c in d.get('chapters', []):
    print(f\"  {c.get('start_time',0):.0f}s — {c.get('title','')}\")
" 2>/dev/null
    fi
    
    # Tentar pegar subtítulos automáticos
    local tmp_dir="/tmp/yt-subs-$$"
    mkdir -p "$tmp_dir"
    yt-dlp --no-check-certificates \
        --write-auto-sub --sub-lang en \
        --skip-download \
        -o "$tmp_dir/%(title)s" \
        "$url" 2>/dev/null
    
    # Ler o arquivo de subtítulo se existir
    local sub_file=$(find "$tmp_dir" -name "*.vtt" -o -name "*.srt" 2>/dev/null | head -1)
    if [ -n "$sub_file" ]; then
        echo "TRANSCRIÇÃO (primeiros 3000 chars):"
        cat "$sub_file" | grep -v "^[0-9]" | grep -v "^$" | grep -v "WEBVTT\|Kind:\|Language:" | \
            sed 's/<[^>]*>//g' | tr '\n' ' ' | head -c 3000
        echo ""
    fi
    
    rm -rf "$tmp_dir"
}

# ============================================================
# OS 5 VÍDEOS DO POST
# ============================================================
declare -A VIDEOS
VIDEOS[1]="https://www.youtube.com/watch?v=a63dUwXUgDo|ClawdBot Full Tutorial for Beginners: How to Use & Set up ClawdBot (Openclaw)"
VIDEOS[2]="https://www.youtube.com/watch?v=JidX31wPGqQ|OpenClaw Crash Course: From Zero to a 24/7 AI Assistant"
VIDEOS[3]="https://www.youtube.com/watch?v=zwV5qC1wS6M|I have 25 AI Agents working 24/7 with Openclaw"
VIDEOS[4]="https://www.youtube.com/watch?v=U8kXfk8enrY|Clawdbot/OpenClaw Clearly Explained (and how to use it)"
VIDEOS[5]="https://www.youtube.com/watch?v=3hgXhB_Wy2U|I Built an AI Agent Army with Openclaw to Make 1M/year"

log "🎓 YOUTUBE OPENCLAW STUDY BOT iniciado"
log "📚 Canal: @codingknowledge (harry)"
log "🎯 Destino: Biblioteca do OpenClaw Expert (SEM modificar especialista)"
log "🤖 Modelo: $MODEL (OpenRouter gratuito)"

# Arquivo índice da biblioteca
INDEX_FILE="$LIBRARY_DIR/INDEX.md"
cat > "$INDEX_FILE" << EOF
# 📚 Biblioteca OpenClaw Expert — Vídeos @codingknowledge
> Adicionado em: $(date '+%Y-%m-%d %H:%M BRT')
> Fonte: Post Instagram https://www.instagram.com/p/DWGV1-bkksK/
> Canal: @codingknowledge (harry) — YouTube

## Vídeos estudados:
1. ClawdBot Full Tutorial for Beginners
2. OpenClaw Crash Course: From Zero to a 24/7 AI Assistant
3. I have 25 AI Agents working 24/7 with Openclaw
4. Clawdbot/OpenClaw Clearly Explained
5. I Built an AI Agent Army with Openclaw to Make 1M/year

---
EOF

# ============================================================
# ESTUDAR CADA VÍDEO
# ============================================================
for i in 1 2 3 4 5; do
    IFS="|" read -r URL TITLE <<< "${VIDEOS[$i]}"
    
    log "🎬 [$i/5] Estudando: $TITLE"
    log "    URL: $URL"
    
    CONTENT=$(get_transcript "$URL" "$TITLE")
    
    if [ -z "$CONTENT" ]; then
        log "⚠️  Sem transcrição — usando busca web"
        CONTENT=$(curl -s --max-time 10 \
            "https://www.youtube.com/watch?v=${URL##*=}" \
            -H "User-Agent: Mozilla/5.0" 2>/dev/null | \
            python3 -c "
import sys, re
html = sys.stdin.read()
# Extrair description e título do HTML
desc = re.findall(r'\"description\":\{\"simpleText\":\"([^\"]+)\"', html)
title = re.findall(r'\"title\":\{\"runs\":\[\{\"text\":\"([^\"]+)\"', html)
print('TÍTULO:', title[0] if title else '')
print('DESCRIÇÃO:', desc[0][:2000] if desc else 'não encontrada')
" 2>/dev/null)
    fi
    
    # Analisar com OpenRouter
    ANALYSIS=$(ask_openrouter "Você é um especialista em OpenClaw analisando este vídeo do YouTube para construir uma biblioteca de conhecimento.

VÍDEO $i/5: $TITLE
URL: $URL

CONTEÚDO EXTRAÍDO:
$CONTENT

Analise e extraia em formato estruturado:
1. CONCEITOS PRINCIPAIS (o que ensina sobre OpenClaw)
2. CONFIGURAÇÕES DEMONSTRADAS (settings, configs, comandos)
3. CASOS DE USO (exemplos práticos mostrados)
4. LIÇÕES APRENDIDAS (insights práticos)
5. TERMOS TÉCNICOS NOVOS (jargão, funcionalidades)
6. ERROS MENCIONADOS E SOLUÇÕES
7. LINKS/RECURSOS citados no vídeo

Seja extremamente detalhado e técnico. Este conhecimento vai para a biblioteca do especialista OpenClaw.")
    
    # Salvar na biblioteca
    VIDEO_FILE="$LIBRARY_DIR/video-$i-$(echo "$TITLE" | tr ' /()' '-' | tr '[:upper:]' '[:lower:]' | cut -c1-50).md"
    
    cat > "$VIDEO_FILE" << EOF
# 🎬 Vídeo $i: $TITLE
**URL:** $URL
**Canal:** @codingknowledge (harry)
**Analisado:** $(date '+%Y-%m-%d %H:%M BRT')

## Conteúdo Bruto Extraído
\`\`\`
$CONTENT
\`\`\`

## Análise do OpenRouter
$ANALYSIS

---
EOF
    
    log "✅ Vídeo $i salvo: $(basename $VIDEO_FILE)"
    
    # Atualizar índice
    echo "### Vídeo $i: $TITLE" >> "$INDEX_FILE"
    echo "- URL: $URL" >> "$INDEX_FILE"
    echo "- Arquivo: $(basename $VIDEO_FILE)" >> "$INDEX_FILE"
    echo "" >> "$INDEX_FILE"
    
    sleep 10  # Respeitar rate limit
done

# ============================================================
# SÍNTESE FINAL — Consolidar conhecimento
# ============================================================
log "🧠 Gerando síntese consolidada..."

ALL_ANALYSES=$(cat "$LIBRARY_DIR"/video-*.md 2>/dev/null | grep -A200 "## Análise" | head -500)

SYNTHESIS=$(ask_openrouter "Você é o especialista OpenClaw Expert. Com base nas análises dos 5 vídeos do @codingknowledge abaixo, crie uma síntese consolidada de conhecimento para adicionar à sua biblioteca:

$ALL_ANALYSES

Crie:
1. TOP 20 COISAS que esses vídeos ensinam sobre OpenClaw (que você pode não saber)
2. PADRÕES RECORRENTES (o que todos os vídeos enfatizam)
3. CASOS DE USO PRÁTICOS demonstrados
4. CONFIGURAÇÕES AVANÇADAS mencionadas
5. TERMINOLOGIA E JARGÃO do ecossistema OpenClaw conforme @codingknowledge usa

Formato: markdown bem estruturado, pronto para ser consultado por um especialista.")

cat > "$LIBRARY_DIR/SINTESE-CODINGKNOWLEDGE.md" << EOF
# 🏆 Síntese: 5 Vídeos @codingknowledge sobre OpenClaw
**Gerado em:** $(date '+%Y-%m-%d %H:%M BRT')
**Fonte:** Post https://www.instagram.com/p/DWGV1-bkksK/
**NÃO MODIFICA o especialista — é biblioteca de referência**

$SYNTHESIS
EOF

log "✅ Síntese salva em: $LIBRARY_DIR/SINTESE-CODINGKNOWLEDGE.md"
log "📚 Biblioteca completa em: $LIBRARY_DIR/"
log "🎓 ESTUDO CONCLUÍDO!"

# Notificar grupo
openclaw message send \
  --channel whatsapp \
  --target "120363405462114071@g.us" \
  --message "📚 YouTube Study Bot concluiu!

Estudei os 5 vídeos do @codingknowledge sobre OpenClaw:
1. ClawdBot Full Tutorial
2. Crash Course 24/7 AI Assistant
3. 25 AI Agents working 24/7
4. OpenClaw Clearly Explained
5. AI Agents Army \$1M/year

Conhecimento adicionado à biblioteca do OpenClaw Expert (sem modificar o especialista).
Arquivos em: pasta-do-tita/memoria-especialistas/openclaw-specialist/biblioteca/ 🐾" 2>/dev/null
