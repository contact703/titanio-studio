# 🎬 Pesquisa: Vídeo IA Real com Personagem Animado
**Data:** 2026-03-30
**Hardware:** Mac Mini M2, 16GB RAM, macOS ARM64, MPS (Metal Performance Shaders)
**Disco:** 6.3TB livre

---

## 📊 Tabela Comparativa

| Solução | Tipo | macOS ARM64? | RAM 16GB? | Modelos (GB) | Qualidade | Tempo/vídeo | Personagem Animado? | Licença |
|---------|------|:------------:|:---------:|:------------:|:---------:|:-----------:|:-------------------:|---------|
| **LivePortrait** ⭐ | Portrait Animation | ✅ OFICIAL | ✅ ~4GB | ~0.8GB | ⭐⭐⭐⭐ | 10-30s | ✅ Expressões faciais | MIT |
| **SadTalker** | Talking Head (áudio) | ⚠️ Com fixes | ✅ ~6GB | ~1.5GB | ⭐⭐⭐ | 30-60s | ✅ Lábios + cabeça | Apache 2.0 |
| **Wan2.1 T2V-1.3B** | Text-to-Video | ⚠️ Requer hacks | ⚠️ Apertado | ~5GB | ⭐⭐⭐⭐⭐ | 10-20min | ✅ Vídeo completo | Apache 2.0 |
| **AnimateDiff** | Animate Images (SD) | ✅ Via ComfyUI | ⚠️ Apertado | ~2-4GB (+ SD) | ⭐⭐⭐ | 3-10min | ⚠️ Movimentos sutis | Apache 2.0 |
| **MuseTalk** | Lip Sync (áudio) | ❌ CUDA only | ✅ ~4GB | ~2GB | ⭐⭐⭐⭐ | Real-time (GPU) | ✅ Lábios precisos | MIT |
| **Stable Video Diffusion** | Image-to-Video | ✅ Via ComfyUI | ⚠️ ~10GB | ~9.6GB | ⭐⭐⭐⭐ | 5-15min | ⚠️ Movimento sutil | Stability License |
| **CogVideoX** | Text-to-Video | ❌ CUDA focused | ❌ 16GB+ | ~10-20GB | ⭐⭐⭐⭐ | 10-30min | ✅ Vídeo completo | Apache 2.0 |
| **Open-Sora** | Text-to-Video | ❌ Multi-GPU | ❌ 24GB+ | ~5-20GB | ⭐⭐⭐⭐ | 15-30min | ✅ Vídeo completo | Apache 2.0 |

---

## 🔍 Análise Detalhada por Solução

### 1. ⭐ LivePortrait (RECOMENDAÇÃO #1)
**GitHub:** https://github.com/KlingAIResearch/LivePortrait
**Status:** ✅ MELHOR OPÇÃO para nosso setup

- **Suporte macOS:** OFICIAL desde julho 2024 (PR #143). Tem `requirements_macOS.txt` específico
- **Como funciona:** Pega uma foto de rosto + vídeo de driving (ou áudio) → anima o retrato com expressões faciais realistas
- **Modelos:** ~800MB total (muito leve!)
- **RAM:** ~4GB durante inferência
- **Velocidade:** 10-30 segundos para gerar animação
- **Qualidade:** Excelente - expressões faciais naturais, stitching suave
- **Extras:** Suporta humanos, gatos e cães; modo de edição de pose; video-to-video
- **Adotado por:** Kuaishou, Douyin, Jianying, WeChat Channels
- **Licença:** MIT (totalmente livre)

**Por que é o #1:**
- Suporte OFICIAL ao Apple Silicon
- Modelos minúsculos (~800MB)
- Extremamente rápido (segundos, não minutos)
- Gera personagem animado DE VERDADE
- Integra com ComfyUI via AdvancedLivePortrait node

### 2. SadTalker (RECOMENDAÇÃO #2 - Talking Head com Áudio)
**GitHub:** https://github.com/OpenTalker/SadTalker
**Status:** ✅ Funciona com ajustes

- **Suporte macOS:** Não oficial, mas funciona. Precisa reinstalar dlib (`pip install dlib`) para evitar "Illegal Hardware Error" no M1/M2
- **Como funciona:** Foto + áudio → vídeo de talking head com movimentos de lábios e cabeça
- **Modelos:** ~1.5GB (checkpoints + GFPGAN face enhancer)
- **RAM:** ~6GB durante inferência
- **Velocidade:** 30-60 segundos por clipe
- **Qualidade:** Boa - lábios sincronizados com áudio, movimentos naturais de cabeça
- **Licença:** Apache 2.0

**Ideal para:** Narração com personagem falando (integra com edge-tts!)

### 3. Wan2.1 T2V-1.3B (Para vídeo generativo completo)
**GitHub:** https://github.com/Wan-Video/Wan2.1 (já clonado!)
**Status:** ⚠️ Experimental no Mac

- **Suporte macOS:** Não oficial. Requer `flash_attn` que é CUDA-only. Necessário substituir por `torch.nn.functional.scaled_dot_product_attention` ou rodar sem flash attention
- **Modelo 1.3B:** ~5GB download, precisa 8.19GB VRAM mínimo
- **RAM:** Apertado com 16GB (modelo + VAE + text encoder)
- **Velocidade:** ~4min no RTX 4090, estimativa 15-30min no M2 via MPS
- **Qualidade:** SOTA - melhor que muitos modelos comerciais
- **Resolução:** 480P (5 segundos de vídeo)
- **Integração:** Já integrado ao ComfyUI e Diffusers

**Problema principal:** `flash_attn` dependency. Precisa de patch para rodar no MPS.

### 4. AnimateDiff (via ComfyUI)
**GitHub:** https://github.com/guoyww/AnimateDiff
**Status:** ✅ Funciona via ComfyUI

- **Suporte macOS:** Funciona via ComfyUI que já suporta MPS
- **Como funciona:** Anima imagens estáticas geradas por SD/SDXL com motion modules
- **Modelos:** ~2-4GB (motion module + SD model base)
- **RAM:** Apertado - precisa carregar SD + motion module
- **Velocidade:** 3-10 minutos dependendo dos frames
- **Qualidade:** Média - movimentos sutis, pode parecer "dreamy"

**Nota:** Já temos ComfyUI rodando com FLUX.1-schnell, mas AnimateDiff funciona com SD 1.5/SDXL

### 5. MuseTalk (Lip Sync de Alta Qualidade)
**GitHub:** https://github.com/TMElyralab/MuseTalk
**Status:** ❌ NÃO recomendado para Mac

- **Problema:** Depende fortemente de CUDA. Real-time inference otimizado para NVIDIA V100
- **Modelo baseado em:** Stable Diffusion v1-4 UNet + Whisper-tiny
- **Qualidade:** Excelente lip sync (30fps+)
- **Versão 1.5:** Lançada março 2025, com GAN loss e sync loss

**Veredicto:** Excepcional mas CUDA-only. Não vale o esforço de portar para MPS.

### 6. Stable Video Diffusion (SVD)
**HuggingFace:** stabilityai/stable-video-diffusion-img2vid-xt
**Status:** ⚠️ Possível via ComfyUI

- **Como funciona:** Imagem → 25 frames de vídeo (576x1024)
- **Modelos:** ~9.6GB (pesado!)
- **RAM:** Precisa ~10GB VRAM mínimo
- **Velocidade:** 5-15 minutos
- **Problema:** Modelos grandes demais para 16GB RAM confortável

### 7. CogVideoX
**Status:** ❌ NÃO recomendado

- Focado em CUDA/NVIDIA
- Modelos de 10-20GB
- Requer 16GB+ VRAM dedicada
- Não tem suporte MPS

### 8. Open-Sora
**GitHub:** https://github.com/hpcaitech/Open-Sora
**Status:** ❌ NÃO recomendado

- Open-Sora 2.0 = 11B parâmetros (muito grande)
- Open-Sora 1.3 = 1B (menor, mas ainda focado em multi-GPU)
- Treinado e otimizado para clusters NVIDIA
- Sem suporte Apple Silicon

---

## 🏆 RECOMENDAÇÃO FINAL

### Pipeline Recomendada (3 camadas):

```
┌─────────────────────────────────────────────────────┐
│  CAMADA 1: LivePortrait (INSTALAR PRIMEIRO)         │
│  Foto + driving video → Personagem animado          │
│  ~800MB modelos, 10-30s por clipe                   │
├─────────────────────────────────────────────────────┤
│  CAMADA 2: SadTalker (INSTALAR SEGUNDO)             │
│  Foto + áudio (edge-tts) → Talking head             │
│  ~1.5GB modelos, 30-60s por clipe                   │
├─────────────────────────────────────────────────────┤
│  CAMADA 3: Wan2.1 1.3B (EXPERIMENTAL)               │
│  Texto → Vídeo generativo completo                  │
│  ~5GB modelos, 15-30min por clipe                   │
│  Requer patch flash_attn → MPS                      │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Comandos de Instalação

### Camada 1: LivePortrait (⭐ PRIORIDADE MÁXIMA)

```bash
# 1. Clonar
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace
git clone https://github.com/KlingAIResearch/LivePortrait.git
cd LivePortrait

# 2. Criar ambiente
conda create -n LivePortrait python=3.10
conda activate LivePortrait

# 3. Instalar dependências (arquivo específico para macOS!)
pip install -r requirements_macOS.txt

# 4. Baixar modelos (automático no primeiro uso, ~800MB)
# Ou manualmente:
# huggingface-cli download KlingTeam/LivePortrait --local-dir pretrained_weights

# 5. Testar
python inference.py -s assets/examples/source/s1.jpg -d assets/examples/driving/d1.mp4
```

### Camada 2: SadTalker

```bash
# 1. Clonar
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace
git clone https://github.com/OpenTalker/SadTalker.git
cd SadTalker

# 2. Criar ambiente
conda create -n sadtalker python=3.10
conda activate sadtalker

# 3. Instalar PyTorch para Mac
pip install torch torchvision torchaudio

# 4. Fix para Apple Silicon (CRÍTICO!)
pip install dlib

# 5. Instalar ffmpeg
brew install ffmpeg  # ou conda install ffmpeg

# 6. Instalar dependências
pip install -r requirements.txt

# 7. Baixar checkpoints (~1.5GB)
bash scripts/download_models.sh

# 8. Testar com áudio gerado pelo edge-tts
python inference.py --driven_audio examples/driven_audio/bus_chinese.wav \
  --source_image examples/source_image/full_body_2.png \
  --enhancer gfpgan --still
```

### Camada 3: Wan2.1 (Experimental)

```bash
# 1. Já temos o repo clonado!
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/Wan2.1

# 2. Criar ambiente
conda create -n wan21 python=3.10
conda activate wan21

# 3. Instalar PyTorch para Mac
pip install torch torchvision torchaudio

# 4. Instalar dependências (EXCETO flash_attn)
pip install diffusers transformers accelerate tqdm imageio easydict ftfy imageio-ffmpeg numpy gradio opencv-python tokenizers

# 5. Baixar modelo 1.3B (~5GB)
pip install "huggingface_hub[cli]"
huggingface-cli download Wan-AI/Wan2.1-T2V-1.3B --local-dir ./Wan2.1-T2V-1.3B

# 6. Patch para funcionar sem flash_attn (MPS)
# Editar wan/modules/attention.py:
# Substituir: from flash_attn import flash_attn_func
# Por: flash_attn_func = None  # Use PyTorch native SDPA
# E usar torch.nn.functional.scaled_dot_product_attention no lugar

# 7. Testar (via diffusers - mais fácil que o código nativo)
python -c "
import torch
from diffusers import WanPipeline
pipe = WanPipeline.from_pretrained('Wan-AI/Wan2.1-T2V-1.3B', torch_dtype=torch.float16)
pipe = pipe.to('mps')
video = pipe('A person walking in the park, sunny day', num_frames=25).frames[0]
"
```

---

## 🔗 Integração com Pipeline titanio-media.py

### Fluxo proposto:

```python
# titanio-media.py - Módulo de vídeo IA

import subprocess
import os

class VideoAIGenerator:
    def __init__(self):
        self.workspace = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
    
    def generate_talking_head(self, image_path, audio_path, output_path):
        """
        Gera talking head usando SadTalker
        image_path: foto do personagem
        audio_path: áudio gerado por edge-tts
        output_path: vídeo final
        """
        cmd = [
            "conda", "run", "-n", "sadtalker", "python",
            f"{self.workspace}/SadTalker/inference.py",
            "--driven_audio", audio_path,
            "--source_image", image_path,
            "--result_dir", os.path.dirname(output_path),
            "--enhancer", "gfpgan",
            "--still"
        ]
        subprocess.run(cmd, check=True)
    
    def animate_portrait(self, source_image, driving_video, output_path):
        """
        Anima retrato usando LivePortrait
        source_image: foto do personagem
        driving_video: vídeo de referência para expressões
        output_path: vídeo animado
        """
        cmd = [
            "conda", "run", "-n", "LivePortrait", "python",
            f"{self.workspace}/LivePortrait/inference.py",
            "-s", source_image,
            "-d", driving_video,
            "-o", output_path
        ]
        subprocess.run(cmd, check=True)
    
    def generate_narration_video(self, text, character_image, output_path, voice="pt-BR-AntonioNeural"):
        """
        Pipeline completa: texto → áudio → talking head
        1. Gera áudio com edge-tts
        2. Gera vídeo com SadTalker
        """
        import edge_tts
        import asyncio
        
        # 1. Gerar áudio
        audio_path = output_path.replace(".mp4", "_audio.mp3")
        async def gen_audio():
            communicate = edge_tts.Communicate(text, voice)
            await communicate.save(audio_path)
        asyncio.run(gen_audio())
        
        # 2. Gerar talking head
        self.generate_talking_head(character_image, audio_path, output_path)
        
        return output_path
```

---

## 📝 Notas Importantes

1. **LivePortrait** é a escolha #1 porque:
   - Suporte OFICIAL ao Apple Silicon (macOS)
   - Modelos leves (~800MB)
   - Muito rápido (10-30s)
   - Qualidade excelente
   - Adotado por plataformas de bilhões de usuários

2. **SadTalker** complementa perfeitamente:
   - Especializado em audio-driven (talking head)
   - Integra com edge-tts que já temos
   - Fix simples para Apple Silicon (reinstalar dlib)

3. **Wan2.1** é experimental mas promissor:
   - Já temos o repo clonado
   - Modelo 1.3B cabe na RAM (com aperto)
   - Precisa de patch para flash_attn
   - Qualidade SOTA quando funciona

4. **Evitar:** MuseTalk, CogVideoX, Open-Sora (todos CUDA-only ou muito pesados)

5. **ComfyUI:** AnimateDiff e SVD são possíveis via ComfyUI que já roda, mas são mais lentos e menos naturais para personagens falantes

---

## ⏭️ Próximos Passos

1. [ ] Instalar LivePortrait (10 min)
2. [ ] Testar LivePortrait com foto gerada pelo FLUX/SDXL
3. [ ] Instalar SadTalker (15 min)
4. [ ] Testar SadTalker com áudio do edge-tts
5. [ ] Criar driving videos padrão para LivePortrait
6. [ ] Integrar no titanio-media.py
7. [ ] (Opcional) Testar Wan2.1 com patch MPS
