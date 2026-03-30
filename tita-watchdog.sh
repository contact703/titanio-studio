#!/bin/bash
# TITA WATCHDOG v2 — Limpo, sem duplicar gateway
# Só monitora e reinicia serviços que realmente morreram
# O GATEWAY é gerenciado pelo LaunchAgent — NÃO toca nele!

LOG="/Volumes/TITA_039/MAC_MINI_03/.openclaw/logs/tita-watchdog.log"
BACKEND_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code/backend"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }
log "🚀 Tita Watchdog v2 iniciado (PID $$)"

while true; do

    # 1. Caffeinate (Mac não dorme)
    if ! pgrep -x caffeinate > /dev/null; then
        nohup caffeinate -dims &>/dev/null &
        log "☕ Caffeinate reiniciado"
    fi

    # 2. Backend Titanio (porta 4444) — SÓ se tiver o dist/index.js
    if [ -f "$BACKEND_DIR/dist/index.js" ]; then
        if ! curl -sf -o /dev/null -m 5 http://localhost:4444/api/health 2>/dev/null; then
            log "🔧 Backend morto — reiniciando..."
            cd "$BACKEND_DIR" && nohup node dist/index.js >> /tmp/backend.log 2>&1 &
            sleep 5
            if curl -sf -o /dev/null -m 5 http://localhost:4444/api/health 2>/dev/null; then
                log "✅ Backend reiniciado"
            else
                log "❌ Backend falhou ao reiniciar"
            fi
        fi
    fi

    # 3. N8n (porta 5678)
    if ! curl -sf -o /dev/null -m 5 http://localhost:5678/healthz 2>/dev/null; then
        if command -v n8n &>/dev/null; then
            log "🔧 N8n morto — reiniciando..."
            N8N_SECURE_COOKIE=false nohup n8n start > /tmp/n8n.log 2>&1 &
            log "N8n reiniciado"
        fi
    fi

    # 4. Memory watchdog
    if ! pgrep -f "memory-watchdog.sh" > /dev/null; then
        if [ -f "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/memory-watchdog.sh" ]; then
            nohup bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/memory-watchdog.sh &>/dev/null &
            log "🧠 Memory watchdog reiniciado"
        fi
    fi

    # ⚠️ NÃO TOCA NO GATEWAY! 
    # O LaunchAgent (KeepAlive=true) cuida disso automaticamente.
    # Se o gateway morrer, o macOS relança em segundos.

    # 5. Relatório a cada 6h
    HOUR=$(date +%H)
    MINS=$(date +%M)
    if [[ "$HOUR" == "08" || "$HOUR" == "14" || "$HOUR" == "20" ]] && [[ "$MINS" < "03" ]]; then
        GW_OK="❌"; curl -sf -o /dev/null -m 3 http://localhost:18789 2>/dev/null && GW_OK="✅"
        BE_OK="❌"; curl -sf -o /dev/null -m 3 http://localhost:4444/api/health 2>/dev/null && BE_OK="✅"
        N8_OK="❌"; curl -sf -o /dev/null -m 3 http://localhost:5678/healthz 2>/dev/null && N8_OK="✅"
        RAM=$(vm_stat | awk '/Pages free/ {printf "%d", $3*16384/1048576}')
        
        STATUS="💓 Watchdog report $(date '+%H:%M'):
Gateway: $GW_OK
Backend: $BE_OK
N8n: $N8_OK
RAM livre: ${RAM}MB"
        log "$STATUS"
    fi

    sleep 120  # checar a cada 2 minutos
done
