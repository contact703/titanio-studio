# code-ninja — Lições
## Regras
- Atualizar após cada tarefa

### 2026-03-23 19:37 — GospIA Stripe Fix
- **Tarefa:** Fix webhook route.ts GospIA — invoice.payment_succeeded handler
- **Solução:** Substituiu profiles.stripe_customer_id por billing_provider_customers lookup. Adicionou upsert do mapeamento customer→user no checkout.session.completed para garantir que renovações futuras funcionem.
- ✅ **CRITICAL:** Webhook Stripe: salvar mapeamento stripe_customer_id→user_id em billing_provider_customers no primeiro checkout
- ✅ **HIGH:** invoice.payment_succeeded deve buscar usuário via billing_provider_customers (provider+provider_customer_id), nunca por coluna direta em profiles
- ✅ **HIGH:** Stripe checkout.session.completed: session.customer é o customer_id permanente, deve ser persistido

## Lições iOS Session — 2026-03-23
- ✅ Salvar no App Store Connect pode ser <p> com cursor:pointer — usar aria snapshot
- ✅ Remover build antigo da submissão antes de adicionar novo build
- ✅ Dialog de seleção de build: radio button via row.querySelector('input[type=radio]')

## Lições App Store Connect (23/03/2026)
- ✅ Submissão App Store: sempre checar qual build está na seção "Compilação" antes de enviar para revisão
- ✅ Após upload via altool: verificar no App Store Connect se o build novo substituiu o antigo na submissão
- ✅ Fluxo correto: Apagar build antigo → Adicionar compilação → Selecionar novo → Salvar → Adicionar para revisão

## 26/03/2026 — Titanio Video Factory v1

### Stack Open Source Completa
- **Whisper** (MIT): transcrição áudio→texto local
- **Edge TTS** (grátis): narração pt-BR (AntonioNeural/FranciscaNeural)
- **MoviePy 2.x + FFmpeg**: renderização de vídeo programática
- **Pillow**: geração de imagens/gradientes com texto
- **Claude/Ollama**: geração de roteiro por cenas

### Pipeline
texto/áudio → transcrição → roteiro (LLM) → imagens → narração (TTS) → renderização → WhatsApp

### Detalhes Técnicos
- MoviePy 2.x: .with_duration(), .resized(), .with_audio() (API mudou!)
- Edge TTS: pt-BR-AntonioNeural (masc), pt-BR-FranciscaNeural (fem)
- Formato Reels: 1080x1920, YouTube: 1920x1080
- Render 30s vídeo ≈ 49s no Mac Mini M4
- Remotion cobra licença pra empresa +3 pessoas — NÃO usar
- Fonte Helvetica-Bold falha no Pillow — usar path completo

### Localização
`pasta-do-tita/projetos/video-factory/`

## 2026-03-26 20:43 — Teste direto: gerar pipeline de vídeo com MoviePy e FFmpeg
**Status:** ✅ Sucesso
**Duração:** 49.0s
- [tool] Ferramentas usadas: ffmpeg, moviepy, whisper, edge-tts, pillow
- [process] Teste direto: gerar pipeline de vídeo com MoviePy e FFmpeg → Pipeline criado com sucesso. Usou MoviePy 2.x, Edge TTS, Whisper, Pillow para gradientes. Vídeo renderizado em 49s.


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

## 2026-03-28 14:21 — Task test-123
- Testar hook funciona corretamente

## 2026-03-28 14:21 — test-task
**Status:** ✅ Sucesso
**Score:** 8/10
- Aprendeu que hook funciona

## 2026-04-02 11:20 — Crie o middleware Express de tenant isolation para a Dashboa
**Status:** ✅ Sucesso
**Duração:** 22.7s
- [tool] Ferramentas usadas: typescript
- [process] Crie o middleware Express de tenant isolation para a Dashboard Titanio multi-ten → ## 🚀 Middleware Express de Tenant Isolation — Relatório de Execução

Vou criar a solução completa de tenant isolation para Dashboard Titanio. Estrutu


## 2026-04-02 11:33 — Crie o código completo para Dashboard Titanio multi-tenant: 
**Status:** ✅ Sucesso
**Duração:** 11.7s
- [tool] Ferramentas usadas: typescript
- [process] Crie o código completo para Dashboard Titanio multi-tenant: 1) Middleware TypeSc → # 🚀 Dashboard Titanio Multi-Tenant — Relatório de Execução

Vou criar um sistema completo de Dashboard multi-tenant com isolamento de tenant, RBAC, w


## 2026-04-02 12:05 — Projeto Monteiro Aranha — leia o briefing na sua biblioteca 
**Status:** ✅ Sucesso
**Duração:** 24.1s
- [tool] Ferramentas usadas: typescript, openai
- [integration] Integrações: whatsapp, apple
- [process] Projeto Monteiro Aranha — leia o briefing na sua biblioteca (MA-BRIEFING.md). Pr → ## Projeto Monteiro Aranha — Arquitetura Técnica Completa

Vou executar a leitura do briefing e projetar a arquitetura técnica completa. Começando pel


## 2026-04-02 12:18 — Monteiro Aranha: projete a stack técnica completa. 1) Fronte
**Status:** ✅ Sucesso
**Duração:** 21.2s
- [tool] Ferramentas usadas: anthropic
- [error] Rate limit atingido — implementar retry com backoff
- [integration] Integrações: whatsapp
- [process] Monteiro Aranha: projete a stack técnica completa. 1) Frontend: Next.js + design → # 🏗️ Stack Técnica Completa: Monteiro Aranha — Relatório de Execução

Vou projetar e entregar a arquitetura técnica completa com código executável e 

