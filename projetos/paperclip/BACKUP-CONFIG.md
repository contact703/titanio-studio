# BACKUP-CONFIG.md — Backup de Configuração do Paperclip

**Data do backup**: 2026-03-27 14:15 GMT-3  
**Fonte principal**: `paperclip-20260327-100015.sql` + `postgresql.conf` + logs

---

## Empresa Titanio Studio

```json
{
  "id": "b7260a8e-1e1e-48e4-bd70-e06f36b6ab74",
  "name": "Titanio Studio",
  "description": "Produtora de tecnologia e conteúdo digital. IA, automação, apps, vídeos.",
  "status": "active",
  "issue_prefix": "TIT",
  "issue_counter": 0,
  "require_board_approval_for_new_agents": true,
  "budget_monthly_cents": 0,
  "created_at": "2026-03-27T00:35:45.430Z"
}
```

---

## Agentes

```json
[
  {
    "id": "f1321dc4-3320-4048-b1cf-cc1933bed402",
    "name": "Tita",
    "role": "ceo",
    "title": "COO",
    "status": "idle",
    "adapter_type": "process",
    "adapter_config": {},
    "runtime_config": {},
    "permissions": {"canCreateAgents": true},
    "budget_monthly_cents": 0
  },
  {
    "id": "4c9aec1e-ce5b-4b4a-9a0d-d3d027f7031a",
    "name": "Code Ninja",
    "role": "engineer",
    "title": "Lead Engineer",
    "status": "idle",
    "adapter_type": "process",
    "adapter_config": {},
    "runtime_config": {},
    "permissions": {"canCreateAgents": false},
    "budget_monthly_cents": 0
  },
  {
    "id": "1d382f3a-71b3-436f-9240-126534f92663",
    "name": "Debug Hunter",
    "role": "qa",
    "title": "QA Lead",
    "status": "idle",
    "adapter_type": "process",
    "adapter_config": {},
    "runtime_config": {},
    "permissions": {"canCreateAgents": false},
    "budget_monthly_cents": 0
  },
  {
    "id": "a1fd0397-5c43-492e-9342-0ff01d2d29b0",
    "name": "Instagramer",
    "role": "cmo",
    "title": "Social Media",
    "status": "idle",
    "adapter_type": "process",
    "adapter_config": {},
    "runtime_config": {},
    "permissions": {"canCreateAgents": false},
    "budget_monthly_cents": 0
  },
  {
    "id": "a1ad92cf-d795-49a4-8f76-f2e33170dc34",
    "name": "Designer",
    "role": "designer",
    "title": "Creative Director",
    "status": "idle",
    "adapter_type": "process",
    "adapter_config": {},
    "runtime_config": {},
    "permissions": {"canCreateAgents": false},
    "budget_monthly_cents": 0
  },
  {
    "id": "63d2f347-d5f0-4df8-b331-5ac39d6e34b8",
    "name": "Video Specialist",
    "role": "general",
    "title": "Video Producer",
    "status": "idle",
    "adapter_type": "process",
    "adapter_config": {},
    "runtime_config": {},
    "permissions": {"canCreateAgents": false},
    "budget_monthly_cents": 0
  },
  {
    "id": "f251c22a-2e18-4a7c-b1cd-c5d9122481cf",
    "name": "Automation Bot",
    "role": "devops",
    "title": "DevOps",
    "status": "idle",
    "adapter_type": "process",
    "adapter_config": {},
    "runtime_config": {},
    "permissions": {"canCreateAgents": false},
    "budget_monthly_cents": 0
  }
]
```

---

## Goals

```json
[
  {
    "id": "d96a133a-50df-4c62-8c9b-63f6f055adef",
    "title": "Video Factory — Pipeline automático de vídeo",
    "description": "100% open source: texto → roteiro → imagens → narração → renderização → WhatsApp/Instagram",
    "level": "task",
    "status": "active",
    "owner_agent_id": null,
    "created_at": "2026-03-27T00:36:54.780Z"
  },
  {
    "id": "4cd9231a-8945-4e16-9181-e5d8bf10c314",
    "title": "Dashboard Titanio — Central multi-Mac",
    "description": "33+ especialistas, notificações, sync 3 Macs, AutoLearn",
    "level": "task",
    "status": "active",
    "owner_agent_id": null,
    "created_at": "2026-03-27T00:36:54.810Z"
  },
  {
    "id": "f98e6609-1cc6-40e0-871c-402238ee24b5",
    "title": "Manda a Nota — NFS-e para MEI",
    "description": "App emissão automática NFS-e. Android OK, iOS pendente Apple.",
    "level": "task",
    "status": "active",
    "owner_agent_id": null,
    "created_at": "2026-03-27T00:36:54.830Z"
  }
]
```

---

## Instance Settings

```json
{
  "id": "5083b587-6f15-428f-8369-6b8f27819a29",
  "singleton_key": "default",
  "experimental": {},
  "general": {}
}
```

---

## Usuário Admin

```json
{
  "id": "local-board",
  "name": "Board",
  "email": "local@paperclip.local",
  "role": "instance_admin"
}
```

---

## Configuração do Servidor (Runtime)

```bash
# start.sh
NVM_DIR=$HOME/.nvm
NODE_VERSION=v20.20.2
CMD="pnpm dev"
LOG=/tmp/paperclip.log
PORT=3100
BIND=127.0.0.1

# PostgreSQL Embedded
DATA_DIR=/Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/db
DB_PORT=54330  # (auto-selecionado se 54329 em uso)
BACKUP_INTERVAL=60min
BACKUP_RETENTION=30 dias
BACKUP_DIR=/Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/data/backups
```

---

## Backups SQL Disponíveis

```
paperclip-20260326-230015.sql  (154.6K)
paperclip-20260327-000014.sql  (154.6K)
paperclip-20260327-010014.sql  (154.6K)
paperclip-20260327-020014.sql  (154.6K)
paperclip-20260327-030014.sql  (154.6K)
paperclip-20260327-040014.sql  (154.6K)
paperclip-20260327-050015.sql  (154.6K)
paperclip-20260327-060015.sql  (154.6K)
paperclip-20260327-070015.sql  (154.6K)
paperclip-20260327-080015.sql  (154.6K)
paperclip-20260327-090015.sql  (154.6K)
paperclip-20260327-100015.sql  (154.6K)  ← mais recente antes da queda
```

---

## Como Restaurar de um Backup

```bash
# Se precisar recriar do zero:
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/paperclip

# Iniciar o servidor (ele recria o DB vazio automaticamente)
bash start.sh

# Após o servidor subir, restaurar via psql:
# (encontrar a porta do postgres embedded no log)
grep "port=" /tmp/paperclip.log | head -5

# Restaurar:
psql -h localhost -p <PORTA_EMBEDDED> -U paperclip paperclip < /Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/data/backups/paperclip-20260327-100015.sql
```
