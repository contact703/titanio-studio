"""
monitor.py — Polymarket AI Monitor 24/7
Escaneia mercados, filtra oportunidades, IA analisa top 3 com confiança ≥70%.

Uso:
  python src/monitor.py              # Roda uma vez
  python src/monitor.py --loop       # Loop infinito (10 min)
  python src/monitor.py --test       # Teste rápido sem salvar
"""

import os
import sys
import json
import time
import argparse
from datetime import datetime, timezone
from pathlib import Path
import httpx
from dotenv import load_dotenv

load_dotenv()

# === Paths ===
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
SCAN_FILE = DATA_DIR / "latest_scan.json"
HISTORY_FILE = DATA_DIR / "scan_history.jsonl"
LOG_FILE = DATA_DIR / "monitor.log"

# === Config ===
SCAN_INTERVAL = int(os.getenv("SCAN_INTERVAL_MINUTES", "10")) * 60
MIN_CONFIDENCE = int(os.getenv("MIN_CONFIDENCE", "70"))
MAX_MARKETS = int(os.getenv("MAX_MARKETS", "30"))
ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")

TIAGO_WALLET = "0xf84796bea736ae03d4e96f78dc7a2894241f5fb0"
BOT_WALLET   = "0x2f076FC55BC16ebBEFb642523206268bF327b687"


def log(msg: str, level: str = "INFO"):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] [{level}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a") as f:
            f.write(line + "\n")
    except Exception:
        pass


# === Market Scanner ===
sys.path.insert(0, str(BASE_DIR / "src"))
from market_scanner import MarketScanner


# === AI Analysis ===

def analyze_with_claude(opportunities: list[dict], top_n: int = 3) -> list[dict]:
    """Analisa top N oportunidades com Claude (Anthropic)."""
    if not ANTHROPIC_KEY:
        log("ANTHROPIC_API_KEY não configurada — pulando análise IA", "WARN")
        return []

    top = opportunities[:top_n]
    if not top:
        return []

    markets_text = "\n\n".join(
        f"{i+1}. PERGUNTA: {m['question']}\n"
        f"   Preço YES: {m['yes_price']*100:.1f}% | NO: {m['no_price']*100:.1f}%\n"
        f"   Volume 24h: ${m['volume_24h']:,.0f} | Liquidez: ${m['liquidity']:,.0f}\n"
        f"   Fecha: {m.get('end_date_iso', '?')}\n"
        f"   Descrição: {m.get('description', '')[:200]}"
        for i, m in enumerate(top)
    )

    prompt = f"""Você é um analista especialista em mercados de previsão (prediction markets).
Analise estes {len(top)} mercados do Polymarket e dê sua recomendação de trading:

{markets_text}

Para CADA mercado, responda em JSON com este formato exato:
{{
  "mercados": [
    {{
      "numero": 1,
      "direcao": "YES" ou "NO" ou "NEUTRO",
      "confianca": número entre 0 e 100,
      "razao": "explicação curta (max 100 chars)",
      "preco_alvo": preço sugerido para comprar (0.0 a 1.0),
      "risco": "ALTO" ou "MEDIO" ou "BAIXO"
    }}
  ]
}}

Seja conservador. Só recomende quando tiver REAL vantagem informacional.
Confiança ≥{MIN_CONFIDENCE}% = sinal forte. Abaixo = NEUTRO.
Responda APENAS o JSON, sem texto adicional."""

    try:
        r = httpx.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-haiku-4-5",
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        r.raise_for_status()
        content = r.json()["content"][0]["text"].strip()

        # Limpar markdown se tiver
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]

        analysis = json.loads(content)
        results = analysis.get("mercados", [])

        # Enriquecer com dados originais
        for i, res in enumerate(results):
            if i < len(top):
                res["question"] = top[i]["question"]
                res["yes_price"] = top[i]["yes_price"]
                res["volume_24h"] = top[i]["volume_24h"]
                res["market_id"] = top[i]["id"]
                res["slug"] = top[i].get("slug", "")

        return results

    except json.JSONDecodeError as e:
        log(f"Erro ao parsear JSON da IA: {e}", "ERROR")
        return []
    except Exception as e:
        log(f"Erro na análise Claude: {e}", "ERROR")
        return []


def analyze_with_openrouter(opportunities: list[dict], top_n: int = 3) -> list[dict]:
    """Fallback: OpenRouter com modelos gratuitos."""
    if not OPENROUTER_KEY:
        return []

    top = opportunities[:top_n]
    if not top:
        return []

    models = [
        "nvidia/llama-3.1-nemotron-70b-instruct:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "google/gemini-2.0-flash-exp:free",
    ]

    markets_text = "\n".join(
        f"{i+1}. {m['question']} | YES:{m['yes_price']*100:.0f}% | Vol:${m['volume_24h']:,.0f}"
        for i, m in enumerate(top)
    )

    prompt = f"""Analise estes mercados de previsão do Polymarket:

{markets_text}

Para cada um, responda em JSON:
{{"mercados": [{{"numero": 1, "direcao": "YES/NO/NEUTRO", "confianca": 0-100, "razao": "max 80 chars"}}]}}

Só JSON puro, sem markdown."""

    for model in models:
        try:
            r = httpx.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 512,
                },
                timeout=20,
            )
            if r.status_code != 200:
                continue

            content = r.json().get("choices", [{}])[0].get("message", {}).get("content")
            if not content:
                log(f"OpenRouter {model} retornou content vazio (rate limit?)", "WARN")
                continue

            content = content.strip()
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]

            analysis = json.loads(content)
            results = analysis.get("mercados", [])
            log(f"OpenRouter OK com modelo: {model}")

            for i, res in enumerate(results):
                if i < len(top):
                    res["question"] = top[i]["question"]
                    res["yes_price"] = top[i]["yes_price"]
                    res["market_id"] = top[i]["id"]

            return results

        except Exception as e:
            log(f"OpenRouter {model} falhou: {e}", "WARN")
            continue

    return []


def analyze_opportunities(opportunities: list[dict]) -> list[dict]:
    """Analisa com Claude primeiro, OpenRouter como fallback."""
    if ANTHROPIC_KEY:
        results = analyze_with_claude(opportunities)
        if results:
            return results

    if OPENROUTER_KEY:
        log("Usando OpenRouter como fallback...")
        results = analyze_with_openrouter(opportunities)
        if results:
            return results

    log("Nenhuma API de IA disponível — sem análise", "WARN")
    return []


def format_signal(signal: dict) -> str:
    """Formata sinal para exibição."""
    conf = signal.get("confianca", 0)
    dir_ = signal.get("direcao", "?")
    emoji = "🟢" if dir_ == "YES" and conf >= MIN_CONFIDENCE else "🔴" if dir_ == "NO" and conf >= MIN_CONFIDENCE else "⚪"
    q = signal.get("question", "?")[:70]
    razao = signal.get("razao", "")
    return f"{emoji} [{conf}%] {dir_} — {q}\n   ↳ {razao}"


def run_scan(test_mode: bool = False) -> dict:
    """Executa um ciclo de scan completo."""
    ts = datetime.now(timezone.utc).isoformat()
    log(f"=== SCAN INICIADO === {ts}")

    scanner = MarketScanner()
    
    # 1. Puxar mercados
    log(f"Buscando até {MAX_MARKETS * 2} mercados na Gamma API...")
    markets = scanner.get_markets(limit=MAX_MARKETS * 2)
    log(f"{len(markets)} mercados recebidos")

    # 2. Filtrar oportunidades
    opps = scanner.filter_opportunities(markets, max_results=MAX_MARKETS)
    log(f"{len(opps)} oportunidades filtradas (odds 15-85%, vol>$500)")

    # 3. Analisar com IA
    signals = []
    if opps and not test_mode:
        log("Analisando top 3 com IA...")
        signals = analyze_opportunities(opps)
        strong_signals = [s for s in signals if s.get("confianca", 0) >= MIN_CONFIDENCE and s.get("direcao") != "NEUTRO"]
        log(f"{len(strong_signals)} sinais fortes (confiança ≥{MIN_CONFIDENCE}%)")
        for sig in signals:
            log(format_signal(sig))

    # 4. Montar resultado
    result = {
        "timestamp": ts,
        "scan_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_markets": len(markets),
        "opportunities_count": len(opps),
        "opportunities": opps[:10],
        "ai_signals": signals,
        "strong_signals": [s for s in signals if s.get("confianca", 0) >= MIN_CONFIDENCE],
    }

    if not test_mode:
        with open(SCAN_FILE, "w") as f:
            json.dump(result, f, indent=2, default=str)
        with open(HISTORY_FILE, "a") as f:
            f.write(json.dumps({
                "timestamp": ts,
                "opportunities_count": len(opps),
                "signals": signals,
            }, default=str) + "\n")
        log(f"Dados salvos em {SCAN_FILE}")

    scanner.close()
    log("=== SCAN CONCLUÍDO ===")
    return result


def run_loop():
    """Loop infinito — scan a cada SCAN_INTERVAL segundos."""
    log(f"🚀 Monitor Polymarket iniciado")
    log(f"   Wallet Tiago: {TIAGO_WALLET}")
    log(f"   Wallet Bot:   {BOT_WALLET}")
    log(f"   Intervalo: {SCAN_INTERVAL}s | Confiança mínima: {MIN_CONFIDENCE}%")
    
    scan_count = 0
    while True:
        scan_count += 1
        log(f"\n--- Scan #{scan_count} ---")
        try:
            result = run_scan()
            strong = result.get("strong_signals", [])
            if strong:
                log(f"🔔 ALERTA: {len(strong)} sinal(is) forte(s) encontrado(s)!")
                for s in strong:
                    log(f"  → {format_signal(s)}")
        except KeyboardInterrupt:
            log("Monitor interrompido pelo usuário")
            break
        except Exception as e:
            log(f"Erro no scan: {e}", "ERROR")

        log(f"Aguardando {SCAN_INTERVAL//60} minutos...")
        try:
            time.sleep(SCAN_INTERVAL)
        except KeyboardInterrupt:
            log("Monitor interrompido")
            break


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Polymarket AI Monitor")
    parser.add_argument("--loop", action="store_true", help="Loop contínuo")
    parser.add_argument("--test", action="store_true", help="Teste rápido (sem salvar, sem IA)")
    args = parser.parse_args()

    if args.test:
        log("🧪 Modo teste")
        result = run_scan(test_mode=True)
        print(f"\n✅ Teste concluído: {result['opportunities_count']} oportunidades encontradas")
        for opp in result["opportunities"][:5]:
            print(f"  • {opp['question'][:70]} | YES:{opp['yes_price']*100:.0f}%")
    elif args.loop:
        run_loop()
    else:
        run_scan()
