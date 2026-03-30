#!/bin/bash
###############################################################################
# 🔮 Oracle — Relatório Semanal Automático
#
# Coleta dados de: GitHub, Reddit, mercado IA, nosso trabalho
# Gera relatório com: tendências, oportunidades, 5 próximos passos
# Roda: todo domingo 10:00 via LaunchAgent
###############################################################################

set -e

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
REPORT_DIR="$WORKSPACE/projetos/oracle/reports"
DATE=$(date +%Y-%m-%d)
REPORT="$REPORT_DIR/weekly-$DATE.md"

mkdir -p "$REPORT_DIR"

echo "🔮 Oracle — Gerando Relatório Semanal ($DATE)"

cat > "$REPORT" << HEADER
# 🔮 Oracle — Relatório Semanal
**Data:** $DATE
**Período:** $(date -v-7d +%Y-%m-%d 2>/dev/null || date -d "7 days ago" +%Y-%m-%d) a $DATE

---

HEADER

# ============================================================
# 1. O QUE FIZEMOS ESTA SEMANA
# ============================================================
echo "## 📋 O Que Fizemos Esta Semana" >> "$REPORT"
echo "" >> "$REPORT"

# Puxar dos flush persistentes da semana
for i in $(seq 0 6); do
    DAY=$(date -v-${i}d +%Y-%m-%d 2>/dev/null || date -d "$i days ago" +%Y-%m-%d)
    FLUSH=$(ls -t "$WORKSPACE/pasta-do-tita/memoria-persistente/${DAY}"*.md 2>/dev/null | head -1)
    DAILY="$WORKSPACE/memory/${DAY}.md"
    
    if [ -f "$DAILY" ]; then
        LINES=$(wc -l < "$DAILY" | xargs)
        echo "- **$DAY** ($LINES linhas de atividade)" >> "$REPORT"
    fi
done
echo "" >> "$REPORT"

# HiClaw tasks da semana
TASKS_COMPLETED=$(curl -s http://localhost:4444/api/tasks 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
completed = d.get('completed_tasks',[])
print(len(completed))
" 2>/dev/null || echo "?")
TASKS_ACTIVE=$(curl -s http://localhost:4444/api/tasks 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(len(d.get('active_tasks',[])))
" 2>/dev/null || echo "?")
echo "**HiClaw:** $TASKS_COMPLETED tasks completadas, $TASKS_ACTIVE ativas" >> "$REPORT"
echo "" >> "$REPORT"

# tmem stats
TMEM_ENTRIES=$(python3 -c "import json;print(len(json.load(open('$WORKSPACE/memory/curated-knowledge.json')).get('entries',[])))" 2>/dev/null || echo "?")
echo "**Memória:** $TMEM_ENTRIES conhecimentos curados no tmem" >> "$REPORT"
echo "" >> "$REPORT"

# ============================================================
# 2. TENDÊNCIAS DO MERCADO IA
# ============================================================
echo "## 📈 Tendências do Mercado" >> "$REPORT"
echo "" >> "$REPORT"
echo "*Coletado de GitHub Trending, Reddit, e notícias*" >> "$REPORT"
echo "" >> "$REPORT"

# GitHub trending (via API)
python3 << 'PYEOF' >> "$REPORT" 2>/dev/null
import asyncio
from playwright.async_api import async_playwright

async def github_trending():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
        
        await page.goto("https://github.com/trending?since=weekly&spoken_language_code=en", timeout=15000)
        await asyncio.sleep(3)
        
        repos = await page.query_selector_all("article.Box-row")
        
        print("### GitHub Trending (semana)")
        for repo in repos[:8]:
            try:
                name_el = await repo.query_selector("h2 a")
                desc_el = await repo.query_selector("p")
                name = (await name_el.inner_text()).strip().replace("\n", "/") if name_el else "?"
                desc = (await desc_el.inner_text()).strip()[:100] if desc_el else ""
                print(f"- **{name}** — {desc}")
            except:
                pass
        print()
        await browser.close()

asyncio.run(github_trending())
PYEOF

# Reddit AI trends
python3 << 'PYEOF' >> "$REPORT" 2>/dev/null
import asyncio, json
from playwright.async_api import async_playwright

async def reddit_trends():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
        
        print("### Reddit Hot (IA)")
        for sub in ["LocalLLaMA", "ClaudeAI"]:
            try:
                await page.goto(f"https://www.reddit.com/r/{sub}/hot.json?limit=5", timeout=10000)
                await asyncio.sleep(2)
                body = await page.inner_text("body")
                data = json.loads(body)
                posts = data.get("data",{}).get("children",[])
                
                for post in posts[:3]:
                    title = post.get("data",{}).get("title","")[:80]
                    score = post.get("data",{}).get("score",0)
                    if title and score > 10:
                        print(f"- r/{sub}: {title} ({score} upvotes)")
            except:
                pass
        print()
        await browser.close()

asyncio.run(reddit_trends())
PYEOF

# ============================================================
# 3. OPORTUNIDADES DETECTADAS
# ============================================================
echo "## 💡 Oportunidades Detectadas" >> "$REPORT"
echo "" >> "$REPORT"
echo "*(baseado nas tendências + nosso trabalho + mercado)*" >> "$REPORT"
echo "" >> "$REPORT"

# ============================================================
# 4. RISCOS
# ============================================================
echo "## ⚠️ Riscos" >> "$REPORT"
echo "" >> "$REPORT"

# Sistema
RAM_PCT=$(bash "$WORKSPACE/bin/titanio-monitor.sh" check 2>/dev/null | grep "RAM:" | head -1)
echo "- **Sistema:** $RAM_PCT" >> "$REPORT"

# Security
SECURITY_ISSUES=$(bash "$WORKSPACE/bin/security-scan.sh" 2>/dev/null | grep "Issues" | head -1)
echo "- **Segurança:** $SECURITY_ISSUES" >> "$REPORT"
echo "" >> "$REPORT"

# ============================================================
# 5. TOP 5 PRÓXIMOS PASSOS
# ============================================================
echo "## 🎯 Top 5 Próximos Passos" >> "$REPORT"
echo "" >> "$REPORT"
echo "1. **[A definir com base nas tendências coletadas acima]**" >> "$REPORT"
echo "2. **[A definir]**" >> "$REPORT"
echo "3. **[A definir]**" >> "$REPORT"
echo "4. **[A definir]**" >> "$REPORT"
echo "5. **[A definir]**" >> "$REPORT"
echo "" >> "$REPORT"

# Footer
echo "---" >> "$REPORT"
echo "_Gerado automaticamente por Oracle 🔮 | $(date '+%H:%M %d/%m/%Y')_" >> "$REPORT"

LINES=$(wc -l < "$REPORT" | xargs)
echo "✅ Relatório gerado: $REPORT ($LINES linhas)"
