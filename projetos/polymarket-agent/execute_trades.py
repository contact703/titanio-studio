#!/usr/bin/env python3
"""Execute 3 Polymarket trades via Playwright."""

from playwright.sync_api import sync_playwright
import time
import os
import json
from datetime import datetime

DATA_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/data"

TRADES = [
    {
        "name": "OKC Thunder NBA Finals 2026",
        "url": "https://polymarket.com/event/will-the-oklahoma-city-thunder-win-the-2026-nba-finals",
        "position": "Yes",
        "amount": "12",
    },
    {
        "name": "Jesus Christ Return Before GTA VI",
        "url": "https://polymarket.com/event/will-jesus-christ-return-before-gta-vi",
        "position": "No",
        "amount": "15",
    },
    {
        "name": "Colorado Avalanche Stanley Cup 2026",
        "url": "https://polymarket.com/event/will-the-colorado-avalanche-win-the-2026-nhl-stanley-cup",
        "position": "No",
        "amount": "8",
    },
]

results = []

def screenshot(page, name):
    path = os.path.join(DATA_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=False)
    print(f"  Screenshot saved: {path}")
    return path

def login_google(page):
    """Login via Google OAuth."""
    print("[LOGIN] Navigating to Polymarket...")
    page.goto("https://polymarket.com", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)
    
    # Check if already logged in by looking for portfolio/balance indicators
    # Try to find Sign In / Entrar / Log In button
    print("[LOGIN] Looking for login button...")
    
    login_selectors = [
        'button:has-text("Sign In")',
        'button:has-text("Log In")', 
        'button:has-text("Entrar")',
        'a:has-text("Sign In")',
        'a:has-text("Log In")',
        'a:has-text("Entrar")',
    ]
    
    clicked = False
    for sel in login_selectors:
        try:
            loc = page.locator(sel).first
            if loc.is_visible(timeout=2000):
                print(f"  Found login button: {sel}")
                loc.click()
                clicked = True
                break
        except:
            continue
    
    if not clicked:
        print("[LOGIN] No login button found - might already be logged in")
        screenshot(page, "login-state")
        return True
    
    page.wait_for_timeout(2000)
    screenshot(page, "login-modal")
    
    # Click Google button
    print("[LOGIN] Looking for Google button...")
    google_selectors = [
        'button:has-text("Google")',
        '[data-provider="google"]',
        'div:has-text("Google"):not(:has(div:has-text("Google")))',
        'img[alt*="Google"]',
        'button:has(img[alt*="Google"])',
        '[aria-label*="Google"]',
    ]
    
    clicked = False
    for sel in google_selectors:
        try:
            loc = page.locator(sel).first
            if loc.is_visible(timeout=2000):
                print(f"  Found Google button: {sel}")
                loc.click()
                clicked = True
                break
        except:
            continue
    
    if not clicked:
        print("[LOGIN] Could not find Google button!")
        screenshot(page, "no-google-btn")
        return False
    
    # Wait for Google login page/popup
    page.wait_for_timeout(4000)
    
    # Handle Google OAuth - might be popup or redirect
    # Check if there's a popup
    all_pages = page.context.pages
    google_page = None
    for p in all_pages:
        if "accounts.google.com" in p.url:
            google_page = p
            break
    
    if google_page is None:
        # Check current page
        if "accounts.google.com" in page.url:
            google_page = page
        else:
            print("[LOGIN] Waiting for Google auth page...")
            page.wait_for_timeout(3000)
            all_pages = page.context.pages
            for p in all_pages:
                if "accounts.google.com" in p.url:
                    google_page = p
                    break
    
    if google_page is None:
        print("[LOGIN] No Google auth page found!")
        screenshot(page, "no-google-page")
        # Try checking all pages
        for i, p in enumerate(page.context.pages):
            print(f"  Page {i}: {p.url}")
        return False
    
    print(f"[LOGIN] Google auth page: {google_page.url}")
    screenshot(google_page, "google-auth")
    
    # Fill email
    print("[LOGIN] Filling email...")
    try:
        google_page.wait_for_selector('input[type="email"]', timeout=10000)
        google_page.fill('input[type="email"]', 'tiago@titaniofilms.com')
        page.wait_for_timeout(500)
        google_page.keyboard.press('Enter')
    except Exception as e:
        print(f"  Email input error: {e}")
        # Maybe already has email, try clicking on account
        try:
            google_page.locator('[data-identifier="tiago@titaniofilms.com"]').click()
        except:
            screenshot(google_page, "email-error")
            return False
    
    page.wait_for_timeout(3000)
    screenshot(google_page, "after-email")
    
    # Fill password
    print("[LOGIN] Filling password...")
    try:
        google_page.wait_for_selector('input[type="password"]', timeout=10000)
        google_page.fill('input[type="password"]', 'Rita160679')
        page.wait_for_timeout(500)
        google_page.keyboard.press('Enter')
    except Exception as e:
        print(f"  Password input error: {e}")
        screenshot(google_page, "password-error")
        return False
    
    # Wait for redirect back to Polymarket
    print("[LOGIN] Waiting for redirect back to Polymarket...")
    page.wait_for_timeout(8000)
    screenshot(page, "after-login")
    
    # Verify we're logged in
    print(f"[LOGIN] Current URL: {page.url}")
    return True


def execute_trade(page, trade, index):
    """Execute a single trade."""
    name = trade["name"]
    url = trade["url"]
    position = trade["position"]  # "Yes" or "No"
    amount = trade["amount"]
    
    result = {
        "mercado": name,
        "posicao": position,
        "valor": f"${amount}",
        "status": "falha",
        "erro": None,
        "screenshot": None,
    }
    
    print(f"\n{'='*60}")
    print(f"[TRADE {index+1}] {name} - {position} ${amount}")
    print(f"{'='*60}")
    
    try:
        # Navigate to market
        print(f"  Navigating to {url}")
        page.goto(url, wait_until="domcontentloaded")
        page.wait_for_timeout(4000)
        screenshot(page, f"trade{index+1}-market")
        
        print(f"  Current URL: {page.url}")
        
        # Click the position button (Yes or No)
        print(f"  Looking for {position} button...")
        
        # Try various selectors for Yes/No buttons
        pos_lower = position.lower()
        pos_selectors = [
            f'button:has-text("{position}")',
            f'[data-testid="{pos_lower}-button"]',
            f'button:text-is("{position}")',
            f'div[role="button"]:has-text("{position}")',
        ]
        
        clicked_pos = False
        for sel in pos_selectors:
            try:
                locs = page.locator(sel)
                count = locs.count()
                if count > 0:
                    for i in range(count):
                        loc = locs.nth(i)
                        if loc.is_visible(timeout=1000):
                            text = loc.inner_text()
                            # Make sure it's the right button (Yes or No, not some other text containing it)
                            if pos_lower in text.lower() and len(text.strip()) < 20:
                                print(f"  Clicking {position} button: '{text}' ({sel})")
                                loc.click()
                                clicked_pos = True
                                break
                if clicked_pos:
                    break
            except Exception as e:
                continue
        
        if not clicked_pos:
            # Try broader approach - look in the trade/order panel
            print(f"  Trying broader search for {position}...")
            try:
                # On Polymarket, Yes/No are often in a toggle-like element
                all_buttons = page.locator('button')
                for i in range(all_buttons.count()):
                    btn = all_buttons.nth(i)
                    try:
                        txt = btn.inner_text(timeout=500)
                        if txt.strip().lower() == pos_lower:
                            print(f"  Found exact match button: '{txt}'")
                            btn.click()
                            clicked_pos = True
                            break
                    except:
                        continue
            except:
                pass
        
        if not clicked_pos:
            result["erro"] = f"Could not find {position} button"
            screenshot(page, f"trade{index+1}-no-position-btn")
            print(f"  ERROR: {result['erro']}")
            return result
        
        page.wait_for_timeout(2000)
        screenshot(page, f"trade{index+1}-after-position")
        
        # Fill amount
        print(f"  Looking for amount input...")
        amount_selectors = [
            'input[placeholder*="Amount"]',
            'input[placeholder*="amount"]',
            'input[placeholder*="$"]',
            'input[type="number"]',
            'input[placeholder*="0"]',
            'input[inputmode="decimal"]',
            'input[inputmode="numeric"]',
        ]
        
        filled = False
        for sel in amount_selectors:
            try:
                loc = page.locator(sel).first
                if loc.is_visible(timeout=2000):
                    print(f"  Found amount input: {sel}")
                    loc.click()
                    loc.fill('')
                    page.wait_for_timeout(300)
                    loc.type(amount, delay=100)
                    filled = True
                    break
            except:
                continue
        
        if not filled:
            # Try finding any visible input in the trade panel
            print("  Trying to find any input field...")
            inputs = page.locator('input:visible')
            for i in range(inputs.count()):
                inp = inputs.nth(i)
                try:
                    placeholder = inp.get_attribute('placeholder') or ''
                    inp_type = inp.get_attribute('type') or ''
                    print(f"    Input {i}: type={inp_type}, placeholder='{placeholder}'")
                    if inp_type not in ['hidden', 'checkbox', 'radio', 'submit']:
                        inp.click()
                        inp.fill('')
                        page.wait_for_timeout(200)
                        inp.type(amount, delay=100)
                        filled = True
                        print(f"    Filled input {i} with {amount}")
                        break
                except:
                    continue
        
        if not filled:
            result["erro"] = "Could not find amount input"
            screenshot(page, f"trade{index+1}-no-amount")
            print(f"  ERROR: {result['erro']}")
            return result
        
        page.wait_for_timeout(1500)
        screenshot(page, f"trade{index+1}-amount-filled")
        
        # Click Buy button
        print("  Looking for Buy button...")
        buy_selectors = [
            'button:has-text("Buy")',
            'button:has-text("Comprar")',
            'button:has-text("Place Order")',
            'button:has-text("Confirm")',
            'button:has-text("Submit")',
        ]
        
        clicked_buy = False
        for sel in buy_selectors:
            try:
                loc = page.locator(sel).first
                if loc.is_visible(timeout=2000) and loc.is_enabled(timeout=1000):
                    txt = loc.inner_text()
                    print(f"  Clicking Buy: '{txt}' ({sel})")
                    loc.click()
                    clicked_buy = True
                    break
            except:
                continue
        
        if not clicked_buy:
            result["erro"] = "Could not find Buy button"
            screenshot(page, f"trade{index+1}-no-buy")
            print(f"  ERROR: {result['erro']}")
            return result
        
        page.wait_for_timeout(3000)
        screenshot(page, f"trade{index+1}-after-buy")
        
        # Handle terms acceptance if needed
        terms_selectors = [
            'button:has-text("Accept")',
            'button:has-text("Aceitar")',
            'button:has-text("I agree")',
            'button:has-text("Agree")',
            'input[type="checkbox"]',
        ]
        
        for sel in terms_selectors:
            try:
                loc = page.locator(sel).first
                if loc.is_visible(timeout=2000):
                    txt = ""
                    try:
                        txt = loc.inner_text(timeout=500)
                    except:
                        pass
                    print(f"  Accepting terms: '{txt}' ({sel})")
                    loc.click()
                    page.wait_for_timeout(1000)
            except:
                continue
        
        # Look for confirmation button
        confirm_selectors = [
            'button:has-text("Confirm")',
            'button:has-text("Confirmar")',
            'button:has-text("Buy")',
            'button:has-text("Place Order")',
            'button:has-text("Submit")',
        ]
        
        for sel in confirm_selectors:
            try:
                loc = page.locator(sel).first
                if loc.is_visible(timeout=2000) and loc.is_enabled(timeout=1000):
                    txt = loc.inner_text()
                    print(f"  Confirming: '{txt}' ({sel})")
                    loc.click()
                    page.wait_for_timeout(3000)
                    break
            except:
                continue
        
        screenshot(page, f"trade{index+1}-final")
        
        # Check for success indicators
        page.wait_for_timeout(2000)
        page_text = page.inner_text('body')
        
        success_indicators = ['success', 'confirmed', 'order placed', 'position', 'portfolio']
        error_indicators = ['error', 'failed', 'insufficient', 'rejected']
        
        is_success = any(ind in page_text.lower() for ind in success_indicators)
        is_error = any(ind in page_text.lower() for ind in error_indicators)
        
        if is_error:
            result["erro"] = "Trade might have failed - error indicator found"
            result["status"] = "incerto"
        else:
            result["status"] = "sucesso" if is_success else "incerto"
        
        screenshot(page, f"trade{index+1}-result")
        result["screenshot"] = f"trade{index+1}-result.png"
        print(f"  Trade result: {result['status']}")
        
    except Exception as e:
        result["erro"] = str(e)
        print(f"  EXCEPTION: {e}")
        try:
            screenshot(page, f"trade{index+1}-error")
        except:
            pass
    
    return result


def main():
    print("=" * 60)
    print("POLYMARKET TRADE EXECUTOR")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Trades: {len(TRADES)}")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        
        # Login
        logged_in = login_google(page)
        if not logged_in:
            print("\n[FATAL] Login failed!")
            for trade in TRADES:
                results.append({
                    "mercado": trade["name"],
                    "posicao": trade["position"],
                    "valor": f"${trade['amount']}",
                    "status": "falha",
                    "erro": "Login failed",
                })
        else:
            print("\n[LOGIN] Success! Proceeding to trades...")
            
            for i, trade in enumerate(TRADES):
                result = execute_trade(page, trade, i)
                results.append(result)
                
                # Wait between trades
                if i < len(TRADES) - 1:
                    print("  Waiting 3s before next trade...")
                    page.wait_for_timeout(3000)
        
        # Save results
        print("\n" + "=" * 60)
        print("RESULTS SUMMARY")
        print("=" * 60)
        
        md_lines = [
            f"# Trades Executados - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "",
            "| Mercado | Posição | Valor | Status | Erro |",
            "|---------|---------|-------|--------|------|",
        ]
        
        for r in results:
            erro = r.get("erro") or "-"
            md_lines.append(f"| {r['mercado']} | {r['posicao']} | {r['valor']} | {r['status']} | {erro} |")
            print(f"  {r['mercado']}: {r['posicao']} {r['valor']} -> {r['status']} {('('+erro+')') if r.get('erro') else ''}")
        
        md_lines.append("")
        md_lines.append("## Screenshots")
        for r in results:
            if r.get("screenshot"):
                md_lines.append(f"- {r['mercado']}: `{r['screenshot']}`")
        
        md_content = "\n".join(md_lines)
        report_path = os.path.join(DATA_DIR, "TRADES-EXECUTADOS.md")
        with open(report_path, "w") as f:
            f.write(md_content)
        print(f"\nReport saved to: {report_path}")
        
        # Also save JSON
        json_path = os.path.join(DATA_DIR, "trades-result.json")
        with open(json_path, "w") as f:
            json.dump(results, f, indent=2)
        
        page.wait_for_timeout(3000)
        browser.close()
    
    print("\nDone!")
    return results


if __name__ == "__main__":
    main()
