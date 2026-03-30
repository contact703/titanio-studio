# 🤖 TRADER STATUS — Polymarket Trading Bot

**Data:** 2026-03-27  
**Implementado por:** Tita (subagent)  
**Status geral:** 🟡 PRONTO — aguardando autorização de saldo para trade real

---

## ✅ O QUE FUNCIONOU

### 1. Autenticação L2 (HMAC-SHA256) — ✅ 100% FUNCIONANDO
- Implementada em `src/trader.py` com método `_get()`, `_post()`, `_delete()`
- **DESCOBERTA CRÍTICA:** O HMAC deve assinar o PATH BASE sem query string, mas a URL enviada pode ter query params
  - ✅ Correto: sign `/balance-allowance`, fetch `/balance-allowance?asset_type=COLLATERAL&signature_type=1`
  - ❌ Errado: sign o path completo com query string
- Endpoint `/auth/api-keys` — ✅ responde `{"apiKeys": ["6d866b80..."]}`
- Endpoint `/data/orders` — ✅ lista ordens (vazia)
- Endpoint `/data/trades` — ✅ lista trades (vazia)

### 2. Saldo da Conta — ✅ CONFIRMADO
```
Saldo USDC: $44.855299 (≈ $44.86)
Conta: POLY_PROXY_WALLET = 0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0
API resposta: {"balance": "44855299", ...}
Nota: USDC tem 6 decimais → 44855299 / 1.000.000 = $44.86
```

### 3. trader.py — ✅ IMPLEMENTADO
Localização: `src/trader.py`

**Funções disponíveis:**
| Função | Status | Descrição |
|--------|--------|-----------|
| `get_balance()` | ✅ Funcionando | Retorna saldo USDC em $44.86 |
| `get_open_orders()` | ✅ Funcionando | Lista ordens abertas (vazia) |
| `get_trades()` | ✅ Funcionando | Lista trades executados (vazia) |
| `get_market_price()` | ✅ Funcionando | Preço atual de qualquer token |
| `get_midpoint()` | ✅ Funcionando | Midpoint do order book |
| `get_orderbook()` | ✅ Funcionando | Book completo |
| `place_limit_order()` | ⚠️ Auth OK, saldo bloqueado | Assina EIP-712, falha no saldo |
| `place_market_order()` | ⚠️ Auth OK, saldo bloqueado | FOK market order |
| `cancel_order()` | ✅ Implementado | Cancela por ID |
| `cancel_all_orders()` | ✅ Implementado | Cancela todas |
| `test_connection()` | ✅ Funcionando | Testa todos os endpoints |

### 4. executor.py — ✅ IMPLEMENTADO
Localização: `src/executor.py`

- ✅ Lê `data/latest_scan.json`
- ✅ Filtra por liquidez (mais seguro = mais líquido)
- ✅ DRY_RUN mode funciona completamente
- ✅ Registra em `data/trades_history.jsonl`
- ✅ Verifica saldo antes de executar (modo LIVE)

**Teste DRY_RUN:**
```
✅ Simulou: BUY $2.00 YES @ 0.20 — Colorado Avalanche
✅ Registrado em trades_history.jsonl
```

### 5. start-monitor.sh — ✅ ATUALIZADO
Novos comandos adicionados:
```bash
bash start-monitor.sh trade        # DRY_RUN (simula)
bash start-monitor.sh trade-live   # LIVE (executa trade real)
bash start-monitor.sh balance      # Verifica saldo
bash start-monitor.sh orders       # Lista ordens abertas
```

### 6. Pipeline de Assinatura EIP-712 — ✅ FUNCIONANDO
O bot consegue criar e assinar ordens EIP-712 corretamente com `BOT_WALLET`:
```
✅ Order criada e assinada via EIP-712
✅ Servidor aceita a assinatura
⚠️ Falha APENAS por saldo insuficiente: balance = 0, needed = $2.00
Erro: 'not enough balance / allowance: the balance is not enough'
```

---

## ❌ O QUE NÃO FUNCIONOU (E POR QUÊ)

### Trade Real — Bloqueado por Conflito de Wallets

**Problema:** Há duas wallets diferentes no sistema:

| Wallet | Address | Private Key | Saldo CLOB |
|--------|---------|-------------|------------|
| **TIAGO_SIGNER** (Magic Link) | `0x5a9A2237...` | ❌ Não disponível | $44.86 |
| **BOT_WALLET** (gerada) | `0x2f076FC55...` | ✅ Disponível | $0.00 |

**Diagnóstico:**
- A `POLY_API_KEY` (`6d866b80...`) foi criada por Tiago via Magic Link Google
- O Magic Link cria um embedded wallet (`0x5a9A...`) — a private key fica no browser
- O `WALLET_PRIVATE_KEY` no `.env` corresponde à `BOT_WALLET` (`0x2f076...`), criada separadamente
- Para assinar ordens com a conta Tiago, precisamos da private key de `0x5a9A...`

**Erro ao tentar cruzar as wallets:**
```
POST /order → 400: "the order signer address has to be the address of the API KEY"
```
O Polymarket CLOB exige que o assinante EIP-712 da ordem seja a mesma wallet que criou a API key.

---

## 🔧 COMO EXECUTAR TRADES MANUALMENTE

### Opção A: Usar BOT_WALLET (recomendado para automação)
1. **Depositar USDC na BOT_WALLET:**
   - Endereço: `0x2f076FC55BC16ebBEFb642523206268bF327b687`
   - Rede: Polygon
   - Mínimo sugerido: $10 USDC para cobrir trades + gas fees
   - API keys para BOT_WALLET já criadas e salvas no `.env` como `BOT_API_KEY`

2. **Atualizar `.env` para usar BOT creds:**
   ```env
   POLY_API_KEY=abdeaa26-96f6-3312-e125-f0c5215a6681
   POLY_API_SECRET=9bUCafuUT5Yjrbez2lXpZQRegZ2DYgRxWmaXTnlB4sk=
   POLY_API_PASSPHRASE=c79983ffc345d072fb5b87c2f9438b0088c0f1ba8dd357095897bb00dc52bc3f
   POLY_SIGNER_ADDRESS=0x2f076FC55BC16ebBEFb642523206268bF327b687
   DRY_RUN=false
   ```

3. **Executar trade:**
   ```bash
   bash start-monitor.sh trade-live
   ```

### Opção B: Exportar Private Key da Conta Tiago (acesso total ao $44.86)
1. Tiago abre o **Polymarket.com** no Chrome
2. Vai em Settings → Account → Export Wallet
3. OU abre DevTools → Application → Local Storage → polymarket.com → procura por `private_key` ou `mnemonic`
4. Salvar a private key em `pasta-do-tita/cofre/polymarket-wallet-tiago.json`
5. Atualizar `WALLET_PRIVATE_KEY` no `.env` com a nova key
6. Atualizar `POLY_SIGNER_ADDRESS` para `0x5a9A2237...`

### Teste DRY_RUN (sempre seguro):
```bash
bash start-monitor.sh trade
# ou
python src/executor.py --amount 2.0 --max-trades 1
```

### Verificar saldo:
```bash
bash start-monitor.sh balance
# ou
python src/trader.py balance
```

### Verificar ordens abertas:
```bash
bash start-monitor.sh orders
# ou
python src/trader.py orders
```

---

## 💰 STATUS DO SALDO

| Conta | Endereço | Saldo | Status |
|-------|---------|-------|--------|
| **Tiago (Polymarket)** | `0xf84796bEa736...` | **$44.855 USDC** | ✅ Disponível na plataforma |
| **BOT_WALLET** | `0x2f076FC55...` | **$0.00 USDC** | ⚠️ Precisa de depósito |

**Allowances (Tiago):**
- CLOB Exchange: ilimitado ✅
- CTF Exchange: ilimitado ✅  
- Neg Risk: ilimitado ✅

---

## 📁 ARQUIVOS CRIADOS/MODIFICADOS

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `src/trader.py` | ✅ Novo | Cliente CLOB com HMAC auth + EIP-712 |
| `src/executor.py` | ✅ Novo | Executa trades do scan automático |
| `start-monitor.sh` | ✅ Atualizado | Adicionado: trade, trade-live, balance, orders |
| `data/trades_history.jsonl` | ✅ Criado | Histórico de trades (DRY_RUN) |
| `.env` | ✅ Atualizado | Adicionadas BOT_API_KEY/SECRET/PASSPHRASE |

---

## 🔑 DESCOBERTAS TÉCNICAS IMPORTANTES

### 1. HMAC Auth — Path Signing
```python
# ✅ CORRETO: sign apenas o base path
timestamp = str(int(time.time()))
message = timestamp + "GET" + "/balance-allowance"  # sem query string!
# fetch com query: /balance-allowance?asset_type=COLLATERAL&signature_type=1

# ❌ ERRADO: incluir query string na assinatura
message = timestamp + "GET" + "/balance-allowance?asset_type=COLLATERAL"  # 401!
```

### 2. Saldo em USDC (6 decimais)
```python
raw_balance = 44855299
usdc_balance = raw_balance / 1_000_000  # → $44.855299
```

### 3. BOT Wallet pode colocar ordens (após receber USDC)
```
Error confirmado: "not enough balance / allowance: balance: 0, order amount: 2001000"
Isso prova: Auth ✅, Assinatura EIP-712 ✅, Saldo ❌
```

### 4. Dois modos de autenticação implementados
- **TIAGO creds** (`6d866b80...`): funciona para LEITURA (balance, orders, trades)
- **BOT creds** (`abdeaa26...`): funciona para ESCRITA quando tiver USDC

---

## 🚀 PRÓXIMOS PASSOS

**Para ativar trading real (escolher uma opção):**

### 🥇 Opção Rápida (5 min):
Depositar $10+ USDC na BOT_WALLET via Polygon:
- Endereço: `0x2f076FC55BC16ebBEFb642523206268bF327b687`
- Após depósito, trocar `POLY_API_KEY` no `.env` para a `BOT_API_KEY`
- `bash start-monitor.sh trade-live`

### 🥈 Opção Completa (usa saldo existente):
Exportar private key de Tiago do Polymarket e configurar no `.env`

---

*Gerado por Tita 🐾 em 2026-03-27*  
*Implementação: trader.py + executor.py + start-monitor.sh atualizado*
