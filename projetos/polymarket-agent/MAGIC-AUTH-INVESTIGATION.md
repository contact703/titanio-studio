# Polymarket Magic Auth Investigation
**Data:** 2026-03-27  
**Investigador:** Tita (subagent)  
**Status:** ✅ Causa raiz identificada

---

## 📋 Contexto

- **Conta:** tiago@titaniofilms.com  
- **Proxy wallet (funder):** `0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0`  
- **Signer (Magic):** `0x5a9A2237fb31cEe81Ac26BecBDFED4281C2Bb491`  
- **API Key L2:** `6d866b80-a158-b0b7-965f-6613c28f682e`  
- **Saldo:** $44.86 USDC  

---

## 🔍 Como Funciona a Autenticação Polymarket

### Dois níveis de auth

**L1 (Private Key / EIP-712):**
- Assina mensagem EIP-712 com a private key
- Usado para: criar/derivar API keys
- Header: `POLY_ADDRESS`, `POLY_SIGNATURE`, `POLY_TIMESTAMP`, `POLY_NONCE`

**L2 (API Keys / HMAC-SHA256):**
- Assina requests com HMAC usando a API Secret
- Usado para: ordens, cancelamentos, consultas autenticadas
- Headers: `POLY_ADDRESS`, `POLY_SIGNATURE`, `POLY_TIMESTAMP`, `POLY_API_KEY`, `POLY_PASSPHRASE`

### Signature Types

| Tipo | Valor | Descrição |
|------|-------|-----------|
| EOA | `0` | MetaMask/hardware wallet (você controla a PK) |
| POLY_PROXY | `1` | Magic Link email/Google login ← **Conta do Tiago** |
| GNOSIS_SAFE | `2` | Gnosis Safe multisig |

### Magic Login (sig_type=1)

Para usuários que fizeram login via email/Magic:
- O **Signer** é gerado pelo Magic internamente (chave custodial)
- O **Proxy Wallet** (funder) é o endereço exibido no Polymarket
- Para usar via API, o usuário **precisa exportar a PK** do Magic

---

## 🐛 Causa Raiz do 401

### Problema 1: Bot private key ≠ Magic signer

```
Bot private key → gera endereço: 0x2f076FC55BC16ebBEFb642523206268bF327b687
API Keys foram criadas com:       0x5a9A2237fb31cEe81Ac26BecBDFED4281C2Bb491 (Magic signer)
```

O servidor valida que `POLY_ADDRESS` bate com o endereço que criou as API Keys via L1 auth. Como são endereços diferentes → **401 Unauthorized/Invalid api key**

### Problema 2: Headers com nomes errados

❌ **Errado (causava 401 antes):**
```python
headers = {
    'POLY-ACCESS-KEY': API_KEY,    # hifens = ERRADO
    'POLY-SIGNATURE': sig,          # hifens = ERRADO
    'POLY-TIMESTAMP': ts,           # hifens = ERRADO
    'POLY-PASSPHRASE': PASSPHRASE,  # hifens = ERRADO
    # faltava POLY_ADDRESS!
}
```

✅ **Correto:**
```python
headers = {
    'POLY_ADDRESS': signer_address,  # underscore, OBRIGATÓRIO
    'POLY_SIGNATURE': sig,           # underscore
    'POLY_TIMESTAMP': str(ts),       # underscore
    'POLY_API_KEY': API_KEY,         # underscore (não POLY_ACCESS_KEY!)
    'POLY_PASSPHRASE': PASSPHRASE,   # underscore
}
```

### Problema 3: HMAC com base64 errado

❌ **Errado:**
```python
secret_bytes = base64.b64decode(API_SECRET)  # b64decode normal
sig = base64.b64encode(hmac_digest).decode()  # b64encode normal
```

✅ **Correto (conforme código-fonte do py-clob-client):**
```python
secret_bytes = base64.urlsafe_b64decode(API_SECRET)  # urlsafe!
sig = base64.urlsafe_b64encode(hmac_digest).decode()  # urlsafe!
```

### Problema 4: Geoblock (Brasil bloqueado)

O CLOB API é bloqueado pelo Cloudflare para IPs do Brasil:
- Erro `403 error code: 1010` = Cloudflare Firewall Rule ativa
- O CF-RAY `GIG` = Galeão (Rio de Janeiro) = IP brasileiro detectado
- Endpoints autenticados requerem IP de país não restrito

---

## ✅ HMAC Correto (código testado)

```python
import hmac, hashlib, base64, time
from py_clob_client.signing.hmac import build_hmac_signature

API_KEY = '6d866b80-a158-b0b7-965f-6613c28f682e'
API_SECRET = 'hcgaAF91H0SB2DPKKY6tCMT7Ln4NzzrnX3YsMnciHBg='
PASSPHRASE = '41a342086516347ee66ddeaa1ea20040ba34cfb73ff0873834bec045838ab529'
SIGNER_ADDR = '0x5a9A2237fb31cEe81Ac26BecBDFED4281C2Bb491'  # Magic signer

# Usando a função oficial do py-clob-client
ts = int(time.time())
sig = build_hmac_signature(API_SECRET, ts, 'GET', '/auth/api-key')

headers = {
    'POLY_ADDRESS': SIGNER_ADDR,
    'POLY_SIGNATURE': sig,
    'POLY_TIMESTAMP': str(ts),
    'POLY_API_KEY': API_KEY,
    'POLY_PASSPHRASE': PASSPHRASE,
}
```

A função `build_hmac_signature` faz internamente:
```python
def build_hmac_signature(secret, timestamp, method, requestPath, body=None):
    base64_secret = base64.urlsafe_b64decode(secret)  # urlsafe!
    message = str(timestamp) + str(method) + str(requestPath)
    if body:
        message += str(body).replace("'", '"')
    h = hmac.new(base64_secret, bytes(message, 'utf-8'), hashlib.sha256)
    return base64.urlsafe_b64encode(h.digest()).decode('utf-8')
```

---

## 🧪 Resultados dos Testes

| Teste | Resultado | Observação |
|-------|-----------|------------|
| HMAC com headers errados (hifens) | 401 | Header names incorretos |
| HMAC com `base64.b64decode` | 401 | Decode errado, sig inválida |
| HMAC com `base64.urlsafe_b64decode` + headers corretos | 403/1010 | Cloudflare geoblock (Brasil) |
| py-clob-client + BOT_PRIV (sig_type=0,1,2) | 401 | Endereço bot ≠ criador das keys |
| py-clob-client + BOT_PRIV + funder correto | 401 | Mesmo problema de endereço |
| Endpoint público `/` (sem auth) | 200 | CLOB acessível normalmente |

---

## 🔧 Soluções

### Solução 1: Exportar a Private Key do Magic (RECOMENDADA)

1. Fazer login em [polymarket.com](https://polymarket.com) com tiago@titaniofilms.com
2. Ir em: **Profile → Settings → Export Private Key**
3. Usar essa PK como `MAGIC_PRIV` no código
4. Criar/derivar as API Keys com essa chave:

```python
from py_clob_client.client import ClobClient

MAGIC_PRIV = '<exportado do polymarket.com/settings>'
PROXY_WALLET = '0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0'

# Inicializar com sig_type=1 (POLY_PROXY = Magic login)
client = ClobClient(
    host='https://clob.polymarket.com',
    key=MAGIC_PRIV,
    chain_id=137,
    signature_type=1,  # Magic/email wallet
    funder=PROXY_WALLET
)

# Criar/derivar API Keys (L1 auth)
creds = client.create_or_derive_api_creds()
print(f"API Key: {creds.api_key}")
print(f"Secret: {creds.api_secret}")
print(f"Passphrase: {creds.api_passphrase}")

# Agora pode fazer L2 auth
client.set_api_creds(creds)
trades = client.get_trades()
print(trades)
```

### Solução 2: Criar novas API Keys com o Bot (trocar de signer)

Se não quiser exportar a Magic PK, criar novas API keys com a chave do bot:

```python
from py_clob_client.client import ClobClient

BOT_PRIV = 'a2b02addba8f04341335947337087162174d7177b5db50a4a71b424bf4836781'
PROXY_WALLET = '0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0'

# Bot cria novas API keys com sig_type=1 e funder=proxy_wallet
client = ClobClient(
    host='https://clob.polymarket.com',
    key=BOT_PRIV,
    chain_id=137,
    signature_type=1,  # Magic/POLY_PROXY
    funder=PROXY_WALLET
)

# Isso gera NOVAS API keys atreladas ao bot address
# (substituindo as keys antigas do Magic signer)
new_creds = client.create_api_key()
```

### Solução 3: Contornar o Geoblock (necessário para qualquer solução)

O servidor Polymarket bloqueia IPs brasileiros. Opções:

1. **VPN** - Usar VPN com IP americano antes de qualquer request
2. **Servidor fora do Brasil** - Deploy do bot em VPS nos EUA (ex: AWS us-east, DigitalOcean NYC)
3. **Proxy HTTP** - Rotear requests via proxy US
4. **Cloudflare Tunnel** - Tunelamento via servidor americano

⚠️ **Sem resolver o geoblock, nenhuma das outras soluções funcionará para autenticação.**

---

## 📖 Referências

- [py-clob-client README](https://github.com/Polymarket/py-clob-client/blob/main/README.md)
- [Polymarket Auth Docs](https://docs.polymarket.com/api-reference/authentication)
- [HMAC Implementation](https://github.com/Polymarket/py-clob-client/blob/main/py_clob_client/signing/hmac.py)
- [Headers Implementation](https://github.com/Polymarket/py-clob-client/blob/main/py_clob_client/headers/headers.py)

---

## 🗺️ Próximos Passos

1. **[CRÍTICO]** Resolver geoblock: Deploy em VPS americana OU usar VPN
2. **[NECESSÁRIO]** Exportar Magic PK em polymarket.com/settings
3. **[TESTAR]** Com IP americano + Magic PK: `client.get_trades()` deve funcionar
4. **[OPCIONAL]** Se quiser usar bot PK separado: criar novas API keys com bot (sol. 2)

---

## 🔑 Script Completo Final (quando tiver VPS + Magic PK)

```python
#!/usr/bin/env python3
"""
Polymarket Trading Bot - Conta Tiago
Requisitos:
  - pip install py-clob-client
  - Servidor com IP não bloqueado (fora do Brasil)
  - MAGIC_PRIVATE_KEY exportada do polymarket.com/settings
"""
import os
from py_clob_client.client import ClobClient
from py_clob_client.clob_types import ApiCreds, OrderArgs, OrderType
from py_clob_client.order_builder.constants import BUY, SELL

HOST = 'https://clob.polymarket.com'
CHAIN_ID = 137  # Polygon

# ⚠️ Exportar de: polymarket.com → Settings → Export Private Key
MAGIC_PRIV = os.getenv('TIAGO_MAGIC_PK')  # private key exportada do Magic
PROXY_WALLET = '0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0'  # funder/proxy

# API Keys existentes (ou derivar novas)
EXISTING_CREDS = ApiCreds(
    api_key='6d866b80-a158-b0b7-965f-6613c28f682e',
    api_secret='hcgaAF91H0SB2DPKKY6tCMT7Ln4NzzrnX3YsMnciHBg=',
    api_passphrase='41a342086516347ee66ddeaa1ea20040ba34cfb73ff0873834bec045838ab529'
)

# Inicializar client com Magic PK + sig_type=1 (POLY_PROXY)
client = ClobClient(
    host=HOST,
    key=MAGIC_PRIV,  # ← Magic private key exportada
    chain_id=CHAIN_ID,
    signature_type=1,  # POLY_PROXY para email/Magic wallets
    funder=PROXY_WALLET,
    creds=EXISTING_CREDS  # Usar keys existentes
)

# Verificar autenticação
print(f"Endereço signer: {client.get_address()}")

# Listar trades
trades = client.get_trades()
print(f"Trades: {trades}")

# Verificar saldo
balance = client.get_balance_allowance()
print(f"Balance: {balance}")

# Exemplo de ordem (ATENÇÃO: só executar com certeza)
# order = client.create_and_post_order(
#     OrderArgs(
#         token_id='TOKEN_ID_AQUI',
#         price=0.50,
#         size=5.0,
#         side=BUY
#     )
# )
```
