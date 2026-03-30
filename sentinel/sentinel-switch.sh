#!/bin/bash
# =============================================================================
# AI Sentinel - Failover Engine
# Troca automática de provider com preservação de contexto
# Uso: sentinel-switch.sh <from_provider_id> <to_provider_id> <reason>
# =============================================================================

SENTINEL_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel"
USAGE_FILE="$SENTINEL_DIR/usage-state.json"
PROVIDERS_FILE="$SENTINEL_DIR/providers.json"
SNAPSHOT_FILE="$SENTINEL_DIR/context-snapshot.json"
SWITCH_HISTORY="$SENTINEL_DIR/switch-history.json"
LOG_FILE="$SENTINEL_DIR/sentinel.log"
OPENCLAW_JSON="/Volumes/TITA_039/MAC_MINI_03/.openclaw/openclaw.json"
OPENCLAW_BIN="openclaw"

FROM_PROVIDER="${1:-}"
TO_PROVIDER="${2:-}"
REASON="${3:-unknown}"

DATE_LOCAL=$(date "+%Y-%m-%d %H:%M:%S")
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

log() {
  echo "[$DATE_LOCAL] [sentinel-switch] $1" >> "$LOG_FILE"
}

log "=== FAILOVER START: $FROM_PROVIDER → $TO_PROVIDER (reason: $REASON) ==="

if [ -z "$FROM_PROVIDER" ] || [ -z "$TO_PROVIDER" ]; then
  log "ERROR: Missing arguments. Usage: sentinel-switch.sh <from> <to> <reason>"
  exit 1
fi

if ! command -v jq &>/dev/null; then
  log "ERROR: jq not found"
  exit 1
fi

# ─── STEP 1: Lê contexto atual do snapshot ────────────────────────────────────
log "Step 1: Reading context snapshot"
ACTIVE_TASK="Tarefa desconhecida"
RECOVERY_PROMPT=""

if [ -f "$SNAPSHOT_FILE" ]; then
  ACTIVE_TASK=$(jq -r '.active_task // "Tarefa desconhecida"' "$SNAPSHOT_FILE")
  RECOVERY_PROMPT=$(jq -r '.recovery_prompt // ""' "$SNAPSHOT_FILE")
  RECENT_SUMMARY=$(jq -r '.recent_messages_summary // ""' "$SNAPSHOT_FILE")
  ACTIVE_PROJECTS=$(jq -r '.active_projects // [] | join(", ")' "$SNAPSHOT_FILE")
  PENDING_PROMISES=$(jq -r '.pending_promises // [] | join("; ")' "$SNAPSHOT_FILE")
  SNAPSHOT_TS=$(jq -r '.timestamp // ""' "$SNAPSHOT_FILE")
  log "Snapshot loaded. Active task: $ACTIVE_TASK"
else
  log "WARN: No context snapshot found. Recovery will be limited."
fi

# ─── STEP 2: Obtém info do novo provider ──────────────────────────────────────
log "Step 2: Getting new provider info"
TO_PROVIDER_NAME=$(jq -r --arg id "$TO_PROVIDER" '.providers[] | select(.id==$id) | .name' "$PROVIDERS_FILE")
TO_MODEL=$(jq -r --arg id "$TO_PROVIDER" '.providers[] | select(.id==$id) | .model' "$PROVIDERS_FILE")
FROM_PROVIDER_NAME=$(jq -r --arg id "$FROM_PROVIDER" '.providers[] | select(.id==$id) | .name' "$PROVIDERS_FILE")

log "Switching to: $TO_PROVIDER_NAME (model: $TO_MODEL)"

# ─── STEP 3: Atualiza openclaw.json com novo provider primário ────────────────
log "Step 3: Updating openclaw.json"

# Mapeia model ID para formato openclaw
OPENCLAW_MODEL=""
case "$TO_PROVIDER" in
  "anthropic-primary"|"anthropic-secondary")
    OPENCLAW_MODEL="anthropic/claude-sonnet-4-6"
    ;;
  "kimi-fallback")
    OPENCLAW_MODEL="moonshot/kimi-k2.5"
    ;;
  *)
    # Tenta inferir do campo model
    OPENCLAW_MODEL=$(jq -r --arg id "$TO_PROVIDER" '.providers[] | select(.id==$id) | 
      if .provider == "anthropic" then "anthropic/" + .model
      elif .provider == "moonshot" then "moonshot/" + .model  
      else .provider + "/" + .model
      end' "$PROVIDERS_FILE")
    ;;
esac

# Backup do openclaw.json
cp "$OPENCLAW_JSON" "${OPENCLAW_JSON}.sentinel-backup"

# Atualiza primary model
TMPFILE=$(mktemp)
jq --arg model "$OPENCLAW_MODEL" \
   '.agents.defaults.model.primary = $model' \
   "$OPENCLAW_JSON" > "$TMPFILE" && mv "$TMPFILE" "$OPENCLAW_JSON"

log "openclaw.json updated. New primary: $OPENCLAW_MODEL"

# ─── STEP 4: Atualiza usage-state.json com novo provider atual ────────────────
log "Step 4: Updating usage-state"
TMPFILE=$(mktemp)
jq --arg new_provider "$TO_PROVIDER" \
   --arg ts "$TS" \
   '.current_provider = $new_provider | .last_updated = $ts' \
   "$USAGE_FILE" > "$TMPFILE" && mv "$TMPFILE" "$USAGE_FILE"

# ─── STEP 5: Reinicia gateway ─────────────────────────────────────────────────
log "Step 5: Restarting OpenClaw gateway"
if command -v "$OPENCLAW_BIN" &>/dev/null; then
  $OPENCLAW_BIN gateway restart >> "$LOG_FILE" 2>&1
  sleep 3
  log "Gateway restart command sent"
else
  log "WARN: openclaw command not found. Gateway not restarted."
fi

# ─── STEP 6: Injeta contexto de recuperação via system event ──────────────────
log "Step 6: Injecting recovery context"

RECOVERY_EVENT="🔄 RETOMADA AUTOMÁTICA DE CONTEXTO (Sentinel System)

Você acabou de ser ativado como substituto de ${FROM_PROVIDER_NAME}.

📋 TAREFA ATIVA: ${ACTIVE_TASK}

📁 PROJETOS ATIVOS: ${ACTIVE_PROJECTS}

💬 RESUMO DAS ÚLTIMAS TROCAS:
${RECENT_SUMMARY}

⚠️ PROMESSAS PENDENTES: ${PENDING_PROMISES}

🔑 CONTEXTO COMPLETO:
${RECOVERY_PROMPT}

---
Snapshot timestamp: ${SNAPSHOT_TS}
Motivo da troca: ${REASON}
Provider anterior: ${FROM_PROVIDER_NAME}
Provider atual: ${TO_PROVIDER_NAME} (${OPENCLAW_MODEL})

Retome exatamente de onde parou. Eduardo pode não ter percebido a troca."

if command -v "$OPENCLAW_BIN" &>/dev/null; then
  sleep 5  # Aguarda gateway reiniciar
  $OPENCLAW_BIN system event --text "$RECOVERY_EVENT" >> "$LOG_FILE" 2>&1
  log "Recovery context injected via system event"
else
  log "WARN: Could not inject recovery context (openclaw not found)"
fi

# ─── STEP 7: Notifica Eduardo no WhatsApp ─────────────────────────────────────
log "Step 7: Notifying Eduardo"

REASON_HUMAN=""
case "$REASON" in
  "rate_limit_429") REASON_HUMAN="Rate limit atingido (429)" ;;
  "overloaded_529") REASON_HUMAN="Servidor sobrecarregado (529)" ;;
  "auth_error") REASON_HUMAN="Erro de autenticação" ;;
  "network_error_3x") REASON_HUMAN="3 erros de rede consecutivos" ;;
  "usage_threshold") REASON_HUMAN="Limiar de uso diário atingido" ;;
  *) REASON_HUMAN="$REASON" ;;
esac

NOTIFICATION="⚡ Sentinel: troca automática de ${FROM_PROVIDER_NAME} → ${TO_PROVIDER_NAME}. Contexto preservado. Motivo: ${REASON_HUMAN}"

if command -v "$OPENCLAW_BIN" &>/dev/null; then
  $OPENCLAW_BIN system event --text "$NOTIFICATION" --mode now >> "$LOG_FILE" 2>&1
  log "WhatsApp notification sent"
else
  log "WARN: Could not send notification (openclaw not found)"
fi

# ─── STEP 8: Registra no switch-history.json ──────────────────────────────────
log "Step 8: Recording switch history"

HISTORY_ENTRY=$(jq -n \
  --arg ts "$TS" \
  --arg from "$FROM_PROVIDER" \
  --arg from_name "$FROM_PROVIDER_NAME" \
  --arg to "$TO_PROVIDER" \
  --arg to_name "$TO_PROVIDER_NAME" \
  --arg reason "$REASON" \
  --arg task "$ACTIVE_TASK" \
  --arg model "$OPENCLAW_MODEL" \
  '{
    timestamp: $ts,
    from: {id: $from, name: $from_name},
    to: {id: $to, name: $to_name, model: $model},
    reason: $reason,
    active_task: $task
  }')

TMPFILE=$(mktemp)
jq --argjson entry "$HISTORY_ENTRY" '.switches += [$entry]' "$SWITCH_HISTORY" > "$TMPFILE" && mv "$TMPFILE" "$SWITCH_HISTORY"

# Mantém apenas últimas 100 entradas
TMPFILE=$(mktemp)
jq '.switches = (.switches | if length > 100 then .[-100:] else . end)' "$SWITCH_HISTORY" > "$TMPFILE" && mv "$TMPFILE" "$SWITCH_HISTORY"

log "=== FAILOVER COMPLETE: $FROM_PROVIDER → $TO_PROVIDER ==="
echo "✅ Failover complete: $FROM_PROVIDER_NAME → $TO_PROVIDER_NAME ($REASON)"
