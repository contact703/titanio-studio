#!/bin/bash
# TITA MEMORY WATCHDOG — Roda 24/7, monitora e executa memory system

MEMORY_FILE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/MEMORY.md"
LOG_FILE="/tmp/tita-memory-watchdog.log"
BIN_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧠 TITA Memory Watchdog iniciado" >> "$LOG_FILE"

while true; do
    HOUR=$(date +%H)
    MINUTE=$(date +%M)
    DOW=$(date +%w)
    
    # Consolidação diária às 23:59
    if [ "$HOUR" = "23" ] && [ "$MINUTE" = "59" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Consolidando memória..." >> "$LOG_FILE"
        bash "$BIN_DIR/tita-consolidate-memory" >> "$LOG_FILE" 2>&1
    fi
    
    # Teste semanal domingo 09:00
    if [ "$DOW" = "0" ] && [ "$HOUR" = "09" ] && [ "$MINUTE" = "00" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🧪 Teste semanal..." >> "$LOG_FILE"
        bash "$BIN_DIR/tita-weekly-test" >> "$LOG_FILE" 2>&1
    fi
    
    # Verificação de saúde a cada hora
    if [ "$MINUTE" = "00" ]; then
        LINES=$(wc -l < "$MEMORY_FILE" 2>/dev/null || echo 0)
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 📊 MEMORY.md: $LINES linhas" >> "$LOG_FILE"
    fi
    
    # Dormir 1 minuto
    sleep 60
done
