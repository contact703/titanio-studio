#!/bin/bash
# tita-memory-test.sh — Testa memória automaticamente
# Roda via cron 2x/dia (09:00 e 18:00)
# Reindexa se houver falhas

set -e

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
LOG="$WORKSPACE/memory/memory-test-results.log"
ENGINE="$WORKSPACE/bin/tita-memory-engine.py"

echo "=== Memory Test $(date '+%Y-%m-%d %H:%M BRT') ===" >> "$LOG"

# Perguntas que DEVEM ter resposta nos arquivos
QUESTIONS=(
    "titanio media pipeline banners"
    "ComfyUI FLUX instalado modelo"
    "Instagram titaniodashboard posts publicados"
    "Dashboard Helber Tiago sync especialistas"
    "Polymarket bot wallet saldo trades"
    "Memory Engine chunks embeddings"
    "GospIA iOS build Apple"
    "Paperclip orquestrador agentes"
    "Money Maker DMs prospecção"
    "ComfyUI compartilhado rede local"
)

PASS=0
FAIL=0
DETAILS=""

for Q in "${QUESTIONS[@]}"; do
    RESULT=$(python3 "$ENGINE" search "$Q" 2>/dev/null | head -10)
    SCORE=$(echo "$RESULT" | grep -ioE "Score: [0-9.]+" | head -1 | awk '{print $2}')
    
    if [ -n "$SCORE" ] && python3 -c "import sys; sys.exit(0 if float('${SCORE:-0}') > 0.45 else 1)" 2>/dev/null; then
        echo "  ✅ '$Q' → score $SCORE" >> "$LOG"
        PASS=$((PASS+1))
    else
        echo "  ❌ '$Q' → FALHOU (score: ${SCORE:-null})" >> "$LOG"
        FAIL=$((FAIL+1))
    fi
done

TOTAL=$((PASS+FAIL))
if [ "$TOTAL" -gt 0 ]; then
    PCT=$((PASS*100/TOTAL))
else
    PCT=0
fi

echo "  📊 Resultado: $PASS/$TOTAL ($PCT%)" >> "$LOG"

# Se falhou algum, reindexar
if [ "$FAIL" -gt 0 ]; then
    echo "  🔄 Reindexando Memory Engine..." >> "$LOG"
    python3 "$ENGINE" index >> "$LOG" 2>&1
    echo "  ✅ Reindexado" >> "$LOG"
fi

# Registrar no Score
if [ "$PCT" -ge 90 ]; then
    python3 "$WORKSPACE/bin/tita-memory-score.py" score "auto-test: $PASS/$TOTAL ($PCT%)" yes yes >> "$LOG" 2>&1
elif [ "$PCT" -ge 70 ]; then
    python3 "$WORKSPACE/bin/tita-memory-score.py" score "auto-test: $PASS/$TOTAL ($PCT%)" yes no >> "$LOG" 2>&1
else
    python3 "$WORKSPACE/bin/tita-memory-score.py" score "auto-test: $PASS/$TOTAL ($PCT%)" no no >> "$LOG" 2>&1
fi

echo "" >> "$LOG"
echo "✅ Memory test completo: $PASS/$TOTAL ($PCT%)"
