# ⚡ Fase 2 — Agent Lightning + Especialistas Autônomos

**Data:** 28/03/2026
**Para:** Helber (Kratos) e Tiago
**De:** Tita, a pedido da Zica

---

## O Que É Isso

Integração do **Microsoft Agent Lightning** (framework de reinforcement learning para agentes IA, 9k stars no GitHub) com nosso sistema de especialistas. O Lightning observa cada ação dos especialistas, pontua, e usa RL pra otimizar automaticamente.

**Inspiração:** Reel do @technerdstewie sobre agent-lightning

---

## Passo 0 — RESTORE POINT

```bash
WORKSPACE="$HOME/.openclaw/workspace"
BACKUP="$WORKSPACE/memory/RESTORE-POINT-$(date +%Y-%m-%d)-fase2"
mkdir -p "$BACKUP/memoria-especialistas" "$BACKUP/bin" "$BACKUP/memory"
cp -r "$WORKSPACE/pasta-do-tita/memoria-especialistas" "$BACKUP/" 2>/dev/null
cp "$WORKSPACE/bin/tita-*.py" "$WORKSPACE/bin/tita-*.sh" "$BACKUP/bin/" 2>/dev/null
cp "$WORKSPACE/MEMORY.md" "$WORKSPACE/LESSONS.md" "$BACKUP/" 2>/dev/null
echo "✅ Restore point: $BACKUP"
```

---

## Passo 1 — Instalar Agent Lightning

```bash
pip3 install --break-system-packages agentlightning
# ou em venv:
# python3 -m venv venv && source venv/bin/activate && pip install agentlightning

# Verificar
python3 -c "import agentlightning; print('v' + agentlightning.__version__)"
# Deve retornar: v0.3.0
```

---

## Passo 2 — Copiar o Bridge Script

Colocar `bin/tita-lightning-bridge.py` no workspace (10KB).

**Ajustar WORKSPACE no topo:**
```python
WORKSPACE = "/caminho/do/seu/workspace"
```

```bash
chmod +x bin/tita-lightning-bridge.py
```

**Comandos:**
```bash
# Iniciar o store
python3 bin/tita-lightning-bridge.py start-store

# Registrar uma ação
python3 bin/tita-lightning-bridge.py log <especialista> "<tarefa>" <success|fail|partial> <0-10> "[notas]"

# Ver traces
python3 bin/tita-lightning-bridge.py traces [especialista]

# Relatório de performance
python3 bin/tita-lightning-bridge.py report

# Sugestões de otimização
python3 bin/tita-lightning-bridge.py optimize <especialista>
```

---

## Passo 3 — O Que Já Está Feito (Tita)

### Especialistas Consolidados (38 → 27)
11 duplicatas absorvidas. Cada ativo tem context.md real com:
- Missão clara
- Tarefas aceitas
- Model chain: Opus/Sonnet (trabalho) + Groq→StepFlash→Nemotron (buscas, com fallback)
- Colaborações definidas

### Performance Atual (dados históricos registrados)

| Especialista | Grade | Avg Score | Tasks | Win% |
|---|---|---|---|---|
| debug-hunter | AAA 🏆 | 9.0 | 1 | 100% |
| memory-bot | AAA 🏆 | 9.0 | 1 | 100% |
| code-ninja | AA ⭐ | 8.5 | 2 | 100% |
| instagramer | AA ⭐ | 8.0 | 1 | 100% |
| ios-specialist | AA ⭐ | 8.0 | 1 | 100% |
| content-writer | A 🟢 | 7.0 | 1 | 100% |
| security-guardian | A 🟢 | 7.0 | 1 | 100% |
| automation-bot | B 🟡 | 6.0 | 1 | 0% |
| trader | B 🟡 | 5.0 | 1 | 0% |

---

## Passo 4 — Integrar no Fluxo de Trabalho

### 4.1 — Após cada tarefa de especialista, registrar:
```bash
python3 bin/tita-lightning-bridge.py log code-ninja "implementou feature X" success 8 "sem bugs"
```

### 4.2 — Revisar performance semanalmente:
```bash
python3 bin/tita-lightning-bridge.py report
```

### 4.3 — Otimizar especialistas com score baixo:
```bash
python3 bin/tita-lightning-bridge.py optimize trader
# Analisa traces, identifica padrões de falha, sugere melhorias no context.md
```

### 4.4 — Adicionar no HEARTBEAT.md:
```markdown
## Agent Lightning
- [ ] Report semanal: python3 bin/tita-lightning-bridge.py report
- [ ] Otimizar especialistas com score < 7
```

---

## Passo 5 — Conectar com Dashboard

A Dashboard já tem:
- **Tasks com handoff_chain** — usar pra registrar traces automaticamente
- **Scheduler** — cron pra report semanal
- **Agents page** — mostrar grades dos especialistas

**Integração no backend (server.js):**
Quando uma task completa no Dashboard, chamar:
```javascript
// Após task.status = 'completed'
const { execSync } = require('child_process');
execSync(`python3 bin/tita-lightning-bridge.py log "${task.assigned_to}" "${task.title}" "success" "8"`);
```

---

## Passo 6 — Grades e Metas

| Grade | Score Médio | Significado |
|---|---|---|
| AAA 🏆 | 9.0+ | Excelência — expandir responsabilidades |
| AA ⭐ | 8.0-8.9 | Muito bom — manter |
| A 🟢 | 7.0-7.9 | Bom — pequenas melhorias |
| B 🟡 | 5.0-6.9 | Regular — revisar context.md |
| C 🟠 | 3.0-4.9 | Fraco — restringir tarefas |
| D 🔴 | < 3.0 | Crítico — desativar ou reconstruir |

**Meta:** Todos os especialistas ativos em A ou acima.

---

## Stack Completo de Scripts (7 ferramentas)

| Script | Função |
|---|---|
| tita-memory-engine.py | Busca semântica vetorial |
| tita-memory-graph.py | Grafo de entidades |
| tita-memory-primer.py | Pre-flight check |
| tita-memory-score.py | Score da Tita (memória) |
| tita-memory-refresh.sh | Auto-indexação |
| tita-lightning-bridge.py | ⚡ Performance dos especialistas |
| (agentlightning) | Microsoft Agent Lightning (pip) |

---

## Reverter

```bash
bash memory/RESTORE-POINT-YYYY-MM-DD-fase2/RESTORE.sh
```

---

## Tempo Estimado

| Etapa | Tempo |
|---|---|
| Restore point | 2 min |
| pip install agentlightning | 5 min |
| Copiar bridge + ajustar | 5 min |
| Registrar dados históricos | 10 min |
| Integrar no Dashboard | 15-30 min |
| **Total** | **~40 min** |

---

*Criado por Tita, 28/03/2026*
*Inspirado pelo reel @technerdstewie sobre microsoft/agent-lightning*
*"The absolute trainer to light up AI agents."*
