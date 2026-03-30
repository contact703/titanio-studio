# 🧠 HELBER & TIAGO — Setup Completo e Contexto Consolidado

> **Criado:** 2026-03-27 17:10 BRT  
> **Propósito:** Consolidar TODA informação sobre Helber e Tiago para que a Tita nunca "esqueça"  
> **Fonte:** 15+ arquivos de pasta-do-tita/ + memory/ + contexto-ativo.md

---

## 👥 Quem São

- **Helber** — Membro da equipe Titanio Films. Tem domínio `titanio.studio` no Namecheap. Programador.
- **Tiago** — Membro da equipe Titanio Films. Kitesurfista profissional (trabalha com Naish). Usa `tiago@titaniofilms.com`.

---

## 🖥️ Infraestrutura de Rede (Cluster Titanio)

### Macs na Rede Local (192.168.18.0/24)

| Quem | IP | Porta Backend | Porta Frontend | MAC Address | SSH |
|------|----|--------------|----------------|-------------|-----|
| **Eduardo (Tita)** | 192.168.18.174 | 4444 | 3000 | d0:11:e5:dc:37:20 | ✅ |
| **Helber** | 192.168.18.170 | 4445 | 3001 | d0:11:e5:26:03:62 | ✅ |
| **Tiago** | 192.168.18.188 | 4446 | 3002 | d0:11:e5:e8:8b:c7 | ❌ (SSH fechado) |

- **Gateway OpenClaw central:** 192.168.18.174:18789 (Mac do Eduardo)
- **N8n do Eduardo:** http://localhost:5678
- Macs .169 e .188 tinham SSH fechado em 14/03 — Tiago pode ser .188

### Acesso ao Volume Compartilhado

- **Volume:** `/Volumes/TITA_039/` — HD externo conectado ao Mac Mini do Eduardo
- **Arquivos compartilhados no volume:**
  - `/Volumes/TITA_039/shared-projects.json` — projetos sincronizados
  - `/Volumes/TITA_039/shared-specialists.json` — 196k+ lições de especialistas
  - `/Volumes/TITA_039/specialist-definitions.json` — definições dos especialistas
- **Nota:** Helber/Tiago acessam via rede local (SMB/AFP) ou git pull

---

## 🤖 Bots/Agentes Configurados

### Para Helber
- **Helber Agent** — Assistente pessoal no Dashboard Titanio
  - Path: `~/titanio-dashboard/memoria-especialistas/helber-agent/`
  - Arquivos: `context.md`, `memory.json`, `sessions/`, `prompts/`
  - Capabilities: Executar tarefas no Dashboard, gerenciar especialistas, configurar N8n
- **OpenClaw Agent** — Agente próprio do Helber
  - Bootstrap: `BOOTSTRAP-HELBER.md` (SOUL.md, USER.md, MEMORY.md, AGENTS.md)
  - Workspace: `~/.openclaw/workspace/`

### Para Tiago
- **Tiago Agent** — Assistente pessoal no Dashboard Titanio
  - Path: `~/titanio-dashboard/memoria-especialistas/tiago-agent/`
  - Arquivos: `context.md`, `memory.json`, `sessions/`, `prompts/`
  - Capabilities: Executar tarefas no Dashboard, gerenciar especialistas, configurar N8n
- **OpenClaw Agent** — Agente próprio do Tiago
  - Bootstrap: `BOOTSTRAP-TIAGO.md`

### Bots Compartilhados (Todos Usam)
- **32 Especialistas** sincronizados (code-ninja, debug-hunter, money-maker, etc.)
- **Bots Design Instagram** — 3 bots via N8n + instagrapi (@titaniodashboard)
- **8+ Workflows N8n** compartilhados

---

## 🔄 Como a Sincronização Funciona

### Fluxo de Sync (SYNC-DEFINITIVO-V3)

```
Especialista executa tarefa → Aprende lição
    ↓
Salva em disco: memoria-especialistas/[specialist]/lessons.json
    ↓
A cada 30 min: N8n workflow faz git push → GitHub (tita-memory repo)
    ↓
Helber/Tiago: git pull (automático cada 30 min ou manual)
    ↓
TODOS TÊM O MESMO CONHECIMENTO
```

### Componentes de Sync

1. **specialist-definitions.json** (em /Volumes/TITA_039/) — QUEM é cada especialista
2. **shared-specialists.json** (em /Volumes/TITA_039/) — O QUE cada um aprendeu (196k+ lições)
3. **shared-projects.json** (em /Volumes/TITA_039/) — Projetos sincronizados
4. **GitHub repo:** `https://github.com/contact703/tita-memory` (branch: main) — Fonte de verdade
5. **N8n Workflows:**
   - "🔐 Sync Memória GitHub (via Hook)" — ATIVO ✅
   - "🔗 Subagent → Dashboard Status Sync" — ATIVO ✅
6. **Botão "Sincronizar Tudo"** no Dashboard — sync manual + auto-export

### O Que NÃO Precisa Ser Feito Manualmente

- ❌ **Copiar lições entre Macs** → Bots fazem via git push/pull a cada 30 min
- ❌ **Criar especialistas em cada Mac** → specialist-definitions.json é lido automaticamente
- ❌ **Exportar memória** → Auto-export pós-tarefa + botão "Sincronizar Tudo"
- ❌ **Atualizar definições** → POST /api/squad ou edição direta no JSON compartilhado

### O Que PRECISA Ser Feito Manualmente

- ✅ `git pull` se a sync automática falhar
- ✅ Gerar GitHub Token pessoal (cada um o seu)
- ✅ Gerar Anthropic API Key pessoal
- ✅ Ativar SSH nos Macs (para acesso remoto)

---

## 🔑 Credenciais — Compartilhadas vs Pessoais

### Compartilhadas (Todos Usam Igual)
| Recurso | Detalhes |
|---------|----------|
| 32 Especialistas | Memória JSON sincronizada |
| N8n Workflows (8+) | Mesma automação |
| GitHub Repos | Código compartilhado (contact703/) |
| Instagram Titanio | Mesma conta (@titaniodashboard) |
| Supabase | Mesma DB |

### Pessoais (Cada Um Tem Seu)
| Recurso | Por quê |
|---------|---------|
| GitHub Token | Cada um loga como si mesmo |
| Anthropic API Key | Quota de tokens pessoal |
| Kimi API Key | Quota de tokens pessoal |
| Railway Token | Deploy com user pessoal |
| Google OAuth | Conta pessoal |

---

## 📋 Setup do Dashboard (Resumo por Pessoa)

### Helber
- **Backend:** porta 4445, `titanio_helber` (PostgreSQL)
- **Frontend:** porta 3001
- **.env:** MAC_ID=2, OWNER_ID=helber, JWT_SECRET=titanio-helber-2026
- **Gateway:** conecta a 192.168.18.174:18789
- **Cor no Header:** roxo
- **Docs:** SETUP-COMPLETO-HELBER.md, DASHBOARD-INSTALL-HELBER.md, DIAGNOSTICO-HELBER.md

### Tiago
- **Backend:** porta 4446, `titanio_tiago` (PostgreSQL)
- **Frontend:** porta 3002
- **.env:** MAC_ID=3, OWNER_ID=tiago, JWT_SECRET=titanio-tiago-2026
- **Gateway:** conecta a 192.168.18.174:18789
- **Cor no Header:** amarelo
- **Docs:** SETUP-COMPLETO-TIAGO.md, DASHBOARD-INSTALL-TIAGO.md, DIAGNOSTICO-TIAGO.md, FIX-COMPLETO-TIAGO.md
- **Fix aplicado:** Nome "Helber" corrigido para "Tiago" no dashboard dele

---

## 📊 Status Atual (Março 2026)

### Cluster
- ✅ ClusterPanel mostra 3 nós com ping real (desde 16/03)
- ⚠️ Gateway de Eduardo rodava v2026.2.26 vs Helber v2026.3.x — incompatibilidade descoberta 18/03
- ⚠️ Node Helber: precisava reiniciar plist após atualização (18/03)
- ⚠️ Tiago (192.168.18.188): setup ainda pendente em 18/03

### Dashboard
- ✅ 31 especialistas + SYNC COMPLETO OPERACIONAL (desde 23/03)
- ✅ 3 instâncias ativas: Eduardo (4444), Helber (4445), Tiago (4446)
- ✅ Botão "Sincronizar Tudo" implementado + auto-export
- ✅ Watchdog-dashboard.sh ativo
- ✅ GitHub: Commitado + pronto pra Helber/Tiago

### Tiago — Contexto Adicional
- **Polymarket:** Login tiago@titaniofilms.com / Rita160679
- **Wallet Polygon:** 0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0
- **Saldo:** $44.86 USDC
- **Pendência:** Private key da wallet (Tiago precisa PC para extrair)
- **Pendência:** App Password Gmail para bot operar autônomo

---

## 📁 Documentos de Referência (pasta-do-tita/)

| Arquivo | Conteúdo |
|---------|----------|
| AGENT-SETUP-HELBER.md | Setup do agente pessoal Helber |
| AGENT-SETUP-TIAGO.md | Setup do agente pessoal Tiago |
| BOOTSTRAP-HELBER.md | Bootstrap OpenClaw para Helber |
| BOOTSTRAP-TIAGO.md | Bootstrap OpenClaw para Tiago |
| SETUP-COMPLETO-HELBER.md | Dashboard + Memória + LightRAG completo |
| SETUP-COMPLETO-TIAGO.md | Dashboard + Memória + LightRAG completo |
| SETUP-DEFINITIVO-TIAGO.md | Setup definitivo (última versão) |
| DEPLOYMENT-MANUAL.md | Manual de deployment para ambos |
| GUIA-INSTALACAO-DASHBOARD-HELBER-TIAGO.md | Guia passo-a-passo |
| SHARED-CREDENTIALS.md | Credenciais compartilhadas vs pessoais |
| SYNC-DEFINITIVO-V3.md | Sync definitivo v3 |
| SISTEMA-MEMORIA-COMPARTILHADA-FUNCIONANDO.md | Prova de que sync funciona |
| FIX-COMPLETO-TIAGO.md | Fix nome + conexão claw↔dashboard |
| FIX-SYNC-ESPECIALISTAS.md | Fix sync especialistas |
| DIAGNOSTICO-HELBER.md | Diagnóstico técnico Helber |
| DIAGNOSTICO-TIAGO.md | Diagnóstico técnico Tiago |
| DASHBOARD-INSTALL-HELBER.md | Instalação dashboard Helber |
| DASHBOARD-INSTALL-TIAGO.md | Instalação dashboard Tiago |
| UPDATE-OTIMIZACOES-HELBER-TIAGO.md | Otimizações aplicadas |
| INSTRUCAO-CLAW-TIAGO.md | Instruções OpenClaw para Tiago |
| N8N-COMPLETO-HELBER.md | Setup N8n completo para Helber |
| VIDEO-INSTAGRAM-TIAGO.md | Vídeo Instagram para Tiago |
| INSTAGRAM-TECNICAS-COMPLETAS-TIAGO.md | Técnicas Instagram completas |

---

## 🔑 Resumo Executivo (TL;DR)

1. **Helber e Tiago são membros da equipe Titanio Films** com Macs na mesma rede local
2. **Cada um tem seu Dashboard Titanio** (portas diferentes) conectado ao gateway central do Eduardo
3. **Sincronização automática** via git push/pull a cada 30 min (N8n + GitHub)
4. **32 especialistas compartilhados** com memória unificada (196k+ lições)
5. **Volume /Volumes/TITA_039/** é o ponto de sync local com JSONs compartilhados
6. **Setup inclui:** OpenClaw agent + Dashboard + PostgreSQL + Redis + N8n + LightRAG + Ollama
7. **Tiago tem conta Polymarket** ($44.86 USDC) — aguardando private key da wallet
8. **Documentação extensiva** existe em pasta-do-tita/ (20+ MDs sobre setup deles)
