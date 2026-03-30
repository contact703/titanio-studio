#!/bin/bash
# tita-auto-recall.sh — Auto-inject memory context on session start
# Part of TARS (Tita Auto-Recall System)
# Location: /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-auto-recall.sh

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
AUTOLOADER="$WORKSPACE/bin/tita-memory-autoload.py"
CACHE_FILE="/tmp/tita-recall-cache"
CACHE_TTL=300  # 5 min

# Check if we need to inject context (first message or cache expired)
if [[ -f "$CACHE_FILE" ]]; then
    cache_age=$(($(date +%s) - $(stat -f%m "$CACHE_FILE")))
    if [[ $cache_age -lt $CACHE_TTL ]]; then
        exit 0  # Cache still valid, skip injection
    fi
fi

# Generate context
context=$(python3 "$AUTOLOADER" 2>&1)

if [[ -n "$context" ]]; then
    echo "🧠 [TITA AUTO-RECALL SYSTEM]"
    echo "$context"
    echo ""
    echo "✅ Contexto carregado. Pronta para trabalhar."

    # Update cache
    touch "$CACHE_FILE"
fi
