#!/bin/bash
###############################################################################
# 🚀 TITANIO DASHBOARD - ZERO-CONFIG INSTALLER
# Instalação totalmente automática - Um comando, zero perguntas!
# 
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/titanio/dashboard/main/install.sh | bash
###############################################################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Config
REPO_URL="https://github.com/titanio/dashboard.git"
INSTALL_DIR="${HOME}/titanio-dashboard"

# Detecta automaticamente
DETECTED_USER=""
DETECTED_IP=""
DETECTED_OPENCLAW=""

print_step() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# ==================== AUTO-DETECÇÃO ====================

# Detecta IP da máquina na rede local
detect_ip() {
    local ip=""
    
    # macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # Pega IP da interface WiFi ou Ethernet
        ip=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1)
    else
        # Linux
        ip=$(ip addr | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1 | head -1)
    fi
    
    # Se não encontrou, tenta hostname
    if [ -z "$ip" ]; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    
    echo "$ip"
}

# Detecta usuário baseado no nome do sistema
detect_user() {
    local user=$(whoami)
    local hostname=$(hostname -s | tr '[:upper:]' '[:lower:]')
    local fullname=$(id -F 2>/dev/null | tr '[:upper:]' '[:lower:]' || echo "")
    
    # Verifica se contém tiago
    if [[ "$user" == *"tiago"* ]] || [[ "$hostname" == *"tiago"* ]] || [[ "$fullname" == *"tiago"* ]]; then
        echo "tiago"
        return
    fi
    
    # Verifica se contém helber
    if [[ "$user" == *"helber"* ]] || [[ "$hostname" == *"helber"* ]] || [[ "$fullname" == *"helber"* ]]; then
        echo "helber"
        return
    fi
    
    # Verifica se contém eduardo/zica
    if [[ "$user" == *"eduardo"* ]] || [[ "$user" == *"zica"* ]] || [[ "$hostname" == *"eduardo"* ]] || [[ "$fullname" == *"eduardo"* ]]; then
        echo "zica"
        return
    fi
    
    # Default: usa nome do usuário do sistema
    echo "$user"
}

# Busca configuração do OpenClaw
detect_openclaw() {
    local config_paths=(
        "${HOME}/.openclaw/config.json"
        "${HOME}/.openclaw/workspace/AGENTS.md"
        "${HOME}/.config/openclaw/config.json"
        "/opt/openclaw/config.json"
    )
    
    for path in "${config_paths[@]}"; do
        if [ -f "$path" ]; then
            echo "$path"
            return
        fi
    done
    
    # Tenta encontrar workspace
    if [ -d "${HOME}/.openclaw/workspace" ]; then
        echo "${HOME}/.openclaw"
        return
    fi
    
    echo ""
}

# Extrai informações do OpenClaw
extract_openclaw_info() {
    local openclaw_path="$1"
    local info=""
    
    if [ -f "$openclaw_path/config.json" ]; then
        info=$(cat "$openclaw_path/config.json" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(f\"user:{d.get('user','unknown')}\")
    print(f\"workspace:{d.get('workspace','')}\")
except:
    pass
" 2>/dev/null)
    fi
    
    echo "$info"
}

# ==================== INSTALAÇÃO ====================

detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    else
        echo "linux"
    fi
}

check_dependencies() {
    print_step "Verificando dependências..."
    
    local os=$(detect_os)
    
    # Git
    if ! command -v git &> /dev/null; then
        print_info "Instalando Git..."
        if [ "$os" = "macos" ]; then
            xcode-select --install 2>/dev/null || true
        else
            sudo apt-get update && sudo apt-get install -y git
        fi
    fi
    
    # Node.js
    if ! command -v node &> /dev/null; then
        print_info "Instalando Node.js..."
        if [ "$os" = "macos" ]; then
            curl -fsSL https://nodejs.org/dist/v20.11.0/node-v20.11.0.pkg -o /tmp/node.pkg
            sudo installer -pkg /tmp/node.pkg -target /
        else
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
    fi
    
    print_success "Dependências OK"
}

clone_repo() {
    print_step "Baixando Dashboard..."
    
    if [ -d "$INSTALL_DIR" ]; then
        cd "$INSTALL_DIR"
        git pull origin main
    else
        git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
        cd "$INSTALL_DIR"
    fi
    
    print_success "Dashboard baixado"
}

install_deps() {
    print_step "Instalando dependências..."
    
    cd "$INSTALL_DIR/code/backend"
    npm install 2>&1 | grep -v "deprecated" || true
    
    cd "$INSTALL_DIR/code/frontend"
    npm install 2>&1 | grep -v "deprecated" || true
    
    print_success "Dependências instaladas"
}

setup_structure() {
    print_step "Criando estrutura..."
    
    # Squad
    for specialist in code-ninja design-wizard debug-hunter devops-ninja aso-specialist growth-hacker api-master security-guard ui-ux-architect system-design-guru; do
        mkdir -p "squad/$specialist"/{memory,repos,skills,tasks}
    done
    
    # Pastas de trabalho
    mkdir -p media/{incoming,processed}
    mkdir -p .data/{users,projects,bots}
    mkdir -p .sync
    
    print_success "Estrutura criada"
}

setup_environment() {
    print_step "Configurando ambiente..."
    
    cd "$INSTALL_DIR/code/backend"
    
    # Gera secret
    local jwt_secret=$(openssl rand -base64 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
    
    # Configura OpenClaw se encontrou
    local openclaw_workspace="${HOME}/.openclaw/workspace"
    if [ -n "$DETECTED_OPENCLAW" ]; then
        if [ -d "$DETECTED_OPENCLAW/workspace" ]; then
            openclaw_workspace="$DETECTED_OPENCLAW/workspace"
        elif [ -d "$DETECTED_OPENCLAW" ]; then
            openclaw_workspace="$DETECTED_OPENCLAW"
        fi
    fi
    
    cat > ".env" << EOF
# Titanio Dashboard - Auto-config
PORT=4444
NODE_ENV=production

# User (auto-detected)
DEFAULT_USER=$DETECTED_USER
MACHINE_IP=$DETECTED_IP
MACHINE_ID=claw-$DETECTED_USER

# OpenClaw (auto-detected)
OPENCLAW_WORKSPACE=$openclaw_workspace

# Cluster
CLUSTER_ENABLED=true
CLUSTER_NODE_ID=claw-$DETECTED_USER

# Security
JWT_SECRET=$jwt_secret
ADMIN_SEED=real
EOF
    
    print_success "Ambiente configurado"
    print_info "Usuário: $DETECTED_USER"
    print_info "IP: $DETECTED_IP"
    print_info "OpenClaw: $openclaw_workspace"
}

setup_cluster() {
    print_step "Configurando cluster..."
    
    cd "$INSTALL_DIR"
    
    cat > ".sync/cluster-config.json" << EOF
{
  "version": "1.0.0",
  "clusterName": "Titanio Cluster",
  "autoFailover": true,
  "loadBalancing": true,
  "thisNode": {
    "id": "claw-$DETECTED_USER",
    "name": "$DETECTED_USER Mac",
    "host": "$DETECTED_IP",
    "port": 4444,
    "userName": "$DETECTED_USER"
  },
  "knownNodes": [
    {
      "id": "claw-zica",
      "name": "Zica Mac Mini",
      "host": "192.168.1.100",
      "port": 4444,
      "userName": "Zica"
    }
  ]
}
EOF
    
    print_success "Cluster configurado"
}

create_scripts() {
    print_step "Criando scripts..."
    
    cd "$INSTALL_DIR"
    
    # Start
    cat > "start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Iniciando Titanio Dashboard..."
echo ""

# Backend
cd code/backend
PORT=4444 npm run dev &
BACKEND_PID=$!

# Frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Rodando!"
echo "   Interface: http://localhost:3000"
echo "   API: http://localhost:4444"
echo ""
echo "Para parar: kill $BACKEND_PID $FRONTEND_PID"
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
EOF
    chmod +x start.sh
    
    # Status
    cat > "status.sh" << 'EOF'
#!/bin/bash
curl -s http://localhost:4444/api/cluster 2>/dev/null | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(f'Nodes: {d.get(\"onlineNodes\", 0)}/{d.get(\"totalNodes\", 0)} online')
    print(f'RAM: {d.get(\"freeRamMB\", 0)}/{d.get(\"totalRamMB\", 0)} MB livre')
except:
    print('Dashboard não está rodando')
" 2>/dev/null || echo "Dashboard não está rodando"
EOF
    chmod +x status.sh
    
    # Quick start para desktop
    cat > "Titanio Dashboard.command" << EOF
#!/bin/bash
cd "$INSTALL_DIR"
./start.sh
EOF
    chmod +x "Titanio Dashboard.command"
    
    print_success "Scripts criados"
}

install_media_deps() {
    print_step "Instalando ffmpeg e Whisper..."
    
    local os=$(detect_os)
    
    if ! command -v ffmpeg &> /dev/null; then
        if [ "$os" = "macos" ]; then
            brew install ffmpeg 2>/dev/null || print_info "Instale manualmente: brew install ffmpeg"
        fi
    fi
    
    if ! command -v whisper &> /dev/null; then
        pip3 install -U openai-whisper 2>/dev/null || print_info "Instale manualmente: pip3 install openai-whisper"
    fi
    
    print_success "OK"
}

# ==================== MAIN ====================

main() {
    echo -e "${CYAN}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║              🚀 TITANIO DASHBOARD INSTALLER                   ║
║                   (Zero Config)                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Auto-detecção
    print_step "Detectando configurações..."
    DETECTED_USER=$(detect_user)
    DETECTED_IP=$(detect_ip)
    DETECTED_OPENCLAW=$(detect_openclaw)
    
    print_success "Detectado: $DETECTED_USER @ $DETECTED_IP"
    if [ -n "$DETECTED_OPENCLAW" ]; then
        print_success "OpenClaw encontrado: $DETECTED_OPENCLAW"
    else
        print_info "OpenClaw não detectado (instalação standalone)"
    fi
    
    # Instalação
    check_dependencies
    clone_repo
    install_deps
    setup_structure
    setup_environment
    setup_cluster
    create_scripts
    install_media_deps
    
    # Final
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           🎉 INSTALAÇÃO CONCLUÍDA!                            ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "👤 Usuário: $DETECTED_USER"
    echo "🌐 IP: $DETECTED_IP"
    echo "📂 Local: $INSTALL_DIR"
    echo ""
    echo "🚀 Para iniciar:"
    echo "   cd $INSTALL_DIR"
    echo "   ./start.sh"
    echo ""
    echo "🌐 Acesse: http://localhost:3000"
    echo ""
    echo "💡 Dica: Clique duas vezes em 'Titanio Dashboard.command' na pasta"
    echo ""
    
    # Pergunta se inicia
    read -t 5 -p "Iniciar agora? (s/n) " -n 1 -r || true
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        cd "$INSTALL_DIR"
        ./start.sh
    fi
}

main "$@"
