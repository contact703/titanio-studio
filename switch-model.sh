#!/bin/bash
# SWITCH-MODEL - Alterna entre Opus (oficial) e Kimi (backup)
# Uso: bash switch-model.sh [opus|kimi]

MODEL_ESCOLHA=${1:-kimi}  # default: kimi se não especificar

if [ "$MODEL_ESCOLHA" = "opus" ]; then
    echo "🎯 Mudando para Opus (modelo oficial)..."
    openclaw config set agents.defaults.model.primary "anthropic/claude-opus-4-6"
    openclaw agent --reset  # limpa override de sessão
    echo "✅ Pronto! Modelo oficial: Opus"
elif [ "$MODEL_ESCOLHA" = "kimi" ]; then
    echo "🚀 Mudando para Kimi (backup temporário)..."
    openclaw config set agents.defaults.model.primary "moonshot/kimi-k2-turbo-preview"
    openclaw agent --reset  # limpa override de sessão
    echo "✅ Pronto! Modelo backup: Kimi"
else
    echo "Uso: bash switch-model.sh [opus|kimi]"
    echo "  opus  - Modelo oficial (quando Opus estiver estável)"
    echo "  kimi  - Modelo backup (atual)"
    exit 1
fi

echo ""
echo "=== Status Atual ==="
echo "Modelo global: $(openclaw config get agents.defaults.model.primary 2>/dev/null || echo 'desconhecido')"
echo "TUI mostra: $(openclaw status 2>&1 | grep -o 'kimi-[^ ]*\|claude-[^ ]*' | head -1)"