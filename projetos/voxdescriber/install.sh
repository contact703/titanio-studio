#!/bin/bash
echo "🎙️ Instalando VoxDescriber..."

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale em python.org"
    exit 1
fi

# Verificar ffmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "📦 Instalando ffmpeg..."
    if command -v brew &> /dev/null; then
        brew install ffmpeg
    else
        echo "❌ Homebrew não encontrado. Instale ffmpeg manualmente."
        exit 1
    fi
fi

# Instalar dependências Python
echo "📦 Instalando dependências..."
pip3 install PySide6 Pillow requests --quiet

# Instalar Piper TTS (opcional, melhor qualidade)
echo "📦 Baixando Piper TTS (voz PT-BR)..."
mkdir -p ~/.voxdescriber/piper
cd ~/.voxdescriber/piper

# macOS ARM64
if [[ $(uname -m) == 'arm64' ]]; then
    curl -sL "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_macos_aarch64.tar.gz" -o piper.tar.gz 2>/dev/null
else
    curl -sL "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_macos_x64.tar.gz" -o piper.tar.gz 2>/dev/null
fi

if [ -f piper.tar.gz ]; then
    tar xzf piper.tar.gz 2>/dev/null
    # Baixar voz PT-BR
    curl -sL "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx" -o pt_BR-faber-medium.onnx 2>/dev/null
    curl -sL "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx.json" -o pt_BR-faber-medium.onnx.json 2>/dev/null
    echo "✅ Piper TTS instalado"
else
    echo "ℹ️  Piper TTS não disponível — usando voz do sistema"
fi

# Instalar espeak-ng (necessário para Piper no macOS)
if command -v brew &> /dev/null; then
    brew install espeak-ng --quiet 2>/dev/null
fi

echo "✅ VoxDescriber instalado com sucesso!"
echo "🚀 Execute: python3 app.py"
