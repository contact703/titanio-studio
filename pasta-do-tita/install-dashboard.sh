#!/bin/bash
# 🚀 INSTALADOR AUTOMÁTICO — Titanio Dashboard
# Uso: bash install-dashboard.sh

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 TITANIO DASHBOARD — INSTALADOR AUTOMÁTICO              ║"
echo "║  Versão: 2.0 | Data: 2026-03-22                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 1. VERIFICAR PRÉ-REQUISITOS
echo "1️⃣ Verificando pré-requisitos..."

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ $1 não está instalado"
        echo "   Instale com: brew install $1"
        exit 1
    fi
    echo "   ✅ $1 ok"
}

check_command node
check_command npm
check_command git

# 2. CLONAR REPOSITÓRIO
echo ""
echo "2️⃣ Clonando repositório..."

REPO_URL="https://github.com/contact703/titanio-dashboard.git"
INSTALL_DIR="${HOME}/titanio-dashboard"

if [ -d "$INSTALL_DIR" ]; then
    echo "   ⚠️ Diretório já existe: $INSTALL_DIR"
    read -p "   Atualizar repositório? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$INSTALL_DIR"
        git pull origin main
    else
        echo "   Saindo..."
        exit 0
    fi
else
    git clone "$REPO_URL" "$INSTALL_DIR"
    echo "   ✅ Repositório clonado"
fi

cd "$INSTALL_DIR"

# 3. INSTALAR DEPENDÊNCIAS
echo ""
echo "3️⃣ Instalando dependências..."

cd code/backend
npm install --legacy-peer-deps > /dev/null 2>&1
echo "   ✅ Backend dependências ok"

cd ../frontend
npm install --legacy-peer-deps > /dev/null 2>&1
echo "   ✅ Frontend dependências ok"

cd ../..

# 4. CONFIGURAR .env
echo ""
echo "4️⃣ Configurando variáveis de ambiente..."

if [ ! -f "code/backend/.env" ]; then
    cp code/backend/.env.example code/backend/.env
    echo "   ✅ .env criado (preencher credenciais manualmente)"
else
    echo "   ✅ .env já existe"
fi

# 5. COPIAR ESPECIALISTAS
echo ""
echo "5️⃣ Copiando especialistas compartilhados..."

if [ -d "memoria-especialistas" ]; then
    echo "   ✅ Especialistas já existem"
else
    echo "   ⚠️ Especialistas não encontrados"
    echo "   (Eles serão sincronizados automaticamente na primeira execução)"
fi

# 6. BUILD
echo ""
echo "6️⃣ Compilando backend..."

cd code/backend
npm run build > /dev/null 2>&1
echo "   ✅ Build ok"

cd ../..

# 7. CRIAR SCRIPTS DE INICIALIZAÇÃO
echo ""
echo "7️⃣ Criando scripts de inicialização..."

cat > start-backend.sh << 'SCRIPT'
#!/bin/bash
cd "$(dirname "$0")/code/backend"
npm start
SCRIPT

cat > start-frontend.sh << 'SCRIPT'
#!/bin/bash
cd "$(dirname "$0")/code/frontend"
npm run dev
SCRIPT

chmod +x start-backend.sh start-frontend.sh
echo "   ✅ Scripts criados"

# 8. VERIFICAÇÃO FINAL
echo ""
echo "8️⃣ Verificando integridade..."

if [ -f "code/backend/.env" ] && [ -f "code/frontend/.env.local" ] || [ -f "code/frontend/.env.example" ]; then
    echo "   ✅ Configuração ok"
else
    echo "   ⚠️ Configuração pode precisar de ajustes"
fi

if [ -d "code/backend/dist" ]; then
    echo "   ✅ Build ok"
else
    echo "   ❌ Build falhou"
fi

# 9. INSTRUÇÕES FINAIS
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ INSTALAÇÃO CONCLUÍDA                                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣ Configurar credenciais:"
echo "   nano code/backend/.env"
echo "   (Preencher: ANTHROPIC_API_KEY, KIMI_API_KEY, etc.)"
echo ""
echo "2️⃣ Iniciar Backend (Terminal 1):"
echo "   ./start-backend.sh"
echo ""
echo "3️⃣ Iniciar Frontend (Terminal 2):"
echo "   ./start-frontend.sh"
echo ""
echo "4️⃣ Iniciar N8n (Terminal 3):"
echo "   docker run -it --rm -p 5678:5678 n8nio/n8n"
echo ""
echo "5️⃣ Acessar:"
echo "   Dashboard: http://localhost:3000"
echo "   Backend:   http://localhost:4444/api/health"
echo "   N8n:       http://localhost:5678"
echo ""
echo "6️⃣ Validar:"
echo "   curl http://localhost:4444/api/health"
echo ""
echo "📖 Documentação: ./DEPLOYMENT-MANUAL.md"
echo "💬 Suporte: @tita ou @contact"
echo ""

