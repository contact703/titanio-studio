"""
MainWindow - Janela Principal do VoxDescriber
Interface PySide6 com drag-and-drop, player de vídeo e controles de exportação.
"""

import os
from pathlib import Path

from PySide6.QtCore import QThread, Signal, Qt, QMimeData
from PySide6.QtGui import QDragEnterEvent, QDropEvent
from PySide6.QtWidgets import (
    QApplication,
    QFileDialog,
    QFrame,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QSizePolicy,
    QSplitter,
    QStatusBar,
    QVBoxLayout,
    QWidget,
)

from .player import VideoPlayer
from .progress import ProgressoWidget


class WorkerPipeline(QThread):
    """
    Thread de background que executa o pipeline de audiodescrição.
    Emite sinais de progresso para atualizar a UI sem travar.
    """

    # Sinais
    progresso = Signal(float, str)      # (0.0-1.0, mensagem)
    etapa = Signal(int)                 # índice da etapa atual (0-4)
    concluido = Signal(str)             # caminho do vídeo gerado
    erro = Signal(str)                  # mensagem de erro
    etapa_erro = Signal(int)            # índice da etapa com erro

    def __init__(self, caminho_video: str, caminho_saida: str, config):
        super().__init__()
        self.caminho_video = caminho_video
        self.caminho_saida = caminho_saida
        self.config = config
        self._cancelar = False

    def run(self) -> None:
        """Executa o pipeline completo em background."""
        # Importa aqui para não bloquear o carregamento da UI
        from main import executar_pipeline
        try:
            executar_pipeline(
                caminho_video=self.caminho_video,
                caminho_saida=self.caminho_saida,
                config=self.config,
                callback_progresso=self.progresso.emit,
                callback_etapa=self.etapa.emit,
                verificar_cancelamento=lambda: self._cancelar,
            )
            if not self._cancelar:
                self.concluido.emit(self.caminho_saida)
        except Exception as e:
            self.erro.emit(str(e))

    def cancelar(self) -> None:
        """Solicita cancelamento do pipeline."""
        self._cancelar = True


class DropArea(QFrame):
    """Área de drop para arrastar arquivos de vídeo."""

    arquivo_solto = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setAcceptDrops(True)
        self.setMinimumHeight(120)
        self._configurar_ui()
        self._atualizar_estilo(ativo=False)

    def _configurar_ui(self) -> None:
        """Configura a aparência da área de drop."""
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignCenter)

        self._icone = QLabel("🎬")
        self._icone.setAlignment(Qt.AlignCenter)
        self._icone.setStyleSheet("font-size: 48px;")
        layout.addWidget(self._icone)

        self._texto = QLabel("Arraste um vídeo aqui\nou clique para selecionar")
        self._texto.setAlignment(Qt.AlignCenter)
        self._texto.setStyleSheet("color: #888; font-size: 13px;")
        layout.addWidget(self._texto)

        formatos = QLabel("MP4 · MOV · AVI · MKV · WebM")
        formatos.setAlignment(Qt.AlignCenter)
        formatos.setStyleSheet("color: #555; font-size: 10px;")
        layout.addWidget(formatos)

    def _atualizar_estilo(self, ativo: bool) -> None:
        borda = "#4CAF50" if ativo else "#444"
        self.setStyleSheet(f"""
            QFrame {{
                border: 2px dashed {borda};
                border-radius: 12px;
                background: #1a1a1a;
            }}
        """)

    def mousePressEvent(self, event) -> None:
        """Abre diálogo de seleção de arquivo ao clicar."""
        self._abrir_dialogo()

    def _abrir_dialogo(self) -> None:
        """Abre o diálogo de seleção de arquivo."""
        caminho, _ = QFileDialog.getOpenFileName(
            self, "Selecionar Vídeo",
            str(Path.home() / "Movies"),
            "Vídeos (*.mp4 *.mov *.avi *.mkv *.webm *.m4v);;Todos os arquivos (*)"
        )
        if caminho:
            self.arquivo_solto.emit(caminho)

    def dragEnterEvent(self, event: QDragEnterEvent) -> None:
        if event.mimeData().hasUrls():
            event.acceptProposedAction()
            self._atualizar_estilo(ativo=True)

    def dragLeaveEvent(self, event) -> None:
        self._atualizar_estilo(ativo=False)

    def dropEvent(self, event: QDropEvent) -> None:
        self._atualizar_estilo(ativo=False)
        urls = event.mimeData().urls()
        if urls:
            caminho = urls[0].toLocalFile()
            if os.path.isfile(caminho):
                self.arquivo_solto.emit(caminho)

    def definir_arquivo(self, nome: str) -> None:
        """Atualiza o texto para mostrar o arquivo selecionado."""
        self._icone.setText("✅")
        self._texto.setText(f"{nome}")
        self._atualizar_estilo(ativo=False)


class MainWindow(QMainWindow):
    """Janela principal do VoxDescriber."""

    EXTENSOES_VIDEO = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".m4v"}

    def __init__(self):
        super().__init__()
        self._caminho_video: str | None = None
        self._worker: WorkerPipeline | None = None
        self._processando = False

        from utils.config import Config
        self._config = Config()

        self._configurar_janela()
        self._configurar_ui()
        self._configurar_status_bar()

    def _configurar_janela(self) -> None:
        """Configura a janela principal."""
        self.setWindowTitle("VoxDescriber — Audiodescrição Automática")
        self.setMinimumSize(900, 650)
        self.resize(1100, 700)

        # Tema escuro
        self.setStyleSheet("""
            QMainWindow, QWidget {
                background-color: #121212;
                color: #e0e0e0;
                font-family: -apple-system, "Segoe UI", sans-serif;
            }
            QPushButton {
                background: #333;
                border: none;
                border-radius: 6px;
                padding: 8px 16px;
                color: white;
                font-size: 13px;
            }
            QPushButton:hover { background: #444; }
            QPushButton:disabled { background: #222; color: #555; }
            QPushButton#btn_gerar {
                background: #1565C0;
                font-size: 14px;
                font-weight: bold;
                padding: 10px 24px;
            }
            QPushButton#btn_gerar:hover { background: #1976D2; }
            QPushButton#btn_gerar:disabled { background: #1a2a3a; color: #445; }
            QPushButton#btn_cancelar {
                background: #b71c1c;
            }
            QPushButton#btn_cancelar:hover { background: #c62828; }
        """)

    def _configurar_ui(self) -> None:
        """Monta o layout principal da janela."""
        widget_central = QWidget()
        self.setCentralWidget(widget_central)

        layout_principal = QVBoxLayout(widget_central)
        layout_principal.setContentsMargins(16, 16, 16, 16)
        layout_principal.setSpacing(12)

        # Cabeçalho
        layout_header = QHBoxLayout()
        label_titulo = QLabel("🎬 VoxDescriber")
        label_titulo.setStyleSheet("font-size: 20px; font-weight: bold; color: #fff;")
        label_subtitulo = QLabel("Audiodescrição automática para vídeos")
        label_subtitulo.setStyleSheet("color: #888; font-size: 12px;")
        layout_header.addWidget(label_titulo)
        layout_header.addWidget(label_subtitulo)
        layout_header.addStretch()
        layout_principal.addLayout(layout_header)

        # Linha divisória
        linha = QFrame()
        linha.setFrameShape(QFrame.HLine)
        linha.setStyleSheet("color: #333;")
        layout_principal.addWidget(linha)

        # Splitter: lado esquerdo (entrada) | lado direito (resultado)
        splitter = QSplitter(Qt.Horizontal)
        splitter.setChildrenCollapsible(False)
        layout_principal.addWidget(splitter, stretch=1)

        # === Painel Esquerdo ===
        painel_esquerdo = QWidget()
        layout_esquerdo = QVBoxLayout(painel_esquerdo)
        layout_esquerdo.setContentsMargins(0, 0, 8, 0)
        layout_esquerdo.setSpacing(8)

        label_entrada = QLabel("📂 Vídeo de entrada")
        label_entrada.setStyleSheet("font-size: 12px; color: #888; font-weight: bold;")
        layout_esquerdo.addWidget(label_entrada)

        # Área de drop
        self._drop_area = DropArea()
        self._drop_area.arquivo_solto.connect(self._video_selecionado)
        layout_esquerdo.addWidget(self._drop_area)

        # Player do vídeo original
        self._player_original = VideoPlayer()
        self._player_original.setVisible(False)
        layout_esquerdo.addWidget(self._player_original, stretch=1)

        splitter.addWidget(painel_esquerdo)

        # === Painel Direito ===
        painel_direito = QWidget()
        layout_direito = QVBoxLayout(painel_direito)
        layout_direito.setContentsMargins(8, 0, 0, 0)
        layout_direito.setSpacing(8)

        label_resultado = QLabel("🎬 Vídeo com audiodescrição")
        label_resultado.setStyleSheet("font-size: 12px; color: #888; font-weight: bold;")
        layout_direito.addWidget(label_resultado)

        # Placeholder enquanto não há resultado
        self._placeholder_resultado = QFrame()
        self._placeholder_resultado.setStyleSheet("""
            QFrame {
                border: 1px solid #333;
                border-radius: 8px;
                background: #0d0d0d;
            }
        """)
        layout_placeholder = QVBoxLayout(self._placeholder_resultado)
        layout_placeholder.setAlignment(Qt.AlignCenter)
        label_ph = QLabel("O vídeo com audiodescrição\naparecerá aqui após o processamento")
        label_ph.setAlignment(Qt.AlignCenter)
        label_ph.setStyleSheet("color: #444; font-size: 12px;")
        layout_placeholder.addWidget(label_ph)
        layout_direito.addWidget(self._placeholder_resultado, stretch=1)

        # Player do resultado
        self._player_resultado = VideoPlayer()
        self._player_resultado.setVisible(False)
        layout_direito.addWidget(self._player_resultado, stretch=1)

        splitter.addWidget(painel_direito)
        splitter.setSizes([450, 450])

        # === Área inferior: progresso e botões ===
        layout_inferior = QVBoxLayout()
        layout_inferior.setSpacing(8)

        # Widget de progresso
        self._widget_progresso = ProgressoWidget()
        self._widget_progresso.setVisible(False)
        layout_inferior.addWidget(self._widget_progresso)

        # Botões de ação
        layout_botoes = QHBoxLayout()

        self._btn_gerar = QPushButton("🎙️  Gerar Audiodescrição")
        self._btn_gerar.setObjectName("btn_gerar")
        self._btn_gerar.setEnabled(False)
        self._btn_gerar.clicked.connect(self._iniciar_pipeline)
        layout_botoes.addWidget(self._btn_gerar)

        self._btn_cancelar = QPushButton("✖  Cancelar")
        self._btn_cancelar.setObjectName("btn_cancelar")
        self._btn_cancelar.setVisible(False)
        self._btn_cancelar.clicked.connect(self._cancelar_pipeline)
        layout_botoes.addWidget(self._btn_cancelar)

        layout_botoes.addStretch()

        self._btn_exportar = QPushButton("💾  Salvar como...")
        self._btn_exportar.setEnabled(False)
        self._btn_exportar.clicked.connect(self._exportar_video)
        layout_botoes.addWidget(self._btn_exportar)

        layout_inferior.addLayout(layout_botoes)
        layout_principal.addLayout(layout_inferior)

    def _configurar_status_bar(self) -> None:
        """Configura a barra de status."""
        self._status_bar = QStatusBar()
        self._status_bar.setStyleSheet("color: #888; font-size: 11px;")
        self.setStatusBar(self._status_bar)
        self._status_bar.showMessage("Pronto")

    # =========================================================
    # Slots (handlers de eventos)
    # =========================================================

    def _video_selecionado(self, caminho: str) -> None:
        """Chamado quando um vídeo é selecionado via drop ou browse."""
        extensao = Path(caminho).suffix.lower()
        if extensao not in self.EXTENSOES_VIDEO:
            QMessageBox.warning(
                self, "Formato inválido",
                f"O arquivo '{Path(caminho).name}' não é um vídeo suportado.\n"
                f"Formatos aceitos: {', '.join(self.EXTENSOES_VIDEO)}"
            )
            return

        self._caminho_video = caminho
        nome = Path(caminho).name

        self._drop_area.definir_arquivo(nome)

        # Carrega o player
        try:
            self._player_original.carregar(caminho)
            self._player_original.setVisible(True)
            self._drop_area.setVisible(False)
        except Exception as e:
            pass  # Player opcional, continua sem ele

        self._btn_gerar.setEnabled(True)
        self._status_bar.showMessage(f"Vídeo carregado: {nome}")

    def _iniciar_pipeline(self) -> None:
        """Inicia o pipeline de audiodescrição em background."""
        if not self._caminho_video:
            return

        # Define o caminho de saída
        caminho_entrada = Path(self._caminho_video)
        caminho_saida = str(
            caminho_entrada.parent / f"{caminho_entrada.stem}_AD{caminho_entrada.suffix}"
        )

        # Configura a UI para estado "processando"
        self._processando = True
        self._btn_gerar.setVisible(False)
        self._btn_cancelar.setVisible(True)
        self._widget_progresso.setVisible(True)
        self._widget_progresso.resetar()
        self._btn_exportar.setEnabled(False)
        self._status_bar.showMessage("Processando audiodescrição...")

        # Inicia o worker
        self._worker = WorkerPipeline(self._caminho_video, caminho_saida, self._config)
        self._worker.progresso.connect(self._atualizar_progresso)
        self._worker.etapa.connect(self._widget_progresso.definir_etapa)
        self._worker.concluido.connect(self._pipeline_concluido)
        self._worker.erro.connect(self._pipeline_erro)
        self._worker.start()

    def _cancelar_pipeline(self) -> None:
        """Cancela o processamento em andamento."""
        if self._worker and self._worker.isRunning():
            self._worker.cancelar()
            self._worker.wait(3000)

        self._restaurar_ui()
        self._status_bar.showMessage("Processamento cancelado")

    def _atualizar_progresso(self, progresso: float, mensagem: str) -> None:
        """Atualiza a barra de progresso."""
        self._widget_progresso.atualizar(progresso, mensagem)

    def _pipeline_concluido(self, caminho_saida: str) -> None:
        """Chamado quando o pipeline termina com sucesso."""
        self._restaurar_ui()
        self._caminho_saida = caminho_saida

        # Exibe o resultado no player
        if os.path.exists(caminho_saida):
            try:
                self._player_resultado.carregar(caminho_saida)
                self._placeholder_resultado.setVisible(False)
                self._player_resultado.setVisible(True)
            except Exception:
                pass

        self._btn_exportar.setEnabled(True)
        self._widget_progresso.atualizar(1.0, "✅ Audiodescrição gerada com sucesso!")
        self._status_bar.showMessage(f"Concluído! Arquivo salvo em: {caminho_saida}")

        QMessageBox.information(
            self, "Audiodescrição pronta! 🎉",
            f"O vídeo com audiodescrição foi gerado:\n{caminho_saida}"
        )

    def _pipeline_erro(self, mensagem: str) -> None:
        """Chamado quando o pipeline encontra um erro."""
        self._restaurar_ui()
        self._widget_progresso.atualizar(0.0, f"❌ Erro: {mensagem}")
        self._status_bar.showMessage("Erro no processamento")

        QMessageBox.critical(
            self, "Erro no processamento",
            f"Ocorreu um erro durante a audiodescrição:\n\n{mensagem}"
        )

    def _restaurar_ui(self) -> None:
        """Restaura a UI para o estado normal após processamento."""
        self._processando = False
        self._btn_gerar.setVisible(True)
        self._btn_cancelar.setVisible(False)
        self._btn_gerar.setEnabled(True)

    def _exportar_video(self) -> None:
        """Abre diálogo para salvar o vídeo exportado em outro local."""
        if not hasattr(self, "_caminho_saida"):
            return

        caminho, _ = QFileDialog.getSaveFileName(
            self, "Salvar vídeo com audiodescrição",
            str(Path.home() / "Movies" / Path(self._caminho_saida).name),
            "Vídeo MP4 (*.mp4);;Todos os arquivos (*)"
        )

        if caminho:
            import shutil
            try:
                shutil.copy2(self._caminho_saida, caminho)
                self._status_bar.showMessage(f"Salvo em: {caminho}")
            except Exception as e:
                QMessageBox.critical(self, "Erro ao salvar", str(e))

    def closeEvent(self, event) -> None:
        """Garante que o worker seja encerrado ao fechar a janela."""
        if self._worker and self._worker.isRunning():
            self._worker.cancelar()
            self._worker.wait(3000)
        event.accept()
