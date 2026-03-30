#!/bin/bash
# deploy-dashboard.sh — Instala o Titanio Dashboard em outro Mac via SSH
# Uso: ./deploy-dashboard.sh 192.168.18.170 username
# Ex:  ./deploy-dashboard.sh 192.168.18.170 helber

TARGET_IP="${1:-192.168.18.170}"
TARGET_USER="${2:-contacttitanio}"
TARGET_PORT="${3:-4445}"  # porta diferente pra não conflitar
SRC="/Volumes/TITA_039/backup-projetos/titanio-dashboard-backup-20260312-0801/code"
DIST="/Volumes/TITA_039/backup-projetos/titanio-dist"

echo "🚀 Deploy Titanio Dashboard → $TARGET_USER@$TARGET_IP"
echo "================================================"

# 1. Verificar conectividade SSH
echo "📡 Testando SSH..."
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -o BatchMode=yes \
  "$TARGET_USER@$TARGET_IP" "echo OK" 2>/dev/null
if [ $? -ne 0 ]; then
  echo "❌ SSH não disponível em $TARGET_IP"
  echo "   Para ativar: no Mac remoto vá em Preferências → Compartilhamento → Sessão Remota"
  echo "   Ou use: ssh-copy-id $TARGET_USER@$TARGET_IP"
  exit 1
fi

echo "✅ SSH OK!"

# 2. Criar estrutura no destino
echo "📁 Criando estrutura..."
ssh -o StrictHostKeyChecking=no "$TARGET_USER@$TARGET_IP" << 'REMOTE'
mkdir -p ~/titanio-dashboard
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
REMOTE

# 3. Copiar arquivos via rsync
echo "📤 Enviando arquivos..."
rsync -avz --exclude='node_modules' --exclude='.next' \
  "$SRC/" "$TARGET_USER@$TARGET_IP:~/titanio-dashboard/" 2>/dev/null

# 4. Instalar dependências e buildar
echo "📦 Instalando dependências..."
ssh -o StrictHostKeyChecking=no "$TARGET_USER@$TARGET_IP" << REMOTE
cd ~/titanio-dashboard/backend
npm install && npm run build
cd ~/titanio-dashboard/frontend
npm install && npm run build
echo "Build OK!"
REMOTE

# 5. Criar .env no destino
echo "⚙️ Configurando .env..."
ssh -o StrictHostKeyChecking=no "$TARGET_USER@$TARGET_IP" "cat > ~/titanio-dashboard/backend/.env" << ENV
PORT=$TARGET_PORT
OWNER_ID=$TARGET_USER
OPENCLAW_SESSION_KEY=agent:main:main
OWNER_PHONE=+553183838181
ENV

# 6. Criar launchd plist para auto-start
echo "🔧 Configurando auto-start..."
ssh -o StrictHostKeyChecking=no "$TARGET_USER@$TARGET_IP" << REMOTE
cat > ~/Library/LaunchAgents/com.titanio.dashboard.plist << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.titanio.dashboard</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-c</string>
    <string>cd ~/titanio-dashboard/backend && node dist/index.js >> /tmp/titanio-backend.log 2>&1</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/titanio-backend.log</string>
</dict>
</plist>
PLIST

launchctl load ~/Library/LaunchAgents/com.titanio.dashboard.plist
echo "Auto-start configurado!"
REMOTE

echo ""
echo "✅ Deploy concluído em $TARGET_IP!"
echo "   Backend: http://$TARGET_IP:$TARGET_PORT"
echo "   Para verificar: ssh $TARGET_USER@$TARGET_IP 'curl -s http://localhost:$TARGET_PORT/health'"
