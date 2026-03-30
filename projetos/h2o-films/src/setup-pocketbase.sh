#!/bin/bash
# Setup PocketBase CRM para H2O Films
# PocketBase Admin UI: http://localhost:8090/_/

echo "🎬 H2O Films — PocketBase CRM Setup"
echo "====================================="

PB_URL="http://localhost:8090"

# Check if PocketBase is running
if ! curl -s "$PB_URL/api/health" | grep -q "healthy"; then
    echo "❌ PocketBase não está rodando. Inicie com:"
    echo "   cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/tools/pocketbase"
    echo "   ./pocketbase serve --http=0.0.0.0:8090 --dir=./pb_data"
    exit 1
fi

echo "✅ PocketBase rodando em $PB_URL"
echo ""
echo "📋 Para configurar o CRM:"
echo "1. Abra http://localhost:8090/_/"
echo "2. Crie conta admin (primeira vez)"
echo "3. As collections serão criadas automaticamente pela API"
echo ""
echo "🔗 URLs úteis:"
echo "   Admin: http://localhost:8090/_/"
echo "   API: http://localhost:8090/api/"
echo "   Health: http://localhost:8090/api/health"
