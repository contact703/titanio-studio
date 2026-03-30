#!/bin/bash
BASE="$(dirname "$0")"
python3 << PYEOF
import json, os
scores_file = "$BASE/domain-scores.json"
if not os.path.exists(scores_file):
    print("Nenhum score registrado ainda."); exit()
with open(scores_file) as f:
    scores = json.load(f)
total = sum(d["tasks"] for d in scores.values())
wins = sum(d["wins"] for d in scores.values())
rate = round(wins / total * 100, 1) if total > 0 else 0
print(f"📊 DASHBOARD — Total: {total} tarefas | {rate}% sucesso")
print(f"{'Categoria':<15} {'Score':>6} {'Tasks':>6} {'Win%':>6} {'Trend':>5}")
for cat, d in sorted(scores.items(), key=lambda x: x[1]["score"], reverse=True):
    print(f"{cat:<15} {d['score']:>6.1f} {d['tasks']:>6} {d['win_rate']:>5.1f}% {d['trend']:>5}")
PYEOF
