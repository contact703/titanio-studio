# 🎮 ENEM Game Workflow — Visual Architecture

**Data:** 2026-03-22 19:32 BRT

---

## 📊 WORKFLOW DIAGRAM

```
                          🎮 GAME START
                              ↓
                    Trigger — Week Start
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   🧠 Research           🎨 Design            🎯 Content
        ↓                     ↓                     ↓
   ┌────────┐           ┌────────┐            ┌────────┐
   │ ENEM   │           │ RPG    │            │ Pixel  │
   │ Bot 1  │           │ Bot 2  │            │ Bot 3  │
   └────────┘           └────────┘            └────────┘
        ↓                     ↓                     ↓
   50 ENEM              GDD + Plot           Art Assets
   Questions           + Characters          Specs
        ↓                     ↓                     ↓
        └─────────────────────┼─────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  + Dev Bot 4     │
                    │  + QA Bot 5      │
                    └──────────────────┘
                              ↓
                    Consolidate Results
                              ↓
                    Integration Bot
                    (Combina TUDO)
                              ↓
                    Save to File
                              ↓
                    🎮 Game Completo
                    (Código + Art + Conteúdo)
```

---

## 🔀 PARALLELISM FLOW

```
Trigger
  ├─ BOT 1 (ENEM) ────────────┐
  ├─ BOT 2 (RPG) ─────────────┤
  ├─ BOT 3 (ART) ─────────────┼─→ [Consolidate] → [Integrate] → [Save]
  ├─ BOT 4 (DEV) ─────────────┤
  └─ BOT 5 (QA) ──────────────┘

⏱️  Tudo roda EM PARALELO
    Não aguarda um terminar pra começar outro!
    Muito mais rápido que sequencial
```

---

## 🤖 5 BOTS EM DETALHES

### BOT 1 — 🧠 ENEM Researcher
```
Input:   "Research ENEM topics"
Model:   Qwen 2.5 32B (Ollama)
Output:  {
  "questions": [
    {
      "id": 1,
      "topic": "Matemática",
      "question": "...",
      "options": [...],
      "correctAnswer": "B",
      "explanation": "..."
    },
    ... (50 total)
  ]
}
Time:    ~2-3 min
```

### BOT 2 — 🎨 RPG/Game Designer
```
Input:   "Design RPG game with ENEM context"
Model:   Qwen 2.5 32B
Output:  {
  "gameTitle": "ENEM Quest RPG",
  "plot": "...",
  "characters": [
    {"name": "Professor", "role": "quest-giver"},
    ...
  ],
  "quests": [...],
  "progressionSystem": {...}
}
Time:    ~2-3 min
```

### BOT 3 — 🎨 Pixel Art Designer
```
Input:   "Create pixel art specs for retro game"
Model:   Qwen 2.5 32B
Output:  {
  "sprites": {
    "character_1": {
      "size": "16x16",
      "frames": 4,
      "description": "idle, walk, attack, damage"
    },
    ...
  },
  "tileset": {...},
  "colorPalette": [...]
}
Time:    ~2-3 min
```

### BOT 4 — 💻 Developer/Coder
```
Input:   "Generate complete game engine code"
Model:   Qwen 2.5 32B
Output:  {
  "components": {
    "GameCanvas": "React component...",
    "HUD": "...",
    "DialogueBox": "...",
    "InventorySystem": "..."
  },
  "gameEngine": {
    "gameLoop": "...",
    "update": "...",
    "render": "..."
  },
  "scenes": [...]
}
Time:    ~3-4 min
```

### BOT 5 — ✅ QA Tester
```
Input:   "Create comprehensive test cases"
Model:   Qwen 2.5 32B
Output:  {
  "testCases": [
    {
      "id": "TC-001",
      "description": "User starts game",
      "expectedResult": "Main menu appears",
      "priority": "CRITICAL"
    },
    ... (40 total)
  ]
}
Time:    ~2-3 min
```

---

## 🔗 CONSOLIDATION LOGIC

```
All 5 outputs arrive at Consolidate Results
         ↓
      Format to table
         ↓
   Send to Integration Bot
         ↓
Integration Bot says:
"Vejo 50 questões ENEM,
 1 game design completo,
 pixel art specs,
 código de game engine,
 40 test cases.
 Vou juntar tudo numa
 estrutura unificada..."
         ↓
    Integration Output:
    {
      "enemQuestions": [...],
      "gameDesign": {...},
      "pixelArtSpecs": {...},
      "gameCode": {...},
      "testCases": [...],
      "integratedGame": {
        "title": "ENEM Quest RPG",
        "description": "...",
        "deployment": "..."
      }
    }
```

---

## ⏱️ TIMELINE

```
T+0:00    Trigger dispara
T+0:05    5 bots começam em paralelo
T+2:00    Bot 1 termina (ENEM)
T+2:30    Bot 2 termina (RPG)
T+3:00    Bot 3 termina (Art)
T+3:30    Bot 4 termina (Dev)
T+4:00    Bot 5 termina (QA)
T+4:10    Consolidate processa
T+4:20    Integration Bot processa
T+4:30    Save to file
T+4:35    ✅ Jogo Pronto!

Total: ~5 minutos de processamento
(Tempo exato depende da máquina)
```

---

## 📦 FILE OUTPUTS

```
/pasta-do-tita/
├─ enem-game-output-final.json (GRANDE - contém tudo)
├─ enem-questions.json (Bot 1)
├─ game-design-doc.json (Bot 2)
├─ pixel-art-specs.json (Bot 3)
├─ game-code.ts (Bot 4)
└─ qa-test-cases.json (Bot 5)
```

---

## 🎯 DATA FLOW

```
Trigger
  ↓
  ├→ HTTP POST to Ollama (Bot 1) ────→ JSON response ─┐
  ├→ HTTP POST to Ollama (Bot 2) ────→ JSON response ─┤
  ├→ HTTP POST to Ollama (Bot 3) ────→ JSON response ─┼→ [Consolidate]
  ├→ HTTP POST to Ollama (Bot 4) ────→ JSON response ─┤
  └→ HTTP POST to Ollama (Bot 5) ────→ JSON response ─┘
                                            ↓
                                    Combine 5 JSONs
                                            ↓
                                    Integration Bot
                                            ↓
                                    Final JSON
                                            ↓
                                    Save to disk
```

---

## 🔄 PARALLELISM ADVANTAGE

### Sequencial (SEM parallelismo)
```
Bot 1: 3 min
Bot 2: 3 min
Bot 3: 3 min
Bot 4: 4 min
Bot 5: 3 min
────────────
TOTAL: 16 minutos ❌
```

### Paralelo (COM parallelismo)
```
Bot 1: 3 min ─┐
Bot 2: 3 min ─┼─→ Tudo junto = 4 min ✅
Bot 3: 3 min ─┤
Bot 4: 4 min ─┘
Bot 5: 3 min ─┘

TOTAL: ~4 minutos (com consolidation)
```

**Economia: 12 minutos = 75% mais rápido!**

---

## 🚀 EXECUTION MODES

### Mode 1: Manual (Clica Execute)
```
1. Abrir N8n (http://5678)
2. Workflow ativado
3. Clica "Execute" (play button)
4. Aguarda ~5 min
5. Resultado pronto
```

### Mode 2: Scheduled (Todo dia)
```
Cron: 0 0 * * * (midnight)
Ou: 0 9 * * 0 (Sunday 9am)
→ Workflow roda automático
→ Resultado salvo
```

### Mode 2: Webhook
```
POST /webhook/enem-game
→ Inicia workflow remotamente
→ Status em real-time
→ Resultado via webhook callback
```

---

## 📊 MONITORING

```
N8n Dashboard mostra:
├─ Todos 5 bots rodando (green indicators)
├─ % completo cada um
├─ Tempo decorrido
├─ Mensagens em tempo real
└─ Resultado final (expandir JSON)
```

---

## 🎮 DEPOIS DO WORKFLOW

**Você tem 1 arquivo JSON gigante com:**

✅ 50 questões ENEM (prontas pra estudar)  
✅ Game Design completo (plot, chars, quests)  
✅ Pixel art specifications (sprite sheets)  
✅ Game engine code (React components prontos)  
✅ 40 test cases (QA automático)  

**Próximo passo:** Escolha 1 caminho:

1. **Renderizar:** Pega game-code.ts, integra em React, npm start
2. **Publicar:** Pega enem-questions, importa em Moodle/Canvas
3. **Criar arte:** Pega pixel-art-specs, abre Aseprite, draw
4. **Testar:** Pega qa-test-cases, implementa em Cypress

---

## 💡 POSSIBILIDADES

### v2.0 (Próxima iteração)
```
Mesma workflow mas:
- Mais questões ENEM (100+)
- Personagens mais detalhados
- Múltiplos idiomas
- Mobile version specs
- Multiplayer mechanics
```

### v3.0 (Futuro)
```
Adicionar bots:
- Compositor (música)
- Localizador (traduções)
- Marketing specialist (promocionar jogo)
- Influencer (criar trailer)
```

---

**Status:** ✅ Workflow pronto pra executar  
**Próximo passo:** Abrir N8n e clicar "Execute"

