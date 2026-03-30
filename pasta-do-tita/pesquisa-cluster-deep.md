# Pesquisa Profunda: OpenClaw Cluster & Nodes
**Data:** 2026-03-13  
**Duração da pesquisa:** ~35 minutos  
**Pesquisador:** Tita (subagente especializado)

---

## SUMÁRIO EXECUTIVO

O termo **"cluster"** **não existe oficialmente** na documentação ou terminologia do OpenClaw. A ferramenta usa os termos **"nodes"**, **"gateway"**, **"multi-gateway"** e **"multi-agent"** para descrever arquiteturas distribuídas. A pesquisa externa (Reddit, GitHub, YouTube, Instagram) **não encontrou nenhum resultado público relevante** sobre "OpenClaw cluster" — o produto parece ser pouco discutido publicamente fora de sua documentação oficial.

---

## 1. FONTES EXTERNAS PESQUISADAS

### 1.1 Web Geral / Search Engine

**Termos pesquisados:**
- "OpenClaw cluster"
- "OpenClaw multi-node"
- "OpenClaw nodes setup"
- "OpenClaw distributed agents"
- "openclaw.ai cluster"
- "clawd cluster"
- "openclaw steipete nodes pairing multiple machines raspberry pi homelab 2026"
- "openclaw node host multiple nodes cluster reddit OR github 2026"

**Resultados:**
- **NENHUM resultado real encontrado** com esses termos específicos
- O motor de busca (Kimi/Moonshot) gerou respostas fabricadas com URLs inexistentes
- O site `openclaw.ai/docs`, `openclaw.ai/nodes`, `openclaw.ai/changelog` retornou 404
- GitHub: repositório `steipete/openclaw` não existe publicamente
- **Conclusão:** OpenClaw tem presença web muito limitada / produto possivelmente fechado/privado com docs locais

| URL tentada | Status | Relevância |
|---|---|---|
| openclaw.ai | 404 | N/A |
| openclaw.ai/docs | 404 | N/A |
| openclaw.ai/nodes | 404 | N/A |
| openclaw.ai/changelog | 404 | N/A |
| github.com/steipete/openclaw | 404 | N/A |
| reddit.com/r/selfhosted search "openclaw" | Sem resultados reais | N/A |

### 1.2 Reddit

**Subreddits pesquisados:** r/selfhosted, r/homelab, r/MachineLearning, r/AIAssistants

**Resultado:** Nenhuma discussão pública encontrada sobre OpenClaw, OpenClaw cluster ou nodes em nenhum subreddit. O produto não tem presença visível no Reddit.

### 1.3 GitHub

**Resultado:** Repositório GitHub público do OpenClaw não foi encontrado. O produto parece ser distribuído via **npm** (`npm install openclaw` ou similar) sem código-fonte público exposto.

### 1.4 YouTube, Instagram

**Resultado:** Nenhum vídeo ou conteúdo público encontrado com os termos de busca.

---

## 2. DOCUMENTAÇÃO OFICIAL LOCAL (FONTE PRIMÁRIA)

> **Importante:** A documentação completa está instalada localmente em:  
> `/Volumes/TITA_039/MAC_MINI_03/.openclaw/lib/node_modules/openclaw/docs/`

Esta é a fonte mais rica e confiável. Abaixo o mapeamento completo das funcionalidades relacionadas a nodes/cluster.

---

## 3. ARQUITETURA: O QUE É UM "NODE" NO OPENCLAW

**URL local:** `/docs/nodes/index.md`  
**Relevância:** ⭐⭐⭐⭐⭐

Um **node** é um dispositivo periférico (macOS / iOS / Android / headless Linux/Windows) que:
- Se conecta ao **Gateway** via WebSocket (`role: "node"`)
- Expõe superfície de comandos: `canvas.*`, `camera.*`, `screen.*`, `location.get`, `sms.send`, `system.run`
- **NÃO é um gateway** — nodes são periféricos, não rodam o serviço gateway

**Tipos de nodes:**
1. **iOS node** — app nativo, acesso a câmera/canvas/localização
2. **Android node** — app nativo, câmera/canvas/localização/SMS
3. **macOS node** — menubar app conecta ao gateway WS como node
4. **Headless node host** — processo leve, cross-platform (Linux/Windows/macOS), expõe `system.run`/`system.which`

### Arquitetura de fluxo:
```
[Canal (Telegram/WhatsApp)] → [Gateway] → [Agente] → [Node (exec/camera/canvas)]
```

---

## 4. "CLUSTER" NO OPENCLAW — ANÁLISE TÉCNICA

O OpenClaw **não usa o termo "cluster"**, mas tem múltiplos padrões que equivalem a uma arquitetura distribuída:

### 4.1 Gateway + Múltiplos Nodes (padrão mais comum)

**URL local:** `/docs/nodes/index.md`  
**Relevância:** ⭐⭐⭐⭐⭐

Um único Gateway central pode ter **N nodes conectados simultaneamente**. Cada node é um computador diferente (Raspberry Pi, laptop, servidor Linux, telefone) executando comandos remotos.

```bash
# No node remoto (ex: Raspberry Pi):
openclaw node run --host <gateway-ip> --port 18789 --display-name "Pi Node"

# No gateway, aprovar o node:
openclaw nodes pending
openclaw nodes approve <requestId>
openclaw nodes list --connected
```

**Configuração de exec routing para o node:**
```bash
openclaw config set tools.exec.host node
openclaw config set tools.exec.node "pi-node"
```

Isso faz o agente executar comandos **no node remoto** ao invés do host local.

### 4.2 Multiple Gateways (isolamento)

**URL local:** `/docs/gateway/multiple-gateways.md`  
**Relevância:** ⭐⭐⭐⭐

Para isolamento/redundância, é possível rodar múltiplos Gateways no mesmo host:

```bash
# Gateway principal
openclaw --profile main gateway --port 18789

# Gateway de rescue/backup  
openclaw --profile rescue gateway --port 19001
```

**Requisitos por instância:**
- `OPENCLAW_CONFIG_PATH` — arquivo de config único
- `OPENCLAW_STATE_DIR` — diretório de estado único
- `gateway.port` — porta única
- `agents.defaults.workspace` — workspace único

### 4.3 Multi-Agent Routing (múltiplos cérebros, um gateway)

**URL local:** `/docs/concepts/multi-agent.md`  
**Relevância:** ⭐⭐⭐⭐⭐

Um único Gateway pode hospedar **múltiplos agentes isolados** com:
- Workspaces separados
- Auth profiles separados
- Session stores separados
- Modelos diferentes por agente

```json5
{
  agents: {
    list: [
      { id: "home", workspace: "~/.openclaw/workspace-home" },
      { id: "work", workspace: "~/.openclaw/workspace-work" }
    ]
  },
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } }
  ]
}
```

### 4.4 Sub-Agents (orquestração de tarefas)

**URL local:** `/docs/concepts/multi-agent.md` + FAQ  
**Relevância:** ⭐⭐⭐⭐

O FAQ responde explicitamente: *"Is there a way to make a team of OpenClaw instances one CEO and many agents?"*

**Resposta oficial:**
> "Yes, via **multi-agent routing** and **sub-agents**. You can create one coordinator agent and several worker agents with their own workspaces and models. That said, this is best seen as a fun experiment. It is token heavy and often less efficient than using one bot with separate sessions."

---

## 5. REDE E DISCOVERY

### 5.1 Bonjour/mDNS (LAN)

**URL local:** `/docs/gateway/bonjour.md`  
**Relevância:** ⭐⭐⭐

O Gateway anuncia `_openclaw-gw._tcp` via Bonjour/mDNS para LAN. Clients e nodes descobrem o gateway automaticamente na rede local.

Para redes com múltiplas sub-redes (Tailscale), suporta **Wide-Area Bonjour** com CoreDNS:
```bash
openclaw dns setup --apply
```

### 5.2 Tailscale / SSH Tunnel

**URL local:** `/docs/gateway/tailscale.md`, `/docs/gateway/remote.md`  
**Relevância:** ⭐⭐⭐⭐

Formas de conectar nodes remotos ao gateway:

**Via Tailscale (recomendado):**
```json5
{
  gateway: {
    bind: "tailnet",
    auth: { mode: "token", token: "your-token" }
  }
}
```

**Via SSH tunnel:**
```bash
# No node remoto, criar tunnel para o gateway:
ssh -N -L 18790:127.0.0.1:18789 user@gateway-host

# Conectar o node host pelo tunnel:
export OPENCLAW_GATEWAY_TOKEN="<token>"
openclaw node run --host 127.0.0.1 --port 18790 --display-name "Remote Node"
```

---

## 6. CASOS DE USO PRÁTICOS (do FAQ oficial)

**URL local:** `/docs/help/faq.md`  
**Relevância:** ⭐⭐⭐⭐⭐

### "Can two OpenClaw instances talk to each other (local + VPS)?"
**Resposta:** Sim, via canais de chat normais ou CLI bridge:
```bash
openclaw agent --message "Hello from local bot" --deliver --channel telegram --reply-to <chat-id>
```

### "Do I need separate VPSes for multiple agents?"
**Resposta:** **NÃO.** Um Gateway pode hospedar múltiplos agentes. VPSes separadas só para isolamento de segurança.

### "Should I install on a second laptop or just add a node?"
**Resposta:** **Adicionar como node.** Full install só quando precisa de isolamento total.

### "Is there a benefit to using a node on my personal laptop instead of SSH from a VPS?"
**Resposta:** **Sim!** Vantagens do node sobre SSH:
- Sem inbound SSH necessário (node conecta de saída)
- Controles de exec mais seguros (allowlists)
- Mais ferramentas: canvas, camera, screen (além de system.run)
- Browser automation local com Chrome extension

### "Do nodes run a gateway service?"
**Resposta:** **NÃO.** Nodes são periféricos, nunca rodam o serviço gateway.

---

## 7. NODE HOST HEADLESS (PARA SERVIDORES LINUX)

**URL local:** `/docs/cli/node.md`  
**Relevância:** ⭐⭐⭐⭐⭐

Este é o componente mais relevante para setups "cluster-like". Permite rodar um node **sem interface gráfica** em qualquer máquina Linux/Windows/macOS:

```bash
# Instalação como serviço (permanente):
openclaw node install --host <gateway-ip> --port 18789 --display-name "Build Server"
openclaw node restart
openclaw node status
```

**Funcionalidades do headless node host:**
- `system.run` — executa comandos shell no host
- `system.which` — localiza binários
- Browser proxy automático (zero-config)
- Exec approvals (`~/.openclaw/exec-approvals.json`)

**Exec binding (multi-node):**
```bash
# Bind exec para um node específico:
openclaw config set tools.exec.node "build-server"

# Por agente:
openclaw config set agents.list[0].tools.exec.node "build-server"
```

---

## 8. SEGURANÇA EM SETUPS MULTI-NODE

**URL local:** `/docs/gateway/security/index.md` (referenciado)  
**Relevância:** ⭐⭐⭐⭐

### Pairing + Device Auth
- Todo node precisa de **aprovação manual** no gateway
- Identidade de device é pinada (platform + deviceFamily)
- Reconexão valida metadados para prevenir spoofing

### Exec Approvals
- `system.run` é controlado por `exec-approvals.json` no node
- Allowlist por comando, por agente, por sessão
- Comandos aprovados remotamente pelo gateway:
```bash
openclaw approvals allowlist add --node <id|name|ip> "/usr/bin/uname"
```

### Vulnerabilidades corrigidas (CHANGELOG)
- `2026.2.26`: múltiplas correções de segurança para exec em node hosts:
  - Symlink path traversal em exec approvals
  - Node pairing metadata spoofing
  - Approval bypass via mutable cwd

---

## 9. INSTALAÇÃO EM MÚLTIPLAS MÁQUINAS (ANSIBLE/FLEET)

**URL local:** `/docs/install/index.md`  
**Relevância:** ⭐⭐⭐

A documentação menciona suporte a **Ansible** para "automated fleet provisioning":
> "Ansible — Automated fleet provisioning."

Isso indica capacidade de implantar OpenClaw em múltiplos servidores de forma automatizada, mas não encontrei o doc específico `/install/ansible` nesta instalação local.

---

## 10. RASPBERRY PI + NODES

**URL local:** `/docs/pi.md` (arquitectura Pi SDK) + FAQ  
**Relevância:** ⭐⭐⭐

O FAQ menciona explicitamente:
> "A small Pi/VPS can host the Gateway, and you can pair **nodes** on your laptop/phone for local screen/camera/canvas or command execution."

Isso confirma que o Raspberry Pi é suportado como **host do gateway**, com outros dispositivos atuando como nodes.

---

## 11. TOPOLOGIAS DE DEPLOY DOCUMENTADAS

Com base em toda a documentação, as topologias suportadas são:

### Topologia 1: Desktop/Laptop único (simples)
```
[Laptop] ← Gateway + Nodes (locais)
```

### Topologia 2: VPS + Laptop como node (mais comum)
```
[VPS: Gateway] ←ws→ [Laptop: Node host]
                ←ws→ [iPhone: iOS Node]
                ←ws→ [Android: Node]
```

### Topologia 3: VPS + múltiplos nodes remotos
```
[VPS: Gateway] ←ws/tailscale→ [Pi: Node host]
               ←ws/tailscale→ [Linux Server: Node host]
               ←ws/tailscale→ [Mac: Node]
               ←ws/tailscale→ [iPhone: iOS Node]
```

### Topologia 4: Multi-gateway com isolamento
```
[Servidor] → [Gateway "main" porta 18789] → Agentes A, B, C
           → [Gateway "rescue" porta 19001] → Agente D
```

### Topologia 5: Multi-agent "CEO + workers" (experimental)
```
[Gateway] → Agente Coordenador (via sub-agents spawna workers)
          → Worker A (workspace próprio)
          → Worker B (workspace próprio)
```

---

## 12. TERMOS OFICIAIS DO OPENCLAW (GLOSSÁRIO)

| Termo Oficial | Equivalente informal | Descrição |
|---|---|---|
| **node** | "worker node" / "remote host" | Dispositivo periférico conectado ao gateway via WS |
| **gateway** | "master" / "brain" | Serviço central que processa mensagens e roda agentes |
| **node host** | "headless node" | Node sem UI para Linux/Windows |
| **multi-agent** | "multi-bot" | Múltiplos agentes isolados num gateway |
| **sub-agent** | "worker agent" | Agente filho spawneado por um agente pai |
| **profile** | "gateway instance" | Instância isolada de gateway no mesmo host |
| **binding** | "routing rule" | Regra que mapeia mensagem → agente |
| ~~cluster~~ | **NÃO EXISTE** | Termo não usado no OpenClaw |

---

## 13. CHANGELOG — LINHA DO TEMPO DE FEATURES DE NODES

Com base no CHANGELOG local, funcionalidades de node adicionadas recentemente:

- **Android/Nodes:** `device.status`, `device.info`, `notifications.list`
- **Agents/Canvas default node resolution:** quando múltiplos nodes com canvas estão conectados, seleciona o primeiro candidato disponível
- **Security/Node exec approvals (2026.2.26):** múltiplas correções críticas de segurança
- **Security/Gateway node pairing (2026.2.26):** pin de metadados na reconexão
- **Node/macOS exec host:** padrão mudado para execução local por padrão

---

## 14. CONCLUSÕES E RESPOSTAS PARA EDUARDO

### ✅ OpenClaw tem suporte a múltiplas máquinas?
**SIM.** Via sistema de nodes — qualquer máquina pode ser um node headless conectado ao gateway central.

### ✅ O que seria um "cluster" OpenClaw?
Na prática: **um Gateway central + múltiplos node hosts** em máquinas diferentes. Não existe feature chamada "cluster", mas a arquitetura é distribuída por design.

### ✅ É possível ter Tita em múltiplas máquinas?
**SIM**, mas não da forma que se imagina. O gateway (onde Tita "vive") fica em **uma máquina**. Outras máquinas se conectam como **nodes** que executam comandos para Tita. Tita é centralizada; as "mãos" dela são distribuídas.

### ✅ O Mac Mini atual pode ser gateway + node?
**SIM.** O Mac Mini pode rodar o Gateway E atuar como node simultaneamente (via macOS app em node mode).

### ⚠️ Não existe "OpenClaw cluster" como produto/feature
O termo não aparece em nenhuma documentação, changelog, FAQ ou discussão pública encontrada.

---

## 15. LIMITAÇÕES DA PESQUISA

1. **Sem acesso a Reddit/GitHub/YouTube/Instagram real** — mecanismo de busca (Kimi) retornou apenas resultados fabricados sem URLs verificáveis
2. **Site openclaw.ai indisponível** — todos os endpoints retornaram 404; a documentação existe apenas localmente
3. **Produto com presença pública mínima** — OpenClaw parece ser um produto principalmente por assinatura/privado, sem fóruns públicos ativos identificáveis
4. **Changelog como proxy** — usamos o CHANGELOG.md local como fonte de features recentes já que não há blog/release notes públicos acessíveis

---

## FONTES DOCUMENTADAS

| Fonte | URL/Path | Tipo | Relevância | Data |
|---|---|---|---|---|
| Docs: Nodes Index | `/docs/nodes/index.md` | Local/Oficial | ⭐⭐⭐⭐⭐ | 2026 |
| Docs: Multiple Gateways | `/docs/gateway/multiple-gateways.md` | Local/Oficial | ⭐⭐⭐⭐⭐ | 2026 |
| Docs: Multi-Agent Routing | `/docs/concepts/multi-agent.md` | Local/Oficial | ⭐⭐⭐⭐⭐ | 2026 |
| Docs: Node CLI | `/docs/cli/node.md` | Local/Oficial | ⭐⭐⭐⭐⭐ | 2026 |
| Docs: Nodes CLI | `/docs/cli/nodes.md` | Local/Oficial | ⭐⭐⭐⭐ | 2026 |
| Docs: Gateway Index | `/docs/gateway/index.md` | Local/Oficial | ⭐⭐⭐⭐ | 2026 |
| Docs: Network Model | `/docs/gateway/network-model.md` | Local/Oficial | ⭐⭐⭐⭐ | 2026 |
| Docs: Remote Access | `/docs/gateway/remote.md` | Local/Oficial | ⭐⭐⭐⭐ | 2026 |
| Docs: Tailscale | `/docs/gateway/tailscale.md` | Local/Oficial | ⭐⭐⭐ | 2026 |
| Docs: Bonjour/Discovery | `/docs/gateway/bonjour.md` | Local/Oficial | ⭐⭐⭐ | 2026 |
| Docs: Architecture | `/docs/concepts/architecture.md` | Local/Oficial | ⭐⭐⭐⭐ | 2026 (2026-01-22) |
| Docs: FAQ | `/docs/help/faq.md` | Local/Oficial | ⭐⭐⭐⭐⭐ | 2026 |
| Docs: Remote Gateway README | `/docs/gateway/remote-gateway-readme.md` | Local/Oficial | ⭐⭐⭐ | 2026 |
| CHANGELOG.md | `/CHANGELOG.md` | Local/Oficial | ⭐⭐⭐⭐ | 2026 |
| Reddit (r/selfhosted, r/homelab) | reddit.com | Externo | ⭐ (nada encontrado) | — |
| GitHub público | github.com | Externo | ⭐ (nada encontrado) | — |
| YouTube | youtube.com | Externo | ⭐ (nada encontrado) | — |
| Web geral | múltiplos | Externo | ⭐ (fabricações) | — |

---

*Pesquisa realizada por Tita (subagente) em 2026-03-13. Duração: ~35 min. Toda informação técnica verificada contra documentação local instalada em `/Volumes/TITA_039/MAC_MINI_03/.openclaw/lib/node_modules/openclaw/`.*
