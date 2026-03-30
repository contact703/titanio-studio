# BOOTSTRAP — Setup Completo para o OpenClaw do Helber
# Cole este arquivo em ~/.openclaw/workspace/BOOTSTRAP.md
# Seu OpenClaw vai ler e executar tudo automaticamente na próxima sessão

## Instruções para o Agente

Você é o agente do Helber. Leia este arquivo e execute TODOS os passos abaixo.
Ao terminar cada seção, marque com ✅. Ao final, delete este arquivo.

---

## 1. Criar Identidade

Criar `~/.openclaw/workspace/SOUL.md`:
```
# SOUL.md - Quem Sou Eu

Seja genuinamente útil. Sem filler words.
Tenha opinião. Seja resourceful.
Ganhe confiança pela competência.
Coisas privadas ficam privadas.
Conciso quando necessário, completo quando importa.
Cada sessão acorda do zero. Esses arquivos SÃO sua memória. Leia-os. Atualize-os.
```

Criar `~/.openclaw/workspace/USER.md`:
```
# USER.md
- Nome: Helber
- Pronomes: ele/dele
- Timezone: America/Sao_Paulo (GMT-3)
- Telefone: (preencher)
- Projetos ativos: (preencher com Helber)
- Equipe: Titanio Films (Eduardo, Tiago, Helber)
```

Criar `~/.openclaw/workspace/MEMORY.md`:
```
# MEMORY.md — Memória de Longo Prazo
Primeira sessão: (data de hoje)
```

Criar `~/.openclaw/workspace/AGENTS.md`:
```
# AGENTS.md

## Toda Sessão
1. Ler SOUL.md
2. Ler USER.md
3. Ler memory/YYYY-MM-DD.md (hoje + ontem)
4. Em sessão principal: ler MEMORY.md

## Após Tarefas Significativas
1. Registrar lição: bash tita-learning-system/capture-lesson.sh "tarefa" "resultado" "categoria"
2. Atualizar LESSONS.md do especialista relevante

## Segurança
- Não exfiltrar dados privados
- trash > rm (recuperável > perdido)
- Na dúvida, perguntar
```

---

## 2. Criar Estrutura de Pastas

```bash
mkdir -p ~/.openclaw/workspace/memory
mkdir -p ~/.openclaw/workspace/tita-learning-system
mkdir -p ~/.openclaw/workspace/squad/specialists/backend-specialist
mkdir -p ~/.openclaw/workspace/squad/specialists/ios-specialist
mkdir -p ~/.openclaw/workspace/squad/specialists/security-guardian
mkdir -p ~/.openclaw/workspace/squad/specialists/memory-bot
mkdir -p ~/.openclaw/workspace/squad/specialists/design-specialist
mkdir -p ~/.openclaw/workspace/squad/knowledge-base
mkdir -p ~/.openclaw/workspace/squad/scripts
mkdir -p ~/.openclaw/workspace/squad/reports
mkdir -p ~/.openclaw/workspace/lightrag-memory/storage
mkdir -p ~/.openclaw/workspace/lightrag-memory/docs
```

---

## 3. Sistema de Aprendizado

### 3.1 capture-lesson.sh
Criar `~/.openclaw/workspace/tita-learning-system/capture-lesson.sh`:
```bash
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
```

### 3.2 session-score.sh
Criar `~/.openclaw/workspace/tita-learning-system/session-score.sh`:
```bash
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
```

### 3.3 consolidate-memory.sh
Criar `~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh`:
```bash
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
```

### 3.4 dashboard.sh
Criar `~/.openclaw/workspace/tita-learning-system/dashboard.sh`:
```bash
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
```

### 3.5 Inicializar e ativar
```bash
chmod +x ~/.openclaw/workspace/tita-learning-system/*.sh
echo '{"lessons":[],"version":2}' > ~/.openclaw/workspace/tita-learning-system/lessons.json
echo '{}' > ~/.openclaw/workspace/tita-learning-system/domain-scores.json
echo '{"sessions":[],"daily":{}}' > ~/.openclaw/workspace/tita-learning-system/metrics.json
```

### 3.6 Cron automático (consolidação a cada 6h)
```bash
(crontab -l 2>/dev/null; echo "0 */6 * * * bash ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh >> /tmp/memory-consolidate.log 2>&1") | crontab -
```

---

## 4. Especialistas

Para cada especialista, criar LESSONS.md e context-inject.md:

```bash
for spec in backend-specialist ios-specialist security-guardian memory-bot design-specialist; do
  cat > ~/.openclaw/workspace/squad/specialists/$spec/LESSONS.md << EOF
# $spec — Lições Aprendidas
## 🔴 Regras Críticas
- Ao terminar qualquer tarefa: atualizar este arquivo
- Formato: data, categoria, lição, resultado
EOF
  cat > ~/.openclaw/workspace/squad/specialists/$spec/context-inject.md << EOF
# $spec — Contexto
Especialista da squad Titanio. Ao terminar tarefas, atualizar LESSONS.md.
Ver últimas lições em: LESSONS.md
EOF
done
```

### Knowledge Base compartilhada
Criar `~/.openclaw/workspace/squad/knowledge-base/titanio-context.md`:
```
# Titanio — Contexto Geral da Squad

## Empresa
- Titanio Produções Artísticas Ltda
- Email: contact@titaniofilms.com
- Apple Team: TY646U2BYX

## Projetos Ativos
- GospIA — React Native/Expo + Next.js + Supabase (Bundle: com.titanio.gospia, App Store ID: 6760674894)
- KidsHQ — React Native/Expo + FamilyControls Swift
- Maricá Film Commission — WordPress/Elementor

## Stack Padrão
- Mobile: React Native 0.83 + Expo ~55
- Backend: Next.js 14 (App Router) + Vercel
- DB/Auth: Supabase (PostgreSQL)
- IA: Groq (llama-3.1-8b-instant)
- TTS: ElevenLabs
- iOS: builds locais com xcodebuild (NUNCA usar EAS/nuvem)
```

### Script de captura do squad
Criar `~/.openclaw/workspace/squad/scripts/capture-lesson.sh`:
```bash
#!/bin/bash
SQUAD_DIR="$HOME/.openclaw/workspace/squad"
SPECIALIST="$1"; LESSON="$2"; CATEGORY="${3:-geral}"; SUCCESS="${4:-s}"
DATE=$(date +"%Y-%m-%d"); TIME=$(date +"%H:%M")
[ -z "$SPECIALIST" ] || [ -z "$LESSON" ] && echo "Uso: $0 <especialista> <lição> [categoria] [s/n]" && exit 1
LESSONS_FILE="$SQUAD_DIR/specialists/$SPECIALIST/LESSONS.md"
[ ! -f "$LESSONS_FILE" ] && echo "Especialista '$SPECIALIST' não encontrado" && exit 1
cat >> "$LESSONS_FILE" << EOF

### $DATE $TIME — $CATEGORY
- **Lição:** $LESSON
- **Resultado:** $([ "$SUCCESS" = "s" ] && echo "✅ Sucesso" || echo "❌ Falha")
EOF
echo "✅ Lição registrada para $SPECIALIST"
bash "$HOME/.openclaw/workspace/tita-learning-system/capture-lesson.sh" "$LESSON" "$([ "$SUCCESS" = "s" ] && echo "Sucesso" || echo "Erro")" "$CATEGORY"
```

Criar `~/.openclaw/workspace/squad/scripts/daily-consolidate.sh`:
```bash
#!/bin/bash
SQUAD_DIR="$HOME/.openclaw/workspace/squad"; DATE=$(date +"%Y-%m-%d")
REPORT="$SQUAD_DIR/reports/consolidation-$DATE.md"; mkdir -p "$SQUAD_DIR/reports"
echo "# Consolidação Diária — $DATE" > "$REPORT"
for SPEC in $(ls "$SQUAD_DIR/specialists/"); do
  LESSONS="$SQUAD_DIR/specialists/$SPEC/LESSONS.md"
  [ -f "$LESSONS" ] && echo "## $SPEC: $(grep -c "### $DATE" "$LESSONS" 2>/dev/null || echo 0) lições" >> "$REPORT"
done
echo "📊 Consolidação salva em: $REPORT"
bash "$HOME/.openclaw/workspace/tita-learning-system/dashboard.sh" 2>/dev/null | head -20
```

```bash
chmod +x ~/.openclaw/workspace/squad/scripts/*.sh
```

---

## 5. LightRAG (Memória de Grafo de Conhecimento)

### 5.1 Instalar Ollama e modelos
```bash
brew install ollama
brew services start ollama
ollama pull llama3.1:8b        # ~4.9GB — extração de entidades
ollama pull nomic-embed-text   # ~274MB — embeddings
```

### 5.2 Instalar LightRAG
```bash
cd ~/.openclaw/workspace
python3 -m venv venv-lightrag
source venv-lightrag/bin/activate
pip install lightrag-hku httpx
```

### 5.3 Configurar
Criar `~/.openclaw/workspace/lightrag-memory/.env`:
```
LLM_BINDING=ollama
LLM_MODEL=llama3.1:8b
LLM_BINDING_HOST=http://localhost:11434
EMBEDDING_BINDING=ollama
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_BINDING_HOST=http://localhost:11434
EMBEDDING_DIM=768
MAX_ASYNC=1
```

### 5.4 Iniciar servidor
```bash
cd ~/.openclaw/workspace/lightrag-memory
source ~/.openclaw/workspace/venv-lightrag/bin/activate
lightrag-server \
  --host 0.0.0.0 --port 9621 \
  --working-dir ~/.openclaw/workspace/lightrag-memory/storage \
  --llm-binding ollama --embedding-binding ollama --max-async 1 &
sleep 10
curl http://localhost:9621/health
```

### 5.5 Script sync especialistas → grafo
Criar `~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh`:
```bash
#!/bin/bash
# Sync robusto para ARM64 — chunks de 3KB com re-aquecimento
WORKSPACE="${WORKSPACE_DIR:-$HOME/.openclaw/workspace}"
SQUAD="$WORKSPACE/squad/specialists"
LIGHTRAG_URL="http://localhost:9621"
CHUNK_SIZE=3000

curl -s "$LIGHTRAG_URL/health" > /dev/null 2>&1 || { echo "❌ LightRAG não rodando"; exit 1; }

warmup() {
    curl -s http://localhost:11434/api/chat \
        -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"ready"}],"stream":false,"keep_alive":3600}' > /dev/null 2>&1
    curl -s http://localhost:11434/api/embed \
        -d '{"model":"nomic-embed-text","input":["warmup"],"keep_alive":3600}' > /dev/null 2>&1
}

echo "🔥 Aquecendo modelos..."; warmup; echo "✅ OK"

FULL_DOC=""
for spec_dir in "$SQUAD"/*/; do
    spec=$(basename "$spec_dir")
    FULL_DOC+="=== ESPECIALISTA: $spec ==="$'\n'
    for f in PROFILE.md LESSONS.md context-inject.md; do
        [ -f "$spec_dir/$f" ] && FULL_DOC+=$(cat "$spec_dir/$f")$'\n'
    done
done
[ -f "$WORKSPACE/MEMORY.md" ] && FULL_DOC+=$(cat "$WORKSPACE/MEMORY.md")$'\n'

TOTAL=${#FULL_DOC}; echo "📄 Conhecimento: ${TOTAL} bytes"
N=0; OK=0; FAIL=0; OFF=0

while [ $OFF -lt $TOTAL ]; do
    CHUNK="${FULL_DOC:$OFF:$CHUNK_SIZE}"; N=$((N + 1))
    echo -n "  Chunk $N... "
    [ $((N % 3)) -eq 1 ] && warmup
    CONTENT=$(echo "$CHUNK" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")
    RESP=$(curl -s -X POST "$LIGHTRAG_URL/documents/text" \
        -H "Content-Type: application/json" -d "{\"text\": $CONTENT}")
    echo "$RESP" | grep -q "success" && { echo "✅"; OK=$((OK+1)); } || { echo "❌"; FAIL=$((FAIL+1)); }
    sleep 15
    while true; do
        BUSY=$(curl -s "$LIGHTRAG_URL/health" | python3 -c "import sys,json; print(json.load(sys.stdin).get('pipeline_busy',False))" 2>/dev/null)
        [ "$BUSY" = "False" ] && break; sleep 10
    done
    OFF=$((OFF + CHUNK_SIZE))
done
echo "📊 Resultado: $OK/$N chunks indexados ($FAIL falhas)"
```

### 5.6 Script query
Criar `~/.openclaw/workspace/squad/scripts/lightrag-query.sh`:
```bash
#!/bin/bash
QUERY="$1"; MODE="${2:-hybrid}"
[ -z "$QUERY" ] && echo "Uso: $0 \"pergunta\" [naive|local|global|hybrid]" && exit 1
curl -s -X POST http://localhost:9621/query \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$QUERY\", \"mode\": \"$MODE\"}" | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('response','Sem resposta'))"
```

```bash
chmod +x ~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh
chmod +x ~/.openclaw/workspace/squad/scripts/lightrag-query.sh
```

### 5.7 Auto-start LightRAG (launchd)
Criar `~/Library/LaunchAgents/com.titanio.lightrag.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.titanio.lightrag</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-c</string>
    <string>cd ~/.openclaw/workspace/lightrag-memory &amp;&amp; source ~/.openclaw/workspace/venv-lightrag/bin/activate &amp;&amp; lightrag-server --host 0.0.0.0 --port 9621 --working-dir ~/.openclaw/workspace/lightrag-memory/storage --llm-binding ollama --embedding-binding ollama --max-async 1</string>
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
```

```bash
launchctl load ~/Library/LaunchAgents/com.titanio.lightrag.plist
```

### 5.8 Bug ARM64 — se der erro EOF no embedding
```bash
# Aquecer modelos manualmente (mantém 1h na memória)
curl -s http://localhost:11434/api/chat -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"hi"}],"stream":false,"keep_alive":3600}'
curl -s http://localhost:11434/api/embed -d '{"model":"nomic-embed-text","input":["test"],"keep_alive":3600}'
# Depois rodar sync de novo
```

### 5.9 Primeira indexação
```bash
export WORKSPACE_DIR="$HOME/.openclaw/workspace"
bash ~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh
```

---

## 6. Conectar ao Gateway Central

```bash
openclaw node run --host 192.168.18.174 --port 18789 --display-name "Helber Node"
```

### Auto-start
Criar `~/Library/LaunchAgents/com.titanio.openclaw-node.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.titanio.openclaw-node</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-c</string>
    <string>openclaw node run --host 192.168.18.174 --port 18789 --display-name "Helber Node"</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/openclaw-node.log</string>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.titanio.openclaw-node.plist
```

---

## 7. Checklist Final

Rodar isto e verificar que tudo está ✅:

```bash
echo "=== CHECKLIST HELBER ==="
echo -n "1. OpenClaw: "; openclaw status 2>/dev/null | grep -q Gateway && echo "✅" || echo "❌"
echo -n "2. Ollama: "; curl -s http://localhost:11434/api/tags > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "3. llama3.1: "; ollama list 2>/dev/null | grep -q llama3 && echo "✅" || echo "❌"
echo -n "4. nomic-embed: "; ollama list 2>/dev/null | grep -q nomic && echo "✅" || echo "❌"
echo -n "5. LightRAG: "; curl -s http://localhost:9621/health > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "6. Learning system: "; [ -f ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh ] && echo "✅" || echo "❌"
echo -n "7. SOUL.md: "; [ -f ~/.openclaw/workspace/SOUL.md ] && echo "✅" || echo "❌"
echo -n "8. MEMORY.md: "; [ -f ~/.openclaw/workspace/MEMORY.md ] && echo "✅" || echo "❌"
echo -n "9. Especialistas: "; ls ~/.openclaw/workspace/squad/specialists/ 2>/dev/null | wc -l | xargs echo
echo -n "10. Cron: "; crontab -l 2>/dev/null | grep -q consolidate && echo "✅" || echo "❌"
```

---

## 8. Teste Rápido

```bash
# Registrar primeira lição
bash ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh "Setup completo" "Sucesso - todos os sistemas instalados" "setup"

# Ver dashboard
bash ~/.openclaw/workspace/tita-learning-system/dashboard.sh

# Testar LightRAG query (após primeira indexação)
bash ~/.openclaw/workspace/squad/scripts/lightrag-query.sh "Quais são os projetos da Titanio?"
```

---

**Ao terminar tudo: deletar este arquivo BOOTSTRAP.md**
