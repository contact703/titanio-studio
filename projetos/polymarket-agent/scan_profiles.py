#!/usr/bin/env python3
"""Scan Chrome profiles for Tiago's Polymarket session."""
import os, json, sys
from playwright.sync_api import sync_playwright

profiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 4']
chrome_base = os.path.expanduser('~/Library/Application Support/Google/Chrome')
TARGET_WALLET = '0xf84796bea736ae03d4e96f78dc7a2894241f5fb0'

results = []

for profile in profiles:
    profile_path = os.path.join(chrome_base, profile)
    if not os.path.exists(profile_path):
        print(f'SKIP: {profile} not found')
        continue
    
    print(f'\n--- Trying {profile} ---')
    try:
        with sync_playwright() as p:
            ctx = p.chromium.launch_persistent_context(
                profile_path, 
                channel='chrome', 
                headless=True,
                args=['--no-sandbox', '--no-first-run', '--disable-extensions', '--disable-default-apps', '--disable-gpu']
            )
            page = ctx.new_page()
            page.goto('https://polymarket.com', timeout=30000)
            page.wait_for_timeout(5000)
            
            wallet = page.evaluate("localStorage.getItem('polymarket.auth.proxyWallet')")
            creds = page.evaluate("localStorage.getItem('poly_clob_api_key_map')")
            auth_token = page.evaluate("localStorage.getItem('polymarket.auth.token')")
            
            print(f'  wallet: {wallet}')
            print(f'  has_creds: {bool(creds)}')
            print(f'  has_token: {bool(auth_token)}')
            
            if wallet and TARGET_WALLET in wallet.lower():
                print(f'  >>> TIAGO SESSION FOUND IN {profile}! <<<')
                results.append({
                    'profile': profile,
                    'wallet': wallet,
                    'creds': creds,
                    'token': auth_token
                })
            
            ctx.close()
    except Exception as e:
        print(f'  ERROR: {str(e)[:120]}')

if results:
    print(f'\n=== FOUND {len(results)} matching profile(s) ===')
    for r in results:
        print(f"Profile: {r['profile']}")
        print(f"Wallet: {r['wallet']}")
        if r['creds']:
            try:
                creds_parsed = json.loads(r['creds'])
                print(f"Creds keys: {list(creds_parsed.keys())}")
                # Save creds for trade script
                with open('/tmp/poly_creds.json', 'w') as f:
                    json.dump({'profile': r['profile'], 'creds': creds_parsed, 'token': r['token']}, f)
                print("Creds saved to /tmp/poly_creds.json")
            except:
                print(f"Raw creds: {r['creds'][:200]}")
else:
    print('\n=== NO MATCHING PROFILES FOUND ===')
    sys.exit(1)
