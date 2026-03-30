#!/bin/bash
BASE="$(dirname "$0")"; WORKSPACE="$(dirname "$BASE")"
python3 << PYEOF
import json, os, datetime
base = "$BASE"; workspace = "$WORKSPACE"
lessons = json.load(open(f'{base}/lessons.json')).get('lessons', []) if os.path.exists(f'{base}/lessons.json') else []
scores = json.load(open(f'{base}/domain-scores.json')) if os.path.exists(f'{base}/domain-scores.json') else {}
today = datetime.date.today().isoformat()
week_ago = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
today_l = [l for l in lessons if l.get('date', '') == today]
week_l = [l for l in lessons if l.get('date', '') >= week_ago]
print("=" * 50)
print("🧠 DASHBOARD DE APRENDIZADO")
print("=" * 50)
if today_l:
    ok = sum(1 for l in today_l if l.get('success'))
    print(f"Hoje: {len(today_l)} tarefas | {round(ok/len(today_l)*100,1)}%")
if week_l:
    ok = sum(1 for l in week_l if l.get('success'))
    print(f"Semana: {len(week_l)} tarefas | {round(ok/len(week_l)*100,1)}%")
print(f"Total: {len(lessons)} lições")
for cat, d in sorted(scores.items(), key=lambda x: -x[1].get('score', 0)):
    bar = "█" * int(d.get('score', 0)) + "░" * (10 - int(d.get('score', 0)))
    print(f"  {cat:15} {bar} {d.get('score',0):.1f}/10 {d.get('trend','→')}")
print("=" * 50)
PYEOF
