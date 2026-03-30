#!/bin/bash
# install-full.sh — Instalação completa no Mac do Helber ou Tiago
# Roda REMOTAMENTE via SSH após ter acesso
# Uso: bash install-full.sh helber  (ou tiago)

USER_TYPE="${1:-helber}"  # helber | tiago
GATEWAY_IP="192.168.18.174"
DIST="/Volumes/TITA_039/backup-projetos/titanio-dist"
THIS_MAC_IP=$(ifconfig en0 | grep "inet " | awk '{print $2}')

echo "🚀 Instalação completa Titanio para: $USER_TYPE"
echo "   Gateway: $GATEWAY_IP"
echo "   Este Mac: $THIS_MAC_IP"
echo ""

# ── 1. OpenClaw workspace ─────────────────────────────────────
echo "📁 [1/5] Configurando workspace OpenClaw..."
WORKSPACE="$HOME/.openclaw/workspace"
mkdir -p "$WORKSPACE/memory"
mkdir -p "$WORKSPACE/tita-learning-system"

# Copiar workspace personalizado
rsync -a "$DIST/${USER_TYPE}-workspace/" "$WORKSPACE/"

echo "✅ Workspace configurado em $WORKSPACE"

# ── 2. Sistema de aprendizado ─────────────────────────────────
echo "🧠 [2/5] Ativando sistema de aprendizado..."
chmod +x "$WORKSPACE/tita-learning-system/"*.sh
echo "✅ Scripts de aprendizado prontos"

# ── 3. Dashboard Titanio ──────────────────────────────────────
echo "📊 [3/5] Instalando Dashboard Titanio..."

# Porta baseada no usuário
if [ "$USER_TYPE" = "helber" ]; then
  BACKEND_PORT=4445
  FRONTEND_PORT=3001
else
  BACKEND_PORT=4446
  FRONTEND_PORT=3002
fi

DASHBOARD="$HOME/titanio-dashboard"
mkdir -p "$DASHBOARD"
rsync -a --exclude='node_modules' --exclude='.next' \
  "$DIST/${USER_TYPE}/code/" "$DASHBOARD/"

# Configurar .env
cat > "$DASHBOARD/backend/.env" << ENV
PORT=$BACKEND_PORT
OWNER_ID=$USER_TYPE
OWNER_PHONE=+55XXXXXXXXXX
OPENCLAW_SESSION_KEY=agent:main:main
OPENCLAW_GATEWAY=$GATEWAY_IP:18789
USER_NAME=$(echo "$USER_TYPE" | python3 -c "import sys; s=sys.stdin.read().strip(); print(s[0].upper()+s[1:])")
ENV

# Instalar deps e buildar
cd "$DASHBOARD/backend" && npm install --quiet && npm run build
cd "$DASHBOARD/frontend" && npm install --quiet && npm run build

echo "✅ Dashboard instalado (backend:$BACKEND_PORT, frontend:$FRONTEND_PORT)"

# ── 4. OpenClaw node ──────────────────────────────────────────
echo "🔗 [4/5] Configurando OpenClaw node..."

# Criar plist do node
cat > "$HOME/Library/LaunchAgents/com.titanio.openclaw-node.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.titanio.openclaw-node</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-c</string>
    <string>openclaw node run --host $GATEWAY_IP --port 18789 --display-name "$USER_TYPE Node" >> /tmp/openclaw-node.log 2>&1</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
PLIST

# Criar plist do dashboard backend
cat > "$HOME/Library/LaunchAgents/com.titanio.dashboard.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.titanio.dashboard</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-c</string>
    <string>cd $HOME/titanio-dashboard/backend && node dist/index.js >> /tmp/titanio-backend.log 2>&1</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
PLIST

launchctl load "$HOME/Library/LaunchAgents/com.titanio.openclaw-node.plist" 2>/dev/null
launchctl load "$HOME/Library/LaunchAgents/com.titanio.dashboard.plist" 2>/dev/null

echo "✅ Serviços configurados para auto-start"

# ── 5. Sync memória automático ────────────────────────────────
echo "🔄 [5/5] Configurando sync de memória..."

# Criar cron para sync diário de memória
(crontab -l 2>/dev/null; echo "0 */6 * * * bash $WORKSPACE/tita-learning-system/consolidate-memory.sh >> /tmp/memory-sync.log 2>&1") | crontab -

echo "✅ Sync de memória configurado (a cada 6h)"

# ── Resumo ────────────────────────────────────────────────────
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  ✅ INSTALAÇÃO COMPLETA — $USER_TYPE   ║"
echo "╠════════════════════════════════════════╣"
echo "║  Dashboard:  http://$THIS_MAC_IP:$FRONTEND_PORT  ║"
echo "║  Backend:    http://$THIS_MAC_IP:$BACKEND_PORT   ║"
echo "║  Gateway:    http://$GATEWAY_IP:18789  ║"
echo "║  Workspace:  $WORKSPACE  ║"
echo "╚════════════════════════════════════════╝"
