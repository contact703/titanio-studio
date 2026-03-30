"""
market_scanner.py — Polymarket Gamma API wrapper
Puxa mercados ativos, filtra oportunidades, retorna dados estruturados.
"""

import httpx
import json
from datetime import datetime
from typing import Optional


GAMMA_API = "https://gamma-api.polymarket.com"
CLOB_API = "https://clob.polymarket.com"


class MarketScanner:
    def __init__(self):
        self.client = httpx.Client(timeout=30)

    def get_markets(
        self,
        limit: int = 50,
        active: bool = True,
        closed: bool = False,
        sort_by: str = "volume24hr",
    ) -> list[dict]:
        """Puxa mercados da Gamma API."""
        params = {
            "limit": limit,
            "active": str(active).lower(),
            "closed": str(closed).lower(),
        }
        try:
            r = self.client.get(f"{GAMMA_API}/markets", params=params)
            r.raise_for_status()
            markets = r.json()
            # Ordenar por volume 24h (mais líquidos primeiro)
            markets.sort(key=lambda m: float(m.get("volume24hr", 0)), reverse=True)
            return markets
        except Exception as e:
            print(f"[SCANNER] Erro ao puxar mercados: {e}")
            return []

    def filter_opportunities(
        self,
        markets: list[dict],
        min_price: float = 0.15,
        max_price: float = 0.85,
        min_volume: float = 500.0,
        min_liquidity: float = 200.0,
        max_results: int = 30,
    ) -> list[dict]:
        """
        Filtra mercados com odds competitivas e volume suficiente.
        
        Lógica:
        - Preço entre 15-85% → mercado não óbvio (oportunidade)
        - Volume > $500 → liquidez suficiente pra entrar/sair
        - Liquidez > $200 → spread aceitável
        """
        opps = []
        for m in markets:
            try:
                prices_raw = m.get("outcomePrices", "[]")
                prices = json.loads(prices_raw) if isinstance(prices_raw, str) else prices_raw
                outcomes_raw = m.get("outcomes", "[]")
                outcomes = json.loads(outcomes_raw) if isinstance(outcomes_raw, str) else outcomes_raw

                if not prices or len(prices) < 2:
                    continue

                yes_price = float(prices[0])
                volume = float(m.get("volume24hr", 0))
                liquidity = float(m.get("liquidityNum", m.get("liquidity", 0)))

                if (
                    min_price <= yes_price <= max_price
                    and volume >= min_volume
                    and liquidity >= min_liquidity
                ):
                    opps.append(
                        {
                            "id": m["id"],
                            "question": m.get("question", ""),
                            "yes_price": yes_price,
                            "no_price": float(prices[1]) if len(prices) > 1 else 1 - yes_price,
                            "volume_24h": volume,
                            "volume_total": float(m.get("volumeNum", 0)),
                            "liquidity": liquidity,
                            "end_date": m.get("endDate", ""),
                            "end_date_iso": m.get("endDateIso", ""),
                            "clob_token_ids": m.get("clobTokenIds", "[]"),
                            "accepting_orders": m.get("acceptingOrders", False),
                            "condition_id": m.get("conditionId", ""),
                            "slug": m.get("slug", ""),
                            "image": m.get("image", ""),
                            "description": m.get("description", "")[:500],
                        }
                    )
            except Exception:
                continue

        return opps[:max_results]

    def get_top_traders(self, limit: int = 20) -> list[dict]:
        """Busca top traders do Polymarket para copy trading."""
        try:
            r = self.client.get(
                f"{GAMMA_API}/leaderboard",
                params={"limit": limit, "window": "all"},
            )
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"[SCANNER] Erro ao buscar leaderboard: {e}")
            return []

    def get_market_by_id(self, market_id: str) -> Optional[dict]:
        """Busca detalhes de um mercado específico."""
        try:
            r = self.client.get(f"{GAMMA_API}/markets/{market_id}")
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"[SCANNER] Erro ao buscar mercado {market_id}: {e}")
            return None

    def get_orderbook(self, token_id: str) -> Optional[dict]:
        """Pega orderbook de um token específico via CLOB API."""
        try:
            r = self.client.get(f"{CLOB_API}/book", params={"token_id": token_id})
            r.raise_for_status()
            return r.json()
        except Exception as e:
            print(f"[SCANNER] Erro ao buscar orderbook: {e}")
            return None

    def format_opportunity(self, opp: dict) -> str:
        """Formata oportunidade para exibição/log."""
        yes_pct = int(opp["yes_price"] * 100)
        no_pct = int(opp["no_price"] * 100)
        end = opp.get("end_date_iso", "?")
        vol = f"${opp['volume_24h']:,.0f}"
        liq = f"${opp['liquidity']:,.0f}"
        return (
            f"📊 {opp['question'][:80]}\n"
            f"   YES: {yes_pct}% | NO: {no_pct}% | Vol24h: {vol} | Liq: {liq} | Fecha: {end}"
        )

    def close(self):
        self.client.close()


if __name__ == "__main__":
    scanner = MarketScanner()
    print("🔍 Testando Gamma API...")
    markets = scanner.get_markets(limit=50)
    print(f"✅ {len(markets)} mercados encontrados")

    opps = scanner.filter_opportunities(markets, max_results=10)
    print(f"\n🎯 {len(opps)} oportunidades filtradas (odds 15-85%, vol>$500):\n")
    for opp in opps:
        print(scanner.format_opportunity(opp))
        print()

    scanner.close()
