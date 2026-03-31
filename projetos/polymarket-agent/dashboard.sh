#!/bin/bash
# dashboard.sh - Dashboard local para monitoramento do Polymarket Bot

SCRIPT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent"
DATA_DIR="$SCRIPT_DIR/data"
LOG_FILE="$DATA_DIR/monitor.log"
LATEST_SCAN="$DATA_DIR/latest_scan.json"

clear
echo "🎯 POLYMARKET BOT - DASHBOARD MAC MINI"
echo "======================================="
echo ""

# Status do processo
if [ -f "$SCRIPT_DIR/monitor.pid" ]; then
    PID=$(cat "$SCRIPT_DIR/monitor.pid")
    if kill -0 "$PID" 2>/dev/null; then
        echo "✅ BOT STATUS: Online (PID: $PID)"
        UPTIME=$(ps -o etime= -p "$PID" | tr -d ' ')
        echo "⏰ UPTIME: $UPTIME"
        
        # Uso de recursos
        CPU=$(ps -o %cpu= -p "$PID" | tr -d ' ')
        MEM=$(ps -o %mem= -p "$PID" | tr -d ' ')
        echo "💻 CPU: ${CPU}% | MEM: ${MEM}%"
    else
        echo "❌ BOT STATUS: Offline (PID inválido)"
    fi
else
    echo "❌ BOT STATUS: Offline (sem PID)"
fi

# Último scan
echo ""
echo "📊 ÚLTIMO SCAN:"
if [ -f "$LATEST_SCAN" ]; then
    SCAN_TIME=$(stat -f %Sm -t %Y-%m-%d\ %H:%M:%S "$LATEST_SCAN")
    echo "🕐 Horário: $SCAN_TIME"
    
    # Conta sinais fortes
    if [ -f "$DATA_DIR/scan_history.jsonl" ]; then
        STRONG_SIGNALS=$(tail -100 "$DATA_DIR/scan_history.jsonl" | grep -c '"confidence": [7-9][0-9]' || echo 0)
        echo "🎯 Sinais Fortes (últimos 100): $STRONG_SIGNALS"
    fi
fi

# Saldo da conta (se disponível)
echo ""
echo "💰 SALDO DA CONTA:"
if [ -f "$DATA_DIR/balance.json" ]; then
    BALANCE=$(cat "$DATA_DIR/balance.json" 2>/dev/null | python3 -c "import json, sys; data = json.load(sys.stdin); print(f'{float(data.get('balance', 0)):.2f}')" 2>/dev/null || echo "N/A")
    echo "💵 Saldo USDC: $BALANCE"
fi

# Trades executados
echo ""
echo "📈 TRADES:"
if [ -f "$DATA_DIR/trades_history.jsonl" ]; then
    TRADE_COUNT=$(wc -l < "$DATA_DIR/trades_history.jsonl")
    echo "🔄 Total de Trades: $TRADE_COUNT"
    
    # Últimos trades
    echo ""
    echo "Últimos 3 Trades:"
    tail -3 "$DATA_DIR/trades_history.jsonl" | while read line; do
        MARKET=$(echo "$line" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('market', 'N/A'))" 2>/dev/null || echo "N/A")
        AMOUNT=$(echo "$line" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('amount', 'N/A'))" 2>/dev/null || echo "N/A")
        SIDE=$(echo "$line" | python3 -c "import json, sys; data = json.load(sys.stdin); print(data.get('side', 'N/A'))" 2>/dev/null || echo "N/A")
        echo "  • $MARKET - $SIDE \$$AMOUNT"
    done
fi

# Logs recentes
echo ""
echo "📝 LOGS RECENTES:"
echo "-------------------"
if [ -f "$LOG_FILE" ]; then
    tail -5 "$LOG_FILE" | grep -E "(INFO|WARN|ERROR)" | tail -3
fi

# Configurações atuais
echo ""
echo "⚙️ CONFIGURAÇÕES:"
echo "-----------------"
if [ -f "$SCRIPT_DIR/.env" ]; then
    DRY_RUN=$(grep "DRY_RUN=" "$SCRIPT_DIR/.env" | cut -d= -f2 || echo "true")
    INTERVAL=$(grep "SCAN_INTERVAL_MINUTES=" "$SCRIPT_DIR/.env" | cut -d= -f2 || echo "10")
    CONFIDENCE=$(grep "MIN_CONFIDENCE=" "$SCRIPT_DIR/.env" | cut -d= -f2 || echo "70")
    
    echo "🔒 DRY RUN: $DRY_RUN"
    echo "⏱️ Intervalo: ${INTERVAL}min"
    echo "🎯 Confiança Mínima: ${CONFIDENCE}%"
fi

echo ""
echo "======================================="
echo "Atualizado: $(date)"
echo "Pressione Ctrl+C para sair"
echo ""

# Atualiza a cada 30 segundos
sleep 30
exec "$0" "$@"