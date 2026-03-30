"""
Player - Player de Vídeo Integrado
Widget PySide6 com QMediaPlayer para preview do vídeo original e do resultado.
"""

import os

from PySide6.QtCore import Qt, QUrl, Signal
from PySide6.QtMultimedia import QAudioOutput, QMediaPlayer
from PySide6.QtMultimediaWidgets import QVideoWidget
from PySide6.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QPushButton,
    QSizePolicy,
    QSlider,
    QVBoxLayout,
    QWidget,
)


class VideoPlayer(QWidget):
    """
    Player de vídeo simples com controles básicos.
    Suporta play/pause, seek e exibição do tempo atual.
    """

    # Sinal emitido quando o vídeo termina
    video_terminado = Signal()

    def __init__(self, parent=None):
        super().__init__(parent)
        self._duracao_ms: int = 0
        self._configurar_ui()
        self._configurar_player()

    def _configurar_ui(self) -> None:
        """Monta a interface do player."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)

        # Área de vídeo
        self._video_widget = QVideoWidget()
        self._video_widget.setMinimumHeight(240)
        self._video_widget.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self._video_widget.setStyleSheet("background: #000;")
        layout.addWidget(self._video_widget)

        # Slider de progresso
        self._slider = QSlider(Qt.Horizontal)
        self._slider.setRange(0, 1000)
        self._slider.setValue(0)
        self._slider.sliderMoved.connect(self._seek)
        self._slider.setStyleSheet("""
            QSlider::groove:horizontal {
                height: 4px; background: #333; border-radius: 2px;
            }
            QSlider::handle:horizontal {
                background: #4CAF50; width: 12px; height: 12px;
                margin: -4px 0; border-radius: 6px;
            }
            QSlider::sub-page:horizontal {
                background: #4CAF50; border-radius: 2px;
            }
        """)
        layout.addWidget(self._slider)

        # Controles
        layout_controles = QHBoxLayout()
        layout_controles.setContentsMargins(0, 0, 0, 0)

        self._btn_play = QPushButton("▶")
        self._btn_play.setFixedSize(36, 36)
        self._btn_play.setStyleSheet("""
            QPushButton {
                background: #333; border: none; border-radius: 18px;
                color: white; font-size: 14px;
            }
            QPushButton:hover { background: #555; }
        """)
        self._btn_play.clicked.connect(self._toggle_play)
        layout_controles.addWidget(self._btn_play)

        self._label_tempo = QLabel("00:00 / 00:00")
        self._label_tempo.setStyleSheet("color: #aaa; font-size: 11px;")
        layout_controles.addWidget(self._label_tempo)

        layout_controles.addStretch()

        # Botão mudo
        self._btn_mudo = QPushButton("🔊")
        self._btn_mudo.setFixedSize(36, 36)
        self._btn_mudo.setStyleSheet(self._btn_play.styleSheet())
        self._btn_mudo.clicked.connect(self._toggle_mudo)
        layout_controles.addWidget(self._btn_mudo)

        layout.addLayout(layout_controles)

    def _configurar_player(self) -> None:
        """Inicializa o QMediaPlayer."""
        self._player = QMediaPlayer()
        self._audio_output = QAudioOutput()
        self._audio_output.setVolume(1.0)
        self._player.setAudioOutput(self._audio_output)
        self._player.setVideoOutput(self._video_widget)

        # Conecta sinais
        self._player.positionChanged.connect(self._atualizar_posicao)
        self._player.durationChanged.connect(self._duracao_mudou)
        self._player.playbackStateChanged.connect(self._estado_mudou)
        self._player.mediaStatusChanged.connect(self._status_mudou)

    def carregar(self, caminho: str) -> None:
        """
        Carrega um arquivo de vídeo.

        Args:
            caminho: Caminho para o arquivo de vídeo
        """
        if not os.path.exists(caminho):
            raise FileNotFoundError(f"Arquivo não encontrado: {caminho}")

        self._player.stop()
        self._player.setSource(QUrl.fromLocalFile(caminho))
        self._btn_play.setText("▶")
        self._slider.setValue(0)
        self._label_tempo.setText("00:00 / 00:00")

    def play(self) -> None:
        """Inicia a reprodução."""
        self._player.play()

    def pause(self) -> None:
        """Pausa a reprodução."""
        self._player.pause()

    def parar(self) -> None:
        """Para a reprodução e volta ao início."""
        self._player.stop()

    def _toggle_play(self) -> None:
        """Alterna entre play e pause."""
        if self._player.playbackState() == QMediaPlayer.PlayingState:
            self._player.pause()
        else:
            self._player.play()

    def _toggle_mudo(self) -> None:
        """Alterna mudo."""
        mudo = self._audio_output.volume() > 0
        self._audio_output.setVolume(0.0 if mudo else 1.0)
        self._btn_mudo.setText("🔇" if mudo else "🔊")

    def _seek(self, valor: int) -> None:
        """Move para a posição no slider (0-1000)."""
        if self._duracao_ms > 0:
            posicao = int((valor / 1000) * self._duracao_ms)
            self._player.setPosition(posicao)

    def _atualizar_posicao(self, posicao_ms: int) -> None:
        """Atualiza o slider e o label de tempo."""
        if self._duracao_ms > 0:
            valor = int((posicao_ms / self._duracao_ms) * 1000)
            self._slider.blockSignals(True)
            self._slider.setValue(valor)
            self._slider.blockSignals(False)

        atual = self._formatar_tempo(posicao_ms // 1000)
        total = self._formatar_tempo(self._duracao_ms // 1000)
        self._label_tempo.setText(f"{atual} / {total}")

    def _duracao_mudou(self, duracao_ms: int) -> None:
        """Atualiza a duração total."""
        self._duracao_ms = duracao_ms

    def _estado_mudou(self, estado) -> None:
        """Atualiza o botão play/pause."""
        if estado == QMediaPlayer.PlayingState:
            self._btn_play.setText("⏸")
        else:
            self._btn_play.setText("▶")

    def _status_mudou(self, status) -> None:
        """Emite sinal quando o vídeo termina."""
        if status == QMediaPlayer.EndOfMedia:
            self.video_terminado.emit()

    @staticmethod
    def _formatar_tempo(segundos: int) -> str:
        """Formata segundos como MM:SS."""
        return f"{segundos // 60:02d}:{segundos % 60:02d}"
