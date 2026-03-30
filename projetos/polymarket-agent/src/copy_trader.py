"""
copy_trader.py — Polymarket Copy Trading
Monitora top traders e replica posições automaticamente.

AVISO: Execução de trades requer private key configurada e aprovação manual.
Por padrão, roda em modo DRY-RUN (simula sem executar).
"""

import os
import json
import httpx
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

GAMMA_API = "https://gamma-api.polymarket.com"
CLOB_API = "https://clob.polymarket.com"

# Config
DRY_RUN = os.getenv("DRY_RUN", "true").lower() == "true"
MAX_TRADE_SIZE = float(os.getenv("MAX_TRADE_SIZE_USD", "5.0"))
MIN_CONFIDENCE = int(os.getenv("MIN_CONFIDENCE", "70"))
PROXY_WALLET = os.getenv("POLY_PROXY_WALLET", "")
PRIVATE_KEY = os.getenv("WALLET_PRIVATE_KEY", "")
API_KEY = os.getenv("POLY_API_KEY", "")
API_SECRET = os.getenv("POLY_API_SECRET", "")
API_PASSPHRASE = os.getenv("POLY_API_PASSPHRASE", "")


class CopyTrader:
    """
    Analisa top traders do Polymarket e replica posições promissoras.
    
    Estratégia:
    1. Puxar leaderboard (top 20 por ROI)
    2. Identificar posições abertas de cada trader
    3. Filtrar: mercados ainda abertos, odds razoáveis, trader com boa taxa de acerto
    4. Replicar posição (DRY_RUN por padrão)
    """

    def __init__(self):
        self.client = httpx.Client(timeout=30)
        self.dry_run = DRY_RUN
        if self.dry_run:
            print("[COPY_TRADER] 🔒 Modo DRY-RUN ativo — nenhum trade será executado")

    def get_leaderboard(self, limit: int = 20, window: str = "monthly") -> list[dict]:
        """
        Busca top traders do Polymarket.
        
        window: "daily", "weekly", "monthly", "all"
        """
        try:
            r = self.client.get(
                f"{GAMMA_API}/leaderboard",
                params={"limit": limit, "window": window},
            )
            r.raise_for_status()
            data = r.json()
            print(f"[COPY_TRADER] {len(data)} traders no leaderboard ({window})")
            return data
        except Exception as e:
            print(f"[COPY_TRADER] Erro ao buscar leaderboard: {e}")
            return []

    def get_trader_positions(self, address: str) -> list[dict]:
        """Busca posições abertas de um trader específico."""
        try:
            r = self.client.get(
                f"{GAMMA_API}/positions",
                params={"user": address, "sizeThreshold": "0.1"},
            )
            r.raise_for_status()
            positions = r.json()
            # Filtrar apenas posições com tamanho relevante
            return [p for p in positions if float(p.get("size", 0)) > 0]
        except Exception as e:
            print(f"[COPY_TRADER] Erro ao buscar posições de {address[:10]}...: {e}")
            return []

    def analyze_trader(self, trader: dict) -> dict:
        """Avalia qualidade de um trader para copy."""
        profit = float(trader.get("profit", 0))
        pnl = float(trader.get("pnl", trader.get("roi", 0)))
        volume = float(trader.get("volume", 0))

        score = 0
        reasons = []

        if profit > 1000:
            score += 30
            reasons.append(f"lucro ${profit:,.0f}")
        if pnl > 0.1:  # 10%+ ROI
            score += 25
            reasons.append(f"ROI {pnl*100:.1f}%")
        if volume > 5000:
            score += 20
            reasons.append(f"vol ${volume:,.0f}")

        return {
            "address": trader.get("pseudonym", trader.get("name", "?")),
            "proxy_wallet": trader.get("proxy_address", ""),
            "profit": profit,
            "roi": pnl,
            "volume": volume,
            "copy_score": score,
            "reasons": ", ".join(reasons),
            "worth_copying": score >= 50,
        }

    def find_copy_opportunities(
        self,
        top_n_traders: int = 5,
        min_position_size: float = 50.0,
    ) -> list[dict]:
        """
        Pipeline completo: leaderboard → análise → posições → oportunidades.
        
        Retorna lista de trades candidatos para cópia.
        """
        print("[COPY_TRADER] 🔍 Buscando oportunidades de copy trading...")
        
        traders = self.get_leaderboard(limit=20)
        if not traders:
            return []

        # Analisar e filtrar melhores traders
        analyzed = [self.analyze_trader(t) for t in traders]
        good_traders = [t for t in analyzed if t["worth_copying"]][:top_n_traders]
        
        print(f"[COPY_TRADER] {len(good_traders)} traders qualificados para copy")

        opportunities = []
        for trader_info in good_traders:
            wallet = trader_info.get("proxy_wallet")
            if not wallet:
                continue

            positions = self.get_trader_positions(wallet)
            print(f"[COPY_TRADER] {trader_info['address']}: {len(positions)} posições abertas")

            for pos in positions:
                size = float(pos.get("size", 0))
                if size < min_position_size:
                    continue

                opportunities.append({
                    "trader": trader_info["address"],
                    "trader_score": trader_info["copy_score"],
                    "market_id": pos.get("market", ""),
                    "question": pos.get("title", pos.get("question", "?")),
                    "direction": "YES" if pos.get("outcomeIndex", 0) == 0 else "NO",
                    "size": size,
                    "entry_price": float(pos.get("avgPrice", 0)),
                    "current_price": float(pos.get("curPrice", 0)),
                    "pnl": float(pos.get("pnl", 0)),
                    "trader_roi": trader_info["roi"],
                })

        # Ordenar por score do trader e tamanho da posição
        opportunities.sort(key=lambda x: (x["trader_score"], x["size"]), reverse=True)
        print(f"[COPY_TRADER] {len(opportunities)} oportunidades encontradas")
        return opportunities

    def simulate_trade(self, opportunity: dict, trade_size_usd: float = None) -> dict:
        """Simula um trade (sem executar)."""
        size = min(trade_size_usd or MAX_TRADE_SIZE, MAX_TRADE_SIZE)
        price = opportunity["entry_price"]
        shares = size / price if price > 0 else 0

        return {
            "action": "SIMULATE",
            "market": opportunity.get("question", "?")[:60],
            "direction": opportunity["direction"],
            "size_usd": size,
            "price": price,
            "shares": shares,
            "potential_profit": shares * (1 - price) if opportunity["direction"] == "YES" else shares * price,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "reason": f"Copy de {opportunity['trader']} (score {opportunity['trader_score']})",
        }

    def execute_trade(self, opportunity: dict, trade_size_usd: float = None) -> dict:
        """
        Executa trade real via py-clob-client.
        
        REQUER:
        - POLY_PROXY_WALLET
        - WALLET_PRIVATE_KEY
        - POLY_API_KEY / POLY_API_SECRET / POLY_API_PASSPHRASE
        """
        if self.dry_run:
            sim = self.simulate_trade(opportunity, trade_size_usd)
            sim["action"] = "DRY_RUN"
            print(f"[COPY_TRADER] 🔒 DRY-RUN: {sim}")
            return sim

        if not PRIVATE_KEY:
            print("[COPY_TRADER] ❌ WALLET_PRIVATE_KEY não configurada")
            return {"error": "sem private key"}

        # TODO: Integração real com py-clob-client
        # from py_clob_client.client import ClobClient
        # from py_clob_client.order_builder.constants import BUY
        # client = ClobClient(CLOB_API, key=PRIVATE_KEY, chain_id=137, ...)
        # order = client.create_market_order(token_id=..., side=BUY, amount=...)
        # resp = client.post_order(order)
        print("[COPY_TRADER] ⚠️ Execução real não implementada ainda — use DRY_RUN=false com cuidado")
        return {"error": "não implementado", "next": "ver TODO em execute_trade()"}

    def close(self):
        self.client.close()


def print_report(opportunities: list[dict], simulations: list[dict]):
    """Imprime relatório de copy trading."""
    print("\n" + "="*60)
    print("📊 RELATÓRIO COPY TRADING")
    print("="*60)
    print(f"Oportunidades encontradas: {len(opportunities)}")
    print(f"Trades simulados: {len(simulations)}")
    print()

    for sim in simulations[:5]:
        print(f"{'🔒 DRY-RUN' if sim['action'] == 'DRY_RUN' else '✅ EXECUTADO'}")
        print(f"  Mercado: {sim['market']}")
        print(f"  Direção: {sim['direction']} @ ${sim['price']:.3f}")
        print(f"  Tamanho: ${sim['size_usd']:.2f} → {sim['shares']:.1f} shares")
        print(f"  Lucro potencial: ${sim['potential_profit']:.2f}")
        print(f"  Razão: {sim['reason']}")
        print()


if __name__ == "__main__":
    trader = CopyTrader()
    
    print("🚀 Iniciando Copy Trader...")
    print(f"Config: DRY_RUN={DRY_RUN} | MAX_TRADE=${MAX_TRADE_SIZE}")
    print()

    opps = trader.find_copy_opportunities(top_n_traders=3)
    
    simulations = []
    for opp in opps[:3]:
        sim = trader.execute_trade(opp, trade_size_usd=5.0)
        simulations.append(sim)

    print_report(opps, simulations)
    trader.close()
