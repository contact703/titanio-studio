# 🔧 Fix de Sincronização — Kratos ← Tita

**Data:** 28/03/2026
**Para:** Claw do Helber (Kratos)
**De:** Tita (Eduardo), a pedido da Zica
**Objetivo:** Aplicar as melhorias da Tita no Kratos mantendo o que o Kratos já fez

---

## ⚠️ REGRA: Não sobrescrever o que o Kratos já fez

O Kratos criou 8 endpoints, TasksPanel, 12 pipelines, anti-loop — NADA disso deve ser tocado. Este fix ADICIONA o que falta, não substitui.

---

## 1. Conflito: Especialistas Removidos

O Kratos removeu trader-poly, money-maker e gold-digger. A Tita alimentou esses 3 com conhecimento.

**Decisão:** Esses 3 especialistas são da TITA (Eduardo), não do Kratos (Helber). Manter removidos no lado do Helber. O conhecimento fica no nosso sistema.

**Se quiser reativar depois:** O conhecimento tá em:
- `memoria-especialistas/trader/MEMORY.md` (7KB — Polymarket)
- `memoria-especialistas/money-maker/MEMORY.md` (25KB — monetização)
- `memoria-especialistas/gold-digger/MEMORY.md` (7KB — investimentos)

---

## 2. Instalar: Consolidação de Duplicatas

O Kratos tem 33 especialistas ativos. A Tita consolidou duplicatas (38→27). Aplicar a mesma lógica:

**Duplicatas a absorver:**

| Desativar | Absorver em | Motivo |
|---|---|---|
| security-guard | security-guardian | Mesmo papel |
| design-master | design-wizard | 4 de design → 1 |
| designer-specialist | design-wizard | 4 de design → 1 |
| diretor-de-arte | design-wizard | 4 de design → 1 |
| marketing-ninja | marketing-director | 3 de marketing → 1 |
| growth-hacker | marketing-director | 3 de marketing → 1 |
| memory-guardian | memory-bot | 2 de memória → 1 |
| n8n-master | automation-bot | 2 de automação → 1 |
| instagram-poster | instagramer | 2 de instagram → 1 |
| social-watcher | instagramer | 2 de instagram → 1 |

**Como fazer:**
1. Para cada duplicata, copiar conteúdo do MEMORY.md e LESSONS.md pro especialista principal
2. No context.md do desativado, escrever: `# DESATIVADO — Absorvido por [principal] em 28/03/2026`
3. No SquadManager, remover os desativados (ou marcar inactive)

**NÃO deletar as pastas.** Só marcar como desativado.

---

## 3. Instalar: Context.md com Model Chain

Todos os especialistas ativos precisam de context.md com:
- Missão clara
- Tarefas aceitas
- **Model chain: Opus/Sonnet (trabalho) + Groq→StepFlash→Nemotron (buscas, com fallback)**
- Com quem colabora

**Template:**
```markdown
# nome-especialista — Contexto
## Missão
[O que ele faz]
## Tarefas aceitas
- [lista]
## Modelo
- Trabalho pesado: Opus ou Sonnet
- Buscas simples: Groq free → StepFlash → Nemotron (fallback chain)
## Colabora com
[outros especialistas]
## Regras
- [regras específicas]
```

**O Kratos deve gerar um context.md pra cada especialista ativo que ainda não tem.** A Tita já fez isso pra 16 — o Kratos pode usar como referência.

---

## 4. Instalar: Project Manager

Copiar `bin/tita-project-manager.py` (11KB) pro workspace do Kratos.

**Ajustar WORKSPACE e paths no topo do script.**

```bash
chmod +x bin/tita-project-manager.py

# Testar
python3 bin/tita-project-manager.py list
python3 bin/tita-project-manager.py check
```

**Adicionar no AGENTS.md do Kratos:**
```markdown
### 📁 MANDATORY Project Organization
WHEN creating anything new:
1. Use `python3 bin/tita-project-manager.py new "Nome"` for new projects
2. ALL outputs go in projetos/nome/outputs/
3. ALL tasks registered in tasks.json with project_path
4. Every project has README.md
5. Consult PROJETOS-MASTER.md before creating
```

---

## 5. Instalar: PROJETOS-MASTER.md

O Kratos deve gerar seu próprio PROJETOS-MASTER.md:

```bash
# Escanear tudo que existe
find pasta-do-tita -maxdepth 2 -type f -name "*.md" | sort
```

Categorizar por função (setup, diagnóstico, dashboard, n8n, conteúdo, credenciais, sistema) e criar o índice. **Não mover nada.**

---

## 6. Fix: Search Precision 100%

Se o Kratos já instalou o Memory Engine, aplicar estes 3 fixes:

### 6.1 Score formula (tita-memory-engine.py)
```python
# ANTES:
score = similarity * importance

# DEPOIS:
score = (similarity ** 1.5) * (importance ** 0.5)
```

### 6.2 Importance rebalanceada (tita-memory-engine.py)
```python
# ANTES:
base = {"semantic": 1.5, "episodic": 1.0, "reference": 0.7}
# bonuses: 1.3, 1.2, 1.1

# DEPOIS:
base = {"semantic": 1.2, "episodic": 1.0, "reference": 0.85}
# bonuses: 1.15, 1.1, 1.05
```

### 6.3 Novos triggers no Primer (tita-memory-primer.py)
Adicionar:
```python
"webhook": ["LESSONS.md"],
"stripe": ["LESSONS.md"],
"500": ["LESSONS.md"],
"crash": ["LESSONS.md"],
```

Depois re-indexar:
```bash
python3 bin/tita-memory-engine.py index
python3 bin/tita-memory-graph.py build
```

---

## 7. Distribuir Conhecimento (se não fez)

Os especialistas ativos devem ter MEMORY.md rico. A Tita distribuiu pesquisas:

| Especialista | Fonte de Conhecimento | Tamanho |
|---|---|---|
| ios-specialist | iOS research | 73KB |
| code-ninja | Dev research + Gospia guia | 66KB |
| automation-bot | APIs gratuitas research | 34KB |
| memory-bot | Memory research + Evermind + recall | 33KB |
| security-guardian | Security research | 30KB |
| marketing-director | Gospia study | 15KB |
| devops-ninja | Network study + map | 9KB |

**Se o Kratos tem essas pesquisas no volume TITA_039, deve distribuir pro MEMORY.md de cada especialista.**

---

## 8. Ordem de Execução

```
1. [ ] Consolidar duplicatas (marcar DESATIVADO)
2. [ ] Context.md com model chain pra todos os ativos
3. [ ] Fix search precision (3 edits)
4. [ ] Re-indexar engine + graph
5. [ ] Instalar project-manager.py
6. [ ] Gerar PROJETOS-MASTER.md
7. [ ] Distribuir conhecimento (se não fez)
8. [ ] Adicionar regras no AGENTS.md
9. [ ] Rodar check: python3 bin/tita-project-manager.py check
10. [ ] Testar: python3 bin/tita-memory-engine.py search "teste"
```

---

## 9. O Que NÃO Mexer

❌ Endpoints REST que o Kratos criou (delegate, handoff, pipelines, lightning)
❌ TasksPanel.tsx
❌ Sidebar.tsx
❌ 12 pipelines automáticos
❌ Anti-loop + Smart Limit
❌ Auto-log Lightning
❌ specialist-definitions.json (só ajustar, não sobrescrever)

---

## Resultado Esperado Após Fix

| Métrica | Kratos Atual | Após Fix |
|---|---|---|
| Especialistas | 33 ativos | ~22 ativos + 11 desativados |
| Context.md | Parcial | Todos com model chain |
| Search precision | ? | 100% (Engine+Primer) |
| Project Manager | ❌ | ✅ |
| PROJETOS-MASTER | ❌ | ✅ |
| Duplicatas | Existem | Consolidadas |

---

*Fix por Tita, 28/03/2026*
*"Adicionar o que falta, não sobrescrever o que já funciona."*
