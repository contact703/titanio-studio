#!/usr/bin/env python3
"""Execute 3 Polymarket trades - v5. 
Key fixes from v4: robust login, proper submit button detection, correct outcome selection.
"""

from playwright.sync_api import sync_playwright
import time
import os
import json
from datetime import datetime

DATA_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-agent/data"
results = []

def ss(page, name):
    path = os.path.join(DATA_DIR, f"{name}.png")
    page.screenshot(path=path, full_page=False)
    print(f"  📸 {name}")

def login(page, context):
    print("\n🔐 LOGIN")
    page.goto("https://polymarket.com", wait_until="domcontentloaded")
    page.wait_for_timeout(4000)
    ss(page, "v5-home")
    
    # Try to find login button - multiple approaches
    entrar = None
    for sel in ['button:has-text("Entrar")', 'a:has-text("Entrar")', 
                'button:has-text("Sign In")', 'a:has-text("Sign In")',
                'button:has-text("Log In")', 'a:has-text("Log In")']:
        try:
            loc = page.locator(sel).first
            if loc.is_visible(timeout=1500):
                entrar = loc
                print(f"  Found login button: {sel}")
                break
        except:
            continue
    
    if not entrar:
        # Check if we're already logged in by looking for wallet/balance
        try:
            body_text = page.inner_text('body')[:3000]
            if 'Caixa' in body_text or 'Carteira' in body_text or 'Portfolio' in body_text:
                print("  Already logged in (found wallet text)")
                return True
        except:
            pass
        
        # List all visible buttons to debug
        print("  ⚠️ No login button found. Listing buttons...")
        btns = page.locator('button:visible')
        for i in range(min(btns.count(), 15)):
            try:
                txt = btns.nth(i).inner_text(timeout=300).strip()
                print(f"    btn[{i}]: '{txt[:60]}'")
            except:
                pass
        
        # Maybe it's "Cadastre-se" area - look for any auth-related button
        for sel in ['button:has-text("Cadastre")', '[data-testid*="login"]', '[data-testid*="auth"]']:
            try:
                loc = page.locator(sel).first
                if loc.is_visible(timeout=1000):
                    entrar = loc
                    break
            except:
                pass
        
        if not entrar:
            ss(page, "v5-no-login-btn")
            print("  ❌ Cannot find login button and not logged in")
            return False
    
    # Click login button
    print("  Clicking login...")
    entrar.click()
    page.wait_for_timeout(3000)
    ss(page, "v5-after-login-click")
    
    # Find and click Google button in modal
    print("  Looking for Google button...")
    google_clicked = False
    for sel in ['button:has-text("Google")', 'button:has-text("Continuar com o Google")', 
                'text=Google', '[data-provider="google"]']:
        try:
            loc = page.locator(sel).first
            if loc.is_visible(timeout=2000):
                loc.click()
                google_clicked = True
                print(f"  Clicked Google: {sel}")
                break
        except:
            continue
    
    if not google_clicked:
        ss(page, "v5-no-google")
        print("  ❌ No Google button found")
        return False
    
    # Wait for Google auth page
    page.wait_for_timeout(5000)
    
    gp = None
    for pg in context.pages:
        if "accounts.google.com" in pg.url:
            gp = pg
            break
    
    if not gp:
        # Check if redirected in same page
        if "accounts.google.com" in page.url:
            gp = page
        else:
            print("  Waiting more for Google page...")
            page.wait_for_timeout(3000)
            for pg in context.pages:
                if "accounts.google.com" in pg.url:
                    gp = pg
                    break
    
    if not gp:
        ss(page, "v5-no-google-page")
        print(f"  ❌ No Google page. Pages: {[p.url[:50] for p in context.pages]}")
        return False
    
    print(f"  Google page: {gp.url[:60]}...")
    ss(gp, "v5-google")
    
    # Fill email
    print("  Filling email...")
    try:
        gp.wait_for_selector('input[type="email"]', timeout=8000)
        gp.fill('input[type="email"]', 'tiago@titaniofilms.com')
        gp.wait_for_timeout(500)
        gp.keyboard.press('Enter')
        gp.wait_for_timeout(4000)
    except:
        try:
            gp.locator('[data-identifier="tiago@titaniofilms.com"]').click()
            gp.wait_for_timeout(3000)
        except Exception as e:
            print(f"  ❌ Email error: {e}")
            ss(gp, "v5-email-error")
            return False
    
    ss(gp, "v5-after-email")
    
    # Fill password
    print("  Filling password...")
    try:
        gp.wait_for_selector('input[type="password"]', timeout=10000)
        gp.fill('input[type="password"]', 'Rita160679')
        gp.wait_for_timeout(500)
        gp.keyboard.press('Enter')
    except Exception as e:
        print(f"  ❌ Password error: {e}")
        ss(gp, "v5-pass-error")
        return False
    
    # Wait for redirect back to Polymarket
    print("  Waiting for redirect...")
    page.wait_for_timeout(10000)
    
    print(f"  ✅ Login complete. URL: {page.url[:60]}")
    ss(page, "v5-logged-in")
    
    # Verify logged in
    page.wait_for_timeout(2000)
    body = page.inner_text('body')[:3000]
    if 'Caixa' in body or '$' in body[:500]:
        print("  ✅ Confirmed: logged in (found balance)")
    
    return True


def do_trade(page, market_url, outcome_text, position, amount, trade_name, idx):
    result = {"mercado": trade_name, "posicao": position, "valor": f"${amount}", "status": "falha", "erro": None}
    
    print(f"\n{'='*60}")
    print(f"📊 TRADE {idx}: {trade_name}")
    print(f"   {position} ${amount} on '{outcome_text}'")
    print(f"{'='*60}")
    
    try:
        # Navigate
        page.goto(market_url, wait_until="domcontentloaded")
        page.wait_for_timeout(5000)
        ss(page, f"t{idx}-page")
        
        # These are multi-outcome markets. Each row has outcome text + Buy Yes + Buy No buttons.
        # The row buttons have text like "Comprar Sim\nXX¢" or "Comprar Não\nXX¢"
        # When you click a row button, the right-side panel opens for that outcome.
        # The panel has: position toggle (Sim/Não), amount input, and a SUBMIT button.
        # The SUBMIT button says "Comprar Sim" or "Comprar Não" WITHOUT ¢ and is wide.
        
        btn_prefix = "Comprar Sim" if position == "Yes" else "Comprar Não"
        
        # Find outcome text on page
        print(f"  Looking for '{outcome_text}'...")
        found_outcome = False
        for scroll in range(10):
            try:
                loc = page.locator(f'text=/{outcome_text}/i').first
                if loc.is_visible(timeout=1500):
                    box = loc.bounding_box()
                    if box:
                        print(f"  Found at Y={box['y']:.0f}")
                        found_outcome = True
                        break
            except:
                pass
            page.mouse.wheel(0, 300)
            page.wait_for_timeout(500)
        
        if not found_outcome:
            result["erro"] = f"Outcome '{outcome_text}' not found"
            ss(page, f"t{idx}-not-found")
            return result
        
        # Get outcome position
        outcome_loc = page.locator(f'text=/{outcome_text}/i').first
        outcome_box = outcome_loc.bounding_box()
        outcome_y = outcome_box['y']
        
        # Find all row buttons (have ¢ in text) for our position
        all_row_btns = page.locator(f'button:has-text("{btn_prefix}")')
        count = all_row_btns.count()
        print(f"  Found {count} '{btn_prefix}' row buttons")
        
        # Find closest to outcome Y
        best_idx = -1
        best_dist = float('inf')
        for i in range(count):
            btn = all_row_btns.nth(i)
            try:
                box = btn.bounding_box()
                txt = btn.inner_text(timeout=300)
                if box and '¢' in txt:  # Row button (has price)
                    dist = abs(box['y'] - outcome_y)
                    if dist < best_dist:
                        best_dist = dist
                        best_idx = i
            except:
                pass
        
        if best_idx >= 0 and best_dist < 60:
            # Click the row button
            btn = all_row_btns.nth(best_idx)
            txt = btn.inner_text(timeout=300)
            print(f"  Clicking row button [{best_idx}]: '{txt}' (dist={best_dist:.0f}px)")
            btn.scroll_into_view_if_needed()
            page.wait_for_timeout(300)
            btn.click()
        else:
            # Outcome might be at top (featured). Click on outcome text to open panel.
            print(f"  Closest btn dist={best_dist:.0f}px (too far). Clicking outcome text...")
            outcome_loc.click()
            page.wait_for_timeout(2000)
            
            # Now find the row in the list that matches and click its button
            # Or check if trading panel opened
            ss(page, f"t{idx}-clicked-text")
            
            # The outcome text at top is a header. The actual row is in the list below.
            # For markets where the first listed item = the outcome we want,
            # the first row button IS the right one.
            # Let's check if the panel shows our outcome
            
            # Alternative: if the first outcome in the list IS our target, use first row btn
            if best_idx >= 0:
                btn = all_row_btns.nth(best_idx)
                btn.scroll_into_view_if_needed()
                page.wait_for_timeout(300)
                btn.click()
                print(f"  Clicked best available btn (dist={best_dist:.0f}px)")
        
        page.wait_for_timeout(2500)
        ss(page, f"t{idx}-after-row")
        
        # PANEL should now be open. Make sure correct position is selected.
        # The panel toggle has buttons like "Sim XX¢" and "Não XX¢"
        
        # Ensure correct side selected by looking at submit button
        # If position=Yes, submit should say "Comprar Sim" (no ¢)
        # If position=No, submit should say "Comprar Não" (no ¢)
        expected = "Comprar Sim" if position == "Yes" else "Comprar Não"
        wrong = "Comprar Não" if position == "Yes" else "Comprar Sim"
        
        # Check current submit button
        all_btns = page.locator('button:visible')
        current_submit_text = None
        for i in range(all_btns.count()):
            btn = all_btns.nth(i)
            try:
                txt = btn.inner_text(timeout=200).strip()
                box = btn.bounding_box()
                if box and box['width'] > 150 and txt.startswith("Comprar") and '¢' not in txt:
                    current_submit_text = txt
                    break
            except:
                pass
        
        print(f"  Current submit: '{current_submit_text}', expected: '{expected}'")
        
        if current_submit_text and expected not in current_submit_text:
            # Need to toggle position
            toggle_target = "Sim" if position == "Yes" else "Não"
            print(f"  Toggling to {toggle_target}...")
            toggles = page.locator(f'button:has-text("{toggle_target}")')
            for i in range(toggles.count()):
                t = toggles.nth(i)
                try:
                    txt = t.inner_text(timeout=200)
                    box = t.bounding_box()
                    # Panel toggle buttons are small and have ¢
                    if '¢' in txt and box and box['width'] < 200:
                        t.click()
                        page.wait_for_timeout(500)
                        print(f"  Toggled: '{txt}'")
                        break
                except:
                    pass
        
        # Fill amount
        print(f"  Filling amount: ${amount}")
        filled = False
        for sel in ['input[placeholder*="$"]', 'input[placeholder*="Quantia"]', 
                    'input[inputmode="decimal"]', 'input[inputmode="numeric"]',
                    'input[placeholder*="0"]']:
            try:
                inp = page.locator(sel).first
                if inp.is_visible(timeout=1500):
                    inp.click()
                    page.wait_for_timeout(200)
                    # Select all and clear
                    page.keyboard.press('Meta+a')
                    page.keyboard.press('Backspace')
                    page.wait_for_timeout(100)
                    inp.type(amount, delay=80)
                    filled = True
                    print(f"    Filled via {sel}")
                    break
            except:
                continue
        
        if not filled:
            result["erro"] = "No amount input found"
            ss(page, f"t{idx}-no-input")
            return result
        
        page.wait_for_timeout(2000)
        ss(page, f"t{idx}-amount")
        
        # Click submit (the wide panel button WITHOUT ¢)
        print("  Clicking SUBMIT button...")
        submitted = False
        
        all_btns = page.locator('button:visible')
        for i in range(all_btns.count()):
            btn = all_btns.nth(i)
            try:
                txt = btn.inner_text(timeout=200).strip()
                box = btn.bounding_box()
                if not box:
                    continue
                
                # Submit button: starts with "Comprar", NO ¢, width > 150
                if txt.startswith("Comprar") and '¢' not in txt and box['width'] > 150:
                    if btn.is_enabled(timeout=500):
                        print(f"    SUBMIT: '{txt}' (w={box['width']:.0f}, x={box['x']:.0f})")
                        btn.click()
                        submitted = True
                        break
                    else:
                        print(f"    Found but DISABLED: '{txt}'")
            except:
                pass
        
        if not submitted:
            result["erro"] = "Submit button not found or disabled"
            ss(page, f"t{idx}-no-submit")
            return result
        
        page.wait_for_timeout(4000)
        ss(page, f"t{idx}-after-submit")
        
        # Handle confirmations (terms, etc.)
        for _ in range(5):
            any_action = False
            
            # Checkboxes
            try:
                cbs = page.locator('input[type="checkbox"]:visible')
                for ci in range(cbs.count()):
                    cb = cbs.nth(ci)
                    if cb.is_visible(timeout=500) and not cb.is_checked():
                        cb.click()
                        page.wait_for_timeout(500)
                        print(f"    ☑️ Checked checkbox")
                        any_action = True
            except:
                pass
            
            # Confirmation buttons
            for sel in ['button:has-text("Aceitar")', 'button:has-text("Accept")',
                        'button:has-text("Confirmar")', 'button:has-text("Confirm")',
                        'button:has-text("Concordo")', 'button:has-text("I agree")']:
                try:
                    btn = page.locator(sel).first
                    if btn.is_visible(timeout=1000) and btn.is_enabled(timeout=500):
                        box = btn.bounding_box()
                        if box and box['width'] > 80:
                            txt = btn.inner_text(timeout=300)
                            btn.click()
                            page.wait_for_timeout(2000)
                            print(f"    ✅ Confirmed: '{txt}'")
                            any_action = True
                except:
                    continue
            
            # Re-check for submit button (might need to click again after terms)
            try:
                all_btns2 = page.locator('button:visible')
                for i in range(all_btns2.count()):
                    btn = all_btns2.nth(i)
                    txt = btn.inner_text(timeout=200).strip()
                    box = btn.bounding_box()
                    if box and txt.startswith("Comprar") and '¢' not in txt and box['width'] > 150:
                        if btn.is_enabled(timeout=300):
                            btn.click()
                            page.wait_for_timeout(2000)
                            print(f"    🔄 Re-submitted: '{txt}'")
                            any_action = True
                            break
            except:
                pass
            
            if not any_action:
                break
        
        page.wait_for_timeout(3000)
        ss(page, f"t{idx}-final")
        
        # Check if balance changed (crude success check)
        try:
            body = page.inner_text('body')[:5000]
            # Look for any toast/notification
            for indicator in ['sucesso', 'success', 'preenchido', 'filled', 'posição', 'position']:
                if indicator in body.lower():
                    print(f"  ✅ Found indicator: '{indicator}'")
                    break
        except:
            pass
        
        result["status"] = "executado"
        print(f"  Trade flow completed")
        
    except Exception as e:
        result["erro"] = str(e)
        print(f"  ❌ {e}")
        try:
            ss(page, f"t{idx}-error")
        except:
            pass
    
    return result


def main():
    trades = [
        {
            "name": "OKC Thunder - 2026 NBA Champion",
            "url": "https://polymarket.com/pt/event/2026-nba-champion",
            "outcome": "Oklahoma City Thunder",
            "position": "Yes",
            "amount": "12",
        },
        {
            "name": "Jesus Christ Returns Before GTA VI",
            "url": "https://polymarket.com/pt/event/what-will-happen-before-gta-vi",
            "outcome": "Jesus Cristo volta",
            "position": "No",
            "amount": "15",
        },
        {
            "name": "Colorado Avalanche - 2026 Stanley Cup",
            "url": "https://polymarket.com/pt/event/2026-nhl-stanley-cup-champion",
            "outcome": "Colorado Avalanche",
            "position": "No",
            "amount": "8",
        },
    ]
    
    print("=" * 60)
    print("🎯 POLYMARKET TRADE EXECUTOR v5")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=['--disable-blink-features=AutomationControlled']
        )
        ctx = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        )
        page = ctx.new_page()
        
        if not login(page, ctx):
            print("❌ Login failed!")
            for t in trades:
                results.append({"mercado": t["name"], "posicao": t["position"], 
                               "valor": f"${t['amount']}", "status": "falha", "erro": "Login failed"})
        else:
            page.wait_for_timeout(3000)
            for i, t in enumerate(trades):
                r = do_trade(page, t["url"], t["outcome"], t["position"], t["amount"], t["name"], i+1)
                results.append(r)
                if i < len(trades) - 1:
                    page.wait_for_timeout(2000)
        
        # Save report
        print(f"\n{'='*60}")
        print("📋 RESULTADOS")
        print(f"{'='*60}")
        
        md = [f"# Trades Executados - {datetime.now().strftime('%Y-%m-%d %H:%M')}\n"]
        for r in results:
            emoji = "✅" if r["status"] == "executado" else "❌"
            erro = f" | Erro: {r.get('erro')}" if r.get("erro") else ""
            md.append(f"- {emoji} **{r['mercado']}** | {r['posicao']} | {r['valor']} | {r['status']}{erro}")
            print(f"  {emoji} {r['mercado']}: {r['posicao']} {r['valor']} → {r['status']}{erro}")
        
        with open(os.path.join(DATA_DIR, "TRADES-EXECUTADOS.md"), "w") as f:
            f.write("\n".join(md))
        with open(os.path.join(DATA_DIR, "trades-result.json"), "w") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        page.wait_for_timeout(2000)
        browser.close()

if __name__ == "__main__":
    main()
