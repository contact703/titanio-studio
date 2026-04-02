# api-master — Lições
## Regras
- Atualizar após cada tarefa

### 2026-03-23 19:37 — GospIA Stripe Fix
- **Tarefa:** Cancelamento de assinaturas Stripe + downgrade Supabase (Elenice e Tiago)
- **Solução:** Stripe API v1: DELETE /subscriptions/{id} cancela imediatamente. POST /cancel foi removido em versões recentes. Supabase PATCH em /profiles para is_pro=false, tier=free, subscription_end_date=null.
- ✅ **CRITICAL:** Stripe cancel subscription: usar DELETE /v1/subscriptions/{id}, não POST /cancel (endpoint removido)
- ✅ **CRITICAL:** billing_provider_customers é a tabela correta para mapear Stripe customer_id → user_id, não profiles.stripe_customer_id
- ✅ **HIGH:** Para buscar customer Stripe por email: GET /v1/customers/search?query=email:'x@y.com'
- ✅ **HIGH:** Assinatura past_due também precisa ser cancelada — não aparece em status=active mas continua tentando cobrar

## 2026-04-02 12:05 — Projeto Monteiro Aranha — projete as INTEGRAÇÕES: 1) WhatsAp
**Status:** ✅ Sucesso
**Duração:** 22.1s
- [integration] Integrações: whatsapp
- [process] Projeto Monteiro Aranha — projete as INTEGRAÇÕES: 1) WhatsApp Business API para  → # Projeto Monteiro Aranha — Arquitetura Completa de Integrações & APIs

Vou projetar a stack de integrações do zero. Lendo contexto do projeto primeir

