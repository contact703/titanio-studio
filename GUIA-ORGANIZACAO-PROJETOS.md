# 📁 Guia de Organização de Projetos

**Data:** 28/03/2026
**Para:** Toda a equipe

---

## Problema Atual

A `pasta-do-tita/` tem **~120 arquivos soltos** na raiz — MDs, scripts, configs, tudo misturado. Quando quer achar algo, tem que procurar em 120 arquivos. Não escala.

## Estrutura Proposta

```
pasta-do-tita/
├── projetos/                    ← TODOS os projetos aqui
│   ├── jogo-enem/              ✅ já organizado
│   ├── polymarket-agent/       ✅ já existe
│   ├── titanio-dashboard/      ✅ já existe
│   ├── video-factory/          ✅ já existe
│   ├── gospia-app/             🔜 criar
│   ├── manda-a-nota/           🔜 criar
│   ├── marica-film-commission/ 🔜 criar
│   └── tikanawa/               🔜 criar
│
├── memoria-especialistas/       ← Especialistas (já organizado)
│   ├── code-ninja/
│   ├── debug-hunter/
│   └── ...
│
├── cofre/                       ← Credenciais encriptadas
│
├── setup/                       🔜 criar — MDs de setup/deploy
│   ├── AGENT-SETUP-HELBER.md
│   ├── AGENT-SETUP-TIAGO.md
│   ├── BOOTSTRAP-HELBER.md
│   └── ...
│
├── docs/                        🔜 criar — Docs gerais
│   ├── DEPLOYMENT-MANUAL.md
│   ├── GUIA-INSTALACAO-DASHBOARD.md
│   └── ...
│
├── scripts/                     🔜 criar — Scripts soltos
│   ├── bot-design-instagram.sh
│   ├── code-ninja-study-repos.sh
│   └── ...
│
├── contexto-ativo.md            ← Fica na raiz (carrega toda sessão)
├── tasks.json                   ← Fica na raiz (Dashboard usa)
├── sentinel-state.json          ← Fica na raiz (monitoring)
├── PROJETOS-MASTER.md           ← Fica na raiz (índice geral)
└── group-context-snapshot.md    ← Fica na raiz (contexto grupo)
```

---

## Regra de Ouro: Todo Projeto Tem README.md

Cada pasta de projeto DEVE ter:

```markdown
# Nome do Projeto

**Status:** ✅ Ativo | ⏸️ Parado | 📋 Planejado
**Custo:** R$ X/mês (ou R$ 0.00)
**Responsável:** especialista-principal

## O Que É
Uma linha explicando o projeto.

## Stack
Tecnologias usadas.

## Como Rodar
Comandos pra iniciar.

## Próximos Passos
- [ ] Task 1
- [ ] Task 2
```

---

## Regras de Organização na Dashboard

### 1. Uma task = um projeto
Não misturar tasks de projetos diferentes na mesma chain.

### 2. Handoff chain por competência
```
Ideia → content-writer (roteiro)
     → design-wizard (visual)
     → code-ninja (implementação)
     → debug-hunter (teste)
     → instagramer (publicação)
```

### 3. Project path na task
Toda task deve ter `project_path` apontando pra pasta:
```json
{
  "title": "Gerar 100 questões ENEM",
  "project_path": "pasta-do-tita/projetos/jogo-enem/"
}
```

### 4. Outputs SEMPRE na pasta do projeto
Nunca gerar arquivo na raiz. Sempre em `projetos/nome-do-projeto/outputs/`.

### 5. Logs por projeto
Cada projeto tem sua pasta `logs/`. Não misturar com logs gerais.

---

## Projetos Atuais e Onde Ficam

| Projeto | Pasta | Status |
|---|---|---|
| Jogo ENEM | projetos/jogo-enem/ | ⏸️ Parado |
| Polymarket Bot | projetos/polymarket-agent/ | 🟡 Monitor ativo |
| Titanio Dashboard | projetos/titanio-dashboard/ | ✅ Ativo |
| Video Factory | projetos/video-factory/ | ⏸️ Parado |
| Gospia App | projetos/gospia-app/ | 🔜 Organizar |
| Manda a Nota | projetos/manda-a-nota/ | 🔜 Organizar |
| Maricá Film Commission | projetos/marica-film-commission/ | 🔜 Organizar |
| Tikanawá | projetos/tikanawa/ | 📋 Planejado |

---

## O Que NÃO Deve Ficar na Raiz

❌ MDs de setup → `setup/`
❌ MDs de docs → `docs/`
❌ Scripts .sh → `scripts/`
❌ Arquivos de projeto → `projetos/nome/`
❌ ZIPs de release → `projetos/nome/releases/`
❌ Diagnósticos → `docs/diagnosticos/`

## O Que FICA na Raiz (máx 5-6 arquivos)

✅ contexto-ativo.md (estado atual)
✅ tasks.json (Dashboard)
✅ sentinel-state.json (monitoring)
✅ PROJETOS-MASTER.md (índice)
✅ group-context-snapshot.md (contexto grupo)

---

*Guia por Tita, 28/03/2026*
*"120 arquivos na raiz → 5. Tudo mais em pastas."*
