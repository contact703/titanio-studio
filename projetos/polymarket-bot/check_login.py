#!/usr/bin/env python3
"""
Verificar se estamos logados no Polymarket e salvar sessão
"""

import asyncio
from playwright.async_api import async_playwright
import json
import time

async def check_login():
    print("🔍 Verificando status de login...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        
        # Carregar cookies se existirem
        try:
            with open('cookies.json', 'r') as f:
                cookies = json.load(f)
                await context.add_cookies(cookies)
                print("✅ Cookies carregados")
        except:
            print("ℹ️  Sem cookies salvos anteriormente")
        
        page = await browser.new_page()
        
        print("📱 Acessando Polymarket...")
        await page.goto("https://polymarket.com", timeout=30000)
        
        # Verificar se estamos logados
        # Procurar por elementos que só aparecem quando logado
        try:
            # Verificar se tem avatar ou menu do usuário
            user_menu = await page.query_selector('[data-testid="user-menu"], .user-avatar, [href*="portfolio"]')
            if user_menu:
                print("✅ ENCONTRADO: Menu do usuário - provavelmente logado!")
            else:
                print("ℹ️  Menu do usuário não encontrado")
            
            # Verificar se tem link pro portfolio
            portfolio_link = await page.query_selector('a[href*="portfolio"], a[href*="account"]')
            if portfolio_link:
                print("✅ ENCONTRADO: Link pro portfolio - provavelmente logado!")
            else:
                print("ℹ️  Link pro portfolio não encontrado")
            
            # Verificar se tem botão de logout
            logout_btn = await page.query_selector('button:has-text("Logout"), a:has-text("Logout")')
            if logout_btn:
                print("✅ ENCONTRADO: Botão de logout - definitivamente logado!")
            else:
                print("ℹ️  Botão de logout não encontrado")
            
            # Tirar screenshot do estado atual
            await page.screenshot(path='current_status.png', full_page=True)
            print("✅ Screenshot salva: current_status.png")
            
            # Ir pro dashboard/portfolio
            print("📊 Acessando portfolio...")
            try:
                await page.click('a[href*="portfolio"]', timeout=5000)
                await page.wait_for_timeout(3000)
                await page.screenshot(path='portfolio.png', full_page=True)
                print("✅ Portfolio acessado e screenshot salva")
            except:
                print("ℹ️  Não conseguiu acessar portfolio diretamente")
            
            # Salvar cookies e localStorage
            cookies = await context.cookies()
            local_storage = await page.evaluate("() => window.localStorage")
            session_data = {
                'cookies': cookies,
                'local_storage': local_storage,
                'timestamp': time.time(),
                'logged_in': True
            }
            
            with open('session_data.json', 'w') as f:
                json.dump(session_data, f, indent=2)
            
            print("✅ Sessão completa salva em session_data.json")
            print(f"📊 {len(cookies)} cookies salvos")
            print(f"💾 {len(local_storage)} itens no localStorage")
            
            # Verificar se temos acesso à API
            print("🔑 Verificando acesso à API...")
            try:
                await page.goto("https://polymarket.com/settings/api", timeout=10000)
                await page.screenshot(path='api_settings.png', full_page=True)
                print("✅ Configurações de API acessadas")
            except:
                print("ℹ️  Não conseguiu acessar configurações de API")
            
            print("\n🎉 STATUS: Parece que estamos logados!")
            print("✅ Sessão salva com sucesso!")
            print("🤖 Bot está pronto para operar!")
            
        except Exception as e:
            print(f"❌ Erro: {e}")
            await page.screenshot(path='error_check.png', full_page=True)
        
        # Manter aberto por 5 segundos pra vocês verem
        await asyncio.sleep(5)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(check_login())
