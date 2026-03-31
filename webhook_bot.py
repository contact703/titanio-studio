#!/usr/bin/env python3
"""
Webhook para Polymarket Bot - Reporta pro WhatsApp
"""

import json
import time
import requests
import os
from datetime import datetime

def send_whatsapp_alert(message):
    """Enviar alerta pro WhatsApp via OpenClaw"""
    try:
        # Usar o sistema de mensagens do OpenClaw
        cmd = f'openclaw message send --channel whatsapp -t "120363405462114071@g.us" -m "{message}"'
        os.system(cmd)
        return True
    except Exception as e:
        print(f"Erro ao enviar WhatsApp: {e}")
        return False

def monitor_and_alert():
    """Monitorar bot e enviar alertas"""
    while True:
        try:
            # Ler dashboard
            with open('dashboard.json', 'r') as f:
                dashboard = json.load(f)
            
            # Verificar se tem trades novos
            trades = dashboard.get('latest_trades', [])
            if len(trades) > 0:
                # Enviar resumo diário
                if datetime.now().hour == 9 and datetime.now().minute == 0:
                    message = f"📊 Resumo Polymarket Bot\n\n🤖 Status: {dashboard['bot_status']['status']}\n💰 Saldo: ${dashboard['balance']['total']}\n📈 Trades hoje: {len(trades)}\n\n#Polymarket #Bot #Trading"
                    send_whatsapp_alert(message)
            
            # Verificar se bot parou
            if dashboard['bot_status']['status'] != 'running':
                message = "🚨 ALERTA: Polymarket Bot PAROU!\n\nVerificar imediatamente!\n#Alerta #Polymarket"
                send_whatsapp_alert(message)
            
            time.sleep(300)  # Verificar a cada 5 minutos
            
        except Exception as e:
            print(f"Erro no monitoramento: {e}")
            time.sleep(60)

if __name__ == "__main__":
    monitor_and_alert()
