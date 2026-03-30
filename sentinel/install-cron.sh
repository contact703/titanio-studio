#!/bin/bash
# =============================================================================
# AI Sentinel - Crontab Installer
# Execute manualmente para instalar os cron jobs do Sentinel
# =============================================================================

echo "🛡️  Installing AI Sentinel cron jobs..."

# Verifica se já está instalado
if crontab -l 2>/dev/null | grep -q "sentinel.sh"; then
  echo "⚠️  Sentinel cron jobs already installed!"
  crontab -l | grep sentinel
  exit 0
fi

(crontab -l 2>/dev/null; cat << 'CRON'

# AI Sentinel - Monitor principal (a cada 2 minutos)
*/2 * * * * bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/sentinel.sh >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/sentinel.log 2>&1

# AI Sentinel - Context snapshot (a cada 10 minutos)
*/10 * * * * bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/context-snapshot.sh >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/sentinel.log 2>&1
CRON
) | crontab -

if [ $? -eq 0 ]; then
  echo "✅ Cron jobs installed successfully!"
  echo ""
  echo "Active sentinel cron jobs:"
  crontab -l | grep sentinel
else
  echo "❌ Failed to install cron jobs automatically."
  echo ""
  echo "Please add these lines manually with: crontab -e"
  echo ""
  echo "*/2 * * * * bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/sentinel.sh >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/sentinel.log 2>&1"
  echo "*/10 * * * * bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/context-snapshot.sh >> /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/sentinel.log 2>&1"
fi
