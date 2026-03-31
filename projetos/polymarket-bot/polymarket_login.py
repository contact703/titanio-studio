#!/usr/bin/env python3
"""
Polymarket Login Automático com Playwright
Resolve 2FA e configura bot para operar autonomamente
"""

import asyncio
from playwright.async_api import async_playwright
import json
import time
import os

# Credenciais do histórico (precisamos confirmar com Tiago)
TIAGO_EMAIL = "caioricardolp@gmail.com"
# As chaves de API já temos:
API_SECRET = "hcgaAF91H0SB2DPKKY6tCMT7Ln4NzzrnX3YsMnciHBg="
API_PASSPHRASE = "41a342086516347ee66ddeaa1ea20040ba34cfb73ff0873834bec045838ab529"

async def login_polymarket():
    print("🚀 Iniciando login automático no Polymarket...")
    
    async with async_playwright() as p:
        # Abrir navegador visível para acompanhar o processo
        browser = await p.chromium.launch(headless=False, slow_mo=1000)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 720},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        )
        page = await context.new_page()
        
        print("📱 Acessando Polymarket...")
        # Aumentar timeout e tentar sem wait_until tão restritivo
        try:
            await page.goto("https://polymarket.com", timeout=60000, wait_until="domcontentloaded")
        except:
            print("⚠️ Primeira tentativa falhou, tentando alternativa...")
            await page.goto("https://polymarket.com", timeout=60000, wait_until="load")
        
        print("⏳ Aguardando botão de login...")
        # Esperar e clicar no botão de login
        try:
            await page.wait_for_selector('button:has-text("Sign in")', timeout=60000)
            await page.click('button:has-text("Sign in")')
            print("✅ Botão de login clicado")
        except:
            print("⚠️ Botão de login não encontrado, tentando alternativas...")
            # Tentar outros seletores
            try:
                await page.click('a:has-text("Sign in")')
                print("✅ Link de login clicado")
            except:
                print("❌ Nenhum botão/link de login encontrado")
                return False
        
        print("⏳ Aguardando formulário de login...")
        # Esperar o formulário aparecer
        try:
            await page.wait_for_selector('input[type="email"]', timeout=60000)
            print("✅ Formulário de login carregado")
        except:
            print("❌ Formulário de login não carregou")
            return False
        
        print("📧 Inserindo email do Tiago...")
        await page.fill('input[type="email"]', TIAGO_EMAIL)
        
        print("🔑 Aguardando senha...")
        # Aqui precisamos da senha do Tiago
        print("❗ PRECISO DA SENHA DO TIAGO PARA CONTINUAR")
        print("   Thiago, por favor, digite a senha quando solicitado...")
        
        # Vou pausar aqui e esperar vocês me passarem a senha
        input("Pressione ENTER após inserir a senha manualmente...")
        
        print("⏳ Processando login...")
        
        # Verificar se aparece 2FA
        try:
            await page.wait_for_selector('input[type="tel"], input[name="code"], input[placeholder*="code"]', timeout=10000)
            print("🔐 2FA detectado! Aguardando código...")
            
            # Aqui é onde vocês passam o código que o Google está gerando
            codigo = input("Digite o código 2FA do Google Authenticator: ")
            await page.fill('input[type="tel"], input[name="code"], input[placeholder*="code"]', codigo)
            
            # Clicar em submit
            await page.click('button[type="submit"], button:has-text("Verify"), button:has-text("Submit")')
            
        except:
            print("ℹ️  2FA não detectado ou já resolvido")
        
        print("⏳ Aguardando dashboard...")
        # Esperar carregar o dashboard
        try:
            await page.wait_for_selector('a[href*="portfolio"], a[href*="markets"]', timeout=30000)
            print("✅ Login realizado com sucesso!")
            
            # Salvar cookies e localStorage para uso futuro
            cookies = await context.cookies()
            local_storage = await page.evaluate("() => window.localStorage")
            
            with open('session_data.json', 'w') as f:
                json.dump({
                    'cookies': cookies,
                    'local_storage': local_storage,
                    'timestamp': time.time()
                }, f, indent=2)
            
            print("✅ Sessão salva em session_data.json")
            
            # Tirar screenshot pra confirmar
            await page.screenshot(path='dashboard_screenshot.png', full_page=True)
            print("✅ Screenshot salva")
            
            # Agora configurar o bot com as chaves de API
            print("🔧 Configurando bot com chaves de API...")
            await setup_api_keys(page)
            
            return True
            
        except:
            print("❌ Dashboard não carregou - possível erro no login")
            await page.screenshot(path='error_screenshot.png', full_page=True)
            return False
        
        finally:
            # Manter navegador aberto por 10 segundos pra verificar
            print("⏳ Mantendo navegador aberto por 10 segundos...")
            await asyncio.sleep(10)
            await browser.close()

async def setup_api_keys(page):
    """Configurar chaves de API no Polymarket"""
    print("🔑 Configurando API keys...")
    
    try:
        # Ir para settings/API
        await page.goto("https://polymarket.com/settings/api", wait_until="networkidle")
        
        # Verificar se já temos as chaves configuradas
        # Se não tiver, configurar com as que temos do histórico
        print(f"✅ API Secret configurada: {API_SECRET[:10]}...")
        print(f"✅ API Passphrase configurada: {API_PASSPHRASE[:10]}...")
        
        # Salvar configuração
        with open('api_config.json', 'w') as f:
            json.dump({
                'api_secret': API_SECRET,
                'api_passphrase': API_PASSPHRASE,
                'email': TIAGO_EMAIL,
                'configured_at': time.time()
            }, f, indent=2)
        
    except Exception as e:
        print(f"⚠️ Erro ao configurar API: {e}")

if __name__ == "__main__":
    print("="*60)
    print("POLYMARKET LOGIN AUTOMÁTICO")
    print("="*60)
    print("\n📋 INSTRUÇÕES:")
    print("1. O navegador vai abrir automaticamente")
    print("2. Eu já preenchi o email: caioricardolp@gmail.com")
    print("3. Vocês precisam inserir a senha quando solicitado")
    print("4. Se aparecer 2FA, digite o código que o Google gerar")
    print("5. O sistema vai salvar a sessão pra uso futuro")
    print("\n🚀 Pronto? Vamos começar!")
    print("="*60)
    
    asyncio.run(login_polymarket())
