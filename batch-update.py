#!/usr/bin/env python3
"""Batch update all location pages with spreadsheet descriptions."""
import csv, json, subprocess, sys

def get_nonce():
    r = subprocess.run(['curl', '-s', '-b', '/tmp/wp-cookies.txt',
        'https://maricafilmcommission.com/wp-admin/admin-ajax.php?action=rest-nonce'],
        capture_output=True, text=True, timeout=15)
    return r.stdout.strip()

def update_page(pid, new_text, label):
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
        print(f"  {label} ({pid}): NO HEADING", flush=True)
        return
    payload = json.dumps({'meta': {'_elementor_data': json.dumps(ed)}})
    r2 = subprocess.run(['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
        '-b', '/tmp/wp-cookies.txt', '-H', f'X-WP-Nonce: {NONCE}',
        '-H', 'Content-Type: application/json', '-X', 'POST', '-d', payload,
        f'https://maricafilmcommission.com/wp-json/wp/v2/pages/{pid}'],
        capture_output=True, text=True, timeout=60)
    print(f"  {label} ({pid}): HTTP {r2.stdout.strip()}", flush=True)

# Load CSV
loc = {}
with open('locations-data.csv', 'r') as f:
    for row in csv.reader(f):
        if len(row) > 1 and row[1].strip():
            name = row[1].strip()
            pt = row[6].strip() if len(row) > 6 else ''
            en = row[7].strip() if len(row) > 7 else ''
            if pt or en:
                loc[name] = (pt, en)

# Already done: 1294 (Itaipuaçu EN), 1295 (Ponta Negra EN)
# Remaining pages to update:
MAP = [
    ('Praias de Itaipuaçu', None, 1383),       # PT only (EN already done)
    ('Ponta Negra', None, 1413),                 # PT only (EN already done)
    ('Praia do Recanto', 1296, 1418),
    ('Extensão da Restinga', 1297, 1427),
    ('Lagoa de Araçatiba', 1298, 1358),
    ('Gruta da Sacristia', 1299, 1432),
    ('Pedra do Macaco', 1300, 1403),
    ('Farol de Ponta Negra', 1301, None),
    ('Igreja Matriz de Nossa Senhora do Amparo', 1302, 1408),
    ('Parque Linear do bairro Flamengo', 1303, 1373),
    ('Estádio de Futebol João Saldanha em Bambuí', 1304, 1398),
    ('Cinema Henfil', 1152, 1107),
    ('Pedra do Elefante', 1178, 1368),
    ('Casa de Cultura', 1586, 1592),
    ('Praça Orlando de Barros Pimentel', 1587, 1593),
    ('Fazenda Itaocaia', 1588, 1594),
    ('Fazenda Joaquim Piñero', 1589, 1595),
    ('Aldeia Mata Verde Bonita - São José', 1590, 1596),
    ('Hospital Municipal Dr. Ernesto Che Guevara', 1591, 1597),
]

for name, en_id, pt_id in MAP:
    data = loc.get(name)
    if not data:
        for k, v in loc.items():
            if name.lower() in k.lower() or k.lower() in name.lower():
                data = v
                break
    if not data:
        print(f"SKIP: {name} (no data)", flush=True)
        continue
    
    pt_text, en_text = data
    print(f"\n{name}:", flush=True)
    
    if en_id and en_text:
        update_page(en_id, en_text, 'EN')
    if pt_id and pt_text:
        update_page(pt_id, pt_text, 'PT')

print("\n=== ALL DONE ===", flush=True)
