# 🎬 Titanio Video Factory — Volume 1
> Pipeline automático: Script → Vídeo editado, sem abrir editor
> 100% open source, livre pra comercializar

## Inspiração
Reel do @mateuscastro.ia — Claude edita vídeos automaticamente:
- Transcrição automática via API
- Geração de ilustração via IA
- Renderização programática
- Do script ao vídeo editado, sem abrir editor

## Nossa versão: MELHOR e 100% FREE

### Stack 100% Open Source

| Componente | Ferramenta | Licença | Função |
|-----------|-----------|---------|--------|
| Transcrição | **Whisper** (local) | MIT | Áudio → texto |
| Roteiro/Conteúdo | **Ollama + Llama 3** ou Claude API | MIT / API | Gera roteiro, legendas, títulos |
| Ilustrações | **Stable Diffusion** (ComfyUI) | CreativeML | Gera imagens do roteiro |
| Renderização | **MoviePy + FFmpeg** | MIT / LGPL | Monta o vídeo final |
| TTS (narração) | **Piper TTS** ou **Bark** | MIT | Texto → voz natural |
| Legendas | **Whisper + ASS/SRT** | MIT | Legendas sincronizadas automáticas |
| Orquestrador | **Python + Node.js** | MIT | Cola tudo junto |
| Entrega | **WhatsApp via OpenClaw** | — | Manda resultado no grupo |

### Diferencial nosso vs o do reel:
- ❌ Ele usa Remotion (pago pra empresa)
- ✅ Nós usamos MoviePy + FFmpeg (grátis total)
- ❌ Ele usa API da OpenAI pra tudo (custa $$$)
- ✅ Nós usamos Whisper local + Stable Diffusion local (custo ZERO)
- ❌ Ele precisa de Claude Code rodando
- ✅ Nós rodamos tudo pelo OpenClaw com especialistas

## Pipeline (como funciona)

```
ENTRADA: Texto/áudio/roteiro
    ↓
[1. TRANSCRIÇÃO] — Whisper local (se for áudio)
    ↓
[2. ROTEIRO] — LLM gera/refina roteiro + divide em cenas
    ↓
[3. ILUSTRAÇÕES] — Stable Diffusion gera imagem por cena
    ↓
[4. NARRAÇÃO] — Piper TTS gera áudio da narração
    ↓
[5. LEGENDAS] — Whisper sincroniza texto + áudio
    ↓
[6. RENDERIZAÇÃO] — MoviePy + FFmpeg monta tudo:
    - Imagens como background
    - Narração como áudio
    - Legendas estilizadas
    - Transições suaves
    - Música de fundo (opcional)
    ↓
SAÍDA: Vídeo .mp4 pronto → enviado no WhatsApp
```

## Comandos (como Eduardo vai usar)

```
"Tita, cria um vídeo sobre inteligência artificial em 60 segundos"
"Tita, transforma esse texto em vídeo: [texto]"
"Tita, pega esse áudio e faz um vídeo com ilustrações"
```

## Estrutura do Projeto

```
video-factory/
├── README.md              ← este arquivo
├── src/
│   ├── transcriber.py     ← Whisper local
│   ├── scriptwriter.py    ← LLM gera roteiro
│   ├── illustrator.py     ← Stable Diffusion
│   ├── narrator.py        ← Piper TTS
│   ├── subtitler.py       ← Legendas sincronizadas
│   ├── renderer.py        ← MoviePy + FFmpeg (monta vídeo)
│   └── pipeline.py        ← Orquestra tudo
├── templates/
│   ├── styles/            ← Estilos visuais (cores, fontes)
│   └── music/             ← Músicas de fundo royalty-free
├── output/                ← Vídeos prontos
└── requirements.txt
```

## Volume 1 (este) — MVP
- Pipeline texto → vídeo funcionando
- Entrega por WhatsApp
- Sem interface gráfica
- Estilo visual padrão (depois customiza)

## Volume 2 (futuro) — Evolução
- Interface web na Dashboard
- Templates customizáveis
- Batch processing (vários vídeos de uma vez)
- Integração Instagram/YouTube auto-post
- Editor visual drag-and-drop
