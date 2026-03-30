#!/bin/bash
# sync-memory.sh — sincroniza tita-memory com GitHub
# Chamado pelo N8n WF-003 a cada 6h

REPO_DIR="/workspace/tita-memory"
REPO_URL="https://github.com/contact703/tita-memory.git"
MEMORY_SRC="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"

# Clone se não existir
if [ ! -d "$REPO_DIR/.git" ]; then
  echo "Clonando repositório..."
  git clone "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"

# Copiar arquivos de memória
cp "$MEMORY_SRC/MEMORY.md" . 2>/dev/null || true
cp "$MEMORY_SRC/contexto-ativo.md" . 2>/dev/null || true

TODAY=$(date +%Y-%m-%d)
mkdir -p memory
cp "$MEMORY_SRC/memory/${TODAY}.md" "memory/${TODAY}.md" 2>/dev/null || true

# Git sync
git add -A
DIFF=$(git diff --cached --stat)

if [ -z "$DIFF" ]; then
  echo "Already up to date — nenhuma mudança."
  exit 0
fi

git commit -m "chore: sync $(date '+%Y-%m-%d %H:%M') [auto]"
git push origin main 2>&1

echo "Synced:"
echo "$DIFF"
