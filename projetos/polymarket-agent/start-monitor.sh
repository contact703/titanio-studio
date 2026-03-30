#!/bin/bash
# start-monitor.sh — Inicia o Polymarket Monitor em background

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV="$SCRIPT_DIR/venv"
PID_FILE="$SCRIPT_DIR/monitor.pid"
LOG_FILE="$SCRIPT_DIR/data/monitor.log"

# ============================================================
# Funções
# ============================================================

start() {
    echo "🚀 Iniciando Polymarket Monitor..."
    
    # Verifica venv
    if [ ! -d "$VENV" ]; then
        echo "❌ venv não encontrado. Rode primeiro:"
        echo "   python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
        exit 1
    fi

    # Verifica .env
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        echo "⚠️  .env não encontrado. Copiando de .env.example..."
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        echo "📝 Edite .env com suas credenciais antes de continuar"
        exit 1
    fi

    # Mata processo anterior se existir
    if [ -f "$PID_FILE" ]; then
        OLD_PID=$(cat "$PID_FILE")
        if kill -0 "$OLD_PID" 2>/dev/null; then
            echo "⚠️  Monitor já rodando (PID $OLD_PID). Parando..."
            kill "$OLD_PID"
            sleep 2
        fi
        rm -f "$PID_FILE"
    fi

    mkdir -p "$SCRIPT_DIR/data"

    # Inicia em background
    nohup "$VENV/bin/python" "$SCRIPT_DIR/src/monitor.py" --loop \
        >> "$LOG_FILE" 2>&1 &
    
    echo $! > "$PID_FILE"
    echo "✅ Monitor iniciado! PID: $(cat $PID_FILE)"
    echo "📄 Log: tail -f $LOG_FILE"
    echo "🛑 Para parar: bash start-monitor.sh stop"
}

stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo "🛑 Monitor parado (PID $PID)"
        else
            echo "⚠️  Processo $PID não estava rodando"
        fi
        rm -f "$PID_FILE"
    else
        echo "⚠️  PID file não encontrado"
    fi
}

status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "✅ Monitor rodando (PID $PID)"
            echo ""
            echo "📊 Últimas 20 linhas do log:"
            tail -20 "$LOG_FILE" 2>/dev/null || echo "(log vazio)"
        else
            echo "❌ Monitor parado (PID $PID no arquivo mas processo morto)"
            rm -f "$PID_FILE"
        fi
    else
        echo "❌ Monitor não está rodando"
    fi
}

once() {
    echo "🔍 Rodando scan único..."
    "$VENV/bin/python" "$SCRIPT_DIR/src/monitor.py"
}

test_scan() {
    echo "🧪 Rodando teste (sem IA, sem salvar)..."
    "$VENV/bin/python" "$SCRIPT_DIR/src/monitor.py" --test
}

logs() {
    tail -f "$LOG_FILE"
}

setup() {
    echo "🔧 Configurando ambiente..."
    
    if [ ! -d "$VENV" ]; then
        python3 -m venv "$VENV"
        echo "✅ venv criado"
    fi
    
    "$VENV/bin/pip" install --upgrade pip -q
    "$VENV/bin/pip" install -r "$SCRIPT_DIR/requirements.txt"
    echo "✅ Dependências instaladas"
    
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        echo "📝 .env criado a partir do .env.example"
        echo "⚠️  EDITE .env com suas credenciais!"
    fi
    
    mkdir -p "$SCRIPT_DIR/data"
    echo "✅ Setup concluído!"
}

# ============================================================
# Main
# ============================================================

case "${1:-start}" in
    start)   start ;;
    stop)    stop ;;
    restart) stop; sleep 1; start ;;
    status)  status ;;
    once)    once ;;
    test)    test_scan ;;
    logs)    logs ;;
    setup)   setup ;;
    trade)
        echo "💱 Executando trades baseado no último scan (DRY_RUN)..."
        "$VENV/bin/python" "$SCRIPT_DIR/src/executor.py" --amount "${TRADE_AMOUNT:-2.0}" --max-trades "${MAX_TRADES:-1}"
        ;;
    trade-live)
        echo "⚡ MODO LIVE — trades reais!"
        DRY_RUN=false "$VENV/bin/python" "$SCRIPT_DIR/src/executor.py" \
            --amount "${TRADE_AMOUNT:-2.0}" --max-trades "${MAX_TRADES:-1}" --live
        ;;
    balance)
        echo "💰 Verificando saldo..."
        "$VENV/bin/python" "$SCRIPT_DIR/src/trader.py" balance
        ;;
    orders)
        echo "📋 Ordens abertas..."
        "$VENV/bin/python" "$SCRIPT_DIR/src/trader.py" orders
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|once|test|logs|setup|trade|trade-live|balance|orders}"
        echo ""
        echo "  start       — Inicia monitor em background"
        echo "  stop        — Para o monitor"
        echo "  restart     — Reinicia o monitor"
        echo "  status      — Mostra status e últimos logs"
        echo "  once        — Roda um scan único"
        echo "  test        — Teste rápido (sem IA)"
        echo "  logs        — Segue o log em tempo real"
        echo "  setup       — Instala dependências"
        echo "  trade       — Executa trades (DRY_RUN) baseado no último scan"
        echo "  trade-live  — Executa trades REAIS (requer saldo na conta)"
        echo "  balance     — Verifica saldo USDC"
        echo "  orders      — Lista ordens abertas"
        exit 1
        ;;
esac
