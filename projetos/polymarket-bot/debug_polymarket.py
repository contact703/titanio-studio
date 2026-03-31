#!/usr/bin/env python3
"""
Debug do Polymarket - ver o que tá aparecendo na tela
"""

import asyncio
from playwright.async_api import async_playwright
import time

async def debug_polymarket():
    print("🔍 Debug do Polymarket...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720}
        )
        page = await browser.new_page()
        
        print("📸 Tirando screenshot da página inicial...")
        await page.goto("https://polymarket.com", timeout=60000)
        await page.screenshot(path='initial_page.png', full_page=True)
        print("✅ Screenshot salva: initial_page.png")
        
        print("\n🔍 Procurando elementos...")
        # Listar todos os botões e links
        buttons = await page.query_selector_all('button, a, input[type="submit"]')
        print(f"📊 Encontrados {len(buttons)} elementos clicáveis")
        
        for i, btn in enumerate(buttons[:10]):  # Mostrar primeiros 10
            text = await btn.text_content()
            tag = await btn.evaluate('(el) => el.tagName')
            href = await btn.get_attribute('href') if tag == 'A' else ''
            print(f"  {i+1}. {tag}: {text[:50]}... {href[:30] if href else ''}")
        
        # Procurar especificamente por "Sign in" ou similar
        signin_elements = await page.query_selector_all('*:has-text("Sign")')
        print(f"\n🔍 Encontrados {len(signin_elements)} elementos com 'Sign'")
        
        for i, el in enumerate(signin_elements[:5]):
            tag = await el.evaluate('(el) => el.tagName')
            text = await el.text_content()
            print(f"  {i+1}. {tag}: {text}")
        
        # Esperar um pouco pra vocês verem
        print("\n⏳ Mantendo navegador aberto por 10 segundos...")
        await asyncio.sleep(10)
        
        # Screenshot final
        await page.screenshot(path='final_debug.png', full_page=True)
        print("✅ Screenshot final salva: final_debug.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_polymarket())
