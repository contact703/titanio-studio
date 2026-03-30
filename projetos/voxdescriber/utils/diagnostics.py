"""
diagnostics.py — VoxDescriber Environment Checker
Squad Titanio · Debug Hunter

Verifica todas as dependências do ambiente antes de iniciar o processamento.
Use check_environment() para um relatório completo, ou as funções individuais
para verificações específicas durante o pipeline.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import platform
import logging
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import psutil
import requests

logger = logging.getLogger(__name__)

# ─── Configurações ────────────────────────────────────────────────────────────

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_TIMEOUT = int(os.environ.get("OLLAMA_TIMEOUT", "5"))
DEFAULT_MODEL = os.environ.get("VOXDESCRIBER_MODEL", "qwen2.5vl:7b")
MIN_DISK_GB = float(os.environ.get("VOXDESCRIBER_MIN_DISK_GB", "10"))
MIN_RAM_GB = float(os.environ.get("VOXDESCRIBER_MIN_RAM_GB", "8"))
MIN_VRAM_MB = int(os.environ.get("VOXDESCRIBER_MIN_VRAM_MB", "5500"))

# Possíveis localizações do binário Piper
PIPER_SEARCH_PATHS = [
    shutil.which("piper"),
    Path.home() / ".voxdescriber" / "bin" / "piper",
    Path.home() / ".local" / "bin" / "piper",
    Path(__file__).parent.parent / "bin" / "piper",
    Path(__file__).parent.parent / "bin" / "piper.exe",  # Windows
    # macOS: bundle dentro do .app
    Path("/Applications/VoxDescriber.app/Contents/MacOS/piper"),
]


# ─── Dataclasses de resultado ─────────────────────────────────────────────────

@dataclass
class CheckResult:
    name: str
    ok: bool
    message: str
    detail: Optional[str] = None
    fix_hint: Optional[str] = None


@dataclass
class EnvironmentReport:
    checks: dict[str, CheckResult] = field(default_factory=dict)

    @property
    def all_ok(self) -> bool:
        return all(c.ok for c in self.checks.values())

    @property
    def critical_failures(self) -> list[CheckResult]:
        """Checks que impedem completamente a execução."""
        critical = {"ffmpeg", "ollama_running", "piper"}
        return [c for name, c in self.checks.items() if not c.ok and name in critical]

    @property
    def warnings(self) -> list[CheckResult]:
        """Checks que podem degradar performance mas não impedem execução."""
        warning_keys = {"ram", "disk_space", "vram", "model"}
        return [c for name, c in self.checks.items() if not c.ok and name in warning_keys]

    def summary(self) -> str:
        lines = ["=== VoxDescriber — Diagnóstico do Ambiente ===\n"]
        for name, check in self.checks.items():
            icon = "✅" if check.ok else "❌"
            lines.append(f"{icon} {check.name}: {check.message}")
            if not check.ok and check.fix_hint:
                lines.append(f"   💡 {check.fix_hint}")
        if self.all_ok:
            lines.append("\n✅ Ambiente pronto para processar vídeos!")
        else:
            n_crit = len(self.critical_failures)
            n_warn = len(self.warnings)
            lines.append(f"\n⚠️  {n_crit} erro(s) crítico(s), {n_warn} aviso(s) encontrado(s).")
        return "\n".join(lines)


# ─── Verificações individuais ─────────────────────────────────────────────────

def check_ffmpeg() -> CheckResult:
    """Verifica se ffmpeg está instalado e operacional."""
    path = shutil.which("ffmpeg")
    if not path:
        return CheckResult(
            name="ffmpeg",
            ok=False,
            message="ffmpeg não encontrado no PATH",
            fix_hint="Instale ffmpeg: https://ffmpeg.org/download.html "
                     "ou coloque o binário estático na pasta do app.",
        )
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True, text=True, timeout=10
        )
        version_line = result.stdout.splitlines()[0] if result.stdout else "versão desconhecida"
        return CheckResult(
            name="ffmpeg",
            ok=True,
            message=f"ffmpeg disponível — {version_line}",
            detail=path,
        )
    except (subprocess.TimeoutExpired, OSError) as e:
        return CheckResult(
            name="ffmpeg",
            ok=False,
            message=f"ffmpeg encontrado mas falhou ao executar: {e}",
            fix_hint="Reinstale o ffmpeg ou verifique se o binário não está corrompido.",
        )


def check_ffprobe() -> CheckResult:
    """Verifica se ffprobe está instalado (geralmente vem junto com ffmpeg)."""
    path = shutil.which("ffprobe")
    if not path:
        return CheckResult(
            name="ffprobe",
            ok=False,
            message="ffprobe não encontrado",
            fix_hint="ffprobe geralmente é instalado junto com ffmpeg.",
        )
    return CheckResult(name="ffprobe", ok=True, message=f"ffprobe disponível em {path}")


def check_ollama_installed() -> CheckResult:
    """Verifica se o binário ollama está instalado."""
    path = shutil.which("ollama")
    if not path:
        return CheckResult(
            name="ollama_installed",
            ok=False,
            message="Ollama não encontrado no PATH",
            fix_hint="Instale o Ollama: https://ollama.ai",
        )
    return CheckResult(
        name="ollama_installed",
        ok=True,
        message=f"Ollama instalado em {path}",
    )


def check_ollama_running(host: str = OLLAMA_HOST, timeout: int = OLLAMA_TIMEOUT) -> CheckResult:
    """Verifica se o serviço Ollama está respondendo."""
    try:
        r = requests.get(f"{host}/api/tags", timeout=timeout)
        r.raise_for_status()
        models = [m.get("name", "") for m in r.json().get("models", [])]
        n_models = len(models)
        return CheckResult(
            name="ollama_running",
            ok=True,
            message=f"Ollama rodando em {host} — {n_models} modelo(s) disponível(is)",
            detail=", ".join(models[:5]) + ("..." if n_models > 5 else ""),
        )
    except requests.exceptions.ConnectionError:
        return CheckResult(
            name="ollama_running",
            ok=False,
            message=f"Ollama não está respondendo em {host}",
            fix_hint="Execute 'ollama serve' em um terminal e tente novamente. "
                     "Ou o VoxDescriber tentará iniciar automaticamente.",
        )
    except requests.exceptions.Timeout:
        return CheckResult(
            name="ollama_running",
            ok=False,
            message=f"Ollama demorou mais de {timeout}s para responder",
            fix_hint="Ollama pode estar sobrecarregado. Aguarde e tente novamente.",
        )
    except Exception as e:
        return CheckResult(
            name="ollama_running",
            ok=False,
            message=f"Erro ao conectar ao Ollama: {e}",
        )


def check_model_downloaded(
    model_name: str = DEFAULT_MODEL,
    host: str = OLLAMA_HOST
) -> CheckResult:
    """Verifica se o modelo de visão está baixado no Ollama."""
    try:
        r = requests.get(f"{host}/api/tags", timeout=OLLAMA_TIMEOUT)
        r.raise_for_status()
        models = [m.get("name", "") for m in r.json().get("models", [])]

        # Checar nome exato e variações (ex: "qwen2.5vl:7b" vs "qwen2.5vl:7b-instruct")
        exact_match = model_name in models
        partial_match = any(model_name.split(":")[0] in m for m in models)

        if exact_match:
            return CheckResult(
                name="model",
                ok=True,
                message=f"Modelo '{model_name}' disponível",
            )
        elif partial_match:
            similar = [m for m in models if model_name.split(":")[0] in m]
            return CheckResult(
                name="model",
                ok=False,
                message=f"Modelo '{model_name}' não encontrado. Modelos similares: {similar}",
                fix_hint=f"Execute: ollama pull {model_name}",
            )
        else:
            return CheckResult(
                name="model",
                ok=False,
                message=f"Modelo '{model_name}' não está baixado",
                fix_hint=f"Execute: ollama pull {model_name} (~4GB de download)",
            )
    except requests.exceptions.ConnectionError:
        return CheckResult(
            name="model",
            ok=False,
            message="Não foi possível verificar o modelo (Ollama offline)",
            fix_hint="Inicie o Ollama primeiro.",
        )
    except Exception as e:
        return CheckResult(
            name="model",
            ok=False,
            message=f"Erro ao verificar modelo: {e}",
        )


def check_piper_binary() -> CheckResult:
    """Verifica se o binário Piper TTS está disponível e executável."""
    found_path = None
    for candidate in PIPER_SEARCH_PATHS:
        if candidate is None:
            continue
        p = Path(candidate)
        if p.exists() and p.is_file():
            found_path = p
            break

    if not found_path:
        return CheckResult(
            name="piper",
            ok=False,
            message="Binário Piper TTS não encontrado",
            fix_hint="Baixe o Piper em https://github.com/rhasspy/piper/releases "
                     "e coloque em ~/.voxdescriber/bin/piper",
        )

    # Verificar permissão de execução
    if not os.access(str(found_path), os.X_OK):
        try:
            os.chmod(str(found_path), 0o755)
            logger.info(f"Permissão de execução concedida a {found_path}")
        except OSError as e:
            return CheckResult(
                name="piper",
                ok=False,
                message=f"Piper encontrado mas sem permissão de execução: {found_path}",
                fix_hint=f"Execute: chmod +x {found_path}",
            )

    # Testar execução
    try:
        result = subprocess.run(
            [str(found_path), "--version"],
            capture_output=True, text=True, timeout=5
        )
        version = result.stdout.strip() or result.stderr.strip() or "versão desconhecida"
        return CheckResult(
            name="piper",
            ok=True,
            message=f"Piper disponível — {version}",
            detail=str(found_path),
        )
    except subprocess.TimeoutExpired:
        return CheckResult(
            name="piper",
            ok=False,
            message="Piper demorou muito para responder",
            fix_hint="Verifique se o binário não está corrompido.",
        )
    except Exception as e:
        return CheckResult(
            name="piper",
            ok=False,
            message=f"Erro ao executar Piper: {e}",
        )


def check_piper_voice(voice_path: str) -> CheckResult:
    """Verifica se o arquivo de voz Piper (.onnx) existe."""
    p = Path(voice_path)
    json_path = p.with_suffix(".onnx.json")

    if not p.exists():
        return CheckResult(
            name="piper_voice",
            ok=False,
            message=f"Arquivo de voz não encontrado: {voice_path}",
            fix_hint="Baixe vozes em https://huggingface.co/rhasspy/piper-voices",
        )
    if not json_path.exists():
        return CheckResult(
            name="piper_voice",
            ok=False,
            message=f"Arquivo de configuração de voz não encontrado: {json_path}",
            fix_hint="O arquivo .onnx.json deve estar na mesma pasta que o .onnx",
        )

    size_mb = p.stat().st_size / (1024 * 1024)
    return CheckResult(
        name="piper_voice",
        ok=True,
        message=f"Voz disponível: {p.name} ({size_mb:.1f}MB)",
    )


def check_disk_space_gb(
    required_gb: float = MIN_DISK_GB,
    path: Optional[str] = None
) -> CheckResult:
    """Verifica espaço em disco disponível."""
    check_path = path or tempfile.gettempdir()
    try:
        usage = shutil.disk_usage(check_path)
        free_gb = usage.free / (1024 ** 3)
        total_gb = usage.total / (1024 ** 3)

        if free_gb >= required_gb:
            return CheckResult(
                name="disk_space",
                ok=True,
                message=f"Espaço em disco: {free_gb:.1f}GB livres de {total_gb:.1f}GB",
            )
        else:
            return CheckResult(
                name="disk_space",
                ok=False,
                message=f"Espaço insuficiente: {free_gb:.1f}GB livres (necessário: {required_gb}GB)",
                fix_hint=f"Libere espaço em {check_path} ou escolha outro local para os arquivos temporários.",
            )
    except Exception as e:
        return CheckResult(
            name="disk_space",
            ok=False,
            message=f"Não foi possível verificar espaço em disco: {e}",
        )


def check_ram_gb(required_gb: float = MIN_RAM_GB) -> CheckResult:
    """Verifica RAM disponível no sistema."""
    try:
        mem = psutil.virtual_memory()
        available_gb = mem.available / (1024 ** 3)
        total_gb = mem.total / (1024 ** 3)

        if available_gb >= required_gb:
            return CheckResult(
                name="ram",
                ok=True,
                message=f"RAM: {available_gb:.1f}GB disponível de {total_gb:.1f}GB",
            )
        else:
            return CheckResult(
                name="ram",
                ok=False,
                message=f"RAM disponível: {available_gb:.1f}GB (recomendado: {required_gb}GB+)",
                fix_hint="Feche outros aplicativos para liberar memória. "
                         "Considere usar o modelo 'qwen2.5vl:3b' (menor).",
            )
    except Exception as e:
        return CheckResult(
            name="ram",
            ok=False,
            message=f"Não foi possível verificar RAM: {e}",
        )


def check_vram_mb(required_mb: int = MIN_VRAM_MB) -> CheckResult:
    """Verifica VRAM disponível (NVIDIA via nvidia-smi)."""
    # Tentar nvidia-smi primeiro
    if shutil.which("nvidia-smi"):
        try:
            result = subprocess.run(
                ["nvidia-smi", "--query-gpu=name,memory.free,memory.total",
                 "--format=csv,noheader,nounits"],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode == 0 and result.stdout.strip():
                lines = result.stdout.strip().splitlines()
                gpus = []
                for line in lines:
                    parts = [p.strip() for p in line.split(",")]
                    if len(parts) >= 3:
                        gpus.append({
                            "name": parts[0],
                            "free_mb": int(parts[1]),
                            "total_mb": int(parts[2]),
                        })

                best_gpu = max(gpus, key=lambda g: g["free_mb"]) if gpus else None
                if best_gpu:
                    if best_gpu["free_mb"] >= required_mb:
                        return CheckResult(
                            name="vram",
                            ok=True,
                            message=(
                                f"GPU: {best_gpu['name']} — "
                                f"{best_gpu['free_mb']}MB VRAM livres de {best_gpu['total_mb']}MB"
                            ),
                        )
                    else:
                        return CheckResult(
                            name="vram",
                            ok=False,
                            message=(
                                f"GPU: {best_gpu['name']} — VRAM insuficiente: "
                                f"{best_gpu['free_mb']}MB livres (necessário: {required_mb}MB)"
                            ),
                            fix_hint="O app usará CPU automaticamente (mais lento). "
                                     "Feche outros apps que usem GPU.",
                        )
        except Exception:
            pass

    # macOS: tentar system_profiler para Metal/MPS
    if platform.system() == "Darwin":
        try:
            result = subprocess.run(
                ["system_profiler", "SPDisplaysDataType"],
                capture_output=True, text=True, timeout=15
            )
            if "VRAM" in result.stdout or "vram" in result.stdout.lower():
                # Parser simplificado
                for line in result.stdout.splitlines():
                    if "VRAM" in line or "vram" in line.lower():
                        return CheckResult(
                            name="vram",
                            ok=True,  # Apple Silicon usa unified memory, geralmente ok
                            message=f"GPU Apple Silicon detectada: {line.strip()}",
                        )
        except Exception:
            pass

    # Sem GPU detectada
    return CheckResult(
        name="vram",
        ok=True,  # ok=True porque CPU é um fallback válido
        message="Nenhuma GPU dedicada detectada — usando CPU (mais lento mas funcional)",
        fix_hint="Para melhor performance, use uma máquina com GPU NVIDIA com 6GB+ VRAM.",
    )


def check_python_dependencies() -> CheckResult:
    """Verifica se todas as dependências Python estão instaladas."""
    required = [
        "whisperx",
        "torch",
        "PIL",  # Pillow
        "PySide6",
        "requests",
        "psutil",
        "numpy",
    ]
    missing = []
    for dep in required:
        try:
            __import__(dep)
        except ImportError:
            missing.append(dep)

    if not missing:
        return CheckResult(
            name="python_deps",
            ok=True,
            message=f"Todas as {len(required)} dependências Python instaladas",
        )
    else:
        return CheckResult(
            name="python_deps",
            ok=False,
            message=f"Dependências Python faltando: {', '.join(missing)}",
            fix_hint=f"Execute: pip install {' '.join(missing)}",
        )


def check_write_permission(path: str) -> CheckResult:
    """Verifica se é possível escrever no diretório especificado."""
    test_file = Path(path) / ".voxdescriber_write_test"
    try:
        test_file.parent.mkdir(parents=True, exist_ok=True)
        test_file.touch()
        test_file.unlink()
        return CheckResult(
            name="write_permission",
            ok=True,
            message=f"Permissão de escrita confirmada em: {path}",
        )
    except PermissionError:
        return CheckResult(
            name="write_permission",
            ok=False,
            message=f"Sem permissão de escrita em: {path}",
            fix_hint="Escolha outra pasta de destino (Desktop ou Documentos).",
        )
    except Exception as e:
        return CheckResult(
            name="write_permission",
            ok=False,
            message=f"Erro ao verificar permissão: {e}",
        )


# ─── Verificação completa ──────────────────────────────────────────────────────

def check_environment(
    model_name: str = DEFAULT_MODEL,
    required_disk_gb: float = MIN_DISK_GB,
    required_ram_gb: float = MIN_RAM_GB,
    voice_path: Optional[str] = None,
    output_dir: Optional[str] = None,
) -> EnvironmentReport:
    """
    Executa todos os checks de ambiente e retorna um relatório completo.

    Args:
        model_name: Nome do modelo Ollama a verificar (ex: "qwen2.5vl:7b")
        required_disk_gb: Espaço mínimo em disco em GB
        required_ram_gb: RAM mínima em GB
        voice_path: Caminho para o .onnx da voz Piper (opcional)
        output_dir: Diretório de exportação a verificar permissão (opcional)

    Returns:
        EnvironmentReport com todos os resultados
    """
    report = EnvironmentReport()

    logger.info("Iniciando diagnóstico do ambiente VoxDescriber...")

    # Dependências de sistema (críticas)
    report.checks["ffmpeg"] = check_ffmpeg()
    report.checks["ffprobe"] = check_ffprobe()
    report.checks["piper"] = check_piper_binary()

    # Voz Piper (se especificada)
    if voice_path:
        report.checks["piper_voice"] = check_piper_voice(voice_path)

    # Ollama
    ollama_installed = check_ollama_installed()
    report.checks["ollama_installed"] = ollama_installed

    if ollama_installed.ok:
        report.checks["ollama_running"] = check_ollama_running()
        if report.checks["ollama_running"].ok:
            report.checks["model"] = check_model_downloaded(model_name)
    else:
        report.checks["ollama_running"] = CheckResult(
            name="ollama_running",
            ok=False,
            message="Ollama não instalado — impossível verificar serviço",
        )
        report.checks["model"] = CheckResult(
            name="model",
            ok=False,
            message="Ollama não instalado — impossível verificar modelo",
        )

    # Recursos de hardware
    report.checks["disk_space"] = check_disk_space_gb(required_disk_gb)
    report.checks["ram"] = check_ram_gb(required_ram_gb)
    report.checks["vram"] = check_vram_mb()

    # Dependências Python
    report.checks["python_deps"] = check_python_dependencies()

    # Permissão de escrita (se especificada)
    if output_dir:
        report.checks["write_permission"] = check_write_permission(output_dir)

    # Log resumo
    if report.all_ok:
        logger.info("✅ Todos os checks passaram.")
    else:
        for name, check in report.checks.items():
            if not check.ok:
                logger.warning(f"❌ {name}: {check.message}")

    return report


# ─── Funções de startup automático ────────────────────────────────────────────

def try_start_ollama() -> bool:
    """
    Tenta iniciar o serviço Ollama em background.
    Retorna True se o serviço estiver respondendo após a tentativa.
    """
    if not shutil.which("ollama"):
        return False

    logger.info("Tentando iniciar Ollama em background...")
    try:
        subprocess.Popen(
            ["ollama", "serve"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,  # Detach do processo pai
        )

        # Aguardar até 10s para o serviço subir
        import time
        for attempt in range(10):
            time.sleep(1)
            result = check_ollama_running()
            if result.ok:
                logger.info(f"Ollama iniciado com sucesso após {attempt + 1}s")
                return True

        logger.warning("Ollama não respondeu após 10s")
        return False
    except Exception as e:
        logger.error(f"Falha ao iniciar Ollama: {e}")
        return False


def try_pull_model(model_name: str = DEFAULT_MODEL, progress_callback=None) -> bool:
    """
    Tenta baixar o modelo via `ollama pull`.
    progress_callback(percent: int, status: str) é chamado durante o download.
    """
    if not shutil.which("ollama"):
        return False

    logger.info(f"Iniciando download do modelo {model_name}...")
    try:
        process = subprocess.Popen(
            ["ollama", "pull", model_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        for line in process.stdout:
            line = line.strip()
            if line and progress_callback:
                progress_callback(0, line)
            logger.debug(f"ollama pull: {line}")

        process.wait()
        success = process.returncode == 0
        if success:
            logger.info(f"Modelo {model_name} baixado com sucesso")
        else:
            logger.error(f"Falha ao baixar modelo {model_name} (código {process.returncode})")
        return success
    except Exception as e:
        logger.error(f"Erro ao baixar modelo: {e}")
        return False


def auto_fix_environment(report: EnvironmentReport) -> EnvironmentReport:
    """
    Tenta corrigir automaticamente problemas detectados no ambiente.
    Executa fixes seguros (iniciar Ollama, corrigir permissões, etc.).
    Retorna um novo relatório após as correções.
    """
    fixes_applied = []

    # Fix 1: Iniciar Ollama se instalado mas não rodando
    if (report.checks.get("ollama_installed", CheckResult("", False, "")).ok and
            not report.checks.get("ollama_running", CheckResult("", True, "")).ok):
        if try_start_ollama():
            fixes_applied.append("Ollama iniciado automaticamente")

    # Fix 2: Corrigir permissão do Piper se necessário
    piper_check = report.checks.get("piper")
    if piper_check and not piper_check.ok and piper_check.detail:
        piper_path = Path(piper_check.detail)
        if piper_path.exists() and not os.access(str(piper_path), os.X_OK):
            try:
                os.chmod(str(piper_path), 0o755)
                fixes_applied.append(f"Permissão de execução do Piper corrigida")
            except OSError:
                pass

    if fixes_applied:
        logger.info(f"Auto-fixes aplicados: {', '.join(fixes_applied)}")
        # Re-executar checks após fixes
        return check_environment()

    return report


# ─── CLI de diagnóstico ────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    import argparse

    parser = argparse.ArgumentParser(
        description="VoxDescriber — Diagnóstico de Ambiente",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python diagnostics.py
  python diagnostics.py --model qwen2.5vl:3b --disk 5
  python diagnostics.py --output-dir ~/Desktop --autofix
        """
    )
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Modelo Ollama a verificar")
    parser.add_argument("--disk", type=float, default=MIN_DISK_GB, help="GB mínimo em disco")
    parser.add_argument("--ram", type=float, default=MIN_RAM_GB, help="GB mínimo de RAM")
    parser.add_argument("--voice", help="Caminho para arquivo .onnx da voz Piper")
    parser.add_argument("--output-dir", help="Diretório de saída a verificar")
    parser.add_argument("--autofix", action="store_true", help="Tentar corrigir problemas automaticamente")
    parser.add_argument("--json", action="store_true", help="Saída em formato JSON")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.WARNING,
        format="%(levelname)s: %(message)s"
    )

    report = check_environment(
        model_name=args.model,
        required_disk_gb=args.disk,
        required_ram_gb=args.ram,
        voice_path=args.voice,
        output_dir=args.output_dir,
    )

    if args.autofix and not report.all_ok:
        print("\n🔧 Tentando corrigir problemas automaticamente...\n")
        report = auto_fix_environment(report)

    if args.json:
        import json
        output = {
            name: {
                "ok": c.ok,
                "message": c.message,
                "detail": c.detail,
                "fix_hint": c.fix_hint,
            }
            for name, c in report.checks.items()
        }
        print(json.dumps(output, indent=2, ensure_ascii=False))
    else:
        print(report.summary())

    sys.exit(0 if report.all_ok else 1)
