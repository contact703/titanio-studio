#!/usr/bin/env python3
"""
Monitoramento em Tempo Real - Dashboard Atualizada
"""

import json
import time
import os
import psutil
from datetime import datetime

def update_dashboard_realtime():
    """Atualizar dashboard com dados em tempo real"""
    while True:
        try:
            # Status do bot
            bot_running = False
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if 'polymarket_trader.py' in str(proc.info['cmdline']):
                        bot_running = True
                        break
                except:
                    pass
            
            # Status do drive
            drive_status = "error"
            drive_space = {"total_gb": 0, "used_gb": 0, "percentage": 0}
            try:
                stat = os.statvfs("/Volumes/TITA_039")
                total = stat.f_blocks * stat.f_frsize
                free = stat.f_bavail * stat.f_frsize
                used = total - free
                drive_status = "mounted"
                drive_space = {
                    "total_gb": round(total / (1024**3), 1),
                    "used_gb": round(used / (1024**3), 1),
                    "percentage": round((used / total) * 100, 1)
                }
            except:
                pass
            
            # Criar dashboard atualizada
            dashboard = {
                "timestamp": datetime.now().isoformat(),
                "status": "operational",
                "bot_status": {
                    "status": "running" if bot_running else "stopped",
                    "pid": next((p.pid for p in psutil.process_iter() if 'polymarket_trader.py' in str(p.info.get('cmdline', ''))), None),
                    "uptime": "active"
                },
                "drive_status": {
                    "status": drive_status,
                    "space": drive_space,
                    "network_access": "smb://192.168.18.174/TITA_039"
                },
                "services": [
                    "Polymarket Bot - Active monitoring",
                    "Drive Integration - Network accessible",
                    "Memory System - 24/7 operation",
                    "Network Discovery - Active scanning",
                    "Real-time Monitoring - Updated every 30s"
                ],
                "last_update": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "message": "Sistema operacional - aguardando oportunidades de trade"
            }
            
            # Salvar dashboard
            with open("/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/dashboard.json", "w") as f:
                json.dump(dashboard, f, indent=2)
            
            print(f"🔄 Dashboard atualizada: {dashboard['last_update']} - Bot: {dashboard['bot_status']['status']}")
            
            time.sleep(30)  # Atualiza a cada 30 segundos
            
        except Exception as e:
            print(f"❌ Erro no monitoramento: {e}")
            time.sleep(30)

if __name__ == "__main__":
    print("🚀 Iniciando monitoramento em tempo real...")
    update_dashboard_realtime()
