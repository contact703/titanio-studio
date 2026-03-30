# 📋 Titanio Video Factory — Plano de Desenvolvimento

## Status Atual

**Data:** 27/03/2026  
**Volume:** V1 ✅ Completo  
**Próximo:** V2 (em planejamento)

---

## 🟢 Volume 1 — COMPLETO

### O Que Foi Construído

Pipeline text-to-video completo, funcional, ~49s de produção.

**Entregáveis:**
- [x] `video_factory.py` — script principal
- [x] Geração de roteiro via Claude/Ollama
- [x] Narração PT-BR via Edge TTS (neural, gratuita)
- [x] Renderização 1080×1920 via MoviePy + FFmpeg
- [x] 4 cenas de ~7.5s cada (total 30s)
- [x] Envio via WhatsApp (integração Tita)
- [x] requirements.txt documentado
- [x] Templates de roteiro em exemplos/

### Especificações Técnicas V1

```
Resolução:    1080 × 1920 px (9:16)
FPS:          30
Duração:      30 segundos
Cenas:        4 × 7.5s
Codec vídeo:  H.264 (libx264)
Codec áudio:  AAC / MP3
Voz padrão:   pt-BR-FranciscaNeural
Alternativa:  pt-BR-AntonioNeural
Produção:     ~49 segundos
```

### Stack V1

```
Python 3.11+
├── edge-tts         → voz neural PT-BR (Microsoft, free)
├── moviepy          → composição de vídeo
├── ffmpeg           → renderização final
├── anthropic        → geração de roteiro (Claude)
├── ollama           → alternativa local (Llama/Mistral)
└── Pillow           → manipulação de imagens/texto
```

### Inspiração

@mateuscastro.ia faz vídeos usando:
- Claude → roteiro
- Remotion → renderização (Node.js/React)
- OpenAI TTS → voz

Titanio Video Factory replica o resultado mas:
- Python puro (sem Node.js)
- Edge TTS (sem OpenAI pago)
- MoviePy (sem Remotion)
- 100% open source

---

## 🔵 Volume 2 — ROADMAP

### Fase 1: Templates Visuais (Q2 2026)

Múltiplos temas visuais para os vídeos:

| Template | Estilo | Fundo |
|---|---|---|
| `dark-minimal` | Texto branco, fundo preto | #000000 |
| `neon-cyber` | Cores vibrantes, gradiente | #0D0221 → #190134 |
| `clean-white` | Minimalista, corporativo | #FFFFFF |
| `titanio-brand` | Identidade Titanio Films | #1a1a2e |
| `instagram-story` | Estilo stories/reels popular | Gradiente personalizado |

**Implementação:**
```python
# templates/dark_minimal.py
class DarkMinimalTemplate(BaseTemplate):
    bg_color = "#000000"
    text_color = "#FFFFFF"
    accent_color = "#6C63FF"
    font = "Inter-Bold"
    font_size = 72
```

### Fase 2: Dashboard Web (Q2 2026)

Interface web local para gerenciar produções:

```
titanio-video-factory/
├── dashboard/
│   ├── app.py          (Flask/FastAPI)
│   ├── templates/
│   │   ├── index.html
│   │   └── galeria.html
│   └── static/
│       └── style.css
```

**Features:**
- Formulário para criar vídeos
- Galeria de vídeos produzidos
- Histórico com thumbnails
- Preview inline no browser
- Status de produção em tempo real

### Fase 3: Batch Mode (Q3 2026)

Produção em lote a partir de planilha:

```python
# batch_factory.py
python3 batch_factory.py --planilha temas.csv --quantidade 10
```

Formato CSV:
```csv
tema,voz,template,saida
"5 dicas de sono",FranciscaNeural,dark-minimal,sono.mp4
"Como economizar dinheiro",AntonioNeural,clean-white,economia.mp4
```

### Fase 4: Auto-post (Q3 2026)

Publicação automática nas redes:

**Instagram (via API Graph):**
```python
# publisher/instagram.py
instagram.post_reel(
    video_path="/tmp/reel.mp4",
    caption="5 dicas que vão mudar sua vida 🔥\n\n#produtividade",
    cover_frame=0
)
```

**YouTube Shorts:**
```python
# publisher/youtube.py
youtube.upload_short(
    video_path="/tmp/reel.mp4",
    title="5 Hábitos que Mudam Tudo",
    tags=["produtividade", "dicas", "shorts"]
)
```

### Fase 5: IA Visual (Q4 2026)

Imagens de fundo geradas por IA:

- Stable Diffusion local (via Automatic1111)
- Unsplash API (gratuita, com créditos)
- Pexels API (gratuita)
- Pixabay API (gratuita)

### Fase 6: Animações (Q4 2026)

Efeitos de texto e transição:

- Typewriter effect (texto aparece letra a letra)
- Fade in/out entre cenas
- Slide from bottom (texto sobe)
- Zoom in/out no fundo
- Ken Burns effect (paralaxe em imagens)

---

## 🔴 Backlog / Ideias Futuras

- Clonagem de voz (RVC / Coqui TTS) para voz personalizada
- Vídeos > 60s para YouTube (longform)
- Suporte a múltiplos idiomas (ES, EN)
- Integração com n8n (workflow automation)
- CLI interativa com menu (rich/textual)
- Modo "viral clone" — analisa vídeo de sucesso e replica formato
- WhatsApp Business auto-send após render
- Telegram bot interface

---

## Métricas de Sucesso

| Métrica | V1 | V2 Meta |
|---|---|---|
| Tempo de produção | ~49s | <30s |
| Vídeos/hora | ~70 | >150 (batch) |
| Templates | 1 | 5+ |
| Plataformas de post | Manual | 3 (IG, YT, WA) |
| Custo por vídeo | R$0 | R$0 |

---

## Histórico

| Data | Evento |
|---|---|
| Mar 2026 | Conceito inicial (inspiração @mateuscastro.ia) |
| Mar 2026 | V1 implementado e testado |
| Mar 2026 | Edge TTS instalado, pipeline funcional |
| Mar 2026 | Documentação completa criada |

---

*Atualizado em: 27/03/2026 por Tita*
