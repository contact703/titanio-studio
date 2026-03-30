#!/bin/bash
# CONSOLIDAÇÃO: Roda todo dia 23:59 BRT

MEMORY_FILE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/MEMORY.md"
STATUS_FILE="/tmp/memory-status.json"

echo "🔄 Consolidando memória..."

# Remover linhas em branco duplicadas
sed -i '/^$/N;/^\n$/!P;D' "$MEMORY_FILE"

# Atualizar timestamp
sed -i "s/last_consolidation.*/last_consolidation: $(date -u '+%Y-%m-%dT%H:%M:%SZ')/g" "$MEMORY_FILE"

# Atualizar status
jq '.last_consolidation = now' "$STATUS_FILE" > "$STATUS_FILE.tmp"
mv "$STATUS_FILE.tmp" "$STATUS_FILE"

echo "✅ Consolidação concluída"

