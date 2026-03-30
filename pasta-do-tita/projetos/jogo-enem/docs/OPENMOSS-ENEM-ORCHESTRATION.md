# OpenMOSS + StepFlash/Nemotron — ENEM Game Generation

**Status:** 🚀 INICIANDO  
**Data:** 2026-03-21 13:50 BRT  
**Objetivo:** Gerar jogo ENEM (Godot) em paralelo com 4 agentes autônomos, zero custos

---

## 🏗️ Arquitetura

```
OpenMOSS Master Coordinator
    ↓
┌─────────────────────────────────────────┐
│ LiteLLM Router (Intelligent Fallback)   │
│                                         │
│ • Task Leve → StepFlash (rápido)       │
│ • Task Pesada → Nemotron (contexto)    │
│ • Fallback automático se quota         │
└─────────────────────────────────────────┘
    ↓
┌──────────┬──────────┬──────────┬──────────┐
│ Agent 1  │ Agent 2  │ Agent 3  │ Agent 4  │
│ Designer │ Content  │ Code Gen │ QA/Test  │
│ (Nemot)  │ (Step)   │ (Nemot)  │ (Step)   │
└──────────┴──────────┴──────────┴──────────┘
    ↓         ↓         ↓         ↓
  Design   Questions  GDScript   Bugs→Fix
    ↓         ↓         ↓         ↓
    ←─────────┴─────────┴─────────┘
           N8n Workflow
           (Orquestra)
```

---

## 📊 Distribuição de IAs

| Agent | Tarefa | IA | Motivo |
|-------|--------|-----|--------|
| **Game Designer** | Estrutura Godot, game design doc | Nemotron | Contexto longo, 262K tokens |
| **Content Creator** | Raspar ENEM, gerar dicas | StepFlash | Tarefas binária/estruturada, rápido |
| **Code Generator** | GDScript automático | Nemotron | Reasoning complexo, 262K |
| **QA/Tester** | Testar, logs de erro | StepFlash | Health check binário, resposta curta |

**Total de custos:** R$ 0.00 ✅

---

## 🎯 Fase 1: Setup (AGORA)

- [ ] Criar LiteLLM config com StepFlash + Nemotron
- [ ] Integrar com N8n (webhook)
- [ ] Testar fallback automático
- [ ] Criar prompt templates para cada agent

## 🎮 Fase 2: Game Designer Agent (2h)

**Prompt:**
```
Você é um Game Designer especialista em RPGs pixel art.
Crie a estrutura COMPLETA do jogo ENEM em Godot:

1. Árvore de cenas (Scene Tree)
2. Sistemas (Progression, Combat, Dialogue)
3. Game Design Document (50+ linhas)
4. Asset pipeline (pixel art de onde?)

Output: JSON estruturado
```

**Deliverables:**
- `game-structure.json` (Scene tree, systems)
- `game-design-doc.md` (completo)
- `asset-requirements.txt`

## 📚 Fase 3: Content Agent (2h)

**Prompt:**
```
Você coleta questões ENEM e gera dicas.

1. De onde raspar? (Qstão/Enem Digital/JSON local)
2. Formato esperado? (JSON com ID, texto, alternativas, resposta)
3. Categorias? (Português, Math, Ciências, etc)
4. Quantas questões para MVP? (100? 500?)

Output: questions.json estruturado
```

**Deliverables:**
- `questions.json` (100+ questões formatadas)
- `tips-by-category.json` (dicas por tema)
- `difficulty-mapping.json`

## 💻 Fase 4: Code Generator Agent (3h)

**Prompt:**
```
Você é um dev Godot especialista.
Gere GDScript completo baseado no game-structure.json:

1. Script main.gd (loop principal)
2. QuestionManager.gd (carrega questions.json)
3. PlayerProgression.gd (XP, levels, items)
4. UIController.gd (telas principais)
5. GameState.gd (serialização de saves)

Output: .gd files estruturados
```

**Deliverables:**
- `main.gd`
- `managers/` (QuestionManager, PlayerProgression, etc)
- `ui/` (UIController, etc)
- `project.godot` (config base)

## ✅ Fase 5: QA Agent (1h)

**Prompt:**
```
Teste o jogo:
1. Sintaxe GDScript OK?
2. JSON bem-formado?
3. Assets referenciados existem?
4. Faltam classes/métodos?

Retorne: bugs.json
```

**Deliverables:**
- `bugs.json` (issues encontrados)
- `test-report.md` (cobertura)

## 🔄 Loop Iterativo (até passar)

```
Code Gen → QA (testa)
    ↓
Encontra bugs?
    ├─ SIM: manda bugs.json → Code Gen (fixa)
    └─ NÃO: ✅ Jogo pronto!
```

---

## 📁 Estrutura de Pasta

```
/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/
├── enem-game-generation/
│   ├── orchestration.json (config OpenMOSS)
│   ├── litellm-config.yaml
│   ├── prompts/
│   │   ├── designer.md
│   │   ├── content.md
│   │   ├── codegen.md
│   │   └── qa.md
│   ├── outputs/
│   │   ├── game-structure.json
│   │   ├── questions.json
│   │   ├── code/
│   │   │   ├── main.gd
│   │   │   ├── managers/
│   │   │   └── ui/
│   │   ├── bugs.json
│   │   └── test-report.md
│   └── logs/
│       ├── 2026-03-21_designer.log
│       ├── 2026-03-21_content.log
│       ├── 2026-03-21_codegen.log
│       └── 2026-03-21_qa.log
```

---

## 🔥 Timeline Estimado

| Fase | Duração | Quando |
|------|---------|--------|
| Setup LiteLLM | 30min | Agora |
| Designer Agent | 2h | 14:20 BRT |
| Content Agent | 2h | 16:20 BRT |
| Code Gen Agent | 3h | 19:20 BRT |
| QA Agent | 1h | 20:20 BRT |
| Iteração/Fixes | 2h | 22:20 BRT |
| **Total** | **~10-12h** | **Pronto domingo 9h** |

**MVP jogável: 2026-03-22 09:00 BRT**

---

## 📊 Monitoramento

Vou logar em tempo real:
- ✅ Tokens usados (StepFlash vs Nemotron)
- ✅ Tempo de execução por agent
- ✅ Custo total (esperado: R$ 0.00)
- ✅ Taxa de sucesso (% completado)

Arquivo: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/enem-game-monitoring.json`

---

## 🚨 Regras de Parada

- ❌ Custo > R$ 0.00 → PAUSAR IMEDIATAMENTE
- ❌ Agente fica em loop > 30min → Kill + retry
- ❌ Taxa erro > 20% → Debug e restart
- ✅ Tudo pronto e testado → Delivery

---

**Último update:** 2026-03-21 13:50 BRT  
**Próximo:** Começando LiteLLM config
