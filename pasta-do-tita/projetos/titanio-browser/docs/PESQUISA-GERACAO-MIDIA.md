# 🎨 Pesquisa: Geração de Imagem, Vídeo e Edição por IA — 100% Local e Gratuito

**Data:** 28/03/2026
**Máquina:** Mac Mini M4, 16GB RAM, 10-core GPU (Metal 3), 6.4TB livres
**Requisito:** Sem limites, sem API paga, operável por bots, entra na pipeline

---

## 1. O Que JÁ TEMOS (zero install)

| Ferramenta | Versão | O que faz | Limite |
|---|---|---|---|
| **FFmpeg** | 8.0.1 | Edição/conversão de vídeo/áudio | ♾️ Ilimitado |
| **MoviePy** | 1.0.3 | Edição de vídeo via Python | ♾️ Ilimitado |
| **Pillow** | ✅ | Geração/edição de imagens | ♾️ Ilimitado |
| **Edge-TTS** | ✅ | Narração em PT-BR (Microsoft) | ♾️ Ilimitado* |
| **Whisper** (Ollama) | ✅ | Transcrição áudio→texto | ♾️ Ilimitado |
| **yt-dlp** | 2026.03.03 | Download vídeos | ♾️ Ilimitado |
| **gallery-dl** | 1.31.10 | Download imagens | ♾️ Ilimitado |

*Edge-TTS é gratuito da Microsoft, sem key, sem limite declarado

### Pipeline que JÁ FUNCIONA:
```
Texto → Edge-TTS (narração) → MoviePy + Pillow (imagens/texto) → FFmpeg (render final) → vídeo pronto
```
Isso é exatamente o que o instagramer já usou pra Video Factory. **Zero custo, ilimitado.**

---

## 2. Geração de IMAGENS — O Que Instalar

### 🏆 Opção 1: ComfyUI + FLUX.1-schnell (RECOMENDADO)

**ComfyUI** — Interface visual pra geração de imagens com IA
- 75k+ stars no GitHub, o mais popular
- Suporte nativo Apple Silicon (Metal 3)
- Funciona offline, sem cloud
- API REST pra automação por bots

**FLUX.1-schnell** — Modelo de imagem mais rápido da Black Forest Labs
- Qualidade altíssima (melhor que SDXL)
- 4 steps = imagem em ~10-15 segundos no M4
- **Quantizado Q4/Q5 cabe em 8GB** → roda folgado no M4 16GB
- Licença Apache 2.0 = uso livre total

**Setup:**
```bash
# Instalar ComfyUI
cd ~/
git clone https://github.com/Comfy-Org/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt

# Baixar FLUX.1-schnell quantizado (~4-6GB)
# Colocar em ComfyUI/models/unet/
# Baixar de: huggingface.co/black-forest-labs/FLUX.1-schnell

# Rodar
python main.py
# Abre http://127.0.0.1:8188
```

**Automação por bot:**
```python
import requests
# ComfyUI tem API REST
prompt = {"prompt": {...}}  # workflow JSON
requests.post("http://127.0.0.1:8188/prompt", json=prompt)
```

### Opção 2: SDXL Turbo (alternativa mais leve)
- 1 step = imagem em ~3 segundos
- ~6GB RAM
- Qualidade boa pra thumbnails e banners rápidos
- Roda via ComfyUI ou diffusers

### Opção 3: SD 1.5 (o mais leve)
- ~4GB RAM, muito rápido
- Milhares de LoRAs disponíveis
- Qualidade menor que FLUX mas suficiente pra social media

---

## 3. Geração de VÍDEO — O Que Funciona

### 🏆 Tier 1: Pipeline Automática (JÁ FUNCIONA)

A melhor opção pra M4 16GB é **não gerar vídeo com IA pesada** — e sim combinar ferramentas leves:

```
1. LLM gera roteiro (Claude/Ollama)
2. Edge-TTS narra o texto
3. Pillow gera imagens/cards com texto
4. ComfyUI gera imagens dos "cenários" (se quiser)
5. MoviePy + FFmpeg monta tudo em vídeo
```

**Resultado:** Vídeo estilo faceless YouTube / Reels com narração + imagens
**Tempo:** 2-5 minutos por vídeo
**Custo:** R$ 0.00
**Limite:** Nenhum

### Tier 2: AnimateDiff (via ComfyUI)
- Transforma imagem estática em vídeo curto (2-4 seg)
- ~8GB RAM → roda no M4
- Bom pra dar movimento a thumbnails
- Integra no ComfyUI como nó

### Tier 3: LTX-Video
- Geração de vídeo open source (~8GB)
- Qualidade decente pra clips curtos
- Roda no M4 mas é lento (~5min por clip de 3seg)

### ❌ NÃO RODA no M4 16GB:
- Wan2.1 full (precisa 24GB+)
- HunyuanVideo (precisa 24GB+)
- Mochi (apertado demais)
- Sora/Kling/Runway (cloud only, pago)

---

## 4. EDIÇÃO — Ferramentas Automáticas

### Já temos:
| Ferramenta | Automação | Uso |
|---|---|---|
| FFmpeg | ✅ CLI total | Cortar, juntar, converter, legendar, redimensionar |
| MoviePy | ✅ Python | Montar vídeos programaticamente |
| Pillow | ✅ Python | Gerar thumbnails, banners, cards |
| Edge-TTS | ✅ Python/CLI | Narração automática |
| Whisper | ✅ Ollama | Transcrição → legendas automáticas |

### Instalar (complementares):
| Ferramenta | O que faz | Install |
|---|---|---|
| **rembg** | Remove fundo de imagem (IA local) | `pip install rembg` |
| **Real-ESRGAN** | Upscale de imagem (IA local) | Via ComfyUI |
| **Subs2SRT** | Formata legendas | Já incluso no ffmpeg |

---

## 5. Stack Recomendada — Titanio Media Pipeline

```
┌─────────────────────────────────────┐
│     TITANIO MEDIA PIPELINE          │
├─────────────────────────────────────┤
│                                     │
│  IMAGEM                             │
│  ├─ Pillow (banners, cards)    ♾️   │
│  ├─ ComfyUI + FLUX.1-schnell  ♾️   │
│  └─ rembg (remover fundo)     ♾️   │
│                                     │
│  ÁUDIO                              │
│  ├─ Edge-TTS (narração PT-BR) ♾️   │
│  └─ Whisper (transcrição)     ♾️   │
│                                     │
│  VÍDEO                              │
│  ├─ MoviePy (montar)          ♾️   │
│  ├─ FFmpeg (render/converter) ♾️   │
│  └─ AnimateDiff (animar img)  ♾️   │
│                                     │
│  AUTOMAÇÃO                          │
│  ├─ Python scripts             ♾️   │
│  ├─ ComfyUI API (REST)        ♾️   │
│  └─ Pipeline CLI               ♾️   │
│                                     │
│  ♾️ = Sem limite, sem custo         │
└─────────────────────────────────────┘
```

---

## 6. Plano de Implementação

### Fase 1 — Agora (30 min)
- [ ] Instalar rembg (`pip install rembg`)
- [ ] Criar script `titanio-media.py` com funções: gerar_banner, gerar_narração, montar_video
- [ ] Testar pipeline completa: texto → narração → imagens → vídeo

### Fase 2 — Amanhã (1-2h)
- [ ] Instalar ComfyUI + FLUX.1-schnell
- [ ] Configurar API REST do ComfyUI
- [ ] Integrar geração de imagem IA na pipeline
- [ ] Testar: prompt → imagem FLUX → vídeo com narração

### Fase 3 — Semana que vem
- [ ] AnimateDiff pra dar movimento às imagens
- [ ] Pipeline completa na Dashboard (task → especialista → vídeo pronto)
- [ ] Templates pra diferentes formatos (Reels, YouTube, Stories)

---

## 7. O Que Bots Podem Fazer AGORA (sem instalar mais nada)

```python
# 1. Gerar banner com texto
from PIL import Image, ImageDraw, ImageFont
img = Image.new('RGB', (1080, 1350), '#1a1a2e')
draw = ImageDraw.Draw(img)
draw.text((50, 100), "Texto do Banner", fill='white')
img.save('banner.png')

# 2. Gerar narração
import edge_tts, asyncio
async def narrar(texto, arquivo):
    c = edge_tts.Communicate(texto, "pt-BR-AntonioNeural")
    await c.save(arquivo)
asyncio.run(narrar("Olá, este é um teste", "narração.mp3"))

# 3. Montar vídeo
from moviepy.editor import *
img_clip = ImageClip("banner.png").set_duration(5)
audio = AudioFileClip("narração.mp3")
video = img_clip.set_audio(audio)
video.write_videofile("output.mp4", fps=24)
```

**Isso tudo funciona AGORA, sem instalar nada novo, sem limite, sem custo.**

---

*Pesquisa por Tita, 28/03/2026*
*"Tudo que precisa já tá na máquina. ComfyUI + FLUX é o upgrade."*
