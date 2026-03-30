#!/bin/bash
# =============================================================================
# AI Sentinel - Dashboard
# Exibe status atual de todos os providers, uso e histórico de switches
# Uso: ./status.sh [--json] [--history] [--watch]
# =============================================================================

SENTINEL_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel"
USAGE_FILE="$SENTINEL_DIR/usage-state.json"
PROVIDERS_FILE="$SENTINEL_DIR/providers.json"
SNAPSHOT_FILE="$SENTINEL_DIR/context-snapshot.json"
SWITCH_HISTORY="$SENTINEL_DIR/switch-history.json"
LOG_FILE="$SENTINEL_DIR/sentinel.log"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Args
JSON_MODE=false
SHOW_HISTORY=false
WATCH_MODE=false

for arg in "$@"; do
  case "$arg" in
    --json) JSON_MODE=true ;;
    --history) SHOW_HISTORY=true ;;
    --watch) WATCH_MODE=true ;;
  esac
done

if ! command -v jq &>/dev/null; then
  echo "ERROR: jq not found. Install with: brew install jq"
  exit 1
fi

show_dashboard() {
  if [ "$JSON_MODE" = true ]; then
    # Output JSON combinado
    jq -n \
      --slurpfile providers "$PROVIDERS_FILE" \
      --slurpfile usage "$USAGE_FILE" \
      --slurpfile snapshot "$SNAPSHOT_FILE" \
      --slurpfile history "$SWITCH_HISTORY" \
      '{
        providers: $providers[0],
        usage: $usage[0],
        snapshot: $snapshot[0],
        switch_history: $history[0]
      }'
    return
  fi

  clear
  echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${CYAN}║         🛡️  AI SENTINEL SYSTEM - TITANIO DASHBOARD        ║${NC}"
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${BOLD}Last updated:${NC} $(date '+%Y-%m-%d %H:%M:%S')"

  # Provider atual
  CURRENT=$(jq -r '.current_provider // "unknown"' "$USAGE_FILE" 2>/dev/null)
  CURRENT_NAME=$(jq -r --arg id "$CURRENT" '.providers[] | select(.id==$id) | .name' "$PROVIDERS_FILE" 2>/dev/null)
  echo -e "  ${BOLD}Active provider:${NC} ${GREEN}$CURRENT_NAME${NC} (${CYAN}$CURRENT${NC})"
  echo ""

  # ─── Providers table ──────────────────────────────────────────────────────
  echo -e "${BOLD}  PROVIDERS${NC}"
  echo -e "  ─────────────────────────────────────────────────────────"
  printf "  %-22s %-10s %-10s %-12s %-10s\n" "Provider" "Status" "Today%" "Today Tokens" "RPM"
  echo -e "  ─────────────────────────────────────────────────────────"

  jq -r '.providers[] | select(.enabled == true) | .id' "$PROVIDERS_FILE" 2>/dev/null | while read -r pid; do
    PNAME=$(jq -r --arg id "$pid" '.providers[] | select(.id==$id) | .name' "$PROVIDERS_FILE")
    PMODEL=$(jq -r --arg id "$pid" '.providers[] | select(.id==$id) | .model' "$PROVIDERS_FILE")
    DAILY_LIMIT=$(jq -r --arg id "$pid" '.providers[] | select(.id==$id) | .limits.daily_tokens' "$PROVIDERS_FILE")
    WARNING_T=$(jq -r --arg id "$pid" '.providers[] | select(.id==$id) | .warningThreshold' "$PROVIDERS_FILE")
    PRIORITY=$(jq -r --arg id "$pid" '.providers[] | select(.id==$id) | .priority' "$PROVIDERS_FILE")

    TOKENS_TODAY=$(jq -r --arg id "$pid" '.providers[$id].tokens_today // 0' "$USAGE_FILE" 2>/dev/null || echo "0")
    RPM=$(jq -r --arg id "$pid" '.providers[$id].requests_this_minute // 0' "$USAGE_FILE" 2>/dev/null || echo "0")
    HEALTH_OK=$(jq -r --arg id "$pid" '.providers[$id].healthcheck_ok // true' "$USAGE_FILE" 2>/dev/null || echo "true")
    CONSEC_ERRORS=$(jq -r --arg id "$pid" '.providers[$id].consecutive_errors // 0' "$USAGE_FILE" 2>/dev/null || echo "0")
    LAST_ERROR=$(jq -r --arg id "$pid" '.providers[$id].last_error // ""' "$USAGE_FILE" 2>/dev/null || echo "")

    # Calcula %
    if [ "$DAILY_LIMIT" -gt 0 ] 2>/dev/null; then
      PCT=$(echo "scale=1; $TOKENS_TODAY * 100 / $DAILY_LIMIT" | bc 2>/dev/null || echo "0")
    else
      PCT="0"
    fi

    # Indicator
    INDICATOR="✅"
    STATUS_COLOR="$GREEN"
    STATUS_TEXT="healthy"

    if [ "$HEALTH_OK" = "false" ]; then
      INDICATOR="❌"
      STATUS_COLOR="$RED"
      STATUS_TEXT="unhealthy"
    elif [ "$CONSEC_ERRORS" -ge 2 ]; then
      INDICATOR="⚠️ "
      STATUS_COLOR="$YELLOW"
      STATUS_TEXT="errors($CONSEC_ERRORS)"
    fi

    # Check if above warning threshold
    WARN_PCT=$(echo "scale=1; $WARNING_T * 100" | bc 2>/dev/null || echo "80")
    ABOVE_WARN=$(echo "$PCT >= $WARN_PCT" | bc 2>/dev/null || echo "0")
    if [ "$ABOVE_WARN" = "1" ]; then
      STATUS_COLOR="$YELLOW"
      if [ "$STATUS_TEXT" = "healthy" ]; then
        STATUS_TEXT="near-limit"
        INDICATOR="⚠️ "
      fi
    fi

    # Current provider marker
    ACTIVE_MARKER=""
    if [ "$pid" = "$CURRENT" ]; then
      ACTIVE_MARKER=" ←"
    fi

    printf "  %-2s %-20s ${STATUS_COLOR}%-10s${NC} %-10s %-12s %-10s\n" \
      "$INDICATOR" \
      "${PNAME:0:20}${ACTIVE_MARKER}" \
      "$STATUS_TEXT" \
      "${PCT}%" \
      "$TOKENS_TODAY" \
      "$RPM"

    if [ -n "$LAST_ERROR" ] && [ "$LAST_ERROR" != "null" ]; then
      echo -e "       ${RED}Last error: $LAST_ERROR${NC}"
    fi
  done

  echo ""

  # ─── Context Snapshot ──────────────────────────────────────────────────────
  echo -e "${BOLD}  CONTEXT SNAPSHOT${NC}"
  echo -e "  ─────────────────────────────────────────────────────────"
  if [ -f "$SNAPSHOT_FILE" ]; then
    SNAP_TS=$(jq -r '.timestamp // "never"' "$SNAPSHOT_FILE")
    SNAP_TASK=$(jq -r '.active_task // "unknown"' "$SNAPSHOT_FILE")
    SNAP_PROJECTS=$(jq -r '.active_projects | join(", ")' "$SNAPSHOT_FILE" 2>/dev/null || echo "none")
    echo -e "  ${BOLD}Last snapshot:${NC} $SNAP_TS"
    echo -e "  ${BOLD}Active task:${NC}   $SNAP_TASK"
    echo -e "  ${BOLD}Projects:${NC}      $SNAP_PROJECTS"
  else
    echo -e "  ${YELLOW}No snapshot available yet${NC}"
  fi

  echo ""

  # ─── Switch History ────────────────────────────────────────────────────────
  if [ "$SHOW_HISTORY" = true ]; then
    echo -e "${BOLD}  SWITCH HISTORY (last 10)${NC}"
    echo -e "  ─────────────────────────────────────────────────────────"

    SWITCH_COUNT=$(jq '.switches | length' "$SWITCH_HISTORY" 2>/dev/null || echo "0")
    if [ "$SWITCH_COUNT" -gt 0 ]; then
      jq -r '.switches | reverse | .[0:10] | .[] | 
        "  [\(.timestamp)] \(.from.name) → \(.to.name) | \(.reason) | \(.active_task[0:50])"' \
        "$SWITCH_HISTORY" 2>/dev/null
    else
      echo -e "  ${GREEN}No switches yet — system running on primary provider${NC}"
    fi
    echo ""
  else
    SWITCH_COUNT=$(jq '.switches | length' "$SWITCH_HISTORY" 2>/dev/null || echo "0")
    LAST_SWITCH=$(jq -r '.switches | last | .timestamp // "never"' "$SWITCH_HISTORY" 2>/dev/null || echo "never")
    echo -e "${BOLD}  SWITCH HISTORY${NC}"
    echo -e "  Total switches: ${BOLD}$SWITCH_COUNT${NC}  |  Last: $LAST_SWITCH"
    echo -e "  Run ${CYAN}./status.sh --history${NC} for full history"
    echo ""
  fi

  # ─── Recent logs ───────────────────────────────────────────────────────────
  echo -e "${BOLD}  RECENT ACTIVITY (last 5 log entries)${NC}"
  echo -e "  ─────────────────────────────────────────────────────────"
  if [ -f "$LOG_FILE" ]; then
    tail -5 "$LOG_FILE" | while read -r line; do
      if echo "$line" | grep -qi "error\|fail"; then
        echo -e "  ${RED}$line${NC}"
      elif echo "$line" | grep -qi "failover\|switch\|warn"; then
        echo -e "  ${YELLOW}$line${NC}"
      else
        echo -e "  $line"
      fi
    done
  else
    echo -e "  ${YELLOW}No log file yet${NC}"
  fi

  echo ""
  echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}${CYAN}║  Commands: ./sentinel.sh  ./context-snapshot.sh          ║${NC}"
  echo -e "${BOLD}${CYAN}║  Add provider: ./add-provider.sh --id ... --provider ... ║${NC}"
  echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
}

if [ "$WATCH_MODE" = true ]; then
  echo "Watching... (Ctrl+C to stop)"
  while true; do
    show_dashboard
    sleep 30
  done
else
  show_dashboard
fi
