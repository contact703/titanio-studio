#!/bin/bash
# MASTER WATCHDOG — reinicia tudo que precisa estar sempre vivo
# Roda via crontab a cada 5 minutos

LOG="/Volumes/TITA_039/MAC_MINI_03/.openclaw/logs/master-watchdog.log"
WS="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG"; }

# 1. Caffeinate
if ! pgrep -x caffeinate > /dev/null; then
    nohup caffeinate -dims &>/dev/null &
    log "🔄 caffeinate reiniciado"
fi

# 2. Watchdog principal
if ! pgrep -f "watchdog.sh" > /dev/null; then
    nohup bash "$WS/watchdog.sh" &>/dev/null &
    log "🔄 watchdog.sh reiniciado"
fi

# 3. Watchdog full
if ! pgrep -f "watchdog-full.sh" > /dev/null; then
    nohup bash "$WS/watchdog-full.sh" &>/dev/null &
    log "🔄 watchdog-full.sh reiniciado"
fi

# 4. Gateway OpenClaw
if ! netstat -an 2>/dev/null | grep -q "18789.*LISTEN"; then
    log "🔄 Gateway DOWN — tentando launchctl..."
    launchctl unload /Users/contacttitanio/Library/LaunchAgents/ai.openclaw.gateway.plist 2>/dev/null
    sleep 1
    launchctl load /Users/contacttitanio/Library/LaunchAgents/ai.openclaw.gateway.plist 2>/dev/null
    sleep 5
    if ! netstat -an 2>/dev/null | grep -q "18789.*LISTEN"; then
        log "⚠️  launchctl falhou — nohup fallback"
        NODE="$WS/../tools/node-v22.22.0/bin/node"
        ENTRY="$WS/../lib/node_modules/openclaw/dist/entry.js"
        export HOME="/Volumes/TITA_039/MAC_MINI_03"
        export OPENCLAW_GATEWAY_TOKEN="e60ccf70d272c2dc7203130b129a47ae97fa57df656f64e8"
        nohup "$NODE" "$ENTRY" gateway --port 18789 \
          >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/logs/gateway.log 2>&1 &
        log "🔄 Gateway reiniciado via nohup (PID $!)"
    else
        log "✅ Gateway recuperado via launchctl"
    fi
fi

# 5. Servidor HTTP cluster setup (porta 8765)
if ! netstat -an 2>/dev/null | grep -q "8765.*LISTEN"; then
    cd "$WS/pasta-do-tita/cluster-setup/" && \
    nohup python3 -m http.server 8765 &>/tmp/cluster-http.log &
    log "🔄 HTTP cluster setup reiniciado"
fi
