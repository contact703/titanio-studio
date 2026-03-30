
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
