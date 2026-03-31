# 🆓 Dossiê APIs de IA — Março 2026
## Titânio — Configuração Completa OpenClaw

---

## ✅ CONFIGURADOS E OPERACIONAIS

### 🏠 Modelos Locais — Ollama (100% grátis, sem limite)

- DeepSeek R1 8B — reasoning, análise → `ollama/deepseek-r1:8b`
- Qwen3 8B — multilingual, chat, código → `ollama/qwen3:8b`
- Llama 3.1 8B — general purpose, 128K ctx → `ollama/llama3.1:8b`

### ⚡ Groq (PAGA — key exclusiva Kratos)

- Key: `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`
- Modelos: Llama 3.3 70B, Llama 3.1 8B Instant, Gemma 2 9B
- Velocidade: ~500 tokens/seg (mais rápido do mundo)
- Uso no OpenClaw: `groq/llama-3.3-70b-versatile`
- Status: ✅ FALLBACK PRIMÁRIO

### ⭐ Google AI Studio — Gemini (Free Tier)

- Key: `AIzaSyDrgkkb4tPiQ2g-Opm_ZIx36VWJShUeTMc`
- Conta: contact@titaniofilms.com (Tier 1 Postpay)
- Modelos: Gemini 2.5 Flash (500 req/dia), Gemini 2.5 Pro (25 req/dia)
- Context: 1M tokens (!!)
- Uso no OpenClaw: `google/gemini-2.5-flash` ou `google/gemini-2.5-pro`
- Status: ✅ CONFIGURADO + IMAGE MODEL PRIMÁRIO

### ☁️ OpenRouter Free (50 req/dia grátis)

- Key: já configurada no env (OPENROUTER_API_KEY)
- Modelos: Llama 3.3 70B, Mistral Small 3.1, Gemma 3 27B, Hermes 3 405B, Qwen3 4B
- Uso no OpenClaw: `openrouter-free/meta-llama/llama-3.3-70b-instruct:free`
- Status: ✅ CONFIGURADO

### 🧠 Cerebras (Free Tier — inferência ultra-rápida)

- Key: `csk-58c3ypejtv298wnxn2xwh9625htn35y5md696kfw6yynn3wk`
- Conta: contact@titaniofilms.com (Google login)
- Modelos: Llama 3.3 70B, Llama 3.1 8B
- Uso no OpenClaw: `cerebras/llama-3.3-70b`
- Status: ✅ CONFIGURADO

### 📊 Cohere (Trial — 1000 req/mês)

- Key: `i1mR7OVICXr1cGQzIwKVvkELB7OdbzXwex7f8R35`
- Conta: contact@titaniofilms.com (Google login)
- Modelo: Command A (256K context!)
- Uso no OpenClaw: `cohere/command-a-03-2025`
- Status: ✅ CONFIGURADO

### 🤖 Anthropic (Principal — crédito limitado!)

- Key: já configurada (ANTHROPIC_API_KEY)
- Modelos: Claude Sonnet 4, Claude Opus 4
- Status: ✅ PRIMARY (usar com economia)

---

## ⏳ PENDENTES (precisam de ação manual)

### 🇫🇷 Mistral — Precisa verificação por telefone
- URL: https://console.mistral.ai/api-keys
- Conta: contact@titaniofilms.com (Google login, org "Titanio" criada)
- Plano: Experiment (free) selecionado
- BLOQUEIO: Pede verificação por SMS → Helber precisa fazer manualmente
- Free tier: Mistral Small + Codestral

### ☁️ Cloudflare Workers AI — 10K req/dia
- URL: https://dash.cloudflare.com/
- Precisa criar conta Cloudflare com email da Titânio

### 🐙 GitHub Models — Com conta GitHub
- URL: https://github.com/marketplace/models
- Precisa conta GitHub da Titânio

---

## 🔄 Cadeia de Fallback Configurada no OpenClaw

```
Sessão principal:
1. anthropic/claude-sonnet-4-6 (primary)
2. groq/llama-3.3-70b-versatile ← PAGO, rápido
3. google/gemini-2.5-flash ← FREE, 1M ctx
4. openrouter-free/llama-3.3-70b ← FREE
5. cerebras/llama-3.3-70b ← FREE, rápido
6. cohere/command-a-03-2025 ← FREE, 256K ctx
7. ollama/qwen3:8b ← LOCAL, ilimitado

Sub-agentes (economiza Anthropic):
1. groq/llama-3.3-70b-versatile (primary!)
2. google/gemini-2.5-flash
3. cerebras/llama-3.3-70b
4. openrouter-free/llama-3.3-70b
5. ollama/qwen3:8b

Imagens:
1. google/gemini-2.5-flash (primary)
2. anthropic/claude-sonnet-4-6 (fallback)
```

---

## 📊 O Que Usar Para Quê

- Chatbot/automação → Groq Llama 70B (rápido, pago)
- Sub-agentes/tasks → Groq (primary) ou Gemini Flash (fallback)
- Análise de imagem → Gemini 2.5 Flash (1M context, visão)
- Código/debug → Groq Llama 70B ou Gemini 2.5 Pro
- Prototipar/testar → Gemini Flash (500 req/dia)
- Volume alto sem custo → Ollama local (ilimitado)
- Qualidade máxima → Anthropic Claude (economizar!)
- Documentos longos → Cohere Command A (256K ctx) ou Gemini (1M ctx)

---

## 💰 Economia Total

| Provider | Custo/mês | Configurado |
|---|---|---|
| Ollama (3 modelos) | $0 | ✅ |
| Groq (paga) | ~$5-20 | ✅ |
| Google Gemini | $0 | ✅ |
| OpenRouter Free | $0 | ✅ |
| Cerebras | $0 | ✅ |
| Cohere | $0 | ✅ |
| Anthropic | crédito atual | ✅ |

Antes: ~$100-300/mês se só Anthropic
Agora: ~$5-20/mês total (Groq) + rest FREE

---

*Atualizado por Kratos — 30/03/2026 19:30*
*"7 providers. 15+ modelos. Fallback em cascata. Zero downtime." 💪*
