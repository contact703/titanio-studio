#!/bin/bash
# Script: Import ENEM Workflows em N8n e executar

set -e

N8N_URL="http://localhost:5678"
WORKFLOWS_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/n8n-workflows"
OUTPUT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/enem-game-generation/outputs"

echo "🚀 ENEM Game - N8n Workflow Import & Execution"
echo "=============================================="
echo ""

# Verificar N8n rodando
echo "🔍 Verificando N8n..."
if ! curl -s "$N8N_URL/api/v1/workflows" > /dev/null 2>&1; then
    echo "❌ N8n não tá respondendo em $N8N_URL"
    echo "Inicie com: n8n start"
    exit 1
fi
echo "✅ N8n rodando"
echo ""

# Workflows a importar
WORKFLOWS=(
    "game-designer-workflow-LOCAL.json"
    "content-creator-workflow-LOCAL.json"
    "code-generator-workflow-LOCAL.json"
    "qa-tester-workflow-LOCAL.json"
)

echo "📋 Workflows prontos para importar:"
for wf in "${WORKFLOWS[@]}"; do
    echo "  • $wf"
done
echo ""

echo "📝 Próximos passos (MANUAL em N8n):"
echo ""
echo "1. Abra: $N8N_URL"
echo "2. Para cada workflow:"
echo "   a. Menu → Workflows → Import from file"
echo "   b. Selecione: $WORKFLOWS_DIR/[FILENAME]"
echo "   c. Click: Import → Activate"
echo "   d. Click: Execute Workflow"
echo ""
echo "3. Verifique outputs:"
echo "   ls -lh $OUTPUT_DIR/"
echo ""
echo "⚠️ Este é um processo manual por enquanto."
echo "Se quiser automatizar, crie um API key em N8n Settings"
echo ""

# Abrir browser
echo "🌐 Abrindo N8n no browser..."
open -a Safari "$N8N_URL/workflows"

echo ""
echo "✅ Safari aberto. Complete os passos acima."
