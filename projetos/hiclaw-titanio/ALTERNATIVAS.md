# 🔄 Alternativas Open Source — Multi-Agent Systems

## Comparativo Geral

| Framework | Org | Stars | Linguagem | Foco | IM Nativo | Human-in-Loop |
|---|---|---|---|---|---|---|
| **HiClaw** | Alibaba | 3.2k | Shell/Python | Multi-agent OS via Matrix | ✅ Matrix | ✅ Built-in |
| **CrewAI** | CrewAI Inc | 25k+ | Python | Orquestração de agentes autônomos | ❌ | ⚠️ Opcional |
| **AutoGen** | Microsoft | 40k+ | Python | Framework agentic AI | ❌ | ✅ |
| **LangGraph** | LangChain | 10k+ | Python | Agents como grafos stateful | ❌ | ✅ |
| **OpenAI Swarm** | OpenAI | 20k+ | Python | Educacional, handoffs leves | ❌ | ❌ |
| **OpenAI Agents SDK** | OpenAI | - | Python | Substituto produção do Swarm | ❌ | ⚠️ |

---

## 1. CrewAI
**Repo**: [crewAIInc/crewAI](https://github.com/crewAIInc/crewAI) | **Licença**: MIT

### O que é
Framework Python para orquestração de agentes autônomos com roles definidos. 100k+ devs certificados.

### Conceitos-chave
- **Crews**: Grupos de agentes autônomos com collaborative intelligence
- **Flows**: Arquitetura event-driven para produção, controle granular
- **Roles**: Cada agente tem papel, objetivo e backstory

### Prós para nós
- ✅ Muito popular, comunidade enorme
- ✅ MIT license
- ✅ Conceito de "crews" similar ao que queremos (equipes de especialistas)
- ✅ Independente de LangChain

### Contras
- ❌ Sem IM nativo (Telegram/WhatsApp)
- ❌ Sem visualização em tempo real
- ❌ Precisaria de bridge para nossos canais

---

## 2. Microsoft AutoGen / Agent Framework
**Repo**: [microsoft/autogen](https://github.com/microsoft/autogen) | **Licença**: MIT

### O que é
Framework da Microsoft para apps multi-agent. Recentemente evoluiu para [Microsoft Agent Framework](https://github.com/microsoft/agent-framework).

### Conceitos-chave
- **AssistantAgent**: Agente com modelo LLM
- **AgentTool**: Permite um agente chamar outro
- **AutoGen Studio**: GUI no-code para criar agentes

### Prós para nós
- ✅ Suporte MCP Server nativo
- ✅ AutoGen Studio (GUI) — poderia integrar na Dashboard
- ✅ Microsoft backing, muito robusto

### Contras
- ❌ Complexo demais para nosso caso
- ❌ Sem IM integration nativo
- ❌ Overhead significativo

---

## 3. LangGraph
**Repo**: [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) | **Licença**: MIT

### O que é
Framework low-level para agentes stateful como grafos. Foco em durabilidade, memória e human-in-the-loop.

### Conceitos-chave
- **Durable Execution**: Agentes persistem entre falhas
- **Human-in-the-loop**: Inspeção e modificação de estado a qualquer momento
- **Memory**: Short-term + long-term

### Prós para nós
- ✅ Human-in-the-loop nativo
- ✅ Memória persistente (já temos isso)
- ✅ LangSmith para debugging

### Contras
- ❌ Mais um framework para manter
- ❌ Sem IM nativo
- ❌ Curva de aprendizado alta

---

## 4. OpenAI Swarm → Agents SDK
**Repo**: [openai/swarm](https://github.com/openai/swarm) (deprecated → [openai/openai-agents-python](https://github.com/openai/openai-agents-python))

### O que é
Framework educacional da OpenAI para handoffs entre agentes. Agora substituído pelo Agents SDK para produção.

### Conceitos-chave
- **Agents**: Instruções + ferramentas
- **Handoffs**: Um agente transfere conversa para outro
- **Stateless**: Sem estado entre chamadas

### Prós para nós
- ✅ Conceito de handoff é exatamente o que queremos
- ✅ Extremamente simples e leve
- ✅ Bom modelo mental

### Contras
- ❌ Deprecated (migrar para Agents SDK)
- ❌ Só OpenAI (não multi-provider)
- ❌ Educacional, não production-ready

---

## 5. HiClaw (nossa escolha recomendada como referência)

### Por que HiClaw é a melhor referência para nós

| Critério | HiClaw | Outros |
|---|---|---|
| IM integration nativo | ✅ Matrix (similar a Telegram) | ❌ Precisam bridge |
| Human-in-the-loop | ✅ Built-in, visual | ⚠️ Programático |
| Visibilidade real-time | ✅ Cada room mostra tudo | ❌ Logs/debug |
| Usa OpenClaw | ✅ Runtime base | ❌ |
| Segurança de credenciais | ✅ Gateway centralizado | ⚠️ Varia |
| Self-hosted | ✅ Docker Compose | ⚠️ Varia |

### Conclusão
**Não precisamos adotar HiClaw diretamente** — já temos infraestrutura superior em vários aspectos:
- Nosso OpenClaw Gateway **já conecta WhatsApp, Telegram e Discord** (vs HiClaw que usa só Matrix)
- Temos **37 especialistas com memória persistente** (vs HiClaw cria Workers on-demand)
- Temos **Dashboard visual** (vs HiClaw depende de Element Web)
- Temos **Paperclip com org chart** (vs HiClaw tem apenas Manager-Worker)

**O que devemos copiar do HiClaw:**
1. Transparência total — todas as conversas entre agentes visíveis
2. Human-in-the-loop como padrão — intervenção a qualquer momento
3. Handoffs visíveis — ver quem passou a tarefa para quem
4. Manager-Worker pattern — um coordenador central
5. Gateway de credenciais — segurança enterprise

**O que devemos fazer melhor:**
1. Multi-plataforma (WhatsApp + Telegram + Discord vs só Matrix)
2. Especialistas permanentes com memória (vs Workers stateless)
3. Dashboard visual rica (vs Element Web genérico)
4. Org chart integrado (Paperclip)
5. N8n para workflows automatizados
