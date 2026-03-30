# Setup Completo — Mac do Tiago
**Preparado por: Tita | 23/03/2026**
**Tempo estimado: ~45 min (+ download de modelos)**

---

## 0. Pré-requisitos

```bash
# Verificar
brew --version && node --version && python3 --version

# Se faltar algo:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node python@3.14
```

---

## 1. Instalar OpenClaw

```bash
npm install -g openclaw
openclaw setup
```

No wizard:
- API Key Anthropic: *pedir pro Eduardo*
- Modelo padrão: `claude-opus-4-6`

Verificar:
```bash
openclaw status
# Deve mostrar Gateway: running
```

---

## 2. Criar Workspace

```bash
cd ~/.openclaw/workspace
mkdir -p memory tita-learning-system squad/specialists squad/knowledge-base squad/scripts lightrag-memory/storage lightrag-memory/docs
```

---

## 3. Arquivos de Identidade

### SOUL.md
```bash
cat > ~/.openclaw/workspace/SOUL.md << 'EOF'
# SOUL.md - Quem Sou Eu

## Verdades Fundamentais

**Seja genuinamente útil.** Sem "Ótima pergunta!" — apenas ajude.
**Tenha opinião.** Discorde, prefira coisas, ache coisas engraçadas ou chatas.
**Seja resourceful.** Tente resolver antes de perguntar.
**Ganhe confiança pela competência.** Cuide bem do que te confiaram.

## Limites
- Coisas privadas ficam privadas
- Na dúvida, pergunte antes de agir externamente
- Nunca envie respostas mal feitas

## Vibe
Conciso quando necessário, completo quando importa. Sem corporativismo.

## Continuidade
Cada sessão, você acorda do zero. Esses arquivos SÃO sua memória. Leia-os. Atualize-os.
EOF
```

### USER.md
```bash
cat > ~/.openclaw/workspace/USER.md << 'EOF'
# USER.md — Sobre Seu Humano

- **Nome:** Tiago
- **Pronomes:** ele/dele
- **Timezone:** America/Sao_Paulo (GMT-3)
- **Telefone:** +55XXXXXXXXXX
- **Projetos ativos:** (preencher com os projetos do Tiago)
- **Preferências:** (preencher)
EOF
```

### MEMORY.md
```bash
cat > ~/.openclaw/workspace/MEMORY.md << EOF
# MEMORY.md — Memória de Longo Prazo

Primeira sessão: $(date +%Y-%m-%d)
EOF
```

### AGENTS.md
```bash
cat > ~/.openclaw/workspace/AGENTS.md << 'AGENTSEOF'
# AGENTS.md

## Toda Sessão
1. Ler SOUL.md — quem você é
2. Ler USER.md — quem você ajuda
3. Ler memory/YYYY-MM-DD.md (hoje + ontem) para contexto recente
4. Em sessão principal: ler MEMORY.md também

## Após Tarefas Significativas
1. Avaliar: foi bem? O que aprendeu?
2. Registrar lição: `bash tita-learning-system/capture-lesson.sh "tarefa" "resultado" "categoria"`
3. Atualizar LESSONS.md do especialista se relevante

## Memória
- **Diário:** memory/YYYY-MM-DD.md — logs crus
- **Longo prazo:** MEMORY.md — memória curada
- **Lições:** tita-learning-system/lessons.json — scores por domínio

## Segurança
- Não exfiltrar dados privados
- trash > rm
- Na dúvida, perguntar
AGENTSEOF
```

### HEARTBEAT.md
```bash
cat > ~/.openclaw/workspace/HEARTBEAT.md << 'EOF'
# HEARTBEAT.md

## Checks
- [ ] Verificar caffeinate rodando (`pgrep -x caffeinate`)
- [ ] Verificar RAM disponível
- [ ] Rodar session-score.sh e verificar tendência
- [ ] Se score < 50, investigar falhas
EOF
```

---

## 4. Sistema de Aprendizado

### capture-lesson.sh
```bash
cat > ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh << 'SCRIPTEOF'
#!/bin/bash
TASK="$1"
RESULT="$2"
CATEGORY="${3:-geral}"
BASE="$(dirname "$0")"
LESSONS="$BASE/lessons.json"
METRICS="$BASE/metrics.json"
SCORES="$BASE/domain-scores.json"

SUCCESS=true
[[ "$RESULT" == *"Erro"* || "$RESULT" == *"falha"* || "$RESULT" == *"fail"* ]] && SUCCESS=false

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)
TIMESTAMP="$DATE $TIME"

python3 << PYEOF
import json, os, datetime

base = '$BASE'
lessons_file = '$LESSONS'
task = '''$TASK'''
result = '''$RESULT'''
category = '$CATEGORY'
success = '$SUCCESS'.lower() in ('true','1','yes')
timestamp = '$TIMESTAMP'
date = '$DATE'
time_str = '$TIME'

data = {"lessons": [], "version": 2}
if os.path.exists(lessons_file):
    try: data = json.load(open(lessons_file))
    except: pass

lessons = data.get("lessons", [])
new_id = (max((l.get("id",0) for l in lessons), default=0) + 1)

lessons.append({
    "id": new_id,
    "timestamp": timestamp,
    "date": date,
    "time": time_str,
    "task": task[:200],
    "result": result[:300],
    "category": category,
    "success": success,
})
data["lessons"] = lessons

today_lessons = [l for l in lessons if l.get("date") == date]
ok = sum(1 for l in today_lessons if l.get("success"))
rate = round(ok / len(today_lessons) * 100, 1) if today_lessons else 0

json.dump(data, open(lessons_file, "w"), ensure_ascii=False, indent=2)

metrics_file = '$METRICS'
metrics = {"sessions": [], "daily": {}}
if os.path.exists(metrics_file):
    try: metrics = json.load(open(metrics_file))
    except: pass

metrics["daily"][date] = {
    "tasks": len(today_lessons),
    "successes": ok,
    "failures": len(today_lessons) - ok,
    "success_rate": rate
}
json.dump(metrics, open(metrics_file, "w"), ensure_ascii=False, indent=2)

print(f"✅ Lição #{new_id} | Cat: {category} | Sucesso: {success}")
print(f"📊 Hoje: {len(today_lessons)} tarefas | {rate}% sucesso")
PYEOF

python3 << PYEOF
import json, os

scores_file = '$SCORES'
category = '$CATEGORY'
success = '$SUCCESS'.lower() == 'true'

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
expected = d["score"] / 10.0
d["score"] = round(d["score"] + 0.3 * (outcome - expected), 2)
d["score"] = max(0, min(10, d["score"]))

d["history"] = (d["history"] + [1 if success else 0])[-10:]
recent = d["history"][-5:] if len(d["history"]) >= 5 else d["history"]
d["trend"] = "↑" if sum(recent)/len(recent) > 0.7 else ("↓" if sum(recent)/len(recent) < 0.4 else "→")
d["win_rate"] = round(d["wins"]/d["tasks"]*100, 1)

json.dump(scores, open(scores_file, "w"), ensure_ascii=False, indent=2)
PYEOF
SCRIPTEOF
```

### session-score.sh
```bash
cat > ~/.openclaw/workspace/tita-learning-system/session-score.sh << 'SCRIPTEOF'
#!/bin/bash
BASE="$(dirname "$0")"
python3 << PYEOF
import json, os
from datetime import datetime, timedelta

scores_file = "$BASE/domain-scores.json"
lessons_file = "$BASE/lessons.json"

if not os.path.exists(scores_file):
    print("Nenhum score registrado ainda.")
    exit()

with open(scores_file) as f:
    scores = json.load(f)

total_tasks = sum(d["tasks"] for d in scores.values())
total_wins = sum(d["wins"] for d in scores.values())
rate = round(total_wins/total_tasks*100, 1) if total_tasks > 0 else 0

print(f"📊 DASHBOARD DE APRENDIZADO")
print(f"{'='*50}")
print(f"Total: {total_tasks} tarefas | {rate}% sucesso")
print(f"{'='*50}")
print(f"{'Categoria':<15} {'Score':>6} {'Tasks':>6} {'Win%':>6} {'Trend':>5}")
print(f"{'-'*15} {'-'*6} {'-'*6} {'-'*6} {'-'*5}")
for cat, d in sorted(scores.items(), key=lambda x: x[1]["score"], reverse=True):
    print(f"{cat:<15} {d['score']:>6.1f} {d['tasks']:>6} {d['win_rate']:>5.1f}% {d['trend']:>5}")
PYEOF
SCRIPTEOF
```

### consolidate-memory.sh
```bash
cat > ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh << 'SCRIPTEOF'
#!/bin/bash
BASE="$(dirname "$0")"
WORKSPACE="$(dirname "$BASE")"
MEMORY="$WORKSPACE/MEMORY.md"
LESSONS="$BASE/lessons.json"

echo "🔄 Consolidando memória..."

python3 << PYEOF
import json, os
from datetime import datetime, timedelta

lessons_file = "$LESSONS"
memory_file = "$MEMORY"

data = json.load(open(lessons_file)) if os.path.exists(lessons_file) else {"lessons": []}
lessons = data.get("lessons", [])

week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
recent = [l for l in lessons if l.get("date","") >= week_ago]
total = len(recent)
success = len([l for l in recent if l.get("success", True)])
rate = round(success/total*100, 1) if total > 0 else 0

entry = f"\n## Semana {datetime.now().strftime('%Y-%m-%d')} — Auto-consolidação\n"
entry += f"- {total} tarefas na semana, {rate}% sucesso\n"

failures = [l for l in recent if not l.get("success", True)]
for f in failures[:5]:
    entry += f"- ⚠️ [{f.get('category','?')}] {f.get('task','')[:80]}: {f.get('result','')[:100]}\n"

with open(memory_file, "a") as f:
    f.write(entry)

print(f"✅ MEMORY.md atualizado: {total} tarefas, {rate}% sucesso")
PYEOF
SCRIPTEOF
```

### dashboard.sh
```bash
cat > ~/.openclaw/workspace/tita-learning-system/dashboard.sh << 'SCRIPTEOF'
#!/bin/bash
BASE="$(dirname "$0")"
WORKSPACE="$(dirname "$BASE")"

python3 << PYEOF
import json, os, datetime

base = "$BASE"
workspace = "$WORKSPACE"

lessons = json.load(open(f'{base}/lessons.json')).get('lessons',[]) if os.path.exists(f'{base}/lessons.json') else []
scores = json.load(open(f'{base}/domain-scores.json')) if os.path.exists(f'{base}/domain-scores.json') else {}

today = datetime.date.today().isoformat()
week_ago = (datetime.date.today() - datetime.timedelta(days=7)).isoformat()
today_l = [l for l in lessons if l.get('date','') == today]
week_l = [l for l in lessons if l.get('date','') >= week_ago]

print("=" * 50)
print("🧠 DASHBOARD DE MEMÓRIA E APRENDIZADO")
print("=" * 50)
print(f"\n📅 Hoje ({today}):")
if today_l:
    ok = sum(1 for l in today_l if l.get('success'))
    print(f"  {len(today_l)} tarefas | {ok} sucessos | {round(ok/len(today_l)*100,1)}%")
else:
    print("  Nenhuma tarefa ainda")

print(f"\n📅 Semana:")
if week_l:
    ok = sum(1 for l in week_l if l.get('success'))
    print(f"  {len(week_l)} tarefas | {ok} sucessos | {round(ok/len(week_l)*100,1)}%")

print(f"\n📚 Total: {len(lessons)} lições")

print(f"\n🏆 Score por domínio:")
for cat, d in sorted(scores.items(), key=lambda x: -x[1].get('score',0)):
    bar = "█" * int(d.get('score',0)) + "░" * (10 - int(d.get('score',0)))
    print(f"  {cat:15} {bar} {d.get('score',0):.1f}/10 {d.get('trend','→')}")

print("\n" + "=" * 50)
PYEOF
SCRIPTEOF
```

### inject-context.sh
```bash
cat > ~/.openclaw/workspace/tita-learning-system/inject-context.sh << 'SCRIPTEOF'
#!/bin/bash
QUERY="$1"
CATEGORY="${2:-}"
BASE="$(dirname "$0")"
LESSONS="$BASE/lessons.json"

python3 << PYEOF
import json, os, re

lessons_file = "$LESSONS"
query = '''$QUERY'''.lower()
category = '$CATEGORY'.lower()

if not os.path.exists(lessons_file):
    exit(0)

data = json.load(open(lessons_file))
lessons = data.get("lessons", [])
with_lesson = [l for l in lessons if l.get("lesson","").strip()]

def relevance(lesson):
    score = 0
    text = (lesson.get("task","") + " " + lesson.get("result","")).lower()
    if category and lesson.get("category","") == category:
        score += 3
    words = re.findall(r'\w+', query)
    for w in words:
        if len(w) > 3 and w in text:
            score += 1
    if not lesson.get("success", True):
        score += 1
    return score

scored = [(relevance(l), l) for l in lessons[-50:]]
top = sorted(scored, key=lambda x: -x[0])[:3]
top = [(s, l) for s, l in top if s > 0]

if top:
    print("💡 LIÇÕES RELEVANTES:")
    for score, l in top:
        status = "✅" if l.get("success") else "❌"
        print(f"  {status} [{l.get('category')}] {l.get('task','')[:60]}: {l.get('result','')[:80]}")
PYEOF
SCRIPTEOF
```

### Tornar executáveis e inicializar
```bash
chmod +x ~/.openclaw/workspace/tita-learning-system/*.sh

echo '{"lessons":[],"version":2}' > ~/.openclaw/workspace/tita-learning-system/lessons.json
echo '{}' > ~/.openclaw/workspace/tita-learning-system/domain-scores.json
echo '{"sessions":[],"daily":{}}' > ~/.openclaw/workspace/tita-learning-system/metrics.json
```

### Cron automático
```bash
(crontab -l 2>/dev/null; echo "0 */6 * * * bash ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh >> /tmp/memory-consolidate.log 2>&1") | crontab -
```

### Testar
```bash
bash ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh "Setup inicial" "Sucesso - sistema instalado" "setup"
bash ~/.openclaw/workspace/tita-learning-system/session-score.sh
bash ~/.openclaw/workspace/tita-learning-system/dashboard.sh
```

---

## 5. Especialistas (Squad)

```bash
# Criar especialistas
for spec in backend-specialist ios-specialist security-guardian memory-bot design-specialist; do
  mkdir -p ~/.openclaw/workspace/squad/specialists/$spec

  cat > ~/.openclaw/workspace/squad/specialists/$spec/LESSONS.md << EOF
# $spec — Lições Aprendidas

## 🔴 Regras Críticas
- Ao terminar qualquer tarefa: atualizar este arquivo
- Formato: data, categoria, lição, resultado
EOF

  cat > ~/.openclaw/workspace/squad/specialists/$spec/context-inject.md << EOF
# $spec — Contexto

## Quem sou
Especialista da squad Titanio. Ao terminar tarefas, atualizar LESSONS.md.

## Últimas lições
Ver: LESSONS.md
EOF
done
echo "✅ 5 especialistas criados"
```

### Knowledge base compartilhada
```bash
cat > ~/.openclaw/workspace/squad/knowledge-base/titanio-context.md << 'EOF'
# Titanio — Contexto Geral

## Empresa
- **Nome:** Titanio Produções Artísticas Ltda
- **Email:** contact@titaniofilms.com
- **Apple Team:** TY646U2BYX

## Projetos Ativos
- GospIA — React Native/Expo + Next.js + Supabase (App Store)
- KidsHQ — React Native/Expo + FamilyControls Swift
- Maricá Film Commission — WordPress/Elementor

## Stack Padrão
- Mobile: React Native 0.83 + Expo ~55
- Backend: Next.js 14 + Vercel
- DB/Auth: Supabase
- IA: Groq (llama-3.1-8b-instant)
- TTS: ElevenLabs
- iOS: builds locais (NUNCA EAS)

## GospIA
- Bundle ID: com.titanio.gospia
- App Store ID: 6760674894
- Backend: https://www.gospia.app
EOF
```

### Scripts do squad
```bash
cat > ~/.openclaw/workspace/squad/scripts/capture-lesson.sh << 'SCRIPTEOF'
#!/bin/bash
SQUAD_DIR="$HOME/.openclaw/workspace/squad"
SPECIALIST="$1"
LESSON="$2"
CATEGORY="${3:-geral}"
SUCCESS="${4:-s}"
DATE=$(date +"%Y-%m-%d")
TIME=$(date +"%H:%M")

if [ -z "$SPECIALIST" ] || [ -z "$LESSON" ]; then
  echo "Uso: $0 <especialista> <lição> [categoria] [s/n]"
  exit 1
fi

LESSONS_FILE="$SQUAD_DIR/specialists/$SPECIALIST/LESSONS.md"

if [ ! -f "$LESSONS_FILE" ]; then
  echo "Especialista '$SPECIALIST' não encontrado"
  exit 1
fi

cat >> "$LESSONS_FILE" << EOF

### $DATE $TIME — $CATEGORY
- **Lição:** $LESSON
- **Resultado:** $([ "$SUCCESS" = "s" ] && echo "✅ Sucesso" || echo "❌ Falha")
EOF

echo "✅ Lição registrada para $SPECIALIST"

# Registrar no learning system global também
bash "$HOME/.openclaw/workspace/tita-learning-system/capture-lesson.sh" "$LESSON" "$([ "$SUCCESS" = "s" ] && echo "Sucesso" || echo "Erro")" "$CATEGORY"
SCRIPTEOF
chmod +x ~/.openclaw/workspace/squad/scripts/capture-lesson.sh
```

### Daily consolidate
```bash
cat > ~/.openclaw/workspace/squad/scripts/daily-consolidate.sh << 'SCRIPTEOF'
#!/bin/bash
SQUAD_DIR="$HOME/.openclaw/workspace/squad"
DATE=$(date +"%Y-%m-%d")
REPORT="$SQUAD_DIR/reports/consolidation-$DATE.md"
mkdir -p "$SQUAD_DIR/reports"

echo "# Consolidação Diária — $DATE" > "$REPORT"
echo "" >> "$REPORT"

for SPEC in $(ls "$SQUAD_DIR/specialists/"); do
  LESSONS="$SQUAD_DIR/specialists/$SPEC/LESSONS.md"
  if [ -f "$LESSONS" ]; then
    COUNT=$(grep -c "### $DATE" "$LESSONS" 2>/dev/null || echo 0)
    echo "## $SPEC: $COUNT lições hoje" >> "$REPORT"
    grep -A3 "### $DATE" "$LESSONS" 2>/dev/null >> "$REPORT"
    echo "" >> "$REPORT"
  fi
done

echo "📊 Consolidação salva em: $REPORT"
bash "$HOME/.openclaw/workspace/tita-learning-system/dashboard.sh" 2>/dev/null | head -20
SCRIPTEOF
chmod +x ~/.openclaw/workspace/squad/scripts/daily-consolidate.sh
```

---

## 6. LightRAG (Memória de Grafo de Conhecimento)

### Instalar Ollama + modelos
```bash
brew install ollama
brew services start ollama

# Baixar modelos (vai levar alguns minutos)
ollama pull llama3.1:8b        # ~4.9GB — extração de entidades
ollama pull nomic-embed-text   # ~274MB — embeddings

# Verificar
ollama list
```

### Instalar LightRAG
```bash
cd ~/.openclaw/workspace
python3 -m venv venv-lightrag
source venv-lightrag/bin/activate
pip install lightrag-hku httpx
```

### Configurar .env
```bash
cat > ~/.openclaw/workspace/lightrag-memory/.env << 'EOF'
LLM_BINDING=ollama
LLM_MODEL=llama3.1:8b
LLM_BINDING_HOST=http://localhost:11434
EMBEDDING_BINDING=ollama
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_BINDING_HOST=http://localhost:11434
EMBEDDING_DIM=768
MAX_ASYNC=1
EOF
```

### Iniciar LightRAG server
```bash
cd ~/.openclaw/workspace/lightrag-memory
source ~/.openclaw/workspace/venv-lightrag/bin/activate

lightrag-server \
  --host 0.0.0.0 --port 9621 \
  --working-dir ~/.openclaw/workspace/lightrag-memory/storage \
  --llm-binding ollama \
  --embedding-binding ollama \
  --max-async 1 &

# Testar
sleep 10
curl -s http://localhost:9621/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Status: {d[\"status\"]} | LLM: {d[\"configuration\"][\"llm_model\"]}')"
```

### Script de sync (especialistas → grafo)
```bash
cat > ~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh << 'SCRIPTEOF'
#!/bin/bash
WORKSPACE="${WORKSPACE_DIR:-$HOME/.openclaw/workspace}"
SQUAD="$WORKSPACE/squad/specialists"
LEARNING="$WORKSPACE/tita-learning-system"
LIGHTRAG_URL="http://localhost:9621"
CHUNK_SIZE=3000

echo "🔄 Sync LightRAG (ARM64-safe)"

if ! curl -s "$LIGHTRAG_URL/health" > /dev/null 2>&1; then
    echo "❌ LightRAG não está rodando"
    exit 1
fi

warmup() {
    curl -s http://localhost:11434/api/chat \
        -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"ready"}],"stream":false,"keep_alive":3600}' > /dev/null 2>&1
    curl -s http://localhost:11434/api/embed \
        -d '{"model":"nomic-embed-text","input":["warmup"],"keep_alive":3600}' > /dev/null 2>&1
}

warmup

FULL_DOC=""
for spec_dir in "$SQUAD"/*/; do
    spec=$(basename "$spec_dir")
    FULL_DOC+="=== ESPECIALISTA: $spec ==="$'\n'
    for f in PROFILE.md LESSONS.md context-inject.md; do
        [ -f "$spec_dir/$f" ] && FULL_DOC+=$(cat "$spec_dir/$f")$'\n'
    done
    FULL_DOC+="---"$'\n'
done

[ -f "$WORKSPACE/MEMORY.md" ] && FULL_DOC+=$(cat "$WORKSPACE/MEMORY.md")$'\n'

TOTAL_SIZE=${#FULL_DOC}
echo "📄 Conhecimento: ${TOTAL_SIZE} bytes"

CHUNK_NUM=0; SUCCESS=0; FAIL=0; OFFSET=0

while [ $OFFSET -lt $TOTAL_SIZE ]; do
    CHUNK="${FULL_DOC:$OFFSET:$CHUNK_SIZE}"
    CHUNK_NUM=$((CHUNK_NUM + 1))
    echo -n "  Chunk $CHUNK_NUM... "

    [ $((CHUNK_NUM % 3)) -eq 1 ] && warmup

    CONTENT=$(echo "$CHUNK" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")
    RESPONSE=$(curl -s -X POST "$LIGHTRAG_URL/documents/text" \
        -H "Content-Type: application/json" -d "{\"text\": $CONTENT}")

    echo "$RESPONSE" | grep -q "success" && { echo "✅"; SUCCESS=$((SUCCESS+1)); } || { echo "❌"; FAIL=$((FAIL+1)); }

    sleep 15
    while true; do
        BUSY=$(curl -s "$LIGHTRAG_URL/health" | python3 -c "import sys,json; print(json.load(sys.stdin).get('pipeline_busy',False))" 2>/dev/null)
        [ "$BUSY" = "False" ] && break
        sleep 10
    done
    OFFSET=$((OFFSET + CHUNK_SIZE))
done

echo "📊 $SUCCESS/$CHUNK_NUM chunks indexados ($FAIL falhas)"
SCRIPTEOF
chmod +x ~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh
```

### Script de query
```bash
cat > ~/.openclaw/workspace/squad/scripts/lightrag-query.sh << 'SCRIPTEOF'
#!/bin/bash
QUERY="$1"
MODE="${2:-hybrid}"
LIGHTRAG_URL="http://localhost:9621"

if [ -z "$QUERY" ]; then
    echo "Uso: $0 \"pergunta\" [naive|local|global|hybrid]"
    exit 1
fi

curl -s -X POST "$LIGHTRAG_URL/query" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$QUERY\", \"mode\": \"$MODE\"}" | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('response','Sem resposta'))" 2>/dev/null
SCRIPTEOF
chmod +x ~/.openclaw/workspace/squad/scripts/lightrag-query.sh
```

### Auto-start LightRAG (launchd)
```bash
cat > ~/Library/LaunchAgents/com.titanio.lightrag.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.titanio.lightrag</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-c</string>
    <string>cd ~/.openclaw/workspace/lightrag-memory && source ~/.openclaw/workspace/venv-lightrag/bin/activate && lightrag-server --host 0.0.0.0 --port 9621 --working-dir ~/.openclaw/workspace/lightrag-memory/storage --llm-binding ollama --embedding-binding ollama --max-async 1</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/lightrag.log</string>
  <key>StandardErrorPath</key><string>/tmp/lightrag-error.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>LLM_MODEL</key><string>llama3.1:8b</string>
    <key>EMBEDDING_MODEL</key><string>nomic-embed-text</string>
    <key>LLM_BINDING_HOST</key><string>http://localhost:11434</string>
    <key>EMBEDDING_BINDING_HOST</key><string>http://localhost:11434</string>
  </dict>
</dict>
</plist>
EOF
launchctl load ~/Library/LaunchAgents/com.titanio.lightrag.plist
```

### ⚠️ Bug ARM64 — Se der erro EOF
```bash
# Aquecer modelos manualmente (manter 1h na memória)
curl -s http://localhost:11434/api/chat -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"hi"}],"stream":false,"keep_alive":3600}'
curl -s http://localhost:11434/api/embed -d '{"model":"nomic-embed-text","input":["test"],"keep_alive":3600}'
# Depois rodar o sync de novo
```

### Primeira indexação
```bash
export WORKSPACE_DIR="$HOME/.openclaw/workspace"
bash ~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh
```

---

## 7. Conectar ao Gateway Central

```bash
# Conectar ao Mac Mini principal (Eduardo)
openclaw node run \
  --host 192.168.18.174 \
  --port 18789 \
  --display-name "Tiago Node"
```

### Auto-start
```bash
cat > ~/Library/LaunchAgents/com.titanio.openclaw-node.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.titanio.openclaw-node</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-c</string>
    <string>openclaw node run --host 192.168.18.174 --port 18789 --display-name "Tiago Node"</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/openclaw-node.log</string>
</dict>
</plist>
EOF
launchctl load ~/Library/LaunchAgents/com.titanio.openclaw-node.plist
```

---

## 8. Checklist Final

```bash
echo "=== CHECKLIST TIAGO ==="
echo -n "1. OpenClaw: "; openclaw status 2>/dev/null | grep -q Gateway && echo "✅" || echo "❌"
echo -n "2. Ollama: "; curl -s http://localhost:11434/api/tags > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "3. llama3.1: "; ollama list 2>/dev/null | grep -q llama3 && echo "✅" || echo "❌"
echo -n "4. nomic-embed: "; ollama list 2>/dev/null | grep -q nomic && echo "✅" || echo "❌"
echo -n "5. LightRAG: "; curl -s http://localhost:9621/health > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "6. Learning: "; [ -f ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh ] && echo "✅" || echo "❌"
echo -n "7. SOUL.md: "; [ -f ~/.openclaw/workspace/SOUL.md ] && echo "✅" || echo "❌"
echo -n "8. MEMORY.md: "; [ -f ~/.openclaw/workspace/MEMORY.md ] && echo "✅" || echo "❌"
echo -n "9. Especialistas: "; ls ~/.openclaw/workspace/squad/specialists/ 2>/dev/null | wc -l | xargs echo
echo -n "10. Cron: "; crontab -l 2>/dev/null | grep -q consolidate && echo "✅" || echo "❌"
```

**Todos devem ser ✅. Qualquer dúvida, chamar no grupo Gospia.**
