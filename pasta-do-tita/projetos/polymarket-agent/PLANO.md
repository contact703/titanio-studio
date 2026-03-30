# 🎰 Titanio Polymarket Agent — Plano de Desenvolvimento

## O que é (baseado nos 4 reels/posts do Eduardo)

Os vídeos mostram:
1. **Bot IA que fez $43.800 no Polymarket** via arbitragem de fuso horário — scaneia notícias e redes sociais
2. **Posts sobre automação de prediction markets** com monitoramento de notícias
3. **Agente IA que copiou os melhores traders** — $900 → $7.000 em 1 dia
4. **Copy-trading automatizado** via análise de dados de mercado

## Resumo: O que vamos construir

**Um agente IA que opera automaticamente no Polymarket:**
- Escaneia notícias em tempo real (RSS, Twitter, Google News)
- Analisa mercados de previsão abertos
- Identifica oportunidades (arbitragem, notícias recentes que mudam probabilidades)
- Copia traders de alto desempenho
- Executa trades automaticamente
- Reporta resultados no WhatsApp

## Stack 100% Open Source

| Componente | Ferramenta | Licença |
|-----------|-----------|---------|
| Framework base | **Polymarket Agents** (oficial) | MIT ✅ |
| Client API | **py-clob-client** (oficial) | MIT ✅ |
| IA/Análise | **Claude API** ou **Ollama** | API/MIT |
| Notícias | **RSS feeds + web scraping** | Free |
| RAG | **ChromaDB** (vector DB) | Apache 2.0 ✅ |
| Copy-trading | **Polymarket API** (dados públicos) | Free |
| Orquestração | **OpenClaw + especialistas** | — |
| Entrega | **WhatsApp via OpenClaw** | — |

## Arquitetura

```
[NEWS SCANNER] ─── RSS/Twitter/Google News
      │
      ▼
[ANALISADOR IA] ─── Claude/Ollama analisa impacto nas probabilidades
      │
      ▼
[MARKET SCANNER] ─── Polymarket API → mercados abertos + odds
      │
      ▼
[COPY TRADER] ─── Identifica top traders → replica posições
      │
      ▼
[STRATEGY ENGINE] ─── Decide: comprar, vender, hold
      │
      ▼
[EXECUTOR] ─── py-clob-client → executa trade na blockchain
      │
      ▼
[REPORTER] ─── WhatsApp → resultados em tempo real
```

## Módulos

### 1. News Scanner (Especialista: Instagramer + Automation Bot)
- Monitora RSS feeds (Reuters, Bloomberg, AP, G1, CNN)
- Monitora Twitter/X via API ou scraping
- Monitora Google Trends
- Filtra notícias relevantes pra mercados abertos no Polymarket

### 2. Market Analyzer (Especialista: Code Ninja)
- Lista mercados abertos no Polymarket
- Calcula probabilidades implícitas
- Detecta mispricing (quando notícia impacta mas odds não mudaram)
- Identifica arbitragem entre markets correlacionados

### 3. Copy Trader (Especialista: Debug Hunter)
- Scaneia histórico de traders no Polymarket
- Identifica top performers (win rate, ROI, volume)
- Replica posições dos melhores automaticamente
- Delay mínimo entre trade original e copy

### 4. Strategy Engine (Especialista: Tita)
- Combina sinais: notícias + análise + copy trader
- Risk management: position sizing, stop-loss
- Budget control: limite diário/semanal
- Decisão final: buy/sell/hold com confiança %

### 5. Executor (Especialista: Code Ninja)
- Conecta na blockchain Polygon via wallet
- Executa ordens via py-clob-client
- Confirma transação
- Log de trades

### 6. Reporter (Especialista: Automation Bot)
- Resumo diário de trades no WhatsApp
- Alertas em tempo real de oportunidades
- P&L tracking
- Dashboard de performance

## Requisitos pra começar

### Obrigatório:
- [ ] **Wallet Polygon** com USDC (pra operar)
- [ ] **API Key OpenAI ou Claude** (pra análise — já temos Claude)
- [ ] **Python 3.9+** (já temos ✅)

### Opcional:
- [ ] API Twitter/X (pra monitorar news em real-time)
- [ ] VPN (alguns mercados são geo-restricted)

## ⚠️ Riscos e Avisos

1. **DINHEIRO REAL** — Polymarket opera com USDC real na blockchain Polygon
2. **PODE PERDER** — A maioria dos traders perde dinheiro
3. **NÃO É GARANTIDO** — Os $43k e $7k dos vídeos são outliers
4. **REGULAÇÃO** — Polymarket pode ter restrições por jurisdição
5. **SEGURANÇA** — Private key da wallet precisa ficar segura (cofre)

## Fases

### Fase 1 — Pesquisa e Setup (1-2 dias)
- Clonar Polymarket Agents (repo oficial)
- Setup ambiente Python
- Criar wallet Polygon de teste
- Testar API com trades pequenos ($1-5)
- Instalar ChromaDB pra RAG de notícias

### Fase 2 — News Scanner (2-3 dias)
- RSS feeds automatizados
- Web scraping de fontes principais
- ChromaDB pra indexar e buscar notícias
- Correlação notícia ↔ mercado Polymarket

### Fase 3 — Copy Trader (2-3 dias)
- API pra puxar dados de traders
- Ranking de top performers
- Sistema de mirror automático
- Backtesting com dados históricos

### Fase 4 — Strategy + Executor (3-5 dias)
- Engine de decisão com IA
- Risk management
- Execução real com wallet
- Testes com valores pequenos

### Fase 5 — Reporter + WhatsApp (1 dia)
- Relatórios automáticos
- Alertas em tempo real
- Dashboard de P&L

## Equipe

| Especialista | Papel |
|-------------|-------|
| **Tita** | Orquestra tudo, strategy engine |
| **Code Ninja** | Market analyzer, executor, py-clob-client |
| **Debug Hunter** | Copy trader, backtesting, testes |
| **Instagramer** | News scanner, social media monitoring |
| **Automation Bot** | Reporter, alertas, cron jobs |

## Pergunta pro Eduardo

Antes de começar a desenvolver:
1. **Quanto quer investir pra testar?** ($10? $50? $100?)
2. **Já tem wallet Polygon com USDC?** Se não, criamos uma
3. **Quer começar com copy-trading ou news-based?**
4. **Quero confirmar: sabe que pode perder o dinheiro investido?**
