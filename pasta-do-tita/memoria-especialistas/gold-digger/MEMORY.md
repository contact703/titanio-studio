# gold-digger — Memória
Criado: 2026-03-23
# 2026-03-26 — Polymarket Bot Day

## 🎰 Polymarket Trading Bot — Setup Completo

### Contexto
Zica mandou 4 vídeos sobre bots de trading no Polymarket (mercado de previsões). Exemplos:
- $900 → $7k em 1 dia (copy trading)
- $43.8k ganhos (news arbitrage + timezone)

Eles querem testar com $50 pra ver se funciona.

### O Que Foi Feito

#### 1. Pesquisa e Análise
- Polymarket = mercado de previsões (tipo bolsa, mas de eventos sim/não)
- Não é investimento tradicional nem aposta pura — é trading de probabilidades
- Pode vender antes do resultado (igual ação)
- Risco real: maioria perde dinheiro

#### 2. Alternativas Avaliadas
Pesquisei onde bots IA têm vantagem:
- **Polymarket** (prediction markets) — IA lê notícias 24/7 ✅
- **Arbitragem DEX** — detecta diferença de preço entre exchanges
- **Grid Trading** — compra barato/vende caro em faixas
- **Copy Trading** — copia melhores traders

Recomendação: $30 Polymarket + $20 Grid Trading

#### 3. Stack Técnica
```
polymarket-agent/
├── src/
│   ├── monitor.py         ← Scan + IA 24/7
│   ├── market_scanner.py  ← API wrapper
│   └── copy_trader.py     ← Preparado
├── data/
│   ├── latest_scan.json
│   └── scan_history.jsonl
├── venv/                  ← Python deps
├── .env                   ← Keys
└── start-monitor.sh
```

Instalado:
- py-clob-client (SDK oficial Polymarket)
- httpx, requests
- web3, eth-account (pra wallet)

#### 4. Wallet Criada
```
Address: 0x2f076FC55BC16ebBEFb642523206268bF327b687
Network: Polygon (Chain ID 137)
Private Key: salva em cofre/polymarket-wallet.json
```

#### 5. Monitor 24/7 Ativo
**PID:** 20223  
**Intervalo:** 10 min  
**IA Stack:**
- Primário: Claude Sonnet (Anthropic) — sempre funciona
- Backup: 3 modelos OpenRouter free (reset diário)

**O que faz:**
1. Puxa 30 mercados ativos
2. Filtra oportunidades (odds 25-75%, vol > $500)
3. IA analisa top 3 (confiança + direção + razão)
4. Salva histórico completo
5. Relatório horário automático

**Último scan (23:28):**
- 🟢 [72%] China cresce 4-5% em 2026
- 🔴 [25%] DHS shutdown acaba após 31/mar
- 🔴 [25%] SpaceX IPO até jun/26

#### 6. Conta Polymarket (Tiago)
```
Login: tiago@titaniofilms.com
Senha: Rita160679
Saldo: $44.86
```
Screenshot recebido via WhatsApp, guardado no cofre.

### Próximos Passos
1. ⏳ Aguardar Tiago informar endereço wallet Polygon da conta
2. Conectar bot à conta dele
3. Trade teste $1-2 pra validar
4. Ativar estratégia conservadora:
   - Posições pequenas ($5-10)
   - Só confiança ≥70%
   - Stop loss automático
   - Relatório diário

### Rate Limits e APIs
| Serviço | Limite | Status |
|---------|--------|--------|
| OpenRouter Polaris | 50/dia | 🟡 Esgotado (reset 00:00) |
| OpenRouter Principal | 50/dia | ❌ Sem crédito |
| Claude | Ilimitado* | ✅ Funcionando |
| Polymarket API | Ilimitado | ✅ Pública |

*Pago por uso

### Arquivos Criados
- `projetos/polymarket-agent/PLANO.md` (5326 bytes)
- `projetos/polymarket-agent/src/monitor.py` (9604 bytes)
- `projetos/polymarket-agent/src/market_scanner.py` (2396 bytes)
- `projetos/polymarket-agent/src/copy_trader.py` (3020 bytes)
- `projetos/polymarket-agent/start-monitor.sh`
- `cofre/polymarket-wallet.json`
- `cofre/CREDENCIAIS-MASTER.md` (atualizado)

### Lições Aprendidas
1. OpenRouter free models retornam `None` quando rate limited (mesmo com 200 OK)
2. Fallback pra Claude é essencial — sempre funciona
3. Polymarket não aceita cartão direto — precisa crypto
4. py-clob-client precisa da private key pra operar
5. Monitor em background via nohup + PID tracking

### Comunicação
4 mensagens enviadas no grupo Gospia:
1. Explicação Polymarket (aposta vs investimento)
2. Pesquisa completa (onde bots têm vantagem)
3. Monitor ligado (primeiro scan)
4. Status completo (aguardando wallet)

---

**Monitor rodando:** PID 20223  
**Log:** /tmp/polymarket-monitor.log  
**Data:** data/latest_scan.json, data/scan_history.jsonl  
**Restart:** `bash projetos/polymarket-agent/start-monitor.sh`

---

## 23:36 — Sessão Polymarket (continuação final)

### Conta Polymarket Ativa
- **Login:** tiago@titaniofilms.com / Rita160679
- **Saldo:** $44.86 disponível pra operar
- **Credenciais salvas em:** `cofre/CREDENCIAIS-MASTER.md`
- **Nenhuma posição aberta** (conta zerada, pronta)
- Tiago mandou screenshot no WhatsApp com login

### Setup Técnico Completo
- **Wallet bot criada:** `0x2f076FC55BC16ebBEFb642523206268bF327b687` (Polygon)
- **Private key:** em `cofre/polymarket-wallet.json`
- **venv Python:** `projetos/polymarket-agent/venv/` com py-clob-client, web3, chromadb, httpx, etc.
- **.env:** configurado com wallet + Anthropic key
- **Market Scanner:** `src/market_scanner.py` — puxa mercados da Gamma API
- **Copy Trader:** `src/copy_trader.py` — estrutura de análise de top traders
- **Monitor 24/7:** `src/monitor.py` — scan a cada 10min com IA

### Stack de IA do Monitor
- **Primário:** OpenRouter free (nemotron, trinity-mini, step-3.5-flash) — 3 modelos, rotação automática
- **Problema descoberto:** OpenRouter free retorna `status 200` mas `content: None` quando rate-limited (não dá 429!)
- **Fix aplicado:** checar se content é None/vazio antes de aceitar resposta
- **Fallback:** Claude Sonnet (sempre funciona, ~R$0.01/request)
- **Rate budget:** 2 keys × 50 req = 100/dia OpenRouter free + Claude ilimitado

### Primeiro Scan (23:28)
- 30 mercados, 7 oportunidades (odds 25-75%)
- 🟢 [72%] China GDP 4-5% em 2026
- 🔴 [25%] DHS shutdown
- 🔴 [25%] SpaceX IPO

### Pesquisa de Alternativas ao Polymarket
Zica pediu pra pesquisar TODAS as formas de multiplicar grana com bot:
1. **Polymarket** (prediction markets) — já montando ← principal
2. **Arbitragem DEX** (Uniswap, Jupiter) — lucro pequeno por trade, risco baixo, concorrência brutal
3. **Grid Trading** (crypto) — 1-5%/dia em mercado lateral
4. **Copy Trading** (Binance/Bybit) — mais simples, precisa $100+
5. **DCA automatizado** — longo prazo, risco baixo
6. **Evitar:** MEV/sandwich (precisa capital alto), day trade alavancado, pump and dump

### Recomendação enviada
Com $50: $30 Polymarket + $20 Grid Trading (testar 2 ao mesmo tempo)

### Explicação enviada (Zica pediu)
Polymarket NÃO é aposta esportiva nem investimento tradicional:
- É "mercado de previsões" — compra YES/NO de eventos
- Preço flutua como ação na bolsa
- Pode vender ANTES do resultado (trading)
- Bot dá vantagem informacional mas não elimina risco
- Maioria das pessoas perde (igual day trade)

### Pendências
- [ ] Tiago precisa mandar endereço wallet Polygon da conta dele (0x...)
- [ ] Conectar bot à conta real
- [ ] Trade teste de $1-2 pra validar
- [ ] Code Ninja pesquisa completa NÃO foi salva ainda (PESQUISA-COMPLETA.md)
- [ ] Backend dashboard tá offline
- [ ] Relatório OpenRouter: reset de rate limit é meia-noite UTC
