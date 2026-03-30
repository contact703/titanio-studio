#!/bin/bash
# RESTORE POINT — 2026-03-28 Memory Engine Upgrade
# Run this to revert ALL changes from the Memory Engine v1.0 upgrade
# Usage: bash RESTORE.sh

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
BACKUP_DIR="$(dirname "$0")"

echo "🔄 Restaurando ponto de restauração de 2026-03-28..."

# Restore core files
cp "$BACKUP_DIR/MEMORY.md" "$WORKSPACE/" && echo "  ✅ MEMORY.md"
cp "$BACKUP_DIR/LESSONS.md" "$WORKSPACE/" && echo "  ✅ LESSONS.md"
cp "$BACKUP_DIR/AGENTS.md" "$WORKSPACE/" && echo "  ✅ AGENTS.md"
cp "$BACKUP_DIR/HEARTBEAT.md" "$WORKSPACE/" && echo "  ✅ HEARTBEAT.md"
cp "$BACKUP_DIR/USER.md" "$WORKSPACE/" && echo "  ✅ USER.md"
cp "$BACKUP_DIR/TOOLS.md" "$WORKSPACE/" && echo "  ✅ TOOLS.md"
cp "$BACKUP_DIR/SOUL.md" "$WORKSPACE/" && echo "  ✅ SOUL.md"

# Restore daily memory files
cp "$BACKUP_DIR/memory-daily/"*.md "$WORKSPACE/memory/" 2>/dev/null && echo "  ✅ Daily memory files"

# Remove new files added by upgrade
rm -f "$WORKSPACE/memory/tita-memory.db" && echo "  🗑️  Removed tita-memory.db"
rm -f "$WORKSPACE/bin/tita-memory-engine.py" && echo "  🗑️  Removed tita-memory-engine.py"
rm -f "$WORKSPACE/bin/tita-memory-graph.py" && echo "  🗑️  Removed tita-memory-graph.py"
rm -f "$WORKSPACE/bin/tita-memory-refresh.sh" && echo "  🗑️  Removed tita-memory-refresh.sh"

echo ""
echo "✅ Restauração completa! Sistema voltou ao estado de 28/03/2026 pré-upgrade."
echo "⚠️  Reinicie o OpenClaw para garantir: openclaw gateway restart"
