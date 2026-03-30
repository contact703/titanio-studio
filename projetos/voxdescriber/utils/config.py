"""
Config - Configurações do VoxDescriber
Gerencia configurações persistentes do aplicativo.
"""

import json
import os
from pathlib import Path
from typing import Any, Optional

from loguru import logger


# Diretório de configuração padrão
CONFIG_DIR = Path.home() / ".voxdescriber"
CONFIG_FILE = CONFIG_DIR / "config.json"


# Configurações padrão
DEFAULTS: dict[str, Any] = {
    # Modelos
    "whisper_modelo": "base",
    "whisper_idioma": "pt",
    "ollama_url": "http://localhost:11434",
    "vision_modelo": None,          # None = autodetect
    "ad_modelo": None,              # None = autodetect

    # TTS
    "piper_exec": "piper",
    "piper_voz": "pt_BR-faber-medium",
    "piper_modelos_dir": None,      # None = autodetect

    # Processamento
    "duracao_minima_slot": 1.5,     # segundos
    "palavras_por_segundo": 2.5,
    "volume_ducking": 0.20,         # 20% do volume original

    # Interface
    "tema": "auto",                 # "auto", "light", "dark"
    "ultimo_diretorio": str(Path.home() / "Movies"),
    "diretorio_saida": str(Path.home() / "Movies"),

    # Performance
    "usar_gpu": True,               # Usa GPU se disponível
    "max_threads": 4,
}


class Config:
    """
    Configurações persistentes do VoxDescriber.
    Carrega/salva automaticamente em ~/.voxdescriber/config.json
    """

    def __init__(self, caminho: Optional[str] = None):
        """
        Args:
            caminho: Caminho alternativo para o arquivo de configuração
        """
        self._caminho = Path(caminho) if caminho else CONFIG_FILE
        self._dados: dict[str, Any] = {}
        self._carregar()

    def _carregar(self) -> None:
        """Carrega as configurações do arquivo, mesclando com os defaults."""
        self._dados = DEFAULTS.copy()

        if self._caminho.exists():
            try:
                with open(self._caminho, "r", encoding="utf-8") as f:
                    dados_salvos = json.load(f)
                # Mescla configs salvas com defaults (preserva novos defaults)
                self._dados.update(dados_salvos)
                logger.debug(f"Configurações carregadas de {self._caminho}")
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(f"Erro ao carregar config: {e} — usando defaults")
        else:
            logger.info("Usando configurações padrão (primeira execução)")
            self.salvar()  # Cria o arquivo com os defaults

    def salvar(self) -> None:
        """Persiste as configurações no arquivo."""
        try:
            self._caminho.parent.mkdir(parents=True, exist_ok=True)
            with open(self._caminho, "w", encoding="utf-8") as f:
                json.dump(self._dados, f, indent=2, ensure_ascii=False)
            logger.debug(f"Configurações salvas em {self._caminho}")
        except IOError as e:
            logger.error(f"Erro ao salvar configurações: {e}")

    def get(self, chave: str, padrao: Any = None) -> Any:
        """Retorna o valor de uma configuração."""
        return self._dados.get(chave, padrao)

    def set(self, chave: str, valor: Any) -> None:
        """Define uma configuração e salva automaticamente."""
        self._dados[chave] = valor
        self.salvar()

    def resetar(self) -> None:
        """Restaura todas as configurações para os valores padrão."""
        self._dados = DEFAULTS.copy()
        self.salvar()
        logger.info("Configurações resetadas para os valores padrão")

    # Acesso conveniente às configs mais usadas
    @property
    def ollama_url(self) -> str:
        return self.get("ollama_url")

    @property
    def whisper_modelo(self) -> str:
        return self.get("whisper_modelo")

    @property
    def piper_exec(self) -> str:
        return self.get("piper_exec")

    @property
    def piper_voz(self) -> str:
        return self.get("piper_voz")

    @property
    def volume_ducking(self) -> float:
        return float(self.get("volume_ducking"))

    @property
    def palavras_por_segundo(self) -> float:
        return float(self.get("palavras_por_segundo"))

    @property
    def duracao_minima_slot(self) -> float:
        return float(self.get("duracao_minima_slot"))

    @property
    def usar_gpu(self) -> bool:
        return bool(self.get("usar_gpu"))

    def __repr__(self) -> str:
        return f"Config({self._caminho})"
