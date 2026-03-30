#!/bin/bash
###############################################################################
# 🚀 TITANIO DASHBOARD - INSTALLER FROM GOOGLE DRIVE
# Um comando: baixa, descompacta e instala tudo!
#
# Uso (quando estiver no Drive):
#   curl -fsSL "https://drive.google.com/uc?export=download&id=SEU_ID" | bash
#   OU
#   bash <(curl -fsSL "URL_DO_SCRIPT")
###############################################################################

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

INSTALL_DIR="${HOME}/titanio-dashboard"
TEMP_DIR="/tmp/titanio-install-$$"

echo -e "${CYAN}"
cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║              🚀 TITANIO DASHBOARD INSTALLER                   ║
║                   (Google Drive Edition)                      ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Funções
print_step() { echo -e "${BLUE}[*]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_info() { echo -e "${YELLOW}[i]${NC} $1"; }

# Detecta usuário
detect_user() {
    local user=$(whoami | tr '[:upper:]' '[:lower:]')
    local hostname=$(hostname -s | tr '[:upper:]' '[:lower:]')
    
    if [[ "$user" == *"tiago"* ]] || [[ "$hostname" == *"tiago"* ]]; then
        echo "tiago"
    elif [[ "$user" == *"helber"* ]] || [[ "$hostname" == *"helber"* ]]; then
        echo "helber"
    else
        echo "$user"
    fi
}

# Detecta IP
detect_ip() {
    ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -1
}

# MAIN
main() {
    # Verifica se foi baixado o ZIP ou precisa baixar
    if [ -f "titanio-dashboard.zip" ]; then
        print_step "Usando arquivo local..."
        ZIP_FILE="titanio-dashboard.zip"
    else
        print_error "Arquivo titanio-dashboard.zip não encontrado!"
        print_info "Baixe do Google Drive primeiro"
        exit 1
    fi
    
    # Criar diretório temporário
    mkdir -p "$TEMP_DIR"
    
    # Descompactar
    print_step "Descompactando..."
    unzip -q "$ZIP_FILE" -d "$TEMP_DIR"
    
    # Encontrar pasta extraída
    EXTRACTED_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d -name "titanio-dashboard*" | head -1)
    
    if [ -z "$EXTRACTED_DIR" ]; then
        print_error "Pasta não encontrada no ZIP"
        exit 1
    fi
    
    # Mover para destino final
    print_step "Instalando em $INSTALL_DIR..."
    rm -rf "$INSTALL_DIR" 2>/dev/null || true
    mv "$EXTRACTED_DIR" "$INSTALL_DIR"
    
    # Limpar temp
    rm -rf "$TEMP_DIR"
    
    # Detectar configurações
    DETECTED_USER=$(detect_user)
    DETECTED_IP=$(detect_ip)
    
    print_success "Arquivos instalados"
    print_info "Usuário detectado: $DETECTED_USER"
    print_info "IP detectado: $DETECTED_IP"
    
    # Instalar dependências
    print_step "Instalando dependências..."
    cd "$INSTALL_DIR/code/backend"
    npm install 2>&1 | grep -v "deprecated" || true
    
    cd "$INSTALL_DIR/code/frontend"
    npm install 2>&1 | grep -v "deprecated" || true
    
    # Configurar ambiente
    print_step "Configurando..."
    cd "$INSTALL_DIR/code/backend"
    
    cat > ".env" << EOF
PORT=4444
NODE_ENV=production
DEFAULT_USER=$DETECTED_USER
MACHINE_IP=$DETECTED_IP
MACHINE_ID=claw-$DETECTED_USER
OPENCLAW_WORKSPACE=${HOME}/.openclaw/workspace
CLUSTER_ENABLED=true
CLUSTER_NODE_ID=claw-$DETECTED_USER
JWT_SECRET=$(date +%s | sha256sum | base64 | head -c 32)
EOF
    
    # Criar script de start
    cat > "$INSTALL_DIR/start.sh" << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Iniciando Titanio Dashboard..."
echo ""
cd code/backend && PORT=4444 npm run dev &
BACKEND_PID=$!
cd ../frontend && npm run dev &
FRONTEND_PID=$!
echo "✅ Dashboard rodando!"
echo "   Interface: http://localhost:3000"
echo "   API: http://localhost:4444"
echo ""
echo "Pressione Ctrl+C para parar"
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
EOF
    chmod +x "$INSTALL_DIR/start.sh"
    
    # Criar atalho na área de trabalho (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        DESKTOP="${HOME}/Desktop"
        cat > "$DESKTOP/Titanio Dashboard.command" << EOF
#!/bin/bash
cd "$INSTALL_DIR"
./start.sh
EOF
        chmod +x "$DESKTOP/Titanio Dashboard.command"
        print_success "Atalho criado na área de trabalho"
    fi
    
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
    echo "🌐 Ou clique duas vezes em 'Titanio Dashboard.command' na área de trabalho"
    echo ""
    echo "Acesse: http://localhost:3000"
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
