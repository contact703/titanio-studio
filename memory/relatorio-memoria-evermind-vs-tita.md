# Relatório: Sistemas de Memória para IA — Análise do Paper MSA (Evermind) vs Sistema Tita

**Data:** 27/03/2026
**Solicitado por:** Zica
**Fonte:** Reel @howard.mov (Instagram) + Paper MSA (Evermind/Shanda Group/Peking University)

---

## 1. O Que o Vídeo Apresenta

O vídeo do Howard Tam (@howard.mov) apresenta um paper da **Evermind** (startup chinesa, subsidiária do Shanda Group) que propõe uma nova abordagem para memória de longo prazo em IA chamada **MSA (Memory Sparse Attention)**.

A tese central: um modelo de **4B parâmetros** com MSA superou sistemas RAG rodando em modelos de **235B parâmetros** (Qwen3-235B) em múltiplos benchmarks.

---

## 2. Os 3 Paradigmas de Memória em IA

O vídeo classifica 3 formas de uma IA "lembrar":

### 2.1 Parameter-Based Memory (Memória nos Pesos)
- **Como funciona:** Conhecimento é "assado" nos pesos do modelo durante o treinamento
- **Vantagem:** Rápido na inferência
- **Problema fatal:** O modelo "esquece" (catastrophic forgetting). Retreinar é caro e lento
- **Exemplo:** GPT sabe fatos do mundo porque foram treinados nele, mas não lembra da conversa de ontem

### 2.2 External Storage-Based Memory (RAG e similares)
- **Como funciona:** Busca em banco de dados externo, injeta contexto relevante no prompt
- **Vantagem:** Fácil de implementar, compatível com qualquer LLM, sem catastrophic forgetting
- **Problema:** Busca e raciocínio são **desconectados**. O retrieval encontra "mais ou menos" a coisa certa, não exatamente. Precisão é "Medium" segundo a tabela do paper
- **Exemplo:** RAG, MemAgent

### 2.3 Latent State-Based Memory (Memória por Estados Internos)
- **Como funciona:** Memória vive nos estados internos do modelo, treinável end-to-end
- **Vantagem:** Mais preciso — busca e raciocínio são integrados, não "colados"
- **Problema histórico:** Não escalava. Caro demais computacionalmente
- **Breakthrough do paper:** MSA resolve o problema de escala, mantendo <9% de degradação de 16K a 100M tokens

---

## 3. O Paper MSA — Resultados Chave

**Título:** "MSA: Memory Sparse Attention for Efficient End-to-End Memory Model Scaling to 100M Tokens"
**Autores:** Yu Chen, Runkai Chen, et al. (Evermind + Shanda Group + Peking University)

### Resultados impressionantes:
| Benchmark | RAG + Qwen3-235B (melhor config) | MSA-4B | Vencedor |
|---|---|---|---|
| MS MARCO v1 | 3.027 | **4.141** | MSA (+37%) |
| DuReader | 4.044 | **4.155** | MSA |
| 2WikiMultiHopQA | 3.583 | **4.280** | MSA (+19%) |
| PopQA | 3.396 | **3.413** | MSA |
| Média geral | 3.580 | **3.760** | MSA (+5%) |

**Destaque:** MSA-4B (4 bilhões de parâmetros) bateu RAG rodando em Qwen3-235B (235 bilhões) — um modelo 60x menor superou o gigante.

### Arquitetura MSA:
- Usa **sparse attention** com seleção top-k por token
- **Doc-wise RoPE** para codificação posicional por documento
- É **diferenciável** end-to-end (pode treinar tudo junto)
- Na inferência, documentos podem ser desacoplados (eficiência)

---

## 4. Nosso Sistema de Memória (Tita/OpenClaw) — Diagnóstico

### O que temos hoje:

| Componente | Tipo | Detalhes |
|---|---|---|
| MEMORY.md | External Storage | 234 linhas, memória de longo prazo curada manualmente |
| memory/*.md | External Storage | 73 arquivos diários, ~2.4MB total de logs |
| Memory Watchdog | Automação | Script rodando 24/7, consolidação automática 23:59 |
| memory_search | RAG-like | Busca semântica nos arquivos de memória |
| Contexto de sessão | Context Window | Carregado a cada sessão (SOUL.md, USER.md, AGENTS.md, etc.) |
| LESSONS.md | External Storage | Lições aprendidas, regras permanentes |

### Classificação pelo framework do vídeo:

**Nosso sistema é 100% External Storage-Based (Tipo 2 — RAG)**

Usamos arquivos markdown como "banco de dados" e injetamos no contexto da LLM. É exatamente o padrão que o paper diz ser "impreciso" — busca e raciocínio desconectados.

### Pontos fortes do nosso sistema:
✅ Funciona com qualquer modelo (Claude, GPT, Gemini)
✅ Transparente — qualquer humano pode ler os arquivos de memória
✅ Fácil de editar e corrigir manualmente
✅ Sem catastrophic forgetting
✅ Consolidação automática (watchdog)
✅ Baixo custo computacional

### Pontos fracos (revelados pelo paper):
❌ Precisão "Medium" — a busca semântica nem sempre encontra a memória certa
❌ Busca e raciocínio desconectados — o modelo não "sente" as memórias, apenas recebe texto
❌ Limite de contexto — não escala para milhões de tokens de memória
❌ Dependência de prompt engineering — a qualidade depende de como as memórias são formatadas
❌ Perda de nuance — detalhes sutis se perdem na sumarização

---

## 5. Proposta de Melhorias

Pensando que **memória é nosso bem mais importante**, aqui estão melhorias organizadas por impacto e viabilidade:

### 🔴 CRÍTICO — Fazer Agora (Semana 1-2)

**1. Indexação Semântica com Embeddings**
- Hoje: busca full-text simples (FTS)
- Proposta: Gerar embeddings vetoriais de cada bloco de memória
- Usar modelo de embedding local (e5-small ou similar) 
- Armazenar em SQLite com extensão de vetores
- **Impacto:** Busca passa de "keyword match" para "entendimento semântico"
- **Custo:** Baixo (modelos de embedding são pequenos e rápidos)

**2. Memória Hierárquica com 3 Camadas**
- **Camada 1 — Working Memory:** Contexto da sessão atual (já temos)
- **Camada 2 — Episodic Memory:** Eventos recentes com timestamps e relevância (melhorar memory/*.md)
- **Camada 3 — Semantic Memory:** Conhecimento destilado permanente (MEMORY.md + LESSONS.md, mais estruturado)
- **Impacto:** Recall mais preciso, menos tokens desperdiçados

**3. Scoring de Relevância por Recência + Importância**
- Cada memória ganha score = (importância × peso) + (recência × decay)
- Memórias recentes têm boost, memórias antigas mas importantes mantêm score alto
- Memórias irrelevantes decaem naturalmente
- **Impacto:** Contexto mais relevante em cada sessão

### 🟡 IMPORTANTE — Fazer no Mês (Semana 3-4)

**4. Memory Compression Pipeline**
- Antes da consolidação: comprimir memórias similares/redundantes
- Usar LLM para gerar resumos densos de clusters de memórias
- Manter originals como "fontes" mas usar resumos no retrieval
- **Impacto:** Mais memória em menos tokens

**5. Active Recall System**
- Em vez de só buscar quando perguntado, o sistema proativamente sugere memórias relevantes
- "Isso me lembra de quando fizemos X em [data]..."
- Implementar como hook no pipeline de resposta
- **Impacto:** Comportamento mais "humano", menos memórias perdidas

**6. Memory Graphs (Conexões entre Memórias)**
- Criar grafo de relações: Pessoa → Projeto → Decisão → Resultado
- Permite navegação por associação, não só por keyword
- Simples: JSON com nós e arestas
- **Impacto:** Raciocínio multi-hop sobre memórias (tipo o 2WikiMultiHopQA onde MSA brilhou)

### 🟢 VISIONÁRIO — Pesquisar e Prototipar (Mês 2+)

**7. Memória Latente Inspirada no MSA**
- Quando/se MSA for open-source: testar como camada de memória especializada
- Usar modelo pequeno (4B) dedicado APENAS a memória, alimentando o modelo principal
- Arquitetura: MSA-4B como "cérebro de memória" + Claude/GPT como "cérebro de raciocínio"
- **Impacto:** Melhor dos dois mundos — precisão do MSA + capacidade dos modelos grandes

**8. Memory Fine-tuning Local**
- Treinar adapter (LoRA) em modelo local com nossas memórias
- O modelo literalmente "aprende" o contexto do Eduardo/Tita
- Complementa o RAG com conhecimento nos pesos
- **Impacto:** Tipo 1 + Tipo 2 combinados

**9. Continuous Memory Distillation**
- Pipeline automático: memórias brutas → embeddings → clusters → resumos → retraining
- Ciclo contínuo onde o modelo fica "mais inteligente" sobre o contexto ao longo do tempo
- **Impacto:** Sistema que realmente evolui, não só acumula texto

---

## 6. Conclusão

A mensagem central do paper MSA é: **sistemas integrados sempre vencem sistemas "colados" (duct-taped)**. Nosso sistema atual é um bom exemplo de "colagem" — funcional, mas com limitações inerentes.

A boa notícia: nossas melhorias de curto prazo (embeddings, hierarquia, scoring) podem nos levar de "RAG básico" para "RAG inteligente" sem precisar de infraestrutura pesada. E quando MSA (ou similar) estiver disponível como open-source, podemos ser early adopters.

**Prioridade #1:** Implementar embeddings vetoriais nas memórias existentes. É o maior salto de qualidade com menor custo.

---

*Relatório gerado por Tita — Especialista em Memória*
*Fonte: Paper MSA (Evermind/Shanda/PKU) via reel @howard.mov*
