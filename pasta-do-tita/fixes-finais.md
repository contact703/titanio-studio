# Fixes Finais - Titanio Dashboard
**Data:** 2026-03-13

## ✅ PROBLEMA 1: Modal de tarefa no Squad
**Arquivo:** `frontend/components/SquadPanel.tsx`

- Adicionado componente `TaskModal` com dark theme (cyan/purple)
- Botão "Chamar" agora chama `handleChamar(specialist)` que abre o modal
- Modal exibe nome e avatar do especialista
- Textarea para digitar a tarefa
- POST para `/api/squad/{id}/task` com `{ task: taskInput }`
- Exibe resposta do servidor no modal antes de fechar
- Botões Cancelar e Enviar Tarefa
- Usa `AnimatePresence` da framer-motion para animação

## ✅ PROBLEMA 2: Bot sem projeto associado
**Arquivo:** `frontend/components/BotsPanel.tsx`

- Função `getProjectLabel()` retorna "Sem projeto" quando `projectId` é undefined/null/`—`
- Adicionado modal "Novo Bot" com campos:
  - Nome (obrigatório)
  - Tipo (select: custom, whatsapp, email, telegram)
  - Descrição (opcional)
  - Projeto (select opcional, busca de GET /api/projects)
- POST para `/api/bots` com os dados
- Botão "Novo Bot" no header do painel

## ✅ PROBLEMA 3: Mac Minis com dados reais
**Arquivo:** `frontend/app/page.tsx`

- Adicionado componente `MacMiniFleet` que busca `GET /api/cluster/nodes`
- Se array vazio: mostra mensagem "Nenhum node conectado. Configure nodes OpenClaw para ver seus Mac Minis aqui."
- Se há nodes: exibe cards com dados reais (nome, status online/offline)
- Substituiu o hardcode `[1,2,3,4,5].map(...)` pelo `<MacMiniFleet />`

## Build & Deploy
```
✓ npm run build - OK (sem erros)
✓ next start -p 3000 - OK
✓ curl http://localhost:3000 retornou class="dark"
```
