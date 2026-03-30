# 🏗️ Arquitetura — Titanio Multi-Agent Collaboration System

## Visão Geral

Adaptar o conceito HiClaw (multi-agent collaboration visível com human-in-the-loop) para a infraestrutura Titanio existente, sem adicionar complexidade desnecessária.

**Princípio**: Não reinventar — orquestrar o que já temos.

---

## Arquitetura Proposta

```
┌──────────────────────────────────────────────────────────┐
│                    EDUARDO / ZICA                         │
│              (WhatsApp / Telegram / Discord)              │
└──────────────┬───────────────────────────┬───────────────┘
               │                           │
               ▼                           ▼
┌──────────────────────┐    ┌──────────────────────────────┐
│   OpenClaw Gateway   │    │    Dashboard Titanio          │
│   localhost:18789    │    │    localhost:4444              │
│                      │    │                               │
│ • WhatsApp bridge    │    │ • Visualização em tempo real  │
│ • Telegram bridge    │    │ • Timeline de handoffs        │
│ • Discord bridge     │    │ • Status dos especialistas    │
│ • Routing de msgs    │    │ • Aprovações pendentes        │
└──────────┬───────────┘    │ • Log de decisões            │
           │                └──────────────┬───────────────┘
           ▼                               │
┌──────────────────────────────────────────┼───────────────┐
│              ORQUESTRADOR CENTRAL         │               │
│                                          │               │
│  ┌──────────────┐    ┌─────────────┐     │               │
│  │   Paperclip  │    │     N8n     │     │               │
│  │  :3001       │    │   :5678     │     │               │
│  │              │    │             │     │               │
│  │ • Org chart  │    │ • Workflows │     │               │
│  │ • Hierarquia │    │ • Triggers  │     │               │
│  │ • Roles      │    │ • Webhooks  │     │               │
│  └──────┬───────┘    └──────┬──────┘     │               │
│         │                   │            │               │
│         ▼                   ▼            ▼               │
│  ┌─────────────────────────────────────────────────┐     │
│  │           AGENT COLLABORATION LAYER              │     │
│  │                                                  │     │
│  │  • Roteamento inteligente de tarefas             │     │
│  │  • Handoff entre especialistas                   │     │
│  │  • Contexto compartilhado                        │     │
│  │  • Fila de aprovações                            │     │
│  │  • Log de todas as interações                    │     │
│  └──────────────────┬──────────────────────────────┘     │
│                     │                                     │
└─────────────────────┼─────────────────────────────────────┘
                      │
     ┌────────────────┼────────────────────────┐
     ▼                ▼                        ▼
┌──────────┐  ┌──────────────┐  ┌──────────────────────┐
│ Tita 🐾  │  │ Especialista │  │   Especialista N     │
│ (Manager)│  │     #2       │  │   (Worker)           │
│          │  │              │  │                      │
│ Coordena │  │ Ex: Diretor  │  │ Ex: Dev Frontend     │
│ delega   │  │ de Marketing │  │                      │
│ reporta  │  │              │  │                      │
└──────────┘  └──────────────┘  └──────────────────────┘
     37 especialistas com memória persistente
```

---

## Componentes Detalhados

### 1. Tita como Manager Agent (já existe!)
A Tita já funciona como coordenadora. O que adicionamos:
- **Delegação explícita**: Tita pode invocar especialistas por nome
- **Handoff visível**: Quando Tita delega, aparece no grupo/dashboard
- **Report back**: Especialista reporta resultado para Tita, que reporta para Eduardo

### 2. Grupo de Colaboração (já temos via OpenClaw!)
- **WhatsApp/Telegram**: Grupo onde Eduardo vê todas as interações
- **Formato de mensagem padrão**:
  ```
  🔄 [Handoff] Tita → Marketing Director
  📋 Tarefa: Criar estratégia de lançamento do filme X
  ⏱️ Prazo: 2h
  
  ---
  
  ✅ [Completo] Marketing Director → Tita
  📋 Resultado: Estratégia pronta, 3 opções
  📎 Arquivo: marketing-strategy-v1.md
  ```

### 3. Dashboard de Visualização (estender localhost:4444)
Nova seção na Dashboard:
- **Timeline**: Visualização cronológica de todas as tarefas
- **Grafo de Handoffs**: Quem delegou para quem
- **Status Board**: Cada especialista e seu status (idle/working/waiting)
- **Approval Queue**: Decisões pendentes para Eduardo/Zica

### 4. N8n como Event Bus
Workflows para:
- **Task Assignment**: Tita delega → N8n registra → Dashboard atualiza
- **Handoff Tracking**: Especialista A → B → N8n loga → Dashboard mostra
- **Approval Flow**: Decisão importante → N8n notifica Eduardo → Aguarda aprovação
- **Completion**: Tarefa concluída → N8n atualiza status → Notifica canal

### 5. Paperclip como Org Chart
Define:
- Hierarquia dos 37 especialistas
- Quem pode delegar para quem
- Cadeia de aprovação
- Competências de cada especialista

---

## Modos de Operação (inspirado no HiClaw)

### 🟢 Full Oversight (início)
- Eduardo vê TODAS as mensagens entre agentes
- Aprovação necessária para TODAS as ações externas
- Tita pergunta antes de delegar

### 🟡 Guided Autonomy (confiança crescendo)
- Eduardo vê resumos, não cada mensagem
- Aprovação só para ações de alto impacto (gastos, publicações, contratos)
- Tita delega livremente para tarefas internas

### 🔴 Full Autonomy (confiança total)
- Agentes trabalham autonomamente
- Eduardo recebe relatórios diários
- Intervenção apenas por exceção

---

## Fluxo de Colaboração Exemplo

### Cenário: Produzir trailer do filme

```
Eduardo (WhatsApp): "Preciso do trailer do filme X pronto até sexta"

Tita (Manager):
  → Analisa tarefa
  → Consulta Paperclip (quem é responsável por trailers?)
  → Identifica: Diretor de Pós-Produção + Editor de Vídeo + Sound Designer

Tita → Dashboard: Cria task "Trailer Filme X" com subtasks

Tita → Grupo WhatsApp:
  "🎬 Nova tarefa: Trailer do Filme X
   📅 Deadline: Sexta
   👥 Equipe: Pós-Produção, Edição, Sound Design
   📋 Status: Iniciando"

Tita → Pós-Produção Director (subagent):
  "Coordena a produção do trailer. Editor de Vídeo e Sound Designer são seus Workers."

Pós-Produção → Editor (subagent):
  "Selecione os melhores takes e monte um rough cut de 90s"

Editor → Pós-Produção:
  "✅ Rough cut pronto: rough-cut-v1.mp4"

Pós-Produção → Sound Designer (subagent):
  "Adicione trilha e sound design ao rough cut"

Sound → Pós-Produção:
  "✅ Mix pronto: trailer-mix-v1.mp4"

Pós-Produção → Tita:
  "✅ Trailer v1 pronto para review"

Tita → Eduardo (WhatsApp):
  "🎬 Trailer pronto para aprovação!
   📎 trailer-mix-v1.mp4
   ✅ Aprovar | ❌ Revisões | 💬 Comentários"
```

---

## Vantagem sobre HiClaw

| Aspecto | HiClaw | Titanio (nossa versão) |
|---|---|---|
| Interface | Matrix (Element Web) | WhatsApp + Telegram + Discord + Dashboard |
| Agentes | Workers descartáveis | 37 especialistas permanentes com memória |
| Org Chart | Manager-Worker flat | Hierarquia via Paperclip |
| Workflows | Manual | Automatizados via N8n |
| Credenciais | Gateway Higress | OpenClaw Gateway (já configurado) |
| Deployment | Docker Compose novo | Já rodando, só estender |
| Audiência | Developers | Eduardo + Zica (não-técnicos) |
| Mobile | Qualquer Matrix client | WhatsApp/Telegram nativos |

---

## Decisões Técnicas

### Por que NÃO usar Matrix/Element
- Eduardo/Zica já usam WhatsApp — por que adicionar mais um app?
- OpenClaw Gateway já conecta WhatsApp, Telegram, Discord
- Matrix adiciona complexidade sem benefício para nosso caso

### Por que NÃO instalar HiClaw diretamente
- Temos infraestrutura melhor para nosso caso de uso
- HiClaw requer Docker separado + Matrix server
- Nossos 37 especialistas já existem e têm memória
- Seria redundante com OpenClaw que já roda

### O que COPIAR do HiClaw
1. **Transparência radical** — tudo visível
2. **Handoff como primeiro conceito** — delegação é cidadão de primeira classe
3. **Human-in-the-loop como default** — autonomia é earned, não assumed
4. **Manager como coordenador** — Tita já faz isso
5. **Modos de autonomia** — gradual trust building
