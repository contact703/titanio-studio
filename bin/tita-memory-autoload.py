#!/usr/bin/env python3
"""
TITA Memory Autoloader — Context builder for auto-recall system
Generates minimal essential context from memory files.

Part of TARS (Tita Auto-Recall System)
"""

import os
import glob
from datetime import datetime, timedelta
from pathlib import Path

WORKSPACE = os.environ.get("TITA_WORKSPACE", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace")
MEMORY_DIR = os.path.join(WORKSPACE, "memory")

def read_file_head(path: str, lines: int = 30) -> str:
    """Read first N lines of file."""
    try:
        with open(path) as f:
            content = f.readlines()[:lines]
            return "".join(content).strip()
    except:
        return ""

def get_recent_daily_logs(days: int = 3) -> list:
    """Get last N daily log files."""
    pattern = os.path.join(MEMORY_DIR, "2026-*.md")
    files = sorted(glob.glob(pattern), reverse=True)
    return files[:days]

def build_context() -> str:
    """Build minimal context for injection."""
    parts = []

    # 1. Active context (CRITICAL)
    contexto_ativo = os.path.join(WORKSPACE, "pasta-do-tita", "contexto-ativo.md")
    if os.path.exists(contexto_ativo):
        parts.append("📋 CONTEXTO ATIVO (projetos, pendências):")
        parts.append(read_file_head(contexto_ativo, 40))
        parts.append("")

    # 2. Long-term memory (MEMORY.md)
    memory_md = os.path.join(WORKSPACE, "MEMORY.md")
    if os.path.exists(memory_md):
        parts.append("🧠 MEMÓRIA DE LONGO PRAZO:")
        parts.append(read_file_head(memory_md, 50))
        parts.append("")

    # 3. Recent lessons
    lessons_md = os.path.join(WORKSPACE, "LESSONS.md")
    if os.path.exists(lessons_md):
        parts.append("🔴 LIÇÕES CRÍTICAS:")
        parts.append(read_file_head(lessons_md, 30))
        parts.append("")

    # 4. Recent daily logs (last 3 days)
    daily_logs = get_recent_daily_logs(3)
    if daily_logs:
        parts.append(f"📅 MEMÓRIA EPISÓDICA (últimos {len(daily_logs)} dias):")
        for log in daily_logs:
            basename = os.path.basename(log)
            parts.append(f"\n[{basename}]")
            parts.append(read_file_head(log, 20))
        parts.append("")

    # 5. Reminder to use Memory Engine for details
    parts.append("💡 Para buscar memórias específicas: tita-memory-engine.py search <query>")

    return "\n".join(parts)

def main():
    context = build_context()
    print(context)

if __name__ == "__main__":
    main()
