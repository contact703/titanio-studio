"""
Progress - Barra de Progresso com Etapas
Widget PySide6 que mostra o progresso do pipeline de audiodescrição.
"""

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QProgressBar,
    QSizePolicy,
    QVBoxLayout,
    QWidget,
)


# Etapas do pipeline
ETAPAS = [
    ("🎙️", "Transcrição VAD"),
    ("🖼️", "Análise Visual"),
    ("✍️", "Geração de AD"),
    ("🔊", "Síntese de Voz"),
    ("🎬", "Mixagem Final"),
]


class EtapaWidget(QWidget):
    """Indicador visual de uma etapa do pipeline."""

    ESTADO_PENDENTE = "pendente"
    ESTADO_ATIVO = "ativo"
    ESTADO_CONCLUIDO = "concluido"
    ESTADO_ERRO = "erro"

    def __init__(self, icone: str, nome: str, parent=None):
        super().__init__(parent)
        self._estado = self.ESTADO_PENDENTE

        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 4, 8, 4)
        layout.setAlignment(Qt.AlignCenter)

        self._label_icone = QLabel(icone)
        self._label_icone.setAlignment(Qt.AlignCenter)
        self._label_icone.setStyleSheet("font-size: 24px;")

        self._label_nome = QLabel(nome)
        self._label_nome.setAlignment(Qt.AlignCenter)
        self._label_nome.setStyleSheet("font-size: 11px; color: #888;")

        layout.addWidget(self._label_icone)
        layout.addWidget(self._label_nome)

        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        self._atualizar_visual()

    def definir_estado(self, estado: str) -> None:
        """Define o estado visual da etapa."""
        self._estado = estado
        self._atualizar_visual()

    def _atualizar_visual(self) -> None:
        """Atualiza cores e opacidade baseado no estado."""
        estilos = {
            self.ESTADO_PENDENTE: ("color: #888;", "font-size: 11px; color: #888;"),
            self.ESTADO_ATIVO:    ("color: #4CAF50; font-size: 28px;", "font-size: 11px; color: #4CAF50; font-weight: bold;"),
            self.ESTADO_CONCLUIDO:("color: #2196F3;", "font-size: 11px; color: #2196F3;"),
            self.ESTADO_ERRO:     ("color: #f44336;", "font-size: 11px; color: #f44336;"),
        }
        estilo_icone, estilo_nome = estilos.get(self._estado, estilos[self.ESTADO_PENDENTE])
        self._label_icone.setStyleSheet(f"font-size: 24px; {estilo_icone}")
        self._label_nome.setStyleSheet(estilo_nome)


class ProgressoWidget(QWidget):
    """
    Widget completo de progresso com etapas visuais e barra de progresso.
    """

    def __init__(self, parent=None):
        super().__init__(parent)
        self._etapa_atual = -1
        self._widgets_etapas: list[EtapaWidget] = []
        self._configurar_ui()

    def _configurar_ui(self) -> None:
        """Configura os elementos visuais."""
        layout_principal = QVBoxLayout(self)
        layout_principal.setContentsMargins(0, 0, 0, 0)
        layout_principal.setSpacing(8)

        # Indicadores de etapa
        frame_etapas = QFrame()
        frame_etapas.setFrameStyle(QFrame.StyledPanel)
        frame_etapas.setStyleSheet("QFrame { background: #1e1e1e; border-radius: 8px; }")
        layout_etapas = QHBoxLayout(frame_etapas)
        layout_etapas.setContentsMargins(8, 8, 8, 8)

        for icone, nome in ETAPAS:
            widget = EtapaWidget(icone, nome)
            self._widgets_etapas.append(widget)
            layout_etapas.addWidget(widget)

            # Separador entre etapas (exceto a última)
            if (icone, nome) != ETAPAS[-1]:
                sep = QLabel("→")
                sep.setAlignment(Qt.AlignCenter)
                sep.setStyleSheet("color: #555; font-size: 16px;")
                layout_etapas.addWidget(sep)

        layout_principal.addWidget(frame_etapas)

        # Barra de progresso
        self._barra = QProgressBar()
        self._barra.setRange(0, 100)
        self._barra.setValue(0)
        self._barra.setTextVisible(True)
        self._barra.setStyleSheet("""
            QProgressBar {
                border: 1px solid #333;
                border-radius: 6px;
                background: #1e1e1e;
                height: 20px;
                text-align: center;
                color: white;
            }
            QProgressBar::chunk {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #1565C0, stop:1 #42A5F5);
                border-radius: 5px;
            }
        """)
        layout_principal.addWidget(self._barra)

        # Label de status
        self._label_status = QLabel("Aguardando...")
        self._label_status.setAlignment(Qt.AlignCenter)
        self._label_status.setStyleSheet("color: #aaa; font-size: 12px;")
        layout_principal.addWidget(self._label_status)

    def atualizar(self, progresso: float, mensagem: str) -> None:
        """
        Atualiza a barra de progresso e a mensagem de status.

        Args:
            progresso: Valor de 0.0 a 1.0
            mensagem: Texto a exibir
        """
        self._barra.setValue(int(progresso * 100))
        self._label_status.setText(mensagem)

    def definir_etapa(self, indice: int) -> None:
        """
        Marca uma etapa como ativa.
        Etapas anteriores ficam como concluídas.

        Args:
            indice: Índice da etapa (0 a 4)
        """
        self._etapa_atual = indice

        for i, widget in enumerate(self._widgets_etapas):
            if i < indice:
                widget.definir_estado(EtapaWidget.ESTADO_CONCLUIDO)
            elif i == indice:
                widget.definir_estado(EtapaWidget.ESTADO_ATIVO)
            else:
                widget.definir_estado(EtapaWidget.ESTADO_PENDENTE)

    def marcar_erro(self, indice: int) -> None:
        """Marca uma etapa como erro."""
        if 0 <= indice < len(self._widgets_etapas):
            self._widgets_etapas[indice].definir_estado(EtapaWidget.ESTADO_ERRO)

    def resetar(self) -> None:
        """Reseta o widget para o estado inicial."""
        self._etapa_atual = -1
        self._barra.setValue(0)
        self._label_status.setText("Aguardando...")
        for widget in self._widgets_etapas:
            widget.definir_estado(EtapaWidget.ESTADO_PENDENTE)
