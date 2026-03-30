#!/usr/bin/env python3
"""
🤖 Copy Trader — Identifica e copia os melhores traders do Polymarket
Funciona sem wallet (modo análise)
"""
import httpx
import json
from datetime import datetime

GAMMA_URL = "https://gamma-api.polymarket.com"
CLOB_URL = "https://clob.polymarket.com"
DATA_URL = "https://data-api.polymarket.com"


def get_top_traders(limit=20):
    """Busca top traders por profit."""
    try:
        # Tentar endpoint de leaderboard
        resp = httpx.get(f"{DATA_URL}/leaderboard", params={
            "limit": limit, "window": "all"
        }, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except:
        pass
    
    # Tentar endpoint alternativo
    try:
        resp = httpx.get(f"https://polymarket.com/api/leaderboard", params={
            "limit": limit
        }, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except:
        pass
    
    return []


def get_trader_positions(address):
    """Pega posições atuais de um trader específico."""
    try:
        resp = httpx.get(f"{DATA_URL}/positions", params={
            "user": address, "sizeThreshold": 0
        }, timeout=10)
        if resp.status_code == 200:
            return resp.json()
    except:
        pass
    return []


def analyze_market_sentiment(condition_id):
    """Analisa sentimento de um mercado (quem tá comprando YES vs NO)."""
    try:
        resp = httpx.get(f"{CLOB_URL}/book", params={
            "token_id": condition_id
        }, timeout=10)
        if resp.status_code == 200:
            book = resp.json()
            bids = book.get('bids', [])
            asks = book.get('asks', [])
            return {
                "bid_depth": sum(float(b.get('size', 0)) for b in bids),
                "ask_depth": sum(float(a.get('size', 0)) for a in asks),
                "best_bid": float(bids[0]['price']) if bids else 0,
                "best_ask": float(asks[0]['price']) if asks else 0,
                "spread": float(asks[0]['price']) - float(bids[0]['price']) if bids and asks else 0
            }
    except:
        pass
    return None


def find_copy_targets():
    """Encontra traders pra copiar — alta win rate + volume consistente."""
    print("🤖 COPY TRADER — Análise")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 60)
    
    traders = get_top_traders(20)
    if not traders:
        print("⚠️ Leaderboard não disponível via API pública")
        print("   Alternativa: monitorar posições de endereços conhecidos")
        print("")
        
        # Endereços conhecidos de top traders (exemplos públicos)
        known_whales = [
            "0x1234...fake",  # Placeholder - precisa de endereços reais
        ]
        print(f"   Endereços monitoráveis: {len(known_whales)}")
    else:
        print(f"🏆 TOP {len(traders)} TRADERS:")
        for t in traders[:10]:
            print(f"  {t}")
    
    return traders


if __name__ == "__main__":
    find_copy_targets()
