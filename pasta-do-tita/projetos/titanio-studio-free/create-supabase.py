#!/usr/bin/env python3
"""
Criar projeto Supabase via API (não precisa browser)
"""

import requests
import json

# Verificar se já existe projeto via API pública
# Supabase permite criar projeto direto se tiver conta

def check_existing_supabase():
    """Tenta acessar um projeto existente"""
    # Projetos conhecidos da Titanio (do GospIA)
    known_projects = [
        "tlvsajdsertkbkngfnjv",  # GospIA
    ]
    
    for proj_ref in known_projects:
        url = f"https://{proj_ref}.supabase.co/rest/v1/"
        try:
            r = requests.get(url, timeout=5)
            if r.status_code < 500:
                print(f"✅ Projeto existe: {proj_ref}.supabase.co")
                return proj_ref
        except:
            pass
    return None

def main():
    print("🔍 Verificando projetos Supabase existentes...")
    
    existing = check_existing_supabase()
    
    if existing:
        print(f"\n✅ Projeto Supabase encontrado!")
        print(f"   URL: https://{existing}.supabase.co")
        print(f"\n   Podemos usar este projeto para o Titanio Studio!")
        print(f"\n   Para pegar a anon key:")
        print(f"   1. Acesse: https://supabase.com/dashboard/project/{existing}/settings/api")
        print(f"   2. Copie a 'anon' key (começa com eyJ...)")
    else:
        print("\n⚠️ Nenhum projeto Supabase encontrado")
        print("\n   Para criar um novo projeto (grátis):")
        print("   1. https://supabase.com/dashboard")
        print("   2. Login com GitHub")
        print("   3. New Project → titanio-studio → South America")

if __name__ == "__main__":
    main()
