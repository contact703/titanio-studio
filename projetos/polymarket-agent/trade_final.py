#!/usr/bin/env python3
"""Execute trade on Polymarket - already know login works."""
import os, json, time
from playwright.sync_api import sync_playwright

EMAIL = "tiago@titaniofilms.com"
PASSWORD = "Rita160679"
SS_DIR = '/tmp/poly_trade_final'
os.makedirs(SS_DIR, exist_ok=True)

def ss(page, name):
    path = f'{SS_DIR}/{name}.png'
    page.screenshot(path=path)
    print(f"  📸 {name}")

def main():
    with sync_playwright() as p:
        print("=== Launching browser ===")
        browser = p.chromium.launch(headless=False, args=['--no-sandbox'])
        context = browser.new_context(viewport={'width': 1280, 'height': 900}, locale='en-US')
        page = context.new_page()
        
        # === LOGIN ===
        print("=== Login flow ===")
        page.goto('https://polymarket.com', timeout=30000)
        page.wait_for_timeout(3000)
        
        page.locator('button:has-text("Log In")').first.click()
        page.wait_for_timeout(2000)
        
        page.locator('#magic-email-input').fill(EMAIL)
        page.wait_for_timeout(500)
        
        page.locator('button:has-text("Continue")').first.click()
        page.wait_for_timeout(5000)
        
        # Google OAuth
        if 'accounts.google.com' in page.url:
            print("  Google OAuth detected")
            page.locator('input[type="email"]').fill(EMAIL)
            page.locator('#identifierNext').click()
            page.wait_for_timeout(3000)
            
            page.locator('input[type="password"]').first.wait_for(state='visible', timeout=10000)
            page.locator('input[type="password"]').fill(PASSWORD)
            page.locator('#passwordNext').click()
            page.wait_for_timeout(10000)
        
        # Verify login
        page.wait_for_timeout(3000)
        if 'polymarket.com' not in page.url:
            page.goto('https://polymarket.com', timeout=30000)
            page.wait_for_timeout(3000)
        
        wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
        print(f"Wallet: {wallet}")
        
        if not wallet:
            print("LOGIN FAILED")
            ss(page, 'login_failed')
            browser.close()
            return
        
        print(f">>> LOGGED IN as {wallet} <<<")
        ss(page, '01_logged_in')
        
        # === FIND ITALY MARKET ===
        print("\n=== Searching for Italy World Cup market ===")
        
        # Try different URLs
        market_urls = [
            'https://polymarket.com/event/will-italy-qualify-for-the-2026-fifa-world-cup',
            'https://polymarket.com/event/2026-world-cup-italy',
            'https://polymarket.com/event/italy-2026-world-cup',
        ]
        
        # First try searching
        print("Searching for Italy market...")
        page.goto('https://polymarket.com', timeout=30000)
        page.wait_for_timeout(2000)
        
        # Use search
        search_input = page.locator('#search-input, input[placeholder*="Search"]').first
        if search_input.is_visible(timeout=3000):
            search_input.click()
            search_input.fill('Italy World Cup')
            page.wait_for_timeout(3000)
            ss(page, '02_search_results')
            
            # Get search results
            results = page.evaluate("""() => Array.from(document.querySelectorAll('a[href*="/event/"]'))
                .map(el => ({text: el.textContent?.trim()?.substring(0, 80), href: el.href}))
                .filter(el => el.text.toLowerCase().includes('italy') || el.href.toLowerCase().includes('italy'))""")
            print(f"Italy results: {results}")
            
            if not results:
                # Get all search results
                all_results = page.evaluate("""() => Array.from(document.querySelectorAll('a[href*="/event/"]'))
                    .map(el => ({text: el.textContent?.trim()?.substring(0, 80), href: el.href}))
                    .slice(0, 10)""")
                print(f"All results: {all_results}")
            
            # Try clicking on Italy result
            for sel in ['a:has-text("Italy")', 'text=Italy']:
                try:
                    el = page.locator(sel).first
                    if el.is_visible(timeout=2000):
                        href = el.get_attribute('href')
                        print(f"Found Italy link: {href}")
                        el.click()
                        page.wait_for_timeout(5000)
                        break
                except:
                    pass
        
        ss(page, '03_market_page')
        current_url = page.url
        print(f"Current URL: {current_url}")
        
        # If we didn't find Italy, try the token ID directly via API search
        if 'italy' not in current_url.lower() and '404' in page.evaluate("document.body.innerText.substring(0, 100)"):
            print("\nSearching via CLOB API for the token...")
            # Use the CLOB API to find the market
            market_info = page.evaluate("""async () => {
                try {
                    const resp = await fetch('https://clob.polymarket.com/markets?token_id=21296624965887450804742516563526632324551397901259017139941826024484477821625');
                    return await resp.text();
                } catch(e) {
                    return 'error: ' + e.message;
                }
            }""")
            print(f"Market info: {str(market_info)[:300]}")
        
        # Try searching with different terms
        if 'italy' not in current_url.lower():
            for search_term in ['Italy qualify 2026', 'FIFA World Cup 2026 qualify', 'Italy FIFA']:
                print(f"\nSearching: {search_term}")
                page.goto('https://polymarket.com', timeout=30000)
                page.wait_for_timeout(2000)
                
                search_input = page.locator('#search-input, input[placeholder*="Search"]').first
                if search_input.is_visible(timeout=3000):
                    search_input.click()
                    search_input.fill(search_term)
                    page.wait_for_timeout(3000)
                    
                    # Check for results with links
                    links = page.evaluate("""() => {
                        const allLinks = Array.from(document.querySelectorAll('a'));
                        return allLinks
                            .filter(el => el.textContent?.toLowerCase()?.includes('italy') || el.href?.toLowerCase()?.includes('italy'))
                            .map(el => ({text: el.textContent?.trim()?.substring(0, 80), href: el.href}))
                            .slice(0, 5);
                    }""")
                    if links:
                        print(f"Found: {links}")
                        page.goto(links[0]['href'], timeout=30000)
                        page.wait_for_timeout(5000)
                        break
                    
                    # Also try getting any visible search results
                    visible_results = page.evaluate("""() => {
                        const items = document.querySelectorAll('[class*="SearchResult"], [class*="search-result"], [data-testid*="search"]');
                        return Array.from(items).map(el => ({text: el.textContent?.substring(0, 80), tag: el.tagName})).slice(0, 5);
                    }""")
                    print(f"Visible search items: {visible_results}")
        
        ss(page, '04_final_market')
        
        # === EXECUTE TRADE ===
        print("\n=== Execute Trade ===")
        page_text = page.evaluate("document.body.innerText.substring(0, 500)")
        print(f"Page content: {page_text[:200]}")
        
        # Check if we're on a market page
        if '404' not in page_text[:20]:
            # Try to find and click YES
            print("Looking for trade buttons...")
            
            all_buttons = page.evaluate("""() => Array.from(document.querySelectorAll('button'))
                .filter(el => el.offsetParent !== null)
                .map(el => el.textContent?.trim()?.substring(0, 40))
                .filter(Boolean)""")
            print(f"Buttons: {all_buttons[:20]}")
            
            # Click Yes button
            for sel in ['button:has-text("Yes")', 'button:has-text("Sim")', '[data-testid*="outcome-yes"]']:
                try:
                    btn = page.locator(sel).first
                    if btn.is_visible(timeout=2000):
                        btn.click()
                        print(f"Clicked: {sel}")
                        page.wait_for_timeout(1500)
                        break
                except:
                    pass
            
            ss(page, '05_yes_clicked')
            
            # Find amount input
            all_inputs = page.evaluate("""() => Array.from(document.querySelectorAll('input'))
                .filter(el => el.offsetParent !== null)
                .map(el => ({type: el.type, placeholder: el.placeholder, value: el.value, id: el.id, name: el.name}))""")
            print(f"Inputs: {all_inputs}")
            
            # Enter amount
            for sel in ['input[type="number"]', 'input[placeholder*="Amount"]', 'input[placeholder*="$"]', 'input[placeholder*="0"]']:
                try:
                    inp = page.locator(sel).first
                    if inp.is_visible(timeout=2000):
                        inp.click()
                        inp.fill('5')
                        print(f"Entered $5 in: {sel}")
                        page.wait_for_timeout(1500)
                        break
                except:
                    pass
            
            ss(page, '06_amount')
            
            # Click Buy
            for sel in ['button:has-text("Buy")', 'button:has-text("Comprar")', 'button:has-text("Place")', 'button:has-text("Confirm")', 'button:has-text("Submit")']:
                try:
                    btn = page.locator(sel).first
                    if btn.is_visible(timeout=2000):
                        btn.click()
                        print(f"Clicked: {sel}")
                        page.wait_for_timeout(5000)
                        break
                except:
                    pass
            
            ss(page, '07_after_buy')
            
            # Check result
            result_text = page.evaluate("document.body.innerText.substring(0, 1000)")
            print(f"\nResult: {result_text[:300]}")
        
        # Also try extracting API creds for future use
        print("\n=== Extracting API credentials ===")
        creds_data = page.evaluate("""() => {
            return {
                wallet: localStorage.getItem('polymarket.auth.proxyWallet'),
                token: localStorage.getItem('polymarket.auth.token'),
                creds: localStorage.getItem('poly_clob_api_key_map'),
                magic: localStorage.getItem('magic_auth_id_token'),
            };
        }""")
        print(f"Creds: {json.dumps({k: str(v)[:80] if v else None for k, v in creds_data.items()}, indent=2)}")
        
        # Save creds
        with open('/tmp/poly_session_creds.json', 'w') as f:
            json.dump(creds_data, f, indent=2)
        print("Creds saved to /tmp/poly_session_creds.json")
        
        browser.close()
        print("\n=== Done ===")

if __name__ == '__main__':
    main()
