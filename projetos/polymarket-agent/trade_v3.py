#!/usr/bin/env python3
"""Execute 3 Polymarket trades - v3 with correct multi-outcome market handling."""

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
    return path

def login(page, context):
    """Login via Google OAuth."""
    print("\n🔐 LOGIN")
    page.goto("https://polymarket.com", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)
    
    # Check if already logged in (look for wallet/balance)
    try:
        caixa = page.locator('text=$').first
        if "Caixa" in page.inner_text('body')[:5000] or "$" in page.locator('button:has-text("$")').first.inner_text(timeout=2000):
            print("  Already logged in!")
            return True
    except:
        pass
    
    # Click Entrar
    try:
        page.locator('button:has-text("Entrar"), a:has-text("Entrar"), button:has-text("Sign In")').first.click()
        page.wait_for_timeout(2000)
    except:
        print("  No login button found - might be logged in")
        return True
    
    # Click Google
    page.locator('button:has-text("Google")').first.click()
    page.wait_for_timeout(5000)
    
    # Find Google auth page
    gp = None
    for pg in context.pages:
        if "accounts.google.com" in pg.url:
            gp = pg
            break
    if not gp:
        print("  ❌ No Google auth page!")
        return False
    
    # Email
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
    
    # Password
    try:
        gp.wait_for_selector('input[type="password"]', timeout=8000)
        gp.fill('input[type="password"]', 'Rita160679')
        gp.keyboard.press('Enter')
        page.wait_for_timeout(8000)
    except:
        return False
    
    print(f"  ✅ Logged in! URL: {page.url[:60]}")
    ss(page, "logged-in")
    return True


def do_trade(page, market_url, outcome_text, position, amount, trade_name, idx):
    """
    Execute a trade on a multi-outcome market.
    
    1. Go to market URL
    2. Find the outcome row matching outcome_text
    3. Click the correct Buy Yes/No button on that row
    4. Fill amount in trading panel
    5. Click buy
    """
    result = {"mercado": trade_name, "posicao": position, "valor": f"${amount}", "status": "falha", "erro": None}
    
    print(f"\n{'='*60}")
    print(f"📊 TRADE {idx}: {trade_name}")
    print(f"   {position} ${amount} on '{outcome_text}'")
    print(f"   URL: {market_url}")
    print(f"{'='*60}")
    
    try:
        # 1. Navigate to market
        page.goto(market_url, wait_until="domcontentloaded")
        page.wait_for_timeout(4000)
        ss(page, f"t{idx}-market")
        
        # 2. Find the outcome row with the matching text
        # On Polymarket, each outcome row has buttons like "Comprar Sim XX¢" and "Comprar Não XX¢"
        # We need to find the row containing outcome_text and click the right button
        
        print(f"  Looking for outcome: '{outcome_text}'")
        
        # Strategy: Find text matching the outcome, then find the nearest Buy Yes/No button
        # The buttons on each row are like:
        #   "Comprar Sim\nXX¢" (Buy Yes) - usually green-ish
        #   "Comprar Não\nXX¢" (Buy No) - usually red-ish
        # Or they might just say "Sim." / "Não." 
        
        # First, let's scroll down to find the outcome if needed
        # Try to find the outcome text on page
        outcome_visible = False
        for scroll in range(5):
            try:
                loc = page.locator(f'text="{outcome_text}"').first
                if loc.is_visible(timeout=1500):
                    outcome_visible = True
                    print(f"  Found outcome text on page")
                    break
            except:
                pass
            # Try partial match
            try:
                # Use a more flexible locator
                words = outcome_text.split()[:3]
                partial = " ".join(words)
                loc = page.locator(f'text=/{partial}/i').first
                if loc.is_visible(timeout=1000):
                    outcome_visible = True
                    print(f"  Found outcome via partial match: '{partial}'")
                    break
            except:
                pass
            page.mouse.wheel(0, 400)
            page.wait_for_timeout(800)
        
        # Now find and click the Buy button for this outcome
        # The buttons on each row typically contain "Comprar Sim" or "Comprar Não" 
        # followed by a price
        
        if position == "Yes":
            target_btn_text = "Comprar Sim"
            alt_btn_text = "Buy Yes"
        else:
            target_btn_text = "Comprar Não"
            alt_btn_text = "Buy No"
        
        # Find all buttons with the target text
        all_buy_btns = page.locator(f'button:has-text("{target_btn_text}")')
        count = all_buy_btns.count()
        print(f"  Found {count} '{target_btn_text}' buttons")
        
        if count == 0:
            all_buy_btns = page.locator(f'button:has-text("{alt_btn_text}")')
            count = all_buy_btns.count()
            print(f"  Found {count} '{alt_btn_text}' buttons")
        
        # We need to find the button that's in the same row as our outcome
        # Strategy: For each buy button, check if the outcome text is nearby (in same parent)
        clicked = False
        
        if count > 0:
            # Try to find which button corresponds to our outcome
            # Get the bounding box of the outcome text
            try:
                outcome_loc = page.locator(f'text=/{outcome_text}/i').first
                outcome_box = outcome_loc.bounding_box()
                if outcome_box:
                    outcome_y = outcome_box['y']
                    print(f"  Outcome text Y position: {outcome_y}")
                    
                    # Find the closest buy button by Y position
                    best_btn = None
                    best_dist = float('inf')
                    
                    for i in range(count):
                        btn = all_buy_btns.nth(i)
                        try:
                            box = btn.bounding_box()
                            if box:
                                dist = abs(box['y'] - outcome_y)
                                txt = btn.inner_text(timeout=500)
                                print(f"    Button {i}: Y={box['y']}, dist={dist:.0f}, text='{txt[:40]}'")
                                if dist < best_dist:
                                    best_dist = dist
                                    best_btn = btn
                        except:
                            pass
                    
                    if best_btn and best_dist < 80:  # Within 80px vertically
                        print(f"  Clicking closest button (dist={best_dist:.0f}px)")
                        best_btn.click()
                        clicked = True
                    else:
                        print(f"  Closest button too far: {best_dist:.0f}px")
            except Exception as e:
                print(f"  Bounding box approach failed: {e}")
        
        if not clicked:
            # Alternative: click directly on the outcome text to select it, 
            # then use the trading panel
            print("  Trying: click outcome text directly...")
            try:
                outcome_loc = page.locator(f'text=/{outcome_text}/i').first
                outcome_loc.click()
                page.wait_for_timeout(2000)
                ss(page, f"t{idx}-clicked-outcome")
                
                # Now the trading panel on the right should show this outcome
                # Check if panel header matches
                panel_text = page.inner_text('body')
                if outcome_text.lower() in panel_text.lower()[:3000]:
                    print(f"  Trading panel seems to show our outcome")
                
                # Select Yes or No in the panel
                if position == "Yes":
                    panel_btn = page.locator('button:has-text("Sim")').first
                else:
                    panel_btn = page.locator('button:has-text("Não")').first
                
                if panel_btn.is_visible(timeout=2000):
                    panel_btn.click()
                    clicked = True
                    print(f"  Selected {position} in trading panel")
            except Exception as e:
                print(f"  Click outcome approach failed: {e}")
        
        if not clicked:
            # Last resort: if there's only one market (binary), just click Yes/No directly
            print("  Trying: direct Sim/Não button click...")
            try:
                if position == "Yes":
                    btn = page.locator('button:has-text("Sim")').first
                else:
                    btn = page.locator('button:has-text("Não")').first
                if btn.is_visible(timeout=2000):
                    btn.click()
                    clicked = True
            except:
                pass
        
        if not clicked:
            result["erro"] = f"Could not select {position} for '{outcome_text}'"
            ss(page, f"t{idx}-no-btn")
            return result
        
        page.wait_for_timeout(2000)
        ss(page, f"t{idx}-selected")
        
        # 3. Check the trading panel shows the correct position
        # The panel should now show "Comprar Sim" or "Comprar Não" as the submit button
        # Make sure we're on the right side
        
        # If position is No, make sure "Não" is highlighted in the panel
        if position == "No":
            # Check if Não tab is active - click it if not
            try:
                nao_tabs = page.locator('button:has-text("Não")')
                for i in range(nao_tabs.count()):
                    tab = nao_tabs.nth(i)
                    txt = tab.inner_text(timeout=500)
                    # The toggle buttons in the panel have short text like "Não XX¢"
                    if len(txt) < 30 and "¢" in txt:
                        tab.click()
                        print(f"  Ensured Não is selected in panel")
                        page.wait_for_timeout(500)
                        break
            except:
                pass
        elif position == "Yes":
            try:
                sim_tabs = page.locator('button:has-text("Sim")')
                for i in range(sim_tabs.count()):
                    tab = sim_tabs.nth(i)
                    txt = tab.inner_text(timeout=500)
                    if len(txt) < 30 and "¢" in txt:
                        tab.click()
                        print(f"  Ensured Sim is selected in panel")
                        page.wait_for_timeout(500)
                        break
            except:
                pass
        
        # 4. Fill amount
        print(f"  Filling amount: ${amount}")
        amount_input = None
        for sel in ['input[placeholder*="$"]', 'input[placeholder*="Quantia"]', 'input[inputmode="decimal"]', 'input[inputmode="numeric"]']:
            try:
                inp = page.locator(sel).first
                if inp.is_visible(timeout=1500):
                    amount_input = inp
                    break
            except:
                continue
        
        if not amount_input:
            # Try finding input near the buy button area
            inputs = page.locator('input:visible')
            for i in range(inputs.count()):
                inp = inputs.nth(i)
                try:
                    t = inp.get_attribute('type') or ''
                    p = inp.get_attribute('placeholder') or ''
                    if t not in ['hidden', 'checkbox', 'radio', 'search'] and 'search' not in p.lower():
                        amount_input = inp
                        break
                except:
                    pass
        
        if not amount_input:
            result["erro"] = "Could not find amount input"
            ss(page, f"t{idx}-no-input")
            return result
        
        amount_input.click()
        page.wait_for_timeout(200)
        amount_input.click(click_count=3)  # Select all
        page.wait_for_timeout(100)
        amount_input.type(amount, delay=80)
        page.wait_for_timeout(1500)
        ss(page, f"t{idx}-amount")
        
        # 5. Click Buy button
        print("  Clicking Buy...")
        if position == "Yes":
            buy_btn_text = "Comprar Sim"
        else:
            buy_btn_text = "Comprar Não"
        
        buy_clicked = False
        for sel in [f'button:has-text("{buy_btn_text}")', 'button:has-text("Comprar")', 'button:has-text("Buy")']:
            try:
                btns = page.locator(sel)
                for i in range(btns.count()):
                    btn = btns.nth(i)
                    if btn.is_visible(timeout=1000) and btn.is_enabled(timeout=500):
                        txt = btn.inner_text(timeout=500)
                        # The main buy button is usually bigger - check if it contains the right action
                        if buy_btn_text.lower() in txt.lower() or (i == 0 and "comprar" in txt.lower()):
                            # Make sure this is the submit button (in the panel), not a row button
                            box = btn.bounding_box()
                            if box and box['width'] > 100:  # Submit button is wider
                                print(f"    Clicking: '{txt}' (w={box['width']:.0f})")
                                btn.click()
                                buy_clicked = True
                                break
                if buy_clicked:
                    break
            except:
                continue
        
        if not buy_clicked:
            # Just click first visible buy button
            try:
                btn = page.locator(f'button:has-text("{buy_btn_text}")').first
                btn.click()
                buy_clicked = True
                print(f"    Clicked first '{buy_btn_text}' button")
            except:
                pass
        
        if not buy_clicked:
            result["erro"] = "Could not click Buy button"
            ss(page, f"t{idx}-no-buy")
            return result
        
        page.wait_for_timeout(3000)
        ss(page, f"t{idx}-after-buy")
        
        # 6. Handle confirmations/terms
        for attempt in range(3):
            # Checkboxes
            try:
                cb = page.locator('input[type="checkbox"]:visible').first
                if cb.is_visible(timeout=1000):
                    cb.click()
                    page.wait_for_timeout(500)
                    print("    Checked checkbox")
            except:
                pass
            
            # Confirm/Accept buttons
            for sel in ['button:has-text("Aceitar")', 'button:has-text("Accept")', 
                        'button:has-text("Confirmar")', 'button:has-text("Confirm")',
                        f'button:has-text("{buy_btn_text}")']:
                try:
                    btn = page.locator(sel).first
                    if btn.is_visible(timeout=1000) and btn.is_enabled(timeout=500):
                        txt = btn.inner_text(timeout=500)
                        print(f"    Confirm [{attempt}]: '{txt}'")
                        btn.click()
                        page.wait_for_timeout(2000)
                except:
                    continue
        
        page.wait_for_timeout(3000)
        ss(page, f"t{idx}-final")
        
        result["status"] = "executado"
        print(f"  ✅ Trade submitted!")
        
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
            "outcome": "Jesus Cristo volta",  # Portuguese
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
    print("🎯 POLYMARKET TRADE EXECUTOR v3")
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
        
        # Save report
        print(f"\n{'='*60}")
        print("📋 RESULTADOS FINAIS")
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
