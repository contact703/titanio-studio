#!/usr/bin/env python3
"""Update location pages with correct descriptions from the spreadsheet using curl."""
import csv, json, subprocess, time

BASE = 'https://maricafilmcommission.com/wp-json/wp/v2'

def curl_get(url):
    result = subprocess.run(
        ['curl', '-s', '-b', '/tmp/wp-cookies.txt', '-H', f'X-WP-Nonce: {NONCE}', url],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout

def curl_post(url, data):
    result = subprocess.run(
        ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}',
         '-b', '/tmp/wp-cookies.txt', '-H', f'X-WP-Nonce: {NONCE}',
         '-H', 'Content-Type: application/json',
         '-X', 'POST', '-d', json.dumps(data), url],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout.strip()

# Get nonce
nonce_result = subprocess.run(
    ['curl', '-s', '-b', '/tmp/wp-cookies.txt',
     'https://maricafilmcommission.com/wp-admin/admin-ajax.php?action=rest-nonce'],
    capture_output=True, text=True, timeout=15
)
NONCE = nonce_result.stdout.strip()
print(f"Nonce: {NONCE}")

# Load spreadsheet data
locations_data = {}
with open('locations-data.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) > 1 and row[1].strip():
            name = row[1].strip()
            pt_text = row[6].strip() if len(row) > 6 else ''
            en_text = row[7].strip() if len(row) > 7 else ''
            if pt_text or en_text:
                locations_data[name] = {'pt': pt_text, 'en': en_text}

print(f"Loaded {len(locations_data)} locations with text\n")

# Page mapping: spreadsheet_name -> (en_page_id, pt_page_id)
page_map = {
    'Praias de Itaipuaçu': (1294, 1383),
    'Ponta Negra': (1295, 1413),
    'Praia do Recanto': (1296, 1418),
    'Extensão da Restinga': (1297, 1427),
    'Lagoa de Araçatiba': (1298, 1358),
    'Gruta da Sacristia': (1299, 1432),
    'Pedra do Macaco': (1300, 1403),
    'Farol de Ponta Negra': (1301, None),
    'Igreja Matriz de Nossa Senhora do Amparo': (1302, 1408),
    'Parque Linear do bairro Flamengo': (1303, 1373),
    'Estádio de Futebol João Saldanha em Bambuí': (1304, 1398),
    'Cinema Henfil': (1152, 1107),
    'Pedra do Elefante': (1178, 1368),
    'Casa de Cultura': (1586, 1592),
    'Praça Orlando de Barros Pimentel': (1587, 1593),
    'Fazenda Itaocaia': (1588, 1594),
    'Fazenda Joaquim Piñero': (1589, 1595),
    'Aldeia Mata Verde Bonita - São José': (1590, 1596),
    'Hospital Municipal Dr. Ernesto Che Guevara': (1591, 1597),
}

def update_page(page_id, new_text, label):
    """Update the description heading text in a page."""
    raw = curl_get(f'{BASE}/pages/{page_id}?context=edit&_fields=meta')
    try:
        d = json.loads(raw, strict=False)
        edata = json.loads(d['meta']['_elementor_data'], strict=False)
    except Exception as e:
        return f"  ERROR parsing {label} ({page_id}): {e}"
    
    updated = False
    def walk(els):
        nonlocal updated
        for el in els:
            if el.get('widgetType') == 'heading':
                title = el.get('settings', {}).get('title', '')
                if len(title) > 20:
                    el['settings']['title'] = new_text
                    updated = True
                    return True
            if 'elements' in el:
                if walk(el['elements']):
                    return True
        return False
    
    walk(edata)
    
    if not updated:
        return f"  SKIP {label} ({page_id}): no description heading found"
    
    payload = {'meta': {'_elementor_data': json.dumps(edata)}}
    code = curl_post(f'{BASE}/pages/{page_id}', payload)
    return f"  {label} ({page_id}): HTTP {code}"

# Run updates
for loc_name, (en_id, pt_id) in page_map.items():
    data = locations_data.get(loc_name)
    if not data:
        # Fuzzy match
        for k, v in locations_data.items():
            if loc_name.lower() in k.lower() or k.lower() in loc_name.lower():
                data = v
                break
    
    if not data:
        print(f"NO DATA: {loc_name}")
        continue
    
    print(f"\n{loc_name}:")
    
    if en_id and data.get('en'):
        print(update_page(en_id, data['en'], 'EN'))
    
    if pt_id and data.get('pt'):
        print(update_page(pt_id, data['pt'], 'PT'))
    
    time.sleep(0.3)

print("\n--- Done! ---")
