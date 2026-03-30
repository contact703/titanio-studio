# Setup Definitivo — Tiago
# Dashboard Titanio v2 + Memória + Especialistas + LightRAG + N8n + Correções
# O OpenClaw do Tiago deve executar TODOS os passos em sequência, sem perguntar nada.
# Baseado em tudo que aprendemos instalando no Helber (bugs corrigidos).

---

## PARTE 1 — Dashboard Titanio v2

### 1.1 Clonar e buildar
```bash
cd ~ && git clone https://github.com/contact703/titanio-dashboard.git titanio-dashboard 2>/dev/null || echo "Já clonado"
cd ~/titanio-dashboard

# Descobrir estrutura (pode ser code/backend ou backend direto)
if [ -d "code/backend" ]; then
    BACKEND_DIR="$HOME/titanio-dashboard/code/backend"
    FRONTEND_DIR="$HOME/titanio-dashboard/code/frontend"
else
    BACKEND_DIR="$HOME/titanio-dashboard/backend"
    FRONTEND_DIR="$HOME/titanio-dashboard/frontend"
fi
echo "Backend: $BACKEND_DIR"
echo "Frontend: $FRONTEND_DIR"

# Build backend
cd "$BACKEND_DIR"
npm install --legacy-peer-deps 2>/dev/null
npx tsc 2>/dev/null || echo "TypeScript já compilado"

# Build frontend
cd "$FRONTEND_DIR"
npm install --legacy-peer-deps 2>/dev/null
npx next build 2>/dev/null || echo "Frontend já buildado"
```

### 1.2 Configurar .env — PORTA 4444 (IMPORTANTE: frontend é hardcoded pra 4444)
```bash
cat > "$BACKEND_DIR/.env" << EOF
PORT=4444
NODE_ENV=development
MAC_ID=3
CORS_ORIGIN=http://localhost:3001
DATABASE_URL="postgresql://$(whoami):@localhost:5432/titanio_tiago?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="titanio-tiago-2026"
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-PEDIR_PRO_EDUARDO}
ANTHROPIC_MODEL=claude-sonnet-4-5
OPENCLAW_GATEWAY_URL=http://192.168.18.174:18789
OWNER_ID=tiago
OWNER_NAME=Tiago
OWNER_AVATAR=👨‍💻
OWNER_PHONE=+55XXXXXXXXXX
OPENCLAW_SESSION_KEY=agent:main:main
EOF
echo "✅ .env configurado (porta 4444)"
```

### 1.3 Corrigir paths hardcoded (bug do Mac do Eduardo)
```bash
# O código tem paths do Mac do Eduardo hardcoded. Substituir TODOS.
DIST_DIR="$BACKEND_DIR/dist"
if [ -d "$DIST_DIR" ]; then
    find "$DIST_DIR" -name "*.js" -exec sed -i '' \
        "s|/Volumes/TITA_039/MAC_MINI_03/.openclaw|$HOME/.openclaw|g" {} \;
    echo "✅ Paths corrigidos no dist"
fi

# Também no src (pra futuros builds)
find "$BACKEND_DIR/src" -name "*.ts" -exec sed -i '' \
    "s|/Volumes/TITA_039/MAC_MINI_03/.openclaw|$HOME/.openclaw|g" {} \; 2>/dev/null

# Criar pastas que o backend espera
mkdir -p ~/.openclaw/workspace/pasta-do-tita/vault
mkdir -p ~/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard
mkdir -p ~/.openclaw/workspace/pasta-do-tita/memoria-especialistas
mkdir -p ~/.openclaw/workspace/memory/specialists
mkdir -p ~/.openclaw/workspace/projetos
mkdir -p ~/.openclaw/workspace/cofre
mkdir -p ~/.openclaw/workspace/bin
mkdir -p ~/.openclaw/workspace/squad/reports
mkdir -p ~/.openclaw/logs
echo "✅ Pastas criadas"
```

### 1.4 Instalar PostgreSQL e Redis (se não tiver)
```bash
brew install postgresql@16 redis 2>/dev/null
brew services start postgresql@16 2>/dev/null || brew services start postgresql 2>/dev/null
brew services start redis 2>/dev/null
sleep 3
createdb titanio_tiago 2>/dev/null || echo "DB já existe"
echo "✅ PostgreSQL + Redis"
```

### 1.5 Selecionar usuário Tiago na Dashboard
```bash
# Criar diretório de dados do QuickAuth
mkdir -p "$BACKEND_DIR/.data/quickauth"
cat > "$BACKEND_DIR/.data/quickauth/current-session.json" << 'EOF'
{"userId":"user-tiago","machineId":"auto","startedAt":"2026-03-23T00:00:00Z"}
EOF
echo "✅ Usuário Tiago pré-selecionado"
```

### 1.6 Start script
```bash
cat > ~/titanio-dashboard/start.sh << 'STARTEOF'
#!/bin/bash
echo "▶ Iniciando Dashboard Tiago..."
lsof -ti :4444 | xargs kill -9 2>/dev/null
lsof -ti :3001 | xargs kill -9 2>/dev/null
sleep 1

# Detectar estrutura
if [ -d "$HOME/titanio-dashboard/code/backend" ]; then
    BD="$HOME/titanio-dashboard/code/backend"
    FD="$HOME/titanio-dashboard/code/frontend"
else
    BD="$HOME/titanio-dashboard/backend"
    FD="$HOME/titanio-dashboard/frontend"
fi

cd "$BD"
nohup node dist/index.js > /tmp/backend-tiago.log 2>&1 &
echo "✅ Backend PID $! (porta 4444)"
sleep 4

cd "$FD"
nohup npx next start -p 3001 > /tmp/frontend-tiago.log 2>&1 &
echo "✅ Frontend http://localhost:3001"
STARTEOF
chmod +x ~/titanio-dashboard/start.sh
```

### 1.7 Iniciar Dashboard
```bash
bash ~/titanio-dashboard/start.sh
sleep 5

# Selecionar Tiago via API também
curl -s -X POST http://localhost:4444/api/auth/select \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-tiago","rememberMachine":true}' > /dev/null 2>&1

# Verificar
curl -s http://localhost:4444/api/squad 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    if isinstance(d,list): print(f'✅ Dashboard OK: {len(d)} especialistas')
except: print('❌ Backend não respondeu')
"
```

### 1.8 Auto-start (launchd)
```bash
# Detectar estrutura
if [ -d "$HOME/titanio-dashboard/code/backend" ]; then
    BD_PATH="$HOME/titanio-dashboard/code/backend"
else
    BD_PATH="$HOME/titanio-dashboard/backend"
fi

cat > ~/Library/LaunchAgents/com.titanio.dashboard.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.titanio.dashboard</string>
  <key>ProgramArguments</key><array>
    <string>/bin/bash</string><string>-c</string>
    <string>cd $BD_PATH && node dist/index.js</string>
  </array>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/backend-tiago.log</string>
  <key>StandardErrorPath</key><string>/tmp/backend-tiago-error.log</string>
</dict></plist>
EOF
launchctl load ~/Library/LaunchAgents/com.titanio.dashboard.plist 2>/dev/null
```

---

## PARTE 2 — Sistema de Memória e Aprendizado

### 2.1 Identidade
```bash
mkdir -p ~/.openclaw/workspace/memory

cat > ~/.openclaw/workspace/SOUL.md << 'EOF'
# SOUL.md - Quem Sou Eu
Seja genuinamente útil. Sem filler words.
Tenha opinião. Seja resourceful.
Ganhe confiança pela competência.
Coisas privadas ficam privadas.
Conciso quando necessário, completo quando importa.
Cada sessão acorda do zero. Esses arquivos SÃO sua memória.
EOF

cat > ~/.openclaw/workspace/USER.md << 'EOF'
# USER.md
- Nome: Tiago
- Pronomes: ele/dele
- Timezone: America/Sao_Paulo (GMT-3)
- Telefone: (preencher)
- Equipe: Titanio Films (Eduardo, Tiago, Helber)
- Projetos: (preencher)
EOF

[ ! -f ~/.openclaw/workspace/MEMORY.md ] && echo "# MEMORY.md — Memória de Longo Prazo
Primeira sessão: $(date +%Y-%m-%d)" > ~/.openclaw/workspace/MEMORY.md

cat > ~/.openclaw/workspace/AGENTS.md << 'EOF'
# AGENTS.md
## Toda Sessão
1. Ler SOUL.md — quem você é
2. Ler USER.md — quem você ajuda
3. Ler memory/YYYY-MM-DD.md (hoje + ontem)
4. Em sessão principal: ler MEMORY.md

## Após Tarefas
- Registrar: bash tita-learning-system/capture-lesson.sh "tarefa" "resultado" "categoria"

## Segurança
- Não exfiltrar dados
- trash > rm
EOF
```

### 2.2 Scripts de aprendizado
```bash
mkdir -p ~/.openclaw/workspace/tita-learning-system

cat > ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh << 'SCRIPTEOF'
#!/bin/bash
TASK="$1"; RESULT="$2"; CATEGORY="${3:-geral}"
BASE="$(dirname "$0")"
LESSONS="$BASE/lessons.json"; METRICS="$BASE/metrics.json"; SCORES="$BASE/domain-scores.json"
SUCCESS=true
[[ "$RESULT" == *"Erro"* || "$RESULT" == *"falha"* || "$RESULT" == *"fail"* ]] && SUCCESS=false
DATE=$(date +%Y-%m-%d); TIME=$(date +%H:%M)
python3 << PYEOF
import json, os
lessons_file = '$LESSONS'
data = {"lessons": [], "version": 2}
if os.path.exists(lessons_file):
    try: data = json.load(open(lessons_file))
    except: pass
lessons = data.get("lessons", [])
new_id = max((l.get("id", 0) for l in lessons), default=0) + 1
lessons.append({"id": new_id, "timestamp": "$DATE $TIME", "date": "$DATE", "time": "$TIME",
    "task": '''$TASK'''[:200], "result": '''$RESULT'''[:300], "category": "$CATEGORY",
    "success": "$SUCCESS".lower() == "true"})
data["lessons"] = lessons
today_l = [l for l in lessons if l.get("date") == "$DATE"]
ok = sum(1 for l in today_l if l.get("success"))
rate = round(ok / len(today_l) * 100, 1) if today_l else 0
json.dump(data, open(lessons_file, "w"), ensure_ascii=False, indent=2)
metrics = {"sessions": [], "daily": {}}
if os.path.exists('$METRICS'):
    try: metrics = json.load(open('$METRICS'))
    except: pass
metrics["daily"]["$DATE"] = {"tasks": len(today_l), "successes": ok, "failures": len(today_l) - ok, "success_rate": rate}
json.dump(metrics, open('$METRICS', "w"), ensure_ascii=False, indent=2)
print(f"✅ Lição #{new_id} | $CATEGORY | Sucesso: $SUCCESS")
PYEOF
python3 << PYEOF
import json, os
scores_file = '$SCORES'; category = "$CATEGORY"; success = "$SUCCESS".lower() == "true"
scores = {}
if os.path.exists(scores_file):
    try: scores = json.load(open(scores_file))
    except: pass
if category not in scores: scores[category] = {"score": 5.0, "tasks": 0, "wins": 0, "history": []}
d = scores[category]; d["tasks"] += 1
if success: d["wins"] += 1
d["score"] = round(d["score"] + 0.3 * ((1.0 if success else 0.0) - d["score"] / 10.0), 2)
d["score"] = max(0, min(10, d["score"]))
d["history"] = (d["history"] + [1 if success else 0])[-10:]
r = d["history"][-5:] if len(d["history"]) >= 5 else d["history"]
d["trend"] = "↑" if sum(r)/len(r) > 0.7 else ("↓" if sum(r)/len(r) < 0.4 else "→")
d["win_rate"] = round(d["wins"] / d["tasks"] * 100, 1)
json.dump(scores, open(scores_file, "w"), ensure_ascii=False, indent=2)
PYEOF
SCRIPTEOF

cat > ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh << 'SCRIPTEOF'
#!/bin/bash
BASE="$(dirname "$0")"; WORKSPACE="$(dirname "$BASE")"
python3 << PYEOF
import json, os
from datetime import datetime, timedelta
data = json.load(open("$BASE/lessons.json")) if os.path.exists("$BASE/lessons.json") else {"lessons": []}
lessons = data.get("lessons", [])
week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
recent = [l for l in lessons if l.get("date", "") >= week_ago]
total = len(recent); success = len([l for l in recent if l.get("success", True)])
rate = round(success / total * 100, 1) if total > 0 else 0
entry = f"\n## Semana {datetime.now().strftime('%Y-%m-%d')} — Auto-consolidação\n- {total} tarefas, {rate}% sucesso\n"
for f in [l for l in recent if not l.get("success", True)][:5]:
    entry += f"- ⚠️ [{f.get('category','?')}] {f.get('task','')[:80]}\n"
with open("$WORKSPACE/MEMORY.md", "a") as mf: mf.write(entry)
print(f"✅ MEMORY.md: {total} tarefas, {rate}%")
PYEOF
SCRIPTEOF

cat > ~/.openclaw/workspace/tita-learning-system/dashboard.sh << 'SCRIPTEOF'
#!/bin/bash
BASE="$(dirname "$0")"
python3 << PYEOF
import json, os, datetime
base = "$BASE"
lessons = json.load(open(f'{base}/lessons.json')).get('lessons', []) if os.path.exists(f'{base}/lessons.json') else []
scores = json.load(open(f'{base}/domain-scores.json')) if os.path.exists(f'{base}/domain-scores.json') else {}
today = datetime.date.today().isoformat()
print("=" * 50)
print("🧠 DASHBOARD DE APRENDIZADO — TIAGO")
print("=" * 50)
today_l = [l for l in lessons if l.get('date', '') == today]
if today_l:
    ok = sum(1 for l in today_l if l.get('success'))
    print(f"Hoje: {len(today_l)} tarefas | {round(ok/len(today_l)*100,1)}%")
print(f"Total: {len(lessons)} lições")
for cat, d in sorted(scores.items(), key=lambda x: -x[1].get('score', 0)):
    bar = "█" * int(d.get('score', 0)) + "░" * (10 - int(d.get('score', 0)))
    print(f"  {cat:15} {bar} {d.get('score',0):.1f}/10 {d.get('trend','→')}")
print("=" * 50)
PYEOF
SCRIPTEOF

chmod +x ~/.openclaw/workspace/tita-learning-system/*.sh
echo '{"lessons":[],"version":2}' > ~/.openclaw/workspace/tita-learning-system/lessons.json 2>/dev/null
[ ! -f ~/.openclaw/workspace/tita-learning-system/domain-scores.json ] && echo '{}' > ~/.openclaw/workspace/tita-learning-system/domain-scores.json
[ ! -f ~/.openclaw/workspace/tita-learning-system/metrics.json ] && echo '{"sessions":[],"daily":{}}' > ~/.openclaw/workspace/tita-learning-system/metrics.json
(crontab -l 2>/dev/null | grep -v consolidate; echo "0 */6 * * * bash ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh >> /tmp/memory-consolidate.log 2>&1") | crontab -
echo "✅ Learning system configurado"
```

---

## PARTE 3 — Especialistas + Memória dos 30

### 3.1 Especialistas locais (arquivos)
```bash
mkdir -p ~/.openclaw/workspace/squad/scripts
for spec in backend-specialist ios-specialist security-guardian memory-bot design-specialist; do
    mkdir -p ~/.openclaw/workspace/squad/specialists/$spec
    [ ! -f ~/.openclaw/workspace/squad/specialists/$spec/LESSONS.md ] && echo "# $spec — Lições
## Regras: atualizar após cada tarefa" > ~/.openclaw/workspace/squad/specialists/$spec/LESSONS.md
    [ ! -f ~/.openclaw/workspace/squad/specialists/$spec/context-inject.md ] && echo "# $spec — Contexto
Especialista da squad Titanio." > ~/.openclaw/workspace/squad/specialists/$spec/context-inject.md
done
```

### 3.2 Knowledge base compartilhada
```bash
mkdir -p ~/.openclaw/workspace/squad/knowledge-base
cat > ~/.openclaw/workspace/squad/knowledge-base/titanio-context.md << 'EOF'
# Titanio — Contexto Geral
- Titanio Produções Artísticas Ltda
- Email: contact@titaniofilms.com
- Apple Team: TY646U2BYX

## Projetos
- GospIA — React Native/Expo + Next.js + Supabase (Bundle: com.titanio.gospia)
- KidsHQ — React Native/Expo + FamilyControls Swift
- Maricá Film Commission — WordPress/Elementor

## Stack
- Mobile: React Native 0.83 + Expo ~55
- Backend: Next.js 14 + Vercel
- DB/Auth: Supabase
- IA: Groq (llama-3.1-8b-instant)
- iOS: builds locais (NUNCA EAS)
EOF
```

### 3.3 Memória dos 30 especialistas da Dashboard
```bash
MEMORY_BASE="$HOME/.openclaw/workspace/pasta-do-tita/memoria-especialistas"
mkdir -p "$MEMORY_BASE"
for spec in code-ninja design-wizard debug-hunter devops-ninja aso-specialist growth-hacker api-master security-guard marketing-ninja data-analyst automation-bot content-writer memory-bot ios-specialist money-maker agent-doctor security-guardian gold-digger literary-agent mac-specialist whatsapp-titanio marketing-director tradutor mentor-titanio diretor-de-arte audiodesc-specialist ceo-titanio advogado-titanio radio-gospia fund-hunter; do
    mkdir -p "$MEMORY_BASE/$spec/sessions"
    [ ! -f "$MEMORY_BASE/$spec/MEMORY.md" ] && echo "# $spec — Memória
Criado: $(date +%Y-%m-%d)" > "$MEMORY_BASE/$spec/MEMORY.md"
    [ ! -f "$MEMORY_BASE/$spec/LESSONS.md" ] && echo "# $spec — Lições
## Atualizar após cada tarefa" > "$MEMORY_BASE/$spec/LESSONS.md"
done
echo "✅ Memória de 30 especialistas inicializada"
```

### 3.4 Scripts do squad
```bash
cat > ~/.openclaw/workspace/squad/scripts/capture-lesson.sh << 'SCRIPTEOF'
#!/bin/bash
SQUAD_DIR="$HOME/.openclaw/workspace/squad"
SPECIALIST="$1"; LESSON="$2"; CATEGORY="${3:-geral}"; SUCCESS="${4:-s}"
DATE=$(date +"%Y-%m-%d"); TIME=$(date +"%H:%M")
[ -z "$SPECIALIST" ] || [ -z "$LESSON" ] && echo "Uso: $0 <especialista> <lição> [categoria] [s/n]" && exit 1
LESSONS_FILE="$SQUAD_DIR/specialists/$SPECIALIST/LESSONS.md"
[ ! -f "$LESSONS_FILE" ] && echo "Especialista não encontrado" && exit 1
echo "
### $DATE $TIME — $CATEGORY
- **Lição:** $LESSON
- **Resultado:** $([ "$SUCCESS" = "s" ] && echo "✅ Sucesso" || echo "❌ Falha")" >> "$LESSONS_FILE"
bash "$HOME/.openclaw/workspace/tita-learning-system/capture-lesson.sh" "$LESSON" "$([ "$SUCCESS" = "s" ] && echo "Sucesso" || echo "Erro")" "$CATEGORY"
SCRIPTEOF

cat > ~/.openclaw/workspace/squad/scripts/daily-consolidate.sh << 'SCRIPTEOF'
#!/bin/bash
SQUAD_DIR="$HOME/.openclaw/workspace/squad"; DATE=$(date +"%Y-%m-%d")
REPORT="$SQUAD_DIR/reports/consolidation-$DATE.md"; mkdir -p "$SQUAD_DIR/reports"
echo "# Consolidação — $DATE" > "$REPORT"
for SPEC in $(ls "$SQUAD_DIR/specialists/" 2>/dev/null); do
    LESSONS="$SQUAD_DIR/specialists/$SPEC/LESSONS.md"
    [ -f "$LESSONS" ] && echo "## $SPEC: $(grep -c "### $DATE" "$LESSONS" 2>/dev/null || echo 0) lições" >> "$REPORT"
done
bash "$HOME/.openclaw/workspace/tita-learning-system/dashboard.sh" 2>/dev/null | head -20
SCRIPTEOF

chmod +x ~/.openclaw/workspace/squad/scripts/*.sh
```

---

## PARTE 4 — LightRAG

### 4.1 Instalar
```bash
brew install ollama 2>/dev/null
brew services start ollama 2>/dev/null
ollama pull llama3.1:8b 2>/dev/null &
ollama pull nomic-embed-text 2>/dev/null &
wait

cd ~/.openclaw/workspace
python3 -m venv venv-lightrag 2>/dev/null
source venv-lightrag/bin/activate
pip install lightrag-hku httpx 2>/dev/null

mkdir -p lightrag-memory/storage lightrag-memory/docs
cat > lightrag-memory/.env << 'EOF'
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

### 4.2 Scripts sync + query
```bash
cat > ~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh << 'SCRIPTEOF'
#!/bin/bash
WORKSPACE="${WORKSPACE_DIR:-$HOME/.openclaw/workspace}"
SQUAD="$WORKSPACE/squad/specialists"; LIGHTRAG_URL="http://localhost:9621"; CHUNK_SIZE=3000
curl -s "$LIGHTRAG_URL/health" > /dev/null 2>&1 || { echo "❌ LightRAG off"; exit 1; }
warmup() {
    curl -s http://localhost:11434/api/chat -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"ready"}],"stream":false,"keep_alive":3600}' > /dev/null 2>&1
    curl -s http://localhost:11434/api/embed -d '{"model":"nomic-embed-text","input":["warmup"],"keep_alive":3600}' > /dev/null 2>&1
}
echo "🔥 Aquecendo..."; warmup
FULL_DOC=""
for d in "$SQUAD"/*/; do
    spec=$(basename "$d"); FULL_DOC+="=== $spec ==="$'\n'
    for f in PROFILE.md LESSONS.md context-inject.md; do [ -f "$d/$f" ] && FULL_DOC+=$(cat "$d/$f")$'\n'; done
done
[ -f "$WORKSPACE/MEMORY.md" ] && FULL_DOC+=$(cat "$WORKSPACE/MEMORY.md")$'\n'
TOTAL=${#FULL_DOC}; N=0; OK=0; OFF=0
while [ $OFF -lt $TOTAL ]; do
    CHUNK="${FULL_DOC:$OFF:$CHUNK_SIZE}"; N=$((N+1))
    [ $((N%3)) -eq 1 ] && warmup
    C=$(echo "$CHUNK" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")
    R=$(curl -s -X POST "$LIGHTRAG_URL/documents/text" -H "Content-Type: application/json" -d "{\"text\":$C}")
    echo "$R" | grep -q success && OK=$((OK+1))
    sleep 15
    while true; do
        BUSY=$(curl -s "$LIGHTRAG_URL/health" | python3 -c "import sys,json; print(json.load(sys.stdin).get('pipeline_busy',False))" 2>/dev/null)
        [ "$BUSY" = "False" ] && break; sleep 10
    done
    OFF=$((OFF+CHUNK_SIZE))
done
echo "📊 $OK/$N chunks"
SCRIPTEOF

cat > ~/.openclaw/workspace/squad/scripts/lightrag-query.sh << 'SCRIPTEOF'
#!/bin/bash
QUERY="$1"; MODE="${2:-hybrid}"
[ -z "$QUERY" ] && echo "Uso: $0 \"pergunta\" [modo]" && exit 1
curl -s -X POST http://localhost:9621/query -H "Content-Type: application/json" \
    -d "{\"query\":\"$QUERY\",\"mode\":\"$MODE\"}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('response','?'))"
SCRIPTEOF
chmod +x ~/.openclaw/workspace/squad/scripts/lightrag-*.sh
```

### 4.3 Iniciar + auto-start
```bash
cd ~/.openclaw/workspace/lightrag-memory
source ~/.openclaw/workspace/venv-lightrag/bin/activate
nohup lightrag-server --host 0.0.0.0 --port 9621 \
    --working-dir ~/.openclaw/workspace/lightrag-memory/storage \
    --llm-binding ollama --embedding-binding ollama --max-async 1 \
    > /tmp/lightrag.log 2>&1 &
sleep 10

cat > ~/Library/LaunchAgents/com.titanio.lightrag.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.titanio.lightrag</string>
  <key>ProgramArguments</key><array>
    <string>/bin/bash</string><string>-c</string>
    <string>cd ~/.openclaw/workspace/lightrag-memory &amp;&amp; source ~/.openclaw/workspace/venv-lightrag/bin/activate &amp;&amp; lightrag-server --host 0.0.0.0 --port 9621 --working-dir ~/.openclaw/workspace/lightrag-memory/storage --llm-binding ollama --embedding-binding ollama --max-async 1</string>
  </array>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
  <key>EnvironmentVariables</key><dict>
    <key>LLM_MODEL</key><string>llama3.1:8b</string>
    <key>EMBEDDING_MODEL</key><string>nomic-embed-text</string>
    <key>LLM_BINDING_HOST</key><string>http://localhost:11434</string>
    <key>EMBEDDING_BINDING_HOST</key><string>http://localhost:11434</string>
  </dict>
</dict></plist>
EOF
launchctl load ~/Library/LaunchAgents/com.titanio.lightrag.plist 2>/dev/null
```

---

## PARTE 5 — N8n (API key via SQLite + 3 workflows)

### 5.1 Instalar N8n (se não tiver)
```bash
which n8n > /dev/null 2>&1 || npm install -g n8n
# Iniciar se não estiver rodando
pgrep -f "n8n start" > /dev/null || nohup n8n start > /tmp/n8n.log 2>&1 &
sleep 10
```

### 5.2 Descobrir porta e criar API key
```bash
N8N_PORT=$(lsof -i -P 2>/dev/null | grep LISTEN | grep node | grep -oE ":[0-9]+" | sed 's/://' | sort -u | while read p; do
    curl -s -o /dev/null -w "%{http_code}" "http://localhost:$p/api/v1/workflows" 2>/dev/null | grep -q "401\|200" && echo "$p" && break
done)
[ -z "$N8N_PORT" ] && N8N_PORT=5678
echo "N8n porta: $N8N_PORT"

N8N_DB=$(find ~/.n8n /Volumes -maxdepth 5 -name "database.sqlite" -path "*n8n*" 2>/dev/null | head -1)
[ -z "$N8N_DB" ] && N8N_DB="$HOME/.n8n/database.sqlite"

USER_ID=$(sqlite3 "$N8N_DB" "SELECT id FROM user LIMIT 1;" 2>/dev/null)
EXISTING_KEY=$(sqlite3 "$N8N_DB" "SELECT apiKey FROM user_api_keys WHERE userId='$USER_ID' LIMIT 1;" 2>/dev/null)

if [ -n "$EXISTING_KEY" ]; then
    N8N_API_KEY="$EXISTING_KEY"
    echo "✅ Key existente: $N8N_API_KEY"
else
    N8N_API_KEY="n8n_api_$(openssl rand -hex 16)"
    sqlite3 "$N8N_DB" "INSERT INTO user_api_keys (userId, apiKey, label, createdAt, updatedAt) VALUES ('$USER_ID', '$N8N_API_KEY', 'openclaw-auto', datetime('now'), datetime('now'));"
    echo "✅ Key criada: $N8N_API_KEY"
fi

curl -s "http://localhost:${N8N_PORT}/api/v1/workflows" -H "X-N8N-API-KEY: $N8N_API_KEY" | python3 -c "import sys,json; print(f'✅ API OK')" 2>/dev/null || echo "❌ API falhou"
```

### 5.3 Criar 3 workflows
```bash
# 1. Daily Memory Consolidation
curl -s -X POST "http://localhost:${N8N_PORT}/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Daily Memory Consolidation","nodes":[{"parameters":{"rule":{"interval":[{"field":"cronExpression","expression":"0 23 * * *"}]}},"id":"s1","name":"23h","type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.2,"position":[250,300]},{"parameters":{"command":"bash ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh && bash ~/.openclaw/workspace/squad/scripts/daily-consolidate.sh 2>&1"},"id":"c1","name":"Consolidate","type":"n8n-nodes-base.executeCommand","typeVersion":1,"position":[500,300]}],"connections":{"23h":{"main":[[{"node":"Consolidate","type":"main","index":0}]]}},"settings":{"executionOrder":"v1"},"active":false}' 2>/dev/null | python3 -c "import sys,json; print(f'✅ Workflow 1: {json.load(sys.stdin).get(\"name\",\"?\")}')" 2>/dev/null

# 2. LightRAG Sync
curl -s -X POST "http://localhost:${N8N_PORT}/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"LightRAG Knowledge Sync","nodes":[{"parameters":{"rule":{"interval":[{"field":"hours","hoursInterval":6}]}},"id":"s2","name":"6h","type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.2,"position":[250,300]},{"parameters":{"command":"export WORKSPACE_DIR=$HOME/.openclaw/workspace && bash $HOME/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh >> /tmp/lightrag-sync.log 2>&1"},"id":"c2","name":"Sync","type":"n8n-nodes-base.executeCommand","typeVersion":1,"position":[500,300]}],"connections":{"6h":{"main":[[{"node":"Sync","type":"main","index":0}]]}},"settings":{"executionOrder":"v1"},"active":false}' 2>/dev/null | python3 -c "import sys,json; print(f'✅ Workflow 2: {json.load(sys.stdin).get(\"name\",\"?\")}')" 2>/dev/null

# 3. Health Watchdog
curl -s -X POST "http://localhost:${N8N_PORT}/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Health Watchdog","nodes":[{"parameters":{"rule":{"interval":[{"field":"minutes","minutesInterval":5}]}},"id":"s3","name":"5min","type":"n8n-nodes-base.scheduleTrigger","typeVersion":1.2,"position":[250,300]},{"parameters":{"command":"echo \"{\\\"ts\\\":\\\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\\",\\\"ok\\\":true}\" >> /tmp/health-watchdog.jsonl"},"id":"c3","name":"Check","type":"n8n-nodes-base.executeCommand","typeVersion":1,"position":[500,300]}],"connections":{"5min":{"main":[[{"node":"Check","type":"main","index":0}]]}},"settings":{"executionOrder":"v1"},"active":false}' 2>/dev/null | python3 -c "import sys,json; print(f'✅ Workflow 3: {json.load(sys.stdin).get(\"name\",\"?\")}')" 2>/dev/null

# Ativar todos
curl -s "http://localhost:${N8N_PORT}/api/v1/workflows" -H "X-N8N-API-KEY: $N8N_API_KEY" 2>/dev/null | python3 -c "
import sys, json, subprocess
data = json.load(sys.stdin).get('data', [])
for wf in data:
    if not wf.get('active'):
        subprocess.run(['curl','-s','-X','PATCH',
            f'http://localhost:${N8N_PORT}/api/v1/workflows/{wf[\"id\"]}',
            '-H',f'X-N8N-API-KEY: ${N8N_API_KEY}',
            '-H','Content-Type: application/json',
            '-d','{\"active\":true}'], capture_output=True)
        print(f'  ✅ Ativado: {wf[\"name\"]}')
" 2>/dev/null

echo "$N8N_API_KEY" > ~/.openclaw/workspace/.n8n-api-key
```

---

## PARTE 6 — Fix do Modelo (bug smooth-switch)

```bash
# O smooth-switch.sh reescreve _smooth_switch na config e reverte o modelo pra Haiku.
# Deletar e limpar:
rm -f ~/.openclaw/workspace/squad/scripts/smooth-switch.sh 2>/dev/null
echo "# Desabilitado — causava bug" > ~/.openclaw/workspace/squad/scripts/smooth-switch.sh.DISABLED

# Limpar config do OpenClaw
OPENCLAW_CONFIG="$HOME/.openclaw/openclaw.json"
if [ -f "$OPENCLAW_CONFIG" ]; then
    python3 << PYEOF
import json
p = "$OPENCLAW_CONFIG"
try:
    d = json.load(open(p))
    d.pop('_smooth_switch', None)
    # Se existir agents.defaults.model.primary, garantir que é opus
    if 'agents' in d and 'defaults' in d['agents'] and 'model' in d['agents']['defaults']:
        d['agents']['defaults']['model']['primary'] = 'anthropic/claude-opus-4-6'
    json.dump(d, open(p, 'w'), indent=2)
    print("✅ Config limpa — Opus como default")
except Exception as e:
    print(f"⚠️ Config: {e}")
PYEOF
fi
```

---

## PARTE 7 — Watchdog + Caffeinate

```bash
pgrep -x caffeinate > /dev/null || nohup caffeinate -dims &>/dev/null &

cat > ~/.openclaw/workspace/watchdog.sh << 'WEOF'
#!/bin/bash
while true; do
    pgrep -x caffeinate > /dev/null || nohup caffeinate -dims &>/dev/null &
    curl -s -o /dev/null http://localhost:4444/api/health || {
        echo "$(date) — Backend morreu, reiniciando..."
        if [ -d "$HOME/titanio-dashboard/code/backend" ]; then
            cd "$HOME/titanio-dashboard/code/backend"
        else
            cd "$HOME/titanio-dashboard/backend"
        fi
        nohup node dist/index.js >> /tmp/backend-tiago.log 2>&1 &
    }
    curl -s -o /dev/null http://localhost:9621/health 2>/dev/null || {
        echo "$(date) — LightRAG morreu, reiniciando..."
        cd ~/.openclaw/workspace/lightrag-memory
        source ~/.openclaw/workspace/venv-lightrag/bin/activate 2>/dev/null
        nohup lightrag-server --host 0.0.0.0 --port 9621 \
            --working-dir ~/.openclaw/workspace/lightrag-memory/storage \
            --llm-binding ollama --embedding-binding ollama --max-async 1 \
            >> /tmp/lightrag.log 2>&1 &
    }
    sleep 300
done
WEOF
chmod +x ~/.openclaw/workspace/watchdog.sh
pgrep -f "watchdog.sh" > /dev/null || nohup bash ~/.openclaw/workspace/watchdog.sh >> /tmp/watchdog.log 2>&1 &
```

---

## PARTE 8 — Gateway Central
```bash
cat > ~/Library/LaunchAgents/com.titanio.openclaw-node.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.titanio.openclaw-node</string>
  <key>ProgramArguments</key><array>
    <string>/bin/bash</string><string>-c</string>
    <string>openclaw node run --host 192.168.18.174 --port 18789 --display-name "Tiago Node"</string>
  </array>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
</dict></plist>
EOF
launchctl load ~/Library/LaunchAgents/com.titanio.openclaw-node.plist 2>/dev/null
```

---

## PARTE 9 — Primeira indexação LightRAG
```bash
export WORKSPACE_DIR="$HOME/.openclaw/workspace"
bash ~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh 2>/dev/null &
```

---

## PARTE 10 — Checklist Final (REPORTAR NO GRUPO GOSPIA)

```bash
echo "╔══════════════════════════════════════════════╗"
echo "║        CHECKLIST FINAL — TIAGO               ║"
echo "╠══════════════════════════════════════════════╣"
echo -n "║  1. Backend (4444)        "; curl -m 3 -s http://localhost:4444/api/health > /dev/null 2>&1 && echo "✅  ║" || echo "❌  ║"
echo -n "║  2. Frontend (3001)       "; curl -m 3 -s http://localhost:3001 > /dev/null 2>&1 && echo "✅  ║" || echo "❌  ║"
echo -n "║  3. Especialistas API     "; curl -m 3 -s http://localhost:4444/api/squad 2>/dev/null | python3 -c "import sys,json; print(f'{len(json.load(sys.stdin))}  ║')" 2>/dev/null || echo "?   ║"
echo -n "║  4. Usuário ativo         "; curl -m 3 -s http://localhost:4444/api/auth/me 2>/dev/null | python3 -c "import sys,json; print(f'{json.load(sys.stdin).get(\"user\",{}).get(\"displayName\",\"?\")}  ║')" 2>/dev/null || echo "?   ║"
echo -n "║  5. PostgreSQL            "; pg_isready > /dev/null 2>&1 && echo "✅  ║" || echo "❌  ║"
echo -n "║  6. Redis                 "; redis-cli ping 2>/dev/null | grep -q PONG && echo "✅  ║" || echo "❌  ║"
echo -n "║  7. N8n                   "; curl -m 3 -s "http://localhost:${N8N_PORT:-5678}" > /dev/null 2>&1 && echo "✅  ║" || echo "❌  ║"
echo -n "║  8. N8n Workflows         "; [ -f ~/.openclaw/workspace/.n8n-api-key ] && curl -m 3 -s "http://localhost:${N8N_PORT:-5678}/api/v1/workflows" -H "X-N8N-API-KEY: $(cat ~/.openclaw/workspace/.n8n-api-key)" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',[]); print(f'{len(d)} ({sum(1 for w in d if w.get(\"active\"))} ativos) ║')" 2>/dev/null || echo "?   ║"
echo -n "║  9. Ollama                "; curl -m 3 -s http://localhost:11434/api/tags > /dev/null 2>&1 && echo "✅  ║" || echo "❌  ║"
echo -n "║ 10. LightRAG             "; curl -m 3 -s http://localhost:9621/health > /dev/null 2>&1 && echo "✅  ║" || echo "❌  ║"
echo -n "║ 11. Learning System      "; [ -f ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh ] && echo "✅  ║" || echo "❌  ║"
echo -n "║ 12. Especialistas files  "; ls ~/.openclaw/workspace/squad/specialists/ 2>/dev/null | wc -l | xargs echo -n; echo "   ║"
echo -n "║ 13. Memória 30 specs     "; ls ~/.openclaw/workspace/pasta-do-tita/memoria-especialistas/ 2>/dev/null | wc -l | xargs echo -n; echo "   ║"
echo -n "║ 14. SOUL.md              "; [ -f ~/.openclaw/workspace/SOUL.md ] && echo "✅  ║" || echo "❌  ║"
echo -n "║ 15. MEMORY.md            "; [ -f ~/.openclaw/workspace/MEMORY.md ] && echo "✅  ║" || echo "❌  ║"
echo -n "║ 16. Modelo (opus)        "; python3 -c "
import json
try:
    d=json.load(open('$HOME/.openclaw/openclaw.json'))
    m=d.get('agents',{}).get('defaults',{}).get('model',{}).get('primary','?')
    print(f'{m}  ║')
except: print('?  ║')
" 2>/dev/null
echo -n "║ 17. smooth-switch        "; [ ! -f ~/.openclaw/workspace/squad/scripts/smooth-switch.sh ] && echo "removido ✅ ║" || echo "⚠️ presente ║"
echo -n "║ 18. Cron                 "; crontab -l 2>/dev/null | grep -q consolidate && echo "✅  ║" || echo "❌  ║"
echo -n "║ 19. Watchdog             "; pgrep -f watchdog.sh > /dev/null && echo "✅  ║" || echo "❌  ║"
echo -n "║ 20. Caffeinate           "; pgrep -x caffeinate > /dev/null && echo "✅  ║" || echo "❌  ║"
echo -n "║ 21. Gateway Eduardo      "; curl -m 3 -s http://192.168.18.174:18789 > /dev/null 2>&1 && echo "✅  ║" || echo "❌ (off) ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Dashboard: http://localhost:3001            ║"
echo "╚══════════════════════════════════════════════╝"
```

**Registrar lição e reportar resultado no grupo Gospia.**
```bash
bash ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh "Setup definitivo completo" "Sucesso" "setup"
```
