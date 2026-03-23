# 🤖 AGENTE TIAGO — Setup e Configuração

**Criado para:** Tiago  
**Data:** 2026-03-22  
**Versão:** 1.0

---

## O que é o agente Tiago?

Um especialista dedicado de chat (como o Instagram Poster que criamos hoje) que:
- Funciona como seu assistente pessoal no Dashboard
- Tem memória persistente de tarefas e lições
- Sabe executar ações automáticas
- Funciona mesmo quando você não está logado

---

## 🚀 SETUP AUTOMÁTICO

### 1. Criar pasta do agente
```bash
mkdir -p ~/titanio-dashboard/memoria-especialistas/tiago-agent/{sessions,prompts}
```

### 2. Criar arquivos de memória
```bash
# context.md — instruções do agente
cat > ~/titanio-dashboard/memoria-especialistas/tiago-agent/context.md << 'EOF'
# Tiago Agent 🤖

**Especialidade:** Assistente pessoal de Tiago
**Dashboard:** Titanio Command Center
**Status:** Ativo

## Responsabilidades
- Executar tarefas no Dashboard
- Gerenciar Especialistas
- Configurar N8n workflows
- Responder perguntas com contexto

## Como chamar
"Tiago Agent, [tarefa]"

## Stack
- Node.js
- N8n
- Squad de Especialistas
EOF
```

### 3. Criar memory.json
```bash
cat > ~/titanio-dashboard/memoria-especialistas/tiago-agent/memory.json << 'EOF'
{
  "specialistId": "tiago-agent",
  "specialistName": "Tiago Agent",
  "version": 1,
  "createdAt": "2026-03-22T20:55:00.000Z",
  "lastActive": "2026-03-22T20:55:00.000Z",
  "stats": {
    "tasksCompleted": 0,
    "tasksFailed": 0,
    "sessionsTotal": 0,
    "lessonsLearned": 0,
    "tokensUsed": 0,
    "avgTaskDurationMs": 0
  },
  "knowledge": [
    "Titanio Dashboard funciona com 32 especialistas",
    "Cada especialista tem memory.json + lessons.json",
    "N8n workflows sincronizam via git",
    "Context transfer entre modelos funciona"
  ],
  "recentTasks": [],
  "activeContext": {
    "currentTask": null,
    "currentProject": null,
    "startedAt": null
  }
}
EOF
```

### 4. Criar lessons.json
```bash
cat > ~/titanio-dashboard/memoria-especialistas/tiago-agent/lessons.json << 'EOF'
{
  "specialistId": "tiago-agent",
  "lessonsLearned": [
    {
      "id": "lesson-001",
      "category": "dashboard",
      "title": "Dashboard tem 32 especialistas",
      "description": "Todos rodando, cada um com memória persistente",
      "learnedAt": "2026-03-22T20:55:00.000Z",
      "priority": "high",
      "applicable": true
    }
  ],
  "failureAnalysis": [],
  "improvements": []
}
EOF
```

---

## 📝 REGISTRAR NO DASHBOARD

**No arquivo:** `code/backend/.env`

```bash
# Adicionar:
TIAGO_AGENT_ID=tiago-agent
TIAGO_AGENT_ENABLED=true
TIAGO_AGENT_MEMORY_PATH=/memoria-especialistas/tiago-agent/
```

**Reiniciar backend:**
```bash
npm run build
npm start
```

---

## 🎯 TESTANDO O AGENTE

### 1. Via API
```bash
curl -X POST http://localhost:4444/api/squad/tiago-agent/task \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Qual é seu nome?",
    "context": "Teste do agente"
  }'
```

### 2. Via Dashboard
- Abrir http://localhost:3000
- Tab "Especialistas"
- Procurar "Tiago Agent"
- Clicar em "Executar tarefa"

### 3. Via Chat
```
"Tiago Agent, responda: Quantos especialistas temos?"
```

---

## 💾 MEMÓRIA PERSISTENTE

### Seu agente aprende automaticamente com:
- Tasks completadas
- Lições de erros
- Contexto de conversas

### Acessar histórico
```bash
cat ~/titanio-dashboard/memoria-especialistas/tiago-agent/memory.json | jq .recentTasks
```

### Limpar memória (se necessário)
```bash
rm -rf ~/titanio-dashboard/memoria-especialistas/tiago-agent/sessions/*
# Mas manter memory.json e lessons.json!
```

---

## 🔄 SINCRONIZAR COM CONTACT & HELBER

Seu agente é pessoal, mas pode aprender com eles:

```bash
git pull origin main
# Isso sincroniza especialistas compartilhados
# Seu agente fica separado

git add memoria-especialistas/tiago-agent/
git commit -m "Tiago Agent: atualizar memória"
git push origin main
```

---

## 📊 MONITORAR PERFORMANCE

```bash
# Ver tarefas completadas
curl http://localhost:4444/api/squad/tiago-agent | jq .

# Ver lessons aprendidas
cat ~/titanio-dashboard/memoria-especialistas/tiago-agent/lessons.json | jq .lessonsLearned
```

---

## ✅ CHECKLIST DE SETUP

- [ ] Pasta criada
- [ ] memory.json pronto
- [ ] lessons.json pronto
- [ ] context.md escrito
- [ ] .env atualizado
- [ ] Backend reiniciado
- [ ] API testada
- [ ] Dashboard mostra agente

---

## 🚀 Agora você tem um assistente pessoal!

Quando ativar, ele vai:
- Responder perguntas sobre o Dashboard
- Executar tarefas automáticas
- Aprender com o tempo
- Compartilhar conhecimento com outros agentes

**Pronto pra usar. Qualquer dúvida, é só chamar.**

