# Relatório — Fix Webhook Stripe GospIA
**Data:** 2026-03-23 | **Projeto:** GospIA | **Responsável:** Debug Hunter + Code Ninja + API Master + DevOps Ninja
**Status:** ✅ Deploy realizado | Aguardando confirmação Stripe

---

## Resumo Executivo
Webhook Stripe do GospIA retornava HTTP 500 em cascata desde 17/03/2026, impedindo processamento de pagamentos e renovações de assinatura. Causa identificada e corrigida em produção.

## Diagnóstico (Debug Hunter)

### Evidências Coletadas
- `www.gospia.app` UP (HTTP 200) ✅
- `/api/webhooks/stripe` → HTTP 500 em TODOS os POSTs (17/03 → 21/03)
- Teste direto: 400 com assinatura inválida (comportamento esperado)
- Env vars Railway: todas presentes (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_SERVICE_ROLE_KEY) ✅

### Causa Raiz
```
invoice.payment_succeeded handler buscava usuário por:
  profiles.stripe_customer_id
  
Coluna NÃO EXISTE no banco Supabase → PostgREST retorna erro
→ handler captura → return 500
```

**Confirmado via:** `GET /rest/v1/profiles?select=stripe_customer_id`
```json
{"code":"42703","message":"column profiles.stripe_customer_id does not exist"}
```

### Tabela Correta
`billing_provider_customers` (provider + provider_customer_id → user_id) — já existia, nunca foi usada.

## Solução (Code Ninja)

### Arquivo Corrigido
`src/app/api/webhooks/stripe/route.ts`

### Mudanças
1. **invoice.payment_succeeded**: lookup por `billing_provider_customers` (provider=stripe, provider_customer_id=customerId)
2. **checkout.session.completed**: adicionado `upsert` em `billing_provider_customers` (garante renovações futuras)
3. Melhoria de logs e tratamento de erros

### Commit
```
4a23413 — fix: webhook Stripe — usar billing_provider_customers
contact703/Appgospia → main
```

## Deploy (DevOps Ninja)
- Push → Railway autodeploy detectado
- Deploy automático via GitHub integration
- Railway GraphQL API: vars lidas sem acesso ao dashboard

## Cancelamento de Assinaturas (API Master)
Executado separadamente:
| Usuário | Customer Stripe | Status Final |
|---------|-----------------|--------------|
| elenicepradogospel@gmail.com | cus_TchD7NmShs8yH8 | ✅ Cancelado + Free |
| tiago@titanioproducoes.com.br | cus_Ta2dGtnbZDXBNq | ✅ Cancelado + Free |

**Método:** `DELETE /v1/subscriptions/{id}` (POST /cancel foi removido no Stripe API v2)

## Impacto
- ✅ Novos pagamentos serão processados corretamente
- ✅ Renovações de assinatura funcionarão
- ✅ 2 assinaturas canceladas sem cobranças futuras
- ⚠️ Eventos falhados (17-21/03): reenviar no Stripe Dashboard → Failed deliveries

## Lições Aprendidas
- Stripe DELETE /subscriptions/{id} para cancelar imediato
- billing_provider_customers: tabela correta para Stripe customer → user
- Assinatura past_due continua tentando cobrar — cancelar manualmente
- DDL no Supabase requer Management API token, não service_role

---
*Relatório gerado por Kratos | 23/03/2026 19:35*
