#!/bin/bash
# Script para subir pro GitHub - Só executar e pronto

cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard

# Verificar se gh está instalado e logado
if ! command -v gh &> /dev/null; then
    echo "Instalando GitHub CLI..."
    brew install gh
fi

# Login
gh auth login --web

# Criar repo e subir
git branch -M main
gh repo create titanio/dashboard --public --source=. --push --description "Dashboard inteligente para times de desenvolvimento" 

echo "✅ Feito! Repo em: https://github.com/titanio/dashboard"
