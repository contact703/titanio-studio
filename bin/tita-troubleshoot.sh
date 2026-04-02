#!/bin/bash
# TITA-TROUBLESHOOT — Busca soluções na memória + internet antes de errar
# Uso: tita-troubleshoot.sh "enviar arquivo md whatsapp"
# Uso: tita-troubleshoot.sh "gateway bloqueou media"

QUERY="$1"
if [ -z "$QUERY" ]; then
    echo "Uso: tita-troubleshoot.sh '<problema>'"
    exit 1
fi

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
RESULTS="/tmp/tita-troubleshoot-result.md"

echo "# 🔍 Troubleshoot: $QUERY" > "$RESULTS"
echo "**Data:** $(date '+%Y-%m-%d %H:%M')" >> "$RESULTS"
echo "" >> "$RESULTS"

# 1. Buscar na memória local
echo "## 1. Memória Local" >> "$RESULTS"
echo '```' >> "$RESULTS"
grep -rli "$QUERY" "$WORKSPACE/memory/" "$WORKSPACE/MEMORY.md" "$WORKSPACE/LESSONS.md" "$WORKSPACE/TOOLS.md" 2>/dev/null | head -10 >> "$RESULTS"

# Buscar por palavras-chave
for WORD in $QUERY; do
    [ ${#WORD} -lt 3 ] && continue
    FOUND=$(grep -rli "$WORD" "$WORKSPACE/memory/" 2>/dev/null | head -5)
    [ -n "$FOUND" ] && echo "Keyword '$WORD': $FOUND" >> "$RESULTS"
done
echo '```' >> "$RESULTS"
echo "" >> "$RESULTS"

# 2. Buscar em lições críticas
echo "## 2. Lições Críticas" >> "$RESULTS"
echo '```' >> "$RESULTS"
for F in "$WORKSPACE"/memory/LICAO-*.md; do
    [ -f "$F" ] || continue
    if grep -qli "$QUERY" "$F" 2>/dev/null; then
        echo "⚠️ LIÇÃO ENCONTRADA: $F" >> "$RESULTS"
        head -20 "$F" >> "$RESULTS"
        echo "..." >> "$RESULTS"
    else
        for WORD in $QUERY; do
            [ ${#WORD} -lt 3 ] && continue
            if grep -qi "$WORD" "$F" 2>/dev/null; then
                echo "⚠️ LIÇÃO RELACIONADA ($WORD): $F" >> "$RESULTS"
                grep -i "$WORD" "$F" | head -5 >> "$RESULTS"
                break
            fi
        done
    fi
done
echo '```' >> "$RESULTS"
echo "" >> "$RESULTS"

# 3. Buscar no histórico de sessões recentes
echo "## 3. Sessões Recentes" >> "$RESULTS"
echo '```' >> "$RESULTS"
for F in $(ls -t "$WORKSPACE"/memory/2026-*.md 2>/dev/null | head -5); do
    for WORD in $QUERY; do
        [ ${#WORD} -lt 3 ] && continue
        MATCHES=$(grep -ci "$WORD" "$F" 2>/dev/null)
        [ "$MATCHES" -gt 0 ] 2>/dev/null && echo "$F: $MATCHES matches for '$WORD'" >> "$RESULTS"
    done
done
echo '```' >> "$RESULTS"
echo "" >> "$RESULTS"

echo "## 4. Recomendação" >> "$RESULTS"
echo "Consulte os arquivos listados acima antes de agir." >> "$RESULTS"
echo "Se nenhum resultado, use web_search para buscar solução." >> "$RESULTS"

cat "$RESULTS"
