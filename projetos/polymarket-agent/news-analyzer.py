#!/usr/bin/env python3
"""
News Analyzer — Análise de notícias com IA pra Polymarket
==========================================================
Busca notícias, analisa sentimento, calcula edge real.
Usa Ollama local (custo zero) pra análise.
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from playwright.async_api import async_playwright

WORKSPACE = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
DATA_DIR = f"{WORKSPACE}/projetos/polymarket-agent/data"


async def scrape_news(page, topic, max_results=8):
    """Busca notícias recentes sobre um tópico"""
    headlines = []
    try:
        query = topic.replace(" ", "+")
        await page.goto(f"https://news.google.com/search?q={query}&hl=en-US&gl=US&ceid=US:en", timeout=20000)
        await asyncio.sleep(3)
        articles = await page.query_selector_all("article")
        for art in articles[:max_results]:
            try:
                text = await art.inner_text()
                lines = [l.strip() for l in text.strip().split("\n") if l.strip() and len(l.strip()) > 15]
                if lines:
                    headlines.append(lines[0][:200])
            except:
                pass
    except:
        pass
    return headlines


async def scrape_reddit(page, topic, max_results=5):
    """Busca discussões no Reddit"""
    posts = []
    try:
        query = topic.replace(" ", "+")
        await page.goto(f"https://www.reddit.com/search.json?q={query}&sort=new&limit={max_results}", timeout=15000)
        await asyncio.sleep(2)
        body = await page.inner_text("body")
        data = json.loads(body)
        for child in data.get("data", {}).get("children", [])[:max_results]:
            post = child.get("data", {})
            title = post.get("title", "")
            score = post.get("score", 0)
            if title:
                posts.append({"title": title[:150], "score": score})
    except:
        pass
    return posts


def analyze_with_ollama(market_question, news, reddit_posts, current_yes_price):
    """Usa Ollama local pra analisar e dar recomendação"""
    import subprocess
    
    news_text = "\n".join(f"- {h}" for h in news[:6]) if news else "Nenhuma notícia encontrada"
    reddit_text = "\n".join(f"- {p}" for p in reddit_posts[:4]) if reddit_posts else "Nenhuma discussão encontrada"
    
    prompt = f"""Analise este mercado de previsão e dê uma recomendação de trade.

MERCADO: {market_question}
PREÇO ATUAL YES: {current_yes_price:.0%}
PREÇO ATUAL NO: {1-current_yes_price:.0%}

NOTÍCIAS RECENTES:
{news_text}

DISCUSSÕES REDDIT:
{reddit_text}

Responda EXATAMENTE neste formato JSON:
{{
  "probabilidade_real": 0.XX,
  "confianca": "alta|media|baixa",
  "posicao": "YES|NO|SKIP",
  "edge": 0.XX,
  "razao": "explicação em 1 linha",
  "risco": "alto|medio|baixo"
}}

Regras:
- probabilidade_real = sua estimativa real da probabilidade (0.0 a 1.0)
- edge = diferença entre sua estimativa e o preço do mercado (se positivo = oportunidade)
- SKIP se edge < 0.10 ou confiança baixa
- Seja honesto, não force trades"""

    try:
        result = subprocess.run(
            ["ollama", "run", "qwen2.5:7b", prompt],
            capture_output=True, text=True, timeout=60
        )
        output = result.stdout.strip()
        
        # Extrair JSON da resposta
        json_start = output.find("{")
        json_end = output.rfind("}") + 1
        if json_start >= 0 and json_end > json_start:
            analysis = json.loads(output[json_start:json_end])
            return analysis
    except Exception as e:
        print(f"  ⚠️ Ollama erro: {e}")
    
    return {"posicao": "SKIP", "razao": "Análise falhou", "edge": 0, "confianca": "baixa"}


async def analyze_market_full(page, market):
    """Análise completa de um mercado: news + reddit + IA"""
    question = market.get("question", "")
    outcomes = market.get("outcomePrices", "[]")
    if isinstance(outcomes, str):
        outcomes = json.loads(outcomes)
    yes_price = float(outcomes[0]) if outcomes else 0.5
    
    print(f"\n{'='*60}")
    print(f"📊 {question}")
    print(f"   YES: {yes_price:.0%} | NO: {1-yes_price:.0%}")
    
    # 1. Buscar notícias
    keywords = question[:60].replace("?", "").replace("Will ", "")
    print(f"   📰 Buscando notícias: '{keywords}'...")
    news = await scrape_news(page, keywords)
    print(f"   📰 {len(news)} notícias encontradas")
    for n in news[:3]:
        print(f"      • {n[:80]}")
    
    # 2. Reddit
    print(f"   💬 Buscando Reddit...")
    reddit = await scrape_reddit(page, keywords)
    print(f"   💬 {len(reddit)} posts encontrados")
    
    # 3. Análise com IA
    print(f"   🤖 Analisando com Ollama...")
    reddit_titles = []
    if reddit:
        for p in reddit:
            if isinstance(p, dict):
                reddit_titles.append(p.get("title", str(p)))
            else:
                reddit_titles.append(str(p))
    analysis = analyze_with_ollama(question, news, reddit_titles, yes_price)
    
    edge = analysis.get("edge", 0)
    position = analysis.get("posicao", "SKIP")
    confidence = analysis.get("confianca", "baixa")
    reason = analysis.get("razao", "?")
    prob = analysis.get("probabilidade_real", yes_price)
    
    icon = "🟢" if position != "SKIP" and abs(edge) >= 0.10 else "🟡" if position != "SKIP" else "⚪"
    print(f"\n   {icon} RECOMENDAÇÃO: {position}")
    print(f"   📊 Prob real: {prob:.0%} vs mercado {yes_price:.0%} | Edge: {edge:+.0%}")
    print(f"   🎯 Confiança: {confidence} | Razão: {reason}")
    
    return {
        "question": question,
        "slug": market.get("slug", ""),
        "yes_price": yes_price,
        "analysis": analysis,
        "news_count": len(news),
        "reddit_count": len(reddit),
        "news": news[:5],
        "timestamp": datetime.now().isoformat()
    }


async def full_analysis():
    """Análise completa de todos os mercados interessantes"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
        
        print("🔍 Smart Trader v2 — Análise Completa com IA\n")
        
        # Buscar mercados
        await page.goto("https://gamma-api.polymarket.com/markets?_limit=30&active=true&closed=false", timeout=20000)
        await asyncio.sleep(2)
        body = await page.inner_text("body")
        markets = json.loads(body)
        
        # Filtrar interessantes
        interesting = []
        for m in markets:
            outcomes = m.get("outcomePrices", "[]")
            if isinstance(outcomes, str):
                outcomes = json.loads(outcomes)
            yes = float(outcomes[0]) if outcomes else 0
            liq = float(m.get("liquidityNum", m.get("liquidity", 0)))
            if 0.15 < yes < 0.85 and liq > 5000:
                interesting.append(m)
        
        print(f"📊 {len(interesting)} mercados interessantes de {len(markets)}\n")
        
        # Analisar cada um
        results = []
        for m in interesting[:8]:  # Max 8 pra não demorar demais
            result = await analyze_market_full(page, m)
            results.append(result)
        
        # Resumo
        trades = [r for r in results if r["analysis"].get("posicao") != "SKIP"]
        
        print(f"\n{'='*60}")
        print(f"🏆 RESUMO: {len(trades)} trades recomendados de {len(results)} analisados\n")
        
        for t in trades:
            a = t["analysis"]
            print(f"  {'🟢' if abs(a.get('edge',0)) >= 0.15 else '🟡'} {t['question'][:55]}")
            print(f"     {a['posicao']} | Edge: {a.get('edge',0):+.0%} | Confiança: {a.get('confianca','?')}")
            print()
        
        # Salvar
        output = {
            "timestamp": datetime.now().isoformat(),
            "markets_scanned": len(markets),
            "analyzed": len(results),
            "recommended_trades": len(trades),
            "results": results
        }
        with open(f"{DATA_DIR}/smart-analysis-latest.json", "w") as f:
            json.dump(output, f, indent=2, default=str)
        
        print(f"💾 Salvo em data/smart-analysis-latest.json")
        
        await browser.close()
        return results


if __name__ == "__main__":
    asyncio.run(full_analysis())
