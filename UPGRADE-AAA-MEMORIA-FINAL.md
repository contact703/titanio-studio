# 🏆 Memory System AAA — Guia Final de Implementação

**Data:** 28/03/2026
**Para:** Helber (Kratos) e Tiago
**De:** Tita, a pedido da Zica

---

## O Que É Isso

Upgrade completo do sistema de memória dos Claws. Transforma memória de "busca por keyword" em "cérebro semântico" com 4 camadas de proteção contra esquecimento.

**O problema que resolve:** Agente IA tem memória documentada mas NÃO CONSULTA antes de responder. Aconteceu 2x com a Tita (mandou texto em vez de arquivo mesmo tendo a regra escrita).

---

## Stack Completo (5 componentes)

```
Mensagem do usuário
       │
       ▼
┌─────────────────┐
│ 1. PRIMER        │ ← Pre-flight automático
│ Keyword triggers │   Detecta "arquivo" → injeta regra
│ Critical rules   │   Detecta "polymarket" → injeta dados
│ Semantic search  │   Roda ANTES do LLM ver a mensagem
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. LLM           │ ← Recebe mensagem + memórias injetadas
│ Claude/Opus/etc  │   Impossível ignorar o que já está no contexto
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. SCORE          │ ← Feedback: usou memória? acertou?
│ Grade tracking   │   +2 (usou+acertou) a -2 (ignorou+errou)
│ Streak counter   │   Meta: chegar em AAA
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. ENGINE         │ ← Base vetorial semântica
│ Embeddings local │   1956 chunks, 80 arquivos
│ 3 camadas        │   semântica > episódica > referência
│ Diversidade      │   Max 2 resultados por fonte
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. GRAPH          │ ← Mapa de conexões
│ Entidades        │   42 entidades, 331 conexões
│ Multi-hop        │   Pessoa → Projeto → Decisão
└─────────────────┘
```

---

## Passo 0 — CRIAR RESTORE POINT

**ANTES DE TUDO. Não pular.**

```bash
WORKSPACE="$HOME/.openclaw/workspace"
BACKUP="$WORKSPACE/memory/RESTORE-POINT-$(date +%Y-%m-%d)"
mkdir -p "$BACKUP/memory-daily" "$BACKUP/bin"

for f in MEMORY.md LESSONS.md AGENTS.md HEARTBEAT.md USER.md TOOLS.md SOUL.md; do
  cp "$WORKSPACE/$f" "$BACKUP/" 2>/dev/null
done
cp "$WORKSPACE/memory/"*.md "$BACKUP/memory-daily/" 2>/dev/null
cp "$WORKSPACE/bin/"*.py "$WORKSPACE/bin/"*.sh "$BACKUP/bin/" 2>/dev/null

# Script de restauração
cat > "$BACKUP/RESTORE.sh" << 'EOF'
#!/bin/bash
WORKSPACE="$HOME/.openclaw/workspace"
DIR="$(dirname "$0")"
for f in MEMORY.md LESSONS.md AGENTS.md HEARTBEAT.md USER.md TOOLS.md SOUL.md; do
  cp "$DIR/$f" "$WORKSPACE/" 2>/dev/null
done
cp "$DIR/memory-daily/"*.md "$WORKSPACE/memory/" 2>/dev/null
rm -f "$WORKSPACE/memory/tita-memory.db" "$WORKSPACE/memory/tita-memory-graph.json"
rm -f "$WORKSPACE/memory/tita-memory-scores.jsonl" "$WORKSPACE/memory/tita-memory-stats.json"
rm -f "$WORKSPACE/bin/tita-memory-engine.py" "$WORKSPACE/bin/tita-memory-graph.py"
rm -f "$WORKSPACE/bin/tita-memory-primer.py" "$WORKSPACE/bin/tita-memory-score.py"
rm -f "$WORKSPACE/bin/tita-memory-refresh.sh"
echo "✅ Restaurado!"
EOF
chmod +x "$BACKUP/RESTORE.sh"
echo "✅ Restore point: $BACKUP"
```

**Reverter:** `bash memory/RESTORE-POINT-YYYY-MM-DD/RESTORE.sh`

---

## Passo 1 — Verificar Dependências

```bash
# Ollama + modelo de embeddings
ollama list | grep nomic
# Se não tiver: ollama pull nomic-embed-text

# Python + numpy  
python3 -c "import numpy; print('OK')"
# Se não tiver: pip3 install numpy

# SQLite (já vem com Python)
python3 -c "import sqlite3; print('OK')"
```

---

## Passo 2 — Copiar os 5 Scripts

Colocar no diretório `bin/` do workspace:

1. `tita-memory-engine.py` — Busca semântica vetorial (14KB)
2. `tita-memory-graph.py` — Grafo de entidades (8.5KB)
3. `tita-memory-primer.py` — Pre-flight check (8KB)
4. `tita-memory-score.py` — Feedback/qualidade (6KB)
5. `tita-memory-refresh.sh` — Auto-refresh (850B)

**Em CADA script Python, ajustar a linha:**
```python
WORKSPACE = "/caminho/do/seu/workspace"
```

**No primer, ajustar KEYWORD_TRIGGERS com as entidades do seu contexto:**
```python
KNOWN_PEOPLE = ["nomes relevantes"]
KNOWN_PROJECTS = ["projetos relevantes"]
```

```bash
chmod +x bin/tita-memory-*.py bin/tita-memory-*.sh
```

---

## Passo 3 — Limpar MEMORY.md (ANTES de indexar)

Verificar e corrigir:
- [ ] Remover seções duplicadas (ex: "Auto-consolidação" repetida)
- [ ] Atualizar status de projetos (nada "pendente" que já foi feito)
- [ ] Remover informações contraditórias
- [ ] Manter seções curtas e específicas (evitar blocos de 50+ linhas)

**Regra de ouro:** Cada seção do MEMORY.md deve ter no máximo 20 linhas. Se for maior, quebrar em sub-seções.

---

## Passo 4 — Indexar e Construir

```bash
# Indexação completa
python3 bin/tita-memory-engine.py index

# Construir grafo
python3 bin/tita-memory-graph.py build

# Verificar stats
python3 bin/tita-memory-engine.py stats
python3 bin/tita-memory-graph.py stats
```

---

## Passo 5 — Testar Primer

```bash
# Deve encontrar regras críticas
python3 bin/tita-memory-primer.py "manda o arquivo aqui"

# Deve encontrar memórias de projeto
python3 bin/tita-memory-primer.py "como tá o polymarket"

# Deve encontrar lições
python3 bin/tita-memory-primer.py "tá dando erro no deploy"

# NÃO deve triggerar nada pesado
python3 bin/tita-memory-primer.py "bom dia"
```

Cada teste deve retornar contexto relevante (ou nada, no caso casual).

---

## Passo 6 — Testar Buscas (5 queries mínimo)

```bash
python3 bin/tita-memory-engine.py search "algo que você sabe a resposta"
python3 bin/tita-memory-engine.py search "nome de pessoa"
python3 bin/tita-memory-engine.py search "nome de projeto" 
python3 bin/tita-memory-engine.py search "erro que aconteceu"
python3 bin/tita-memory-engine.py search "decisão tomada"
```

Verificar:
- [ ] Top-1 é relevante?
- [ ] Resultados vêm de fontes diversas (não tudo do MEMORY.md)?
- [ ] Score semântico > 0.55 pro top-1?

---

## Passo 7 — Configurar Scoring

```bash
# Iniciar tracking (registrar interações passadas conhecidas)
python3 bin/tita-memory-score.py score "exemplo de acerto" yes yes
python3 bin/tita-memory-score.py score "exemplo de erro" no no

# Ver relatório
python3 bin/tita-memory-score.py report
```

---

## Passo 8 — Integrar no AGENTS.md

Adicionar no início do "Every Session":

```markdown
### 🧠 MANDATORY Pre-Flight Memory Check

BEFORE responding to ANY action request:
1. Check keyword triggers mentally (arquivo? projeto? pessoa? erro?)
2. If file sending → READ memory/LICAO-CRITICA-MD-ENVIO.md
3. If project mentioned → search memory for that project
4. If you've done this before → search memory for HOW
5. NEVER say "I can't" without checking memory first
```

---

## Passo 9 — Auto-Refresh no HEARTBEAT.md

Adicionar:

```markdown
## Memory Engine v2
- [ ] Refresh: python3 bin/tita-memory-engine.py refresh
- [ ] Graph (1x/dia): python3 bin/tita-memory-graph.py build
- [ ] Score report: python3 bin/tita-memory-score.py report
```

---

## Passo 10 — Validação Final

- [ ] Restore point criado e RESTORE.sh testado?
- [ ] 5 scripts instalados e executáveis?
- [ ] MEMORY.md limpo (sem duplicatas)?
- [ ] Engine indexou sem erros?
- [ ] Graph construído?
- [ ] Primer responde corretamente a 4 cenários?
- [ ] Buscas retornando resultados diversos?
- [ ] Score tracking ativo?
- [ ] AGENTS.md com pre-flight check?
- [ ] HEARTBEAT.md atualizado?

**Se TUDO ✅ → Sistema AAA**

---

## Como Chegar em AAA no Score

O score começa em D (pelas falhas históricas). Para chegar em AAA:

| Nota | Score Médio | Como chegar |
|---|---|---|
| D 🔴 | < 0.5 | Estado atual (2 falhas pesaram) |
| C 🟠 | 0.5 - 0.99 | ~5 acertos consecutivos |
| B 🟡 | 1.0 - 1.49 | ~10 acertos, 0 falhas recentes |
| A 🟢 | 1.5 - 1.79 | ~15 acertos, memória usada >90% |
| AA | 1.8 - 1.94 | ~20 acertos, 0 falhas |
| AAA 🏆 | 1.95+ | 25+ acertos, streak >20, 0 falhas |

**A chave:** O Primer injeta memória ANTES do LLM ver a mensagem. O modelo nem tem chance de ignorar. As falhas anteriores foram porque o modelo "escolhia" não buscar. Agora a busca é automática.

---

## Reverter (se algo der errado)

```bash
bash memory/RESTORE-POINT-YYYY-MM-DD/RESTORE.sh
```

---

## Tempo Estimado

| Etapa | Tempo |
|---|---|
| Restore point | 2 min |
| Deps check | 2 min |
| Copiar scripts + ajustar | 10 min |
| Limpar MEMORY.md | 15-30 min |
| Indexar + build | 5 min |
| Testar primer + buscas | 10 min |
| Configurar score + AGENTS + HEARTBEAT | 5 min |
| **Total** | **~50min - 1h** |

---

*Criado por Tita, 28/03/2026 — a pedido da Zica*
*"Sistemas integrados sempre vencem sistemas colados." — Paper MSA (Evermind)*
