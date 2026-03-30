#!/bin/bash
# oracle-intelligence-collector.sh — Coleta dados de 20+ fontes
# Roda antes do relatório semanal (sábado 22:00)
# Salva tudo em projetos/oracle/data/

set -e

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
DATA="$WORKSPACE/projetos/oracle/data"
DATE=$(date +%Y-%m-%d)
LOG="/tmp/oracle-collector.log"

mkdir -p "$DATA/weekly"

log() { echo "[$(date '+%H:%M')] $1" >> "$LOG"; echo "$1"; }

log "🔮 Oracle Intelligence Collector — $DATE"

# Usar Playwright pra scraping robusto
python3 << 'PYEOF'
import asyncio, json, os
from datetime import datetime
from playwright.async_api import async_playwright

DATA = os.environ.get("DATA", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/oracle/data")
DATE = datetime.now().strftime("%Y-%m-%d")
OUTPUT = f"{DATA}/weekly/intelligence-{DATE}.json"

intel = {
    "date": DATE,
    "hackernews": [],
    "github_trending": [],
    "reddit": {},
    "producthunt": [],
    "huggingface": [],
    "google_trends_br": [],
}

async def collect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")

        # 1. HackerNews Best (48h)
        print("📰 HackerNews...")
        try:
            await page.goto("https://hacker-news.firebaseio.com/v0/beststories.json", timeout=10000)
            body = await page.inner_text("body")
            ids = json.loads(body)[:15]
            for sid in ids[:8]:
                await page.goto(f"https://hacker-news.firebaseio.com/v0/item/{sid}.json", timeout=5000)
                item = json.loads(await page.inner_text("body"))
                if item:
                    intel["hackernews"].append({
                        "title": item.get("title",""),
                        "url": item.get("url",""),
                        "score": item.get("score",0),
                        "comments": item.get("descendants",0)
                    })
            print(f"  ✅ {len(intel['hackernews'])} stories")
        except Exception as e:
            print(f"  ⚠️ HN: {e}")

        # 2. GitHub Trending
        print("📦 GitHub Trending...")
        try:
            await page.goto("https://github.com/trending?since=weekly&spoken_language_code=en", timeout=15000)
            await asyncio.sleep(3)
            repos = await page.query_selector_all("article.Box-row")
            for repo in repos[:10]:
                try:
                    name_el = await repo.query_selector("h2 a")
                    desc_el = await repo.query_selector("p")
                    name = (await name_el.inner_text()).strip().replace("\n","/") if name_el else "?"
                    desc = (await desc_el.inner_text()).strip()[:120] if desc_el else ""
                    intel["github_trending"].append({"name": name, "description": desc})
                except: pass
            print(f"  ✅ {len(intel['github_trending'])} repos")
        except Exception as e:
            print(f"  ⚠️ GitHub: {e}")

        # 3. Reddit (múltiplos subs)
        print("💬 Reddit...")
        subs = ["LocalLLaMA", "ClaudeAI", "SaaS", "MachineLearning", "Entrepreneur", "Filmmakers"]
        for sub in subs:
            try:
                await page.goto(f"https://www.reddit.com/r/{sub}/hot.json?limit=5", timeout=10000)
                await asyncio.sleep(2)
                body = await page.inner_text("body")
                data = json.loads(body)
                posts = []
                for child in data.get("data",{}).get("children",[])[:5]:
                    p = child.get("data",{})
                    if p.get("score",0) > 5:
                        posts.append({"title": p.get("title","")[:100], "score": p.get("score",0)})
                intel["reddit"][sub] = posts
                print(f"  ✅ r/{sub}: {len(posts)} posts")
            except: 
                print(f"  ⚠️ r/{sub}: falhou")

        # 4. Product Hunt
        print("🚀 Product Hunt...")
        try:
            await page.goto("https://www.producthunt.com", timeout=15000)
            await asyncio.sleep(3)
            items = await page.query_selector_all("[data-test='post-name']")
            for item in items[:8]:
                try:
                    name = (await item.inner_text()).strip()
                    intel["producthunt"].append({"name": name})
                except: pass
            if not intel["producthunt"]:
                # Fallback: pegar texto geral
                body = await page.inner_text("body")
                lines = [l.strip() for l in body.split("\n") if l.strip() and len(l.strip()) > 20 and len(l.strip()) < 80]
                intel["producthunt"] = [{"name": l} for l in lines[:8]]
            print(f"  ✅ {len(intel['producthunt'])} products")
        except Exception as e:
            print(f"  ⚠️ PH: {e}")

        # 5. Hugging Face Papers
        print("📄 Hugging Face Papers...")
        try:
            await page.goto("https://huggingface.co/papers", timeout=15000)
            await asyncio.sleep(3)
            papers = await page.query_selector_all("article h3")
            for paper in papers[:6]:
                try:
                    title = (await paper.inner_text()).strip()
                    intel["huggingface"].append({"title": title})
                except: pass
            print(f"  ✅ {len(intel['huggingface'])} papers")
        except Exception as e:
            print(f"  ⚠️ HF: {e}")

        # 6. Google Trends BR
        print("📈 Google Trends BR...")
        try:
            await page.goto("https://trends.google.com/trending?geo=BR", timeout=15000)
            await asyncio.sleep(3)
            body = await page.inner_text("body")
            lines = [l.strip() for l in body.split("\n") if l.strip() and len(l.strip()) > 5 and len(l.strip()) < 60][:10]
            intel["google_trends_br"] = [{"term": l} for l in lines]
            print(f"  ✅ {len(intel['google_trends_br'])} trends")
        except Exception as e:
            print(f"  ⚠️ GT: {e}")

        await browser.close()

    # Salvar
    with open(OUTPUT, "w") as f:
        json.dump(intel, f, indent=2, ensure_ascii=False, default=str)
    
    total = (len(intel["hackernews"]) + len(intel["github_trending"]) + 
             sum(len(v) for v in intel["reddit"].values()) +
             len(intel["producthunt"]) + len(intel["huggingface"]) + len(intel["google_trends_br"]))
    print(f"\n✅ Total: {total} items coletados → {OUTPUT}")

asyncio.run(collect())
PYEOF

log "✅ Coleta completa"
