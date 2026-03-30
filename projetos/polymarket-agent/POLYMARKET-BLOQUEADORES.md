# Polymarket — Bloqueadores e Soluções Pendentes

## O Que Funciona ✅
- Scanner: 100 mercados, filtra oportunidades
- IA: Claude Haiku analisa com confiança/direção
- Monitor 24/7: rodando, salva em data/latest_scan.json
- Autenticação L2 (leitura): GET /data/orders retorna 200 com headers corrigidos
- Saldo confirmado: $44.86 USDC na conta do Tiago
- Login automático via Playwright: chega até a tela OTP

## Bloqueadores 🔴

### 1. Assinatura de Ordens
- Problema: EIP-712 assina com bot wallet (0x2f07...) mas API keys são do signer Tiago (0x5a9A...)
- Resultado: 401 no POST /order
- Solução necessária: private key do signer Magic (0x5a9A...)

### 2. Magic OTP Login
- Login por email gera OTP de 6 dígitos
- Gmail do Tiago (tiago@titaniofilms.com) não aceita IMAP com senha normal
- Precisa: Gmail App Password do Tiago
- Com App Password: login automático completo funciona

### 3. Forma correta dos headers HMAC (DESCOBERTO HOJE)
```
CORRETO (underscore): POLY_API_KEY, POLY_SIGNATURE, POLY_TIMESTAMP, POLY_PASSPHRASE, POLY_ADDRESS
ERRADO (hífen): POLY-ACCESS-KEY, POLY-SIGNATURE, etc.
CORRETO base64: urlsafe_b64decode (não b64decode)
```

## Solução Definitiva
1. Tiago gera App Password no Gmail (2 min)
2. Bot faz login automático via Playwright + OTP do email
3. Com sessão ativa, intercepta os headers de auth reais do browser
4. OU executa trades via interface gráfica (Playwright clica nos botões)
5. Monitor 24/7 + execução automática = lucro

## Credenciais no Cofre
Salvar em cofre/POLYMARKET-CREDENCIAIS.md
