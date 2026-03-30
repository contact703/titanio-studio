# Diagnóstico e Correção — Dashboard Helber
# O OpenClaw do Helber deve executar TODOS os passos e reportar resultado

---

## 1. TROCAR USUÁRIO — Dashboard mostra "Zica", precisa ser "Helber"

A Dashboard tem 3 usuários (Zica, Tiago, Helber). Selecionar Helber via API:

```bash
# Selecionar Helber como usuário ativo
curl -s -X POST http://localhost:4444/api/auth/select \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-helber","rememberMachine":true}'

# Confirmar
curl -s http://localhost:4444/api/auth/me | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Usuário: {d.get(\"user\",{}).get(\"displayName\",\"?\")}')"
```

Se der erro, criar o diretório de dados:
```bash
BACKEND_DIR=$(find ~/titanio-dashboard -name "index.js" -path "*/dist/*" | head -1 | xargs dirname)
mkdir -p "$BACKEND_DIR/../.data/quickauth"
# Repetir o curl acima
```

---

## 2. CORRIGIR PATHS HARDCODED

O backend tem paths do Mac do Eduardo. Corrigir no dist compilado E no src:

```bash
# Encontrar o diretório do backend
BACKEND_DIR=$(find ~/titanio-dashboard -name "index.js" -path "*/dist/*" | head -1 | xargs dirname)
echo "Backend dist: $BACKEND_DIR"

# Substituir todos os paths hardcoded
find "$BACKEND_DIR" -name "*.js" -exec sed -i '' \
  "s|/Volumes/TITA_039/MAC_MINI_03/.openclaw|$HOME/.openclaw|g" {} \;

echo "✅ Paths corrigidos no dist"

# Criar pastas que o backend espera
mkdir -p ~/.openclaw/workspace/pasta-do-tita/vault
mkdir -p ~/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard
mkdir -p ~/.openclaw/workspace/pasta-do-tita/memoria-especialistas
mkdir -p ~/.openclaw/workspace/memory/specialists
mkdir -p ~/.openclaw/workspace/projetos
mkdir -p ~/.openclaw/workspace/cofre
mkdir -p ~/.openclaw/workspace/bin
mkdir -p ~/.openclaw/logs

echo "✅ Pastas criadas"
```

---

## 3. REINICIAR BACKEND (após correções)

```bash
# Matar backend atual
lsof -ti :4444 | xargs kill -9 2>/dev/null
sleep 2

# Encontrar e iniciar
BACKEND_DIR=$(find ~/titanio-dashboard -name "index.js" -path "*/dist/*" | head -1 | xargs dirname)
cd "$BACKEND_DIR"
nohup node index.js > /tmp/backend-helber.log 2>&1 &
echo "Backend PID: $!"
sleep 5

# Verificar
tail -20 /tmp/backend-helber.log
```

---

## 4. N8N — Criar Workflows

O N8n está rodando mas sem workflows. Criar os essenciais:

### 4.1 Verificar N8n
```bash
echo "=== N8N STATUS ==="
curl -s http://localhost:5678/api/v1/workflows -H "accept: application/json" 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    wfs = d.get('data',[])
    print(f'{len(wfs)} workflows')
    for w in wfs:
        print(f'  - {w.get(\"name\",\"?\")} (active: {w.get(\"active\",False)})')
except: print('N8n sem resposta ou sem API key')
" || echo "N8n OFF"
```

### 4.2 Criar workflow: Daily Consolidation (memória dos especialistas)
```bash
# Workflow que roda às 23h — consolida memória diária
curl -s -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "accept: application/json" \
  -d '{
    "name": "Daily Memory Consolidation",
    "active": true,
    "nodes": [
      {
        "parameters": {"rule": {"interval": [{"field": "cronExpression", "expression": "0 23 * * *"}]}},
        "name": "Schedule 23h",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "parameters": {
          "command": "bash ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh && bash ~/.openclaw/workspace/squad/scripts/daily-consolidate.sh"
        },
        "name": "Consolidate Memory",
        "type": "n8n-nodes-base.executeCommand",
        "typeVersion": 1,
        "position": [500, 300]
      }
    ],
    "connections": {
      "Schedule 23h": {"main": [[{"node": "Consolidate Memory", "type": "main", "index": 0}]]}
    }
  }' 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ Workflow criado: {d.get(\"name\",\"?\")} (id: {d.get(\"id\",\"?\")})')" 2>/dev/null || echo "❌ Falha ao criar workflow"
```

### 4.3 Criar workflow: LightRAG Sync (a cada 6h)
```bash
curl -s -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "accept: application/json" \
  -d '{
    "name": "LightRAG Knowledge Sync",
    "active": true,
    "nodes": [
      {
        "parameters": {"rule": {"interval": [{"field": "hours", "hoursInterval": 6}]}},
        "name": "Every 6h",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "parameters": {
          "command": "export WORKSPACE_DIR=$HOME/.openclaw/workspace && bash $HOME/.openclaw/workspace/squad/scripts/lightrag-sync-robust.sh >> /tmp/lightrag-sync.log 2>&1"
        },
        "name": "Sync LightRAG",
        "type": "n8n-nodes-base.executeCommand",
        "typeVersion": 1,
        "position": [500, 300]
      }
    ],
    "connections": {
      "Every 6h": {"main": [[{"node": "Sync LightRAG", "type": "main", "index": 0}]]}
    }
  }' 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ Workflow criado: {d.get(\"name\",\"?\")} (id: {d.get(\"id\",\"?\")})')" 2>/dev/null || echo "❌ Falha ao criar workflow"
```

### 4.4 Criar workflow: Health Watchdog (a cada 5 min)
```bash
curl -s -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "accept: application/json" \
  -d '{
    "name": "System Health Watchdog",
    "active": true,
    "nodes": [
      {
        "parameters": {"rule": {"interval": [{"field": "minutes", "minutesInterval": 5}]}},
        "name": "Every 5min",
        "type": "n8n-nodes-base.scheduleTrigger",
        "typeVersion": 1,
        "position": [250, 300]
      },
      {
        "parameters": {
          "command": "echo \"{\\\"timestamp\\\":\\\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\\",\\\"caffeinate\\\":$(pgrep -x caffeinate > /dev/null && echo true || echo false),\\\"ram_free\\\":$(vm_stat | awk \"/Pages free/ {print \\$3}\" | tr -d .),\\\"backend\\\":$(curl -s -o /dev/null -w \"%{http_code}\" http://localhost:4444/api/health),\\\"lightrag\\\":$(curl -s -o /dev/null -w \"%{http_code}\" http://localhost:9621/health 2>/dev/null || echo 0),\\\"ollama\\\":$(curl -s -o /dev/null -w \"%{http_code}\" http://localhost:11434/api/tags 2>/dev/null || echo 0)}\" >> /tmp/health-watchdog.jsonl"
        },
        "name": "Health Check",
        "type": "n8n-nodes-base.executeCommand",
        "typeVersion": 1,
        "position": [500, 300]
      }
    ],
    "connections": {
      "Every 5min": {"main": [[{"node": "Health Check", "type": "main", "index": 0}]]}
    }
  }' 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ Workflow criado: {d.get(\"name\",\"?\")} (id: {d.get(\"id\",\"?\")})')" 2>/dev/null || echo "❌ Falha ao criar workflow"
```

---

## 5. WATCHDOG — Manter tudo vivo

```bash
cat > ~/.openclaw/workspace/watchdog.sh << 'WEOF'
#!/bin/bash
# Watchdog — mantém serviços essenciais vivos
while true; do
    # Caffeinate
    pgrep -x caffeinate > /dev/null || nohup caffeinate -dims &>/dev/null &

    # Backend Dashboard
    curl -s -o /dev/null http://localhost:4444/api/health || {
        echo "$(date) — Backend morreu, reiniciando..."
        BACKEND_DIR=$(find ~/titanio-dashboard -name "index.js" -path "*/dist/*" | head -1 | xargs dirname)
        cd "$BACKEND_DIR" && nohup node index.js >> /tmp/backend-helber.log 2>&1 &
    }

    # LightRAG
    curl -s -o /dev/null http://localhost:9621/health 2>/dev/null || {
        echo "$(date) — LightRAG morreu, reiniciando..."
        cd ~/.openclaw/workspace/lightrag-memory
        source ~/.openclaw/workspace/venv-lightrag/bin/activate 2>/dev/null
        nohup lightrag-server --host 0.0.0.0 --port 9621 \
            --working-dir ~/.openclaw/workspace/lightrag-memory/storage \
            --llm-binding ollama --embedding-binding ollama --max-async 1 \
            >> /tmp/lightrag.log 2>&1 &
    }

    sleep 300  # checar a cada 5 min
done
WEOF
chmod +x ~/.openclaw/workspace/watchdog.sh
nohup bash ~/.openclaw/workspace/watchdog.sh >> /tmp/watchdog.log 2>&1 &
echo "✅ Watchdog ativo"
```

---

## 6. MEMÓRIA DOS ESPECIALISTAS — Inicializar

```bash
# Criar pasta de memória para cada especialista da Dashboard
MEMORY_BASE="$HOME/.openclaw/workspace/pasta-do-tita/memoria-especialistas"
mkdir -p "$MEMORY_BASE"

for spec in code-ninja design-wizard debug-hunter devops-ninja aso-specialist growth-hacker api-master security-guard marketing-ninja data-analyst automation-bot content-writer memory-bot ios-specialist money-maker agent-doctor security-guardian gold-digger literary-agent mac-specialist whatsapp-titanio marketing-director tradutor mentor-titanio diretor-de-arte audiodesc-specialist ceo-titanio advogado-titanio radio-gospia fund-hunter; do
    mkdir -p "$MEMORY_BASE/$spec/sessions"
    [ ! -f "$MEMORY_BASE/$spec/MEMORY.md" ] && echo "# $spec — Memória
Criado: $(date +%Y-%m-%d)" > "$MEMORY_BASE/$spec/MEMORY.md"
    [ ! -f "$MEMORY_BASE/$spec/LESSONS.md" ] && echo "# $spec — Lições
## Regras
- Atualizar após cada tarefa" > "$MEMORY_BASE/$spec/LESSONS.md"
done
echo "✅ Memória inicializada para 30 especialistas"
```

---

## 7. SENTINEL — SecuritySentinel com fix do falso positivo crypto

```bash
# O sentinel detectava "crypto" do macOS como minerador. Já foi corrigido no repo.
# Verificar se o fix está aplicado:
BACKEND_DIR=$(find ~/titanio-dashboard -name "index.js" -path "*/dist/*" | head -1 | xargs dirname)
grep -c "xmrig\|cryptominer\|coinhive" "$BACKEND_DIR/index.js" 2>/dev/null && echo "✅ Fix aplicado" || echo "⚠️ Fix não aplicado — fazer git pull"
```

---

## 8. VERIFICAR TUDO — Checklist Final Completo

```bash
echo "╔══════════════════════════════════════════════╗"
echo "║     CHECKLIST FINAL — HELBER                 ║"
echo "╠══════════════════════════════════════════════╣"

echo -n "║ 1.  Backend (4444)       "; curl -m 3 -s http://localhost:4444/api/health > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ 2.  Frontend (3001)      "; curl -m 3 -s http://localhost:3001 > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ 3.  Especialistas API    "; curl -m 3 -s http://localhost:4444/api/squad 2>/dev/null | python3 -c "import sys,json; print(f'{len(json.load(sys.stdin))}' if True else '')" 2>/dev/null; echo " ║"
echo -n "║ 4.  Usuário ativo        "; curl -m 3 -s http://localhost:4444/api/auth/me 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('displayName','?'))" 2>/dev/null; echo " ║"
echo -n "║ 5.  PostgreSQL           "; pg_isready > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ 6.  Redis                "; redis-cli ping 2>/dev/null | grep -q PONG && echo "✅ ║" || echo "❌ ║"
echo -n "║ 7.  N8n                  "; curl -m 3 -s http://localhost:5678 > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ 8.  N8n Workflows        "; curl -m 3 -s http://localhost:5678/api/v1/workflows 2>/dev/null | python3 -c "import sys,json; print(f'{len(json.load(sys.stdin).get(\"data\",[]))} workflows')" 2>/dev/null || echo "? "; echo "║"
echo -n "║ 9.  Ollama               "; curl -m 3 -s http://localhost:11434/api/tags > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ 10. LightRAG (9621)      "; curl -m 3 -s http://localhost:9621/health > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ 11. Learning System      "; [ -f ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh ] && echo "✅ ║" || echo "❌ ║"
echo -n "║ 12. Especialistas (files)"; ls ~/.openclaw/workspace/squad/specialists/ 2>/dev/null | wc -l | xargs echo -n; echo " ║"
echo -n "║ 13. Memória Especialistas"; ls ~/.openclaw/workspace/pasta-do-tita/memoria-especialistas/ 2>/dev/null | wc -l | xargs echo -n; echo " ║"
echo -n "║ 14. SOUL.md              "; [ -f ~/.openclaw/workspace/SOUL.md ] && echo "✅ ║" || echo "❌ ║"
echo -n "║ 15. MEMORY.md            "; [ -f ~/.openclaw/workspace/MEMORY.md ] && echo "✅ ║" || echo "❌ ║"
echo -n "║ 16. Cron consolidação    "; crontab -l 2>/dev/null | grep -q consolidate && echo "✅ ║" || echo "❌ ║"
echo -n "║ 17. Watchdog             "; pgrep -f watchdog.sh > /dev/null && echo "✅ ║" || echo "❌ ║"
echo -n "║ 18. Caffeinate           "; pgrep -x caffeinate > /dev/null && echo "✅ ║" || echo "❌ ║"
echo -n "║ 19. Gateway Eduardo      "; curl -m 3 -s http://192.168.18.174:18789 > /dev/null 2>&1 && echo "✅ ║" || echo "❌ (off) ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Dashboard: http://localhost:3001            ║"
echo "╚══════════════════════════════════════════════╝"
```

---

## 9. SE ALGO FALHAR

- **Backend não sobe:** `tail -50 /tmp/backend-helber.log` — procurar erro
- **N8n não aceita workflows:** precisa de API key — acessar http://localhost:5678 no browser, Settings > API > Create API Key
- **LightRAG EOF:** aquecer modelos: `curl -s http://localhost:11434/api/chat -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"hi"}],"stream":false,"keep_alive":3600}'`
- **Dashboard mostra "Zica":** clicar no avatar/nome no canto da Dashboard e selecionar "Helber", ou rodar o curl da seção 1

---

**Após executar tudo: reportar o resultado do checklist (seção 8) no grupo Gospia.**
