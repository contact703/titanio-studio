# 📋 PLANO — Polymarket Trading Bot

**Última atualização:** 2026-03-27  
**Status geral:** 🟡 PRONTO — aguardando validação manual  
**Responsável:** Tiago (conta) + Tita (bot)

---

## ✅ O Que Foi Feito

### Fase 1 — Pesquisa e Planejamento (26/03/2026)
- [x] Pesquisa sobre Polymarket e mercados de previsão
- [x] Análise de estratégias: copy trading, news arbitrage, grid trading
- [x] Explicação enviada para Zica sobre riscos e oportunidades
- [x] Recomendação: $30 Polymarket + $20 Grid Trading

### Fase 2 — Infraestrutura (26/03/2026)
- [x] Criação da carteira bot: `0x2f076FC55BC16ebBEFb642523206268bF327b687` (Polygon)
- [x] Private key salva no cofre: `pasta-do-tita/cofre/polymarket-wallet.json`
- [x] Configuração do `.env` com todas as credenciais
- [x] Instalação de dependências (py-clob-client, httpx, web3, anthropic)

### Fase 3 — Código (26-27/03/2026)
- [x] `market_scanner.py` — Gamma API wrapper, filtro de oportunidades
- [x] `monitor.py` — Scanner 24/7, loop de 10 min, análise IA
- [x] `copy_trader.py` — Estrutura de copy trading (DRY_RUN)
- [x] `start-monitor.sh` — Script de controle completo
- [x] `.env.example` e `.env` configurados
- [x] Primeiro scan bem-sucedido (26/03 23:28)

### Fase 4 — Conta Polymarket (26/03/2026)
- [x] Login com tiago@titaniofilms.com / Rita160679
- [x] Saldo verificado: $44.86
- [x] API Keys Polymarket obtidas e salvas
- [x] Credenciais salvas no cofre

### Fase 5 — Restauração (27/03/2026)
- [x] Arquivos perdidos do disco recreiados completamente
- [x] API pública testada e funcionando
- [x] Documentação completa (README.md, PLANO.md)

---

## 🔴 Pendências Críticas

### 1. Private Key da Conta Real do Tiago
**Status:** ⚠️ BLOQUEADO  
**O quê:** Precisamos da private key da carteira Polygon associada ao login do Tiago no Polymarket. Isso é diferente da carteira bot que criamos.  
**Como obter:**
- Tiago abre o Polymarket no PC
- F12 → Console → Colar script para extrair a private key
- OU: Conectar via MetaMask/Rabby e exportar a chave
**Por que precisa:** Para assinar ordens de trade com a conta real do Tiago (onde está o $44.86)

### 2. Validação do Monitor
**Status:** 🟡 PRONTO PARA TESTAR  
**O quê:** Rodar `bash start-monitor.sh once` para confirmar que o scan completo funciona  
**Requisito:** venv com dependências instaladas

---

## ⏳ Próximos Passos (em ordem)

1. **Setup do ambiente:**
   ```bash
   cd projetos/polymarket-agent
   bash start-monitor.sh setup
   bash start-monitor.sh test
   ```

2. **Rodar primeiro scan real:**
   ```bash
   bash start-monitor.sh once
   cat data/latest_scan.json
   ```

3. **Obter private key do Tiago** (passo crítico)
   - Sem isso, o bot não pode executar trades na conta com $44.86

4. **Primeiro trade teste ($1-2):**
   - Setar `DRY_RUN=false` no `.env`
   - Escolher mercado com confiança ≥70%
   - Trade pequeno para validar plumbing

5. **Ativar estratégia conservadora:**
   - Posições $5-10 cada
   - Só confiança ≥70%
   - 3-5 mercados simultâneos
   - Relatório diário automático

---

## 📊 Resultados do Primeiro Scan (26/03 23:28)

| Sinal | Confiança | Direção | Mercado |
|-------|-----------|---------|---------|
| 🟢 FORTE | 72% | YES | China GDP crescimento 4-5% em 2026 |
| 🔴 FRACO | 25% | NO | DHS shutdown termina após 31/mar |
| 🔴 FRACO | 25% | NO | SpaceX IPO até junho/2026 |

**30 mercados escaneados → 7 oportunidades → 3 analisados → 1 sinal forte**

---

## 💡 Estratégia Detalhada

### Filtros de Entrada
- Odds entre 15-85% (mercado não óbvio)
- Volume 24h > $500 (liquidez mínima)
- Liquidez > $200 (spread aceitável)
- Confiança IA ≥70%

### Gestão de Risco
- Máximo $5-10 por posição
- Nunca >30% do saldo em 1 mercado
- DRY_RUN=true até validar o sistema
- Log completo para auditoria

### Copy Trading (futuro)
- Monitorar leaderboard mensal do Polymarket
- Copiar traders com ROI >10% e volume >$5k
- Posições proporcionais ao nosso capital
- Delay de 5-15 min para evitar front-running

---

## 🔗 Referências

- **API Pública Gamma:** https://gamma-api.polymarket.com/markets
- **CLOB API (auth):** https://clob.polymarket.com
- **Documentação oficial:** https://docs.polymarket.com
- **py-clob-client:** https://github.com/Polymarket/py-clob-client
- **Whitepaper:** https://polymarket.com/whitepaper.pdf

---

## 📁 Arquivos do Projeto

```
projetos/polymarket-agent/
├── src/monitor.py          9.6KB — Scanner + loop 24/7 + IA
├── src/market_scanner.py   6.0KB — Gamma API wrapper
├── src/copy_trader.py      9.2KB — Copy trading DRY_RUN
├── start-monitor.sh        4.2KB — Script de controle
├── requirements.txt        0.1KB — Dependências Python
├── .env                    [PRIVADO] — Credenciais reais
├── .env.example            1.4KB — Template público
├── README.md               4.7KB — Documentação completa
├── PLANO.md                [ESTE ARQUIVO]
└── data/                   — Gerado em runtime
    ├── latest_scan.json    — Último scan
    ├── scan_history.jsonl  — Histórico
    └── monitor.log         — Logs
```

---

*Última atualização: 2026-03-27 por Tita (subagent restauração)*
