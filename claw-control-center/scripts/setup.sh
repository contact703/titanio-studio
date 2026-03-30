#!/bin/bash
# Setup script para Claw Control Center

set -e

echo "🎛️ Claw Control Center - Setup"
echo "================================"

# Detecta o diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CCC_DIR="$(dirname "$SCRIPT_DIR")"
cd "$CCC_DIR"

# Verifica Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install node
    else
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
fi

echo "✅ Node.js: $(node --version)"

# Instala dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install

# Cria diretório de dados
mkdir -p data

# Volta para o root
cd ..

# Instala dependências do frontend (opcional - para dev)
if [ "$1" = "--with-frontend" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend
    npm install
    cd ..
fi

# Cria o arquivo de configuração
NODE_NAME=$(hostname -s)
CONFIG_FILE="$CCC_DIR/backend/.env"

cat > "$CONFIG_FILE" << EOF
# Claw Control Center - Config
CCC_PORT=3000
CCC_NODE_NAME=$NODE_NAME
OPENCLAW_GATEWAY=ws://127.0.0.1:18789
OPENCLAW_API=http://127.0.0.1:18789
FEDERATION_NODES=[]
OPENCLAW_WORKSPACE=$HOME/.openclaw/workspace
CCC_DATA_DIR=./data
EOF

echo "✅ Configuração criada em: $CONFIG_FILE"

# Cria script de start
START_SCRIPT="$CCC_DIR/start.sh"
cat > "$START_SCRIPT" << 'EOF'
#!/bin/bash
# Start Claw Control Center

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

echo "🚀 Iniciando Claw Control Center..."
echo "Node: $(hostname -s)"
echo "Porta: ${CCC_PORT:-3000}"
echo ""

# Verifica se o OpenClaw está rodando
if curl -s http://127.0.0.1:18789/api/health > /dev/null 2>&1; then
    echo "✅ OpenClaw gateway detectado"
else
    echo "⚠️  OpenClaw gateway não detectado em :18789"
    echo "   O CCC funcionará em modo standalone"
fi

echo ""
node server.js
EOF

chmod +x "$START_SCRIPT"

echo ""
echo "✅ Setup completo!"
echo ""
echo "Para iniciar o Control Center:"
echo "  cd $CCC_DIR"
echo "  ./start.sh"
echo ""
echo "Dashboard será disponibilizado em: http://localhost:3000"
echo ""

# Pergunta se quer adicionar nós da federação
echo "Deseja configurar a federação agora? (s/n)"
read -r resposta
if [ "$resposta" = "s" ]; then
    echo ""
    echo "Digite os nós da federação (formato: host:porta, separados por vírgula)"
    echo "Exemplo: 192.168.18.170:3000,192.168.18.147:3000"
    read -r nodes
    
    # Atualiza .env
    sed -i.bak "s|FEDERATION_NODES=\[\]|FEDERATION_NODES=[$nodes]|g" "$CONFIG_FILE"
    echo "✅ Nós adicionados à configuração"
fi
