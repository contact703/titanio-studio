# 🔄 Atualização HiClaw — Instruções para Helber e Tiago

**Data:** 27/03/2026 23:40 BRT  
**O que é:** Sistema multi-agente colaborativo. Especialistas delegam tarefas entre si automaticamente.

---

## O Que Mudou

### Backend (3 arquivos modificados)
1. **`src/index.ts`** — 4 novos endpoints + WebSocket events
2. **`src/squad/SquadManager.ts`** — 2 novos especialistas (Trader Poly + Memory Guardian)
3. **`src/services/SpecialistMemoryService.ts`** — Anti-loop + Smart Limit de lições

### Frontend (1 arquivo novo)
4. **`components/TasksPanel.tsx`** — Painel de tasks na Dashboard (se criado)

### Dados (1 arquivo novo)
5. **`pasta-do-tita/tasks.json`** — Rastreamento de tasks delegadas

---

## Como Atualizar

### Opção 1: Git Pull (recomendado)
```bash
cd ~/.openclaw/workspace
git pull tita-memory main
```

### Opção 2: Copiar do Volume Compartilhado
```bash
# Copiar backend atualizado
cp /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code/backend/src/index.ts \
   ~/projetos/titanio-dashboard/code/backend/src/

cp /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code/backend/src/squad/SquadManager.ts \
   ~/projetos/titanio-dashboard/code/backend/src/squad/

cp /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code/backend/src/services/SpecialistMemoryService.ts \
   ~/projetos/titanio-dashboard/code/backend/src/services/

# Copiar tasks.json
cp /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/tasks.json \
   ~/pasta-do-tita/ 2>/dev/null || echo "{\"active_tasks\":[],\"completed_tasks\":[]}" > ~/pasta-do-tita/tasks.json
```

### Reiniciar Backend
```bash
pkill -f "tsx watch" 2>/dev/null
cd ~/projetos/titanio-dashboard/code/backend
npm run dev
```

---

## Novos Endpoints

| Método | Endpoint | O que faz |
|--------|----------|-----------|
| POST | `/api/tasks/delegate` | Delega task pra especialista |
| GET | `/api/tasks` | Lista tasks ativas e completadas |
| POST | `/api/tasks/:id/handoff` | Handoff pra outro especialista |
| GET | `/api/tasks/pipelines` | Lista pipelines disponíveis |

### Exemplo de Delegação
```bash
curl -X POST http://localhost:4445/api/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Crie um vídeo sobre IA para Instagram",
    "specialistId": "content-writer",
    "requester": "Helber",
    "mode": "autonomous"
  }'
```

### Pipelines Automáticos
Quando o título contém certas palavras, o sistema monta a chain automaticamente:

| Palavra no título | Pipeline |
|------------------|----------|
| "video" | content-writer → design-wizard → instagramer |
| "bug", "fix", "erro" | debug-hunter → code-ninja |
| "instagram", "post" | content-writer → design-wizard → instagramer |
| "tradução", "translate" | tradutor → content-writer |
| "deploy" | code-ninja → devops-ninja |
| "marketing" | marketing-ninja → content-writer → instagramer |
| "segurança", "security" | security-guardian → openclaw-specialist |
| "monetização", "dinheiro" | money-maker → gold-digger |

---

## WebSocket Events (tempo real)

```javascript
socket.on('task:created', (data) => { /* nova task */ });
socket.on('task:assigned', (data) => { /* task atribuída */ });
socket.on('task:handoff', (data) => { /* handoff entre especialistas */ });
socket.on('task:completed', (data) => { /* task finalizada */ });
```

---

## Novos Especialistas

### 📈 Trader Poly
- Trading no Polymarket via Playwright
- 4 trades executados (Italy, OKC, Colorado, Drake)

### 🧠 Memory Guardian
- Guardião da memória de todos os especialistas
- Monitora duplicatas, sync, watchdogs

---

## Anti-Loop (fix importante)

O `SpecialistMemoryService` agora tem:
- **Deduplicação automática** — não salva lição se já existe igual
- **Smart Limit** — quando chega no limite (500):
  - Se duplicatas → limpa e mantém limite
  - Se tudo real → dobra limite (500→1000→2000...)
- Money Maker tinha 428k lições duplicadas — agora tem 61 reais

---

## Se Algo Der Errado

Backup disponível em:
```
/Volumes/TITA_039/backup-projetos/pre-hiclaw-20260327-2329/
```

Ver instruções em `RESTAURAR.md` nessa pasta.

---

## Verificar se Funcionou

```bash
# Testar endpoints
curl http://localhost:4445/api/tasks
curl http://localhost:4445/api/tasks/pipelines

# Verificar especialistas
curl http://localhost:4445/api/squad | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d), 'especialistas')"
```

---

*Gerado por Tita — 27/03/2026 23:40 BRT*
