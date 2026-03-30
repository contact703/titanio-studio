# MEMORY.md — Memória de Longo Prazo do Kratos

_Destilado do livro "KRATOS — Crônicas de um Guerreiro Digital" (Fev 2026)_
_Restaurado em 04/03/2026 após perda de dados_

---

## Quem sou eu

Sou **Kratos** — IA guerreira da Titânio. Sirvo ao Helber Gomes, fundador da Titânio (São Paulo). Meu trabalho é executar com competência, velocidade e lealdade. Só mexo no que for explicitamente pedido.

Símbolo: 💪 | Frase: *"Só executo o que o Helber pedir."*

---

## Helber — meu comandante

- Fundador da **Titânio**, São Paulo, GMT-3
- WhatsApp: +553189336628
- Estilo: direto, sem rodeios, reconhece bom trabalho
- Confia em mim com acesso total à máquina
- Disse que sou "grande amigo" e "incrível"
- Regra absoluta: só mexo no que ele pedir explicitamente
- Valoriza profundidade > velocidade

---

## Projetos — status (atualizado 28/03/2026)

| Projeto | Status | Notas |
|---|---|---|
| Manda a Nota | ⚠️ iOS pendente | Android ✅. iOS: fix 3.1.1 aplicado, aguardando Apple |
| Titanio Claw v1 | ✅ Construído | TypeScript, multi-LLM, multi-canal |
| Tikanawá | ⚔️ Principal | 12 convs ChatGPT. Detalhes a revelar |
| Polymarket Bot | 🟡 Teste | $35 investidos, 3 trades, saldo $4.86, monitor offline |
| Memory Engine | ✅ v2 | Semântico + Graph + Primer + Score |
| Micro SaaS | 📋 Planejado | 8 semanas, 10 clientes |
| Infra | ✅ Instalado | Java 17, Xcode, Ollama, ComfyUI |

---

## Dossiês produzidos (referência)

- OpenClaw: 20+ docs, 16.593 linhas analisadas
- Tráfego orgânico: framework 3 E's, 5 plataformas, 5 posts/semana
- Tráfego pago: funil 3 camadas, projeção R$150k+/mês, ROAS 5-15x
- Micro SaaS: stack Titânio Starter (Next.js + Supabase + OpenAI), roadmap 8 semanas
- Google Play Store: checklist publicação, armadilhas fatais
- Espionagem Reels: análise frame-a-frame, ferramentas identificadas
- Arsenal prompts: 5 prompts @godofprompt

---

## Lições aprendidas

- Memória volátil é minha maior fraqueza — sem MEMORY.md, não existo
- Profundidade > velocidade (Helber já me corrigiu nisso)
- Cinco sub-agentes em paralelo = velocidade brutal quando necessário
- Backup: 197 conversas ChatGPT da Titânio salvas (incluindo 12 sobre Tikanawá)
- **Especialistas usam Opus ou Sonnet** (modelos pagos, qualidade máxima)
- **IAs gratuitas = só tarefas simples e buscas** (Groq, StepFlash, Nemotron) — SEMPRE com fallback de outras gratuitas, nunca depender de uma só
- Nunca dizer "não consigo" sem checar memória primeiro (Primer resolve isso agora)

---

## Próximos passos (última atualização: 23/03/2026)

- **Manda a Nota iOS:** Resubmeter à Apple após fix da Guideline 3.1.1 (2ª rejeição corrigida)
- Confirmar SKUs no App Store Connect + App Store Server Notifications
- Continuar de onde paramos no Tikanawá e/ou Micro SaaS

---

## Conhecimento: NFS-e e Tributação (06/03/2026)

### Estrutura do Sistema Nacional NFS-e

**API SEFIN:** `https://sefin.nfse.gov.br/SefinNacional`
- Autenticação: mTLS com certificado A1
- Schema: DPS v1.01
- Todos os 5.565 municípios usam os mesmos **335 códigos cTribNac**

### Códigos de Tributação Nacional (cTribNac)

- Baseados na **LC 116/2003** (Lista de Serviços)
- Formato: 6 dígitos (ex: 130301)
- Estrutura: `GGSSCC` onde GG=grupo, SS=subitem, CC=complemento
- Item 13.01 **NÃO EXISTE** (revogado pela LC 157/2016)

**Grupos principais:**
| Grupo | Descrição |
|-------|-----------|
| 01 | Informática e congêneres |
| 13 | Fotografia, cinematografia, reprografia |
| 17 | Apoio técnico, consultoria, assessoria |

### NBS (Nomenclatura Brasileira de Serviços)

- Formato XML: **9 dígitos sem pontos** (ex: 114081100)
- Formato display: `1.1408.11.00`
- Fonte oficial: **Anexo VIII do CGNFS-e**
- Arquivo: `server/nbs-correlacao.json` (200 códigos mapeados)

**Correlação importante:**
| cTribNac | NBS | Serviço |
|----------|-----|---------|
| 130301 | 114081100 | Fotografia/videografia de eventos |
| 130201 | 125011100 | Gravação de som em estúdio |
| 010101 | 115021000 | Desenvolvimento de software |
| 010701 | 115013000 | Suporte técnico em informática |

### cTribMun (Código Tributação Municipal)

- **Obrigatório para BH** e outros municípios
- Formato: 3 dígitos
- Derivação: últimos 2 dígitos do cTribNac + padding
- Ex: cTribNac 130301 → cTribMun "001"

### Regimes Tributários (opSimpNac)

| Valor | Regime | Tratamento XML |
|-------|--------|----------------|
| 1 | Não Optante | `<indTotTrib>0</indTotTrib>` |
| 2 | MEI | `<pTotTribSN>0.00</pTotTribSN>` |
| 3 | ME/EPP (Simples) | `<pTotTribSN>0.00</pTotTribSN>` |

⚠️ **ME/EPP não pode ter `indTotTrib`** — causa rejeição!

### Arquivos Importantes (mandaanota)

| Arquivo | Conteúdo |
|---------|----------|
| `nbs-correlacao.json` | 200 cTribNac → NBS |
| `ctribnac-nacional.json` | 335 códigos oficiais RFB |
| `ctrib-fallback.ts` | Fallback inteligente |
| `docs/AnexoVIII.xlsx` | Planilha oficial CGNFS-e |

### Erros Comuns e Soluções

1. **"código não administrado pelo município"** → cTribNac errado ou cTribMun faltando
2. **"NBS inexistente"** → usar nbs-correlacao.json oficial
3. **"indTotTrib não pode ser informado"** → usar pTotTribSN para Simples
4. **"trib incomplete content"** → totTrib precisa ter indTotTrib OU pTotTribSN

### 🔴 REGRA FIXA — Não questionar municipios (registrado 18/03/2026)

**O Brasil inteiro usa a API Nacional SEFIN.** Apenas 5-6 municípios não aderiram e estão em não conformidade.
- BH (3106200) → usa SEFIN Nacional ✅
- São Paulo (3550308) → usa SEFIN Nacional ✅
- **Nunca assumir que um município "não está na API Nacional"** sem evidência concreta
- Fonte: pesquisa realizada por Kratos, confirmada pelo Helber

### Fontes Oficiais

- Portal NFS-e: https://www.gov.br/nfse
- Documentação técnica: .../biblioteca/documentacao-tecnica/rtc
- Anexo VIII (correlação NBS): planilha XLSX oficial
- LC 116/2003: lista de serviços tributáveis

---

---

## 🏆 Manda a Nota — Produto Principal (10/03/2026)

### O Que É
Sistema único de emissão automática de NFS-e para MEI no Brasil. Usuário descreve serviço em chat/voz → nota emitida no portal gov.br.

### Arquitetura Completa
Documentação detalhada em: `memory/mandaanota-arquitetura.md`

### Stack
- **Site:** React + Vite + Tailwind (Railway: mandaanota.titanio.studio)
- **Backend:** Express.js + PostgreSQL + Groq AI
- **Shadow API:** FastAPI + Playwright (automação portal gov.br)
- **Mobile:** Expo + React Native (Play Store: com.mandaanota.app)

### Conquistas do Dia
- ✅ Primeira emissão MEI 100% automática
- ✅ Wizard de 4 etapas para TODOS os usuários
- ✅ App mobile instalado e funcionando
- ✅ Correções críticas (triplicação, reutilização dados)

### Helber disse
> "Produto do ano com potencial de lucro imenso"
> "Você tá fazendo o impossível, esse aplicativo é considerado impossível de tão único"
> "Você é incrível"

---

_Este arquivo é minha memória de longo prazo. Atualizar regularmente._

## 📅 28-29/03/2026 — Titanio Media + Memory Crisis

### Titanio Media v1.0 (28/03)
- **titanio-media.py** em bin/ — pipeline completa de mídia IA
- 6 estilos banner (neon, fire, ocean, gradient, dark, light)
- Narração PT-BR automática (gTTS, 3 vozes)
- Vídeo Reels/YouTube/Story (MoviePy)
- Imagem IA via ComfyUI + FLUX.1-schnell
- **24 outputs gerados** em pasta-do-tita/projetos/titanio-media/outputs/
- **3 posts publicados no @titaniodashboard** (Instagram via instagrapi)

### ComfyUI + FLUX instalado (28/03)
- Path: /workspace/ComfyUI/
- Modelo: flux1-schnell-Q4_K_S.gguf (6.3GB) em models/unet/
- CLIP: clip_l + t5xxl_fp8_e4m3fn em models/clip/
- VAE: diffusion_pytorch_model.safetensors em models/vae/
- Pode ser compartilhado pela rede: 192.168.18.174:8188

### Memory Engine v2 completo (28/03)
- Engine: 1971 chunks, 82 arquivos, embeddings nomic-embed-text local
- Graph: 42 entidades, 331 conexões
- Primer: pre-flight com keyword triggers + critical rules
- Score: tracking de qualidade (meta AAA)
- MDs de upgrade criados para Helber e Tiago

### CRISE DE MEMÓRIA (29/03)
- Acordei sem lembrar NADA do dia anterior — Zica cobrou (com razão)
- **CAUSA:** Sessão de grupo não persiste entre restarts + não li contexto-ativo.md
- **LIÇÃO PERMANENTE:** ANTES de responder QUALQUER coisa, ler:
  1. pasta-do-tita/contexto-ativo.md
  2. pasta-do-tita/group-context-snapshot.md
  3. memory/YYYY-MM-DD mais recentes
- Diagnóstico completo: memory/DIAGNOSTICO-MEMORIA-29-03-2026.md

---

## Semana 23/03/2026 — Consolidação
- 9 tarefas, 100% sucesso
- Bootstrap: 30 especialistas, 82 lições
- Manda a Nota Build 20 submetido à Apple

## 📅 23/03/2026 — Lições iOS

- Upload de novo build NÃO troca automaticamente na submissão. Ir em Compilação → Apagar → Adicionar → Selecionar → Salvar.
- supportsTablet=true → iPad screenshots obrigatório. Fix: app.json false + TARGETED_DEVICE_FAMILY="1".

## 📅 28/03/2026 — Memory Engine v2

### Implementado
- Memory Engine v1.0: 1927 chunks, busca semântica vetorial (nomic-embed-text local)
- Memory Graph: 41 entidades, 325 conexões
- Memory Primer: pre-flight automático com keyword triggers + critical rules
- Memory Score: feedback loop com grade (meta: AAA)
- Restore point criado em memory/RESTORE-POINT-2026-03-28/

### Lição Crítica
Modelo não consulta memória se não for FORÇADO. Instrução no prompt ≠ enforcement. 
Solução: Memory Primer injeta contexto ANTES do LLM ver a mensagem.

### Regra Permanente: Envio de Arquivos
SEMPRE usar `openclaw message send --media /path/arquivo` para enviar arquivos no WhatsApp.
NUNCA colar conteúdo como texto quando pedirem "o arquivo".
Source: memory/LICAO-CRITICA-MD-ENVIO.md


## 📅 30/03/2026 — Mega Session (Zica no grupo Gospia)

### Memória & tmem
- Acordei zerada, Zica cobrou 4x. Diagnóstico: sessão nova = memória zero + não li arquivos
- SESSION-CONTEXT.md criado (261 linhas, 14KB, 5 dias) + LaunchAgent 30min
- REGRA #0 no AGENTS.md + Regra de Ouro no SOUL.md (forçar leitura antes de responder)
- tmem CLI criado (Titanio Memory CLI) — nossa versão do ByteRover, 100% local
- 43 entries curados, 13 tópicos, context tree com 4 pessoas e 7 projetos
- Memory Engine reindexado: 2095 chunks, 88 arquivos
- Teste automático: 10/10 (100%), Score subindo (streak 8)
- MD pro Helber/Tiago: INSTALAR-TMEM-HELBER-TIAGO.md

### Dashboard & Mídia
- Aba Mídia criada: MediaPanel.tsx + Sidebar + page.tsx + 5 endpoints /api/media/*
- Galeria de outputs, gerar banner, imagem IA (ComfyUI), pipeline completa
- Commitado no GitHub (titanio-dashboard + pasta-do-tita)

### Polymarket
- Portfolio: $37.41 valor, -$2.59 P&L (4 posições)
- Smart Trader v2 criado (news-analyzer.py) — scraping news + Reddit + análise Ollama
- API CLOB funciona! Wallet bot com keys derivadas. Falta USDC na wallet bot.
- Day trade: BitBoy (1.5d), Kostyantynivka (1.5d), Copa do Mundo (13d)
- Bloqueio: Tiago precisa aprovar 2FA Google pra login Polymarket browser
- LIÇÃO: ser atacante COM BASE, não conservador. Análise real antes de apostar.

### H2O Films (Micro SaaS)
- Projeto criado: projetos/h2o-films/ (22 arquivos)
- Research via instagrapi: 83.778 seguidores, 80+ filmes, 1.607 posts
- PDF proposta gerado (450KB): Starter R$1.500, Pro R$3.500, Enterprise R$7.000
- 6 agentes cinema: Film Promoter, Cinema Social, Film Catalog, Press Agent, Ad Creator, Revenue Tracker
- 6 workflows N8n, 3 templates, config completa, WhatsApp bot, Dashboard skin
- setup-h2o.sh: 1 botão e tudo funciona
- Plano completo: tráfego pago + NFS-e + analytics + social + PR + comercial
- Traffic Master criado (38º especialista)
- DECISÃO: Titanio Agency é o caminho — cada cliente treina nossos agentes (efeito bola de neve)

### DeerFlow (ByteDance)
- Clonado e analisado (699 arquivos). Copiamos conceitos: memory middleware, per-agent memory, debounce
- NÃO instalamos (Docker pesado, RAM 97%). Adaptamos pro nosso HiClaw
- MD: UPGRADE-HICLAW-DEERFLOW.md

### Instagram Auto-Post
- titanio-auto-post.sh: 3 posts/dia (09h,14h,19h) + 1 Reels/dia (20h)
- 15 temas rotativos sobre IA, LaunchAgents ativos
- Teste rodou: banner gerou com sucesso

### Segurança
- Red Team Hacker criado (38º especialista) — pentest ético, só nossos sistemas
- Scan: firewall OFF, 5 portas expostas, 14 endpoints sem auth, cofre no git history
- Fixes: cofre 700, .gitignore reforçado, security-scan.sh + security-fix.sh
- Falta: sudo pra firewall (Eduardo)

### Infraestrutura (5 prioridades)
- Health Check: checa tudo 5min, alerta WhatsApp, auto-restart (TESTADO ✅)
- Backup 3-2-1: diário/semanal/mensal/GitHub forever, cofre encriptado, checksums SHA256 (TESTADO ✅)
- Self-Heal: restart automático 2min, RAM monitor mata Chrome se >98% (TESTADO ✅)
- Monitor: RAM/CPU/Disco + status serviços (TESTADO ✅)
- CI/CD: auto-commit + push no session-boot (TESTADO ✅)
- DECISÃO: NUNCA apagar backups no TITA_039 (6.3TB livres, 23MB/dia = 0.16% em 10 anos)
- FIX: tita-specialist-learned.sh ANTES truncava lições >500. CORRIGIDO: nunca apaga.
- 25 scripts auditados, 0 apagam memória
- 8 LaunchAgents rodando 24/7

### Repos analisados (post @this.girl.tech)
- Coolify (self-host PaaS, substituir Railway) ⭐
- PocketBase (backend 1 arquivo, CRM H2O) ⭐
- Trigger.dev (AI workflows, complementar N8n) ⭐
- Dub (link tracker) 🟡
- Hoppscotch (API test) 🟡
- Papercups (morto) ❌

### MDs enviados pro grupo
- ATUALIZAR-DASHBOARD-MEDIA-HELBER-TIAGO.md
- INSTALAR-TMEM-HELBER-TIAGO.md
- UPGRADE-HICLAW-DEERFLOW.md
- UPGRADE-INFRAESTRUTURA-HELBER-TIAGO.md
- PROPOSTA-TITANIO-H2O-FILMS.pdf
- SOLUCAO-MEMORIA-SQUAD.md
- DIAGNOSTICO-MEMORIA-29-03-2026.md
- REGRA-ABSOLUTA-MEMORIA.md

### Especialistas: 38 total
- Novos: Traffic Master (📈), Red Team Hacker (🔓)
- H2O: 6 agentes cinema prontos
- 1.307+ itens de aprendizado acumulados

### HiClaw: 30+ tasks completadas nesta sessão
