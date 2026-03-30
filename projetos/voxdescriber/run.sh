#!/bin/bash
# VoxDescriber — Script de execução
# Instala dependências e abre a interface gráfica

set -e
cd "$(dirname "$0")"

echo "🎬 VoxDescriber — Titanio Films"
echo "================================"

# Verificar Python 3
if ! command -v python3 &>/dev/null; then
    echo "❌ Python 3 não encontrado. Instale via https://python.org"
    exit 1
fi

# Instalar dependências silenciosamente
echo "📦 Verificando dependências..."
pip3 install PySide6 Pillow --quiet --break-system-packages 2>/dev/null || \
pip3 install PySide6 Pillow --quiet 2>/dev/null || true

# Verificar ffmpeg
if ! command -v ffmpeg &>/dev/null; then
    echo "⚠️  ffmpeg não encontrado — instale com: brew install ffmpeg"
fi

# Gerar ícone se não existir
if [ ! -f "voxdescriber-icon.png" ]; then
    echo "🎨 Gerando ícone..."
    python3 icon.py 2>/dev/null || true
fi

echo "🚀 Abrindo VoxDescriber..."
python3 app.py "$@"
