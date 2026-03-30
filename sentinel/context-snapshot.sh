#!/bin/bash
# =============================================================================
# AI Sentinel - Context Snapshot Bot
# Roda a cada 10 minutos via crontab
# Captura estado atual da sessão para recuperação em caso de failover
# =============================================================================

SENTINEL_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel"
SNAPSHOT_FILE="$SENTINEL_DIR/context-snapshot.json"
LOG_FILE="$SENTINEL_DIR/sentinel.log"
CONTEXTO_ATIVO="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/contexto-ativo.md"
HEARTBEAT_FILE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/HEARTBEAT.md"
MEMORY_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/memory"

DATE_LOCAL=$(date "+%Y-%m-%d %H:%M:%S")
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TODAY=$(date "+%Y-%m-%d")
YESTERDAY=$(date -v-1d "+%Y-%m-%d" 2>/dev/null || date -d "yesterday" "+%Y-%m-%d" 2>/dev/null)

log() {
  echo "[$DATE_LOCAL] [context-snapshot] $1" >> "$LOG_FILE"
}

log "=== Context snapshot started ==="

if ! command -v jq &>/dev/null; then
  log "ERROR: jq not found"
  exit 1
fi

# ─── Extrai projetos ativos do contexto-ativo.md ──────────────────────────────
ACTIVE_PROJECTS=()
PENDING_PROMISES=()
ACTIVE_TASK="Sistema operando normalmente"

if [ -f "$CONTEXTO_ATIVO" ]; then
  # Extrai projetos em andamento
  while IFS= read -r line; do
    # Linhas com | Projeto | Estado | - tabela markdown
    if echo "$line" | grep -qE '^\| \*\*'; then
      PROJECT=$(echo "$line" | sed 's/.*\*\*\(.*\)\*\*.*/\1/' | xargs)
      if [ -n "$PROJECT" ]; then
        ACTIVE_PROJECTS+=("$PROJECT")
      fi
    fi
  done < "$CONTEXTO_ATIVO"

  # Extrai promessas pendentes
  INSIDE_PROMISES=false
  while IFS= read -r line; do
    if echo "$line" | grep -qiE '(Promessas|Promises|PENDENTE)'; then
      INSIDE_PROMISES=true
    fi
    if $INSIDE_PROMISES && echo "$line" | grep -qE '^\- \*\*Tita prometeu'; then
      PROMISE=$(echo "$line" | sed 's/- \*\*Tita prometeu\*\*: //' | xargs)
      PENDING_PROMISES+=("$PROMISE")
    fi
    # Para de capturar na próxima seção
    if $INSIDE_PROMISES && echo "$line" | grep -qE '^---$'; then
      INSIDE_PROMISES=false
    fi
  done < "$CONTEXTO_ATIVO"

  # Detecta tarefa ativa (última entrada de tarefas de alta prioridade)
  ALTA_PRIO=$(grep -A2 "Alta Prioridade" "$CONTEXTO_ATIVO" | grep "^\- \[" | head -1 | sed 's/- \[ \] //' | xargs)
  if [ -n "$ALTA_PRIO" ]; then
    ACTIVE_TASK="$ALTA_PRIO"
  fi

  log "Extracted ${#ACTIVE_PROJECTS[@]} projects, ${#PENDING_PROMISES[@]} promises"
fi

# ─── Extrai resumo da memória de hoje ─────────────────────────────────────────
RECENT_SUMMARY=""
MEMORY_TODAY="$MEMORY_DIR/${TODAY}.md"
MEMORY_YESTERDAY="$MEMORY_DIR/${YESTERDAY}.md"

if [ -f "$MEMORY_TODAY" ]; then
  # Pega as últimas 50 linhas do arquivo de memória de hoje
  RECENT_SUMMARY=$(tail -50 "$MEMORY_TODAY" 2>/dev/null | head -c 2000)
  log "Memory today loaded: $MEMORY_TODAY"
elif [ -f "$MEMORY_YESTERDAY" ]; then
  RECENT_SUMMARY=$(tail -30 "$MEMORY_YESTERDAY" 2>/dev/null | head -c 1000)
  log "Memory yesterday loaded: $MEMORY_YESTERDAY"
else
  RECENT_SUMMARY="Sem memória recente disponível."
  log "No recent memory file found"
fi

# ─── Lê HEARTBEAT.md para tarefas pendentes ───────────────────────────────────
HEARTBEAT_TASKS=""
if [ -f "$HEARTBEAT_FILE" ]; then
  HEARTBEAT_TASKS=$(cat "$HEARTBEAT_FILE" | head -c 1000)
fi

# ─── Lê provider atual ────────────────────────────────────────────────────────
CURRENT_PROVIDER="anthropic-primary"
USAGE_FILE="$SENTINEL_DIR/usage-state.json"
if [ -f "$USAGE_FILE" ]; then
  CURRENT_PROVIDER=$(jq -r '.current_provider // "anthropic-primary"' "$USAGE_FILE")
fi

# ─── Monta recovery prompt ────────────────────────────────────────────────────
PROJECTS_STR=$(IFS=', '; echo "${ACTIVE_PROJECTS[*]:-Sem projetos detectados}")
PROMISES_STR=$(IFS='; '; echo "${PENDING_PROMISES[*]:-Nenhuma promessa pendente}")

RECOVERY_PROMPT="Você é Tita, assistente IA da equipe Titanio.

CONTEXTO ATUAL (capturado em $DATE_LOCAL):

TAREFA EM ANDAMENTO: $ACTIVE_TASK

PROJETOS ATIVOS: $PROJECTS_STR

PROMESSAS PENDENTES: $PROMISES_STR

RESUMO DAS ÚLTIMAS ATIVIDADES:
$RECENT_SUMMARY

TAREFAS DO HEARTBEAT:
$HEARTBEAT_TASKS

INSTRUÇÕES:
- Continue exatamente de onde o sistema anterior parou
- Eduardo é seu usuário principal (+553183838181)
- Você está no Mac Mini /Volumes/TITA_039/MAC_MINI_03/
- Provider anterior: $CURRENT_PROVIDER
- Workspace: /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/
- Se Eduardo não reagiu ainda, continue o trabalho silenciosamente
- Leia contexto-ativo.md para estado completo dos projetos"

# ─── Salva snapshot ───────────────────────────────────────────────────────────
PROJECTS_JSON=$(printf '%s\n' "${ACTIVE_PROJECTS[@]}" | jq -R . | jq -s .)
PROMISES_JSON=$(printf '%s\n' "${PENDING_PROMISES[@]}" | jq -R . | jq -s .)

if [ ${#ACTIVE_PROJECTS[@]} -eq 0 ]; then
  PROJECTS_JSON='["GospIA iOS","VoxDescriber","Maricá Film Commission","Titanio 47"]'
fi

if [ ${#PENDING_PROMISES[@]} -eq 0 ]; then
  PROMISES_JSON='["Avisar Zica quando build iOS GospIA passar"]'
fi

TMPFILE=$(mktemp)
jq -n \
  --arg ts "$TS" \
  --arg task "$ACTIVE_TASK" \
  --arg summary "$RECENT_SUMMARY" \
  --argjson projects "$PROJECTS_JSON" \
  --argjson promises "$PROMISES_JSON" \
  --arg recovery "$RECOVERY_PROMPT" \
  --arg provider "$CURRENT_PROVIDER" \
  '{
    timestamp: $ts,
    active_task: $task,
    recent_messages_summary: $summary,
    active_projects: $projects,
    pending_promises: $promises,
    current_provider: $provider,
    recovery_prompt: $recovery
  }' > "$TMPFILE" && mv "$TMPFILE" "$SNAPSHOT_FILE"

log "Snapshot saved: task='$ACTIVE_TASK', projects=${#ACTIVE_PROJECTS[@]}, promises=${#PENDING_PROMISES[@]}"
log "=== Context snapshot complete ==="
