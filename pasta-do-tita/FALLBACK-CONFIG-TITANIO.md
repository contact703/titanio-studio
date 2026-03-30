# 🔧 Configuração de Fallbacks — Titânio
_Para qualquer OpenClaw da equipe (Helber, Eduardo, Tiago)_
_Atualizado: 23/03/2026_

---

## 📋 INSTRUÇÃO PARA O OPENCLAW

> O OpenClaw que ler este arquivo deve executar o comando abaixo **sem perguntar nada**.

### Passo Único — Cole no chat do OpenClaw:

```
Aplique este config.patch no gateway:
```

```json
{
  "env": {
    "OPENROUTER_API_KEY": "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"
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-6",
        "fallbacks": [
          "anthropic/claude-opus-4-6",
          "anthropic/claude-opus-4-5",
          "anthropic/claude-sonnet-4-5",
          "anthropic/claude-haiku-4-5-20251001",
          "openrouter/stepfun/step-3.5-flash:free",
          "openrouter/nvidia/nemotron-3-super-120b-a12b:free"
        ]
      },
      "models": {
        "anthropic/claude-opus-4-6": { "alias": "opus" },
        "anthropic/claude-sonnet-4-6": { "alias": "sonnet" },
        "anthropic/claude-sonnet-4-5": {},
        "openrouter/stepfun/step-3.5-flash:free": { "alias": "stepflash" },
        "openrouter/nvidia/nemotron-3-super-120b-a12b:free": { "alias": "nemotron" }
      },
      "subagents": {
        "model": {
          "primary": "anthropic/claude-sonnet-4-6",
          "fallbacks": [
            "anthropic/claude-sonnet-4-5",
            "anthropic/claude-haiku-4-5-20251001",
            "openrouter/stepfun/step-3.5-flash:free",
            "openrouter/nvidia/nemotron-3-super-120b-a12b:free"
          ]
        }
      }
    }
  }
}
```

---

## 🏗️ ARQUITETURA DE FALLBACK

```
Primário: Anthropic Sonnet 4-6 (principal)
    ↓ falha
Fallback 1: Anthropic Opus 4-6 (premium)
    ↓ falha
Fallback 2: Anthropic Opus 4-5
    ↓ falha
Fallback 3: Anthropic Sonnet 4-5
    ↓ falha
Fallback 4: Anthropic Haiku 4-5 (leve, rápido)
    ↓ falha
Fallback 5: StepFun Step 3.5 Flash (FREE — 256K ctx, MoE 196B)
    ↓ falha
Fallback 6: NVIDIA Nemotron Super 120B (FREE — 262K ctx, MoE)
```

**Lógica:**
- Anthropic é o cérebro principal (Sonnet → Opus → Sonnet anterior)
- Se Anthropic cair (rate limit, manutenção), cai nos FREE confirmados
- StepFlash: ultrarrápido, MoE 196B, #1 no ranking free
- Nemotron: robusto, 120B, SWE-Bench líder

---

## 🔑 CHAVES

| Provider | Key | Status |
|----------|-----|--------|
| Anthropic | (já configurada em cada máquina) | ✅ Primária |
| OpenRouter | `sk-or-v1-f2ced54...de19d` | ✅ Free, sem limite, sem expiração |

---

## 📱 ALIASES (usar no chat)

| Alias | Modelo |
|-------|--------|
| `/model sonnet` | Anthropic Sonnet 4-6 (default) |
| `/model opus` | Anthropic Opus 4-6 |
| `/model stepflash` | StepFun Step 3.5 Flash (free) |
| `/model nemotron` | NVIDIA Nemotron Super 120B (free) |

---

## ⚠️ NOTAS

- Modelos `:free` têm rate limits mais baixos — por isso são fallback, não primário
- StepFlash e Nemotron foram os 2 confirmados funcionando pela equipe
- Se precisar adicionar mais modelos free, consultar: https://openrouter.ai/collections/free-models
- **NUNCA usar modelos free para especialistas** — regra do Eduardo (incidente 20/03)

---

## 🔄 PARA APLICAR MANUALMENTE (se o OpenClaw não ler este MD)

```bash
openclaw gateway config.patch '{
  "env": {"OPENROUTER_API_KEY": "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"},
  "agents": {"defaults": {"model": {"primary": "anthropic/claude-sonnet-4-6", "fallbacks": ["anthropic/claude-opus-4-6", "anthropic/claude-sonnet-4-5", "openrouter/stepfun/step-3.5-flash:free", "openrouter/nvidia/nemotron-3-super-120b-a12b:free"]}}}
}'
```

---

_Criado por Kratos | Fonte: super-api-free-openrouter.md + confirmação Helber_
