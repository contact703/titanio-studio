#!/usr/bin/env python3
"""
Titanio Browser v1.0 — Toolkit unificado de acesso à internet para agentes IA
==============================================================================

Usage:
  extract <url>              — Extrai conteúdo como Markdown (crawl4ai)
  navigate <url> <task>      — Navega site com agente IA (browser-use)
  screenshot <url>           — Tira screenshot stealth
  download-video <url>       — Baixa vídeo (yt-dlp)
  download-images <url>      — Baixa imagens (gallery-dl)
  instagram <username>       — Info de perfil Instagram (instaloader)
  search <query>             — Busca na web e extrai resultados
  test                       — Testa todas as ferramentas
"""

import os
import sys
import json
import subprocess
import asyncio
from datetime import datetime

WORKSPACE = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
OUTPUT_DIR = os.path.join(WORKSPACE, "pasta-do-tita", "projetos", "titanio-browser", "outputs")
COOKIES_DIR = os.path.join(WORKSPACE, "pasta-do-tita", "projetos", "titanio-browser", "cookies")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(COOKIES_DIR, exist_ok=True)


async def extract_content(url, output_format="markdown"):
    """Extract content from URL using crawl4ai."""
    from crawl4ai import AsyncWebCrawler
    
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url)
        
        if output_format == "markdown":
            content = result.markdown
        else:
            content = result.html
        
        # Save output
        slug = url.split("//")[-1].replace("/", "_")[:50]
        output_file = os.path.join(OUTPUT_DIR, f"extract_{slug}_{datetime.now().strftime('%H%M')}.md")
        with open(output_file, "w") as f:
            f.write(f"# Extracted: {url}\n")
            f.write(f"**Date:** {datetime.now().isoformat()}\n\n---\n\n")
            f.write(content or "No content extracted")
        
        print(f"✅ Extracted {len(content or '')} chars from {url}")
        print(f"📄 Saved to: {output_file}")
        return content


async def take_screenshot(url, output_path=None):
    """Take stealth screenshot using Playwright."""
    from playwright.async_api import async_playwright
    from playwright_stealth import Stealth
    
    if not output_path:
        slug = url.split("//")[-1].replace("/", "_")[:30]
        output_path = os.path.join(OUTPUT_DIR, f"screenshot_{slug}.png")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        # Apply stealth v2
        stealth = Stealth()
        await stealth.apply_stealth_async(context)
        page = await context.new_page()
        await page.goto(url, wait_until="networkidle", timeout=30000)
        await page.screenshot(path=output_path, full_page=True)
        await browser.close()
    
    print(f"✅ Screenshot saved: {output_path}")
    return output_path


def download_video(url):
    """Download video using yt-dlp."""
    output_path = os.path.join(OUTPUT_DIR, "%(title)s.%(ext)s")
    cmd = ["yt-dlp", "-o", output_path, url]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode == 0:
        print(f"✅ Video downloaded")
        print(result.stdout.split("\n")[-3] if result.stdout else "")
    else:
        print(f"❌ Download failed: {result.stderr[:200]}")
    return result.returncode == 0


def download_images(url):
    """Download images using gallery-dl."""
    output_path = os.path.join(OUTPUT_DIR, "images")
    os.makedirs(output_path, exist_ok=True)
    cmd = ["gallery-dl", "-d", output_path, url]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    
    if result.returncode == 0:
        print(f"✅ Images downloaded to {output_path}")
    else:
        print(f"❌ Download failed: {result.stderr[:200]}")
    return result.returncode == 0


def instagram_info(username):
    """Get Instagram profile info using instaloader."""
    import instaloader
    
    L = instaloader.Instaloader()
    try:
        profile = instaloader.Profile.from_username(L.context, username)
        info = {
            "username": profile.username,
            "full_name": profile.full_name,
            "bio": profile.biography,
            "followers": profile.followers,
            "following": profile.followees,
            "posts": profile.mediacount,
            "is_private": profile.is_private,
            "is_verified": profile.is_verified,
            "profile_pic": profile.profile_pic_url,
        }
        
        output_file = os.path.join(OUTPUT_DIR, f"instagram_{username}.json")
        with open(output_file, "w") as f:
            json.dump(info, f, indent=2, ensure_ascii=False)
        
        print(f"✅ @{username}: {info['followers']} followers, {info['posts']} posts")
        print(f"📄 Saved to: {output_file}")
        return info
    except Exception as e:
        print(f"❌ Failed: {e}")
        return None


async def search_web(query):
    """Search web and extract results using crawl4ai."""
    from crawl4ai import AsyncWebCrawler
    
    search_url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"
    
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=search_url)
        content = result.markdown
        
        output_file = os.path.join(OUTPUT_DIR, f"search_{query[:30].replace(' ', '_')}.md")
        with open(output_file, "w") as f:
            f.write(f"# Search: {query}\n\n{content or 'No results'}")
        
        print(f"✅ Search results for: {query}")
        print(f"📄 Saved to: {output_file}")
        return content


async def test_all():
    """Test all tools."""
    print("🧪 Testing Titanio Browser...")
    results = {}
    
    # Test 1: crawl4ai extract
    print("\n--- Test 1: crawl4ai extract ---")
    try:
        content = await extract_content("https://example.com")
        results["crawl4ai"] = "✅" if content and len(content) > 50 else "❌"
    except Exception as e:
        results["crawl4ai"] = f"❌ {str(e)[:50]}"
    print(f"  {results['crawl4ai']}")
    
    # Test 2: screenshot
    print("\n--- Test 2: screenshot ---")
    try:
        path = await take_screenshot("https://example.com")
        results["screenshot"] = "✅" if os.path.exists(path) else "❌"
    except Exception as e:
        results["screenshot"] = f"❌ {str(e)[:50]}"
    print(f"  {results['screenshot']}")
    
    # Test 3: yt-dlp
    print("\n--- Test 3: yt-dlp ---")
    try:
        r = subprocess.run(["yt-dlp", "--version"], capture_output=True, text=True)
        results["yt-dlp"] = f"✅ v{r.stdout.strip()}"
    except:
        results["yt-dlp"] = "❌"
    print(f"  {results['yt-dlp']}")
    
    # Test 4: instaloader
    print("\n--- Test 4: instaloader ---")
    try:
        import instaloader
        results["instaloader"] = "✅"
    except:
        results["instaloader"] = "❌"
    print(f"  {results['instaloader']}")
    
    # Test 5: gallery-dl
    print("\n--- Test 5: gallery-dl ---")
    try:
        r = subprocess.run(["gallery-dl", "--version"], capture_output=True, text=True)
        results["gallery-dl"] = f"✅ v{r.stdout.strip()}"
    except:
        results["gallery-dl"] = "❌"
    print(f"  {results['gallery-dl']}")
    
    # Test 6: browser-use
    print("\n--- Test 6: browser-use ---")
    try:
        import browser_use
        results["browser-use"] = "✅"
    except:
        results["browser-use"] = "❌"
    print(f"  {results['browser-use']}")
    
    # Test 7: playwright-stealth
    print("\n--- Test 7: playwright-stealth ---")
    try:
        from playwright_stealth import Stealth
        results["playwright-stealth"] = "✅"
    except:
        results["playwright-stealth"] = "❌"
    print(f"  {results['playwright-stealth']}")
    
    print("\n" + "=" * 40)
    passed = sum(1 for v in results.values() if "✅" in v)
    print(f"Results: {passed}/{len(results)} passed")
    for tool, status in results.items():
        print(f"  {status} {tool}")
    
    return results


def main():
    if len(sys.argv) < 2:
        print("Titanio Browser v1.0")
        print("")
        print("Usage:")
        print("  extract <url>          — Extract content as Markdown")
        print("  screenshot <url>       — Stealth screenshot")
        print("  download-video <url>   — Download video (yt-dlp)")
        print("  download-images <url>  — Download images (gallery-dl)")
        print("  instagram <username>   — Instagram profile info")
        print("  search <query>         — Web search + extract")
        print("  test                   — Test all tools")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "extract":
        asyncio.run(extract_content(sys.argv[2]))
    elif cmd == "screenshot":
        asyncio.run(take_screenshot(sys.argv[2]))
    elif cmd == "download-video":
        download_video(sys.argv[2])
    elif cmd == "download-images":
        download_images(sys.argv[2])
    elif cmd == "instagram":
        instagram_info(sys.argv[2])
    elif cmd == "search":
        asyncio.run(search_web(" ".join(sys.argv[2:])))
    elif cmd == "test":
        asyncio.run(test_all())
    else:
        print(f"Unknown: {cmd}")


if __name__ == "__main__":
    main()
