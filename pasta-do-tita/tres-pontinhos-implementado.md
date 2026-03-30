# ✅ Menu de Três Pontinhos (⋮) — Implementado

**Data:** 2026-03-13
**Status:** 🟢 Funcionando

## O que foi feito

### Frontend — `BotsPanel.tsx`
Reescrito com menu ⋮ funcional. Cada bot agora tem 5 opções:

| Opção | Comportamento |
|-------|--------------|
| 📋 Ver Atividade | Navega para aba "Atividade" filtrada pelo nome do bot |
| ✏️ Editar Tarefa | Modal com textarea pré-preenchida → PATCH /api/bots/:id/task |
| 📊 Ver Relatório | Navega para aba "Relatórios" filtrada pelo autor = nome do bot |
| 🔀 Migrar Node | Modal com select de nodes via GET /api/cluster/nodes → POST /api/bots/:id/migrate |
| 🗑️ Deletar Bot | Confirmação → DELETE /api/bots/:id → remove da lista sem reload |

**Novos componentes adicionados:**
- `BotMenu` — dropdown animado com fechar ao clicar fora
- `EditTaskModal` — modal inline de edição de tarefa
- `MigrateModal` — modal com select de nodes (handles empty list)
- `DeleteConfirmModal` — confirmação de exclusão

### Frontend — `page.tsx`
- Adicionado estado `botFilter` e função `navigateWithFilter`
- `BotsPanel` recebe `onNavigate` prop
- `ActivityPanel` e `ReportsPanel` recebem `botFilter` e `onClearFilter`

### Frontend — `ActivityPanel.tsx`
- Aceita `botFilter?: string | null` prop
- Filtra feed pelo `actor` igual ao nome do bot
- Exibe banner com nome do filtro + botão "Limpar filtro"

### Frontend — `ReportsPanel.tsx`
- Já tinha assinatura com `botFilter` (parcialmente implementado antes)
- Agora filtra relatórios por `report.author === botFilter`
- Exibe banner de filtro ativo

### Backend — `BotManager.ts`
- Adicionado método `deleteBot(id: string): Bot | null`

### Backend — `index.ts`
- Adicionado endpoint `DELETE /api/bots/:id`

## Distribuições sincronizadas
- titanio-helber ✅
- titanio-tiago ✅

## Status dos serviços
- Backend (port 4444): 🟢 Online
- Frontend (port 3000): 🟢 Online
- Bots ativos: 2
