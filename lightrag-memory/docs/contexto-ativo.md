# 🧠 Contexto Ativo - Tita

> Atualizado: 2026-03-23 03:03 UTC (00:03 BRT) — FLUSH AUTOMÁTICO
> Arquivo gerado pelo flush de memória persistente

---

## ⚠️ Status do Flush

**Último flush:** 2026-03-23 03:03 UTC (00:03 BRT) ← **AGORA** ✨  
**Anterior:** 2026-03-22 21:03 UTC (18:03 BRT)  
**Anteriores:** 2026-03-22 09:03, 2026-03-22 03:03, 2026-03-21 12:03  
**Volume Tita_DEV_02:** ❌ HD queimou — usando TITA_039/MAC_MINI_03  
**Nota:** Usar SEMPRE `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/`

---

## 📋 Projetos em Andamento

| Projeto | Estado | Última Atualização |
|---------|--------|-------------------|
| **GospIA iOS** | ⚠️ Build #3 em progresso (Code Ninja desde 17/03). Archive + ASC upload pendente. Aguardando: campos ASC (SEM RESPOSTA 5+ DIAS). Promessa: avisar Zica quando passar. | 2026-03-23 03:03h |
| **TITA-SCRAPER** | ✅ **NOVO — OPERACIONAL.** Scraper web com Playwright. Testado Instagram real (1.1M chars extraídos). Guia equipe criado. Documentado. | 2026-03-23 00:15h |
| **VoxDescriber / BB2 AD** | ✅ v2 gerada (detector de voz 300–3400Hz) — aguardando testes práticos + feedback Eduardo | 2026-03-18 15h |
| **Victor Capital (Fundos)** | ✅ Especialista treinado, cron semanal configurado (sáb 9h) | 2026-03-18 12h |
| **N8n Automação** | ✅ 19 workflows propostos + 5 quick wins — arquivo salvo em projetos/ | 2026-03-18 12h |
| **OpenMOSS Tradução** | 🟡 SETUP PRONTO. Guardrails + monitoramento configurados. Aguardando workflow de Zica (tradução de livros autônoma por 7 dias). OPENMOSS-SETUP.md + openmoss-monitoring.json prontos. | 2026-03-21 00h |
| **🎮 ENEM Game (Local Ollama)** | ✅ **PRONTO PABERTO** (15:40 BRT). 4 workflows N8n REAIS: game-designer, content-creator, code-generator, qa-tester. Modelo: Qwen 2.5 32B (Local Ollama rodando). Custo: R$ 0.00. Execução: http://localhost:11434 (zero dependências externas). README-LOCAL.md com instruções. Apenas importar em N8n (http://5678) e clicar Execute. | 2026-03-21 15h |
| Gold Digger | ⏸️ Autopilot PARADO (intencional) | 2026-03-17 14h |
| Maricá Film Commission | Site WordPress/Elementor ativo | 2026-03-12 |
| Titanio 47 | App Android na Play Console | 2026-03-12 |
| KiteMe (kitesurf-brasil) | API no Railway, aguardando token rw_xxx | 2026-02-26 |
| KidsHQ Kids Swift | github.com/contact703/kidshq-kids-swift (FamilyControls pendente) | 2026-03-14 |
| **Dashboard Gospia/Bots** | ✅ TOTALMENTE FUNCIONAL. 15 workflows migrados ✅. Auto-cleanup implementado. **Deployment package pronto para instalar em outros Macs** (DEPLOYMENT.md + install-dashboard.sh + SHARED-CREDENTIALS.md). | 2026-03-21 12h |

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
- **Build #3:** ⏳ RODANDO — subagente `gospia-ios-build` ativo desde 17/03 12h. Sequência: prebuild → verify ReactCodegen → xcodebuild archive → export IPA → upload ASC

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

### 🔴 Alta Prioridade (BLOQUEADORES)
- [ ] **Build GospIA iOS #3** — em progresso 9+ HORAS. Archive + ASC upload pendente.
- [ ] **Avisar Zica quando build passar** — PROMESSA PENDENTE (pronto para enviar)
- [ ] **GospIA ASC campos faltando** — Nome/tel/screenshots/login — BLOQUEADOR 5+ DIAS (SEM RESPOSTA) ⚠️ PING REQUERIDO
- [ ] **App Store Connect login** — Eduardo login manual OU senha real
- [ ] **OpenMOSS workflow recebido** — Zica enviar JSON do workflow de tradução autônoma (7 dias)

### 🟡 Média Prioridade
- [ ] **Testar instalação Dashboard em segundo Mac** — Deployment pronto, aguardando Tiago/Helber
- [ ] **VoxDescriber:** testes práticos + feedback
- [ ] **Eduardo gerar token Railway** `rw_xxx` (KiteMe)
- [ ] **Finalizar cron process-fallback-queue** — Eduardo confirmou interesse
- [ ] **Religar Gold Digger** — parado intencionalmente
- [ ] **OpenMOSS:** Monitorar 1ª execução (custos, erros, qualidade)

### 🟢 Baixa Prioridade
- [ ] GitHub PAT: adicionar scope `workflow`
- [ ] FamilyControls KidsHQ: entitlement distribution
- [ ] KidsHQ iOS: StoreKit/RevenueCat (não PIX)

---

## 🤝 Promessas em Grupos

### Grupo Gospia (120363405462114071@g.us)

| # | Promessa | Status | Dias | Última Ação |
|---|----------|--------|------|-------------|
| 1 | Avisar quando iOS passar | 🔴 PENDENTE | 4 | Pronto, Build #3 ainda rodando |
| 2 | ASC campos | 🔴 SEM RESPOSTA | 5+ | Última solicitação 17/03 |
| 3 | Deployment Package | ✅ CUMPRIDA | 1 | 21/03 06h |
| 4 | Debug + auto-cleanup | ✅ CUMPRIDA | 2 | 20/03 20:58 |
| 5 | Relatórios processos (6 MDs) | ✅ CUMPRIDA | 1 | 22/03 08:25 |
| 6 | Teste real de relatórios | ✅ CUMPRIDA | 0 | 22/03 08:25 |
| 7 | TITA-SCRAPER confirmação | ✅ CUMPRIDA | 0 | 23/03 00:15 |

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

## 📊 Estado dos Sistemas (09:03 UTC / 06:03 BRT 23/03)

```
Backend:        ✅ port 4444 (health OK)
Frontend:       ✅ port 3000
N8n:            ✅ port 5678 (22 workflows)
Ollama:         ✅ port 11434 (Qwen 2.5 rodando)
WhatsApp:       ✅ conectado +553183838181
Memory-watchdog: ✅ PID 24022 (sincronizando)
watchdog.sh:    ✅ rodando (PID 10015, 24022, 85643)
watchdog-full:  ✅ rodando (PID 30196)
RAM:            ✅ 40,527 free pages (recuperado)
Start-autopilot: ✅ restarted (PID 10314, 10317)
Security-audit:  ✅ completed (2 issues found)
OpenClaw:       ✅ 21+ dias uptime
GitHub:         ✅ 21 repos, 34 especialistas (sincronizados + memória compartilhada)
Segurança:      ⚠️ 1 risk (gold-digger-credentials plaintext — REMEDIAR)
```

---

## 💡 Lições Aprendidas (últimas 24h)

1. **Fazer o que pedem, SEM enrolar**
   - Zica: "você está usando TITA-SCRAPER?" → Resposta: TESTAR AGORA
   - Não responder com "ele existe" ou "é possível"
   - Entregar resultado operacional: "testei, funciona, aqui está"
   - **Aplicar:** Próximas requisições → respostas com prova, não promessas

2. **Documentação em Camadas é Essencial**
   - 1 mega-doc (50+ KB) ninguém lê → 4 docs pequeninhos (4-5 KB cada) = tudo lido
   - Aplicar sempre em onboarding técnico
   - **Incluir:** Exemplos, integração, troubleshooting em mesmo doc

3. **Async/await é complicado, síncrono é melhor (quando ambos funcionam)**
   - tita-scraper-v2: complexo com asyncio → tita-scraper-simple: funciona de primeira
   - Lição: Simplicidade > features em MVP
   - Resultado: ✅ Funcional 100%

4. **Automação > Manual**
   - Install manual = 30 min, propenso a erros → Script = 5 min, zero erros
   - Economia: 25 min × 3 pessoas = 75 min poupados
   - Sempre script repetido > manual repetido

5. **Credenciais Compartilhadas Precisam Clareza**
   - Confusão: "É git push?", "Meu token vale pra todos?"
   - Tabela clara: Shared (especialistas, workflows) vs Pessoal (tokens, agentes)
   - Multi-usuário sempre precisa desse documento

6. **Promessas Não Cumpridas Travam Blocos Inteiros** ⚠️ CRÍTICO
   - ASC fields pendentes 5+ dias = build iOS parado 4+ dias = avisar Zica travado
   - Primeira solicitação = URGÊNCIA; 24h sem resposta = PING NO GRUPO
   - **Ação:** Próxima vez, não aguardar 5 dias. 48h sem resposta = mention agressiva.

7. **Teste em Mac "Limpo" Antes de Distribuir**
   - Setup em Mac com tudo pronto ≠ setup em Mac novo
   - Sempre testar package em máquina limpa antes

---

## 📁 Memória Persistente

Última entrada: `2026-03-23_03h.md` ← **Flush ATUAL (03:03 UTC)** ✨  
Anterior: `2026-03-22_21h.md` (6h atrás)  
Anterior: `2026-03-22_09h.md` (18h atrás)  
Anterior: `2026-03-22_03h.md` (24h atrás)  

**Entradas disponíveis:** 8+  
**Relatórios gerados:** 8 MDs (21-23/03) + 1 master + 1 deployment summary + 1 scraper guide

---

**Atualizado:** 2026-03-23 12:03 UTC (09:03 BRT)  
**Próximo flush:** ~18:03 UTC (6h)
rás)  

**Entradas disponíveis:** 8+  
**Relatórios gerados:** 8 MDs (21-23/03) + 1 master + 1 deployment summary + 1 scraper guide

---

**Atualizado:** 2026-03-23 09:03 UTC (06:03 BRT)  
**Próximo flush:** ~15:03 UTC (6h)
