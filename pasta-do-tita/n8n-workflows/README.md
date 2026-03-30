# N8n Workflows — ENEM Game Generation (Real Execution)

**Status:** ✅ 4 workflows prontos | ⏳ Aguardando OpenRouter API key válida

---

## 📋 Workflows Inclusos

| Workflow | Model | Input | Output | Status |
|----------|-------|-------|--------|--------|
| **game-designer-workflow.json** | Nemotron (free) | Game design prompt | game-structure.json | ✅ Ready |
| **content-creator-workflow.json** | StepFlash (free) | ENEM content prompt | questions.json | ✅ Ready |
| **code-generator-workflow.json** | Nemotron (free) | game-structure.json | GDScript files | ✅ Ready |
| **qa-tester-workflow.json** | StepFlash (free) | Generated code | bugs.json | ✅ Ready |

---

## 🚀 Quick Start

### 1. Setup OpenRouter API Key

```bash
# Go to: https://openrouter.ai/keys
# Generate a new key (free tier)
# Copy the key

# Add to your Mac:
echo 'export OPENROUTER_API_KEY="sk-or-v1-..."' >> ~/.zshrc
source ~/.zshrc

# Verify it works:
curl https://api.openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" | jq '.data | length'
```

### 2. Open N8n Dashboard

```bash
# Open in browser
open http://localhost:5678

# If N8n isn't running:
n8n start
```

### 3. Import Workflows

**For each workflow JSON file:**

1. In N8n: **Menu** → **Workflows** → **Import from file**
2. Select the `.json` file
3. Click **Import**
4. Click **Activate**

**Order to import:**
1. `game-designer-workflow.json` (First)
2. `content-creator-workflow.json` (Second)
3. `code-generator-workflow.json` (Third - depends on outputs from 1 & 2)
4. `qa-tester-workflow.json` (Fourth - depends on output from 3)

### 4. Run Workflows Manually (First Time)

In N8n dashboard:
1. Click on **game-designer-workflow**
2. Click **Execute Workflow**
3. Wait for execution to complete
4. Check output: `/enem-game-generation/outputs/game-structure.json`

Repeat for each workflow.

### 5. Monitor Real-Time

```bash
# Watch logs
tail -f /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/enem-game-generation/outputs/*

# Check N8n executions
curl http://localhost:5678/api/v1/workflows | jq '.'
```

---

## 📁 File Structure

```
n8n-workflows/
├── README.md (this file)
├── SETUP-INSTRUCTIONS.md
├── game-designer-workflow.json
├── content-creator-workflow.json
├── code-generator-workflow.json
├── qa-tester-workflow.json
└── imports.sh (optional: bulk import script)
```

---

## ✅ Validation Checklist

Before running:

- [ ] OpenRouter API key is set (`echo $OPENROUTER_API_KEY`)
- [ ] OpenRouter key is valid (can list models)
- [ ] N8n is running (`curl http://localhost:5678`)
- [ ] All 4 workflow JSON files exist
- [ ] Output directory exists: `/enem-game-generation/outputs/`
- [ ] Subdirectories created: `outputs/code/{managers,ui}`

---

## 🔄 Workflow Execution Flow

```
Game Designer Workflow
    ↓ (Generates game-structure.json)
    
Content Creator Workflow (parallel)
    ↓ (Generates questions.json)
    
Code Generator Workflow (waits for both)
    ├─ Reads game-structure.json
    ├─ Reads questions.json
    ↓ (Generates GDScript files)
    
QA Tester Workflow (waits for code)
    ├─ Reads generated code
    ↓ (Generates bugs.json)
    
Complete! ✅
```

---

## 📊 Expected Outputs

After each workflow runs successfully:

```
outputs/
├── game-structure.json (5-10 KB)
│   └─ Godot scene tree + game systems
│
├── questions.json (50-100 KB)
│   └─ 500+ ENEM questions with metadata
│
├── code/
│   ├── main.gd (10-15 KB)
│   ├── Player.gd (5-8 KB)
│   ├── QuestionManager.gd (4-6 KB)
│   ├── BattleSystem.gd (6-10 KB)
│   ├── UIController.gd (4-6 KB)
│   ├── GameState.gd (3-5 KB)
│   └── project.godot (2-3 KB)
│
└── bugs.json (2-5 KB)
    └─ QA test results
```

---

## 🐛 Troubleshooting

### "Authorization: Unauthorized" error
- API key is invalid or expired
- Go to https://openrouter.ai/keys and generate a new one
- Update `$OPENROUTER_API_KEY`

### "Connection timeout"
- OpenRouter API might be down
- Check: https://status.openrouter.io

### "No output file created"
- Check N8n workflow execution logs
- Verify output directory permissions: `chmod 755 outputs/`
- Check disk space: `df -h | grep Volumes`

### "JSON parsing error"
- Model response wasn't valid JSON
- Try re-running the workflow
- If persistent, increase `max_tokens` in workflow

---

## 🎯 Next Steps After Setup

1. ✅ Import all 4 workflows
2. ✅ Run Game Designer (waits ~2-3 min)
3. ✅ Run Content Creator (waits ~3-5 min)
4. ✅ Run Code Generator (waits ~2-3 min)
5. ✅ Run QA Tester (waits ~2 min)
6. ✅ Verify all outputs in `outputs/`
7. ✅ Copy code to Godot project
8. ✅ Test in Godot engine

---

## 💰 Cost Tracking

All models are **free tier**:
- StepFlash: 0 cost
- Nemotron: 0 cost
- **Total: R$ 0.00**

Monitor on N8n dashboard:
- Each execution shows tokens used
- All executions are logged

---

## 🔗 Related Files

- `OPENMOSS-ENEM-ORCHESTRATION.md` — High-level architecture
- `SETUP-INSTRUCTIONS.md` — Detailed setup guide
- `/enem-game-generation/README.md` — Complete documentation
- `/contexto-ativo.md` — Status tracking

---

**Important:** These workflows are REAL. They make actual API calls and generate real outputs. No simulation.

**Last Updated:** 2026-03-21 15:30 BRT
