# 🌐 Titanio Browser — Pesquisa Completa

**Data:** 28/03/2026
**Objetivo:** Toolkit completo pra agentes IA terem acesso total à internet sem travas

---

## 1. O Problema Atual

A Tita tem limitações sérias no acesso à internet:
- **Instagram/Facebook** bloqueiam scraping (conseguimos via yt-dlp pra vídeos, mas não pra posts/stories/comments)
- **Reddit** requer login pra search results
- **Sites com Cloudflare/reCAPTCHA** bloqueiam requests diretos
- **Login em sites** (Polymarket, App Store Connect, etc.) precisa de automação frágil
- **web_fetch** do OpenClaw é básico — não executa JavaScript, não lida com SPAs
- **Não temos browser persistente** — cada sessão começa do zero

---

## 2. Ferramentas Open Source Encontradas

### 🏆 Tier 1 — As Melhores (instalar AGORA)

#### Browser-Use (browser-use/browser-use)
- **O que é:** Framework Python que transforma qualquer site em acessível pra agentes IA
- **Stars:** 50k+ (o mais popular)
- **Stack:** Playwright + LLM (Claude, GPT, Gemini, ou modelo próprio bu-30b)
- **Features:**
  - Agente navega sites como humano (clica, digita, scrolla)
  - Cloud com stealth browser (proxy rotation + captcha solving)
  - 1000+ integrações (Gmail, Slack, Notion)
  - Modo open source + modo cloud
  - CLI: `browser-use open https://site.com`, `browser-use click 5`, `browser-use screenshot`
  - Skill pra Claude Code já disponível
- **Instalação:** `pip install browser-use`
- **Preço:** Open source grátis / Cloud: $0.20/1M tokens input
- **NOTA:** Melhor opção pra agente que precisa NAVEGAR sites interativamente

#### Crawl4AI (unclecode/crawl4ai)
- **O que é:** Web crawler open source otimizado pra LLMs — extrai conteúdo como Markdown limpo
- **Stars:** 50k+ (mais popular crawler pra IA)
- **Stack:** Playwright + async + anti-bot detection
- **Features:**
  - Anti-bot detection automática em 3 tiers com proxy escalation
  - Shadow DOM flattening (pega conteúdo escondido)
  - Deep crawl com crash recovery
  - Output: Markdown limpo pra RAG/agents
  - CLI: `crwl https://site.com -o markdown`
  - Docker + self-hosting
  - REST API + WebSocket streaming
- **Instalação:** `pip install crawl4ai && crawl4ai-setup`
- **Preço:** 100% grátis (open source)
- **NOTA:** Melhor opção pra EXTRAIR CONTEÚDO de sites (scraping em massa)

### 🥈 Tier 2 — Complementares

#### Playwright (já instalado!)
- **O que é:** Automação de browser (Chromium, Firefox, WebKit)
- **Stack:** Python/Node, mantido pela Microsoft
- **Features:** Screenshots, PDF, network intercept, geo/timezone spoof
- **JÁ TEMOS:** v1.58.0 instalado
- **NOTA:** Base pra browser-use e crawl4ai. Essencial.

#### Playwright-Stealth / Nodriver
- **O que é:** Plugins que fazem Playwright parecer browser humano
- **Features:** Remove fingerprints de automação, evita detecção
- **Instalação:** `pip install playwright-stealth` ou `pip install nodriver`
- **NOTA:** Essencial pra sites que bloqueiam bots

#### Stagehand (browserbase/stagehand)
- **O que é:** Framework TypeScript pra agentes web via Playwright
- **Features:** Ações naturais (act, extract, observe), suporte LLM nativo
- **Instalação:** `npm install @browserbasehq/stagehand`
- **NOTA:** Alternativa ao browser-use pra quem prefere TypeScript

#### Steel (steel-dev/steel)
- **O que é:** Browser API open source desenhada pra agentes IA
- **Features:** Sessions persistentes, proxy management, captcha solving
- **NOTA:** Bom pra self-hosting de browsers na nuvem

### 🥉 Tier 3 — Específicos

| Ferramenta | Uso | Grátis? |
|---|---|---|
| yt-dlp (já temos) | Download vídeos (Instagram, YouTube, TikTok) | ✅ |
| gallery-dl | Download imagens de galerias/redes sociais | ✅ |
| instaloader | Scraping específico de Instagram (posts, stories, IGTV) | ✅ |
| twscrape | Scraping de Twitter/X sem API | ✅ |
| Selenium + undetected-chromedriver | Automação anti-detecção clássica | ✅ |
| Splash | Browser headless com API HTTP (Lua scripting) | ✅ |
| Browserless | Browser-as-a-service (Docker) | Free tier |

---

## 3. Problemas Específicos e Soluções

### 3.1 Instagram (nosso maior bloqueio)
| Problema | Solução |
|---|---|
| Vídeos/Reels | yt-dlp ✅ JÁ FUNCIONA |
| Posts/fotos | instaloader + login cookies |
| Stories | instaloader com session |
| Comments | browser-use (navega como humano) |
| DMs | browser-use com login persistente |
| Search/Explore | crawl4ai com stealth |

### 3.2 Reddit (bloqueio de search)
| Problema | Solução |
|---|---|
| Search results | old.reddit.com (funciona melhor) ou crawl4ai |
| Posts completos | crawl4ai com markdown output |
| Comments | crawl4ai ou browser-use |

### 3.3 Sites com Cloudflare
| Problema | Solução |
|---|---|
| Challenge page | browser-use cloud (stealth + captcha solving) |
| Rate limiting | crawl4ai com proxy rotation |
| JavaScript challenge | Playwright com stealth plugin |

### 3.4 Login/Autenticação
| Problema | Solução |
|---|---|
| Login com email/senha | browser-use (navega e faz login) |
| OAuth/Google login | browser-use com persistent sessions |
| 2FA | browser-use + manual ou TOTP automático |
| Session persistence | cookies storage em arquivo |

### 3.5 SPAs (Single Page Applications)
| Problema | Solução |
|---|---|
| Conteúdo carregado por JS | Playwright (executa JS) ou crawl4ai |
| Infinite scroll | browser-use (scrolla automaticamente) |
| Lazy-loaded content | crawl4ai com wait_for selectors |

---

## 4. Arquitetura Proposta — Titanio Browser

```
┌─────────────────────────────────────────┐
│            TITANIO BROWSER              │
│         (toolkit unificado)             │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────┐  ┌──────────────┐       │
│  │ browser-  │  │  crawl4ai    │       │
│  │ use       │  │              │       │
│  │ (navegar) │  │ (extrair)    │       │
│  └─────┬─────┘  └──────┬───────┘       │
│        │               │               │
│  ┌─────┴───────────────┴───────┐       │
│  │      Playwright + Stealth    │       │
│  │      (engine base)           │       │
│  └─────┬───────────────┬───────┘       │
│        │               │               │
│  ┌─────┴─────┐  ┌─────┴───────┐       │
│  │  Cookies   │  │  Proxy      │       │
│  │  Storage   │  │  Rotation   │       │
│  └───────────┘  └─────────────┘       │
│                                         │
│  ┌───────────────────────────────┐     │
│  │  Ferramentas Específicas      │     │
│  │  yt-dlp | instaloader |       │     │
│  │  gallery-dl | twscrape        │     │
│  └───────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

### Camadas:
1. **Browser-use** — quando precisa INTERAGIR com site (login, clicar, preencher formulário)
2. **Crawl4ai** — quando precisa EXTRAIR conteúdo em massa (scraping, deep crawl)
3. **Playwright + Stealth** — engine base, anti-detecção
4. **Cookie Storage** — sessions persistentes entre reinícios
5. **Proxy Rotation** — evitar bloqueio por IP
6. **Ferramentas específicas** — yt-dlp, instaloader, etc. pra plataformas específicas

---

## 5. Plano de Implementação

### Fase 1 — Instalar Base (30 min)
```bash
pip install browser-use
pip install crawl4ai && crawl4ai-setup
pip install playwright-stealth
pip install instaloader
pip install gallery-dl
```

### Fase 2 — Wrapper Unificado (1-2h)
Criar `bin/titanio-browser.py` que unifica todas as ferramentas:
```bash
titanio-browser navigate "https://instagram.com/explore" --login
titanio-browser extract "https://reddit.com/r/LocalLLaMA" --markdown
titanio-browser download "https://instagram.com/reel/xxx" --video
titanio-browser screenshot "https://polymarket.com" --stealth
titanio-browser login "instagram" --save-cookies
```

### Fase 3 — Integração com Especialistas (1h)
- instagramer → usa titanio-browser pra pesquisa
- trader → usa titanio-browser pra Polymarket
- code-ninja → usa titanio-browser pra scraping de repos
- content-writer → usa titanio-browser pra pesquisa de tendências

### Fase 4 — Cookie Manager & Proxy (2h)
- Gerenciamento de sessões persistentes
- Proxy rotation automática
- Login manager (salva credenciais de forma segura)

---

## 6. O que JÁ TEMOS vs O que FALTA

| Ferramenta | Status | Ação |
|---|---|---|
| Playwright | ✅ v1.58.0 | Já instalado |
| yt-dlp | ✅ | Já funciona pra vídeos |
| web_fetch (OpenClaw) | ✅ | Básico, sem JS |
| browser-use | ❌ | pip install |
| crawl4ai | ❌ | pip install + setup |
| playwright-stealth | ❌ | pip install |
| instaloader | ❌ | pip install |
| gallery-dl | ❌ | pip install |
| Cookie manager | ❌ | Criar |
| Proxy rotation | ❌ | Criar/configurar |
| Wrapper unificado | ❌ | Criar titanio-browser.py |

---

## 7. Fontes da Pesquisa

- GitHub: browser-use/browser-use (50k+ stars)
- GitHub: unclecode/crawl4ai (50k+ stars)
- GitHub: browserbase/stagehand (TypeScript alternative)
- GitHub: steel-dev/steel (browser API)
- Reddit: r/LocalLLaMA, r/ClaudeAI (discussões sobre browser agents)
- Playwright docs: playwright.dev
- Crawl4ai docs: docs.crawl4ai.com

---

*Pesquisa por Tita, 28/03/2026*
*"Sem browser, agente IA é cego. Com Titanio Browser, acesso total."*
