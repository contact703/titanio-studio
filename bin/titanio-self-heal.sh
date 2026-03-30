#!/bin/bash
# titanio-self-heal.sh — Auto-recovery de TODOS os serviços
# Roda a cada 2min via LaunchAgent
# Mais agressivo que health-check: restart automático sem perguntar

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
LOG="/tmp/titanio-self-heal.log"

log() { echo "[$(date '+%H:%M:%S')] $1" >> "$LOG"; }

# RAM Monitor — kill graceful se >98%
RAM_PAGES_FREE=$(vm_stat 2>/dev/null | awk '/Pages free/ {gsub(/\./,"",$3); print $3}')
RAM_PAGES_FREE=${RAM_PAGES_FREE:-50000}
if [ "$RAM_PAGES_FREE" -lt 5000 ]; then
    log "🔴 RAM CRÍTICA (${RAM_PAGES_FREE} pages free)"
    # Matar Chrome (maior consumidor) se tiver
    pkill -f "Google Chrome" 2>/dev/null && log "  ⚠️ Chrome killed"
    # Matar Ollama temporariamente
    pkill -f "ollama serve" 2>/dev/null && log "  ⚠️ Ollama killed"
    sleep 5
fi

# Dashboard (porta 4444)
if ! curl -s --max-time 3 http://localhost:4444/api/health > /dev/null 2>&1; then
    log "🔄 Dashboard caiu — restarting..."
    cd "$WORKSPACE/pasta-do-tita/projetos/titanio-dashboard/code/backend"
    pkill -f "tsx watch src/index.ts" 2>/dev/null
    sleep 2
    nohup npx tsx watch src/index.ts >> /tmp/dashboard-backend.log 2>&1 &
    log "  ✅ Dashboard restart PID: $!"
fi

# N8n (porta 5678)
if ! curl -s --max-time 3 http://localhost:5678 > /dev/null 2>&1; then
    log "🔄 N8n caiu — restarting..."
    pkill -f "n8n" 2>/dev/null
    sleep 2
    nohup n8n start >> /tmp/n8n.log 2>&1 &
    log "  ✅ N8n restart PID: $!"
fi

# Ollama (porta 11434) — só restart se RAM permitir
if [ "$RAM_PAGES_FREE" -gt 10000 ]; then
    if ! curl -s --max-time 3 http://localhost:11434 > /dev/null 2>&1; then
        log "🔄 Ollama offline — restarting..."
        nohup ollama serve >> /tmp/ollama.log 2>&1 &
        log "  ✅ Ollama restart PID: $!"
    fi
fi

# Caffeinate (evita sleep)
if ! pgrep -x caffeinate > /dev/null 2>&1; then
    nohup caffeinate -dims > /dev/null 2>&1 &
    log "✅ Caffeinate restarted"
fi
