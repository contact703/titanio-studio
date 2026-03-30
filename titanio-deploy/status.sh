#!/bin/bash
# status.sh — Verificar saúde do app em todos os Macs

SSH_USER="contacttitanio"
SSH_KEY="$HOME/.ssh/id_ed25519"

declare -A MACS=(
  ["mac1"]="192.168.18.174"
  ["mac2"]="192.168.18.XXX"
)

ssh_run() { ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$SSH_USER@$1" "$2" 2>/dev/null; }

check() {
  local name=$1 host=$2
  printf "\n%-10s (%s)\n" "$name" "$host"

  # Conectividade
  if ! ssh_run "$host" "true"; then
    echo "  ❌ SSH inacessível"; return
  fi

  # Backend
  ssh_run "$host" "curl -sf http://localhost:4444/health > /dev/null" \
    && echo "  ✅ Backend  :4444 → UP" \
    || echo "  ❌ Backend  :4444 → DOWN"

  # Frontend
  ssh_run "$host" "curl -sf http://localhost:3000 > /dev/null" \
    && echo "  ✅ Frontend :3000 → UP" \
    || echo "  ❌ Frontend :3000 → DOWN"

  # RAM
  local free_pages; free_pages=$(ssh_run "$host" "vm_stat | awk '/Pages free/{print \$3}' | tr -d '.'")
  local free_mb=$(( free_pages * 4096 / 1024 / 1024 ))
  echo "  🧠 RAM livre: ~${free_mb}MB"

  # Uptime launchd
  ssh_run "$host" "launchctl list | grep titanio" | while read -r line; do
    echo "  ⚙️  $line"
  done

  # Últimas linhas de log
  echo "  📋 Backend log (últimas 3 linhas):"
  ssh_run "$host" "tail -3 ~/apps/titanio-dashboard/logs/backend.log 2>/dev/null | sed 's/^/     /'"
}

echo "═══════════════════════════════════════"
echo "  Titanio Dashboard — Status Report"
echo "  $(date '+%d/%m/%Y %H:%M') — Sao Paulo"
echo "═══════════════════════════════════════"

for name in "${!MACS[@]}"; do
  check "$name" "${MACS[$name]}"
done

echo ""
