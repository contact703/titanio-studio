#!/bin/bash
# =============================================================================
# AI Sentinel Monitor - Titanio AI Failover System
# Roda a cada 2 minutos via crontab
# =============================================================================

SENTINEL_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel"
USAGE_FILE="$SENTINEL_DIR/usage-state.json"
PROVIDERS_FILE="$SENTINEL_DIR/providers.json"
LOG_FILE="$SENTINEL_DIR/sentinel.log"
SWITCH_SCRIPT="$SENTINEL_DIR/sentinel-switch.sh"
OPENCLAW_JSON="/Volumes/TITA_039/MAC_MINI_03/.openclaw/openclaw.json"

# Timestamp
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_LOCAL=$(date "+%Y-%m-%d %H:%M:%S")

log() {
  echo "[$DATE_LOCAL] $1" >> "$LOG_FILE"
}

log "=== Sentinel check started ==="

# Garante que jq está disponível
if ! command -v jq &>/dev/null; then
  log "ERROR: jq not found. Install with: brew install jq"
  exit 1
fi

# Garante que os arquivos existem
if [ ! -f "$USAGE_FILE" ]; then
  log "ERROR: usage-state.json not found"
  exit 1
fi

if [ ! -f "$PROVIDERS_FILE" ]; then
  log "ERROR: providers.json not found"
  exit 1
fi

# Lê provider atual
CURRENT_PROVIDER=$(jq -r '.current_provider' "$USAGE_FILE")
log "Current provider: $CURRENT_PROVIDER"

# Função para testar healthcheck de um provider
check_provider_health() {
  local provider_id="$1"
  local env_key=$(jq -r --arg id "$provider_id" '.providers[] | select(.id==$id) | .envKey' "$PROVIDERS_FILE")
  local provider_type=$(jq -r --arg id "$provider_id" '.providers[] | select(.id==$id) | .provider' "$PROVIDERS_FILE")
  local model=$(jq -r --arg id "$provider_id" '.providers[] | select(.id==$id) | .model' "$PROVIDERS_FILE")

  # Obtém API key do openclaw.json
  local api_key=""
  case "$env_key" in
    "ANTHROPIC_API_KEY")
      api_key=$(jq -r '.env.ANTHROPIC_API_KEY // ""' "$OPENCLAW_JSON")
      ;;
    "ANTHROPIC_API_KEY_SECONDARY")
      api_key=$(jq -r '.env.ANTHROPIC_API_KEY_SECONDARY // ""' "$OPENCLAW_JSON")
      ;;
    "KIMI_API_KEY")
      api_key=$(jq -r '.env.KIMI_API_KEY // ""' "$OPENCLAW_JSON")
      ;;
  esac

  if [ -z "$api_key" ] || [ "$api_key" = "null" ]; then
    log "WARN: No API key found for $provider_id ($env_key)"
    echo "no_key"
    return
  fi

  local http_code=""

  case "$provider_type" in
    "anthropic")
      # Chama endpoint de modelos (muito leve, não consome tokens)
      http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time 10 \
        -H "x-api-key: $api_key" \
        -H "anthropic-version: 2023-06-01" \
        "https://api.anthropic.com/v1/models")
      ;;
    "moonshot")
      # Testa endpoint Kimi
      http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time 10 \
        -H "Authorization: Bearer $api_key" \
        "https://api.moonshot.cn/v1/models")
      ;;
    *)
      log "WARN: Unknown provider type $provider_type for $provider_id"
      echo "unknown"
      return
      ;;
  esac

  log "Healthcheck $provider_id: HTTP $http_code"

  case "$http_code" in
    200|201)
      echo "healthy"
      ;;
    401|403)
      echo "auth_error"
      ;;
    429)
      echo "rate_limited"
      ;;
    529)
      echo "overloaded"
      ;;
    000)
      echo "network_error"
      ;;
    *)
      echo "error_$http_code"
      ;;
  esac
}

# Função para verificar se provider está acima do threshold
check_usage_threshold() {
  local provider_id="$1"
  local warning_threshold=$(jq -r --arg id "$provider_id" '.providers[] | select(.id==$id) | .warningThreshold' "$PROVIDERS_FILE")
  local daily_limit=$(jq -r --arg id "$provider_id" '.providers[] | select(.id==$id) | .limits.daily_tokens' "$PROVIDERS_FILE")
  local tokens_today=$(jq -r --arg id "$provider_id" '.providers[$id].tokens_today // 0' "$USAGE_FILE")

  if [ "$daily_limit" -eq 0 ] 2>/dev/null; then
    echo "ok"
    return
  fi

  # Calcula percentual de uso
  local pct=$(echo "scale=4; $tokens_today / $daily_limit" | bc 2>/dev/null || echo "0")
  local above_threshold=$(echo "$pct >= $warning_threshold" | bc 2>/dev/null || echo "0")

  if [ "$above_threshold" = "1" ]; then
    log "WARN: $provider_id at $(echo "scale=1; $pct * 100" | bc)% of daily limit"
    echo "above_threshold"
  else
    echo "ok"
  fi
}

# Função para encontrar próximo provider disponível
find_next_provider() {
  local current="$1"
  local current_priority=$(jq -r --arg id "$current" '.providers[] | select(.id==$id) | .priority' "$PROVIDERS_FILE")

  # Busca providers habilitados com prioridade maior que o atual
  local next=$(jq -r --arg prio "$current_priority" '
    .providers
    | map(select(.enabled == true))
    | sort_by(.priority)
    | map(select(.priority > ($prio | tonumber)))
    | first
    | .id // empty
  ' "$PROVIDERS_FILE")

  if [ -z "$next" ]; then
    # Se não tem próximo, volta ao início (provider com menor prioridade numérica)
    next=$(jq -r --arg current "$current" '
      .providers
      | map(select(.enabled == true and .id != $current))
      | sort_by(.priority)
      | first
      | .id // empty
    ' "$PROVIDERS_FILE")
  fi

  echo "$next"
}

# Verifica provider atual
CURRENT_STATUS=$(check_provider_health "$CURRENT_PROVIDER")
log "Health status of $CURRENT_PROVIDER: $CURRENT_STATUS"

USAGE_STATUS=$(check_usage_threshold "$CURRENT_PROVIDER")

# Atualiza healthcheck no usage-state.json
TMPFILE=$(mktemp)
jq --arg id "$CURRENT_PROVIDER" \
   --arg status "$CURRENT_STATUS" \
   --arg ts "$TS" \
   '.providers[$id].last_healthcheck = $ts |
    .providers[$id].healthcheck_ok = ($status == "healthy") |
    .last_updated = $ts' \
   "$USAGE_FILE" > "$TMPFILE" && mv "$TMPFILE" "$USAGE_FILE"

# Decisão de failover
NEEDS_FAILOVER=false
FAILOVER_REASON=""

if [ "$CURRENT_STATUS" = "rate_limited" ]; then
  NEEDS_FAILOVER=true
  FAILOVER_REASON="rate_limit_429"
elif [ "$CURRENT_STATUS" = "overloaded" ]; then
  NEEDS_FAILOVER=true
  FAILOVER_REASON="overloaded_529"
elif [ "$CURRENT_STATUS" = "auth_error" ]; then
  NEEDS_FAILOVER=true
  FAILOVER_REASON="auth_error"
elif [ "$CURRENT_STATUS" = "network_error" ]; then
  # Incrementa erros consecutivos
  CONSEC_ERRORS=$(jq -r --arg id "$CURRENT_PROVIDER" '.providers[$id].consecutive_errors // 0' "$USAGE_FILE")
  CONSEC_ERRORS=$((CONSEC_ERRORS + 1))
  TMPFILE=$(mktemp)
  jq --arg id "$CURRENT_PROVIDER" --argjson e "$CONSEC_ERRORS" \
     '.providers[$id].consecutive_errors = $e' "$USAGE_FILE" > "$TMPFILE" && mv "$TMPFILE" "$USAGE_FILE"

  if [ "$CONSEC_ERRORS" -ge 3 ]; then
    NEEDS_FAILOVER=true
    FAILOVER_REASON="network_error_3x"
  fi
elif [ "$USAGE_STATUS" = "above_threshold" ]; then
  NEEDS_FAILOVER=true
  FAILOVER_REASON="usage_threshold"
fi

if [ "$NEEDS_FAILOVER" = true ]; then
  log "FAILOVER TRIGGERED: reason=$FAILOVER_REASON, from=$CURRENT_PROVIDER"

  NEXT_PROVIDER=$(find_next_provider "$CURRENT_PROVIDER")

  if [ -z "$NEXT_PROVIDER" ]; then
    log "ERROR: No fallback provider available! All providers may be down."
    exit 1
  fi

  log "Switching from $CURRENT_PROVIDER to $NEXT_PROVIDER"
  bash "$SWITCH_SCRIPT" "$CURRENT_PROVIDER" "$NEXT_PROVIDER" "$FAILOVER_REASON"
else
  log "All systems nominal. Provider $CURRENT_PROVIDER is healthy."
fi

log "=== Sentinel check complete ==="
