# 🎮 ENEM Game Generation — OpenMOSS Orchestration

**Status:** 🚀 Ready to Launch  
**Date Started:** 2026-03-21 13:50 BRT  
**Expected Completion:** 2026-03-22 09:00 BRT  
**Total Duration:** ~12-14 hours  
**Cost:** R$ 0.00 (StepFlash + Nemotron free tier)

---

## 📋 What's This?

An **autonomous game generation system** that uses:
- **4 AI agents** working in parallel/sequence
- **2 free models** (StepFlash + Nemotron from OpenRouter)
- **Godot Engine** for the actual game
- **Zero external costs**

The agents automatically:
1. **Design** the game structure (Nemotron)
2. **Create** ENEM questions database (StepFlash)
3. **Generate** complete GDScript code (Nemotron)
4. **Test & validate** everything (StepFlash)

Result: A fully functional ENEM study game in ~12 hours.

---

## 🚀 Quick Start

### 1. Verify Prerequisites

```bash
# Check OpenRouter API key is set
echo $OPENROUTER_API_KEY

# Check Backend is running
curl http://localhost:4444/health

# Check N8n is running
curl http://localhost:5678
```

### 2. Start the Orchestration

```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/enem-game-generation

chmod +x start-orchestration.sh
bash start-orchestration.sh
```

### 3. Monitor in Real-Time

```bash
# Watch logs
tail -f logs/2026-03-21_*.log

# Or check dashboard
open http://localhost:4444/dashboard?project=enem-game
```

---

## 📁 Directory Structure

```
enem-game-generation/
├── README.md (this file)
├── orchestration.json (config & status)
├── litellm-config.yaml (LiteLLM router settings)
├── start-orchestration.sh (main runner script)
│
├── prompts/ (Agent instructions)
│   ├── game-designer.md (Game Designer Agent)
│   ├── content-creator.md (Content Creator Agent)
│   ├── code-generator.md (Code Generator Agent)
│   └── qa-tester.md (QA Tester Agent)
│
├── outputs/ (Generated files)
│   ├── game-structure.json (Game design doc)
│   ├── questions.json (500+ ENEM questions)
│   ├── code/ (GDScript source files)
│   │   ├── main.gd
│   │   ├── managers/
│   │   └── ui/
│   ├── bugs.json (QA test results)
│   └── test-report.md (Test coverage)
│
└── logs/ (Execution logs)
    ├── 2026-03-21_130000_designer.log
    ├── 2026-03-21_130000_content.log
    ├── 2026-03-21_140000_codegen.log
    └── 2026-03-21_150000_qa.log
```

---

## 🏗️ How It Works

### Phase 1: Parallel Design & Content (20 min)

```
Game Designer Agent (Nemotron)          Content Creator Agent (StepFlash)
         ↓                                         ↓
Analyzes game design requirements        Generates 500+ ENEM questions
Creates scene structure (Node2D, etc)   Formats as JSON database
Designs game systems (Combat, XP)       Adds explanations & tips
         ↓                                         ↓
    ✅ game-structure.json              ✅ questions.json
```

### Phase 2: Code Generation (30 min)

```
Code Generator Agent (Nemotron)
         ↓
Reads game-structure.json
Reads questions.json
Generates complete GDScript files:
  • main.gd (game loop)
  • Player.gd (character & progression)
  • QuestionManager.gd (load questions)
  • BattleSystem.gd (combat logic)
  • UIController.gd (menus & HUD)
  • GameState.gd (save/load)
         ↓
    ✅ /outputs/code/
```

### Phase 3: QA & Testing (15 min)

```
QA Tester Agent (StepFlash)
         ↓
Validates GDScript syntax
Checks JSON data integrity
Tests game logic correctness
Verifies all file references
Generates test report
         ↓
    ✅ bugs.json (if issues found)
    
If bugs found:
  • Send back to Code Generator
  • Auto-fix issues
  • Re-test until 0 critical bugs
```

### Phase 4: Iteration Loop (30 min)

```
bugs.json → Code Generator (fixes) → QA (re-tests) → Loop until clean
```

---

## 📊 Cost Tracking

All models are **free tier** via OpenRouter:

| Model | Daily Limit | Cost | Status |
|-------|------------|------|--------|
| **StepFlash** | ∞ | R$ 0.00 | ✅ Free |
| **Nemotron** | ∞ | R$ 0.00 | ✅ Free |
| **Total** | — | **R$ 0.00** | ✅ |

If cost somehow exceeds R$ 0.01, orchestration **automatically pauses**.

---

## 📈 Timeline

| Time | Phase | Duration | Status |
|------|-------|----------|--------|
| 13:50 | Setup + Phase 1 Start | 0 min | 🟡 In Progress |
| 14:10 | Phase 1 Complete | 20 min | ⏳ Pending |
| 14:40 | Phase 2 Complete | 30 min | ⏳ Pending |
| 15:00 | Phase 3 Complete | 15 min | ⏳ Pending |
| 15:30 | Iteration (if needed) | ~30 min | ⏳ Pending |
| **16:00** | **Final Delivery** | **2h 10 min** | ⏳ Pending |

**Optimistic:** 14:00 BRT  
**Realistic:** 16:00 BRT  
**Conservative:** 17:00 BRT

---

## 🎮 What You Get

After completion, you'll have:

### 1. Complete Game Design Document
```json
{
  "game_title": "ENEM Quest",
  "scene_tree": { /* full Godot structure */ },
  "core_systems": { /* progression, combat, inventory */ },
  "content_categories": 5,
  "difficulty_levels": 3
}
```

### 2. ENEM Questions Database
```json
{
  "total_questions": 500,
  "categories": ["Português", "Matemática", "Ciências", ...],
  "questions": [
    {
      "id": "Q001",
      "category": "português",
      "difficulty": "easy",
      "text": "...",
      "options": [ ... ],
      "correct_answer": "C",
      "explanation": "...",
      "tips": [ ... ]
    }
  ]
}
```

### 3. Complete GDScript Code
All 7 files ready to use in Godot:
- `main.gd` — Game loop & initialization
- `Player.gd` — Character progression
- `QuestionManager.gd` — Load & serve questions
- `BattleSystem.gd` — Question → Answer → Result
- `UIController.gd` — Menus & HUD
- `GameState.gd` — Save/Load
- `project.godot` — Project config

### 4. QA Test Report
```json
{
  "overall_status": "PASS",
  "tests_run": 45,
  "tests_passed": 45,
  "coverage": 83.3,
  "critical_bugs": 0
}
```

---

## 🐛 Troubleshooting

### "Connection refused on localhost:4444"
Backend isn't running. Start it:
```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard
npm start
```

### "OPENROUTER_API_KEY not set"
Add to your shell:
```bash
export OPENROUTER_API_KEY="sk-or-..."
```

### "Agents timing out"
Increase timeout in `orchestration.json`:
```json
"timeout_minutes": 30  // was 15
```

### "JSON parse error in outputs"
Check logs:
```bash
tail -100 logs/2026-03-21_*.log | grep -i error
```

---

## 📚 Next Steps After Completion

1. **Import to Godot:**
   ```bash
   # Copy code/ to Godot project directory
   cp -r outputs/code/* ~/your-godot-project/scripts/
   ```

2. **Add Assets:**
   - Use Aseprite or free pixel art tools
   - Create tiles, sprites, UI elements
   - Reference in scene structure

3. **Test Locally:**
   ```bash
   # Open Godot 4.1+
   # Load main.tscn
   # Run (F5)
   ```

4. **Export to Platforms:**
   - Android: Export Templates in Godot
   - iOS: Requires Mac + Xcode (like GospIA)
   - PC: Windows/Mac/Linux exports built-in

5. **Add Monetization (Later):**
   - In-app ads (AdMob)
   - Premium cosmetics
   - Battle pass system

---

## 🔗 Related Files

- **OPENMOSS-ENEM-ORCHESTRATION.md** — Full architecture doc
- **contexto-ativo.md** — Status updates
- **/Volumes/TITA_039/.../squad/FREE-MODELS-MAPPING.md** — Model limits
- **/Volumes/TITA_039/.../squad/SMOOTH-SWITCH-CONTEXT.md** — Fallback rules

---

## 📞 Support

**Issues?** Check logs:
```bash
cat logs/2026-03-21_*.log | grep -A5 "error\|ERROR\|fail\|FAIL"
```

**Need to stop?**
```bash
# Kill all running agents
pkill -f "orchestrate"
```

**Reset & restart:**
```bash
rm -rf outputs/* logs/*
bash start-orchestration.sh
```

---

## ✅ Success Criteria

- ✅ 0 critical bugs
- ✅ 500+ questions generated
- ✅ All GDScript files valid & complete
- ✅ QA coverage > 80%
- ✅ Total cost = R$ 0.00
- ✅ MVP playable in Godot

---

**Status:** 🚀 Ready to Launch  
**Last Updated:** 2026-03-21 13:50 BRT  
**Started by:** Zica + Tita (OpenMOSS)  
**Expected Done:** 2026-03-22 09:00 BRT
