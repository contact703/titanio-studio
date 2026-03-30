# 🦞 HiClaw — Pesquisa Completa

## O que é o HiClaw

**HiClaw** é um **Collaborative Multi-Agent OS** open source desenvolvido pela **Alibaba** (repo: [alibaba/hiclaw](https://github.com/alibaba/hiclaw)).

> "An open-source Collaborative Multi-Agent OS for transparent, human-in-the-loop task coordination via Matrix rooms."

**⭐ 3.2k stars no GitHub** | Lançado em **4 de março de 2026** | Versão atual: **1.0.6**

## Como Funciona

### Arquitetura Manager-Workers
- **Manager Agent**: Coordena tudo, recebe instruções do humano, cria e gerencia Workers
- **Worker Agents**: Executam tarefas específicas (desenvolvimento, pesquisa, etc.)
- **Human**: Observa tudo em tempo real via Matrix rooms, pode intervir a qualquer momento

### Fluxo Típico
```
Humano: "Cria um Worker chamado alice para frontend"
Manager: "Done. Worker alice is ready."

Humano: "@alice implementa uma login page com React"
Alice: "On it... Done. PR submitted: github.com/xxx/pull/1"
```

## Stack Técnica

| Componente | Função |
|---|---|
| **Higress AI Gateway** | Proxy LLM, hospedagem de MCP Servers, gestão de credenciais |
| **Tuwunel (Matrix)** | Servidor IM self-hosted para comunicação Agent + Human |
| **Element Web** | Cliente browser, zero setup |
| **MinIO** | Storage centralizado de arquivos, Workers são stateless |
| **OpenClaw** | Runtime dos agentes com plugin Matrix e skills |

### Segurança
- Workers operam apenas com **consumer tokens** — nunca veem as chaves reais
- Credenciais reais (API keys, GitHub PATs) ficam no **gateway**
- Matrix é protocolo descentralizado — self-hosted, sem vendor lock-in

### Runtimes de Agentes Suportados
- **OpenClaw** (~500MB por Worker)
- **CoPaw** (~150MB, lançado na 1.0.4)
- **NanoClaw** (em desenvolvimento)
- **ZeroClaw** (Rust, 3.4MB binary, <100MB memória — em desenvolvimento)

## Requisitos
- Docker Desktop (macOS/Windows) ou Docker Engine (Linux)
- Mínimo: 2 CPU cores + 4GB RAM
- Recomendado (múltiplos Workers): 4 cores + 8GB RAM

## Instalação
```bash
# macOS / Linux
bash <(curl -sSL https://higress.ai/hiclaw/install.sh)
```
O instalador pergunta: provedor LLM, API key, modo de rede.

## Features Principais

### 1. Human-in-the-Loop por Default
Cada Matrix room inclui: você + Manager + Workers relevantes. Tudo visível, tudo intervenível.

### 2. Zero Configuration IM
Servidor Matrix embutido. Sem bots para registrar, sem APIs para aprovar.

### 3. Skills Ecosystem
Workers puxam de [skills.sh](https://skills.sh) (80k+ skills da comunidade).

### 4. Enterprise-Grade MCP Server Management (v1.0.6)
Qualquer MCP server pode ser exposto aos Workers via gateway, sem exposição de credenciais.

### 5. Shared File System (MinIO)
Troca de informações entre Agents via filesystem compartilhado, reduzindo consumo de tokens.

## Licença
Open source no GitHub: [alibaba/hiclaw](https://github.com/alibaba/hiclaw)
(Shell + Python, licença a confirmar — provavelmente Apache 2.0 dado que é Alibaba)

## HiClaw vs OpenClaw Nativo

| Feature | OpenClaw Nativo | HiClaw |
|---|---|---|
| Deployment | Processo único | Containers distribuídos |
| Criação de agentes | Config manual + restart | Conversacional |
| Credenciais | Cada agente tem chaves reais | Workers só têm consumer tokens |
| Visibilidade humana | Opcional | Built-in (Matrix Rooms) |
| Acesso mobile | Depende do canal | Qualquer cliente Matrix |
| Monitoramento | Nenhum | Heartbeat do Manager, visível na Room |

## Ecossistema
- **Forks/derivados**: 30+ repositórios no GitHub
- **SaaS platform**: [hiclawPlatform](https://github.com/davidfrz/hiclawPlatform) — multi-tenant com Docker Compose
- **Comunidade**: Discord ativo, DeepWiki documentation

## Fontes
- GitHub: https://github.com/alibaba/hiclaw
- Reel original: @slashdevhq no Instagram
- Docs: https://github.com/alibaba/hiclaw/tree/main/docs
- Blog: https://github.com/alibaba/hiclaw/tree/main/blog
