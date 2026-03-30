# 🔍 Auditoria + Upgrade de Memória — Para o Claw do Tiago

**Data:** 28/03/2026
**O que é:** Auditar toda a memória existente, corrigir erros, e instalar Memory Engine v1.0
**Objetivo:** Garantir que a memória tá certa ANTES de indexar, depois indexar tudo
**Restore point:** Incluso

---

## 📋 Passo 1 — Criar Restore Point (ANTES DE TUDO)

```bash
WORKSPACE="$HOME/.openclaw/workspace"  # Ajustar se diferente
BACKUP_DIR="$WORKSPACE/memory/RESTORE-POINT-$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR/memory-daily" "$BACKUP_DIR/bin"

for f in MEMORY.md LESSONS.md AGENTS.md HEARTBEAT.md USER.md TOOLS.md SOUL.md; do
  cp "$WORKSPACE/$f" "$BACKUP_DIR/" 2>/dev/null
done
cp "$WORKSPACE/memory/"*.md "$BACKUP_DIR/memory-daily/" 2>/dev/null
cp "$WORKSPACE/bin/"*.py "$WORKSPACE/bin/"*.sh "$BACKUP_DIR/bin/" 2>/dev/null

# Criar script de restauração
cat > "$BACKUP_DIR/RESTORE.sh" << 'EOF'
#!/bin/bash
WORKSPACE="$HOME/.openclaw/workspace"
BACKUP_DIR="$(dirname "$0")"
echo "🔄 Restaurando..."
for f in MEMORY.md LESSONS.md AGENTS.md HEARTBEAT.md USER.md TOOLS.md SOUL.md; do
  cp "$BACKUP_DIR/$f" "$WORKSPACE/" 2>/dev/null && echo "  ✅ $f"
done
cp "$BACKUP_DIR/memory-daily/"*.md "$WORKSPACE/memory/" 2>/dev/null && echo "  ✅ Daily files"
rm -f "$WORKSPACE/memory/tita-memory.db" "$WORKSPACE/memory/tita-memory-graph.json"
rm -f "$WORKSPACE/bin/tita-memory-engine.py" "$WORKSPACE/bin/tita-memory-graph.py" "$WORKSPACE/bin/tita-memory-refresh.sh"
echo "✅ Restaurado!"
EOF
chmod +x "$BACKUP_DIR/RESTORE.sh"

echo "✅ Restore point criado em: $BACKUP_DIR"
```

---

## 📋 Passo 2 — AUDITORIA COMPLETA DA MEMÓRIA

Este é o trabalho principal. Antes de indexar vetorialmente, a memória precisa estar CORRETA.

### 2.1 — Auditar MEMORY.md

Ler MEMORY.md inteiro e verificar:

- [ ] **Fatos incorretos** — datas erradas, nomes trocados, status desatualizado
- [ ] **Informações duplicadas** — seções repetidas (ex: "Auto-consolidação" aparecendo várias vezes)
- [ ] **Status desatualizado** — projetos marcados como "pendente" que já foram concluídos
- [ ] **Contradições** — uma seção diz X, outra diz Y
- [ ] **Lixo** — conteúdo que não agrega valor (linhas vazias, headers órfãos)

**Para cada erro encontrado:**
1. Documentar o erro (o que dizia vs o que deveria dizer)
2. Corrigir no arquivo
3. Logar a correção em `memory/YYYY-MM-DD.md` do dia

### 2.2 — Auditar Arquivos Diários (memory/*.md)

Para cada arquivo `memory/YYYY-MM-DD.md`:

- [ ] **Verificar se os eventos registrados realmente aconteceram**
  - Cruzar com logs, git history, ou contexto do chat
- [ ] **Verificar datas** — o conteúdo bate com a data do arquivo?
- [ ] **Verificar nomes** — pessoas mencionadas são as certas?
- [ ] **Verificar status de tarefas** — "✅ feito" realmente foi feito?
- [ ] **Marcar arquivos confiáveis** — adicionar no topo: `<!-- AUDITED: OK -->`
- [ ] **Marcar arquivos com problemas** — adicionar no topo: `<!-- AUDITED: FIXED [descrição] -->`

**⚠️ NÃO DELETAR NADA.** Se algo estiver errado, corrigir e documentar. A memória é sagrada.

### 2.3 — Auditar LESSONS.md

- [ ] As lições listadas são reais? (baseadas em eventos que aconteceram)
- [ ] Alguma lição está desatualizada? (ex: "sempre fazer X" mas X mudou)
- [ ] Faltam lições importantes que deveriam estar lá?

### 2.4 — Gerar Relatório de Auditoria

Criar arquivo `memory/auditoria-YYYY-MM-DD.md`:

```markdown
# Auditoria de Memória — YYYY-MM-DD

## Resumo
- Total de arquivos auditados: X
- Erros encontrados: X
- Erros corrigidos: X
- Duplicatas removidas: X

## Erros Encontrados e Corrigidos
1. [arquivo] — [o que estava errado] → [o que foi corrigido]
2. ...

## Verificações OK
- MEMORY.md: ✅ / ⚠️ (detalhes)
- LESSONS.md: ✅ / ⚠️
- Arquivos diários: X/Y verificados

## Recomendações
- ...
```

---

## 📋 Passo 3 — Instalar Memory Engine (DEPOIS da auditoria)

Só instalar APÓS a auditoria estar completa. Não faz sentido indexar memória errada.

### 3.1 — Verificar Dependências

```bash
# Ollama com nomic-embed-text
ollama list | grep nomic
# Se não tiver: ollama pull nomic-embed-text

# Python + numpy
python3 -c "import numpy; print('OK')"
# Se não tiver: pip3 install numpy
```

### 3.2 — Copiar os 3 Scripts para bin/

Os scripts são:
1. `bin/tita-memory-engine.py` — Motor de busca semântica
2. `bin/tita-memory-graph.py` — Grafo de conexões
3. `bin/tita-memory-refresh.sh` — Auto-refresh

**⚠️ IMPORTANTE:** Em cada script, ajustar a variável WORKSPACE:
```python
WORKSPACE = "/caminho/correto/do/workspace/do/tiago"
```

### 3.3 — Atualizar Entidades no Graph

No `bin/tita-memory-graph.py`, atualizar as listas com as entidades do contexto do Tiago:

```python
KNOWN_PEOPLE = [
    # Adicionar pessoas relevantes
]
KNOWN_PROJECTS = [
    # Adicionar projetos relevantes
]
```

### 3.4 — Primeira Indexação (com memória limpa!)

```bash
# Indexar tudo
python3 bin/tita-memory-engine.py index

# Construir grafo
python3 bin/tita-memory-graph.py build

# Verificar stats
python3 bin/tita-memory-engine.py stats
python3 bin/tita-memory-graph.py stats
```

### 3.5 — Testar Busca Semântica

Rodar pelo menos 5 buscas de teste:

```bash
# Testar com temas que você sabe a resposta certa
python3 bin/tita-memory-engine.py search "o que aconteceu em [data específica]"
python3 bin/tita-memory-engine.py search "[nome de projeto]"
python3 bin/tita-memory-engine.py search "[nome de pessoa] e [projeto]"
python3 bin/tita-memory-engine.py search "erro que aconteceu em [situação]"
python3 bin/tita-memory-engine.py search "decisão sobre [tema]"
```

Para cada busca, verificar:
- [ ] O resultado #1 é relevante?
- [ ] Os resultados fazem sentido semântico?
- [ ] Memórias mais importantes aparecem primeiro?

---

## 📋 Passo 4 — Integrar no HEARTBEAT.md

Adicionar:

```markdown
## Memory Engine
- [ ] Refresh: `python3 bin/tita-memory-engine.py refresh`
- [ ] Graph rebuild (1x/dia): `python3 bin/tita-memory-graph.py build`
```

---

## 📋 Passo 5 — Validação Final

Checklist final:

- [ ] Restore point criado e testado (`bash RESTORE.sh` funciona?)
- [ ] Auditoria completa (relatório gerado)
- [ ] Todos os erros corrigidos e documentados
- [ ] Memory Engine indexou sem erros
- [ ] Memory Graph construído
- [ ] Buscas semânticas retornando resultados corretos
- [ ] Auto-refresh configurado
- [ ] HEARTBEAT.md atualizado

---

## 🔄 Como Reverter

```bash
bash memory/RESTORE-POINT-YYYY-MM-DD/RESTORE.sh
```

---

## ⏱️ Estimativa de Tempo

| Etapa | Tempo |
|---|---|
| Restore point | 2 min |
| Auditoria MEMORY.md | 15-30 min |
| Auditoria arquivos diários | 30-60 min (depende da quantidade) |
| Auditoria LESSONS.md | 5-10 min |
| Relatório de auditoria | 10 min |
| Instalação Memory Engine | 5 min |
| Testes de busca | 10 min |
| **Total** | **~1h30 - 2h** |

---

*Criado por Tita, 28/03/2026 — a pedido da Zica*
*Filosofia: Memória certa primeiro, memória rápida depois.*
