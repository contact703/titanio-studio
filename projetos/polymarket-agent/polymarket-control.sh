#!/bin/bash
# polymarket-control.sh - Controle manual do Polymarket Bot
# Interface simples para gerenciar o serviço

set -e

SCRIPT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent"
LAUNCHAGENT_LABEL="com.titanio.polymarket.bot"

show_help() {
    echo "🤖 Polymarket Bot - Controle Manual"
    echo ""
    echo "Uso: $0 {start|stop|restart|status|logs|dashboard|install|uninstall}"
    echo ""
    echo "Comandos:"
    echo "  start      - Inicia o bot (via LaunchAgent)"
    echo "  stop       - Para o bot"
    echo "  restart    - Reinicia o bot"
    echo "  status     - Mostra status do serviço"
    echo "  logs       - Mostra logs recentes"
    echo "  dashboard  - Abre dashboard no navegador"
    echo "  install    - Instala LaunchAgent (requer sudo)"
    echo "  uninstall  - Remove LaunchAgent (requer sudo)"
    echo ""
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

check_dependencies() {
    # Verificar se Flask está instalado
    if ! python3 -c "import flask" 2>/dev/null; then
        log "📦 Instalando Flask..."
        cd "$SCRIPT_DIR"
        source venv/bin/activate
        pip install flask
    fi
}

install_launchagent() {
    log "🔧 Instalando LaunchAgent..."
    
    # Copiar plist para o diretório correto
    sudo cp "$SCRIPT_DIR/com.titanio.polymarket.bot.plist" "/Library/LaunchDaemons/"
    sudo launchctl load -w "/Library/LaunchDaemons/com.titanio.polymarket.bot.plist"
    
    log "✅ LaunchAgent instalado e iniciado"
    log "📋 Use 'launchctl list | grep polymarket' para verificar"
}

uninstall_launchagent() {
    log "🗑️ Removendo LaunchAgent..."
    
    # Parar e remover
    sudo launchctl stop "$LAUNCHAGENT_LABEL" 2>/dev/null || true
    sudo launchctl unload -w "/Library/LaunchDaemons/com.titanio.polymarket.bot.plist" 2>/dev/null || true
    sudo rm -f "/Library/LaunchDaemons/com.titanio.polymarket.bot.plist"
    
    log "✅ LaunchAgent removido"
}

start_bot() {
    log "🚀 Iniciando Polymarket Bot..."
    
    check_dependencies
    
    # Usar LaunchAgent se instalado, senão usar script direto
    if [ -f "/Library/LaunchDaemons/com.titanio.polymarket.bot.plist" ]; then
        sudo launchctl start "$LAUNCHAGENT_LABEL"
        log "✅ Bot iniciado via LaunchAgent"
    else
        log "⚠️ LaunchAgent não instalado. Iniciando diretamente..."
        cd "$SCRIPT_DIR"
        nohup bash polymarket-launchagent.sh > data/launchagent.log 2>&1 &
        log "✅ Bot iniciado em background"
    fi
    
    # Aguardar e verificar
    sleep 3
    check_status
}

stop_bot() {
    log "🛑 Parando Polymarket Bot..."
    
    # Parar LaunchAgent se existir
    sudo launchctl stop "$LAUNCHAGENT_LABEL" 2>/dev/null || true
    
    # Matar processos relacionados
    pkill -f "polymarket-launchagent.sh" 2>/dev/null || true
    pkill -f "dashboard-server.py" 2>/dev/null || true
    pkill -f "src/monitor.py" 2>/dev/null || true
    
    # Limpar PID files
    rm -f "$SCRIPT_DIR"/*.pid
    
    log "✅ Bot parado"
}

restart_bot() {
    log "🔄 Reiniciando Polymarket Bot..."
    stop_bot
    sleep 2
    start_bot
}

check_status() {
    log "📊 Status do Polymarket Bot:"
    echo ""
    
    # Verificar LaunchAgent
    if launchctl list | grep -q "$LAUNCHAGENT_LABEL"; then
        echo "✅ LaunchAgent: Instalado e registrado"
    else
        echo "❌ LaunchAgent: Não instalado"
    fi
    
    # Verificar processos
    if pgrep -f "src/monitor.py" > /dev/null; then
        echo "✅ Monitor: Rodando"
        pgrep -f "src/monitor.py" | while read pid; do
            echo "   PID: $pid"
        done
    else
        echo "❌ Monitor: Parado"
    fi
    
    if pgrep -f "dashboard-server.py" > /dev/null; then
        echo "✅ Dashboard: Rodando na porta 8080"
    else
        echo "❌ Dashboard: Parado"
    fi
    
    # Verificar arquivos de log
    echo ""
    echo "📁 Arquivos de log:"
    echo "   Principal: $SCRIPT_DIR/data/monitor.log"
    echo "   Serviço: $SCRIPT_DIR/data/launchagent.log"
    echo "   Dashboard: $SCRIPT_DIR/data/dashboard.log"
    echo "   Alertas: $SCRIPT_DIR/data/alerts.log"
    
    # Verificar últimas linhas do log
    if [ -f "$SCRIPT_DIR/data/monitor.log" ]; then
        echo ""
        echo "📋 Últimas 5 linhas do log:"
        tail -5 "$SCRIPT_DIR/data/monitor.log" | sed 's/^/   /'
    fi
}

show_logs() {
    log "📋 Logs recentes:"
    echo ""
    
    if [ -f "$SCRIPT_DIR/data/monitor.log" ]; then
        echo "📝 Monitor log (últimas 20 linhas):"
        tail -20 "$SCRIPT_DIR/data/monitor.log"
        echo ""
    fi
    
    if [ -f "$SCRIPT_DIR/data/launchagent.log" ]; then
        echo "⚙️ LaunchAgent log (últimas 10 linhas):"
        tail -10 "$SCRIPT_DIR/data/launchagent.log"
        echo ""
    fi
    
    if [ -f "$SCRIPT_DIR/data/alerts.log" ]; then
        echo "📢 Alertas (últimas 5 linhas):"
        tail -5 "$SCRIPT_DIR/data/alerts.log"
        echo ""
    fi
}

open_dashboard() {
    if pgrep -f "dashboard-server.py" > /dev/null; then
        log "🌐 Abrindo dashboard..."
        open "http://localhost:8080"
    else
        log "❌ Dashboard não está rodando. Inicie o bot primeiro."
    fi
}

# Main
case "${1:-status}" in
    start)      start_bot ;;
    stop)       stop_bot ;;
    restart)    restart_bot ;;
    status)     check_status ;;
    logs)       show_logs ;;
    dashboard)  open_dashboard ;;
    install)    install_launchagent ;;
    uninstall)  uninstall_launchagent ;;
    help|--help|-h) show_help ;;
    *)          show_help ;;
esac