#!/bin/bash
# security-fix.sh — Corrige vulnerabilidades encontradas
# REQUER SUDO: sudo bash bin/security-fix.sh

set -e

echo "🔒 TITANIO SECURITY FIX"
echo "========================"
echo ""

# 1. LIGAR FIREWALL
echo "[1/4] Ligando Firewall..."
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setblockall off
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setallowsigned on
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setstealthmode on
echo "  ✅ Firewall ligado + stealth mode"

# 2. BLOQUEAR PORTAS (via pf firewall)
echo ""
echo "[2/4] Configurando regras de rede..."
# Criar regras pf pra bloquear acesso externo às portas internas
cat > /tmp/titanio-pf.rules << 'PF'
# Titanio Security Rules
# Bloquear acesso externo às portas internas
# Permitir apenas localhost e rede local (192.168.18.0/24)

# Dashboard
pass in on lo0 proto tcp from any to any port 4444
pass in proto tcp from 192.168.18.0/24 to any port 4444
block in proto tcp from any to any port 4444

# Frontend
pass in on lo0 proto tcp from any to any port 3000
pass in proto tcp from 192.168.18.0/24 to any port 3000
block in proto tcp from any to any port 3000

# N8n
pass in on lo0 proto tcp from any to any port 5678
pass in proto tcp from 192.168.18.0/24 to any port 5678
block in proto tcp from any to any port 5678

# ComfyUI (precisa de rede pra Helber/Tiago)
pass in on lo0 proto tcp from any to any port 8188
pass in proto tcp from 192.168.18.0/24 to any port 8188
block in proto tcp from any to any port 8188

# Ollama (só localhost)
pass in on lo0 proto tcp from any to any port 11434
block in proto tcp from any to any port 11434
PF
echo "  ✅ Regras criadas (rede local 192.168.18.0/24 permitida)"
echo "  ⚠️ Para ativar: sudo pfctl -ef /tmp/titanio-pf.rules"

# 3. PERMISSÕES
echo ""
echo "[3/4] Reforçando permissões..."
WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
chmod 700 "$WORKSPACE/pasta-do-tita/cofre/" 2>/dev/null
chmod 600 "$WORKSPACE/pasta-do-tita/cofre/"* 2>/dev/null
chmod 600 "$WORKSPACE/projetos/polymarket-agent/data/bot-api-creds.json" 2>/dev/null
echo "  ✅ Cofre e credenciais protegidos"

# 4. GIT HISTORY CLEANUP
echo ""
echo "[4/4] Limpeza do Git..."
echo "  ⚠️ Credenciais encontradas no histórico:"
cd "$WORKSPACE"
git log --all --diff-filter=A --name-only --pretty=format:'' -- "*credential*" "*cofre*" "*wallet*" "*secret*" 2>/dev/null | sort -u | head -10
echo ""
echo "  Para limpar: git filter-repo --invert-paths --path pasta-do-tita/cofre/ --force"
echo "  (instalar: pip3 install git-filter-repo)"

echo ""
echo "========================"
echo "✅ Security fixes aplicados!"
echo ""
echo "MANUAL (precisa fazer):"
echo "  1. sudo pfctl -ef /tmp/titanio-pf.rules  (ativar bloqueio de portas)"
echo "  2. pip3 install git-filter-repo && git filter-repo --invert-paths --path pasta-do-tita/cofre/ --force"
echo "  3. Rotacionar tokens GitHub se estiveram no histórico"
