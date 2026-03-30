# Chat Real da Tita via WebSocket — Implementado ✅

**Data:** 2026-03-13  
**Status:** FUNCIONANDO

## O que foi feito

Substituído o `RealChatService.ts` (que usava `/v1/chat/completions`) por `RealTitaService.ts` que usa WebSocket + protocolo `chat.send` do OpenClaw gateway.

## Arquivos modificados

- **Criado:** `backend/src/services/RealTitaService.ts` — serviço WS real
- **Modificado:** `backend/src/index.ts` — troca import de `sendToTita` → `sendToTitaReal`

## Protocolo WS descoberto

```
ws://localhost:18789

1. Conectar sem header de auth
2. Enviar connect RPC:
   { type: "req", method: "connect", id: "connect-1", params: {
     minProtocol: 1, maxProtocol: 10,
     client: { id: "gateway-client", platform: "darwin", version: "1.0", mode: "backend" },
     auth: { token: "e60ccf70d272..." },
     scopes: ["operator.admin"],
     role: "operator"
   }}
3. Após res ok=true, enviar:
   { type: "req", method: "chat.send", id: "chat-1", params: {
     message: "...",
     idempotencyKey: "dashboard-xxx",
     sessionKey: "agent:main:main"
   }}
4. Aguardar event:chat com state="final"
   - payload.message.content = array de blocos de texto
```

## Diferença chave vs /v1/chat/completions

O `chat.send` com `sessionKey: "agent:main:main"` usa a **sessão principal da Tita** — com memória persistente, SOUL.md, IDENTITY.md, contexto completo. Não é uma chamada isolada ao modelo.

## Teste de verificação

```bash
curl -s -X POST http://localhost:4444/api/chat/tita \
  -H "Content-Type: application/json" \
  -d '{"message":"Olá Tita! Você está funcionando via WebSocket agora?"}'
```

**Resposta obtida:**
```json
{"reply":"Sim! Mensagem chegou via WebSocket. Tudo conectado e funcionando. 🔌🐾","timestamp":"..."}
```

## Tokens/credenciais usados

- **Gateway token** (auth principal): `e60ccf70d272c2dc7203130b129a47ae97fa57df656f64e8`
- Fonte: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/openclaw.json` → `gateway.auth.token`
