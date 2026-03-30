"""
browser_trader.py — Trader via Playwright usando sessão do Chrome
Opera usando o login existente do Tiago no browser.
"""

from playwright.sync_api import sync_playwright
import json
import time
import os
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger(__name__)

CHROME_PROFILE = os.path.expanduser("~/Library/Application Support/Google/Chrome/Default")
DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)


def execute_trade_via_browser(
    market_slug: str,
    side: str,  # "yes" ou "no"
    amount_usd: float,
    dry_run: bool = True
):
    """
    Executa trade no Polymarket via browser com sessão existente.
    
    Args:
        market_slug: slug do mercado (ex: 'will-italy-qualify-for-2026-fifa-world-cup')
        side: 'yes' ou 'no'
        amount_usd: valor em USD
        dry_run: se True, só simula sem executar
    """
    with sync_playwright() as p:
        # Usar perfil do Chrome (sessão já logada)
        browser = p.chromium.launch_persistent_context(
            CHROME_PROFILE,
            channel="chrome",
            headless=False,  # visível pra debug
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        
        try:
            page = browser.pages[0] if browser.pages else browser.new_page()
            
            # Navegar para o mercado
            url = f"https://polymarket.com/event/{market_slug}"
            logger.info(f"Abrindo: {url}")
            page.goto(url, wait_until="networkidle", timeout=30000)
            time.sleep(2)
            
            # Verificar título
            title = page.title()
            logger.info(f"Página: {title}")
            
            # Verificar se está logado
            page_content = page.content()
            is_logged = "0xf84796" in page_content.lower() or "tiago" in page_content.lower()
            logger.info(f"Logado: {is_logged}")
            
            if dry_run:
                logger.info(f"DRY RUN: trade {side.upper()} ${amount_usd} em {market_slug}")
                return {
                    "status": "dry_run",
                    "market": market_slug,
                    "side": side,
                    "amount": amount_usd,
                    "message": "Simulado — não executado"
                }
            
            # Clicar em YES ou NO
            btn_selector = f'button:has-text("{side.upper()}")'
            page.click(btn_selector, timeout=5000)
            time.sleep(1)
            
            # Preencher valor
            amount_input = page.query_selector('input[placeholder*="Amount"]') or \
                          page.query_selector('input[type="number"]')
            if amount_input:
                amount_input.fill(str(amount_usd))
                time.sleep(0.5)
            
            # Confirmar
            confirm_btn = page.query_selector('button:has-text("Buy")') or \
                         page.query_selector('button:has-text("Confirm")')
            if confirm_btn:
                confirm_btn.click()
                time.sleep(2)
            
            return {
                "status": "executed",
                "market": market_slug,
                "side": side,
                "amount": amount_usd,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro trade: {e}")
            return {"status": "error", "error": str(e)}
        finally:
            browser.close()


def get_account_info_via_browser():
    """Pega informações da conta via browser."""
    with sync_playwright() as p:
        browser = p.chromium.launch_persistent_context(
            CHROME_PROFILE,
            channel="chrome",
            headless=True,
            args=["--no-sandbox"],
        )
        try:
            page = browser.pages[0] if browser.pages else browser.new_page()
            page.goto("https://polymarket.com/profile", wait_until="networkidle", timeout=30000)
            time.sleep(3)
            
            # Pegar localStorage
            creds = page.evaluate("localStorage.getItem('poly_clob_api_key_map')")
            wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
            
            return {
                "creds": json.loads(creds) if creds else None,
                "wallet": wallet,
                "url": page.url,
                "title": page.title()
            }
        except Exception as e:
            return {"error": str(e)}
        finally:
            browser.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    print("Testando acesso ao browser...")
    info = get_account_info_via_browser()
    print("Info conta:", json.dumps(info, indent=2))
    
    # Teste DRY RUN
    print("\nTestando trade DRY RUN — Italy YES $5...")
    result = execute_trade_via_browser(
        market_slug="will-italy-qualify-for-the-2026-fifa-world-cup",
        side="yes",
        amount_usd=5.0,
        dry_run=True
    )
    print("Resultado:", json.dumps(result, indent=2))
