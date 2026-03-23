#!/bin/bash
# SYNC SPECIALIST MEMORY — Fonte da verdade: Git
# Uso: sync-specialist-memory.sh [push|pull|auto]

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
MEMORIA_DIR="$WORKSPACE/pasta-do-tita/memoria-especialistas"
LOG="/tmp/sync-specialist-memory.log"

timestamp() { date '+%Y-%m-%d %H:%M:%S'; }

echo "[$(timestamp)] === SYNC SPECIALIST MEMORY ===" | tee -a "$LOG"

cd "$WORKSPACE" || exit 1

ACTION="${1:-auto}"

if [ "$ACTION" = "pull" ] || [ "$ACTION" = "auto" ]; then
    echo "[$(timestamp)] 📥 PULL — Baixando memória do Git..." | tee -a "$LOG"
    git fetch tita-memory 2>&1 | tail -3
    git checkout tita-memory/main -- pasta-do-tita/memoria-especialistas/ 2>/dev/null || \
    git pull tita-memory main --no-rebase 2>&1 | tail -5
    echo "[$(timestamp)] ✅ Pull concluído" | tee -a "$LOG"
fi

if [ "$ACTION" = "push" ] || [ "$ACTION" = "auto" ]; then
    echo "[$(timestamp)] 📤 PUSH — Enviando memória para Git..." | tee -a "$LOG"
    git add pasta-do-tita/memoria-especialistas/
    git add MEMORY.md memory/ 2>/dev/null || true
    
    CHANGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
    if [ "$CHANGED" -gt "0" ]; then
        git commit -m "🧠 sync: $CHANGED arquivos de memória — $(timestamp)"
        git push tita-memory main 2>&1 | tail -3
        echo "[$(timestamp)] ✅ Push de $CHANGED arquivos" | tee -a "$LOG"
    else
        echo "[$(timestamp)] ℹ️ Nada novo para enviar" | tee -a "$LOG"
    fi
fi

echo "[$(timestamp)] ✅ SYNC COMPLETO" | tee -a "$LOG"
