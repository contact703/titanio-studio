#!/bin/bash
# Watchdog v3 — Backend + Gateway + Caffeinate
BACKEND_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code/backend"

while true; do
    # Caffeinate
    pgrep -x caffeinate > /dev/null || nohup caffeinate -dims &>/dev/null &

    # Backend — ressuscitar se morto
    if ! curl -s -o /dev/null -m 5 http://localhost:4444/api/health 2>/dev/null; then
        echo "$(date) — Backend morreu, reiniciando..."
        kill -9 $(ps aux | grep "node.*dist/index" | grep -v grep | awk '{print $2}') 2>/dev/null
        sleep 2
        cd "$BACKEND_DIR" && nohup node --max-old-space-size=512 dist/index.js >> /tmp/backend-eduardo.log 2>&1 &
    fi

    # Backend — reciclar se passar de 600MB
    BACKEND_MB=$(ps aux | grep "node.*dist/index" | grep -v grep | awk '{print int($6/1024)}' | head -1)
    if [ -n "$BACKEND_MB" ] && [ "$BACKEND_MB" -gt 600 ]; then
        echo "$(date) — Backend ${BACKEND_MB}MB > 600MB, reciclando..."
        kill $(ps aux | grep "node.*dist/index" | grep -v grep | awk '{print $2}') 2>/dev/null
        sleep 3
        cd "$BACKEND_DIR" && nohup node --max-old-space-size=512 dist/index.js >> /tmp/backend-eduardo.log 2>&1 &
    fi

    # Gateway — alertar se passar de 1.5GB (não matar, só logar)
    GW_MB=$(ps aux | grep "openclaw-gateway" | grep -v grep | awk '{print int($6/1024)}' | head -1)
    if [ -n "$GW_MB" ] && [ "$GW_MB" -gt 1500 ]; then
        echo "$(date) — ⚠️ Gateway ${GW_MB}MB > 1.5GB"
    fi

    sleep 120
done
