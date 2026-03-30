# ⚡ Tandem — Titanio AI Browser

Extensão Chrome que integra a **Tita (OpenClaw)** diretamente no seu browser.  
Chat com IA, captura de contexto de páginas, e execução de tarefas — tudo sem sair do browser.

---

## 🚀 Como instalar

1. Abra o Chrome e acesse: `chrome://extensions`
2. Ative o **Developer mode** (canto superior direito)
3. Clique em **"Load unpacked"**
4. Selecione a pasta: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/tandem-titanio/`
5. A extensão aparecerá na barra do Chrome com o ícone ⚡

> **Importante:** O OpenClaw deve estar rodando em `http://localhost:18789`

---

## 💬 Como usar

### Popup (clique no ícone ⚡)
- Mostra status da Tita (Online/Offline)
- Última ação realizada
- Atalho para abrir o side panel
- Captura rápida da página atual

### Side Panel (painel lateral)
Clique no ícone ⚡ → "Abrir Painel da Tita" — ou use `Ctrl+Shift+E`

**Chat:** Converse diretamente com a Tita. Suporta Enter para enviar, Shift+Enter para nova linha.

**📸 Capturar contexto** — Envia para a Tita:
- URL da página atual
- Título da página  
- Texto selecionado pelo usuário
- Meta description e H1

**🤖 Deixa a Tita fazer** — Descreva uma tarefa. A Tita recebe a tarefa + contexto da página atual e executa via OpenClaw.

**⏱ Últimas ações** — Histórico das 5 últimas interações (persistido entre sessões).

**🔌 Integrações ativas** — Mostra status em tempo real:
- OpenClaw (gateway local)
- Google (Dashboard Titanio)
- Instagram (Dashboard Titanio)
- n8n (automações)

---

## 🔌 Como a extensão se comunica com o OpenClaw

```
┌─────────────────┐     mensagem      ┌─────────────────────┐
│  Side Panel /   │ ──────────────►  │   background.js     │
│  Popup          │                   │  (Service Worker)   │
└─────────────────┘                   └──────────┬──────────┘
                                                  │ HTTP POST
                                                  ▼
                                      ┌─────────────────────┐
                                      │  OpenClaw Gateway   │
                                      │  localhost:18789     │
                                      └──────────┬──────────┘
                                                  │
                                                  ▼
                                      ┌─────────────────────┐
                                      │   Tita (Claude)     │
                                      │   Sessão Principal  │
                                      └─────────────────────┘
```

### Endpoints utilizados

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `http://localhost:18789/api/health` | GET | Verifica se o gateway está online |
| `http://localhost:18789/api/sessions/send` | POST | Envia mensagem para a Tita |
| `http://localhost:18789/api/message` | POST | Fallback de envio |

### Headers de autenticação
```
Authorization: Bearer e60ccf70d272c2dc7203130b129a47ae97fa57df656f64e8
Content-Type: application/json
```

### Permissões da extensão
- `activeTab` — Acessa URL e título da aba atual
- `storage` — Salva histórico e estado localmente
- `scripting` — Injeta content script para captura de texto selecionado
- `sidePanel` — Habilita o painel lateral
- `host_permissions: localhost:18789` — Comunica com o OpenClaw

---

## 🎨 Design

Dark cyberpunk com as cores Titanio:
- **Background:** `#1a1a2e`
- **Accent Cyan:** `#00f0ff`
- **Accent Purple:** `#7c3aed`

---

## 📁 Estrutura de arquivos

```
tandem-titanio/
├── manifest.json      # Configuração da extensão (Manifest V3)
├── background.js      # Service worker — conecta ao OpenClaw
├── content.js         # Injeta contexto nas páginas
├── popup.html/js      # Mini popup de status
├── sidepanel.html/js  # Painel lateral principal
├── styles.css         # Dark cyberpunk theme
├── icons/             # Ícones 16, 32, 48, 128px
└── README.md          # Este arquivo
```

---

## 🐞 Troubleshooting

**"Tita Offline"** — Verifique se o OpenClaw está rodando:
```bash
openclaw gateway status
# Se não estiver:
openclaw gateway start
```

**Extensão não aparece** — Verifique se o Developer mode está ativo em `chrome://extensions`

**Side panel não abre** — Chrome 114+ necessário para suporte a Side Panel API

---

*Feito com 🖤 pela equipe Titanio*
