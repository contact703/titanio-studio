# 🎯 Como Executar Trades no Polymarket — Processo Definitivo

**Data descoberta:** 2026-03-27  
**Método:** Playwright browser automation via Google OAuth  
**Status:** ✅ FUNCIONANDO — Italy YES $5 executado com sucesso

---

## ✅ O QUE FUNCIONOU

### Login
- **Email:** tiago@titaniofilms.com  
- **Método:** Google OAuth (NÃO Magic email — usamos o botão "Continuar com Google")
- **Senha Google:** Rita160679

### Stack Técnica
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()
    page.goto('https://polymarket.com')
    
    # Login Google OAuth
    page.click('button:has-text("Entrar")')  # ou "Sign In"
    page.click('text=Google')  # botão Google
    page.fill('input[type="email"]', 'tiago@titaniofilms.com')
    page.click('button:has-text("Próxima")')
    page.fill('input[type="password"]', 'Rita160679')
    page.click('button:has-text("Próxima")')
    page.wait_for_timeout(3000)
```

### Passo a Passo do Trade (8 passos confirmados)
1. ✅ Login via Google OAuth (tiago@titaniofilms.com)
2. ✅ Navegar para o mercado alvo
3. ✅ Clicar em "Buy Yes" (ou "Buy No")
4. ✅ Preencher valor ($5)
5. ✅ Clicar Submit "Buy Yes"
6. ✅ Aceitar modal de Termos de Uso (aparece na primeira vez)
7. ✅ Clicar "Buy Yes" novamente para confirmar
8. ✅ Toast de confirmação aparece: "Buy $5 on Yes..."

### Screenshots da execução
- `/tmp/poly_v8/01_market.png` — mercado aberto
- `/tmp/poly_v8/02_panel_open.png` — painel de compra aberto
- `/tmp/poly_v8/03_amount.png` — valor preenchido
- `/tmp/poly_v8/04_after_click.png` — modal de Termos
- `/tmp/poly_v8/05_after_accept.png` — após aceitar termos
- `/tmp/poly_v8/06_final.png` — **CONFIRMAÇÃO DO TRADE** ✅

---

## 💰 Resultado do Primeiro Trade

| Campo | Valor |
|-------|-------|
| Mercado | Will Italy qualify for the 2026 FIFA World Cup? |
| Posição | BUY YES |
| Valor | $5.00 |
| Shares | 6.58 shares @ 76¢ |
| Potencial ganho | $6.58 (se Italy qualificar) |
| Saldo antes | $44.86 |
| Saldo depois | $39.86 |
| Wallet | 0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0 |

---

## ⚠️ O QUE NÃO FUNCIONA

1. **Magic email OTP** — precisa de App Password do Gmail para automatizar
2. **API CLOB com HMAC** — headers corretos com underscore (`POLY_API_KEY`) funcionam para leitura (GET), mas POST de ordens requer assinatura EIP-712 do signer correto (0x5a9A... do Tiago via Magic)
3. **py-clob-client com bot wallet** — 401/400 porque signer da ordem ≠ dono das API keys
4. **Chrome profile persistent** — sessão não persiste em disco quando Chrome fecha

---

## 🤖 Script de Automação Completo

```python
from playwright.sync_api import sync_playwright
import time

def execute_trade(market_url, side='yes', amount_usd=5):
    """
    Executa trade no Polymarket via browser.
    side: 'yes' ou 'no'
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        # 1. Login
        page.goto('https://polymarket.com')
        page.click('button:has-text("Entrar")')
        time.sleep(1)
        
        # Clicar Google
        page.click('[data-provider="google"], button:has-text("Google")')
        time.sleep(2)
        
        # Preencher email
        page.fill('input[type="email"]', 'tiago@titaniofilms.com')
        page.click('button[type="submit"], button:has-text("Próxima")')
        time.sleep(1)
        
        # Preencher senha
        page.fill('input[type="password"]', 'Rita160679')
        page.click('button[type="submit"], button:has-text("Próxima")')
        time.sleep(3)
        
        # 2. Navegar para o mercado
        page.goto(market_url)
        time.sleep(3)
        
        # 3. Clicar YES ou NO
        page.click(f'button:has-text("{side.upper()}")')
        time.sleep(1)
        
        # 4. Preencher valor
        page.fill('input[type="number"], input[placeholder*="0.00"]', str(amount_usd))
        time.sleep(0.5)
        
        # 5. Clicar Buy
        page.click(f'button:has-text("Buy {side.capitalize()}")')
        time.sleep(2)
        
        # 6. Aceitar termos (se aparecer)
        try:
            terms_btn = page.locator('button:has-text("Accept"), button:has-text("Aceitar")').first
            if terms_btn.is_visible(timeout=2000):
                terms_btn.click()
                time.sleep(1)
                # Confirmar novamente
                page.click(f'button:has-text("Buy {side.capitalize()}")')
                time.sleep(2)
        except:
            pass
        
        # Verificar confirmação
        toast = page.locator('.toast, [role="alert"]').first
        if toast.is_visible(timeout=3000):
            print(f'✅ Trade confirmado: {toast.text_content()}')
        
        browser.close()

# Uso:
execute_trade(
    'https://polymarket.com/event/will-italy-qualify-for-the-2026-fifa-world-cup',
    side='yes',
    amount_usd=5
)
```

---

## 📊 Mercados com Sinais Fortes (Scanner 27/03)

| Mercado | Posição | Confiança | Sugerido |
|---------|---------|-----------|---------|
| Italy Copa 2026 | YES | 75% | $12 |
| Colorado Stanley Cup | NO | 72% | $8 |
| OKC Thunder NBA Finals | YES | 70% | $10 |

Monitor 24/7 em: `projetos/polymarket-agent/data/latest_scan.json`

---

## 🔄 Próximos Passos

1. ✅ Primeiro trade executado (Italy YES $5)
2. Executar demais trades dos sinais fortes
3. Configurar monitor automático com execução
4. Relatório diário às 10h para Eduardo/Zica

---

**Arquivo salvo em:** `projetos/polymarket-agent/COMO-FAZER-TRADES.md`  
**Lição gravada em:** `memory/2026-03-27.md`
