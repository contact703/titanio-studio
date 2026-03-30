#!/usr/bin/env python3
"""Execute trade - click the correct Buy Yes submit button."""
import os, json, time
from playwright.sync_api import sync_playwright

EMAIL = "tiago@titaniofilms.com"
PASSWORD = "Rita160679"
MARKET_URL = "https://polymarket.com/event/2026-fifa-world-cup-which-countries-qualify"
SS_DIR = '/tmp/poly_v6'
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
            print("LOGIN FAILED")
            ss(page, 'login_fail')
            browser.close()
            return
        print(f">>> LOGGED IN: {wallet}")
        
        # === NAVIGATE TO MARKET ===
        print("\n=== Go to Italy qualifying market ===")
        page.goto(MARKET_URL, timeout=30000)
        page.wait_for_timeout(6000)
        ss(page, 'market')
        
        # === CLICK ITALY "Buy Yes 76¢" in the listing ===
        print("\n=== Click Italy Buy Yes in listing ===")
        # Italy is the FIRST outcome, so first "Buy Yes" button
        buy_yes_buttons = page.locator('button:has-text("Buy Yes")').all()
        print(f"Found {len(buy_yes_buttons)} 'Buy Yes' buttons")
        
        if buy_yes_buttons:
            # First Buy Yes is Italy's
            buy_yes_buttons[0].click()
            print("  Clicked first Buy Yes (Italy)")
            page.wait_for_timeout(3000)
        
        ss(page, 'trade_panel_open')
        
        # === ENTER AMOUNT $5 ===
        print("\n=== Enter $5 ===")
        amount_input = page.locator('#market-order-amount-input').first
        if amount_input.is_visible(timeout=3000):
            amount_input.click()
            amount_input.fill('5')
            print("  Entered $5")
            page.wait_for_timeout(3000)
        else:
            print("  Amount input not visible!")
            # Try the +$5 quick button
            try:
                page.locator('button:has-text("+$5")').first.click()
                print("  Clicked +$5 button")
                page.wait_for_timeout(3000)
            except:
                pass
        
        ss(page, 'amount_5')
        
        # === CLICK THE SUBMIT "Buy Yes" BUTTON ===
        # This is in the trade sidebar, at y~591 vs the "Buy" tab at y~233
        # It's the one with non-breaking space: "Buy\xa0Yes"
        print("\n=== Click submit Buy Yes button ===")
        
        # Find the submit button specifically in the trade sidebar
        # It should be the last "Buy Yes" type button, below the amount input
        submit_result = page.evaluate("""() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            
            // Find all "Buy Yes" buttons with their positions
            const buyYesButtons = buttons.filter(b => {
                const text = b.textContent?.trim();
                return text && (text === 'Buy Yes' || text === 'Buy\\u00a0Yes' || text.match(/^Buy\\s*Yes$/));
            }).map(b => ({
                text: b.textContent?.trim(),
                y: b.getBoundingClientRect().y,
                x: b.getBoundingClientRect().x,
                width: b.getBoundingClientRect().width,
                disabled: b.disabled,
                className: b.className?.substring(0, 60)
            }));
            
            return buyYesButtons;
        }""")
        print(f"Buy Yes buttons found: {submit_result}")
        
        # The submit button is the one at the bottom of the trade panel (higher y)
        # From previous run: sidebar is around x=933, y=591
        clicked_submit = False
        
        if submit_result and len(submit_result) > 0:
            # Sort by y position, pick the one with highest y (lowest on page = submit button)
            sidebar_buttons = [b for b in submit_result if b['x'] > 850]  # In the sidebar area
            if sidebar_buttons:
                target = max(sidebar_buttons, key=lambda b: b['y'])
                print(f"  Target submit button: y={target['y']}, disabled={target['disabled']}")
                
                # Click by position
                page.mouse.click(target['x'] + target['width']/2, target['y'] + 20)
                print("  Clicked submit button by position!")
                clicked_submit = True
                page.wait_for_timeout(10000)
            else:
                print(f"  No sidebar buttons found, all buttons: {submit_result}")
        
        if not clicked_submit:
            # Fallback: try clicking by position based on previous run data
            print("  Fallback: clicking at position (933+50, 591+20)")
            page.mouse.click(983, 611)
            page.wait_for_timeout(10000)
        
        ss(page, 'after_submit')
        
        # === CHECK RESULT ===
        print("\n=== Check result ===")
        
        # Check for any confirmation dialog
        body = page.evaluate("document.body.innerText.substring(0, 800)")
        print(f"Page after trade: {body[:400]}")
        
        # Check balance
        balance_text = page.evaluate("""() => {
            const text = document.body.innerText;
            const matches = text.match(/\\$([\\d.]+)/g);
            return matches?.slice(0, 5) || [];
        }""")
        print(f"Dollar amounts on page: {balance_text}")
        
        # Check portfolio
        print("\n=== Portfolio ===")
        page.goto('https://polymarket.com/portfolio', timeout=30000)
        page.wait_for_timeout(5000)
        portfolio = page.evaluate("document.body.innerText.substring(0, 800)")
        print(f"Portfolio:\n{portfolio[:500]}")
        ss(page, 'portfolio')
        
        # Determine success
        has_italy = 'Italy' in portfolio
        positions_text = portfolio[portfolio.find('Positions'):] if 'Positions' in portfolio else ''
        no_positions = 'No positions found' in portfolio
        
        if has_italy and not no_positions:
            status = "SUCCESS ✅"
        elif no_positions:
            status = "FAILED ❌ - No positions"
        else:
            status = "UNKNOWN ⚠️"
        
        print(f"\n=== {status} ===")
        
        save_result(status, f"""Wallet: {wallet}
Market: 2026 FIFA World Cup: Italy qualifying
Trade: BUY YES $5

Portfolio:
{portfolio[:500]}

Dollar amounts visible: {balance_text}
""")
        
        browser.close()

def save_result(status, details):
    path = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/TRADE-RESULTADO.md'
    with open(path, 'w') as f:
        f.write(f"# Trade Result - Italy YES $5\n\n")
        f.write(f"## Status: {status}\n\n")
        f.write(f"{details}\n\n")
        f.write(f"## Screenshots: {SS_DIR}/\n")
    print(f"Result saved: {status}")

if __name__ == '__main__':
    main()
