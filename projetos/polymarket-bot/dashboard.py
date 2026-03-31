#!/usr/bin/env python3
"""
Polymarket Bot Dashboard - Monitoramento em tempo real
"""

import json
import time
import os
from datetime import datetime

def get_bot_status():
    """Verificar status do bot"""
    try:
        # Verificar se processo está rodando
        import psutil
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            if 'polymarket_trader.py' in str(proc.info['cmdline']):
                return {
                    "status": "running",
                    "pid": proc.info['pid'],
                    "uptime": time.time() - proc.create_time()
                }
    except:
        pass
    
    return {"status": "stopped", "pid": None, "uptime": 0}

def get_latest_trades():
    """Pegar últimos trades do log"""
    trades = []
    try:
        with open('bot.log', 'r') as f:
            lines = f.readlines()
            for line in reversed(lines[-50:]):  # Últimas 50 linhas
                if "TRADE EXECUTADO" in line:
                    trades.append({
                        "timestamp": line.split("🚀")[0].strip(),
                        "line": line.strip()
                    })
    except:
        pass
    return trades[-5:]  # Últimos 5 trades

def get_balance_info():
    """Pegar info de balance (mock por enquanto)"""
    return {
        "total": 44.86,  # Valor do histórico
        "today_change": 0.0,
        "currency": "USD"
    }

def generate_dashboard():
    """Gerar dashboard completo"""
    status = get_bot_status()
    trades = get_latest_trades()
    balance = get_balance_info()
    
    dashboard = {
        "timestamp": datetime.now().isoformat(),
        "bot_status": status,
        "balance": balance,
        "latest_trades": trades,
        "markets_monitored": [
            "US forces enter Iran by...?",
            "2026 NCAA Tournament Winner", 
            "Bitcoin 5 min up or down"
        ],
        "strategy": "Day-trade/scalping com análises atualizadas",
        "last_update": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Salvar dashboard
    with open('dashboard.json', 'w') as f:
        json.dump(dashboard, f, indent=2)
    
    return dashboard

if __name__ == "__main__":
    dashboard = generate_dashboard()
    print("🎯 Dashboard do Polymarket Bot:")
    print(f"   Status: {dashboard['bot_status']['status']}")
    print(f"   PID: {dashboard['bot_status']['pid'] or 'N/A'}")
    print(f"   Saldo: ${dashboard['balance']['total']}")
    print(f"   Últimos trades: {len(dashboard['latest_trades'])}")
    print(f"   Dashboard salvo em: dashboard.json")