import json, re, urllib.request

# All location page IDs to check (EN + PT)
page_ids = [
    # EN pages with known content images
    1295, 1305, 1306, 1307, 1308, 1309, 1178, 1183,
    # PT equivalents - check them too
    1413, 1436, 1363, 1378, 1388, 1434, 1368, 1393,
    # Other PT pages
    1358, 1373, 1383, 1418, 1427, 1432, 1403, 1408, 1649, 1398, 1304,
    # More EN
    1294, 1296, 1297, 1298, 1300, 1301, 1302, 1303,
    # New locations
    1586, 1587, 1588, 1589, 1590, 1591,
    1592, 1593, 1594, 1595, 1596, 1597,
    1107, 1152
]

# Dedupe
page_ids = list(dict.fromkeys(page_ids))

for page_id in page_ids:
    url = f"https://maricafilmcommission.com/wp-json/wp/v2/pages/{page_id}"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            p = json.loads(resp.read())
        title = p["title"]["rendered"]
        content = p["content"]["rendered"]
        imgs = re.findall(r'src="([^"]+\.(?:jpg|jpeg|png|gif|webp))"', content, re.IGNORECASE)
        feat = p.get("featured_media", 0)
        if imgs:
            fnames = [img.split("/")[-1].split("?")[0] for img in imgs]
            print(f"HAS_IMG | ID:{page_id} | {title} | feat:{feat} | imgs: {', '.join(fnames)}")
        # else skip - no content images = clean
    except Exception as e:
        print(f"ERROR | ID:{page_id} | {e}")
