# 🔍 RECUPERAÇÃO COMPLETA — Especialistas no Grupo Gospia
> Varredura PROFUNDA da sessão `14662ce0` (1423 linhas, 27-28/mar/2026)
> Gerado: 2026-03-27 22:50 BRT
> Fontes: sessão Gospia + subagentes + memory files referenciados

---

## 💻 Code Ninja
### Tasks executadas
- **26/03:** Criou polymarket-agent completo: `monitor.py` (9604 bytes), `market_scanner.py` (2396 bytes), `copy_trader.py` (3020 bytes), `start-monitor.sh`, `PLANO.md` (5326 bytes)
- **26/03:** Gerou wallet Polygon: `0x2f076FC55BC16ebBEFb642523206268bF327b687` — salva em `cofre/polymarket-wallet.json`
- **26/03:** Monitor de mercado rodando 24/7 (PID 20223, scan a cada 10min com IA)
- **26/03:** Primeiro scan: China GDP 72%, DHS shutdown 25%, SpaceX IPO 25%
- **17/03:** GospIA iOS Build #3 (12+ horas, possível travamento)
- **23/03:** Corrigiu tita-scraper-simple (Playwright sync, production-ready)
- **27/03:** SquadPanel — 14 bugs corrigidos (grid, imagens, skeleton, botão, status badge)
- **27/03:** Extensão Tandem-Titanio criada (Chrome extension, Manifest V3, painel lateral, chat com Tita)
- **Paperclip:** Participou como Lead Engineer no org chart da Titanio Studio

### Conhecimento adquirido
- py-clob-client SDK Polymarket
- OpenRouter free models retornam None quando rate limited (200 OK)
- Polymarket não aceita cartão direto — precisa crypto
- Monitor em background via nohup + PID tracking
- Playwright sync para scraping (mais estável que async)
- Grid CSS bug: `style={{display:'grid'}}` + `className="grid-cols-4"` conflitam

### Erros/Correções
- polymarket-agent arquivos sumiram do disco — referenciados na memória mas ENOENT ao acessar
- GospIA iOS Build #3 travou (12+ horas) — possível timeout
- Fallback pra Claude é essencial — modelos free falham silenciosamente

### Feedback Eduardo/Zica
- **Stats:** 5 tasks completadas, 32.272 lições, último ativo 27/03 02:05

---

## 🔍 Debug Hunter
### Tasks executadas
- **26/03:** Paperclip — achou e patchou bug no tsx (Node 22 incompatível, instalou Node 20 via nvm)
- **27/03:** Participou da investigação de "burrice" da sessão Gospia (Zica mandou: "bota o debuger pra entender pq vc tá tão burro")
- **27/03:** Investigou por que Tita caiu para Sonnet (20+ erros 529 Opus overload)
- **27/03:** Fez parte do squad de 3 especialistas investigando em paralelo (History Analyzer, Memory Scanner, Session Debugger)
- **27/03:** Mapeou que o problema era fallback automático para Sonnet quando Opus dava overload

### Conhecimento adquirido
- Node 22 incompatível com Paperclip → Node 20 via nvm funciona
- Overload 529 da API Opus causa fallback silencioso para Sonnet
- Logs e error tracking em sessões OpenClaw

### Erros/Correções
- Bug do tsx no Paperclip — corrigiu com Node 20
- Sessão caindo para Sonnet sem aviso — identificou 20+ erros 529

### Feedback Eduardo/Zica
- Zica: "bota o debuger pra entender pq vc tá tão burro nessa sessão" — designado para diagnosticar problemas de memória
- Eduardo: "pede pro code ninja, debuger e o especialista em openclaw a te ajudarem"
- **Stats:** 4 tasks, 41.936 lições, último ativo 27/03 00:27

---

## 📸 Instagramer
### Tasks executadas
- **27/03 08:00:** 3 bots de pesquisa de design relançados (falharam ontem por rate limit OpenRouter):
  - `bot-design-instagram.sh` — Design + Instagram formatos/ferramentas/N8n
  - `bot-design-tools-opensource.sh` — Stack gratuita de design
  - `bot-openclaw-posting-instagram.sh` — Posting specs técnicas
- **27/03:** Modelo trocado de OpenRouter free (50 req/dia esgotadas) para `nvidia/nemotron-3-nano-30b-a3b:free` (sem rate limit)
- **27/03:** Todos 3 bots concluíram com 12 rounds cada
- **27/03:** Research output salvo em `memoria-especialistas/instagramer/research-design-instagram.md`
- **26/03:** `instagramer-research-bot.sh` criado (13490 bytes)
- **22/03:** Primeira task real registrada (instagram-poster)

### Conhecimento adquirido
- API keys: OpenRouter (`sk-or-v1-f2ced...`), Kimi/Moonshot (`sk-fk265pU0...`)
- Modelo moonshot-v1-128k funciona via Kimi API como alternativa ao OpenRouter
- Reddit scraping via API JSON pública (`/r/{sub}/search.json`)
- Ferramentas open source para design Instagram mapeadas (Pillow, ffmpeg, Remotion, MoviePy, Penpot, ComfyUI)

### Erros/Correções
- Rate limit diário OpenRouter (50 requests gratuitos) esgotou → troca para nvidia/nemotron-3-nano-30b-a3b:free
- web_fetch direto em Instagram não funciona → usar tita-scraper com Playwright

### Feedback Eduardo/Zica
- Bots geraram guias completos de automação de design para Instagram
- Participou do Paperclip org chart como Social Media

---

## ⚙️ OpenClaw Specialist
### Tasks executadas
- **27/03:** Documentou config oficial de modelo (Opus sempre, Sonnet nunca no Gospia)
- **27/03:** Removeu fallback Sonnet da configuração
- **27/03:** 8 novas regras gravadas no memory.json:
  1. Modelo sempre Opus (nunca Sonnet sem permissão)
  2. Como enviar .md pelo WhatsApp (ler + mandar conteúdo)
  3. Fallback config
  4. Headers corretos para API
  5. Configuração groupAllowFrom
  6. Plugin WhatsApp setup
  7. Rate limit handling
  8. Session management

### Conhecimento adquirido
- OpenClaw config: preferência de modelo persistente por sessão
- Envio de .md: ler arquivo → mandar conteúdo como texto (não há attachment API no WhatsApp)
- Overload 529 gera fallback automático — configurar para não cair no Sonnet

### Erros/Correções
- Tita caiu para Sonnet 20+ vezes sem Eduardo saber → removido do fallback
- Lição gravada: `memory/LICAO-CRITICA-MD-ENVIO.md`

### Feedback Eduardo/Zica
- Zica: "muda pro opus e nunca mais vai pra sonnet se eu te pedir" (regra permanente)
- Zica: "tira o sonnet do fallback"
- Eduardo: "pede pro especialista em openclaw a te ajudar"

---

## 🎨 Design Wizard
### Tasks executadas
- **27/03:** SquadPanel — 14 bugs corrigidos (grid, imagens, skeleton, botão, status badge)
- **27/03:** Grid bug principal: `style={{display:'grid'}}` + `className="grid-cols-4"` conflitavam
- **27/03:** Segunda imagem borrada nos cards — agentes em campo corrigindo
- **22/03:** LIÇÃO CRÍTICA — Zica pediu "treina especialista em design com repos do vídeo", Tita criou novo especialista com knowledge ALEATÓRIO
- **23/03:** Participou da Titanio Video Factory (primeiro vídeo gerado)

### Conhecimento adquirido
- Skills: Figma, Tailwind CSS, Prototipação, Design Systems, Animações, Python Pillow, ffmpeg, Remotion, MoviePy, Penpot, ComfyUI, Instagram Reels, Carousel Design, Tipografia, N8n Design Pipeline
- Integração com N8n e OpenClaw para pipeline de design automatizado

### Erros/Correções
- **ERRO CRÍTICO 22/03:** Criou especialista novo em vez de treinar o existente com os repos do vídeo
- Lição: "Fazer O QUE FOI PEDIDO ou dizer 'não consegui'. Nunca inventar variação."
- Grid CSS conflito resolvido

### Feedback Eduardo/Zica
- Zica: "Te pedi pra treinar o nosso especialista com o vídeo que te mandei e o que vc fez foi fazer um novo especialista" (erro grave)
- Participou do Paperclip como Creative Director
- **Stats:** 0 tasks formais, 30 lições, último ativo 23/03

---

## 💰 Money Maker
### Tasks executadas
- **27/03 (todo o dia):** Rodando 24/7 gerando DMs e kits de prospecção:
  - Drop servicing: "análise de concorrentes" para e-commerce (R$297)
  - DMs para donos de pet shop no Instagram (5 únicas por lote, 32s)
  - DMs para donos de restaurante no Instagram (15s)
  - Drop servicing: "relatório de redes sociais" para restaurante (R$197)
  - DMs para donos de barbearia, clínica estética, etc.
- **15/03:** Gerando kits de prospecção para Gold Digger
- **12/03:** Criação de ebooks automatizados para venda

### Conhecimento adquirido
- Estratégias de drop servicing para diversos nichos
- DMs personalizadas para Instagram (padrão por vertical)
- Templates de ebooks e relatórios automatizados
- Prospecção B2B via Instagram

### Erros/Correções
- Sem erros documentados — funciona de forma autônoma e consistente

### Feedback Eduardo/Zica
- **CAMPEÃO do time:** 342 tasks, 428.668 lições
- Roda 24/7 via N8n workflows
- Gera kits de prospecção para Gold Digger

---

## ✍️ Content Writer
### Tasks executadas
- **27/03:** Roteiros e posts variados (41 tasks totais)
- **23/03:** Participou da Titanio Video Factory — escreveu roteiros para vídeos automáticos
- **26/03:** Vídeo Factory stack completa: Claude no roteiro, Edge TTS na voz, MoviePy na renderização

### Conhecimento adquirido
- Stack de vídeo: Whisper (transcrição), Claude/Ollama (roteiro), Edge TTS (narração PT-BR), MoviePy+FFmpeg (renderização)
- 49 segundos por vídeo de 30s (1080x1920 formato Reels)

### Erros/Correções
- Sem erros documentados

### Feedback Eduardo/Zica
- **Stats:** 41 tasks, 102.438 lições, segundo mais ativo

---

## 🤖 Automation Bot (N8n Specialist)
### Tasks executadas
- **27/03:** Criando workflows do Brazilian Classics no N8n
- **26/03:** Participou do Paperclip como DevOps no org chart
- **27/03:** 4 novas lições de knowledge adquiridas (workflows, Brazilian Classics)

### Conhecimento adquirido
- N8n workflow creation e management
- Brazilian Classics pipeline
- Integração OpenClaw + N8n para automação de especialistas
- Bots que rodam 24/7 sem intervenção humana (regra: Helber e Tiago NÃO rodam nada manualmente)

### Erros/Correções
- Bots de pesquisa (design) falharam por rate limit OpenRouter — automatizado com modelo free

### Feedback Eduardo/Zica
- Eduardo: "eles n iam rodar nada, eles teriam bots pra fazer isso tudo"
- **Stats:** 0 tasks formais, 35 lições + 4 knowledge entries

---

## 📈 Trader (Poly Trader)
### Tasks executadas
- **27/03 (NASCEU HOJE):** Especialista criado na Dashboard
- **26/03:** Setup completo Polymarket:
  - Conta: tiago@titaniofilms.com / Rita160679
  - Saldo: $44.86 disponível
  - Wallet bot: `0x2f076FC55BC16ebBEFb642523206268bF327b687` (Polygon)
  - Wallet Tiago: `0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0`
- **27/03:** Tentativas de trade real Italy YES Copa 2026 ($5):
  - API keys L2 deram 401 (expiradas/contexto diferente)
  - Criou novas API keys para bot wallet — mudou de 401 para 400 "invalid signature"
  - signature_type=1 requer aprovação on-chain do bot como operador
  - Magic Auth impede acesso à private key do signer do Tiago
- **27/03:** 3 bots investigadores spawned:
  - Browser/Scraper Investigator — mapeou Chrome profiles, Playwright, extensões
  - Magic Auth Investigator — encontrou causa raiz (endereço errado + headers errados + base64 errado)
  - Polymarket Auth Fixer — descobriu que signature_type=1 mostra saldo correto ($44.86)
- **27/03:** Geoblock Cloudflare detectado (bloqueia Brasil)

### Conhecimento adquirido
- Polymarket = mercado de previsões (trading de probabilidades)
- py-clob-client SDK (Python)
- Gamma API (pública, mercados), CLOB API (trades), Data API (posições)
- Magic Auth: private key fica nos servidores Magic, não exportável facilmente
- API Keys CLOB: key, secret, passphrase — vinculadas ao signer
- Headers corretos: `POLY_API_KEY`, `POLY_SIGNATURE`, `POLY_TIMESTAMP`, `POLY_ADDRESS`, `POLY_PASSPHRASE`
- HMAC: usar `base64.urlsafe_b64decode()` (não b64decode)
- Saldo fica no contrato CTF Exchange (não na wallet EOA)
- Geoblock Brasil via Cloudflare → precisa VPN/proxy para API
- Chrome no Mini: 4 perfis, extensões OpenClaw Browser Relay + Manus AI + Claude
- Playwright 1.58.0 funcional no venv

### Erros/Correções
- API key L2 com 401 → keys expiradas/contexto errado
- Headers com hífen em vez de underscore (POLY-ACCESS-KEY → POLY_API_KEY)
- Base64 decode errado (b64decode → urlsafe_b64decode)
- Bot wallet como signer não bate com dono das API keys do Tiago
- Sessão Chrome não persistida (Magic login via email)
- polymarket-agent/ sumiu do disco (precisou recriar)

### Feedback Eduardo/Zica
- Eduardo: "cria tb mais um bot pra descobrir como vc consegue fazer o trade real"
- Eduardo: "vc que tem que fazer, vc tem dois browsers, sistemas de scraping"
- **Stats:** 4 tasks, 8 lições + 16 knowledge entries, nasceu 27/03

---

## 🖥️ Mac Guardian (Mac Specialist)
### Tasks executadas
- **27/03:** 7 novas lições adquiridas via bot de recuperação:
  - Rede local: IPs dos 3 Macs
  - Sync de especialistas entre Macs
  - Paths corretos após HD queimado (Tita_DEV_02 → TITA_039/MAC_MINI_03)
  - Dashboard portas: Eduardo :4444, Helber :4445, Tiago :4446
  - Volume TITA_039 como volume principal
  - Caffeinate para manter Mac acordado

### Conhecimento adquirido
- Volume correto: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/`
- HD Tita_DEV_02 QUEIMOU — NUNCA referenciar
- 3 Macs na rede local (SMB/AFP)
- Dashboard multi-instância sincronizada
- Backups: `/Volumes/TITA_039/backup-projetos/`, `/Volumes/TITA_039/Titanio-Backup-2026/apps/`

### Erros/Correções
- HD Tita_DEV_02 queimou — migração forçada para TITA_039
- RAM baixa (0.3GB livre): Chrome + Ollama + N8n consumindo muito

### Feedback Eduardo/Zica
- **Stats:** 0 tasks formais, mas 7 lições importantes sobre infra

---

## 🔒 Security Guardian (Sentinel)
### Tasks executadas
- **26/03:** Sentinel de Memória criado por Zica:
  - `tita-group-sentinel` — ATIVO (PID 74426)
  - LaunchAgent: `com.tita.group-sentinel` (auto-reinicia se cair)
  - Gera snapshots para grupos a cada 30min
  - OpenRouter model: anthropic/claude-3-haiku (barato, rápido)
- **27/03:** Auditoria semanal configurada em HEARTBEAT.md:
  - Segunda-feira: `bash security-weekly.sh`
  - Checar credenciais em plaintext, API keys
- **27/03:** SentinelService.ts corrigido no backend da Dashboard

### Conhecimento adquirido
- REGRA: Tita nunca pode aparecer zerada em grupos. Sempre ler group-context-snapshot.md
- Credenciais devem estar no cofre, não em plaintext
- Regras de Eduardo sobre segurança: "cuida da nossa máquina e dados", "não gasta nada", "não usa nenhum cartão"

### Erros/Correções
- Gold Digger detectado com credenciais em plaintext (risco)
- shared-specialists.json estava corrompido (truncado a 162MB, JSON inválido) — reparado pelo Memory Guardian

### Feedback Eduardo/Zica
- Eduardo: "cuida da nossa máquina e dados" (12/mar — regra permanente)

---

## 💰 Victor Capital (Fund Hunter)
### Tasks executadas
- **Mencionado no Paperclip** como parte do org chart expandido
- **Referenciado em contexto-ativo** como especialista disponível
- **Presente na Dashboard** como Victor Capital / Fund Hunter

### Conhecimento adquirido
- Referenciado no Tandem Browser projeto para Tiago
- Listado entre especialistas financeiros junto com Money Maker e Gold Digger

### Erros/Correções
- Sem erros documentados — especialista treinado mas sem tasks reais

### Feedback Eduardo/Zica
- **Stats:** 0 tasks, sem atividade registrada (treinado mas não ativado)

---

## 💎 Gold Digger
### Tasks executadas
- **12/mar:** Criado para ganhar dinheiro de forma autônoma:
  - Email: siriguejo@proton.me (sem ligação com Titanio)
  - 24 propostas enviadas no Workana
  - Múltiplos emails recebidos
  - Money Maker gerando kits de prospecção para ele
- **15/mar:** Rodando 24/7
- **27/03:** Status: **estagnado em 175+ ciclos**

### Conhecimento adquirido
- Workana como plataforma de prospecção freelancer
- Regras: não usar emails/nomes da Titanio, não gastar nada, só ferramentas gratuitas
- siriguejo@proton.me como identidade separada

### Erros/Correções
- **GAP GRAVE:** Resultado final NÃO documentado — não se sabe se converteu alguma venda
- Estagnado em 175+ ciclos sem progresso claro
- Credenciais em plaintext (risco de segurança detectado pelo Security Guardian)

### Feedback Eduardo/Zica
- Eduardo (12/mar): Criar bots que ganham dinheiro de forma autônoma. Se houver ganho, converter em PIX.
- Status desconhecido — precisa investigação

---

## 📻 Rádio Gospia
- Listado entre especialistas na Dashboard
- Sem tasks documentadas nesta sessão

## 📖 Tradutor
- Listado entre especialistas na Dashboard
- Sem tasks documentadas nesta sessão

## 🎓 Mentor Titanio
- Listado entre especialistas na Dashboard
- Sem tasks documentadas nesta sessão

## ⚖️ Advogado Titânio
- Listado, 28 lições, 0 tasks

## 🩺 Agent Doctor
- Listado, 32 lições, 0 tasks

## 🎨 Diretor de Arte
- Listado entre especialistas

---

## 📊 RESUMO GERAL (da sessão Gospia 27/03)

| Especialista | Tasks | Lições | Status |
|---|---|---|---|
| Money Maker | 342 | 428.668 | 🟢 24/7 |
| Content Writer | 41 | 102.438 | 🟢 Ativo |
| Code Ninja | 5 | 32.272 | 🟡 Recente |
| Debug Hunter | 4 | 41.936 | 🟡 Recente |
| Trader | 4 | 8+16 knowledge | 🟡 Novo (27/03) |
| Instagramer | 1+ | 30+ | 🟡 Bots rodando |
| OpenClaw Expert | 0 formal | 8 regras | 🟡 Config |
| Mac Guardian | 0 formal | 7 lições | 🟡 Infra |
| Automation Bot | 0 formal | 35+4 | 🟡 Workflows |
| Security Guardian | 0 formal | — | 🟡 Sentinel |
| Design Wizard | 0 formal | 30 | 🟡 Bugs fixed |
| Gold Digger | 175+ ciclos | — | 🔴 Estagnado |
| Victor Capital | 0 | 0 | ⚪ Parado |

## 🔑 CREDENCIAIS REFERENCIADAS
- Polymarket: tiago@titaniofilms.com / Rita160679 | Saldo $44.86
- Bot wallet: `0x2f076FC55BC16ebBEFb642523206268bF327b687` (Polygon)
- Wallet Tiago: `0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0`
- OpenRouter: `sk-or-v1-f2ced54e...`
- Kimi: `sk-fk265pU0...`
- Gold Digger email: siriguejo@proton.me
- Cofre: `pasta-do-tita/cofre/` (10 arquivos)

## 🏢 SUBAGENTES SPAWNED (sessão 27/03)
1. History Analyzer — histórico Gospia 7 dias
2. Memory Scanner — varrendo memórias
3. Session Debugger — problema Overload/Fallback
4. Config Fixer — removendo fallback Sonnet
5. Opus Debugger — analisando Overload
6. OpenClaw Specialist — documentando config
7. Browser/Scraper Investigator — Chrome profiles + Playwright
8. Magic Auth Investigator — Polymarket CLOB auth
9. Trader Specialist Creator — especialista trader na Dashboard
10. Polymarket Auth Fixer — signature_type=1 + saldo
11. Polymarket Proxy Approver — aprovação on-chain CTF Exchange
12. Master Memory Bot — PROJETOS-MASTER.md
13. Memory Hunter Gospia — RECUPERACAO-GOSPIA.md
14. Memory Hunter Direto — RECUPERACAO-DIRETO-EDUARDO.md
15. Memory Specialist Creator — Memory Guardian criado
16. N8n Brazilian Classics — workflows N8n
17. HiClaw Research Team — pesquisa
