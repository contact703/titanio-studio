# 🤖 Polymarket Trading Bot

Bot de trading para mercados de previsão (prediction markets) do **Polymarket**.
Escaneia 24/7, usa IA (Claude) para identificar oportunidades e suporta copy trading.

## 🎯 O que faz

- **Scanner automático**: Puxa 30+ mercados ativos a cada 10 minutos
- **Filtro inteligente**: Descarta mercados óbvios (odds >85% ou <15%) e sem liquidez
- **Análise de IA**: Claude analisa top 3 oportunidades com confiança ≥70%
- **Copy Trading**: Monitora top traders e replica posições promissoras
- **DRY_RUN por padrão**: Simula sem executar — seguro para testar

## 📁 Estrutura

```
polymarket-agent/
├── src/
│   ├── monitor.py         ← Scanner + IA 24/7 (PRINCIPAL)
│   ├── market_scanner.py  ← Gamma API wrapper
│   └── copy_trader.py     ← Copy trading de top traders
├── data/
│   ├── latest_scan.json   ← Resultado do último scan
│   ├── scan_history.jsonl ← Histórico completo
│   └── monitor.log        ← Logs detalhados
├── venv/                  ← Python virtual environment
├── .env                   ← Credenciais reais (não commitar!)
├── .env.example           ← Template público
├── requirements.txt       ← Dependências Python
├── start-monitor.sh       ← Script de controle
├── PLANO.md               ← Status e próximos passos
└── README.md              ← Este arquivo
```

## 🚀 Quick Start

### 1. Setup inicial

```bash
cd projetos/polymarket-agent
bash start-monitor.sh setup
```

### 2. Configurar credenciais

O `.env` já está pré-configurado com as credenciais da conta Tiago. Verifique:

```bash
cat .env
```

### 3. Testar (sem IA, sem salvar)

```bash
bash start-monitor.sh test
```

### 4. Rodar um scan completo (com IA)

```bash
bash start-monitor.sh once
```

### 5. Monitor contínuo (background)

```bash
bash start-monitor.sh start
bash start-monitor.sh status
bash start-monitor.sh logs
```

## 📊 Contas e Carteiras

| Item | Valor |
|------|-------|
| **Conta Polymarket** | tiago@titaniofilms.com |
| **Saldo** | $44.86 |
| **Proxy Wallet** | `0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0` |
| **Carteira Bot** | `0x2f076FC55BC16ebBEFb642523206268bF327b687` |
| **Rede** | Polygon (Chain ID 137) |

## 🔑 Credenciais (onde ficam)

- **API Keys Polymarket**: `.env` e `pasta-do-tita/cofre/polymarket-api-keys.json`
- **Private Key Bot**: `.env` e `pasta-do-tita/cofre/polymarket-wallet.json`
- **Anthropic API**: `.env` (chave principal do Titanio)

## 🧠 Stack de IA

| Provider | Modelo | Uso | Custo |
|----------|--------|-----|-------|
| Anthropic | claude-3-5-haiku | Primário (análise) | ~$0.01/req |
| OpenRouter | llama-3.3-70b (free) | Fallback | Grátis (50/dia) |
| OpenRouter | gemini-2.0-flash (free) | Fallback 2 | Grátis |

## ⚙️ Configurações Importantes

```bash
SCAN_INTERVAL_MINUTES=10    # Frequência de scan
MIN_CONFIDENCE=70           # Confiança mínima para sinal (%)
MAX_TRADE_SIZE_USD=5.0      # Tamanho máximo por trade
DRY_RUN=true                # FALSE apenas quando pronto para operar!
```

## 🔒 Segurança

- **DRY_RUN=true** por padrão — nenhum trade é executado automaticamente
- Para operar: mude `DRY_RUN=false` e defina limites de risco
- Nunca commitar `.env` (está no `.gitignore`)
- Private key da carteira BOT (pequena) — não da conta principal do Tiago

## 📈 Estratégia de Trading

### Quando comprar YES
- Mercado em 20-45% e IA identifica notícias recentes favoráveis
- Trader de alto ROI tem posição YES significativa

### Quando comprar NO
- Mercado em 55-80% e IA vê over-hype ou evento improvável
- Equivale a vender expectativa inflada

### Regras de risco
- Posição máxima: $5-10 por mercado
- Só entrar com confiança ≥70%
- Diversificar em 3-5 mercados simultâneos
- Não colocar mais de 30% do saldo em um único mercado

## 🛠️ Comandos Úteis

```bash
bash start-monitor.sh start    # Iniciar em background
bash start-monitor.sh stop     # Parar
bash start-monitor.sh restart  # Reiniciar
bash start-monitor.sh status   # Status + últimos logs
bash start-monitor.sh once     # Scan único
bash start-monitor.sh test     # Teste sem API de IA
bash start-monitor.sh logs     # Seguir log em tempo real
```

## 🔗 APIs

- **Gamma API** (pública): `https://gamma-api.polymarket.com/markets`
- **CLOB API** (requer auth): `https://clob.polymarket.com`
- **Documentação**: [docs.polymarket.com](https://docs.polymarket.com)

## ⚠️ Aviso de Risco

Polymarket é um mercado de previsões financeiras. **Risco real de perda.**
- Maioria dos traders perde dinheiro
- Bot dá vantagem informacional mas não elimina risco
- Comece com $5-10 por trade para validar a estratégia
- Nunca invista mais do que pode perder

---

*Bot criado em 26/03/2026 pela Tita (IA da Titanio Films)*
