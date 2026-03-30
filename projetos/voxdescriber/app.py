#!/usr/bin/env python3
"""
VoxDescriber — Audiodescrição automática para vídeos
Interface gráfica com PySide6 | Dark Theme roxo/ciano
"""

import sys
import os
import subprocess
import tempfile
import shutil
import json
import math
import time
from pathlib import Path

from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QSlider, QProgressBar, QFileDialog,
    QFrame, QSizePolicy, QGraphicsDropShadowEffect, QStatusBar,
    QScrollArea, QSpacerItem
)
from PySide6.QtCore import (
    Qt, QThread, Signal, QTimer, QPropertyAnimation, QEasingCurve,
    QPoint, QRect, QSize, QMimeData, QUrl
)
from PySide6.QtGui import (
    QFont, QPainter, QPainterPath, QLinearGradient, QColor, QBrush,
    QPen, QPixmap, QDragEnterEvent, QDropEvent, QFontDatabase,
    QRadialGradient, QPalette
)


# ─── Paleta de Cores ───────────────────────────────────────────────────────────
BG_DARK     = "#0d0d1a"
BG_CARD     = "#12122a"
BG_HOVER    = "#1a1a35"
ACCENT_PURP = "#7C5CFC"
ACCENT_CYAN = "#00D4FF"
ACCENT_PINK = "#FC5CF5"
TEXT_MAIN   = "#E8E8FF"
TEXT_DIM    = "#6868AA"
BORDER      = "#2a2a4a"
SUCCESS     = "#00E5A0"
ERROR       = "#FF4D6A"


# ─── Pipeline Worker ──────────────────────────────────────────────────────────
class PipelineWorker(QThread):
    progresso = Signal(int, str)
    concluido = Signal(str)
    erro = Signal(str)
    log = Signal(str)

    def __init__(self, video_path, velocidade=155, vol_narr=90, vol_orig=25):
        super().__init__()
        self.video_path = video_path
        self.velocidade = velocidade
        self.vol_narr = vol_narr
        self.vol_orig = vol_orig
        self._cancelled = False

    def cancel(self):
        self._cancelled = True

    def run(self):
        try:
            tmpdir = tempfile.mkdtemp(prefix="voxdesc_")
            frames_dir = os.path.join(tmpdir, "frames")
            os.makedirs(frames_dir)

            output_path = str(Path(self.video_path).with_stem(
                Path(self.video_path).stem + "_AD"
            ))

            # ── 1. Extrair frames ────────────────────────────────────────────
            self.progresso.emit(5, "🎬 Analisando vídeo...")
            self.log.emit("Extraindo frames do vídeo...")

            cmd = [
                "ffmpeg", "-i", self.video_path,
                "-vf", "fps=1",
                "-q:v", "3",
                os.path.join(frames_dir, "frame_%04d.jpg"),
                "-y", "-loglevel", "error"
            ]
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode != 0:
                self.erro.emit(f"Erro ao extrair frames:\n{r.stderr}")
                shutil.rmtree(tmpdir, ignore_errors=True)
                return

            frames = sorted(Path(frames_dir).glob("*.jpg"))
            if not frames:
                self.erro.emit("Nenhum frame extraído do vídeo.")
                shutil.rmtree(tmpdir, ignore_errors=True)
                return

            self.log.emit(f"{len(frames)} frames extraídos.")
            self.progresso.emit(15, "🎬 Frames extraídos!")

            # ── 2. Analisar frames ───────────────────────────────────────────
            self.progresso.emit(20, "🖼️ Descrevendo cenas...")
            self.log.emit("Analisando conteúdo visual...")

            descricoes = []
            step = 20.0 / max(len(frames), 1)

            # Verificar se ollama está disponível
            ollama_ok = shutil.which("ollama") is not None

            for i, frame in enumerate(frames):
                if self._cancelled:
                    shutil.rmtree(tmpdir, ignore_errors=True)
                    self.erro.emit("Cancelado pelo usuário.")
                    return

                pct = int(20 + i * step)
                self.progresso.emit(pct, f"🖼️ Descrevendo cena {i+1}/{len(frames)}...")

                if ollama_ok:
                    desc = self._descrever_frame_ollama(str(frame))
                else:
                    desc = self._descrever_frame_pil(str(frame), i, len(frames))

                descricoes.append((i, desc))
                self.log.emit(f"  Frame {i+1}: {desc[:60]}...")

            self.progresso.emit(40, "🖼️ Análise visual concluída!")

            # ── 3. Montar script de narração ─────────────────────────────────
            self.progresso.emit(45, "🎙️ Gerando narração...")
            self.log.emit("Gerando texto de audiodescrição...")

            script_parts = []
            for i, desc in descricoes:
                # Agrupar em blocos de 3 frames para narração mais fluida
                if i % 3 == 0 and desc:
                    script_parts.append(desc)

            if not script_parts:
                script_parts = [d for _, d in descricoes if d]

            narration_text = ". ".join(script_parts)
            if not narration_text.strip():
                narration_text = "Cena em andamento."

            script_file = os.path.join(tmpdir, "narration.txt")
            with open(script_file, "w", encoding="utf-8") as f:
                f.write(narration_text)

            self.log.emit(f"Script: {narration_text[:100]}...")

            # ── 4. TTS com `say` ─────────────────────────────────────────────
            self.progresso.emit(55, "🎙️ Sintetizando voz...")
            self.log.emit("Sintetizando voz com Luciana...")

            aiff_path = os.path.join(tmpdir, "narration.aiff")
            say_cmd = [
                "say", "-v", "Luciana",
                "-r", str(self.velocidade),
                "-o", aiff_path,
                narration_text
            ]
            r = subprocess.run(say_cmd, capture_output=True, text=True)
            if r.returncode != 0 or not os.path.exists(aiff_path):
                self.erro.emit("Erro ao gerar narração com 'say'.")
                shutil.rmtree(tmpdir, ignore_errors=True)
                return

            # Converter AIFF → WAV
            wav_path = os.path.join(tmpdir, "narration.wav")
            r = subprocess.run(
                ["ffmpeg", "-i", aiff_path, wav_path, "-y", "-loglevel", "error"],
                capture_output=True
            )

            self.progresso.emit(65, "🎙️ Narração gerada!")

            # ── 5. Detectar silêncios ────────────────────────────────────────
            self.progresso.emit(70, "🔍 Detectando silêncios...")
            self.log.emit("Analisando silêncios no áudio original...")

            silence_info = self._detect_silence(self.video_path)
            self.log.emit(f"{len(silence_info)} slots de silêncio detectados.")

            # ── 6. Mixar com ducking ─────────────────────────────────────────
            self.progresso.emit(80, "🎵 Mixando áudio...")
            self.log.emit("Aplicando ducking e mixando trilhas...")

            vol_orig_factor = self.vol_orig / 100.0
            vol_narr_factor = self.vol_narr / 100.0

            # Filter complex com ducking
            filter_complex = (
                f"[0:a]volume={vol_orig_factor}[orig];"
                f"[1:a]volume={vol_narr_factor}[narr];"
                f"[orig][narr]amix=inputs=2:duration=first:dropout_transition=2[out]"
            )

            cmd_mix = [
                "ffmpeg",
                "-i", self.video_path,
                "-i", wav_path,
                "-filter_complex", filter_complex,
                "-map", "0:v",
                "-map", "[out]",
                "-c:v", "copy",
                "-c:a", "aac",
                "-b:a", "192k",
                output_path,
                "-y", "-loglevel", "error"
            ]
            r = subprocess.run(cmd_mix, capture_output=True, text=True)

            if r.returncode != 0:
                self.erro.emit(f"Erro na mixagem:\n{r.stderr}")
                shutil.rmtree(tmpdir, ignore_errors=True)
                return

            shutil.rmtree(tmpdir, ignore_errors=True)
            self.progresso.emit(100, "✅ Pronto!")
            self.log.emit(f"Arquivo gerado: {output_path}")
            self.concluido.emit(output_path)

        except Exception as e:
            import traceback
            self.erro.emit(f"Erro inesperado:\n{traceback.format_exc()}")

    def _descrever_frame_ollama(self, frame_path):
        """Usa ollama com modelo de visão."""
        try:
            r = subprocess.run(
                ["ollama", "run", "llava", f"Descreva em português esta cena de vídeo para audiodescrição, máximo 2 frases: {frame_path}"],
                capture_output=True, text=True, timeout=30
            )
            return r.stdout.strip() or "Cena sem descrição disponível."
        except Exception:
            return self._descrever_frame_pil(frame_path, 0, 1)

    def _descrever_frame_pil(self, frame_path, idx, total):
        """Descrição básica via análise de cores com PIL."""
        try:
            from PIL import Image
            import statistics

            img = Image.open(frame_path).resize((100, 56))
            pixels = list(img.getdata())
            r_vals = [p[0] for p in pixels]
            g_vals = [p[1] for p in pixels]
            b_vals = [p[2] for p in pixels]

            brightness = statistics.mean(r_vals + g_vals + b_vals)
            r_mean = statistics.mean(r_vals)
            g_mean = statistics.mean(g_vals)
            b_mean = statistics.mean(b_vals)

            pos = f"Na cena {idx + 1} de {total}"

            if brightness < 60:
                luz = "ambiente escuro"
            elif brightness < 130:
                luz = "iluminação moderada"
            else:
                luz = "ambiente bem iluminado"

            if r_mean > g_mean and r_mean > b_mean and r_mean > 100:
                tom = "tons quentes avermelhados"
            elif b_mean > r_mean and b_mean > g_mean and b_mean > 100:
                tom = "tons frios azulados"
            elif g_mean > r_mean and g_mean > b_mean and g_mean > 100:
                tom = "tons esverdeados"
            else:
                tom = "paleta neutra"

            return f"{pos}, vemos um {luz} com {tom}."

        except Exception:
            return f"Cena {idx + 1} do vídeo em andamento."

    def _detect_silence(self, video_path):
        """Detecta silêncios no áudio do vídeo."""
        try:
            r = subprocess.run(
                ["ffmpeg", "-i", video_path, "-af",
                 "silencedetect=noise=-30dB:d=0.5",
                 "-f", "null", "-"],
                capture_output=True, text=True
            )
            silences = []
            lines = r.stderr.split("\n")
            start = None
            for line in lines:
                if "silence_start" in line:
                    try:
                        start = float(line.split("silence_start: ")[1].split()[0])
                    except Exception:
                        pass
                elif "silence_end" in line and start is not None:
                    try:
                        end = float(line.split("silence_end: ")[1].split()[0])
                        silences.append((start, end))
                        start = None
                    except Exception:
                        pass
            return silences
        except Exception:
            return []


# ─── Widgets Customizados ─────────────────────────────────────────────────────

class GradientLabel(QLabel):
    """Label com texto em gradiente roxo→ciano."""
    def __init__(self, text, font_size=32, parent=None):
        super().__init__(text, parent)
        self.font_size = font_size
        self.setFont(QFont("SF Pro Display", font_size, QFont.Weight.Bold))
        self.setMinimumHeight(font_size + 20)

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        gradient = QLinearGradient(0, 0, self.width(), 0)
        gradient.setColorAt(0.0, QColor(ACCENT_PURP))
        gradient.setColorAt(0.5, QColor(ACCENT_CYAN))
        gradient.setColorAt(1.0, QColor(ACCENT_PINK))

        painter.setFont(self.font())
        painter.setPen(Qt.PenStyle.NoPen)

        path = QPainterPath()
        path.addText(
            (self.width() - self.fontMetrics().horizontalAdvance(self.text())) / 2,
            self.fontMetrics().ascent() + 5,
            self.font(), self.text()
        )
        painter.fillPath(path, QBrush(gradient))


class WaveWidget(QWidget):
    """Widget animado de ondas sonoras."""
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedHeight(40)
        self._phase = 0.0
        self._active = False
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._tick)

    def start(self):
        self._active = True
        self._timer.start(30)

    def stop(self):
        self._active = False
        self._timer.stop()
        self.update()

    def _tick(self):
        self._phase += 0.15
        self.update()

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        w, h = self.width(), self.height()
        bars = 20
        bar_w = w / bars
        cx = h / 2

        for i in range(bars):
            if self._active:
                amp = (math.sin(self._phase + i * 0.5) * 0.5 + 0.5)
                amp = 0.1 + amp * 0.9
            else:
                amp = 0.15

            bar_h = h * amp
            x = i * bar_w + bar_w * 0.15
            bw = bar_w * 0.7

            t = i / bars
            r = int(124 + (0 - 124) * t)
            g = int(92 + (212 - 92) * t)
            b = int(252 + (255 - 252) * t)
            color = QColor(r, g, b, 200)

            painter.setBrush(QBrush(color))
            painter.setPen(Qt.PenStyle.NoPen)

            rect = QRect(int(x), int(cx - bar_h / 2), int(bw), int(bar_h))
            painter.drawRoundedRect(rect, 3, 3)


class DropZone(QFrame):
    """Área de drop com suporte a drag & drop."""
    file_dropped = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setAcceptDrops(True)
        self.setMinimumHeight(200)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self._hover = False
        self._file_path = None
        self._setup_ui()

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setSpacing(12)

        # Ícone
        self.icon_label = QLabel("🎬")
        self.icon_label.setFont(QFont("Apple Color Emoji", 48))
        self.icon_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

        # Texto principal
        self.main_label = QLabel("Solte seu vídeo aqui")
        self.main_label.setFont(QFont("SF Pro Display", 16, QFont.Weight.Medium))
        self.main_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.main_label.setStyleSheet(f"color: {TEXT_MAIN};")

        # Texto secundário
        self.sub_label = QLabel("ou clique para escolher um arquivo")
        self.sub_label.setFont(QFont("SF Pro Display", 12))
        self.sub_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.sub_label.setStyleSheet(f"color: {TEXT_DIM};")

        # Formatos
        self.fmt_label = QLabel("MP4 • MOV • AVI • MKV • WebM")
        self.fmt_label.setFont(QFont("SF Pro Display", 10))
        self.fmt_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.fmt_label.setStyleSheet(f"color: {TEXT_DIM}; letter-spacing: 2px;")

        layout.addWidget(self.icon_label)
        layout.addWidget(self.main_label)
        layout.addWidget(self.sub_label)
        layout.addWidget(self.fmt_label)
        self._update_style()

    def _update_style(self):
        if self._file_path:
            border_color = ACCENT_CYAN
            bg = "#0d1a2a"
        elif self._hover:
            border_color = ACCENT_PURP
            bg = BG_HOVER
        else:
            border_color = BORDER
            bg = BG_CARD

        self.setStyleSheet(f"""
            QFrame {{
                background: {bg};
                border: 2px dashed {border_color};
                border-radius: 16px;
            }}
        """)

    def set_file(self, path):
        self._file_path = path
        name = Path(path).name
        self.icon_label.setText("✅")
        self.main_label.setText(name)
        self.main_label.setStyleSheet(f"color: {ACCENT_CYAN};")
        self.sub_label.setText("Clique para trocar o arquivo")
        self.fmt_label.setText(str(path))
        self.fmt_label.setStyleSheet(f"color: {TEXT_DIM}; font-size: 9px;")
        self._update_style()

    def reset(self):
        self._file_path = None
        self.icon_label.setText("🎬")
        self.main_label.setText("Solte seu vídeo aqui")
        self.main_label.setStyleSheet(f"color: {TEXT_MAIN};")
        self.sub_label.setText("ou clique para escolher um arquivo")
        self.fmt_label.setText("MP4 • MOV • AVI • MKV • WebM")
        self.fmt_label.setStyleSheet(f"color: {TEXT_DIM}; letter-spacing: 2px;")
        self._update_style()

    def dragEnterEvent(self, event: QDragEnterEvent):
        if event.mimeData().hasUrls():
            self._hover = True
            self._update_style()
            event.acceptProposedAction()

    def dragLeaveEvent(self, event):
        self._hover = False
        self._update_style()

    def dropEvent(self, event: QDropEvent):
        self._hover = False
        urls = event.mimeData().urls()
        if urls:
            path = urls[0].toLocalFile()
            self.file_dropped.emit(path)
        self._update_style()

    def mousePressEvent(self, event):
        path, _ = QFileDialog.getOpenFileName(
            self, "Selecionar vídeo", "",
            "Vídeos (*.mp4 *.mov *.avi *.mkv *.webm *.m4v);;Todos os arquivos (*)"
        )
        if path:
            self.file_dropped.emit(path)

    def enterEvent(self, event):
        if not self._file_path:
            self._hover = True
            self._update_style()

    def leaveEvent(self, event):
        self._hover = False
        self._update_style()


class StyledSlider(QWidget):
    """Slider com label e valor."""
    value_changed = Signal(int)

    def __init__(self, label, min_val, max_val, default, suffix="", parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)

        header = QHBoxLayout()
        lbl = QLabel(label)
        lbl.setFont(QFont("SF Pro Display", 11))
        lbl.setStyleSheet(f"color: {TEXT_DIM};")

        self.val_label = QLabel(f"{default}{suffix}")
        self.val_label.setFont(QFont("SF Pro Display", 11, QFont.Weight.Bold))
        self.val_label.setStyleSheet(f"color: {ACCENT_CYAN};")
        self.val_label.setAlignment(Qt.AlignmentFlag.AlignRight)

        header.addWidget(lbl)
        header.addWidget(self.val_label)

        self.slider = QSlider(Qt.Orientation.Horizontal)
        self.slider.setMinimum(min_val)
        self.slider.setMaximum(max_val)
        self.slider.setValue(default)
        self.slider.setStyleSheet(f"""
            QSlider::groove:horizontal {{
                height: 6px;
                background: {BORDER};
                border-radius: 3px;
            }}
            QSlider::sub-page:horizontal {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {ACCENT_PURP}, stop:1 {ACCENT_CYAN});
                border-radius: 3px;
            }}
            QSlider::handle:horizontal {{
                background: white;
                border: 2px solid {ACCENT_PURP};
                width: 16px;
                height: 16px;
                margin: -5px 0;
                border-radius: 8px;
            }}
            QSlider::handle:horizontal:hover {{
                border-color: {ACCENT_CYAN};
                background: {ACCENT_CYAN};
            }}
        """)
        self.suffix = suffix
        self.slider.valueChanged.connect(self._on_change)

        layout.addLayout(header)
        layout.addWidget(self.slider)

    def _on_change(self, v):
        self.val_label.setText(f"{v}{self.suffix}")
        self.value_changed.emit(v)

    def value(self):
        return self.slider.value()


class GlowButton(QPushButton):
    """Botão com efeito glow."""
    def __init__(self, text, color=ACCENT_PURP, parent=None):
        super().__init__(text, parent)
        self.color = color
        self.setFont(QFont("SF Pro Display", 14, QFont.Weight.Bold))
        self.setMinimumHeight(54)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self._update_style(False)

    def _update_style(self, hovered):
        alpha = "cc" if hovered else "99"
        self.setStyleSheet(f"""
            QPushButton {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {ACCENT_PURP}, stop:1 {ACCENT_CYAN});
                color: white;
                border: none;
                border-radius: 14px;
                padding: 0 32px;
                letter-spacing: 1px;
            }}
            QPushButton:hover {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #9370ff, stop:1 #33ddff);
            }}
            QPushButton:pressed {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #5c3ecc, stop:1 #0099cc);
            }}
            QPushButton:disabled {{
                background: {BORDER};
                color: {TEXT_DIM};
            }}
        """)

    def enterEvent(self, event):
        self._update_style(True)
        super().enterEvent(event)

    def leaveEvent(self, event):
        self._update_style(False)
        super().leaveEvent(event)


class ResultCard(QFrame):
    """Card exibido após processamento."""
    open_finder = Signal(str)
    share_file = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.output_path = None
        self.setStyleSheet(f"""
            QFrame {{
                background: {BG_CARD};
                border: 1px solid {SUCCESS};
                border-radius: 16px;
                padding: 8px;
            }}
        """)
        layout = QVBoxLayout(self)
        layout.setSpacing(12)

        header = QHBoxLayout()
        check = QLabel("✅")
        check.setFont(QFont("Apple Color Emoji", 24))
        title = QLabel("Audiodescrição Gerada!")
        title.setFont(QFont("SF Pro Display", 14, QFont.Weight.Bold))
        title.setStyleSheet(f"color: {SUCCESS}; border: none;")
        header.addWidget(check)
        header.addWidget(title)
        header.addStretch()
        layout.addLayout(header)

        self.path_label = QLabel()
        self.path_label.setFont(QFont("SF Mono", 10))
        self.path_label.setStyleSheet(f"color: {TEXT_DIM}; border: none; padding: 4px 8px; background: #0a0a18; border-radius: 8px;")
        self.path_label.setWordWrap(True)
        layout.addWidget(self.path_label)

        btns = QHBoxLayout()
        self.finder_btn = QPushButton("📁  Abrir no Finder")
        self.finder_btn.setFont(QFont("SF Pro Display", 11))
        self.finder_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.finder_btn.setStyleSheet(f"""
            QPushButton {{
                background: {BG_HOVER};
                color: {TEXT_MAIN};
                border: 1px solid {BORDER};
                border-radius: 10px;
                padding: 8px 20px;
            }}
            QPushButton:hover {{ border-color: {ACCENT_CYAN}; color: {ACCENT_CYAN}; }}
        """)

        self.share_btn = QPushButton("🔗  Compartilhar")
        self.share_btn.setFont(QFont("SF Pro Display", 11))
        self.share_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.share_btn.setStyleSheet(f"""
            QPushButton {{
                background: {BG_HOVER};
                color: {TEXT_MAIN};
                border: 1px solid {BORDER};
                border-radius: 10px;
                padding: 8px 20px;
            }}
            QPushButton:hover {{ border-color: {ACCENT_PURP}; color: {ACCENT_PURP}; }}
        """)

        self.finder_btn.clicked.connect(self._open_finder)
        self.share_btn.clicked.connect(self._share)

        btns.addWidget(self.finder_btn)
        btns.addWidget(self.share_btn)
        btns.addStretch()
        layout.addLayout(btns)

    def set_file(self, path):
        self.output_path = path
        self.path_label.setText(path)

    def _open_finder(self):
        if self.output_path:
            subprocess.run(["open", "-R", self.output_path])

    def _share(self):
        if self.output_path:
            subprocess.run(["open", self.output_path])


# ─── Janela Principal ─────────────────────────────────────────────────────────

class VoxDescriberApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("VoxDescriber")
        self.setMinimumSize(720, 820)
        self.resize(760, 900)
        self.worker = None
        self.video_path = None
        self._setup_style()
        self._setup_ui()

    def _setup_style(self):
        self.setStyleSheet(f"""
            QMainWindow {{
                background: {BG_DARK};
            }}
            QWidget {{
                background: {BG_DARK};
                color: {TEXT_MAIN};
                font-family: "SF Pro Display", "Helvetica Neue", sans-serif;
            }}
            QScrollArea {{
                border: none;
                background: {BG_DARK};
            }}
            QScrollBar:vertical {{
                background: {BG_CARD};
                width: 6px;
                border-radius: 3px;
            }}
            QScrollBar::handle:vertical {{
                background: {TEXT_DIM};
                border-radius: 3px;
            }}
            QStatusBar {{
                background: {BG_CARD};
                color: {TEXT_DIM};
                font-size: 11px;
                border-top: 1px solid {BORDER};
            }}
        """)

    def _setup_ui(self):
        # Scroll area central
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.setCentralWidget(scroll)

        container = QWidget()
        scroll.setWidget(container)

        main = QVBoxLayout(container)
        main.setContentsMargins(40, 40, 40, 40)
        main.setSpacing(24)

        # ── Header ───────────────────────────────────────────────────────────
        header_frame = QFrame()
        header_frame.setStyleSheet(f"""
            QFrame {{
                background: {BG_CARD};
                border-radius: 20px;
                border: 1px solid {BORDER};
            }}
        """)
        header_layout = QVBoxLayout(header_frame)
        header_layout.setContentsMargins(24, 24, 24, 24)
        header_layout.setSpacing(8)

        title = GradientLabel("VoxDescriber", font_size=36)
        subtitle = QLabel("Audiodescrição automática com Inteligência Artificial")
        subtitle.setFont(QFont("SF Pro Display", 13))
        subtitle.setStyleSheet(f"color: {TEXT_DIM}; border: none;")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self.wave = WaveWidget()

        header_layout.addWidget(title)
        header_layout.addWidget(subtitle)
        header_layout.addWidget(self.wave)
        main.addWidget(header_frame)

        # ── Drop Zone ─────────────────────────────────────────────────────────
        self.drop_zone = DropZone()
        self.drop_zone.file_dropped.connect(self._on_file_dropped)
        main.addWidget(self.drop_zone)

        # ── Configurações ─────────────────────────────────────────────────────
        config_frame = QFrame()
        config_frame.setStyleSheet(f"""
            QFrame {{
                background: {BG_CARD};
                border-radius: 16px;
                border: 1px solid {BORDER};
            }}
        """)
        config_layout = QVBoxLayout(config_frame)
        config_layout.setContentsMargins(24, 20, 24, 20)
        config_layout.setSpacing(16)

        cfg_title = QLabel("⚙️  Configurações")
        cfg_title.setFont(QFont("SF Pro Display", 13, QFont.Weight.Bold))
        cfg_title.setStyleSheet(f"color: {TEXT_MAIN}; border: none;")
        config_layout.addWidget(cfg_title)

        sep = QFrame()
        sep.setFrameShape(QFrame.Shape.HLine)
        sep.setStyleSheet(f"color: {BORDER};")
        config_layout.addWidget(sep)

        # Slider: velocidade (palavras por minuto: 100=Lento, 155=Normal, 220=Rápido)
        vel_layout = QVBoxLayout()
        self.vel_slider = StyledSlider("🎙️  Velocidade da voz", 100, 220, 155, " wpm")

        vel_hints = QHBoxLayout()
        for txt in ["Lenta", "Normal", "Rápida"]:
            lbl = QLabel(txt)
            lbl.setFont(QFont("SF Pro Display", 9))
            lbl.setStyleSheet(f"color: {TEXT_DIM}; border: none;")
            if txt == "Normal":
                lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
            elif txt == "Rápida":
                lbl.setAlignment(Qt.AlignmentFlag.AlignRight)
            vel_hints.addWidget(lbl)

        vel_layout.addWidget(self.vel_slider)
        vel_layout.addLayout(vel_hints)
        config_layout.addLayout(vel_layout)

        # Slider: volume narração
        self.vol_narr_slider = StyledSlider("🔊  Volume da narração", 0, 100, 90, "%")
        config_layout.addWidget(self.vol_narr_slider)

        # Slider: volume original
        self.vol_orig_slider = StyledSlider("🎵  Volume original durante AD", 0, 100, 25, "%")
        config_layout.addWidget(self.vol_orig_slider)

        main.addWidget(config_frame)

        # ── Botão principal ───────────────────────────────────────────────────
        self.gen_btn = GlowButton("✨  Gerar Audiodescrição")
        self.gen_btn.setEnabled(False)
        self.gen_btn.clicked.connect(self._on_generate)
        main.addWidget(self.gen_btn)

        self.cancel_btn = QPushButton("⛔  Cancelar")
        self.cancel_btn.setFont(QFont("SF Pro Display", 11))
        self.cancel_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.cancel_btn.setVisible(False)
        self.cancel_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                color: {ERROR};
                border: 1px solid {ERROR};
                border-radius: 10px;
                padding: 8px;
            }}
            QPushButton:hover {{ background: {ERROR}22; }}
        """)
        self.cancel_btn.clicked.connect(self._on_cancel)
        main.addWidget(self.cancel_btn)

        # ── Progress ──────────────────────────────────────────────────────────
        self.progress_frame = QFrame()
        self.progress_frame.setVisible(False)
        self.progress_frame.setStyleSheet(f"""
            QFrame {{
                background: {BG_CARD};
                border-radius: 16px;
                border: 1px solid {BORDER};
            }}
        """)
        progress_layout = QVBoxLayout(self.progress_frame)
        progress_layout.setContentsMargins(24, 20, 24, 20)
        progress_layout.setSpacing(12)

        self.step_label = QLabel("🎬 Iniciando...")
        self.step_label.setFont(QFont("SF Pro Display", 13, QFont.Weight.Medium))
        self.step_label.setStyleSheet(f"color: {TEXT_MAIN}; border: none;")

        self.progress_bar = QProgressBar()
        self.progress_bar.setMinimum(0)
        self.progress_bar.setMaximum(100)
        self.progress_bar.setValue(0)
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setFixedHeight(12)
        self.progress_bar.setStyleSheet(f"""
            QProgressBar {{
                background: {BORDER};
                border-radius: 6px;
                border: none;
            }}
            QProgressBar::chunk {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {ACCENT_PURP}, stop:1 {ACCENT_CYAN});
                border-radius: 6px;
            }}
        """)

        self.pct_label = QLabel("0%")
        self.pct_label.setFont(QFont("SF Pro Display", 11))
        self.pct_label.setStyleSheet(f"color: {ACCENT_CYAN}; border: none;")
        self.pct_label.setAlignment(Qt.AlignmentFlag.AlignRight)

        pct_row = QHBoxLayout()
        pct_row.addWidget(self.step_label)
        pct_row.addWidget(self.pct_label)

        # Log scroll
        self.log_label = QLabel()
        self.log_label.setFont(QFont("SF Mono", 9))
        self.log_label.setStyleSheet(f"""
            color: {TEXT_DIM};
            background: #08080f;
            border-radius: 8px;
            padding: 8px;
            border: none;
        """)
        self.log_label.setWordWrap(True)
        self.log_label.setMaximumHeight(80)
        self._log_lines = []

        progress_layout.addLayout(pct_row)
        progress_layout.addWidget(self.progress_bar)
        progress_layout.addWidget(self.log_label)
        main.addWidget(self.progress_frame)

        # ── Result Card ───────────────────────────────────────────────────────
        self.result_card = ResultCard()
        self.result_card.setVisible(False)
        main.addWidget(self.result_card)

        main.addStretch()

        # ── Status Bar ────────────────────────────────────────────────────────
        self.status = QStatusBar()
        self.setStatusBar(self.status)
        self.status.showMessage("Pronto para processar. Arraste um vídeo ou clique na área de drop.")

    # ── Handlers ──────────────────────────────────────────────────────────────

    def _on_file_dropped(self, path):
        self.video_path = path
        self.drop_zone.set_file(path)
        self.gen_btn.setEnabled(True)
        self.result_card.setVisible(False)
        self.status.showMessage(f"Arquivo selecionado: {Path(path).name}")

    def _on_generate(self):
        if not self.video_path:
            return

        self.gen_btn.setEnabled(False)
        self.cancel_btn.setVisible(True)
        self.progress_frame.setVisible(True)
        self.result_card.setVisible(False)
        self.progress_bar.setValue(0)
        self._log_lines = []
        self.log_label.setText("")
        self.wave.start()

        vel = self.vel_slider.value()
        vol_narr = self.vol_narr_slider.value()
        vol_orig = self.vol_orig_slider.value()

        self.worker = PipelineWorker(self.video_path, vel, vol_narr, vol_orig)
        self.worker.progresso.connect(self._on_progress)
        self.worker.concluido.connect(self._on_done)
        self.worker.erro.connect(self._on_error)
        self.worker.log.connect(self._on_log)
        self.worker.start()

        self.status.showMessage("⚡ Processando audiodescrição...")

    def _on_cancel(self):
        if self.worker:
            self.worker.cancel()
        self._reset_ui("Cancelado.")

    def _on_progress(self, pct, msg):
        self.progress_bar.setValue(pct)
        self.step_label.setText(msg)
        self.pct_label.setText(f"{pct}%")
        self.status.showMessage(msg)

    def _on_log(self, msg):
        self._log_lines.append(msg)
        if len(self._log_lines) > 5:
            self._log_lines = self._log_lines[-5:]
        self.log_label.setText("\n".join(self._log_lines))

    def _on_done(self, output_path):
        self.wave.stop()
        self.result_card.set_file(output_path)
        self.result_card.setVisible(True)
        self._reset_ui("✅ Audiodescrição gerada com sucesso!")
        self.status.showMessage(f"✅ Concluído! → {output_path}")

    def _on_error(self, msg):
        self.wave.stop()
        self._reset_ui(f"❌ Erro: {msg[:80]}")
        self.status.showMessage(f"❌ Erro durante o processamento.")
        self._on_log(f"ERRO: {msg}")

    def _reset_ui(self, status_msg=""):
        self.gen_btn.setEnabled(bool(self.video_path))
        self.cancel_btn.setVisible(False)
        if status_msg:
            self.status.showMessage(status_msg)

    def closeEvent(self, event):
        if self.worker and self.worker.isRunning():
            self.worker.cancel()
            self.worker.wait(2000)
        event.accept()


# ─── Entry Point ──────────────────────────────────────────────────────────────

def main():
    app = QApplication(sys.argv)
    app.setApplicationName("VoxDescriber")
    app.setApplicationDisplayName("VoxDescriber")
    app.setApplicationVersion("1.0.0")
    app.setOrganizationName("Titanio Films")

    # Verificar ícone
    icon_path = Path(__file__).parent / "voxdescriber-icon.png"
    if icon_path.exists():
        from PySide6.QtGui import QIcon
        app.setWindowIcon(QIcon(str(icon_path)))

    window = VoxDescriberApp()
    window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
