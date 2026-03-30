# STATUS.md — Estado do Paperclip / Titanio Studio

**Última atualização**: 2026-03-27 14:15 GMT-3  
**Fonte**: Backup SQL `paperclip-20260327-100015.sql` + logs do servidor

---

## 🏢 Empresa

| Campo | Valor |
|-------|-------|
| **Nome** | Titanio Studio |
| **ID** | `b7260a8e-1e1e-48e4-bd70-e06f36b6ab74` |
| **Descrição** | Produtora de tecnologia e conteúdo digital. IA, automação, apps, vídeos. |
| **Status** | `active` |
| **Issue Prefix** | TIT |
| **Criada em** | 2026-03-27 00:35:45 UTC |

---

## 🤖 Agentes (7 total)

### 1. Tita
- **Role**: `ceo`
- **Título**: COO
- **Status**: `idle`
- **Adapter**: process
- **Permissões**: `canCreateAgents: true`
- **ID**: `f1321dc4-3320-4048-b1cf-cc1933bed402`

### 2. Code Ninja
- **Role**: `engineer`
- **Título**: Lead Engineer
- **Status**: `idle`
- **Adapter**: process
- **ID**: `4c9aec1e-ce5b-4b4a-9a0d-d3d027f7031a`

### 3. Debug Hunter
- **Role**: `qa`
- **Título**: QA Lead
- **Status**: `idle`
- **Adapter**: process
- **ID**: `1d382f3a-71b3-436f-9240-126534f92663`
- **Nota**: Corrigiu o bug tsx que impedia o servidor de iniciar

### 4. Instagramer
- **Role**: `cmo`
- **Título**: Social Media
- **Status**: `idle`
- **Adapter**: process
- **ID**: `a1fd0397-5c43-492e-9342-0ff01d2d29b0`

### 5. Designer
- **Role**: `designer`
- **Título**: Creative Director
- **Status**: `idle`
- **Adapter**: process
- **ID**: `a1ad92cf-d795-49a4-8f76-f2e33170dc34`

### 6. Video Specialist
- **Role**: `general`
- **Título**: Video Producer
- **Status**: `idle`
- **Adapter**: process
- **ID**: `63d2f347-d5f0-4df8-b331-5ac39d6e34b8`

### 7. Automation Bot
- **Role**: `devops`
- **Título**: DevOps
- **Status**: `idle`
- **Adapter**: process
- **ID**: `f251c22a-2e18-4a7c-b1cd-c5d9122481cf`

**Observação**: Todos os agentes têm permissão `tasks:assign`. Apenas Tita pode criar novos agentes.

---

## 🎯 Goals (3 total)

### 1. Video Factory — Pipeline automático de vídeo
- **ID**: `d96a133a-50df-4c62-8c9b-63f6f055adef`
- **Status**: `active`
- **Level**: task
- **Descrição**: 100% open source: texto → roteiro → imagens → narração → renderização → WhatsApp/Instagram
- **Owner Agent**: não atribuído
- **Criada**: 2026-03-27 00:36:54 UTC

### 2. Dashboard Titanio — Central multi-Mac
- **ID**: `4cd9231a-8945-4e16-9181-e5d8bf10c314`
- **Status**: `active`
- **Level**: task
- **Descrição**: 33+ especialistas, notificações, sync 3 Macs, AutoLearn
- **Owner Agent**: não atribuído
- **Criada**: 2026-03-27 00:36:54 UTC

### 3. Manda a Nota — NFS-e para MEI
- **ID**: `f98e6609-1cc6-40e0-871c-402238ee24b5`
- **Status**: `active`
- **Level**: task
- **Descrição**: App emissão automática NFS-e. Android OK, iOS pendente Apple.
- **Owner Agent**: não atribuído
- **Criada**: 2026-03-27 00:36:54 UTC

---

## 🖥️ Status do Servidor

| Item | Status |
|------|--------|
| **Processo** | ⚠️ Parado (caiu às ~13:55 em 27/03/2026) |
| **Porta 3100** | ❌ Não respondendo |
| **PostgreSQL** | 🔄 Reiniciando com servidor |
| **Último backup** | `paperclip-20260327-100015.sql` (às 13:00) |
| **Total backups** | 12 arquivos (154.6K cada) |

**Nota**: O servidor foi reiniciado via `bash start.sh` durante esta sessão de documentação.

---

## 📊 Histórico de Atividade (do log)

| Hora | Evento |
|------|--------|
| 00:35 | Empresa "Titanio Studio" criada |
| 00:36 | 7 agentes criados |
| 00:36 | 3 goals criadas |
| 00:37 | Servidor respondendo normalmente |
| 01:00 | Restart (conflito postmaster.pid) |
| 01:00 | Servidor estável na porta 3100 |
| 02:00–13:00 | Backups horários automáticos |
| 13:55 | Servidor parou (SIGTERM) |

---

## 🔧 Infraestrutura

- **Node**: v20.20.2 (nvm)
- **DB**: PostgreSQL embedded (sem DATABASE_URL)
- **Data dir**: `/Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/db`
- **Backups**: Horários, retenção 30 dias
- **Source**: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/paperclip`
