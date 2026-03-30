#!/bin/bash
# Script para publicar política de privacidade KidsHQ
# Uso: ./publish-privacy-policy.sh

echo "📄 Publicando Política de Privacidade KidsHQ..."
echo ""

# Verificar se tem acesso SSH ao servidor
read -p "Você tem acesso SSH ao servidor titaniofilms.com? (s/n): " HAS_SSH

if [ "$HAS_SSH" = "s" ] || [ "$HAS_SSH" = "S" ]; then
    echo ""
    echo "📤 Opções de publicação:"
    echo ""
    echo "1. Via SCP (SSH):"
    echo "   scp /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/kidshq-deploy/privacy-policy.html usuario@titaniofilms.com:/var/www/html/kids/"
    echo ""
    echo "2. Via FTP:"
    echo "   Use FileZilla ou similar para enviar o arquivo para:"
    echo "   /public_html/kids/privacy-policy.html"
    echo ""
    echo "3. Via painel de controle (cPanel/Plesk):"
    echo "   - Acesse o painel"
    echo "   - Gerenciador de arquivos"
    echo "   - Crie pasta 'kids' se não existir"
    echo "   - Faça upload de 'privacy-policy.html'"
    echo ""
else
    echo "❌ Sem acesso ao servidor"
    echo ""
    echo "📝 INSTRUÇÕES PARA PUBLICAÇÃO MANUAL:"
    echo ""
    echo "1. Acesse o painel de hospedagem (cPanel, Plesk, etc)"
    echo "2. Vá em 'Gerenciador de Arquivos'"
    echo "3. Crie a pasta: /public_html/kids/"
    echo "4. Faça upload do arquivo:"
    echo "   /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/kidshq-deploy/privacy-policy.html"
    echo "5. Renomeie para 'index.html' ou mantenha como 'privacy-policy.html'"
    echo "6. Acesse: https://titaniofilms.com/kids/privacy-policy"
    echo ""
fi

echo "📁 Arquivo local:"
echo "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/kidshq-deploy/privacy-policy.html"
echo ""
echo "🌐 URL final deve ser:"
echo "https://titaniofilms.com/kids/privacy-policy"
echo ""
echo "✅ Verificação após publicar:"
echo "curl -I https://titaniofilms.com/kids/privacy-policy"
