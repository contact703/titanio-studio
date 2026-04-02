# Pesquisa: Stack Técnica para Dashboard Enterprise MA

## Open-Source Enterprise

| Ferramenta | Stars | RBAC | Aprovações | Melhor para |
|------------|-------|------|-----------|------------|
| Refine.dev | ~32K | ✅ | ✅ custom | Devs React, headless 🥇 |
| Appsmith | ~35K | ✅ | ✅ built-in | Low-code 🥈 |
| Directus | ~29K | ✅ granular | ⚠️ via flows | Headless CMS 🥉 |
| Tooljet | ~34K | ✅ | ✅ | Low-code rápido |
| Budibase | ~22K | ✅ | ✅ | Times não-técnicos |

## Templates Next.js
- **shadcn/ui** (111K stars) — sidebar, tabelas, cards, dark/light mode
- **Tremor** — charts financeiros, KPIs, analytics
- **Aceternity UI** — animações premium (wow factor)
- Recomendação: **shadcn + Tremor = cobertura completa**

## Chat IA Integrado
- **Vercel AI SDK** — useChat(), streaming, multi-LLM
- **CopilotKit** — sidebar plug-and-play para dashboards
- Arquitetura: Dashboard → Sidebar IA → API → Claude/GPT

## Document Management
- **Monaco Editor** — diff side-by-side (contratos)
- **react-pdf** — visualização PDF
- **TipTap/Novel.sh** — editor rich text com IA

## Real-time
- **SSE custom** — status de tarefas IA (simples)
- **Supabase Realtime** — notificações + presença
- **Vercel AI SDK** — streaming de chat

## Stack Recomendado
- Next.js 15 + shadcn/ui + Tremor
- Refine.dev Core (RBAC) + NextAuth.js
- Supabase (Postgres + Auth + Realtime + Storage)
- Vercel AI SDK + CopilotKit sidebar
- Monaco Editor + react-pdf + TipTap
