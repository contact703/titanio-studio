"""
VoxDescriber - Entry Point
Pipeline principal de audiodescrição automática de vídeos.

Uso:
    python main.py                          # Inicia a interface gráfica
    python main.py --video caminho.mp4     # Processa um vídeo via CLI
    python main.py --video in.mp4 --saida out.mp4 --sem-ui
"""

import argparse
import os
import sys
import tempfile
from pathlib import Path
from typing import Callable, Optional

from loguru import logger


def configurar_logger(nivel: str = "INFO") -> None:
    """Configura o Loguru para output adequado."""
    logger.remove()
    logger.add(
        sys.stderr,
        level=nivel,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | {message}",
        colorize=True,
    )
    # Log em arquivo
    log_dir = Path.home() / ".voxdescriber" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    logger.add(
        log_dir / "voxdescriber_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="7 days",
        level="DEBUG",
    )


def executar_pipeline(
    caminho_video: str,
    caminho_saida: str,
    config=None,
    callback_progresso: Optional[Callable[[float, str], None]] = None,
    callback_etapa: Optional[Callable[[int], None]] = None,
    verificar_cancelamento: Optional[Callable[[], bool]] = None,
) -> str:
    """
    Pipeline principal de audiodescrição.

    Etapas:
        0. VAD — detecta slots de silêncio
        1. Visão — descreve frames nos slots
        2. AD — gera texto de audiodescrição
        3. TTS — sintetiza a narração
        4. Mixer — monta o vídeo final

    Args:
        caminho_video: Vídeo de entrada
        caminho_saida: Onde salvar o resultado
        config: Instância de Config (usa padrão se None)
        callback_progresso: Função(float, str) para progresso
        callback_etapa: Função(int) para mudar etapa visual
        verificar_cancelamento: Função que retorna True se cancelado

    Returns:
        Caminho do vídeo com AD gerado
    """
    # Importações tardias para não travar a UI
    from core.vad import VADProcessor
    from core.vision import VisionDescriber
    from core.ad_generator import ADGenerator
    from core.tts import TTSNarrator
    from core.mixer import AudioMixer, FaixaAD
    from utils.video import extrair_frame
    from utils.config import Config

    if config is None:
        config = Config()

    def progresso(p: float, msg: str) -> None:
        logger.info(f"[{p*100:.0f}%] {msg}")
        if callback_progresso:
            callback_progresso(p, msg)

    def etapa(i: int) -> None:
        if callback_etapa:
            callback_etapa(i)

    def cancelado() -> bool:
        return verificar_cancelamento() if verificar_cancelamento else False

    # Diretório temporário para os arquivos intermediários
    with tempfile.TemporaryDirectory(prefix="voxdescriber_") as tmpdir:

        # ============================================================
        # ETAPA 0 — VAD: detectar slots de silêncio
        # ============================================================
        etapa(0)
        progresso(0.0, "Analisando fala e silêncios no vídeo...")

        vad = VADProcessor(
            modelo=config.whisper_modelo,
            idioma=config.get("whisper_idioma", "pt"),
            dispositivo="auto" if config.usar_gpu else "cpu",
        )

        def progresso_vad(p: float, msg: str) -> None:
            progresso(p * 0.20, msg)  # Etapa VAD = 0-20% do total

        slots = vad.processar(caminho_video, callback_progresso=progresso_vad)

        if not slots:
            raise RuntimeError(
                "Nenhum slot de silêncio encontrado. "
                "O vídeo pode ter áudio contínuo sem pausas suficientes."
            )

        logger.info(f"✅ VAD: {len(slots)} slots encontrados")
        if cancelado():
            raise InterruptedError("Processamento cancelado pelo usuário")

        # ============================================================
        # ETAPA 1 — Visão: descrever frames nos slots
        # ============================================================
        etapa(1)
        progresso(0.20, f"Descrevendo {len(slots)} cenas visualmente...")

        vision = VisionDescriber(
            modelo=config.get("vision_modelo"),
            ollama_url=config.ollama_url,
        )
        vision.limpar_historico()

        descricoes: list[str] = []
        for i, slot in enumerate(slots):
            if cancelado():
                raise InterruptedError("Processamento cancelado pelo usuário")

            p = 0.20 + (i / len(slots)) * 0.20  # 20-40%
            progresso(p, f"Analisando cena {i+1}/{len(slots)}...")

            try:
                caminho_frame = extrair_frame(
                    caminho_video, slot.frame_time,
                    largura_max=1280
                )
                descricao = vision.descrever_frame(caminho_frame, slot.frame_time)
                descricoes.append(descricao)
                os.remove(caminho_frame)
            except Exception as e:
                logger.warning(f"Slot {i+1}: erro na visão — {e}. Usando placeholder.")
                descricoes.append("Cena sem descrição disponível.")

        logger.info(f"✅ Visão: {len(descricoes)} frames descritos")

        # ============================================================
        # ETAPA 2 — AD Generator: gerar texto de audiodescrição
        # ============================================================
        etapa(2)
        progresso(0.40, "Gerando textos de audiodescrição...")

        ad_gen = ADGenerator(
            modelo=config.get("ad_modelo"),
            ollama_url=config.ollama_url,
            palavras_por_segundo=config.palavras_por_segundo,
        )

        textos_ad: list[str] = []
        contexto_anterior: Optional[str] = None

        for i, (slot, descricao) in enumerate(zip(slots, descricoes)):
            if cancelado():
                raise InterruptedError("Processamento cancelado pelo usuário")

            p = 0.40 + (i / len(slots)) * 0.20  # 40-60%
            progresso(p, f"Gerando AD {i+1}/{len(slots)}...")

            try:
                texto = ad_gen.gerar(descricao, slot.duration, contexto_anterior)
                textos_ad.append(texto)
                if texto:
                    contexto_anterior = texto
            except Exception as e:
                logger.warning(f"AD {i+1}: erro na geração — {e}. Usando descrição direta.")
                max_palavras = ad_gen.calcular_max_palavras(slot.duration)
                textos_ad.append(ad_gen._truncar_por_palavras(descricao, max_palavras))

        logger.info(f"✅ AD: {len(textos_ad)} textos gerados")

        # ============================================================
        # ETAPA 3 — TTS: sintetizar narrações
        # ============================================================
        etapa(3)
        progresso(0.60, "Sintetizando narrações em voz...")

        tts = TTSNarrator(
            voz=config.piper_voz,
            piper_exec=config.piper_exec,
        )

        faixas_ad: list[FaixaAD] = []
        arquivos_tts: list[str] = []  # para limpeza posterior

        for i, (slot, texto) in enumerate(zip(slots, textos_ad)):
            if cancelado():
                raise InterruptedError("Processamento cancelado pelo usuário")

            if not texto.strip():
                logger.debug(f"Slot {i+1}: texto vazio, pulando TTS")
                continue

            p = 0.60 + (i / len(slots)) * 0.20  # 60-80%
            progresso(p, f"Sintetizando narração {i+1}/{len(slots)}...")

            try:
                caminho_audio = tts.sintetizar(texto, duracao_maxima=slot.duration)
                duracao_real = tts.obter_duracao(caminho_audio)

                if duracao_real > 0:
                    faixas_ad.append(FaixaAD(
                        caminho_audio=caminho_audio,
                        timestamp_inicio=slot.start,
                        duracao=duracao_real,
                    ))
                    arquivos_tts.append(caminho_audio)
                else:
                    logger.warning(f"Slot {i+1}: áudio TTS vazio gerado")
                    os.remove(caminho_audio)

            except Exception as e:
                logger.warning(f"Slot {i+1}: erro no TTS — {e}")

        logger.info(f"✅ TTS: {len(faixas_ad)} narrações sintetizadas")

        if not faixas_ad:
            raise RuntimeError("Nenhuma narração foi gerada. Verifique a instalação do Piper TTS.")

        # ============================================================
        # ETAPA 4 — Mixer: montar vídeo final
        # ============================================================
        etapa(4)
        progresso(0.80, "Mixando audiodescrição no vídeo...")

        mixer = AudioMixer(volume_ducking=config.volume_ducking)

        try:
            def progresso_mixer(p: float, msg: str) -> None:
                progresso(0.80 + p * 0.20, msg)  # 80-100%

            mixer.mixar(
                caminho_video=caminho_video,
                faixas_ad=faixas_ad,
                caminho_saida=caminho_saida,
                callback_progresso=progresso_mixer,
            )
        finally:
            # Limpa arquivos TTS temporários
            for caminho in arquivos_tts:
                try:
                    if os.path.exists(caminho):
                        os.remove(caminho)
                except Exception:
                    pass

        progresso(1.0, "✅ Audiodescrição concluída!")
        logger.info(f"✅ Pipeline concluído: {caminho_saida}")
        return caminho_saida


def main_cli() -> None:
    """Modo de linha de comando (sem interface gráfica)."""
    parser = argparse.ArgumentParser(
        description="VoxDescriber — Audiodescrição automática de vídeos"
    )
    parser.add_argument("--video", required=True, help="Vídeo de entrada")
    parser.add_argument("--saida", help="Arquivo de saída (padrão: input_AD.mp4)")
    parser.add_argument("--sem-ui", action="store_true", help="Não abre a interface gráfica")
    parser.add_argument("--debug", action="store_true", help="Ativa log de debug")
    args = parser.parse_args()

    configurar_logger("DEBUG" if args.debug else "INFO")

    if not os.path.exists(args.video):
        logger.error(f"Arquivo não encontrado: {args.video}")
        sys.exit(1)

    caminho_entrada = Path(args.video)
    caminho_saida = args.saida or str(
        caminho_entrada.parent / f"{caminho_entrada.stem}_AD{caminho_entrada.suffix}"
    )

    logger.info(f"Processando: {args.video}")
    logger.info(f"Saída: {caminho_saida}")

    try:
        executar_pipeline(
            caminho_video=args.video,
            caminho_saida=caminho_saida,
        )
        logger.info(f"✅ Pronto! Arquivo salvo em: {caminho_saida}")
    except Exception as e:
        logger.error(f"Erro: {e}")
        sys.exit(1)


def main_ui() -> None:
    """Modo de interface gráfica."""
    configurar_logger()

    app = QApplication.instance() or QApplication(sys.argv)
    app.setApplicationName("VoxDescriber")
    app.setApplicationDisplayName("VoxDescriber")
    app.setApplicationVersion("0.1.0")

    from ui.main_window import MainWindow
    janela = MainWindow()
    janela.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    # Adiciona o diretório do projeto ao path
    projeto_dir = Path(__file__).parent
    sys.path.insert(0, str(projeto_dir))

    # Decide entre CLI e UI
    if "--sem-ui" in sys.argv or "--video" in sys.argv:
        main_cli()
    else:
        from PySide6.QtWidgets import QApplication
        main_ui()
