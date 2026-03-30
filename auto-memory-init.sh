#!/bin/bash
# AUTO-MEMORY-SYSTEM — Inicialização e ativação

set -e

echo "🚀 Ativando AUTO-MEMORY-SYSTEM..."
echo ""

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
MEMORY_DIR="$WORKSPACE/memoria-auto"

# 1. Criar diretório de sistema
mkdir -p "$MEMORY_DIR"/{hooks,captures,consolidations,weekly-tests}
echo "✅ Diretórios criados"

# 2. Criar hook de pré-resposta
cat > "$MEMORY_DIR/hooks/pre-response.sh" << 'HOOK'
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

HOOK

chmod +x "$MEMORY_DIR/hooks/pre-response.sh"
echo "✅ Hook pré-resposta criado"

# 3. Criar capture automático
cat > "$MEMORY_DIR/captures/capture-lesson.sh" << 'CAPTURE'
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

CAPTURE

chmod +x "$MEMORY_DIR/captures/capture-lesson.sh"
echo "✅ Capture automático criado"

# 4. Criar consolidação diária
cat > "$MEMORY_DIR/consolidations/daily-consolidation.sh" << 'CONSOLIDATE'
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

CONSOLIDATE

chmod +x "$MEMORY_DIR/consolidations/daily-consolidation.sh"
echo "✅ Consolidação diária criada"

# 5. Criar teste semanal
cat > "$MEMORY_DIR/weekly-tests/test-techniques.sh" << 'WEEKLY'
#!/bin/bash
# TESTE SEMANAL: Testa técnicas registradas

echo "🧪 Teste semanal de técnicas..."

TEST_LOG="/tmp/memory-weekly-tests-$(date +%Y%m%d).log"

# Teste 1: instagrapi
echo "Test 1: instagrapi" >> "$TEST_LOG"
python3 -c "from instagrapi import Client; print('✅')" >> "$TEST_LOG" 2>&1

# Teste 2: yt-dlp
echo "Test 2: yt-dlp" >> "$TEST_LOG"
yt-dlp --version >> "$TEST_LOG" 2>&1

# Teste 3: Dashboard
echo "Test 3: Dashboard" >> "$TEST_LOG"
curl -s http://localhost:4444/api/health | grep -q 'ok' && echo "✅" >> "$TEST_LOG" || echo "❌" >> "$TEST_LOG"

echo "✅ Testes salvos em: $TEST_LOG"
cat "$TEST_LOG"

WEEKLY

chmod +x "$MEMORY_DIR/weekly-tests/test-techniques.sh"
echo "✅ Teste semanal criado"

# 6. Ativar cron job diário
(crontab -l 2>/dev/null | grep -v "daily-consolidation"; echo "59 23 * * * bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/memoria-auto/consolidations/daily-consolidation.sh") | crontab -
echo "✅ Cron job diário ativado (23:59)"

# 7. Ativar cron job semanal
(crontab -l 2>/dev/null | grep -v "test-techniques"; echo "0 9 * * 0 bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/memoria-auto/weekly-tests/test-techniques.sh") | crontab -
echo "✅ Cron job semanal ativado (domingo 09:00)"

# 8. Status final
echo ""
echo "════════════════════════════════════════════════"
echo "✅ AUTO-MEMORY-SYSTEM ATIVADO COM SUCESSO"
echo "════════════════════════════════════════════════"
echo ""
echo "📁 Diretórios:"
echo "   /memoria-auto/hooks/ — Hooks pré-resposta"
echo "   /memoria-auto/captures/ — Capture automático"
echo "   /memoria-auto/consolidations/ — Consolidação diária"
echo "   /memoria-auto/weekly-tests/ — Testes semanais"
echo ""
echo "⏰ Agendamentos (Cron):"
echo "   23:59 BRT — Consolidação diária"
echo "   09:00 BRT (domingo) — Teste semanal"
echo ""
echo "📊 Monitoramento:"
echo "   Status: /tmp/memory-status.json"
echo "   Logs: /tmp/memory-weekly-tests-YYYYMMDD.log"
echo ""
echo "🔄 Próximos passos:"
echo "   1. Zica testa amanhã se memória funciona"
echo "   2. Segundo domingo: primeiro teste semanal"
echo "   3. Incrementar técnicas conforme descobrir"
echo ""

