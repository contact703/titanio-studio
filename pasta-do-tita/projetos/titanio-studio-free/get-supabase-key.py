#!/usr/bin/env python3
"""
Buscar anon key do Supabase via dashboard
"""
from playwright.sync_api import sync_playwright
import time
import re

SUPABASE_EMAIL = "contact@titaniofilms.com"
SUPABASE_PASSWORD = "Rita160679!studio"
PROJECT_REF = "ztcndqmrpqjrpdudeysn"

def get_supabase_keys():
    print("🔐 Buscando keys do Supabase...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Login no Supabase
            page.goto("https://supabase.com/dashboard/sign-in")
            page.wait_for_load_state("networkidle")
            time.sleep(2)
            
            # Tentar login com email/senha
            email_input = page.locator('input[type="email"]')
            if email_input.is_visible():
                email_input.fill(SUPABASE_EMAIL)
                page.locator('input[type="password"]').fill(SUPABASE_PASSWORD)
                page.locator('button[type="submit"]').click()
                time.sleep(3)
            
            # Ir para página de API keys
            page.goto(f"https://supabase.com/dashboard/project/{PROJECT_REF}/settings/api")
            page.wait_for_load_state("networkidle")
            time.sleep(2)
            
            # Screenshot para ver o que tem
            page.screenshot(path="/tmp/supabase-api.png")
            print("📸 Screenshot: /tmp/supabase-api.png")
            
            # Pegar conteúdo
            content = page.content()
            
            # Procurar por keys (começam com eyJ)
            keys = re.findall(r'eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+', content)
            
            if keys:
                print(f"\n✅ Keys encontradas: {len(keys)}")
                for i, key in enumerate(keys[:3]):
                    print(f"   Key {i+1}: {key[:50]}...")
                return keys
            else:
                print("⚠️ Keys não encontradas na página")
                # Tentar método alternativo - ver se está logado
                if "sign-in" in page.url:
                    print("❌ Não logou - precisa de autenticação manual")
                
        except Exception as e:
            print(f"❌ Erro: {e}")
        finally:
            browser.close()
    
    return None

if __name__ == "__main__":
    get_supabase_keys()
