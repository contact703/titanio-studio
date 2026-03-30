# PESQUISA: Soluções de Memória Persistente para IA entre Sessões
**Data:** 2026-03-30  
**Pesquisado por:** Subagente (tarefa de Eduardo)  
**Contexto:** OpenClaw + Claude (claude-sonnet-4-6) rodando no Mac Mini

---

## TL;DR — Diagnóstico e Recomendações Rápidas

**Problema real descoberto:** O OpenClaw JÁ injeta automaticamente os arquivos de workspace (`AGENTS.md`, `SOUL.md`, `USER.md`, `TOOLS.md`, `IDENTITY.md`, `MEMORY.md`) em TODA sessão. O problema com `SESSION-CONTEXT.md` é que **ele NÃO está na lista de injeção automática**.

**Soluções imediatas (sem instalar nada extra):**

1. **Renomear SESSION-CONTEXT.md → MEMORY.md** (ou mover conteúdo para lá) — aí ele é injetado automaticamente
2. **Habilitar o hook `bootstrap-extra-files`** — permite adicionar arquivos extras ao bootstrap (como SESSION-CONTEXT.md)
3. **Habilitar o hook `session-memory`** — salva contexto da sessão automaticamente ao usar `/new`
4. **Habilitar o hook `boot-md`** — executa BOOT.md na inicialização do gateway

---

## 1. Como o OpenClaw Gerencia Memória (Documentação Oficial)

**URL:** https://docs.openclaw.ai/concepts/memory.md  
**Como funciona:**

O OpenClaw usa dois tipos de memória:
- **`MEMORY.md`** — memória de longo prazo. Carregada no início de TODA sessão DM.
- **`memory/YYYY-MM-DD.md`** — notas diárias. Hoje + ontem carregados automaticamente.

Esses arquivos ficam em `~/.openclaw/workspace` (nosso caso: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace`).

**Ferramentas disponíveis para o agente:**
- `memory_search` — busca semântica nas notas
- `memory_get` — lê arquivo específico

**Backends disponíveis:**
- **Builtin (padrão)** — SQLite com FTS5 e busca vetorial
- **QMD** — sidecar local com reranking avançado
- **Honcho** — memória cross-session com modelagem de usuário

**Flush automático antes de compactação:** O OpenClaw salva contexto importante antes de compactar a sessão.

---

## 2. O Sistema de Injeção de Bootstrap (CRÍTICO para nosso problema)

**URL:** https://docs.openclaw.ai/concepts/system-prompt.md  

### Arquivos que SÃO injetados automaticamente em toda sessão:
- `AGENTS.md` ✅
- `SOUL.md` ✅
- `TOOLS.md` ✅
- `IDENTITY.md` ✅
- `USER.md` ✅
- `HEARTBEAT.md` ✅
- `MEMORY.md` ✅ (quando existe)
- `BOOTSTRAP.md` ✅ (somente na primeira vez)

### Arquivos que NÃO são injetados automaticamente:
- `SESSION-CONTEXT.md` ❌ — precisa ser lido manualmente pela IA ou via tool
- `pasta-do-tita/contexto-ativo.md` ❌ — idem
- `memory/YYYY-MM-DD.md` ❌ — acessado via `memory_search`/`memory_get`

### Limites importantes:
- Max por arquivo: `bootstrapMaxChars` (padrão: 20.000 chars)
- Max total: `bootstrapTotalMaxChars` (padrão: 150.000 chars)
- Arquivos grandes são truncados com marcador

### Por que o Claude "ignora" as instruções:
1. `SESSION-CONTEXT.md` não está na lista de auto-injeção
2. O AGENTS.md diz pra ler SESSION-CONTEXT.md, mas às vezes o modelo pula passos no início de sessões muito curtas
3. Em subagentes, só AGENTS.md e TOOLS.md são injetados (outros são filtrados)

---

## 3. Hooks do OpenClaw — Solução Nativa para Forçar Comportamentos

**URL:** https://docs.openclaw.ai/automation/hooks.md

### Hooks relevantes para nosso problema:

#### `session-memory` (BUNDLED — ativar agora!)
- **O que faz:** Salva contexto da sessão em `memory/YYYY-MM-DD-slug.md` quando você usa `/new` ou `/reset`
- **Ativar:** `openclaw hooks enable session-memory`
- **Benefício:** Cria automaticamente resumo das sessões → alimenta SESSION-CONTEXT.md

#### `bootstrap-extra-files` (BUNDLED — muito importante!)
- **O que faz:** Injeta arquivos adicionais durante `agent:bootstrap`
- **Configurar:**
```json
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "bootstrap-extra-files": {
          "enabled": true,
          "paths": ["SESSION-CONTEXT.md", "pasta-do-tita/contexto-ativo.md"]
        }
      }
    }
  }
}
```
- **ATENÇÃO:** Só funciona com basenames reconhecidos. SESSION-CONTEXT.md não está na lista padrão. Ver seção de solução workaround abaixo.

#### `boot-md` (BUNDLED)
- **O que faz:** Executa `BOOT.md` quando o gateway inicia
- **Ativar:** `openclaw hooks enable boot-md`
- **Uso:** Colocar em BOOT.md: "Leia SESSION-CONTEXT.md e mande resumo para Eduardo"

#### `before_prompt_build` (Plugin API)
- **O que faz:** Injeta contexto dinâmico ANTES do modelo receber o prompt
- **Retorna:** `systemPromptAddition` — texto adicionado ao system prompt
- **Uso avançado:** Plugin customizado que lê SESSION-CONTEXT.md e injeta automaticamente

---

## 4. Context Engine — Solução Avançada (OpenClaw)

**URL:** https://docs.openclaw.ai/concepts/context-engine.md

O Context Engine controla como o OpenClaw monta o contexto para cada run. Plugins podem registrar engines customizadas.

**`assemble()` pode retornar `systemPromptAddition`** — isso adiciona texto ao system prompt dinamicamente, antes do modelo ver o prompt. Isso é o que precisamos para injetar SESSION-CONTEXT.md de forma garantida.

**Exemplo de plugin de Context Engine:**
```typescript
api.registerContextEngine("tita-memory", () => ({
  info: { id: "tita-memory", name: "Tita Memory Engine", ownsCompaction: false },
  
  async assemble({ sessionId, messages, tokenBudget }) {
    // Ler SESSION-CONTEXT.md e injetar
    const sessionContext = await fs.readFile('SESSION-CONTEXT.md', 'utf8');
    return {
      messages,
      estimatedTokens: countTokens(messages),
      systemPromptAddition: `## Contexto da Sessão Anterior\n${sessionContext}`,
    };
  },
  
  async ingest() { return { ingested: true }; },
  async compact() { return { ok: true, compacted: false }; },
}));
```

---

## 5. Builtin Memory Engine (OpenClaw)

**URL:** https://docs.openclaw.ai/concepts/memory-builtin.md  
**Gratuito:** Sim  
**Roda local:** Sim (SQLite)

**O que faz:**
- Indexa `MEMORY.md` e `memory/*.md` em SQLite com FTS5
- Suporta busca vetorial (com API key: OpenAI, Gemini, Voyage, Mistral)
- Suporta busca local sem API key com modelo GGUF (~0.6 GB download)
- Hybrid search: BM25 + vetor

**Ativar busca vetorial local (sem API key):**
```json
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "provider": "local"
      }
    }
  }
}
```

**Aplicabilidade ao nosso caso:** ✅ Excelente. Já está ativo por padrão. Se ativarmos um embedding provider, a busca semântica melhora muito.

---

## 6. QMD Memory Engine (OpenClaw)

**URL:** https://docs.openclaw.ai/concepts/memory-qmd.md  
**Gratuito:** Sim  
**Roda local:** Sim (Bun + node-llama-cpp)

**O que adiciona sobre o Builtin:**
- Reranking e query expansion (melhor recall)
- Indexa diretórios fora do workspace
- Indexa transcripts de sessões antigas (MUITO útil!)
- Totalmente local, sem API keys

**Configuração para indexar sessões:**
```json
{
  "memory": {
    "backend": "qmd",
    "qmd": {
      "sessions": { "enabled": true },
      "paths": [
        { "name": "contexto", "path": "pasta-do-tita", "pattern": "**/*.md" }
      ]
    }
  }
}
```

**Instalação:**
```bash
bun install -g https://github.com/tobi/qmd
brew install sqlite  # macOS
```

**Aplicabilidade ao nosso caso:** ✅✅ Muito bom. Indexa transcripts de sessões antigas = memória real cross-session. E pode indexar `pasta-do-tita/`.

---

## 7. Honcho Memory (Plugin OpenClaw)

**URL:** https://docs.openclaw.ai/concepts/memory-honcho.md  
**GitHub:** https://github.com/plastic-labs/honcho  
**Gratuito:** Self-hosted gratuito, managed tem $100 de crédito inicial  
**Roda local:** Sim (requer Python + PostgreSQL + pgvector)  
**Licença:** AGPL-3.0

**O que faz:**
- Memória cross-session automática (persiste após cada turn)
- Modelagem de usuário (aprende preferências, fatos, estilo de comunicação)
- Busca semântica sobre interações passadas
- Multi-agent awareness (pai rastreia subagentes)

**Ferramentas que registra no OpenClaw:**
- `honcho_context` — representação completa do usuário
- `honcho_search_conclusions` — busca semântica em conclusões
- `honcho_search_messages` — busca mensagens por sessão/data
- `honcho_ask` — pergunta sobre o usuário (LLM-powered)

**Instalação:**
```bash
openclaw plugins install @honcho-ai/openclaw-honcho
openclaw honcho setup
openclaw gateway --force
```

**Self-hosted (requer Postgres + pgvector):**
```bash
git clone https://github.com/plastic-labs/honcho.git
cd honcho
uv sync
# configurar .env com DB_CONNECTION_URI
uv run alembic upgrade head
uv run fastapi dev src/main.py
# Em outra aba:
uv run python -m src.deriver
```

**Aplicabilidade ao nosso caso:** ✅✅✅ **MELHOR SOLUÇÃO** para memória cross-session real. O Honcho injeta contexto automaticamente via `before_prompt_build` — sem precisar que o Claude leia arquivos. Funciona com Claude.

---

## 8. mem0 — Universal Memory Layer

**URL:** https://github.com/mem0ai/mem0  
**Docs:** https://docs.mem0.ai  
**Gratuito:** Open source (Apache 2.0), managed service pago  
**Roda local:** Sim  
**Stars:** Muito popular (Y Combinator backed)

**O que faz:**
- Memória multi-nível: User, Session, Agent state
- API simples: `memory.add()`, `memory.search()`
- +26% accuracy vs OpenAI Memory no benchmark LOCOMO
- 90% menos tokens vs full-context
- SDK Python e Node.js

**Uso básico:**
```python
from mem0 import Memory
memory = Memory()

# Salvar
memory.add("Eduardo prefere respostas diretas e práticas", user_id="eduardo")

# Buscar
results = memory.search("estilo de comunicação do Eduardo", user_id="eduardo")
```

**Integração com OpenClaw:**
Não tem integração nativa, mas pode ser usado via script Python que:
1. Salva contexto de cada sessão
2. Busca contexto relevante antes de cada sessão
3. Injeta via MEMORY.md ou SESSION-CONTEXT.md

**Aplicabilidade ao nosso caso:** ⚠️ Médio. Requer integração customizada. Não tem plugin OpenClaw direto. Mas é simples de usar como camada auxiliar.

---

## 9. Letta (antigo MemGPT)

**URL:** https://github.com/letta-ai/letta  
**Docs:** https://docs.letta.com  
**Gratuito:** Open source + managed (requer API key)  
**Roda local:** Sim (CLI: `npm install -g @letta-ai/letta-code`)  
**Licença:** Apache 2.0

**O que faz:**
- Plataforma para agentes com memória avançada que aprendem e melhoram
- `memory_blocks` — blocos de memória por agente (persona, fatos sobre o usuário)
- Model-agnostic (suporta Claude, GPT, Gemini, Llama)
- Skills e subagentes built-in

**Uso via API:**
```typescript
const agentState = await client.agents.create({
  model: "anthropic/claude-sonnet-4-6",
  memory_blocks: [
    { label: "human", value: "Nome: Eduardo. Timezone: America/Sao_Paulo..." },
    { label: "persona", value: "Assistente técnico chamado Tita..." },
  ],
});
```

**Aplicabilidade ao nosso caso:** ⚠️ Baixo. Seria trocar toda a plataforma (OpenClaw → Letta). Não é integração, é substituição.

---

## 10. Zep + Graphiti — Context Graph para Agentes

**URL Zep:** https://www.getzep.com / https://github.com/getzep/zep  
**URL Graphiti:** https://github.com/getzep/graphiti  
**Gratuito:** Graphiti open source (Apache 2.0), Zep Cloud pago  
**Roda local:** Graphiti sim (requer Neo4j ou FalkorDB)

**O que faz:**
- **Graphiti:** Temporal knowledge graph — rastreia COMO fatos mudam ao longo do tempo
- Cada fato tem janela de validade (quando ficou verdadeiro, quando foi superado)
- Hybrid retrieval: semântico + keyword + graph traversal
- Sub-200ms latência

**Exemplo de uso com Anthropic:**
```python
pip install graphiti-core[anthropic]
# Requer Neo4j ou FalkorDB rodando localmente
```

**Aplicabilidade ao nosso caso:** ⚠️ Complexo. Requer Neo4j rodando. Overkill para nosso uso. Mas é o state-of-the-art para memória de agentes em produção.

---

## 11. Khoj — "Second Brain" Open Source

**URL:** https://github.com/khoj-ai/khoj  
**Gratuito:** Open source + cloud em app.khoj.dev  
**Roda local:** Sim (self-hostable)

**O que faz:**
- Chat com qualquer LLM local ou online (incluindo Claude)
- Indexa e busca em documentos pessoais (PDF, Markdown, Notion, Word)
- Acesso via Browser, Obsidian, WhatsApp, Desktop, Phone
- Agentes customizados com knowledge base própria
- Automações e newsletters

**Aplicabilidade ao nosso caso:** ⚠️ Baixo direto. É uma plataforma completa alternativa ao OpenClaw. Mas a ideia de indexar todos os .md do workspace é interessante.

---

## 12. Soluções Técnicas Gerais

### 12.1 RAG (Retrieval-Augmented Generation)
- **O que é:** Busca em base de conhecimento antes de gerar resposta
- **Ferramentas locais:** ChromaDB, Qdrant, FAISS
- **Relevância:** Já implementado pelo OpenClaw Builtin + QMD engines

### 12.2 Vector Stores Locais
| Tool | Uso | Local |
|------|-----|-------|
| ChromaDB | Embeddigs + search | Sim |
| Qdrant | Produção escalável | Sim/Cloud |
| FAISS (Meta) | Rápido, sem servidor | Sim |
| sqlite-vec | Já embutido no OpenClaw | Sim |

### 12.3 File-Based Memory (o que fazemos hoje)
- **Markdown files** — AGENTS.md, MEMORY.md, memory/YYYY-MM-DD.md
- **Prós:** Simples, versionável (git), editável por humano
- **Contras:** Depende do modelo ler proativamente, pode ser truncado

### 12.4 Session Context Injection (via BOOT.md)
- Criar `BOOT.md` com instruções de carregar arquivos
- Habilitar `boot-md` hook
- Gateway executa BOOT.md ao iniciar

---

## 13. Análise do Nosso Problema Específico

### Por que SESSION-CONTEXT.md às vezes é ignorado?

**Causa raiz confirmada:** `SESSION-CONTEXT.md` NÃO está na lista de arquivos auto-injetados pelo OpenClaw. Apenas estes são injetados: AGENTS.md, SOUL.md, USER.md, TOOLS.md, IDENTITY.md, HEARTBEAT.md, MEMORY.md.

Quando AGENTS.md instrui "leia SESSION-CONTEXT.md antes de qualquer coisa", o modelo DEVE ler — mas:
1. Em sessões curtas/rápidas o modelo pode não seguir todos os passos
2. O modelo recebe o AGENTS.md já no contexto, então a instrução está lá
3. O problema não é "ignorar o arquivo injetado" — é "não executar a instrução de ler outro arquivo"

### Solução Definitiva no OpenClaw

**Opção A — Mais simples:** Mover conteúdo de SESSION-CONTEXT.md para dentro de MEMORY.md (ou fazer SESSION-CONTEXT.md ser um alias/link). MEMORY.md É injetado automaticamente.

**Opção B — Elegante:** Habilitar hook `session-memory` para gerar resumos automáticos em `memory/YYYY-MM-DD.md`. Esses são acessados via `memory_search`.

**Opção C — Robusta:** Instalar Honcho plugin. Injeta contexto automaticamente via `before_prompt_build` sem depender do modelo ler um arquivo.

**Opção D — Técnica:** Criar Context Engine plugin customizado que lê SESSION-CONTEXT.md e injeta como `systemPromptAddition` em todo run.

---

## 14. Plano de Implementação Recomendado

### Fase 1 — Hoje (sem instalar nada)
```bash
# 1. Habilitar hooks bundled
openclaw hooks enable session-memory
openclaw hooks enable bootstrap-extra-files

# 2. Verificar status
openclaw hooks list
openclaw memory status
```

Adicionar ao `~/.openclaw/openclaw.json`:
```json5
{
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "session-memory": { "enabled": true },
        "bootstrap-extra-files": {
          "enabled": true,
          "paths": ["memory/SESSION-CONTEXT.md"]
        }
      }
    }
  }
}
```

**NOTA IMPORTANTE:** `bootstrap-extra-files` só aceita basenames reconhecidos. Se SESSION-CONTEXT.md não for aceito, a alternativa é criar um symlink:
```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace
cp SESSION-CONTEXT.md memory/MEMORY.md  # ou merge no MEMORY.md
```

### Fase 2 — Esta semana (melhorar search)
```bash
# Ativar busca vetorial local (download ~600MB)
# Adicionar ao openclaw.json:
# "agents.defaults.memorySearch.provider": "local"
```

Ou com embedding via API (mais preciso):
```json5
{
  "agents": {
    "defaults": {
      "memorySearch": {
        "provider": "openai"
      }
    }
  }
}
```

### Fase 3 — Futuro (se quiser memória cross-session real)
```bash
# Instalar Honcho (requer Postgres)
openclaw plugins install @honcho-ai/openclaw-honcho
openclaw honcho setup
```

Ou usar QMD para indexar sessões:
```bash
bun install -g https://github.com/tobi/qmd
# Configurar memory.backend = "qmd" no openclaw.json
```

---

## 15. Comparativo Final

| Solução | Gratuito | Local | Integração OpenClaw | Complexidade | Recomendação |
|---------|----------|-------|---------------------|--------------|--------------|
| Builtin Memory (já ativo) | ✅ | ✅ | ✅ Nativa | Baixa | ✅ Usar já |
| Session-memory hook | ✅ | ✅ | ✅ Nativa | Baixa | ✅ Ativar agora |
| bootstrap-extra-files hook | ✅ | ✅ | ✅ Nativa | Baixa | ✅ Ativar agora |
| MEMORY.md (mover SESSION-CONTEXT) | ✅ | ✅ | ✅ Nativa | Baixíssima | ✅✅ Fazer agora |
| QMD Engine | ✅ | ✅ | ✅ Nativa | Média | 👍 Recomendado |
| Honcho Plugin | ✅ self-hosted | ✅ | ✅ Nativa | Alta (Postgres) | 👍 Se quiser cross-session real |
| mem0 | ✅ self-hosted | ✅ | ❌ Manual | Média | ⚠️ Só se sair do OpenClaw |
| Letta/MemGPT | ✅ self-hosted | ✅ | ❌ Substituição | Alta | ❌ Não vale |
| Zep/Graphiti | ✅ self-hosted | ✅ | ❌ Manual | Alta (Neo4j) | ❌ Overkill |
| Khoj | ✅ | ✅ | ❌ Substituição | Alta | ❌ Não vale |

---

## 16. Descoberta Crítica sobre SESSION-CONTEXT.md

Olhando o AGENTS.md atual, temos:
```
Na PRIMEIRA mensagem de QUALQUER sessão nova, ANTES de responder:
read SESSION-CONTEXT.md
```

O OpenClaw INJETA o AGENTS.md automaticamente. O modelo VÊ essa instrução. O problema é que às vezes (especialmente em grupos/WhatsApp) o modelo faz a tarefa pedida sem executar o ritual completo de inicialização.

**Solução de engenharia mais robusta:** Ao invés de instruir o modelo a LER um arquivo, fazer o arquivo ser INJETADO automaticamente. Isso elimina o ponto de falha humano.

**Implementação:** O conteúdo dinâmico de SESSION-CONTEXT.md deveria ser gerado e colocado automaticamente no MEMORY.md (que é injetado). O hook `session-memory` já faz parte disso — ao usar `/new`, salva o contexto da sessão encerrada.

---

*Pesquisa realizada em 2026-03-30. Fontes: docs.openclaw.ai, github.com/mem0ai/mem0, github.com/letta-ai/letta, github.com/getzep/zep, github.com/getzep/graphiti, github.com/plastic-labs/honcho, github.com/khoj-ai/khoj*
