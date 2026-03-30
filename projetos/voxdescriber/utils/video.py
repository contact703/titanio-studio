"""
Video Utils - Extração de Frames e Informações de Vídeo
Utilitários para trabalhar com arquivos de vídeo via ffmpeg.
"""

import os
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import ffmpeg
from loguru import logger


@dataclass
class VideoInfo:
    """Informações básicas de um arquivo de vídeo."""
    caminho: str
    duracao: float          # segundos
    largura: int
    altura: int
    fps: float
    codec_video: str
    codec_audio: Optional[str]
    tamanho_bytes: int


def obter_info_video(caminho: str) -> VideoInfo:
    """
    Retorna informações sobre um arquivo de vídeo.

    Args:
        caminho: Caminho para o arquivo de vídeo

    Returns:
        VideoInfo com metadados do vídeo
    """
    if not os.path.exists(caminho):
        raise FileNotFoundError(f"Vídeo não encontrado: {caminho}")

    try:
        probe = ffmpeg.probe(caminho)
    except ffmpeg.Error as e:
        raise RuntimeError(f"Erro ao ler metadados do vídeo: {e}") from e

    # Extrai stream de vídeo
    stream_video = next(
        (s for s in probe["streams"] if s["codec_type"] == "video"),
        None
    )
    if stream_video is None:
        raise ValueError(f"Nenhum stream de vídeo encontrado em: {caminho}")

    # Extrai stream de áudio
    stream_audio = next(
        (s for s in probe["streams"] if s["codec_type"] == "audio"),
        None
    )

    # Calcula FPS
    fps_str = stream_video.get("avg_frame_rate", "25/1")
    try:
        num, den = fps_str.split("/")
        fps = float(num) / float(den) if float(den) > 0 else 25.0
    except (ValueError, ZeroDivisionError):
        fps = 25.0

    duracao = float(probe["format"].get("duration", 0))

    return VideoInfo(
        caminho=caminho,
        duracao=duracao,
        largura=int(stream_video.get("width", 0)),
        altura=int(stream_video.get("height", 0)),
        fps=fps,
        codec_video=stream_video.get("codec_name", "desconhecido"),
        codec_audio=stream_audio.get("codec_name") if stream_audio else None,
        tamanho_bytes=os.path.getsize(caminho),
    )


def obter_duracao_video(caminho: str) -> float:
    """
    Retorna a duração de um vídeo em segundos.
    Versão rápida que não carrega todos os metadados.
    """
    try:
        probe = ffmpeg.probe(caminho)
        return float(probe["format"].get("duration", 0))
    except Exception as e:
        logger.warning(f"ffprobe falhou para {caminho}: {e}")
        # Fallback via ffprobe direto
        try:
            resultado = subprocess.run(
                [
                    "ffprobe", "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    caminho
                ],
                capture_output=True, text=True, timeout=15
            )
            return float(resultado.stdout.strip())
        except Exception as e2:
            raise RuntimeError(f"Não foi possível obter duração do vídeo: {e2}") from e2


def extrair_frame(
    caminho_video: str,
    timestamp: float,
    qualidade: int = 2,
    largura_max: Optional[int] = None,
) -> str:
    """
    Extrai um frame do vídeo em um determinado timestamp.

    Args:
        caminho_video: Caminho para o arquivo de vídeo
        timestamp: Momento do frame em segundos
        qualidade: Qualidade JPEG (1=melhor, 31=pior, padrão=2)
        largura_max: Redimensiona se maior que este valor

    Returns:
        Caminho para o arquivo de imagem temporário (JPEG)
    """
    if not os.path.exists(caminho_video):
        raise FileNotFoundError(f"Vídeo não encontrado: {caminho_video}")

    tmp = tempfile.NamedTemporaryFile(
        suffix=".jpg", delete=False, prefix="voxdescriber_frame_"
    )
    tmp.close()

    try:
        stream = ffmpeg.input(caminho_video, ss=timestamp)

        if largura_max:
            stream = stream.filter("scale", largura_max, -1)

        (
            stream
            .output(tmp.name, vframes=1, qscale=qualidade, format="image2")
            .overwrite_output()
            .run(quiet=True)
        )

        if not os.path.exists(tmp.name) or os.path.getsize(tmp.name) == 0:
            raise RuntimeError(f"Frame não foi extraído para {tmp.name}")

        logger.debug(f"Frame extraído: {timestamp:.2f}s → {tmp.name}")
        return tmp.name

    except ffmpeg.Error as e:
        if os.path.exists(tmp.name):
            os.remove(tmp.name)
        erro = e.stderr.decode("utf-8", errors="replace") if e.stderr else str(e)
        raise RuntimeError(f"Erro ao extrair frame em {timestamp:.2f}s: {erro}") from e


def formatar_tempo(segundos: float) -> str:
    """Formata segundos no formato HH:MM:SS."""
    horas = int(segundos // 3600)
    minutos = int((segundos % 3600) // 60)
    segs = int(segundos % 60)
    return f"{horas:02d}:{minutos:02d}:{segs:02d}"
