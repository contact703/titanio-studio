import json, sys, re, urllib.request

ids = [1294, 1295, 1296, 1297, 1298, 1299, 1300, 1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1586, 1587, 1588, 1589, 1590, 1591, 1152, 1178, 1183]

for pid in ids:
    url = f"https://maricafilmcommission.com/wp-json/wp/v2/pages/{pid}"
    try:
        with urllib.request.urlopen(url) as resp:
            p = json.loads(resp.read())
        title = p["title"]["rendered"]
        content = p["content"]["rendered"]
        imgs = re.findall(r'src="([^"]+\.(jpg|jpeg|png|gif|webp))"', content, re.IGNORECASE)
        feat = p.get("featured_media", 0)
        # Dedupe check
        fnames = [img[0].split("/")[-1].split("?")[0] for img in imgs]
        dupes = [f for f in set(fnames) if fnames.count(f) > 1]
        print(f"=== {title} (ID:{pid}) | feat:{feat} | imgs:{len(imgs)} ===")
        for i, img in enumerate(imgs):
            fname = img[0].split("/")[-1].split("?")[0]
            dup_mark = " [DUPLICATE]" if fname in dupes else ""
            print(f"  {i+1}. {fname}{dup_mark}")
        if dupes:
            print(f"  >> DUPLICATES FOUND: {dupes}")
        print()
    except Exception as e:
        print(f"=== ERROR page {pid}: {e} ===")
        print()
