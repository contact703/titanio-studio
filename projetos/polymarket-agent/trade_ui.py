#!/usr/bin/env python3
"""Execute trade via Polymarket browser UI."""
import os, json, time
from playwright.sync_api import sync_playwright

EMAIL = "tiago@titaniofilms.com"
PASSWORD = "Rita160679"
MARKET_URL = "https://polymarket.com/event/2026-fifa-world-cup-which-countries-qualify"
SS_DIR = '/tmp/poly_trade_ui'
os.makedirs(SS_DIR, exist_ok=True)

def ss(page, name):
    path = f'{SS_DIR}/{name}.png'
    page.screenshot(path=path, full_page=False)
    print(f"  📸 {name}")

def main():
    with sync_playwright() as p:
        print("=== Launch & Login ===")
        browser = p.chromium.launch(headless=False, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 1280, 'height': 900}, locale='en-US')
        page = context.new_page()
        
        # Login
        page.goto('https://polymarket.com', timeout=30000)
        page.wait_for_timeout(3000)
        page.locator('button:has-text("Log In")').first.click()
        page.wait_for_timeout(2000)
        page.locator('#magic-email-input').fill(EMAIL)
        page.wait_for_timeout(500)
        page.locator('button:has-text("Continue")').first.click()
        page.wait_for_timeout(5000)
        
        if 'accounts.google.com' in page.url:
            page.locator('input[type="email"]').fill(EMAIL)
            page.locator('#identifierNext').click()
            page.wait_for_timeout(3000)
            page.locator('input[type="password"]').first.wait_for(state='visible', timeout=10000)
            page.locator('input[type="password"]').fill(PASSWORD)
            page.locator('#passwordNext').click()
            page.wait_for_timeout(10000)
        
        if 'polymarket.com' not in page.url:
            page.goto('https://polymarket.com', timeout=30000)
            page.wait_for_timeout(3000)
        
        wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
        if not wallet:
            print("LOGIN FAILED")
            ss(page, 'fail')
            browser.close()
            return
        
        print(f"Logged in: {wallet}")
        
        # Navigate to Italy market
        print(f"\n=== Navigate to market ===")
        page.goto(MARKET_URL, timeout=30000)
        page.wait_for_timeout(5000)
        ss(page, '01_market')
        
        # Get page content
        body_text = page.evaluate("document.body.innerText")
        print(f"Page title area: {body_text[:300]}")
        
        # Find Italy specifically - it might be a sub-outcome
        # Look for "Italy" on the page
        italy_elements = page.evaluate("""() => {
            const all = Array.from(document.querySelectorAll('*'));
            return all
                .filter(el => el.textContent?.includes('Italy') && el.children.length < 3)
                .map(el => ({tag: el.tagName, text: el.textContent?.trim()?.substring(0, 60), cls: el.className?.substring(0, 40)}))
                .slice(0, 10);
        }""")
        print(f"Italy elements: {italy_elements}")
        
        # Find clickable elements near "Italy"
        print("\nLooking for Italy buy buttons...")
        
        # This is likely a multi-outcome market. Look for Italy row and its Yes/Buy button
        # Try clicking on Italy text first
        italy_link = page.locator('text=Italy').first
        if italy_link.is_visible(timeout=3000):
            print("Found 'Italy' text on page")
            
            # Get parent container
            # Try finding the buy/yes button near Italy
            # In Polymarket multi-outcome markets, each outcome has a Buy Yes / Buy No button
            
            # Try to find a row containing Italy and click its Buy/Yes button
            buy_yes = page.evaluate("""() => {
                const rows = document.querySelectorAll('[class*="outcome"], [class*="Outcome"], tr, [class*="row"], [class*="Row"]');
                for (const row of rows) {
                    if (row.textContent?.includes('Italy')) {
                        const buttons = row.querySelectorAll('button');
                        return Array.from(buttons).map(b => ({text: b.textContent?.trim()?.substring(0, 30), class: b.className?.substring(0, 40)}));
                    }
                }
                // Try a different approach - find all buttons near Italy text
                const italyEl = Array.from(document.querySelectorAll('*')).find(el => 
                    el.childNodes.length === 1 && el.textContent?.trim() === 'Italy'
                );
                if (italyEl) {
                    let parent = italyEl.parentElement;
                    for (let i = 0; i < 5; i++) {
                        const buttons = parent.querySelectorAll('button');
                        if (buttons.length > 0) {
                            return Array.from(buttons).map(b => ({text: b.textContent?.trim()?.substring(0, 30), class: b.className?.substring(0, 40), parent_level: i}));
                        }
                        parent = parent.parentElement;
                        if (!parent) break;
                    }
                }
                return null;
            }""")
            print(f"Buttons near Italy: {buy_yes}")
        
        # Try to click directly on Italy outcome
        print("\nTrying to click Italy outcome link...")
        try:
            # Look for a link to Italy specific market
            italy_href = page.evaluate("""() => {
                const links = document.querySelectorAll('a');
                for (const link of links) {
                    if (link.textContent?.includes('Italy') && link.href?.includes('polymarket.com')) {
                        return link.href;
                    }
                }
                return null;
            }""")
            if italy_href:
                print(f"Found Italy link: {italy_href}")
                page.goto(italy_href, timeout=30000)
                page.wait_for_timeout(5000)
                ss(page, '02_italy_page')
        except Exception as e:
            print(f"Error: {e}")
        
        # Now try to find the trade panel
        print("\n=== Looking for trade panel ===")
        ss(page, '03_current')
        
        # Get ALL buttons on page
        all_buttons = page.evaluate("""() => Array.from(document.querySelectorAll('button'))
            .filter(el => el.offsetParent !== null)
            .map(el => ({
                text: el.textContent?.trim()?.substring(0, 40),
                rect: el.getBoundingClientRect(),
                disabled: el.disabled
            }))""")
        
        buy_buttons = [b for b in all_buttons if b['text'] and ('buy' in b['text'].lower() or 'yes' in b['text'].lower())]
        print(f"Buy/Yes buttons: {buy_buttons[:10]}")
        
        # Try clicking "Buy Yes" or similar for Italy
        for text in ['Buy Yes', 'Yes', 'Buy', 'Bet Yes']:
            try:
                btn = page.locator(f'button:has-text("{text}")').first
                if btn.is_visible(timeout=1000):
                    btn.click()
                    print(f"Clicked: {text}")
                    page.wait_for_timeout(2000)
                    break
            except:
                pass
        
        ss(page, '04_after_click')
        
        # Check for trade panel / amount input
        all_inputs = page.evaluate("""() => Array.from(document.querySelectorAll('input'))
            .filter(el => el.offsetParent !== null)
            .map(el => ({type: el.type, placeholder: el.placeholder, value: el.value, id: el.id}))""")
        print(f"Inputs after click: {all_inputs}")
        
        # Try entering amount
        for sel in ['input[placeholder*="0"]', 'input[placeholder*="$"]', 'input[placeholder*="Amount"]', 'input[type="number"]', 'input[type="text"]:not(#search-input):not(#homepage-search-input)']:
            try:
                inp = page.locator(sel).first
                if inp.is_visible(timeout=1000):
                    # Check if it's not a search input
                    placeholder = inp.get_attribute('placeholder') or ''
                    if 'search' not in placeholder.lower():
                        inp.click()
                        inp.fill('')
                        inp.type('5')
                        print(f"Entered 5 in: {sel} (placeholder: {placeholder})")
                        page.wait_for_timeout(1500)
                        break
            except:
                pass
        
        ss(page, '05_amount')
        
        # Now click Buy/Confirm
        for text in ['Buy', 'Comprar', 'Place Order', 'Confirm', 'Submit Order']:
            try:
                btn = page.locator(f'button:has-text("{text}")').first
                if btn.is_visible(timeout=1000) and not btn.is_disabled():
                    btn.click()
                    print(f"Clicked BUY: {text}")
                    page.wait_for_timeout(8000)
                    break
            except:
                pass
        
        ss(page, '06_result')
        
        # Final state
        result_text = page.evaluate("document.body.innerText.substring(0, 1000)")
        print(f"\nFinal page: {result_text[:400]}")
        
        # Check portfolio
        print("\n=== Check portfolio ===")
        page.goto('https://polymarket.com/portfolio', timeout=30000)
        page.wait_for_timeout(5000)
        portfolio_text = page.evaluate("document.body.innerText.substring(0, 500)")
        print(f"Portfolio: {portfolio_text[:300]}")
        ss(page, '07_portfolio')
        
        browser.close()
        
        # Save result
        with open('/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/TRADE-RESULTADO.md', 'w') as f:
            f.write("# Trade Result\n\n")
            f.write(f"## Wallet: {wallet}\n")
            f.write(f"## Market: 2026 FIFA World Cup - Italy\n\n")
            f.write(f"### Final page state:\n{result_text[:500]}\n\n")
            f.write(f"### Portfolio:\n{portfolio_text[:500]}\n\n")
            f.write(f"### Screenshots in: {SS_DIR}/\n")

if __name__ == '__main__':
    main()
