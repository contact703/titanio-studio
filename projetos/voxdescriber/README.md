# 🎙️ VoxDescriber
### Audiodescrição automática com IA, 100% offline e gratuita

> Transforme qualquer vídeo em conteúdo acessível para deficientes visuais — automaticamente.

## ✨ Funcionalidades
- 🤖 IA analisa cada cena do vídeo
- 🗣️ Narração em português do Brasil
- 🎵 Mixagem profissional com ducking automático
- 🖥️ Interface gráfica intuitiva
- 💾 100% offline, seus dados ficam no seu computador
- 🆓 Gratuito para uso pessoal e comercial

## 📋 Requisitos
- macOS 12+ ou Windows 10+
- Python 3.10+
- ffmpeg
- 4GB RAM (8GB recomendado)
- 2GB espaço em disco

## 🚀 Instalação
```bash
git clone https://github.com/titaniofilms/voxdescriber
cd voxdescriber
bash install.sh
python3 app.py
```

## 🎬 Como usar
1. Arraste seu vídeo para a janela
2. Configure voz e volume
3. Clique em "Gerar Audiodescrição"
4. Aguarde o processamento
5. Receba o vídeo com AD!

## 🔧 Stack Técnica
| Componente | Tecnologia |
|---|---|
| Detecção de silêncio | ffmpeg silencedetect |
| Visão computacional | Ollama + moondream/qwen2.5vl |
| Síntese de voz | Piper TTS (PT-BR) / macOS Luciana |
| Mixagem | ffmpeg filter_complex |
| Interface | PySide6 (Qt) |

## 📜 Licença
MIT — use como quiser.

## 🏗️ Desenvolvido por
**Squad Titanio** — Tita (IA), com Code Ninja, Design Wizard e Ada Vox.
