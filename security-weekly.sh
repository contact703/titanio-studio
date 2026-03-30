#!/bin/bash
# Security Guardian — Auditoria semanal automática
# Roda toda segunda-feira via HEARTBEAT ou cron
WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
EDUARDO="+553183838181"
LOG="$WORKSPACE/memory/security-audit.log"
DATE=$(date '+%Y-%m-%d %H:%M')

log() { echo "[$DATE] $1" | tee -a "$LOG"; }
alert() {
  openclaw agent --to "$EDUARDO" --message "🔒 Security Guardian: $1" --json > /dev/null 2>&1 &
}

log "=== AUDITORIA DE SEGURANÇA SEMANAL ==="
ISSUES=0

# 1. Credenciais em texto plano
log "1. Verificando credenciais expostas..."
CREDS=$(find "$WORKSPACE" /Volumes/TITA_039/backup-projetos/gold-digger -name "*credential*" -o -name "*password*" -o -name "*secret*" 2>/dev/null | grep -v ".git" | grep -v ".age")
if [ -n "$CREDS" ]; then
  log "⚠️ RISCO: arquivos de credencial em plaintext: $CREDS"
  ISSUES=$((ISSUES+1))
fi

# 2. API keys em arquivos de texto
log "2. Verificando API keys expostas em arquivos..."
KEYS=$(grep -rl "sk_\|api_key\|API_KEY\|Bearer " "$WORKSPACE" --include="*.md" --include="*.txt" 2>/dev/null | grep -v ".git" | head -5)
if [ -n "$KEYS" ]; then
  log "⚠️ RISCO: API keys encontradas em: $KEYS"
  ISSUES=$((ISSUES+1))
fi

# 3. Portas abertas inesperadas
log "3. Verificando portas abertas..."
PORTS=$(sudo lsof -i -P -n 2>/dev/null | grep LISTEN | grep -v "4444\|3000\|5678\|11434\|18789" | head -10)
if [ -n "$PORTS" ]; then
  log "ℹ️ Portas adicionais abertas: $PORTS"
fi

# 4. Processos suspeitos
log "4. Verificando processos com alto CPU..."
PROCS=$(ps aux 2>/dev/null | awk '$3 > 50 {print $11, $3}' | grep -v "node\|Chrome\|caffeinate\|kernel_task" | head -5)
if [ -n "$PROCS" ]; then
  log "⚠️ Processos com alto CPU: $PROCS"
  ISSUES=$((ISSUES+1))
fi

# 5. Verificar watchdogs
log "5. Verificando watchdogs..."
for WD in "watchdog-full" "caffeinate" "start-autopilot"; do
  if ! pgrep -f "$WD" > /dev/null; then
    log "❌ Watchdog '$WD' não está rodando!"
    ISSUES=$((ISSUES+1))
  fi
done

# 6. Auto-atualização de conhecimento (pesquisa novas ameaças)
log "6. Pesquisando novas ameaças de segurança..."
python3 << 'PYEOF' >> "$LOG" 2>&1
import subprocess, json, datetime

task = f"Quais são as principais novas ameaças de segurança para agentes de IA em {datetime.date.today().strftime('%B %Y')}? Liste as TOP 3 mais críticas e como mitigar. Seja breve (máximo 200 palavras)."
r = subprocess.run(
    ['curl','-s','-X','POST','http://localhost:4444/api/squad/security-guardian/task',
     '-H','Content-Type: application/json',
     '-d', json.dumps({'task': task})],
    capture_output=True, text=True, timeout=60
)
try:
    print(json.loads(r.stdout).get('message','')[:400])
except: pass
PYEOF

# Relatório final
if [ $ISSUES -eq 0 ]; then
  MSG="✅ Auditoria semanal OK — nenhum problema crítico encontrado ($DATE)"
  log "$MSG"
  alert "$MSG"
else
  MSG="⚠️ Auditoria encontrou $ISSUES problema(s) — ver $LOG"
  log "$MSG"
  alert "$MSG"
fi
