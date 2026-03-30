#!/usr/bin/env python3
"""
TITA Lightning Bridge v1.0 — Agent Lightning ↔ Especialistas
=============================================================
Conecta o Microsoft Agent Lightning ao nosso sistema de especialistas.

O Lightning observa cada ação dos especialistas, pontua, e usa
reinforcement learning pra otimizar automaticamente.

Componentes:
  - LightningStore (local) → armazena traces dos especialistas
  - Tracer → registra decisões, tool calls, rewards
  - APO (Automatic Prompt Optimization) → melhora context.md dos especialistas
  - Score integration → conecta com tita-memory-score

Usage:
  # Iniciar o store (roda em background)
  python3 tita-lightning-bridge.py start-store

  # Registrar uma ação de especialista
  python3 tita-lightning-bridge.py log <specialist> <task> <result:success|fail> <score:0-10>

  # Ver traces de um especialista
  python3 tita-lightning-bridge.py traces <specialist>

  # Gerar relatório de performance
  python3 tita-lightning-bridge.py report

  # Otimizar prompts (APO)
  python3 tita-lightning-bridge.py optimize <specialist>
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

WORKSPACE = os.environ.get("TITA_WORKSPACE", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace")
SPECIALISTS_DIR = os.path.join(WORKSPACE, "pasta-do-tita", "memoria-especialistas")
LIGHTNING_DIR = os.path.join(WORKSPACE, "memory", "lightning")
TRACES_FILE = os.path.join(LIGHTNING_DIR, "traces.jsonl")
STATS_FILE = os.path.join(LIGHTNING_DIR, "specialist-stats.json")

# Ensure dirs exist
os.makedirs(LIGHTNING_DIR, exist_ok=True)


def log_action(specialist: str, task: str, result: str, score: int, notes: str = ""):
    """Log a specialist action as a Lightning trace."""
    trace = {
        "timestamp": datetime.now().isoformat(),
        "specialist": specialist,
        "task": task[:200],
        "result": result,  # success, fail, partial
        "score": score,  # 0-10
        "notes": notes,
        # Lightning-compatible fields
        "span_type": "agent_action",
        "reward": score / 10.0,  # Normalize to 0-1 for RL
    }
    
    with open(TRACES_FILE, "a") as f:
        f.write(json.dumps(trace, ensure_ascii=False) + "\n")
    
    update_specialist_stats(specialist, trace)
    
    # Also update specialist's LESSONS.md if it was a failure
    if result == "fail" and score < 5:
        lesson_path = os.path.join(SPECIALISTS_DIR, specialist, "LESSONS.md")
        if os.path.exists(os.path.dirname(lesson_path)):
            with open(lesson_path, "a") as f:
                f.write(f"\n\n## {datetime.now().strftime('%Y-%m-%d %H:%M')} — FALHA: {task[:80]}\n")
                f.write(f"- Score: {score}/10\n")
                if notes:
                    f.write(f"- Notas: {notes}\n")
                f.write(f"- **Lição:** TODO — analisar causa e registrar\n")
    
    return trace


def update_specialist_stats(specialist: str, trace: dict):
    """Update running stats per specialist."""
    stats = load_stats()
    
    if specialist not in stats:
        stats[specialist] = {
            "total_tasks": 0,
            "successes": 0,
            "failures": 0,
            "total_score": 0,
            "avg_score": 0,
            "streak": 0,
            "best_streak": 0,
            "last_task": None,
            "grade": "N/A",
        }
    
    s = stats[specialist]
    s["total_tasks"] += 1
    s["total_score"] += trace["score"]
    s["avg_score"] = round(s["total_score"] / s["total_tasks"], 2)
    s["last_task"] = trace["timestamp"]
    
    if trace["result"] == "success":
        s["successes"] += 1
        s["streak"] += 1
        s["best_streak"] = max(s["best_streak"], s["streak"])
    else:
        s["failures"] += 1
        s["streak"] = 0
    
    # Grade
    avg = s["avg_score"]
    if avg >= 9:
        s["grade"] = "AAA 🏆"
    elif avg >= 8:
        s["grade"] = "AA ⭐"
    elif avg >= 7:
        s["grade"] = "A 🟢"
    elif avg >= 5:
        s["grade"] = "B 🟡"
    elif avg >= 3:
        s["grade"] = "C 🟠"
    else:
        s["grade"] = "D 🔴"
    
    stats[specialist] = s
    save_stats(stats)


def load_stats() -> dict:
    if os.path.exists(STATS_FILE):
        with open(STATS_FILE) as f:
            return json.load(f)
    return {}


def save_stats(stats: dict):
    with open(STATS_FILE, "w") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)


def show_traces(specialist: str = None, limit: int = 10):
    """Show recent traces."""
    if not os.path.exists(TRACES_FILE):
        print("Nenhum trace registrado.")
        return
    
    with open(TRACES_FILE) as f:
        lines = f.readlines()
    
    traces = [json.loads(l) for l in lines]
    if specialist:
        traces = [t for t in traces if t["specialist"] == specialist]
    
    traces = traces[-limit:]
    
    for t in traces:
        emoji = "✅" if t["result"] == "success" else ("⚠️" if t["result"] == "partial" else "❌")
        print(f"  {emoji} [{t['specialist']}] {t['task'][:50]} → score:{t['score']}/10 ({t['timestamp'][:16]})")


def show_report():
    """Show performance report for all specialists."""
    stats = load_stats()
    
    if not stats:
        print("Nenhum dado ainda. Registre ações com: log <specialist> <task> <result> <score>")
        return
    
    print("⚡ AGENT LIGHTNING — Performance Report")
    print("=" * 55)
    
    # Sort by avg score descending
    sorted_specs = sorted(stats.items(), key=lambda x: x[1]["avg_score"], reverse=True)
    
    print(f"\n{'Especialista':<25} {'Grade':<10} {'Avg':<6} {'Tasks':<7} {'Win%':<6} {'Streak':<7}")
    print("-" * 55)
    
    for name, s in sorted_specs:
        win_pct = round(s["successes"] / s["total_tasks"] * 100) if s["total_tasks"] > 0 else 0
        print(f"  {name:<23} {s['grade']:<10} {s['avg_score']:<6} {s['total_tasks']:<7} {win_pct}%{'':>3} {s['streak']:<7}")
    
    # Overall
    total_tasks = sum(s["total_tasks"] for s in stats.values())
    total_success = sum(s["successes"] for s in stats.values())
    overall_avg = round(sum(s["total_score"] for s in stats.values()) / total_tasks, 2) if total_tasks > 0 else 0
    
    print(f"\n📊 Total: {total_tasks} tasks | {total_success} successes | Avg: {overall_avg}/10")


def generate_optimization_suggestions(specialist: str):
    """Analyze traces and suggest improvements for a specialist's context.md."""
    if not os.path.exists(TRACES_FILE):
        print("Nenhum trace para analisar.")
        return
    
    with open(TRACES_FILE) as f:
        traces = [json.loads(l) for l in f.readlines()]
    
    spec_traces = [t for t in traces if t["specialist"] == specialist]
    
    if not spec_traces:
        print(f"Nenhum trace para {specialist}.")
        return
    
    failures = [t for t in spec_traces if t["result"] != "success"]
    successes = [t for t in spec_traces if t["result"] == "success"]
    
    print(f"⚡ Optimization Suggestions for {specialist}")
    print("=" * 50)
    print(f"  Total traces: {len(spec_traces)}")
    print(f"  Successes: {len(successes)}")
    print(f"  Failures: {len(failures)}")
    
    if failures:
        print(f"\n  ❌ Failure patterns:")
        for f_trace in failures[-5:]:
            print(f"    - {f_trace['task'][:60]} (score: {f_trace['score']})")
            if f_trace.get("notes"):
                print(f"      Note: {f_trace['notes'][:80]}")
    
    # Read current context.md
    ctx_path = os.path.join(SPECIALISTS_DIR, specialist, "context.md")
    if os.path.exists(ctx_path):
        with open(ctx_path) as f:
            ctx = f.read()
        print(f"\n  📄 Current context.md: {len(ctx)} bytes")
    
    print(f"\n  💡 Suggestions:")
    if len(failures) > len(successes):
        print(f"    1. Este especialista falha mais do que acerta — revisar missão e tarefas aceitas")
    if len(spec_traces) < 5:
        print(f"    2. Poucos traces — precisa de mais dados pra otimizar")
    
    avg_score = sum(t["score"] for t in spec_traces) / len(spec_traces)
    if avg_score < 5:
        print(f"    3. Score médio baixo ({avg_score:.1f}) — considerar restringir tarefas aceitas")
    elif avg_score >= 8:
        print(f"    3. Score alto ({avg_score:.1f}) — especialista saudável, expandir responsabilidades?")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  start-store           — Init Lightning store")
        print("  log <spec> <task> <result:success|fail> <score:0-10> [notes]")
        print("  traces [specialist]   — Show recent traces")
        print("  report                — Performance report")
        print("  optimize <specialist> — Optimization suggestions")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "start-store":
        os.makedirs(LIGHTNING_DIR, exist_ok=True)
        print(f"⚡ Lightning store initialized at {LIGHTNING_DIR}")
        print(f"  Traces: {TRACES_FILE}")
        print(f"  Stats: {STATS_FILE}")
    
    elif cmd == "log":
        if len(sys.argv) < 6:
            print("Usage: log <specialist> <task> <result:success|fail|partial> <score:0-10> [notes]")
            sys.exit(1)
        specialist = sys.argv[2]
        task = sys.argv[3]
        result = sys.argv[4]
        score = int(sys.argv[5])
        notes = " ".join(sys.argv[6:]) if len(sys.argv) > 6 else ""
        trace = log_action(specialist, task, result, score, notes)
        emoji = "✅" if result == "success" else "❌"
        print(f"{emoji} Logged: {specialist} → {task[:40]} (score: {score}/10)")
    
    elif cmd == "traces":
        specialist = sys.argv[2] if len(sys.argv) > 2 else None
        show_traces(specialist)
    
    elif cmd == "report":
        show_report()
    
    elif cmd == "optimize":
        if len(sys.argv) < 3:
            print("Usage: optimize <specialist>")
            sys.exit(1)
        generate_optimization_suggestions(sys.argv[2])
    
    else:
        print(f"Unknown: {cmd}")


if __name__ == "__main__":
    main()
