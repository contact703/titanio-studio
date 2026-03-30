#!/bin/bash
# ============================================================
# install-node.sh — Instala OpenClaw Node em Macs remotos
# Uso: ./install-node.sh [all | mac1 | IP]
# ============================================================

set -e

# ── Configuração ─────────────────────────────────────────────
GATEWAY_HOST="192.168.18.174"    # IP do Mac Mini principal (gateway)
GATEWAY_PORT="18789"
SSH_USER="contacttitanio"
SSH_KEY="$HOME/.ssh/id_ed25519"
OPENCLAW_VERSION="latest"        # ou ex: "2026.3.11"

declare -A NODES=(
  ["node-01"]="192.168.18.175"
  ["node-02"]="192.168.18.176"
  # ["node-03"]="192.168.18.177"
)

# ── Cores ─────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
log()     { echo -e "${GREEN}[NODE]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()     { echo -e "${RED}[ERR]${NC} $1"; exit 1; }
section() { echo -e "\n${BLUE}══════ $1 ══════${NC}"; }

ssh_run() {
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no \
      -o ConnectTimeout=10 "$SSH_USER@$1" "$2"
}

install_node() {
  local name=$1
  local host=$2

  section "Instalando node: $name ($host)"

  # 1. Verificar SSH
  ssh_run "$host" "echo 'SSH OK'" || err "SSH falhou para $host"

  # 2. Checar Node.js
  log "Verificando Node.js..."
  local node_ver
  node_ver=$(ssh_run "$host" "node --version 2>/dev/null || echo 'NOT FOUND'")
  if [[ "$node_ver" == "NOT FOUND" ]]; then
    warn "Node.js não encontrado — instalando via Homebrew..."
    ssh_run "$host" "/bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\" && brew install node"
  else
    log "Node.js encontrado: $node_ver"
  fi

  # 3. Instalar OpenClaw CLI
  log "Instalando OpenClaw CLI..."
  ssh_run "$host" "
    if command -v openclaw &>/dev/null; then
      echo 'OpenClaw já instalado: '$(openclaw --version 2>/dev/null)
    else
      npm install -g openclaw@$OPENCLAW_VERSION
      echo 'OpenClaw instalado: '$(openclaw --version)
    fi
  "

  # 4. Instalar como serviço launchd com --install
  log "Registrando como node service (launchd)..."
  ssh_run "$host" "
    openclaw node install \
      --host $GATEWAY_HOST \
      --port $GATEWAY_PORT \
      --display-name '$name' \
      --force
  "

  # 5. Iniciar serviço
  log "Iniciando serviço..."
  ssh_run "$host" "openclaw node restart"

  # 6. Verificar status
  sleep 3
  check_node "$name" "$host"
}

check_node() {
  local name=$1
  local host=$2

  local status
  status=$(ssh_run "$host" "openclaw node status 2>/dev/null || echo 'ERROR'")
  echo -e "  Status: $status"

  # Verificar se está conectado ao gateway
  if ssh_run "$host" "openclaw node status 2>/dev/null | grep -qi 'connected\|running\|active'"; then
    echo -e "  ${GREEN}✅ $name → conectado ao gateway $GATEWAY_HOST:$GATEWAY_PORT${NC}"
  else
    echo -e "  ${YELLOW}⚠️  $name → verificar manualmente${NC}"
    echo -e "  Rodar: ssh $SSH_USER@$host 'openclaw node status'"
  fi
}

# ── Main ──────────────────────────────────────────────────────
TARGET="${1:-all}"

case "$TARGET" in
  all)
    for name in "${!NODES[@]}"; do
      install_node "$name" "${NODES[$name]}"
    done
    ;;
  check)
    for name in "${!NODES[@]}"; do
      section "Status: $name"
      check_node "$name" "${NODES[$name]}"
    done
    ;;
  *)
    if [[ -n "${NODES[$TARGET]}" ]]; then
      install_node "$TARGET" "${NODES[$TARGET]}"
    elif [[ "$TARGET" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      install_node "node-custom" "$TARGET"
    else
      echo "Uso: $0 [all | check | node-01 | node-02 | IP]"
      exit 1
    fi
    ;;
esac

log "✅ Instalação concluída!"
log "Aprovar nodes em: openclaw approvals list"
