#!/bin/bash
# start-macmini.sh - Inicialização robusta para Mac Mini

SCRIPT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent"
cd "$SCRIPT_DIR"

# Limpar PID antigo
rm -f monitor.pid

# Garantir que o ambiente virtual está ativado
source venv/bin/activate

# Criar diretórios necessários
mkdir -p data

# Iniciar com nohup para desacoplar do terminal
nohup python src/monitor.py --loop > data/monitor-console.log 2>&1 &

PID=$!
echo $PID > monitor.pid

echo "✅ Polymarket Monitor iniciado!"
echo "   PID: $PID"
echo "   Log: tail -f data/monitor-console.log"
echo "   Para parar: kill $PID"