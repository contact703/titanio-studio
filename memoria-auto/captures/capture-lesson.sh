#!/bin/bash
# CAPTURE: Registra lição automaticamente

MEMORY_FILE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/MEMORY.md"
TECNICA="$1"
CODIGO="$2"
STATUS="${3:-✅}"

if [ -z "$TECNICA" ] || [ -z "$CODIGO" ]; then
    echo "Uso: $0 <técnica> <código> [status]"
    exit 1
fi

ENTRADA="
---
## $TECNICA — $(date '+%Y-%m-%d %H:%M')
**Status:** $STATUS
**Código:**
\`\`\`
$CODIGO
\`\`\`
**Registrado:** $(date -u '+%Y-%m-%dT%H:%M:%SZ')
"

echo "$ENTRADA" >> "$MEMORY_FILE"
echo "✅ Lição capturada: $TECNICA"

