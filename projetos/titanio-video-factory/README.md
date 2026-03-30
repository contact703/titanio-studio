# 🎬 Titanio Video Factory

> Geração automática de vídeos curtos para Reels/Shorts — 100% open source, 100% local.

**De texto a vídeo em ~49 segundos.** Sem APIs pagas. Sem nuvem. Sem dependência.

---

## O Que É

Titanio Video Factory é uma pipeline Python que transforma **texto** em **vídeo vertical pronto para Instagram Reels, TikTok e YouTube Shorts**.

Inspirado no setup de @mateuscastro.ia (Claude + Remotion + OpenAI TTS), mas sem pagar nenhuma API de vídeo ou voz.

### Output padrão
- **Resolução:** 1080×1920 (portrait 9:16)
- **Duração:** 30 segundos
- **Cenas:** 4 (≈7.5s cada)
- **Narração:** Português brasileiro (edge-tts, voz neural)
- **Tempo de produção:** ~49 segundos

---

## Stack Técnica

| Componente | Ferramenta | Função |
|---|---|---|
| Roteiro | Claude (Anthropic) / Ollama | Geração de script com 4 cenas |
| Narração | Edge TTS (`pt-BR-FranciscaNeural`) | Voz neural PT-BR gratuita |
| Transcrição | Whisper (OpenAI) | Legendas automáticas |
| Renderização | MoviePy + FFmpeg | Composição final do vídeo |
| Fundo | Gradiente / imagem / cor sólida | Background das cenas |
| Legendas | PIL / ImageMagick | Texto sobreposto |

### Vozes disponíveis (PT-BR)
- `pt-BR-FranciscaNeural` — feminina, natural (padrão)
- `pt-BR-AntonioNeural` — masculina, clara

---

## Instalação

```bash
# 1. Clone ou acesse o projeto
cd projetos/titanio-video-factory

# 2. Instale as dependências
pip3 install -r requirements.txt

# 3. Configure (opcional — sem config usa defaults)
cp .env.example .env
# edite .env com sua ANTHROPIC_API_KEY se quiser Claude

# 4. Verifique
python3 video_factory.py --check
```

### Pré-requisitos do sistema
```bash
# FFmpeg (necessário)
brew install ffmpeg

# ImageMagick (para legendas avançadas)
brew install imagemagick
```

---

## Como Usar

### Modo básico (texto → vídeo)
```bash
python3 video_factory.py --tema "5 dicas de produtividade para 2026"
```

### Com roteiro customizado
```bash
python3 video_factory.py --roteiro exemplos/produtividade.json
```

### Com opções avançadas
```bash
python3 video_factory.py \
  --tema "Como ganhar dinheiro online" \
  --voz pt-BR-AntonioNeural \
  --duracao 30 \
  --cenas 4 \
  --saida /tmp/meu_video.mp4
```

### Output
O vídeo é salvo em `/tmp/reel-XXXXXX.mp4` por padrão.

---

## Estrutura do Roteiro

O roteiro é um JSON com 4 cenas:

```json
{
  "titulo": "5 Hábitos que Mudam Tudo",
  "tema": "produtividade",
  "cenas": [
    {
      "numero": 1,
      "duracao": 7.5,
      "texto_tela": "Você acorda cansado todo dia?",
      "narração": "Se você acorda todo dia exausto, talvez o problema não seja o sono.",
      "fundo": "#1a1a2e"
    },
    {
      "numero": 2,
      "duracao": 7.5,
      "texto_tela": "Hábito #1: Luz solar",
      "narração": "Exponha seus olhos à luz do sol nos primeiros 30 minutos do dia.",
      "fundo": "#16213e"
    },
    {
      "numero": 3,
      "duracao": 7.5,
      "texto_tela": "Hábito #2: Sem celular",
      "narração": "Evite o celular na primeira hora. Seu cérebro ainda está calibrando.",
      "fundo": "#0f3460"
    },
    {
      "numero": 4,
      "duracao": 7.5,
      "texto_tela": "Resultado: +3h de foco",
      "narração": "Esses dois hábitos podem dar três horas extras de foco por dia.",
      "fundo": "#533483"
    }
  ]
}
```

---

## Fluxo da Pipeline

```
Tema/Texto
    ↓
[Claude/Ollama] Gera roteiro JSON (4 cenas)
    ↓
[Edge TTS] Narra cada cena → .mp3
    ↓
[MoviePy] Cria cada cena (fundo + texto + áudio)
    ↓
[FFmpeg] Concatena cenas → vídeo 1080x1920
    ↓
📱 Reel pronto (~49s depois)
```

---

## Volume 1 (Atual) — Status

✅ Texto → Roteiro → Vídeo → WhatsApp  
✅ Voz neural PT-BR gratuita (edge-tts)  
✅ 4 cenas × ~7.5s = 30s  
✅ Formato 1080×1920  
✅ ~49 segundos de produção  

---

## Volume 2 (Roadmap)

Ver [PLANO.md](PLANO.md) para detalhes completos.

- Dashboard web para gerenciar produções
- Templates visuais (dark, neon, minimalista)
- Batch mode (múltiplos vídeos de uma lista)
- Auto-post Instagram via API oficial
- Auto-post YouTube Shorts
- Suporte a imagens de fundo (Unsplash/Pexels)
- Animações de texto (fade, slide, typewriter)
- Música de fundo com ducking automático

---

## Comparação

| Feature | Titanio VF | Remotion + OpenAI | Canva AI |
|---|---|---|---|
| Custo | $0 | $$$  | $$ |
| Velocidade | ~49s | ~2min | Manual |
| Offline | ✅ | ❌ | ❌ |
| Open source | ✅ | Parcial | ❌ |
| Customização | Total | Total | Limitada |
| PT-BR nativo | ✅ | ✅ | ✅ |

---

## Créditos

- Inspiração: @mateuscastro.ia (Claude + Remotion + OpenAI)
- Desenvolvido por: Equipe Titanio Films
- Tita (IA): arquitetura, código e documentação
- Eduardo: visão, produto e testes

---

*Titanio Films — Maricá, RJ — 2026*
