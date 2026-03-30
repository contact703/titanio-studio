# N8n + Workflows + Tudo que falta — Helber
# O OpenClaw do Helber deve executar TODOS os passos sem perguntar nada

---

## 1. DESCOBRIR PORTA DO N8N

```bash
N8N_PORT=$(lsof -i -P | grep LISTEN | grep n8n | awk '{print $9}' | sed 's/.*://' | head -1)
[ -z "$N8N_PORT" ] && N8N_PORT=$(ps aux | grep "n8n start" | grep -v grep | grep -oE "\-\-port [0-9]+" | awk '{print $2}')
[ -z "$N8N_PORT" ] && N8N_PORT=5678
echo "N8n porta: $N8N_PORT"
```

---

## 2. CRIAR API KEY VIA SQLITE (sem browser)

```bash
# Encontrar o banco do N8n
N8N_DB=$(find ~/.n8n /Volumes -maxdepth 5 -name "database.sqlite" -path "*n8n*" 2>/dev/null | head -1)
[ -z "$N8N_DB" ] && N8N_DB="$HOME/.n8n/database.sqlite"
echo "N8n DB: $N8N_DB"

# Pegar o user ID
USER_ID=$(sqlite3 "$N8N_DB" "SELECT id FROM user LIMIT 1;" 2>/dev/null)
echo "User ID: $USER_ID"

# Checar se já tem API key
EXISTING_KEY=$(sqlite3 "$N8N_DB" "SELECT apiKey FROM user_api_keys WHERE userId='$USER_ID' LIMIT 1;" 2>/dev/null)

if [ -n "$EXISTING_KEY" ]; then
    N8N_API_KEY="$EXISTING_KEY"
    echo "✅ API key existente: $N8N_API_KEY"
else
    # Criar nova
    N8N_API_KEY="n8n_api_$(openssl rand -hex 16)"
    sqlite3 "$N8N_DB" "INSERT INTO user_api_keys (userId, apiKey, label, createdAt, updatedAt) VALUES ('$USER_ID', '$N8N_API_KEY', 'openclaw-auto', datetime('now'), datetime('now'));" 2>/dev/null
    echo "✅ API key criada: $N8N_API_KEY"
fi

# Testar
curl -s "http://localhost:${N8N_PORT}/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "accept: application/json" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print(f'✅ API funciona: {len(d.get(\"data\",[]))} workflows')
except: print('❌ API falhou')
"
```

---

## 3. CRIAR WORKFLOWS

### 3.1 Daily Memory Consolidation (23h)
```bash
curl -s -X POST "http://localhost:${N8N_PORT}/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Memory Consolidation",
    "nodes": [
      {
        "parameters": {"rule": {"interval": [{"field": "cronExpression", "expression": "0 23 * * *"}]}},
        "id": "schedule-daily",
        "name": "Schedule 23h",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1.2,
        "position": [250, 300]
      },
      {
        "parameters": {"command": "bash ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh && bash ~/.openclaw/workspace/squad/scripts/daily-consolidate.sh 2>&1"},
        "id": "consolidate",
        "name": "Consolidate Memory",
        "type": "n8n-nodes-base.executeCommand",
        "typeVersion": 1,
        "position": [500, 300]
      }
    ],
    "connections": {"Schedule 23h": {"main": [[{"node": "Consolidate Memory", "type": "main", "index": 0}]]}},
    "settings": {"executionOrder": "v1"},
    "active": false
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ {d.get(\"name\",\"?\")} (id: {d.get(\"id\",\"?\")})')" 2>/dev/null || echo "❌ Falha workflow 1"
```

### 3.2 LightRAG Knowledge Sync (6h)
```bash
curl -s -X POST "http://localhost:${N8N_PORT}/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LightRAG Knowledge Sync",
    "nodes": [
      {
        "parameters": {"rule": {"interval": [{"field": "hours", "hoursInterval": 6}]}},
        "id": "schedule-6h",
        "name": "Every 6h",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1.2,
        "position": [250, 300]
      },
      {
        "parameters": {"command": "export WORKSPACE_DIR=$HOME/.openclaw/workspace && bash $HOME/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh >> /tmp/lightrag-sync.log 2>&1"},
        "id": "sync-lightrag",
        "name": "Sync LightRAG",
        "type": "n8n-nodes-base.executeCommand",
        "typeVersion": 1,
        "position": [500, 300]
      }
    ],
    "connections": {"Every 6h": {"main": [[{"node": "Sync LightRAG", "type": "main", "index": 0}]]}},
    "settings": {"executionOrder": "v1"},
    "active": false
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ {d.get(\"name\",\"?\")} (id: {d.get(\"id\",\"?\")})')" 2>/dev/null || echo "❌ Falha workflow 2"
```

### 3.3 System Health Watchdog (5 min)
```bash
curl -s -X POST "http://localhost:${N8N_PORT}/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Health Watchdog",
    "nodes": [
      {
        "parameters": {"rule": {"interval": [{"field": "minutes", "minutesInterval": 5}]}},
        "id": "schedule-5min",
        "name": "Every 5min",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1.2,
        "position": [250, 300]
      },
      {
        "parameters": {"command": "echo \"{\\\"ts\\\":\\\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\\",\\\"backend\\\":$(curl -s -o /dev/null -w %{http_code} http://localhost:4444/api/health 2>/dev/null),\\\"lightrag\\\":$(curl -s -o /dev/null -w %{http_code} http://localhost:9621/health 2>/dev/null),\\\"ollama\\\":$(curl -s -o /dev/null -w %{http_code} http://localhost:11434/api/tags 2>/dev/null)}\" >> /tmp/health-watchdog.jsonl"},
        "id": "health-check",
        "name": "Health Check",
        "type": "n8n-nodes-base.executeCommand",
        "typeVersion": 1,
        "position": [500, 300]
      }
    ],
    "connections": {"Every 5min": {"main": [[{"node": "Health Check", "type": "main", "index": 0}]]}},
    "settings": {"executionOrder": "v1"},
    "active": false
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ {d.get(\"name\",\"?\")} (id: {d.get(\"id\",\"?\")})')" 2>/dev/null || echo "❌ Falha workflow 3"
```

### 3.4 Ativar todos
```bash
# Listar e ativar
WORKFLOWS=$(curl -s "http://localhost:${N8N_PORT}/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "accept: application/json" 2>/dev/null)

echo "$WORKFLOWS" | python3 -c "
import sys, json, subprocess
data = json.load(sys.stdin).get('data', [])
port = '$N8N_PORT'
key = '$N8N_API_KEY'
for wf in data:
    wid = wf['id']
    name = wf['name']
    if not wf.get('active'):
        r = subprocess.run(['curl', '-s', '-X', 'PATCH',
            f'http://localhost:{port}/api/v1/workflows/{wid}',
            '-H', f'X-N8N-API-KEY: {key}',
            '-H', 'Content-Type: application/json',
            '-d', '{\"active\": true}'],
            capture_output=True, text=True)
        print(f'  ✅ Ativado: {name}')
    else:
        print(f'  ✅ Já ativo: {name}')
" 2>/dev/null
```

---

## 4. SALVAR API KEY PARA USO FUTURO

```bash
# Salvar a key no .env do backend
BACKEND_ENV=$(find ~/titanio-dashboard -name ".env" -path "*/backend/*" | head -1)
if [ -n "$BACKEND_ENV" ]; then
    grep -q "N8N_API_KEY" "$BACKEND_ENV" || echo "N8N_API_KEY=$N8N_API_KEY" >> "$BACKEND_ENV"
    echo "✅ Key salva em $BACKEND_ENV"
fi

# Salvar no workspace também
echo "$N8N_API_KEY" > ~/.openclaw/workspace/.n8n-api-key
echo "✅ Key salva em ~/.openclaw/workspace/.n8n-api-key"
```

---

## 5. VERIFICAÇÃO FINAL

```bash
echo "=== N8N STATUS FINAL ==="
WORKFLOWS=$(curl -s "http://localhost:${N8N_PORT}/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "accept: application/json" 2>/dev/null)

echo "$WORKFLOWS" | python3 -c "
import sys, json
data = json.load(sys.stdin).get('data', [])
print(f'Total: {len(data)} workflows')
for wf in data:
    status = '🟢' if wf.get('active') else '🔴'
    print(f'  {status} {wf[\"name\"]}')
"

echo ""
echo "=== CHECKLIST N8N ==="
echo -n "1. N8n rodando: "; curl -m 3 -s "http://localhost:${N8N_PORT}" > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "2. API key: "; [ -n "$N8N_API_KEY" ] && echo "✅" || echo "❌"
echo -n "3. Workflows: "; echo "$WORKFLOWS" | python3 -c "import sys,json; print(f'{len(json.load(sys.stdin).get(\"data\",[]))} criados')" 2>/dev/null
echo -n "4. Ativos: "; echo "$WORKFLOWS" | python3 -c "import sys,json; d=json.load(sys.stdin).get('data',[]); print(f'{sum(1 for w in d if w.get(\"active\"))} ativos')" 2>/dev/null
```

---

**Reportar resultado da seção 5 no grupo Gospia.**
