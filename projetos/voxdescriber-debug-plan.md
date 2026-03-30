# VoxDescriber — Plano de Debug & Testes
> Debug Hunter · Squad Titanio · 2026-03-17

---

## Sumário
1. [Mapa de Pontos de Falha](#1-mapa-de-pontos-de-falha)
2. [Plano de Testes](#2-plano-de-testes)
3. [Helpers de Diagnóstico](#3-helpers-de-diagnóstico)
4. [Checklist Pré-Release](#4-checklist-pré-release)

---

## 1. Mapa de Pontos de Falha

### 1.1 Entrada de Vídeo

#### BUG-V01 — Formato de vídeo incomum / codec antigo
- **Descrição:** AVI com Indeo, DivX 3.x, WMV9, MXF broadcast, MOV com codec Apple ProRes RAW, etc. ffmpeg pode falhar ou produzir output corrompido.
- **Detecção:**
  ```python
  result = subprocess.run(
      ["ffprobe", "-v", "error", "-show_entries", "stream=codec_name",
       "-of", "default=noprint_wrappers=1", input_path],
      capture_output=True, text=True
  )
  if result.returncode != 0:
      raise VideoProbeError("ffprobe falhou ao ler o arquivo")
  ```
- **Mensagem ao usuário:** "Formato de vídeo não reconhecido ou codec desatualizado. Tente converter para MP4/H.264 antes de importar."
- **Fallback:** Tentar re-encode automático via `ffmpeg -c:v libx264` antes de processar; se falhar, rejeitar com mensagem clara.

#### BUG-V02 — Vídeo sem faixa de áudio
- **Descrição:** ffprobe não encontra stream de áudio; WhisperX recebe arquivo vazio ou falha na extração.
- **Detecção:**
  ```python
  audio_streams = [s for s in probe_streams if s["codec_type"] == "audio"]
  if not audio_streams:
      raise NoAudioTrackError("Nenhuma faixa de áudio encontrada")
  ```
- **Mensagem ao usuário:** "Este vídeo não possui áudio. O VoxDescriber precisa do áudio para detectar as pausas onde inserir as audiodescrições."
- **Fallback:** Oferecer modo "somente visual" — usar timestamps fixos (a cada X segundos) para gerar ADs sem VAD.

#### BUG-V03 — Vídeo todo silêncio (sem diálogo)
- **Descrição:** WhisperX processa mas retorna 0 segmentos de fala; nenhum intervalo de silêncio é classificado como "pausa disponível".
- **Detecção:**
  ```python
  segments = whisperx_result.get("segments", [])
  if not segments:
      raise NoSpeechDetectedWarning("Nenhum trecho de fala detectado")
  ```
- **Mensagem ao usuário:** "Nenhuma fala detectada no áudio. O app irá sugerir inserções em intervalos fixos. Deseja continuar?"
- **Fallback:** Gerar pausas sintéticas a cada 30s (configurável).

#### BUG-V04 — Vídeo todo diálogo (sem silêncio)
- **Descrição:** VAD detecta fala contínua; não há janelas de silêncio ≥ mínimo configurado (ex: 1.5s) para inserir AD.
- **Detecção:**
  ```python
  available_gaps = [g for g in gaps if g.duration >= MIN_GAP_SECONDS]
  if not available_gaps:
      raise NoAvailableGapsWarning("Nenhuma pausa disponível para audiodescrição")
  ```
- **Mensagem ao usuário:** "O áudio está muito contínuo. Não foram encontradas pausas suficientes para inserir audiodescrições. Tente reduzir o tempo mínimo de pausa nas configurações."
- **Fallback:** Reduzir `MIN_GAP_SECONDS` progressivamente (1.5 → 0.8 → 0.5) e alertar o usuário sobre possível sobreposição.

#### BUG-V05 — Vídeo muito curto (< 30s)
- **Descrição:** WhisperX pode ter instabilidade em áudios muito curtos; resultado de VAD pode ser vazio.
- **Detecção:** `if video_duration < 30: warnings.warn("Vídeo muito curto — resultados podem ser imprecisos")`
- **Mensagem ao usuário:** "Vídeo com menos de 30 segundos. Os resultados podem ser menos precisos."
- **Fallback:** Processar normalmente, mas exibir aviso.

#### BUG-V06 — Vídeo muito longo (> 3h)
- **Descrição:** RAM estoura durante VAD; ffmpeg trava em extração de frames; arquivos temporários gigantes enchem o disco.
- **Detecção:**
  ```python
  if video_duration > 10800:
      estimated_temp_gb = video_duration * 0.002  # ~2MB/s
      if not check_disk_space_gb(estimated_temp_gb + 5):
          raise InsufficientDiskSpaceError(...)
  ```
- **Mensagem ao usuário:** "Vídeo longo detectado (> 3h). O processamento será dividido em chunks de 30 minutos. Isso pode levar bastante tempo."
- **Fallback:** Chunking automático com reassembly no final.

#### BUG-V07 — Arquivo corrompido
- **Descrição:** ffprobe retorna erro, ou duração é 0, ou o arquivo está incompleto (download interrompido).
- **Detecção:**
  ```python
  probe = run_ffprobe(path)
  if probe.get("format", {}).get("duration", 0) == 0:
      raise CorruptedVideoError("Arquivo corrompido ou incompleto")
  ```
- **Mensagem ao usuário:** "O arquivo de vídeo parece estar corrompido ou incompleto. Verifique o arquivo original."
- **Fallback:** Tentar recuperação parcial via `ffmpeg -err_detect ignore_err`.

#### BUG-V08 — Múltiplas faixas de áudio
- **Descrição:** Vídeo com 2+ tracks (ex: português + inglês, ou áudio de câmera + mixagem). WhisperX recebe a faixa errada.
- **Detecção:**
  ```python
  audio_streams = [s for s in streams if s["codec_type"] == "audio"]
  if len(audio_streams) > 1:
      # Perguntar ao usuário qual faixa usar
      show_audio_track_selector(audio_streams)
  ```
- **Mensagem ao usuário:** "Múltiplas faixas de áudio encontradas. Selecione qual faixa usar para a audiodescrição."
- **Fallback:** Usar a primeira faixa por padrão com aviso.

#### BUG-V09 — Vídeo com legendas embutidas (burn-in ou ASS/SRT)
- **Descrição:** Legendas hard-coded aparecem nos frames; o modelo de visão pode descrever o texto das legendas em vez da cena.
- **Detecção:** Verificar via ffprobe se há subtitle streams; para burn-in, não há detecção automática.
- **Mensagem ao usuário:** "Legendas embutidas detectadas. Recomenda-se usar a versão do vídeo sem legendas para melhor qualidade de audiodescrição."
- **Fallback:** Continuar com aviso; futuro: usar inpainting para remover texto.

---

### 1.2 Pipeline de IA (Ollama / Qwen2.5-VL)

#### BUG-A01 — Ollama não instalado
- **Descrição:** `ollama` não existe no PATH; subprocess retorna FileNotFoundError.
- **Detecção:**
  ```python
  import shutil
  if not shutil.which("ollama"):
      raise OllamaNotInstalledError("Ollama não encontrado no sistema")
  ```
- **Mensagem ao usuário:** "Ollama não está instalado. Acesse https://ollama.ai para instalar e tente novamente."
- **Fallback:** Direcionar para download automático (futuro) ou link de instalação.

#### BUG-A02 — Ollama instalado mas não rodando
- **Descrição:** `ollama serve` não foi iniciado; chamada HTTP à API retorna ConnectionRefusedError.
- **Detecção:**
  ```python
  import requests
  try:
      r = requests.get("http://localhost:11434/api/tags", timeout=3)
      r.raise_for_status()
  except requests.exceptions.ConnectionError:
      raise OllamaNotRunningError("Serviço Ollama não está rodando")
  ```
- **Mensagem ao usuário:** "O serviço Ollama não está ativo. Iniciando automaticamente..."
- **Fallback:** Tentar `subprocess.Popen(["ollama", "serve"])` em background e aguardar até 10s.

#### BUG-A03 — Modelo não baixado (primeira execução)
- **Descrição:** API retorna 404 ou lista de modelos não inclui `qwen2.5vl:7b`.
- **Detecção:**
  ```python
  tags = requests.get("http://localhost:11434/api/tags").json()
  models = [m["name"] for m in tags.get("models", [])]
  if "qwen2.5vl:7b" not in models:
      raise ModelNotDownloadedError("Modelo qwen2.5vl:7b não encontrado")
  ```
- **Mensagem ao usuário:** "Modelo de visão não encontrado. Iniciando download (~4GB)... Isso só acontece uma vez."
- **Fallback:** Iniciar `ollama pull qwen2.5vl:7b` com progress bar na UI.

#### BUG-A04 — RAM insuficiente para o modelo
- **Descrição:** `qwen2.5vl:7b` requer ~8GB RAM (CPU) ou ~6GB VRAM (GPU). Em máquinas com < 8GB disponíveis, Ollama trava ou o processo é morto pelo OS.
- **Detecção:**
  ```python
  import psutil
  available_ram_gb = psutil.virtual_memory().available / (1024**3)
  if available_ram_gb < 7.5:
      raise InsufficientRAMWarning(f"RAM disponível: {available_ram_gb:.1f}GB (recomendado: 8GB+)")
  ```
- **Mensagem ao usuário:** "Memória RAM insuficiente ({X}GB disponível). O processamento pode ser muito lento ou falhar. Feche outros aplicativos e tente novamente."
- **Fallback:** Sugerir modelo menor (`qwen2.5vl:3b`), ou modo API externa.

#### BUG-A05 — GPU sem VRAM suficiente
- **Descrição:** NVIDIA com < 6GB VRAM; Ollama tenta usar GPU e falha, ou cai para CPU sem aviso.
- **Detecção:**
  ```python
  # Via nvidia-smi
  result = subprocess.run(["nvidia-smi", "--query-gpu=memory.free",
                           "--format=csv,noheader,nounits"],
                          capture_output=True, text=True)
  if result.returncode == 0:
      free_vram_mb = int(result.stdout.strip())
      if free_vram_mb < 5500:
          warnings.warn(f"VRAM disponível: {free_vram_mb}MB — pode não ser suficiente")
  ```
- **Mensagem ao usuário:** "VRAM disponível ({X}MB) pode ser insuficiente. O app usará CPU como fallback (mais lento)."
- **Fallback:** Forçar `OLLAMA_NUM_GPU=0` para rodar em CPU.

#### BUG-A06 — Timeout na chamada ao Ollama
- **Descrição:** Frame complexo + modelo sobrecarregado = geração ultrapassa o timeout configurado.
- **Detecção:**
  ```python
  try:
      response = requests.post(ollama_url, json=payload, timeout=OLLAMA_TIMEOUT_SEC)
  except requests.exceptions.Timeout:
      raise OllamaTimeoutError(f"Timeout após {OLLAMA_TIMEOUT_SEC}s")
  ```
- **Mensagem ao usuário:** "O modelo demorou demais para responder. Tentando novamente..."
- **Fallback:** Retry com backoff exponencial (3 tentativas); se falhar, pular o frame com log.

#### BUG-A07 — Resposta do modelo em formato inesperado
- **Descrição:** LLM retorna JSON malformado, resposta vazia, texto em outro idioma, ou recusa (safety filter).
- **Detecção:**
  ```python
  raw = response.json().get("response", "").strip()
  if not raw:
      raise EmptyModelResponseError("Resposta vazia do modelo")
  if len(raw) < 10:
      raise SuspiciousResponseError(f"Resposta suspeita: '{raw}'")
  ```
- **Mensagem ao usuário:** "O modelo gerou uma resposta inválida para este trecho. Usando descrição genérica."
- **Fallback:** Usar texto placeholder ("Cena sem descrição disponível") e continuar pipeline.

#### BUG-A08 — Resposta do modelo muito longa para o slot de silêncio
- **Descrição:** Modelo gera 200 palavras; o slot tem 1.5s; o TTS vai estourar o tempo disponível.
- **Detecção:** Estimar duração antes de gerar TTS:
  ```python
  estimated_duration = len(description.split()) * AVG_WORD_DURATION_SEC
  if estimated_duration > gap.duration * 0.85:  # 85% do slot como margem
      description = truncate_to_fit(description, gap.duration)
  ```
- **Mensagem ao usuário:** (silencioso — tratamento automático)
- **Fallback:** Truncar description respeitando frases completas; ou comprimir áudio do TTS (speed up até 1.3x).

---

### 1.3 WhisperX VAD

#### BUG-W01 — Áudio muito ruidoso
- **Descrição:** Gravação externa, câmera de mão, vento, etc. VAD detecta ruído como fala e não encontra pausas reais.
- **Detecção:** Verificar SNR estimado do áudio antes de processar.
- **Mensagem ao usuário:** "Áudio com muito ruído detectado. Considere aplicar redução de ruído (filtro `anlmdn` do ffmpeg)."
- **Fallback:** Pré-processar áudio com `ffmpeg -af anlmdn` antes de enviar ao WhisperX.

#### BUG-W02 — Música de fundo muito alta
- **Descrição:** Trilha sonora domina; VAD classifica música como fala contínua.
- **Detecção:** Análise de frequência via `ffmpeg -af volumedetect`; verificar se energia de fala é dominante.
- **Mensagem ao usuário:** "Música de fundo intensa detectada. A detecção de pausas pode ser menos precisa."
- **Fallback:** Oferecer opção de separação de stems via `demucs` (futuro feature).

#### BUG-W03 — Idioma não detectado corretamente
- **Descrição:** WhisperX infere idioma errado; timestamps ficam descalibrados.
- **Detecção:**
  ```python
  detected_lang = whisperx_result.get("language")
  confidence = whisperx_result.get("language_probability", 0)
  if confidence < 0.7:
      warn(f"Idioma detectado com baixa confiança: {detected_lang} ({confidence:.0%})")
  ```
- **Mensagem ao usuário:** "Idioma detectado: {lang} ({conf}% confiança). Correto? [Selecionar idioma manualmente]"
- **Fallback:** Permitir que o usuário force o idioma nas configurações.

#### BUG-W04 — Nenhuma pausa detectada (threshold muito alto)
- **Descrição:** Parâmetros conservadores do VAD não identificam pausas curtas.
- **Detecção:** `if len(gaps) == 0: raise NoGapsFoundError(...)`
- **Mensagem ao usuário:** "Nenhuma pausa encontrada com os parâmetros atuais. Ajustando threshold automaticamente..."
- **Fallback:** Relaxar `vad_threshold` de 0.5 → 0.3 e tentar novamente.

#### BUG-W05 — WhisperX trava em vídeos com áudio mono de baixa taxa
- **Descrição:** 8kHz mono (comum em videoconferências antigas) pode causar resample error.
- **Detecção:** Verificar via ffprobe `sample_rate` e `channels`; pré-converter para 16kHz stereo.
- **Mensagem ao usuário:** (silencioso — tratamento automático)
- **Fallback:** `ffmpeg -ar 16000 -ac 1` antes de passar ao WhisperX.

#### BUG-W06 — CUDA OOM durante WhisperX (GPU mode)
- **Descrição:** WhisperX com `device="cuda"` estoura VRAM durante transcrição de áudio longo.
- **Detecção:** Catch `torch.cuda.OutOfMemoryError`
- **Mensagem ao usuário:** "Memória de GPU insuficiente para transcrição. Usando CPU (mais lento)."
- **Fallback:** Reiniciar WhisperX com `device="cpu"` automaticamente.

---

### 1.4 Piper TTS

#### BUG-T01 — Binário Piper não encontrado
- **Descrição:** `piper` não está no PATH nem no diretório esperado do app.
- **Detecção:**
  ```python
  piper_path = find_piper_binary()  # checa PATH + bundle dir + ~/.local/bin
  if not piper_path:
      raise PiperNotFoundError("Binário piper não encontrado")
  ```
- **Mensagem ao usuário:** "TTS não configurado. Baixando Piper automaticamente..."
- **Fallback:** Download automático do binário para `~/.voxdescriber/bin/piper`.

#### BUG-T02 — Arquivo de voz (.onnx) não encontrado
- **Descrição:** Usuário configurou voz que não foi baixada; piper retorna erro de arquivo não encontrado.
- **Detecção:**
  ```python
  if not Path(voice_model_path).exists():
      raise VoiceModelNotFoundError(f"Voz não encontrada: {voice_model_path}")
  ```
- **Mensagem ao usuário:** "Voz '{name}' não encontrada. Baixando modelo de voz ({size}MB)..."
- **Fallback:** Baixar automaticamente do repositório Piper; fallback para voz padrão incluída no bundle.

#### BUG-T03 — Texto muito longo para o slot de silêncio
- **Descrição:** TTS gera áudio maior que o slot disponível; AD vai sobrepor a próxima fala.
- **Detecção:** Medir duração do arquivo gerado com ffprobe antes de inserir.
- **Mensagem ao usuário:** (silencioso — tratamento automático)
- **Fallback:** Opções em cascata:
  1. Truncar texto preservando frase completa
  2. Aumentar velocidade (atempo até 1.4x)
  3. Reduzir pausas internas do TTS
  4. Se nada funcionar: logar e pular

#### BUG-T04 — Caracteres especiais causando falha no Piper
- **Descrição:** Modelo retorna texto com emojis, aspas tipográficas, en-dashes, caracteres Unicode raros; piper pode travar ou gerar silêncio.
- **Detecção:** Sanitizar texto antes de enviar:
  ```python
  def sanitize_for_tts(text: str) -> str:
      text = unicodedata.normalize("NFKD", text)
      text = re.sub(r'[^\w\s\.,;:!?\-áéíóúàèìòùâêîôûãõñçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÑÇ]', ' ', text)
      text = re.sub(r'\s+', ' ', text).strip()
      return text
  ```
- **Mensagem ao usuário:** (silencioso)
- **Fallback:** Sanitização automática + log do texto original.

#### BUG-T05 — Piper falha silenciosamente (retorna código 0 mas arquivo vazio)
- **Descrição:** Bug raro onde piper termina sem erro mas o .wav gerado tem 0 bytes ou duração 0.
- **Detecção:**
  ```python
  output_path = Path(output_wav)
  if not output_path.exists() or output_path.stat().st_size < 100:
      raise TTSOutputEmptyError("Piper gerou arquivo vazio")
  # Verificar duração também
  duration = get_audio_duration(output_wav)
  if duration < 0.1:
      raise TTSOutputEmptyError("Piper gerou áudio com duração zero")
  ```
- **Mensagem ao usuário:** "Erro ao gerar voz para este trecho. Pulando."
- **Fallback:** Usar beep de aviso ou silêncio no slot; continuar pipeline.

#### BUG-T06 — Piper não tem permissão de execução (Linux/Mac após download)
- **Descrição:** Binário baixado sem bit de execução.
- **Detecção:** `if not os.access(piper_path, os.X_OK): os.chmod(piper_path, 0o755)`
- **Fallback:** Corrigir permissão automaticamente.

---

### 1.5 ffmpeg

#### BUG-F01 — ffmpeg não instalado
- **Descrição:** `ffmpeg` não existe no PATH.
- **Detecção:**
  ```python
  if not shutil.which("ffmpeg"):
      raise FFmpegNotInstalledError("ffmpeg não encontrado")
  ```
- **Mensagem ao usuário:** "ffmpeg não está instalado. Baixando automaticamente via ffmpeg-python-binary..."
- **Fallback:** Bundle ffmpeg static no instalador; ou download via `imageio-ffmpeg`.

#### BUG-F02 — Permissão negada ao escrever no destino
- **Descrição:** Usuário tenta exportar para `/Applications/` ou pasta protegida no Windows.
- **Detecção:**
  ```python
  test_file = Path(output_dir) / ".voxdescriber_write_test"
  try:
      test_file.touch()
      test_file.unlink()
  except PermissionError:
      raise OutputPermissionError(f"Sem permissão de escrita em: {output_dir}")
  ```
- **Mensagem ao usuário:** "Sem permissão para salvar nesta pasta. Escolha outra localização."
- **Fallback:** Sugerir Desktop ou pasta Documentos.

#### BUG-F03 — Espaço em disco insuficiente
- **Descrição:** Arquivo temporário + exportação final podem precisar de 5-20GB para vídeos longos.
- **Detecção:**
  ```python
  import shutil
  free_gb = shutil.disk_usage(temp_dir).free / (1024**3)
  required_gb = estimate_required_space_gb(video_path)
  if free_gb < required_gb * 1.2:  # 20% de margem
      raise InsufficientDiskSpaceError(...)
  ```
- **Mensagem ao usuário:** "Espaço insuficiente em disco. Necessário: {req}GB, Disponível: {free}GB."
- **Fallback:** Oferecer processamento com menor qualidade/resolução para reduzir espaço.

#### BUG-F04 — Codec não suportado para exportação
- **Descrição:** Usuário escolhe exportar como MKV com codec de áudio que não está disponível no build do ffmpeg.
- **Detecção:** Verificar `ffmpeg -codecs` antes de usar o codec.
- **Mensagem ao usuário:** "Codec {codec} não disponível nesta instalação do ffmpeg. Usando AAC como alternativa."
- **Fallback:** Fallback para H.264+AAC para máxima compatibilidade.

#### BUG-F05 — Falha na extração de frames
- **Descrição:** ffmpeg falha ao extrair frame num timestamp específico (ex: keyframe distante, seek impreciso).
- **Detecção:**
  ```python
  if not Path(frame_path).exists():
      # Tentar com -accurate_seek
      # Ou buscar keyframe mais próximo
  ```
- **Mensagem ao usuário:** (silencioso)
- **Fallback:** Usar frame do timestamp mais próximo disponível; ou usar `-ss` antes do input para seek mais rápido.

#### BUG-F06 — ffmpeg travado sem progresso (processo zombie)
- **Descrição:** Em raros casos, ffmpeg fica em loop esperando stdin ou trava em stream corrompida.
- **Detecção:** Timeout no subprocess com watchdog thread.
- **Mensagem ao usuário:** "ffmpeg demorou demais. Cancelando operação..."
- **Fallback:** `process.kill()` + cleanup de arquivos temporários.

#### BUG-F07 — Arquivo temporário não deletado após falha
- **Descrição:** Crash no meio do processamento deixa GBs de arquivos temp no disco.
- **Detecção/Solução:** Context manager para cleanup:
  ```python
  class TempWorkspace:
      def __enter__(self): return self.tmpdir
      def __exit__(self, *args):
          shutil.rmtree(self.tmpdir, ignore_errors=True)
  ```
- **Fallback:** Routine de limpeza no startup do app.

---

### 1.6 UI/UX (PySide6)

#### BUG-U01 — UI thread bloqueada durante processamento
- **Descrição:** Pipeline rodando na main thread congela a janela; usuário pensa que travou.
- **Detecção:** Todo processamento deve rodar em `QThread` ou `ThreadPoolExecutor`.
- **Mensagem ao usuário:** (prevenir com design correto — UI nunca deve travar)
- **Fallback:** Mover TODO processamento para workers. Usar `QThread + signals` para feedback.

#### BUG-U02 — Progress bar não atualizando
- **Descrição:** Worker não emite signal de progresso; barra fica em 0% ou 100% durante todo o processo.
- **Detecção:** Verificar se `progress_signal.emit(value)` está sendo chamado dentro dos loops principais.
- **Fallback:** Ao menos atualizar por etapa (VAD → Visão → TTS → Mixagem = 4 etapas fixas).

#### BUG-U03 — Preview de vídeo não carregando
- **Descrição:** `QMediaPlayer` não consegue abrir o vídeo (codec não suportado no Qt multimedia backend).
- **Detecção:** Conectar ao signal `errorOccurred` do QMediaPlayer.
- **Mensagem ao usuário:** "Preview não disponível para este formato. O processamento funciona normalmente."
- **Fallback:** Exibir thumbnail estático via ffmpeg ao invés de preview em tempo real.

#### BUG-U04 — App fecha sem salvar estado durante processamento longo
- **Descrição:** Usuário fecha a janela acidentalmente durante 2h de processamento; tudo se perde.
- **Detecção:** Interceptar `closeEvent` do QMainWindow.
- **Mensagem ao usuário:** "Processamento em andamento. Tem certeza que deseja sair? O progresso será perdido."
- **Fallback:** Implementar checkpoint/resume (salvar resultado de cada slot processado).

#### BUG-U05 — Crash sem mensagem de erro visível
- **Descrição:** Exceção não capturada mata o processo silenciosamente.
- **Detecção:** Global exception handler:
  ```python
  def handle_exception(exc_type, exc_value, exc_traceback):
      logger.critical("Exceção não capturada", exc_info=(exc_type, exc_value, exc_traceback))
      QMessageBox.critical(None, "Erro Inesperado",
                           f"Ocorreu um erro: {exc_value}\nConsulte o log em {LOG_PATH}")
  sys.excepthook = handle_exception
  ```
- **Fallback:** Salvar crash dump com contexto completo em `~/voxdescriber_crash.log`.

#### BUG-U06 — Exportação para pasta sem permissão (macOS sandbox)
- **Descrição:** macOS bloqueia acesso a pastas não autorizadas em apps distribuídos fora da Mac App Store.
- **Detecção:** Tratar `PermissionError` na exportação final.
- **Mensagem ao usuário:** "Acesso negado. Use o botão 'Escolher Pasta' para autorizar o acesso."
- **Fallback:** Usar `QFileDialog` que aciona o entitlement correto no macOS.

#### BUG-U07 — Memory leak em sessões longas (vídeos >1h)
- **Descrição:** Frames PIL/numpy não liberados; memória cresce até crash.
- **Detecção:** Profiling com `tracemalloc` em modo debug.
- **Fallback:** Processar e liberar frames explicitamente:
  ```python
  frame = load_frame(path)
  description = describe_frame(frame)
  del frame  # liberar memória
  ```

---

## 2. Plano de Testes

### 2.1 Fixtures de Áudio/Vídeo Sintéticos

```
tests/
  fixtures/
    video_30s_3_pausas.mp4       # 3 pausas de 2s cada
    video_sem_audio.mp4          # stream de vídeo sem áudio
    video_silencio_total.mp4     # áudio silencioso
    video_dialogo_continuo.mp4   # fala sem pausa
    video_corrompido.mp4         # arquivo truncado
    video_codec_antigo.avi       # DivX3 / Indeo
    audio_ruidoso.wav            # SNR < 10dB
    audio_musica_alta.wav        # trilha > voz
    audio_mono_8khz.wav          # qualidade baixa
    texto_com_acentos.txt        # UTF-8 com ç, ã, é, etc.
```

### 2.2 Testes Unitários

#### `tests/test_vad.py`
```python
import pytest
import numpy as np
from voxdescriber.vad import detect_silence_gaps, MIN_GAP_SECONDS

def make_audio_with_gaps(gaps_at: list, duration: float, sr: int = 16000) -> np.ndarray:
    """Gera áudio sintético com silêncios nas posições especificadas."""
    audio = np.random.randn(int(duration * sr)) * 0.1  # ruído baixo
    for start, end in gaps_at:
        s, e = int(start * sr), int(end * sr)
        audio[s:e] = 0.0  # silêncio
    return audio

class TestDetectSilenceGaps:
    def test_detecta_3_pausas(self):
        gaps_at = [(5.0, 7.0), (15.0, 17.5), (25.0, 28.0)]
        audio = make_audio_with_gaps(gaps_at, duration=30.0)
        result = detect_silence_gaps(audio, sr=16000, min_gap=1.5)
        assert len(result) == 3

    def test_audio_sem_pausas_retorna_lista_vazia(self):
        audio = np.random.randn(16000 * 10) * 0.5  # ruído alto contínuo
        result = detect_silence_gaps(audio, sr=16000, min_gap=1.5)
        assert len(result) == 0

    def test_audio_silencioso_total(self):
        audio = np.zeros(16000 * 10)
        result = detect_silence_gaps(audio, sr=16000, min_gap=1.5)
        # Deve retornar um gap cobrindo todo o áudio
        assert len(result) >= 1
        assert result[0].duration > 9.0

    def test_pausa_abaixo_do_minimo_ignorada(self):
        gaps_at = [(5.0, 5.5)]  # 0.5s — abaixo do mínimo de 1.5s
        audio = make_audio_with_gaps(gaps_at, duration=10.0)
        result = detect_silence_gaps(audio, sr=16000, min_gap=1.5)
        assert len(result) == 0

    def test_audio_ruidoso_nao_cria_gaps_falsos(self):
        audio = np.random.randn(16000 * 10) * 2.0  # ruído muito alto
        result = detect_silence_gaps(audio, sr=16000, min_gap=1.5)
        # Não deve detectar gaps em ruído puro
        assert len(result) == 0

    def test_timestamps_precisos(self):
        gaps_at = [(3.0, 5.0)]
        audio = make_audio_with_gaps(gaps_at, duration=10.0)
        result = detect_silence_gaps(audio, sr=16000, min_gap=1.5)
        assert len(result) == 1
        assert abs(result[0].start - 3.0) < 0.1
        assert abs(result[0].end - 5.0) < 0.1
```

#### `tests/test_vision.py`
```python
import pytest
from unittest.mock import patch, MagicMock
from voxdescriber.vision import describe_frame, build_prompt, OllamaTimeoutError

MOCK_FRAME_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ..."

class TestBuildPrompt:
    def test_prompt_contem_instrucao_audiodescrição(self):
        prompt = build_prompt(context="cena de ação", language="pt")
        assert "audiodescrição" in prompt.lower() or "descreva" in prompt.lower()

    def test_prompt_com_contexto_vazio(self):
        prompt = build_prompt(context="", language="pt")
        assert len(prompt) > 10  # Prompt mínimo válido

    def test_prompt_idioma_ingles(self):
        prompt = build_prompt(context="", language="en")
        assert "describe" in prompt.lower() or "audio description" in prompt.lower()

class TestDescribeFrame:
    @patch("voxdescriber.vision.requests.post")
    def test_retorna_descricao_valida(self, mock_post):
        mock_post.return_value.json.return_value = {
            "response": "Uma mulher caminha pela praia ao pôr do sol."
        }
        mock_post.return_value.status_code = 200
        result = describe_frame(MOCK_FRAME_B64, context="praia")
        assert len(result) > 5
        assert isinstance(result, str)

    @patch("voxdescriber.vision.requests.post")
    def test_resposta_vazia_levanta_excecao(self, mock_post):
        mock_post.return_value.json.return_value = {"response": ""}
        with pytest.raises(Exception):  # EmptyModelResponseError
            describe_frame(MOCK_FRAME_B64)

    @patch("voxdescriber.vision.requests.post")
    def test_timeout_levanta_excecao_correta(self, mock_post):
        import requests
        mock_post.side_effect = requests.exceptions.Timeout()
        with pytest.raises(OllamaTimeoutError):
            describe_frame(MOCK_FRAME_B64)

    @patch("voxdescriber.vision.requests.post")
    def test_retry_em_timeout(self, mock_post):
        import requests
        mock_post.side_effect = [
            requests.exceptions.Timeout(),
            MagicMock(json=lambda: {"response": "Uma cena válida."}, status_code=200)
        ]
        result = describe_frame(MOCK_FRAME_B64, max_retries=3)
        assert result == "Uma cena válida."
        assert mock_post.call_count == 2

    @patch("voxdescriber.vision.requests.post")
    def test_descricao_muito_longa_e_truncada(self, mock_post):
        long_text = "palavra " * 500  # 500 palavras
        mock_post.return_value.json.return_value = {"response": long_text}
        mock_post.return_value.status_code = 200
        result = describe_frame(MOCK_FRAME_B64, max_words=50)
        assert len(result.split()) <= 55  # margem de tolerância
```

#### `tests/test_tts.py`
```python
import pytest
import os
import tempfile
from pathlib import Path
from unittest.mock import patch
from voxdescriber.tts import generate_speech, get_audio_duration, sanitize_for_tts

class TestSanitizeForTTS:
    def test_remove_emojis(self):
        result = sanitize_for_tts("Olá mundo! 🌟🎬")
        assert "🌟" not in result
        assert "🎬" not in result
        assert "Olá mundo" in result

    def test_preserva_acentos(self):
        result = sanitize_for_tts("São Paulo, ação, coração")
        assert "São Paulo" in result
        assert "ação" in result

    def test_remove_caracteres_especiais_perigosos(self):
        result = sanitize_for_tts('Texto "com aspas" e — em-dash')
        assert '"' not in result
        assert "—" not in result

    def test_texto_vazio(self):
        result = sanitize_for_tts("")
        assert result == ""

    def test_texto_so_emojis(self):
        result = sanitize_for_tts("🚀🎭🌊")
        assert result.strip() == ""

class TestGenerateSpeech:
    def test_gera_arquivo_wav_valido(self, tmp_path):
        text = "Uma mulher caminha pela praia."
        output = tmp_path / "test_output.wav"
        generate_speech(text, output_path=str(output))
        assert output.exists()
        assert output.stat().st_size > 100

    def test_duracao_proporcional_ao_texto(self, tmp_path):
        short_text = "Ok."
        long_text = "Uma mulher de cabelos longos caminha lentamente pela praia ao pôr do sol enquanto as ondas batem suavemente nos seus pés."
        short_out = tmp_path / "short.wav"
        long_out = tmp_path / "long.wav"
        generate_speech(short_text, str(short_out))
        generate_speech(long_text, str(long_out))
        short_dur = get_audio_duration(str(short_out))
        long_dur = get_audio_duration(str(long_out))
        assert long_dur > short_dur * 2

    def test_texto_vazio_levanta_excecao(self, tmp_path):
        with pytest.raises(ValueError):
            generate_speech("", str(tmp_path / "empty.wav"))

    def test_arquivo_de_saida_criado_no_caminho_correto(self, tmp_path):
        out = tmp_path / "subdir" / "output.wav"
        out.parent.mkdir(parents=True)
        generate_speech("Teste.", str(out))
        assert out.exists()

class TestGetAudioDuration:
    def test_duracao_correta(self, tmp_path):
        # Criar WAV sintético de 2 segundos
        import wave, struct
        out = tmp_path / "two_seconds.wav"
        with wave.open(str(out), 'w') as f:
            f.setnchannels(1); f.setsampwidth(2); f.setframerate(16000)
            f.writeframes(struct.pack('<' + 'h' * 32000, *([0] * 32000)))
        dur = get_audio_duration(str(out))
        assert abs(dur - 2.0) < 0.1
```

#### `tests/test_mixer.py`
```python
import pytest
from pathlib import Path
from voxdescriber.mixer import mix_audio_tracks, AudioSlot

class TestMixAudioTracks:
    def test_mix_basico_sem_sobreposicao(self, tmp_path, sample_video, sample_ad_audio):
        slots = [
            AudioSlot(start=5.0, end=7.0, audio_path=sample_ad_audio),
        ]
        output = tmp_path / "output.mp4"
        mix_audio_tracks(sample_video, slots, str(output))
        assert output.exists()

    def test_sobreposicao_detectada_e_alertada(self, tmp_path, sample_video, sample_ad_audio):
        slots = [
            AudioSlot(start=5.0, end=8.0, audio_path=sample_ad_audio),
            AudioSlot(start=6.0, end=9.0, audio_path=sample_ad_audio),  # sobreposição
        ]
        with pytest.warns(UserWarning, match="sobreposição"):
            mix_audio_tracks(sample_video, slots, str(tmp_path / "out.mp4"))

    def test_volume_original_reduzido_durante_ad(self, tmp_path, sample_video, sample_ad_audio):
        """Volume do áudio original deve ser reduzido (ducking) durante a AD."""
        slots = [AudioSlot(start=3.0, end=5.0, audio_path=sample_ad_audio)]
        output = tmp_path / "out.mp4"
        mix_audio_tracks(sample_video, slots, str(output), ducking_db=-12)
        # Verificar que o arquivo de saída foi gerado corretamente
        assert output.exists()
        assert output.stat().st_size > 1000

    def test_video_sem_slots_passa_sem_alteracao(self, tmp_path, sample_video):
        output = tmp_path / "passthrough.mp4"
        mix_audio_tracks(sample_video, [], str(output))
        assert output.exists()
```

---

### 2.3 Testes de Integração

#### `tests/integration/test_pipeline_completo.py`
```python
import pytest
from voxdescriber.pipeline import VoxDescriberPipeline

@pytest.mark.integration
class TestPipelineCompleto:

    def test_video_30s_3_pausas_gera_3_ads(self, tmp_path):
        """Caso de uso principal: vídeo curto com pausas definidas."""
        pipeline = VoxDescriberPipeline(
            model="qwen2.5vl:7b",
            voice="pt_BR-edresson-low",
            min_gap=1.5
        )
        result = pipeline.process(
            input_path="tests/fixtures/video_30s_3_pausas.mp4",
            output_path=str(tmp_path / "output.mp4")
        )
        assert result.success
        assert len(result.ads_generated) == 3
        assert (tmp_path / "output.mp4").exists()

    def test_video_sem_pausas_usa_fallback(self, tmp_path):
        """Sem pausas → fallback para timestamps fixos com aviso."""
        pipeline = VoxDescriberPipeline(min_gap=1.5, fallback_interval=10.0)
        result = pipeline.process(
            input_path="tests/fixtures/video_dialogo_continuo.mp4",
            output_path=str(tmp_path / "output.mp4")
        )
        assert result.success
        assert result.used_fallback is True
        assert len(result.warnings) > 0
        assert "pausa" in result.warnings[0].lower()

    def test_video_longo_processado_em_chunks(self, tmp_path):
        """Vídeo de 1h deve ser processado em múltiplos chunks sem OOM."""
        pipeline = VoxDescriberPipeline(chunk_duration=1800)  # 30min chunks
        result = pipeline.process(
            input_path="tests/fixtures/video_1h.mp4",  # requires fixture
            output_path=str(tmp_path / "output.mp4")
        )
        assert result.success
        assert result.chunks_processed >= 2

    def test_video_sem_audio_retorna_erro_claro(self):
        pipeline = VoxDescriberPipeline()
        result = pipeline.process(
            input_path="tests/fixtures/video_sem_audio.mp4",
            output_path="/tmp/ignored.mp4"
        )
        assert result.success is False
        assert result.error_code == "NO_AUDIO_TRACK"
        assert "áudio" in result.error_message.lower()

    def test_ollama_offline_retorna_erro_acionavel(self, mock_ollama_offline):
        pipeline = VoxDescriberPipeline()
        result = pipeline.process(
            input_path="tests/fixtures/video_30s_3_pausas.mp4",
            output_path="/tmp/ignored.mp4"
        )
        assert result.success is False
        assert result.error_code in ("OLLAMA_NOT_RUNNING", "OLLAMA_NOT_INSTALLED")

    def test_arquivo_corrompido_retorna_erro_claro(self):
        pipeline = VoxDescriberPipeline()
        result = pipeline.process(
            input_path="tests/fixtures/video_corrompido.mp4",
            output_path="/tmp/ignored.mp4"
        )
        assert result.success is False
        assert result.error_code == "CORRUPTED_VIDEO"
```

---

### 2.4 Testes de Regressão de Qualidade

#### `tests/regression/test_ad_quality.py`
```python
"""
Testes de regressão para qualidade das audiodescrições.
Compara output atual com referência humana usando métricas NLP.
"""
import pytest
from voxdescriber.pipeline import VoxDescriberPipeline
from voxdescriber.quality import compute_bleu, compute_semantic_similarity

REFERENCE_ADS = {
    "tests/regression/fixtures/sample_scene.mp4": [
        "Uma mulher de cabelos ruivos entra na sala e se senta à mesa.",
        "O homem levanta e aponta para o mapa na parede.",
    ]
}

@pytest.mark.regression
class TestADQuality:
    def test_bleu_score_acima_do_threshold(self):
        """BLEU score deve manter-se acima de 0.15 em relação à referência humana."""
        pipeline = VoxDescriberPipeline()
        for video_path, reference_ads in REFERENCE_ADS.items():
            result = pipeline.process(video_path, output_path="/tmp/regression_test.mp4")
            for gen_ad, ref_ad in zip(result.ads_generated, reference_ads):
                score = compute_bleu(gen_ad.text, ref_ad)
                assert score > 0.10, (
                    f"BLEU score {score:.3f} abaixo do threshold para: '{gen_ad.text}'"
                )

    def test_semantic_similarity_acima_do_threshold(self):
        """Similaridade semântica (embeddings) deve ser > 0.5."""
        pipeline = VoxDescriberPipeline()
        for video_path, reference_ads in REFERENCE_ADS.items():
            result = pipeline.process(video_path, output_path="/tmp/regression_test.mp4")
            for gen_ad, ref_ad in zip(result.ads_generated, reference_ads):
                sim = compute_semantic_similarity(gen_ad.text, ref_ad)
                assert sim > 0.5, (
                    f"Similaridade semântica {sim:.3f} baixa para: '{gen_ad.text}'"
                )

    def test_descricao_nao_menciona_texto_de_legenda(self):
        """AD não deve descrever legendas embutidas como parte da cena."""
        pipeline = VoxDescriberPipeline()
        result = pipeline.process(
            "tests/regression/fixtures/video_com_legendas.mp4",
            output_path="/tmp/regression_test.mp4"
        )
        for ad in result.ads_generated:
            # Não deve conter frases de legenda conhecidas
            assert "você não vai acreditar" not in ad.text.lower()

    def test_numero_de_ads_consistente_entre_execucoes(self):
        """Duas execuções do mesmo vídeo devem gerar o mesmo número de ADs."""
        pipeline = VoxDescriberPipeline(seed=42)
        result1 = pipeline.process("tests/fixtures/video_30s_3_pausas.mp4", "/tmp/r1.mp4")
        result2 = pipeline.process("tests/fixtures/video_30s_3_pausas.mp4", "/tmp/r2.mp4")
        assert len(result1.ads_generated) == len(result2.ads_generated)
```

---

## 3. Helpers de Diagnóstico

> Ver arquivo completo: `projetos/voxdescriber/utils/diagnostics.py`

---

## 4. Checklist Pré-Release

### Ambiente
- [ ] ffmpeg disponível (PATH ou bundle)
- [ ] Ollama instalado e iniciado
- [ ] Modelo `qwen2.5vl:7b` baixado
- [ ] Piper binário com permissão de execução
- [ ] ≥ 8GB RAM disponível
- [ ] ≥ 10GB espaço em disco

### Testes
- [ ] `pytest tests/unit/ -v` — 100% pass
- [ ] `pytest tests/integration/ -v` — pass nos casos críticos
- [ ] `pytest tests/regression/ -v` — BLEU e similaridade dentro do threshold
- [ ] Teste manual: vídeo curto (<2min) em Mac
- [ ] Teste manual: vídeo curto (<2min) em Windows
- [ ] Teste manual: vídeo longo (>1h) com chunking
- [ ] Teste manual: vídeo corrompido → erro amigável

### UI/UX
- [ ] Progress bar atualiza durante todo o pipeline
- [ ] UI não trava em nenhum momento
- [ ] Botão Cancelar funciona e faz cleanup
- [ ] Mensagens de erro são claras e não técnicas
- [ ] Log de debug disponível em modo verbose

### Segurança/Robustez
- [ ] Cleanup de arquivos temporários após crash
- [ ] Crash handler salva log antes de fechar
- [ ] Sem hardcode de paths absolutos
- [ ] Sem segredos ou credenciais em código

---

*Documento gerado por Debug Hunter · Squad Titanio · VoxDescriber v0.1*
