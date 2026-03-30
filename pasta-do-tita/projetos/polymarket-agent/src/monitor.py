#!/usr/bin/env python3
"""
👁️ Polymarket Monitor — Roda 24/7, analisa mercados com IA gratuita
Rotaciona entre modelos free do OpenRouter com fallback pra Claude.
Salva oportunidades e gera relatórios periódicos.
"""
import os
import json
import time
import httpx
import requests
from datetime import datetime
from pathlib import Path

# ══════════════════════════════════════
# CONFIG
# ══════════════════════════════════════

GAMMA_URL = "https://gamma-api.polymarket.com"
OUTPUT_DIR = Path(__file__).parent.parent / "data"
OUTPUT_DIR.mkdir(exist_ok=True)

# OpenRouter keys (rotacionar pra não bater rate limit)
OR_KEYS = [
    "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",
    "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",
]

# Modelos gratuitos (atualizado 26/03/2026)
FREE_MODELS = [
    "nvidia/nemotron-nano-9b-v2:free",
    "arcee-ai/trinity-mini:free",
    "stepfun/step-3.5-flash:free",
]

# Claude como fallback (sempre funciona)
ANTHROPIC_KEY = "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"

# Contadores pra rotacionar
_key_idx = 0
_model_idx = 0

# ══════════════════════════════════════
# IA GRATUITA COM FALLBACK
# ══════════════════════════════════════

def ask_ai(prompt: str, max_tokens: int = 500) -> str:
    """Pergunta pra IA gratuita com fallback automático."""
    global _key_idx, _model_idx
    
    # Tentar OpenRouter free (rotacionar modelo e key)
    for attempt in range(len(FREE_MODELS) * len(OR_KEYS)):
        model = FREE_MODELS[_model_idx % len(FREE_MODELS)]
        key = OR_KEYS[_key_idx % len(OR_KEYS)]
        
        try:
            resp = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={"model": model, "messages": [{"role": "user", "content": prompt}], "max_tokens": max_tokens},
                timeout=20
            )
            if resp.status_code == 200:
                text = resp.json()["choices"][0]["message"]["content"]
                if text and text.strip() and text.strip() != "None":
                    return text.strip()
                else:
                    _model_idx += 1
                    continue
            elif resp.status_code == 429:
                _model_idx += 1
                _key_idx += 1
                continue
        except:
            _model_idx += 1
            continue
    
    # Fallback IMEDIATO: Claude (OpenRouter free retorna None quando rate limited)
    try:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={"x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            json={"model": "claude-sonnet-4-20250514", "max_tokens": max_tokens,
                  "messages": [{"role": "user", "content": prompt}]},
            timeout=30
        )
        if resp.status_code == 200:
            return resp.json()["content"][0]["text"].strip()
    except:
        pass
    
    return "ERRO: Nenhuma IA disponível"


# ══════════════════════════════════════
# MARKET DATA
# ══════════════════════════════════════

def fetch_markets(limit=50):
    """Busca mercados ativos com volume."""
    resp = httpx.get(f"{GAMMA_URL}/markets", params={
        "limit": limit, "active": "true", "closed": "false",
        "order": "volume", "ascending": "false"
    }, timeout=15)
    return resp.json()

def fetch_events(limit=20):
    """Busca eventos ativos."""
    resp = httpx.get(f"{GAMMA_URL}/events", params={
        "limit": limit, "order": "volume", "ascending": "false",
        "active": "true", "closed": "false"
    }, timeout=15)
    return resp.json()

def parse_odds(market):
    """Extrai odds de um mercado."""
    prices = market.get('outcomePrices', '[]')
    if isinstance(prices, str):
        try: prices = json.loads(prices)
        except: return None, None
    if len(prices) >= 2:
        return float(prices[0]), float(prices[1])
    return None, None


# ══════════════════════════════════════
# ANÁLISE COM IA
# ══════════════════════════════════════

def analyze_opportunity(market):
    """Pede pra IA analisar uma oportunidade específica."""
    question = market.get('question', '?')
    yes, no = parse_odds(market)
    volume = float(market.get('volume', 0) or 0)
    
    prompt = f"""Analise esta oportunidade no Polymarket (mercado de previsões):

Pergunta: {question}
Odds: YES={yes:.0%}, NO={no:.0%}
Volume: ${volume:,.0f}

Responda em JSON:
{{"confianca": 0-100, "direcao": "YES" ou "NO", "razao": "motivo curto", "risco": "baixo/medio/alto"}}

Baseie-se em conhecimento atual de eventos mundiais."""

    response = ask_ai(prompt, 200)
    try:
        # Extrair JSON da resposta
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0]
        elif "```" in response:
            response = response.split("```")[1].split("```")[0]
        return json.loads(response)
    except:
        return {"confianca": 0, "direcao": "HOLD", "razao": response[:100], "risco": "desconhecido"}


# ══════════════════════════════════════
# MONITOR PRINCIPAL
# ══════════════════════════════════════

def run_scan():
    """Executa um scan completo."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    print(f"\n👁️ SCAN — {timestamp}")
    print("-" * 50)
    
    # Buscar mercados
    markets = fetch_markets(30)
    
    # Filtrar oportunidades (odds 25-75%, volume > $1000)
    opportunities = []
    for m in markets:
        yes, no = parse_odds(m)
        if yes is None: continue
        vol = float(m.get('volume', 0) or 0)
        if 0.25 <= yes <= 0.75 and vol >= 1000:
            opportunities.append(m)
    
    print(f"📊 {len(markets)} mercados | {len(opportunities)} oportunidades")
    
    # Analisar top 3 oportunidades com IA
    analyses = []
    for opp in opportunities[:3]:
        yes, no = parse_odds(opp)
        analysis = analyze_opportunity(opp)
        result = {
            "question": opp.get('question', '?'),
            "yes": yes, "no": no,
            "volume": float(opp.get('volume', 0) or 0),
            "analysis": analysis,
            "timestamp": timestamp,
            "condition_id": opp.get('conditionId', '')
        }
        analyses.append(result)
        
        conf = analysis.get('confianca', 0)
        direcao = analysis.get('direcao', '?')
        razao = analysis.get('razao', '?')[:60]
        
        emoji = "🟢" if conf >= 70 else "🟡" if conf >= 50 else "🔴"
        print(f"  {emoji} [{conf}%] {direcao} — {opp.get('question','?')[:50]}")
        print(f"     {razao}")
    
    # Salvar histórico
    history_file = OUTPUT_DIR / "scan_history.jsonl"
    with open(history_file, "a") as f:
        for a in analyses:
            f.write(json.dumps(a, ensure_ascii=False) + "\n")
    
    # Salvar snapshot atual
    snapshot = {
        "timestamp": timestamp,
        "markets_total": len(markets),
        "opportunities": len(opportunities),
        "analyses": analyses,
        "top_events": []
    }
    
    # Top events
    try:
        events = fetch_events(10)
        for e in events[:5]:
            snapshot["top_events"].append({
                "title": e.get('title', '?'),
                "volume": float(e.get('volume', 0) or 0)
            })
    except:
        pass
    
    with open(OUTPUT_DIR / "latest_scan.json", "w") as f:
        json.dump(snapshot, f, ensure_ascii=False, indent=2)
    
    return snapshot


def run_continuous(interval_minutes=10):
    """Roda monitor continuamente."""
    print("👁️ POLYMARKET MONITOR — INICIANDO")
    print(f"   Intervalo: {interval_minutes} min")
    print(f"   Modelos: {', '.join(FREE_MODELS)}")
    print(f"   Fallback: Claude")
    print(f"   Output: {OUTPUT_DIR}")
    print("=" * 50)
    
    scan_count = 0
    while True:
        try:
            scan_count += 1
            print(f"\n[Scan #{scan_count}]")
            snapshot = run_scan()
            
            # A cada 6 scans (1h), gerar relatório
            if scan_count % 6 == 0:
                generate_hourly_report(snapshot)
            
        except Exception as e:
            print(f"❌ Erro no scan: {e}")
        
        print(f"   ⏰ Próximo scan em {interval_minutes} min...")
        time.sleep(interval_minutes * 60)


def generate_hourly_report(snapshot):
    """Gera relatório horário."""
    # Ler histórico
    history_file = OUTPUT_DIR / "scan_history.jsonl"
    analyses = []
    if history_file.exists():
        with open(history_file) as f:
            for line in f:
                try: analyses.append(json.loads(line))
                except: pass
    
    # Últimas 6 análises (1h)
    recent = analyses[-18:]  # 3 por scan * 6 scans
    
    # Encontrar padrões
    high_confidence = [a for a in recent if a.get('analysis', {}).get('confianca', 0) >= 70]
    
    report = f"""📊 RELATÓRIO HORÁRIO — {datetime.now().strftime('%H:%M')}
Scans: {len(recent)//3} | Análises: {len(recent)} | Alta confiança: {len(high_confidence)}
"""
    for hc in high_confidence:
        a = hc.get('analysis', {})
        report += f"\n🟢 [{a.get('confianca')}%] {a.get('direcao')} — {hc.get('question','?')[:50]}"
        report += f"\n   Razão: {a.get('razao','?')[:80]}"
    
    print(report)
    
    # Salvar relatório
    with open(OUTPUT_DIR / f"report_{datetime.now().strftime('%Y%m%d_%H')}.md", "w") as f:
        f.write(report)


if __name__ == "__main__":
    import sys
    if "--once" in sys.argv:
        run_scan()
    else:
        interval = int(sys.argv[1]) if len(sys.argv) > 1 else 10
        run_continuous(interval)
