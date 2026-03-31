#!/usr/bin/env python3
"""
Diagnóstico completo do Polymarket Bot
"""

import subprocess
import os
import time
import psutil
from datetime import datetime

def diagnose_system():
    print("="*60)
    print("🔍 DIAGNÓSTICO COMPLETO DO BOT")
    print("="*60)
    print(f"Hora: {datetime.now()}")
    print()
    
    # Verificar se processo existe
    python_processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
        try:
            if 'polymarket_trader.py' in str(proc.info['cmdline']):
                python_processes.append({
                    "pid": proc.info['pid'],
                    "cmdline": str(proc.info['cmdline']),
                    "status": proc.status(),
                    "cpu": proc.cpu_percent(),
                    "memory": proc.memory_info().rss / 1024 / 1024,  # MB
                    "create_time": datetime.fromtimestamp(proc.create_time()).isoformat()
                })
        except:
            pass
    
    print(f"📊 Processos Python encontrados: {len(python_processes)}")
    for proc in python_processes:
        print(f"   PID: {proc['pid']}")
        print(f"   Status: {proc['status']}")
        print(f"   CPU: {proc['cpu']}%")
        print(f"   Memória: {proc['memory']:.1f}MB")
        print()
    
    # Verificar arquivos e permissões
    bot_path = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-bot"
    print(f"📁 Verificando arquivos em: {bot_path}")
    
    try:
        for item in os.listdir(bot_path):
            item_path = os.path.join(bot_path, item)
            if os.path.isfile(item_path):
                stat = os.stat(item_path)
                print(f"   📄 {item} - {stat.st_size} bytes - Perm: {oct(stat.st_mode)[-3:]}")
    except Exception as e:
        print(f"   ❌ Erro ao listar: {e}")
    
    # Verificar logs
    log_files = ["bot.log", "bot-error.log", "webhook.log"]
    print("\n📋 Logs recentes:")
    for log_file in log_files:
        log_path = os.path.join(bot_path, log_file)
        if os.path.exists(log_path):
            try:
                with open(log_path, 'r') as f:
                    lines = f.readlines()
                    if lines:
                        print(f"   📄 {log_file} - {len(lines)} linhas")
                        for line in lines[-5:]:
                            print(f"      {line.strip()}")
                    else:
                        print(f"   📄 {log_file} - vazio")
            except Exception as e:
                print(f"   ❌ Erro ao ler {log_file}: {e}")
        else:
            print(f"   📄 {log_file} - não existe")
    
    # Testar execução direta
    print("\n🧪 Testando execução direta...")
    try:
        result = subprocess.run(
            ["/opt/homebrew/bin/python3", "-c", 
             "import sys; print('Python OK'); sys.exit(0)"],
            cwd=bot_path,
            capture_output=True,
            text=True,
            timeout=10
        )
        print(f"   Python test: {result.returncode} - {result.stdout.strip()}")
    except Exception as e:
        print(f"   ❌ Erro ao testar Python: {e}")
    
    print("\n" + "="*60)
    print("✅ DIAGNÓSTICO COMPLETO!")
    print("="*60)

if __name__ == "__main__":
    diagnose_system()
