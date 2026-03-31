# TESTE APIs GRATUITAS DE TEXT-TO-VIDEO
**Data:** 2026-03-30
**Objetivo:** Gerar vídeo real via APIs gratuitas
**Prompt testado:** "A young woman picks up a phone from a table and starts talking"

---

## ✅ O QUE FUNCIONOU

### 🏆 hysts/zeroscope-v2 (HuggingFace Space) — SUCESSO!
- **Status:** FUNCIONANDO ✅
- **Tempo:** ~22 segundos
- **Resultado:** Vídeo gerado com sucesso
- **Arquivo salvo:** `pasta-do-tita/projetos/titanio-media/outputs/zeroscope_test.mp4` (92KB)
- **Custo:** GRÁTIS (Zero GPU / ZeroGPU)

**Código que funcionou:**
```python
from gradio_client import Client
import shutil, os

OUTPUT_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-media/outputs"
PROMPT = "A young woman picks up a phone from a table and starts talking"

client = Client("hysts/zeroscope-v2")
result = client.predict(
    prompt=PROMPT,
    seed=42,
    num_frames=24,
    num_inference_steps=25,
    api_name="/run"
)

# result = {'video': '/tmp/gradio/xxx.mp4', 'subtitles': None}
video_path = result['video']
dest = os.path.join(OUTPUT_DIR, "zeroscope_test.mp4")
shutil.copy2(video_path, dest)
print(f"Vídeo salvo: {dest}")
```

**Setup necessário:**
```bash
python3 -m venv /tmp/video-test-venv
/tmp/video-test-venv/bin/pip install gradio-client requests
```

**Limitações:** Resolução baixa (zeroscope gera 576x320), qualidade básica. Mas é GRÁTIS e rápido!

---

## ❌ O QUE NÃO FUNCIONOU

### 1. HuggingFace Inference API (api-inference.huggingface.co) — DESCONTINUADO
- **Erro:** `HTTP 410 - endpoint deprecated`
- **Mensagem:** "https://api-inference.huggingface.co is no longer supported. Please use https://router.huggingface.co instead."
- **Novo endpoint testado (router.huggingface.co):** `HTTP 401 - Unauthorized` (precisa de token)
- **Conclusão:** A API gratuita sem auth foi desativada. Agora exige HF token mesmo para modelos públicos.

### 2. zai-org/CogVideoX-2B-Space — FALHA (limite GPU)
- **Erro:** `AppError: The requested GPU duration (240s) is larger than the maximum allowed`
- **Causa:** Space usa zero-a10g mas tem limite de duração por request
- **Código testado:**
```python
client = Client("zai-org/CogVideoX-2B-Space")
result = client.predict(
    prompt=PROMPT,
    num_inference_steps=30,
    guidance_scale=6.0,
    api_name="/generate"
)
```

### 3. Wan-AI/Wan2.1 — FILA LONGA (>6 minutos)
- **Status:** Space RODANDO, API funcionando, mas fila muito grande
- **Tempo estimado de espera:** 375 segundos
- **Resposta do submit:** `({'__type__': 'update'}, 375)`
- **Conclusão:** Funciona mas não é prático para uso rápido. Possível em background com polling.
- **API disponível:**
```python
client = Client("Wan-AI/Wan2.1")
# Endpoint assíncrono: /t2v_generation_async
# Polling: /status_refresh
result = client.predict(
    prompt=PROMPT,
    size="1280*720",
    watermark_wan=False,
    seed=-1,
    api_name="/t2v_generation_async"
)
# Depois fazer polling com /status_refresh
```

### 4. fffiloni/zeroscope — PAUSADO
- **Erro:** `ValueError: The current space is in the invalid state: PAUSED`

### 5. guoyww/AnimateDiff — RUNTIME ERROR
- **Erro:** `ValueError: The current space is in the invalid state: RUNTIME_ERROR`

### 6. Replicate — SEM FREE TIER
- **Erro:** `{"title":"Unauthenticated","detail":"You did not pass an authentication token","status":401}`
- **Conclusão:** Replicate exige token e cartão de crédito, não tem free tier real.

### 7. Pikaart / Haiper API
- **Não testado:** Ambas exigem conta e não têm endpoint público gratuito.
- **Verificação:** Sites exigem signup e API key paga.

---

## 📊 RESUMO

| API / Space | Status | Tempo | Qualidade | Token? |
|-------------|--------|-------|-----------|--------|
| **hysts/zeroscope-v2** | ✅ FUNCIONA | ~22s | Básica | Não |
| Wan-AI/Wan2.1 | ⏳ Fila longa | ~6min+ | Alta | Não |
| zai-org/CogVideoX-2B | ❌ Limite GPU | N/A | Alta | Não |
| HF Inference API | ❌ Descontinuado | N/A | N/A | Precisa |
| Replicate | ❌ Pago | N/A | Alta | Sim+$$ |
| Pikaart/Haiper | ❌ Pago | N/A | Alta | Sim+$$ |

---

## 🚀 RECOMENDAÇÕES

1. **Para uso rápido (prototipagem):** Use `hysts/zeroscope-v2` via gradio-client. 22 segundos, grátis, sem auth.

2. **Para qualidade maior:** Tente Wan2.1 em horários de baixa demanda (madrugada) ou implemente polling assíncrono.

3. **Para qualidade máxima grátis:** HuggingFace agora exige token mas token GRATUITO funciona para zero-a10g spaces. Criar conta em huggingface.co e usar:
```python
from huggingface_hub import login
login(token="hf_SEU_TOKEN_AQUI")
# Depois usar CogVideoX com mais GPU budget
```

4. **Próximo passo sugerido:** Criar script de pipeline completo com zeroscope para gerar múltiplos clips rapidamente.

---

## 💾 Arquivo gerado

- **Local:** `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-media/outputs/zeroscope_test.mp4`
- **Tamanho:** 92KB
- **Duração:** 24 frames (~1-2 segundos)
- **Formato:** MP4
