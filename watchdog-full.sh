#!/bin/bash
# Watchdog completo — Tita + Backend + Frontend
# Gold Digger / Money Maker: PAUSADO por ordem de Eduardo (2026-03-19) — só volta quando Eduardo mandar
WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
BACKEND_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code/backend"
GOLD_DIR="/Volumes/TITA_039/backup-projetos/gold-digger"
LOG="$WORKSPACE/memory/watchdog-full.log"
ZICA="+553198777889"
EDUARDO="+553183838181"

notify() {
  openclaw agent --to "$EDUARDO" --message "⚠️ Watchdog: $1" --json > /dev/null 2>&1 &
}

log() { echo "[$(date '+%Y-%m-%d %H:%M')] $1" >> "$LOG"; }

log "🚀 Watchdog Full iniciado"

while true; do

  # 1. Caffeinate (Mac não dorme)
  if ! pgrep -x caffeinate > /dev/null; then
    nohup caffeinate -dims > /dev/null 2>&1 &
    log "☕ Caffeinate reiniciado"
    notify "Caffeinate reiniciado — Mac estava dormindo"
  fi

  # 2. Backend Titanio (porta 4444)
  # Usa /api/health como endpoint de healthcheck (suporta ambos old e new backend)
  BACKEND_HEALTH=$(curl -sf http://localhost:4444/api/health 2>/dev/null | grep -c '"status"' || echo 0)
  if [ "$BACKEND_HEALTH" -eq 0 ]; then
    log "🔧 Backend morto — reiniciando..."
    # Tenta diretório novo primeiro, depois o antigo
    NEW_BACKEND_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code/backend"
    TARGET_DIR="$NEW_BACKEND_DIR"
    [ ! -f "$TARGET_DIR/dist/index.js" ] && TARGET_DIR="$BACKEND_DIR"
    cd "$TARGET_DIR" && nohup node dist/index.js > /tmp/backend.log 2>&1 &
    sleep 5
    BACKEND_UP=$(curl -sf http://localhost:4444/api/health 2>/dev/null | grep -c '"status"' || echo 0)
    if [ "$BACKEND_UP" -gt 0 ]; then
      log "✅ Backend reiniciado com sucesso"
      notify "Backend Titanio reiniciado (estava morto)"
    else
      log "❌ Backend falhou ao reiniciar"
      notify "Backend Titanio FALHOU ao reiniciar — verificar manualmente"
    fi
  fi

  # 3. Frontend Titanio (porta 3000)
  # Só reinicia se processo next-server não existir E porta não responder
  # (evita conflito com rebuild em andamento)
  if ! pgrep -f "next-server" > /dev/null && ! curl -sf http://localhost:3000 > /dev/null 2>&1; then
    log "🔧 Frontend morto (processo ausente) — reiniciando..."
    FRONT_DIR="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code/frontend"
    cd "$FRONT_DIR" && nohup npx next start -p 3000 > /tmp/frontend-v2.log 2>&1 &
    sleep 5
    if curl -sf http://localhost:3000 > /dev/null 2>&1; then
      log "✅ Frontend reiniciado com sucesso"
      notify "Frontend Titanio reiniciado"
    else
      log "❌ Frontend falhou ao reiniciar"
      notify "Frontend Titanio FALHOU ao reiniciar — verificar manualmente"
    fi
  fi

  # 4. Gold Digger Autopilot (PAUSADO — loop de tarefas duplicadas, aguardando fix)
  # if ! pgrep -f "start-autopilot" > /dev/null; then
  #   nohup bash "$GOLD_DIR/scripts/start-autopilot.sh" > /dev/null 2>&1 &
  #   log "💰 Gold Digger autopilot reiniciado"
  #   notify "Gold Digger reiniciado automaticamente"
  # fi

  # 5. Email watcher — PAUSADO (Gold Digger desativado por Eduardo 2026-03-19)
  # if ! pgrep -f "email-watcher" > /dev/null; then
  #   nohup bash "$GOLD_DIR/scripts/email-watcher.sh" > /tmp/email-watcher.log 2>&1 &
  #   log "📧 Email watcher reiniciado"
  # fi

  # 6. N8n
  if ! curl -sf http://localhost:5678/healthz > /dev/null 2>&1; then
    log "🔧 N8n morto — reiniciando..."
    N8N_SECURE_COOKIE=false nohup n8n start > /tmp/n8n.log 2>&1 &
    log "N8n reiniciado"
  fi

  # Relatório a cada 6h (4 ciclos de 90min)
  HOUR=$(date +%H)
  if [[ "$HOUR" == "08" || "$HOUR" == "14" || "$HOUR" == "20" ]]; then
    MINS=$(date +%M)
    if [[ "$MINS" < "06" ]]; then
      STATUS="💓 Watchdog report $(date '+%H:%M'):
Backend: $(curl -sf http://localhost:4444/api/health 2>/dev/null | grep -q '"status"' && echo '✅' || echo '❌')
Frontend: $(curl -sf http://localhost:3000 > /dev/null 2>&1 && echo '✅' || echo '❌')
Gold Digger: ⏸️ PAUSADO
N8n: $(curl -sf http://localhost:5678/healthz > /dev/null 2>&1 && echo '✅' || echo '❌')"
      openclaw agent --to "$EDUARDO" --message "$STATUS" --json > /dev/null 2>&1 &
    fi
  fi

  sleep 90  # checar a cada 90 segundos
done
