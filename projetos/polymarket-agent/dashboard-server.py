#!/usr/bin/env python3
"""
dashboard-server.py - Dashboard web para monitoramento do Polymarket Bot
Servidor Flask simples com dados em tempo real
"""

import os
import json
import time
import threading
from datetime import datetime, timedelta
from pathlib import Path
from flask import Flask, render_template, jsonify, request
import logging

# Configurações
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / "data"
LOG_FILE = DATA_DIR / "monitor.log"
HISTORY_FILE = DATA_DIR / "scan_history.jsonl"
SCAN_FILE = DATA_DIR / "latest_scan.json"

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

# Desativar logs do Flask
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

def read_last_lines(filepath, n=100):
    """Lê as últimas n linhas de um arquivo"""
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
            return lines[-n:] if len(lines) > n else lines
    except FileNotFoundError:
        return []

def parse_monitor_log():
    """Parse do log do monitor para extrair dados úteis"""
    lines = read_last_lines(LOG_FILE, 50)
    trades = []
    errors = []
    status = "unknown"
    last_update = None
    
    for line in reversed(lines):
        line = line.strip()
        if not line:
            continue
            
        # Detectar trades
        if "TRADE:" in line or "compra" in line.lower() or "venda" in line.lower():
            trades.append({
                "time": line.split("]")[0].replace("[", ""),
                "message": line.split("TRADE:")[-1].strip() if "TRADE:" in line else line
            })
        
        # Detectar erros
        if "ERROR" in line or "Exception" in line or "falha" in line.lower():
            errors.append({
                "time": line.split("]")[0].replace("[", ""),
                "message": line
            })
        
        # Detectar status
        if "Monitor saudável" in line:
            status = "healthy"
        elif "Monitor terminou" in line:
            status = "stopped"
        elif "Iniciando monitor" in line:
            status = "starting"
        
        # Última atualização
        if not last_update and "]" in line:
            try:
                time_str = line.split("]")[0].replace("[", "")
                last_update = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")
            except:
                pass
    
    return {
        "trades": trades[:5],  # Últimas 5 trades
        "errors": errors[:5],  # Últimos 5 erros
        "status": status,
        "last_update": last_update.isoformat() if last_update else None,
        "total_trades": len(trades)
    }

def get_scan_data():
    """Obtém dados do último scan"""
    try:
        if SCAN_FILE.exists():
            with open(SCAN_FILE, 'r') as f:
                data = json.load(f)
                return {
                    "markets_found": len(data.get("markets", [])),
                    "top_opportunities": data.get("top_markets", [])[:3],
                    "scan_time": data.get("scan_time"),
                    "confidence": data.get("confidence", 0)
                }
    except Exception as e:
        return {"error": str(e)}
    
    return {"markets_found": 0, "top_opportunities": [], "scan_time": None}

def get_balance_info():
    """Obtém informações de saldo (se disponível)"""
    try:
        # Procurar por informações de saldo no log
        lines = read_last_lines(LOG_FILE, 200)
        for line in reversed(lines):
            if "saldo" in line.lower() or "balance" in line.lower():
                return {"last_balance": line.strip()}
    except:
        pass
    
    return {"last_balance": "Indisponível"}

@app.route('/')
def dashboard():
    """Dashboard principal"""
    return render_template('dashboard.html')

@app.route('/api/status')
def api_status():
    """API de status em JSON"""
    monitor_data = parse_monitor_log()
    scan_data = get_scan_data()
    balance_data = get_balance_info()
    
    # Verificar se o monitor está rodando
    pid_file = DATA_DIR / "monitor.pid"
    monitor_running = pid_file.exists() and pid_file.read_text().strip().isdigit()
    
    return jsonify({
        "monitor": monitor_data,
        "scan": scan_data,
        "balance": balance_data,
        "system": {
            "monitor_running": monitor_running,
            "dashboard_uptime": time.time(),
            "data_dir": str(DATA_DIR)
        }
    })

@app.route('/api/logs')
def api_logs():
    """API para obter logs recentes"""
    n = request.args.get('n', 100, type=int)
    logs = read_last_lines(LOG_FILE, n)
    return jsonify({"logs": logs})

@app.route('/api/trades')
def api_trades():
    """API para obter histórico de trades"""
    try:
        trades = []
        if HISTORY_FILE.exists():
            with open(HISTORY_FILE, 'r') as f:
                for line in f:
                    try:
                        data = json.loads(line)
                        if "trades" in data:
                            trades.extend(data["trades"])
                    except:
                        continue
        
        # Ordenar por data (mais recente primeiro)
        trades = sorted(trades, key=lambda x: x.get("time", ""), reverse=True)
        return jsonify({"trades": trades[:20]})  # Últimas 20 trades
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/control', methods=['POST'])
def api_control():
    """API para controlar o bot"""
    action = request.json.get('action', '')
    script_dir = Path(__file__).parent
    
    if action == 'restart':
        os.system(f"bash {script_dir}/polymarket-control.sh restart")
        return jsonify({"message": "Bot reiniciado"})
    elif action == 'stop':
        os.system(f"bash {script_dir}/polymarket-control.sh stop")
        return jsonify({"message": "Bot parado"})
    elif action == 'start':
        os.system(f"bash {script_dir}/polymarket-control.sh start")
        return jsonify({"message": "Bot iniciado"})
    else:
        return jsonify({"error": "Ação inválida"}), 400

# Criar template HTML
TEMPLATE_DIR = SCRIPT_DIR / "templates"
TEMPLATE_DIR.mkdir(exist_ok=True)

dashboard_html = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Polymarket Bot Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            background: #0a0a0a; 
            color: #e0e0e0; 
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            padding: 30px; 
            border-radius: 15px; 
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .status-card {
            background: #1a1a1a;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 20px;
            border: 1px solid #333;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-healthy { background: #4CAF50; }
        .status-warning { background: #FFC107; }
        .status-error { background: #f44336; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .trade-item {
            background: #2a2a2a;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border-left: 4px solid #667eea;
        }
        .controls {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn-primary { background: #667eea; color: white; }
        .btn-danger { background: #f44336; color: white; }
        .btn-success { background: #4CAF50; color: white; }
        .btn:hover { transform: translateY(-2px); }
        .log-container {
            background: #1a1a1a;
            padding: 20px;
            border-radius: 8px;
            max-height: 400px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #333;
        }
        .loading { text-align: center; padding: 40px; }
        .error { color: #f44336; }
        .success { color: #4CAF50; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 Polymarket Bot Dashboard</h1>
            <p>Monitoramento em tempo real do bot de trading</p>
        </div>

        <div class="controls">
            <button class="btn btn-primary" onclick="refreshData()">🔄 Atualizar</button>
            <button class="btn btn-success" onclick="controlBot('start')">▶️ Iniciar</button>
            <button class="btn btn-danger" onclick="controlBot('stop')">⏹️ Parar</button>
            <button class="btn btn-primary" onclick="controlBot('restart')">🔄 Reiniciar</button>
        </div>

        <div class="grid">
            <div class="status-card">
                <h3>📊 Status do Sistema</h3>
                <div id="system-status">
                    <div class="loading">Carregando...</div>
                </div>
            </div>

            <div class="status-card">
                <h3>💰 Últimas Trades</h3>
                <div id="recent-trades">
                    <div class="loading">Carregando...</div>
                </div>
            </div>

            <div class="status-card">
                <h3>📈 Oportunidades</h3>
                <div id="opportunities">
                    <div class="loading">Carregando...</div>
                </div>
            </div>

            <div class="status-card">
                <h3>⚠️ Erros Recentes</h3>
                <div id="recent-errors">
                    <div class="loading">Carregando...</div>
                </div>
            </div>
        </div>

        <div class="status-card">
            <h3>📝 Logs em Tempo Real</h3>
            <div id="logs" class="log-container">
                <div class="loading">Carregando logs...</div>
            </div>
        </div>
    </div>

    <script>
        let refreshInterval;

        function getStatusColor(status) {
            switch(status) {
                case 'healthy': return 'status-healthy';
                case 'starting': return 'status-warning';
                case 'stopped': return 'status-error';
                default: return 'status-warning';
            }
        }

        function formatTime(timeStr) {
            if (!timeStr) return 'N/A';
            try {
                return new Date(timeStr).toLocaleString('pt-BR');
            } catch {
                return timeStr;
            }
        }

        function renderSystemStatus(data) {
            const system = data.system;
            const monitor = data.monitor;
            
            const statusClass = getStatusColor(monitor.status);
            const statusText = monitor.status === 'healthy' ? 'Operacional' : 
                             monitor.status === 'starting' ? 'Iniciando' : 'Parado';

            return `
                <div class="metric">
                    <span>Status do Monitor:</span>
                    <span><span class="status-indicator ${statusClass}"></span>${statusText}</span>
                </div>
                <div class="metric">
                    <span>Última Atualização:</span>
                    <span>${formatTime(monitor.last_update)}</span>
                </div>
                <div class="metric">
                    <span>Total de Trades:</span>
                    <span class="success">${monitor.total_trades}</span>
                </div>
                <div class="metric">
                    <span>Markets Encontrados:</span>
                    <span>${data.scan.markets_found || 0}</span>
                </div>
            `;
        }

        function renderTrades(trades) {
            if (!trades || trades.length === 0) {
                return '<p class="error">Nenhuma trade recente</p>';
            }
            
            return trades.map(trade => `
                <div class="trade-item">
                    <strong>${formatTime(trade.time)}</strong><br>
                    ${trade.message}
                </div>
            `).join('');
        }

        function renderOpportunities(data) {
            const opportunities = data.scan.top_opportunities || [];
            
            if (opportunities.length === 0) {
                return '<p class="error">Nenhuma oportunidade encontrada</p>';
            }
            
            return opportunities.map(opp => `
                <div class="trade-item">
                    <strong>${opp.question || 'Market'}</strong><br>
                    Confiança: <span class="success">${opp.confidence || 0}%</span><br>
                    Preço: ${opp.price || 'N/A'}
                </div>
            `).join('');
        }

        function renderErrors(errors) {
            if (!errors || errors.length === 0) {
                return '<p class="success">Nenhum erro recente</p>';
            }
            
            return errors.map(error => `
                <div class="trade-item" style="border-left-color: #f44336;">
                    <strong>${formatTime(error.time)}</strong><br>
                    <span class="error">${error.message}</span>
                </div>
            `).join('');
        }

        function renderLogs(logs) {
            if (!logs || logs.length === 0) {
                return '<p class="error">Sem logs disponíveis</p>';
            }
            
            return logs.map(log => `
                <div style="margin-bottom: 5px; padding: 2px 0; border-bottom: 1px solid #333;">
                    ${log}
                </div>
            `).join('');
        }

        async function refreshData() {
            try {
                // Buscar status
                const statusResponse = await fetch('/api/status');
                const statusData = await statusResponse.json();
                
                document.getElementById('system-status').innerHTML = renderSystemStatus(statusData);
                document.getElementById('recent-trades').innerHTML = renderTrades(statusData.monitor.trades);
                document.getElementById('opportunities').innerHTML = renderOpportunities(statusData);
                document.getElementById('recent-errors').innerHTML = renderErrors(statusData.monitor.errors);
                
                // Buscar logs
                const logsResponse = await fetch('/api/logs?n=50');
                const logsData = await logsResponse.json();
                document.getElementById('logs').innerHTML = renderLogs(logsData.logs);
                
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                document.getElementById('system-status').innerHTML = 
                    '<div class="error">Erro ao carregar dados</div>';
            }
        }

        async function controlBot(action) {
            if (!confirm(`Tem certeza que deseja ${action} o bot?`)) {
                return;
            }
            
            try {
                const response = await fetch('/api/control', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: action })
                });
                
                const result = await response.json();
                alert(result.message || result.error);
                
                // Recarregar dados após ação
                setTimeout(refreshData, 2000);
                
            } catch (error) {
                console.error('Erro ao controlar bot:', error);
                alert('Erro ao executar ação');
            }
        }

        // Inicializar
        document.addEventListener('DOMContentLoaded', function() {
            refreshData();
            refreshInterval = setInterval(refreshData, 30000); // Atualizar a cada 30 segundos
        });

        // Limpar intervalo ao sair
        window.addEventListener('beforeunload', function() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        });
    </script>
</body>
</html>'''

# Salvar template
with open(TEMPLATE_DIR / 'dashboard.html', 'w') as f:
    f.write(dashboard_html)

if __name__ == '__main__':
    print(f"🚀 Iniciando dashboard em http://localhost:8080")
    print(f"📊 Dados sendo lidos de: {DATA_DIR}")
    app.run(host='0.0.0.0', port=8080, debug=False)