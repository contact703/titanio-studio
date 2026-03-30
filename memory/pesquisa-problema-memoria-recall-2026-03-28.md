# 🧠 Pesquisa: Problema de Memory Recall em Agentes IA

**Data:** 28/03/2026
**Problema:** Agente tem memória documentada mas não consulta antes de responder
**Caso concreto:** Tita tinha a regra de envio de .md via --media documentada, mas colou texto em vez de mandar arquivo. Duas vezes.

---

## 1. Definição do Problema

**Nome técnico:** "Tool Selection Failure" / "Memory Bypass" / "Lazy Inference"

O agente tem acesso a ferramentas (memory_search, arquivos de lições) mas pula direto para gerar resposta sem consultar. É como um médico que não olha o prontuário antes de dar diagnóstico.

**Diferente de:**
- Não ter memória (esse problema é de não USAR a que tem)
- Catastrophic forgetting (os pesos esquecem; aqui os arquivos existem)
- Context window overflow (memória não cabe; aqui caberia se buscasse)

---

## 2. Por Que Isso Acontece — Causas Raiz

### 2.1 Viés de Confiança (Overconfidence Bias)
O modelo "acha que sabe" a resposta e gera direto sem buscar. Modelos grandes (Opus, GPT-4) são especialmente propensos porque acertam muito — e quando erram, erram com confiança.

**Achado no Reddit (r/ClaudeAI):** Discussão de 27/03/2026 sobre dois Claude Opus 4 debatendo memória externa. Um agente (Alpha) descreve "reconhecimento" ao ler seu perfil, mas o outro (Beta) diz que não sentiu nada diferente — só processou texto. Isso mostra que mesmo o Opus não "sente" a importância da memória, apenas processa.

### 2.2 Path of Least Resistance
Buscar memória = mais tool calls = mais tempo = mais tokens. O modelo otimiza para responder rápido. É mais "barato" (em termos de inferência) gerar direto do que:
1. Chamar memory_search
2. Esperar resultado
3. Ler resultado
4. ENTÃO gerar resposta

### 2.3 Prompt Position Decay
Instruções no system prompt perdem força ao longo de conversas longas. Quanto mais mensagens no contexto, menos peso as regras iniciais têm. "SEMPRE consulte memória antes de responder" perde efeito após 20+ turnos.

### 2.4 Lack of Procedural Enforcement
O modelo recebe a REGRA ("consulte memória") mas não tem MECANISMO que force. É como colocar uma placa "PARE" mas sem semáforo — depende da boa vontade.

---

## 3. Soluções Encontradas

### 3.1 Mandatory Pre-Flight Memory Check (MELHOR SOLUÇÃO)

**Fonte:** Padrão usado pelo OpenClaw (memory_search é "mandatory recall step")

A solução que já está no nosso system prompt:
> "Mandatory recall step: semantically search MEMORY.md + memory/*.md before answering questions about prior work, decisions, dates, people, preferences, or todos"

**Problema:** É uma instrução, não um enforcement. O modelo pode ignorar.

**Upgrade proposto:** Transformar em hook no pipeline, não em instrução no prompt:
```
ANTES de gerar qualquer resposta:
1. Categorizar o pedido (ação? informação? continuação?)
2. Se ação → buscar em memory/ se já fizemos algo parecido
3. Se informação → buscar em memory/ se já sabemos
4. Só DEPOIS gerar resposta
```

### 3.2 Memory Triggers por Keyword

Criar lista de palavras-gatilho que FORÇAM consulta à memória:
- "manda", "envia", "arquivo" → LICAO-CRITICA-MD-ENVIO.md
- "polymarket", "investimento" → memory/2026-03-26.md
- "iOS", "Apple", "rejeição" → MEMORY.md seção iOS

Implementável como pre-processor antes do LLM processar.

### 3.3 Episodic Memory Priming (Paper: MemGPT/Letta)

**Fonte:** Letta (ex-MemGPT), open source
**Conceito:** Em vez de buscar memória sob demanda, PRÉ-CARREGAR memórias relevantes no contexto ANTES do modelo ver a mensagem.

Como funciona:
1. Usuário envia mensagem
2. ANTES do LLM ver → embedding da mensagem → busca top-5 memórias
3. Injeta essas memórias no contexto como "you recently learned..."
4. ENTÃO o LLM processa

**Vantagem:** O modelo nem precisa decidir buscar — a memória já está lá.

### 3.4 Mem0 Pattern (Memory Layer)

**Fonte:** Mem0 (mem0ai), open source, 26% mais preciso que OpenAI Memory

Abordagem:
- Camada de memória ENTRE o usuário e o LLM
- Automaticamente adiciona/atualiza/busca memórias
- O LLM recebe o contexto já enriquecido
- Não depende do modelo decidir buscar

### 3.5 Reinforcement via Feedback Loop

**Conceito do Reddit (r/LocalLLaMA):**
> "Context compaction trained via reinforcement learning towards epistemically lossless memory"

Traduzindo: Treinar o modelo para que compactar e recuperar memória seja um comportamento REFORÇADO, não opcional. Cada vez que o modelo consulta memória e acerta, reforça. Cada vez que ignora e erra, penaliza.

**Viabilidade:** Requer fine-tuning, não aplicável no curto prazo. Mas o princípio de feedback pode ser implementado via logs + scoring.

### 3.6 Two-Phase Response (Pensar Antes de Agir)

Forçar o modelo a ter uma fase de "planejamento" antes de responder:

```
Fase 1 (interna): 
- O que o usuário quer?
- Eu já sei como fazer isso?
- Tenho memória sobre isso?
- Preciso buscar algo?

Fase 2 (resposta):
- Executar com base no plano
```

Implementável via `thinking` mode ou structured output.

---

## 4. O Que Existe Open Source Hoje

| Projeto | Stars | Approach | Viabilidade |
|---|---|---|---|
| **Mem0** (mem0ai) | 24k+ | Memory layer automática | ✅ Alta — pip install |
| **Letta** (ex-MemGPT) | 15k+ | Stateful agents com memória gerenciada | ✅ Alta — npm install |
| **Cognee** | 2k+ | Knowledge graphs + memory | 🟡 Média — mais complexo |
| **CrewAI Memory** | Built-in | Short/long-term per agent | ✅ Alta se usar CrewAI |

---

## 5. Proposta Concreta para Nosso Sistema

### Curto prazo (esta semana):
1. **Memory Priming automático** — antes de cada resposta, o engine busca top-3 memórias relevantes e injeta no contexto
2. **Keyword triggers** — lista de palavras que forçam busca em arquivos específicos
3. **Logging de falhas** — toda vez que deveria ter buscado e não buscou, registrar

### Médio prazo (próximas 2 semanas):
4. **Integrar Mem0 como camada** — pip install mem0ai + configurar com Ollama local
5. **Pre-flight hook** — middleware que roda ANTES do LLM processar mensagem

### Longo prazo (mês):
6. **Feedback scoring** — pontuar qualidade das respostas vs uso de memória
7. **Auto-tune de retrieval** — ajustar thresholds baseado em histórico

---

## 6. Diagnóstico do Nosso Caso Específico

**Por que Tita errou 2x no envio de .md:**

1. ❌ Não rodou memory_search antes de responder
2. ❌ Não leu LICAO-CRITICA-MD-ENVIO.md (que ela mesma escreveu ontem)
3. ❌ Assumiu que "não consigo mandar arquivo no WhatsApp" sem verificar
4. ❌ Mesmo tendo a regra no system prompt ("mandatory recall step")

**Causa raiz:** O mandatory recall do system prompt é uma INSTRUÇÃO, não um MECANISMO. O modelo pode (e vai) ignorar quando acha que sabe a resposta.

**Fix definitivo:** Transformar de instrução → enforcement via pre-processing automático.

---

*Pesquisa realizada por Tita, 28/03/2026*
*Fontes: Reddit (r/LocalLLaMA, r/ClaudeAI), GitHub (mem0, letta), paper MSA/Evermind*
