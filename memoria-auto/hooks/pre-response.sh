#!/bin/bash
# PRÉ-RESPOSTA: Busca contexto em MEMORY.md
# Roda ANTES de qualquer resposta técnica

MEMORY_FILE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/MEMORY.md"
TOPICOS="$@"

for topico in $TOPICOS; do
    if grep -q "$topico" "$MEMORY_FILE" 2>/dev/null; then
        echo "[MEMORY-INJECT] Encontrado: $topico"
        grep -A5 "$topico" "$MEMORY_FILE" | head -10
    fi
done

