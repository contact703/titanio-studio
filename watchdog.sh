#!/bin/bash
# Watchdog: garante que caffeinate está rodando
while true; do
    if ! pgrep -x caffeinate > /dev/null; then
        nohup caffeinate -dims &>/dev/null &
        echo "$(date): Caffeinate reiniciado (PID $!)" >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/memory/watchdog.log
    fi
    sleep 300  # checa a cada 5 min
done
