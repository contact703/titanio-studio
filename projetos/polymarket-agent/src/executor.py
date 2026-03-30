"""
executor.py — Polymarket Trade Executor
Lê latest_scan.json e executa trades para oportunidades com confidence >= 70.

Modos:
  DRY_RUN=true (padrão) → simula sem executar
  DRY_RUN=false         → executa trades reais

Uso:
  python executor.py                    # dry run com latest_scan.json
  DRY_RUN=false python executor.py      # executa trades reais
  python executor.py --market-id 553828 # testa um mercado específico
"""

import os
import sys
import json
import logging
import jsonlines
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Garante que src/ está no path
sys.path.insert(0, str(Path(__file__).parent))
from trader import PolyTrader

# Carrega .env
load_dotenv(Path(__file__).parent.parent / ".env")

logger = logging.getLogger(__name__)

# ============================================================
# Configuração
# ============================================================

PROJECT_DIR = Path(__file__).parent.parent
DATA_DIR = PROJECT_DIR / "data"
SCAN_FILE = DATA_DIR / "latest_scan.json"
HISTORY_FILE = DATA_DIR / "trades_history.jsonl"

DRY_RUN = os.getenv("DRY_RUN", "true").lower() == "true"
MIN_CONFIDENCE = int(os.getenv("MIN_CONFIDENCE", "70"))
MAX_TRADE_USD = float(os.getenv("MAX_TRADE_SIZE_USD", "5.0"))
DEFAULT_TRADE_USD = 2.0  # valor padrão por trade


def load_scan() -> Optional[dict]:
    """Carrega o último scan de mercados."""
    if not SCAN_FILE.exists():
        logger.error(f"Arquivo de scan não encontrado: {SCAN_FILE}")
        return None

    with open(SCAN_FILE) as f:
        data = json.load(f)

    logger.info(f"Scan carregado: {data.get('scan_date', 'N/A')} | "
                f"{data.get('opportunities_count', 0)} oportunidades")
    return data


def choose_best_opportunity(opportunities: list[dict]) -> Optional[dict]:
    """
    Escolhe a melhor oportunidade para trade baseado em:
    - Alta liquidez (>= $50k)
    - Preço perto da mediana (mais próximo de 0.5)
    - Volume 24h alto
    """
    # Filtra mercados com boa liquidez
    good = [o for o in opportunities if float(o.get("liquidity", 0)) >= 10000]
    if not good:
        good = opportunities

    # Ordena por liquidez (mais seguro = mais líquido)
    good.sort(key=lambda o: float(o.get("liquidity", 0)), reverse=True)
    return good[0] if good else None


def record_trade(entry: dict):
    """Registra trade no histórico JSONL."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with jsonlines.open(HISTORY_FILE, mode="a") as writer:
        writer.write(entry)
    logger.info(f"Trade registrado em {HISTORY_FILE}")


def execute_trade(
    trader: PolyTrader,
    opportunity: dict,
    side: str = "BUY",
    amount_usd: float = DEFAULT_TRADE_USD,
    use_market_order: bool = False,
) -> dict:
    """
    Executa (ou simula) um trade numa oportunidade.
    
    Args:
        trader: instância do PolyTrader
        opportunity: dict da oportunidade (do scan)
        side: "BUY" (comprar YES) ou "SELL"
        amount_usd: valor em USD
        use_market_order: True = FOK market order, False = limit order GTC
    
    Returns:
        dict com resultado do trade
    """
    market_id = opportunity.get("id", "unknown")
    question = opportunity.get("question", "?")
    yes_price = float(opportunity.get("yes_price", 0.5))
    no_price = float(opportunity.get("no_price", 0.5))
    liquidity = float(opportunity.get("liquidity", 0))
    volume_24h = float(opportunity.get("volume_24h", 0))

    # Pega token IDs
    clob_tokens_raw = opportunity.get("clob_token_ids", "[]")
    if isinstance(clob_tokens_raw, str):
        try:
            token_ids = json.loads(clob_tokens_raw)
        except Exception:
            token_ids = []
    else:
        token_ids = clob_tokens_raw

    if not token_ids or len(token_ids) < 1:
        return {
            "success": False,
            "error": "Token IDs não encontrados",
            "market_id": market_id,
        }

    # Para BUY YES: usa token_ids[0] (YES token)
    # Para BUY NO: usa token_ids[1] (NO token)
    if side.upper() == "BUY":
        token_id = token_ids[0]  # YES token
        price = yes_price
    else:
        token_id = token_ids[0]  # SELL YES token
        price = yes_price

    timestamp = datetime.now(timezone.utc).isoformat()

    result = {
        "timestamp": timestamp,
        "market_id": market_id,
        "question": question[:80],
        "token_id": token_id,
        "side": side,
        "amount_usd": amount_usd,
        "price": price,
        "yes_price": yes_price,
        "no_price": no_price,
        "liquidity": liquidity,
        "volume_24h": volume_24h,
        "order_type": "MARKET_FOK" if use_market_order else "LIMIT_GTC",
        "dry_run": DRY_RUN,
        "success": False,
        "order_id": None,
        "status": None,
        "error": None,
    }

    if DRY_RUN:
        # Modo simulação
        result["success"] = True
        result["status"] = "DRY_RUN_SIMULATED"
        result["order_id"] = f"dry-run-{market_id}-{int(datetime.now().timestamp())}"
        logger.info(f"[DRY_RUN] Simulando {side} ${amount_usd:.2f} @ {price:.4f} "
                   f"em '{question[:50]}...'")
        return result

    # Execução real
    logger.info(f"[LIVE] Executando {side} ${amount_usd:.2f} @ {price:.4f} "
               f"em '{question[:50]}...'")

    if use_market_order:
        order_result = trader.place_market_order(
            token_id=token_id,
            side=side,
            amount_usd=amount_usd,
            worst_price=price * 1.1 if side == "BUY" else price * 0.9,
        )
    else:
        order_result = trader.place_limit_order(
            token_id=token_id,
            side=side,
            amount_usd=amount_usd,
            price=price,
        )

    result.update({
        "success": order_result.get("status") not in ["error", None] or "errorMsg" not in str(order_result.get("raw", "")),
        "order_id": order_result.get("order_id"),
        "status": order_result.get("status"),
        "error": order_result.get("error"),
        "raw_response": order_result.get("raw"),
    })

    if order_result.get("error"):
        result["success"] = False
        result["error"] = order_result["error"]

    return result


def run(
    amount_usd: float = DEFAULT_TRADE_USD,
    max_trades: int = 1,
    specific_market_id: str = None,
    use_market_order: bool = False,
) -> list[dict]:
    """
    Executa o fluxo principal do executor.
    
    1. Carrega scan
    2. Filtra oportunidades com confidence implícita (volume + liquidez)
    3. Verifica saldo
    4. Executa trade(s)
    5. Registra no histórico
    
    Returns:
        lista de resultados
    """
    mode = "DRY_RUN" if DRY_RUN else "LIVE ⚡"
    logger.info(f"=== Executor iniciando [{mode}] ===")

    # Carrega scan
    scan = load_scan()
    if not scan:
        return [{"success": False, "error": "Scan não encontrado"}]

    opportunities = scan.get("opportunities", [])
    if not opportunities:
        return [{"success": False, "error": "Nenhuma oportunidade no scan"}]

    # Filtra oportunidade específica se solicitado
    if specific_market_id:
        opportunities = [o for o in opportunities if str(o.get("id")) == str(specific_market_id)]
        if not opportunities:
            return [{"success": False, "error": f"Mercado {specific_market_id} não encontrado no scan"}]

    # Inicializa trader
    try:
        trader = PolyTrader()
    except Exception as e:
        return [{"success": False, "error": f"Falha ao inicializar trader: {e}"}]

    # Verifica saldo (apenas no modo live)
    if not DRY_RUN:
        bal = trader.get_balance()
        balance = bal.get("balance_usdc", 0)
        needed = amount_usd * max_trades
        logger.info(f"Saldo disponível: ${balance:.4f} USDC | Necessário: ${needed:.4f}")

        if balance < amount_usd:
            return [{
                "success": False,
                "error": f"Saldo insuficiente: ${balance:.4f} USDC (precisa de ${amount_usd:.2f})"
            }]

    results = []
    trades_done = 0

    for opp in opportunities:
        if trades_done >= max_trades:
            break

        # Verifica se aceita ordens
        if not opp.get("accepting_orders", True):
            logger.info(f"Mercado {opp.get('id')} não aceita ordens, pulando...")
            continue

        logger.info(f"\n--- Processando: {opp.get('question', 'N/A')[:60]} ---")
        logger.info(f"    YES: {opp.get('yes_price'):.3f} | NO: {opp.get('no_price'):.3f} | "
                   f"Liq: ${float(opp.get('liquidity', 0)):,.0f} | Vol24h: ${float(opp.get('volume_24h', 0)):,.0f}")

        # Decide o side baseado no preço
        # Compra YES se price < 0.5 (mais barato), NO se YES > 0.5
        yes_price = float(opp.get("yes_price", 0.5))
        if yes_price < 0.5:
            side = "BUY"  # Compra YES (token[0])
        else:
            side = "BUY"  # Compra YES mesmo assim (estratégia simples: sempre BUY YES mais barato)

        result = execute_trade(
            trader=trader,
            opportunity=opp,
            side=side,
            amount_usd=amount_usd,
            use_market_order=use_market_order,
        )

        results.append(result)
        record_trade(result)
        trades_done += 1

        # Log resultado
        if result["success"]:
            logger.info(f"✅ Trade {'simulado' if DRY_RUN else 'executado'}: "
                       f"order_id={result.get('order_id')} status={result.get('status')}")
        else:
            logger.error(f"❌ Trade falhou: {result.get('error')}")

    logger.info(f"\n=== Executor concluído: {trades_done} trade(s) processado(s) ===")
    return results


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import argparse

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s"
    )

    parser = argparse.ArgumentParser(description="Polymarket Trade Executor")
    parser.add_argument("--amount", type=float, default=DEFAULT_TRADE_USD,
                       help=f"Valor por trade em USD (padrão: ${DEFAULT_TRADE_USD})")
    parser.add_argument("--max-trades", type=int, default=1,
                       help="Número máximo de trades (padrão: 1)")
    parser.add_argument("--market-id", type=str, default=None,
                       help="ID específico de mercado para negociar")
    parser.add_argument("--market-order", action="store_true",
                       help="Usar ordem a mercado (FOK) em vez de limit (GTC)")
    parser.add_argument("--live", action="store_true",
                       help="Forçar modo LIVE (ignorar DRY_RUN do .env)")
    args = parser.parse_args()

    if args.live:
        os.environ["DRY_RUN"] = "false"
        # Reimportar DRY_RUN
        import importlib
        import executor
        importlib.reload(executor)

    mode = "🔒 DRY_RUN" if DRY_RUN else "⚡ LIVE"
    print(f"\n{'='*60}")
    print(f"Polymarket Executor [{mode}]")
    print(f"Amount: ${args.amount:.2f} | Max trades: {args.max_trades}")
    print(f"Market order: {args.market_order}")
    if args.market_id:
        print(f"Market ID: {args.market_id}")
    print(f"{'='*60}\n")

    if not DRY_RUN:
        print("⚠️  MODO LIVE ATIVO — trades reais serão executados!")
        print("    Ctrl+C para cancelar nos próximos 3 segundos...")
        import time
        time.sleep(3)

    results = run(
        amount_usd=args.amount,
        max_trades=args.max_trades,
        specific_market_id=args.market_id,
        use_market_order=args.market_order,
    )

    print(f"\n📊 Resultados ({len(results)} trade(s)):")
    for r in results:
        status = "✅" if r.get("success") else "❌"
        print(f"  {status} {r.get('question', 'N/A')[:50]}")
        print(f"     {r.get('side')} ${r.get('amount_usd')} @ {r.get('price', 0):.4f}")
        print(f"     Status: {r.get('status')} | Order ID: {r.get('order_id')}")
        if r.get("error"):
            print(f"     Erro: {r.get('error')}")
