#!/bin/bash
# =============================================================================
# AI Sentinel - Usage Tracker
# Hook chamado após cada resposta da IA.
# Uso: track-usage.sh <provider_id> <tokens_used> [input|output|total]
# Exemplo: track-usage.sh anthropic-primary 1500 total
# =============================================================================

SENTINEL_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel"
USAGE_FILE="$SENTINEL_DIR/usage-state.json"
LOG_FILE="$SENTINEL_DIR/sentinel.log"

PROVIDER_ID="${1:-}"
TOKENS="${2:-0}"
TOKEN_TYPE="${3:-total}"

DATE_LOCAL=$(date "+%Y-%m-%d %H:%M:%S")
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
NOW_EPOCH=$(date +%s)
NOW_HOUR=$(date -u +"%Y-%m-%dT%H:00:00Z")
NOW_DAY=$(date -u +"%Y-%m-%d")
NOW_MINUTE=$(date -u +"%Y-%m-%dT%H:%M:00Z")

log() {
  echo "[$DATE_LOCAL] [track-usage] $1" >> "$LOG_FILE"
}

if [ -z "$PROVIDER_ID" ]; then
  echo "Usage: track-usage.sh <provider_id> <tokens_used> [token_type]"
  exit 1
fi

if ! command -v jq &>/dev/null; then
  log "ERROR: jq not found"
  exit 1
fi

if [ ! -f "$USAGE_FILE" ]; then
  log "ERROR: usage-state.json not found"
  exit 1
fi

# Lê estado atual
CURRENT_HOUR=$(jq -r --arg id "$PROVIDER_ID" '.providers[$id].hour_window_start // ""' "$USAGE_FILE")
CURRENT_DAY=$(jq -r --arg id "$PROVIDER_ID" '.providers[$id].day_window_start // ""' "$USAGE_FILE")
CURRENT_MINUTE=$(jq -r --arg id "$PROVIDER_ID" '.providers[$id].minute_window_start // ""' "$USAGE_FILE")

TOKENS_THIS_HOUR=$(jq -r --arg id "$PROVIDER_ID" '.providers[$id].tokens_this_hour // 0' "$USAGE_FILE")
TOKENS_TODAY=$(jq -r --arg id "$PROVIDER_ID" '.providers[$id].tokens_today // 0' "$USAGE_FILE")
REQUESTS_THIS_MINUTE=$(jq -r --arg id "$PROVIDER_ID" '.providers[$id].requests_this_minute // 0' "$USAGE_FILE")

# Reset janelas se necessário
if [ "$CURRENT_HOUR" != "$NOW_HOUR" ]; then
  TOKENS_THIS_HOUR=0
  CURRENT_HOUR="$NOW_HOUR"
fi

if [ "$CURRENT_DAY" != "$NOW_DAY" ]; then
  TOKENS_TODAY=0
  CURRENT_DAY="$NOW_DAY"
fi

if [ "$CURRENT_MINUTE" != "$NOW_MINUTE" ]; then
  REQUESTS_THIS_MINUTE=0
  CURRENT_MINUTE="$NOW_MINUTE"
fi

# Incrementa contadores
TOKENS_THIS_HOUR=$((TOKENS_THIS_HOUR + TOKENS))
TOKENS_TODAY=$((TOKENS_TODAY + TOKENS))
REQUESTS_THIS_MINUTE=$((REQUESTS_THIS_MINUTE + 1))

# Salva no arquivo
TMPFILE=$(mktemp)
jq --arg id "$PROVIDER_ID" \
   --argjson tph "$TOKENS_THIS_HOUR" \
   --argjson td "$TOKENS_TODAY" \
   --argjson rpm "$REQUESTS_THIS_MINUTE" \
   --arg hw "$CURRENT_HOUR" \
   --arg dw "$CURRENT_DAY" \
   --arg mw "$CURRENT_MINUTE" \
   --arg ts "$TS" \
   '.providers[$id].tokens_this_hour = $tph |
    .providers[$id].tokens_today = $td |
    .providers[$id].requests_this_minute = $rpm |
    .providers[$id].hour_window_start = $hw |
    .providers[$id].day_window_start = $dw |
    .providers[$id].minute_window_start = $mw |
    .last_updated = $ts' \
   "$USAGE_FILE" > "$TMPFILE" && mv "$TMPFILE" "$USAGE_FILE"

# Verifica limites e alerta se necessário
DAILY_LIMIT=$(jq -r --arg id "$PROVIDER_ID" '.providers[] | select(.id==$id) | .limits.daily_tokens // 0' \
  "$SENTINEL_DIR/providers.json" 2>/dev/null || echo "0")

WARNING_THRESHOLD=$(jq -r --arg id "$PROVIDER_ID" '.providers[] | select(.id==$id) | .warningThreshold // 0.8' \
  "$SENTINEL_DIR/providers.json" 2>/dev/null || echo "0.8")

if [ "$DAILY_LIMIT" -gt 0 ] 2>/dev/null; then
  PCT=$(echo "scale=4; $TOKENS_TODAY / $DAILY_LIMIT" | bc 2>/dev/null || echo "0")
  ABOVE=$(echo "$PCT >= $WARNING_THRESHOLD" | bc 2>/dev/null || echo "0")
  if [ "$ABOVE" = "1" ]; then
    PCT_DISPLAY=$(echo "scale=1; $PCT * 100" | bc 2>/dev/null || echo "?")
    log "WARNING: $PROVIDER_ID at ${PCT_DISPLAY}% daily limit (${TOKENS_TODAY}/${DAILY_LIMIT} tokens)"
  fi
fi

log "Updated $PROVIDER_ID: +${TOKENS} tokens (hour: ${TOKENS_THIS_HOUR}, day: ${TOKENS_TODAY}, rpm: ${REQUESTS_THIS_MINUTE})"
