#!/bin/bash
# send-polymarket-alert.sh - Sistema de alertas para WhatsApp
# Integrado ao sistema Titanio de notificações

set -e

MESSAGE="$1"
SCRIPT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent"
ALERT_LOG="$SCRIPT_DIR/data/alerts.log"

# Função de log
log_alert() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$ALERT_LOG"
}

# Verificar se temos mensagem
if [ -z "$MESSAGE" ]; then
    log_alert "❌ Mensagem vazia"
    exit 1
fi

# Truncar mensagem se muito longa
if [ ${#MESSAGE} -gt 500 ]; then
    MESSAGE="${MESSAGE:0:497}..."
fi

log_alert "📤 Enviando alerta: $MESSAGE"

# Criar arquivo de alerta para o sistema Titanio processar
ALERT_FILE="/tmp/polymarket-alert-$(date +%s).txt"
echo "$MESSAGE" > "$ALERT_FILE"

# Enviar via WhatsApp usando o sistema existente
# Tenta múltiplos métodos para garantir entrega

# Método 1: Usar o gateway WhatsApp do sistema principal
try_gateway() {
    if [ -f "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/send-whatsapp.sh" ]; then
        bash "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/send-whatsapp.sh" \
            "120363405462114071@g.us" \
            "🤖 POLYMARKET BOT: $MESSAGE" 2>/dev/null
        return 0
    fi
    return 1
}

# Método 2: Usar N8n webhook (se disponível)
try_n8n() {
    if command -v curl >/dev/null 2>&1; then
        curl -X POST "http://localhost:5678/webhook/polymarket-alert" \
            -H "Content-Type: application/json" \
            -d "{\"message\": \"🤖 POLYMARKET BOT: $MESSAGE\"}" \
            --max-time 10 2>/dev/null || true
    fi
}

# Método 3: Salvar em arquivo para processamento posterior
try_file() {
    ALERT_QUEUE="$SCRIPT_DIR/data/alert-queue.jsonl"
    echo "{\"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"message\": \"$MESSAGE\"}" >> "$ALERT_QUEUE"
}

# Executar todos os métodos
try_gateway || log_alert "Gateway WhatsApp indisponível"
try_n8n || log_alert "N8n webhook falhou"
try_file || log_alert "Falha ao salvar alerta em arquivo"

# Limpar arquivo temporário
rm -f "$ALERT_FILE"

log_alert "✅ Alerta processado com sucesso"

# Enviar notificação especial para erros críticos
if echo "$MESSAGE" | grep -qi "erro crítico\|crash\|máximo de reinicializações"; then
    # Enviar também para o grupo de administradores
    if [ -f "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/send-whatsapp.sh" ]; then
        bash "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/send-whatsapp.sh" \
            "120363405462114071@g.us" \
            "🚨 URGENTE: $MESSAGE" 2>/dev/null || true
    fi
fi