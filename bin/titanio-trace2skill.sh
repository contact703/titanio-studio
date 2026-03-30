#!/bin/bash
# titanio-trace2skill.sh — Transfer Learning entre especialistas
# Quando um especialista aprende algo, propaga pra contextos similares
# Roda: após cada tarefa completada (hook) ou diário via cron

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
SPEC_DIR="$WORKSPACE/pasta-do-tita/memoria-especialistas"
SHARED="/Volumes/TITA_039/shared-specialists.json"
LOG="/tmp/trace2skill.log"

log() { echo "[$(date '+%H:%M')] $1" >> "$LOG"; echo "$1"; }

log "🧠 Trace2Skill — Transfer Learning"

# Para cada especialista, extrair lições universais e propagar
for dir in "$SPEC_DIR"/*/; do
    SPEC=$(basename "$dir")
    LESSONS="$dir/lessons.json"
    [ -f "$LESSONS" ] || continue
    
    # Contar lições
    COUNT=$(python3 -c "import json; print(len(json.load(open('$LESSONS'))))" 2>/dev/null || echo 0)
    [ "$COUNT" -gt 0 ] || continue
    
    # Extrair lições que são UNIVERSAIS (não específicas de 1 cliente)
    python3 << PYEOF
import json

with open("$LESSONS") as f:
    lessons = json.load(f)

if not isinstance(lessons, list):
    exit()

# Identificar lições transferíveis (genéricas, não específicas)
universal_keywords = ["sempre", "nunca", "regra", "padrão", "melhor prática", 
                      "erro comum", "funciona", "não funciona", "dica", "truque",
                      "API", "formato", "template", "workflow"]

transferable = []
for lesson in lessons:
    text = lesson if isinstance(lesson, str) else str(lesson)
    if any(kw in text.lower() for kw in universal_keywords):
        transferable.append(text[:200])

if transferable:
    # Salvar como "shared skills"
    skill_file = "$dir/shared-skills.json"
    with open(skill_file, "w") as f:
        json.dump({"specialist": "$SPEC", "transferable_lessons": transferable, "count": len(transferable)}, f, indent=2, ensure_ascii=False)
    print(f"  🔄 $SPEC: {len(transferable)} lições transferíveis de {len(lessons)}")
PYEOF

done

# Consolidar todas as shared skills num arquivo global
python3 << 'PYEOF'
import json, os, glob

spec_dir = os.environ.get("SPEC_DIR", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/memoria-especialistas")
all_skills = {}

for skill_file in glob.glob(f"{spec_dir}/*/shared-skills.json"):
    with open(skill_file) as f:
        data = json.load(f)
    spec = data.get("specialist", "?")
    lessons = data.get("transferable_lessons", [])
    if lessons:
        all_skills[spec] = lessons

output = f"{spec_dir}/GLOBAL-SHARED-SKILLS.json"
with open(output, "w") as f:
    json.dump(all_skills, f, indent=2, ensure_ascii=False)

total = sum(len(v) for v in all_skills.values())
print(f"\n📊 Trace2Skill: {total} lições transferíveis de {len(all_skills)} especialistas")
print(f"💾 Salvo em: GLOBAL-SHARED-SKILLS.json")
PYEOF

log "✅ Transfer learning completo"
