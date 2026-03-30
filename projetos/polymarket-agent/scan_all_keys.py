#!/usr/bin/env python3
"""Check all localStorage keys in each Chrome profile for Polymarket."""
import os, json
from playwright.sync_api import sync_playwright

profiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 4']
chrome_base = os.path.expanduser('~/Library/Application Support/Google/Chrome')

for profile in profiles:
    profile_path = os.path.join(chrome_base, profile)
    if not os.path.exists(profile_path):
        continue
    
    print(f'\n--- {profile} ---')
    try:
        with sync_playwright() as p:
            ctx = p.chromium.launch_persistent_context(
                profile_path, channel='chrome', headless=True,
                args=['--no-sandbox', '--no-first-run', '--disable-extensions', '--disable-default-apps']
            )
            page = ctx.new_page()
            page.goto('https://polymarket.com', timeout=30000)
            page.wait_for_timeout(6000)
            
            # Get ALL localStorage keys
            all_keys = page.evaluate("""() => {
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    keys.push(key);
                }
                return keys;
            }""")
            
            poly_keys = [k for k in all_keys if 'poly' in k.lower() or 'auth' in k.lower() or 'wallet' in k.lower() or 'magic' in k.lower()]
            print(f'  Total keys: {len(all_keys)}')
            print(f'  Relevant keys: {poly_keys}')
            
            for key in poly_keys:
                val = page.evaluate(f"localStorage.getItem('{key}')")
                print(f'  {key} = {str(val)[:150]}')
            
            # Also check cookies
            cookies = ctx.cookies(['https://polymarket.com'])
            if cookies:
                print(f'  Cookies: {[c["name"] for c in cookies]}')
            
            ctx.close()
    except Exception as e:
        print(f'  ERROR: {str(e)[:120]}')
