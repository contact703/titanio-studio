#!/bin/bash
# Busca semântica nas lições por similaridade de texto
QUERY="$1"
TOP="${2:-5}"
BASE="$(dirname "$0")"

python3 << PYEOF
import json, os, re, math

base = '$BASE'
query = '''$QUERY'''.lower()
top_n = int('$TOP')

# Carregar lições
data = json.load(open(f'{base}/lessons.json')) if os.path.exists(f'{base}/lessons.json') else {"lessons":[]}
lessons = data.get("lessons", [])

def tokenize(text):
    return set(re.findall(r'\b\w{3,}\b', text.lower()))

def tfidf_sim(query_tokens, doc_tokens):
    if not query_tokens or not doc_tokens:
        return 0
    intersection = query_tokens & doc_tokens
    return len(intersection) / math.sqrt(len(query_tokens) * len(doc_tokens))

q_tokens = tokenize(query)

scored = []
for l in lessons:
    text = f"{l.get('task','')} {l.get('result','')} {l.get('lesson','')}"
    d_tokens = tokenize(text)
    sim = tfidf_sim(q_tokens, d_tokens)
    if sim > 0:
        scored.append((sim, l))

top = sorted(scored, key=lambda x: -x[0])[:top_n]

if top:
    print(f"🔍 Top {len(top)} lições relevantes para: '{query[:50]}'")
    print()
    for sim, l in top:
        status = "✅" if l.get("success") else "❌"
        print(f"{status} [{l.get('category')}] {l.get('date','')} | sim={sim:.2f}")
        print(f"   Tarefa: {l.get('task','')[:80]}")
        if l.get('lesson'):
            print(f"   Lição: {l.get('lesson','')[:100]}")
        print()
else:
    print("Nenhuma lição relevante encontrada.")
PYEOF
