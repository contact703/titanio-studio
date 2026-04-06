# 🏢 Titanio Command Center — Proposta de Arquitetura

> **Data:** 06/04/2026 | **Para:** Squad Titanio (Eduardo, Helber, Tiago)
> **Objetivo:** Dashboard comercial autônomo com agentes IA, automação de marketing, tráfego pago e gestão financeira — SEM dependência de Claude ou OpenClaw

---

## 🎯 O QUE É

Um **painel de controle comercial** onde cada cliente (ou a própria Titanio) gerencia:
- 📱 **Social Media** — posts automáticos em todas as redes
- 💰 **Tráfego Pago** — campanhas Meta Ads / Google Ads com IA
- 💸 **Financeiro** — NFS-e, cobranças, fluxo de caixa
- 💬 **Comunicação** — WhatsApp, email, notificações internas
- 🤖 **Agentes IA** — qualquer LLM (Groq, Ollama, OpenAI, Gemini, etc.)

**Regra de ouro:** Se a Anthropic cair, se o OpenClaw sumir — o sistema continua funcionando.

---

## 🏗️ 3 ARQUITETURAS POSSÍVEIS

### ARQUITETURA A — "Dify + Next.js" (Recomendada ⭐)

```
┌─────────────────────────────────────────────────┐
│              TITANIO COMMAND CENTER              │
│         Next.js 15 + Tailwind + shadcn          │
├─────────────────────────────────────────────────┤
│  📊 Dashboard  │  📱 Social  │  💰 Financeiro  │
│  🤖 Agentes    │  📈 Ads     │  💬 Comunic.    │
├─────────────────────────────────────────────────┤
│                   DIFY (Core IA)                │
│  - Workflows visuais (drag & drop)             │
│  - Multi-LLM (Groq/Ollama/OpenAI/Gemini)      │
│  - RAG + Knowledge Base embutido              │
│  - API REST própria                            │
├─────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  MinIO (S3)  │ Weaviate│
├─────────────────────────────────────────────────┤
│          Docker Compose (self-hosted)           │
└─────────────────────────────────────────────────┘
```

**Como funciona:**
1. **Dify** é o cérebro — orquestra agentes, workflows, e conexões com qualquer LLM
2. **Next.js** é a cara — dashboard bonito, multi-tenant, login por cliente
3. **APIs diretas** para Meta, Google Ads, WhatsApp Business API
4. **PostgreSQL** guarda tudo (clientes, campanhas, notas fiscais)
5. Se Ollama estiver rodando → IA 100% local, custo zero

**Prós:**
- Dify tem 100K+ stars no GitHub, comunidade gigante
- Interface visual pra criar workflows (não precisa programar)
- Suporta 100+ modelos de IA nativamente
- Deploy: `docker compose up` e pronto
- Multi-tenant nativo (cada cliente isolado)

**Contras:**
- Dify consome RAM (~2GB mínimo)
- Curva de aprendizado inicial nos workflows
- Licença open-source mas com restrições comerciais (precisa checar)

**Stack completa:**
- Frontend: Next.js 15 + TypeScript + Tailwind + shadcn/ui
- Backend IA: Dify (self-hosted Docker)
- Backend API: Next.js API Routes + Prisma
- DB: PostgreSQL 16
- Cache: Redis 7
- Storage: MinIO (compatível S3)
- Vetorial: Weaviate (RAG)
- LLMs: Groq (grátis), Ollama (local), OpenAI, Gemini, Anthropic (opcionais)

---

### ARQUITETURA B — "N8n + PocketBase + Next.js"

```
┌─────────────────────────────────────────────────┐
│              TITANIO COMMAND CENTER              │
│         Next.js 15 + Tailwind + shadcn          │
├─────────────────────────────────────────────────┤
│  📊 Dashboard  │  📱 Social  │  💰 Financeiro  │
│  🤖 Agentes    │  📈 Ads     │  💬 Comunic.    │
├─────────────────────────────────────────────────┤
│     N8n (Automação)     │  PocketBase (Backend) │
│  - 400+ integrações     │  - Auth + DB + API    │
│  - Workflows visuais    │  - Realtime           │
│  - AI chains nativo     │  - 1 binário Go       │
├─────────────────────────────────────────────────┤
│  SQLite (PB)  │  Redis  │  Ollama (LLM local)   │
├─────────────────────────────────────────────────┤
│          Docker + PM2 (self-hosted)             │
└─────────────────────────────────────────────────┘
```

**Como funciona:**
1. **N8n** faz toda automação (posts, ads, emails, cobranças)
2. **PocketBase** é backend completo em 1 arquivo (auth, DB, API, realtime)
3. **Next.js** é o dashboard
4. **Ollama** roda LLMs locais (Llama 3, Qwen, Mistral)
5. Agentes são workflows N8n com nós de IA

**Prós:**
- N8n já está instalado e rodando no Mac Mini
- PocketBase é RIDICULAMENTE leve (1 binário, 20MB RAM)
- 400+ integrações prontas (Meta, Google, WhatsApp, Stripe...)
- Já temos experiência com N8n (19 workflows prontos)
- Deploy mais leve que Dify

**Contras:**
- Agentes IA menos sofisticados que Dify (sem RAG nativo robusto)
- PocketBase é SQLite (ok pra 1-50 clientes, pode virar gargalo depois)
- N8n tem licença fair-code (não 100% open source)

**Stack completa:**
- Frontend: Next.js 15 + TypeScript + Tailwind
- Automação: N8n (self-hosted, já rodando)
- Backend: PocketBase (Go, 1 binário)
- DB: SQLite (PocketBase) + PostgreSQL (se escalar)
- LLMs: Ollama local + Groq API (grátis) + qualquer API
- Cache: Redis (já rodando)

---

### ARQUITETURA C — "Flowise + Supabase + Next.js" (Mais bonita)

```
┌─────────────────────────────────────────────────┐
│              TITANIO COMMAND CENTER              │
│         Next.js 15 + Tailwind + shadcn          │
├─────────────────────────────────────────────────┤
│  📊 Dashboard  │  📱 Social  │  💰 Financeiro  │
│  🤖 Agentes    │  📈 Ads     │  💬 Comunic.    │
├─────────────────────────────────────────────────┤
│   Flowise (Agentes)    │   Supabase (Backend)   │
│  - Visual agent builder │  - Auth + DB + API    │
│  - LangChain nativo     │  - Realtime WS        │
│  - Chatflows + Tools    │  - Storage S3          │
├─────────────────────────────────────────────────┤
│  PostgreSQL (Supa)  │  pgvector  │  Ollama      │
├─────────────────────────────────────────────────┤
│          Docker Compose (self-hosted)           │
└─────────────────────────────────────────────────┘
```

**Como funciona:**
1. **Flowise** é o builder visual de agentes (drag & drop LangChain)
2. **Supabase** self-hosted = PostgreSQL + Auth + Realtime + Storage
3. **pgvector** = RAG vetorial direto no PostgreSQL (sem banco extra)
4. **Next.js** é o dashboard com Supabase SDK

**Prós:**
- Flowise é 100% open source (MIT)
- Interface de criação de agentes mais intuitiva
- Supabase self-hosted é gratuito e poderoso
- pgvector elimina necessidade de banco vetorial separado
- Ecossistema LangChain enorme

**Contras:**
- Flowise foca em chatflows, menos em automação de negócios
- Precisa complementar com cron/workers para posts automáticos
- Supabase self-hosted requer mais config que PocketBase
- Mais pesado em RAM (~3GB total)

---

## ⚖️ COMPARATIVO RÁPIDO

| Critério | A (Dify) | B (N8n+PB) | C (Flowise+Supa) |
|----------|----------|------------|-------------------|
| **Facilidade de setup** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Agentes IA** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Automação de negócio** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **RAM mínima** | 2GB | 500MB | 3GB |
| **Multi-tenant** | ✅ nativo | ⚠️ custom | ✅ via Supabase |
| **Social Media** | via API | ✅ 400+ integrações | via API |
| **Tráfego pago** | via workflow | ✅ nós Meta/Google | via API |
| **Financeiro** | custom | ✅ nós Stripe/NFS-e | custom |
| **Já temos experiência** | ❌ | ✅ N8n rodando | ❌ |
| **Licença** | Apache 2.0* | Fair-code | MIT |
| **Independente Claude/OC** | ✅ | ✅ | ✅ |
| **Online (web)** | ✅ | ✅ | ✅ |

---

## 🏆 RECOMENDAÇÃO: ARQUITETURA B (N8n + PocketBase)

**Por quê?**

1. **Já temos N8n rodando** com 19 workflows — não começamos do zero
2. **PocketBase é 1 binário** — deploy em qualquer lugar em 30 segundos
3. **400+ integrações** prontas — Meta Ads, Google Ads, WhatsApp, Stripe, tudo
4. **Mais leve** — roda no Mac Mini sem matar a RAM
5. **Prático** — a equipe já conhece N8n

**E se precisar de IA mais sofisticada?** Adiciona Flowise como módulo opcional (são compatíveis).

---

## 📋 MÓDULOS DO SISTEMA

### 1. 📱 Social Media Manager
- Agendamento de posts (Instagram, Facebook, Twitter/X, LinkedIn, TikTok)
- Geração de conteúdo com IA (texto, imagem, vídeo)
- Calendário editorial visual
- Analytics por plataforma
- **N8n:** nós nativos pra cada rede + webhooks

### 2. 📈 Tráfego Pago (Ads Manager)
- Criação de campanhas Meta Ads + Google Ads via API
- Otimização automática (IA sugere ajustes)
- Dashboard de ROAS, CPA, CTR
- A/B testing automático de criativos
- Alertas quando campanha performa mal
- **N8n:** nós Meta Marketing API + Google Ads API

### 3. 💸 Financeiro
- Emissão de NFS-e (integra com Manda a Nota!)
- Cobranças via Pix/Boleto (Stripe ou Asaas)
- Fluxo de caixa automático
- Relatórios mensais
- **N8n:** nós Stripe + webhook NFS-e + cron relatórios

### 4. 💬 Comunicação Interna
- Chat entre equipe (tipo Slack simplificado)
- WhatsApp Business API para atendimento
- Notificações por email
- Kanban de tarefas
- **PocketBase:** realtime WebSocket + collections

### 5. 🤖 Agentes IA
- Cada cliente pode ter seus agentes configurados
- Modelos: Ollama (grátis), Groq (grátis), ou qualquer API
- Templates prontos: Atendente, Copywriter, Analista, SDR
- Histórico de conversas
- **N8n AI nodes:** LangChain nativo

### 6. 📊 Dashboard Central
- Visão geral de todos os módulos
- KPIs principais no topo
- Gráficos interativos (Recharts)
- Multi-tenant (cada cliente vê só seus dados)
- Responsivo (funciona no celular)

---

## 🚀 PLANO DE EXECUÇÃO (8 semanas)

| Semana | Entrega |
|--------|---------|
| 1 | Setup: PocketBase + Next.js + Auth + Layout base |
| 2 | Módulo Social: calendário + agendamento + integração Instagram |
| 3 | Módulo Social: Facebook + Twitter + geração IA |
| 4 | Módulo Ads: Meta Ads API + dashboard ROAS |
| 5 | Módulo Ads: Google Ads + otimização IA |
| 6 | Módulo Financeiro: NFS-e + Cobranças + Fluxo |
| 7 | Módulo Comunicação: Chat + WhatsApp + Notificações |
| 8 | Multi-tenant + Deploy + Testes + Documentação |

---

## 💻 STACK FINAL (Arquitetura B)

```
Frontend:    Next.js 15 + TypeScript + Tailwind + shadcn/ui + Recharts
Backend:     PocketBase (Go) + N8n (automação)
Database:    SQLite (PocketBase) → PostgreSQL (se escalar)
Cache:       Redis 7
IA:          Ollama (local) + Groq API (grátis) + OpenAI/Gemini (opcionais)
Storage:     Local filesystem + MinIO (se precisar S3)
Deploy:      Docker Compose ou PM2
Hosting:     Self-hosted (Mac Mini) → VPS/Coolify (produção)
CI/CD:       GitHub Actions → auto-deploy
```

---

## 🔑 DIFERENCIAL COMPETITIVO

1. **Independência total** — não depende de nenhum provider específico
2. **IA inclusa** — agentes prontos pra cada função
3. **Self-hosted** — dados do cliente ficam com ele
4. **Custo operacional baixo** — Ollama + Groq = R$0/mês em IA
5. **Já temos a base** — N8n + PocketBase + experiência Titanio

---

## 💰 MODELO DE NEGÓCIO

| Plano | Preço | Inclui |
|-------|-------|--------|
| Starter | R$ 497/mês | 1 rede social, 30 posts/mês, financeiro básico |
| Pro | R$ 1.497/mês | 5 redes, posts ilimitados, ads, financeiro completo |
| Enterprise | R$ 3.997/mês | Tudo + agentes custom + suporte dedicado |
| White-label | R$ 7.997/mês | Sua marca, seu domínio, multi-tenant |

---

## ❓ DECISÕES PRO SQUAD

1. **Qual arquitetura?** A (Dify), B (N8n+PB), ou C (Flowise+Supa)?
2. **Primeiro módulo?** Social Media ou Financeiro?
3. **Primeiro cliente piloto?** H2O Films? Monteiro Aranha?
4. **Hosting produção?** Mac Mini, VPS, ou Coolify?
5. **Nome do produto?** Titanio Command Center? Titanio Studio? Outro?

---

*Documento gerado pela Tita em 06/04/2026. Pronto pra discussão no HiClaw.*
