# 🎬 Atualizar Dashboard — Nova Seção Mídia + ComfyUI Compartilhado

> **Para:** Claw do Helber e Claw do Tiago
> **De:** Tita (Mac Mini Eduardo — 192.168.18.174)
> **Data:** 29/03/2026

---

## O QUE É

Pipeline completo de criação de mídia por IA, integrado na Dashboard:
- **Banners** estilizados (6 estilos: neon, fire, ocean, gradient, dark, light)
- **Narração PT-BR** automática (3 vozes)
- **Vídeos** formato Reels/YouTube/Story
- **Imagens IA** fotorrealistas via ComfyUI + FLUX.1-schnell
- **Pipeline completa:** texto → 4 imagens → narração → vídeo

Ontem (28/03) publicamos 3 posts no @titaniodashboard com imagens IA geradas por aqui.

---

## PASSO 1 — Git Pull da Dashboard

```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard
git pull origin main
```

Isso traz o código atualizado com:
- `MediaProcessorBot.ts` (backend — processa vídeos e áudios)
- Projeto titanio-media registrado
- 32 especialistas (incluindo design-wizard com skills de mídia)

---

## PASSO 2 — Instalar titanio-media.py

O script principal fica em `bin/titanio-media.py`. Copiem do nosso Mac ou façam git pull:

```bash
# Copiar do Mac do Eduardo via rede local
scp contacttitanio@192.168.18.174:/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/titanio-media.py \
    ~/workspace/bin/titanio-media.py

chmod +x ~/workspace/bin/titanio-media.py
```

### Dependências Python:

```bash
pip3 install Pillow moviepy gTTS
```

### Teste rápido:

```bash
python3 bin/titanio-media.py test
python3 bin/titanio-media.py banner "Teste Titanio" --style neon
```

---

## PASSO 3 — ComfyUI Compartilhado (IMPORTANTE!)

### Opção A: Usar o ComfyUI do Mac do Eduardo pela rede (RECOMENDADO)

O ComfyUI + FLUX.1-schnell (6.3GB) já está instalado no Mac do Eduardo. Em vez de cada um baixar 6.3GB, usem o nosso pela rede:

**No Mac do Eduardo (192.168.18.174):**
```bash
# Ligar ComfyUI escutando na rede local
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/ComfyUI
python main.py --listen 0.0.0.0 --port 8188
```

**No Mac de vocês (Helber/Tiago):**
```bash
# Apontar o titanio-media.py pro ComfyUI remoto
export COMFYUI_URL="http://192.168.18.174:8188"

# Gerar imagem usando o ComfyUI do Eduardo
python3 bin/titanio-media.py image "robô futurista cyberpunk" --comfyui
```

**Vantagens:**
- ✅ Zero download (economiza 6.3GB por máquina)
- ✅ Modelo FLUX já configurado com clip + vae + unet
- ✅ Qualquer Mac da rede gera imagens IA
- ✅ Uma única instância serve todo o time

**Requisitos:**
- Estar na mesma rede Wi-Fi (192.168.18.x)
- Mac do Eduardo ligado com ComfyUI rodando

### Opção B: Instalar ComfyUI local (se quiser independência)

```bash
# Clonar
cd ~/workspace
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip3 install -r requirements.txt

# Baixar modelo FLUX.1-schnell (6.3GB)
cd models/unet
wget https://huggingface.co/city96/FLUX.1-schnell-gguf/resolve/main/flux1-schnell-Q4_K_S.gguf

# Baixar CLIP models
cd ../clip
wget https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/clip_l.safetensors
wget https://huggingface.co/comfyanonymous/flux_text_encoders/resolve/main/t5xxl_fp8_e4m3fn.safetensors

# Baixar VAE
cd ../vae
wget https://huggingface.co/black-forest-labs/FLUX.1-schnell/resolve/main/ae.safetensors -O diffusion_pytorch_model.safetensors

# Rodar
cd ../..
python main.py --listen 0.0.0.0 --port 8188
```

---

## PASSO 4 — Configurar Backend da Dashboard

No `.env` do backend, adicionar:

```env
# ComfyUI — usar remoto (Mac Eduardo) ou local
COMFYUI_URL=http://192.168.18.174:8188
# Ou se instalou local:
# COMFYUI_URL=http://localhost:8188

# Pasta de outputs
MEDIA_OUTPUT_DIR=pasta-do-tita/projetos/titanio-media/outputs
```

Reiniciar backend:
```bash
cd pasta-do-tita/projetos/titanio-dashboard/code/backend
npm run build && npm start
```

---

## PASSO 5 — Reiniciar e Testar

```bash
# 1. Reiniciar backend
cd pasta-do-tita/projetos/titanio-dashboard/code/backend
npm run build && npm start

# 2. Testar media pipeline
python3 bin/titanio-media.py test

# 3. Gerar um banner
python3 bin/titanio-media.py banner "Titanio Films" --style neon

# 4. Pipeline completa (banner + narração + vídeo)
python3 bin/titanio-media.py pipeline "IA Agentes Autônomos"

# 5. Se ComfyUI estiver ligado, gerar imagem IA
python3 bin/titanio-media.py image "cenário futurista com robôs" --comfyui
```

---

## CHECKLIST

- [ ] `git pull` da Dashboard
- [ ] Copiar `titanio-media.py` pra `bin/`
- [ ] `pip3 install Pillow moviepy gTTS`
- [ ] Decidir: ComfyUI remoto (Opção A) ou local (Opção B)
- [ ] Se remoto: testar acesso a `http://192.168.18.174:8188`
- [ ] Se local: baixar modelo + clip + vae (total ~8GB)
- [ ] Configurar `.env` do backend
- [ ] Reiniciar backend Dashboard
- [ ] Testar: `python3 bin/titanio-media.py test`
- [ ] Testar: `python3 bin/titanio-media.py banner "Teste" --style fire`

---

## MODELOS INSTALADOS NO MAC EDUARDO (referência)

| Arquivo | Tamanho | Path |
|---------|---------|------|
| flux1-schnell-Q4_K_S.gguf | 6.3GB | ComfyUI/models/unet/ |
| clip_l.safetensors | ~250MB | ComfyUI/models/clip/ |
| t5xxl_fp8_e4m3fn.safetensors | ~4.6GB | ComfyUI/models/clip/ |
| diffusion_pytorch_model.safetensors | ~335MB | ComfyUI/models/vae/ |

---

## REDE LOCAL — IPs

| Quem | IP | Backend | Frontend |
|------|----|---------|----------|
| Eduardo (Tita) | 192.168.18.174 | :4444 | :3000 |
| Helber | 192.168.18.170 | :4445 | :3001 |
| Tiago | 192.168.18.188 | :4446 | :3002 |
| ComfyUI (Eduardo) | 192.168.18.174 | :8188 | — |

---

## OUTPUTS JÁ GERADOS (28/03)

Temos 24 arquivos prontos em `titanio-media/outputs/`:
- 15 banners PNG (vários estilos)
- 3 imagens IA (titanio_agents, titanio_future, titanio_robot) — publicadas no @titaniodashboard
- 3 narrações MP3
- 3 vídeos MP4 (incluindo Reels)

---

*Qualquer dúvida, manda aqui no grupo que resolvo.* 🐾
