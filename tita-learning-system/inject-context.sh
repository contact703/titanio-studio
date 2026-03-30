#!/bin/bash
# Busca lições relevantes por categoria/palavras-chave antes de uma tarefa
QUERY="$1"
CATEGORY="${2:-}"
BASE="$(dirname "$0")"
LESSONS="$BASE/lessons.json"

python3 << PYEOF
import json, os, re

lessons_file = '$LESSONS'
query = '''$QUERY'''.lower()
category = '$CATEGORY'.lower()

if not os.path.exists(lessons_file):
    exit(0)

data = json.load(open(lessons_file))
lessons = data.get("lessons", [])

# Filtrar lições com lesson não-vazio
with_lesson = [l for l in lessons if l.get("lesson","").strip()]

# Score de relevância por palavras comuns
def relevance(lesson):
    score = 0
    text = (lesson.get("task","") + " " + lesson.get("lesson","")).lower()
    # Match por categoria
    if category and lesson.get("category","") == category:
        score += 3
    # Match por palavras
    words = re.findall(r'\w+', query)
    for w in words:
        if len(w) > 3 and w in text:
            score += 1
    # Bonus para lições de falha (mais informativas)
    if not lesson.get("success", True):
        score += 1
    return score

scored = [(relevance(l), l) for l in with_lesson]
top = sorted(scored, key=lambda x: -x[0])[:3]
top = [(s, l) for s, l in top if s > 0]

if top:
    print("💡 LIÇÕES RELEVANTES:")
    for score, l in top:
        status = "✅" if l.get("success") else "❌"
        print(f"  {status} [{l.get('category')}] {l.get('task','')[:60]}")
        print(f"     → {l.get('lesson','')[:100]}")
    print()
else:
    print("") # sem lições relevantes — silencioso
PYEOF
