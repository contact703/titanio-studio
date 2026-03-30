"""
AD Generator - Gerador de Texto de Audiodescrição
Usa Ollama (qwen2.5:3b) para transformar descrições visuais em texto AD
seguindo as diretrizes da ABNT NBR 15290.
"""

import math
from typing import Optional

import ollama
from loguru import logger


# Velocidade de leitura confortável para audiodescrição (palavras por segundo)
PALAVRAS_POR_SEGUNDO = 2.5

# Modelos de texto disponíveis (ordem de preferência)
MODELOS_TEXTO = ["qwen2.5:3b", "qwen2.5:7b", "llama3.2:3b", "llama3.1:8b", "mistral:7b"]


class ADGenerator:
    """
    Gera texto de audiodescrição otimizado para o tempo disponível.
    Segue as diretrizes da ABNT NBR 15290 para audiodescrição em vídeo.
    """

    def __init__(
        self,
        modelo: Optional[str] = None,
        ollama_url: str = "http://localhost:11434",
        palavras_por_segundo: float = PALAVRAS_POR_SEGUNDO,
    ):
        """
        Args:
            modelo: Modelo de texto Ollama (detecta automaticamente se None)
            ollama_url: URL do servidor Ollama
            palavras_por_segundo: Velocidade de leitura do TTS (ajusta tamanho do texto)
        """
        self.palavras_por_segundo = palavras_por_segundo
        self._modelo: Optional[str] = modelo
        self._cliente = ollama.Client(host=ollama_url)
        logger.info(f"ADGenerator iniciado — {palavras_por_segundo} palavras/seg")

    @property
    def modelo(self) -> str:
        """Retorna o modelo disponível, detectando automaticamente se necessário."""
        if self._modelo is None:
            self._modelo = self._detectar_modelo()
        return self._modelo

    def _detectar_modelo(self) -> str:
        """Detecta qual modelo de texto está disponível no Ollama."""
        try:
            modelos_instalados = {m.model for m in self._cliente.list().models}
            for modelo in MODELOS_TEXTO:
                if modelo in modelos_instalados:
                    logger.info(f"Modelo de texto selecionado: {modelo}")
                    return modelo

            # Tenta baixar o menor modelo disponível
            logger.warning("Nenhum modelo de texto encontrado, baixando qwen2.5:3b...")
            self._cliente.pull("qwen2.5:3b")
            return "qwen2.5:3b"

        except Exception as e:
            raise RuntimeError(f"Erro ao conectar ao Ollama: {e}") from e

    def calcular_max_palavras(self, duracao_slot: float, margem: float = 0.85) -> int:
        """
        Calcula o número máximo de palavras para um slot de tempo.

        Args:
            duracao_slot: Duração do slot em segundos
            margem: Fator de segurança (0.85 = usa 85% do tempo disponível)

        Returns:
            Número máximo de palavras para o texto AD
        """
        return math.floor(duracao_slot * self.palavras_por_segundo * margem)

    def gerar(
        self,
        descricao_visual: str,
        duracao_slot: float,
        contexto_anterior: Optional[str] = None,
    ) -> str:
        """
        Gera o texto de audiodescrição para um slot.

        Args:
            descricao_visual: Descrição visual bruta do frame
            duracao_slot: Duração disponível em segundos
            contexto_anterior: Último texto AD gerado (para coerência)

        Returns:
            Texto AD otimizado para o tempo disponível
        """
        max_palavras = self.calcular_max_palavras(duracao_slot)

        if max_palavras < 3:
            logger.warning(f"Slot muito curto ({duracao_slot:.1f}s) — pulando AD")
            return ""

        prompt = self._montar_prompt(descricao_visual, max_palavras, contexto_anterior)

        try:
            resposta = self._cliente.chat(
                model=self.modelo,
                messages=[{"role": "user", "content": prompt}],
                options={
                    "temperature": 0.4,
                    "num_predict": max_palavras * 3,  # tokens ≈ palavras * 1.5
                },
            )
            texto_ad = resposta.message.content.strip()

            # Trunca se exceder o máximo de palavras
            texto_ad = self._truncar_por_palavras(texto_ad, max_palavras)

            logger.debug(
                f"AD gerado ({duracao_slot:.1f}s, max {max_palavras} palavras): "
                f"{texto_ad[:80]}..."
            )
            return texto_ad

        except ollama.ResponseError as e:
            logger.error(f"Erro Ollama ao gerar AD: {e}")
            # Fallback: simplifica a descrição visual diretamente
            return self._truncar_por_palavras(descricao_visual, max_palavras)

    def _montar_prompt(
        self,
        descricao: str,
        max_palavras: int,
        contexto_anterior: Optional[str],
    ) -> str:
        """Monta o prompt seguindo as diretrizes da ABNT NBR 15290."""

        contexto_str = ""
        if contexto_anterior:
            contexto_str = f"\nÚltima audiodescrição (para evitar repetição):\n\"{contexto_anterior}\"\n"

        return f"""Você é especialista em audiodescrição para pessoas com deficiência visual, \
seguindo a norma ABNT NBR 15290.
{contexto_str}
Descrição visual da cena:
"{descricao}"

Reescreva como audiodescrição com NO MÁXIMO {max_palavras} palavras, seguindo estas regras:
1. Use presente do indicativo ("Uma mulher caminha" e não "Uma mulher caminhando")
2. Descreva o que é visível, não interprete emoções ou intenções
3. Mencione elementos relevantes: pessoas, ações, cenário, objetos importantes
4. Seja objetivo e neutro — sem julgamentos ou adjetivos subjetivos
5. Priorize ações sobre descrições estáticas
6. NÃO comece com "Cena:" ou "Descrição:" — vá direto ao texto
7. NÃO inclua pontuação de lista ou numeração
8. Responda APENAS com o texto da audiodescrição em português do Brasil

Lembre-se: máximo {max_palavras} palavras."""

    @staticmethod
    def _truncar_por_palavras(texto: str, max_palavras: int) -> str:
        """Trunca o texto no limite de palavras, terminando em frase completa se possível."""
        palavras = texto.split()
        if len(palavras) <= max_palavras:
            return texto

        # Tenta terminar em ponto final
        truncado = " ".join(palavras[:max_palavras])
        ultimo_ponto = truncado.rfind(".")
        if ultimo_ponto > len(truncado) * 0.6:
            return truncado[:ultimo_ponto + 1]

        return truncado + "."
