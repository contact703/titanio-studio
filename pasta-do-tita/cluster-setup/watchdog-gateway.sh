#!/bin/bash
# Watchdog: garante que o gateway OpenClaw nunca fica down
# Roda como cron a cada 2 minutos

PLIST_LOCAL="/Users/contacttitanio/Library/LaunchAgents/ai.openclaw.gateway.plist"
PLIST_VOLUME="/Volumes/TITA_039/MAC_MINI_03/Library/LaunchAgents/ai.openclaw.gateway.plist"
LOG="/Volumes/TITA_039/MAC_MINI_03/.openclaw/logs/watchdog-gateway.log"
PORT=18789

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG"; }

# Verificar se tá ouvindo
if netstat -an 2>/dev/null | grep -q "*.${PORT}.*LISTEN\|0.0.0.0.${PORT}.*LISTEN"; then
    exit 0  # tudo ok, silencioso
fi

log "⚠️  Gateway DOWN na porta $PORT — tentando recuperar..."

# Tentar via launchctl (SSD)
if [ -f "$PLIST_LOCAL" ]; then
    launchctl unload "$PLIST_LOCAL" 2>/dev/null
    sleep 1
    launchctl load "$PLIST_LOCAL" 2>/dev/null
    sleep 5
    if netstat -an 2>/dev/null | grep -q "*.${PORT}.*LISTEN"; then
        log "✅ Gateway recuperado via launchctl"
        exit 0
    fi
fi

# Fallback: nohup direto
log "⚠️  launchctl falhou, tentando nohup..."
NODE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/tools/node-v22.22.0/bin/node"
ENTRY="/Volumes/TITA_039/MAC_MINI_03/.openclaw/lib/node_modules/openclaw/dist/entry.js"

export ANTHROPIC_API_KEY="$(grep -o '"ANTHROPIC_API_KEY":"[^"]*"' /Volumes/TITA_039/MAC_MINI_03/Library/LaunchAgents/ai.openclaw.gateway.plist | cut -d'"' -f4)"
export HOME="/Volumes/TITA_039/MAC_MINI_03"
export OPENCLAW_GATEWAY_PORT=$PORT
export OPENCLAW_GATEWAY_TOKEN="e60ccf70d272c2dc7203130b129a47ae97fa57df656f64e8"

nohup "$NODE" "$ENTRY" gateway --port $PORT \
  >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/logs/gateway.log 2>&1 &

sleep 5
if netstat -an 2>/dev/null | grep -q "*.${PORT}.*LISTEN\|127.0.0.1.${PORT}.*LISTEN"; then
    log "✅ Gateway recuperado via nohup (PID $!)"
else
    log "❌ Falha total — intervenção manual necessária"
fi
