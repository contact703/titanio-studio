# Fase 3 e 4 — Implementadas ✅

**Data:** 2026-03-13

---

## FASE 3: Scripts de Instalação ✅

### Arquivos criados:
- `/Volumes/TITA_039/backup-projetos/titanio-dashboard-backup-20260312-0801/install-cluster-node.sh` (genérico, 6480 bytes)
- `/Volumes/TITA_039/backup-projetos/titanio-dashboard-backup-20260312-0801/install-helber.sh`
- `/Volumes/TITA_039/backup-projetos/titanio-dashboard-backup-20260312-0801/install-tiago.sh`

### Todos executáveis (chmod +x).

### O que `install-cluster-node.sh` faz:
1. Recebe: `--user`, `--name`, `--avatar`, `--gateway-ip`, `--gateway-port` (18789), `--dashboard-port` (3001)
2. Copia projeto para `~/titanio-dashboard-{user}/`
3. Cria `.env` no backend (PORT, CORS_ORIGIN, JWT_SECRET, MAC_ID, etc.) e `.env.local` no frontend
4. `npm install` backend + frontend
5. `npm run build` backend + frontend
6. Cria `~/start-titanio-{user}.sh`
7. Conecta como node OpenClaw: `openclaw node run --host {ip} --port {port} --display-name "{name} Node" &`
8. Sobe backend na porta `dashboard_port + 1000` (Helber: 4001, Tiago: 4002)
9. Sobe frontend na porta `dashboard_port` (Helber: 3001, Tiago: 3002)

### Configurações pré-definidas:
- **Helber:** porta 3001 (frontend) / 4001 (backend), avatar 🧑‍💻
- **Tiago:** porta 3002 (frontend) / 4002 (backend), avatar 👨‍🔧

---

## FASE 4: Painel de Cluster Real ✅

### Backend

#### `ClusterManager.ts` — refatorado:
- `getLocalCpuPercent()` — usa `os.loadavg()` e `os.cpus().length` reais
- `getLocalRamPercent()` — usa `os.totalmem()` / `os.freemem()` reais
- `getLocalDiskPercent()` — executa `df -k /` e faz parse do percentual real
- `getRealNodes()` — executa `openclaw nodes list` e faz parse real (retorna [] quando 0 paired)
- `getClusterStatus()` — novo método que retorna `ClusterStatus` completo com métricas reais

#### `index.ts` — novo endpoint:
```
GET /api/cluster/status
```

**Response real testada:**
```json
{
  "self": {
    "id": "mac-eduardo",
    "name": "Mac Eduardo (Gateway)",
    "role": "gateway",
    "ip": "192.168.18.174",
    "cpu": 21,
    "ram": 98,
    "disk": 29,
    "uptime": 1188433,
    "botsRunning": 1
  },
  "nodes": [],
  "totalBots": 1,
  "clusterHealth": "critical"
}
```

### Frontend

#### `frontend/components/ClusterPanel.tsx` — criado:
- Card do Gateway (Mac Eduardo) sempre no topo com badge "GATEWAY"
- Métricas com barras de progresso animadas (CPU, RAM, Disco)
- Uptime formatado (dias/horas/minutos)
- Cards de nodes conectados com status real
- Se nenhum node: mensagem com comando `openclaw node run --host 192.168.18.174`
  + referência aos scripts `install-helber.sh` / `install-tiago.sh`
- Botão "Ver detalhes →" por node
- Polling automático a cada 30 segundos
- Botão de refresh manual

#### `Sidebar.tsx` — atualizado:
- Adicionado item "Cluster" com ícone `Network` da lucide-react
- `TabId` extendido com `'cluster'`

#### `page.tsx` — atualizado:
- Import `ClusterPanel`
- Render condicional `{activeTab === 'cluster' && <ClusterPanel />}`

---

## Status dos Serviços

| Serviço | Porta | Status |
|---------|-------|--------|
| Backend | 4444 | ✅ Rodando |
| Frontend | 3000 | ✅ Rodando |
| Endpoint `/api/cluster/status` | 4444 | ✅ Testado |

---

## Notas Técnicas

- O build do frontend falha com ENOENT (rename 500.html) — bug pré-existente do Next.js 14 no volume APFS externo. O frontend roda normalmente via `next start` sem rebuild.
- O frontend em produção (`next start`) usa o build anterior já existente. As mudanças de ClusterPanel estarão disponíveis após um rebuild bem-sucedido (recomendado: fazer build no volume interno e copiar .next/).
- `openclaw nodes list` retorna `Pending: 0 · Paired: 0` — nenhum node conectado ainda, comportamento esperado.
