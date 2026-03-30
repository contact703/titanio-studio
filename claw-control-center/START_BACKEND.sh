#!/bin/bash
# Inicia o CCC Backend na porta 3001
# (porta 3000 já está ocupada pelo Next.js frontend)

BACKEND_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/claw-control-center/backend"

cd "$BACKEND_DIR"

echo "=== Claw Control Center Backend ==="
echo "Verificando dependências..."

if [ ! -d "node_modules" ]; then
  echo "Instalando dependências..."
  npm install
fi

if [ ! -d "data" ]; then
  mkdir -p data
  echo "Diretório data/ criado"
fi

echo "Iniciando backend na porta 3001..."
node server.js
