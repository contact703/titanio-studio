#!/usr/bin/env python3
"""Login to Polymarket via Google OAuth and execute trade."""
import os, json, time
from playwright.sync_api import sync_playwright

EMAIL = "tiago@titaniofilms.com"
PASSWORD = "Rita160679"
MARKET_URL = "https://polymarket.com/event/will-italy-qualify-for-the-2026-fifa-world-cup"
SS_DIR = '/tmp/poly_ss3'
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
        
        print("=== Going to Polymarket ===")
        page.goto('https://polymarket.com', timeout=30000)
        page.wait_for_timeout(3000)
        
        # Click Log In
        print("=== Click Log In ===")
        page.locator('button:has-text("Log In")').first.click()
        page.wait_for_timeout(2000)
        ss(page, '01_login_modal')
        
        # Fill email in the magic-email-input field
        print("=== Fill email ===")
        page.locator('#magic-email-input').fill(EMAIL)
        page.wait_for_timeout(500)
        ss(page, '02_email_filled')
        
        # Click Continue - this will trigger Google OAuth or Magic Link
        print("=== Click Continue ===")
        page.locator('button:has-text("Continue")').first.click()
        page.wait_for_timeout(5000)
        ss(page, '03_after_continue')
        
        # Check if we're on Google OAuth page
        current_url = page.url
        print(f"Current URL: {current_url}")
        
        # Check all pages/popups
        all_pages = context.pages
        print(f"Open pages: {len(all_pages)}")
        for i, pg in enumerate(all_pages):
            print(f"  Page {i}: {pg.url[:80]}")
        
        # Google OAuth might open in a popup
        google_page = None
        for pg in all_pages:
            if 'accounts.google.com' in pg.url:
                google_page = pg
                break
        
        if not google_page and 'accounts.google.com' in page.url:
            google_page = page
        
        if google_page:
            print(f"\n=== Google OAuth found: {google_page.url[:80]} ===")
            
            # Wait for the email input
            google_page.wait_for_timeout(2000)
            
            # Fill email
            try:
                email_input = google_page.locator('input[type="email"]').first
                email_input.fill(EMAIL)
                print("  Filled Google email")
                google_page.wait_for_timeout(500)
                
                # Click Next
                google_page.locator('#identifierNext, button:has-text("Next")').first.click()
                print("  Clicked Next")
                google_page.wait_for_timeout(3000)
                ss(google_page, '04_google_email')
                
                # Fill password
                pwd_input = google_page.locator('input[type="password"]').first
                pwd_input.wait_for(state='visible', timeout=10000)
                pwd_input.fill(PASSWORD)
                print("  Filled password")
                google_page.wait_for_timeout(500)
                
                # Click Next
                google_page.locator('#passwordNext, button:has-text("Next")').first.click()
                print("  Clicked password Next")
                google_page.wait_for_timeout(8000)
                ss(google_page, '05_google_password')
                
                # Check for 2FA prompt
                body_text = google_page.evaluate("document.body.innerText.substring(0, 500)")
                print(f"  Page text: {body_text[:200]}")
                
                # Wait for redirect back to polymarket
                print("  Waiting for redirect to Polymarket...")
                page.wait_for_timeout(10000)
                
            except Exception as e:
                print(f"  Google OAuth error: {e}")
                ss(google_page, '04_google_error')
                body_text = google_page.evaluate("document.body.innerText.substring(0, 500)")
                print(f"  Page text: {body_text[:300]}")
        else:
            print("No Google OAuth page found")
            # Maybe it's a Magic Link flow instead
            body_text = page.evaluate("document.body.innerText.substring(0, 500)")
            print(f"Page text: {body_text[:300]}")
            
            # Check for OTP input
            inputs = page.evaluate("""() => Array.from(document.querySelectorAll('input'))
                .filter(el => el.offsetParent !== null)
                .map(el => ({type: el.type, placeholder: el.placeholder, id: el.id}))""")
            print(f"Visible inputs: {inputs}")
        
        # After login attempt, check Polymarket state
        print("\n=== Checking Polymarket login state ===")
        # Navigate back to polymarket if needed
        if 'polymarket.com' not in page.url:
            page.goto('https://polymarket.com', timeout=30000)
            page.wait_for_timeout(5000)
        
        wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
        print(f"Wallet: {wallet}")
        ss(page, '06_final_state')
        
        if wallet:
            print(f"\n>>> LOGGED IN! Wallet: {wallet} <<<")
            execute_trade(page)
        else:
            print("\nNot logged in. Checking what happened...")
            # Try the "Continue with Google" button approach
            print("\n=== Trying 'Continue with Google' button ===")
            try:
                page.goto('https://polymarket.com', timeout=30000)
                page.wait_for_timeout(3000)
                page.locator('button:has-text("Log In")').first.click()
                page.wait_for_timeout(2000)
                
                # Look for Google button
                google_btn = page.locator('button:has-text("Google"), [data-testid*="google"]').first
                if google_btn.is_visible(timeout=2000):
                    print("  Found Google button, clicking...")
                    
                    # Listen for popup
                    with context.expect_page() as popup_info:
                        google_btn.click()
                    
                    popup = popup_info.value
                    popup.wait_for_load_state()
                    print(f"  Popup URL: {popup.url[:80]}")
                    
                    # Fill Google login in popup
                    popup.locator('input[type="email"]').fill(EMAIL)
                    popup.locator('#identifierNext').click()
                    popup.wait_for_timeout(3000)
                    
                    popup.locator('input[type="password"]').fill(PASSWORD)
                    popup.locator('#passwordNext').click()
                    popup.wait_for_timeout(10000)
                    
                    ss(popup, '07_google_popup')
                    
                    # Wait for popup to close and check main page
                    page.wait_for_timeout(5000)
                    wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
                    print(f"Wallet after Google: {wallet}")
                    
                    if wallet:
                        execute_trade(page)
                    else:
                        body_text = popup.evaluate("document.body.innerText.substring(0, 300)") if not popup.is_closed() else "popup closed"
                        print(f"Popup text: {body_text}")
                else:
                    print("  No Google button found")
                    # List modal content
                    modal_buttons = page.evaluate("""() => Array.from(document.querySelectorAll('[role="dialog"] button, [class*="modal"] button, [class*="Modal"] button'))
                        .map(el => el.textContent?.trim()?.substring(0, 50))
                        .filter(Boolean)""")
                    print(f"  Modal buttons: {modal_buttons}")
            except Exception as e:
                print(f"  Google button error: {e}")
        
        page.wait_for_timeout(2000)
        browser.close()

def execute_trade(page):
    """Execute trade on Italy YES market."""
    MARKET_URL = "https://polymarket.com/event/will-italy-qualify-for-the-2026-fifa-world-cup"
    
    print("\n=== Navigating to Italy market ===")
    page.goto(MARKET_URL, timeout=30000)
    page.wait_for_timeout(5000)
    ss(page, '10_italy_market')
    
    # Get page content
    body_text = page.evaluate("document.body.innerText.substring(0, 1000)")
    print(f"Market page: {body_text[:300]}")
    
    # Look for trade panel
    # Click YES
    for sel in ['button:has-text("Yes")', 'button:has-text("Sim")', '[data-testid*="yes"]', 'text=Yes']:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=2000):
                btn.click()
                print(f"Clicked YES: {sel}")
                page.wait_for_timeout(1500)
                break
        except:
            pass
    
    ss(page, '11_yes_clicked')
    
    # Enter amount
    all_inputs = page.evaluate("""() => Array.from(document.querySelectorAll('input'))
        .filter(el => el.offsetParent !== null)
        .map(el => ({type: el.type, placeholder: el.placeholder, value: el.value, id: el.id}))""")
    print(f"Visible inputs: {all_inputs}")
    
    for sel in ['input[type="number"]', 'input[placeholder*="$"]', 'input[placeholder*="Amount"]', 'input[placeholder*="Valor"]']:
        try:
            inp = page.locator(sel).first
            if inp.is_visible(timeout=2000):
                inp.click()
                inp.fill('5')
                print(f"Entered $5 in: {sel}")
                page.wait_for_timeout(1000)
                break
        except:
            pass
    
    ss(page, '12_amount_entered')
    
    # Click Buy
    for sel in ['button:has-text("Buy")', 'button:has-text("Comprar")', 'button:has-text("Place")', 'button:has-text("Confirm")']:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=2000):
                btn.click()
                print(f"Clicked BUY: {sel}")
                page.wait_for_timeout(5000)
                break
        except:
            pass
    
    ss(page, '13_trade_result')
    body_text = page.evaluate("document.body.innerText.substring(0, 1000)")
    print(f"After trade: {body_text[:300]}")
    
    # Save result
    with open('/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/TRADE-RESULTADO.md', 'w') as f:
        f.write(f"# Trade Result\n\n")
        f.write(f"## Status\n{body_text[:500]}\n")
        f.write(f"\n## Screenshots\nSaved in {SS_DIR}/\n")

if __name__ == '__main__':
    main()
