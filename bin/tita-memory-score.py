#!/usr/bin/env python3
"""
TITA Memory Score v1.0 — Feedback & Quality Tracking
=====================================================
Tracks memory usage quality over time. Scores each interaction.

Usage:
  score <message> <used_memory:yes|no> <correct:yes|no>  — Log an interaction
  report                                                   — Show quality report
  streak                                                   — Show current streak
"""

import os
import sys
import json
from datetime import datetime, timedelta

WORKSPACE = os.environ.get("TITA_WORKSPACE", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace")
SCORE_FILE = os.path.join(WORKSPACE, "memory", "tita-memory-scores.jsonl")
STATS_FILE = os.path.join(WORKSPACE, "memory", "tita-memory-stats.json")


def log_score(message: str, used_memory: bool, correct: bool, notes: str = ""):
    """Log a memory usage score."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "message_preview": message[:100],
        "used_memory": used_memory,
        "correct": correct,
        "score": calculate_score(used_memory, correct),
        "notes": notes,
    }
    
    with open(SCORE_FILE, "a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    update_stats(entry)
    return entry


def calculate_score(used_memory: bool, correct: bool) -> int:
    """
    Score matrix:
    Used memory + Correct = +2 (perfect)
    Used memory + Wrong   = +1 (at least tried)
    No memory + Correct   = 0 (lucky)
    No memory + Wrong     = -2 (worst case — this is our bug)
    """
    if used_memory and correct:
        return 2
    elif used_memory and not correct:
        return 1
    elif not used_memory and correct:
        return 0
    else:  # not used_memory and not correct
        return -2


def update_stats(entry: dict):
    """Update running statistics."""
    stats = load_stats()
    
    stats["total_interactions"] += 1
    stats["total_score"] += entry["score"]
    
    if entry["used_memory"]:
        stats["memory_used_count"] += 1
    if entry["correct"]:
        stats["correct_count"] += 1
    if not entry["used_memory"] and not entry["correct"]:
        stats["failures"] += 1
        stats["current_streak"] = 0  # Reset streak on failure
    else:
        stats["current_streak"] += 1
        stats["best_streak"] = max(stats["best_streak"], stats["current_streak"])
    
    stats["last_updated"] = datetime.now().isoformat()
    stats["average_score"] = round(stats["total_score"] / stats["total_interactions"], 2)
    stats["memory_usage_rate"] = round(stats["memory_used_count"] / stats["total_interactions"] * 100, 1)
    stats["accuracy_rate"] = round(stats["correct_count"] / stats["total_interactions"] * 100, 1)
    
    save_stats(stats)


def load_stats() -> dict:
    """Load or create stats."""
    if os.path.exists(STATS_FILE):
        with open(STATS_FILE) as f:
            return json.load(f)
    return {
        "total_interactions": 0,
        "total_score": 0,
        "memory_used_count": 0,
        "correct_count": 0,
        "failures": 0,
        "current_streak": 0,
        "best_streak": 0,
        "average_score": 0,
        "memory_usage_rate": 0,
        "accuracy_rate": 0,
        "last_updated": None,
    }


def save_stats(stats: dict):
    """Save stats."""
    with open(STATS_FILE, "w") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)


def show_report():
    """Show quality report."""
    stats = load_stats()
    
    if stats["total_interactions"] == 0:
        print("📊 Nenhuma interação registrada ainda.")
        return
    
    print("🧠 TITA MEMORY QUALITY REPORT")
    print("=" * 40)
    print(f"📊 Total interações: {stats['total_interactions']}")
    print(f"🎯 Score médio: {stats['average_score']} / 2.0")
    print(f"🧠 Taxa de uso de memória: {stats['memory_usage_rate']}%")
    print(f"✅ Taxa de acerto: {stats['accuracy_rate']}%")
    print(f"❌ Falhas (sem memória + errado): {stats['failures']}")
    print(f"🔥 Streak atual: {stats['current_streak']}")
    print(f"🏆 Melhor streak: {stats['best_streak']}")
    
    # Grade
    avg = stats["average_score"]
    if avg >= 1.5:
        grade = "A 🟢"
    elif avg >= 1.0:
        grade = "B 🟡"
    elif avg >= 0.5:
        grade = "C 🟠"
    else:
        grade = "D 🔴"
    print(f"\n📋 Nota: {grade}")
    
    # Recent entries
    if os.path.exists(SCORE_FILE):
        with open(SCORE_FILE) as f:
            lines = f.readlines()
        
        recent = lines[-5:] if len(lines) >= 5 else lines
        print(f"\n📝 Últimas {len(recent)} interações:")
        for line in recent:
            entry = json.loads(line)
            emoji = "✅" if entry["score"] >= 1 else ("⚠️" if entry["score"] >= 0 else "❌")
            mem = "🧠" if entry["used_memory"] else "💤"
            print(f"  {emoji} {mem} [{entry['score']:+d}] {entry['message_preview'][:50]}")


def show_streak():
    """Show current streak."""
    stats = load_stats()
    print(f"🔥 Streak: {stats['current_streak']} | Best: {stats['best_streak']} | Failures: {stats['failures']}")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  score <message> <used_memory:yes|no> <correct:yes|no> [notes]")
        print("  report")
        print("  streak")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "report":
        show_report()
    elif cmd == "streak":
        show_streak()
    elif cmd == "score":
        if len(sys.argv) < 5:
            print("Usage: score <message> <used_memory:yes|no> <correct:yes|no>")
            sys.exit(1)
        message = sys.argv[2]
        used = sys.argv[3].lower() in ("yes", "y", "1", "true", "sim")
        correct = sys.argv[4].lower() in ("yes", "y", "1", "true", "sim")
        notes = " ".join(sys.argv[5:]) if len(sys.argv) > 5 else ""
        
        entry = log_score(message, used, correct, notes)
        emoji = "✅" if entry["score"] >= 1 else ("⚠️" if entry["score"] >= 0 else "❌")
        print(f"{emoji} Score: {entry['score']:+d} | Memory: {'✅' if used else '❌'} | Correct: {'✅' if correct else '❌'}")
    else:
        print(f"Unknown: {cmd}")


if __name__ == "__main__":
    main()
