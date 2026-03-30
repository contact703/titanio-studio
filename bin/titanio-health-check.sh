#!/bin/bash
# titanio-health-check.sh — Checa todos os serviços a cada 5min
# Se algo cair: alerta WhatsApp + tenta restart
# LaunchAgent: com.tita.health-check (StartInterval 300)

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
LOG="/tmp/titanio-health-check.log"
ALERT_COOLDOWN="/tmp/health-alert-cooldown"

log() { echo "[$(date '+%H:%M:%S')] $1" >> "$LOG"; }

send_alert() {
    local msg="$1"
    # Cooldown: não alertar mais que 1x a cada 15min
    if [ -f "$ALERT_COOLDOWN" ]; then
        LAST=$(cat "$ALERT_COOLDOWN")
        NOW=$(date +%s)
        DIFF=$((NOW - LAST))
        [ "$DIFF" -lt 900 ] && return
    fi
    date +%s > "$ALERT_COOLDOWN"
    openclaw message send -t '120363405462114071@g.us' --channel whatsapp -m "🚨 ALERTA SISTEMA: $msg" 2>/dev/null
    log "🚨 ALERTA ENVIADO: $msg"
}

check_service() {
    local name="$1" url="$2" restart_cmd="$3"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 5 2>/dev/null)
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "301" ] || [ "$STATUS" = "302" ]; then
        return 0
    else
        log "🔴 $name DOWN (status: $STATUS)"
        if [ -n "$restart_cmd" ]; then
            log "🔄 Tentando restart: $restart_cmd"
            eval "$restart_cmd" >> "$LOG" 2>&1 &
            sleep 3
            # Re-check
            STATUS2=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 5 2>/dev/null)
            if [ "$STATUS2" = "200" ]; then
                log "✅ $name RECUPERADO"
                return 0
            fi
        fi
        return 1
    fi
}

# RAM check
RAM_FREE=$(vm_stat 2>/dev/null | awk '/Pages free/ {print $3}' | tr -d '.')
RAM_PCT=$(( 100 - (RAM_FREE * 4096 / 1024 / 1024 * 100 / 16384) ))
if [ "$RAM_PCT" -gt 97 ]; then
    log "🔴 RAM CRÍTICA: ${RAM_PCT}%"
    # Kill processos pesados não essenciais
    pkill -f "ollama serve" 2>/dev/null && log "⚠️ Ollama killed (RAM)" || true
fi

# Checar serviços
ALERTS=""

check_service "Dashboard" "http://localhost:4444/api/health" \
    "cd $WORKSPACE/pasta-do-tita/projetos/titanio-dashboard/code && nohup npx tsx watch src/index.ts &" \
    || ALERTS="${ALERTS}Dashboard caiu. "

check_service "N8n" "http://localhost:5678" \
    "cd /opt/homebrew && nohup n8n start &" \
    || ALERTS="${ALERTS}N8n caiu. "

check_service "Ollama" "http://localhost:11434" \
    "nohup ollama serve &" \
    || ALERTS="${ALERTS}Ollama offline. "

check_service "OpenClaw Gateway" "http://localhost:18789" "" \
    || ALERTS="${ALERTS}Gateway caiu! "

# Frontend (pode estar off em dev)
check_service "Frontend" "http://localhost:3000" "" || true

# Alertar se algo caiu
if [ -n "$ALERTS" ]; then
    send_alert "$ALERTS RAM: ${RAM_PCT}%"
else
    log "✅ Tudo OK (RAM: ${RAM_PCT}%)"
fi
