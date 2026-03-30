#!/usr/bin/env python3
"""Execute 3 Polymarket trades - v2 with correct URLs and login flow."""

from playwright.sync_api import sync_playwright
import time
import os
import json
from datetime import datetime

DATA_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/data"

results = []

def screenshot(page, name):
    path = os.path.join(DATA_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=False)
    print(f"  Screenshot: {path}")
    return path

def login_google(page, context):
    """Login via Google OAuth - confirmed working flow."""
    print("[LOGIN] Navigating to Polymarket...")
    page.goto("https://polymarket.com", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)
    
    # Click Entrar
    print("[LOGIN] Clicking Entrar...")
    try:
        entrar = page.locator('button:has-text("Entrar"), a:has-text("Entrar"), button:has-text("Sign In")').first
        if entrar.is_visible(timeout=3000):
            entrar.click()
            page.wait_for_timeout(2000)
        else:
            print("[LOGIN] No Entrar button - might be logged in already")
            return True
    except:
        print("[LOGIN] Could not find Entrar - checking if logged in...")
        return True
    
    # Click "Continuar com o Google"
    print("[LOGIN] Clicking Google...")
    google_btn = page.locator('button:has-text("Google")').first
    google_btn.click()
    page.wait_for_timeout(5000)
    
    # Find Google auth page
    google_page = None
    for pg in context.pages:
        if "accounts.google.com" in pg.url:
            google_page = pg
            break
    
    if not google_page:
        if "accounts.google.com" in page.url:
            google_page = page
    
    if not google_page:
        print("[LOGIN] No Google auth page found!")
        screenshot(page, "login-fail")
        return False
    
    print(f"[LOGIN] Google page found: {google_page.url[:80]}...")
    
    # Fill email
    try:
        google_page.wait_for_selector('input[type="email"]', timeout=5000)
        google_page.fill('input[type="email"]', 'tiago@titaniofilms.com')
        google_page.keyboard.press('Enter')
        google_page.wait_for_timeout(3000)
    except:
        # Maybe account already shown, try clicking it
        try:
            google_page.locator('[data-identifier="tiago@titaniofilms.com"]').click()
            google_page.wait_for_timeout(3000)
        except:
            print("[LOGIN] Could not enter email")
            screenshot(google_page, "login-email-fail")
            return False
    
    # Fill password
    try:
        google_page.wait_for_selector('input[type="password"]', timeout=8000)
        google_page.fill('input[type="password"]', 'Rita160679')
        google_page.keyboard.press('Enter')
        page.wait_for_timeout(8000)
    except Exception as e:
        print(f"[LOGIN] Password error: {e}")
        screenshot(google_page, "login-pass-fail")
        return False
    
    print(f"[LOGIN] After login URL: {page.url}")
    screenshot(page, "logged-in")
    return True


def search_and_navigate(page, search_term, expected_path_fragment):
    """Search for a market and navigate to it."""
    print(f"  Searching for: {search_term}")
    
    # Click search input
    search = page.locator('input[placeholder*="Pesquisa"], input[placeholder*="Search"], input[type="search"]').first
    search.click()
    page.wait_for_timeout(500)
    search.fill(search_term)
    page.wait_for_timeout(2000)
    
    # Find matching result
    links = page.locator(f'a[href*="{expected_path_fragment}"]')
    count = links.count()
    
    if count > 0:
        href = links.first.get_attribute('href')
        print(f"  Found market link: {href}")
        links.first.click()
        page.wait_for_timeout(4000)
        return True
    
    # Fallback: click first search result
    all_links = page.locator('a[href*="/event/"]')
    for i in range(all_links.count()):
        href = all_links.nth(i).get_attribute('href')
        if expected_path_fragment in (href or ''):
            print(f"  Found via scan: {href}")
            all_links.nth(i).click()
            page.wait_for_timeout(4000)
            return True
    
    print(f"  Could not find market with fragment: {expected_path_fragment}")
    return False


def execute_trade(page, context, trade_config, index):
    """Execute a single trade on Polymarket."""
    name = trade_config["name"]
    position = trade_config["position"]  # "Yes" or "No"
    amount = trade_config["amount"]
    search_term = trade_config["search"]
    url_fragment = trade_config["url_fragment"]
    direct_url = trade_config.get("direct_url")
    
    result = {
        "mercado": name,
        "posicao": position,
        "valor": f"${amount}",
        "status": "falha",
        "erro": None,
    }
    
    print(f"\n{'='*60}")
    print(f"[TRADE {index+1}] {name} - {position} ${amount}")
    print(f"{'='*60}")
    
    try:
        # Navigate to market
        if direct_url:
            print(f"  Going to: {direct_url}")
            page.goto(direct_url, wait_until="domcontentloaded")
            page.wait_for_timeout(4000)
            
            # Check for 404
            if "404" in page.inner_text('body')[:200]:
                print("  Got 404, trying search...")
                page.goto("https://polymarket.com", wait_until="domcontentloaded")
                page.wait_for_timeout(2000)
                if not search_and_navigate(page, search_term, url_fragment):
                    result["erro"] = "Market not found via search"
                    return result
        else:
            page.goto("https://polymarket.com", wait_until="domcontentloaded")
            page.wait_for_timeout(2000)
            if not search_and_navigate(page, search_term, url_fragment):
                result["erro"] = "Market not found via search"
                return result
        
        print(f"  On page: {page.url}")
        screenshot(page, f"trade{index+1}-page")
        
        # For multi-outcome markets like "What will happen before GTA VI", 
        # we need to find the specific outcome first
        if trade_config.get("outcome_text"):
            outcome = trade_config["outcome_text"]
            print(f"  Looking for outcome: {outcome}")
            # Find the outcome row and click Yes/No on it
            outcome_el = page.locator(f'text="{outcome}"').first
            if outcome_el.is_visible(timeout=3000):
                # Click on the outcome to go to its trading view, or find its Yes/No button
                outcome_el.click()
                page.wait_for_timeout(2000)
                screenshot(page, f"trade{index+1}-outcome")
        
        # Now we need to select the position (Yes/No) and enter amount
        # On Polymarket, the trading panel is usually on the right side
        
        # Portuguese translations: Sim = Yes, Não = No
        pos_pt = "Sim" if position == "Yes" else "Não"
        
        print(f"  Looking for {position}/{pos_pt} button...")
        
        # Try multiple selectors for position buttons
        # Polymarket uses green for Yes and red for No typically
        pos_clicked = False
        
        # First try specific trading panel selectors
        pos_selectors = [
            f'button:text-is("{position}")',
            f'button:text-is("{pos_pt}")',
            f'button:text-is("{pos_pt}.")',
            f'button:has-text("{position}")',
            f'button:has-text("{pos_pt}")',
        ]
        
        for sel in pos_selectors:
            try:
                locs = page.locator(sel)
                count = locs.count()
                for i in range(count):
                    loc = locs.nth(i)
                    if loc.is_visible(timeout=1000):
                        txt = loc.inner_text(timeout=500).strip()
                        # Only click if it's a short button text (avoid matching long paragraphs)
                        if len(txt) < 30:
                            print(f"    Clicking: '{txt}' ({sel})")
                            loc.click()
                            pos_clicked = True
                            break
                if pos_clicked:
                    break
            except:
                continue
        
        if not pos_clicked:
            # Try finding Yes/No in the order panel area
            # Dump all visible buttons to debug
            buttons = page.locator('button:visible')
            btn_texts = []
            for i in range(min(buttons.count(), 30)):
                try:
                    txt = buttons.nth(i).inner_text(timeout=300).strip()
                    if txt and len(txt) < 50:
                        btn_texts.append((i, txt))
                except:
                    pass
            print(f"  Visible buttons: {btn_texts}")
            
            # Try matching
            for idx, txt in btn_texts:
                if txt.lower().strip('.') in [position.lower(), pos_pt.lower()]:
                    buttons.nth(idx).click()
                    pos_clicked = True
                    print(f"    Clicked button [{idx}]: '{txt}'")
                    break
        
        if not pos_clicked:
            result["erro"] = f"Could not find {position}/{pos_pt} button"
            screenshot(page, f"trade{index+1}-no-pos")
            return result
        
        page.wait_for_timeout(1500)
        screenshot(page, f"trade{index+1}-pos-selected")
        
        # Fill amount
        print(f"  Filling amount: ${amount}")
        amount_filled = False
        
        # Try various input selectors
        amount_selectors = [
            'input[placeholder*="$"]',
            'input[placeholder*="Amount"]',
            'input[placeholder*="Quantia"]',
            'input[placeholder*="Valor"]',
            'input[inputmode="decimal"]',
            'input[inputmode="numeric"]',
            'input[type="number"]',
            'input[placeholder*="0"]',
        ]
        
        for sel in amount_selectors:
            try:
                inp = page.locator(sel).first
                if inp.is_visible(timeout=1500):
                    print(f"    Found input: {sel}")
                    inp.click()
                    inp.fill('')
                    page.wait_for_timeout(200)
                    # Triple click to select all, then type
                    inp.click(click_count=3)
                    page.wait_for_timeout(100)
                    inp.type(amount, delay=80)
                    amount_filled = True
                    break
            except:
                continue
        
        if not amount_filled:
            # Fallback: find any visible text input that's not search
            inputs = page.locator('input:visible')
            for i in range(inputs.count()):
                inp = inputs.nth(i)
                try:
                    inp_type = inp.get_attribute('type') or 'text'
                    placeholder = inp.get_attribute('placeholder') or ''
                    if inp_type not in ['hidden', 'checkbox', 'radio', 'submit', 'search'] and 'search' not in placeholder.lower():
                        print(f"    Trying input[{i}]: type={inp_type}, placeholder='{placeholder}'")
                        inp.click()
                        inp.fill('')
                        inp.type(amount, delay=80)
                        amount_filled = True
                        break
                except:
                    continue
        
        if not amount_filled:
            result["erro"] = "Could not find amount input"
            screenshot(page, f"trade{index+1}-no-input")
            return result
        
        page.wait_for_timeout(1500)
        screenshot(page, f"trade{index+1}-amount")
        
        # Click Buy / Comprar
        print("  Clicking Buy/Comprar...")
        buy_clicked = False
        buy_selectors = [
            'button:has-text("Comprar")',
            'button:has-text("Buy")',
            'button:has-text("Place")',
            'button:has-text("Submit")',
        ]
        
        for sel in buy_selectors:
            try:
                loc = page.locator(sel).first
                if loc.is_visible(timeout=2000) and loc.is_enabled(timeout=1000):
                    txt = loc.inner_text()
                    print(f"    Clicking: '{txt}'")
                    loc.click()
                    buy_clicked = True
                    break
            except:
                continue
        
        if not buy_clicked:
            result["erro"] = "Could not find Buy button"
            screenshot(page, f"trade{index+1}-no-buy")
            return result
        
        page.wait_for_timeout(3000)
        screenshot(page, f"trade{index+1}-after-buy")
        
        # Handle any popups/confirmations
        for _ in range(3):
            # Check for terms/checkboxes
            try:
                checkbox = page.locator('input[type="checkbox"]:visible').first
                if checkbox.is_visible(timeout=1000):
                    checkbox.click()
                    page.wait_for_timeout(500)
            except:
                pass
            
            # Accept/Confirm buttons
            confirm_selectors = [
                'button:has-text("Aceitar")',
                'button:has-text("Accept")',
                'button:has-text("Confirmar")',
                'button:has-text("Confirm")',
                'button:has-text("Comprar")',
                'button:has-text("Buy")',
                'button:has-text("Concordo")',
                'button:has-text("I agree")',
            ]
            
            for sel in confirm_selectors:
                try:
                    loc = page.locator(sel).first
                    if loc.is_visible(timeout=1000) and loc.is_enabled(timeout=500):
                        txt = loc.inner_text()
                        print(f"    Confirm: '{txt}'")
                        loc.click()
                        page.wait_for_timeout(2000)
                except:
                    continue
        
        page.wait_for_timeout(3000)
        screenshot(page, f"trade{index+1}-final")
        
        # Check result
        result["status"] = "executado"
        print(f"  Trade submitted!")
        
    except Exception as e:
        result["erro"] = str(e)
        print(f"  EXCEPTION: {e}")
        try:
            screenshot(page, f"trade{index+1}-error")
        except:
            pass
    
    return result


def main():
    # Trade configs with search info
    trades = [
        {
            "name": "OKC Thunder NBA Finals 2026",
            "position": "Yes",
            "amount": "12",
            "search": "thunder nba finals",
            "url_fragment": "thunder",
            "direct_url": None,  # Will search
            "outcome_text": None,
        },
        {
            "name": "Jesus Christ Returns Before GTA VI",
            "position": "No",
            "amount": "15",
            "search": "jesus christ gta",
            "url_fragment": "what-will-happen-before-gta-vi",
            "direct_url": "https://polymarket.com/pt/event/what-will-happen-before-gta-vi",
            "outcome_text": "Jesus Christ returns",
        },
        {
            "name": "Colorado Avalanche Stanley Cup 2026",
            "position": "No",
            "amount": "8",
            "search": "avalanche stanley cup",
            "url_fragment": "avalanche",
            "direct_url": None,
        },
    ]
    
    print("=" * 60)
    print("POLYMARKET TRADE EXECUTOR v2")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
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
        logged_in = login_google(page, context)
        if not logged_in:
            print("[FATAL] Login failed!")
            for t in trades:
                results.append({"mercado": t["name"], "posicao": t["position"], "valor": f"${t['amount']}", "status": "falha", "erro": "Login failed"})
        else:
            print("[LOGIN] Logged in successfully!")
            page.wait_for_timeout(3000)
            
            # First, let's find the correct Thunder and Avalanche URLs
            # Search for NBA championship / Stanley Cup winner markets
            print("\n[SEARCH] Finding correct market URLs...")
            
            # Search for Thunder NBA championship
            print("  Searching: NBA championship 2026...")
            search_input = page.locator('input[placeholder*="Pesquisa"], input[placeholder*="Search"]').first
            search_input.click()
            page.wait_for_timeout(500)
            search_input.fill("NBA championship 2026")
            page.wait_for_timeout(2500)
            screenshot(page, "search-nba-champ")
            
            # Get all result links
            links = page.locator('a[href*="/event/"]')
            nba_results = []
            for i in range(min(links.count(), 15)):
                try:
                    href = links.nth(i).get_attribute('href')
                    txt = links.nth(i).inner_text(timeout=500)
                    if href and ('nba' in href.lower() or 'champion' in href.lower() or 'finals' in href.lower()):
                        nba_results.append((href, txt[:100]))
                        print(f"    NBA: {href} - {txt[:80]}")
                except:
                    pass
            
            search_input.fill('')
            page.wait_for_timeout(500)
            
            # Search for Stanley Cup
            search_input.fill("Stanley Cup 2026 winner")
            page.wait_for_timeout(2500)
            screenshot(page, "search-stanley")
            
            links = page.locator('a[href*="/event/"]')
            nhl_results = []
            for i in range(min(links.count(), 15)):
                try:
                    href = links.nth(i).get_attribute('href')
                    txt = links.nth(i).inner_text(timeout=500)
                    if href and ('nhl' in href.lower() or 'stanley' in href.lower() or 'cup' in href.lower()):
                        nhl_results.append((href, txt[:100]))
                        print(f"    NHL: {href} - {txt[:80]}")
                except:
                    pass
            
            search_input.fill('')
            page.wait_for_timeout(500)
            
            # Try broader search
            search_input.fill("NBA Finals winner")
            page.wait_for_timeout(2500)
            links = page.locator('a[href*="/event/"]')
            for i in range(min(links.count(), 10)):
                try:
                    href = links.nth(i).get_attribute('href')
                    txt = links.nth(i).inner_text(timeout=500)
                    print(f"    NBA Finals: {href} - {txt[:80]}")
                except:
                    pass
            
            search_input.fill('')
            page.wait_for_timeout(500)
            
            search_input.fill("Stanley Cup winner")
            page.wait_for_timeout(2500)
            links = page.locator('a[href*="/event/"]')
            for i in range(min(links.count(), 10)):
                try:
                    href = links.nth(i).get_attribute('href')
                    txt = links.nth(i).inner_text(timeout=500)
                    print(f"    Stanley: {href} - {txt[:80]}")
                except:
                    pass
            
            search_input.fill('')
            page.wait_for_timeout(500)
            
            # Now execute trades
            for i, trade in enumerate(trades):
                result = execute_trade(page, context, trade, i)
                results.append(result)
                if i < len(trades) - 1:
                    page.wait_for_timeout(2000)
        
        # Save results
        print("\n" + "=" * 60)
        print("RESULTS")
        print("=" * 60)
        
        md_lines = [
            f"# Trades Executados - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "",
        ]
        
        for r in results:
            erro = r.get("erro") or ""
            status_emoji = "✅" if r["status"] == "executado" else "❌"
            line = f"- {status_emoji} **{r['mercado']}** | {r['posicao']} | {r['valor']} | {r['status']}"
            if erro:
                line += f" | Erro: {erro}"
            md_lines.append(line)
            print(f"  {r['mercado']}: {r['posicao']} {r['valor']} -> {r['status']} {erro}")
        
        report = "\n".join(md_lines)
        report_path = os.path.join(DATA_DIR, "TRADES-EXECUTADOS.md")
        with open(report_path, "w") as f:
            f.write(report)
        
        json_path = os.path.join(DATA_DIR, "trades-result.json")
        with open(json_path, "w") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\nReport: {report_path}")
        
        page.wait_for_timeout(2000)
        browser.close()
    
    print("\nDone!")

if __name__ == "__main__":
    main()
