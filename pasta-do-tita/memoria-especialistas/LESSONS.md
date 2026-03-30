# code-ninja — Lições
## Regras
- Atualizar após cada tarefa

### 2026-03-23 19:37 — GospIA Stripe Fix
- **Tarefa:** Fix webhook route.ts GospIA — invoice.payment_succeeded handler
- **Solução:** Substituiu profiles.stripe_customer_id por billing_provider_customers lookup. Adicionou upsert do mapeamento customer→user no checkout.session.completed para garantir que renovações futuras funcionem.
- ✅ **CRITICAL:** Webhook Stripe: salvar mapeamento stripe_customer_id→user_id em billing_provider_customers no primeiro checkout
- ✅ **HIGH:** invoice.payment_succeeded deve buscar usuário via billing_provider_customers (provider+provider_customer_id), nunca por coluna direta em profiles
- ✅ **HIGH:** Stripe checkout.session.completed: session.customer é o customer_id permanente, deve ser persistido
