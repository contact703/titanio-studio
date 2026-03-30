#!/bin/bash
# titanio-backup.sh — Backup automático diário
# Copia: memória, configs, projetos, especialistas → TITA_039/backup + git push
# LaunchAgent: com.tita.backup (diário 04:00)

set -e

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
BACKUP_BASE="/Volumes/TITA_039/backup-projetos"
DATE=$(date +%Y-%m-%d)
BACKUP_DIR="$BACKUP_BASE/daily-$DATE"
LOG="/tmp/titanio-backup.log"

log() { echo "[$(date '+%H:%M')] $1" >> "$LOG"; echo "$1"; }

log "💾 BACKUP DIÁRIO — $DATE"

mkdir -p "$BACKUP_DIR"/{memory,config,specialists,projects}

# 1. Memória
log "  1/5 Memória..."
cp -r "$WORKSPACE/memory/"*.md "$BACKUP_DIR/memory/" 2>/dev/null || true
cp -r "$WORKSPACE/memory/"*.json "$BACKUP_DIR/memory/" 2>/dev/null || true
cp "$WORKSPACE/MEMORY.md" "$WORKSPACE/LESSONS.md" "$WORKSPACE/AGENTS.md" "$WORKSPACE/SOUL.md" "$BACKUP_DIR/config/" 2>/dev/null || true
cp "$WORKSPACE/SESSION-CONTEXT.md" "$WORKSPACE/HEARTBEAT.md" "$BACKUP_DIR/config/" 2>/dev/null || true

# 2. Especialistas
log "  2/5 Especialistas..."
cp -r "$WORKSPACE/pasta-do-tita/memoria-especialistas" "$BACKUP_DIR/specialists/" 2>/dev/null || true

# 3. Contexto ativo
log "  3/5 Contexto..."
cp "$WORKSPACE/pasta-do-tita/contexto-ativo.md" "$BACKUP_DIR/config/" 2>/dev/null || true
cp "$WORKSPACE/pasta-do-tita/group-context-snapshot.md" "$BACKUP_DIR/config/" 2>/dev/null || true
cp "$WORKSPACE/pasta-do-tita/PROJETOS-MASTER.md" "$BACKUP_DIR/config/" 2>/dev/null || true

# 4. tmem data
log "  4/5 tmem..."
cp "$WORKSPACE/memory/context-tree.json" "$WORKSPACE/memory/curated-knowledge.json" "$BACKUP_DIR/memory/" 2>/dev/null || true
cp "$WORKSPACE/memory/tita-memory.db" "$BACKUP_DIR/memory/" 2>/dev/null || true

# 5. Git push
log "  5/5 Git push..."
cd "$WORKSPACE"
git add -A 2>/dev/null || true
git commit -m "💾 backup: daily $DATE" 2>/dev/null || true
git push tita-memory HEAD:main --force 2>/dev/null &

# Tamanho
SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')
log "✅ Backup completo: $BACKUP_DIR ($SIZE)"

# Limpar backups antigos (manter últimos 7 dias)
find "$BACKUP_BASE" -maxdepth 1 -name "daily-*" -mtime +7 -exec rm -rf {} \; 2>/dev/null
log "🧹 Backups antigos limpos (>7 dias)"
