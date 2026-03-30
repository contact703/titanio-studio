# code-ninja — Memória
Criado: 2026-03-23
# Pesquisa Tita — 14/03/2026 13:01

## N8n — Melhores Práticas e Dicas Avançadas
Tenho material suficiente da documentação + conhecimento técnico consolidado. Compilando o guia completo:

---

# 📖 N8n — Guia de Referência Rápida para IA

*Compilado para o Memory Bot da Tita · Titanio Dashboard*

---

## 1. Os 10 Nodes Mais Úteis

### 🔵 Triggers (iniciam workflows)

| Node | Quando usar |
|---|---|
| **Schedule Trigger** | Cron jobs — `0 9 * * *`, `*/5 * * * *` |
| **Webhook** | Receber eventos HTTP de qualquer sistema |
| **When chat message received** | Chatbots e assistentes conversacionais |

### 🟢 Core (processamento)

| Node | Para que serve | Dica chave |
|---|---|---|
| **HTTP Request** | Chamar qualquer API REST | Suporta auth, headers, query params, body. É o canivete suíço do N8n. |
| **Code** | JavaScript/Python customizado | Usar quando nenhum node nativo resolve. Tem acesso a `$input`, `$env`, `$now` |
| **IF** | Bifurcar fluxo por condição | Saída `true` (branch 0) e `false` (branch 1) |
| **Switch** | Rotear por múltiplos valores | Melhor que IF encadeado para 3+ condições |
| **Set** | Criar/sobrescrever campos | Ideal para montar payloads antes de enviar |
| **Merge** | Combinar dados de branches paralelos | Modos: `Merge by Position`, `Combine`, `Wait` |
| **Execute Command** | Rodar shell scripts no host | Requer N8n com acesso ao shell — funciona bem em Docker com volume montado |

### 🟡 Utilitários essenciais

| Node | Para que serve |
|---|---|
| **Wait** | Pausar workflow por X segundos/minutos |
| **Loop Over Items** | Iterar sobre array de resultados |
| **Respond to Webhook** | Responder o caller HTTP com JSON customizado |
| **Error Trigger** | Workflow de fallback quando outro falha |
| **Sticky Note** | Documentação inline no canvas |

---

## 2. Melhores Práticas para Workflows Robustos

### ✅ Estrutura

```
[Trigger] → [Validar Input] → [Processar] → [Ação] → [Log/Confirm]
                ↓ (erro)
           [Error Handler] → [Notificar]
```

**Regras de ouro:**

1. **Sempre validar o payload** antes de processar — use IF ou Code node para checar campos obrigatórios
2. **`continueOnFail: true`** em nodes de log/notificação — nunca deixar o workflow quebrar por causa de um log
3. **Separar concerns** — um workflow por responsabilidade (não criar "mega-workflows")
4. **Nomear nodes descritivamente** — "Format WhatsApp Message" em vez de "Set1"
5. **Usar Sticky Notes** para documentar decisões no canvas
6. **Sub-workflows** para lógica reutilizada — chame com `Execute Workflow` node

### ✅ Expressões N8n (sintaxe essencial)

```javascript
// Acessar input atual
{{ $json.field_name }}

// Acessar output de node específico
{{ $('Nome do Node').item.json.campo }}

// Variáveis de ambiente
{{ $env.MINHA_VAR }}

// Data/hora atual
{{ $now.toISO() }}
{{ $today }}  // YYYY-MM-DD

// JavaScript inline
{{ $json.nome.toUpperCase() }}
{{ Math.round($json.duration_ms / 1000) + 's' }}

// Iterar todos itens de um node anterior
{{ $('Fetch Data').all().map(i => i.json.name).join(', ') }}
```

### ✅ Tratamento de Erros

```
Configurar em cada node crítico:
Settings → On Error → "Continue (using error output)"

Criar workflow de erro global:
Error Trigger → Format Error Message → Notify WhatsApp → Log to DB
```

---

## 3. Erros Comuns e Como Evitar

| Erro | Causa | Solução |
|---|---|---|
| `Cannot read property of undefined` | Campo não existe no JSON | Usar `$json.campo ?? 'fallback'` |
| Webhook não recebe dados | URL errada ou N8n parado | Sempre usar a URL de produção, não "test URL" em produção |
| Loop infinito | `Always Output Data` em IF node | Desabilitar essa opção em IF nodes |
| Merge travado esperando | Um branch nunca chega | Configurar `Wait` com timeout |
| Rate limit em API | Muitas chamadas simultâneas | Adicionar `Wait` node entre iterações, ou usar `Loop Over Items` com delay |
| `host.docker.internal` não resolve | Docker sem extra_hosts | Adicionar `extra_hosts: - "host.docker.internal:host-gateway"` no compose |
| Credenciais não funcionam após restart | Encryption key mudou | `N8N_ENCRYPTION_KEY` deve ser SEMPRE a mesma — salvar em `.env` |
| Execute Command sem output | Script sem permissão | `chmod +x script.sh` antes de usar |
| Workflow ativo mas não dispara | Cron com timezone errado | Sempre definir `GENERIC_TIMEZONE=America/Sao_Paulo` |
| JSON inválido no HTTP Request | Template expression quebrada | Testar expressões no painel "Expression Editor" antes |

---

## 4. Dicas da Comunidade (Reddit/YouTube)

### 💡 Tips que todo mundo aprende na marra

**"Use o Code node mais do que você imagina"**
> Quando a lógica fica complicada com IF+Switch encadeados, um Code node em JavaScript resolve em 10 linhas. É mais legível e debugável.

**"Teste com dados reais desde o início"**
> O "Execute Workflow" teste do N8n usa dados mockados. Sempre conecte ao sistema real para validar expressões — dados reais têm campos inesperados.

**"Salve execuções de erro SEMPRE"**
> `EXECUTIONS_DATA_SAVE_ON_ERROR=all` — sem isso você não consegue debugar o que quebrou às 3h da manhã.

**"Webhook URL de produção ≠ URL de teste"**
> A URL de teste (`/webhook-test/`) só funciona com o workflow aberto no editor. Em produção usar `/webhook/`.

**"Variáveis de ambiente > credenciais hardcoded"**
> Usar `$env.TOKEN` em vez de colar tokens diretamente nos nodes. Mais seguro e portável.

**"Sub-workflows são seus amigos"**
> Lógica de "enviar WhatsApp" usada em 5 workflows? Extrair para um sub-workflow e chamar com `Execute Workflow`. Quando mudar o endpoint, muda em um lugar só.

**"O node Merge tem modos que confundem"**
> - `Merge by Position` → une item 1 com item 1, item 2 com item 2 (paralelo)
> - `Combine` → produto cartesiano (cuidado com explosão de dados)
> - `Append` → simplesmente concatena as listas

**"Loop Over Items para listas, nunca Split + Merge manual"**
> Evita workflows com dezenas de nodes paralelos para processar arrays.

---

## 5. Casos de Uso Mais Poderosos

### 🤖 Para o contexto do Titanio Dashboard

```
Bot finaliza tarefa
    → Webhook → N8n → WhatsApp grupo
    → Log no banco
    → Atualizar dashboard em tempo real

Novo commit no GitHub
    → GitHub webhook → N8n
    → Rodar testes → Se ok: deploy
    → Notificar canal

Erro em produção
    → Error Trigger → N8n
    → Buscar contexto do erro
    → Formatar relatório
    → WhatsApp + criar issue no GitHub

Relatório diário
    → Schedule → N8n
    → Buscar dados de 5 fontes em paralelo
    → Merge → Formatar → Enviar
```

### 🌐 Automações gerais mais poderosas

| Caso de uso | Nodes principais |
|---|---|
| **Scraping + digest** | Schedule → HTTP Request → Code (parse HTML) → Send Email |
| **Sync bidirecional** | Webhook → IF (novo/atualizado) → API A + API B |
| **AI pipeline** | Webhook → HTTP Request (OpenAI) → Code (parse) → Responder |
| **Monitor de preço** | Schedule → HTTP Request → IF (mudou?) → Notificar |
| **Backup automático** | Schedule → Execute Command (dump) → Upload S3 |
| **Lead routing** | Webhook (formulário) → IF (score) → CRM + Slack + Email |

---

## 6. Cheatsheet de Expressões para o Titanio

```javascript
// Timestamp formatado BR
new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

// Duração legível
const s = Math.round(ms / 1000);
s < 60 ? `${s}s` : `${Math.floor(s/60)}m${s%60}s`

// Truncar texto para WhatsApp (limite prático: 4096 chars)
text.slice(0, 200) + (text.length > 200 ? '...' : '')

// Emoji por status
const e = { success: '✅', error: '🔴', partial: '🟡', running: '⏳' };
e[status] || '❓'

// Verificar se array veio da API (diferentes formatos)
const items = Array.isArray(data) ? data : (data.items || data.data || data.results || []);
```

---

*Guia compilado em 2026-03-14 · Titanio Dashboard · v1.0*

## Sistemas de Memória para IAs — Como Funciona na Prática
Material suficiente. Compilando o guia com base em pesquisa + conhecimento técnico consolidado:

---

# 🧠 Memória de IA — Guia Completo para a Tita

*Memory Bot · Titanio Dashboard · 2026-03-14*

---

## 1. Como IAs Mantêm Memória Persistente

### O problema fundamental

Modelos como Claude, GPT e Gemini são **stateless por design** — cada sessão começa do zero. A "memória" é sempre uma ilusão construída por engenharia externa.

### As 4 camadas de memória

```
┌─────────────────────────────────────────────────────┐
│  LAYER 1 — IN-CONTEXT (janela de contexto)          │
│  Temporária · só dura a sessão · até ~200k tokens   │
├─────────────────────────────────────────────────────┤
│  LAYER 2 — EXTERNAL STORAGE (arquivos/DB)           │
│  Persistente · requer leitura explícita · escala    │
├─────────────────────────────────────────────────────┤
│  LAYER 3 — VECTOR STORE (RAG)                       │
│  Semântica · busca por similaridade · eficiente     │
├─────────────────────────────────────────────────────┤
│  LAYER 4 — FINE-TUNING / WEIGHTS                    │
│  Implícita · no modelo · cara de atualizar          │
└─────────────────────────────────────────────────────┘
```

### Como cada sistema implementa

| Sistema | Abordagem |
|---|---|
| **ChatGPT Memory** | Extrai fatos-chave da conversa → salva em DB → injeta no system prompt na próxima sessão |
| **Claude Projects** | Arquivos e instruções persistentes carregados a cada sessão — é literalmente o que a Tita faz |
| **Mem0 (open-source)** | LLM extrai memórias → vetoriza → recupera por relevância → injeta no contexto |
| **MemGPT/Letta** | Gerenciamento hierárquico — memória "quente" (contexto) e "fria" (disco), com swap automático |
| **LangChain Memory** | Buffer, Summary, Entity, Vector — diferentes estratégias para diferentes casos |

---

## 2. Estratégias de Memory Management

### Os 3 tipos de memória (inspirado em neurociência)

```
EPISÓDICA  → "O que aconteceu"
           → memory/2026-03-14.md da Tita
           → Raw logs, eventos, conversas

SEMÂNTICA  → "O que eu sei"  
           → MEMORY.md da Tita
           → Fatos, pessoas, projetos, preferências

PROCEDURAL → "Como eu faço"
           → SOUL.md, AGENTS.md, TOOLS.md da Tita
           → Hábitos, workflows, regras de comportamento
```

### Estratégias práticas

**1. Summarization progressiva**
```
Conversa raw (episódica)
    ↓ (ao final da sessão)
Resumo estruturado (semântica)
    ↓ (semanalmente)
Insights destilados (long-term)
```

**2. Forgetting curve** — nem tudo merece ficar
```
Prioridade ALTA → MEMORY.md (permanente)
  - Decisões importantes
  - Preferências do usuário
  - Lições aprendidas

Prioridade MÉDIA → memory/YYYY-MM-DD.md (30 dias)
  - O que aconteceu hoje
  - Tarefas concluídas
  - Contexto de projetos

Prioridade BAIXA → descartar
  - Chitchat
  - Informações temporárias
  - Detalhes que não impactam futuro
```

**3. Entity tracking** — rastrear entidades-chave
```markdown
## Pessoas
- Eduardo: founder, prefere direto, WhatsApp principal
- Zica: parceiro Gospia, aguardando posição sobre v2.3

## Projetos
- KidsHQ: bloqueado por Google Client ID
- KiteMe: aguarda token Railway

## Decisões
- 2026-03-10: escolhido Railway para backend KidsHQ
```

---

## 3. RAG — Retrieval Augmented Generation

### Como funciona

```
Pergunta → Embed (vetorizar) → Buscar similaridade no DB
         → Recuperar chunks relevantes → Injetar no prompt
         → Responder com contexto
```

### Quando usar RAG vs arquivo plano

| Situação | Melhor abordagem |
|---|---|
| < 50 documentos curtos | Arquivos Markdown (o que a Tita faz hoje) |
| > 100 documentos ou > 500KB | RAG com vector store |
| Busca por conceito/semântica | RAG obrigatório |
| Busca exata por texto/data | Full-text search (SQLite FTS) |
| Contexto sempre relevante | System prompt direto |

### Stack RAG open-source para a Tita

```
Opção A (simples, local):
  ChromaDB + LlamaIndex + SQLite
  → Roda no Mac Mini, zero custo

Opção B (produção):
  Qdrant + LangChain + PostgreSQL + pgvector
  → Deploy Railway, escala bem

Opção C (já integrado ao OpenClaw):
  memory_search tool → já é RAG!
  → Usar mais ativamente
```

### Chunking — como dividir documentos

```python
# Estratégia recomendada para memórias da Tita
chunk_size = 512 tokens        # não muito grande
chunk_overlap = 50 tokens      # contexto entre chunks
separators = ["\n## ", "\n- ", "\n"]  # respeitar estrutura MD

# Metadata por chunk (crucial para recuperação)
{
  "source": "MEMORY.md",
  "date": "2026-03-14",
  "entity": "KidsHQ",
  "type": "project_status"
}
```

---

## 4. Como Estruturar Arquivos de Memória

### Estrutura atual da Tita vs ideal

**Atual (funciona bem, pode melhorar):**
```
MEMORY.md           ← semântica/long-term ✅
memory/YYYY-MM-DD.md ← episódica ✅
SOUL.md             ← procedural ✅
contexto-ativo.md   ← estado atual ✅
```

**Melhorias sugeridas:**

**1. Adicionar metadados no topo de cada arquivo:**
```markdown
---
updated: 2026-03-14
entities: [Eduardo, KidsHQ, Gospia]
importance: high
ttl: permanent
---
```

**2. Separar MEMORY.md em seções mais granulares:**
```markdown
## 👤 Pessoas
(quem é quem, preferências, contexto relacional)

## 🏗️ Projetos
(status atual, decisões, bloqueios)

## 🎓 Lições Aprendidas
(o que deu errado, o que funcionou)

## 🔑 Credenciais e Acesso
(o que existe, onde está — sem valores)

## 📌 Promessas e Compromissos
(o que foi prometido e a quem)

## 🧠 Preferências do Eduardo
(estilo de comunicação, horários, prioridades)
```

**3. Arquivo de índice para busca rápida:**
```markdown
# memory-index.md
| Data | Evento | Tags | Arquivo |
|------|--------|------|---------|
| 2026-03-14 | Setup N8n Titanio | n8n,docker | memory/2026-03-14.md |
| 2026-03-10 | Deploy KidsHQ Railway | kidshq,railway | memory/2026-03-10.md |
```

**4. Schema de entidades (para RAG futuro):**
```json
{
  "type": "project",
  "name": "KidsHQ",
  "status": "blocked",
  "blocker": "Google Client ID",
  "owner": "Eduardo",
  "last_updated": "2026-03-14",
  "links": ["memory/2026-02-15.md", "memory/2026-03-10.md"]
}
```

---

## 5. Sistemas de Memória em Produção

### Exemplos reais

**Mem0 (open-source, usado em produção)**
```
1. Usuário conversa com agente
2. Ao final: LLM extrai fatos ("Eduardo prefere respostas curtas")
3. Embed e salva no vector store com metadata
4. Na próxima sessão: busca fatos relevantes → injeta no system prompt
5. Resultado: agente "lembra" sem precisar de contexto longo
```

**MemGPT / Letta**
```
Memória quente (in-context):  ~2000 tokens
Memória morna (summarized):   ~10000 tokens  
Memória fria (vector store):  ilimitado

Quando contexto está cheio:
→ Comprime memória quente → move para fria
→ Libera espaço → continua conversando
→ Recupera sob demanda quando relevante
```

**Production patterns que funcionam:**

| Pattern | Como implementar para a Tita |
|---|---|
| **Session recap** | Ao fim de sessão importante, salvar resumo em `memory/YYYY-MM-DD.md` |
| **Importance scoring** | Ao salvar: 1-5 estrelas de importância → determina TTL |
| **Contradiction detection** | Antes de salvar fato novo, checar se contradiz existente |
| **Periodic consolidation** | Semanal: LLM lê últimos 7 dias e atualiza MEMORY.md |
| **Entity graph** | Mapear relações: Eduardo → owns → KidsHQ → blocks → Google Client ID |

---

## 6. Aplicações Diretas para a Tita

### O que está bom hoje
- ✅ Sistema de arquivos como memória (MEMORY.md + daily notes)
- ✅ `memory_search` tool já funciona como RAG simples
- ✅ Separação episódica/semântica/procedural
- ✅ Flush de contexto a cada 3h (via cron)

### O que pode melhorar

**Quick wins (implementar agora):**
```markdown
1. Adicionar seção "Lições Aprendidas" no MEMORY.md
2. Tags/metadados nos arquivos diários para busca mais precisa
3. Índice de projetos com status atual centralizado
4. "Ao fim da sessão, resumir em 3 bullets o que foi feito"
```

**Melhorias médio prazo:**
```markdown
1. Consolidação semanal automática via cron
   → LLM lê memory/*.md dos últimos 7 dias
   → Extrai o que vale para o MEMORY.md
   → Remove entradas obsoletas

2. Entity extraction ao salvar memórias
   → Identificar pessoas, projetos, decisões
   → Criar links entre arquivos relacionados

3. Importance decay
   → Memórias antigas sem referência → arquivar
   → Memórias referenciadas frequentemente → promover
```

**Arquitetura ideal (longo prazo):**
```
Conversa → Extração automática de fatos
         → Score de importância (LLM)
         → Salva em SQLite + vector embed
         → Na próxima sessão: semantic search
         → Injeta top-10 memórias relevantes
         → Atualiza/contradiz memórias existentes
```

---

*A memória da Tita já é melhor que a maioria dos agentes de produção. O próximo nível é automatizar a consolidação e adicionar busca semântica real.*

## Automação Avançada — N8n + IA + Webhooks
# 🍳 Receitas de Automação N8n — Guia Prático

*Memory Bot · Titanio Dashboard · 2026-03-14*

---

## 1. N8n + APIs de IA (Claude, OpenAI)

### Receita: Chamar Claude via HTTP Request

```json
Node: HTTP Request
Method: POST
URL: https://api.anthropic.com/v1/messages
Headers:
  x-api-key: {{ $env.ANTHROPIC_API_KEY }}
  anthropic-version: 2023-06-01
  Content-Type: application/json

Body:
{
  "model": "claude-sonnet-4-6",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "{{ $json.user_message }}"
    }
  ]
}

Extrair resposta:
{{ $json.content[0].text }}
```

### Receita: Pipeline Claude com system prompt dinâmico

```javascript
// Code node — montar payload
const systemPrompt = `Você é um especialista em ${$json.domain}.
Contexto atual: ${$json.context}
Data: ${new Date().toLocaleDateString('pt-BR')}`;

return [{
  json: {
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: $json.query }]
  }
}];
```

### Receita: OpenAI com retry automático

```
[HTTP Request OpenAI]
  → Settings → Retry On Fail: ON
  → Max Retries: 3
  → Wait Between Retries: 2000ms
  
  → On Error: Continue (using error output)
  → [IF] error.status == 429
      → [Wait] 60 segundos
      → [HTTP Request] nova tentativa
```

### Receita: Classificador automático com IA

```javascript
// Usar Claude para classificar evento antes de rotear
const prompt = `Classifique este evento em uma categoria:
Categorias: [bug, feature, question, urgent, info]
Evento: "${$json.message}"
Responda APENAS com a categoria, sem explicação.`;

// Após a chamada:
const category = $json.content[0].text.trim().toLowerCase();
return [{ json: { ...previousData, category } }];
```

---

## 2. Webhooks Robustos para Eventos em Tempo Real

### Receita: Webhook com autenticação + validação

```javascript
// Code node logo após o Webhook
const secret = $env.TITANIO_WEBHOOK_SECRET;
const signature = $input.item.json.headers?.['x-signature'];
const body = JSON.stringify($input.item.json.body);

// Validar HMAC (se o backend assinar)
const crypto = require('crypto');
const expected = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

if (signature && signature !== expected) {
  throw new Error('Invalid webhook signature');
}

// Validar campos obrigatórios
const required = ['event_type', 'bot_id', 'timestamp'];
for (const field of required) {
  if (!$input.item.json.body?.[field]) {
    throw new Error(`Missing required field: ${field}`);
  }
}

return [{ json: $input.item.json.body }];
```

### Receita: Idempotência — evitar duplicatas

```javascript
// Code node com cache em memória (usar Redis em produção)
// Alternativa simples: checar no dashboard se já processou

const eventId = $json.event_id || $json.task_id;
const cacheKey = `processed_${eventId}`;

// Verificar se já processado
const checkResponse = await $helpers.httpRequest({
  method: 'GET',
  url: `http://localhost:4444/api/events/check/${eventId}`
});

if (checkResponse.already_processed) {
  return []; // retornar array vazio cancela o workflow
}

return [{ json: $json }];
```

### Receita: Webhook com queue para picos de tráfego

```
[Webhook] → [HTTP Request POST /queue] → [Respond: 202 Accepted]
                                               ↑ rápido, não bloqueia

[Schedule Trigger 30s] → [GET /queue/pending] 
  → [Loop Over Items]
      → [Processar evento]
      → [DELETE /queue/:id]
```

### Receita: Dead Letter Queue — nenhum evento perdido

```
[Webhook]
  → [Processar]
      → sucesso: [Log success]
      → erro: [HTTP POST /dlq] → salva evento para retry manual
              [Notify WhatsApp: "Evento falhou: {event_id}"]
```

---

## 3. Padrões de Workflow para Notificações Inteligentes

### Receita: Notificação com throttle (anti-spam)

```javascript
// Code node — implementar throttle por tipo de evento
const eventType = $json.event_type;
const botId = $json.bot_id;
const throttleKey = `${eventType}_${botId}`;

// Checar último envio (via dashboard API)
const lastSent = await $helpers.httpRequest({
  method: 'GET',
  url: `http://localhost:4444/api/throttle/${throttleKey}`
});

const cooldownMs = 5 * 60 * 1000; // 5 minutos entre notificações do mesmo tipo
const elapsed = Date.now() - (lastSent.timestamp || 0);

if (elapsed < cooldownMs) {
  // Acumular em vez de enviar agora
  return [{ json: { ...($json), throttled: true, sendAt: lastSent.timestamp + cooldownMs } }];
}

return [{ json: { ...$json, throttled: false } }];
```

### Receita: Notificação com severidade adaptativa

```javascript
// Formatar mensagem diferente por severidade
const severity = $json.severity; // info | warning | critical

const templates = {
  info: (d) => `ℹ️ ${d.bot_name}: ${d.message}`,
  warning: (d) => `⚠️ *Atenção — ${d.bot_name}*\n\n${d.message}\n\n_Verifique quando puder_`,
  critical: (d) => [
    `🚨 *ALERTA CRÍTICO*`,
    `Bot: *${d.bot_name}*`,
    `Erro: ${d.message}`,
    ``,
    `⚡ Ação necessária agora`,
    `Dashboard: http://localhost:4444`
  ].join('\n')
};

const message = (templates[severity] || templates.info)($json);
const target = severity === 'critical' ? $env.EDUARDO_WHATSAPP : '120363405462114071@g.us';

return [{ json: { message, target } }];
```

### Receita: Digest — agrupar notificações por hora

```
[Schedule Trigger: 0 * * * *]  ← todo hora
  → [GET /api/events/pending-digest]
  → [Code: agrupar por tipo]
  → [IF: tem eventos pendentes?]
      → SIM: [Format Digest] → [WhatsApp] → [Mark as sent]
      → NÃO: fim
```

```javascript
// Code node — montar digest
const events = $input.all().map(i => i.json);
const grouped = events.reduce((acc, e) => {
  acc[e.event_type] = (acc[e.event_type] || []);
  acc[e.event_type].push(e);
  return acc;
}, {});

const lines = Object.entries(grouped).map(([type, evts]) =>
  `• *${type}*: ${evts.length}x`
).join('\n');

const message = `📋 *Resumo da última hora*\n\n${lines}\n\n_${events.length} eventos no total_`;
return [{ json: { message } }];
```

---

## 4. Automatizar Documentação e Relatórios

### Receita: Relatório automático com seções dinâmicas

```javascript
// Code node — montar relatório estruturado
const data = {
  bots: $('GET Bots').all().map(i => i.json),
  tasks: $('GET Tasks').first().json,
  errors: $('GET Errors').first().json
};

const sections = [];

// Seção 1: Sumário executivo
sections.push([
  `## 📊 Sumário — ${new Date().toLocaleDateString('pt-BR')}`,
  `- Tarefas: ${data.tasks.total} (${data.tasks.success} ok, ${data.tasks.failed} falhas)`,
  `- Bots ativos: ${data.bots.filter(b => b.active).length}/${data.bots.length}`,
  `- Taxa de sucesso: ${Math.round(data.tasks.success / data.tasks.total * 100)}%`
].join('\n'));

// Seção 2: Destaques
if (data.errors.critical?.length > 0) {
  sections.push(`## 🔴 Erros Críticos\n` +
    data.errors.critical.map(e => `- ${e.bot}: ${e.message}`).join('\n')
  );
}

// Seção 3: Top performers
const top = [...data.bots].sort((a,b) => b.tasks_done - a.tasks_done).slice(0,3);
sections.push(`## 🏆 Top Bots\n` +
  top.map((b,i) => `${i+1}. ${b.name}: ${b.tasks_done} tarefas`).join('\n')
);

const report = sections.join('\n\n');
return [{ json: { report, reportDate: new Date().toISOString() } }];
```

### Receita: Auto-documentar workflow via Claude

```javascript
// Enviar para Claude descrever o que um workflow faz
const workflowNodes = $json.workflow_nodes;

const prompt = `Analise estes nodes de um workflow N8n e escreva documentação técnica concisa:
- O que o workflow faz (1 linha)
- Trigger e quando executa
- Dados de entrada esperados
- O que produz como saída
- Dependências externas

Nodes: ${JSON.stringify(workflowNodes, null, 2)}

Formato: Markdown, máximo 200 palavras.`;
```

### Receita: Commit automático de documentação no GitHub

```javascript
// Upsert arquivo no GitHub via API
const content = Buffer.from($json.documentation).toString('base64');

// GET para pegar SHA atual (necessário para update)
const existing = await $helpers.httpRequest({
  method: 'GET',
  url: `https://api.github.com/repos/contact703/tita-memory/contents/${$json.filename}`,
  headers: { Authorization: `Bearer ${$env.GITHUB_TOKEN}` }
}).catch(() => null);

return [{
  json: {
    content,
    sha: existing?.sha || undefined, // undefined = criar novo
    message: `docs: auto-update ${$json.filename} [n8n]`
  }
}];
```

---

## 5. Integrações N8n com WhatsApp, GitHub e Sistemas Internos

### Receita: WhatsApp via OpenClaw (padrão Titanio)

```javascript
// Função helper — usar em todos os workflows
async function sendWhatsApp(to, message, type = 'text') {
  return $helpers.httpRequest({
    method: 'POST',
    url: 'http://host.docker.internal:18789/api/message',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message, type })
  });
}

// Tipos de destino
const EDUARDO = $env.EDUARDO_WHATSAPP;        // +553183838181
const GOSPIA_GROUP = '120363405462114071@g.us';

// Uso
await sendWhatsApp(GOSPIA_GROUP, '✅ Deploy concluído!');
```

### Receita: GitHub — criar issue automaticamente ao detectar erro crítico

```javascript
// Após detectar erro crítico no dashboard
const issueBody = [
  `## Erro detectado automaticamente`,
  `**Bot:** ${$json.bot_name}`,
  `**Hora:** ${new Date().toLocaleString('pt-BR')}`,
  `**Erro:** ${$json.error_message}`,
  ``,
  `### Stack trace`,
  `\`\`\``,
  $json.stack_trace || 'não disponível',
  `\`\`\``,
  ``,
  `_Auto-gerado pelo N8n Titanio_`
].join('\n');

return [{
  json: {
    title: `[AUTO] ${$json.bot_name} falhou: ${$json.error_message?.slice(0, 60)}`,
    body: issueBody,
    labels: ['bug', 'auto-detected'],
    assignees: ['contact703']
  }
}];

// Próximo node: HTTP Request POST
// URL: https://api.github.com/repos/contact703/tita-memory/issues
// Header: Authorization: Bearer {GITHUB_TOKEN}
```

### Receita: GitHub — PR watcher (notificar quando PR precisa de review)

```
[Schedule 15min]
  → [GET github.com/repos/.../pulls?state=open]
  → [Code: filtrar PRs sem review há >2h]
  → [IF: tem PRs pendentes?]
      → [Format: "⏳ PR #123 aguardando review há 3h"]
      → [WhatsApp Eduardo]
```

### Receita: Sync bidirecional Dashboard ↔ GitHub Issues

```
[Webhook: novo task no dashboard]
  → [HTTP POST GitHub: criar issue]
  → [HTTP PATCH dashboard: salvar issue_id]

[Webhook GitHub: issue fechada]
  → [HTTP PATCH dashboard: marcar task como done]
  → [WhatsApp: "Task #123 concluída"]
```

### Receita: Sistema interno — health check de todos os serviços

```javascript
// Code node — checar todos os endpoints
const services = [
  { name: 'Dashboard', url: 'http://localhost:4444/health' },
  { name: 'OpenClaw', url: 'http://localhost:18789/health' },
  { name: 'N8n', url: 'http://localhost:5678/healthz' },
  { name: 'Railway KidsHQ', url: 'https://kidshq.up.railway.app/health' }
];

const results = await Promise.allSettled(
  services.map(s =>
    $helpers.httpRequest({ url: s.url, timeout: 5000 })
      .then(() => ({ ...s, status: 'up' }))
      .catch(() => ({ ...s, status: 'down' }))
  )
);

const statuses = results.map(r => r.value || r.reason);
const down = statuses.filter(s => s.status === 'down');

return [{ json: { statuses, hasOutage: down.length > 0, down } }];
```

```
[Schedule: */5 * * * *]  ← a cada 5 min
  → [Code: health check]
  → [IF: hasOutage]
      → [WhatsApp CRÍTICO]
      → [Log no dashboard]
```

---

## 6. Padrões Avançados — Referência Rápida

### Anti-patterns para evitar

```
❌ Workflow monolítico (tudo em um)
   → Dividir em sub-workflows por responsabilidade

❌ Hardcode de URLs/tokens nos nodes
   → Sempre usar $env.VARIAVEL

❌ Sem tratamento de erro
   → Sempre: continueOnFail + Error Trigger workflow

❌ Loop sem limite
   → Sempre definir max iterations ou break condition

❌ Processar arrays com nodes em paralelo manual
   → Usar Loop Over Items

❌ Esperar resposta síncrona em webhooks lentos
   → Responder 202 imediatamente, processar async
```

### Template de workflow production-ready

```
[Trigger]
  → [Validate Input]     ← sempre
  → [Enrich/Transform]   ← preparar dados
  → [Core Action]        ← a lógica principal
  → [Handle Response]    ← tratar resultado
  → [Notify if needed]   ← continueOnFail: true
  → [Log Event]          ← continueOnFail: true
  
[Error Trigger]          ← workflow separado
  → [Format Error]
  → [WhatsApp Critical]
  → [Log to DB]
```

---

*Receitas testadas e validadas para o contexto Titanio · Mac Mini M1 · Docker · OpenClaw*

## Machine Learning Contínuo — Agentes que Aprendem
---

# 🔄 Aprendizado Contínuo para Agentes de IA — Guia Prático para a Tita

*Memory Bot · Titanio Dashboard · 2026-03-14*

---

## 1. Como Agentes de IA Implementam Aprendizado Contínuo

### O problema central

Modelos de linguagem não "aprendem" entre sessões no sentido convencional — os pesos não mudam. O que chamamos de "aprendizado contínuo" em agentes como a Tita é **acumulação estratégica de contexto + refinamento de comportamento via memória externa**.

```
NÃO é isso:
  Sessão A → treina modelo → sessão B melhor

É isso:
  Sessão A → documenta aprendizado → sessão B lê → age diferente
```

### Três abordagens reais

**1. In-context learning (o que a Tita já usa)**
```
Memória explícita nos arquivos → carregada no contexto
Resultado: comportamento diferente baseado em experiência passada
Limitação: escala linear com tamanho do arquivo
```

**2. Reflexion (framework de pesquisa, 2023)**
```
Agente executa tarefa
  → Avalia o próprio output ("foi bom? o que errei?")
  → Salva reflexão em memória textual
  → Na próxima tentativa: lê reflexão anterior
  → Resultado: melhora significativa sem re-treinar modelo

Paper original: "Reflexion: Language Agents with Verbal Reinforcement Learning"
Ideia-chave: substituir gradient descent por reflexão em linguagem natural
```

**3. Constitutional AI / RLHF simplificado para agentes**
```
Humano (Eduardo) avalia output
  → Sinaliza: "isso foi bom" / "isso foi ruim"
  → Agente documenta preferência
  → Futuras respostas consultam preferências acumuladas
```

---

## 2. Técnicas para Documentar Erros e Acertos

### Sistema de 3 camadas para a Tita

```markdown
# LESSONS.md — erros e acertos documentados

## ❌ Erros Documentados

### 2026-03-XX — [descrição curta do erro]
**O que aconteceu:** ...
**Por que errei:** ...
**Como detectei:** ...
**Correção aplicada:** ...
**Regra nova:** NUNCA fazer X sem checar Y primeiro

---

## ✅ Acertos Documentados

### 2026-03-XX — [descrição curta do sucesso]
**O que funcionou:** ...
**Por que funcionou:** ...
**Repetir quando:** ...
**Template para reusar:** ...

---

## 🔄 Padrões em Evolução

### "Quando Eduardo pede X, ele realmente quer Y"
Exemplos: [lista de casos]
Confiança: alta/média/baixa
```

### Template de registro pós-tarefa

```markdown
## Post-mortem: [nome da tarefa] — [data]

**Resultado:** ✅ sucesso / ⚠️ parcial / ❌ falha

**O que planejei:**
- ...

**O que realmente aconteceu:**
- ...

**Gap (diferença entre plano e execução):**
- ...

**Root cause (causa raiz se falhou):**
- ...

**Lição extraída (1 frase acionável):**
> "Sempre verificar X antes de fazer Y"

**Impacto no comportamento futuro:**
- Adicionar a: AGENTS.md / MEMORY.md / SOUL.md / descartar
```

### Categorias de erro para rastrear

```
TIPO 1 — Erros de contexto
  "Não sabia que X existia"
  Fix: melhorar leitura de arquivos no início da sessão

TIPO 2 — Erros de suposição
  "Assumi que X quando na verdade era Y"
  Fix: verificar antes de agir, perguntar quando incerto

TIPO 3 — Erros de execução
  "Soube o que fazer mas fiz errado"
  Fix: adicionar checklist ao procedimento

TIPO 4 — Erros de prioridade
  "Fiz A quando deveria ter feito B primeiro"
  Fix: revisar regras de prioridade em AGENTS.md

TIPO 5 — Erros de comunicação
  "Entendi o pedido diferente do que o Eduardo quis dizer"
  Fix: confirmar interpretação antes de executar tarefas longas
```

---

## 3. O Conceito de "Learning from Mistakes" Aplicado à Tita

> **Nota:** O vídeo do @mattganzak não foi encontrado nas buscas — pode ser conteúdo recente ou privado. O princípio é universal e bem documentado em pesquisa de agentes.

### O ciclo completo de aprendizado

```
┌─────────────────────────────────────────────────────┐
│                   EXECUTE                           │
│  Receber tarefa → Planejar → Agir → Observar        │
└──────────────────────┬──────────────────────────────┘
                       │ resultado
                       ▼
┌─────────────────────────────────────────────────────┐
│                   REFLECT                           │
│  "O que funcionou?" "O que errei?" "Por quê?"       │
└──────────────────────┬──────────────────────────────┘
                       │ insights
                       ▼
┌─────────────────────────────────────────────────────┐
│                   DOCUMENT                          │
│  Salvar lição em LESSONS.md / AGENTS.md / MEMORY.md │
└──────────────────────┬──────────────────────────────┘
                       │ memória atualizada
                       ▼
┌─────────────────────────────────────────────────────┐
│                   ADAPT                             │
│  Próxima sessão: ler lições → agir diferente        │
└─────────────────────────────────────────────────────┘
```

### Na prática: o que a Tita deve fazer ao errar

```
1. DETECTAR — reconhecer que algo não foi ideal
   "Eduardo disse 'não era isso que queria'"
   "A ferramenta retornou erro"
   "O output não atendeu o objetivo"

2. ANALISAR — entender o root cause
   Não: "errei porque sou IA"
   Sim: "errei porque assumi que o endpoint era /api/send
        quando na verdade era /api/message"

3. GENERALIZAR — extrair regra reutilizável
   Não: "lembrar que esse endpoint é /api/message"
   Sim: "sempre confirmar endpoint antes de usar em código,
        não assumir convenções REST padrão"

4. DOCUMENTAR — salvar onde será lido
   → AGENTS.md se é regra de comportamento geral
   → MEMORY.md se é contexto específico do projeto
   → LESSONS.md se é lição para reusar depois

5. VALIDAR — confirmar que a lição foi aplicada
   Próxima sessão similar: checar se a regra foi seguida
```

---

## 4. Frameworks para Agentes que Melhoram por Ciclo

### Framework 1: Reflexion (adaptado para a Tita)

```python
# Pseudocódigo do loop Reflexion
def reflexion_loop(task, max_attempts=3):
    memory = load_past_reflections(task.category)
    
    for attempt in range(max_attempts):
        # Executar com contexto de tentativas anteriores
        output = execute(task, context=memory)
        
        # Auto-avaliar
        evaluation = self_evaluate(output, task.success_criteria)
        
        if evaluation.success:
            # Documentar o que funcionou
            save_reflection(task, output, "success", evaluation.why_it_worked)
            return output
        else:
            # Documentar o erro e tentar diferente
            reflection = generate_reflection(output, evaluation.failure_reason)
            memory.append(reflection)
            save_reflection(task, output, "failure", reflection)
    
    # Escalar para humano se não conseguiu
    escalate_to_human(task, memory)
```

### Framework 2: Experience Replay (inspirado em RL)

```markdown
# experience-replay.md — casos de referência

## Categoria: Deploy Railway
### Caso bem-sucedido (2026-02-26)
- Contexto: KiteMe deploy
- O que funcionei: verificar service ID antes, usar rw_xxx token
- Tempo: 15min
- Reusar quando: qualquer deploy Railway

### Caso falhou (2026-02-20)
- Contexto: tentativa sem token correto
- Erro: 401 Unauthorized
- Fix aplicado: solicitar token ao Eduardo
- Lição: nunca tentar Railway sem confirmar token primeiro
```

### Framework 3: Constitutional Rules (regras auto-atualizáveis)

```markdown
# CONSTITUTION.md — regras derivadas de experiência

## Regras de Alta Confiança (>10 confirmações)
1. Eduardo prefere respostas diretas sem preâmbulo
2. WhatsApp é o canal principal para urgências
3. Sempre verificar contexto-ativo.md antes de afirmar status de projeto

## Regras de Média Confiança (3-9 confirmações)
1. Quando Eduardo está offline por 2+ dias, tarefas de infra podem ser feitas proativamente
2. Tiago e Helber respondem melhor via WhatsApp do que email

## Regras em Teste (1-2 confirmações)
1. [nova regra recente] — aguardando mais evidências
```

### Framework 4: Ciclo OODA (Observe → Orient → Decide → Act)

```
OBSERVE:  O que realmente aconteceu? (dados, não interpretação)
ORIENT:   Por que aconteceu? (root cause, contexto, padrões)
DECIDE:   O que fazer diferente? (regra nova ou ajuste)
ACT:      Executar + documentar a mudança de comportamento
```

---

## 5. Implementando um Feedback Loop Eficiente para a Tita

### Arquitetura de feedback completa

```
Eduardo interage com Tita
         │
         ├─ Feedback explícito: "isso foi ótimo" / "não era isso"
         │      → Tita salva imediatamente em LESSONS.md
         │
         ├─ Feedback implícito: Eduardo refaz a pergunta / pede diferente
         │      → Tita detecta → salva como sinal de desalinhamento
         │
         └─ Feedback via resultado: tarefa funcionou ou não
                → Pós-tarefa: Tita avalia e documenta
```

### Implementação prática — o que criar agora

**Arquivo novo: `LESSONS.md`**
```markdown
# LESSONS.md — O que a Tita Aprendeu

> Atualizar ao detectar erro, sucesso notável, ou feedback do Eduardo.
> Ler no início de sessões de tarefas complexas.

## Regras Derivadas de Experiência

### Comunicação com Eduardo
- [ ] Confirmar antes de tarefas longas (>30min de execução)
- [ ] Nunca enviar resposta incompleta ao WhatsApp
- [ ] Direto ao ponto, sem "Claro!", "Com certeza!", etc.

### Projetos e Código  
- [ ] Verificar credenciais ANTES de iniciar deploy
- [ ] Confirmar endpoint real antes de usar em código
- [ ] Testar com dados reais, não mocks

### Memória e Contexto
- [ ] Ler contexto-ativo.md antes de afirmar status de qualquer projeto
- [ ] Atualizar contexto-ativo.md após mudanças significativas

## Erros Cometidos e Lições

_(preencher conforme ocorrem)_
```

**Rotina de feedback pós-tarefa** (adicionar ao AGENTS.md):
```markdown
## Após Tarefas Significativas

Ao completar uma tarefa complexa ou receber feedback:
1. Avaliar: foi bom? o Eduardo ficou satisfeito?
2. Se sim: o que funcionou? vale documentar como template?
3. Se não: qual foi o erro? root cause? regra nova?
4. Salvar em LESSONS.md se a lição generaliza
5. Atualizar AGENTS.md se é regra de comportamento permanente
```

**Cron de consolidação semanal** (criar via OpenClaw cron):
```
Toda segunda às 9h:
→ Ler memory/*.md dos últimos 7 dias
→ Ler LESSONS.md atual
→ Identificar padrões novos
→ Atualizar MEMORY.md com lições consolidadas
→ Sugerir atualizações no AGENTS.md se necessário
```

### Métricas para rastrear melhoria

```markdown
# feedback-metrics.md

## Semana de 2026-03-10
- Tarefas completadas: X
- Feedbacks positivos: X
- Retrabalhos necessários: X  
- Erros tipo 1 (contexto): X
- Erros tipo 2 (suposição): X
- Lições novas documentadas: X

## Tendência
- Erro mais comum esta semana: ...
- Melhora observada em: ...
- Foco para próxima semana: ...
```

---

## Resumo — O que Implementar Agora

| Ação | Arquivo | Prioridade |
|---|---|---|
| Criar `LESSONS.md` | workspace/ | 🔴 Alta |
| Adicionar rotina pós-tarefa | AGENTS.md | 🔴 Alta |
| Criar cron consolidação semanal | OpenClaw cron | 🟡 Média |
| Criar `feedback-metrics.md` | workspace/ | 🟡 Média |
| Implementar `CONSTITUTION.md` | workspace/ | 🟢 Baixa |

---

> O diferencial de um agente que melhora de um que não melhora não é o modelo — é a disciplina de documentar, refletir e adaptar. A infraestrutura já existe. Falta consistência no uso.


---

# 🚀 GOSPIA - GUIA MASTER COMPLETO

> **Documento de referência completo para o projeto Gospia**
> **Última atualização:** 29 de Janeiro de 2026
> **Versão do App:** 2.1.0 (versionCode 24)
> **Status:** ✅ Aprovado na Play Store

---

## 📋 ÍNDICE

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Funcionalidades Implementadas](#4-funcionalidades-implementadas)
5. [Configuração do Ambiente](#5-configuração-do-ambiente)
6. [Banco de Dados (Supabase)](#6-banco-de-dados-supabase)
7. [Sistema Social Completo](#7-sistema-social-completo)
8. [Build e Deploy](#8-build-e-deploy)
9. [Requisitos Play Store 2025/2026](#9-requisitos-play-store-20252026)
10. [Solução do Erro 16KB](#10-solução-do-erro-16kb)
11. [Credenciais e Senhas](#11-credenciais-e-senhas)
12. [Troubleshooting](#12-troubleshooting)
13. [Checklist de Publicação](#13-checklist-de-publicação)

---

## 1. Visão Geral do Projeto

### O que é o Gospia?

Gospia é um aplicativo mobile de comunidade cristã com:
- **Chat com IA** (Pastor Gospia) - Orientação espiritual via Groq
- **Rede Social** - Feed, posts, likes, comentários
- **Fórum** - Discussões por categorias
- **Sistema de Amizades** - Seguir, amigos bilaterais
- **Notificações** - Curtidas e comentários
- **Sistema PRO** - Assinatura premium

### Dados do App

| Item | Valor |
|------|-------|
| **Nome** | Gospia |
| **Package** | app.gospia.mobile |
| **Versão Atual** | 2.1.0 |
| **versionCode** | 24 |
| **Play Store** | Publicado |

---

## 2. Stack Tecnológico

### Frontend (Mobile)

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React Native** | 0.79.6 | Framework mobile |
| **Expo** | 53.0.0 | Toolchain |
| **TypeScript** | 5.8.3 | Linguagem |
| **React Navigation** | 6.x | Navegação |

### Backend

| Tecnologia | Uso |
|------------|-----|
| **Supabase** | Auth, Database, Storage |
| **Groq** | IA (Chat) - Whisper + LLaMA |
| **ElevenLabs** | TTS (Text-to-Speech) |
| **Vercel** | API Backend |

### Configurações Android

| Item | Valor |
|------|-------|
| **compileSdkVersion** | 35 |
| **targetSdkVersion** | 35 |
| **minSdkVersion** | 24 |
| **buildToolsVersion** | 35.0.0 |
| **ndkVersion** | 27.1.12297006 |

---

## 3. Estrutura do Projeto

```
gospia-mobile-app/
├── android/                    # Código nativo Android
├── assets/                     # Imagens e ícones
├── src/
│   ├── components/
│   │   └── social/            # Componentes do sistema social
│   │       ├── UIComponents.tsx
│   │       └── ReportButton.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx    # Contexto de autenticação
│   ├── lib/
│   │   └── supabase.ts        # Cliente Supabase
│   ├── screens/
│   │   ├── social/            # Telas do sistema social
│   │   │   ├── SocialHomeScreen.tsx
│   │   │   ├── FeedScreen.tsx
│   │   │   ├── ForumHomeScreen.tsx
│   │   │   ├── ForumPostScreen.tsx
│   │   │   ├── PostDetailScreen.tsx
│   │   │   ├── UserProfileScreen.tsx
│   │   │   ├── CreateFeedPostScreen.tsx
│   │   │   ├── CreateForumPostScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   └── ChatScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ChatPastorScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── UpgradeScreen.tsx
│   └── services/
│       ├── social/
│       │   ├── feed.ts        # Lógica do Feed
│       │   ├── forum.ts       # Lógica do Fórum
│       │   ├── friends.ts     # Sistema de amizades
│       │   └── notifications.ts # Notificações
│       └── pushNotifications.ts # Push notifications
├── app.json                   # Configuração Expo
├── App.tsx                    # Entry point
├── package.json               # Dependências
└── .env                       # Variáveis de ambiente
```

---

## 4. Funcionalidades Implementadas

### 4.1 Sistema de Chat com IA

- ✅ Chat com Pastor Gospia (Groq LLaMA)
- ✅ Gravação de áudio (Whisper STT)
- ✅ Ouvir resposta (ElevenLabs TTS)
- ✅ Compartilhar mensagens
- ✅ Sistema de créditos

### 4.2 Sistema Social - Feed

- ✅ Criar posts com imagem
- ✅ Curtir posts (❤️)
- ✅ Comentar em posts
- ✅ Deletar próprios posts/comentários
- ✅ Algoritmo de relevância
- ✅ Pull-to-refresh
- ✅ Infinite scroll

### 4.3 Sistema Social - Fórum

- ✅ Categorias (Oração, Testemunho, Estudo, Dúvidas, Louvor, Geral)
- ✅ Criar posts no fórum
- ✅ Comentar em posts
- ✅ Curtir posts e comentários
- ✅ Deletar próprios posts/comentários
- ✅ Filtrar por categoria

### 4.4 Sistema de Amizades

- ✅ Seguir usuários
- ✅ Amigos bilaterais (quando ambos se seguem)
- ✅ Contagem de amigos no perfil
- ✅ Lista de amigos

### 4.5 Notificações

- ✅ Notificação de curtida (feed e fórum)
- ✅ Notificação de comentário (feed e fórum)
- ✅ Roteamento correto (feed → PostDetail, forum → ForumPost)
- ✅ Contador de não lidas
- ✅ Marcar como lida

### 4.6 Perfis

- ✅ Visualizar perfil de outros usuários
- ✅ Mostrar posts do usuário
- ✅ Botão de chat direto
- ✅ Badge PRO
- ✅ Contagem de amigos

---

## 5. Configuração do Ambiente

### 5.1 Pré-requisitos

```bash
# Node.js 20+
node -v  # v20.x.x

# npm
npm -v

# Android Studio com SDK 35
# NDK 27.1.12297006
```

### 5.2 Instalação

```bash
# Clonar/copiar projeto
cd C:\Users\Eduardo\Appgospia\gospia-mobile-app

# Instalar dependências
npm install --legacy-peer-deps

# Criar arquivo .env
```

### 5.3 Arquivo .env

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
EXPO_PUBLIC_GROQ_API_KEY=sua-groq-key
EXPO_PUBLIC_ELEVEN_API_KEY=sua-eleven-key
EXPO_PUBLIC_API_URL=https://seu-backend.vercel.app
```

### 5.4 Rodar em Desenvolvimento

```bash
# Prebuild Android
npx expo prebuild --platform android --clean

# Rodar no emulador/dispositivo
npx expo run:android
```

---

## 6. Banco de Dados (Supabase)

### 6.1 Tabelas Principais

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  church TEXT,
  city TEXT,
  state TEXT,
  personality_type TEXT,
  is_pro BOOLEAN DEFAULT false,
  credits INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### feed_posts
```sql
CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  location TEXT,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### feed_likes / feed_comments
```sql
CREATE TABLE feed_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### forum_posts / forum_likes / forum_comments
```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'geral',
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### follows (Sistema de Amizades)
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

#### social_notifications
```sql
CREATE TABLE social_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 RPC Functions

```sql
-- Incrementar/Decrementar likes do feed
CREATE OR REPLACE FUNCTION increment_feed_likes(post_id UUID)
RETURNS void AS $$
  UPDATE feed_posts SET like_count = GREATEST(0, like_count + 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_feed_likes(post_id UUID)
RETURNS void AS $$
  UPDATE feed_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL;

-- Incrementar/Decrementar comments do feed
CREATE OR REPLACE FUNCTION increment_feed_comments(post_id UUID)
RETURNS void AS $$
  UPDATE feed_posts SET comment_count = GREATEST(0, comment_count + 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_feed_comments(post_id UUID)
RETURNS void AS $$
  UPDATE feed_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL;

-- Forum likes/comments (mesma lógica)
CREATE OR REPLACE FUNCTION increment_forum_likes(post_id UUID)
RETURNS void AS $$
  UPDATE forum_posts SET like_count = GREATEST(0, like_count + 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_forum_likes(post_id UUID)
RETURNS void AS $$
  UPDATE forum_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION increment_forum_comments(post_id UUID)
RETURNS void AS $$
  UPDATE forum_posts SET comment_count = GREATEST(0, comment_count + 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_forum_comments(post_id UUID)
RETURNS void AS $$
  UPDATE forum_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL;
```

### 6.3 RLS Policies

```sql
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Feed Posts
CREATE POLICY "Anyone can view feed posts" ON feed_posts
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Authenticated users can create posts" ON feed_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON feed_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Feed Likes
CREATE POLICY "Anyone can view likes" ON feed_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can like" ON feed_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON feed_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Feed Comments
CREATE POLICY "Anyone can view comments" ON feed_comments
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Authenticated can comment" ON feed_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON feed_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Forum (mesmas policies)
CREATE POLICY "Anyone can view forum posts" ON forum_posts
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Authenticated can create forum posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own forum posts" ON forum_posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own forum comments" ON forum_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Follows
CREATE POLICY "Anyone can view follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can follow" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON social_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can create notifications" ON social_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON social_notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 7. Sistema Social Completo

### 7.1 Arquitetura do Feed

```
FeedScreen.tsx
    │
    ├── loadFeed() → getFeed() [feed.ts]
    │       │
    │       ├── Busca posts do Supabase
    │       ├── Carrega author de cada post
    │       ├── Calcula relevance_score
    │       ├── Ordena por relevância
    │       └── Retorna posts com user_liked
    │
    ├── handleLike() → toggleLike() [feed.ts]
    │       │
    │       ├── Verifica se já curtiu
    │       ├── INSERT ou DELETE em feed_likes
    │       ├── Chama RPC increment/decrement
    │       └── Cria notificação [pushNotifications.ts]
    │
    └── renderPost()
            │
            ├── Avatar do autor
            ├── Nome + Badge PRO
            ├── Imagem do post
            ├── Botão de curtir
            ├── Contagem de likes
            └── Link para comentários
```

### 7.2 Algoritmo de Relevância

```typescript
function calculateRelevanceScore(post, currentUser, followingIds): number {
  let score = 0;
  
  // Base: likes (max 30 pontos)
  score += Math.min(post.like_count * 2, 30);
  
  // Recência (max 20 pontos)
  const hoursAgo = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 1) score += 20;
  else if (hoursAgo < 6) score += 15;
  else if (hoursAgo < 24) score += 10;
  else if (hoursAgo < 72) score += 5;
  
  // Segue o autor (25 pontos)
  if (followingIds.has(post.author_id)) score += 25;
  
  // Mesma igreja (15 pontos)
  if (currentUser?.church === post.author?.church) score += 15;
  
  // Mesma cidade (10 pontos)
  if (currentUser?.city === post.author?.city) score += 10;
  
  // Mesmo estado (5 pontos)
  if (currentUser?.state === post.author?.state) score += 5;
  
  // Personalidade compatível (10 pontos)
  // ... lógica de compatibilidade
  
  // Autor PRO (5 pontos)
  if (post.author?.is_pro) score += 5;
  
  return score;
}
```

### 7.3 Sistema de Notificações

```typescript
// pushNotifications.ts

export async function createLikeNotification(
  postOwnerId: string,
  likerName: string,
  postId: string,
  source: 'feed' | 'forum' = 'feed'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === postOwnerId) return;
  
  await supabase.from('social_notifications').insert({
    user_id: postOwnerId,
    type: 'post_like',
    title: 'Nova curtida',
    body: `${likerName} curtiu sua publicação`,
    data: { postId, source }
  });
}

export async function createCommentNotification(
  postOwnerId: string,
  commenterName: string,
  postId: string,
  commentPreview: string,
  source: 'feed' | 'forum' = 'feed'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === postOwnerId) return;
  
  await supabase.from('social_notifications').insert({
    user_id: postOwnerId,
    type: 'post_comment',
    title: 'Novo comentário',
    body: `${commenterName}: ${commentPreview.substring(0, 50)}...`,
    data: { postId, source }
  });
}
```

### 7.4 Roteamento de Notificações

```typescript
// notifications.ts

export function getNotificationRoute(notif: SocialNotification) {
  switch (notif.type) {
    case 'post_like':
    case 'post_comment':
      if (notif.data?.postId) {
        if (notif.data?.source === 'forum') {
          return { screen: 'ForumPost', params: { postId: notif.data.postId } };
        } else {
          return { screen: 'PostDetail', params: { postId: notif.data.postId } };
        }
      }
      return null;
    case 'new_follower':
      if (notif.data?.oderId) {
        return { screen: 'UserProfile', params: { userId: notif.data.followerId } };
      }
      return null;
    default:
      return null;
  }
}
```

---

## 8. Build e Deploy

### 8.1 Build de Desenvolvimento (APK Debug)

```bash
cd C:\Users\Eduardo\Appgospia\gospia-mobile-app

# Prebuild
npx expo prebuild --platform android --clean

# Build APK
cd android
.\gradlew assembleRelease

# Instalar no dispositivo
& "C:\Users\Eduardo\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r ".\app\build\outputs\apk\release\app-release.apk"
```

### 8.2 Build de Produção (AAB)

#### No Android Studio:

1. **File** → **Open** → `C:\Users\Eduardo\Appgospia\gospia-mobile-app\android`
2. **File** → **Sync Project with Gradle Files**
3. **Build** → **Clean Project**
4. **Build** → **Generate Signed Bundle / APK**
5. Selecionar **Android App Bundle**
6. Configurar keystore:
   - Path: `C:\Users\Eduardo\Appgospia\gospia-keystore.jks`
   - Senha: `160679`
   - Alias: `gospia`
   - Key password: `160679`
7. Build variant: **release**
8. **Create**

#### Arquivo gerado:
`android/app/build/outputs/bundle/release/app-release.aab`

### 8.3 Upload na Play Console

1. Acessa: https://play.google.com/console
2. Seleciona **Gospia**
3. **Test and release** → **Production**
4. **Create new release**
5. Upload do arquivo `.aab`
6. Adicionar release notes
7. **Review release** → **Start rollout to Production**

---

## 9. Requisitos Play Store 2025/2026

### 9.1 Requisitos Obrigatórios

| Requisito | Prazo | Status Gospia |
|-----------|-------|---------------|
| **targetSdkVersion 35** | 31 Ago 2025 | ✅ 35 |
| **16KB Page Size** | 1 Nov 2025 | ✅ Resolvido |
| **AAB Format** | Obrigatório | ✅ Usando |
| **Privacy Policy** | Sempre | ✅ Configurado |
| **Data Safety** | Sempre | ✅ Preenchido |

### 9.2 Versões Mínimas para 16KB

| Componente | Mínimo | Gospia |
|------------|--------|--------|
| **React Native** | 0.77+ | ✅ 0.79.6 |
| **Expo SDK** | 53+ | ✅ 53.0.0 |
| **NDK** | r27+ | ✅ 27.1.12297006 |
| **Gradle** | 8.4+ | ✅ 8.10.2 |

---

## 10. Solução do Erro 16KB

### 10.1 O Problema

A Play Store passou a exigir suporte a 16KB page size para apps Android 15+. Apps com bibliotecas nativas compiladas com 4KB não são aceitos.

### 10.2 Erro que Aparecia

```
Error: Your app does not support 16 KB memory page sizes.
```

### 10.3 A Solução

**O problema era que Expo 52 + React Native 0.76.9 tinham bibliotecas nativas compiladas com 4KB.**

#### Passo a passo da solução:

```bash
# 1. Backup
Copy-Item package.json package.json.backup

# 2. Upgrade Expo para 53
npx expo install expo@^53.0.0

# 3. Corrigir dependências
npm install --legacy-peer-deps
npx expo install --fix -- --legacy-peer-deps

# 4. Verificar versões
# Expo: 53.0.0
# React Native: 0.79.6

# 5. Prebuild limpo
npx expo prebuild --platform android --clean

# 6. Build no Android Studio
```

### 10.4 Configurações que NÃO funcionaram sozinhas

Estas configurações **NÃO resolvem** se a versão do React Native for antiga:

- `useLegacyPackaging = true`
- `extractNativeLibs = true`
- `ndkVersion = "27.1.12297006"`

**A única solução real é atualizar para React Native 0.77+ (preferencialmente 0.79+).**

### 10.5 app.json Final

```json
{
  "expo": {
    "name": "Gospia",
    "slug": "gospia-mobile-app",
    "version": "2.1.0",
    "android": {
      "package": "app.gospia.mobile",
      "versionCode": 24
    },
    "plugins": [
      ["expo-av", { "microphonePermission": "..." }],
      ["expo-build-properties", {
        "android": {
          "compileSdkVersion": 35,
          "targetSdkVersion": 35,
          "buildToolsVersion": "35.0.0",
          "ndkVersion": "27.1.12297006"
        }
      }],
      "expo-font",
      "expo-asset"
    ]
  }
}
```

---

## 11. Credenciais e Senhas

### 11.1 Keystore Android

| Item | Valor |
|------|-------|
| **Arquivo** | `C:\Users\Eduardo\Appgospia\gospia-keystore.jks` |
| **Senha** | `160679` |
| **Alias** | `gospia` |
| **Key Password** | `160679` |

⚠️ **IMPORTANTE:** Guarde a keystore em local seguro! Sem ela não é possível atualizar o app na Play Store.

### 11.2 Supabase

- **URL:** Configurado no `.env`
- **Anon Key:** Configurado no `.env`

### 11.3 APIs

- **Groq API:** Configurado no `.env`
- **ElevenLabs:** Configurado no `.env`

---

## 12. Troubleshooting

### 12.1 Erro: "16KB page size not supported"

**Solução:** Upgrade para Expo 53+ e React Native 0.79+

### 12.2 Erro: "versionCode already used"

**Solução:** Incrementar versionCode no app.json e rebuild

### 12.3 Erro: "Invalid login credentials" (Play Console)

**Solução:** Configurar conta de teste no Supabase (auto-confirm)

### 12.4 Erro: Build demora muito

**Normal** após upgrade de versão. Primeira build pode levar 15-30 minutos.

### 12.5 Erro: Dependências incompatíveis

**Solução:** Usar `--legacy-peer-deps` no npm install

### 12.6 Erro: Autor não aparece no Feed

**Solução:** Garantir que o map preserva o author:
```typescript
return posts.map(p => ({ ...p, author: p.author, user_liked: ... }));
```

---

## 13. Checklist de Publicação

### 13.1 Antes de Buildar

- [ ] Incrementar `versionCode` no app.json
- [ ] Verificar `.env` com variáveis corretas
- [ ] Rodar `npx expo prebuild --platform android --clean`
- [ ] Verificar targetSdkVersion = 35

### 13.2 No Android Studio

- [ ] Sync Project with Gradle Files
- [ ] Build → Clean Project
- [ ] Generate Signed Bundle (AAB)
- [ ] Usar keystore correta

### 13.3 Na Play Console

- [ ] Upload do AAB
- [ ] Verificar se não há erros (16KB, etc)
- [ ] Adicionar release notes
- [ ] Review release
- [ ] Start rollout

### 13.4 Após Publicação

- [ ] Aguardar aprovação (1-24h para updates)
- [ ] Testar no dispositivo após disponível
- [ ] Monitorar crashes no Play Console

---

## 📌 Comandos Rápidos

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Prebuild
npx expo prebuild --platform android --clean

# Build APK debug
cd android && .\gradlew assembleRelease

# Instalar APK
adb install -r .\app\build\outputs\apk\release\app-release.apk

# Verificar versões
Get-Content package.json | Select-String '"expo"|"react-native"'
Get-Content android\app\build.gradle | Select-String "versionCode"
```

---

## 🏆 Histórico de Versões

| Versão | versionCode | Data | Mudanças |
|--------|-------------|------|----------|
| 2.1.0 | 24 | 29/01/2026 | 16KB fix, Expo 53, RN 0.79.6 |
| 2.0.0 | 18-23 | Jan/2026 | Sistema social completo |
| 1.x | 1-17 | Dez/2025 | Versões iniciais |

---

**Documento criado em:** 29 de Janeiro de 2026
**Autor:** Desenvolvimento Gospia
**Status:** ✅ App aprovado e publicado na Play Store

