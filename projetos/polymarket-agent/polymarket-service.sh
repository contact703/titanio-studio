#!/bin/bash
# polymarket-service.sh - Serviço robusto para Mac Mini
# Mantém o bot rodando continuamente

SCRIPT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent"
LOG_FILE="$SCRIPT_DIR/data/service.log"
RESTART_COUNT=0
MAX_RESTARTS=10

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

start_bot() {
    cd "$SCRIPT_DIR"
    source venv/bin/activate
    
    log "🚀 Iniciando bot (tentativa $((RESTART_COUNT + 1))/$MAX_RESTARTS)"
    
    # Executar diretamente com Python, capturando erros
    python src/monitor.py --loop 2>&1 | while IFS= read -r line; do
        log "BOT: $line"
    done
    
    EXIT_CODE=$?
    log "❌ Bot terminou com código: $EXIT_CODE"
    return $EXIT_CODE
}

main() {
    log "🎯 Iniciando serviço Polymarket Bot"
    
    while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
        start_bot
        EXIT_CODE=$?
        
        if [ $EXIT_CODE -eq 0 ]; then
            log "✅ Bot finalizado normalmente"
            break
        fi
        
        RESTART_COUNT=$((RESTART_COUNT + 1))
        
        if [ $RESTART_COUNT -lt $MAX_RESTARTS ]; then
            WAIT_TIME=$((30 * RESTART_COUNT))  # Espera progressiva
            log "⏰ Aguardando ${WAIT_TIME}s antes de reiniciar..."
            sleep $WAIT_TIME
        fi
    done
    
    log "❌ Serviço finalizado após $RESTART_COUNT tentativas"
}

# Criar arquivo de PID
echo $$ > "$SCRIPT_DIR/service.pid"

# Tratamento de sinais de término
trap 'log "Serviço interrompido"; exit 0' INT TERM

main