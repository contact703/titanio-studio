# 🏗️ Stack Técnica Completa: Monteiro Aranha — Relatório de Execução

Vou projetar e entregar a arquitetura técnica completa com código executável e diagramas.

---

## 1. ARQUITETURA GERAL (Diagrama ASCII)

```
┌─────────────────────────────────────────────────────────────────┐
│                      MONTEIRO ARANHA STACK                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   FRONTEND       │
│  Next.js 14      │
│  - White-label   │
│  - Design System │
│  - Chat UI       │
└────────┬─────────┘
         │ REST/WebSocket
         │
┌────────▼──────────────────────────────────────────────────────┐
│                    API GATEWAY & AUTH                         │
│              (Express + JWT + Rate Limiting)                  │
└────────┬──────────────────────────────────────────────────────┘
         │
    ┌────┴────────────────────────────────┐
    │                                     │
┌───▼──────────────┐        ┌───────────┴──────────────┐
│   CORE API       │        │   IA ENGINE              │
│ - Express REST   │        │ ┌──────────────────────┐ │
│ - Controllers    │        │ │ Ollama (Local)       │ │
│ - Services       │        │ │ - Embeddings         │ │
│ - Middleware     │        │ │ - Small Models       │ │
└───┬──────────────┘        │ └──────────┬───────────┘ │
    │                       │            │             │
    │                       │ ┌──────────▼───────────┐ │
    │                       │ │ Claude API (Remote)  │ │
    │                       │ │ - Complex Tasks      │ │
    │                       │ │ - Reasoning          │ │
    │                       │ └──────────────────────┘ │
    │                       └──────────────────────────┘
    │
    ├──────────────────────────────────┐
    │                                  │
┌───▼──────────────┐        ┌─────────┴──────────┐
│    DATABASE      │        │  CACHE LAYER       │
│  PostgreSQL      │        │  Redis             │
│  - Users         │        │  - Sessions        │
│  - Specialists   │        │  - AI responses    │
│  - Audit Log     │        │  - Rate limits     │
│  - Documents     │        │  - Approvals Queue │
└──────────────────┘        └────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│             WHATSAPP GATEWAY (Approval Layer)                │
│  - Twilio/WhatsApp Cloud API                                 │
│  - Human approval workflow                                   │
│  - Audit trail                                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    3 MODOS OPERACIONAIS                       │
│                                                               │
│  NORMAL → All features | RESTRITO → Limited | CONFIDENCIAL → │
│  Only approved users, full audit, encryption, 2FA            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│           ESPECIALISTAS DIGITAIS (AI Agents)                 │
│  CEO | RI | Jurídico | Finanças | Marketing | Design        │
│         (Cada um com contexto + fine-tuning)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. ESTRUTURA DE PASTAS DO PROJETO

```
monteiro-aranha/
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── chat/
│   │   └── admin/
│   ├── components/
│   │   ├── design-system/
│   │   ├── chat/
│   │   └── specialists/
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── auth.ts
│   │   └── modes.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main.ts (Express app)
│   │   ├── auth/
│   │   │   ├── jwt.ts
│   │   │   └── middleware.ts
│   │   ├── controllers/
│   │   │   ├── chat.controller.ts
│   │   │   ├── specialist.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── services/
│   │   │   ├── ai.service.ts (Ollama + Claude)
│   │   │   ├── specialist.service.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   └── mode.service.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── specialist.model.ts
│   │   │   └── audit.model.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── mode-enforcement.middleware.ts
│   │   │   └── audit.middleware.ts
│   │   ├── db/
│   │   │   ├── postgres.ts
│   │   │   └── migrations/
│   │   └── config/
│   │       └── env.ts
│   └── package.json
│
├── ai-engine/
│   ├── ollama/
│   │   ├── models.ts
│   │   └── embeddings.ts
│   ├── claude/
│   │   └── client.ts
│   ├── specialists/
│   │   ├── ceo-agent.ts
│   │   ├── ri-agent.ts
│   │   ├── juridico-agent.ts
│   │   ├── financas-agent.ts
│   │   ├── marketing-agent.ts
│   │   └── design-agent.ts
│   └── training/
│       └── fine-tuning.ts
│
├── whatsapp-gateway/
│   ├── twilio-client.ts
│   ├── approval-workflow.ts
│   └── audit-trail.ts
│
└── docker-compose.yml
```

---

## 3. CÓDIGO: SETUP INICIAL (Backend)

### 3.1 Express + Database

```typescript
// backend/src/main.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import redis from 'redis';
import jwt from 'jsonwebtoken';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ==================== DATABASE ====================
export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ==================== REDIS ====================
export const redisClient = redis.createClient({
  url: process.env.REDIS_URL