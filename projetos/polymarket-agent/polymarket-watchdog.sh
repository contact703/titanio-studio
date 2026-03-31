#!/bin/bash
# polymarket-watchdog.sh - Watchdog específico para Mac Mini
# Monitora o bot e reinicia se necessário

set -e

SCRIPT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent"
LOG_FILE="$SCRIPT_DIR/data/watchdog.log"
PID_FILE="$SCRIPT_DIR/monitor.pid"
MAX_RESTARTS=5
RESTART_COUNT_FILE="/tmp/polymarket-restarts.count"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_monitor_health() {
    if [ ! -f "$PID_FILE" ]; then
        log "❌ PID file não encontrado"
        return 1
    fi
    
    PID=$(cat "$PID_FILE")
    if ! kill -0 "$PID" 2>/dev/null; then
        log "❌ Processo $PID não está rodando"
        return 1
    fi
    
    # Verifica se o log foi atualizado recentemente (últimos 30 minutos)
    if [ -f "$SCRIPT_DIR/data/monitor.log" ]; then
        LOG_AGE=$(($(date +%s) - $(stat -f %m "$SCRIPT_DIR/data/monitor.log")))
        if [ $LOG_AGE -gt 1800 ]; then
            log "⚠️ Log não atualizado há $LOG_AGE segundos"
            return 1
        fi
    fi
    
    # Verifica uso de memória (mata se ultrapassar 1GB)
    MEM_USAGE=$(ps -o rss= -p "$PID" 2>/dev/null || echo 0)
    if [ "$MEM_USAGE" -gt 1048576 ]; then  # 1GB em KB
        log "⚠️ Uso de memória alto: ${MEM_USAGE}KB"
        return 1
    fi
    
    log "✅ Monitor saudável (PID: $PID)"
    return 0
}

restart_monitor() {
    log "🔄 Reiniciando monitor..."
    
    # Conta reinicializações para evitar loop infinito
    if [ -f "$RESTART_COUNT_FILE" ]; then
        RESTART_COUNT=$(cat "$RESTART_COUNT_FILE")
    else
        RESTART_COUNT=0
    fi
    
    if [ "$RESTART_COUNT" -ge "$MAX_RESTARTS" ]; then
        log "❌ Máximo de reinicializações atingido ($MAX_RESTARTS)"
        log "🛠️ Verifique manualmente o bot"
        return 1
    fi
    
    echo $((RESTART_COUNT + 1)) > "$RESTART_COUNT_FILE"
    
    cd "$SCRIPT_DIR"
    bash start-monitor.sh stop 2>/dev/null || true
    sleep 3
    bash start-monitor.sh start
    
    log "✅ Monitor reiniciado (tentativa $((RESTART_COUNT + 1))/$MAX_RESTARTS)"
}

# Reset do contador se o monitor estiver funcionando
if check_monitor_health; then
    echo 0 > "$RESTART_COUNT_FILE"
    exit 0
else
    restart_monitor
fi