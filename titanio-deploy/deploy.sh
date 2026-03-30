#!/bin/bash
# ============================================================
# deploy.sh — Deploy Titanio Dashboard para Mac Minis
# Uso: ./deploy.sh [all | mac1 | mac2 | IP]
# ============================================================

set -e

# ── Configuração ─────────────────────────────────────────────
APP_NAME="titanio-dashboard"
APP_DIR="/Users/contacttitanio/apps/titanio-dashboard"
LOCAL_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
SSH_USER="contacttitanio"
SSH_KEY="$HOME/.ssh/id_ed25519"
NODE_VERSION="22"

# Lista de Macs alvo (adicionar conforme necessário)
declare -A MACS=(
  ["mac1"]="192.168.18.174"
  ["mac2"]="192.168.18.XXX"
  # ["mac3"]="192.168.18.YYY"
)

# ── Cores ─────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "${GREEN}[DEPLOY]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()     { echo -e "${RED}[ERR]${NC} $1"; exit 1; }
section() { echo -e "\n${BLUE}══════ $1 ══════${NC}"; }

# ── Funções ───────────────────────────────────────────────────

ssh_run() {
  local host=$1; shift
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no \
      -o ConnectTimeout=10 "$SSH_USER@$host" "$@"
}

deploy_to() {
  local name=$1
  local host=$2

  section "Deploying → $name ($host)"

  # 1. Verificar conectividade
  log "Verificando SSH..."
  ssh_run "$host" "echo 'SSH OK'" || err "Não foi possível conectar a $host"

  # 2. Criar diretório remoto
  log "Preparando diretório remoto..."
  ssh_run "$host" "mkdir -p $APP_DIR"

  # 3. rsync — sincronizar arquivos
  log "Sincronizando arquivos via rsync..."
  rsync -avz --progress \
    --exclude 'node_modules/' \
    --exclude '.next/' \
    --exclude '.git/' \
    --exclude '*.log' \
    --exclude '.env.local' \
    --delete \
    -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
    "$LOCAL_DIR/" \
    "$SSH_USER@$host:$APP_DIR/"

  # 4. Instalar dependências
  log "Instalando dependências..."
  ssh_run "$host" "cd $APP_DIR && npm ci --production 2>&1 | tail -5"

  # 5. Build Next.js
  log "Build Next.js..."
  ssh_run "$host" "cd $APP_DIR && npm run build 2>&1 | tail -10"

  # 6. Instalar plist de serviço
  log "Configurando launchd services..."
  install_launchd_backend "$host"
  install_launchd_frontend "$host"

  # 7. Restart serviços
  log "Reiniciando serviços..."
  ssh_run "$host" "
    launchctl unload ~/Library/LaunchAgents/com.titanio.backend.plist 2>/dev/null || true
    launchctl unload ~/Library/LaunchAgents/com.titanio.frontend.plist 2>/dev/null || true
    sleep 1
    launchctl load ~/Library/LaunchAgents/com.titanio.backend.plist
    launchctl load ~/Library/LaunchAgents/com.titanio.frontend.plist
  "

  # 8. Verificar saúde
  sleep 3
  check_health "$name" "$host"
}

install_launchd_backend() {
  local host=$1
  local node_path
  node_path=$(ssh_run "$host" "which node || echo /usr/local/bin/node")

  ssh_run "$host" "cat > ~/Library/LaunchAgents/com.titanio.backend.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.titanio.backend</string>
  <key>ProgramArguments</key>
  <array>
    <string>$node_path</string>
    <string>$APP_DIR/server.js</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$APP_DIR</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>NODE_ENV</key>
    <string>production</string>
    <key>PORT</key>
    <string>4444</string>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$APP_DIR/logs/backend.log</string>
  <key>StandardErrorPath</key>
  <string>$APP_DIR/logs/backend.error.log</string>
</dict>
</plist>
EOF
}

install_launchd_frontend() {
  local host=$1
  local node_path
  node_path=$(ssh_run "$host" "which node || echo /usr/local/bin/node")
  local npm_path
  npm_path=$(ssh_run "$host" "which npm || echo /usr/local/bin/npm")

  ssh_run "$host" "cat > ~/Library/LaunchAgents/com.titanio.frontend.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.titanio.frontend</string>
  <key>ProgramArguments</key>
  <array>
    <string>$npm_path</string>
    <string>run</string>
    <string>start</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$APP_DIR</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>NODE_ENV</key>
    <string>production</string>
    <key>PORT</key>
    <string>3000</string>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$APP_DIR/logs/frontend.log</string>
  <key>StandardErrorPath</key>
  <string>$APP_DIR/logs/frontend.error.log</string>
</dict>
</plist>
EOF
}

check_health() {
  local name=$1
  local host=$2

  echo ""
  log "Health check → $name ($host)"

  # Backend
  if ssh_run "$host" "curl -sf http://localhost:4444/health" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Backend  (4444)${NC} → UP"
  else
    echo -e "  ${RED}❌ Backend  (4444)${NC} → DOWN"
  fi

  # Frontend
  if ssh_run "$host" "curl -sf http://localhost:3000" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Frontend (3000)${NC} → UP"
  else
    echo -e "  ${RED}❌ Frontend (3000)${NC} → DOWN"
  fi

  # Processos Node
  local procs
  procs=$(ssh_run "$host" "pgrep -c node 2>/dev/null || echo 0")
  echo -e "  ℹ️  Processos Node: $procs"
}

# ── Main ──────────────────────────────────────────────────────

TARGET="${1:-all}"

case "$TARGET" in
  all)
    for name in "${!MACS[@]}"; do
      deploy_to "$name" "${MACS[$name]}"
    done
    ;;
  check)
    for name in "${!MACS[@]}"; do
      check_health "$name" "${MACS[$name]}"
    done
    ;;
  *)
    # Checar se é nome conhecido
    if [[ -n "${MACS[$TARGET]}" ]]; then
      deploy_to "$TARGET" "${MACS[$TARGET]}"
    # Checar se é IP direto
    elif [[ "$TARGET" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      deploy_to "custom" "$TARGET"
    else
      echo "Uso: $0 [all | check | mac1 | mac2 | IP]"
      echo "Macs configurados: ${!MACS[*]}"
      exit 1
    fi
    ;;
esac

log "🚀 Deploy concluído!"
