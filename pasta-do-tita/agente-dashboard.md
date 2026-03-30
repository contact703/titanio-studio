# Guia Prático: Dashboards no OpenClaw

**Data:** 2026-03-13  
**Autor:** Agente de pesquisa (subagente Tita)

---

## 1. Como o OpenClaw Suporta Dashboards

### Canvas Tool — O Mecanismo Principal

O OpenClaw tem suporte nativo a dashboards via **Canvas**, que renderiza HTML/CSS/JS em um painel WebView embutido. É o caminho principal para criar UIs visuais controladas pelo agente.

#### Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Canvas Host    │────▶│   Node Bridge    │────▶│  Node App       │
│  HTTP :18793    │     │  TCP :18790      │     │ (Mac/iOS/Android│
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

- **Canvas Host**: servidor HTTP que serve arquivos HTML/CSS/JS do diretório `canvasHost.root`
- **Node Bridge**: comunica a URL ao dispositivo conectado
- **Node App**: exibe o conteúdo em WebView (WKWebView no Mac)

#### Configuração (`~/.openclaw/openclaw.json`)

```json
{
  "canvasHost": {
    "enabled": true,
    "port": 18793,
    "root": "/Users/you/clawd/canvas",
    "liveReload": true
  },
  "gateway": {
    "bind": "auto"
  }
}
```

#### Ações disponíveis via Canvas Tool

| Ação       | O que faz                              |
|------------|----------------------------------------|
| `present`  | Exibe o canvas (com URL opcional)      |
| `hide`     | Esconde o canvas                       |
| `navigate` | Navega para nova URL/path              |
| `eval`     | Executa JavaScript no canvas           |
| `snapshot` | Captura screenshot do canvas           |
| `a2ui_push`| Envia componentes via A2UI v0.8        |

#### URL do Canvas

```
http://<hostname>:18793/__openclaw__/canvas/<arquivo>.html
```

Para nó local: `http://127.0.0.1:18793/__openclaw__/canvas/dashboard.html`

#### Live Reload

Com `liveReload: true`, o Canvas recarrega automaticamente quando os arquivos mudam. **Ótimo para desenvolvimento iterativo.**

---

### A2UI — Interface Declarativa (experimental)

O OpenClaw tem um sistema A2UI (v0.8) que permite enviar componentes de forma declarativa via JSON Lines:

```bash
cat > /tmp/dashboard.jsonl << 'EOF'
{"surfaceUpdate":{"surfaceId":"main","components":[
  {"id":"root","component":{"Column":{"children":{"explicitList":["title","status"]}}}},
  {"id":"title","component":{"Text":{"text":{"literalString":"🤖 Dashboard Tita"},"usageHint":"h1"}}},
  {"id":"status","component":{"Text":{"text":{"literalString":"Online ✅"},"usageHint":"body"}}}
]}}
{"beginRendering":{"surfaceId":"main","root":"root"}}
EOF

openclaw nodes canvas a2ui push --jsonl /tmp/dashboard.jsonl --node <id>
```

> ⚠️ A2UI ainda é limitado (v0.8). Para dashboards ricos, prefira HTML/JS direto.

---

### Deep Links — Disparar Ações do Canvas

O Canvas pode disparar runs do agente via deep link JS:

```js
window.location.href = "openclaw://agent?message=Mostrar%20status%20dos%20projetos";
```

Isso cria um loop de feedback: o dashboard pode acionar o agente para atualizar dados.

---

## 2. Melhores Práticas de Design

### Princípios Gerais

1. **Uma tela, uma função** — não sobrecarregue o dashboard. Separe por contexto (ex: "Projetos", "Métricas", "Logs").
2. **Dados em tempo real primeiro** — use WebSockets ou polling curto para status de bots/agentes.
3. **Mobile-first** — o Canvas pode ser exibido em iOS/Android também.
4. **Dark mode por padrão** — bots geralmente ficam ativos 24/7; dark mode é menos cansativo.
5. **Estado visível** — sempre mostre: online/offline, última atividade, erros recentes.

### Layout Recomendado para Dashboard de Bot/Agente

```
┌──────────────────────────────────────────────┐
│  🐾 Tita Dashboard        [status: ● Online] │
├────────────────┬─────────────────────────────┤
│ MÉTRICAS       │  ATIVIDADE RECENTE           │
│ ┌──┐ ┌──┐ ┌──┐│  • [11:03] Pesquisa web      │
│ │42│ │7 │ │✓ ││  • [10:58] Arquivo salvo     │
│ └──┘ └──┘ └──┘│  • [10:45] Subagente criado  │
│ Msgs Tarefas OK│                              │
├────────────────┴─────────────────────────────┤
│  PROJETOS ATIVOS                              │
│  [Maricá FC] [Titanio 47] [Tita Campaign]    │
└──────────────────────────────────────────────┘
```

### UX Essencial

- **Cards com status colored**: verde (ok), amarelo (atenção), vermelho (erro)
- **Timestamp relativo**: "2 min atrás" > "2026-03-13T10:58:00"
- **Ação rápida**: botão "Perguntar ao agente" → deep link `openclaw://agent?message=...`
- **Gráficos simples**: não use D3 pesado; Chart.js ou SVG puro são suficientes

---

## 3. Tech Stack Recomendada

### Stack Minimalista (Recomendado para Canvas)

```
HTML + Tailwind CSS (CDN) + Alpine.js (CDN) + Chart.js (CDN)
```

**Por quê?**
- Zero build step — salva direto em `~/clawd/canvas/`
- Live reload imediato
- Leve o suficiente para WebView móvel
- Alpine.js é reativo sem precisar de React/build system

### Exemplo de Base HTML

```html
<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tita Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-900 text-white p-4" x-data="dashboard()" x-init="init()">
  
  <h1 class="text-2xl font-bold mb-4">🐾 Tita Dashboard</h1>
  
  <!-- Status Card -->
  <div class="bg-gray-800 rounded-lg p-4 mb-4">
    <div class="flex items-center gap-2">
      <span class="w-3 h-3 rounded-full bg-green-400"></span>
      <span x-text="status">Carregando...</span>
    </div>
  </div>

  <!-- Atividade -->
  <div class="bg-gray-800 rounded-lg p-4">
    <h2 class="font-semibold mb-2">Atividade Recente</h2>
    <template x-for="item in atividade" :key="item.id">
      <div class="text-sm text-gray-300 py-1 border-b border-gray-700">
        <span class="text-gray-500" x-text="item.time"></span>
        <span x-text="item.desc"></span>
      </div>
    </template>
  </div>

  <!-- Botão de ação -->
  <button onclick="window.location.href='openclaw://agent?message=Status+dos+projetos'"
    class="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full">
    💬 Perguntar ao Agente
  </button>

  <script>
    function dashboard() {
      return {
        status: 'Online ✅',
        atividade: [
          { id: 1, time: 'agora', desc: 'Dashboard inicializado' },
          { id: 2, time: '5 min', desc: 'Última tarefa concluída' },
        ],
        init() {
          // Polling a cada 30s para atualizar dados
          setInterval(() => this.refresh(), 30000);
        },
        refresh() {
          // Aqui você pode fazer fetch() para uma API local
          console.log('Refreshing...');
        }
      }
    }
  </script>
</body>
</html>
```

### Stack Alternativa (Mais Robusta)

Se precisar de dashboard mais complexo com build system:

| Camada       | Opção                    |
|--------------|--------------------------|
| Framework    | React + Vite             |
| UI Kit       | shadcn/ui ou Radix UI    |
| Charts       | Recharts ou Tremor       |
| Dados        | React Query + REST API   |
| Estilo       | Tailwind CSS             |
| Deploy local | `npx serve dist/`        |

> Para este caso, o agente aponta o Canvas para `http://localhost:3000` após `npm run build && npx serve dist/`.

---

## 4. Workflow Completo para Criar um Dashboard

### Passo a Passo

```bash
# 1. Verificar configuração do Canvas
cat ~/.openclaw/openclaw.json | jq '.canvasHost'

# 2. Criar pasta canvas (se não existir)
mkdir -p ~/clawd/canvas

# 3. Criar arquivo HTML
nano ~/clawd/canvas/dashboard.html
# (cole o HTML de exemplo acima)

# 4. Listar nós conectados
openclaw nodes list

# 5. Exibir canvas no Mac
openclaw nodes canvas present --node <node-id> --url "http://127.0.0.1:18793/__openclaw__/canvas/dashboard.html"
```

### Via Canvas Tool (do agente)

```
canvas action:present node:<id> url:http://127.0.0.1:18793/__openclaw__/canvas/dashboard.html
```

### Atualizar conteúdo via JS (sem recarregar)

```
canvas action:eval node:<id> javaScript:"document.getElementById('status').innerText = 'Processando...'"
```

---

## 5. Exemplos de Dashboards para Inspiração

### Casos de uso práticos para a Tita

| Dashboard         | Conteúdo                                                |
|-------------------|---------------------------------------------------------|
| **Status Geral**  | Bot online/offline, última atividade, uptime            |
| **Projetos**      | Maricá FC, Titanio 47, Tita Campaign — status de cada  |
| **Memória**       | Arquivos de memória recentes, tarefas pendentes         |
| **Subagentes**    | Lista de agentes ativos, resultados, erros              |
| **WhatsApp**      | Últimas mensagens recebidas, conversas em andamento     |

### Referências Externas

- **Tremor** (tremor.so) — componentes React prontos para dashboards analytics
- **Shadcn/ui** (ui.shadcn.com) — UI kit com dark mode elegante
- **Grafana** — se precisar de dashboards de métricas com backends
- **Daisyui** (daisyui.com) — componentes Tailwind CSS prontos
- **Alpine.js** (alpinejs.dev) — reatividade sem build, perfeito para Canvas

---

## 6. Limitações Conhecidas

- **A2UI v0.8** é limitado — sem suporte a `createSurface` (v0.9). Para dashboards ricos, use HTML.
- **Canvas serve arquivos locais** — sem autenticação embutida. Não expor na internet.
- **Um canvas por vez** — só um painel visível por sessão.
- **WebView restrictions** — alguns recursos web avançados podem não funcionar (ex: WebRTC, câmera).
- **Tailscale necessário** para exibir canvas em dispositivos remotos (iOS/Android fora da LAN).

---

## Conclusão

Para criar um dashboard integrado ao OpenClaw:

1. **Use Canvas Tool** com HTML/Tailwind/Alpine.js — é o caminho mais simples e direto
2. **Live reload** torna o desenvolvimento rápido: só salva o arquivo e já atualiza
3. **Deep links** permitem que o dashboard dispare ações no agente (`openclaw://agent?message=...`)
4. **Alpine.js** é a escolha certa para reatividade sem complexidade de build

O fluxo ideal: agente escreve/atualiza HTML → Canvas exibe → usuário interage → deep link dispara novo run do agente → loop.

---

*Pesquisa realizada por subagente em 2026-03-13. Documentação base: `/openclaw/lib/node_modules/openclaw/skills/canvas/SKILL.md` e `/openclaw/docs/platforms/mac/canvas.md`*
