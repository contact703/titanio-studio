#!/bin/bash
# logs.sh — Ver logs de qualquer Mac em tempo real
# Uso: ./logs.sh mac1 backend
#      ./logs.sh mac1 frontend
#      ./logs.sh 192.168.18.XXX backend

SSH_USER="contacttitanio"
SSH_KEY="$HOME/.ssh/id_ed25519"
APP_DIR="/Users/contacttitanio/apps/titanio-dashboard"

declare -A MACS=(["mac1"]="192.168.18.174" ["mac2"]="192.168.18.XXX")

TARGET="${1:-mac1}"
SERVICE="${2:-backend}"

HOST="${MACS[$TARGET]:-$TARGET}"
LOG_FILE="$APP_DIR/logs/$SERVICE.log"

echo "📋 Streaming logs: $TARGET ($HOST) → $SERVICE"
echo "   Arquivo: $LOG_FILE"
echo "   Ctrl+C para sair"
echo "───────────────────────────────────────"

ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$HOST" \
  "tail -f $LOG_FILE"
