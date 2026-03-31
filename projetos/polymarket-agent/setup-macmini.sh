#!/bin/bash
# setup-macmini.sh - Configuração completa do Polymarket Bot no Mac Mini

set -e

echo "🎯 CONFIGURANDO POLYMARKET BOT NO MAC MINI"
echo "=========================================="
echo ""

SCRIPT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent"
LAUNCHD_PLIST="/Users/contacttitanio/Library/LaunchAgents/com.titanio.polymarket-bot.plist"

# 1. Verificar ambiente
echo "1️⃣ Verificando ambiente..."
if [ ! -d "$SCRIPT_DIR" ]; then
    echo "❌ Diretório do bot não encontrado: $SCRIPT_DIR"
    exit 1
fi

cd "$SCRIPT_DIR"

# 2. Verificar dependências
echo "2️⃣ Verificando dependências..."
if [ ! -d "venv" ]; then
    echo "⚠️ Ambiente virtual não encontrado. Criando..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt
echo "✅ Dependências instaladas"

# 3. Verificar credenciais
echo "3️⃣ Verificando credenciais..."
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado!"
    exit 1
fi

# Testar conexão com APIs
echo "🧪 Testando conexões..."
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()

# Testar Anthropic
try:
    from anthropic import Anthropic
    client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
    print('✅ Anthropic API OK')
except Exception as e:
    print(f'❌ Anthropic API: {e}')

# Testar Polymarket API
try:
    import httpx
    response = httpx.get('https://gamma-api.polymarket.com/markets', params={'limit': 1})
    if response.status_code == 200:
        print('✅ Polymarket Gamma API OK')
    else:
        print(f'⚠️ Polymarket API: Status {response.status_code}')
except Exception as e:
    print(f'❌ Polymarket API: {e}')
"

# 4. Configurar LaunchAgent
echo "4️⃣ Configurando LaunchAgent..."
if [ -f "$LAUNCHD_PLIST" ]; then
    launchctl unload "$LAUNCHD_PLIST" 2>/dev/null || true
fi

launchctl load "$LAUNCHD_PLIST"
echo "✅ LaunchAgent configurado"

# 5. Configurar cron para watchdog
echo "5️⃣ Configurando watchdog..."
WATCHDOG_ENTRY="*/5 * * * * /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/polymarket-watchdog.sh >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/data/watchdog.log 2>&1"

# Remover entradas antigas
crontab -l 2>/dev/null | grep -v "polymarket-watchdog" | crontab - 2>/dev/null || true
# Adicionar nova entrada
(crontab -l 2>/dev/null; echo "$WATCHDOG_ENTRY") | crontab -
echo "✅ Watchdog configurado (a cada 5 minutos)"

# 6. Criar aliases úteis
echo "6️⃣ Criando aliases..."
cat >> ~/.zshrc << 'EOF'

# Polymarket Bot Aliases
alias poly-start='cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent && bash start-monitor.sh start'
alias poly-stop='cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent && bash start-monitor.sh stop'
alias poly-status='cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent && bash start-monitor.sh status'
alias poly-logs='cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent && bash start-monitor.sh logs'
alias poly-dashboard='cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent && bash dashboard.sh'
alias poly-once='cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent && bash start-monitor.sh once'
EOF

echo "✅ Aliases criados"

# 7. Testar início
echo "7️⃣ Testando início do bot..."
bash start-monitor.sh start
sleep 3

if bash start-monitor.sh status | grep -q "rodando"; then
    echo "✅ Bot iniciado com sucesso!"
else
    echo "❌ Falha ao iniciar bot. Verifique os logs."
    exit 1
fi

# 8. Criar atalho no Desktop
echo "8️⃣ Criando atalhos..."
cat > ~/Desktop/Polymarket-Dashboard.command << 'EOF'
#!/bin/bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent
bash dashboard.sh
EOF
chmod +x ~/Desktop/Polymarket-Dashboard.command

cat > ~/Desktop/Polymarket-Status.command << 'EOF'
#!/bin/bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent
bash start-monitor.sh status
read -p "Pressione Enter para fechar..."
EOF
chmod +x ~/Desktop/Polymarket-Status.command

echo "✅ Atalhos criados no Desktop"

# 9. Informações finais
echo ""
echo "=========================================="
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "=========================================="
echo ""
echo "📋 RESUMO:"
echo "• Bot configurado para iniciar automaticamente"
echo "• Watchdog monitorando a cada 5 minutos"
echo "• Dashboard disponível via comando: poly-dashboard"
echo "• Logs em: $SCRIPT_DIR/data/"
echo ""
echo "🎯 COMANDOS ÚTEIS:"
echo "• poly-status  - Ver status do bot"
echo "• poly-logs    - Ver logs em tempo real"
echo "• poly-stop    - Parar o bot"
echo "• poly-start   - Iniciar o bot"
echo "• poly-once    - Executar scan único"
echo ""
echo "📊 Dashboard: Clique em 'Polymarket-Dashboard.command' no Desktop"
echo ""
echo "⚠️  IMPORTANTE:"
echo "• O bot está em DRY_RUN=true (modo seguro)"
echo "• Para operar de verdade: mude DRY_RUN=false no .env"
echo "• Monitore os logs regularmente"
echo ""
echo "🚀 O bot está rodando! Use 'poly-dashboard' para monitorar."