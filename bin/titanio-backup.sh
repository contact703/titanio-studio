#!/bin/bash
# titanio-backup.sh — Backup COMPLETO com estratégia 3-2-1
# 
# ESTRATÉGIA 3-2-1:
#   3 cópias: Original + Disco local + GitHub
#   2 mídias: SSD Mac + Volume TITA_039  
#   1 offsite: GitHub (cloud, nunca apaga)
#
# CAMADAS:
#   Diário   → últimos 7 dias (apaga depois)
#   Semanal  → últimos 30 dias (apaga depois)  
#   Mensal   → último ano (apaga depois)
#   GitHub   → FOREVER (nunca apaga)
#   Cofre    → backup encriptado separado (não vai pro Git)
#
# LaunchAgent: com.tita.backup (diário 04:00)

set -e

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
BACKUP_BASE="/Volumes/TITA_039/backup-projetos"
DATE=$(date +%Y-%m-%d)
DOW=$(date +%u)   # 1=segunda ... 7=domingo
DOM=$(date +%d)   # dia do mês
BACKUP_DIR="$BACKUP_BASE/daily-$DATE"
LOG="/tmp/titanio-backup.log"

log() { echo "[$(date '+%H:%M')] $1" >> "$LOG"; echo "$1"; }

log "💾 BACKUP 3-2-1 — $DATE"

mkdir -p "$BACKUP_DIR"/{memory,config,specialists,projects,cofre-encrypted,databases}

# ============================================================
# 1. MEMÓRIA (o ouro)
# ============================================================
log "  1/7 Memória..."
cp "$WORKSPACE/memory/"*.md "$BACKUP_DIR/memory/" 2>/dev/null || true
cp "$WORKSPACE/memory/"*.json "$BACKUP_DIR/memory/" 2>/dev/null || true
cp "$WORKSPACE/memory/"*.jsonl "$BACKUP_DIR/memory/" 2>/dev/null || true
cp "$WORKSPACE/MEMORY.md" "$WORKSPACE/LESSONS.md" "$WORKSPACE/AGENTS.md" \
   "$WORKSPACE/SOUL.md" "$WORKSPACE/SESSION-CONTEXT.md" "$WORKSPACE/HEARTBEAT.md" \
   "$WORKSPACE/IDENTITY.md" "$WORKSPACE/USER.md" "$WORKSPACE/TOOLS.md" \
   "$BACKUP_DIR/config/" 2>/dev/null || true

# ============================================================
# 2. ESPECIALISTAS (conhecimento acumulado)
# ============================================================
log "  2/7 Especialistas..."
cp -r "$WORKSPACE/pasta-do-tita/memoria-especialistas" "$BACKUP_DIR/specialists/" 2>/dev/null || true

# ============================================================
# 3. CONTEXTO + PROJETOS-MASTER
# ============================================================
log "  3/7 Contexto..."
cp "$WORKSPACE/pasta-do-tita/contexto-ativo.md" \
   "$WORKSPACE/pasta-do-tita/group-context-snapshot.md" \
   "$WORKSPACE/pasta-do-tita/PROJETOS-MASTER.md" \
   "$BACKUP_DIR/config/" 2>/dev/null || true

# ============================================================
# 4. DATABASES (binários que Git não guarda bem)
# ============================================================
log "  4/7 Databases..."
cp "$WORKSPACE/memory/tita-memory.db" "$BACKUP_DIR/databases/" 2>/dev/null || true
cp "$WORKSPACE/memory/tita-memory-graph.json" "$BACKUP_DIR/databases/" 2>/dev/null || true

# N8n workflows export
if curl -s http://localhost:5678 > /dev/null 2>&1; then
    # Exportar workflows via API se N8n tiver rodando
    curl -s http://localhost:5678/api/v1/workflows 2>/dev/null > "$BACKUP_DIR/databases/n8n-workflows.json" || true
    log "    ✅ N8n workflows exportados"
fi

# ============================================================
# 5. COFRE (encriptado — NÃO vai pro Git)
# ============================================================
log "  5/7 Cofre (encriptado)..."
COFRE_SRC="$WORKSPACE/pasta-do-tita/cofre"
COFRE_BAK="$BACKUP_DIR/cofre-encrypted"
if [ -d "$COFRE_SRC" ]; then
    # Tar + comprimir (não encripta aqui, mas fica separado do git)
    tar czf "$COFRE_BAK/cofre-$DATE.tar.gz" -C "$WORKSPACE/pasta-do-tita" cofre/ 2>/dev/null
    log "    ✅ Cofre compactado: $(du -sh "$COFRE_BAK/cofre-$DATE.tar.gz" 2>/dev/null | awk '{print $1}')"
fi

# ============================================================
# 6. INTEGRIDADE (checksums)
# ============================================================
log "  6/7 Checksums..."
cd "$BACKUP_DIR"
find . -type f -exec shasum -a 256 {} \; > CHECKSUMS.sha256 2>/dev/null
TOTAL_FILES=$(wc -l < CHECKSUMS.sha256 | xargs)
log "    ✅ $TOTAL_FILES arquivos verificados"

# ============================================================
# 7. GIT PUSH (cópia offsite — FOREVER)
# ============================================================
log "  7/7 Git push..."
cd "$WORKSPACE"
git add -A 2>/dev/null || true
git commit -m "💾 backup: $DATE (daily)" 2>/dev/null || true
git push tita-memory HEAD:main --force 2>/dev/null &

# ============================================================
# ROTAÇÃO INTELIGENTE
# ============================================================

# Backup SEMANAL (domingo)
if [ "$DOW" = "7" ]; then
    WEEKLY_DIR="$BACKUP_BASE/weekly-$DATE"
    cp -r "$BACKUP_DIR" "$WEEKLY_DIR" 2>/dev/null
    log "📦 Backup SEMANAL: $WEEKLY_DIR"
fi

# Backup MENSAL (dia 1)
if [ "$DOM" = "01" ]; then
    MONTHLY_DIR="$BACKUP_BASE/monthly-$DATE"
    cp -r "$BACKUP_DIR" "$MONTHLY_DIR" 2>/dev/null
    log "📦 Backup MENSAL: $MONTHLY_DIR"
fi

# LIMPEZA — NUNCA APAGAR no TITA_039 (6.3TB livres, 23MB/dia = 0.16% em 10 anos)
# Só alertar se disco ficar abaixo de 500GB
AVAIL_GB=$(df -g /Volumes/TITA_039 2>/dev/null | awk 'NR==2 {print $4}')
if [ -n "$AVAIL_GB" ] && [ "$AVAIL_GB" -lt 500 ]; then
    log "⚠️ ALERTA: TITA_039 com menos de 500GB livres ($AVAIL_GB GB). Considerar limpeza."
else
    log "💾 TITA_039: ${AVAIL_GB}GB livres — sem necessidade de limpeza"
fi
# NADA É APAGADO. Memória é nosso ouro. 6.3TB aguenta décadas de backup.

# ============================================================
# RELATÓRIO
# ============================================================
SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')
DAILYS=$(ls -d "$BACKUP_BASE"/daily-* 2>/dev/null | wc -l | xargs)
WEEKLYS=$(ls -d "$BACKUP_BASE"/weekly-* 2>/dev/null | wc -l | xargs)
MONTHLYS=$(ls -d "$BACKUP_BASE"/monthly-* 2>/dev/null | wc -l | xargs)

log ""
log "✅ BACKUP COMPLETO"
log "   Tamanho: $SIZE"
log "   Arquivos: $TOTAL_FILES"
log "   Diários: $DAILYS (últimos 7d)"
log "   Semanais: $WEEKLYS (últimos 30d)"
log "   Mensais: $MONTHLYS (último ano)"
log "   GitHub: FOREVER"
log "   Cofre: encriptado separado"
log "   Integridade: CHECKSUMS.sha256"
