#!/usr/bin/env python3
"""Find correct Polymarket URLs and debug the page structure."""

from playwright.sync_api import sync_playwright
import time
import os

DATA_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/data"

def screenshot(page, name):
    path = os.path.join(DATA_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=False)
    print(f"  Screenshot: {path}")

def main():
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
        
        # Step 1: Login
        print("[1] Going to Polymarket...")
        page.goto("https://polymarket.com", wait_until="domcontentloaded")
        page.wait_for_timeout(3000)
        
        # Click Entrar
        print("[2] Clicking Entrar...")
        try:
            entrar_btn = page.locator('button:has-text("Entrar"), a:has-text("Entrar")').first
            entrar_btn.click()
            page.wait_for_timeout(2000)
            screenshot(page, "debug-login-modal")
        except Exception as e:
            print(f"  Error clicking Entrar: {e}")
            screenshot(page, "debug-no-entrar")
            browser.close()
            return
        
        # Look for Google button in modal
        print("[3] Looking for Google in modal...")
        # Let's dump the modal content
        try:
            modal = page.locator('[role="dialog"], .modal, [class*="modal"], [class*="Modal"]').first
            if modal.is_visible(timeout=3000):
                modal_html = modal.inner_html()
                print(f"  Modal HTML (first 2000 chars):\n{modal_html[:2000]}")
            else:
                print("  No modal found, checking page...")
                # Maybe it's not a modal but inline
                body_html = page.inner_html('body')
                # Look for Google references
                import re
                google_refs = re.findall(r'[^<]*[Gg]oogle[^>]*', body_html)
                for ref in google_refs[:10]:
                    print(f"  Google ref: {ref[:200]}")
        except Exception as e:
            print(f"  Error: {e}")
        
        screenshot(page, "debug-after-entrar")
        
        # Try clicking Google
        print("[4] Trying to click Google...")
        google_selectors = [
            'button:has-text("Google")',
            'text=Google',
            '[data-provider="google"]',
            'img[alt*="Google"]',
            'div:has-text("Google")',
        ]
        
        for sel in google_selectors:
            try:
                locs = page.locator(sel)
                count = locs.count()
                print(f"  Selector '{sel}': {count} matches")
                if count > 0:
                    for i in range(min(count, 3)):
                        try:
                            txt = locs.nth(i).inner_text(timeout=500)
                            vis = locs.nth(i).is_visible(timeout=500)
                            print(f"    [{i}] text='{txt}', visible={vis}")
                        except:
                            print(f"    [{i}] (could not get text/visibility)")
            except Exception as e:
                print(f"  Selector '{sel}': error - {e}")
        
        # Try clicking the first visible Google element
        clicked = False
        for sel in ['button:has-text("Google")', 'text=Google']:
            try:
                loc = page.locator(sel).first
                if loc.is_visible(timeout=1000):
                    loc.click()
                    clicked = True
                    print(f"  Clicked: {sel}")
                    break
            except:
                continue
        
        if not clicked:
            # Maybe it's an image/icon we need to click
            try:
                # Dump all buttons in the login area
                buttons = page.locator('button:visible')
                print(f"\n  All visible buttons ({buttons.count()}):")
                for i in range(buttons.count()):
                    btn = buttons.nth(i)
                    try:
                        txt = btn.inner_text(timeout=500)
                        print(f"    [{i}] '{txt}'")
                    except:
                        print(f"    [{i}] (no text)")
            except:
                pass
        
        if clicked:
            page.wait_for_timeout(5000)
            screenshot(page, "debug-after-google")
            
            # Check all pages for Google auth
            for i, pg in enumerate(context.pages):
                print(f"  Page {i}: {pg.url}")
                if "accounts.google.com" in pg.url:
                    screenshot(pg, "debug-google-auth")
                    
                    # Fill email
                    try:
                        pg.wait_for_selector('input[type="email"]', timeout=5000)
                        pg.fill('input[type="email"]', 'tiago@titaniofilms.com')
                        pg.keyboard.press('Enter')
                        pg.wait_for_timeout(3000)
                        screenshot(pg, "debug-after-email")
                        
                        pg.wait_for_selector('input[type="password"]', timeout=5000)
                        pg.fill('input[type="password"]', 'Rita160679')
                        pg.keyboard.press('Enter')
                        pg.wait_for_timeout(8000)
                        screenshot(page, "debug-logged-in")
                        print(f"  Main page URL after login: {page.url}")
                    except Exception as e:
                        print(f"  Login flow error: {e}")
                        screenshot(pg, "debug-login-error")
        
        # Now search for the markets
        print("\n[5] Searching for markets...")
        page.wait_for_timeout(2000)
        
        searches = [
            ("Thunder NBA Finals", "thunder"),
            ("Jesus Christ GTA", "jesus christ"),
            ("Avalanche Stanley Cup", "avalanche"),
        ]
        
        for market_name, search_term in searches:
            print(f"\n  Searching: {search_term}")
            try:
                # Click search
                search_input = page.locator('input[placeholder*="Pesquisa"], input[placeholder*="Search"], input[type="search"]').first
                search_input.click()
                page.wait_for_timeout(500)
                search_input.fill(search_term)
                page.wait_for_timeout(2000)
                screenshot(page, f"debug-search-{search_term.replace(' ', '-')}")
                
                # Get search results
                results = page.locator('a[href*="/event/"]')
                count = results.count()
                print(f"  Found {count} result links")
                for i in range(min(count, 5)):
                    try:
                        href = results.nth(i).get_attribute('href')
                        txt = results.nth(i).inner_text(timeout=500)
                        print(f"    [{i}] {href} - '{txt[:80]}'")
                    except:
                        pass
                
                # Clear search
                search_input.fill('')
                page.wait_for_timeout(500)
                
            except Exception as e:
                print(f"  Search error: {e}")
        
        page.wait_for_timeout(2000)
        browser.close()

if __name__ == "__main__":
    main()
