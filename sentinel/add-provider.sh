#!/bin/bash
# =============================================================================
# AI Sentinel - Provider Scaler
# Adiciona novo provider sem downtime
# Uso: ./add-provider.sh --id <id> --provider <type> --model <model> --key <api_key> --priority <n>
# Exemplo: ./add-provider.sh --id "groq-free" --provider groq --model llama-3.3-70b --key "gsk_xxx" --priority 4
# =============================================================================

SENTINEL_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel"
PROVIDERS_FILE="$SENTINEL_DIR/providers.json"
USAGE_FILE="$SENTINEL_DIR/usage-state.json"
LOG_FILE="$SENTINEL_DIR/sentinel.log"
OPENCLAW_JSON="/Volumes/TITA_039/MAC_MINI_03/.openclaw/openclaw.json"
OPENCLAW_BIN="openclaw"

DATE_LOCAL=$(date "+%Y-%m-%d %H:%M:%S")
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

log() {
  echo "[$DATE_LOCAL] [add-provider] $1" >> "$LOG_FILE"
}

# Parse argumentos
PROVIDER_ID=""
PROVIDER_TYPE=""
MODEL=""
API_KEY=""
PRIORITY=""
ENV_KEY_NAME=""
RPM=60
TPM=100000
DAILY_TOKENS=2000000
WARNING_THRESHOLD=0.80

while [[ $# -gt 0 ]]; do
  case "$1" in
    --id) PROVIDER_ID="$2"; shift 2 ;;
    --provider) PROVIDER_TYPE="$2"; shift 2 ;;
    --model) MODEL="$2"; shift 2 ;;
    --key) API_KEY="$2"; shift 2 ;;
    --priority) PRIORITY="$2"; shift 2 ;;
    --rpm) RPM="$2"; shift 2 ;;
    --tpm) TPM="$2"; shift 2 ;;
    --daily) DAILY_TOKENS="$2"; shift 2 ;;
    --threshold) WARNING_THRESHOLD="$2"; shift 2 ;;
    --env-key) ENV_KEY_NAME="$2"; shift 2 ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

# Validações
if [ -z "$PROVIDER_ID" ] || [ -z "$PROVIDER_TYPE" ] || [ -z "$MODEL" ] || [ -z "$API_KEY" ] || [ -z "$PRIORITY" ]; then
  echo "❌ Missing required arguments."
  echo ""
  echo "Usage:"
  echo "  ./add-provider.sh --id <id> --provider <type> --model <model> --key <api_key> --priority <n>"
  echo ""
  echo "Required:"
  echo "  --id        Unique provider ID (e.g., groq-free)"
  echo "  --provider  Provider type (anthropic, moonshot, groq, openai, etc.)"
  echo "  --model     Model name (e.g., llama-3.3-70b)"
  echo "  --key       API key"
  echo "  --priority  Priority number (1=highest, higher=fallback)"
  echo ""
  echo "Optional:"
  echo "  --rpm        Requests per minute limit (default: 60)"
  echo "  --tpm        Tokens per minute limit (default: 100000)"
  echo "  --daily      Daily token limit (default: 2000000)"
  echo "  --threshold  Warning threshold 0-1 (default: 0.80)"
  echo "  --env-key    Custom env var name for the key"
  exit 1
fi

if ! command -v jq &>/dev/null; then
  echo "❌ jq not found. Install with: brew install jq"
  exit 1
fi

echo "🔍 Adding provider: $PROVIDER_ID ($PROVIDER_TYPE/$MODEL)"
log "Adding provider: $PROVIDER_ID ($PROVIDER_TYPE/$MODEL) priority=$PRIORITY"

# Verifica se já existe
EXISTING=$(jq -r --arg id "$PROVIDER_ID" '.providers[] | select(.id==$id) | .id' "$PROVIDERS_FILE" 2>/dev/null)
if [ -n "$EXISTING" ]; then
  echo "❌ Provider '$PROVIDER_ID' already exists in providers.json"
  log "ERROR: Provider $PROVIDER_ID already exists"
  exit 1
fi

# Define ENV_KEY_NAME se não especificado
if [ -z "$ENV_KEY_NAME" ]; then
  ENV_KEY_NAME=$(echo "${PROVIDER_ID^^}_API_KEY" | tr '-' '_')
fi

# ─── STEP 1: Teste de healthcheck ─────────────────────────────────────────────
echo "🏥 Testing healthcheck..."
HTTP_CODE=""

case "$PROVIDER_TYPE" in
  "anthropic")
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      --max-time 10 \
      -H "x-api-key: $API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      "https://api.anthropic.com/v1/models")
    ;;
  "moonshot")
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      --max-time 10 \
      -H "Authorization: Bearer $API_KEY" \
      "https://api.moonshot.cn/v1/models")
    ;;
  "groq")
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      --max-time 10 \
      -H "Authorization: Bearer $API_KEY" \
      "https://api.groq.com/openai/v1/models")
    ;;
  "openai")
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
      --max-time 10 \
      -H "Authorization: Bearer $API_KEY" \
      "https://api.openai.com/v1/models")
    ;;
  *)
    echo "⚠️  Unknown provider type '$PROVIDER_TYPE'. Skipping healthcheck."
    HTTP_CODE="000"
    ;;
esac

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Healthcheck OK (HTTP $HTTP_CODE)"
  log "Healthcheck passed for $PROVIDER_ID: HTTP $HTTP_CODE"
elif [ "$HTTP_CODE" = "000" ]; then
  echo "⚠️  Could not verify healthcheck (HTTP $HTTP_CODE). Adding anyway."
  log "WARN: Healthcheck inconclusive for $PROVIDER_ID"
else
  echo "❌ Healthcheck failed (HTTP $HTTP_CODE). Check your API key."
  log "ERROR: Healthcheck failed for $PROVIDER_ID: HTTP $HTTP_CODE"
  read -p "Add anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# ─── STEP 2: Adiciona ao providers.json ───────────────────────────────────────
echo "📝 Adding to providers.json..."
PROVIDER_NAME=$(echo "$PROVIDER_ID" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2); print}')

TMPFILE=$(mktemp)
jq --arg id "$PROVIDER_ID" \
   --arg name "$PROVIDER_NAME" \
   --arg provider "$PROVIDER_TYPE" \
   --arg model "$MODEL" \
   --argjson priority "$PRIORITY" \
   --arg envKey "$ENV_KEY_NAME" \
   --argjson rpm "$RPM" \
   --argjson tpm "$TPM" \
   --argjson daily "$DAILY_TOKENS" \
   --argjson threshold "$WARNING_THRESHOLD" \
   '.providers += [{
     id: $id,
     name: $name,
     provider: $provider,
     model: $model,
     priority: $priority,
     envKey: $envKey,
     limits: {rpm: $rpm, tpm: $tpm, daily_tokens: $daily},
     warningThreshold: $threshold,
     enabled: true
   }] | .providers |= sort_by(.priority)' \
   "$PROVIDERS_FILE" > "$TMPFILE" && mv "$TMPFILE" "$PROVIDERS_FILE"

echo "✅ Added to providers.json"

# ─── STEP 3: Adiciona chave ao openclaw.json ──────────────────────────────────
echo "🔑 Adding API key to openclaw.json..."
cp "$OPENCLAW_JSON" "${OPENCLAW_JSON}.bak-$(date +%s)"

TMPFILE=$(mktemp)
jq --arg key "$ENV_KEY_NAME" \
   --arg val "$API_KEY" \
   '.env[$key] = $val' \
   "$OPENCLAW_JSON" > "$TMPFILE" && mv "$TMPFILE" "$OPENCLAW_JSON"

echo "✅ API key added to openclaw.json"

# ─── STEP 4: Adiciona entrada no usage-state.json ─────────────────────────────
echo "📊 Initializing usage tracking..."
TMPFILE=$(mktemp)
jq --arg id "$PROVIDER_ID" \
   --arg ts "$TS" \
   '.providers[$id] = {
     status: "healthy",
     last_error: null,
     last_error_code: null,
     tokens_this_hour: 0,
     tokens_today: 0,
     requests_this_minute: 0,
     minute_window_start: "",
     hour_window_start: "",
     day_window_start: "",
     consecutive_errors: 0,
     last_healthcheck: $ts,
     healthcheck_ok: true
   }' \
   "$USAGE_FILE" > "$TMPFILE" && mv "$TMPFILE" "$USAGE_FILE"

echo "✅ Usage tracking initialized"

# ─── STEP 5: Adiciona ao fallbacks do openclaw.json ──────────────────────────
echo "🔄 Adding to model fallbacks..."
OPENCLAW_MODEL_ID=""
case "$PROVIDER_TYPE" in
  "anthropic") OPENCLAW_MODEL_ID="anthropic/$MODEL" ;;
  "moonshot") OPENCLAW_MODEL_ID="moonshot/$MODEL" ;;
  "groq") OPENCLAW_MODEL_ID="groq/$MODEL" ;;
  "openai") OPENCLAW_MODEL_ID="openai/$MODEL" ;;
  *) OPENCLAW_MODEL_ID="$PROVIDER_TYPE/$MODEL" ;;
esac

TMPFILE=$(mktemp)
jq --arg model "$OPENCLAW_MODEL_ID" \
   '.agents.defaults.model.fallbacks += [$model]' \
   "$OPENCLAW_JSON" > "$TMPFILE" && mv "$TMPFILE" "$OPENCLAW_JSON"

echo "✅ Added to fallbacks: $OPENCLAW_MODEL_ID"

# ─── STEP 6: Reinicia gateway ─────────────────────────────────────────────────
echo "🔄 Restarting OpenClaw gateway..."
if command -v "$OPENCLAW_BIN" &>/dev/null; then
  $OPENCLAW_BIN gateway restart
  echo "✅ Gateway restarted"
  log "Gateway restarted after adding $PROVIDER_ID"
else
  echo "⚠️  openclaw not found. Please restart the gateway manually."
  log "WARN: Could not restart gateway (openclaw not found)"
fi

log "Provider $PROVIDER_ID added successfully"
echo ""
echo "✅ Provider '$PROVIDER_ID' added successfully!"
echo "   Model: $OPENCLAW_MODEL_ID"
echo "   Priority: $PRIORITY"
echo "   Daily limit: $DAILY_TOKENS tokens"
echo "   Warning at: $(echo "$WARNING_THRESHOLD * 100" | bc)%"
