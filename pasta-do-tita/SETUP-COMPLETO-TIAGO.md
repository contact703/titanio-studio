# Setup Completo — Tiago
# Dashboard Titanio v2 + Sistema de Memória + LightRAG + Especialistas
# O OpenClaw do Tiago deve ler este arquivo e executar tudo

---

## PARTE 1 — Dashboard Titanio v2 (1 comando)

A Dashboard é o painel central com 30 especialistas, chat, projetos, monitoramento.

### Instalar Dashboard
```bash
cd ~ && git clone https://github.com/contact703/titanio-dashboard.git titanio-dashboard
cd titanio-dashboard/code/backend && npm install --legacy-peer-deps && npx tsc
cd ../frontend && npm install --legacy-peer-deps && npx next build
```

### Configurar .env do Backend
```bash
cat > ~/titanio-dashboard/code/backend/.env << 'EOF'
PORT=4446
NODE_ENV=development
MAC_ID=3
CORS_ORIGIN=http://localhost:3002
DATABASE_URL="postgresql://$(whoami):@localhost:5432/titanio_tiago?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="titanio-tiago-2026"
ANTHROPIC_API_KEY=PEDIR_PRO_EDUARDO
ANTHROPIC_MODEL=claude-sonnet-4-5
OPENCLAW_GATEWAY_URL=http://192.168.18.174:18789
OWNER_ID=tiago
OWNER_NAME=Tiago
OWNER_AVATAR=🧑‍💻
OWNER_PHONE=+55XXXXXXXXXX
OPENCLAW_SESSION_KEY=agent:main:main
EOF
```

### Instalar PostgreSQL e Redis (se não tiver)
```bash
brew install postgresql@16 redis
brew services start postgresql@16
brew services start redis
createdb titanio_tiago
```

### Configurar proxy frontend
```bash
cat > ~/titanio-dashboard/code/frontend/next.config.js << 'NEXTJS'
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/backend/:path*', destination: 'http://localhost:4446/:path*' }]
  },
};
module.exports = nextConfig;
NEXTJS
```

### Script de start
```bash
cat > ~/titanio-dashboard/start.sh << 'STARTEOF'
#!/bin/bash
echo "▶ Iniciando Dashboard Tiago..."
lsof -ti :4446 | xargs kill -9 2>/dev/null
lsof -ti :3002 | xargs kill -9 2>/dev/null
sleep 1
cd ~/titanio-dashboard/code/backend
nohup node dist/index.js > /tmp/backend-tiago.log 2>&1 &
echo "✅ Backend PID $! (porta 4446)"
sleep 3
cd ~/titanio-dashboard/code/frontend
nohup npx next start -p 3002 > /tmp/frontend-tiago.log 2>&1 &
echo "✅ Frontend http://localhost:3002"
STARTEOF
chmod +x ~/titanio-dashboard/start.sh
```

### Iniciar
```bash
bash ~/titanio-dashboard/start.sh
```

### Auto-start (launchd)
```bash
cat > ~/Library/LaunchAgents/com.titanio.dashboard.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.titanio.dashboard</string>
  <key>ProgramArguments</key><array>
    <string>/bin/bash</string><string>-c</string>
    <string>cd ~/titanio-dashboard/code/backend && node dist/index.js >> /tmp/backend-tiago.log 2>&1</string>
  </array>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/backend-tiago.log</string>
</dict></plist>
EOF
launchctl load ~/Library/LaunchAgents/com.titanio.dashboard.plist
```

---

## PARTE 2 — Sistema de Memória e Aprendizado

### Criar estrutura
```bash
cd ~/.openclaw/workspace
mkdir -p memory tita-learning-system squad/specialists squad/knowledge-base squad/scripts squad/reports lightrag-memory/storage lightrag-memory/docs
```

### SOUL.md
```bash
cat > ~/.openclaw/workspace/SOUL.md << 'EOF'
# SOUL.md - Quem Sou Eu
Seja genuinamente útil. Sem filler words.
Tenha opinião. Seja resourceful.
Ganhe confiança pela competência.
Coisas privadas ficam privadas.
Conciso quando necessário, completo quando importa.
Cada sessão acorda do zero. Esses arquivos SÃO sua memória.
EOF
```

### USER.md
```bash
cat > ~/.openclaw/workspace/USER.md << 'EOF'
# USER.md
- Nome: Tiago
- Pronomes: ele/dele
- Timezone: America/Sao_Paulo (GMT-3)
- Telefone: (preencher)
- Equipe: Titanio Films (Eduardo, Tiago, Tiago)
- Projetos: (preencher com os projetos do Tiago)
EOF
```

### MEMORY.md e AGENTS.md
```bash
echo "# MEMORY.md — Memória de Longo Prazo
Primeira sessão: $(date +%Y-%m-%d)" > ~/.openclaw/workspace/MEMORY.md

cat > ~/.openclaw/workspace/AGENTS.md << 'EOF'
# AGENTS.md
## Toda Sessão
1. Ler SOUL.md — quem você é
2. Ler USER.md — quem você ajuda
3. Ler memory/YYYY-MM-DD.md (hoje + ontem)
4. Em sessão principal: ler MEMORY.md

## Após Tarefas
- Registrar lição: bash tita-learning-system/capture-lesson.sh "tarefa" "resultado" "categoria"

## Segurança
- Não exfiltrar dados privados
- trash > rm
- Na dúvida, perguntar
EOF
```

### capture-lesson.sh
```bash
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
print(f"✅ Lição #{new_id} | {category} | Sucesso: $SUCCESS")
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
```

### consolidate-memory.sh
```bash
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
```

### dashboard.sh
```bash
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
print("🧠 DASHBOARD DE APRENDIZADO")
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
```

### Ativar scripts e cron
```bash
chmod +x ~/.openclaw/workspace/tita-learning-system/*.sh
echo '{"lessons":[],"version":2}' > ~/.openclaw/workspace/tita-learning-system/lessons.json
echo '{}' > ~/.openclaw/workspace/tita-learning-system/domain-scores.json
echo '{"sessions":[],"daily":{}}' > ~/.openclaw/workspace/tita-learning-system/metrics.json
(crontab -l 2>/dev/null; echo "0 */6 * * * bash ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh >> /tmp/memory-consolidate.log 2>&1") | crontab -
```

---

## PARTE 3 — Especialistas (arquivos locais)

```bash
for spec in backend-specialist ios-specialist security-guardian memory-bot design-specialist; do
  mkdir -p ~/.openclaw/workspace/squad/specialists/$spec
  echo "# $spec — Lições Aprendidas
## 🔴 Regras Críticas
- Ao terminar qualquer tarefa: atualizar este arquivo" > ~/.openclaw/workspace/squad/specialists/$spec/LESSONS.md
  echo "# $spec — Contexto
Especialista da squad Titanio. Ao terminar tarefas, atualizar LESSONS.md." > ~/.openclaw/workspace/squad/specialists/$spec/context-inject.md
done
echo "✅ 5 especialistas criados"
```

### Knowledge Base compartilhada (mesma do Eduardo)
```bash
cat > ~/.openclaw/workspace/squad/knowledge-base/titanio-context.md << 'EOF'
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
EOF
```

---

## PARTE 4 — LightRAG (Grafo de Conhecimento)

### Instalar Ollama + modelos
```bash
brew install ollama
brew services start ollama
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

### Instalar LightRAG
```bash
cd ~/.openclaw/workspace
python3 -m venv venv-lightrag
source venv-lightrag/bin/activate
pip install lightrag-hku httpx
```

### Configurar
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

### Script sync (especialistas → grafo)
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
echo "📊 $OK/$N chunks indexados"
SCRIPTEOF
chmod +x ~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh
```

### Script query
```bash
cat > ~/.openclaw/workspace/squad/scripts/lightrag-query.sh << 'SCRIPTEOF'
#!/bin/bash
QUERY="$1"; MODE="${2:-hybrid}"
[ -z "$QUERY" ] && echo "Uso: $0 \"pergunta\" [naive|local|global|hybrid]" && exit 1
curl -s -X POST http://localhost:9621/query -H "Content-Type: application/json" \
  -d "{\"query\":\"$QUERY\",\"mode\":\"$MODE\"}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('response','Sem resposta'))"
SCRIPTEOF
chmod +x ~/.openclaw/workspace/squad/scripts/lightrag-query.sh
```

### Iniciar e auto-start LightRAG
```bash
cd ~/.openclaw/workspace/lightrag-memory
source ~/.openclaw/workspace/venv-lightrag/bin/activate
nohup lightrag-server --host 0.0.0.0 --port 9621 \
  --working-dir ~/.openclaw/workspace/lightrag-memory/storage \
  --llm-binding ollama --embedding-binding ollama --max-async 1 \
  > /tmp/lightrag.log 2>&1 &

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
launchctl load ~/Library/LaunchAgents/com.titanio.lightrag.plist
```

### Primeira indexação
```bash
bash ~/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh
```

---

## PARTE 5 — Conectar ao Cluster (Gateway do Eduardo)

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
launchctl load ~/Library/LaunchAgents/com.titanio.openclaw-node.plist
```

---

## PARTE 6 — Checklist Final

```bash
echo "=== CHECKLIST TIAGO ==="
echo -n "1. Dashboard Backend: "; curl -m 3 -s http://localhost:4446/ > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "2. Dashboard Frontend: "; curl -m 3 -s http://localhost:3002 > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "3. PostgreSQL: "; pg_isready > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "4. Redis: "; redis-cli ping 2>/dev/null | grep -q PONG && echo "✅" || echo "❌"
echo -n "5. Ollama: "; curl -s http://localhost:11434/api/tags > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "6. LightRAG: "; curl -s http://localhost:9621/health > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "7. Learning system: "; [ -f ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh ] && echo "✅" || echo "❌"
echo -n "8. Especialistas: "; ls ~/.openclaw/workspace/squad/specialists/ 2>/dev/null | wc -l | xargs echo
echo -n "9. Cron: "; crontab -l 2>/dev/null | grep -q consolidate && echo "✅" || echo "❌"
echo -n "10. SOUL.md: "; [ -f ~/.openclaw/workspace/SOUL.md ] && echo "✅" || echo "❌"
echo -n "11. Gateway: "; curl -m 3 -s http://192.168.18.174:18789 > /dev/null 2>&1 && echo "✅" || echo "❌ (Mac Eduardo off?)"
```

Todos devem ser ✅. Acesse http://localhost:3002 para ver a Dashboard.
