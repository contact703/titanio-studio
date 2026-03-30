
## 26/03/2026 — Titanio Video Factory v1

### Stack Open Source Completa
- **Whisper** (MIT): transcrição áudio→texto local
- **Edge TTS** (grátis): narração pt-BR (AntonioNeural/FranciscaNeural)
- **MoviePy 2.x + FFmpeg**: renderização de vídeo programática
- **Pillow**: geração de imagens/gradientes com texto
- **Claude/Ollama**: geração de roteiro por cenas

### Pipeline
texto/áudio → transcrição → roteiro (LLM) → imagens → narração (TTS) → renderização → WhatsApp

### Detalhes Técnicos
- MoviePy 2.x: .with_duration(), .resized(), .with_audio() (API mudou!)
- Edge TTS: pt-BR-AntonioNeural (masc), pt-BR-FranciscaNeural (fem)
- Formato Reels: 1080x1920, YouTube: 1920x1080
- Render 30s vídeo ≈ 49s no Mac Mini M4
- Remotion cobra licença pra empresa +3 pessoas — NÃO usar
- Fonte Helvetica-Bold falha no Pillow — usar path completo

### Localização
`pasta-do-tita/projetos/video-factory/`

## 26/03/2026 — Bot Auto-Poster Instagram com IA Gratuita

### O que funciona
- **instagrapi** (Python): posta Reels via API privada do Instagram
- **Sessão persistida**: login uma vez, reusa sessão (cofre/tita-insta-session.json)
- **clip_upload()**: posta vídeo como Reel com caption e thumbnail automático

### IA para Caption — ordem de fallback
1. OpenRouter modelos :free (50 req/dia sem crédito, 1000/dia com $10 crédito)
2. Kimi/Moonshot (key expirou 26/03)
3. Anthropic Claude (SEMPRE funciona, custo ~$0.001 por caption)
4. Fallback manual (caption template)

### Modelos gratuitos OpenRouter (26/03/2026)
- qwen/qwen3-next-80b-a3b-instruct:free
- nvidia/nemotron-nano-9b-v2:free
- z-ai/glm-4.5-air:free
- Rate limit: 50/dia sem crédito, reseta por hora

### Problemas encontrados
- OpenAI keys todas com quota excedida (429)
- Kimi key expirou (401)
- OpenRouter free: funciona mas tem rate limit agressivo
- Solução: Claude como fallback CONFIÁVEL

### Resultado
- Reel postado com sucesso: https://www.instagram.com/reel/DWXcjg0DJY2/
- Pipeline: gerar caption → login Instagram → clip_upload → done
- Conta: @titaniodashboard

### Código
`pasta-do-tita/projetos/video-factory/src/insta_poster.py`
