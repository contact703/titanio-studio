# 🎯 POLYMARKET BOT - CONFIGURAÇÃO MAC MINI

## Status Atual ✅
- ✅ Bot operando 24/7 no Mac Mini
- ✅ Serviço de monitoramento ativo
- ✅ Dashboard local configurado
- ✅ Auto-restart configurado
- ✅ Integrado ao sistema do Mac Mini

## 📁 Estrutura no Mac Mini

```
/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/
├── src/monitor.py              # Monitor principal 24/7
├── polymarket-control.sh       # Controle completo do serviço
├── polymarket-service.sh       # Serviço robusto com reinicialização
├── polymarket-watchdog.sh      # Watchdog para monitoramento
├── dashboard.sh               # Dashboard local em tempo real
├── data/                      # Dados e logs
│   ├── monitor.log            # Log principal do bot
│   ├── service.log            # Log do serviço
│   ├── latest_scan.json       # Último scan realizado
│   └── scan_history.jsonl     # Histórico completo
└── venv/                      # Ambiente Python
```

## 🎮 Comandos de Controle

Todos os comandos devem ser executados no diretório do projeto:

```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent
```

### Controle Principal
```bash
# Status do serviço
bash polymarket-control.sh status

# Iniciar serviço
bash polymarket-control.sh start

# Parar serviço
bash polymarket-control.sh stop

# Reiniciar serviço
bash polymarket-control.sh restart

# Dashboard em tempo real
bash polymarket-control.sh dashboard

# Ver logs do serviço
bash polymarket-control.sh logs
```

### Dashboard Local
```bash
# Dashboard interativo (atualiza a cada 30s)
bash dashboard.sh
```

## 📊 Monitoramento

### O que está sendo monitorado:
- ✅ **30+ mercados ativos** do Polymarket
- ✅ **Filtro inteligente**: odds 15-85%, volume >$500
- ✅ **Análise de IA**: Claude 3.5 Haiku + fallback OpenRouter
- ✅ **Sinais com confiança ≥70%**
- ✅ **Intervalo**: 10 minutos entre scans

### Status Atual (último scan):
```json
{
  "opportunities_found": 12,
  "strong_signals": 0,
  "last_scan": "2026-03-31 19:05:33",
  "markets_analyzed": 60,
  "ai_analysis": "ativa com fallback"
}
```

## 🔧 Configurações do Mac Mini

### LaunchAgent (Auto-início)
- ✅ Arquivo: `/Users/contacttitanio/Library/LaunchAgents/com.titanio.polymarket-bot.plist`
- ✅ Inicia automaticamente com o sistema
- ✅ Reinicia em caso de falha

### Cron Watchdog
- ✅ Monitora a cada 5 minutos
- ✅ Reinicia serviço se necessário
- ✅ Log: `data/watchdog.log`

### Aliases Criados
```bash
# Adicionados ao ~/.zshrc
poly-status   # Ver status
poly-start    # Iniciar bot
poly-stop     # Parar bot
poly-logs     # Ver logs
poly-dashboard # Dashboard
poly-once     # Scan único
```

## 💰 Configurações Financeiras

### Contas Configuradas:
- **Conta Principal**: tiago@titaniofilms.com (Tiago)
- **Saldo Atual**: $44.86 USDC
- **Proxy Wallet**: `0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0`
- **Bot Wallet**: `0x2f076FC55BC16ebBEFb642523206268bF327b687`

### Limites de Segurança:
- **DRY_RUN**: `true` (modo seguro - apenas simula)
- **MAX_TRADE_SIZE**: $5.00 USD
- **MIN_CONFIDENCE**: 70%
- **CHAIN**: Polygon (137)

## 📈 Performance no Mac Mini

### Recursos Utilizados:
- **CPU**: ~0.1-0.3% durante scans
- **MEM**: ~45MB de RAM
- **DISCO**: <1MB por dia em logs
- **REDE**: ~50KB por scan

### Logs e Monitoramento:
- **Log Principal**: `data/monitor.log`
- **Log do Serviço**: `data/service.log`
- **Log do Watchdog**: `data/watchdog.log`
- **Dashboard**: Atalho no Desktop

## 🚨 Alertas e Notificações

### Sinais Fortes Detectados:
O bot identifica automaticamente oportunidades com:
- Confiança ≥ 70%
- Análise de IA positiva
- Fundamentação clara

Exemplo de sinal forte:
```
🔔 [72%] NO — Will Jesus Christ return before GTA VI?
   ↳ GTA VI lançamento 2025 confirmado. Evento religioso 
      especulativo tem probabilidade negligenciável.
```

## 🔐 Segurança

### Proteções Ativas:
- ✅ **DRY_RUN ativado** (nenhum trade real executado)
- ✅ **Chaves API** armazenadas em .env (não versionado)
- ✅ **Limites de trade** configurados ($5 max)
- ✅ **Monitoramento de recursos** (previne vazamentos)
- ✅ **Auto-restart** em caso de falhas

### Para Operar em Produção:
1. Mudar `DRY_RUN=false` no arquivo `.env`
2. Verificar saldo suficiente na conta
3. Ajustar limites de acordo com o risco
4. Monitorar os primeiros trades manualmente

## 🛠️ Manutenção

### Verificações Diárias:
```bash
# Verificar status
bash polymarket-control.sh status

# Ver últimos logs
tail -20 data/monitor.log

# Verificar espaço em disco
df -h /Volumes/TITA_039/
```

### Manutenção Semanal:
```bash
# Limpar logs antigos
tail -1000 data/monitor.log > temp.log && mv temp.log data/monitor.log

# Verificar atualizações
git pull origin main  # se estiver usando git
```

## 📞 Suporte

### Problemas Comuns:
1. **Bot não inicia**: Verificar logs em `data/service.log`
2. **API 429 error**: Rate limit atingido, aguardar 1h
3. **Sem sinais**: Normal - mercados em neutro
4. **Alto uso de CPU**: Verificar se múltiplos processos rodando

### Arquivos Importantes:
- Config: `.env`
- Logs: `data/monitor.log`
- Histórico: `data/scan_history.jsonl`
- Último scan: `data/latest_scan.json`

---

**🎯 Status Final**: ✅ OPERACIONAL
**⏰ Iniciado**: 31/03/2026 19:05
**📍 Local**: Mac Mini - Drive TITA_039
**🔄 Modo**: 24/7 com auto-restart