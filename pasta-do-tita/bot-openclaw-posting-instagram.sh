#!/bin/bash
# BOT 3: OpenClaw postando no Instagram — design, técnicas, formatos
OPENROUTER_KEY="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"
KIMI_KEY="sk-fk265pU0KeCBynUsqVYEI9pKobqewoMImIkAGQ6tlEbssx4i"
MODEL="nvidia/nemotron-3-nano-30b-a3b:free"
OUTPUT="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/memoria-especialistas/instagramer/research-openclaw-posting.md"
LOG="/tmp/bot-openclaw-posting.log"
START=$(date +%s); END=$((START+3600))

log() { echo "[$(date '+%H:%M:%S')] BOT-POSTING | $1" | tee -a "$LOG"; }

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

log "Iniciando pesquisa: OpenClaw postando no Instagram com design"
mkdir -p "$(dirname $OUTPUT)"

cat > "$OUTPUT" << EOF
# 🐾 Pesquisa: OpenClaw Postando no Instagram — Design, Técnicas, Formatos
> Data: $(date '+%Y-%m-%d %H:%M BRT') | Bot: bot-openclaw-posting | 1 hora
> Fontes: Reddit, GitHub, web, Instagram

---
EOF

ROUND=0
TOPICS=(
    "AI agent instagram auto post design content creation|LocalLLaMA|🤖 Agente IA Postando no Instagram Automaticamente"
    "instagram post design best practices 2025 reels format|Instagram|📐 Melhores Práticas de Design para Instagram 2025"
    "instagram reel viral design technique typography hook|socialmedia|🔥 Técnicas de Design Viral para Reels"
    "openclaw instagram integration post automation|selfhosted|🐾 OpenClaw + Instagram: Integração Real"
    "instagram carousel design template python automation|Python|📱 Carousel Design Automático"
    "AI content creation instagram post schedule automation|MachineLearning|📅 Criação e Agendamento Automático de Conteúdo"
    "instagram design hook visual attention retention technique|marketing|👁️ Hooks Visuais que Prendem Atenção"
    "python instagram auto post with image generation 2024|learnpython|🐍 Python: Gerar Imagem + Postar Automaticamente"
    "instagram design color psychology engagement 2025|design|🎨 Psicologia das Cores no Instagram"
    "n8n instagram workflow design post complete pipeline|n8n|🔄 N8n: Pipeline Completo de Design + Post"
    "instagram reel format specifications design guidelines|videography|📏 Especificações Técnicas: Reels, Feed, Stories"
    "AI agent creates posts instagram autonomously case study|MachineLearning|📊 Cases Reais: Agente IA Gerenciando Instagram"
)

for ITEM in "${TOPICS[@]}"; do
    [ $(date +%s) -ge $END ] && break
    IFS="|" read -r QUERY SUB TITLE <<< "$ITEM"
    ROUND=$((ROUND+1))
    log "Round $ROUND: $TITLE"

    DATA1=$(fetch_reddit "$SUB" "$QUERY")
    DATA2=$(fetch_github "$QUERY")

    ANALYSIS=$(ask "Pesquise sobre '$TITLE' com foco em OpenClaw e Instagram. Extraia técnicas concretas, especificações técnicas quando relevante, ferramentas, código de exemplo e casos reais:

Reddit r/$SUB:\n$DATA1\n\nGitHub:\n$DATA2")

    echo "## $TITLE" >> "$OUTPUT"
    echo "$ANALYSIS" >> "$OUTPUT"
    echo "" >> "$OUTPUT"

    REMAINING=$((END - $(date +%s)))
    [ $REMAINING -gt 120 ] && sleep 240 || break
done

# Síntese final
SYNTH=$(ask "Com base nessa pesquisa completa sobre OpenClaw postando no Instagram com design, crie:

1. ESPECIFICAÇÕES TÉCNICAS completas (tamanhos, formatos, duração para cada tipo de post)
2. WORKFLOW COMPLETO: OpenClaw recebe briefing → gera design → adiciona efeitos → posta → monitora
3. TÉCNICAS DE DESIGN que mais engajam (hooks visuais, tipografia, cores)
4. CÓDIGO DE EXEMPLO end-to-end (Python + instagrapi)
5. INTEGRAÇÃO N8n: nós necessários para automatizar tudo
6. CASOS DE USO para a Titanio usar hoje

Seja extremamente prático e técnico:\n\n$(tail -300 $OUTPUT)")

echo "---" >> "$OUTPUT"
echo "## 🏆 GUIA COMPLETO — OpenClaw Postando no Instagram com Design" >> "$OUTPUT"
echo "$SYNTH" >> "$OUTPUT"

# Especificações técnicas fixas (conhecimento garantido)
cat >> "$OUTPUT" << 'SPECS'

---
## 📏 ESPECIFICAÇÕES TÉCNICAS INSTAGRAM (Referência Rápida)

### Feed (Foto/Vídeo)
- Quadrado: 1080x1080px
- Retrato: 1080x1350px (melhor alcance)
- Paisagem: 1080x566px
- Formatos: JPG, PNG, MP4, MOV

### Reels
- Tamanho: 1080x1920px (9:16)
- Duração: 15s, 30s, 60s, 90s, 3min
- Zona segura: manter conteúdo importante fora das bordas (150px)
- Formato: MP4 H.264, áudio AAC

### Stories
- Tamanho: 1080x1920px (9:16)
- Duração vídeo: máx 15s (acima divide automaticamente)
- Zona de segurança: 250px topo e base (ícones cobrem)

### Carousel
- Até 10 slides
- Mesmas specs do Feed
- Primeiro slide = capa (mais importante)

### Thumbnails/Capa Reels
- Importante: imagem estática 1080x1920px
- Texto visível em tamanho pequeno (thumbnail é pequena)

SPECS

log "✅ Concluído! $OUTPUT"
openclaw message send --channel whatsapp --target "120363405462114071@g.us" \
    --message "🐾 BOT OPENCLAW+INSTAGRAM POSTING concluiu! $ROUND rounds. Guia completo com specs técnicas, workflow e técnicas de design para o Instagram gerado. 🐾" 2>/dev/null
