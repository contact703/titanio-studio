# 🔍 TANDEM BROWSER & PANDA BROWSER — Relatório de Investigação

**Data:** 2026-03-27  
**Investigador:** Tita 🐾 (subagent)  
**Máquina:** Mac Mini (arm64, Darwin 24.6.0)

---

## 🚫 TANDEM BROWSER — NÃO INSTALADO

**Status: NÃO instalado como app nessa máquina**

- Nenhum `.app` com nome "Tandem" em `/Applications/`
- Nenhum arquivo/diretório com "tandem" em `~/`

### ✅ MAS HÁ DOCUMENTAÇÃO SOBRE ELE:

Arquivo: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/tandem-browser-tiago.md`

O Tandem Browser é um projeto de browser Electron para colaboração IA+humano, discutido com o Tiago:
- **GitHub:** https://github.com/hydro13/tandem-browser
- **Versão:** 0.62.16 (developer preview)
- **API local exposta em:** `127.0.0.1:8765`
- Eduardo/Tiago mencionou "tadam browser" em mensagem de 2026-03-21 (nome de memória: "tadam" = provavelmente "Tandem")
- **Não foi instalado** — apenas estudado como referência para projeto do Tiago

### Como instalar se necessário:
```bash
git clone https://github.com/hydro13/tandem-browser
cd tandem-browser
npm install
npm start
```

---

## 🚫 PANDA BROWSER — NÃO ENCONTRADO

**Status: NÃO instalado e NÃO mencionado nos arquivos do projeto**

- Nenhum `.app` com nome "Panda" em `/Applications/`
- Nenhuma menção em arquivos de memória do workspace
- Nenhum diretório ou arquivo com "panda" em `~/`

---

## 🌐 BROWSERS REALMENTE DISPONÍVEIS

| Browser | Status | Relevância para Polymarket |
|---------|--------|---------------------------|
| **Google Chrome** | ✅ Instalado | Alta — perfis com localStorage do Polymarket |
| **Brave** | ✅ Instalado | Médio |
| **Safari** | ✅ Nativo macOS | Baixa |
| **Playwright Chromium** | ✅ Operacional | 🔥 PRINCIPAL para automação |

### Perfis Chrome com localStorage:
- ✅ `Default` — tem localStorage
- ✅ `Profile 1` — tem localStorage
- ✅ `Profile 2` — tem localStorage
- ✅ `Profile 4` — tem localStorage

### Extensões relevantes instaladas no Chrome (Default):
- **OpenClaw Browser Relay** (`nglingapjinhecnfejdcpihlpneeadjp`) — CDP relay para controle de aba real via OpenClaw
- **Manus AI Browser Operator** (`cecngibhkljoiafhjfmcgbmikfogdiko`) — operação de browser por AI
- **Claude** (`fcoeoabgfenejglbffodgkkbkcdhcgfn`) — extensão Anthropic

---

## 🔌 PORTAS CDP/API ATIVAS

**Varredura realizada nas portas:** 9222, 9223, 9224, 9225, 9226, 9300, 8080, 3000

**Resultado: NENHUMA porta CDP ativa no momento da verificação**

> Playwright headless shell estava rodando (`ms-playwright/chromium_headless_shell-1208/`) mas via `--remote-debugging-pipe` (sem porta TCP exposta).

---

## 🛠️ SISTEMA DE SCRAPER — ENCONTRADO!

### Scripts disponíveis em `/workspace/bin/`:

| Script | Descrição | Estado |
|--------|-----------|--------|
| `tita-scraper` | UA rotation, retry adaptativo, logging estruturado | ✅ Pronto |
| `tita-scraper-v2` | UA rotation + proxy + session cache + rate limit | ✅ Pronto |
| `tita-scraper-simple` | Playwright sync simples, headers realistas | ✅ Pronto |

**Caminho completo:** `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/`

### Stack do scraper:
- **Engine:** Playwright 1.58.x (Chromium headless)
- **Playwright global:** `/usr/local/bin/playwright` (Homebrew 1.58.2)
- **Playwright venv polymarket:** 1.58.0 em `src/venv/`
- **Browser usado:** `chromium_headless_shell-1208` (arm64)

### Teste confirmado:
```
✅ Playwright acessa polymarket.com com sucesso
Title: Polymarket | The World's Largest Prediction Market™
LocalStorage keys: 10 detectadas
Cookies: 34 carregados
```

### Guia da equipe:
`/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/TITA-SCRAPER-GUIA-EQUIPE.md`

---

## 📂 OUTROS ARQUIVOS RELEVANTES

| Arquivo | Conteúdo |
|---------|----------|
| `/projetos/polymarket-agent/BROWSERS-SCRAPING-REPORT.md` | Relatório completo de browsers + Playwright (criado hoje 27/03) |
| `/projetos/polymarket-agent/MAGIC-AUTH-INVESTIGATION.md` | Investigação de autenticação Magic.link |
| `/projetos/polymarket-agent/PLANO.md` | Plano geral do polymarket agent |
| `/projetos/tandem-browser-tiago.md` | Documentação do Tandem Browser para o Tiago |

---

## 📋 RESUMO EXECUTIVO

| Item | Status |
|------|--------|
| Tandem Browser instalado | ❌ NÃO |
| Panda Browser instalado | ❌ NÃO |
| Referência ao Tandem nos arquivos | ✅ SIM (apenas docs/plano) |
| Sistema de scraper disponível | ✅ SIM (3 versões prontas) |
| Chrome com perfis Polymarket | ✅ SIM (4 perfis com localStorage) |
| Playwright funcional | ✅ SIM (testado hoje) |
| CDP port ativa (para controle externo) | ❌ NÃO no momento |

### Recomendação para o Polymarket Agent:
Usar **Playwright** com o `tita-scraper-v2` ou diretamente via Python no venv do projeto. 
Não há Tandem/Panda instalado — foi apenas pesquisado como referência.
Para controle do Chrome real (com sessão logada), usar a extensão **OpenClaw Browser Relay** via CDP.
