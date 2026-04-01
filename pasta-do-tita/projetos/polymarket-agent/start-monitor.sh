#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
pkill -f "monitor.py" 2>/dev/null
sleep 2
# Rodar a cada 5 min (modo day-trade) e sem buffer no log
nohup python3 -u src/monitor.py 5 > /tmp/polymarket-monitor.log 2>&1 &
echo "👁️ Monitor Polymarket iniciado (PID $!) — scan a cada 5min"
echo "   Log: /tmp/polymarket-monitor.log"
echo "   Data: data/latest_scan.json"
