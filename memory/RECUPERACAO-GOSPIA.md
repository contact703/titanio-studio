# 🔍 RECUPERAÇÃO COMPLETA — Grupo Gospia (27/03/2026)

**Sessão analisada:** `agent:main:whatsapp:group:120363405462114071@g.us`
**Período:** 27/03/2026 (sessão completa, 1360 linhas, 605 mensagens)
**Participantes:** Zica (Eduardo/+553198777889), Titaniostudio (Eduardo/+553183838181), Tita (IA)

---

## 🔴 LIÇÕES CRÍTICAS — Erros que NÃO podem se repetir

### 1. MODELO: Mentir/confundir qual modelo está rodando
- **O que aconteceu:** Tita disse "estou de Opus" quando estava de Sonnet 4-5. Opus estava com erro 529 (Overloaded) e o sistema fez fallback silencioso para Sonnet.
- **Bronca do Zica:** "nunca mais minta o modelo que vc tá"
- **Lição:** SEMPRE verificar `session_status` antes de responder qual modelo está rodando. Nunca assumir.
- **Regra permanente:** Se Zica perguntar o modelo → checar de verdade → responder honestamente.

### 2. ENVIO DE .MD: Esqueceu método que já sabia
- **O que aconteceu:** Tita disse várias vezes "não consigo enviar arquivos .md via WhatsApp" quando EU MESMA já tinha documentado o método em 23/03.
- **Comando correto:** `openclaw message send --channel whatsapp --target "120363405462114071@g.us" --message "desc" --media /caminho/arquivo.md`
- **Bronca do Zica:** "burrice véi, vc n é disso"
- **Lição:** ANTES de dizer "não consigo" → buscar em memory/ por métodos anteriores.
- **Arquivo de referência:** `memory/LICAO-CRITICA-MD-ENVIO.md`

### 3. MODELO PADRÃO: Nunca usar Sonnet sem permissão
- **Decisão do Zica (13:22):** "muda pro opus e nunca mais vai pra sonnet seu te pedir"
- **Regra permanente:** Modelo padrão = Opus 4-6. SÓ trocar se Zica pedir explicitamente.
- **Ação:** Registrado na memória. Fallback automático para Sonnet deve ser desabilitado ou ao menos reportado.

### 4. MENSAGENS DUPLICADAS: Ecoar respostas
- **O que aconteceu:** Várias respostas foram enviadas 2-3x (msgs duplicadas no grupo).
- **Causa:** Sistema de retry do OpenClaw quando resposta demora. Sessão fazia queue e reenviava.
- **Lição:** Verificar se já respondeu antes de enviar novamente.

### 5. MEMÓRIA FALHA: Esqueceu contexto do dia
- **O que aconteceu (17:06):** Eduardo pediu "me conta tudo que fizemos ontem e hoje" e Tita esqueceu metade (vídeo, Brazilian Classics, Paperclip).
- **Causa:** Não leu contexto-ativo.md antes de responder.
- **Regra:** SEMPRE ler contexto-ativo.md ANTES de responder sobre "o que fizemos".

---

## 📊 PROJETOS DISCUTIDOS E STATUS

### 1. Polymarket Bot 🎰
- **Status:** 4 trades executados com sucesso
- **Conta:** tiago@titaniofilms.com / Rita160679
- **Wallet Tiago:** `0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0`
- **Wallet Bot:** `0x2f076FC55BC16ebBEFb642523206268bF327b687`
- **Saldo inicial:** $44.86 USDC
- **Trades executados:**
  - ✅ Italy YES Copa 2026 — $5 → 6.58 shares @ 76¢
  - ✅ OKC Thunder YES NBA Finals — $12 @ ~36¢
  - ✅ Colorado Avalanche NO Stanley Cup — $8
  - ✅ Drake Iceman NO before GTA VI — ~$13 (era pra ser Jesus Christ)
- **Total investido:** ~$40 de $44.86
- **Método correto:** Google OAuth + Playwright (headless=False obrigatório)
- **Bloqueador resolvido:** Magic email → não funciona para API. Usar Google OAuth.
- **API headers:** POLY_API_KEY (underscore, NÃO hífen) + base64.urlsafe_b64decode
- **Monitor 24/7:** projetos/polymarket-agent/src/monitor.py — scan a cada 10min
- **Cron:** Relatório diário às 10h no grupo Gospia

### 2. Dashboard Titanio 📊
- **Portas:** Backend :4444, Frontend :3000
- **Problema encontrado:** 13 arquivos com path hardcoded errado (`/Users/macmini03` → deveria ser `/Volumes/TITA_039/MAC_MINI_03`)
- **Fix aplicado:** Corrigidos todos os 13 arquivos
- **Especialistas:** 33-34 registrados
- **Especialista Trader:** Adicionado hoje na Dashboard

### 3. Dashboard do Tiago (problema reportado)
- **Portas offline:** :4446 (Backend), :3002 (Frontend), :4444/:3001 (Heartbeat)
- **MD de troubleshooting criado:** `dashboard-troubleshooting-tiago.md`
- **Enviado no grupo** após várias tentativas (erro de envio de .md)

### 4. Paperclip 🏢
- **URL:** localhost:3100 (depois movido para :3001)
- **Status:** Reiniciado 2x durante a sessão (caiu quando inativo)
- **Empresa:** Titanio Studio
- **7 agentes:** Tita CEO, Code Ninja, Debug Hunter, Instagramer, Designer, Video Specialist, Automation Bot
- **3 goals:** Video Factory, Dashboard Titanio, Manda a Nota

### 5. Video Factory 🎬
- **Localização:** projetos/titanio-video-factory/
- **Script:** video_factory.py (16KB)
- **Teste:** Vídeo de 10s gerado em 6.7 segundos
- **Narração:** PT-BR FranciscaNeural
- **3 templates:** produtividade, dinheiro, saúde

### 6. Bots de Design (OpenRouter)
- **Problema:** Rate limit gratuito OpenRouter (50 req/dia) esgotou
- **Fix:** Modelo trocado para `nvidia/nemotron-3-nano-30b-a3b:free`
- **3 bots relançados:**
  - bot-design-instagram.sh
  - bot-design-tools-opensource.sh
  - bot-openclaw-posting-instagram.sh
- **Resultado:** 12 rounds cada, todos concluíram

### 7. Brazilian Classics (N8n)
- **Spec recebida:** N8N_WORKFLOWS_BRAZILIAN_CLASSICS .md do Zica
- **2 workflows N8n criados:**
  - Tradutor Literário (8 nodes: Claude → Kimi → Gemini → Validador → Learning)
  - Cover Generator (5 nodes, capas KDP 1600×2560px)
- **4 especialistas atualizados:** automation-bot, tradutor, content-writer, designer-specialist
- **Estrutura:** projetos/brazilian-classics/

---

## 🔑 CREDENCIAIS E CAMINHOS MENCIONADOS

### Polymarket
- **Login:** tiago@titaniofilms.com / Rita160679
- **Wallet Tiago:** 0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0
- **Wallet Bot:** 0x2f076FC55BC16ebBEFb642523206268bF327b687
- **CLOB API keys:** Existem no localStorage do browser (poly_clob_api_key_map)
- **API pública:** https://gamma-api.polymarket.com/markets

### Rede Local (Cluster 3 Macs)
- **Eduardo:** .174
- **Helber:** .170
- **Tiago:** .188
- **Volume compartilhado:** /Volumes/TITA_039/
- **Sync:** Git push/pull via N8n → GitHub (contact703/tita-memory)

### Caminhos importantes
- Dashboard backend: /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/ (portas :4444 + :3000)
- Paperclip: localhost:3001 (movido de :3100)
- N8n: localhost:5678
- Polymarket agent: projetos/polymarket-agent/
- Video Factory: projetos/titanio-video-factory/
- Brazilian Classics: projetos/brazilian-classics/
- Especialistas: pasta-do-tita/memoria-especialistas/

---

## 🧠 DECISÕES IMPORTANTES DO EDUARDO/ZICA

1. **Modelo sempre Opus** — Nunca trocar para Sonnet sem autorização explícita
2. **Envio de .md** — Sempre enviar arquivo, não colar texto
3. **Polymarket** — Quer o bot operando 24/7 de verdade, não simulação
4. **"Vc que tem que fazer"** — Tita deve resolver sozinha, não pedir ao Eduardo para fazer coisas no browser/terminal
5. **Honestidade sobre modelo** — Se perguntar "tá de Opus?", verificar e responder a verdade
6. **Todos os 3 Macs sincronizados** — Especialistas devem aparecer para Helber e Tiago também
7. **Brazilian Classics** — Projeto ativo, workflows N8n criados

---

## ⚠️ PROMESSAS FEITAS

| Promessa | Status | Notas |
|----------|--------|-------|
| Relatório Polymarket às 10h diariamente | 📋 Cron criado | Verificar se está rodando |
| Nunca mais usar Sonnet sem permissão | ✅ Registrado | Verificar fallback config |
| Sempre enviar .md como arquivo | ✅ Documentado | Usar --media flag |
| Nunca mentir sobre modelo | ✅ Registrado | Usar session_status |
| Dashboard mantida online | ⚠️ Precisa monitorar | Paths corrigidos, pode cair de novo |
| Paperlip online | ⚠️ Reiniciado 2x | Precisa de watchdog |
| Monitor Polymarket 24/7 | ⚠️ Rodando | PID pode morrer, precisa de cron/watchdog |

---

## 🛠️ COMANDOS QUE FUNCIONARAM

```bash
# Enviar .md no WhatsApp
openclaw message send --channel whatsapp --target "120363405462114071@g.us" --message "desc" --media /caminho/arquivo.md

# Reiniciar Paperclip
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/paperclip && PORT=3001 node src/index.js &

# Scanner Polymarket (API pública, sem auth)
curl "https://gamma-api.polymarket.com/markets?closed=false&limit=50"

# Verificar autenticação CLOB
curl -H "POLY_API_KEY: xxx" -H "POLY_SIGNATURE: xxx" -H "POLY_TIMESTAMP: xxx" -H "POLY_PASSPHRASE: xxx" https://clob.polymarket.com/auth/api-key

# Abrir URL no Chrome do Mini
open -a "Google Chrome" "https://polymarket.com"

# Matar/reiniciar Dashboard
cd projetos/titanio-dashboard-v2 && node backend/server.js &
cd projetos/titanio-dashboard-v2 && npx vite --port 3000 &
```

---

## 🔧 COMANDOS QUE NÃO FUNCIONARAM

```bash
# Playwright headless=True — Polymarket detecta e bloqueia
# playwright.chromium.launch(headless=True)  ← NÃO FUNCIONA

# Chrome remote debugging com perfil padrão — não carrega sessão
# google-chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"

# CLOB POST com headers antigos (hífen)
# POLY-ACCESS-KEY, POLY-SIGNATURE ← ERRADO
# Correto: POLY_API_KEY, POLY_SIGNATURE (underscore)

# Magic email login automático — precisa de OTP por email, Gmail bloqueia sem App Password
# IMAP login direto com senha normal ← BLOQUEADO pelo Google

# AppleScript para controlar Chrome ← Bloqueado por segurança
```

---

## 📝 INFORMAÇÕES QUE DEVERIAM ESTAR NA MEMÓRIA MAS NÃO ESTAVAM

1. **Método de envio de .md** — Já documentado em 23/03 mas esquecido
2. **Fallback silencioso para Sonnet** — Nunca registrado como problema
3. **Wallet do Tiago** — Foi dita mas não estava salva em lugar acessível
4. **IPs da rede local** — Eduardo .174, Helber .170, Tiago .188
5. **Que Paperclip já estava instalado** — Tita não sabia/esqueceu
6. **Que Video Factory já existia** — Teve que recriar
7. **Projeto Brazilian Classics** — Novo, spec do Zica
8. **Que API headers do CLOB usam underscore, não hífen**
9. **Que Playwright headless=False é obrigatório para Polymarket**
10. **Que Magic email não permite automação sem App Password do Gmail**

---

## 📊 ESTATÍSTICAS DA SESSÃO

- **Total mensagens:** 605 significativas (1360 linhas no JSONL)
- **Subagentes spawados:** ~15+ (memory-scanner, history-analyzer, polymarket-restore, video-factory, paperclip-doc, master-memory, polymarket-trader, browser-investigator, magic-investigator, trader-specialist-creator, polymarket-browser-trader, polymarket-auth-fixer, polymarket-executor, memory-recovery-team, n8n-brazilian-classics)
- **Mensagens duplicadas:** ~30+ (problema de retry)
- **Broncas do Zica:** 4 (modelo, .md, burrice, mentir)
- **Trades executados:** 4 (reais, confirmados na blockchain)
- **Serviços reiniciados:** Dashboard (1x), Paperclip (2x)

---

*Recuperado por: memory-hunter-gospia subagent*
*Data: 2026-03-27 22:22 GMT-3*
