"""
VAD - Detecção de Voz e Silêncio
Usa WhisperX para transcrição + VAD e retorna slots de silêncio disponíveis para AD.
"""

import os
from dataclasses import dataclass
from typing import Callable, Optional

from loguru import logger


@dataclass
class SilenceSlot:
    """Representa um slot de silêncio disponível para audiodescrição."""
    start: float          # Início em segundos
    end: float            # Fim em segundos
    duration: float       # Duração em segundos
    frame_time: float     # Timestamp do frame central (para captura de imagem)


class VADProcessor:
    """
    Processa o vídeo para detectar slots de silêncio usando WhisperX.
    Retorna janelas de silêncio de pelo menos 1.5 segundos.
    """

    DURACAO_MINIMA: float = 1.5  # segundos mínimos por slot
    MARGEM_SEGURANCA: float = 0.2  # margem nas bordas dos slots

    def __init__(
        self,
        modelo: str = "base",
        dispositivo: str = "auto",
        idioma: str = "pt",
    ):
        """
        Args:
            modelo: Tamanho do modelo Whisper (tiny, base, small, medium, large)
            dispositivo: 'cuda', 'cpu' ou 'auto'
            idioma: Código do idioma para transcrição
        """
        self.modelo = modelo
        self.idioma = idioma
        self.dispositivo = self._detectar_dispositivo(dispositivo)
        self._whisperx_model = None
        logger.info(f"VADProcessor iniciado — modelo={modelo}, dispositivo={self.dispositivo}")

    def _detectar_dispositivo(self, dispositivo: str) -> str:
        """Detecta automaticamente se CUDA está disponível."""
        if dispositivo != "auto":
            return dispositivo
        try:
            import torch
            if torch.cuda.is_available():
                logger.info("GPU CUDA detectada — usando GPU para transcrição")
                return "cuda"
        except ImportError:
            pass
        logger.info("GPU não disponível — usando CPU para transcrição")
        return "cpu"

    def _carregar_modelo(self) -> None:
        """Carrega o modelo WhisperX sob demanda."""
        if self._whisperx_model is not None:
            return

        try:
            import whisperx
            logger.info(f"Carregando modelo WhisperX '{self.modelo}'...")
            self._whisperx_model = whisperx.load_model(
                self.modelo,
                self.dispositivo,
                language=self.idioma,
                compute_type="float16" if self.dispositivo == "cuda" else "int8",
            )
            logger.info("Modelo WhisperX carregado com sucesso")
        except ImportError as e:
            raise RuntimeError(
                "WhisperX não instalado. Execute: pip install whisperx"
            ) from e

    def processar(
        self,
        caminho_video: str,
        callback_progresso: Optional[Callable[[float, str], None]] = None,
    ) -> list[SilenceSlot]:
        """
        Processa o vídeo e retorna lista de slots de silêncio.

        Args:
            caminho_video: Caminho para o arquivo de vídeo
            callback_progresso: Função(progresso_0_a_1, mensagem) chamada durante o processo

        Returns:
            Lista de SilenceSlot ordenada por timestamp
        """
        if not os.path.exists(caminho_video):
            raise FileNotFoundError(f"Vídeo não encontrado: {caminho_video}")

        def progresso(p: float, msg: str) -> None:
            if callback_progresso:
                callback_progresso(p, msg)

        # Etapa 1: extrair áudio
        progresso(0.0, "Extraindo áudio do vídeo...")
        caminho_audio = self._extrair_audio(caminho_video)

        try:
            # Etapa 2: carregar modelo
            progresso(0.1, "Carregando modelo de fala...")
            self._carregar_modelo()

            # Etapa 3: transcrever com WhisperX
            progresso(0.2, "Transcrevendo áudio...")
            segmentos_fala = self._transcrever(caminho_audio, progresso)

            # Etapa 4: calcular duração total
            from utils.video import obter_duracao_video
            duracao_total = obter_duracao_video(caminho_video)

            # Etapa 5: calcular slots de silêncio
            progresso(0.9, "Calculando slots de silêncio...")
            slots = self._calcular_slots_silencio(segmentos_fala, duracao_total)

            progresso(1.0, f"{len(slots)} slots de silêncio encontrados")
            logger.info(f"VAD completo: {len(slots)} slots encontrados em {caminho_video}")
            return slots

        finally:
            # Remove arquivo de áudio temporário
            if os.path.exists(caminho_audio):
                os.remove(caminho_audio)

    def _extrair_audio(self, caminho_video: str) -> str:
        """Extrai o áudio do vídeo para um arquivo WAV temporário."""
        import tempfile
        import ffmpeg

        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        tmp.close()

        try:
            (
                ffmpeg
                .input(caminho_video)
                .output(tmp.name, acodec="pcm_s16le", ac=1, ar=16000)
                .overwrite_output()
                .run(quiet=True)
            )
        except ffmpeg.Error as e:
            raise RuntimeError(f"Erro ao extrair áudio: {e.stderr.decode()}") from e

        return tmp.name

    def _transcrever(
        self,
        caminho_audio: str,
        progresso: Callable[[float, str], None],
    ) -> list[dict]:
        """
        Roda WhisperX e retorna segmentos de fala com timestamps.
        Cada segmento: {"start": float, "end": float}
        """
        import whisperx

        progresso(0.3, "Carregando áudio...")
        audio = whisperx.load_audio(caminho_audio)

        progresso(0.4, "Transcrevendo com WhisperX...")
        resultado = self._whisperx_model.transcribe(audio, batch_size=16)

        progresso(0.6, "Alinhando timestamps...")
        try:
            modelo_alinhamento, metadata = whisperx.load_align_model(
                language_code=self.idioma,
                device=self.dispositivo,
            )
            resultado = whisperx.align(
                resultado["segments"],
                modelo_alinhamento,
                metadata,
                audio,
                self.dispositivo,
                return_char_alignments=False,
            )
        except Exception as e:
            logger.warning(f"Alinhamento falhou, usando timestamps básicos: {e}")

        progresso(0.8, "Processando segmentos...")
        segmentos = [
            {"start": seg["start"], "end": seg["end"]}
            for seg in resultado.get("segments", [])
            if "start" in seg and "end" in seg
        ]

        logger.debug(f"Transcrição: {len(segmentos)} segmentos de fala detectados")
        return segmentos

    def _calcular_slots_silencio(
        self,
        segmentos_fala: list[dict],
        duracao_total: float,
    ) -> list[SilenceSlot]:
        """
        Calcula os gaps de silêncio entre os segmentos de fala.
        Filtra por duração mínima e aplica margem de segurança.
        """
        slots: list[SilenceSlot] = []

        # Adiciona sentinelas para início e fim do vídeo
        pontos = [{"start": 0.0, "end": 0.0}]
        pontos.extend(sorted(segmentos_fala, key=lambda s: s["start"]))
        pontos.append({"start": duracao_total, "end": duracao_total})

        for i in range(len(pontos) - 1):
            inicio_silencio = pontos[i]["end"] + self.MARGEM_SEGURANCA
            fim_silencio = pontos[i + 1]["start"] - self.MARGEM_SEGURANCA
            duracao = fim_silencio - inicio_silencio

            if duracao >= self.DURACAO_MINIMA:
                frame_time = inicio_silencio + (duracao / 2)
                slots.append(SilenceSlot(
                    start=round(inicio_silencio, 3),
                    end=round(fim_silencio, 3),
                    duration=round(duracao, 3),
                    frame_time=round(frame_time, 3),
                ))

        return slots
