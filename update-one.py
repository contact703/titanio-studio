#!/usr/bin/env python3
"""Update a single page's heading text. Usage: python3 update-one.py PAGE_ID 'new text'"""
import json, subprocess, sys

def get_nonce():
    r = subprocess.run(['curl', '-s', '-b', '/tmp/wp-cookies.txt',
        'https://maricafilmcommission.com/wp-admin/admin-ajax.php?action=rest-nonce'],
        capture_output=True, text=True, timeout=15)
    return r.stdout.strip()

def update_page(pid, new_text):
    NONCE = get_nonce()
    
    r = subprocess.run(['curl', '-s', '-b', '/tmp/wp-cookies.txt', '-H', f'X-WP-Nonce: {NONCE}',
        f'https://maricafilmcommission.com/wp-json/wp/v2/pages/{pid}?context=edit&_fields=meta'],
        capture_output=True, text=True, timeout=30)
    
    d = json.loads(r.stdout, strict=False)
    ed = json.loads(d['meta']['_elementor_data'], strict=False)
    
    found = False
    def walk(els):
        nonlocal found
        for el in els:
            if el.get('widgetType') == 'heading' and len(el.get('settings',{}).get('title','')) > 20:
                el['settings']['title'] = new_text
                found = True
                return
            if 'elements' in el:
                walk(el['elements'])
    walk(ed)
    
    if not found:
        print(f"NO HEADING in {pid}")
        return False
    
    payload = json.dumps({'meta': {'_elementor_data': json.dumps(ed)}})
    r2 = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
        '-b', '/tmp/wp-cookies.txt', '-H', f'X-WP-Nonce: {NONCE}',
        '-H', 'Content-Type: application/json', '-X', 'POST', '-d', payload,
        f'https://maricafilmcommission.com/wp-json/wp/v2/pages/{pid}'],
        capture_output=True, text=True, timeout=60)
    print(f"Page {pid}: HTTP {r2.stdout.strip()}")
    return r2.stdout.strip() == '200'

if __name__ == '__main__':
    pid = int(sys.argv[1])
    text = sys.argv[2]
    update_page(pid, text)
