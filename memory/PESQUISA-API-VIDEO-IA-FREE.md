# 🎬 PESQUISA: APIs de Text-to-Video — O que é GRÁTIS e FUNCIONA?

**Data:** 2026-03-30  
**Objetivo:** Encontrar APIs que geram vídeo REAL a partir de texto (como Kling/Hailuoai fazem), com opção gratuita ou de baixo custo.

---

## 📊 TABELA GERAL

| Serviço | Free Tier? | API Disponível? | Qualidade | Ações Complexas? | Observações |
|---------|-----------|----------------|-----------|-----------------|-------------|
| **RunwayML Gen-4.5** | ✅ 125 créditos (único) | ✅ via Replicate | ⭐⭐⭐⭐⭐ | ✅ Sim | Free = ~25s de vídeo total, depois pago |
| **Replicate + Wan 2.1** | ❌ Pay-as-you-go | ✅ API REST | ⭐⭐⭐⭐ | ✅ Sim | $0.09/s de vídeo saída |
| **Replicate + MiniMax/Hailuo** | ❌ Pay-as-you-go | ✅ API REST | ⭐⭐⭐⭐⭐ | ✅ Sim | ~$0.50 por vídeo 6s |
| **Fal.ai (via HuggingFace)** | ✅ Créditos free ao criar conta | ✅ API REST + Python | ⭐⭐⭐⭐ | ✅ Sim | Suporta Kling, Wan, CogVideoX |
| **HuggingFace Spaces** | ✅ ZeroGPU gratuito | ❌ Só web UI | ⭐⭐⭐ | ✅ Sim | Wan2.1 e CogVideoX disponíveis, fila longa |
| **HuggingFace Inference API** | ✅ Tier gratuito limitado | ✅ API REST | ⭐⭐⭐ | ✅ Sim | LTX-Video, HunyuanVideo via API |
| **Kling AI (kling.ai)** | ✅ Free com limites diários | ⚠️ API paga (klingai.com/api) | ⭐⭐⭐⭐⭐ | ✅ Sim | Web UI gratuita, API comercial |
| **Hailuoai (MiniMax)** | ✅ Créditos grátis iniciais | ✅ MiniMax API (paga) | ⭐⭐⭐⭐⭐ | ✅ Sim | Site grátis com limites, API via MiniMax |
| **Higgsfield AI** | ✅ Free tier web | ❌ Sem API pública | ⭐⭐⭐⭐⭐ | ✅ Sim | Só UI, sem API para devs |
| **RunwayML (API)** | ❌ Apenas pago | ✅ runwayml.com/api | ⭐⭐⭐⭐⭐ | ✅ Sim | API própria, sem free tier |
| **Pika Labs** | ✅ Free com marca d'água | ❌ Sem API pública estável | ⭐⭐⭐⭐ | ✅ Sim | Tem /api mas não documentada publicamente |
| **Haiper AI** | ✅ Free tier web | ❌ Sem API pública | ⭐⭐⭐ | ✅ Sim | Apenas web UI |
| **Luma Dream Machine** | ✅ Free com limites | ❌ API em beta fechado | ⭐⭐⭐⭐ | ✅ Sim | lumalabs.ai/dream-machine, API não pública |
| **Vidu Studio** | ✅ Créditos grátis | ❌ Sem API pública | ⭐⭐⭐⭐ | ✅ Sim | vidu.com, apenas web |
| **Stability AI (SVD)** | ❌ Pay-as-you-go | ✅ API oficial | ⭐⭐⭐ | ⚠️ Limitado | Image-to-video, não text-to-video puro |
| **Genmo Mochi** | ✅ Open source | ✅ Pode hospedar | ⭐⭐⭐ | ✅ Sim | Precisa GPU própria ou HuggingFace Spaces |
| **CogVideoX-5B** | ✅ HF Spaces grátis | ✅ HF Inference API | ⭐⭐⭐ | ✅ Sim | Fila em Spaces, Inference API tem limites |
| **Wan 2.1 / 2.2** | ✅ HF Spaces grátis | ✅ HF Inference API | ⭐⭐⭐⭐ | ✅ Sim | Open source, boa qualidade |
| **HunyuanVideo (Tencent)** | ✅ HF Spaces grátis | ✅ HF Inference API | ⭐⭐⭐⭐ | ✅ Sim | Open source, qualidade cinematográfica |
| **Grok Imagine Video (xAI)** | ❌ Pay-as-you-go | ✅ via Replicate | ⭐⭐⭐ | ✅ Sim | Replicate, sem free tier |
| **P-Video (PrunaAI)** | ❌ Pay-as-you-go | ✅ via Replicate | ⭐⭐⭐ | ✅ Sim | $0.02/s draft, $0.10/s full |

---

## 🏆 TOP 5 — MELHORES OPÇÕES GRÁTIS REAIS

### 1. 🥇 HuggingFace Inference API — Melhor gratuito com API
- **Free tier:** Sim, tokens gratuitos para explorar
- **Modelos disponíveis:** LTX-Video, HunyuanVideo, CogVideoX-5B (via fal.ai e providers)
- **Qualidade:** ⭐⭐⭐⭐
- **Limites:** Rate limiting no free tier, mas funciona para testes
- **API:** Sim, via `huggingface_hub` Python SDK ou REST

```python
# Python - HuggingFace Inference API (LTX-Video)
from huggingface_hub import InferenceClient

client = InferenceClient(
    provider="fal-ai",  # ou "replicate", "novita"
    api_key="hf_XXXXXX"  # token gratuito de hf.co/settings/tokens
)

video = client.text_to_video(
    "A person stands up, reaches into their pocket, pulls out a phone, and starts speaking",
    model="Lightricks/LTX-Video",
)

with open("output.mp4", "wb") as f:
    f.write(video)
```

```bash
# curl - HuggingFace Inference API
curl -X POST \
  "https://router.huggingface.co/fal-ai/text-to-video" \
  -H "Authorization: Bearer hf_XXXXXX" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": "A person stands up, reaches into their pocket, pulls out a phone, and starts talking",
    "parameters": {
      "num_frames": 48,
      "num_inference_steps": 30
    }
  }'
```

---

### 2. 🥈 RunwayML (Free 125 créditos — não renova)
- **Free tier:** 125 créditos únicos (não mensais) = ~25 segundos de Gen-4 Turbo
- **Qualidade:** ⭐⭐⭐⭐⭐ (melhor do mercado)
- **API:** Sim, via Replicate (`runwayml/gen-4.5`)
- **Limite free:** 125 créditos iniciais somente no site. API via Replicate é paga.

```python
# Replicate — RunwayML Gen-4.5
import replicate

output = replicate.run(
    "runwayml/gen-4.5",
    input={
        "prompt": "A character stands up from a chair, reaches into their jacket pocket, pulls out a smartphone, and speaks directly to camera",
        "duration": 5,
        "ratio": "1280:720"
    }
)
print(output)
```

---

### 3. 🥉 Kling AI (free credits web + API paga acessível)
- **Free tier no site:** Sim, créditos diários gratuitos em kling.ai
- **API:** Via fal.ai (paga, ~$0.20-0.50/vídeo 5s)
- **Qualidade:** ⭐⭐⭐⭐⭐ (estado da arte em 2025)

```python
# fal.ai - Kling 1.6 Pro
import fal_client

result = fal_client.subscribe(
    "fal-ai/kling-video/v1.6/pro/text-to-video",
    arguments={
        "prompt": "A person slowly rises from a chair, reaches into their pocket, takes out a phone, and speaks with visible lip movement",
        "duration": "5",
        "aspect_ratio": "16:9",
        "cfg_scale": 0.5
    }
)
print(result["video"]["url"])
```

```bash
# curl - fal.ai Kling 1.6
curl -X POST "https://queue.fal.run/fal-ai/kling-video/v1.6/pro/text-to-video" \
  -H "Authorization: Key $FAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A person stands up, takes phone from pocket, and speaks to camera",
    "duration": "5",
    "aspect_ratio": "16:9"
  }'
```

---

### 4. HuggingFace Spaces (Wan2.1 / CogVideoX) — Totalmente gratuito, sem API
- **URL:** https://huggingface.co/spaces/Wan-AI/Wan2.1
- **URL:** https://huggingface.co/spaces/zai-org/CogVideoX-5B-Space
- **Gratuito:** Sim, via ZeroGPU
- **Limitação:** Apenas UI web, sem API para chamar programaticamente (a menos que você use a Gradio API)
- **Qualidade:** ⭐⭐⭐⭐

```python
# Gradio Client — chamar HuggingFace Space como API
from gradio_client import Client

client = Client("Wan-AI/Wan2.1")
result = client.predict(
    prompt="A man stands up from a chair, pulls out his phone and dials a number",
    api_name="/generate"
)
print(result)
```

---

### 5. Replicate (Pay-as-you-go — sem free tier real)
- **Free tier:** ❌ Não tem — precisa de cartão de crédito
- **Modelos disponíveis:**
  - `minimax/video-01` (Hailuo) — ~$0.50/vídeo 6s
  - `wavespeedai/wan-2.1-i2v-480p` — $0.09/s
  - `runwayml/gen-4.5` — pago por segundo
  - `anotherjesse/zeroscope-v2-xl` — $0.083/run (mais barato, menor qualidade)
- **API:** ✅ Excelente API REST

```python
# Python - Replicate + MiniMax/Hailuo
import replicate

output = replicate.run(
    "minimax/video-01",
    input={
        "prompt": "A character stands up, reaches into their jacket pocket, pulls out a smartphone, and starts to speak",
        "duration": 6
    }
)
print(output)
```

```bash
# curl - Replicate + MiniMax/Hailuo
curl -X POST \
  "https://api.replicate.com/v1/models/minimax/video-01/predictions" \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "A person stands up, pulls a phone from their pocket, and starts speaking clearly to camera",
      "duration": 6
    }
  }'

# Verificar status (async)
curl "https://api.replicate.com/v1/predictions/{id}" \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN"
```

---

## 📋 ANÁLISE DETALHADA POR SERVIÇO

### HuggingFace Inference API + Fal.ai Provider
- **URL:** huggingface.co
- **Free:** ✅ Token gratuito, usage limitada
- **API:** ✅ via Python SDK `huggingface_hub`
- **Providers de vídeo:** Fal.ai ✅, Replicate ✅, Novita ✅
- **Modelos de vídeo via HF:** LTX-Video (Lightricks), HunyuanVideo (Tencent), CogVideoX-5B
- **Ações complexas:** ✅ Sim, modelos open-source são bons nisso
- **Notas:** O provider "HF Inference" nativo NÃO suporta text-to-video. Mas via fal-ai ou replicate como providers, funciona.

### Replicate.com
- **URL:** replicate.com
- **Free:** ❌ Sem free tier — pay-as-you-go, cartão necessário
- **API:** ✅ Excelente, REST simples
- **Modelos de vídeo:** minimax/video-01 (Hailuo), runwayml/gen-4.5, prunaai/p-video, wavespeedai/wan-2.1, anotherjesse/zeroscope-v2-xl, xai/grok-imagine-video
- **Preços referência:**
  - zeroscope: ~$0.08/run (baixa qualidade)
  - wan-2.1: $0.09/s de vídeo
  - minimax/video-01: ~$0.50 por 6s
  - p-video: $0.02/s (720p draft)

### Stability AI
- **URL:** platform.stability.ai
- **Free:** ❌ Sem free tier pós-trial
- **API:** ✅ oficial
- **Nota:** SVD (Stable Video Diffusion) faz IMAGE-to-video, não text-to-video puro. Qualidade inferior ao Kling/Hailuo.

### Higgsfield AI
- **URL:** higgsfield.ai
- **Free:** ✅ Free tier na plataforma web
- **API:** ❌ Sem API pública documentada
- **Qualidade:** ⭐⭐⭐⭐⭐ — Kling 3.0 integrado, até 15s, character consistency
- **Ações:** ✅ "Motion Control" — controle preciso de ações de personagens
- **Nota:** Excelente para usar na UI, mas sem API para automação

### Pika Labs
- **URL:** pika.art
- **Free:** ✅ Free com marca d'água
- **API:** ⚠️ Existe (pika.art/api) mas não é documentada publicamente / acesso restrito
- **Qualidade:** ⭐⭐⭐⭐

### Haiper AI
- **URL:** haiper.ai
- **Free:** ✅ Free tier existe (créditos mensais)
- **API:** ❌ Sem API pública documentada
- **Qualidade:** ⭐⭐⭐

### RunwayML Gen-3/Gen-4
- **URL:** runwayml.com
- **Free:** ✅ 125 créditos ÚNICOS (não renovam) no site
  - 125 créditos = 25s de Gen-4 Turbo OU 125s de Gen-3 Alpha Turbo
  - Plano Standard: $12/mês → 625 créditos/mês
- **API:** ✅ API REST própria (paga) + via Replicate
- **Ações complexas:** ✅ Excelente (Gen-4/Gen-4.5 é estado da arte)

### Hailuoai / MiniMax
- **URL:** hailuoai.video / minimax.io
- **Free:** ✅ Free tier no site hailuoai.video (limites diários)
- **API (MiniMax Platform):** ✅ Sim, via platform.minimaxi.com (paga por token)
- **Qualidade:** ⭐⭐⭐⭐⭐
- **Ações complexas:** ✅ Excelente — specialized em motion humano
- **Via Replicate:** `minimax/video-01` (pago)

### Vidu Studio
- **URL:** vidu.com
- **Free:** ✅ Créditos grátis ao criar conta
- **API:** ❌ Sem API pública
- **Qualidade:** ⭐⭐⭐⭐

### Kling AI
- **URL:** kling.ai
- **Free:** ✅ Free com créditos diários no site
- **API (Kling AI API):** ✅ Paga, via klingai.com/api-pricing
- **Via Fal.ai:** ✅ fal-ai/kling-video (pago ~$0.20-0.50/vídeo)
- **Qualidade:** ⭐⭐⭐⭐⭐ (topo de linha)

### Luma Dream Machine (LumaLabs)
- **URL:** lumalabs.ai/dream-machine
- **Free:** ✅ Free tier (gerações limitadas/mês)
- **API:** ⚠️ API em beta/acesso limitado (lumalabs.ai/dream-machine/api)
- **Qualidade:** ⭐⭐⭐⭐
- **Ações complexas:** ✅ Sim, bom em movimento contínuo

### Genmo Mochi-1
- **URL:** genmo.ai / HuggingFace: genmo/mochi-1-preview
- **Free:** ✅ Open source — pode rodar localmente (precisa GPU 24GB+)
- **API:** ✅ Via HuggingFace Spaces (grátis com fila) ou self-hosted
- **Qualidade:** ⭐⭐⭐

### CogVideoX-5B
- **URL:** HuggingFace: zai-org/CogVideoX-5b
- **Free:** ✅ Space "Running on Zero" = grátis via ZeroGPU
- **API:** ✅ HuggingFace Inference API (com token gratuito)
- **Via Gradio:** ✅ gradio_client para automação
- **Qualidade:** ⭐⭐⭐

### Wan 2.1 / 2.2 (Alibaba)
- **URL:** HuggingFace: Wan-AI/Wan2.1 e Wan-AI/Wan2.2-T2V-A14B
- **Free:** ✅ Space oficial "Running" no HuggingFace
- **API:** ✅ HuggingFace Inference API (token gratuito)
- **Qualidade:** ⭐⭐⭐⭐ (Wan2.1-14B é excelente para open source)
- **Ações complexas:** ✅ Sim, bom para movimentos humanos

### HunyuanVideo (Tencent)
- **URL:** HuggingFace: tencent/HunyuanVideo
- **Free:** ✅ Space grátis + Inference API gratuita
- **Qualidade:** ⭐⭐⭐⭐ (cinematográfico, alta fidelidade)
- **API:** ✅ via HuggingFace Inference API

---

## ⚡ ESTRATÉGIA RECOMENDADA (sem gastar dinheiro)

### Fase 1 — Totalmente Grátis (sem cartão)
1. **HuggingFace token gratuito** → usar Inference API com Fal.ai como provider
   - Modelos: LTX-Video, HunyuanVideo
   - Limite: rate limiting, mas funciona para prototipagem
   
2. **HuggingFace Spaces** → usar Gradio Client para automatizar
   - Wan2.1 Space: `Wan-AI/Wan2.1`
   - CogVideoX Space: `zai-org/CogVideoX-5B-Space`
   - Fila pública, mas grátis

3. **Hailuoai.video / Kling.ai / Higgsfield** → usar manualmente pela UI
   - Free tier com créditos diários
   - Sem API, mas pode testar a qualidade

### Fase 2 — Baixo custo (cartão necessário)
4. **Replicate** → `minimax/video-01` ou `prunaai/p-video`
   - MiniMax/Hailuo: ~$0.50/vídeo 6s (qualidade premium)
   - P-Video draft mode: $0.10/vídeo 5s (bom custo-benefício)
   - Ideal para produção com controle via API

5. **Fal.ai** → Kling 1.6, Wan2.1, CogVideoX
   - Créditos grátis ao criar conta
   - Depois pay-as-you-go

---

## 📦 CÓDIGO PRONTO — Scripts Funcionais

### Script Python completo — HuggingFace + múltiplos providers

```python
#!/usr/bin/env python3
"""
Text-to-Video via HuggingFace Inference Providers
Requer: pip install huggingface-hub
Token gratuito em: https://huggingface.co/settings/tokens
"""

from huggingface_hub import InferenceClient
import os

HF_TOKEN = os.environ.get("HF_TOKEN", "hf_XXXXXXXXX")

# Opção 1: via fal-ai (suporta text-to-video)
client = InferenceClient(
    provider="fal-ai",
    api_key=HF_TOKEN
)

prompt = "A man slowly stands up from a chair, reaches into his jacket pocket, pulls out a smartphone, looks at the screen, and begins speaking"

try:
    video_bytes = client.text_to_video(
        prompt,
        model="Lightricks/LTX-Video",
    )
    with open("output_ltx.mp4", "wb") as f:
        f.write(video_bytes)
    print("✅ Vídeo salvo: output_ltx.mp4")
except Exception as e:
    print(f"❌ Erro: {e}")

# Opção 2: HunyuanVideo
try:
    video_bytes2 = client.text_to_video(
        prompt,
        model="tencent/HunyuanVideo",
    )
    with open("output_hunyuan.mp4", "wb") as f:
        f.write(video_bytes2)
    print("✅ Vídeo salvo: output_hunyuan.mp4")
except Exception as e:
    print(f"❌ Erro HunyuanVideo: {e}")
```

### Script Python — Replicate (pay-as-you-go)

```python
#!/usr/bin/env python3
"""
Text-to-Video via Replicate
pip install replicate
"""
import replicate
import os
import requests

REPLICATE_TOKEN = os.environ.get("REPLICATE_API_TOKEN")

prompt = "A person stands up from a chair, reaches into their pocket, pulls out a phone, and speaks clearly to camera"

# MiniMax/Hailuo — qualidade premium ~$0.50/vídeo
output = replicate.run(
    "minimax/video-01",
    input={
        "prompt": prompt,
        "duration": 6,
    }
)

# Salvar vídeo
if output:
    url = output if isinstance(output, str) else str(output)
    response = requests.get(url)
    with open("output_hailuo.mp4", "wb") as f:
        f.write(response.content)
    print(f"✅ Hailuo vídeo salvo")

# P-Video — mais barato (~$0.10/5s draft)
output2 = replicate.run(
    "prunaai/p-video",
    input={
        "prompt": prompt,
        "duration": 5,
        "resolution": "720p",
        "draft": True  # 4x mais rápido e barato
    }
)
print(f"P-Video: {output2}")
```

### Script Python — Fal.ai (créditos grátis iniciais + Kling)

```python
#!/usr/bin/env python3
"""
Text-to-Video via fal.ai
pip install fal-client
Criar conta em fal.ai para créditos gratuitos iniciais
"""
import fal_client
import os

FAL_KEY = os.environ.get("FAL_KEY")

prompt = "A man stands up from a chair, pulls a smartphone from his jacket pocket, looks at the screen, and speaks with natural lip movement"

# Kling 1.6 Pro — qualidade cinematográfica
result = fal_client.subscribe(
    "fal-ai/kling-video/v1.6/pro/text-to-video",
    arguments={
        "prompt": prompt,
        "duration": "5",
        "aspect_ratio": "16:9",
        "cfg_scale": 0.5,
        "negative_prompt": "blurry, distorted, static"
    },
    with_logs=True
)

video_url = result["video"]["url"]
print(f"✅ Kling vídeo: {video_url}")

import requests
response = requests.get(video_url)
with open("output_kling.mp4", "wb") as f:
    f.write(response.content)
```

### Script Python — Gradio Client (HuggingFace Spaces, grátis!)

```python
#!/usr/bin/env python3
"""
Text-to-Video via HuggingFace Spaces usando Gradio Client
pip install gradio-client
Totalmente GRÁTIS — usa ZeroGPU do HuggingFace
"""
from gradio_client import Client
import shutil

prompt = "A person stands up, takes a phone from their pocket, and starts talking"

# Wan2.1 Space
try:
    client = Client("Wan-AI/Wan2.1")
    # Verificar endpoints disponíveis:
    # client.view_api()
    result = client.predict(
        prompt=prompt,
        api_name="/generate"
    )
    shutil.copy(result, "output_wan21.mp4")
    print("✅ Wan2.1 vídeo salvo")
except Exception as e:
    print(f"Wan2.1 erro: {e}")

# CogVideoX Space
try:
    client2 = Client("zai-org/CogVideoX-5B-Space")
    result2 = client2.predict(
        prompt=prompt,
        api_name="/generate_video"
    )
    shutil.copy(result2, "output_cogvideox.mp4")
    print("✅ CogVideoX vídeo salvo")
except Exception as e:
    print(f"CogVideoX erro: {e}")
```

### curl — HuggingFace Inference API (mais simples)

```bash
#!/bin/bash
# Requer: HF_TOKEN da huggingface.co/settings/tokens
export HF_TOKEN="hf_XXXXXXXXXXXXXXXX"

PROMPT="A man stands up from a chair, reaches into his jacket pocket, pulls out a smartphone, looks at the screen and begins to speak naturally"

# LTX-Video via fal-ai provider
curl -X POST \
  "https://router.huggingface.co/fal-ai/fal-ai/ltx-video" \
  -H "Authorization: Bearer $HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"inputs\": \"$PROMPT\", \"parameters\": {\"num_frames\": 65}}" \
  --output output_ltx.mp4

echo "Vídeo salvo: output_ltx.mp4"
```

---

## 🔑 ONDE CONSEGUIR AS CHAVES GRATUITAMENTE

| Serviço | URL | Como obter grátis |
|---------|-----|-------------------|
| HuggingFace Token | huggingface.co/settings/tokens | Criar conta, gerar token |
| Fal.ai Key | fal.ai/dashboard | Criar conta, créditos grátis iniciais |
| Replicate Token | replicate.com/account/api-tokens | Criar conta (cartão necessário para usar) |
| RunwayML | app.runwayml.com | Criar conta, 125 créditos únicos |
| Kling AI | kling.ai | Criar conta, créditos diários gratuitos |
| Hailuoai | hailuoai.video | Criar conta, free tier |
| Higgsfield | higgsfield.ai | Criar conta, free tier |

---

## ⚠️ NOTAS IMPORTANTES

1. **"Free" ≠ ilimitado** — todos têm quotas/limites
2. **Qualidade Kling/Hailuo >> Open Source** — para vídeos profissionais, ainda é difícil bater com modelos proprietários
3. **HuggingFace ZeroGPU** — verdadeiramente gratuito mas com fila. Para uso profissional, precisará pagar
4. **Ações complexas (levantar, pegar objeto, falar):** Todos os modelos modernos (2024+) conseguem fazer, mas Kling 1.6/3.0 e Hailuo são os melhores nisso
5. **Replicate sem free tier** — é confirmado pay-as-you-go, precisa cadastrar cartão
6. **Fal.ai tem créditos gratuitos** ao criar conta (valor não especificado publicamente, mas suficiente para testar)

---

*Última atualização: 2026-03-30*  
*Pesquisado por: Tita (subagente)*
