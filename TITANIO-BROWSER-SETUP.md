# 🌐 Titanio Browser — Setup para Todos os Claws

**Data:** 28/03/2026
**O que é:** Toolkit unificado de acesso à internet para agentes IA. Scraping, navegação, screenshots, downloads — tudo num comando.

---

## Passo 1 — Instalar

```bash
pip3 install --break-system-packages browser-use crawl4ai playwright-stealth instaloader gallery-dl

# Setup crawl4ai (instala browser Chromium se necessário)
crawl4ai-setup

# Verificar Playwright
playwright install chromium
```

## Passo 2 — Copiar Script

Copiar `bin/titanio-browser.py` (9.5KB) pro workspace.

Ajustar paths no topo:
```python
WORKSPACE = "/caminho/do/seu/workspace"
```

```bash
chmod +x bin/titanio-browser.py
```

## Passo 3 — Testar

```bash
python3 bin/titanio-browser.py test
```

Deve retornar 7/7 ✅:
- crawl4ai (extrair conteúdo)
- screenshot (stealth)
- yt-dlp (vídeos)
- instaloader (Instagram)
- gallery-dl (imagens)
- browser-use (navegação IA)
- playwright-stealth (anti-detecção)

## Comandos

```bash
# Extrair conteúdo de site como Markdown
python3 bin/titanio-browser.py extract "https://reddit.com/r/LocalLLaMA"

# Screenshot stealth (parece humano)
python3 bin/titanio-browser.py screenshot "https://polymarket.com"

# Baixar vídeo (Instagram, YouTube, TikTok)
python3 bin/titanio-browser.py download-video "https://instagram.com/reel/xxx"

# Baixar imagens
python3 bin/titanio-browser.py download-images "https://site.com/galeria"

# Info de perfil Instagram
python3 bin/titanio-browser.py instagram "username"

# Busca na web + extrai resultados
python3 bin/titanio-browser.py search "AI agents 2026"
```

## O Que Cada Ferramenta Faz

| Ferramenta | Uso | Quando Usar |
|---|---|---|
| crawl4ai | Extrai conteúdo como Markdown | Scraping, pesquisa, RAG |
| browser-use | Navega sites como humano | Login, formulários, SPAs |
| playwright-stealth | Anti-detecção | Sites que bloqueiam bots |
| yt-dlp | Download vídeos | Instagram Reels, YouTube |
| instaloader | Scraping Instagram | Perfis, posts (precisa login) |
| gallery-dl | Download imagens | Galerias, redes sociais |

## Outputs

Tudo salvo em: `projetos/titanio-browser/outputs/`

## Notas

- Instagram API requer login pra maioria das operações (rate limit sem login)
- Sites com Cloudflare: usar browser-use cloud ou crawl4ai com proxy
- Screenshots são full-page por padrão
- crawl4ai tem anti-bot detection em 3 tiers automático

---

*Titanio Browser v1.0 — 7 ferramentas, 1 comando*
