#!/bin/bash
TASK="$1"; RESULT="$2"; CATEGORY="${3:-geral}"
BASE="$(dirname "$0")"
LESSONS="$BASE/lessons.json"; METRICS="$BASE/metrics.json"; SCORES="$BASE/domain-scores.json"
SUCCESS=true
[[ "$RESULT" == *"Erro"* || "$RESULT" == *"falha"* || "$RESULT" == *"fail"* ]] && SUCCESS=false
DATE=$(date +%Y-%m-%d); TIME=$(date +%H:%M); TIMESTAMP="$DATE $TIME"

python3 << PYEOF
import json, os
lessons_file = '$LESSONS'
data = {"lessons": [], "version": 2}
if os.path.exists(lessons_file):
    try: data = json.load(open(lessons_file))
    except: pass
lessons = data.get("lessons", [])
new_id = max((l.get("id", 0) for l in lessons), default=0) + 1
lessons.append({
    "id": new_id, "timestamp": "$TIMESTAMP", "date": "$DATE", "time": "$TIME",
    "task": '''$TASK'''[:200], "result": '''$RESULT'''[:300],
    "category": "$CATEGORY", "success": "$SUCCESS".lower() == "true"
})
data["lessons"] = lessons
today_l = [l for l in lessons if l.get("date") == "$DATE"]
ok = sum(1 for l in today_l if l.get("success"))
rate = round(ok / len(today_l) * 100, 1) if today_l else 0
json.dump(data, open(lessons_file, "w"), ensure_ascii=False, indent=2)

metrics_file = '$METRICS'
metrics = {"sessions": [], "daily": {}}
if os.path.exists(metrics_file):
    try: metrics = json.load(open(metrics_file))
    except: pass
metrics["daily"]["$DATE"] = {"tasks": len(today_l), "successes": ok, "failures": len(today_l) - ok, "success_rate": rate}
json.dump(metrics, open(metrics_file, "w"), ensure_ascii=False, indent=2)
category = "$CATEGORY"
print(f"✅ Lição #{new_id} | {category} | Sucesso: $SUCCESS")
PYEOF

python3 << PYEOF
import json, os
scores_file = '$SCORES'
category = "$CATEGORY"
success = "$SUCCESS".lower() == "true"
scores = {}
if os.path.exists(scores_file):
    try: scores = json.load(open(scores_file))
    except: pass
if category not in scores:
    scores[category] = {"score": 5.0, "tasks": 0, "wins": 0, "history": []}
d = scores[category]
d["tasks"] += 1
if success: d["wins"] += 1
outcome = 1.0 if success else 0.0
d["score"] = round(d["score"] + 0.3 * (outcome - d["score"] / 10.0), 2)
d["score"] = max(0, min(10, d["score"]))
d["history"] = (d["history"] + [1 if success else 0])[-10:]
r = d["history"][-5:] if len(d["history"]) >= 5 else d["history"]
d["trend"] = "↑" if sum(r)/len(r) > 0.7 else ("↓" if sum(r)/len(r) < 0.4 else "→")
d["win_rate"] = round(d["wins"] / d["tasks"] * 100, 1)
json.dump(scores, open(scores_file, "w"), ensure_ascii=False, indent=2)
PYEOF
