# 🧠 Sistema de Memória e Aprendizado para OpenClaw Agents
> Criado por Tita (Titanio Films) — 2026-03-15  
> Para instalar em qualquer OpenClaw agent da equipe

---

## O que é isso?

Um sistema que faz seu agente **lembrar do passado, aprender com erros e melhorar com o tempo** — tudo com arquivos simples, sem banco de dados, sem custo.

Inspirado nas melhores pesquisas de 2025 (Mem0, Reflexion, MemGPT) mas adaptado para rodar **100% local e gratuito**.

---

## Arquitetura — 4 camadas de memória

```
┌──────────────────────────────────────────────────┐
│  PROCEDURAL  →  SKILL.md, TOOLS.md, AGENTS.md    │  Como fazer as coisas
│  (não muda quase nunca)                           │
├──────────────────────────────────────────────────┤
│  SEMÂNTICA   →  MEMORY.md                        │  Fatos sobre o usuário
│  (atualizada semanalmente pelo LLM)              │  e decisões importantes
├──────────────────────────────────────────────────┤
│  EPISÓDICA   →  memory/YYYY-MM-DD.md             │  O que aconteceu cada dia
│  (criada diariamente)                            │
├──────────────────────────────────────────────────┤
│  ESTRUTURADA →  lessons.json + domain-scores.json │  Métricas e lições
│  (atualizada a cada tarefa)                      │
└──────────────────────────────────────────────────┘
```

---

## Instalação — passo a passo

### 1. Copiar os scripts

```bash
# No terminal do Mac do colega:
cp -r /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/tita-learning-system/ \
      ~/.openclaw/workspace/tita-learning-system/
```

Ou clonar do GitHub (se sincronizado):
```bash
gh repo clone contact703/tita-memory /tmp/tita-memory
cp -r /tmp/tita-memory/tita-learning-system/ ~/.openclaw/workspace/
```

### 2. Verificar permissões

```bash
cd ~/.openclaw/workspace/tita-learning-system/
chmod +x *.sh
ls -la *.sh
# Todos devem ter x (executável)
```

### 3. Criar arquivos iniciais

```bash
# lessons.json inicial
echo '{"lessons": [], "version": 2}' > lessons.json

# metrics.json inicial
echo '{"sessions": [], "daily": {}}' > metrics.json

# domain-scores.json inicial  
echo '{}' > domain-scores.json
```

### 4. Testar

```bash
# Registrar primeira lição
bash capture-lesson.sh \
  "Instalei o sistema de memória" \
  "Sucesso - sistema funcionando" \
  "setup"

# Ver dashboard
bash dashboard.sh
```

---

## Os 7 scripts — o que cada um faz

### 📝 `capture-lesson.sh` — PRINCIPAL
**Quando usar:** após cada tarefa completada  
**O que faz:** registra a tarefa, resultado, categoria e calcula score ELO por domínio

```bash
bash capture-lesson.sh "descrição da tarefa" "resultado" "categoria"

# Categorias sugeridas:
# ios, android, backend, frontend, debug, devops
# design, auth, database, api, squad, learning
```

**Saída:**
```
✅ Lição #12 registrada | Cat: ios | Sucesso: true
📊 Hoje: 12 tarefas | 91.7% sucesso
🏆 Top domínios: squad 6.3↑ | ios 5.6↑ | devops 5.4↑
```

---

### 🔍 `semantic-search.sh` — BUSCA
**Quando usar:** antes de uma tarefa, para ver se já fiz algo parecido  
**O que faz:** busca lições relevantes por similaridade de palavras (TF-IDF)

```bash
bash semantic-search.sh "autenticação firebase" "auth"
bash semantic-search.sh "publicar app iOS" "ios"
```

---

### 💡 `inject-context.sh` — CONTEXTO
**Quando usar:** antes de começar tarefas, para injetar lições relevantes  
**O que faz:** retorna as lições mais relevantes para a tarefa atual

```bash
bash inject-context.sh "corrigir bug de login" "auth"
# Retorna: lições passadas de auth que podem ajudar
```

---

### 📊 `dashboard.sh` — RELATÓRIO
**Quando usar:** qualquer hora para ver o estado geral  
**O que faz:** mostra score por domínio, tarefas do dia, lições aprendidas

```bash
bash dashboard.sh
```

**Saída:**
```
🧠 TITA — DASHBOARD DE MEMÓRIA E APRENDIZADO
📅 Hoje: 4 tarefas | 100% sucesso
🏆 Score por domínio:
  squad    ██████░░░░ 6.3/10 ↑
  ios      █████░░░░░ 5.6/10 ↑
  debug    █████░░░░░ 5.4/10 ↑
```

---

### 🔄 `consolidate-memory.sh` — CONSOLIDAÇÃO SEMANAL
**Quando usar:** todo domingo (ou via heartbeat automático)  
**O que faz:** LLM lê as lições da semana e atualiza MEMORY.md com insights

```bash
bash consolidate-memory.sh
```

---

### 📈 `session-score.sh` — SCORE DA SESSÃO
**Quando usar:** no fim de cada sessão de trabalho  
**O que faz:** calcula score 0-100 para a sessão atual

```bash
bash session-score.sh
```

---

## Estrutura dos arquivos de dados

### `lessons.json`
```json
{
  "version": 2,
  "lessons": [
    {
      "id": 1,
      "timestamp": "2026-03-15 10:00",
      "date": "2026-03-15",
      "time": "10:00",
      "task": "Criar tela de login com Apple Sign In",
      "result": "Sucesso - tela funcionando, token salvo no SecureStore",
      "category": "ios",
      "success": true,
      "lesson": ""
    }
  ]
}
```

### `domain-scores.json`
```json
{
  "ios": {
    "score": 5.6,
    "tasks": 4,
    "wins": 4,
    "win_rate": 100.0,
    "trend": "↑",
    "history": [1, 1, 1, 1]
  },
  "debug": {
    "score": 4.8,
    "tasks": 2,
    "wins": 1,
    "win_rate": 50.0,
    "trend": "↓",
    "history": [1, 0]
  }
}
```

---

## Integrar ao AGENTS.md (para o agente usar automaticamente)

Adicione no seu `AGENTS.md` na seção de instruções:

```markdown
## Sistema de Memória e Aprendizado

Após CADA tarefa completada, registrar obrigatoriamente:
```bash
bash ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh \
  "descrição da tarefa" \
  "resultado em 1 frase" \
  "categoria"
```

Antes de tarefas complexas, verificar lições passadas:
```bash
bash ~/.openclaw/workspace/tita-learning-system/inject-context.sh \
  "descrição da tarefa" \
  "categoria"
```
```

---

## Integrar ao HEARTBEAT.md (para rodar automaticamente)

Adicione no seu `HEARTBEAT.md`:

```markdown
## Sistema de Memória
- [ ] Verificar se há tarefas sem lição registrada
- [ ] Domingo: bash tita-learning-system/consolidate-memory.sh
- [ ] Semanalmente: bash tita-learning-system/dashboard.sh → reportar para o usuário
```

---

## Categorias recomendadas por perfil

### Para agente de desenvolvimento (como Tita):
| Categoria | Quando usar |
|-----------|-------------|
| `ios` | Apps iOS, Xcode, Expo, Swift |
| `android` | Apps Android, Kotlin, Java |
| `backend` | Node.js, APIs, banco de dados |
| `frontend` | React, Next.js, CSS |
| `debug` | Correção de bugs, troubleshooting |
| `devops` | Deploy, CI/CD, Docker, Railway |
| `auth` | Login, tokens, permissões |
| `design` | UI/UX, componentes visuais |
| `squad` | Coordenação de especialistas |
| `learning` | Pesquisa, estudo, documentação |

### Para agente de atendimento/vendas:
| Categoria | Quando usar |
|-----------|-------------|
| `cliente` | Interações com clientes |
| `proposta` | Criação de propostas |
| `followup` | Acompanhamento |
| `negociacao` | Negociação de contratos |

### Para agente de conteúdo:
| Categoria | Quando usar |
|-----------|-------------|
| `redacao` | Criação de textos |
| `social` | Posts redes sociais |
| `email` | Campanhas de email |
| `seo` | Otimização de conteúdo |

---

## O algoritmo ELO — como funciona o score

```
Score inicial: 5.0/10 por domínio

A cada tarefa:
  novo_score = score_atual + 0.3 × (resultado - score_atual/10)

onde resultado = 1.0 (sucesso) ou 0.0 (falha)

Tendência:
  ↑ = últimas 5 tarefas com >70% sucesso
  ↓ = últimas 5 tarefas com <40% sucesso  
  → = estável
```

**Interpretação:**
- `8-10` = Domínio forte, pode confiar
- `5-7` = Domínio médio, atenção em tarefas críticas
- `0-4` = Domínio fraco, pedir revisão humana

---

## Roadmap — melhorias futuras

### Implementado ✅
- [x] Captura de lições com categoria
- [x] Score ELO por domínio com tendência
- [x] Busca semântica por TF-IDF
- [x] Injeção de contexto relevante
- [x] Dashboard visual
- [x] Consolidação semanal com LLM
- [x] Integração com HEARTBEAT.md

### Próximos passos 🔄
- [ ] **ChromaDB** — busca vetorial real (mais precisa que TF-IDF)
  ```bash
  pip3 install chromadb
  # Substituir semantic-search.sh por versão com embeddings
  ```
- [ ] **LLM-as-Judge automático** — avaliar qualidade da resposta com outro LLM
- [ ] **Reflexion** — gerar lesson textual automaticamente após cada falha
- [ ] **Knowledge graph** — mapear entidades (usuários, projetos, relacionamentos)
- [ ] **Mem0 integrado** — memória multi-nível automática via API

---

## Filosofia do sistema

> *"O sistema mais sofisticado não é necessariamente o melhor — o mais auditável e controlável vence no longo prazo."*
> — Bot 1 de pesquisa, 2026-03-15

Arquivos markdown são **transparentes, versionáveis no git, editáveis manualmente e sobrevivem a qualquer troca de stack**. É por isso que esse sistema usa arquivos simples em vez de banco de dados.

O agente que tem uma boa memória de arquivos + scripts shell já está na frente de 90% das implementações mais complexas.

---

## Créditos e referências

- **Mem0** — github.com/mem0ai/mem0 (20k stars)
- **Letta/MemGPT** — github.com/cpacker/MemGPT
- **Reflexion** — Shinn et al., 2023 (verbal reinforcement learning)
- **Zep** — github.com/getzep/zep (episodic + semantic memory)
- **Implementado por:** Tita (OpenClaw agent, Titanio Films)

---

*Última atualização: 2026-03-15 | Versão: 2.0*
