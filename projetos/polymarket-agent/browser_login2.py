#!/usr/bin/env python3
"""Login to Polymarket via browser (Portuguese UI) and execute trade."""
import os, json, time, imaplib, email, re
from playwright.sync_api import sync_playwright

EMAIL = "tiago@titaniofilms.com"
PASSWORD = "Rita160679"
MARKET_URL = "https://polymarket.com/event/will-italy-qualify-for-the-2026-fifa-world-cup"
SCREENSHOTS_DIR = '/tmp/poly_screenshots'
os.makedirs(SCREENSHOTS_DIR, exist_ok=True)

def ss(page, name):
    path = f'{SCREENSHOTS_DIR}/{name}.png'
    page.screenshot(path=path)
    print(f"  📸 {name}")
    return path

def get_otp_from_imap(email_addr, password, wait_seconds=90):
    """Check IMAP for Polymarket OTP/magic link."""
    print(f"Polling IMAP for OTP...")
    
    # titaniofilms.com is Google Workspace - try app password or regular
    try:
        mail = imaplib.IMAP4_SSL('imap.titaniofilms.com')
        mail.login(email_addr, password)
        mail.select('inbox')
        
        start = time.time()
        while time.time() - start < wait_seconds:
            mail.recent()  # Force refresh
            status, messages = mail.search(None, '(UNSEEN)')
            if status == 'OK' and messages[0]:
                msg_ids = messages[0].split()
                for msg_id in reversed(msg_ids[-5:]):  # Check last 5 unread
                    status, msg_data = mail.fetch(msg_id, '(RFC822)')
                    if status == 'OK':
                        msg = email.message_from_bytes(msg_data[0][1])
                        subject = msg.get('Subject', '')
                        sender = msg.get('From', '')
                        
                        if 'polymarket' in subject.lower() or 'polymarket' in sender.lower() or 'magic' in sender.lower():
                            body = ""
                            if msg.is_multipart():
                                for part in msg.walk():
                                    ct = part.get_content_type()
                                    if ct in ('text/html', 'text/plain'):
                                        body += part.get_payload(decode=True).decode('utf-8', errors='ignore')
                            else:
                                body = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
                            
                            # Look for 6-digit code
                            code_match = re.search(r'\b(\d{6})\b', body)
                            if code_match:
                                print(f"  OTP FOUND: {code_match.group(1)}")
                                mail.logout()
                                return code_match.group(1)
                            
                            # Look for link
                            link_match = re.search(r'(https://auth\.magic\.link/[^\s"<>]+)', body) or \
                                        re.search(r'(https://[^\s"<>]*magic[^\s"<>]*)', body)
                            if link_match:
                                print(f"  Magic link found: {link_match.group(1)[:80]}")
                                mail.logout()
                                return link_match.group(1)
                            
                            print(f"  Email from Polymarket but no code/link. Subject: {subject}")
                            print(f"  Body preview: {body[:200]}")
            
            time.sleep(5)
            print(f"  Waiting... ({int(time.time() - start)}s)")
        
        mail.logout()
    except Exception as e:
        print(f"  IMAP error: {e}")
    
    return None

def main():
    with sync_playwright() as p:
        print("=== Launching browser ===")
        browser = p.chromium.launch(headless=False, args=['--no-sandbox'])
        context = browser.new_context(
            viewport={'width': 1280, 'height': 900},
            locale='en-US'  # Force English
        )
        page = context.new_page()
        
        # Go to Polymarket in English
        print("=== Going to Polymarket ===")
        page.goto('https://polymarket.com?lng=en', timeout=30000)
        page.wait_for_timeout(3000)
        ss(page, '01_home')
        
        # Get all buttons for debugging
        buttons = page.evaluate("""() => Array.from(document.querySelectorAll('button, a[role="button"]')).map(el => el.textContent?.trim()?.substring(0, 40)).filter(Boolean)""")
        print(f"  Buttons: {buttons[:15]}")
        
        # Click login - try English and Portuguese
        print("\n=== Clicking login ===")
        for text in ['Log In', 'Sign In', 'Entrar', 'Cadastre-se', 'Sign Up']:
            try:
                btn = page.locator(f'button:has-text("{text}")').first
                if btn.is_visible(timeout=1000):
                    print(f"  Clicking: {text}")
                    btn.click()
                    page.wait_for_timeout(2000)
                    break
            except:
                pass
        
        ss(page, '02_after_login_click')
        
        # Check what appeared - modal or new page
        print("\n=== Looking for email option ===")
        page.wait_for_timeout(1000)
        
        # Get current dialog/modal content
        modal_text = page.evaluate("""() => {
            const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"], [class*="Modal"]');
            return Array.from(modals).map(m => m.textContent?.substring(0, 300)).join('\\n');
        }""")
        print(f"  Modal content: {modal_text[:200]}")
        
        # Look for all clickable items
        all_clickable = page.evaluate("""() => Array.from(document.querySelectorAll('button, a, [role="button"], [tabindex="0"]'))
            .filter(el => el.offsetParent !== null)
            .map(el => ({text: el.textContent?.trim()?.substring(0, 50), tag: el.tagName}))
            .filter(el => el.text)""")
        print(f"  Clickable items: {[x['text'] for x in all_clickable[:20]]}")
        
        # Try to find and click Email option
        for text in ['Email', 'email', 'E-mail', 'Continue with Email', 'Magic Link', 'Use Email']:
            try:
                el = page.locator(f'text="{text}"').first
                if el.is_visible(timeout=1000):
                    print(f"  Found: {text}")
                    el.click()
                    page.wait_for_timeout(1500)
                    break
            except:
                pass
        
        ss(page, '03_email_option')
        
        # Try to find email input
        print("\n=== Looking for email input ===")
        page.wait_for_timeout(1000)
        
        # Get all inputs
        inputs = page.evaluate("""() => Array.from(document.querySelectorAll('input'))
            .filter(el => el.offsetParent !== null)
            .map(el => ({type: el.type, name: el.name, placeholder: el.placeholder, id: el.id}))""")
        print(f"  Visible inputs: {inputs}")
        
        # Try to fill email in any visible input
        filled = False
        for sel in ['input[type="email"]', 'input[name="email"]', 'input[placeholder*="mail"]', 'input[placeholder*="Mail"]']:
            try:
                inp = page.locator(sel).first
                if inp.is_visible(timeout=1000):
                    inp.fill(EMAIL)
                    print(f"  Filled email in: {sel}")
                    filled = True
                    break
            except:
                pass
        
        if not filled:
            # Try any text input that's visible in a modal
            try:
                inp = page.locator('[role="dialog"] input, .modal input, input[type="text"]').first
                if inp.is_visible(timeout=1000):
                    inp.fill(EMAIL)
                    print(f"  Filled email in generic input")
                    filled = True
            except:
                pass
        
        ss(page, '04_email_filled')
        
        if filled:
            # Click submit
            print("\n=== Submitting email ===")
            for text in ['Continue', 'Log In', 'Sign In', 'Submit', 'Continuar', 'Entrar', 'Next']:
                try:
                    btn = page.locator(f'button:has-text("{text}")').first
                    if btn.is_visible(timeout=1000):
                        print(f"  Clicking: {text}")
                        btn.click()
                        break
                except:
                    pass
            
            page.wait_for_timeout(3000)
            ss(page, '05_after_submit')
            
            # Now poll for the magic link/OTP from email
            print("\n=== Waiting for OTP from email ===")
            otp = get_otp_from_imap(EMAIL, PASSWORD, wait_seconds=90)
            
            if otp:
                if otp.startswith('http'):
                    # It's a link - open in browser
                    print(f"Opening magic link...")
                    page.goto(otp, timeout=30000)
                    page.wait_for_timeout(5000)
                else:
                    # It's a code - enter it
                    print(f"Entering OTP: {otp}")
                    # Check for OTP input fields
                    otp_inputs = page.locator('input').all()
                    visible_inputs = [inp for inp in otp_inputs if inp.is_visible()]
                    
                    if len(visible_inputs) >= 6:
                        # Individual digit inputs
                        for i, digit in enumerate(otp[:6]):
                            visible_inputs[i].fill(digit)
                            page.wait_for_timeout(200)
                    elif len(visible_inputs) >= 1:
                        visible_inputs[0].fill(otp)
                    
                    page.wait_for_timeout(5000)
                
                ss(page, '06_after_otp')
                
                # Check if logged in
                wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
                print(f"Wallet after OTP: {wallet}")
                
                if wallet:
                    print(f"\n>>> LOGGED IN! Wallet: {wallet} <<<")
                    execute_trade(page)
                else:
                    print("Still not logged in after OTP")
                    # Check all auth-related keys
                    auth_keys = page.evaluate("""() => {
                        const result = {};
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key.includes('auth') || key.includes('wallet') || key.includes('magic'))
                                result[key] = localStorage.getItem(key)?.substring(0, 100);
                        }
                        return result;
                    }""")
                    print(f"Auth keys: {json.dumps(auth_keys, indent=2)}")
            else:
                print("No OTP received from email")
                ss(page, '06_no_otp')
        else:
            print("Could not find email input")
            ss(page, '04_no_email_input')
        
        page.wait_for_timeout(2000)
        browser.close()

def execute_trade(page):
    """Execute the trade on the Italy market."""
    MARKET_URL = "https://polymarket.com/event/will-italy-qualify-for-the-2026-fifa-world-cup"
    
    print("\n=== Navigating to Italy market ===")
    page.goto(MARKET_URL, timeout=30000)
    page.wait_for_timeout(5000)
    ss(page, '07_italy_market')
    
    # Click on YES
    print("Looking for YES button...")
    for sel in ['button:has-text("Yes")', 'button:has-text("Sim")', '[data-testid*="yes"]']:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=2000):
                btn.click()
                print(f"  Clicked: {sel}")
                page.wait_for_timeout(1500)
                break
        except:
            pass
    
    ss(page, '08_yes_clicked')
    
    # Enter amount
    print("Entering amount $5...")
    for sel in ['input[type="number"]', 'input[placeholder*="$"]', 'input[placeholder*="Amount"]', 'input[placeholder*="Valor"]']:
        try:
            inp = page.locator(sel).first
            if inp.is_visible(timeout=2000):
                inp.fill('5')
                print(f"  Filled: {sel}")
                page.wait_for_timeout(1000)
                break
        except:
            pass
    
    ss(page, '09_amount_entered')
    
    # Click Buy
    print("Clicking Buy...")
    for sel in ['button:has-text("Buy")', 'button:has-text("Comprar")', 'button:has-text("Place Order")']:
        try:
            btn = page.locator(sel).first
            if btn.is_visible(timeout=2000):
                btn.click()
                print(f"  Clicked: {sel}")
                page.wait_for_timeout(5000)
                break
        except:
            pass
    
    ss(page, '10_trade_result')
    
    # Check for confirmation
    page_text = page.evaluate("document.body.innerText.substring(0, 1000)")
    print(f"Page after trade: {page_text[:300]}")

if __name__ == '__main__':
    main()
