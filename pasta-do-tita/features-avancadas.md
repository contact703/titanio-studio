# Features Avançadas — Titanio Dashboard
**Data:** 2026-03-13  
**Status:** ✅ Implementado e funcionando

## Funcionalidades Implementadas

### 1. Painel de Atividade em Tempo Real (`ActivityPanel.tsx`)
- Feed de logs com dark theme estilo terminal
- Atualiza a cada 3 segundos via polling `GET /api/activity`
- Filtrável: Todos / Bots / Especialistas
- Cada item: avatar, nome, ação, timestamp, badge de status colorido (running/completed/error)
- Scroll automático para o evento mais recente
- Adicionado no menu lateral como "Atividade" (ícone Monitor)

### 2. Relatórios de Bots e Especialistas
**Backend:**
- `GET /api/reports` — lista todos os relatórios de `/tmp/titanio-reports.json`
- `POST /api/reports` — salva novo relatório manualmente
- Relatório auto-gerado quando especialista recebe tarefa via `POST /api/squad/:id/task`

**Frontend (`ReportsPanel.tsx`):**
- Lista relatórios com avatar, título, preview, data/hora
- Botão "Ler completo" para expandir conteúdo
- Badge de tipo (Bot / Especialista) com cor
- Auto-refresh a cada 10 segundos

### 3. Controles Avançados de Bots
**Backend:**
- `POST /api/bots/:id/pause` → status "paused" ✅
- `POST /api/bots/:id/resume` → status "running" (só se estava "paused") ✅
- `POST /api/bots/:id/cancel` → status "stopped", limpa currentTask ✅

**Frontend (`BotsPanel.tsx`):**
- Bot "running": botões **Pausar** (⏸) + **Cancelar** (■) com tooltips
- Bot "paused": botões **Retomar** (↩) + **Cancelar** (■) com tooltips
- Bot "stopped": botão **Iniciar** (▶) com tooltip

### 4. Ciclo de Vida do Bot (Lifecycle)
**Tipos implementados:**
- `permanent` 🔄 — roda indefinidamente (badge verde)
- `task` ✅ — para quando tarefa concluída (badge azul)
- `timed` ⏱️ — para após X minutos (badge amarelo + countdown)

**Backend:**
- Tipo `Bot` atualizado com `lifecycle`, `lifetimeMinutes`, `startedAt`, `currentTask`
- `POST /api/bots` aceita `lifecycle` e `lifetimeMinutes`
- `setInterval` checa expiração de bots `timed` a cada minuto
- Bots `task` param ao receber `completeTaskForBot()`

**Frontend:**
- Modal "Novo Bot" tem campo "Ciclo de Vida" com 3 opções
- Campo extra "Duração (minutos)" aparece quando lifecycle = "timed"
- Badge exibido na coluna "Ciclo" da tabela
- Countdown exibido para bots `timed` ativos

### 5. Endpoint `GET /api/activity` (Backend)
- Buffer circular de 100 eventos em memória
- Eventos adicionados automaticamente quando:
  - Bot inicia / pausa / retoma / cancela / para
  - Especialista recebe e conclui tarefa
  - Bot recebe tarefa via PATCH
- Retorna últimos 50 eventos ao cliente

## Arquivos Modificados/Criados

### Backend
- `src/types/bot.ts` — adicionado `BotLifecycle`, `lifecycle`, `lifetimeMinutes`, `startedAt`, `currentTask`
- `src/services/BotManager.ts` — `resumeBot()`, `cancelBot()`, `checkExpirations()`, `setActivityCallback()`, lifecycle support
- `src/index.ts` — endpoints `/api/activity`, `/api/reports`, `/api/bots/:id/resume`, `/api/bots/:id/cancel`; auto-report em squad task; activity buffer

### Frontend
- `components/ActivityPanel.tsx` — NOVO
- `components/ReportsPanel.tsx` — NOVO
- `components/Sidebar.tsx` — adicionados itens "Atividade" e "Relatórios"
- `components/BotsPanel.tsx` — lifecycle badges, modal lifecycle, botões pause/resume/cancel
- `app/page.tsx` — importa e renderiza ActivityPanel e ReportsPanel

## Testes

```
activity: 0 eventos (inicial)
reports: 0 (inicial)
pause bot-1:  { success: true, message: 'Bot pausado' }
resume bot-1: { success: true, message: 'Bot retomado' }
cancel bot-1: { success: true, message: 'Bot cancelado' }
activity after: 3 eventos registrados ✅
```

## Como Acessar
- Dashboard: http://localhost:3000
- Atividade: menu lateral → "Atividade"
- Relatórios: menu lateral → "Relatórios"
- Backend API: http://localhost:4444
