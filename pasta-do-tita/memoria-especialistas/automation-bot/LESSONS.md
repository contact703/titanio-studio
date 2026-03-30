# automation-bot — Lições
## Regras
- Atualizar após cada tarefa

## 26/03/2026 — Paperclip AI Instalado (Orquestrador Multi-Agente)

### O que é
Open source (MIT), Node.js + React + Postgres embedded.
Orquestra agentes IA como uma empresa: org chart, budgets, goals, governance.

### Instalação
- Precisa Node 20 (Node 22 tem bug com tsx) — usar nvm
- pnpm install + pnpm dev (não pnpm build + node)
- Bug: dev-watch.ts usa `tsx/dist/cli.mjs` mas exports só tem `tsx/cli` — patch com sed
- Porta: 3100 (API + UI)
- Postgres embedded na porta 54329 (auto-criado)

### API
- POST /api/companies — criar empresa
- POST /api/companies/:id/agents — criar agente (roles: ceo/cto/cmo/engineer/designer/qa/devops/pm/researcher/general)
- POST /api/companies/:id/goals — criar objetivo (status: planned/active/achieved/cancelled)
- GET /api/health — status

### Config Titanio
- Empresa: Titanio Studio (ID: b7260a8e...)
- 7 agentes: Tita(CEO), CodeNinja(eng), DebugHunter(qa), Instagramer(cmo), Designer, VideoSpec, AutoBot
- 3 goals ativos: Video Factory, Dashboard, Manda a Nota
- Start: bash projetos/paperclip/start.sh
