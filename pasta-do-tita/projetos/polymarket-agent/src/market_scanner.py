#!/usr/bin/env python3
"""
📊 Polymarket Market Scanner — Análise de mercados em tempo real
Funciona sem wallet (apenas leitura da API pública)
"""
import httpx
import json
from datetime import datetime

GAMMA_URL = "https://gamma-api.polymarket.com"

def get_top_events(limit=10, min_volume=10000):
    resp = httpx.get(f"{GAMMA_URL}/events", params={
        "limit": limit, "order": "volume", "ascending": "false",
        "active": "true", "closed": "false"
    })
    events = resp.json()
    return [e for e in events if float(e.get('volume', 0) or 0) >= min_volume]

def get_hot_markets(limit=50):
    resp = httpx.get(f"{GAMMA_URL}/markets", params={
        "limit": limit, "active": "true", "closed": "false",
        "order": "volume", "ascending": "false"
    })
    return resp.json()

def find_opportunities(markets):
    opportunities = []
    for m in markets:
        prices = m.get('outcomePrices', '[]')
        if isinstance(prices, str):
            try: prices = json.loads(prices)
            except: continue
        if len(prices) >= 2:
            yes_price = float(prices[0])
            no_price = float(prices[1])
            if 0.3 <= yes_price <= 0.7:
                volume = float(m.get('volume', 0) or 0)
                opportunities.append({
                    'question': m.get('question', '?'),
                    'yes_price': yes_price,
                    'no_price': no_price,
                    'volume': volume,
                    'condition_id': m.get('conditionId', ''),
                })
    return sorted(opportunities, key=lambda x: x['volume'], reverse=True)

def scan_and_report():
    print("📊 POLYMARKET SCANNER")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 60)
    
    events = get_top_events(20, 100000)
    print(f"\n🔥 TOP EVENTOS (volume > $100k):")
    for e in events[:10]:
        vol = float(e.get('volume', 0) or 0)
        print(f"  ${vol:>12,.0f} — {e.get('title', '?')[:60]}")
    
    markets = get_hot_markets(50)
    opps = find_opportunities(markets)
    print(f"\n🎯 {len(opps)} OPORTUNIDADES (30-70% odds):")
    for o in opps[:10]:
        print(f"  YES:{o['yes_price']:.0%} NO:{o['no_price']:.0%} Vol:${o['volume']:,.0f}")
        print(f"  → {o['question'][:70]}")
    
    return {"events": len(events), "opportunities": len(opps)}

if __name__ == "__main__":
    scan_and_report()
