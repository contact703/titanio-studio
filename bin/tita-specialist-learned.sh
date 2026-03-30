#!/bin/bash
# Hook pós-tarefa: registra aprendizado no LESSONS.md do especialista
# Usage: tita-specialist-learned.sh <specialist-id> <task-id> <learning-text>

SPECIALIST=$1
TASK_ID=$2
LEARNING=$3
WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
SPEC_DIR="$WORKSPACE/pasta-do-tita/memoria-especialistas/$SPECIALIST"
LESSONS="$SPEC_DIR/LESSONS.md"
DATE=$(date '+%Y-%m-%d %H:%M')

if [ -z "$SPECIALIST" ] || [ -z "$LEARNING" ]; then
    echo "Usage: tita-specialist-learned.sh <specialist> <task-id> <learning>"
    exit 1
fi

# Ensure LESSONS.md exists
if [ ! -f "$LESSONS" ]; then
    echo "# $SPECIALIST — Lições" > "$LESSONS"
    echo "## Regras" >> "$LESSONS"
    echo "- Atualizar após cada tarefa" >> "$LESSONS"
fi

# Dedup check — don't add if same learning already exists
if grep -qF "$LEARNING" "$LESSONS" 2>/dev/null; then
    echo "⚠️ Lição já existe (dedup), ignorando"
    exit 0
fi

# Smart limit — if LESSONS > 500 lines, remove oldest entries (keep last 400)
LINE_COUNT=$(wc -l < "$LESSONS")
if [ "$LINE_COUNT" -gt 500 ]; then
    echo "🧹 Smart limit: $LINE_COUNT lines → keeping last 400"
    tail -400 "$LESSONS" > "${LESSONS}.tmp"
    mv "${LESSONS}.tmp" "$LESSONS"
fi

# Append learning
echo "" >> "$LESSONS"
echo "## $DATE — Task $TASK_ID" >> "$LESSONS"
echo "- $LEARNING" >> "$LESSONS"

# Log to Lightning
python3 "$WORKSPACE/bin/tita-lightning-bridge.py" log "$SPECIALIST" "Task $TASK_ID learned" success 8 "$LEARNING" 2>/dev/null

echo "✅ Lição registrada para $SPECIALIST"
