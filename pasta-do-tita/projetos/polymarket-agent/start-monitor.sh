#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
pkill -f "monitor.py" 2>/dev/null
sleep 2
# Rodar a cada 10 min, usando Claude como IA principal
nohup python3 src/monitor.py 10 > /tmp/polymarket-monitor.log 2>&1 &
echo "👁️ Monitor Polymarket iniciado (PID $!) — scan a cada 10min"
echo "   Log: /tmp/polymarket-monitor.log"
echo "   Data: data/latest_scan.json"
