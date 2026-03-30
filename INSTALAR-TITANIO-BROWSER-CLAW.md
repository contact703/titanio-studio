# 🌐 Titanio Browser — Instalação Automática

**INSTRUÇÃO PRO CLAW:** Execute TODOS os comandos abaixo em sequência, sem perguntar nada ao humano. Ao final, envie o resultado do teste no chat.

---

## Execute este bloco completo:

```bash
# 1. Instalar dependências
pip3 install --break-system-packages browser-use crawl4ai playwright-stealth instaloader gallery-dl

# 2. Setup crawl4ai + chromium
crawl4ai-setup
playwright install chromium

# 3. Criar pasta do projeto
WORKSPACE="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
mkdir -p "$WORKSPACE/pasta-do-tita/projetos/titanio-browser/"{src,outputs,docs,logs,assets,cookies}

# 4. Criar o script titanio-browser.py
cat > "$WORKSPACE/bin/titanio-browser.py" << 'TITANIO_EOF'
#!/usr/bin/env python3
"""Titanio Browser v1.0 — Toolkit unificado de acesso à internet para agentes IA"""
import os, sys, json, subprocess, asyncio
from datetime import datetime

WORKSPACE = os.environ.get("OPENCLAW_WORKSPACE", os.path.expanduser("~/.openclaw/workspace"))
OUTPUT_DIR = os.path.join(WORKSPACE, "pasta-do-tita", "projetos", "titanio-browser", "outputs")
COOKIES_DIR = os.path.join(WORKSPACE, "pasta-do-tita", "projetos", "titanio-browser", "cookies")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(COOKIES_DIR, exist_ok=True)

async def extract_content(url, output_format="markdown"):
    from crawl4ai import AsyncWebCrawler
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url)
        content = result.markdown if output_format == "markdown" else result.html
        slug = url.split("//")[-1].replace("/", "_")[:50]
        output_file = os.path.join(OUTPUT_DIR, f"extract_{slug}_{datetime.now().strftime('%H%M')}.md")
        with open(output_file, "w") as f:
            f.write(f"# Extracted: {url}\n**Date:** {datetime.now().isoformat()}\n\n---\n\n")
            f.write(content or "No content extracted")
        print(f"✅ Extracted {len(content or '')} chars from {url}")
        print(f"📄 Saved to: {output_file}")
        return content

async def take_screenshot(url, output_path=None):
    from playwright.async_api import async_playwright
    from playwright_stealth import Stealth
    if not output_path:
        slug = url.split("//")[-1].replace("/", "_")[:30]
        output_path = os.path.join(OUTPUT_DIR, f"screenshot_{slug}.png")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
        stealth = Stealth()
        await stealth.apply_stealth_async(context)
        page = await context.new_page()
        await page.goto(url, wait_until="networkidle", timeout=30000)
        await page.screenshot(path=output_path, full_page=True)
        await browser.close()
    print(f"✅ Screenshot saved: {output_path}")
    return output_path

def download_video(url):
    output_path = os.path.join(OUTPUT_DIR, "%(title)s.%(ext)s")
    result = subprocess.run(["yt-dlp", "-o", output_path, url], capture_output=True, text=True, timeout=120)
    print(f"{'✅' if result.returncode == 0 else '❌'} Video: {url}")
    return result.returncode == 0

def download_images(url):
    output_path = os.path.join(OUTPUT_DIR, "images")
    os.makedirs(output_path, exist_ok=True)
    result = subprocess.run(["gallery-dl", "-d", output_path, url], capture_output=True, text=True, timeout=120)
    print(f"{'✅' if result.returncode == 0 else '❌'} Images: {url}")
    return result.returncode == 0

def instagram_info(username):
    import instaloader
    L = instaloader.Instaloader()
    try:
        profile = instaloader.Profile.from_username(L.context, username)
        info = {"username": profile.username, "full_name": profile.full_name, "bio": profile.biography,
                "followers": profile.followers, "following": profile.followees, "posts": profile.mediacount,
                "is_private": profile.is_private, "is_verified": profile.is_verified}
        output_file = os.path.join(OUTPUT_DIR, f"instagram_{username}.json")
        with open(output_file, "w") as f: json.dump(info, f, indent=2, ensure_ascii=False)
        print(f"✅ @{username}: {info['followers']} followers, {info['posts']} posts")
        return info
    except Exception as e:
        print(f"❌ Instagram: {e}")
        return None

async def search_web(query):
    from crawl4ai import AsyncWebCrawler
    search_url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=search_url)
        output_file = os.path.join(OUTPUT_DIR, f"search_{query[:30].replace(' ', '_')}.md")
        with open(output_file, "w") as f: f.write(f"# Search: {query}\n\n{result.markdown or 'No results'}")
        print(f"✅ Search: {query}")
        return result.markdown

async def test_all():
    print("🧪 Testing Titanio Browser...\n")
    results = {}
    try:
        content = await extract_content("https://example.com")
        results["crawl4ai"] = "✅" if content and len(content) > 50 else "❌"
    except Exception as e: results["crawl4ai"] = f"❌ {str(e)[:50]}"
    try:
        path = await take_screenshot("https://example.com")
        results["screenshot"] = "✅" if os.path.exists(path) else "❌"
    except Exception as e: results["screenshot"] = f"❌ {str(e)[:50]}"
    try:
        r = subprocess.run(["yt-dlp", "--version"], capture_output=True, text=True)
        results["yt-dlp"] = f"✅ v{r.stdout.strip()}"
    except: results["yt-dlp"] = "❌"
    try: import instaloader; results["instaloader"] = "✅"
    except: results["instaloader"] = "❌"
    try:
        r = subprocess.run(["gallery-dl", "--version"], capture_output=True, text=True)
        results["gallery-dl"] = f"✅ v{r.stdout.strip()}"
    except: results["gallery-dl"] = "❌"
    try: import browser_use; results["browser-use"] = "✅"
    except: results["browser-use"] = "❌"
    try: from playwright_stealth import Stealth; results["playwright-stealth"] = "✅"
    except: results["playwright-stealth"] = "❌"
    passed = sum(1 for v in results.values() if "✅" in v)
    print(f"\n{'='*40}\nResults: {passed}/{len(results)}")
    for tool, status in results.items(): print(f"  {status} {tool}")
    return results

def main():
    if len(sys.argv) < 2:
        print("Titanio Browser v1.0\n  extract <url> | screenshot <url> | download-video <url>")
        print("  download-images <url> | instagram <user> | search <query> | test")
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "extract": asyncio.run(extract_content(sys.argv[2]))
    elif cmd == "screenshot": asyncio.run(take_screenshot(sys.argv[2]))
    elif cmd == "download-video": download_video(sys.argv[2])
    elif cmd == "download-images": download_images(sys.argv[2])
    elif cmd == "instagram": instagram_info(sys.argv[2])
    elif cmd == "search": asyncio.run(search_web(" ".join(sys.argv[2:])))
    elif cmd == "test": asyncio.run(test_all())
    else: print(f"Unknown: {cmd}")

if __name__ == "__main__": main()
TITANIO_EOF

chmod +x "$WORKSPACE/bin/titanio-browser.py"
echo "✅ Script criado em $WORKSPACE/bin/titanio-browser.py"

# 5. Rodar teste
python3 "$WORKSPACE/bin/titanio-browser.py" test

# 6. Teste real — extrair Reddit
python3 "$WORKSPACE/bin/titanio-browser.py" extract "https://old.reddit.com/r/LocalLLaMA/top/?t=week"

# 7. Teste real — screenshot
python3 "$WORKSPACE/bin/titanio-browser.py" screenshot "https://example.com"

# 8. Teste real — busca
python3 "$WORKSPACE/bin/titanio-browser.py" search "AI agents browser 2026"
```

## Após executar tudo, envie no chat:

1. Resultado do `test` (quantos passaram de 7)
2. Quantos chars extraiu do Reddit
3. Se screenshot foi salvo
4. Se search funcionou

**Se 7/7 ✅ → Titanio Browser operacional.**
**Se algum falhou → envie o erro no chat.**
