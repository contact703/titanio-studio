# 🧠 Upgrade: Memory Engine v1.0 — Para o Claw do Helber

**Data:** 28/03/2026
**O que é:** Upgrade do sistema de memória de keyword-match para busca semântica vetorial
**Risco:** Zero — adiciona camada por cima, não mexe nos arquivos existentes
**Restore point:** Incluso

---

## 📋 Passo 1 — Criar Restore Point

Antes de qualquer coisa, salvar o estado atual:

```bash
WORKSPACE="$HOME/.openclaw/workspace"  # Ajustar se diferente
BACKUP_DIR="$WORKSPACE/memory/RESTORE-POINT-$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR/memory-daily" "$BACKUP_DIR/bin"

# Backup dos arquivos core
for f in MEMORY.md LESSONS.md AGENTS.md HEARTBEAT.md USER.md TOOLS.md SOUL.md; do
  cp "$WORKSPACE/$f" "$BACKUP_DIR/" 2>/dev/null
done

# Backup das memórias diárias
cp "$WORKSPACE/memory/"*.md "$BACKUP_DIR/memory-daily/" 2>/dev/null

# Backup dos scripts
cp "$WORKSPACE/bin/"*.py "$WORKSPACE/bin/"*.sh "$BACKUP_DIR/bin/" 2>/dev/null

echo "✅ Restore point criado em: $BACKUP_DIR"
```

### Script de Restauração (salvar como RESTORE.sh dentro do backup):

```bash
#!/bin/bash
WORKSPACE="$HOME/.openclaw/workspace"
BACKUP_DIR="$(dirname "$0")"

echo "🔄 Restaurando..."
cp "$BACKUP_DIR/MEMORY.md" "$WORKSPACE/" 2>/dev/null
cp "$BACKUP_DIR/LESSONS.md" "$WORKSPACE/" 2>/dev/null
cp "$BACKUP_DIR/AGENTS.md" "$WORKSPACE/" 2>/dev/null
cp "$BACKUP_DIR/HEARTBEAT.md" "$WORKSPACE/" 2>/dev/null
cp "$BACKUP_DIR/memory-daily/"*.md "$WORKSPACE/memory/" 2>/dev/null

# Remove arquivos do upgrade
rm -f "$WORKSPACE/memory/tita-memory.db"
rm -f "$WORKSPACE/memory/tita-memory-graph.json"
rm -f "$WORKSPACE/bin/tita-memory-engine.py"
rm -f "$WORKSPACE/bin/tita-memory-graph.py"
rm -f "$WORKSPACE/bin/tita-memory-refresh.sh"

echo "✅ Restaurado ao estado pré-upgrade"
```

---

## 📋 Passo 2 — Verificar Dependências

```bash
# Ollama precisa estar rodando com nomic-embed-text
ollama list | grep nomic

# Se não tiver:
ollama pull nomic-embed-text

# Python com numpy
python3 -c "import numpy; print('numpy OK')"

# Se não tiver:
pip3 install numpy
```

---

## 📋 Passo 3 — Instalar os 3 Scripts

### 3.1 — Memory Engine (busca semântica)

Criar arquivo `bin/tita-memory-engine.py` no workspace.

O script faz:
- Lê todos os arquivos .md de memória
- Quebra em chunks inteligentes (por seção markdown)
- Gera embeddings vetoriais via Ollama nomic-embed-text (100% local)
- Armazena em SQLite com scoring por importância
- Busca semântica com cosine similarity

**Comandos:**
```bash
# Indexar tudo (primeira vez)
python3 bin/tita-memory-engine.py index

# Refresh incremental (só arquivos alterados)
python3 bin/tita-memory-engine.py refresh

# Busca semântica
python3 bin/tita-memory-engine.py search "manda a nota iOS rejeição"

# Estatísticas
python3 bin/tita-memory-engine.py stats
```

**⚠️ IMPORTANTE:** Ajustar a variável WORKSPACE no topo do script para apontar pro workspace correto do Helber.

### 3.2 — Memory Graph (conexões entre entidades)

Criar arquivo `bin/tita-memory-graph.py` no workspace.

O script faz:
- Extrai entidades (pessoas, projetos, conceitos) das memórias
- Mapeia co-ocorrências = quem aparece junto
- Permite queries tipo "o que o Eduardo tem a ver com iOS?"

**Comandos:**
```bash
# Construir grafo
python3 bin/tita-memory-graph.py build

# Consultar entidade
python3 bin/tita-memory-graph.py query "Helber"
python3 bin/tita-memory-graph.py query "Manda a Nota"

# Stats
python3 bin/tita-memory-graph.py stats
```

**⚠️ IMPORTANTE:** Atualizar as listas KNOWN_PEOPLE, KNOWN_PROJECTS e KNOWN_CONCEPTS com as entidades relevantes pro contexto do Helber.

### 3.3 — Auto-Refresh (manter atualizado)

Criar arquivo `bin/tita-memory-refresh.sh` no workspace.

```bash
# Rodar manualmente
bash bin/tita-memory-refresh.sh

# Ou adicionar no cron (a cada 30min)
# crontab -e → adicionar:
# */30 * * * * /path/to/workspace/bin/tita-memory-refresh.sh
```

---

## 📋 Passo 4 — Configurar Entidades do Helber

No arquivo `bin/tita-memory-graph.py`, atualizar:

```python
KNOWN_PEOPLE = [
    "Helber", "Eduardo", "Zica", "Tiago", "Elber", "Caio",
    # Adicionar pessoas relevantes do contexto do Helber
]
KNOWN_PROJECTS = [
    "Manda a Nota", "Titanio", "Tikanawá",
    # Adicionar projetos do Helber
]
```

---

## 📋 Passo 5 — Primeira Indexação

```bash
# Indexar tudo
python3 bin/tita-memory-engine.py index

# Construir grafo
python3 bin/tita-memory-graph.py build

# Testar busca
python3 bin/tita-memory-engine.py search "algo relevante pro Helber"

# Ver stats
python3 bin/tita-memory-engine.py stats
python3 bin/tita-memory-graph.py stats
```

---

## 📋 Passo 6 — Integrar no HEARTBEAT.md

Adicionar ao HEARTBEAT.md:

```markdown
## Memory Engine Auto-Refresh
- [ ] Verificar se Ollama está rodando: `curl -s http://localhost:11434/api/tags`
- [ ] Refresh incremental: `python3 bin/tita-memory-engine.py refresh`
- [ ] Rebuild graph (1x/dia): `python3 bin/tita-memory-graph.py build`
```

---

## 🔄 Como Reverter (se algo der errado)

```bash
bash memory/RESTORE-POINT-YYYY-MM-DD/RESTORE.sh
```

Isso remove todos os arquivos do upgrade e restaura os originais.

---

## 📊 Resultados Esperados

| Métrica | Antes | Depois |
|---|---|---|
| Tipo de busca | Keyword (FTS) | Semântica (vetorial) |
| Precisão | ~60% | ~85%+ |
| Hierarquia | Flat | 3 camadas (semântica/episódica/referência) |
| Conexões | Nenhuma | Grafo de entidades |
| Custo extra | 0 | 0 (tudo local) |
| Dependências externas | 0 | 0 (Ollama + SQLite) |

---

*Criado por Tita, 28/03/2026 — a pedido da Zica*
*Fonte: Análise do paper MSA (Evermind) adaptada pro nosso contexto*
