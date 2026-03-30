#!/usr/bin/env python3
"""Update location pages with correct descriptions from the spreadsheet."""
import csv, json, requests, time

COOKIES_FILE = '/tmp/wp-cookies.txt'
BASE = 'https://maricafilmcommission.com/wp-json/wp/v2'

# Load cookies
cookies = {}
with open(COOKIES_FILE) as f:
    for line in f:
        if line.startswith('#') or not line.strip():
            continue
        parts = line.strip().split('\t')
        if len(parts) >= 7:
            cookies[parts[5]] = parts[6]

# Get nonce
s = requests.Session()
s.cookies.update(cookies)
nonce_r = s.get('https://maricafilmcommission.com/wp-admin/admin-ajax.php?action=rest-nonce')
nonce = nonce_r.text.strip()
s.headers['X-WP-Nonce'] = nonce
print(f"Nonce: {nonce}")

# Load spreadsheet data
locations_data = {}
with open('locations-data.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)
    skip_cats = ['Local', 'PRAIAS/ LAGOAS / Montanhas', 'CEMITÉRIOS', 'IGREJAS E CAPELAS', 
                 'CINEMAS', 'ÁREAS DE ESPORTES', 'MUSEUS E ESPAÇOS CULTURAIS', 'PRAÇAS', 
                 'FAZENDAS', 'ALDEIAS INDÍGENAS', 'Outros:']
    for row in rows:
        if len(row) > 1 and row[1].strip() and row[1].strip() not in skip_cats:
            name = row[1].strip()
            pt_text = row[6].strip() if len(row) > 6 else ''
            en_text = row[7].strip() if len(row) > 7 else ''
            address = row[4].strip() if len(row) > 4 else ''
            if pt_text or en_text:
                locations_data[name] = {'pt': pt_text, 'en': en_text, 'address': address}

print(f"\nLoaded {len(locations_data)} locations with text data")

# Mapping: spreadsheet name -> (EN page ID, PT page ID)
page_map = {
    'Praias de Itaipuaçu': (1294, 1383),
    'Ponta Negra': (1295, 1413),
    'Praia do Recanto': (1296, 1418),
    'Extensão da Restinga': (1297, 1427),
    'Lagoa de Araçatiba': (1298, 1358),
    'Gruta da Sacristia': (1299, 1432),
    'Pedra do Macaco': (1300, 1403),
    'Farol de Ponta Negra': (1301, None),  # PT title is "Praia do Recanto" with slug farol-de-ponta-negra
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

def update_page_description(page_id, new_text, lang='en'):
    """Update the heading widget text in a page's Elementor data."""
    r = s.get(f'{BASE}/pages/{page_id}?context=edit&_fields=id,title,meta')
    if r.status_code != 200:
        return f"  ERROR: Failed to fetch page {page_id}: {r.status_code}"
    
    data = r.json()
    e_data_str = data.get('meta', {}).get('_elementor_data', '')
    if not e_data_str:
        return f"  SKIP: No Elementor data for page {page_id}"
    
    try:
        e_data = json.loads(e_data_str)
    except:
        return f"  ERROR: Invalid JSON for page {page_id}"
    
    updated = False
    def walk(elements):
        nonlocal updated
        for el in elements:
            if el.get('widgetType') == 'heading' and el.get('settings', {}).get('title', ''):
                title = el['settings']['title']
                if len(title) > 20:  # This is the description heading
                    el['settings']['title'] = new_text
                    updated = True
                    return
            if 'elements' in el:
                walk(el['elements'])
    
    walk(e_data)
    
    if not updated:
        return f"  WARN: No description heading found in page {page_id}"
    
    # Save back
    save_r = s.post(f'{BASE}/pages/{page_id}', json={
        'meta': {'_elementor_data': json.dumps(e_data)}
    })
    
    if save_r.status_code == 200:
        return f"  OK: Updated page {page_id} ({lang})"
    else:
        return f"  ERROR: Failed to save page {page_id}: {save_r.status_code}"

# Update all pages
print("\n--- Updating location pages ---\n")
for loc_name, (en_id, pt_id) in page_map.items():
    # Find matching spreadsheet data
    sheet_data = locations_data.get(loc_name)
    if not sheet_data:
        # Try partial match
        for k, v in locations_data.items():
            if loc_name.lower() in k.lower() or k.lower() in loc_name.lower():
                sheet_data = v
                break
    
    if not sheet_data:
        print(f"SKIP: {loc_name} - no spreadsheet data")
        continue
    
    print(f"\n{loc_name}:")
    
    # Update EN page
    if en_id and sheet_data['en']:
        result = update_page_description(en_id, sheet_data['en'], 'en')
        print(result)
    elif en_id and not sheet_data['en']:
        print(f"  SKIP EN: No English text for {loc_name}")
    
    # Update PT page  
    if pt_id and sheet_data['pt']:
        result = update_page_description(pt_id, sheet_data['pt'], 'pt')
        print(result)
    elif pt_id and not sheet_data['pt']:
        print(f"  SKIP PT: No Portuguese text for {loc_name}")
    
    time.sleep(0.5)  # Be gentle with the server

print("\n--- Done! ---")
