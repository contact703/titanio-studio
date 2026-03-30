"""
Mixer - Mixagem de Áudio e Montagem do Vídeo Final
Usa ffmpeg-python para inserir as narações de AD no vídeo,
com ducking do áudio original durante as narrações.
"""

import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Optional

import ffmpeg
from loguru import logger


@dataclass
class FaixaAD:
    """Representa uma faixa de audiodescrição a ser inserida."""
    caminho_audio: str    # Arquivo WAV da narração
    timestamp_inicio: float   # Quando inserir no vídeo (segundos)
    duracao: float            # Duração da narração


class AudioMixer:
    """
    Monta o vídeo final com audiodescrição.
    Aplica ducking (redução do áudio original) durante as narrações.
    """

    # Volume do áudio original durante a narração (20% = -14dB approx)
    VOLUME_DUCKING: float = 0.20
    # Volume normal do áudio original
    VOLUME_NORMAL: float = 1.0
    # Fade do ducking em milissegundos
    FADE_MS: int = 150

    def __init__(
        self,
        volume_ducking: float = VOLUME_DUCKING,
    ):
        """
        Args:
            volume_ducking: Volume do áudio original durante narrações (0.0 a 1.0)
        """
        self.volume_ducking = volume_ducking
        logger.info(f"AudioMixer iniciado — ducking={volume_ducking*100:.0f}%")

    def mixar(
        self,
        caminho_video: str,
        faixas_ad: list[FaixaAD],
        caminho_saida: str,
        callback_progresso: Optional[Callable[[float, str], None]] = None,
    ) -> str:
        """
        Cria o vídeo final com audiodescrição mixada.

        Args:
            caminho_video: Vídeo original
            faixas_ad: Lista de faixas de AD ordenadas por timestamp
            caminho_saida: Caminho do vídeo de saída
            callback_progresso: Função(progresso_0_a_1, mensagem)

        Returns:
            Caminho do arquivo de saída gerado
        """
        if not os.path.exists(caminho_video):
            raise FileNotFoundError(f"Vídeo não encontrado: {caminho_video}")

        if not faixas_ad:
            logger.warning("Nenhuma faixa AD fornecida — copiando vídeo sem alterações")
            return self._copiar_video(caminho_video, caminho_saida)

        def progresso(p: float, msg: str) -> None:
            if callback_progresso:
                callback_progresso(p, msg)

        progresso(0.0, "Preparando mixagem...")

        # Ordena as faixas por timestamp
        faixas_ordenadas = sorted(faixas_ad, key=lambda f: f.timestamp_inicio)

        # Valida que não há sobreposições
        faixas_ordenadas = self._validar_faixas(faixas_ordenadas)

        progresso(0.1, f"Mixando {len(faixas_ordenadas)} narrações...")

        try:
            resultado = self._executar_mixagem(
                caminho_video, faixas_ordenadas, caminho_saida, progresso
            )
            progresso(1.0, "Vídeo exportado com sucesso!")
            return resultado

        except ffmpeg.Error as e:
            erro_msg = e.stderr.decode("utf-8", errors="replace") if e.stderr else str(e)
            logger.error(f"Erro ffmpeg na mixagem: {erro_msg}")
            raise RuntimeError(f"Erro na mixagem de vídeo: {erro_msg}") from e

    def _executar_mixagem(
        self,
        caminho_video: str,
        faixas: list[FaixaAD],
        caminho_saida: str,
        progresso: Callable[[float, str], None],
    ) -> str:
        """
        Executa a mixagem usando ffmpeg com filter_complex.
        Estratégia: gera uma faixa de ducking + mix com as ADs.
        """
        progresso(0.2, "Construindo filtro de áudio...")

        # Monta o filter_complex para ducking e mix
        filtro, mapa_saidas = self._construir_filtro(caminho_video, faixas)

        progresso(0.4, "Processando vídeo (pode demorar)...")

        # Constrói o comando ffmpeg
        entrada_video = ffmpeg.input(caminho_video)

        # Entradas dos áudios AD
        entradas_ad = [ffmpeg.input(f.caminho_audio) for f in faixas]

        # Aplica o filter_complex
        saida = ffmpeg.output(
            *([entrada_video] + entradas_ad),
            caminho_saida,
            vcodec="copy",           # Não re-encoda o vídeo (mais rápido)
            acodec="aac",
            audio_bitrate="192k",
            filter_complex=filtro,
            map="0:v:0",             # Stream de vídeo do arquivo original
            **{"map": mapa_saidas},  # Stream de áudio mixado
        ).overwrite_output()

        # Executa com monitoramento de progresso
        self._executar_com_progresso(saida, progresso)

        return caminho_saida

    def _construir_filtro(
        self,
        caminho_video: str,
        faixas: list[FaixaAD],
    ) -> tuple[str, str]:
        """
        Constrói o filter_complex do ffmpeg para ducking e mixagem.

        Retorna:
            - String do filter_complex
            - Identificador do stream de saída para -map
        """
        n = len(faixas)
        partes_filtro = []

        # Cria a cadeia de volume para o áudio original com ducking
        # Para cada AD, reduz o volume no intervalo correspondente
        cadeia_volume = "[0:a]"

        for i, faixa in enumerate(faixas):
            inicio = faixa.timestamp_inicio
            fim = inicio + faixa.duracao
            fade_s = self.FADE_MS / 1000

            # volume com enable time range para ducking
            parte = (
                f"volume=enable='between(t,{inicio:.3f},{fim:.3f})'"
                f":volume={self.volume_ducking}"
                f":eval=frame"
            )
            saida_vol = f"[vol{i}]"
            partes_filtro.append(f"{cadeia_volume}{parte}{saida_vol}")
            cadeia_volume = saida_vol

        # Renomeia a saída final do ducking
        ultima_saida_ducking = f"[ducked]"
        partes_filtro.append(f"{cadeia_volume}anull{ultima_saida_ducking}")

        # Prepara as entradas de AD com delays
        entradas_ad_com_delay = []
        for i, faixa in enumerate(faixas):
            delay_ms = int(faixa.timestamp_inicio * 1000)
            saida_delay = f"[ad{i}]"
            partes_filtro.append(
                f"[{i+1}:a]adelay={delay_ms}:all=1{saida_delay}"
            )
            entradas_ad_com_delay.append(saida_delay)

        # Mix final: ducked original + todas as ADs
        todas_entradas = ultima_saida_ducking + "".join(entradas_ad_com_delay)
        partes_filtro.append(
            f"{todas_entradas}amix=inputs={n + 1}:normalize=0[aout]"
        )

        filtro_completo = ";".join(partes_filtro)
        return filtro_completo, "[aout]"

    def _executar_com_progresso(
        self,
        stream: ffmpeg.nodes.OutputStream,
        progresso: Callable[[float, str], None],
    ) -> None:
        """Executa o ffmpeg reportando progresso."""
        processo = stream.run_async(pipe_stderr=True)
        stderr_output = b""

        while True:
            chunk = processo.stderr.read(1024)
            if not chunk:
                break
            stderr_output += chunk

            # Extrai progresso do stderr do ffmpeg
            if b"time=" in chunk:
                try:
                    parte = chunk.decode("utf-8", errors="replace")
                    idx = parte.rfind("time=")
                    if idx >= 0:
                        # time=00:01:23.45
                        tempo_str = parte[idx+5:idx+16].strip()
                        progresso(0.6, f"Processando... {tempo_str}")
                except Exception:
                    pass

        processo.wait()
        if processo.returncode != 0:
            raise ffmpeg.Error("ffmpeg", b"", stderr_output)

    @staticmethod
    def _copiar_video(origem: str, destino: str) -> str:
        """Copia o vídeo sem alterações."""
        import shutil
        shutil.copy2(origem, destino)
        return destino

    @staticmethod
    def _validar_faixas(faixas: list[FaixaAD]) -> list[FaixaAD]:
        """Remove faixas que se sobrepõem no tempo."""
        validadas = []
        tempo_livre_ate = 0.0

        for faixa in faixas:
            if faixa.timestamp_inicio >= tempo_livre_ate:
                validadas.append(faixa)
                tempo_livre_ate = faixa.timestamp_inicio + faixa.duracao
            else:
                logger.warning(
                    f"Faixa AD em {faixa.timestamp_inicio:.2f}s se sobrepõe com anterior — ignorando"
                )

        return validadas
