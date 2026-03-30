#!/bin/bash
# CODE NINJA — Estuda 5 repos do post Instagram @devmedia
# github.com/tabler/tabler-icons
# github.com/public-apis/public-apis
# github.com/othneildrew/Best-README-Template
# github.com/typicode/husky
# github.com/continuedev/continue

OPENROUTER_KEY="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"
MODEL="meta-llama/llama-3.3-8b-instruct:free"
SPECIALIST_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/memoria-especialistas/code-ninja"
OUTPUT="$SPECIALIST_DIR/repos-devmedia-$(date +%Y%m%d-%H%M).md"
LOG="/tmp/code-ninja-study.log"

mkdir -p "$SPECIALIST_DIR"

log() { echo "[$(date '+%H:%M:%S')] CODE-NINJA | $1" | tee -a "$LOG"; }

ask() {
    curl -s -X POST "https://openrouter.ai/api/v1/chat/completions" \
        -H "Authorization: Bearer $OPENROUTER_KEY" \
        -H "Content-Type: application/json" \
        -H "HTTP-Referer: https://titanio.studio" \
        -d "{\"model\":\"$MODEL\",\"messages\":[{\"role\":\"user\",\"content\":$(echo "$1" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')}],\"max_tokens\":3000}" \
        2>/dev/null | python3 -c "import json,sys
try: print(json.load(sys.stdin)['choices'][0]['message']['content'])
except: pass" 2>/dev/null
}

fetch_github_repo() {
    local REPO="$1"
    # Dados gerais
    local INFO=$(curl -s --max-time 10 "https://api.github.com/repos/$REPO" \
        -A "Mozilla/5.0 Tita-Bot" 2>/dev/null)
    # README
    local README_B64=$(curl -s --max-time 10 "https://api.github.com/repos/$REPO/readme" \
        -A "Mozilla/5.0 Tita-Bot" 2>/dev/null | python3 -c "
import json,sys,base64
try:
    d=json.load(sys.stdin)
    print(base64.b64decode(d.get('content','')).decode('utf-8','ignore')[:3000])
except: pass" 2>/dev/null)
    # Issues recentes
    local ISSUES=$(curl -s --max-time 10 "https://api.github.com/repos/$REPO/issues?state=open&per_page=5" \
        -A "Mozilla/5.0 Tita-Bot" 2>/dev/null | python3 -c "
import json,sys
try:
    for i in json.load(sys.stdin)[:5]:
        print(f'ISSUE: {i.get(\"title\",\"\")}')
except: pass" 2>/dev/null)

    echo "$INFO" | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    print(f'NOME: {d.get(\"full_name\",\"\")}')
    print(f'DESCRIÇÃO: {d.get(\"description\",\"\")}')
    print(f'STARS: {d.get(\"stargazers_count\",0)}')
    print(f'FORKS: {d.get(\"forks_count\",0)}')
    print(f'LINGUAGEM: {d.get(\"language\",\"\")}')
    print(f'LICENÇA: {(d.get(\"license\") or {}).get(\"spdx_id\",\"\")}')
    print(f'URL: {d.get(\"html_url\",\"\")}')
    print(f'TOPICS: {d.get(\"topics\",[])}')
    print(f'UPDATED: {d.get(\"updated_at\",\"\")}')
except: pass" 2>/dev/null

    echo "README (primeiros 3000 chars):"
    echo "$README_B64"
    echo "ISSUES ABERTAS:"
    echo "$ISSUES"
}

log "🥷 CODE NINJA iniciando estudo dos 5 repos do @devmedia"

cat > "$OUTPUT" << EOF
# 🥷 Code Ninja — Estudo de Repos GitHub (@devmedia)
**Data:** $(date '+%Y-%m-%d %H:%M BRT')
**Fonte:** https://www.instagram.com/p/DVrWkYbCZQ8/
**Canal:** @devmedia

---
EOF

REPOS=(
    "tabler/tabler-icons|+5.000 ícones SVG gratuitos para web"
    "public-apis/public-apis|Lista coletiva de APIs gratuitas"
    "othneildrew/Best-README-Template|Template de README profissional"
    "typicode/husky|Git hooks automatizados"
    "continuedev/continue|IA integrada ao editor de código (VS Code/JetBrains)"
)

i=0
for ENTRY in "${REPOS[@]}"; do
    i=$((i+1))
    IFS="|" read -r REPO DESC <<< "$ENTRY"
    log "[$i/5] Estudando: $REPO"

    DATA=$(fetch_github_repo "$REPO")

    ANALYSIS=$(ask "Você é o Code Ninja, especialista em desenvolvimento da Titanio. Estude profundamente este repositório GitHub e extraia:

REPO: $REPO
DESCRIÇÃO: $DESC

DADOS DO REPO:
$DATA

Extraia de forma MUITO DETALHADA:
1. O QUE É e para que serve (explicação técnica completa)
2. COMO USAR no dia a dia (instalação, configuração, exemplos de código)
3. CASOS DE USO para os projetos da Titanio (GospIA, Dashboard, N8n, OpenClaw, Instagram bots)
4. INTEGRAÇÃO com OpenClaw e N8n (como automatizar com este repo)
5. PONTOS FORTES e limitações
6. ALTERNATIVAS e comparações
7. SNIPPETS DE CÓDIGO prontos para usar
8. LICENÇA e se pode usar comercialmente")

    echo "## [$i/5] $REPO" >> "$OUTPUT"
    echo "> $DESC" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "$ANALYSIS" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "---" >> "$OUTPUT"
    echo "" >> "$OUTPUT"

    log "✅ $REPO estudado"
    sleep 8
done

# Síntese final
log "🧠 Gerando síntese final..."
SYNTH=$(ask "Você é o Code Ninja da Titanio. Analisou 5 repos GitHub importantes. Crie um GUIA PRÁTICO com:

1. TABELA RESUMO dos 5 repos (nome | uso | licença | integra com OpenClaw?)
2. TOP 10 FORMAS de usar esses repos juntos em projetos reais
3. SNIPPET DE INTEGRAÇÃO com OpenClaw/N8n para cada repo
4. ROADMAP DE IMPLEMENTAÇÃO: qual implementar primeiro, segunda, etc.
5. Como usar o continuedev/continue com o OpenClaw para turbinar o desenvolvimento

Contexto Titanio: projetos GospIA (React Native), Dashboard (Node.js/TypeScript), bots Instagram, N8n workflows, OpenClaw agentes IA.

$(tail -200 $OUTPUT)")

cat >> "$OUTPUT" << EOF

---
## 🏆 Guia Prático — Como Usar os 5 Repos na Titanio

$SYNTH
EOF

cp "$OUTPUT" "$SPECIALIST_DIR/repos-latest.md"
log "✅ ESTUDO CONCLUÍDO! Salvo em: $OUTPUT"

# Notificar
openclaw message send --channel whatsapp --target "120363405462114071@g.us" \
    --message "🥷 Code Ninja concluiu o estudo dos 5 repos do @devmedia!

Repos estudados:
1. tabler/tabler-icons (+5k ícones SVG)
2. public-apis/public-apis (lista de APIs gratuitas)
3. othneildrew/Best-README-Template
4. typicode/husky (Git hooks)
5. continuedev/continue (IA no editor)

Conhecimento salvo na biblioteca do Code Ninja com guia prático de integração com projetos Titanio. 🐾" 2>/dev/null
