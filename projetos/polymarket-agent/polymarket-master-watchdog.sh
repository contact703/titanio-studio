#!/bin/bash
# polymarket-master-watchdog.sh - Watchdog mestre para garantir 24/7 operation
# Verifica todos os componentes e reinicia se necessário

set -e

SCRIPT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent"
LOG_FILE="$SCRIPT_DIR/data/master-watchdog.log"
ALERT_COOLDOWN=3600  # 1 hora entre alertas repetidos
LAST_ALERT_FILE="/tmp/polymarket-last-alert"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [MASTER] $1" | tee -a "$LOG_FILE"
}

send_alert() {
    local message="$1"
    local current_time=$(date +%s)
    
    # Verificar cooldown
    if [ -f "$LAST_ALERT_FILE" ]; then
        local last_alert=$(cat "$LAST_ALERT_FILE")
        local time_diff=$((current_time - last_alert))
        if [ $time_diff -lt $ALERT_COOLDOWN ]; then
            log "⏰ Alerta em cooldown ($time_diff/$ALERT_COOLDOWN segundos)"
            return
        fi
    fi
    
    # Enviar alerta
    bash "$SCRIPT_DIR/send-polymarket-alert.sh" "$message" 2>/dev/null || true
    echo "$current_time" > "$LAST_ALERT_FILE"
}

check_dashboard() {
    # Verificar se dashboard responde
    if ! curl -s http://localhost:8080/api/status > /dev/null 2>&1; then
        log "❌ Dashboard não responde"
        return 1
    fi
    log "✅ Dashboard OK"
    return 0
}

check_monitor() {
    # Verificar se monitor está rodando
    if ! pgrep -f "src/monitor.py" > /dev/null; then
        log "❌ Monitor não está rodando"
        return 1
    fi
    
    # Verificar se log foi atualizado recentemente (últimos 20 minutos)
    if [ -f "$SCRIPT_DIR/data/monitor.log" ]; then
        local log_age=$(($(date +%s) - $(stat -f %m "$SCRIPT_DIR/data/monitor.log")))
        if [ $log_age -gt 1200 ]; then
            log "⚠️ Log não atualizado há $log_age segundos"
            return 1
        fi
    fi
    
    log "✅ Monitor OK"
    return 0
}

restart_services() {
    log "🔄 Reiniciando serviços..."
    
    cd "$SCRIPT_DIR"
    
    # Parar tudo
    pkill -f "dashboard-server.py" 2>/dev/null || true
    pkill -f "src/monitor.py" 2>/dev/null || true
    sleep 2
    
    # Iniciar monitor
    source venv/bin/activate
    nohup python src/monitor.py --loop >> data/monitor.log 2>&1 &
    sleep 2
    
    # Iniciar dashboard
    nohup python dashboard-server.py >> data/dashboard.log 2>&1 &
    
    log "✅ Serviços reiniciados"
    send_alert "🔄 Polymarket Bot reiniciado pelo watchdog"
}

# Verificar uso de disco
if [ $(df / | tail -1 | awk '{print $5}' | sed 's/%//') -gt 90 ]; then
    log "⚠️ Uso de disco alto!"
    # Limpar logs antigos
    find "$SCRIPT_DIR/data" -name "*.log" -mtime +7 -delete 2>/dev/null || true
fi

# Verificar componentes
needs_restart=false

if ! check_monitor; then
    needs_restart=true
fi

if ! check_dashboard; then
    needs_restart=true
fi

# Reiniciar se necessário
if [ "$needs_restart" = true ]; then
    restart_services
else
    log "✅ Todos os serviços saudáveis"
fi

# Limpar arquivos temporários antigos
find /tmp -name "polymarket-alert-*.txt" -mtime +1 -delete 2>/dev/null || true

exit 0