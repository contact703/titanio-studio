# VoxDescriber — Especificação Técnica v1.0

> **Documento elaborado por:** Ada Vox — Especialista em Audiodescrição, Squad Titanio  
> **Data:** 17 de março de 2026  
> **Status:** Rascunho aprovado para desenvolvimento

---

## A) IDENTIDADE DO PRODUTO

### Nome
**VoxDescriber**

*(Alternativas consideradas: DescreVox, AudioVis, NarrAI, DescritorVox)*  
Mantemos **VoxDescriber** — evoca voz (Vox) + descrição (Describer), direto e profissional. Funciona bem internacionalmente.

### Tagline
> *"Audiodescrição automática. Para todos os vídeos."*

Alternativa mais técnica:
> *"IA que enxerga, descreve e narra — para quem não pode ver."*

### Proposta de Valor Única
VoxDescriber é o **primeiro app desktop standalone, 100% open source e offline** que gera audiodescrição automática em português brasileiro, em conformidade com a ABNT NBR 15290, sem depender de APIs pagas ou conexão com a nuvem. Produtoras independentes, jornalistas, educadores e criadores de conteúdo podem tornar seus vídeos acessíveis em minutos — no próprio computador, sem custo adicional por minuto de vídeo.

**Diferencial competitivo:**
- Totalmente local (privacidade total — nenhum frame do vídeo sai do computador)
- Gratuito e open source (MIT/Apache 2.0)
- Português brasileiro nativo (não é tradução)
- Conformidade com legislação brasileira
- Funciona em Mac (Apple Silicon e Intel) e Windows 10/11

---

## B) FUNCIONALIDADES DETALHADAS

### B.1 — Tela Inicial
- **Drop zone** centralizada com ícone de vídeo e texto "Arraste seu vídeo aqui ou clique para selecionar"
- Suporte a formatos: `.mp4`, `.mov`, `.mkv`, `.avi`, `.webm`
- Ao soltar o arquivo: exibe thumbnail do vídeo, nome do arquivo, duração, resolução e tamanho
- Botão "Abrir Arquivo" como fallback para file picker nativo
- Acesso rápido aos últimos 5 projetos processados
- Indicador de status do modelo de IA (✅ carregado / ⏳ carregando / ⚠️ não encontrado)

### B.2 — Configurações de Voz
| Parâmetro | Opções | Padrão |
|---|---|---|
| Narrador | pt_BR-edresson-medium, pt_BR-faber-medium | edresson |
| Velocidade | 0.7× a 1.5× (slider) | 1.0× |
| Volume da AD | 50% a 120% (slider) | 100% |
| Tom (pitch) | -20 a +20 semitones | 0 |
| Pausa antes | 0ms a 500ms | 100ms |
| Pausa depois | 0ms a 500ms | 100ms |

- Botão "Ouvir amostra" — gera TTS de frase teste em tempo real
- Perfis salvos (ex: "Voz Feminina Padrão", "Narrador Documental")

### B.3 — Configurações de AD
| Parâmetro | Descrição | Padrão |
|---|---|---|
| Duração mínima do silêncio | Slot mínimo para inserir AD (segundos) | 1.5s |
| Margem de segurança | Espaço antes/depois do diálogo | 0.3s |
| Duração máxima da AD | Limite por descrição gerada | slot - 0.2s |
| Limiar VAD | Sensibilidade detecção de voz (0.0-1.0) | 0.5 |
| Detecção de cenas | Threshold PySceneDetect | 30.0 |
| Prioridade de conteúdo | Ação / Ambiente / Personagem (ordenável) | Ação > Ambiente > Personagem |
| Estilo narrativo | Objetivo / Poético / Técnico | Objetivo |
| Velocidade máx. fala | Palavras por minuto na narração | 160 ppm |

### B.4 — Player de Preview
- Player de vídeo integrado com controles básicos (play/pause, seek, volume)
- **Modo Antes/Depois:** toggle que alterna entre vídeo original e vídeo com AD
- Waveform de áudio exibindo: diálogo original (azul), AD gerada (laranja), silêncios (cinza)
- Timeline com marcadores visuais nos slots de AD detectados
- Clique em marcador → reproduz trecho com AD daquele ponto
- Botão para editar manualmente o texto de uma AD específica
- Controle de zoom na timeline (1s a 5 min por tela)

### B.5 — Barra de Progresso
Progresso dividido em etapas visíveis:

```
[1/6] Extraindo áudio ............... 100% ████████████████
[2/6] Detectando silêncios (VAD) .... 100% ████████████████
[3/6] Extraindo frames-chave ........ 67%  ███████████░░░░░
[4/6] Descrevendo cenas (IA) ........ 12%  ██░░░░░░░░░░░░░░
[5/6] Gerando narração (TTS) ........ 0%   ░░░░░░░░░░░░░░░░
[6/6] Mixando áudio ................. 0%   ░░░░░░░░░░░░░░░░

Tempo estimado: 14 min restantes | Cancelar
```

- Log expandível com detalhes técnicos (para debug)
- Estimativa de tempo baseada no progresso atual
- Botão "Cancelar" com confirmação
- Notificação do sistema operacional ao finalizar (opcional)

### B.6 — Opções de Export
| Formato | Descrição |
|---|---|
| **MP4 com AD mixada** | Vídeo completo, AD no canal de áudio principal (-20dB ducking) |
| **MP4 + trilha separada** | Arquivo MP4 com faixa de áudio extra dedicada à AD |
| **Trilha AD isolada** | Arquivo `.wav`/`.mp3` somente com a narração AD |
| **Arquivo de legenda AD** | `.srt` e `.vtt` com timestamps e textos das descrições |
| **Relatório de conformidade** | `.pdf` com checklist ABNT NBR 15290 preenchido |

Configurações de export:
- Codec de vídeo: H.264 (padrão), H.265, VP9
- Qualidade de vídeo: CRF 18-28 (slider)
- Taxa de amostragem do áudio AD: 22050 Hz ou 44100 Hz
- Pasta de destino configurável
- Template de nome de arquivo: `{nome_original}_AD_{data}_{hora}`

### B.7 — Configurações de Modelo de IA
| Modelo | Tarefa | RAM necessária | Velocidade |
|---|---|---|---|
| Qwen2.5-VL 7B (padrão) | Visão + descrição | 8 GB VRAM ou 16 GB RAM | Média |
| Qwen2.5-VL 3B (leve) | Visão + descrição | 6 GB RAM | Rápida |
| Qwen2.5 3B (texto) | Refinamento AD | 4 GB RAM | Muito rápida |
| Phi-3.5 Mini (texto) | Refinamento AD | 4 GB RAM | Muito rápida |
| Piper TTS | Síntese de voz | < 1 GB RAM | Muito rápida |
| WhisperX base | VAD + transcrição | 1 GB RAM | Rápida |
| WhisperX large-v3 | VAD + transcrição | 10 GB RAM | Lenta, mais precisa |

Modo de operação:
- **Qualidade máxima:** Qwen2.5-VL 7B + WhisperX large-v3
- **Balanceado (padrão):** Qwen2.5-VL 7B + WhisperX base
- **Rápido (CPU):** Qwen2.5-VL 3B + WhisperX base
- **Personalizado:** usuário escolhe cada componente

Gestão de modelos (painel separado):
- Download de modelos via Ollama (com progresso)
- Verificação de integridade (hash)
- Estimativa de uso de disco e RAM
- Botão "Testar modelo" com frase de benchmark

---

## C) FLUXO DO USUÁRIO (Passo a Passo)

```
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 1: Abertura do App                                       │
│  → App verifica modelos instalados                              │
│  → Se falta algum: wizard de instalação guiada (primeira vez)  │
│  → Tela inicial com drop zone                                   │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 2: Seleção do Vídeo                                      │
│  → Drag & drop OU clique para abrir file picker                 │
│  → Validação: formato suportado? arquivo corrompido?            │
│  → Exibe: thumbnail, duração, tamanho, resolução                │
│  → Estimativa de tempo de processamento                         │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 3: Preview Opcional                                      │
│  → Botão "Assistir antes de processar"                          │
│  → Player embutido para verificar conteúdo                      │
│  → Usuário pode definir trecho de teste (in/out points)         │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 4: Configuração                                          │
│  → Aba "Voz": escolher narrador, velocidade, volume             │
│  → Aba "AD": sensibilidade, duração mínima, estilo              │
│  → Aba "IA": selecionar modelos, modo (qualidade/velocidade)    │
│  → Aba "Export": formato de saída, pasta destino                │
│  → Botão "Restaurar padrões"                                    │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 5: Processamento                                         │
│  → Clique em "🎙️ Gerar Audiodescrição"                         │
│  → Confirmação se vídeo > 30 min (aviso de tempo estimado)      │
│  → Barra de progresso com 6 etapas                              │
│  → Botão "Cancelar" disponível                                  │
│  → Log técnico expandível                                       │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 6: Revisão do Resultado                                  │
│  → Player antes/depois                                          │
│  → Timeline com todos os slots de AD marcados                   │
│  → Lista de todas as ADs geradas (texto + timestamp)            │
│  → Edição manual de qualquer descrição (texto editável)         │
│  → Regenerar AD específica com novo prompt                      │
│  → Score de conformidade NBR 15290 (indicativo)                 │
└────────────────────┬────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASSO 7: Exportação                                            │
│  → Escolher formatos de saída (múltiplos simultâneos)           │
│  → Configurar pasta e nome do arquivo                           │
│  → Clique "Exportar"                                            │
│  → Barra de progresso de renderização final                     │
│  → Notificação: "Exportação concluída! Abrir pasta?"            │
│  → Opção: novo projeto ou processar outro vídeo                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## D) FLUXO TÉCNICO INTERNO

### D.1 — Visão Geral do Pipeline

```
VIDEO INPUT
    │
    ▼
[D.2] Extração de Áudio (ffmpeg)
    │
    ▼
[D.3] VAD — Detecção de Voz/Silêncio (WhisperX + demucs)
    │
    ├── Transcrição com timestamps (para evitar sobreposição)
    └── Lista de slots de silêncio disponíveis
         │
         ▼
[D.4] Extração de Frames-chave (ffmpeg + PySceneDetect)
    │
    ▼
[D.5] Descrição Visual (Qwen2.5-VL via Ollama)
    │
    ▼
[D.6] Geração de Texto AD (Qwen2.5 3B / Phi-3.5 Mini)
    │
    ▼
[D.7] Síntese de Voz TTS (Piper TTS)
    │
    ▼
[D.8] Validação de Duração (cabe no slot?)
    │
    ├── Sim → próxima etapa
    └── Não → truncar / ajustar velocidade / descartar
         │
         ▼
[D.9] Mixagem Final (ffmpeg ducking)
    │
    ▼
OUTPUT (MP4 + SRT/VTT + trilha separada)
```

---

### D.2 — Extração de Áudio

```python
def extract_audio(video_path: str) -> str:
    """Extrai áudio em WAV 16kHz mono para processamento."""
    audio_path = video_path.replace(".mp4", "_audio.wav")
    cmd = [
        "ffmpeg", "-i", video_path,
        "-ac", "1",          # mono
        "-ar", "16000",      # 16kHz (ideal para Whisper)
        "-vn",               # sem vídeo
        audio_path
    ]
    run_ffmpeg(cmd)
    return audio_path
```

**Modelos:** ffmpeg  
**Output:** arquivo `.wav` temporário

---

### D.3 — Detecção de Voz e Silêncio (VAD)

```python
def detect_silence_slots(audio_path: str, config: VADConfig) -> list[Slot]:
    """
    Usa WhisperX para transcrever com timestamps precisos.
    Identifica janelas de silêncio (sem diálogo) com duração >= min_duration.
    Opcionalmente usa demucs para separar vocals do background antes do VAD.
    """
    # Etapa 1: separação de fontes (opcional, melhora precisão)
    if config.use_source_separation:
        vocals_path = demucs_separate(audio_path)
    else:
        vocals_path = audio_path
    
    # Etapa 2: transcrição com timestamps
    model = whisperx.load_model("base", device=config.device, language="pt")
    result = model.transcribe(vocals_path)
    aligned = whisperx.align(result["segments"], model, vocals_path)
    
    # Etapa 3: calcular slots de silêncio
    occupied = [(seg["start"], seg["end"]) for seg in aligned["segments"]]
    video_duration = get_duration(audio_path)
    slots = find_silence_windows(
        occupied=occupied,
        total_duration=video_duration,
        min_duration=config.min_slot_duration,  # padrão: 1.5s
        safety_margin=config.safety_margin       # padrão: 0.3s
    )
    
    return slots  # list[{start, end, duration}]
```

**Modelos:** WhisperX (BSD-2), demucs (MIT)  
**Output:** lista de slots `[{start: 10.3, end: 13.1, duration: 2.8}, ...]`

---

### D.4 — Extração de Frames-chave

```python
def extract_keyframes(video_path: str, slots: list[Slot]) -> dict[float, str]:
    """
    Para cada slot de silêncio, extrai o frame do momento anterior ao slot.
    Usa PySceneDetect para identificar cortes e evitar frames de transição.
    """
    scene_list = detect_scenes(video_path, threshold=30.0)
    
    frames = {}
    for slot in slots:
        # Frame ideal: 0.5s antes do início do slot
        target_time = max(0, slot["start"] - 0.5)
        
        # Ajusta para não pegar frame de transição de cena
        target_time = adjust_for_scene_cuts(target_time, scene_list)
        
        frame_path = extract_single_frame(video_path, target_time)
        frames[slot["start"]] = frame_path
    
    return frames  # {slot_start: frame_file_path}
```

**Modelos:** ffmpeg, PySceneDetect (BSD-3)  
**Output:** imagens JPG temporárias por slot

---

### D.5 — Descrição Visual com IA

```python
VISION_PROMPT = """Você é um especialista em audiodescrição seguindo a norma ABNT NBR 15290.
Descreva o que está acontecendo nesta cena de forma objetiva, em tempo presente.
Priorize na ordem: 1) ação principal, 2) ambiente/cenário, 3) personagens/aparência.
Seja conciso: máximo {max_words} palavras.
NÃO inclua interpretações subjetivas ou julgamentos morais.
NÃO descreva o que já está sendo dito no diálogo (o contexto é: '{dialogue_context}').
Responda SOMENTE com a descrição, sem prefácio."""

def describe_frame(
    frame_path: str,
    slot: Slot,
    dialogue_context: str,
    model: str = "qwen2.5-vl:7b"
) -> str:
    """Usa Qwen2.5-VL via Ollama para descrever a cena."""
    max_words = calculate_max_words(slot["duration"], wpm=160)
    
    prompt = VISION_PROMPT.format(
        max_words=max_words,
        dialogue_context=dialogue_context[:200]  # contexto do diálogo anterior
    )
    
    response = ollama.chat(
        model=model,
        messages=[{
            "role": "user",
            "content": prompt,
            "images": [frame_path]
        }]
    )
    
    return response["message"]["content"].strip()
```

**Modelos:** Qwen2.5-VL 7B (ou 3B) via Ollama  
**Output:** texto da descrição para cada slot

---

### D.6 — Refinamento do Texto AD

```python
REFINEMENT_PROMPT = """Revise esta audiodescrição seguindo rigorosamente a ABNT NBR 15290:
- Use tempo presente e voz ativa
- Seja objetivo e neutro (sem adjetivos valorativos como "belo", "feio")
- Máximo {max_words} palavras
- Elimine redundâncias com o contexto: '{dialogue_context}'
- Não comece com "Nós vemos" ou "A câmera mostra"
- Mantenha a naturalidade da fala

Descrição original: {description}

Responda SOMENTE com a descrição revisada."""

def refine_ad_text(description: str, slot: Slot, context: str) -> str:
    """Refinamento opcional via LLM de texto (mais leve que o modelo de visão)."""
    max_words = calculate_max_words(slot["duration"], wpm=160)
    
    prompt = REFINEMENT_PROMPT.format(
        max_words=max_words,
        dialogue_context=context,
        description=description
    )
    
    response = ollama.generate(model="qwen2.5:3b", prompt=prompt)
    return response["response"].strip()
```

**Modelos:** Qwen2.5 3B ou Phi-3.5 Mini via Ollama  
**Output:** texto AD refinado e validado

---

### D.7 — Síntese de Voz TTS

```python
def synthesize_ad(text: str, slot: Slot, config: VoiceConfig) -> AudioResult:
    """
    Gera áudio TTS com Piper e valida se cabe no slot disponível.
    Se o áudio gerado for maior que o slot, tenta comprimir velocidade.
    """
    # Gerar TTS
    audio_path = piper_synthesize(
        text=text,
        model=config.voice_model,   # pt_BR-edresson-medium
        speed=config.speed,          # 1.0
        output_path=f"ad_{slot['start']:.2f}.wav"
    )
    
    audio_duration = get_duration(audio_path)
    available_duration = slot["duration"] - 0.4  # margem segurança
    
    if audio_duration > available_duration:
        # Estratégia 1: aumentar velocidade (até 1.3×)
        if audio_duration <= available_duration * 1.3:
            speed_factor = audio_duration / available_duration
            audio_path = adjust_speed(audio_path, speed=min(speed_factor, 1.3))
        # Estratégia 2: truncar texto e re-sintetizar
        else:
            text_short = truncate_to_fit(text, available_duration, wpm=180)
            audio_path = piper_synthesize(text_short, ...)
    
    return AudioResult(
        path=audio_path,
        duration=get_duration(audio_path),
        text=text,
        slot=slot,
        fits=True
    )
```

**Modelos:** Piper TTS (MIT) com vozes pt_BR-edresson-medium ou pt_BR-faber-medium  
**Output:** arquivo WAV por slot com a narração

---

### D.8 — Mixagem Final

```python
def mix_audio_with_ducking(
    video_path: str,
    ad_tracks: list[AudioResult],
    output_path: str,
    ducking_db: float = -20.0
) -> str:
    """
    Mescla vídeo original com narrações AD.
    Aplica duck (redução de volume) no áudio original durante a narração.
    """
    # Construir filter_complex do ffmpeg
    filter_parts = []
    
    for ad in ad_tracks:
        start = ad.slot["start"]
        end = start + ad.duration
        
        # Ducking: reduz original -20dB durante a narração
        filter_parts.append(
            f"volume=enable='between(t,{start},{end})':volume={ducking_db}dB"
        )
    
    # Posicionar cada faixa AD no timestamp correto
    # Usar amerge + adelay para posicionamento preciso
    cmd = build_ffmpeg_mix_command(
        video=video_path,
        ad_tracks=ad_tracks,
        filters=filter_parts,
        output=output_path
    )
    
    run_ffmpeg(cmd)
    return output_path
```

**Ferramentas:** ffmpeg  
**Output:** vídeo MP4 final com AD mixada

---

### D.9 — Estratégia para Vídeos Longos

Para vídeos com duração > 30 minutos:

```python
CHUNK_SIZE_MINUTES = 10  # processar em chunks de 10 min

def process_long_video(video_path: str, config: AppConfig) -> str:
    """
    Divide vídeos longos em chunks de 10 min com overlap de 30s
    para não perder contexto de cenas entre chunks.
    """
    duration = get_video_duration(video_path)
    
    if duration < CHUNK_SIZE_MINUTES * 60:
        return process_single_chunk(video_path, 0, duration, config)
    
    chunks = []
    for start in range(0, int(duration), CHUNK_SIZE_MINUTES * 60):
        end = min(start + CHUNK_SIZE_MINUTES * 60 + 30, duration)  # +30s overlap
        chunk_path = extract_chunk(video_path, start, end)
        chunks.append((start, chunk_path))
    
    # Processar chunks em sequência (memória controlada)
    results = []
    for start_offset, chunk_path in chunks:
        result = process_single_chunk(chunk_path, start_offset, config)
        results.append(result)
        cleanup_temp_files(chunk_path)  # liberar disco
    
    # Unir resultados
    return merge_results(video_path, results, config)
```

**Motivação:** Evitar OOM (Out of Memory) em máquinas com < 16 GB RAM.

---

### D.10 — Tratamento de Erros

| Erro | Causa provável | Ação |
|---|---|---|
| `ModelNotFound` | Modelo Ollama não baixado | Abrir wizard de download |
| `OOMError` | RAM insuficiente | Sugerir modelo menor / processar em chunks |
| `FFmpegError` | Arquivo corrompido ou codec desconhecido | Exibir mensagem com codec detectado |
| `VADNoSpeech` | Vídeo sem diálogo (ex: música) | Tratar toda duração como slot disponível |
| `TooShortSlot` | Todos os slots < 1.5s | Reduzir min_slot_duration e tentar novamente |
| `OllamaTimeout` | Modelo demorou > 5 min por frame | Pular frame e registrar no log |
| `PiperError` | Falha na síntese TTS | Pular slot e continuar (registrar no log) |
| `DiskSpaceError` | Espaço insuficiente para temp files | Verificar espaço antes de iniciar |

---

## E) CONFORMIDADE COM LEGISLAÇÃO BRASILEIRA

### E.1 — Como o VoxDescriber atende a ABNT NBR 15290

| Requisito NBR 15290 | Como o App Implementa |
|---|---|
| **Tempo verbal presente** | Prompt do modelo explicitamente exige tempo presente |
| **Objetividade** | Prompt proíbe adjetivos valorativos e interpretações subjetivas |
| **Não sobrepor diálogos** | VAD detecta diálogo com margem de segurança de 0.3s |
| **Máximo 150-180 ppm** | Validação de duração: cabe_no_slot() calcula palavras/min |
| **Prioridade: ação > ambiente > personagem** | Prompt instrui essa ordem de prioridade |
| **Voz neutra e clara** | Piper TTS usa vozes naturais calibradas para clareza |
| **Coerência narrativa** | Contexto do diálogo anterior é passado ao modelo |
| **Identificação de personagens** | Modelo instruído a nomear personagens quando identificáveis |

### E.2 — Checklist de Conformidade (gerado por exportação)

```
RELATÓRIO DE CONFORMIDADE — VoxDescriber v1.0
Arquivo: meu_documentario.mp4
Data: 17/03/2026

ANÁLISE TÉCNICA:
[✅] Audiodescrição inserida em silêncios (0 sobreposições detectadas)
[✅] Velocidade média de fala: 158 ppm (limite: 180 ppm)
[✅] Margem de segurança respeitada: 0.3s
[✅] Formato SRT/VTT gerado
[⚠️] 3 slots com duração < 1.5s foram descartados
[ℹ️] 42 descrições geradas | 38 aprovadas | 4 ajustadas por velocidade

ATENÇÃO — Revisão humana recomendada para:
- Cenas com múltiplos personagens simultâneos
- Cenas com texto na tela não transcrito
- Mudanças rápidas de cena (< 2s)

NOTA LEGAL: Esta audiodescrição foi gerada automaticamente.
Para fins de transmissão em TV aberta/paga (Res. ANATEL 667/2016),
recomenda-se revisão por profissional habilitado em AD.
```

### E.3 — O que o App NÃO pode fazer (limitações legais e técnicas)

**Limitações técnicas:**
- ❌ Não garante 100% de conformidade com NBR 15290 — é uma ferramenta de apoio, não substitui revisor humano
- ❌ Não descreve textos/legendas que aparecem na tela (OCR não implementado na v1.0)
- ❌ Não identifica personagens por nome automaticamente (exceto se o modelo reconhecer celebridades conhecidas)
- ❌ Não gera AD para conteúdo musical (letras, ritmo, instrumentação)
- ❌ Não processa streams ao vivo

**Limitações legais:**
- ❌ A AD gerada automaticamente **não substitui** o requisito legal de AD profissional para TV (Res. ANATEL 667/2016) sem revisão
- ❌ Para filmes com patrocínio do FSA, a AD deve passar por revisão e aprovação de acessibilidade
- ❌ O app não emite certificado de acessibilidade reconhecido por órgãos reguladores
- ❌ Para conteúdo destinado à TV paga ou cinema, o output deve obrigatoriamente ser revisado por audiodescritores profissionais certificados

**Recomendação de uso correto:**
O VoxDescriber é uma ferramenta de **primeira geração de rascunho** (first draft). O fluxo ideal é:
```
VoxDescriber → Rascunho automático → Revisor humano → AD final certificada
```

---

## F) PLANO DE DESENVOLVIMENTO (SPRINTS)

### Sprint 1 — Core Pipeline CLI (3 semanas)
**Objetivo:** Pipeline funcional via linha de comando, sem interface gráfica.

**Tarefas:**
- [ ] Setup do ambiente Python (pyproject.toml, uv/pip)
- [ ] Wrapper ffmpeg para extração de áudio e frames
- [ ] Integração WhisperX: transcrição + timestamps
- [ ] Integração PySceneDetect: detecção de cenas
- [ ] Cliente Ollama: chamadas para Qwen2.5-VL e Qwen2.5
- [ ] Integração Piper TTS: síntese PT-BR
- [ ] Algoritmo de fitting (cabe no slot?)
- [ ] Mixagem final via ffmpeg com ducking
- [ ] Geração de SRT/VTT
- [ ] CLI: `voxdescriber input.mp4 --output output.mp4`
- [ ] Logging estruturado (rich/loguru)
- [ ] Testes unitários do pipeline (pytest)

**Critério de aceite:** Vídeo de 5 min processado do início ao fim via CLI com AD em PT-BR.

**Tech stack:**
```
Python 3.11+
whisperx, demucs, pyannote.audio
ffmpeg-python, scenedetect
ollama (Python client)
piper-tts
rich, loguru, click
pytest
```

---

### Sprint 2 — Interface Básica (2 semanas)
**Objetivo:** Interface gráfica mínima funcional.

**Decisão de UI:** **PySide6** para MVP (mais rápido de desenvolver que Tauri para equipe Python-first; migrar para Tauri na v2 se necessário)

**Tarefas:**
- [ ] Setup PySide6 + QApplication
- [ ] Tela inicial com drag & drop de arquivo
- [ ] Formulário de configurações (3 abas: Voz, AD, IA)
- [ ] Botão "Gerar AD" que chama o pipeline em QThread
- [ ] Barra de progresso com 6 etapas (signals/slots)
- [ ] Log expandível na tela
- [ ] Tela de conclusão com botão "Exportar"
- [ ] Ícone e nome do app
- [ ] Configurações salvas em JSON (persistência entre sessões)

**Critério de aceite:** Usuário não-técnico consegue processar um vídeo sem abrir terminal.

---

### Sprint 3 — Player de Vídeo + Preview (2 semanas)
**Objetivo:** Revisão e edição das ADs geradas.

**Tarefas:**
- [ ] Player de vídeo integrado (QMediaPlayer + QVideoWidget)
- [ ] Waveform de áudio (pyqtgraph ou matplotlib embutido)
- [ ] Timeline com marcadores de slots AD
- [ ] Toggle antes/depois (áudio original vs com AD)
- [ ] Lista editável de todas as ADs (QTableWidget)
- [ ] Edição de texto individual → regenera TTS → atualiza preview
- [ ] Score de conformidade básico (indicativo, não certificado)
- [ ] Botão "Regenerar esta AD" para slots específicos

**Critério de aceite:** Editor consegue revisar e ajustar todas as ADs antes de exportar.

---

### Sprint 4 — Empacotamento + Instalador (3 semanas)
**Objetivo:** App standalone instalável em Mac e Windows.

**Tarefas:**
- [ ] Script de build com PyInstaller (onedir mode)
- [ ] Bundle do Ollama (versão standalone) dentro do app
- [ ] Download automático dos modelos no primeiro uso (wizard)
- [ ] Empacotamento Mac: `.dmg` com drag-to-Applications
  - Code signing com certificado Apple Developer
  - Notarization para macOS 14+
  - Universal Binary (Apple Silicon + Intel)
- [ ] Empacotamento Windows: `.exe` installer com NSIS ou Inno Setup
  - Assinatura digital opcional (EV certificate)
  - Windows Defender whitelist (documentado)
- [ ] Auto-update via GitHub Releases (optional: Sparkle para Mac, WinSparkle para Win)
- [ ] Testes em VM Windows 10/11
- [ ] Testes em Mac Intel e M-series

**Critério de aceite:** Instalação limpa em Mac virgem e Windows 11 virgem sem instalar Python.

---

### Sprint 5 — Testes, Refinamento e Lançamento (3 semanas)
**Objetivo:** Qualidade e usabilidade antes do lançamento público.

**Tarefas:**
- [ ] Testes com usuários reais (5+ pessoas, incluindo 1 audiodescritora profissional)
- [ ] Benchmark de qualidade AD (avaliação qualitativa de 10 vídeos variados)
- [ ] Otimização de performance (profiling, identificar gargalos)
- [ ] Documentação de usuário (README, wiki, vídeo tutorial)
- [ ] Relatório de conformidade PDF
- [ ] Página web do projeto (GitHub Pages ou simples)
- [ ] Publicação no GitHub (MIT License)
- [ ] Release v1.0 com changelogs
- [ ] Anúncio em comunidades de acessibilidade audiovisual

---

## G) RISCOS E MITIGAÇÕES

### G.1 — Hardware Fraco (sem GPU dedicada)

**Risco:** Máquinas sem GPU NVIDIA terão processamento muito lento.

| Configuração | Tempo estimado para vídeo 5 min | Viável? |
|---|---|---|
| Mac M1/M2/M3 (GPU integrada) | 8-15 min | ✅ Sim (Metal/MPS) |
| Intel i7 + NVIDIA RTX 3060 | 5-10 min | ✅ Sim |
| CPU-only (Intel i5, sem GPU) | 30-60 min | ⚠️ Lento mas funcional |
| CPU-only (hardware antigo) | > 2 horas | ❌ Impraticável |

**Mitigações:**
- Ollama detecta automaticamente GPU disponível (CUDA, Metal, ROCm)
- Modo "CPU otimizado" usa modelos menores (3B em vez de 7B) + quantização Q4
- Aviso na instalação sobre hardware recomendado mínimo
- Processamento em background com notificação ao finalizar
- **Hardware recomendado mínimo:** 16 GB RAM, 8 núcleos CPU, 20 GB disco livre

### G.2 — Vídeos Muito Longos

**Risco:** OOM, travamentos e arquivos temporários imensos.

**Mitigações:**
- Processamento em chunks de 10 min (seção D.9)
- Limpeza agressiva de temp files a cada chunk
- Estimativa de espaço em disco antes de iniciar
- Limite configurável de memória para Ollama (`OLLAMA_MAX_LOADED_MODELS=1`)
- Modo "economia de memória" que descarrega modelo de visão após cada frame

### G.3 — Qualidade da AD Gerada

**Risco:** AD gerada pode ser imprecisa, estranha ou não conformante com NBR 15290.

**Mitigações:**
- Prompt engineering extensivamente testado com norma brasileira
- Score de qualidade automático (comprimento, velocidade de fala, proibições de palavras)
- Interface de revisão obrigatória antes do export final
- Documentação clara: "esta é uma ferramenta de rascunho, não de AD profissional"
- Possibilidade de testar com trecho curto antes do processamento completo
- Comunidade open source para iterar nos prompts (prompts versionados no repositório)

### G.4 — Licenças e Direitos Autorais

**Risco:** Componentes com licenças incompatíveis ou vídeos protegidos por copyright.

**Análise de licenças:**
| Componente | Licença | Uso Comercial? |
|---|---|---|
| ffmpeg | LGPL 2.1+ / GPL 2+ | ✅ Sim (LGPL) |
| WhisperX | BSD-2-Clause | ✅ Sim |
| demucs | MIT | ✅ Sim |
| PySceneDetect | BSD-3-Clause | ✅ Sim |
| Qwen2.5-VL | Apache 2.0 | ✅ Sim |
| Qwen2.5 (texto) | Apache 2.0 | ✅ Sim |
| Phi-3.5 Mini | MIT | ✅ Sim |
| Piper TTS | MIT | ✅ Sim |
| Ollama | MIT | ✅ Sim |
| PySide6 | LGPL 3 | ✅ Sim (com LGPL) |
| PyInstaller | GPL + bootloader exception | ✅ Sim |

**⚠️ Atenção ffmpeg:** Para distribuição binária, usar build LGPL (sem codecs GPL como libx264 GPL). Alternativa: indicar ao usuário que instale ffmpeg separadamente.

**Direitos autorais dos vídeos:**
- O app não faz upload de conteúdo para servidores externos
- Processamento 100% local = sem violação de copyright por transmissão
- O app não remove DRM — vídeos protegidos precisam ser desbloqueados pelo próprio dono antes
- Documentar claramente na ToS que o usuário é responsável pelo conteúdo que processa

---

## H) RECOMENDAÇÃO FINAL DA ESPECIALISTA

*— Ada Vox, Especialista em Audiodescrição, Squad Titanio*

---

### Stack que eu escolheria

**Sem hesitar:**

```
Backend:    Python 3.12 + WhisperX + Ollama (Qwen2.5-VL 7B) + Piper TTS
UI MVP:     PySide6 (migrar para Tauri v2 em versão futura)
Video:      ffmpeg (abstração via ffmpeg-python)
Build:      PyInstaller + Ollama bundled
Formato:    MP4 (H.264) + SRT como outputs primários
```

**Por quê PySide6 e não Tauri para o MVP?**

A equipe tem background em Python. Tauri exige Rust no backend + IPC entre frontend JS e backend Python — isso é uma camada de complexidade extra desnecessária para validar o produto. PySide6 é Python puro, tem player de vídeo nativo, e distribuição via PyInstaller é mais simples. Se o produto decolar e precisar de UI mais moderna/web-based, migrar para Tauri na v2 faz sentido.

**Por quê Qwen2.5-VL e não alternativas?**

- GPT-4V: pago, envia frames para API externa (privacidade comprometida)
- LLaVA: qualidade inferior para descrição densa
- Qwen2.5-VL 7B: melhor qualidade para visão em PT-BR nos testes, Apache 2.0, roda bem em quantização Q4 no Mac M1

---

### Maior dificuldade técnica

**O fitting de AD no slot de silêncio** vai ser o maior pesadelo.

O problema central é: você tem um slot de silêncio de, digamos, 2.3 segundos. O modelo gera uma descrição excelente com 18 palavras. O TTS gera um áudio de 2.7 segundos. O áudio **não cabe**.

Você pode:
1. Aumentar a velocidade do TTS → soa robótico acima de 1.2×
2. Truncar o texto → perde informação, quebra a coerência gramatical
3. Tentar comprimir inteligentemente com o LLM → adiciona latência

Na prática, é uma dança de três variáveis: **qualidade do texto × velocidade da voz × duração do slot**. Não existe solução perfeita — vai precisar de testes exaustivos com vídeos reais de diferentes gêneros (documentário, ficção, publicidade, jornalismo) para calibrar os thresholds ideais.

**Minha recomendação:** implemente um sistema de "graceful degradation" bem pensado:
- Slots 1.5-2s: AD ultra-curta (máx 5-7 palavras) — foco só na ação principal
- Slots 2-4s: AD normal (8-15 palavras)
- Slots 4s+: AD completa (ação + ambiente + personagem se couber)

---

### Como garantir qualidade conforme NBR 15290

**O problema real:** você pode ter conformidade técnica (velocidade, duração, não sobrepor) mas AD de péssima qualidade semântica ("Uma pessoa está fazendo algo na cozinha").

**Minha estratégia em 3 camadas:**

**Camada 1 — Prompt engineering rigoroso**
O prompt do modelo precisa ser co-criado com audiodescritor(a) profissional certificado(a). Não é opcional. Uma hora de consultoria com profissional da área vai valer mais do que semanas de trial-and-error. O prompt precisa ter:
- Exemplos few-shot (5-10 pares de frame+AD ideal)
- Instruções negativas explícitas ("nunca diga X")
- Calibração para o gênero audiovisual (documentário ≠ ficção ≠ jornalismo)

**Camada 2 — Validação automática pós-geração**
Implementar verificações automáticas:
```python
def validate_ad(text: str, slot: Slot) -> ValidationResult:
    checks = [
        check_verb_tense(text),          # tempo presente?
        check_forbidden_words(text),      # sem "nós vemos", "a câmera"...
        check_wpm(text, slot.duration),  # dentro de 150-180 ppm?
        check_completeness(text),         # tem pelo menos sujeito + verbo?
        check_no_value_judgments(text),  # sem "belo", "feio", "assustador"?
    ]
    return ValidationResult(checks)
```

**Camada 3 — Revisão humana facilitada**
A interface de revisão deve ser tão boa que o revisor humano consiga percorrer 50 ADs em 10 minutos. Isso significa:
- Exibir frame + texto lado a lado
- Reproduzir TTS com um clique
- Edição inline rápida
- Atalhos de teclado para aprovar/rejeitar/editar

**Conclusão:** O VoxDescriber não deve ser vendido como "AD pronta para broadcast". Deve ser posicionado como **"o melhor ponto de partida para sua AD"** — eliminando 80% do trabalho do audiodescritora humano, não substituindo-o. Esse posicionamento honesto é também o que evita problemas legais e constrói credibilidade junto à comunidade de acessibilidade audiovisual brasileira.

---

## APÊNDICE — Estrutura de Diretórios do Projeto

```
voxdescriber/
├── voxdescriber/
│   ├── __init__.py
│   ├── core/
│   │   ├── audio.py          # extração e mixagem (ffmpeg)
│   │   ├── vad.py            # detecção de silêncio (WhisperX)
│   │   ├── vision.py         # descrição visual (Ollama/Qwen)
│   │   ├── tts.py            # síntese de voz (Piper)
│   │   ├── pipeline.py       # orquestrador principal
│   │   └── fitting.py        # algoritmo de fitting AD/slot
│   ├── ui/
│   │   ├── main_window.py    # janela principal PySide6
│   │   ├── player.py         # player de vídeo + waveform
│   │   ├── settings.py       # painéis de configuração
│   │   ├── progress.py       # barra de progresso
│   │   └── editor.py         # editor de ADs geradas
│   ├── models/
│   │   ├── downloader.py     # download de modelos Ollama
│   │   └── manager.py        # gestão de modelos instalados
│   ├── export/
│   │   ├── video.py          # export MP4
│   │   ├── subtitles.py      # export SRT/VTT
│   │   └── report.py         # relatório de conformidade PDF
│   ├── validation/
│   │   └── nbr15290.py       # validações conformidade ABNT
│   ├── config.py             # configurações do app (JSON)
│   └── cli.py                # interface CLI
├── prompts/
│   ├── vision_pt_br.txt      # prompt de descrição visual
│   └── refinement_pt_br.txt  # prompt de refinamento
├── tests/
│   ├── test_vad.py
│   ├── test_fitting.py
│   └── test_validation.py
├── build/
│   ├── mac/
│   │   └── build_mac.sh
│   └── windows/
│       └── build_win.bat
├── assets/
│   ├── icon.icns             # ícone Mac
│   └── icon.ico              # ícone Windows
├── pyproject.toml
├── README.md
└── LICENSE                   # MIT License
```

---

*Documento finalizado por Ada Vox — Squad Titanio | VoxDescriber v1.0 Spec*  
*Próximo passo: Sprint 1 → configurar repositório e iniciar core pipeline*
