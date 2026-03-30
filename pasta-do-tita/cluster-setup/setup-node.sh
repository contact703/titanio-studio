#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 🔗 OpenClaw Node Setup — Conecta este Mac ao cluster do Eduardo
# ═══════════════════════════════════════════════════════════════
# 
# COMO USAR:
# 1. Copie este script pro Mac do Helber ou Tiago
# 2. Rode: bash setup-node.sh
# 3. Eduardo aprova o node no gateway
# 4. Pronto! O Mac agora faz parte do cluster.
#
# ═══════════════════════════════════════════════════════════════

set -e

GATEWAY_IP="192.168.18.174"
GATEWAY_PORT="18789"

echo "🔗 OpenClaw Node Setup"
echo "━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Detectar nome do Mac
MAC_NAME=$(scutil --get ComputerName 2>/dev/null || hostname)
echo "📍 Este Mac: $MAC_NAME"
echo "🎯 Gateway: $GATEWAY_IP:$GATEWAY_PORT"
echo ""

# Step 1: Verificar se Node.js está instalado
if ! command -v node &>/dev/null; then
    echo "❌ Node.js não encontrado. Instalando..."
    if command -v brew &>/dev/null; then
        brew install node
    else
        echo "Instale o Node.js: https://nodejs.org"
        exit 1
    fi
fi
echo "✅ Node.js: $(node --version)"

# Step 2: Instalar OpenClaw
if ! command -v openclaw &>/dev/null; then
    echo "📦 Instalando OpenClaw..."
    npm install -g openclaw
else
    echo "✅ OpenClaw já instalado"
fi
echo "   Versão: $(openclaw --version 2>/dev/null || echo 'desconhecida')"

# Step 3: Testar conectividade com o gateway
echo ""
echo "🔍 Testando conexão com gateway..."
if ping -c 1 -W 2 $GATEWAY_IP &>/dev/null; then
    echo "✅ Gateway acessível"
else
    echo "❌ Não consigo pingar $GATEWAY_IP — verifique se estão na mesma rede Wi-Fi"
    exit 1
fi

# Step 4: Pedir o token do gateway
echo ""
echo "🔑 Preciso do token do gateway."
echo "   Eduardo pode ver com: openclaw config get gateway.auth.token"
echo ""
read -p "Token do gateway: " GATEWAY_TOKEN

if [ -z "$GATEWAY_TOKEN" ]; then
    echo "❌ Token não pode ser vazio"
    exit 1
fi

# Step 5: Configurar e rodar o node
echo ""
echo "🚀 Conectando ao cluster..."
echo ""

export OPENCLAW_GATEWAY_TOKEN="$GATEWAY_TOKEN"

# Tentar instalar como serviço
echo "Instalando node como serviço permanente..."
openclaw node install \
    --host "$GATEWAY_IP" \
    --port "$GATEWAY_PORT" \
    --display-name "$MAC_NAME" 2>/dev/null || {
    echo ""
    echo "⚠️  Não consegui instalar como serviço. Rodando em foreground..."
    echo "   (Mantenha este terminal aberto)"
    echo ""
    openclaw node run \
        --host "$GATEWAY_IP" \
        --port "$GATEWAY_PORT" \
        --display-name "$MAC_NAME"
}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Node conectado! Agora peça pro Eduardo aprovar:"
echo "   Eduardo roda: openclaw devices list"
echo "   Depois: openclaw devices approve <requestId>"
echo "━━━━━━━━━━━━━━━━━━━━━"
