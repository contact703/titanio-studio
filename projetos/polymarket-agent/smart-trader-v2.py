#!/usr/bin/env python3
"""
Polymarket Smart Trader v2 — Atacante com Base
===============================================

Bot que analisa mercados 24/7 com dados REAIS:
- Scraping de notícias em tempo real
- Análise de probabilidades e movimentação
- Detecção de oportunidades (edge > 10%)
- Alertas no WhatsApp quando encontrar trade bom
- Executa trade com confirmação ou autônomo

Roda: python3 smart-trader-v2.py [scan|analyze|trade|monitor]
"""

import os
import sys
import json
import time
import asyncio
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

# Paths
WORKSPACE = os.environ.get("OPENCLAW_WORKSPACE", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace")
DATA_DIR = os.path.join(WORKSPACE, "projetos/polymarket-agent/data")
COFRE = os.path.join(WORKSPACE, "pasta-do-tita/cofre")
os.makedirs(DATA_DIR, exist_ok=True)

# APIs
GAMMA_API = "https://gamma-api.polymarket.com"
DATA_API = "https://data-api.polymarket.com"
CLOB_API = "https://clob.polymarket.com"

# Config
WALLET = "0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0"
MIN_EDGE = 0.10  # 10% mínimo de edge pra considerar trade
MIN_VOLUME = 50000  # Volume mínimo $50k
MIN_LIQUIDITY = 10000  # Liquidez mínima $10k


async def fetch_json(page, url):
    """Fetch JSON via Playwright (bypassa geoblock)"""
    try:
        await page.goto(url, timeout=15000)
        await asyncio.sleep(1)
        body = await page.inner_text("body")
        return json.loads(body) if body.strip().startswith(("[", "{")) else None
    except:
        return None


async def get_trending_markets(page, limit=50):
    """Busca mercados mais ativos e com volume"""
    markets = []
    
    # Top markets por volume
    data = await fetch_json(page, f"{GAMMA_API}/markets?_limit={limit}&active=true&closed=false&_order=volume24hr&_sort=desc")
    if data:
        markets.extend(data)
    
    # Markets acabando em breve (urgentes = mais oportunidade)
    data2 = await fetch_json(page, f"{GAMMA_API}/markets?_limit=20&active=true&closed=false&_order=endDate&_sort=asc")
    if data2:
        for m in data2:
            if m.get("slug") not in [x.get("slug") for x in markets]:
                markets.append(m)
    
    return markets


async def analyze_market(page, market):
    """Análise profunda de um mercado"""
    slug = market.get("slug", "")
    question = market.get("question", "")
    outcomes = market.get("outcomePrices", "[]")
    if isinstance(outcomes, str):
        outcomes = json.loads(outcomes)
    
    volume = float(market.get("volume", 0))
    volume_24h = float(market.get("volume24hr", 0))
    liquidity = float(market.get("liquidityNum", market.get("liquidity", 0)))
    end_date = market.get("endDate", "")
    
    yes_price = float(outcomes[0]) if outcomes else 0
    no_price = float(outcomes[1]) if len(outcomes) > 1 else 0
    
    # Calcular métricas
    analysis = {
        "slug": slug,
        "question": question,
        "yes_price": yes_price,
        "no_price": no_price,
        "volume_total": volume,
        "volume_24h": volume_24h,
        "liquidity": liquidity,
        "end_date": end_date,
        "category": market.get("category", ""),
        "timestamp": datetime.now().isoformat(),
    }
    
    # Indicadores de oportunidade
    signals = []
    
    # 1. Preço extremo (< 15% ou > 85%) = mercado quase decidido, pouca oportunidade
    if 0.15 < yes_price < 0.85:
        signals.append("RANGE_BOM")  # Preço no range interessante
    
    # 2. Volume alto = muita atividade = mercado líquido
    if volume_24h > 100000:
        signals.append("VOLUME_ALTO")
    elif volume_24h > 50000:
        signals.append("VOLUME_MEDIO")
    
    # 3. Liquidez boa
    if liquidity > 50000:
        signals.append("LIQUIDEZ_BOA")
    
    # 4. Closing soon (< 7 dias) = resolução próxima
    if end_date:
        try:
            end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            days_left = (end - datetime.now(end.tzinfo)).days
            if 0 < days_left < 7:
                signals.append("CLOSING_SOON")
            if 0 < days_left < 3:
                signals.append("CLOSING_VERY_SOON")
            analysis["days_left"] = days_left
        except:
            pass
    
    # 5. Mispricing potencial: preço YES + NO != 1.00 (spread grande)
    spread = abs(1.0 - yes_price - no_price)
    if spread > 0.02:
        signals.append("SPREAD_ALTO")
    analysis["spread"] = spread
    
    analysis["signals"] = signals
    analysis["signal_count"] = len(signals)
    
    return analysis


async def search_news(page, topic, max_results=5):
    """Busca notícias recentes sobre um tópico"""
    try:
        query = topic.replace(" ", "+")
        url = f"https://news.google.com/search?q={query}&hl=en-US&gl=US&ceid=US:en"
        await page.goto(url, timeout=15000)
        await asyncio.sleep(3)
        
        # Extrair headlines
        articles = await page.query_selector_all("article")
        headlines = []
        for art in articles[:max_results]:
            try:
                text = await art.inner_text()
                lines = text.strip().split("\n")
                if lines:
                    headlines.append(lines[0][:200])
            except:
                pass
        
        return headlines
    except:
        return []


async def calculate_edge(analysis, news_sentiment=0):
    """
    Calcula o 'edge' — diferença entre probabilidade real estimada e preço de mercado.
    
    edge > 0 = mercado subestima (oportunidade de comprar)
    edge < 0 = mercado superestima (oportunidade de vender/shortar)
    """
    signals = analysis.get("signals", [])
    signal_count = len(signals)
    
    # Base edge por sinais
    edge = 0
    
    if "CLOSING_VERY_SOON" in signals:
        edge += 0.05  # Resolução iminente = mais previsível
    if "VOLUME_ALTO" in signals:
        edge += 0.02  # Volume alto = preço mais eficiente (menos edge)
    if "SPREAD_ALTO" in signals:
        edge += 0.03  # Spread alto = ineficiência
    if "RANGE_BOM" in signals:
        edge += 0.02
    
    # News sentiment boost
    edge += news_sentiment * 0.05
    
    analysis["estimated_edge"] = edge
    return edge


async def scan_opportunities(page):
    """Scan completo: busca mercados, analisa, encontra oportunidades"""
    print("🔍 Escaneando mercados Polymarket...\n")
    
    markets = await get_trending_markets(page, limit=50)
    print(f"📊 {len(markets)} mercados encontrados\n")
    
    opportunities = []
    
    for i, market in enumerate(markets):
        analysis = await analyze_market(page, market)
        
        # Filtrar por qualidade
        if analysis["signal_count"] >= 2 and analysis["volume_24h"] > MIN_VOLUME:
            # Buscar notícias pra mercados promissores
            keywords = analysis["question"][:50]
            news = await search_news(page, keywords, 3)
            analysis["news"] = news
            analysis["news_count"] = len(news)
            
            # Calcular edge
            edge = await calculate_edge(analysis)
            
            opportunities.append(analysis)
            
            status = "🟢" if edge >= MIN_EDGE else "🟡"
            print(f"{status} [{i+1}/{len(markets)}] {analysis['question'][:60]}")
            print(f"   YES: {analysis['yes_price']:.0%} | NO: {analysis['no_price']:.0%} | Vol24h: ${analysis['volume_24h']:,.0f}")
            print(f"   Signals: {', '.join(analysis['signals'])} | Edge: {edge:.1%}")
            if news:
                print(f"   📰 {news[0][:80]}")
            print()
    
    # Ordenar por edge
    opportunities.sort(key=lambda x: x.get("estimated_edge", 0), reverse=True)
    
    # Salvar
    output = {
        "scan_time": datetime.now().isoformat(),
        "total_markets": len(markets),
        "opportunities": len(opportunities),
        "top_opportunities": opportunities[:10],
    }
    
    with open(os.path.join(DATA_DIR, "smart-scan-latest.json"), "w") as f:
        json.dump(output, f, indent=2, default=str)
    
    print(f"\n{'='*60}")
    print(f"📊 RESUMO: {len(opportunities)} oportunidades de {len(markets)} mercados")
    print(f"💾 Salvo em data/smart-scan-latest.json")
    
    if opportunities:
        print(f"\n🏆 TOP 5 OPORTUNIDADES:")
        for i, opp in enumerate(opportunities[:5]):
            print(f"\n  {i+1}. {opp['question'][:70]}")
            print(f"     YES: {opp['yes_price']:.0%} | NO: {opp['no_price']:.0%}")
            print(f"     Volume 24h: ${opp['volume_24h']:,.0f} | Edge: {opp.get('estimated_edge',0):.1%}")
            print(f"     Signals: {', '.join(opp['signals'])}")
            if opp.get("days_left"):
                print(f"     ⏰ Resolve em {opp['days_left']} dias")
    
    return opportunities


async def check_portfolio(page):
    """Checa posições atuais"""
    print("💰 Checando portfolio...\n")
    
    data = await fetch_json(page, f"{DATA_API}/positions?user={WALLET}")
    if not data:
        print("❌ Não conseguiu acessar posições")
        return
    
    total_invested = 0
    total_value = 0
    
    for pos in data:
        title = pos.get("title", "?")
        outcome = pos.get("outcome", "?")
        size = float(pos.get("size", 0))
        avg_price = float(pos.get("avgPrice", pos.get("avg_price", 0)))
        cur_price = float(pos.get("curPrice", pos.get("cur_price", 0)))
        
        invested = size * avg_price
        value = size * cur_price
        pnl = value - invested
        
        total_invested += invested
        total_value += value
        
        icon = "🟢" if pnl >= 0 else "🔴"
        print(f"{icon} {title[:50]}")
        print(f"   {outcome} | ${invested:.2f} → ${value:.2f} | P&L: ${pnl:+.2f}")
    
    print(f"\n{'='*50}")
    print(f"💵 Investido: ${total_invested:.2f}")
    print(f"💵 Valor: ${total_value:.2f}")
    print(f"💵 P&L: ${total_value - total_invested:+.2f}")
    print(f"💵 Caixa: ~${44.86 - total_invested:.2f}")


async def monitor_loop(page, interval_min=30):
    """Loop de monitoramento contínuo"""
    print(f"🔄 Monitor iniciado (scan a cada {interval_min}min)")
    print(f"   Ctrl+C pra parar\n")
    
    cycle = 0
    while True:
        cycle += 1
        print(f"\n{'='*60}")
        print(f"🔄 Ciclo {cycle} — {datetime.now().strftime('%H:%M:%S')}")
        print(f"{'='*60}\n")
        
        # Portfolio check
        await check_portfolio(page)
        print()
        
        # Scan de oportunidades
        opps = await scan_opportunities(page)
        
        # Se encontrou oportunidade forte, alertar
        strong = [o for o in opps if o.get("estimated_edge", 0) >= MIN_EDGE]
        if strong:
            print(f"\n🚨 {len(strong)} OPORTUNIDADES FORTES ENCONTRADAS!")
            # TODO: enviar alerta WhatsApp via openclaw
        
        print(f"\n⏳ Próximo scan em {interval_min} minutos...")
        await asyncio.sleep(interval_min * 60)


async def main():
    from playwright.async_api import async_playwright
    
    cmd = sys.argv[1] if len(sys.argv) > 1 else "scan"
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        
        if cmd == "scan":
            await scan_opportunities(page)
        elif cmd == "portfolio":
            await check_portfolio(page)
        elif cmd == "monitor":
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 30
            await monitor_loop(page, interval)
        elif cmd == "analyze":
            slug = sys.argv[2] if len(sys.argv) > 2 else ""
            if not slug:
                print("Uso: smart-trader-v2.py analyze <slug>")
                return
            data = await fetch_json(page, f"{GAMMA_API}/markets?slug={slug}")
            if data:
                analysis = await analyze_market(page, data[0])
                news = await search_news(page, analysis["question"][:50])
                analysis["news"] = news
                print(json.dumps(analysis, indent=2, default=str))
        else:
            print("Uso: smart-trader-v2.py [scan|portfolio|monitor|analyze <slug>]")
        
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
