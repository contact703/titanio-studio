#!/bin/bash
# Script de Deploy KidsHQ - Passo a passo manual

echo "🚀 KidsHQ - Script de Deploy"
echo "=============================="
echo ""

# Verificar se AAB existe
if [ ! -f "kidshq-hq-v5.aab" ]; then
    echo "❌ AAB não encontrado!"
    exit 1
fi

echo "✅ AAB encontrado: kidshq-hq-v5.aab ($(ls -lh kidshq-hq-v5.aab | awk '{print $5}'))"
echo ""

echo "📋 CHECKLIST DE DEPLOY:"
echo ""

echo "1. 🔧 BACKEND (Railway):"
echo "   - Acesse: https://railway.app/project/673fcb12-2ddb-49b5-bd48-855506a47af6"
echo "   - Vá na aba 'Deployments'"
echo "   - Clique em 'Redeploy' se necessário"
echo "   - Verifique variáveis de ambiente:"
echo "     - JWT_SECRET (deve ser seguro)"
echo "     - DATABASE_URL (PostgreSQL)"
echo "     - CORS origins"
echo ""

echo "2. 🌐 POLÍTICA DE PRIVACIDADE:"
echo "   - Arquivo: privacy-policy.html"
echo "   - Publicar em: https://titaniofilms.com/kids/privacy-policy"
echo "   - Métodos:"
echo "     a) SSH: scp privacy-policy.html usuario@titaniofilms.com:/var/www/html/kids/"
echo "     b) FTP: Upload via FileZilla para /public_html/kids/"
echo "     c) Painel: cPanel → Gerenciador de Arquivos"
echo ""

echo "3. 📱 PLAY STORE (KidsHQ HQ - App dos Pais):"
echo "   - Acesse: https://play.google.com/console"
echo "   - App: KidsHQ (ID: 4972983290233964590)"
echo "   - Vá em 'Production' → 'Create release'"
echo "   - Upload: kidshq-hq-v5.aab"
echo "   - Release notes: 'Bug fix: corrected name display in welcome screen'"
echo ""

echo "4. 📱 PLAY STORE (KidsHQ Kids - App das Crianças):"
echo "   - Acesse: https://play.google.com/console"
echo "   - App: KidsHQ Kids (ID: 4975253365929803196)"
echo "   - Se ainda não publicou, complete o store listing primeiro"
echo "   - Upload: kidshq-kids-release.aab (de /tmp/openclaw/uploads/)"
echo ""

echo "5. ✅ TESTES FINAIS:"
echo "   - Criar conta pai"
echo "   - Adicionar filho"
echo "   - Vincular dispositivo"
echo "   - Verificar tempo de tela"
echo "   - Testar localização"
echo ""

echo "📁 Arquivos nesta pasta:"
ls -lh
echo ""

echo "🔍 Verificações:"
echo "- Backend health: curl https://api-production-adc6.up.railway.app/health"
echo "- Política: curl -I https://titaniofilms.com/kids/privacy-policy"
echo ""
