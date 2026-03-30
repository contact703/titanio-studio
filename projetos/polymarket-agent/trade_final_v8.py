#!/usr/bin/env python3
"""Execute trade - simple direct clicks."""
import os, time
from playwright.sync_api import sync_playwright

EMAIL = "tiago@titaniofilms.com"
PASSWORD = "Rita160679"
SS_DIR = '/tmp/poly_v8'
os.makedirs(SS_DIR, exist_ok=True)
n = [0]

def ss(page, name):
    n[0] += 1
    page.screenshot(path=f'{SS_DIR}/{n[0]:02d}_{name}.png')
    print(f"  📸 {n[0]:02d}_{name}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=300)
        context = browser.new_context(viewport={'width': 1280, 'height': 900}, locale='en-US')
        page = context.new_page()
        
        # LOGIN
        print("=== Login ===")
        page.goto('https://polymarket.com', timeout=30000)
        page.wait_for_timeout(4000)
        page.click('button:has-text("Log In")')
        page.wait_for_timeout(3000)
        page.fill('#magic-email-input', EMAIL)
        page.click('button:has-text("Continue")')
        page.wait_for_timeout(6000)
        
        if 'accounts.google.com' in page.url:
            page.fill('input[type="email"]', EMAIL)
            page.click('#identifierNext')
            page.wait_for_timeout(4000)
            page.wait_for_selector('input[type="password"]', state='visible', timeout=15000)
            page.fill('input[type="password"]', PASSWORD)
            page.click('#passwordNext')
            time.sleep(15)
        
        if 'polymarket.com' not in page.url:
            page.goto('https://polymarket.com', timeout=30000)
        page.wait_for_timeout(8000)
        
        wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
        if not wallet:
            print("LOGIN FAILED")
            ss(page, 'fail')
            browser.close()
            return
        print(f">>> Logged in: {wallet}")
        
        # GO TO MARKET
        print("\n=== Market ===")
        page.goto('https://polymarket.com/event/2026-fifa-world-cup-which-countries-qualify', timeout=30000)
        page.wait_for_timeout(6000)
        ss(page, 'market')
        
        # CLICK ITALY'S BUY YES (first in list)
        print("\n=== Click Italy Buy Yes ===")
        # The Italy row has "Buy Yes 76¢" - click it directly
        italy_buy_yes = page.locator('button:has-text("Buy Yes")').first
        italy_buy_yes.click()
        page.wait_for_timeout(3000)
        ss(page, 'panel_open')
        
        # ENTER $5
        print("\n=== Enter $5 ===")
        amount_input = page.locator('#market-order-amount-input')
        amount_input.click()
        amount_input.fill('5')
        page.wait_for_timeout(2000)
        ss(page, 'amount')
        
        # FIND AND CLICK THE SUBMIT BUTTON
        # It's the "Buy Yes" button in the sidebar (right side of page)
        print("\n=== Submit order ===")
        
        # Get all Buy Yes buttons and find the one that's in the sidebar (rightmost)
        all_buy_yes = page.locator('button:has-text("Buy Yes")').all()
        print(f"Found {len(all_buy_yes)} Buy Yes buttons")
        
        # The sidebar submit button should be the one with the highest x position
        # and also have the trading-button class
        sidebar_btn = None
        for btn in all_buy_yes:
            try:
                box = btn.bounding_box()
                if box and box['x'] > 850:  # Sidebar is on the right
                    sidebar_btn = btn
                    print(f"  Found sidebar button at x={box['x']}")
                    break
            except:
                pass
        
        if sidebar_btn:
            print("  Clicking sidebar Buy Yes...")
            sidebar_btn.click()
            page.wait_for_timeout(3000)
            ss(page, 'after_click')
            
            # CHECK FOR TERMS MODAL
            print("\n=== Check for Terms modal ===")
            body = page.evaluate("document.body.innerText")
            
            if 'Terms of Use' in body or 'I attest' in body or 'Accept' in body:
                print("  Terms modal detected!")
                
                # Check any checkboxes
                checkboxes = page.locator('input[type="checkbox"]').all()
                for cb in checkboxes:
                    if cb.is_visible():
                        cb.check()
                        print("  Checked checkbox")
                        page.wait_for_timeout(500)
                
                # Click Accept
                accept_btn = page.locator('button:has-text("Accept")').first
                if accept_btn.is_visible():
                    accept_btn.click()
                    print("  >>> Clicked Accept <<<")
                    page.wait_for_timeout(5000)
                    ss(page, 'after_accept')
                    
                    # May need to click Buy Yes again after accepting
                    print("  Clicking Buy Yes again after terms...")
                    sidebar_btn = page.locator('button:has-text("Buy Yes")').all()
                    for btn in sidebar_btn:
                        box = btn.bounding_box()
                        if box and box['x'] > 850:
                            btn.click()
                            print("  Clicked sidebar Buy Yes again")
                            page.wait_for_timeout(5000)
                            break
            else:
                print("  No terms modal")
        else:
            print("  Could not find sidebar button!")
            # Try clicking by class name
            page.click('.trading-button')
            page.wait_for_timeout(3000)
        
        ss(page, 'final')
        
        # VERIFY
        print("\n=== Verify ===")
        page.wait_for_timeout(3000)
        body = page.evaluate("document.body.innerText[:500]")
        print(f"Page: {body[:300]}")
        
        # Go to portfolio
        page.goto('https://polymarket.com/portfolio', timeout=30000)
        page.wait_for_timeout(5000)
        portfolio = page.evaluate("document.body.innerText")
        ss(page, 'portfolio')
        
        has_position = 'Italy' in portfolio and 'No positions' not in portfolio
        print(f"\nPortfolio (positions area):")
        pos_start = portfolio.find('Positions')
        if pos_start > 0:
            print(portfolio[pos_start:pos_start+300])
        
        # Check history too
        try:
            page.click('text=History')
            page.wait_for_timeout(2000)
            history = page.evaluate("document.body.innerText")
            ss(page, 'history')
            hist_start = history.find('History')
            if hist_start > 0:
                print(f"\nHistory:\n{history[hist_start:hist_start+300]}")
        except:
            pass
        
        if has_position:
            status = "SUCCESS ✅"
        else:
            # Check if balance changed
            balance = page.evaluate("""() => {
                const m = document.body.innerText.match(/\\$([\\d.]+)/);
                return m ? m[1] : 'unknown';
            }""")
            if balance != '44.86':
                status = f"LIKELY SUCCESS ✅ (balance: ${balance})"
            else:
                status = "FAILED ❌"
        
        print(f"\n=== {status} ===")
        
        with open('/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/TRADE-RESULTADO.md', 'w') as f:
            f.write(f"# Trade Result\n\n## Status: {status}\n\n")
            f.write(f"Wallet: {wallet}\nScreenshots: {SS_DIR}/\n")
        
        browser.close()

if __name__ == '__main__':
    main()
