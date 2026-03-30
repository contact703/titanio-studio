# 🔍 BROWSERS & SCRAPING — Relatório Completo

**Data:** 2026-03-27  
**Máquina:** Mac Mini (arm64, Darwin 24.6.0)  
**Investigador:** Tita 🐾

---

## 🌐 Browsers Instalados

| Browser | Status | Local |
|---------|--------|-------|
| **Google Chrome** | ✅ Instalado | `/Applications/Google Chrome.app` |
| **Brave** | ✅ Instalado (suporte de dados) | `~/Library/Application Support/BraveSoftware/Brave-Browser` |
| **Safari** | ✅ Instalado (nativo macOS) | `/Applications/Safari.app` |
| Firefox | ❌ Não instalado | — |
| Edge | ❌ Não instalado | — |

---

## 🧩 Perfis do Google Chrome

Perfis disponíveis:
- **Default** — perfil principal
- **Profile 1**
- **Profile 2**
- **Profile 4**
- **Guest Profile**
- **System Profile**

---

## 🔌 Extensões do Chrome (Default)

| ID | Nome | Relevância |
|----|------|-----------|
| `nglingapjinhecnfejdcpihlpneeadjp` | **OpenClaw Browser Relay** | 🔥 ALTA — CDP relay para controle de aba real |
| `cecngibhkljoiafhjfmcgbmikfogdiko` | **Manus AI Browser Operator** | 🤖 Operação de browser por AI |
| `fcoeoabgfenejglbffodgkkbkcdhcgfn` | **Claude** | 🤖 Extensão Anthropic |
| `ghbmnnjooekpmoecnnnilnnbdlolhkhi` | (nome localizado) | — |
| `nmmhkkegccagdldgiimedpiccmgmieda` | Google Pay | — |

**OpenClaw Browser Relay** (v2026.2.26) — extensão que conecta OpenClaw ao Chrome real via CDP (Chrome DevTools Protocol). Permite:
- Debugger access
- Tab control
- WebNavigation
- Acesso a localhost/127.0.0.1

---

## 🎭 Playwright

### Status: ✅ TOTALMENTE FUNCIONAL

**Versão no venv do polymarket-agent:** `1.58.0`  
**Versão global (homebrew):** `1.58.2`  
**Versão workspace node_modules:** `1.58.2` (playwright-core)

### Browsers instalados via Playwright:

```
/Volumes/TITA_039/MAC_MINI_03/Library/Caches/ms-playwright/
├── chromium-1208/              ✅ Chromium completo (arm64)
├── chromium_headless_shell-1208/ ✅ Headless shell (mais leve)
└── ffmpeg-1011/                ✅ FFmpeg para media
```

### Teste de scraping real — polymarket.com:

```
✅ Status: SUCESSO
Title: Polymarket | The World's Largest Prediction Market™
LocalStorage keys detectadas: 10
  - statsig.cached.evaluations.*
  - polymarket.cache.rq
  - u_sclid
  - statsig.session_id.*
  - AMP_remote_config_*
  - gist.web.*
Cookies: 34 cookies carregados
```

> **Conclusão:** Playwright com Chromium headless consegue acessar Polymarket, carregar JS, e ler localStorage sem problemas.

---

## 🛠️ TITA-SCRAPER

### Scripts disponíveis em `/workspace/bin/`:

| Script | Descrição |
|--------|-----------|
| `tita-scraper-simple` | Playwright sync simples — headers realistas, delays aleatórios |
| `tita-scraper` | Versão com User-Agent rotation, retry adaptativo, logging |
| `tita-scraper-v2` | Versão avançada — UA rotation, proxy (futuro), session cache, rate limit |

### Localização: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/`

> ⚠️ **Nota:** `/bin/tita-scraper-simple` NÃO existe no PATH do sistema. Os scripts ficam em `workspace/bin/` e precisam ser chamados com caminho completo ou adicionados ao PATH.

### Documentação no pasta-do-tita:
- `TITA-SCRAPER-GUIA-EQUIPE.md`
- `TITA-SCRAPER-V2-FEATURES.md`
- `TITA-SCRAPER-DASHBOARD-READY.md`
- `DASHBOARD-SCRAPER-INTEGRATION.md`

---

## 📦 Bibliotecas Python de Scraping (venv polymarket-agent)

| Lib | Versão | Status |
|-----|--------|--------|
| playwright | 1.58.0 | ✅ Instalado |
| requests | 2.33.0 | ✅ Instalado |
| httpx | 0.28.1 | ✅ Instalado |
| beautifulsoup4 | — | ❌ Não instalado |
| selenium | — | ❌ Não instalado |
| scrapy | — | ❌ Não instalado |
| aiohttp | — | ❌ Não instalado |
| curl_cffi | — | ❌ Não instalado |

---

## 📦 Ferramentas Node.js de Scraping (workspace)

| Pacote | Status |
|--------|--------|
| playwright | ✅ `node_modules/.bin/playwright` |
| playwright-core | ✅ disponível |
| puppeteer | ✅ `node_modules/.bin/puppeteer` |
| puppeteer-core | ✅ disponível |
| @puppeteer | ✅ disponível |

---

## 🔧 Ferramentas de Sistema

| Ferramenta | Versão | Status |
|------------|--------|--------|
| curl | 8.7.1 | ✅ |
| wget | 1.25.0 | ✅ |
| jq | 1.7.1 | ✅ |
| chromium (CLI) | — | ❌ Não no PATH |

---

## 🎯 Resumo Estratégico para Polymarket Agent

### Opções de scraping (do mais simples ao mais poderoso):

1. **httpx/requests** — Para endpoints de API públicos (CLOB, gamma)
   - Rápido, sem overhead de browser
   - Funciona para `https://clob.polymarket.com/`, `https://gamma-api.polymarket.com/`

2. **Playwright headless (Chromium)** — Para scraping com JS
   - ✅ **JÁ TESTADO e funcional** com polymarket.com
   - Consegue ler localStorage, cookies, renderizar React
   - Scripts prontos em `workspace/bin/tita-scraper*`

3. **OpenClaw Browser Relay** — Para usar Chrome real do Eduardo
   - Extensão já instalada no Chrome
   - Acessa sessão autenticada (wallet conectada)
   - Via CDP relay em localhost
   - **OPÇÃO MAIS PODEROSA** para acessar dados privados/autenticados

4. **Puppeteer (Node.js)** — Alternativa ao Playwright em JS
   - Disponível no workspace node_modules

### Recomendação para polymarket-agent:
- **Dados públicos de mercado** → `httpx` (já configurado)
- **Dados da página renderizada** → `playwright` headless (✅ funciona)
- **Dados da conta do Eduardo** → OpenClaw Browser Relay (Chrome real com wallet)

---

*Relatório gerado em 2026-03-27 por Tita 🐾*
