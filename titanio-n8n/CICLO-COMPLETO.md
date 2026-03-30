# Ciclo Completo — Tita Memory Engine

## Como uma tarefa vira aprendizado permanente

```
1. NOVA SESSÃO
   ├─ Tita lê: SOUL.md + USER.md + contexto-ativo.md
   ├─ Tita lê: MEMORY.md + memory/hoje.md + memory/ontem.md  
   ├─ (tarefas complexas) LESSONS.md + memory-index.md
   └─ Contexto injetado → Tita "lembra" de tudo relevante

2. EXECUÇÃO DA TAREFA
   ├─ Tita age com contexto completo
   ├─ Usa ferramentas, APIs, N8n webhooks
   └─ Detecta erros ou insights durante execução

3. FIM DA SESSÃO / TAREFA SIGNIFICATIVA
   ├─ Tita POST → http://localhost:5678/webhook/session-log
   │   {
   │     duration_min: 45,
   │     tasks: ["Setup N8n", "Criar workflows"],
   │     tokens: 12500,
   │     outcome: "N8n funcionando",
   │     lesson: "host.docker.internal necessário",
   │     tags: ["n8n", "docker"]
   │   }
   │
   ├─ WF-010 processa:
   │   ├─ Adiciona entrada no memory/YYYY-MM-DD.md
   │   ├─ Atualiza memory-index.md
   │   └─ Se tem lição → adiciona em LESSONS.md
   │
   └─ Sync GitHub (WF-003, a cada 6h) → backup externo

4. TODA SEGUNDA-FEIRA 9H (WF-011)
   ├─ Busca notas dos últimos 7 dias
   ├─ Claude analisa e extrai insights
   ├─ Atualiza MEMORY.md com consolidação
   └─ Notifica Eduardo com resumo

5. PRÓXIMA SESSÃO
   └─ Tita acorda com MEMORY.md atualizado → ciclo continua
```

## Status de Implementação

| Componente | Status | Arquivo |
|------------|--------|---------|
| LESSONS.md | ✅ Criado | workspace/LESSONS.md |
| entity-graph.json | ✅ Criado | memory/entity-graph.json |
| memory-index.md | ✅ Criado | memory/memory-index.md |
| AGENTS.md atualizado | ✅ Feito | workspace/AGENTS.md |
| WF-001 Relatório Diário | ✅ JSON pronto | workflows/wf-001-*.json |
| WF-002 Alert Bot | ✅ JSON pronto | workflows/wf-002-*.json |
| WF-003 Memory Sync GitHub | ✅ JSON pronto | workflows/wf-003-*.json |
| WF-010 Session Logger | ✅ JSON pronto | workflows/wf-010-*.json |
| WF-011 Weekly Consolidation | ✅ JSON pronto | workflows/wf-011-*.json |
| sync-memory.sh | ✅ Criado | workspace/sync-memory.sh |
| docker-compose.yml | ✅ Criado | titanio-n8n/docker-compose.yml |
| Memory API endpoints | 🟡 Especificado | titanio-n8n/memory-api-endpoints.md |
| Backend Titanio Dashboard | 🔴 Pendente | (Tiago/Helber implementar) |

## Para Ativar Tudo Agora

```bash
# 1. Subir N8n
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/titanio-n8n
./start-n8n.sh up

# 2. Importar workflows (http://localhost:5678)
# → Importar todos os JSONs em workflows/

# 3. Adicionar ANTHROPIC_API_KEY no .env do N8n

# 4. Criar repo GitHub (se não existe)
# gh repo create contact703/tita-memory --private

# 5. Testar session logger manualmente
curl -X POST http://localhost:5678/webhook/session-log \
  -H "Content-Type: application/json" \
  -d '{
    "duration_min": 30,
    "tasks": ["Implementar Memory Engine"],
    "outcome": "Sistema de memória completo projetado",
    "lesson": "Ciclo completo: sessão → log → consolidação → próxima sessão",
    "tags": ["memoria", "n8n", "titanio"]
  }'
```
