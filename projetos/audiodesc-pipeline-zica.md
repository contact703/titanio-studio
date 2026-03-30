# Pipeline de Audiodescrição — Estudo da Zica
## Stack 100% open source, uso comercial ok

### 1. Detecção de silêncio/pausas
- WhisperX (BSD-2) — VAD + diarization, precisão ≈50-100ms
- silero-vad (MIT) — leve e rápido em CPU
- demucs (MIT) — separar vocals de instrumentais antes do VAD
- pyannote.audio (MIT) — diarization avançado

### 2. Extração de frames
- ffmpeg → extrai frames JPG nos momentos de silêncio
- PySceneDetect (MIT) → detecção de mudança de cena
- Estratégia: 1 frame por slot de silêncio + frames em mudanças de cena

### 3. Visão computacional (coração da AD)
Modelos multimodais open source (Apache 2.0):
- Qwen2.5-VL 7B — MELHOR qualidade (via Ollama)
- Qwen2.5-VL 3B — ótimo custo-benefício
- LLaVA 1.6 7B/4B — alternativa sólida
- MiniCPM-V 2.6 — 8B, bom em CPU
- moondream2 — 1.8GB, ultra-leve, ok para CPU fraco
- InternVL2 2B — 4GB, bom em CPU

### 4. Geração de texto da AD
- Qwen 2.5 3B (Apache 2.0) — melhor PT-BR, leve
- Phi-3.5 Mini 3.8B (MIT) — excelente qualidade
- Llama 3.2 3B (Llama 3 license, comercial) — boa opção
- Prompt: tempo presente, objetivo, máx 2.5 palavras/segundo disponível

### 5. TTS PT-BR
- Piper TTS (MIT) — RECOMENDADO: leve, rápido CPU, vozes BR nativas
  - Vozes: pt_BR-edresson-low, pt_BR-faber-medium
  - Velocidade: ~50ms/frase em CPU
- Kokoro-82M (Apache 2.0) — qualidade superior, beta PT-BR
- XTTS-v2 / Coqui (CC-BY 4.0) — clone de voz com 10-30s de amostra
- Fish Speech 1.5 — zero-shot, melhor naturalidade

### 6. Mixagem final
- ffmpeg ducking: reduz original -20dB durante narração AD
- MoviePy (MIT) — alternativa Python pura
- Aeneas — alinhamento forçado para precisão extrema
- Formato saída: MP4 (H.264+AAC) ou MKV com trilha AD separada

### 7. Interface desktop (Mac + Windows)
- Tauri (MIT, Rust) — leve, moderno, recomendado
- Electron (MIT) — mais fácil, pesado
- PySide6/PyQt6 (LGPL) — Python nativo
- Player de vídeo: libmpv bindings

### 8. Instalação autônoma
- PyInstaller — empacota Python + deps
- Ollama incluso — baixa modelos na 1a execução
- Piper TTS binário standalone
- ffmpeg bundled
- Tamanho estimado: 500MB-2GB (sem modelos) + download modelos (~4-15GB)

## Hardware mínimo
- CPU only: moondream2 + Piper TTS (funciona, lento ~2-5min/min de vídeo)
- GPU recomendada: Qwen2.5-VL 7B + Piper (rápido ~10-30s/min de vídeo)
- RAM: 8GB mínimo, 16GB recomendado
