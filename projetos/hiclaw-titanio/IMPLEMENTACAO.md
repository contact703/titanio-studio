# 📋 Plano de Implementação — Titanio Multi-Agent Collaboration

## Premissa
Não estamos construindo do zero — estamos **conectando e estendendo** o que já funciona.

---

## Fase 1: Agent Collaboration Layer (1-2 dias)
**Objetivo**: Permitir que Tita delegue tarefas para especialistas de forma visível.

### 1.1 Criar N8n Workflow: Task Delegation
```
Trigger: Webhook POST /webhook/task-delegate
→ Registra tarefa no JSON/SQLite
→ Notifica canal (WhatsApp/Telegram)
→ Atualiza Dashboard
```

**Endpoint**: `POST http://localhost:5678/webhook/task-delegate`
```json
{
  "from": "tita",
  "to": "marketing-director", 
  "task": "Criar estratégia de lançamento",
  "priority": "high",
  "deadline": "2026-03-28T18:00:00",
  "context": "Filme X precisa de lançamento em abril"
}
```

### 1.2 Criar N8n Workflow: Task Completion
```
Trigger: Webhook POST /webhook/task-complete
→ Atualiza status da tarefa
→ Notifica quem delegou
→ Notifica Eduardo se necessário
→ Atualiza Dashboard
```

### 1.3 Criar N8n Workflow: Approval Queue
```
Trigger: Webhook POST /webhook/approval-request
→ Envia para Eduardo no WhatsApp
→ Aguarda resposta
→ Retorna decisão para o agente
```

### 1.4 Criar banco de tarefas simples
```
/workspace/projetos/hiclaw-titanio/data/
├── tasks.json          # Todas as tarefas ativas
├── handoffs.json       # Log de handoffs
└── approvals.json      # Fila de aprovações
```

---

## Fase 2: Handoff Protocol (1 dia)
**Objetivo**: Padronizar como especialistas passam tarefas entre si.

### 2.1 Formato de Handoff
Criar skill ou template que cada especialista usa:

```markdown
## Handoff Message Format

🔄 **[Handoff]** {from} → {to}
📋 **Tarefa**: {descrição}
📎 **Contexto**: {arquivos ou links relevantes}  
⏱️ **Prazo**: {deadline}
🏷️ **Prioridade**: {🔴 alta | 🟡 média | 🟢 baixa}
```

### 2.2 Completion Format
```markdown
✅ **[Completo]** {agent} → {requester}
📋 **Resultado**: {descrição do que foi feito}
📎 **Entregáveis**: {arquivos, links, PRs}
⏱️ **Tempo**: {quanto levou}
💡 **Notas**: {observações importantes}
```

### 2.3 Implementar no SOUL.md dos especialistas
Adicionar instruções de handoff protocol nos prompts dos especialistas.

---

## Fase 3: Dashboard Extension (2-3 dias)
**Objetivo**: Visualizar colaboração em tempo real na Dashboard existente (localhost:4444).

### 3.1 Nova seção: "Collaboration Hub"
- **Task Board**: Kanban com tarefas ativas (To Do / In Progress / Review / Done)
- **Handoff Timeline**: Linha do tempo mostrando delegações
- **Agent Status**: Grid com status de cada especialista
- **Approval Queue**: Cards de decisões pendentes para Eduardo

### 3.2 Fonte de dados
- Ler de `tasks.json` / `handoffs.json` / `approvals.json`
- Ou endpoint N8n que retorna dados consolidados
- Polling a cada 10s ou WebSocket se Dashboard suportar

### 3.3 Agent Status Card
```
┌────────────────────────┐
│ 🎬 Diretor de Marketing│
│ Status: 🟢 Working     │
│ Tarefa: Campanha X     │
│ Desde: 14:30           │
│ Delegado por: Tita     │
└────────────────────────┘
```

---

## Fase 4: Paperclip Integration (1 dia)
**Objetivo**: Usar org chart do Paperclip para routing inteligente.

### 4.1 Mapping de competências
Criar/atualizar no Paperclip:
- Quem é responsável por qual tipo de tarefa
- Cadeia de escalação
- Dependências entre especialistas

### 4.2 Routing automático
Quando Tita recebe uma tarefa, consulta Paperclip para decidir:
- Qual especialista é mais adequado
- Se precisa de mais de um especialista
- Qual a cadeia de aprovação

---

## Fase 5: Autonomy Modes (1 dia)
**Objetivo**: Implementar os 3 modos de autonomia.

### 5.1 Configuração em arquivo
```json
// /workspace/projetos/hiclaw-titanio/config/autonomy.json
{
  "mode": "guided",  // "full-oversight" | "guided" | "autonomous"
  "rules": {
    "full-oversight": {
      "approval_required": "all",
      "notify": "all_messages",
      "delegation": "ask_first"
    },
    "guided": {
      "approval_required": ["external_actions", "spending", "publishing"],
      "notify": "summaries",
      "delegation": "auto_internal"
    },
    "autonomous": {
      "approval_required": ["spending_over_100"],
      "notify": "daily_report",
      "delegation": "full_auto"
    }
  }
}
```

### 5.2 Comando para trocar modo
Eduardo pode dizer no WhatsApp:
- "Modo supervisão total" → full-oversight
- "Modo guiado" → guided
- "Modo autônomo" → autonomous

---

## Fase 6: Grupo de Colaboração Visível (1 dia)
**Objetivo**: Criar canal onde Eduardo vê as interações entre agentes.

### Opção A: Grupo WhatsApp dedicado
- Criar grupo "Titanio Agents"
- Todos os handoffs postados lá
- Eduardo e Zica são membros
- Muted by default, avisam só o importante

### Opção B: Canal Telegram
- Canal read-only para broadcast
- Grupo para interação
- Mais features que WhatsApp para isso

### Opção C: Dashboard only
- Tudo na Dashboard, sem poluir WhatsApp
- Eduardo consulta quando quiser
- Alertas só para aprovações

**Recomendação**: Opção C (Dashboard) + alertas no WhatsApp para aprovações. Não poluir WhatsApp com cada handoff.

---

## Cronograma Resumido

| Fase | Descrição | Tempo | Pré-requisito |
|---|---|---|---|
| 1 | Agent Collaboration Layer (N8n workflows) | 1-2 dias | N8n rodando |
| 2 | Handoff Protocol | 1 dia | Fase 1 |
| 3 | Dashboard Extension | 2-3 dias | Fase 1 |
| 4 | Paperclip Integration | 1 dia | Fase 2 |
| 5 | Autonomy Modes | 1 dia | Fase 2 |
| 6 | Grupo de Colaboração Visível | 1 dia | Fase 1 |
| **Total** | | **7-9 dias** | |

---

## Quick Win (pode fazer HOJE)

### Minimal Viable Collaboration
1. Criar `tasks.json` para tracking
2. Criar N8n webhook `/task-delegate` que salva tarefa + notifica WhatsApp
3. Adicionar instrução no SOUL.md da Tita: "Quando delegar, use o webhook"
4. Eduardo já vê delegações no WhatsApp

**Tempo: ~2 horas**. Zero frameworks novos. Só N8n + arquivo JSON.

---

## O que NÃO fazer

- ❌ Instalar HiClaw/Matrix/Element — redundante
- ❌ Adotar CrewAI/AutoGen/LangGraph — over-engineering
- ❌ Criar framework do zero — usar N8n como cola
- ❌ Migrar especialistas para novo sistema — estender o existente
- ❌ Exigir que Eduardo use novo app — WhatsApp é o canal
