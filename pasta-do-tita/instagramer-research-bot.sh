#!/bin/bash
# ============================================================
# INSTAGRAMER RESEARCH BOT v2
# Pesquisa por 1 hora sobre AÇÕES no Instagram via OpenClaw:
# postar, comentar, DM, stories, bots não-bloqueados,
# gerenciar contas, análises/pesquisas — tudo com IA
# Modelo: OpenRouter GRATUITO
# Criado: 2026-03-26 por Eduardo/Zica
# ============================================================

OPENROUTER_KEY="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"
MODEL="meta-llama/llama-3.3-8b-instruct:free"
WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
OUTPUT_DIR="$WORKSPACE/pasta-do-tita/memoria-especialistas/instagramer"
REPORT="$OUTPUT_DIR/research-acoes-$(date +%Y%m%d-%H%M).md"
LOG="/tmp/instagramer-research.log"
START_TIME=$(date +%s)
END_TIME=$((START_TIME + 3600))

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
            \"max_tokens\": 2000
        }" 2>/dev/null | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    print(d['choices'][0]['message']['content'])
except Exception as e:
    print(f'ERROR: {e}')
" 2>/dev/null
}

fetch_reddit() {
    local sub="$1" query="$2"
    curl -s --max-time 15 \
        "https://www.reddit.com/r/$sub/search.json?q=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$query'))")&limit=5&sort=relevance&t=year" \
        -A "Mozilla/5.0 Tita-Research-Bot/2.0" 2>/dev/null | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    posts=d.get('data',{}).get('children',[])
    for p in posts[:5]:
        pd=p.get('data',{})
        print(f'TÍTULO: {pd.get(\"title\",\"\")}')
        print(f'SCORE: {pd.get(\"score\",0)}')
        print(f'TEXTO: {str(pd.get(\"selftext\",\"\"))[:400]}')
        print('---')
except: pass
" 2>/dev/null
}

fetch_github() {
    local query="$1"
    curl -s --max-time 15 \
        "https://api.github.com/search/repositories?q=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$query'))")&per_page=5&sort=stars" \
        -A "Mozilla/5.0 Tita-Research-Bot/2.0" 2>/dev/null | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    for i in d.get('items',[])[:5]:
        print(f'REPO: {i.get(\"full_name\",\"\")} ⭐{i.get(\"stargazers_count\",0)}')
        print(f'URL: {i.get(\"html_url\",\"\")}')
        print(f'DESC: {i.get(\"description\",\"\")}')
        print(f'LANG: {i.get(\"language\",\"\")} | Atualizado: {i.get(\"updated_at\",\"\")[:10]}')
        print('---')
except: pass
" 2>/dev/null
}

fetch_github_issues() {
    local query="$1"
    curl -s --max-time 15 \
        "https://api.github.com/search/issues?q=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$query'))")&per_page=5&sort=comments" \
        -A "Mozilla/5.0 Tita-Research-Bot/2.0" 2>/dev/null | python3 -c "
import json,sys
try:
    d=json.load(sys.stdin)
    for i in d.get('items',[])[:5]:
        print(f'ISSUE: {i.get(\"title\",\"\")}')
        print(f'URL: {i.get(\"html_url\",\"\")}')
        print(f'BODY: {str(i.get(\"body\",\"\"))[:400]}')
        print('---')
except: pass
" 2>/dev/null
}

# === INÍCIO ===
log "🔍 INSTAGRAMER RESEARCH BOT v2 iniciado"
log "🎯 Foco: Ações no Instagram (postar, DM, stories, bots, análises)"
log "⏱️  Duração: 1 hora | Modelo: $MODEL"

mkdir -p "$OUTPUT_DIR"

cat > "$REPORT" << EOF
# 📸 Pesquisa: Ações no Instagram via OpenClaw + IA
**Data:** $(date '+%Y-%m-%d %H:%M BRT')
**Foco:** Postar, comentar, DM, stories, bots não-bloqueados, gerenciar contas, análises
**Modelo:** OpenRouter ($MODEL)
**Duração:** 1 hora

---
EOF

ROUND=0

while [ $(date +%s) -lt $END_TIME ]; do
    ROUND=$((ROUND + 1))
    ELAPSED=$(( ($(date +%s) - START_TIME) / 60 ))
    log "📡 Round $ROUND | ${ELAPSED}min decorridos"

    case $ROUND in

    1)
        log "🔎 [GitHub] Repos: instagram bot python post comment"
        DATA=$(fetch_github "instagram bot python post comment automation 2024")
        ANALYSIS=$(ask_openrouter "Analise estes repositórios GitHub de bots Instagram para postar e comentar. Foque em: bibliotecas usadas, técnicas anti-ban, como simulam comportamento humano, rate limits respeitados. Liste os melhores com seus diferenciais:\n\n$DATA")
        echo "## 🤖 Bots Instagram: Postar e Comentar (GitHub)" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    2)
        log "🔎 [GitHub] Repos: instagram DM automation direct message"
        DATA=$(fetch_github "instagram direct message automation DM bot python")
        ANALYSIS=$(ask_openrouter "Analise estes repos sobre automação de DMs no Instagram. Como enviar mensagens diretas sem ser bloqueado? Técnicas, limites diários, fingerprinting. Extraia o que é prático:\n\n$DATA")
        echo "## 📩 Instagram DM: Mensagens Diretas Automáticas" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    3)
        log "🔎 [GitHub] Repos: instagram stories automation upload"
        DATA=$(fetch_github "instagram stories upload automation python api")
        ANALYSIS=$(ask_openrouter "Analise repos sobre upload de stories no Instagram via automação. Quais APIs/libs funcionam? Como fazer upload de foto e vídeo nos stories? Limitações e soluções:\n\n$DATA")
        echo "## 📱 Instagram Stories: Upload Automático" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    4)
        log "🔎 [Reddit] anti-ban instagram bot 2024"
        DATA=$(fetch_reddit "Instagram" "bot anti-ban avoid block 2024")
        DATA2=$(fetch_reddit "Python" "instagram bot not getting banned 2024")
        ANALYSIS=$(ask_openrouter "Analise estes posts sobre como criar bots Instagram que não são bloqueados. Quais são as técnicas mais eficazes em 2024/2025: delays, device fingerprint, proxies, sessões, human-like behavior? Crie um guia prático:\n\n$DATA\n---\n$DATA2")
        echo "## 🛡️ Anti-Ban: Como Criar Bots que Não São Bloqueados" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    5)
        log "🔎 [GitHub] account management multiple instagram"
        DATA=$(fetch_github "instagram account manager multiple profiles python")
        ANALYSIS=$(ask_openrouter "Analise repos sobre gerenciamento de múltiplas contas Instagram. Como gerenciar várias contas com IA? Troca de sessões, cookies, proxies, evitar linkagem de contas:\n\n$DATA")
        echo "## 👥 Gerenciar Múltiplas Contas Instagram" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    6)
        log "🔎 [Reddit] instagram analytics scraping data"
        DATA=$(fetch_reddit "datascience" "instagram analytics scraping data python 2024")
        DATA2=$(fetch_reddit "webscraping" "instagram data analysis followers engagement")
        ANALYSIS=$(ask_openrouter "Analise estes posts sobre coleta de dados e análises do Instagram. Como extrair: métricas de engajamento, análise de concorrência, tendências de hashtags, dados de audiência? Ferramentas que funcionam em 2025:\n\n$DATA\n---\n$DATA2")
        echo "## 📊 Análises e Pesquisas no Instagram" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    7)
        log "🔎 [GitHub] instagrapi instagram private api"
        DATA=$(fetch_github "instagrapi instagram private api")
        DATA2=$(fetch_github_issues "instagrapi post photo video story")
        ANALYSIS=$(ask_openrouter "Instagrapi é a principal lib Python para ações no Instagram (usa API privada). Analise e explique: como postar fotos/vídeos/reels/stories, enviar DMs, seguir/unfollow, comentar, curtir, buscar dados. Quais endpoints funcionam sem ser bloqueado:\n\n$DATA\n---ISSUES---\n$DATA2")
        echo "## 📦 Instagrapi: A Biblioteca Principal" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    8)
        log "🔎 [Reddit] AI agent instagram posting content"
        DATA=$(fetch_reddit "LocalLLaMA" "instagram agent AI posting automation")
        DATA2=$(fetch_reddit "OpenAI" "AI instagram content creation automation")
        ANALYSIS=$(ask_openrouter "Analise como agentes de IA (como OpenClaw) podem controlar o Instagram de forma autônoma. Fluxo completo: criar conteúdo com LLM → postar → interagir → analisar resultados. Ferramentas, arquitetura, casos de uso reais:\n\n$DATA\n---\n$DATA2")
        echo "## 🤖 Agentes IA + Instagram: Fluxo Completo Autônomo" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    9)
        log "🔎 [GitHub] instagram graph api official"
        DATA=$(fetch_github "instagram graph api official python publish")
        ANALYSIS=$(ask_openrouter "Analise repos sobre a Instagram Graph API oficial (para contas business/creator). Como usá-la para postar, analisar métricas e gerenciar conteúdo? Quais são os limites e como integrar com OpenClaw?\n\n$DATA")
        echo "## 🔌 Instagram Graph API Oficial (Business/Creator)" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    10)
        log "🔎 [Reddit] instagram scraping hashtag research 2024"
        DATA=$(fetch_reddit "marketing" "instagram hashtag research scraping analytics tool")
        DATA2=$(fetch_reddit "socialmedia" "instagram competitor analysis tool python")
        ANALYSIS=$(ask_openrouter "Como fazer pesquisas e análises profundas no Instagram via automação? Foque em: pesquisa de hashtags, análise de concorrentes, monitoramento de menções, trending content, audience insights. Ferramentas e técnicas práticas:\n\n$DATA\n---\n$DATA2")
        echo "## 🔍 Pesquisa e Inteligência no Instagram" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;

    *)
        EXTRAS=(
            "instagram reels upload automation python|Reels: Upload Automático"
            "instagram comment automation avoid spam detection|Comentários: Evitar Detecção de Spam"
            "instagram follow unfollow bot safe 2024|Follow/Unfollow Seguro"
            "instagram session cookie management python|Gestão de Sessões e Cookies"
            "instagram proxy rotation bot|Proxies e Rotação de IPs"
        )
        IDX=$(( (ROUND - 11) % ${#EXTRAS[@]} ))
        IFS="|" read -r QUERY TITLE <<< "${EXTRAS[$IDX]}"
        log "🔎 [Extra] $TITLE"
        DATA=$(fetch_github "$QUERY")
        DATA2=$(fetch_reddit "Python" "$QUERY")
        ANALYSIS=$(ask_openrouter "Pesquise sobre '$TITLE' para uso com OpenClaw. Extraia técnicas práticas, libs recomendadas e erros a evitar:\n\nGitHub:\n$DATA\n\nReddit:\n$DATA2")
        echo "## Extra: $TITLE" >> "$REPORT"
        echo "$ANALYSIS" >> "$REPORT"
        echo "" >> "$REPORT"
        ;;
    esac

    # Salvar progresso no shared
    python3 - << PYEOF 2>/dev/null
import json
from datetime import datetime
try:
    with open('/Volumes/TITA_039/shared-specialists.json') as f:
        shared = json.load(f)
    if not isinstance(shared, dict):
        shared = {}
    shared['instagramer_research'] = {
        'lastUpdate': datetime.utcnow().isoformat() + 'Z',
        'round': $ROUND,
        'report': '$REPORT',
        'status': 'running',
        'focus': 'acoes-instagram'
    }
    with open('/Volumes/TITA_039/shared-specialists.json', 'w') as f:
        json.dump(shared, f)
except:
    pass
PYEOF

    REMAINING=$(( END_TIME - $(date +%s) ))
    if [ $REMAINING -gt 180 ]; then
        log "💤 Aguardando 4min..."
        sleep 240
    else
        log "⏰ Últimos ${REMAINING}s — encerrando"
        break
    fi
done

# Síntese final
log "🧠 Gerando síntese final..."
PREV=$(tail -400 "$REPORT")
FINAL=$(ask_openrouter "Você é o especialista Instagramer de um sistema OpenClaw. Com base em toda a pesquisa abaixo, crie:

1. GUIA RÁPIDO DE AÇÕES (postar, DM, stories, comentar, gerenciar contas)
2. FERRAMENTAS RECOMENDADAS para cada ação (com links GitHub quando souber)
3. REGRAS ANTI-BAN: os 10 mandamentos para não ser bloqueado
4. INTEGRAÇÃO COM OPENCLAW: como conectar essas ferramentas ao agente
5. O QUE NÃO FAZER: erros fatais

Seja extremamente prático e técnico:\n\n$PREV")

cat >> "$REPORT" << EOF

---
## 🏆 GUIA DEFINITIVO — Ações no Instagram via OpenClaw

$FINAL

---
**Pesquisa concluída:** $(date '+%Y-%m-%d %H:%M BRT')
**Total rounds:** $ROUND
EOF

cp "$REPORT" "$OUTPUT_DIR/research-latest.md"
log "✅ CONCLUÍDO! Relatório: $REPORT"

# Notificar grupo
openclaw message send \
  --channel whatsapp \
  --target "120363405462114071@g.us" \
  --message "📸 Instagramer Research Bot concluiu! $ROUND rounds pesquisados.
Tópicos cobertos: postar, DM, stories, anti-ban, múltiplas contas, análises, Graph API, instagrapi, agentes IA + Instagram.
Conhecimento salvo na memória do especialista. Quer que eu faça um resumo? 🐾" 2>/dev/null
