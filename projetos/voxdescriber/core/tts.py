"""
TTS - Text-to-Speech com Piper TTS (PT-BR)
Converte texto de audiodescrição em áudio narrado em português do Brasil.
Verifica duração e ajusta velocidade se necessário.
"""

import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import soundfile as sf
from loguru import logger


# Voz padrão PT-BR do Piper
VOZ_PADRAO = "pt_BR-faber-medium"

# Caminho padrão do executável Piper
PIPER_EXECUTAVEL = "piper"

# Taxa de aceleração máxima (1.5 = 50% mais rápido)
ACELERACAO_MAXIMA = 1.5


class TTSNarrator:
    """
    Sintetiza voz usando Piper TTS.
    Se o áudio gerado for mais longo que o slot, tenta acelerar.
    """

    def __init__(
        self,
        voz: str = VOZ_PADRAO,
        piper_exec: str = PIPER_EXECUTAVEL,
        diretorio_modelos: Optional[str] = None,
    ):
        """
        Args:
            voz: Nome da voz Piper PT-BR
            piper_exec: Caminho para o executável piper
            diretorio_modelos: Diretório onde estão os modelos .onnx do Piper
        """
        self.voz = voz
        self.piper_exec = piper_exec
        self.diretorio_modelos = diretorio_modelos or self._detectar_diretorio_modelos()

        self._verificar_piper()
        logger.info(f"TTSNarrator iniciado — voz={voz}, piper={piper_exec}")

    def _detectar_diretorio_modelos(self) -> str:
        """Tenta encontrar o diretório de modelos do Piper."""
        candidatos = [
            Path.home() / ".local" / "share" / "piper",
            Path.home() / "piper-models",
            Path("/usr/local/share/piper"),
            Path("/opt/piper/models"),
        ]
        for caminho in candidatos:
            if caminho.exists():
                return str(caminho)

        # Usa diretório local como fallback
        diretorio = Path.home() / ".piper" / "models"
        diretorio.mkdir(parents=True, exist_ok=True)
        return str(diretorio)

    def _verificar_piper(self) -> None:
        """Verifica se o Piper está instalado e acessível."""
        try:
            resultado = subprocess.run(
                [self.piper_exec, "--version"],
                capture_output=True, text=True, timeout=5
            )
            logger.debug(f"Piper versão: {resultado.stdout.strip()}")
        except FileNotFoundError:
            logger.warning(
                f"Piper não encontrado em '{self.piper_exec}'. "
                "Instale: https://github.com/rhasspy/piper/releases"
            )
        except subprocess.TimeoutExpired:
            logger.warning("Timeout ao verificar Piper")

    def sintetizar(
        self,
        texto: str,
        duracao_maxima: Optional[float] = None,
    ) -> str:
        """
        Converte texto em áudio WAV.

        Args:
            texto: Texto para sintetizar
            duracao_maxima: Se fornecida, acelera o áudio para caber no tempo

        Returns:
            Caminho para o arquivo WAV gerado
        """
        if not texto.strip():
            raise ValueError("Texto vazio para síntese TTS")

        # Gera arquivo temporário
        tmp = tempfile.NamedTemporaryFile(
            suffix=".wav", delete=False, prefix="voxdescriber_tts_"
        )
        tmp.close()
        caminho_saida = tmp.name

        # Caminho do modelo Piper
        modelo_onnx = self._encontrar_modelo(self.voz)

        try:
            self._executar_piper(texto, modelo_onnx, caminho_saida)
        except Exception as e:
            if os.path.exists(caminho_saida):
                os.remove(caminho_saida)
            raise RuntimeError(f"Erro na síntese TTS: {e}") from e

        # Verifica duração e ajusta se necessário
        if duracao_maxima is not None:
            duracao_audio = self.obter_duracao(caminho_saida)
            if duracao_audio > duracao_maxima:
                logger.info(
                    f"Áudio ({duracao_audio:.2f}s) maior que slot ({duracao_maxima:.2f}s) "
                    f"— acelerando..."
                )
                caminho_saida = self._acelerar_audio(
                    caminho_saida, duracao_audio, duracao_maxima
                )

        return caminho_saida

    def _encontrar_modelo(self, voz: str) -> str:
        """Localiza o arquivo .onnx do modelo Piper."""
        candidatos = [
            Path(self.diretorio_modelos) / f"{voz}.onnx",
            Path(self.diretorio_modelos) / voz / f"{voz}.onnx",
        ]
        for caminho in candidatos:
            if caminho.exists():
                return str(caminho)

        # Se não encontrou, usa nome direto (Piper pode resolver internamente)
        logger.warning(f"Modelo '{voz}' não encontrado localmente, tentando usar diretamente")
        return voz

    def _executar_piper(
        self, texto: str, modelo: str, saida: str
    ) -> None:
        """Executa o Piper TTS via subprocess."""
        cmd = [
            self.piper_exec,
            "--model", modelo,
            "--output_file", saida,
        ]

        try:
            processo = subprocess.run(
                cmd,
                input=texto.encode("utf-8"),
                capture_output=True,
                timeout=60,
            )
            if processo.returncode != 0:
                erro = processo.stderr.decode("utf-8", errors="replace")
                raise RuntimeError(f"Piper retornou erro: {erro}")

        except subprocess.TimeoutExpired as e:
            raise RuntimeError("Timeout na síntese TTS (>60s)") from e
        except FileNotFoundError as e:
            raise RuntimeError(
                f"Piper não encontrado. Instale em: https://github.com/rhasspy/piper/releases"
            ) from e

    @staticmethod
    def obter_duracao(caminho_audio: str) -> float:
        """Retorna a duração de um arquivo de áudio em segundos."""
        try:
            info = sf.info(caminho_audio)
            return info.duration
        except Exception as e:
            logger.error(f"Erro ao ler duração de {caminho_audio}: {e}")
            # Fallback via ffprobe
            try:
                resultado = subprocess.run(
                    ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                     "-of", "default=noprint_wrappers=1:nokey=1", caminho_audio],
                    capture_output=True, text=True, timeout=10
                )
                return float(resultado.stdout.strip())
            except Exception:
                return 0.0

    def _acelerar_audio(
        self,
        caminho_entrada: str,
        duracao_atual: float,
        duracao_maxima: float,
    ) -> str:
        """
        Acelera o áudio para caber no tempo disponível usando ffmpeg.
        Limita a aceleração máxima para manter inteligibilidade.
        """
        import ffmpeg

        fator = min(duracao_atual / duracao_maxima, ACELERACAO_MAXIMA)
        caminho_saida = caminho_entrada.replace(".wav", "_acelerado.wav")

        try:
            (
                ffmpeg
                .input(caminho_entrada)
                .filter("atempo", fator)
                .output(caminho_saida, acodec="pcm_s16le")
                .overwrite_output()
                .run(quiet=True)
            )
            os.remove(caminho_entrada)
            return caminho_saida

        except ffmpeg.Error as e:
            logger.error(f"Erro ao acelerar áudio: {e}")
            return caminho_entrada  # Retorna original se falhar
