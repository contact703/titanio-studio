# 📁 Setup de Organização — Para Todos os Claws

**Data:** 28/03/2026
**Para:** Claw do Helber (Kratos) e Claw do Tiago
**De:** Tita, a pedido da Zica

---

## ⚠️ REGRA #1: NÃO MOVER NADA QUE JÁ EXISTE

Arquivos antigos ficam onde estão. Mover quebra referências em scripts, workflows, configs, código. **Não mexer.**

A organização é pra **daqui pra frente** + um mapa do que já existe.

---

## Passo 1 — Criar PROJETOS-MASTER.md

Este é o mapa de tudo. O Claw deve ler TUDO que existe no workspace e gerar um índice organizado.

**Criar arquivo:** `pasta-do-tita/PROJETOS-MASTER.md` (ou equivalente no seu workspace)

**Como gerar:**

```bash
# Listar tudo que existe na pasta principal
find pasta-do-tita -maxdepth 2 -type f -name "*.md" -o -name "*.sh" -o -name "*.json" -o -name "*.py" | sort
find pasta-do-tita -maxdepth 1 -type d | sort
```

**Estrutura do PROJETOS-MASTER.md:**

```markdown
# 🗺️ PROJETOS-MASTER — Mapa de Tudo

**Atualizado:** YYYY-MM-DD
**Regra:** Não mover arquivos antigos. Projetos NOVOS vão em projetos/nome/.

## 📁 Projetos em Pasta Própria
| Projeto | Pasta | Status | Especialista |
|---|---|---|---|
| Nome | projetos/nome/ | ✅/⏸️/📋 | specialist |

## 📄 Arquivos Soltos — Índice por Categoria

### 🔧 Setup & Deploy
| Arquivo | Sobre |
|---|---|
| ARQUIVO.md | Descrição curta |

### 🔍 Diagnósticos & Fixes
...

### 📊 Dashboard
...

### ⚙️ Automação & N8n
...

### 📸 Conteúdo & Social
...

### 🔐 Credenciais
...

### 🤖 Sistema & Memória
...

### 📋 Outros
...

### 📂 Subpastas
| Pasta | Sobre |
|---|---|
| pasta/ | Descrição |
```

**Dica:** Categorize por função, não por data. Se não sabe o que um arquivo faz, abra e leia a primeira linha.

---

## Passo 2 — Instalar Project Manager

Copiar o script `bin/tita-project-manager.py` (11KB) para o workspace.

**Ajustar variáveis no topo:**
```python
WORKSPACE = "/caminho/do/seu/workspace"
PROJECTS_DIR = os.path.join(WORKSPACE, "pasta-do-tita", "projetos")  # ajustar se diferente
TASKS_FILE = os.path.join(WORKSPACE, "pasta-do-tita", "tasks.json")  # ajustar se diferente
```

```bash
chmod +x bin/tita-project-manager.py
```

**Comandos:**
```bash
# Criar projeto novo (já cria pasta, README, registra na Dashboard)
python3 bin/tita-project-manager.py new "Nome do Projeto" --specialist code-ninja

# Adicionar task a um projeto
python3 bin/tita-project-manager.py task "nome-projeto" "Descrição da tarefa" --specialist debug-hunter

# Listar projetos
python3 bin/tita-project-manager.py list

# Ver status com grades
python3 bin/tita-project-manager.py status

# Verificar organização (lint)
python3 bin/tita-project-manager.py check
```

---

## Passo 3 — Regras para Daqui pra Frente

### 3.1 — Todo projeto novo vai em pasta

```
pasta-do-tita/projetos/nome-do-projeto/
├── README.md    ← OBRIGATÓRIO
├── src/         ← Código
├── outputs/     ← Outputs gerados
├── docs/        ← Documentação
├── logs/        ← Logs de execução
└── assets/      ← Imagens, vídeos, etc
```

Use o Project Manager: `python3 bin/tita-project-manager.py new "Nome"`
Ele cria tudo isso automaticamente.

### 3.2 — README.md obrigatório

Todo projeto DEVE ter README.md com:
```markdown
# Nome do Projeto

**Status:** ✅ Ativo | ⏸️ Parado | 📋 Planejado
**Criado:** YYYY-MM-DD
**Custo:** R$ X/mês
**Especialista:** nome

## O Que É
Uma frase.

## Stack
Tecnologias.

## Como Rodar
Comandos.

## Próximos Passos
- [ ] Task 1
- [ ] Task 2
```

### 3.3 — Outputs NUNCA na raiz

❌ Errado: `pasta-do-tita/resultado-analise.md`
✅ Certo: `pasta-do-tita/projetos/nome/outputs/resultado-analise.md`

### 3.4 — Tasks com project_path

Toda task no tasks.json deve ter:
```json
{
  "title": "Gerar questões ENEM",
  "project_path": "pasta-do-tita/projetos/jogo-enem/",
  "assigned_to": "content-writer"
}
```

### 3.5 — Atualizar PROJETOS-MASTER.md

Quando criar projeto novo, adicionar na tabela do PROJETOS-MASTER.md.

### 3.6 — Check semanal

Rodar 1x por semana:
```bash
python3 bin/tita-project-manager.py check
```
Meta: zero issues.

---

## Passo 4 — Adicionar no AGENTS.md

Copiar isso pro AGENTS.md do Claw:

```markdown
### 📁 MANDATORY Project Organization

WHEN creating anything new (project, feature, task):
1. Use `python3 bin/tita-project-manager.py new "Nome"` for new projects
2. ALL outputs go in projetos/nome/outputs/ — NEVER in root
3. ALL tasks get registered in tasks.json with project_path
4. Every project MUST have README.md
5. Check: `python3 bin/tita-project-manager.py check` — zero issues
6. Consult PROJETOS-MASTER.md before creating — it might already exist
```

---

## Passo 5 — Adicionar no HEARTBEAT.md

```markdown
## Organização
- [ ] Check semanal: python3 bin/tita-project-manager.py check
- [ ] PROJETOS-MASTER.md atualizado?
```

---

## Resumo

| O que | Como |
|---|---|
| Mapear o que existe | Gerar PROJETOS-MASTER.md (índice sem mover nada) |
| Criar projeto novo | `python3 bin/tita-project-manager.py new "Nome"` |
| Adicionar task | `python3 bin/tita-project-manager.py task "projeto" "tarefa"` |
| Verificar organização | `python3 bin/tita-project-manager.py check` |
| Regra de outputs | Sempre em projetos/nome/outputs/ |
| Regra de README | Todo projeto tem README.md |
| Arquivos antigos | NÃO MOVER — só indexar no PROJETOS-MASTER |

---

## Tempo Estimado

| Etapa | Tempo |
|---|---|
| Gerar PROJETOS-MASTER.md | 15-30 min (depende do tamanho do workspace) |
| Instalar project-manager | 5 min |
| Adicionar no AGENTS.md | 2 min |
| Adicionar no HEARTBEAT.md | 1 min |
| **Total** | **~25-40 min** |

---

*Guia por Tita, 28/03/2026*
*"Não mover o que já existe. Organizar o que vem a partir de agora."*
