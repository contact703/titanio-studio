#!/bin/bash
# BOT 2: Ferramentas Open Source de Design com OpenClaw — gratuitas, comercializáveis
OPENROUTER_KEY="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"
KIMI_KEY="sk-fk265pU0KeCBynUsqVYEI9pKobqewoMImIkAGQ6tlEbssx4i"
MODEL="nvidia/nemotron-3-nano-30b-a3b:free"
OUTPUT="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/memoria-especialistas/instagramer/research-design-opensource.md"
LOG="/tmp/bot-design-opensource.log"
START=$(date +%s); END=$((START+3600))

log() { echo "[$(date '+%H:%M:%S')] BOT-OPENSOURCE | $1" | tee -a "$LOG"; }

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
    curl -s --max-time 12 "https://api.github.com/search/repositories?q=$(python3 -c "import urllib.parse;print(urllib.parse.quote('$1'))")&per_page=6&sort=stars" \
        -A "Mozilla/5.0 Tita-Bot" 2>/dev/null | python3 -c "
import json,sys
try:
    for i in json.load(sys.stdin).get('items',[])[:6]:
        lic = i.get('license',{}) or {}
        print(f'REPO: {i[\"full_name\"]} ⭐{i[\"stargazers_count\"]}')
        print(f'LICENÇA: {lic.get(\"spdx_id\",\"desconhecida\")}')
        print(f'DESC: {i.get(\"description\",\"\")}')
        print(f'URL: {i[\"html_url\"]}')
        print('---')
except: pass" 2>/dev/null
}

log "Iniciando pesquisa: Design Open Source com OpenClaw"
mkdir -p "$(dirname $OUTPUT)"

cat > "$OUTPUT" << EOF
# 🔓 Pesquisa: Ferramentas Open Source de Design com OpenClaw
> Data: $(date '+%Y-%m-%d %H:%M BRT') | Foco: gratuitas, licença comercial livre, customizáveis
> Para: Especialistas Design Wizard + Instagramer + Diretor de Arte

---
EOF

ROUND=0
TOPICS=(
    "python pillow image generation MIT license commercial|Python|🐍 Pillow: Geração de Imagens (MIT)"
    "open source image generation stable diffusion MIT commercial use|StableDiffusion|🎨 Geração de Imagens: Stable Diffusion"
    "nano banana pro image generation api open source|MachineLearning|🍌 Nano Banana Pro: Geração com IA"
    "svg generation python automation design MIT license|learnpython|📐 SVG: Geração Automática"
    "open source video editing python automation ffmpeg reels|Python|🎬 Edição de Vídeo Open Source"
    "text overlay image python typography automation commercial|Python|✍️ Tipografia Automática — Licença Livre"
    "remotion react video generation open source license|webdev|⚛️ Remotion: Vídeos com React"
    "moviepy video editing python open source commercial|Python|🎥 MoviePy: Edição em Python"
    "canva alternative open source design tool commercial|graphic_design|🖌️ Alternativas ao Canva — Open Source"
    "figma alternative open source penpot commercial license|design|🖼️ Penpot: Figma Open Source"
    "ai image generation MIT license commercial comfyui|StableDiffusion|🤖 ComfyUI: Pipeline de IA para Imagens"
    "openclaw design automation image generation instagram|MachineLearning|🐾 OpenClaw + Design: Como Integrar"
)

for ITEM in "${TOPICS[@]}"; do
    [ $(date +%s) -ge $END ] && break
    IFS="|" read -r QUERY SUB TITLE <<< "$ITEM"
    ROUND=$((ROUND+1))
    log "Round $ROUND: $TITLE"

    DATA1=$(fetch_reddit "$SUB" "$QUERY")
    DATA2=$(fetch_github "$QUERY")

    ANALYSIS=$(ask "Pesquise sobre '$TITLE' para uso com OpenClaw no Instagram. IMPORTANTE: foque APENAS em ferramentas com licença MIT, Apache 2.0, GPL ou similar que PERMITA uso comercial e redistribuição.

Extraia: nome da ferramenta, licença exata, como instalar, exemplo de uso em Python, como integrar com OpenClaw, se pode criar versão própria e comercializar:

Reddit:\n$DATA1\n\nGitHub:\n$DATA2")

    echo "## $TITLE" >> "$OUTPUT"
    echo "$ANALYSIS" >> "$OUTPUT"
    echo "" >> "$OUTPUT"

    REMAINING=$((END - $(date +%s)))
    [ $REMAINING -gt 120 ] && sleep 240 || break
done

# Síntese final com foco em licenças
SYNTH=$(ask "Com base nessa pesquisa, crie uma tabela e guia completo de ferramentas OPEN SOURCE para design + Instagram:

1. TABELA: ferramenta | licença | pode comercializar? | pode criar versão própria? | instalação
2. STACK RECOMENDADA para criar um SaaS de design para Instagram (tudo open source)
3. Como integrar com OpenClaw para automação completa
4. Como usar Nano Banana Pro / ComfyUI / Stable Diffusion para gerar imagens
5. Pipeline: OpenClaw recebe pedido → gera imagem → adiciona texto/efeitos → posta no Instagram

Foco: tudo gratuito, open source, comercializável:\n\n$(tail -300 $OUTPUT)")

echo "---" >> "$OUTPUT"
echo "## 🏆 STACK OPEN SOURCE DEFINITIVA — Design + Instagram" >> "$OUTPUT"
echo "$SYNTH" >> "$OUTPUT"

log "✅ Concluído! $OUTPUT"
openclaw message send --channel whatsapp --target "120363405462114071@g.us" \
    --message "🔓 BOT DESIGN OPEN SOURCE concluiu! $ROUND rounds. Stack completa de ferramentas gratuitas e comercializáveis para design no Instagram mapeada. 🐾" 2>/dev/null
