#!/bin/bash
# TITA Memory Auto-Refresh — runs alongside memory-watchdog
# Checks for changed memory files and re-indexes them
# Add to watchdog or run via cron every 30min

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
ENGINE="$WORKSPACE/bin/tita-memory-engine.py"
GRAPH="$WORKSPACE/bin/tita-memory-graph.py"
LOG="/tmp/tita-memory-refresh.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Memory refresh starting..." >> "$LOG"

# Check ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ Ollama not running, skipping" >> "$LOG"
    exit 0
fi

# Refresh only changed files (incremental)
python3 "$ENGINE" refresh >> "$LOG" 2>&1

# Rebuild graph
python3 "$GRAPH" build >> "$LOG" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Memory refresh complete" >> "$LOG"
