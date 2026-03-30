# Pesquisa Profunda: OpenClaw Dashboard
**Data:** 2026-03-13  
**Duração:** ~40 minutos  
**Pesquisadora:** Tita (subagent)

---

## 📊 Resumo Executivo

O **OpenClaw Dashboard** (chamado oficialmente de **Control UI**) é uma SPA (Single Page App) construída com **Vite + Lit**, servida pelo Gateway na porta padrão **18789**. É a interface web de controle do OpenClaw — um gateway self-hosted para agentes IA que suporta WhatsApp, Telegram, Discord, iMessage e outros. Não existem screenshots ou vídeos públicos indexados sobre o dashboard; toda a informação disponível vem da documentação oficial e do código local instalado.

---

## 🔍 Fontes Pesquisadas

### 1. Web Geral / Google
- Buscas: "OpenClaw dashboard", "clawd dashboard", "openclaw.ai interface", "openclaw control UI features"
- **Resultado:** Nenhuma cobertura de mídia, review, tutorial ou screenshot público encontrado via busca web. A ferramenta é relativamente nova/nicho.

### 2. Reddit
- Buscas em r/selfhosted, r/homelab, r/AIAssistants, r/ChatGPT
- **Resultado:** Sem resultados relevantes nas buscas. Sem threads públicos sobre o dashboard.

### 3. YouTube
- Busca: "openclaw dashboard screenshot youtube tutorial setup 2026"
- **Resultado:** Nenhum vídeo tutorial encontrado.

### 4. GitHub (openclaw/steipete)
- Tentativa de acesso: https://github.com/steipete/openclaw → 404 (repositório privado ou inexistente com esse path)
- Não foi possível acessar issues/discussions públicas

### 5. Documentação Oficial (docs.openclaw.ai)
- **✅ FONTE PRINCIPAL — Alta relevância (5/5)**
- URL: https://docs.openclaw.ai/web/control-ui
- Data: acessado 2026-03-13
- Conteúdo completo recuperado

### 6. Documentação Local (instalada)
- **✅ FONTE PRINCIPAL — Alta relevância (5/5)**
- Path: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/lib/node_modules/openclaw/docs/`
- Versão: 2026.2.26 (mais recente)
- Arquivos-chave analisados:
  - `docs/web/dashboard.md`
  - `docs/web/control-ui.md`
  - `docs/web/index.md`
  - `docs/web/tui.md`
  - `docs/web/webchat.md`
  - `docs/cli/dashboard.md`
  - `docs/platforms/mac/canvas.md`
  - `CHANGELOG.md` (últimas 3 versões)
  - `docs/index.md`

---

## 🖥️ O OpenClaw Dashboard — Documentação Completa

### Identidade e Tecnologia
- **Nome oficial:** Control UI (também chamado de "dashboard")
- **URL padrão:** `http://127.0.0.1:18789/` (ou `http://localhost:18789/`)
- **Tecnologia:** Vite + Lit (SPA leve, web components)
- **Serves:** arquivos estáticos de `dist/control-ui`
- **Protocolo:** WebSocket direto ao Gateway (mesmo port HTTP)
- **Autenticação:** token (localStorage) ou password (memória)
- **Multi-idioma:** en, zh-CN, zh-TW, pt-BR, de, es

### Como Abrir
```bash
openclaw dashboard          # copia link, abre browser se possível
openclaw dashboard --no-open  # só imprime URL
```

### Autenticação e Segurança
- Auth via WebSocket handshake: `connect.params.auth.token` ou `.password`
- Token gerado automaticamente no onboarding → salvo em localStorage após conexão
- **Device pairing:** primeira conexão de novo browser/device requer aprovação manual
  - Local (127.0.0.1): auto-aprovado
  - Remoto (LAN/Tailnet): requer `openclaw devices approve <requestId>`
- HTTPS recomendado via Tailscale Serve

---

## 🧩 Features Atuais do Control UI (v2026.2.26)

### Chat
- Chat direto com o modelo via Gateway WS
- Streaming de tool calls com cards de output ao vivo
- Stop com botão, `/stop`, ou frases naturais
- Histórico com size bounds para estabilidade
- `chat.inject` para notas internas sem rodar agente

### Channels (Canais)
- Status de WhatsApp, Telegram, Discord, Slack + plugins (Mattermost, etc.)
- QR login inline para canais que suportam
- Config por canal editável na UI

### Sessions
- Lista de sessões ativas
- Overrides por sessão: thinking level, verbose mode

### Cron Jobs
- Listar, adicionar, editar, rodar, ativar/desativar
- Histórico de runs por job
- Config avançada: delete-after-run, model override, thinking override, best-effort delivery
- Modos de delivery: announce, none, webhook
- Form validation inline com erros por campo

### Skills
- Status de skills instaladas
- Enable/disable por skill
- Instalar novas skills
- Atualizar API keys de skills

### Nodes
- Lista de nodes conectados
- Capabilities por node (canvas, camera, screen, etc.)

### Exec Approvals
- Editar allowlists do gateway e dos nodes
- Configurar ask policy para `exec host=gateway/node`

### Config Editor
- View/edit de `~/.openclaw/openclaw.json`
- Schema + form rendering (incluindo plugins e channels)
- Raw JSON editor disponível
- Apply + restart com validação
- Base-hash guard contra edições concorrentes

### Debug
- Status/health/models snapshots
- Event log
- RPC calls manuais
- Live log tail com filter/export

### Update
- `update.run` com relatório de restart

---

## 🖥️ Canvas (macOS)

- **Relevância: 5/5** — Feature diferenciada e poderosa
- Painel visual controlado pelo agente via WKWebView
- Serve arquivos locais via custom URL scheme: `openclaw-canvas://<session>/<path>`
- Files em: `~/Library/Application Support/OpenClaw/canvas/<session>/`
- Borderless, redimensionável, ancora perto do menu bar
- Auto-reload quando arquivos locais mudam
- Só um painel visível por vez

### O que o agente pode fazer no Canvas
```bash
openclaw nodes canvas present --node <id>
openclaw nodes canvas navigate --node <id> --url "/"
openclaw nodes canvas eval --node <id> --js "document.title"
openclaw nodes canvas snapshot --node <id>
```

### A2UI no Canvas
- Renderiza interfaces declarativas via mensagens JSONL servidor→cliente
- Suporta A2UI v0.8: `beginRendering`, `surfaceUpdate`, `dataModelUpdate`, `deleteSurface`
- v0.9 (`createSurface`) não suportado ainda

### Deep Links do Canvas
```js
window.location.href = "openclaw://agent?message=Review%20this%20design";
```

---

## 🖥️ TUI (Terminal UI)

- Interface alternativa ao dashboard web
- `openclaw tui` — conecta ao Gateway
- Shortcuts: Ctrl+L (model picker), Ctrl+G (agent picker), Ctrl+P (session picker)
- Slash commands: `/model`, `/think`, `/verbose`, `/reasoning`, `/session`, `/new`, etc.
- Comandos locais com `!` prefix

---

## 📱 WebChat

- Chat nativo no macOS/iOS app
- Conecta ao Gateway WS diretamente
- Mesmas sessions e routing das outras channels
- Control UI tem aba de chat também

---

## 🏗️ Arquitetura do Sistema

```
Chat apps + plugins → Gateway (port 18789) → Agente IA
                              ↓
                        Control UI (browser)
                        TUI (terminal)
                        macOS/iOS app
                        Android nodes
```

---

## 📈 Evolução Recente do Dashboard (CHANGELOG)

### v2026.2.26
- Control UI: fix image opens com safe-open helper + tabnabbing protection
- Onboarding: seed default allowed origins para non-loopback binds
- Docker/GCP: auto-bootstrap allowed origins + tokenized dashboard links

### v2026.2.25
- UI/Chat compose: mobile stacked layout para compose action buttons em telas pequenas
- Control UI/Agents: herda `agents.defaults.model.fallbacks` no Overview

### v2026.2.24
- Android: native four-step onboarding + five-tab shell (Connect, Chat, Voice, Screen, Settings)
- Talk/Gateway config: provider-agnostic Talk config
- Security audit: heurística multi-user + hardening guidance

---

## 🔗 URLs Relevantes Encontradas

| URL | Tipo | Relevância | Acessível |
|-----|------|-----------|-----------|
| https://openclaw.ai | Site oficial | 5/5 | ✅ |
| https://docs.openclaw.ai | Docs oficiais | 5/5 | ✅ |
| https://docs.openclaw.ai/web/control-ui | Docs Control UI | 5/5 | ✅ |
| https://docs.openclaw.ai/web/dashboard | Docs Dashboard | 5/5 | ✅ |
| https://docs.openclaw.ai/platforms/mac/canvas | Docs Canvas | 5/5 | ✅ |
| https://github.com/steipete/openclaw | GitHub (tentado) | - | ❌ 404 |
| http://127.0.0.1:18789/ | Dashboard local | 5/5 | Local only |

---

## 🎨 Referências de Design — Dashboards de Agentes IA

Não foram encontrados reviews ou screenshots públicos do OpenClaw dashboard. Para fins de referência de design/inspiração de dashboards modernos para gerenciamento de bots/agentes:

### Características desejáveis identificadas na documentação:
- Dark/light theme switching (OpenClaw suporta)
- Multi-idioma (pt-BR já suportado: 🎉)
- Cards de tool output ao vivo durante streaming
- Form validation inline
- Log tail com filtros
- Session management visual
- Cron job management com histórico

### Funcionalidades que o dashboard tem mas que poderiam ser melhoradas (gaps identificados):
1. Sem screenshots/preview público — difícil onboarding visual
2. Canvas ainda em v0.8 (v0.9 pendente)
3. Mobile layout ainda emergente (melhorias em 2026.2.25)
4. Sem gráficos/métricas de uso visíveis na documentação
5. Nenhum modo multi-usuário explícito no UI (ferramenta pessoal por design)

---

## 💡 Conclusões e Insights

1. **O OpenClaw dashboard existe e é funcional** — é uma SPA Vite+Lit servida pelo Gateway, com features robustas de chat, config, cron, skills, nodes e debug.

2. **Não há conteúdo público** (YouTube, Reddit, Instagram, screenshots) sobre o dashboard. O produto tem pouquíssima presença de mídia indexada — é uma ferramenta de nicho para power users/devs.

3. **Canvas é a feature mais diferenciada** — painel visual controlado pelo agente, único no ecossistema de ferramentas IA self-hosted.

4. **pt-BR já é suportado** no Control UI — ótimo para Eduardo.

5. **A documentação é a melhor fonte** — a documentação local instalada em `/Volumes/TITA_039/MAC_MINI_03/.openclaw/lib/node_modules/openclaw/docs/` é completa e atualizada.

6. **Possibilidade de contribuição**: o UI é open source (Vite+Lit), builds com `pnpm ui:build`, dev server com `pnpm ui:dev`. Há espaço para contribuir com melhorias visuais.

---

## 📁 Arquivos Locais Para Explorar

```
/Volumes/TITA_039/MAC_MINI_03/.openclaw/lib/node_modules/openclaw/
├── docs/
│   ├── web/
│   │   ├── control-ui.md    ← PRINCIPAL
│   │   ├── dashboard.md
│   │   ├── tui.md
│   │   └── webchat.md
│   ├── platforms/mac/
│   │   ├── canvas.md        ← CANVAS
│   │   └── webchat.md
│   ├── cli/dashboard.md
│   └── index.md
├── dist/control-ui/         ← Assets do dashboard compilado
└── CHANGELOG.md             ← Histórico de mudanças
```

Para ver o dashboard ao vivo:
```bash
openclaw gateway  # inicia o gateway
openclaw dashboard  # abre no browser
```

---

*Pesquisa realizada em 2026-03-13 por subagent Tita. Fontes: docs.openclaw.ai, documentação local instalada, múltiplas buscas web, reddit, youtube, github.*
