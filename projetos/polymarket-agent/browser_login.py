#!/usr/bin/env python3
"""Login to Polymarket via browser and execute trade."""
import os, json, time, imaplib, email, re
from playwright.sync_api import sync_playwright

EMAIL = "tiago@titaniofilms.com"
PASSWORD = "Rita160679"
MARKET_URL = "https://polymarket.com/event/will-italy-qualify-for-the-2026-fifa-world-cup"

def get_magic_link_from_gmail(email_addr, password, wait_seconds=60):
    """Check Gmail via IMAP for Polymarket magic link."""
    print(f"Checking Gmail for magic link...")
    
    # Try different IMAP approaches
    # titaniofilms.com might use Google Workspace
    imap_servers = ['imap.gmail.com', 'imap.titaniofilms.com']
    
    for server in imap_servers:
        try:
            print(f"  Trying IMAP: {server}")
            mail = imaplib.IMAP4_SSL(server)
            mail.login(email_addr, password)
            mail.select('inbox')
            
            # Wait and poll for the magic link email
            start = time.time()
            while time.time() - start < wait_seconds:
                # Search for recent Polymarket emails
                status, messages = mail.search(None, '(FROM "polymarket" UNSEEN)')
                if status == 'OK' and messages[0]:
                    msg_ids = messages[0].split()
                    # Get the latest
                    latest_id = msg_ids[-1]
                    status, msg_data = mail.fetch(latest_id, '(RFC822)')
                    if status == 'OK':
                        msg = email.message_from_bytes(msg_data[0][1])
                        # Extract body
                        body = ""
                        if msg.is_multipart():
                            for part in msg.walk():
                                if part.get_content_type() == 'text/html':
                                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                                    break
                                elif part.get_content_type() == 'text/plain':
                                    body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        else:
                            body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                        
                        # Look for magic link or code
                        # Polymarket uses Magic.link which sends a 6-digit code or a link
                        code_match = re.search(r'\b(\d{6})\b', body)
                        link_match = re.search(r'(https://[^\s"<>]*magic[^\s"<>]*)', body, re.I)
                        link_match2 = re.search(r'(https://[^\s"<>]*polymarket[^\s"<>]*login[^\s"<>]*)', body, re.I)
                        
                        print(f"  Found email! Subject: {msg['Subject']}")
                        if code_match:
                            print(f"  CODE FOUND: {code_match.group(1)}")
                            mail.logout()
                            return {'type': 'code', 'value': code_match.group(1)}
                        if link_match:
                            print(f"  MAGIC LINK FOUND: {link_match.group(1)[:80]}")
                            mail.logout()
                            return {'type': 'link', 'value': link_match.group(1)}
                        if link_match2:
                            print(f"  LOGIN LINK FOUND: {link_match2.group(1)[:80]}")
                            mail.logout()
                            return {'type': 'link', 'value': link_match2.group(1)}
                        
                        # Print body for debugging
                        print(f"  Body preview: {body[:300]}")
                
                print(f"  Waiting... ({int(time.time() - start)}s)")
                time.sleep(5)
            
            mail.logout()
            print(f"  No magic link found after {wait_seconds}s")
        except Exception as e:
            print(f"  IMAP error ({server}): {str(e)[:100]}")
    
    return None

def main():
    # Use a fresh user data dir to avoid conflicts
    user_data_dir = '/tmp/polymarket_browser_session'
    os.makedirs(user_data_dir, exist_ok=True)
    
    with sync_playwright() as p:
        print("=== Launching browser (visible) ===")
        browser = p.chromium.launch(
            headless=False,
            args=['--no-sandbox', '--disable-gpu']
        )
        context = browser.new_context(
            viewport={'width': 1280, 'height': 900}
        )
        page = context.new_page()
        
        print("=== Going to Polymarket ===")
        page.goto('https://polymarket.com', timeout=30000)
        page.wait_for_timeout(3000)
        
        # Take screenshot
        page.screenshot(path='/tmp/poly_01_home.png')
        print("Screenshot saved: /tmp/poly_01_home.png")
        
        # Look for Sign In / Log In button
        print("\n=== Looking for login button ===")
        # Try various selectors
        login_selectors = [
            'button:has-text("Log In")',
            'button:has-text("Sign In")', 
            'button:has-text("Sign Up")',
            'a:has-text("Log In")',
            'a:has-text("Sign In")',
            '[data-testid="login-button"]',
            'text=Log In',
            'text=Sign In',
            'text=Sign up',
        ]
        
        clicked = False
        for sel in login_selectors:
            try:
                el = page.locator(sel).first
                if el.is_visible(timeout=2000):
                    print(f"  Found: {sel}")
                    el.click()
                    clicked = True
                    break
            except:
                pass
        
        if not clicked:
            print("  No login button found, checking page content...")
            # Get all button texts
            buttons = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('button, a')).map(el => ({
                    tag: el.tagName,
                    text: el.textContent?.trim()?.substring(0, 50),
                    href: el.href || '',
                })).filter(el => el.text);
            }""")
            for b in buttons[:20]:
                print(f"    {b['tag']}: {b['text']}")
        
        page.wait_for_timeout(2000)
        page.screenshot(path='/tmp/poly_02_login_modal.png')
        
        # Look for email login option
        print("\n=== Looking for email login option ===")
        email_selectors = [
            'text=Email',
            'text=email',
            'button:has-text("Email")',
            'input[type="email"]',
            'text=Continue with email',
            '[placeholder*="email"]',
            '[placeholder*="Email"]',
        ]
        
        for sel in email_selectors:
            try:
                el = page.locator(sel).first
                if el.is_visible(timeout=2000):
                    print(f"  Found email option: {sel}")
                    if 'input' not in sel:
                        el.click()
                        page.wait_for_timeout(1000)
                    break
            except:
                pass
        
        page.screenshot(path='/tmp/poly_03_email.png')
        
        # Fill email
        print("\n=== Filling email ===")
        email_inputs = [
            'input[type="email"]',
            'input[name="email"]',
            'input[placeholder*="email"]',
            'input[placeholder*="Email"]',
        ]
        
        filled = False
        for sel in email_inputs:
            try:
                el = page.locator(sel).first
                if el.is_visible(timeout=2000):
                    el.fill(EMAIL)
                    print(f"  Filled email: {EMAIL}")
                    filled = True
                    break
            except:
                pass
        
        if not filled:
            # Try finding any visible input
            inputs = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('input')).map(el => ({
                    type: el.type,
                    name: el.name,
                    placeholder: el.placeholder,
                    visible: el.offsetParent !== null
                }));
            }""")
            print(f"  Available inputs: {inputs}")
        
        page.screenshot(path='/tmp/poly_04_email_filled.png')
        
        # Click continue/submit
        print("\n=== Clicking continue ===")
        continue_selectors = [
            'button:has-text("Continue")',
            'button:has-text("Log in")',
            'button:has-text("Sign in")',
            'button:has-text("Submit")',
            'button[type="submit"]',
        ]
        
        for sel in continue_selectors:
            try:
                el = page.locator(sel).first
                if el.is_visible(timeout=2000):
                    print(f"  Clicking: {sel}")
                    el.click()
                    break
            except:
                pass
        
        page.wait_for_timeout(3000)
        page.screenshot(path='/tmp/poly_05_after_submit.png')
        
        # Now we need the magic link/code from email
        print("\n=== Checking email for magic link ===")
        magic = get_magic_link_from_gmail(EMAIL, PASSWORD, wait_seconds=45)
        
        if magic:
            if magic['type'] == 'code':
                # Enter the code
                print(f"Entering code: {magic['value']}")
                code_inputs = page.locator('input').all()
                if len(code_inputs) >= 6:
                    # OTP-style 6 individual inputs
                    for i, digit in enumerate(magic['value']):
                        code_inputs[i].fill(digit)
                else:
                    # Single input
                    page.locator('input').first.fill(magic['value'])
                page.wait_for_timeout(3000)
            elif magic['type'] == 'link':
                print(f"Opening magic link...")
                page.goto(magic['value'], timeout=30000)
                page.wait_for_timeout(5000)
        else:
            print("Could not get magic link from email")
            # Continue anyway, maybe we can check what's on screen
        
        page.screenshot(path='/tmp/poly_06_after_magic.png')
        
        # Check if logged in
        print("\n=== Checking login status ===")
        wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
        print(f"Proxy wallet: {wallet}")
        
        if wallet:
            print(f"\n>>> LOGGED IN! Wallet: {wallet} <<<")
            
            # Navigate to Italy market
            print("\n=== Navigating to Italy market ===")
            page.goto(MARKET_URL, timeout=30000)
            page.wait_for_timeout(5000)
            page.screenshot(path='/tmp/poly_07_market.png')
            
            # Try to buy YES
            print("\n=== Trying to buy YES ===")
            # Look for YES button and amount input
            try:
                # Click YES
                yes_btn = page.locator('button:has-text("Yes")').first
                if yes_btn.is_visible():
                    yes_btn.click()
                    page.wait_for_timeout(1000)
                
                # Find amount input and enter 5
                amount_input = page.locator('input[type="number"], input[placeholder*="Amount"], input[placeholder*="$"]').first
                if amount_input.is_visible():
                    amount_input.fill('5')
                    page.wait_for_timeout(1000)
                
                page.screenshot(path='/tmp/poly_08_trade_setup.png')
                
                # Click Buy
                buy_btn = page.locator('button:has-text("Buy")').first
                if buy_btn.is_visible():
                    buy_btn.click()
                    page.wait_for_timeout(3000)
                
                page.screenshot(path='/tmp/poly_09_trade_result.png')
                print("Trade attempt completed!")
                
            except Exception as e:
                print(f"Trade UI error: {e}")
                page.screenshot(path='/tmp/poly_trade_error.png')
        else:
            print("Not logged in - checking page state...")
            page.screenshot(path='/tmp/poly_not_logged_in.png')
            
            # Get all page text for debugging
            body_text = page.evaluate("document.body.innerText.substring(0, 500)")
            print(f"Page text: {body_text[:300]}")
        
        # Keep browser open briefly for screenshots
        page.wait_for_timeout(2000)
        browser.close()
        print("\n=== Browser closed ===")

if __name__ == '__main__':
    main()
