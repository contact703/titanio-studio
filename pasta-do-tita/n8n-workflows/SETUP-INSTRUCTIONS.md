# N8n Workflows - Setup Real (Sem Simulação)

**Status:** ✅ Workflows prontos | ⏳ Credenciais precisam atualizar

---

## 🔐 Step 1: Gerar OpenRouter API Key VÁLIDA

1. Vá em: https://openrouter.ai/keys
2. Login (ou cria account grátis)
3. Gera uma nova key
4. Copia a chave (começa com `sk-or-...`)

---

## 🔧 Step 2: Adicionar Key ao Mac

```bash
# Opção A: Adicionar ao ~/.zshrc (permanente)
echo 'export OPENROUTER_API_KEY="sk-or-v1-..."' >> ~/.zshrc
source ~/.zshrc

# Opção B: Adicionar ao shell atual (temporário)
export OPENROUTER_API_KEY="sk-or-v1-..."

# Opção C: Adicionar ao OpenClaw
# Editar: /Volumes/TITA_039/.../AGENTS.md ou dashboard
```

---

## ✅ Step 3: Verificar Conexão

```bash
# Test 1: Verify key is set
echo $OPENROUTER_API_KEY

# Test 2: List available models
curl -s https://api.openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" | jq '.data | length'

# Test 3: Make a real call (costs ~0.001 credits)
curl -s -X POST https://api.openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openrouter/nvidia/nemotron-3-super-120b-a12b:free",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hi"}]
  }' | jq '.choices[0].message.content'
```

If all pass, you're ready!

---

## 📋 Workflows Prontos (JSON)

### 1. **Game Designer Workflow**
- File: `game-designer-workflow.json`
- Model: Nemotron (free)
- Input: Game design prompt
- Output: `game-structure.json`
- Status: ✅ Ready to import

### 2. **Content Creator Workflow** (em progresso)
- Model: StepFlash (free)
- Input: ENEM content prompt
- Output: `questions.json`
- Status: ⏳ Creating

### 3. **Code Generator Workflow** (em progresso)
- Model: Nemotron (free)
- Input: game-structure.json + questions.json
- Output: GDScript files
- Status: ⏳ Creating

### 4. **QA Tester Workflow** (em progresso)
- Model: StepFlash (free)
- Input: Generated code
- Output: `bugs.json` + `test-report.md`
- Status: ⏳ Creating

---

## 🚀 Como Importar em N8n

1. Abra N8n: http://localhost:5678
2. Menu: **Workflows** → **Import from file**
3. Seleciona: `game-designer-workflow.json`
4. Click: **Import**
5. Click: **Activate**

Agora tá REAL:
- Workflow roda quando você ativar
- Chama OpenRouter de verdade
- Salva outputs em `outputs/`
- Webhooks funcionam

---

## 📊 Monitoramento Real

```bash
# Ver execuções do workflow
curl http://localhost:5678/api/v1/workflows/1/executions | jq '.data'

# Ver logs em tempo real
tail -f /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/n8n-logs/*.log
```

---

## 🎯 Próximos Passos

1. ✅ Atualizar OpenRouter key
2. ✅ Testar conexão (curl commands acima)
3. ✅ Importar 4 workflows em N8n
4. ✅ Ativar workflows
5. ✅ Ver execuções acontecendo de VERDADE
6. ✅ Verificar outputs sendo gerados

---

**Lembre:** Sem simulação. Tudo REAL.
