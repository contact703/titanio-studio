#!/usr/bin/env python3
"""
Titanio Studio - Auto Setup via Playwright
Cria conta Supabase Free e faz deploy na Vercel automaticamente
"""

import os
import json
import time
from playwright.sync_api import sync_playwright

# Credenciais do cofre
GITHUB_TOKEN = "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"
VERCEL_TOKEN = "vcp_1wQ9GSErILhCmBliBIHcK61D8dX07HWdrve2INdn30EnaDLiE53jD8VK"

# Email para criar conta
EMAIL = "tita@titaniofilms.com"  # usando email do Titanio

def create_supabase_project():
    """Cria projeto Supabase Free via interface"""
    print("🚀 Criando projeto Supabase...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        try:
            # Ir para Supabase
            page.goto("https://supabase.com/dashboard/sign-in")
            page.wait_for_load_state("networkidle")
            
            # Screenshot para debug
            page.screenshot(path="/tmp/supabase-login.png")
            print("📸 Screenshot salvo: /tmp/supabase-login.png")
            
            # Verificar se tem opção GitHub
            github_btn = page.locator("text=Continue with GitHub")
            if github_btn.is_visible():
                print("✅ Botão GitHub encontrado")
                # Não clicar automaticamente - precisa interação
                
            print("⚠️ Supabase precisa de login manual (OAuth)")
            print("   Vá em: https://supabase.com/dashboard")
            print("   Clique 'Continue with GitHub'")
            print("   Crie projeto: titanio-studio")
            
        except Exception as e:
            print(f"❌ Erro: {e}")
        finally:
            browser.close()

def check_vercel_deployment():
    """Verifica se o projeto já está na Vercel"""
    print("\n🔍 Verificando deployment Vercel...")
    
    import subprocess
    result = subprocess.run(
        ["curl", "-s", "-H", f"Authorization: Bearer {VERCEL_TOKEN}", 
         "https://api.vercel.com/v9/projects"],
        capture_output=True, text=True
    )
    
    try:
        data = json.loads(result.stdout)
        projects = data.get("projects", [])
        
        for proj in projects:
            print(f"  📁 {proj.get('name')} - {proj.get('framework')}")
            
        # Procurar projeto titanio
        titanio = [p for p in projects if 'titanio' in p.get('name', '').lower() or 'dashboard' in p.get('name', '').lower()]
        
        if titanio:
            print(f"\n✅ Projeto encontrado: {titanio[0].get('name')}")
            return titanio[0]
        else:
            print("\n⚠️ Projeto Titanio não encontrado na Vercel")
            return None
            
    except Exception as e:
        print(f"❌ Erro ao verificar: {e}")
        return None

def deploy_to_vercel_api():
    """Deploy via Vercel CLI que já está instalado"""
    print("\n🚀 Fazendo deploy via API/CLI...")
    
    import subprocess
    os.chdir("/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-studio-free/dashboard")
    
    result = subprocess.run(
        ["vercel", "--token", VERCEL_TOKEN, "--yes", "--prod"],
        capture_output=True, text=True
    )
    
    print(result.stdout)
    if result.returncode == 0:
        print("✅ Deploy concluído!")
    else:
        print(f"❌ Erro: {result.stderr}")

def create_groq_key():
    """Instrução para criar key Groq"""
    print("\n🤖 Groq API Key...")
    print("   Groq é grátis: https://console.groq.com")
    print("   1. Criar conta com GitHub")
    print("   2. API Keys → Create API Key")
    print("   3. Copiar key (gsk_xxx...)")

def main():
    print("=" * 50)
    print("🏗️  TITANIO STUDIO - AUTO SETUP")
    print("=" * 50)
    
    # 1. Verificar Vercel
    vercel_proj = check_vercel_deployment()
    
    # 2. Se não tem deploy, fazer
    if not vercel_proj:
        deploy_to_vercel_api()
    else:
        print(f"\n🔗 Projeto já está em: https://{vercel_proj.get('name')}.vercel.app")
    
    # 3. Supabase
    print("\n" + "=" * 50)
    print("📊 SUPABASE - CRIAR MANUALMENTE")
    print("=" * 50)
    print("""
1. Acesse: https://supabase.com/dashboard
2. Clique "New Project"
3. Nome: titanio-studio
4. Região: South America (São Paulo)
5. Senha: qualquer (salve!)
6. Espere criar (2-3 min)
7. Vá em Settings → API
8. Copie: Project URL e anon key
    """)
    
    # 4. Groq
    create_groq_key()
    
    print("\n" + "=" * 50)
    print("✅ PRÓXIMOS PASSOS:")
    print("=" * 50)
    print("""
Depois de criar Supabase e Groq, adicione na Vercel:

vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
vercel env add GROQ_API_KEY production

E redeploy:
vercel --prod
    """)

if __name__ == "__main__":
    main()
