# 🦞 Guia: Sistema de Cluster e Nodes no OpenClaw

> Pesquisa realizada em 13/03/2026 | Versão OpenClaw: 2026.3.11

---

## 1. Como Funciona o Sistema de Nodes/Cluster

O OpenClaw não usa o conceito tradicional de "cluster" (tipo Kubernetes), mas tem um sistema de **nodes** que permite distribuir execução entre múltiplas máquinas.

### Arquitetura

```
┌──────────────────────────────────────────────────────┐
│                   GATEWAY (Hub central)              │
│  - Recebe mensagens dos canais (WhatsApp, Discord)   │
│  - Roda o modelo de IA (Claude, GPT, etc.)           │
│  - Gerencia sessões e agentes                        │
│  - Roteia chamadas de ferramenta para nodes          │
└────────────────┬─────────────────────────────────────┘
                 │ WebSocket (porta 18789)
        ┌────────┴────────┐
        │                 │
   ┌────▼────┐       ┌────▼────┐
   │  NODE 1 │       │  NODE 2 │
   │ Mac Mini│       │ Linux   │
   │ (exec)  │       │ (exec)  │
   └─────────┘       └─────────┘
```

### Conceitos-chave

- **Gateway**: O "cérebro" central. Processa IA e roteia mensagens. Só um por instalação.
- **Node**: Máquina auxiliar que expõe capacidades de execução ao gateway via WebSocket.
- **Agent**: Persona isolada com workspace, histórico e credenciais próprias.
- **Node Host**: Serviço leve instalado numa máquina remota que aceita comandos do gateway.

### O que cada node pode fazer

Um node expõe comandos via `node.invoke`:
- `system.run` — executa comandos shell
- `system.which` — localiza binários
- `canvas.*` — captura/controla WebView
- `camera.*` — captura câmera (dispositivos móveis/Mac)
- `notifications.*` — envia notificações locais
- `device.*` — informações do dispositivo

---

## 2. Como Adicionar e Configurar Nodes

### Passo 1: Instalar o node host na máquina remota

Na máquina que vai ser o node:

```bash
# Instalar OpenClaw na máquina remota (se ainda não tiver)
npm install -g openclaw

# Rodar node host em foreground (teste)
openclaw node run --host <IP-do-gateway> --port 18789 --display-name "Meu Node"

# OU instalar como serviço permanente (recomendado)
openclaw node install --host <IP-do-gateway> --port 18789 --display-name "Build Server"
```

### Passo 2: Autenticação

Se o gateway usa token:

```bash
# Na máquina do node, antes de rodar:
export OPENCLAW_GATEWAY_TOKEN="<seu-token-aqui>"
openclaw node run --host <IP> --port 18789
```

### Passo 3: Gateway em loopback (situação comum)

Se o gateway está em modo local (bind=loopback, padrão), você precisa de um **túnel SSH**:

```bash
# No servidor do node: criar túnel para o gateway
ssh -N -L 18790:127.0.0.1:18789 usuario@maquina-do-gateway

# Em outro terminal: rodar o node apontando para o túnel local
export OPENCLAW_GATEWAY_TOKEN="<token>"
openclaw node run --host 127.0.0.1 --port 18790 --display-name "Node Remoto"
```

### Passo 4: Aprovar o node no gateway

Na máquina do gateway:

```bash
# Ver nodes pendentes de aprovação
openclaw devices list

# Aprovar
openclaw devices approve <requestId>

# Verificar status
openclaw nodes status
```

### Passo 5: Configurar permissões de execução

```bash
# Adicionar comandos à allowlist do node
openclaw approvals allowlist add --node <id-ou-nome> "/usr/bin/git"
openclaw approvals allowlist add --node <id-ou-nome> "/usr/local/bin/node"

# Apontar exec para o node por padrão
openclaw config set tools.exec.host node
openclaw config set tools.exec.security allowlist
openclaw config set tools.exec.node "<id-ou-nome-do-node>"
```

### Comandos úteis de gerenciamento

```bash
openclaw nodes status                    # listar nodes e status
openclaw nodes status --connected        # só os conectados agora
openclaw nodes describe --node <id>      # detalhes e capacidades
openclaw nodes rename --node <id> --name "Novo Nome"
openclaw nodes run --node <id> --raw "uname -a"  # testar execução
openclaw node status                     # status do serviço local
openclaw node restart                    # reiniciar serviço
```

---

## 3. Como Distribuir Bots/Agentes Entre Nodes

### Multi-agent routing

O OpenClaw suporta **múltiplos agentes isolados** no mesmo gateway, cada um com:
- Workspace próprio (arquivos, SOUL.md, AGENTS.md)
- Credenciais separadas
- Histórico de sessão independente
- Skills próprias

### Criar agentes isolados

```bash
# Adicionar agentes
openclaw agents add titanio-47
openclaw agents add marica-fc
openclaw agents add tita-campaign

# Listar
openclaw agents list --bindings
```

### Rotear canais para agentes específicos

```bash
# Vincular um grupo WhatsApp a um agente
openclaw agents bind --agent titanio-47 --bind whatsapp:titanio-group

# Vincular Discord a outro agente
openclaw agents bind --agent marica-fc --bind discord:marica-channel
```

### Configuração no openclaw.json

```json5
{
  agents: {
    list: [
      { 
        id: "titanio-47",
        workspace: "~/.openclaw/workspace-titanio",
        identity: { name: "Tita Titanio", emoji: "🎬" }
      },
      {
        id: "marica-fc",
        workspace: "~/.openclaw/workspace-marica",
        identity: { name: "Maricá Bot", emoji: "🎥" }
      }
    ]
  },
  bindings: [
    {
      agentId: "titanio-47",
      match: { channel: "whatsapp", peer: { kind: "group", id: "120363405462114071@g.us" } }
    }
  ]
}
```

### Regras de roteamento (prioridade)

1. Match exato por peer (DM ou grupo específico)
2. Match por parentPeer (thread)
3. Match por guildId + roles (Discord)
4. Match por guildId (Discord)
5. Match por accountId (conta do canal)
6. Fallback para o agente padrão (`main`)

### Apontar execução de um agente para um node específico

```bash
# Para um agente específico, usar exec no node remoto
/exec host=node security=allowlist node=linux-build-server
```

---

## 4. Benefícios e Limitações

### ✅ Benefícios

| Benefício | Descrição |
|-----------|-----------|
| **Isolamento** | Cada agente tem workspace, auth e sessões separados |
| **Multi-plataforma** | Nodes em Mac, Linux, Windows, iOS, Android |
| **Execução remota** | Rodar comandos em máquinas remotas sem SSH manual |
| **Browser por node** | Cada node pode ter seu próprio browser proxy (zero-config) |
| **Múltiplas personalidades** | Diferentes bots em diferentes canais, mesmo gateway |
| **Multi-account** | Vários WhatsApps/Telegrams no mesmo servidor |
| **Segurança** | Exec controlado por allowlist por node |

### ❌ Limitações

| Limitação | Detalhe |
|-----------|---------|
| **Um gateway** | Não há replicação/failover do gateway em si |
| **Sem load balancing automático** | Exec vai para o node configurado, não distribui |
| **Sem cluster HA** | Se o gateway cair, tudo para — não há standby automático |
| **Nodes são periféricos** | Nodes não recebem mensagens diretamente (só o gateway) |
| **Autenticação manual** | Cada novo node precisa ser aprovado manualmente |
| **SSH tunnel em loopback** | Em modo local padrão, nodes remotos precisam de túnel |
| **Sem balanceamento de carga de IA** | Todas as chamadas ao modelo passam pelo mesmo gateway |

### Sobre "cluster" no sentido tradicional

> O OpenClaw **não é um sistema distribuído clusterizado**. O gateway é um ponto único. Nodes são extensões para execução remota, não réplicas. Para alta disponibilidade real, seria necessário rodar gateways em paralelo (não suportado nativamente).

---

## 5. Exemplo de Configuração para o Projeto Titanio

### Cenário proposto para o Titanio

```
Mac Mini (MAC_MINI_03) — Gateway principal
├── Agent: tita (main) — atende grupos WhatsApp gerais
├── Agent: titanio-47 — app Titanio 47
├── Agent: marica-fc — Maricá Film Commission
└── Node: mac-mini-03 (local) — execução local

+ Futuramente:
└── Node: linux-server — builds, CI, tarefas pesadas
```

### Configuração básica (openclaw.json)

```json5
{
  agents: {
    list: [
      {
        id: "main",
        workspace: "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace",
        identity: {
          name: "Tita",
          emoji: "🐾"
        }
      },
      {
        id: "titanio-47",
        workspace: "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace-titanio47",
        identity: {
          name: "Tita T47",
          emoji: "🎬"
        }
      },
      {
        id: "marica-fc",
        workspace: "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace-marica",
        identity: {
          name: "Maricá Film Bot",
          emoji: "🎥"
        }
      }
    ]
  }
}
```

### Comandos para configurar o projeto Titanio

```bash
# 1. Criar workspace para cada agente
openclaw agents add titanio-47 --workspace ~/.openclaw/workspace-titanio47
openclaw agents add marica-fc --workspace ~/.openclaw/workspace-marica

# 2. Configurar identidades
openclaw agents set-identity --agent titanio-47 --name "Tita T47" --emoji "🎬"
openclaw agents set-identity --agent marica-fc --name "Maricá Film Bot" --emoji "🎥"

# 3. Vincular grupos/canais
# (pegar IDs dos grupos com: openclaw directory list --channel whatsapp)
openclaw agents bind --agent marica-fc --bind whatsapp:<id-grupo-marica>
openclaw agents bind --agent titanio-47 --bind discord:<id-canal-titanio>

# 4. (Opcional) Instalar node local para exec
openclaw node install --host 127.0.0.1 --port 18789 --display-name "Mac Mini 03"
openclaw devices list
openclaw devices approve <requestId>

# 5. Verificar tudo
openclaw agents list --bindings
openclaw nodes status
openclaw gateway health
```

### Para adicionar um node Linux futuro (build server)

```bash
# No servidor Linux (com OpenClaw instalado):
export OPENCLAW_GATEWAY_TOKEN="<token-do-gateway>"

# Se gateway em loopback, criar túnel primeiro:
# ssh -N -L 18790:127.0.0.1:18789 contact@<ip-mac-mini> &

openclaw node install --host 127.0.0.1 --port 18790 --display-name "Linux Build Server"

# No Mac Mini (gateway), aprovar:
openclaw devices list
openclaw devices approve <requestId>

# Configurar allowlist para builds:
openclaw approvals allowlist add --node "Linux Build Server" "/usr/bin/npm"
openclaw approvals allowlist add --node "Linux Build Server" "/usr/bin/gradle"
openclaw approvals allowlist add --node "Linux Build Server" "/usr/bin/git"
```

---

## 6. Resumo Executivo

O sistema de nodes do OpenClaw é:

- **Simples e funcional**: conecta máquinas via WebSocket, sem Docker/Kubernetes
- **Bom para**: múltiplos bots isolados, execução remota delegada, múltiplos canais/contas
- **Não é**: cluster de alta disponibilidade, sistema de failover automático
- **Ideal para o Titanio**: separar agentes por projeto (T47, Maricá FC, campanha) com um único gateway no Mac Mini

A configuração mais útil para o Eduardo seria criar **agentes isolados** por projeto, cada um com seu workspace e canal, mantendo tudo no mesmo Mac Mini por enquanto. Nodes remotos são opcionais e fazem sentido quando houver necessidade de rodar builds ou tarefas pesadas em outro servidor.

---

*Guia gerado pelo agente de pesquisa Tita | OpenClaw 2026.3.11*
