"""
Vision - Descrição Visual de Frames
Usa Qwen2.5-VL via Ollama para descrever o que acontece em cada frame do vídeo.
Mantém contexto das últimas descrições para evitar repetições.
"""

import base64
import os
from collections import deque
from pathlib import Path
from typing import Optional

import ollama
from loguru import logger
from PIL import Image


class VisionDescriber:
    """
    Descreve frames de vídeo usando Qwen2.5-VL via Ollama.
    Mantém contexto das últimas N descrições para coerência narrativa.
    """

    MODELOS_PREFERIDOS = ["qwen2.5vl:7b", "qwen2.5vl:3b", "llava:7b", "llava:13b"]
    HISTORICO_MAX: int = 3  # quantas descrições anteriores manter no contexto

    def __init__(
        self,
        modelo: Optional[str] = None,
        ollama_url: str = "http://localhost:11434",
        historico_max: int = 3,
    ):
        """
        Args:
            modelo: Modelo a usar (detecta automaticamente se None)
            ollama_url: URL do servidor Ollama
            historico_max: Número de descrições anteriores a manter no contexto
        """
        self.ollama_url = ollama_url
        self.historico_max = historico_max
        self._historico: deque[str] = deque(maxlen=historico_max)
        self._modelo: Optional[str] = modelo
        self._cliente = ollama.Client(host=ollama_url)

        logger.info(f"VisionDescriber iniciado — Ollama: {ollama_url}")

    @property
    def modelo(self) -> str:
        """Retorna o modelo disponível, detectando automaticamente se necessário."""
        if self._modelo is None:
            self._modelo = self._detectar_modelo()
        return self._modelo

    def _detectar_modelo(self) -> str:
        """Detecta qual modelo de visão está disponível no Ollama."""
        try:
            modelos_instalados = {m.model for m in self._cliente.list().models}
            logger.debug(f"Modelos Ollama disponíveis: {modelos_instalados}")

            for modelo in self.MODELOS_PREFERIDOS:
                if modelo in modelos_instalados:
                    logger.info(f"Modelo de visão selecionado: {modelo}")
                    return modelo

            # Tenta baixar o modelo menor se nenhum disponível
            logger.warning("Nenhum modelo de visão encontrado, tentando baixar qwen2.5vl:3b...")
            self._cliente.pull("qwen2.5vl:3b")
            return "qwen2.5vl:3b"

        except Exception as e:
            logger.error(f"Erro ao detectar modelo Ollama: {e}")
            raise RuntimeError(
                "Não foi possível conectar ao Ollama. "
                "Verifique se está rodando: ollama serve"
            ) from e

    def descrever_frame(
        self,
        caminho_frame: str,
        timestamp: float,
        largura_max: int = 1280,
    ) -> str:
        """
        Descreve visualmente um frame do vídeo.

        Args:
            caminho_frame: Caminho para a imagem do frame
            timestamp: Timestamp do frame em segundos (para contexto)
            largura_max: Redimensiona a imagem se maior que isso

        Returns:
            Descrição textual do frame em português
        """
        if not os.path.exists(caminho_frame):
            raise FileNotFoundError(f"Frame não encontrado: {caminho_frame}")

        # Prepara a imagem
        imagem_b64 = self._preparar_imagem(caminho_frame, largura_max)

        # Monta o prompt com contexto das descrições anteriores
        prompt = self._montar_prompt(timestamp)

        try:
            resposta = self._cliente.chat(
                model=self.modelo,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                        "images": [imagem_b64],
                    }
                ],
                options={"temperature": 0.3, "num_predict": 200},
            )
            descricao = resposta.message.content.strip()

            # Adiciona ao histórico de contexto
            self._historico.append(descricao)

            logger.debug(f"Frame {timestamp:.1f}s descrito: {descricao[:80]}...")
            return descricao

        except ollama.ResponseError as e:
            logger.error(f"Erro Ollama ao descrever frame {timestamp:.1f}s: {e}")
            raise RuntimeError(f"Erro na descrição visual: {e}") from e

    def _preparar_imagem(self, caminho: str, largura_max: int) -> str:
        """Redimensiona e converte a imagem para base64."""
        with Image.open(caminho) as img:
            # Converte para RGB se necessário (remove alpha)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")

            # Redimensiona se muito grande
            if img.width > largura_max:
                proporcao = largura_max / img.width
                nova_altura = int(img.height * proporcao)
                img = img.resize((largura_max, nova_altura), Image.LANCZOS)

            # Converte para base64 (JPEG para economia de tokens)
            import io
            buffer = io.BytesIO()
            img.save(buffer, format="JPEG", quality=85)
            return base64.b64encode(buffer.getvalue()).decode("utf-8")

    def _montar_prompt(self, timestamp: float) -> str:
        """Monta o prompt com contexto das descrições anteriores."""
        minutos = int(timestamp // 60)
        segundos = int(timestamp % 60)
        tempo_str = f"{minutos:02d}:{segundos:02d}"

        contexto = ""
        if self._historico:
            historico_texto = "\n".join(
                f"- {desc}" for desc in list(self._historico)[-3:]
            )
            contexto = f"""
Contexto das cenas anteriores (para evitar repetição):
{historico_texto}

"""

        return f"""{contexto}Você é um especialista em audiodescrição para pessoas com deficiência visual.

No timestamp {tempo_str} do vídeo, descreva objetivamente o que está acontecendo nesta cena.

Regras:
- Seja conciso e objetivo (máximo 2 frases)
- Descreva ações, pessoas, objetos e cenário relevantes
- Use linguagem neutra e inclusiva
- Não repita o que já foi descrito nas cenas anteriores
- Responda APENAS com a descrição, sem comentários adicionais
- Responda em português do Brasil"""

    def limpar_historico(self) -> None:
        """Limpa o histórico de contexto (use ao processar novo vídeo)."""
        self._historico.clear()
        logger.debug("Histórico de contexto limpo")
