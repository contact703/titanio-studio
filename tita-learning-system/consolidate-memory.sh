#!/bin/bash
BASE="$(dirname "$0")"; WORKSPACE="$(dirname "$BASE")"
MEMORY="$WORKSPACE/MEMORY.md"; LESSONS="$BASE/lessons.json"
python3 << PYEOF
import json, os
from datetime import datetime, timedelta
data = json.load(open("$LESSONS")) if os.path.exists("$LESSONS") else {"lessons": []}
lessons = data.get("lessons", [])
week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
recent = [l for l in lessons if l.get("date", "") >= week_ago]
total = len(recent)
success = len([l for l in recent if l.get("success", True)])
rate = round(success / total * 100, 1) if total > 0 else 0
entry = f"\n## Semana {datetime.now().strftime('%Y-%m-%d')} — Auto-consolidação\n"
entry += f"- {total} tarefas na semana, {rate}% sucesso\n"
failures = [l for l in recent if not l.get("success", True)]
for f in failures[:5]:
    entry += f"- ⚠️ [{f.get('category', '?')}] {f.get('task', '')[:80]}\n"
with open("$MEMORY", "a") as mf:
    mf.write(entry)
print(f"✅ MEMORY.md atualizado: {total} tarefas, {rate}% sucesso")
PYEOF
