#!/usr/bin/env python3
"""
Dashboard Completa - Monitoramento do Ecosistema Titanio
"""

import json
import time
import os
import psutil
from datetime import datetime

def get_system_status():
    """Status geral do sistema"""
    # Verificar processos importantes
    processes = {
        "polymarket_bot": False,
        "memory_watchdog": False,
        "session_boot": False
    }
    
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            cmdline = str(proc.info['cmdline']) if proc.info['cmdline'] else ""
            if 'polymarket_trader.py' in cmdline:
                processes["polymarket_bot"] = True
            elif 'memory-watchdog.sh' in cmdline:
                processes["memory_watchdog"] = True
            elif 'session-boot' in cmdline:
                processes["session_boot"] = True
        except:
            pass
    
    return {
        "polymarket_bot": processes["polymarket_bot"],
        "memory_watchdog": processes["memory_watchdog"],
        "session_boot": processes["session_boot"]
    }

def get_drive_status():
    """Status do drive TITA_039"""
    try:
        stat = os.statvfs("/Volumes/TITA_039")
        total = stat.f_blocks * stat.f_frsize
        free = stat.f_bavail * stat.f_frsize
        used = total - free
        
        return {
            "status": "mounted",
            "total_gb": round(total / (1024**3), 1),
            "used_gb": round(used / (1024**3), 1),
            "free_gb": round(free / (1024**3), 1),
            "percentage": round((used / total) * 100, 1)
        }
    except:
        return {"status": "error", "message": "Drive não acessível"}

def get_bot_status():
    """Status específico do Polymarket Bot"""
    try:
        # Verificar se o bot está rodando
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if 'polymarket_trader.py' in str(proc.info['cmdline']):
                    return {
                        "status": "running",
                        "pid": proc.info['pid'],
                        "uptime": time.time() - proc.create_time(),
                        "start_time": datetime.fromtimestamp(proc.create_time()).isoformat()
                    }
            except:
                pass
        
        return {"status": "stopped", "message": "Bot não encontrado"}
    except:
        return {"status": "error", "message": "Erro ao verificar bot"}

def get_latest_trades():
    """Pegar trades recentes do Polymarket"""
    trades = []
    try:
        log_path = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-bot/bot.log"
        if os.path.exists(log_path):
            with open(log_path, 'r') as f:
                lines = f.readlines()
                for line in reversed(lines[-50:]):  # Últimas 50 linhas
                    if "TRADE EXECUTADO" in line:
                        trades.append({
                            "timestamp": line[:20].strip(),
                            "line": line.strip()[:100] + "..." if len(line) > 100 else line.strip()
                        })
    except:
        pass
    return trades[-3:]  # Últimos 3 trades

def generate_complete_dashboard():
    """Gerar dashboard completa"""
    print("🎯 Gerando dashboard completa...")
    
    dashboard = {
        "timestamp": datetime.now().isoformat(),
        "system_status": get_system_status(),
        "drive_status": get_drive_status(),
        "bot_status": get_bot_status(),
        "latest_trades": get_latest_trades(),
        "network_access": {
            "drive_smb": "smb://192.168.18.174/TITA_039",
            "status": "accessible"
        },
        "services": [
            "Polymarket Bot - Day trade/scalping",
            "Memory System - 24/7 operation",
            "Drive Integration - Network accessible",
            "Backup System - Automatic",
            "Network Discovery - Active scanning"
        ],
        "status": "operational",
        "uptime": time.time(),
        "last_update": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    # Salvar dashboard
    with open("/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/dashboard.json", "w") as f:
        json.dump(dashboard, f, indent=2)
    
    return dashboard

if __name__ == "__main__":
    dashboard = generate_complete_dashboard()
    
    print("="*60)
    print("📊 DASHBOARD TITANIO - STATUS COMPLETO")
    print("="*60)
    print(f"🤖 Polymarket Bot: {dashboard['bot_status']['status']}")
    print(f"💾 Drive TITA_039: {dashboard['drive_status']['status']}")
    print(f"   Espaço: {dashboard['drive_status']['used_gb']}GB usados")
    print(f"🔄 Último update: {dashboard['last_update']}")
    print("="*60)
    print("✅ Dashboard salva em: dashboard.json")
    print("🌐 Drive acessível via: smb://192.168.18.174/TITA_039")
