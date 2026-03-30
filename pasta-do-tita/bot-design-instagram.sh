#!/bin/bash
# BOT 1: Design + Instagram — formatos, ferramentas, N8n automação
OPENROUTER_KEY="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"
KIMI_KEY="sk-fk265pU0KeCBynUsqVYEI9pKobqewoMImIkAGQ6tlEbssx4i"
MODEL="nvidia/nemotron-3-nano-30b-a3b:free"
OUTPUT="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/memoria-especialistas/instagramer/research-design-instagram.md"
LOG="/tmp/bot-design-instagram.log"
START=$(date +%s); END=$((START+3600))

log() { echo "[$(date '+%H:%M:%S')] BOT-DESIGN | $1" | tee -a "$LOG"; }

ask() {
    curl -s -X POST "https://openrouter.ai/api/v1/chat/completions" \
        -H "Authorization: Bearer $OPENROUTER_KEY" \
        -H "Content-Type: application/json" \
        -H "HTTP-Referer: https://titanio.studio" \
        -d "{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":$(echo "$1" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')}],\"max_tokens\":2000}" \
        2>/dev/null | python3 -c "import json,sys
try: print(json.load(sys.stdin)['choices'][0]['message']['content'])
except: pass" 2>/dev/null
}

fetch_reddit() {
    curl -s --max-time 12 "https://www.reddit.com/r/$1/search.json?q=$(python3 -c "import urllib.parse;print(urllib.parse.quote('$2'))")&limit=5&sort=relevance&t=year" \
        -A "Mozilla/5.0 Tita-Bot" 2>/dev/null | python3 -c "
import json,sys
try:
    for p in json.load(sys.stdin)['data']['children'][:5]:
        d=p['data']
        print(f'TÍTULO: {d.get(\"title\",\"\")}')
        print(f'TEXTO: {str(d.get(\"selftext\",\"\"))[:400]}')
        print('---')
except: pass" 2>/dev/null
}

fetch_github() {
    curl -s --max-time 12 "https://api.github.com/search/repositories?q=$(python3 -c "import urllib.parse;print(urllib.parse.quote('$1'))")&per_page=5&sort=stars" \
        -A "Mozilla/5.0 Tita-Bot" 2>/dev/null | python3 -c "
import json,sys
try:
    for i in json.load(sys.stdin).get('items',[])[:5]:
        print(f'REPO: {i[\"full_name\"]} ⭐{i[\"stargazers_count\"]}')
        print(f'DESC: {i.get(\"description\",\"\")}')
        print(f'URL: {i[\"html_url\"]}')
        print('---')
except: pass" 2>/dev/null
}

log "Iniciando pesquisa: Design + Instagram + N8n"
mkdir -p "$(dirname $OUTPUT)"

cat > "$OUTPUT" << EOF
# 🎨 Pesquisa: Design para Instagram + Automação N8n
> Data: $(date '+%Y-%m-%d %H:%M BRT') | Bot: bot-design-instagram | 1 hora

---
EOF

ROUND=0
TOPICS=(
    "instagram reels format size best practices 2025|reddit.Python|📐 Formatos e Tamanhos Ideais para Instagram 2025"
    "canva api automation instagram design python|reddit.webdev|🎨 Canva API: Automação de Design"
    "photopea api automation script design|reddit.graphic_design|🖼️ Photopea: Automação Open Source"
    "n8n instagram post automation design workflow|reddit.n8n|🔄 N8n: Workflow de Post Automático"
    "python pillow image text overlay automation instagram|reddit.Python|🐍 Python Pillow: Texto e Efeitos em Imagens"
    "ffmpeg video effects text overlay reels automation|reddit.editors|🎬 ffmpeg: Efeitos em Vídeo para Reels"
    "stable diffusion text overlay instagram post generation|reddit.StableDiffusion|🤖 SD + Texto = Posts Automáticos"
    "typography instagram reels python automation best fonts|reddit.design|✍️ Tipografia Automática para Reels"
    "instagram carousel design automation python template|reddit.learnpython|📱 Carousel: Design Automático"
    "n8n canva photopea instagram full pipeline automation|reddit.automation|🏭 Pipeline Completo: Design → Post"
    "instagram reel thumbnail design generator python open source|reddit.Python|🖼️ Thumbnails e Capas Automáticas"
    "video template instagram automation remotion motion graphics|reddit.webdev|🎥 Motion Graphics Automáticos"
)

for ITEM in "${TOPICS[@]}"; do
    [ $(date +%s) -ge $END ] && break
    IFS="|" read -r QUERY SUB TITLE <<< "$ITEM"
    ROUND=$((ROUND+1))
    log "Round $ROUND: $TITLE"

    SUB_NAME="${SUB##*.}"
    DATA1=$(fetch_reddit "$SUB_NAME" "$QUERY")
    DATA2=$(fetch_github "$QUERY")

    ANALYSIS=$(ask "Pesquise sobre '$TITLE' para automação de design no Instagram. Foque em ferramentas práticas, código Python/N8n, exemplos reais. Extraia: ferramentas recomendadas, código de exemplo, limitações, melhores práticas:\n\nReddit:\n$DATA1\n\nGitHub:\n$DATA2")

    echo "## $TITLE" >> "$OUTPUT"
    echo "$ANALYSIS" >> "$OUTPUT"
    echo "" >> "$OUTPUT"

    REMAINING=$((END - $(date +%s)))
    [ $REMAINING -gt 120 ] && sleep 240 || break
done

# Síntese
SYNTH=$(ask "Com base nessa pesquisa de design para Instagram, crie um GUIA DEFINITIVO de automação:
1. Stack recomendada (ferramentas Python/N8n gratuitas)
2. Workflow completo: ideia → design → post no Instagram
3. Como fazer reels com texto, tipografia e efeitos via código
4. Integração com N8n passo a passo
5. Exemplos de código prontos para usar

Seja extremamente prático:\n\n$(tail -300 $OUTPUT)")

echo "---" >> "$OUTPUT"
echo "## 🏆 GUIA DEFINITIVO — Design Automático para Instagram" >> "$OUTPUT"
echo "$SYNTH" >> "$OUTPUT"

log "✅ Concluído! $OUTPUT"
openclaw message send --channel whatsapp --target "120363405462114071@g.us" \
    --message "🎨 BOT DESIGN+INSTAGRAM concluiu! $ROUND rounds. Guia completo de automação de design para Instagram gerado. 🐾" 2>/dev/null
