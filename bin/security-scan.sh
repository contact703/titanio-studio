#!/bin/bash
# security-scan.sh — Scan automático de segurança
# Roda: bash bin/security-scan.sh
# Cron: Segunda 09:00 (via HEARTBEAT.md)

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
REPORT="$WORKSPACE/squad/reports/security-scan-$(date +%Y-%m-%d).md"
ISSUES=0

echo "# 🔓 Security Scan — $(date '+%Y-%m-%d %H:%M')" > "$REPORT"
echo "" >> "$REPORT"

# 1. Firewall
FW=$(/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null)
if echo "$FW" | grep -q "disabled"; then
    echo "- 🔴 **FIREWALL DESLIGADO**" >> "$REPORT"
    ISSUES=$((ISSUES+1))
else
    echo "- ✅ Firewall ativo" >> "$REPORT"
fi

# 2. Portas expostas
echo "" >> "$REPORT"
echo "## Portas expostas na rede" >> "$REPORT"
for port in 3000 4444 5678 8765 9621 8188; do
    if lsof -iTCP:$port -sTCP:LISTEN -n -P 2>/dev/null | grep -q "*:$port"; then
        echo "- 🔴 Porta $port EXPOSTA" >> "$REPORT"
        ISSUES=$((ISSUES+1))
    fi
done

# 3. Endpoints sem auth
echo "" >> "$REPORT"
echo "## Endpoints sem autenticação" >> "$REPORT"
for ep in health squad tasks system billing projects bots; do
    S=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4444/api/$ep" --max-time 2 2>/dev/null)
    if [ "$S" = "200" ]; then
        echo "- ❌ /api/$ep ABERTO" >> "$REPORT"
        ISSUES=$((ISSUES+1))
    fi
done

# 4. Cofre permissões
echo "" >> "$REPORT"
echo "## Cofre" >> "$REPORT"
PERM=$(stat -f "%Sp" "$WORKSPACE/pasta-do-tita/cofre/" 2>/dev/null)
if [ "$PERM" = "drwx------" ]; then
    echo "- ✅ Cofre: permissões corretas ($PERM)" >> "$REPORT"
else
    echo "- 🔴 Cofre: permissões fracas ($PERM)" >> "$REPORT"
    ISSUES=$((ISSUES+1))
fi

# 5. Resumo
echo "" >> "$REPORT"
echo "---" >> "$REPORT"
echo "**Issues encontradas: $ISSUES**" >> "$REPORT"
echo "**Scan:** $(date '+%H:%M %d/%m/%Y')" >> "$REPORT"

echo "🔓 Scan completo: $ISSUES issues → $REPORT"
cat "$REPORT"
