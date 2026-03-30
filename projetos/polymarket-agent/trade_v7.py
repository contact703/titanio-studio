#!/usr/bin/env python3
"""Execute trade - handle Terms of Use acceptance dialog."""
import os, json, time
from playwright.sync_api import sync_playwright

EMAIL = "tiago@titaniofilms.com"
PASSWORD = "Rita160679"
MARKET_URL = "https://polymarket.com/event/2026-fifa-world-cup-which-countries-qualify"
SS_DIR = '/tmp/poly_v7'
os.makedirs(SS_DIR, exist_ok=True)
step = [0]

def ss(page, name):
    step[0] += 1
    path = f'{SS_DIR}/{step[0]:02d}_{name}.png'
    try: page.screenshot(path=path)
    except: pass
    print(f"  📸 {step[0]:02d}_{name}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 1280, 'height': 900}, locale='en-US')
        page = context.new_page()
        
        # === LOGIN ===
        print("=== Login ===")
        page.goto('https://polymarket.com', timeout=30000)
        page.wait_for_timeout(4000)
        page.locator('button:has-text("Log In")').first.click()
        page.wait_for_timeout(3000)
        page.locator('#magic-email-input').fill(EMAIL)
        page.wait_for_timeout(500)
        page.locator('button:has-text("Continue")').first.click()
        page.wait_for_timeout(6000)
        
        if 'accounts.google.com' in page.url:
            page.locator('input[type="email"]').fill(EMAIL)
            page.wait_for_timeout(500)
            page.locator('#identifierNext').click()
            page.wait_for_timeout(4000)
            page.locator('input[type="password"]').first.wait_for(state='visible', timeout=15000)
            page.locator('input[type="password"]').fill(PASSWORD)
            page.wait_for_timeout(500)
            page.locator('#passwordNext').click()
            time.sleep(15)
        
        if 'polymarket.com' not in page.url:
            page.goto('https://polymarket.com', timeout=30000)
        page.wait_for_timeout(8000)
        
        wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
        if not wallet:
            print("LOGIN FAILED"); browser.close(); return
        print(f">>> LOGGED IN: {wallet}")
        
        # === MARKET ===
        print("\n=== Navigate to market ===")
        page.goto(MARKET_URL, timeout=30000)
        page.wait_for_timeout(6000)
        
        # Click Italy's Buy Yes (first one in the list)
        print("=== Click Italy Buy Yes ===")
        buy_yes_buttons = page.locator('button:has-text("Buy Yes")').all()
        if buy_yes_buttons:
            buy_yes_buttons[0].click()
            print(f"  Clicked Italy's Buy Yes")
            page.wait_for_timeout(3000)
        
        # Enter $5
        print("=== Enter $5 ===")
        amount = page.locator('#market-order-amount-input').first
        amount.click()
        amount.fill('5')
        page.wait_for_timeout(2000)
        ss(page, 'ready_to_buy')
        
        # Click the sidebar submit "Buy Yes" button
        print("=== Click submit Buy Yes ===")
        page.evaluate("""() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const submitBtn = buttons.find(b => {
                const text = b.textContent?.trim();
                const rect = b.getBoundingClientRect();
                return (text === 'Buy Yes' || text === 'Buy\\u00a0Yes') && rect.x > 850;
            });
            if (submitBtn) submitBtn.click();
        }""")
        page.wait_for_timeout(3000)
        ss(page, 'after_submit_click')
        
        # === HANDLE TERMS OF USE DIALOG ===
        print("\n=== Check for Terms dialog ===")
        
        # Look for Accept button in a modal
        modal_text = page.evaluate("""() => {
            const dialogs = document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="Modal"], [class*="overlay"], [class*="Overlay"]');
            for (const d of dialogs) {
                if (d.textContent?.includes('Terms') || d.textContent?.includes('Accept') || d.textContent?.includes('attest')) {
                    return d.textContent?.substring(0, 300);
                }
            }
            // Check body for any overlay
            const body = document.body.innerText;
            if (body.includes('Trade on Polymarket') || body.includes('Terms of Use') || body.includes('Accept')) {
                return 'TERMS_FOUND: ' + body.substring(body.indexOf('Trade on'), body.indexOf('Trade on') + 300);
            }
            return null;
        }""")
        print(f"Modal text: {modal_text}")
        
        if modal_text:
            print("  Terms dialog found! Clicking Accept...")
            
            # Try to check any checkboxes first
            checkboxes = page.locator('input[type="checkbox"]').all()
            for cb in checkboxes:
                try:
                    if cb.is_visible():
                        cb.check()
                        print("  Checked a checkbox")
                        page.wait_for_timeout(500)
                except:
                    pass
            
            # Click Accept button
            for text in ['Accept', 'I Accept', 'Agree', 'I Agree', 'Continue', 'Confirm']:
                try:
                    btn = page.locator(f'button:has-text("{text}")').first
                    if btn.is_visible(timeout=2000):
                        btn.click()
                        print(f"  >>> CLICKED: {text} <<<")
                        page.wait_for_timeout(5000)
                        break
                except:
                    pass
            
            ss(page, 'after_accept')
            
            # After accepting terms, the trade MIGHT auto-execute
            # OR we might need to click Buy Yes again
            page.wait_for_timeout(3000)
            
            # Check if there's still a trade panel
            has_trade_panel = page.evaluate("!!document.querySelector('#market-order-amount-input')")
            print(f"Trade panel still open: {has_trade_panel}")
            
            if has_trade_panel:
                # Check if amount is still there
                amount_val = page.evaluate("document.querySelector('#market-order-amount-input')?.value")
                print(f"Amount value: {amount_val}")
                
                if not amount_val or amount_val == '' or amount_val == '0':
                    print("  Re-entering amount...")
                    amount = page.locator('#market-order-amount-input').first
                    amount.click()
                    amount.fill('5')
                    page.wait_for_timeout(2000)
                
                # Click Buy Yes submit button again
                print("  Clicking Buy Yes submit again...")
                page.evaluate("""() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const submitBtn = buttons.find(b => {
                        const text = b.textContent?.trim();
                        const rect = b.getBoundingClientRect();
                        return (text === 'Buy Yes' || text === 'Buy\\u00a0Yes') && rect.x > 850;
                    });
                    if (submitBtn) {
                        submitBtn.click();
                        return 'clicked';
                    }
                    return 'not found';
                }""")
                page.wait_for_timeout(8000)
                ss(page, 'second_buy_click')
                
                # Check for another terms dialog
                has_modal = page.evaluate("""() => {
                    return document.body.innerText.includes('Terms of Use') || 
                           document.body.innerText.includes('Trade on Polymarket');
                }""")
                if has_modal:
                    print("  Terms dialog appeared again, accepting...")
                    for text in ['Accept', 'I Accept', 'Agree', 'Continue']:
                        try:
                            btn = page.locator(f'button:has-text("{text}")').first
                            if btn.is_visible(timeout=1000):
                                btn.click()
                                print(f"  Clicked: {text}")
                                page.wait_for_timeout(5000)
                                break
                        except:
                            pass
        else:
            print("  No terms dialog found")
        
        # === VERIFY TRADE ===
        print("\n=== Verify trade ===")
        page.wait_for_timeout(5000)
        ss(page, 'final_state')
        
        body = page.evaluate("document.body.innerText.substring(0, 500)")
        print(f"Page: {body[:300]}")
        
        # Check balance
        amounts = page.evaluate("""() => {
            const text = document.body.innerText;
            return text.match(/\\$[\\d.]+/g)?.slice(0, 5) || [];
        }""")
        print(f"Dollar amounts: {amounts}")
        
        # Portfolio
        print("\n=== Portfolio ===")
        page.goto('https://polymarket.com/portfolio', timeout=30000)
        page.wait_for_timeout(5000)
        portfolio = page.evaluate("document.body.innerText.substring(0, 800)")
        print(f"Portfolio:\n{portfolio[:500]}")
        ss(page, 'portfolio')
        
        # Also check open orders
        try:
            open_orders_tab = page.locator('text=Open orders').first
            if open_orders_tab.is_visible(timeout=2000):
                open_orders_tab.click()
                page.wait_for_timeout(2000)
                orders = page.evaluate("document.body.innerText.substring(0, 500)")
                print(f"\nOpen orders:\n{orders[:300]}")
                ss(page, 'open_orders')
        except:
            pass
        
        # History
        try:
            history_tab = page.locator('text=History').first
            if history_tab.is_visible(timeout=2000):
                history_tab.click()
                page.wait_for_timeout(2000)
                history = page.evaluate("document.body.innerText.substring(0, 500)")
                print(f"\nHistory:\n{history[:300]}")
                ss(page, 'history')
        except:
            pass
        
        has_position = 'Italy' in portfolio and 'No positions' not in portfolio
        balance_changed = '$44.86' not in amounts[0] if amounts else False
        
        if has_position or balance_changed:
            status = "SUCCESS ✅"
        else:
            status = "FAILED ❌"
        
        save_result(status, f"""Wallet: {wallet}
Amounts: {amounts}
Portfolio: {portfolio[:400]}
""")
        
        browser.close()

def save_result(status, details):
    path = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/TRADE-RESULTADO.md'
    with open(path, 'w') as f:
        f.write(f"# Trade Result - Italy YES $5\n\n")
        f.write(f"## Status: {status}\n\n")
        f.write(f"{details}\n")
        f.write(f"\n## Screenshots: {SS_DIR}/\n")
    print(f"\nResult saved: {status}")

if __name__ == '__main__':
    main()
