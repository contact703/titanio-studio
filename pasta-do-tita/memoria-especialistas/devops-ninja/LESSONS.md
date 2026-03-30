# devops-ninja — Lições
## Regras
- Atualizar após cada tarefa

### 2026-03-23 19:37 — GospIA Stripe Fix
- **Tarefa:** Deploy fix GospIA via GitHub → Railway autodeploy
- **Solução:** Push para contact703/Appgospia branch main. Railway detecta automaticamente e faz redeploy. Railway token f9fde3ea usado para consultar env vars via GraphQL API.
- ✅ **HIGH:** Railway GraphQL API: usar variables(projectId, serviceId, environmentId) para ler env vars sem acesso ao dashboard
- ✅ **HIGH:** GospIA: repo contact703/Appgospia, deploy automático via push na main
- ✅ **MEDIUM:** DDL (ALTER TABLE) no Supabase: não é possível via service_role key + REST API. Precisaria de Management API token ou acesso direto ao Postgres

## Lições iOS Session — 2026-03-23
- ✅ altool apple ID = email contact@titaniofilms.com não username
- ✅ App-specific password é por Apple ID, não por app
- ✅ Conformidade exportação: apps com só HTTPS = nenhum algoritmo de criptografia
