#!/bin/bash
# ============================================
# start-n8n.sh — Titanio N8n Launcher
# Mac Mini M1 · macOS
# ============================================

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[N8n]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

# ── Pré-checks ────────────────────────────────────────────────────────────────

log "Verificando dependências..."

command -v docker >/dev/null 2>&1 || err "Docker não encontrado. Instale em https://docker.com"

docker info >/dev/null 2>&1 || err "Docker não está rodando. Abra o Docker Desktop."

# ── .env ──────────────────────────────────────────────────────────────────────

if [ ! -f ".env" ]; then
  warn ".env não encontrado — copiando de .env.example..."
  cp .env.example .env 2>/dev/null || warn "Crie o arquivo .env manualmente."
fi

source .env 2>/dev/null || true

# ── Diretórios ────────────────────────────────────────────────────────────────

log "Criando diretórios necessários..."
mkdir -p "${N8N_DATA_PATH:-./data}"
mkdir -p ./workflows

# Permissões (N8n roda como uid 1000 dentro do container)
chmod 755 "${N8N_DATA_PATH:-./data}"

# ── Verificar serviços locais ──────────────────────────────────────────────────

log "Verificando serviços Titanio..."

if curl -s --connect-timeout 2 http://localhost:4444/health >/dev/null 2>&1; then
  log "✅ Titanio Dashboard (4444) → online"
else
  warn "⚠️  Titanio Dashboard (4444) → offline (N8n vai subir mesmo assim)"
fi

if curl -s --connect-timeout 2 http://localhost:18789 >/dev/null 2>&1; then
  log "✅ OpenClaw (18789) → online"
else
  warn "⚠️  OpenClaw (18789) → offline"
fi

# ── Subir N8n ────────────────────────────────────────────────────────────────

ACTION="${1:-up}"

case "$ACTION" in
  up)
    log "Subindo N8n..."
    docker compose up -d --pull always

    log "Aguardando N8n ficar pronto..."
    for i in {1..20}; do
      if curl -s http://localhost:5678/healthz >/dev/null 2>&1; then
        echo ""
        log "🚀 N8n está online!"
        break
      fi
      printf "."
      sleep 2
    done

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🔧 N8n Titanio Dashboard"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  URL:      http://192.168.18.174:5678"
    echo "  Local:    http://localhost:5678"
    echo "  User:     ${N8N_USER:-titanio}"
    echo "  Pass:     ${N8N_PASSWORD:-titanio2026}"
    echo ""
    echo "  Webhooks:"
    echo "  → http://192.168.18.174:5678/webhook/bot-task-done"
    echo "  → http://192.168.18.174:5678/webhook/dashboard-event"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ;;

  down)
    log "Parando N8n..."
    docker compose down
    log "N8n parado."
    ;;

  restart)
    log "Reiniciando N8n..."
    docker compose restart
    log "N8n reiniciado."
    ;;

  logs)
    docker compose logs -f n8n
    ;;

  status)
    docker compose ps
    ;;

  backup)
    BACKUP_FILE="./workflows/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    log "Criando backup em $BACKUP_FILE..."
    tar -czf "$BACKUP_FILE" "${N8N_DATA_PATH:-./data}"
    log "✅ Backup salvo: $BACKUP_FILE"
    ;;

  export-workflows)
    log "Exportando workflows via API..."
    mkdir -p ./workflows/exported
    curl -s -u "${N8N_USER:-titanio}:${N8N_PASSWORD:-titanio2026}" \
      http://localhost:5678/api/v1/workflows \
      | python3 -m json.tool > ./workflows/exported/all-$(date +%Y%m%d).json
    log "✅ Workflows exportados: ./workflows/exported/"
    ;;

  *)
    echo "Uso: $0 [up|down|restart|logs|status|backup|export-workflows]"
    exit 1
    ;;
esac
