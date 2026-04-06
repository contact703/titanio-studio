# 🏢 Titanio Studio MVP — Plano de Execução

> **Stack 100% gratuita** — Supabase Free + Vercel Free + N8n Local + Ollama Local
> **Meta:** Dashboard funcional e online HOJE

## Stack Escolhida (custo R$0)

| Componente | Serviço | Plano | Custo |
|-----------|---------|-------|-------|
| **Database + Auth** | Supabase | Free (500MB, 50K MAU) | R$0 |
| **Hosting Frontend** | Vercel | Free (100GB bandwidth) | R$0 |
| **Automação** | N8n | Self-hosted (já rodando) | R$0 |
| **IA** | Ollama + Groq | Local + Free API | R$0 |
| **Email** | Resend | Free (100 emails/dia) | R$0 |
| **Storage** | Supabase Storage | Free (1GB) | R$0 |
| **Domain** | Vercel subdomain | *.vercel.app | R$0 |

## Módulos MVP

### 1. Dashboard Central
- Login/signup (Supabase Auth)
- Overview com KPIs
- Menu lateral: Social, Ads, Financeiro, Agentes, Comunicação

### 2. Social Media (Simplificado)
- Agendar posts (texto + imagem)
- Conectar Instagram via token
- Calendário visual
- IA gera texto (Ollama/Groq)

### 3. Agentes IA
- Chat com agentes configuráveis
- Modelos: Groq (grátis, rápido) + Ollama (local)
- Templates: Copywriter, Atendente, Analista

### 4. Financeiro Básico
- Registro de receitas/despesas
- Dashboard fluxo de caixa
- Integração futura NFS-e

### 5. Comunicação
- Chat interno (Supabase Realtime)
- Notificações

## Estrutura do Projeto

```
titanio-studio-mvp/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Login/Signup pages
│   ├── (dashboard)/       # Protected dashboard
│   │   ├── page.tsx       # Overview
│   │   ├── social/        # Social media module
│   │   ├── agents/        # AI agents module
│   │   ├── finance/       # Financial module
│   │   └── chat/          # Internal comms
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # Shared components
├── lib/                   # Supabase client, utils
├── supabase/             # Migrations, seed
└── package.json
```
