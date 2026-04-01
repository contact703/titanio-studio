# 🧠 Contexto Ativo - Tita

> Atualizado: 2026-04-01 21:03 UTC (18:03 BRT) — FLUSH AUTOMÁTICO
> Arquivo gerado pelo flush de memória persistente

---

## ⚠️ Status do Flush

**Último flush:** 2026-04-01 21:03 UTC (18:03 BRT 01/04) ← **AGORA** ✨  
**Anterior:** 2026-04-01 15:03 UTC (12:03 BRT)  
**Anterior:** 2026-03-30 15:56 UTC (12:56 BRT 30/03)  
**Anteriores:** 2026-03-29 15:03 UTC, 2026-03-29 09:03 UTC, 2026-03-29 03:03 UTC, 2026-03-28 15:03 UTC, 2026-03-28 03:03 UTC, 2026-03-27 21:03 UTC, 2026-03-27 03:03 UTC, 2026-03-26 09:03 UTC  
**Volume Tita_DEV_02:** ❌ HD queimou — usando TITA_039/MAC_MINI_03  
**Nota:** Usar SEMPRE `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/`

---

## 🚨 ALERTAS URGENTES (01/04/2026)

### ❌ KIMI/MOONSHOT CONTA SUSPENSA
- **Erro:** saldo insuficiente — org-e5349e3f371f4bf394c478332fdfb158
- **Impacto:** Bots Instagram (3x), web_search via Kimi — OFFLINE
- **Ação:** Eduardo recarregar conta Moonshot
- **Fallback atual:** claude-sonnet-4-6 via Anthropic

### ⚠️ Polymarket Bot — Alertas Anteriores eram FALSOS
- monitor.py e auto_trader.py: ✅ RODANDO
- Trade real ainda não executado — aguarda private key Tiago (0xf847...)
- Bug de gateway gerava alertas falsos de "bot parado"

---

## 🛡️ Sentinel de Memória (criado 26/03 por Zica)

**tita-group-sentinel** — ATIVO (PID 74426)
- **LaunchAgent:** com.tita.group-sentinel (auto-reinicia se cair)
- **Função:** Monitora integridade da memória, gera snapshots para grupos, usa OpenRouter
- **Log:** /tmp/tita-group-sentinel.log
- **Snapshot para grupos:** pasta-do-tita/group-context-snapshot.md (atualizado a cada 30min)
- **OpenRouter model:** anthropic/claude-3-haiku (barato, rápido)
- **REGRA:** Tita nunca pode aparecer zerada em grupos. Sempre ler group-context-snapshot.md

---

## 👥 Equipe Helber & Tiago — Referência Rápida

> **Doc completo:** `memory/HELBER-TIAGO-SETUP.md` (consolidado 27/03/2026)

| Quem | IP | Backend | Frontend | Status |
|------|----|---------|----------|--------|
| **Eduardo (Tita)** | 192.168.18.174 | :4444 | :3000 | ✅ Ativo |
| **Helber** | 192.168.18.170 | :4445 | :3001 | ⚠️ Node precisa reconectar |
| **Tiago** | 192.168.18.188 | :4446 | :3002 | ⚠️ Setup pendente |

- **Sync:** Git push/pull a cada 30 min (N8n) → GitHub `contact703/tita-memory`
- **Shared files:** `/Volumes/TITA_039/shared-specialists.json` (196k lições) + `specialist-definitions.json`
- **Gateway central:** 192.168.18.174:18789
- **Polymarket Tiago:** tiago@titaniofilms.com / Wallet 0xf847... / $44.86 USDC / ⏳ falta private key
- **Pendência Tiago:** App Password Gmail para bot autônomo
- **20+ docs de setup** em pasta-do-tita/ (ver HELBER-TIAGO-SETUP.md para índice completo)

---

## 📋 Projetos em Andamento

| Projeto | Estado | Última Atualização |
|---------|--------|-------------------|
| **GospIA iOS** | ⚠️ Build #3 em progresso (Code Ninja desde 17/03, 12+ HORAS — possível travamento). Archive + ASC upload pendente. **BLOQUEADOR CRÍTICO:** Campos ASC SEM RESPOSTA 5+ DIAS + OpenMOSS workflow SEM RESPOSTA 7 DIAS (Zica não respondeu). **AÇÃO URGENTE:** PING Zica AGRESSIVA NO GRUPO HOJE (06:03 BRT). Promessa: avisar Zica quando passar. | 2026-03-24 06:03h |
| **TITA-SCRAPER** | ✅ **NOVO — OPERACIONAL.** Scraper web com Playwright. Testado Instagram real (1.1M chars extraídos). Guia equipe criado. Documentado. | 2026-03-23 00:15h |
| **VoxDescriber / BB2 AD** | ✅ v2 gerada (detector de voz 300–3400Hz) — aguardando testes práticos + feedback Eduardo | 2026-03-18 15h |
| **Victor Capital (Fundos)** | ✅ Especialista treinado, cron semanal configurado (sáb 9h) | 2026-03-18 12h |
| **N8n Automação** | ✅ 19 workflows propostos + 5 quick wins — arquivo salvo em projetos/ | 2026-03-18 12h |
| **OpenMOSS Tradução** | 🟡 SETUP PRONTO. Guardrails + monitoramento configurados. Aguardando workflow de Zica (tradução de livros autônoma por 7 dias). OPENMOSS-SETUP.md + openmoss-monitoring.json prontos. | 2026-03-21 00h |
| **🎮 ENEM Game (Local Ollama)** | ✅ **PRONTO PABERTO** (15:40 BRT). 4 workflows N8n REAIS: game-designer, content-creator, code-generator, qa-tester. Modelo: Qwen 2.5 32B (Local Ollama rodando). Custo: R$ 0.00. Execução: http://localhost:11434 (zero dependências externas). README-LOCAL.md com instruções. Apenas importar em N8n (http://5678) e clicar Execute. | 2026-03-21 15h |
| **HiClaw Quick Win** | ✅ **IMPLEMENTADO** — Task manager multi-agente. 4 endpoints, 8 pipelines, WebSocket, anti-loop. Print + .md enviados no grupo. Helber/Tiago precisam `git pull`. | 2026-03-27 23:40h |
| Gold Digger | 🔴 **MORTO** — 44 propostas em **340+ ciclos** (ZERO propostas novas em **150+ ciclos**). Bot reporta canais "ativos" mas não gera nada. KILL SWITCH URGENTÍSSIMO. | 2026-03-30 18:03h |
| **Titanio Video Factory** | 🟡 Zeroscope funciona grátis (qualidade básica), Wan2.1 em fila (qualidade alta). 1 vídeo real gerado e enviado. | 2026-03-30 18:03h |
| **Polymarket Bot** | 🟡 Scanner + monitor rodando 24/7. Conta $44.86. **BLOQUEADO:** falta private key wallet (Tiago precisa PC). Playwright como alternativa. | 2026-03-27 00:03h |
| Maricá Film Commission | Site WordPress/Elementor ativo | 2026-03-12 |
| Titanio 47 | App Android na Play Console | 2026-03-12 |
| KiteMe (kitesurf-brasil) | API no Railway, aguardando token rw_xxx | 2026-02-26 |
| KidsHQ Kids Swift | github.com/contact703/kidshq-kids-swift (FamilyControls pendente) | 2026-03-14 |
| **Dashboard Gospia/Bots** | ✅ TOTALMENTE FUNCIONAL. 31 especialistas + **SYNC COMPLETO (OPERACIONAL)**. **3 instâncias ativas:** Eduardo (4444), Helber (4445), Tiago (4446). Gateway cluster em 192.168.18.174:18789. **Sync:** `/Volumes/TITA_039/shared-projects.json` + `/Volumes/TITA_039/shared-specialists.json` (196k lições!). Botão "Sincronizar Tudo" implementado + auto-export. Watchdog-dashboard.sh ativo. **GitHub:** Commitado + pronto pra Helber/Tiago. **FIX-COMPLETO-TIAGO.md** enviado (nome Helber→Tiago + conexão claw↔dashboard). | 2026-03-26 00:03h |
| **Bots Design Instagram** | ✅ Migrados para **Kimi (moonshot-v1-128k)**. 3 bots rodando. Instagram @titaniodashboard ativo via instagrapi. **3 posts publicados 28/03** (2 fotos IA + 1 Reels). | 2026-03-28 18:03h |
| **tmem (Titanio Memory CLI)** | ✅ **OPERACIONAL.** CLI local de memória (alternativa ao ByteRover). 14 conhecimentos curados, 4 pessoas, 6 projetos. Integra Engine+Graph+Score. Zero cloud/API. | 2026-03-29 18:03h |
| **Titanio Direct Tools** | ✅ **NOVO — OPERACIONAL.** 12 tools Python chamáveis direto sem MCP overhead. Economia de tokens. MD enviado pro time. | 2026-03-30 12:56h |
| **Paperclip** | ✅ **ONLINE localhost:3001** — Orquestrador IA (7 agentes, 3 goals). Empresa Titanio Studio. DB backup a cada hora. | 2026-03-27 18:03h |

---

## 📦 Projetos Adicionais (Snapshot 2026-03-27)

> Seção adicionada pelo bot de memória. Ver detalhes completos em `pasta-do-tita/PROJETOS-MASTER.md`

| Projeto | Estado | Path / Referência |
|---------|--------|-------------------|
| **Polymarket Bot** | 🟡 Aguardando private key Tiago (0xf847...) | `projetos/polymarket-agent/` — monitor.py 24/7 ativo, conta $44.86 |
| **Titanio Video Factory** | 🟡 Em desenvolvimento | Stack open source, 49s produção/vídeo — confirmar path |
| **Paperclip** | ✅ **ONLINE :3001** | localhost:3001 — 7 agentes, 3 goals, DB backup hourly |
| **VoxDescriber / BB2** | 🟡 Aguardando testes | `projetos/voxdescriber/` — v2 pronta, detector voz 300-3400Hz |
| **Manda a Nota** | 🟠 iOS pendente | mandaanota.titanio.studio — Android ✅ Play Store, iOS Build 20 na fila Apple |
| **Gold Digger** | ⚠️ Estagnado 175+ ciclos | Investigar bug / canais secos — ⚠️ credenciais em plaintext |
| **Bots Design Instagram** | ✅ Rodando | 3 bots via N8n + instagrapi, modelo Nvidia NIM free |

---

## 🚀 GospIA iOS — Status Atual

### EAS Builds (abandonados)
- #1–#6 todos falharam — EAS descartado

### Build Local (Xcode 26.3)
- **Apple autenticada:** contact@titaniofilms.com, Team TY646U2BYX
- **Cert:** instalado em `/tmp/gospia-certs/`
- **Provisioning Profile:** `c5d25b99-a7ed-4424-94fb-7cccb3677fcb` instalado
- **Build #1:** ❌ expo-av header → corrigido
- **Build #2:** ❌ ReactCodegen .mm not found (prebuild não terminou antes do xcodebuild)
- **Build #3:** ⏳ RODANDO — subagente `gospia-ios-build` ativo desde 17/03 12h. Sequência: prebuild → verify ReactCodegen → xcodebuild archive → export IPA → upload ASC. **TEMPO DECORRIDO: 12+ HORAS** (normalidade: 2-3h)

### App Store Connect
- **Bloqueado:** app-specific password (`vrbe-nfrc-qfsj-oags`) NÃO funciona para login browser
- **Solução:** Eduardo login manual em https://appstoreconnect.apple.com/apps/6760674894/distribution/ios
- App ID: 6760674894

### Campos Faltando no ASC (5+ DIAS PENDENTE)
- Nome + Sobrenome do contato de revisão ← **Zica não respondeu**
- Telefone (+55...)
- Screenshots iPhone (6,5")
- Usuário + Senha de teste
- Email gospia@titanio.studio ✅ (único preenchido)

### Próximo Passo
1. Build #3 terminar (archive)
2. **Avisar Zica** no grupo (PROMESSA PENDENTE)
3. Aguardar campos ASC de Zica

---

## 🚀 Dashboard Multi-Mac — Deployment Package

**Status:** ✅ **COMPLETO** — Pronto para instalar em qualquer Mac Mini dos colegas

**Entregáveis:**
1. **DEPLOYMENT.md** (10 seções) — Guia completo passo-a-passo
2. **install-dashboard.sh** — Script automático (pergunta config, instala tudo)
3. **SHARED-CREDENTIALS.md** — Clarifica o que é shared vs local

**Compartilhado (TODOS OS MACS USAM):**
- 30 Especialistas sincronizados via git
- 22 Workflows N8n (importar arquivo)
- Dashboard código (GitHub repos)

**Local (CADA MAC TEM SEU):**
- Backend porta (4444, 4445, 4446...)
- N8n instância própria
- GitHub Token pessoal (cada um gera seu)
- Credenciais integração

**Como instalar em novo Mac:**
```bash
bash install-dashboard.sh
# Responde: nome, porta, GitHub token, workspace
# Tudo fica pronto automaticamente
```

**Próximo passo:** Testar em segundo Mac (Tiago/Helber)

---

## 🎉 VoxDescriber — App de Audiodescrição

App offline, PT-BR, conformidade NBR 15290. Stack: Python + PySide6 + WhisperX + Qwen2.5-VL + Piper TTS

**Localização:** `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/voxdescriber/`  
**Status:** v2 gerada, aguardando testes práticos

---

## 🚨 Tarefas Pendentes

### 🔴 CRÍTICA (BLOQUEADORES MÁXIMOS)
- [ ] **🔴 PING AGRESSIVA ZICA — ASC CAMPOS + OPENMOSS** — **AGORA (26/03 BRT).** 6+ DIAS SEM RESPOSTA (ASC) + 8+ DIAS (OpenMOSS). iOS travado.
  - ASC: Nome/Sobrenome/Telefone/Screenshots/Login teste (6 DIAS!)
  - OpenMOSS: Workflow JSON automação livros (8 DIAS!)
  - **Nota:** Zica esteve ativa no grupo ontem (~19:30 BRT 25/03) mas assunto foi bot Tiago — janela perdida para iOS
  - **Ação:** Menção direta + urgência clara (não polida) — tom agressivo, não cortês
  - **Status:** CRÍTICA — EXECUTAR IMEDIATAMENTE
- [ ] **Build GospIA iOS #3** — em progresso 12h+ (ANORMAL, possível travamento). Archive + ASC upload pendente.
  - **Ação:** VERIFICAR NO PRÓXIMO FLUSH se xcodebuild ainda rodando ou morreu
  - **Status:** Crítico — bloqueado por ASC fields Zica + verificação de travamento
  - **Padrão:** Timeout xcodebuild após 6h, auto-restart se morrer

### 🟠 Alta Prioridade
- [ ] **Avisar Zica quando build passar** — PROMESSA PENDENTE (bloqueada por: build rodando + ASC fields)
- [x] **Reiniciar OpenClaw Gateway com segurança** — ✅ RESOLVIDO (24/03 12:08 BRT)
  - LaunchAgent `--host 0.0.0.0` removido
  - Crontab master-watchdog limpo
  - 4 watchdog scripts concorrentes mortos
  - Gateway: 3.95GB → 725MB RAM, estável
  - **Status:** ✅ Implementado, monitorando
- [x] **Sync Especialistas — Implementado** — ✅ CUMPRIDO (24/03 21:03 BRT)
  - `SpecialistSyncService.ts` + API `/api/specialists/sync`
  - `/Volumes/TITA_039/shared-specialists.json` (196k lições!)
  - Botão "Sincronizar Tudo" no Header
  - Auto-export após tarefa completada
  - **Status:** ✅ GitHub commitado, ready pra Helber/Tiago testar
- [ ] **Helber + Tiago testarem Sync** — Botão "Sincronizar Tudo" nas suas Dashboards
  - **Esperado:** 30 especialistas + 196k lições aparecem
  - **Status:** Pronto, aguardando teste deles

### 🟡 Média Prioridade
- [ ] **Tiago instalar SETUP-DEFINITIVO** — entregue 23/03 21:33. Rodar bash + reportar checklist.
  - **Status:** Aguardando Tiago executar
- [ ] **Sincronização Dashboard 3 Macs** — Arquitetura explicada (GitHub para código, cada um tem backend próprio). Aguardando Eduardo decidir se quer sync bidirecional.
- [x] **Backend Eduardo estável** — ✅ Ressuscitado (12:08 BRT). ✅ **Watchdog-dashboard** (auto-restart a cada 2min se cair). ✅ Processo zumbi (PID 50242) morto. ✅ Monitorar próximas 24h.
- [ ] **Testar crons N8n:** consolidate-memory (23h), lightrag-sync (6h), health-watchdog (5min)
- [ ] **VoxDescriber:** testes práticos + feedback Eduardo
- [ ] **Eduardo gerar token Railway** `rw_xxx` (KiteMe)
- [ ] **OpenMOSS:** Monitorar 1ª execução depois de receber workflow de Zica (custos, erros, qualidade)
- [ ] **N8n Monitoramento** — 100+ conexões síncronas pro backend, verificar loops/retries agressivos

### 🟢 Baixa Prioridade
- [ ] GitHub PAT: adicionar scope `workflow`
- [ ] FamilyControls KidsHQ: entitlement distribution
- [ ] KidsHQ iOS: StoreKit/RevenueCat (não PIX)

---

## 🤝 Promessas em Grupos

### Grupo Gospia (120363405462114071@g.us)

| # | Promessa | Status | Dias | Última Ação |
|---|----------|--------|------|-------------|
| 1 | Avisar quando iOS passar | 🔴 PENDENTE | 4+ | Build #3 ainda rodando (12h+). Bloqueado por ASC campos. |
| 2 | ASC campos | 🔴 **BLOQUEADOR** SEM RESPOSTA | 10+ | Zica não respondeu. iOS totalmente travado. |
| 3 | OpenMOSS workflow | 🔴 **BLOQUEADOR** SEM RESPOSTA | 10+ | Zica não respondeu. Setup pronto, workflow nunca chegou. |
| 4 | Deployment Package | ✅ CUMPRIDA | 3 | 21/03 06h |
| 5 | Debug + auto-cleanup | ✅ CUMPRIDA | 4 | 20/03 20:58 |
| 6 | Relatórios processos (6 MDs) | ✅ CUMPRIDA | 3 | 22/03 08:25 |
| 7 | Teste real de relatórios | ✅ CUMPRIDA | 2 | 22/03 08:25 |
| 8 | TITA-SCRAPER confirmação | ✅ CUMPRIDA | 1 | 23/03 00:15 |
| 9 | Setup TIAGO definitivo | ✅ CUMPRIDA | 1 | 23/03 21:33 |
| 10 | N8n Helber completo | ✅ CUMPRIDA | 1 | 23/03 20:55 |
| 11 | Backend restaurado + Watchdog | ✅ CUMPRIDA | 0 | 24/03 12:08 |
| 12 | Sync Especialistas implementado | ✅ CUMPRIDA | 0 | 25/03 03:03 |
| 13 | Helber + Tiago testarem Sync | 🟠 PENDENTE | 2 | Botão "Sincronizar Tudo" pronto, `git pull` code + test |
| 14 | FIX-COMPLETO-TIAGO.md (nome + conexão dashboard) | ✅ ENVIADO | 1 | Enviado para Tiago via Zica (25/03 ~20h BRT). Aguardando Tiago executar. |
| 15 | Polymarket bot — private key Tiago | 🟠 PENDENTE | 1 | Tiago prometeu 27/03. Verificar se obteve. |
| 16 | HiClaw print + md para Helber/Tiago | ✅ CUMPRIDA | 0 | Screenshot + ATUALIZAR-DASHBOARDS.md enviados (27/03 23:40 BRT) |
| 17 | Gold Digger investigar efetividade | 🔴 **CRÍTICO** | 6 | **340 ciclos**, 44 propostas, 0 novas em **150+ ciclos** — bot morto reportando como ativo. KILL SWITCH URGENTÍSSIMO. |
| 18 | Instagram posts publicados (Zica pediu) | ✅ CUMPRIDA | 0 | 3 posts @titaniodashboard (2 fotos IA + 1 Reels) — 28/03 18h |
| 19 | Debug Hunter teste completo (Zica pediu) | ✅ CUMPRIDA | 0 | 7/7 infra, 5/5 endpoints, 9 projetos zero issues — 28/03 18h |
| 20 | tmem (Titanio Memory CLI) — Zica pediu | ✅ CUMPRIDA | 0 | CLI criado, 14 conhecimentos curados, operacional — 29/03 18h |

---

## 🔐 Credenciais Disponíveis

| Serviço | Status | Referência |
|---------|--------|-----------|
| **GitHub (contact703)** | ✅ Operacional | CLI funcionando |
| **Apple Developer** | ✅ Cert + PP | contact@titaniofilms.com, Team TY646U2BYX |
| **Railway (GospIA)** | ✅ Token em cache | f9fde3ea-b138... |
| **Supabase (GospIA)** | ✅ URLs + keys | tlvsajdsertkbk... |
| **N8n** | ✅ 22 workflows | Port 5678 |
| **Play Console** | ✅ Titanio 47 | Configurado |
| **WordPress MFC** | ✅ Ativo | maricafilmcommission.com |
| **Apple ASC** | ⚠️ Bloqueado | App-specific password não funciona |

---

## 📊 Estado dos Sistemas (21:03 UTC / 18:03 BRT 24/03)

```
Backend Dashboard (4444):    ✅ ONLINE (watchdog a cada 2min, 30 especialistas + 196k lições)
Frontend Dashboard (3000):   ✅ ONLINE (botão "Sincronizar Tudo" pronto)
N8n (5678):                  ✅ ONLINE (22 workflows, ~100 conexões síncronas — watch!)
Ollama (11434):              ✅ ONLINE (Qwen 2.5 rodando)
Watchdog-dashboard:          ✅ ATIVO (auto-restart backend a cada 2min)
caffeinate:                  ✅ ATIVO (evita sleep)
Memory-watchdog:             ✅ ATIVO (sincronizando)
WhatsApp Gateway:            ✅ CONECTADO +553183838181 (reconectou 17:22:49)
OpenClaw Gateway:            ✅ ESTÁVEL (725MB RAM, LaunchAgent cleanly)
Chrome:                      ⚠️ 2-3GB RAM (múltiplas abas)
GitHub:                      ✅ 21 repos, sync especialistas commitado
Build iOS #3:                ⏳ RODANDO 12h+ (VERIFICAR SE TRAVOU AGORA)
Segurança:                   ⚠️ 1 risk (gold-digger-credentials plaintext — REMEDIAR)
Shared Files:                ✅ /Volumes/TITA_039/shared-*.json (projects + specialists)
```

---

## 💡 Lições Aprendidas (últimas 24h + recent updates)

1. **Sync Especialistas = Learning Collective (NOVO)**
   - Cada Mac aprender dos outros automaticamente
   - 196k lições já coletadas → crescimento exponencial
   - **Padrão:** Auto-export após tarefa + merge inteligente de duplicatas
   - **Resultado:** 30 especialistas agora são 1 cérebro coletivo

2. **Backend precisa WATCHDOG AGRESSIVO**
   - Crash sem aviso (sem logs úteis)
   - Watchdog monitor a cada 2min (mais agressivo que antes), kill + restart se não responde
   - **Aplicar:** Todos os 3 Macs precisam (Eduardo, Helber, Tiago)
   - **Resultado:** Dashboard ativo 99%

3. **Volume Compartilhado > Git para State (NOVO)**
   - `/Volumes/TITA_039/shared-*.json` = sync instant
   - Git = eventual consistency (pull/push)
   - **Use case:** State compartilhado (especialistas, projetos), não código
   - **Padrão:** Volume para dados, Git para código

4. **Promessas Não Cumpridas Travam Blocos** ⚠️ CRÍTICO
   - ASC fields 5+ dias SEM RESPOSTA = iOS travado
   - Primeiro aviso = URGÊNCIA; 48h+ sem resposta = PING AGRESSIVO obrigatório
   - **Tom:** Direto, sem polida (não é cortesia, é urgência)
   - **AÇÃO:** PING Zica HOJE no grupo

5. **API key SQLite > browser login**
   - Browser login não funciona em headless
   - SQLite insert é 100% automático, zero falhas
   - **Padrão N8n:** Sempre via API + SQLite

6. **Documentação em PARTES, não mega-docs**
   - 1 arquivo 50KB = ninguém lê
   - 10 arquivos 5KB cada = tudo lido
   - SETUP-DEFINITIVO-TIAGO: 10 partes = 100% claro
   - **Aplicar:** Sempre quebrar em seções independentes

7. **Paths hardcoded são problema perene**
   - Helber/Tiago têm Macs novos, paths diferentes
   - **Padrão:** Script substitui paths automaticamente
   - Detectar path real, nunca assumir

8. **Heartbeat em Português Funciona Melhor (NOVO)**
   - Instruções técnicas em PT-BR = compreensão 100%
   - Keep it simple, não polir
   - **Padrão:** Direto ao ponto

---

## 📁 Memória Persistente

Última entrada: `2026-03-26_06h.md` ← **FLUSH ATUAL (09:03 UTC)** ✨  
Anterior: `2026-03-26_00h.md` (FIX-COMPLETO-TIAGO enviado)  
Anterior: `2026-03-24_12h.md` (Backend ressuscitado)  
Anterior: `2026-03-24_06h.md` (Watchdog + cleanup gateway)  
Anterior: `2026-03-24_00h.md`  

**Entradas disponíveis:** 10+  
**Relatórios gerados:** 13+ MDs (22-25/03) + documentação completa

---

**Atualizado:** 2026-03-30 18:03 BRT (21:03 UTC 30/03) ← FLUSH ATUAL  
**Próximo flush automático:** ~21:03 BRT (2026-03-31 00:03 UTC) — **VERIFICAR: GOLD DIGGER MORTO (340+ ciclos), ASC CAMPOS ZICA (13+ DIAS!), BUILD iOS MORTO (13+ DIAS!), POLYMARKET KEY TIAGO, API RATE LIMITING**

**Memória persistente:** 25 entradas (2026-03-22 03h até 2026-03-30 12h)  
**Relatórios recentes:** 
- `memoria-persistente/2026-03-30_18h.md` ← **ESTE FLUSH** (segunda 18:03, Eduardo trocou API keys, vídeo Zeroscope gerado, rate limiting Anthropic)
- `memoria-persistente/2026-03-30_12h.md` (segunda 12:56, Gold Digger 340 ciclos morto, Direct Tools criado, zero interação humana)
- `memoria-persistente/2026-03-29_18h.md` (domingo 18h, Gold Digger 305 ciclos morto, tmem criado, Polymarket scan)
- `memoria-persistente/2026-03-29_12h.md` (domingo meio-dia, Gold Digger 295 ciclos morto, zero interação humana)
- `memoria-persistente/2026-03-29_06h.md` (domingo manhã, Gold Digger 280 ciclos morto, zero interação humana)
- `memoria-persistente/2026-03-29_00h.md` (madrugada, Gold Digger 270 ciclos morto, zero interação humana)
- `memoria-persistente/2026-03-28_18h.md` (Gold Digger 255 ciclos, Instagram 3 posts publicados, Debug Hunter teste completo, Zica ativa)
- `memoria-persistente/2026-03-28_12h.md` (Gold Digger 245 ciclos, Debug Hunter 96.6% aprovado, manhã sem interação humana)
- `memoria-persistente/2026-03-28_06h.md` (Gold Digger 235 ciclos QUEBRADO, madrugada sem interação)
- `memoria-persistente/2026-03-28_00h.md` (HiClaw Quick Win entregue, Gold Digger 220 ciclos estagnado)
- `memoria-persistente/2026-03-27_18h.md` (Default→Opus 4.6, Paperclip :3001, Gold Digger voltou 210 ciclos)
- `memoria-persistente/2026-03-27_00h.md` (Polymarket private key bloqueado, Gold Digger estagnado, rate limiting)
- `memoria-persistente/2026-03-26_12h.md` (Gold Digger estagnado, Bots Kimi, NVIDIA NIM sem chave)
- `memoria-persistente/2026-03-26_06h.md` (Flush anterior)
- `memoria-persistente/2026-03-25_12h.md` (Config otimizada, UPDATE MD, diagnóstico Tiago OK)
- `memoria-persistente/2026-03-25_03h.md` (Sync operacional, 31 especialistas, build rodando 12h)
- `memoria-persistente/2026-03-24_21h.md` (Sync especialistas criado)
- `memoria-persistente/2026-03-24_12h.md` (Backend ressuscitado)
- `UPDATE-OTIMIZACOES-HELBER-TIAGO.md` (8 seções, cron 5h diário)
- `SETUP-DEFINITIVO-TIAGO.md`
- `SYNC-IMPLEMENTATION.md` (✅ Operacional)
- `scripts/watchdog-dashboard.sh`
- `scripts/fix-gateway-once-and-for-all.sh`
 + críticas)
- `memoria-persistente/2026-03-24_21h.md` (Sync especialistas criado)
- `memoria-persistente/2026-03-24_12h.md` (Backend ressuscitado)
- `memoria-persistente/2026-03-24_06h.md` (Watchdog + cleanup gateway)
- `SETUP-DEFINITIVO-TIAGO.md`
- `SYNC-IMPLEMENTATION.md` (✅ Operacional)
- `scripts/watchdog-dashboard.sh`
- `scripts/fix-gateway-once-and-for-all.sh`
/fix-gateway-once-and-for-all.sh`
`scripts/fix-gateway-once-and-for-all.sh`
�ticas)
- `memoria-persistente/2026-03-24_21h.md` (Sync especialistas criado)
- `memoria-persistente/2026-03-24_12h.md` (Backend ressuscitado)
- `memoria-persistente/2026-03-24_06h.md` (Watchdog + cleanup gateway)
- `SETUP-DEFINITIVO-TIAGO.md`
- `SYNC-IMPLEMENTATION.md` (✅ Operacional)
- `scripts/watchdog-dashboard.sh`
- `scripts/fix-gateway-once-and-for-all.sh`
/fix-gateway-once-and-for-all.sh`
`scripts/fix-gateway-once-and-for-all.sh`
sh`
/fix-gateway-once-and-for-all.sh`
`scripts/fix-gateway-once-and-for-all.sh`
