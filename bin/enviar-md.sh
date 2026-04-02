#!/bin/bash
############################################################
# enviar-md.sh — Envia .md via WhatsApp (upload → send → delete)
# Uso: ./enviar-md.sh /caminho/arquivo.md [grupo-id]
# Default grupo: Gospia (120363405462114071@g.us)
############################################################

set -euo pipefail

ARQUIVO="$1"
TARGET="${2:-120363405462114071@g.us}"
TOKEN="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"
REPO="contact703/titanio-docs-public"

if [ -z "$ARQUIVO" ] || [ ! -f "$ARQUIVO" ]; then
  echo "❌ Uso: enviar-md.sh /caminho/arquivo.md [grupo-id]"
  exit 1
fi

NOME=$(basename "$ARQUIVO")
echo "📤 Enviando: $NOME"

# 1. Codificar em base64
CONTENT_B64=$(base64 -i "$ARQUIVO")

# 2. Checar se já existe (pegar SHA)
SHA=$(curl -s "https://api.github.com/repos/$REPO/contents/$NOME" \
  -H "Authorization: token $TOKEN" | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('sha',''))" 2>/dev/null || echo "")

# 3. Upload pro GitHub
if [ -n "$SHA" ] && [ "$SHA" != "" ]; then
  curl -s -X PUT \
    "https://api.github.com/repos/$REPO/contents/$NOME" \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"temp: $NOME\",\"content\":\"$CONTENT_B64\",\"sha\":\"$SHA\"}" > /dev/null
else
  curl -s -X PUT \
    "https://api.github.com/repos/$REPO/contents/$NOME" \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"temp: $NOME\",\"content\":\"$CONTENT_B64\"}" > /dev/null
fi
echo "  ✅ Upload GitHub OK"

# 4. Enviar via WhatsApp (URL = aceito pelo gateway)
URL="https://raw.githubusercontent.com/$REPO/main/$NOME"
openclaw message send \
  -t "$TARGET" \
  --media "$URL" \
  -m "📄 $NOME" 2>/dev/null
echo "  ✅ WhatsApp enviado"

# 5. Esperar 10s e DELETAR do GitHub (não fica público)
sleep 10
NEW_SHA=$(curl -s "https://api.github.com/repos/$REPO/contents/$NOME" \
  -H "Authorization: token $TOKEN" | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('sha',''))" 2>/dev/null || echo "")

if [ -n "$NEW_SHA" ]; then
  curl -s -X DELETE \
    "https://api.github.com/repos/$REPO/contents/$NOME" \
    -H "Authorization: token $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"cleanup: $NOME\",\"sha\":\"$NEW_SHA\"}" > /dev/null
  echo "  🗑️ Deletado do GitHub (ficou público só 10s)"
fi

echo "✅ Pronto! $NOME enviado e limpo."
