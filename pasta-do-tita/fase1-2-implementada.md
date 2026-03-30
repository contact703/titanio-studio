# Fases 1 e 2 — Multi-usuário Titanio Dashboard

**Data:** 2026-03-13
**Status:** ✅ Implementado e testado

---

## Fase 1: Config por usuário via .env

### Backend

- `backend/.env` — Novas vars adicionadas:
  ```
  OWNER_ID=eduardo
  OWNER_NAME=Eduardo
  OWNER_AVATAR=👤
  OPENCLAW_SESSION_KEY=agent:main:main
  GATEWAY_HOST=localhost
  GATEWAY_PORT=18789
  BOT_SCOPE_DEFAULT=user
  ```

- `backend/src/index.ts` — Endpoint `GET /api/me` criado:
  ```json
  {
    "id": "eduardo",
    "name": "Eduardo",
    "avatar": "👤",
    "role": "admin",
    "gatewayHost": "localhost",
    "gatewayPort": 18789,
    "sessionKey": "agent:main:main"
  }
  ```

- `RealTitaService.ts` — Já usava `process.env.OPENCLAW_SESSION_KEY` (sem alteração necessária)

### Frontend

- `Sidebar.tsx` — Agora faz `GET /api/me` ao carregar e exibe `me.name`, `me.avatar`, `me.role` dinamicamente (removido hardcode "Eduardo / Admin")

---

## Fase 2: Bots de Grupo vs Bots de Usuário

### Backend

- `types/bot.ts` — Adicionado `scope: BotScope` e `ownerId?: string`
- `BotManager.ts`:
  - `getAllBots(scope?, ownerId?)` — suporta filtragem por scope/ownerId
  - `createBot()` — aceita `scope` e `ownerId` (default: env vars)
  - Bots de seed: bot-1 → `scope: 'user'`, bot-2 → `scope: 'group'`
- `index.ts`:
  - `GET /api/bots?scope=group` → só bots de grupo
  - `GET /api/bots?scope=user&ownerId=eduardo` → só bots do usuário
  - `GET /api/bots` → todos
  - `POST /api/bots` aceita campo `scope`

### Frontend

- `BotsPanel.tsx`:
  - Modal "Novo Bot" com toggle `[👤 Para mim] [🌐 Para o grupo]`
  - Badge `👤 Pessoal` (azul) / `🌐 Grupo` (verde) em cada bot
  - Seções separadas "Meus Bots" / "Bots do Grupo" quando há os dois tipos

---

## Testes

```
curl http://localhost:4444/api/me
→ {"id":"eduardo","name":"Eduardo","avatar":"👤","role":"admin",...}

curl "http://localhost:4444/api/bots?scope=group"
→ [{"id":"bot-2","scope":"group",...}]

curl -X POST http://localhost:4444/api/bots -d '{"name":"Bot Grupo Teste","type":"custom","scope":"group"}'
→ {"id":"bot-...","scope":"group",...}
```

## Serviços rodando

- Backend: `http://localhost:4444` (node dist/index.js)
- Frontend: `http://localhost:3000` (next dev)
