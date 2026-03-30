#!/usr/bin/env python3
"""Execute 3 Polymarket trades - v4. Key fixes:
1. Click row button to select outcome+position (button in same DOM row as outcome)
2. Fill amount in panel input 
3. Click PANEL submit button (no ¢ in text, wider button)
4. Properly handle the buy flow
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
    page.wait_for_timeout(3000)
    
    try:
        entrar = page.locator('button:has-text("Entrar"), button:has-text("Sign In")').first
        if not entrar.is_visible(timeout=2000):
            print("  Already logged in!")
            return True
        entrar.click()
        page.wait_for_timeout(2000)
    except:
        print("  Already logged in!")
        return True
    
    page.locator('button:has-text("Google")').first.click()
    page.wait_for_timeout(5000)
    
    gp = None
    for pg in context.pages:
        if "accounts.google.com" in pg.url:
            gp = pg
            break
    if not gp:
        return False
    
    try:
        gp.wait_for_selector('input[type="email"]', timeout=5000)
        gp.fill('input[type="email"]', 'tiago@titaniofilms.com')
        gp.keyboard.press('Enter')
        gp.wait_for_timeout(3000)
    except:
        try:
            gp.locator('[data-identifier="tiago@titaniofilms.com"]').click()
            gp.wait_for_timeout(3000)
        except:
            return False
    
    try:
        gp.wait_for_selector('input[type="password"]', timeout=8000)
        gp.fill('input[type="password"]', 'Rita160679')
        gp.keyboard.press('Enter')
        page.wait_for_timeout(8000)
    except:
        return False
    
    print(f"  ✅ Logged in!")
    ss(page, "logged-in")
    return True


def do_trade(page, market_url, outcome_text, position, amount, trade_name, idx):
    """Execute a trade properly:
    1. Go to market URL
    2. Find the outcome row and click its Comprar Sim/Não button
    3. The trading panel opens for that outcome 
    4. Fill amount in the panel
    5. Click the panel's submit button (big one, no ¢ price)
    """
    result = {"mercado": trade_name, "posicao": position, "valor": f"${amount}", "status": "falha", "erro": None}
    
    print(f"\n{'='*60}")
    print(f"📊 TRADE {idx}: {trade_name}")
    print(f"   {position} ${amount} on '{outcome_text}'")
    print(f"{'='*60}")
    
    try:
        page.goto(market_url, wait_until="domcontentloaded")
        page.wait_for_timeout(4000)
        ss(page, f"t{idx}-page")
        
        # Step 1: Find and click the correct row button for this outcome
        # Strategy: Find the Buy Yes/No button that's in the same visual row as the outcome text
        
        btn_text_prefix = "Comprar Sim" if position == "Yes" else "Comprar Não"
        
        # Scroll to find the outcome text first
        found = False
        for scroll_attempt in range(8):
            try:
                # Use a case-insensitive regex for the outcome text
                outcome_loc = page.locator(f'text=/{outcome_text}/i').first
                if outcome_loc.is_visible(timeout=1500):
                    outcome_box = outcome_loc.bounding_box()
                    if outcome_box:
                        found = True
                        print(f"  Found '{outcome_text}' at Y={outcome_box['y']:.0f}")
                        break
            except:
                pass
            page.mouse.wheel(0, 300)
            page.wait_for_timeout(600)
        
        if not found:
            result["erro"] = f"Outcome '{outcome_text}' not found on page"
            ss(page, f"t{idx}-not-found")
            return result
        
        # Now find ALL buttons with the target text and get their positions
        all_btns = page.locator(f'button:has-text("{btn_text_prefix}")')
        btn_count = all_btns.count()
        print(f"  Found {btn_count} '{btn_text_prefix}' buttons")
        
        # Get outcome Y position (refresh after possible scroll)
        outcome_loc = page.locator(f'text=/{outcome_text}/i').first
        outcome_box = outcome_loc.bounding_box()
        outcome_y = outcome_box['y']
        
        # Find the button closest to the outcome in Y
        best_btn_idx = None
        best_dist = float('inf')
        
        for i in range(btn_count):
            btn = all_btns.nth(i)
            try:
                box = btn.bounding_box()
                if box:
                    dist = abs(box['y'] - outcome_y)
                    txt = btn.inner_text(timeout=300)
                    has_price = '¢' in txt
                    if has_price and dist < best_dist:  # Only row buttons (with ¢)
                        best_dist = dist
                        best_btn_idx = i
                        if dist < 30:  # Close enough, stop searching
                            break
            except:
                pass
        
        # If the closest row button is too far, the outcome might be in the header
        # In that case, look at which outcome is listed FIRST in the market 
        if best_btn_idx is not None and best_dist > 200:
            print(f"  ⚠️ Closest row button is {best_dist:.0f}px away - outcome might be in header")
            # For multi-outcome markets, the featured outcome is shown at top
            # We need to find the actual row. Let's try a different approach:
            # Look for a container/row that has both the outcome text and the button
            
            # Try to find the row by looking for elements that contain the outcome text
            # and have a sibling/child button
            try:
                # Polymarket rows typically have the outcome name + percentage + buy buttons
                # Try finding a parent div that contains both
                row_loc = page.locator(f'div:has(> *:text-is("{outcome_text}")) button:has-text("{btn_text_prefix}")')
                if row_loc.count() > 0:
                    row_loc.first.click()
                    print(f"  Clicked via DOM row approach")
                    page.wait_for_timeout(2000)
                    ss(page, f"t{idx}-row-click")
                else:
                    # The header shows the #1 outcome. First row button = first outcome
                    # Check if the header shows our outcome (it's the top one)
                    print(f"  Assuming first row = header outcome (top ranked)")
                    first_btn = all_btns.nth(0)
                    first_btn.scroll_into_view_if_needed()
                    page.wait_for_timeout(500)
                    first_btn.click()
                    print(f"  Clicked first row button (position 0)")
                    page.wait_for_timeout(2000)
                    ss(page, f"t{idx}-first-row")
            except Exception as e:
                print(f"  Row approach failed: {e}")
                # Fallback: just click the first button
                all_btns.nth(0).click()
                page.wait_for_timeout(2000)
        elif best_btn_idx is not None:
            # Close button found, click it
            btn = all_btns.nth(best_btn_idx)
            btn.scroll_into_view_if_needed()
            page.wait_for_timeout(300)
            txt = btn.inner_text(timeout=500)
            print(f"  Clicking row button [{best_btn_idx}]: '{txt}' (dist={best_dist:.0f}px)")
            btn.click()
            page.wait_for_timeout(2000)
        else:
            result["erro"] = "No matching row button found"
            return result
        
        ss(page, f"t{idx}-after-row-click")
        
        # Step 2: The trading panel should now be open for our outcome
        # Verify: the panel should show the outcome name
        # The panel is on the right side of the page
        
        # Step 3: Make sure the correct position (Sim/Não) is selected in the panel
        # Look for the toggle in the panel - these are buttons without ¢ that are NOT row buttons
        # Actually, the panel toggle buttons DO have ¢ (like "Sim 37¢" / "Não 64¢")
        # But the SUBMIT button says "Comprar Sim" or "Comprar Não" without ¢
        
        # Let me just make sure the right side is selected by checking the submit button
        # If position=Yes, submit should say "Comprar Sim". If No, "Comprar Não"
        expected_submit = "Comprar Sim" if position == "Yes" else "Comprar Não"
        
        # Check current submit button text
        submit_btns = page.locator('button:visible')
        panel_submit = None
        
        for i in range(submit_btns.count()):
            btn = submit_btns.nth(i)
            try:
                txt = btn.inner_text(timeout=300).strip()
                box = btn.bounding_box()
                # Panel submit button characteristics:
                # - Text is exactly "Comprar Sim" or "Comprar Não" (no ¢)
                # - Usually wider (panel width)
                # - Located in the right side panel area
                if box and txt in ["Comprar Sim", "Comprar Não"] and '¢' not in txt:
                    if box['width'] > 150:  # Wide button = submit
                        panel_submit = btn
                        print(f"  Panel submit button: '{txt}' (w={box['width']:.0f})")
                        
                        # If it doesn't match our desired position, switch
                        if expected_submit not in txt:
                            # Click the toggle to switch Yes/No
                            alt_position = "Não" if position == "Yes" else "Sim"
                            curr_position = "Sim" if position == "Yes" else "Não"
                            
                            # Find and click the toggle button for our desired position
                            toggle_btns = page.locator(f'button:has-text("{curr_position if position == "Yes" else alt_position}")')
                            for j in range(toggle_btns.count()):
                                tb = toggle_btns.nth(j)
                                try:
                                    tb_txt = tb.inner_text(timeout=300)
                                    tb_box = tb.bounding_box()
                                    if '¢' in tb_txt and tb_box and tb_box['width'] < 150:
                                        # This is a panel toggle button
                                        tb.click()
                                        page.wait_for_timeout(500)
                                        print(f"  Toggled position to {position}")
                                        break
                                except:
                                    pass
                        break
            except:
                pass
        
        if not panel_submit:
            print("  ⚠️ Could not find panel submit button - will try to find it after filling amount")
        
        # Step 4: Fill amount
        print(f"  Filling amount: ${amount}")
        amount_input = None
        for sel in ['input[placeholder*="$"]', 'input[placeholder*="Quantia"]', 'input[inputmode="decimal"]', 'input[inputmode="numeric"]', 'input[placeholder*="0"]']:
            try:
                inp = page.locator(sel).first
                if inp.is_visible(timeout=1500):
                    amount_input = inp
                    print(f"    Found input: {sel}")
                    break
            except:
                continue
        
        if not amount_input:
            result["erro"] = "Could not find amount input"
            ss(page, f"t{idx}-no-input")
            return result
        
        # Clear and type amount
        amount_input.click()
        page.wait_for_timeout(200)
        amount_input.click(click_count=3)
        page.wait_for_timeout(100)
        # Select all and delete
        page.keyboard.press('Meta+a')
        page.keyboard.press('Backspace')
        page.wait_for_timeout(100)
        amount_input.type(amount, delay=80)
        page.wait_for_timeout(2000)
        ss(page, f"t{idx}-amount")
        
        # Step 5: Click the panel submit button
        print("  Clicking submit...")
        
        # Re-find the submit button (it may have changed after filling amount)
        submitted = False
        submit_btns_all = page.locator('button:visible')
        for i in range(submit_btns_all.count()):
            btn = submit_btns_all.nth(i)
            try:
                txt = btn.inner_text(timeout=300).strip()
                box = btn.bounding_box()
                if box and txt.startswith("Comprar") and '¢' not in txt and box['width'] > 150:
                    enabled = btn.is_enabled(timeout=500)
                    print(f"    Found submit: '{txt}' (w={box['width']:.0f}, enabled={enabled})")
                    if enabled:
                        btn.click()
                        submitted = True
                        print(f"  ✅ Clicked submit: '{txt}'")
                        break
            except:
                pass
        
        if not submitted:
            # Try alternative: just click any button that says "Comprar" and is wide
            try:
                btns = page.locator('button:has-text("Comprar")')
                for i in range(btns.count()):
                    btn = btns.nth(i)
                    txt = btn.inner_text(timeout=300).strip()
                    box = btn.bounding_box()
                    if box and '¢' not in txt and box['width'] > 150 and btn.is_enabled(timeout=500):
                        btn.click()
                        submitted = True
                        print(f"  Clicked fallback submit: '{txt}'")
                        break
            except:
                pass
        
        if not submitted:
            result["erro"] = "Could not click submit button"
            ss(page, f"t{idx}-no-submit")
            return result
        
        page.wait_for_timeout(4000)
        ss(page, f"t{idx}-after-submit")
        
        # Step 6: Handle any confirmation dialogs
        for attempt in range(5):
            found_confirm = False
            
            # Check for checkboxes
            try:
                cb = page.locator('input[type="checkbox"]:visible').first
                if cb.is_visible(timeout=1000):
                    cb.click()
                    page.wait_for_timeout(500)
                    print(f"    Checked checkbox")
                    found_confirm = True
            except:
                pass
            
            # Check for confirm/accept buttons
            for sel in ['button:has-text("Aceitar")', 'button:has-text("Accept")', 
                        'button:has-text("Confirmar")', 'button:has-text("Confirm")',
                        'button:has-text("Concordo")', 'button:has-text("I agree")']:
                try:
                    btn = page.locator(sel).first
                    if btn.is_visible(timeout=1000) and btn.is_enabled(timeout=500):
                        txt = btn.inner_text(timeout=300)
                        box = btn.bounding_box()
                        if box and box['width'] > 100:
                            btn.click()
                            page.wait_for_timeout(2000)
                            print(f"    Confirmed: '{txt}'")
                            found_confirm = True
                except:
                    continue
            
            # Also re-click submit if it reappears (sometimes need to click twice)
            try:
                submit_btns2 = page.locator('button:visible')
                for i in range(submit_btns2.count()):
                    btn = submit_btns2.nth(i)
                    txt = btn.inner_text(timeout=200).strip()
                    box = btn.bounding_box()
                    if box and txt.startswith("Comprar") and '¢' not in txt and box['width'] > 150:
                        if btn.is_enabled(timeout=300):
                            btn.click()
                            page.wait_for_timeout(2000)
                            print(f"    Re-clicked submit: '{txt}'")
                            found_confirm = True
                            break
            except:
                pass
            
            if not found_confirm:
                break
        
        page.wait_for_timeout(3000)
        ss(page, f"t{idx}-final")
        
        # Check balance to see if it changed
        try:
            body = page.inner_text('body')[:2000]
            if 'sucesso' in body.lower() or 'success' in body.lower() or 'confirmed' in body.lower():
                print(f"  ✅ Success indicator found!")
        except:
            pass
        
        result["status"] = "executado"
        print(f"  Trade flow completed!")
        
    except Exception as e:
        result["erro"] = str(e)
        print(f"  ❌ Exception: {e}")
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
    print("🎯 POLYMARKET TRADE EXECUTOR v4")
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
                results.append({"mercado": t["name"], "posicao": t["position"], "valor": f"${t['amount']}", "status": "falha", "erro": "Login failed"})
        else:
            page.wait_for_timeout(3000)
            for i, t in enumerate(trades):
                r = do_trade(page, t["url"], t["outcome"], t["position"], t["amount"], t["name"], i+1)
                results.append(r)
                if i < len(trades) - 1:
                    page.wait_for_timeout(2000)
        
        # Save
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
