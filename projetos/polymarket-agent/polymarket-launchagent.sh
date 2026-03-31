#!/bin/bash
# polymarket-launchagent.sh - Script principal do LaunchAgent
# Gerencia o ciclo de vida do Polymarket Bot com monitoramento integrado

set -e

SCRIPT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent"
LOG_FILE="$SCRIPT_DIR/data/launchagent.log"
PID_FILE="$SCRIPT_DIR/launchagent.pid"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [LAUNCHAGENT] $1" | tee -a "$LOG_FILE"
}

# Criar PID file
echo $$ > "$PID_FILE"

log "🚀 Iniciando Polymarket Bot LaunchAgent"

# Verificar ambiente
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    log "❌ Virtual environment não encontrado. Criando..."
    cd "$SCRIPT_DIR"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Iniciar dashboard web em background
log "📊 Iniciando dashboard web..."
cd "$SCRIPT_DIR"
nohup python dashboard-server.py >> "$SCRIPT_DIR/data/dashboard.log" 2>&1 &
DASHBOARD_PID=$!
echo "$DASHBOARD_PID" > "$SCRIPT_DIR/dashboard.pid"

# Iniciar monitor principal
log "🔍 Iniciando monitor Polymarket..."
cd "$SCRIPT_DIR"
source venv/bin/activate

# Loop principal com reinicialização inteligente
RESTART_COUNT=0
MAX_RESTARTS=10

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    log "🔄 Iniciando ciclo $((RESTART_COUNT + 1))/$MAX_RESTARTS"
    
    # Executar monitor com captura de erros
    python src/monitor.py --loop 2>&1 | while IFS= read -r line; do
        log "MONITOR: $line"
        
        # Detectar erros críticos e enviar alertas
        if echo "$line" | grep -qi "error\|exception\|falha\|crash"; then
            bash send-polymarket-alert.sh "ERRO CRÍTICO: $line" 2>/dev/null || true
        fi
        
        # Detectar trades executados
        if echo "$line" | grep -qi "trade\|compra\|venda\|executado"; then
            bash send-polymarket-alert.sh "TRADE: $line" 2>/dev/null || true
        fi
    done
    
    EXIT_CODE=$?
    log "❌ Monitor terminou com código: $EXIT_CODE"
    
    if [ $EXIT_CODE -eq 0 ]; then
        log "✅ Finalização normal detectada"
        break
    fi
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
        WAIT_TIME=$((60 * RESTART_COUNT))  # Espera progressiva: 1, 2, 3... minutos
        log "⏰ Aguardando ${WAIT_TIME}s antes de reiniciar..."
        sleep $WAIT_TIME
    fi
done

if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
    log "❌ Máximo de reinicializações atingido. Enviando alerta..."
    bash send-polymarket-alert.sh "🚨 POLYMARKET BOT CRASHOU - MÁXIMO DE REINICIALIZAÇÕES ATINGIDO" 2>/dev/null || true
fi

# Cleanup
log "🧹 Finalizando serviços..."
if [ -f "$SCRIPT_DIR/dashboard.pid" ]; then
    DASHBOARD_PID=$(cat "$SCRIPT_DIR/dashboard.pid")
    kill "$DASHBOARD_PID" 2>/dev/null || true
fi

log "✅ LaunchAgent finalizado"
exit 0