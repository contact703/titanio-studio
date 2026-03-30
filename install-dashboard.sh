#!/bin/bash

# ============================================
# Dashboard Titanio — Auto Installer
# Para Mac Minis dos colegas
# ============================================

set -e

echo "🚀 Dashboard Titanio — Instalador Automático"
echo "=============================================="
echo ""

# 1. Perguntar configurações
read -p "Qual é o seu nome/ID (ex: Contact, Tiago, Helber)? " MAC_ID
read -p "Qual porta pra backend? (padrão: 4444) " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-4444}

read -p "GitHub Token (pessoal, com acesso aos repos): " GITHUB_TOKEN
read -p "Workspace local (padrão: ~/openclaw/workspace) " WORKSPACE
WORKSPACE=${WORKSPACE:-~/openclaw/workspace}

echo ""
echo "📋 Confirmando:"
echo "  Nome/ID: $MAC_ID"
echo "  Backend port: $BACKEND_PORT"
echo "  Workspace: $WORKSPACE"
echo "  GitHub Token: ${GITHUB_TOKEN:0:10}..."

read -p "Tudo certo? (y/n) " CONFIRM
if [[ "$CONFIRM" != "y" ]]; then
  echo "Cancelado."
  exit 1
fi

# 2. Criar workspace
echo ""
echo "📁 Criando workspace..."
mkdir -p "$WORKSPACE"
cd "$WORKSPACE"

# 3. Clonar repositório
echo "📥 Clonando dashboard..."
if [ -d "titanio-dashboard" ]; then
  echo "  Dashboard já existe, pulando clone"
  cd titanio-dashboard
  git pull origin main
else
  git clone https://github.com/contact703/titanio-dashboard.git
  cd titanio-dashboard
fi

# 4. Instalar dependências
echo "📦 Instalando dependências..."
cd code/backend
npm install --silent

cd ../frontend
npm install --silent

cd ../..

# 5. Criar .env
echo "⚙️  Criando configuração..."
cat > code/backend/.env << EOF
PORT=$BACKEND_PORT
WORKSPACE=$WORKSPACE
GITHUB_TOKEN=$GITHUB_TOKEN
N8N_URL=http://localhost:5678
NODE_ENV=production
MAC_ID=$MAC_ID
EOF

echo "  ✅ .env criado"

# 6. Compilar backend
echo "🔨 Compilando backend..."
cd code/backend
npm run build

# 7. Sincronizar Squad
echo "🤖 Sincronizando especialistas compartilhados..."
cd "$WORKSPACE"
if [ -d "memoria-especialistas" ]; then
  cd memoria-especialistas
  git pull origin main
else
  git clone https://github.com/contact703/titanio-squad.git memoria-especialistas
fi

# 8. N8n (apenas instruções)
echo ""
echo "🔄 N8n — Próximas instruções:"
echo "  Opção 1 (recomendado): npm install -g n8n && n8n start"
echo "  Opção 2 (Docker): docker run -p 5678:5678 n8nio/n8n"
echo ""

# 9. Criar startup script
echo "📝 Criando startup script..."
cat > "$WORKSPACE/start-dashboard.sh" << 'STARTEOF'
#!/bin/bash

echo "🚀 Iniciando Dashboard Titanio..."
echo ""

# Terminal 1: Backend
echo "📊 Iniciando backend na porta 4444..."
cd "$(dirname "$0")/titanio-dashboard/code/backend"
npm start &
BACKEND_PID=$!
sleep 3

# Terminal 2: N8n
echo "🔄 Iniciando N8n na porta 5678..."
n8n start &
N8N_PID=$!
sleep 5

# Info
echo ""
echo "✅ Serviços iniciados!"
echo "  Backend: http://localhost:4444"
echo "  N8n: http://localhost:5678"
echo "  Health: curl http://localhost:4444/api/health"
echo ""
echo "PIDs: Backend=$BACKEND_PID, N8n=$N8N_PID"

# Aguardar
wait
STARTEOF

chmod +x "$WORKSPACE/start-dashboard.sh"
echo "  ✅ Script salvo: $WORKSPACE/start-dashboard.sh"

# 10. Final
echo ""
echo "=============================================="
echo "✅ Instalação concluída!"
echo ""
echo "Próximos passos:"
echo "  1. Instalar N8n: npm install -g n8n"
echo "  2. Iniciar serviços: bash $WORKSPACE/start-dashboard.sh"
echo "  3. Verificar health: curl http://localhost:4444/api/health"
echo "  4. Acessar dashboard: http://localhost:3000 (frontend, opcional)"
echo ""
echo "Documentação: $WORKSPACE/DEPLOYMENT.md"
echo ""
