#!/usr/bin/env python3
"""
Polymarket Login com Playwright
Resolve 2FA automático usando app-password ou desabilitando 2FA
"""

import asyncio
from playwright.async_api import async_playwright
import os

async def login_polymarket():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # headless=False pra ver o que tá acontecendo
        context = await browser.new_context()
        page = await context.new_page()
        
        print("🚀 Acessando Polymarket...")
        await page.goto("https://polymarket.com")
        
        # Aguardar e clicar em login
        print("⏳ Aguardando botão de login...")
        await page.wait_for_selector('button:has-text("Sign in")', timeout=30000)
        await page.click('button:has-text("Sign in")')
        
        print("✅ Login iniciado - aguardando credenciais do Thiago...")
        # Aqui vamos inserir as credenciais quando Thiago passar
        
        return browser, page

if __name__ == "__main__":
    asyncio.run(login_polymarket())
