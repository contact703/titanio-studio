import json, re, urllib.request

page_ids = [1306, 1307, 1308, 1309, 1586, 1587, 1588, 1589, 1590, 1591, 1152, 1178, 1183]

for page_id in page_ids:
    url = f"https://maricafilmcommission.com/wp-json/wp/v2/pages/{page_id}"
    with urllib.request.urlopen(url) as resp:
        p = json.loads(resp.read())
    title = p["title"]["rendered"]
    content = p["content"]["rendered"]
    imgs = re.findall(r'src="([^"]+\.(?:jpg|jpeg|png|gif|webp))"', content, re.IGNORECASE)
    feat = p.get("featured_media", 0)
    fnames = [img.split("/")[-1].split("?")[0] for img in imgs]
    dupes = [f for f in set(fnames) if fnames.count(f) > 1]
    dupe_mark = " *** DUPES ***" if dupes else ""
    print(f"ID:{page_id} | {title} | feat:{feat} | imgs:{len(imgs)}{dupe_mark}")
    if len(imgs) > 0:
        for f in fnames:
            print(f"  - {f}")
