# 🚀 Titanio Dashboard Online — Plano Executivo

> **Data:** 06/04/2026 | **Para:** Zica
> **Objetivo:** Dashboard 100% online que automatiza posts, tráfego pago, comunicação — SEM Claude/OpenClaw

---

## 📋 RESPOSTAS ÀS PERGUNTAS DO ZICA

### 1. "Consigo fazer isso SEM Claude e SEM OpenClaw?"

**SIM, 100%.** Aqui está como:

| Função | SEM Claude | COMO fazer |
|--------|------------|------------|
| Posts Instagram | ✅ | N8n + Meta Graph API |
| Tráfego pago Meta | ✅ | N8n + Meta Marketing API |
| Tráfego pago Google | ✅ | N8n + Google Ads API |
| Bot que conversa | ✅ | N8n + Groq API (grátis) ou Ollama |
| Bot que aprende processos | ✅ | N8n workflows + base de conhecimento |
| Financeiro/NFS-e | ✅ | N8n + Manda a Nota API |

**Claude/OpenClaw são opcionais** — servem pra tarefas MUITO complexas. Pro dia-a-dia comercial, N8n + Groq resolvem.

---

### 2. "Qual plano do N8n preciso pra ficar online?"

**OPÇÃO A — Self-hosted numa VPS (RECOMENDO)**
- Custo: ~R$50-100/mês (DigitalOcean, Hetzner, Contabo)
- Execuções: ILIMITADAS
- Controle: TOTAL
- Setup: 1 hora com Docker

**OPÇÃO B — N8n Cloud**
| Plano | Preço | Execuções/mês | Workflows |
|-------|-------|---------------|-----------|
| Starter | $24/mês (~R$130) | 2.500 | 5 ativos |
| Pro | $60/mês (~R$330) | 10.000 | 15 ativos |
| Enterprise | $300+/mês | Ilimitado | Ilimitado |

**Recomendação:** VPS próprio. Por R$80/mês você tem N8n ilimitado + PocketBase + Dashboard + tudo.

---

### 3. "Em quais processos uso N8n e como?"

```
┌────────────────────────────────────────────────────────────────┐
│                    FLUXO DO CLIENTE (H2O)                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CLIENTE FALA          N8N PROCESSA           RESULTADO          │
│  ─────────────         ───────────────        ─────────────      │
│                                                                  │
│  "Hoje tem evento      → Workflow dispara     → Post no IG      │
│   do filme X às 19h"   → IA gera copy         → Story criado    │
│                        → Imagem gerada        → Campanha Meta   │
│                        → Campanha criada      → Relatório 24h   │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

**DETALHAMENTO POR PROCESSO:**

#### 📱 POSTS AUTOMÁTICOS
```
Trigger: Webhook (cliente manda info) ou Agendamento
    ↓
[N8n] Recebe dados (evento, horário, texto base)
    ↓
[N8n] Chama Groq API → gera copy otimizado
    ↓
[N8n] Chama ComfyUI/DALL-E → gera imagem
    ↓
[N8n] Meta Graph API → publica no Instagram
    ↓
[N8n] Salva no PocketBase → histórico
```

#### 💰 TRÁFEGO PAGO AUTOMÁTICO
```
Trigger: Cliente define campanha no dashboard
    ↓
[N8n] Cria campanha na Meta Marketing API
    ↓
[N8n] Define público, orçamento, período
    ↓
[N8n] Sobe criativos (imagem/vídeo)
    ↓
[N8n] Monitora a cada 6h → ajusta se CPA alto
    ↓
[N8n] Relatório diário no WhatsApp
```

#### 🤖 BOT QUE APRENDE PROCESSOS
```
[PocketBase] Base de conhecimento do cliente
    ↓
[N8n] Webhook recebe pergunta do WhatsApp
    ↓
[N8n] Busca na base de conhecimento
    ↓
[N8n] Groq API formata resposta
    ↓
[N8n] Responde no WhatsApp
    ↓
[N8n] Se não souber → escala pra humano
```

---

### 4. "Como funciona pra H2O Films?"

```
┌─────────────────────────────────────────────────────────────────┐
│              DASHBOARD H2O FILMS (WHITE-LABEL)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  CALENDÁRIO │  │   TRÁFEGO   │  │    BOT      │              │
│  │   EDITORIAL │  │    PAGO     │  │   EQUIPE    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                      │
│         ▼                ▼                ▼                      │
│  ┌──────────────────────────────────────────────┐               │
│  │              N8N (MOTOR)                      │               │
│  │  • 15+ workflows automáticos                 │               │
│  │  • Integrações: Meta, Google, WhatsApp       │               │
│  │  • IA: Groq (grátis) ou Ollama               │               │
│  └──────────────────────────────────────────────┘               │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────┐               │
│  │           POCKETBASE (DADOS)                  │               │
│  │  • Filmes, eventos, campanhas                │               │
│  │  • Histórico de posts                        │               │
│  │  • Base de conhecimento                      │               │
│  └──────────────────────────────────────────────┘               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**EXEMPLO REAL — Dia típico H2O:**

09:00 — H2O abre dashboard, vê calendário da semana
09:15 — Preenche: "Hoje exibição Bacurau às 20h, ingresso R$30"
09:16 — N8n dispara:
  - IA gera 3 opções de copy
  - IA gera imagem do evento
  - Agenda post pra 14h (melhor horário)
  - Cria campanha Meta Ads (R$50, raio 10km)
  
14:00 — Post sobe automaticamente no Instagram
14:01 — Campanha Meta começa a rodar
20:00 — Evento acontece
21:00 — N8n puxa métricas e manda relatório WhatsApp

**H2O NÃO PRECISA:**
- Saber usar Meta Ads
- Saber criar imagens
- Escrever copy
- Monitorar campanhas

**H2O SÓ PRECISA:**
- Dizer o que vai acontecer
- Definir orçamento
- Ver os resultados

---

## 🏗️ ARQUITETURA FINAL (100% ONLINE)

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VPS (Hetzner/DO/Contabo)                      │
│                    ~R$80/mês - 4GB RAM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   NEXT.JS    │  │     N8N      │  │  POCKETBASE  │           │
│  │  Dashboard   │  │  Automação   │  │   Backend    │           │
│  │  :3000       │  │  :5678       │  │   :8090      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│  ┌──────────────────────────────────────────────┐               │
│  │              NGINX (Reverse Proxy)            │               │
│  │  dashboard.titanio.studio → :3000            │               │
│  │  n8n.titanio.studio → :5678                  │               │
│  │  api.titanio.studio → :8090                  │               │
│  └──────────────────────────────────────────────┘               │
│                          │                                       │
│  ┌──────────────────────────────────────────────┐               │
│  │         CLOUDFLARE (SSL + CDN + DDoS)         │               │
│  └──────────────────────────────────────────────┘               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVIÇOS EXTERNOS (APIs)                      │
├─────────────────────────────────────────────────────────────────┤
│  Meta Graph API (posts)    │  Meta Marketing API (ads)          │
│  Google Ads API            │  WhatsApp Business API              │
│  Groq API (IA grátis)      │  OpenAI API (backup)               │
│  Stripe/Asaas (pagamentos) │  Manda a Nota (NFS-e)              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📅 CRONOGRAMA — 4 SEMANAS

### SEMANA 1 — INFRAESTRUTURA
| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Seg | Contratar VPS (Hetzner 4GB) | Zica |
| Seg | Setup Docker + N8n + PocketBase | Code Ninja |
| Ter | Configurar Nginx + SSL | Code Ninja |
| Qua | Domínio titanio.studio apontando | Zica |
| Qui | N8n rodando online (n8n.titanio.studio) | Code Ninja |
| Sex | PocketBase rodando (api.titanio.studio) | Code Ninja |

### SEMANA 2 — DASHBOARD BASE
| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Seg | Next.js setup + Auth (login) | Code Ninja |
| Ter | Layout base (sidebar, header) | Code Ninja |
| Qua | Tela de projetos/clientes | Code Ninja |
| Qui | Integração PocketBase SDK | Code Ninja |
| Sex | Deploy dashboard.titanio.studio | Code Ninja |

### SEMANA 3 — MÓDULO SOCIAL + ADS
| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Seg | Workflow N8n: post Instagram | Tita |
| Ter | Workflow N8n: gerar copy com Groq | Tita |
| Qua | Tela calendário editorial | Code Ninja |
| Qui | Workflow N8n: criar campanha Meta | Tita |
| Sex | Tela de campanhas no dashboard | Code Ninja |

### SEMANA 4 — BOT + TESTES + H2O
| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Seg | Workflow N8n: bot WhatsApp | Tita |
| Ter | Base de conhecimento PocketBase | Code Ninja |
| Qua | Testes integrados | Todos |
| Qui | Criar conta H2O no sistema | Zica |
| Sex | Onboarding H2O Films | Zica + Tita |

---

## 💰 CUSTOS MENSAIS

| Item | Custo |
|------|-------|
| VPS Hetzner 4GB | €7 (~R$40) |
| Domínio .studio | R$60/ano = R$5/mês |
| Cloudflare | GRÁTIS |
| N8n self-hosted | GRÁTIS |
| PocketBase | GRÁTIS |
| Groq API | GRÁTIS (10K req/dia) |
| Meta APIs | GRÁTIS (só paga os ads) |
| **TOTAL** | **~R$50/mês** |

**Comparativo:**
- N8n Cloud Pro: R$330/mês
- Nosso setup: R$50/mês
- **Economia: R$280/mês = R$3.360/ano**

---

## ✅ CHECKLIST PARA COMEÇAR

- [ ] Zica aprova o plano
- [ ] Criar conta Hetzner (cartão internacional)
- [ ] Registrar titanio.studio (ou usar outro domínio)
- [ ] Code Ninja começa setup Semana 1
- [ ] Definir se começa com Titanio interno ou H2O direto

---

## 🎯 ENTREGÁVEIS

**Ao final das 4 semanas:**

1. **dashboard.titanio.studio** funcionando
2. **n8n.titanio.studio** com 10+ workflows
3. **Bot WhatsApp** respondendo dúvidas
4. **Posts automáticos** funcionando
5. **Campanhas Meta** sendo criadas por workflow
6. **H2O Films** usando o sistema

---

## ❓ DECISÕES PENDENTES

1. **Domínio:** titanio.studio? titaniocommand.com? Outro?
2. **VPS:** Hetzner (mais barato) ou DigitalOcean (mais fácil)?
3. **Primeira conta:** Titanio interno ou H2O direto?
4. **WhatsApp:** Business API oficial ou Evolution API (grátis)?

---

*Plano criado pela Tita em 06/04/2026. Aguardando aprovação do Zica.*
