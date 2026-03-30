#!/bin/bash
# KiteSurf Backend Tunnel - Auto-restart

TUNNEL_LOG="/tmp/kitesurf-tunnel.log"

while true; do
    echo "$(date): Iniciando tunnel..." >> $TUNNEL_LOG
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -o ServerAliveCountMax=3 \
        -R 80:localhost:3000 nokey@localhost.run 2>&1 | tee -a $TUNNEL_LOG
    echo "$(date): Tunnel caiu, reiniciando em 5s..." >> $TUNNEL_LOG
    sleep 5
done
