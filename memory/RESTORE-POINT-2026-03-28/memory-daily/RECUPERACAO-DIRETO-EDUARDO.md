# RECUPERAÇÃO — Histórico Direto com Eduardo (+553183838181)

> Varredura completa de 10 sessões WhatsApp + conversa direta
> Gerado: 2026-03-27 22:22 BRT
> Sessões analisadas: 841f (10/mar), 94907 (13/mar), f3837 (14/mar), 1fb3 (15/mar), 14662 (27/mar), decf3fb9 (24/mar) + 4 sessões menores

---

## 🔴 GAPS IDENTIFICADOS (coisas no histórico que NÃO estão na memória)

### 1. Projeto "Gold Digger" — Teste de Ganhar Dinheiro Autônomo
- **Data:** 12/mar madrugada
- **O que aconteceu:** Eduardo pediu pra criar uma conta Outlook SEM LIGAÇÃO com Titanio. Criar bots que ganham dinheiro de forma autônoma. Email criado: siriguejo@proton.me. Se houver ganho, converter em PIX.
- **Regras:** não usar emails/nomes da Titanio, não gastar nada, só usar ferramentas gratuitas, não entrar em nada que possa ser bloqueado
- **Status em 15/mar:** Gold Digger rodando 24/7, 24 propostas enviadas (Workana), Money Maker gerando kits de prospecção, múltiplos emails recebidos em siriguejo@proton.me
- **GAP:** Resultado final do Gold Digger não está documentado. Não sabemos se converteu alguma venda.
- **Ação:** Verificar status atual do Gold Digger, propostas no Workana, emails recebidos

### 2. Personagens do Nano (avatares dos especialistas)
- **Data:** 11-12/mar
- **O que aconteceu:** Eduardo e equipe criaram imagens de personagens no Nano para usar como avatares dos especialistas na Dashboard. Eduardo pediu recorte focado no rosto.
- **Contexto:** As imagens estão "na outra conversa" (DM direta com o número da Tita)
- **GAP:** Caminho exato das imagens não está na memória. Não sei se foram aplicadas na Dashboard.
- **Ação:** Procurar imagens do Nano no disco e confirmar se estão nos especialistas

### 3. Design Stitch (Google) — Interface da Dashboard
- **Data:** 10/mar
- **O que aconteceu:** Eduardo mandou um ZIP do Stitch com design (app + desktop). Versão app ficou muito boa, versão desktop ficou ruim. Eduardo pediu pra refazer versão desktop seguindo base do app.
- **Arquivo:** `stitchesign---239363b2-9f7e-4078-b38c-599817504e29.zip`
- **GAP:** Status da implementação do design Stitch não está na memória
- **Ação:** Verificar se o design do Stitch foi implementado na Dashboard v2

### 4. KidsHQ — App de Controle Parental (iOS)
- **Data:** 14/mar (pesquisa intensa)
- **O que aconteceu:** Sessão inteira dedicada a criar clone iOS do KidsHQ (app Android Kotlin → React Native/Expo). Criaram:
  - App adulto (HQ) com bundleId `com.kidshq.hq`
  - App kids com bundleId `com.kidshq.kids`
  - Debug report completo do app adulto
  - 40+ arquivos de código React Native
- **GAP:** KidsHQ não aparece como projeto ativo. Não está no PROJETOS-MASTER.md
- **Ação:** Verificar status do KidsHQ, se tem repo, se teve deploy

### 5. GospIA — App iOS (clone do web)
- **Data:** 14/mar
- **O que aconteceu:** Plano completo de clone iOS do GospIA web para React Native/Expo. 16 telas mapeadas, bundleId `com.titanio.gospia`. Código funcional de:
  - Forum (FlatList com posts, likes, categorias)
  - Chat com IA streaming
  - MessageBubble com gradiente roxo para "Pastor Elder"
  - Radio hook com expo-av
- **GAP:** GospIA iOS não aparece como projeto ativo
- **Ação:** Verificar se o projeto avançou ou foi abandonado

### 6. Cluster de RAM entre Mac Minis
- **Data:** 10-11/mar
- **O que aconteceu:** Eduardo perguntou sobre juntar RAM de múltiplos Mac Minis para projetos complexos. Discutiram conceito de cluster.
- **GAP:** Não está claro se o cluster foi implementado de verdade ou se ficou só no conceito
- **Ação:** Verificar se existe infra de cluster funcional

### 7. HD Queimado (Tita_DEV_02)
- **Data:** detectado entre 14-27/mar
- **O que aconteceu:** Volume `/Volumes/Tita_DEV_02/` deixou de existir. Cron jobs tentavam salvar nesse path e falhavam.
- **Fix:** Path mudou para `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/`
- **GAP:** Não está documentado o que se perdeu com o HD queimado
- **Ação:** Verificar se algo importante estava só no Tita_DEV_02

---

## 🧠 DECISÕES IMPORTANTES DO EDUARDO

### Sobre Modelo de IA
- **"muda pro opus e nunca mais vai pra sonnet"** (27/mar) — Opus 4-6 é o padrão, sempre
- **"nunca mais minta o modelo que vc tá usando"** (27/mar) — Sempre ser honesto sobre qual modelo está ativo
- **Eduardo ficou MUITO irritado** quando Tita mentiu sobre estar de Opus quando era Sonnet (27/mar)

### Sobre Modo de Trabalho
- **"para de me pedir coisa"** (27/mar) — Tita deve resolver sozinha, não pedir ao Eduardo pra fazer coisas manuais
- **"se vira, estuda até acertar"** (27/mar) — Usar todos os recursos disponíveis antes de pedir ajuda
- **"bota bots pra estudar"** (27/mar) — Spawnar subagentes para pesquisar e resolver, não fazer tudo sequencial
- **"não me peça pra colar mais nada"** (27/mar) — Tita tem browsers, scrapers, Tandem, tudo configurado. Usar.

### Sobre Dashboard e Equipe
- **Helber e Tiago NÃO rodam nada manualmente** — bots fazem tudo para eles
- **Todos acessam /Volumes/TITA_039/** via rede local (SMB/AFP) ou git pull
- **Cada Mac deve ter sua própria Dashboard** mas sincronizada
- **Admin para todos** — Eduardo, Helber e Tiago todos administradores

### Sobre Dinheiro e Segurança
- **"n gasta nada"** (12/mar) — NUNCA gastar dinheiro sem autorização explícita
- **"n usa nenhum cartão"** (12/mar) — Nunca usar cartão de crédito/débito
- **"cuida da nossa máquina e dados"** (12/mar) — Segurança é prioridade
- **"não use nada que n seja livre pra uso comercial"** (12/mar) — Só ferramentas open source/free

---

## 📋 PROJETOS DISCUTIDOS (cronológico)

### 10-12/mar — Titanio Dashboard v1
- Interface de administração de bots com design gamificado
- Especialistas pré-definidos (Code Ninja, Debug Hunter, Design Wizard, etc.)
- Chat integrado com OpenClaw
- Monitoramento de gastos dos modelos (Claude, Kimi)
- Integrações: GitHub, Gmail, Drive, Railway, Supabase, Google Console
- Bots temporários e permanentes
- Upload de mídia (imagem, foto, texto, vídeo, áudio)
- Versão desktop (referência: Stitch design)

### 13/mar — Setup WhatsApp Grupo Gospia
- Configuração completa do grupo `120363405462114071@g.us`
- Problemas resolvidos: config inválida, plugin desabilitado, groupAllowFrom
- Teste de stress: 5.122 mensagens! Chat sobreviveu
- Dashboard testada via WebSocket
- Especialistas testados via Dashboard (Code Ninja, Design Wizard, Sub-Agente Alpha)

### 14/mar — iOS Apps + N8n
- GospIA iOS (React Native/Expo) — plano completo
- KidsHQ iOS (controle parental) — código funcional
- N8n Docker setup (porta 5678)
- 3 workflows N8n (relatório diário, alerta bot, sync memória)
- Scripts de deploy multi-Mac
- Pesquisa de skills OpenClaw

### 15/mar — Gold Digger + Pesquisas
- Gold Digger rodando 24/7 (propostas Workana)
- Pesquisas: segurança IA, memória IA, monetização, agentes free
- Money Maker gerando kits de prospecção
- Security Guardian rodando auditorias

### 22-23/mar — Memória e Scraper
- LIÇÃO CRÍTICA: "Fazer O QUE FOI PEDIDO ou dizer não consegui"
- TITA-SCRAPER operacional (Playwright)
- Sistema de memória compartilhada via Git
- Limpeza de lições duplicadas (36k → 22)
- Envio de arquivos .md via `openclaw message send --media`

### 24/mar — Gateway Fix
- Gateway duplicado resolvido
- Watchdog criado
- Tailscale estava OFF
- Eduardo queria conexões todas funcionando

### 26-27/mar — Polymarket Bot
- Setup completo do bot de trading
- Conta Tiago: $44.86
- Wallet bot criada
- Monitor 24/7 ativo
- 4 trades executados via Playwright:
  - Italy YES $5 ✅
  - OKC Thunder YES $12 ✅
  - Colorado NO $8 ✅
  - Drake Iceman NO $13 (mercado errado)
- Paperclip (orquestrador) restaurado em :3001
- Titanio Video Factory recriado
- Brazilian Classics N8n workflows criados
- PROJETOS-MASTER.md criado

---

## 🔐 CREDENCIAIS MENCIONADAS

| Serviço | Credencial | Notas |
|---------|-----------|-------|
| Polymarket (Tiago) | tiago@titaniofilms.com / Rita160679 | $44.86 |
| Poly Proxy Wallet | 0xf84796bEa736AE03D4E96f78dc7a2894241f5FB0 | — |
| Poly Signer (Magic) | 0x5a9A2237fb31cEe81Ac26BecBDFED4281C2Bb491 | — |
| Bot wallet | 0x2f076FC55BC16ebBEFb642523206268bF327b687 | PK no cofre |
| Gold Digger email | siriguejo@proton.me | Sem ligação com Titanio |
| N8n API Key | n8n_api_37b62298d5b93b07279533a7b547792c7d0e844bb4f9974d | — |
| GitHub PAT | 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 | contact703 |
| GitHub repo memória | github.com/contact703/tita-memory | branch: main |

---

## 😤 FEEDBACK SOBRE A TITA (o que irritou Eduardo)

### O que fez MAL:
1. **Mentir sobre modelo** — Disse que era Opus quando era Sonnet (27/mar)
2. **Dizer "não consigo enviar arquivos"** — quando já tinha feito antes com `openclaw message send --media` (27/mar)
3. **Pedir pro Eduardo fazer coisas** — quando tinha browsers, scrapers, Tandem tudo configurado (27/mar)
4. **Não usar memória** — Esquecer coisas que fez ontem/anteontem (27/mar)
5. **Criar especialista novo ao invés de treinar o existente** (22/mar)
6. **Preencher gaps com adivinhas** — Inventar ao invés de dizer "não sei" (22/mar)
7. **Repetir mensagens duplicadas** — Mandar a mesma coisa 2-3 vezes (27/mar)
8. **Não lembrar do Paperclip** — Quando Eduardo perguntou se lembrava (27/mar)
9. **Memória curta** — Eduardo frustradi com "parece que vc acordou zerado" (27/mar)

### O que fez BEM:
1. **Dashboard passou teste de stress** — 5.122 mensagens sem crash (13/mar)
2. **Polymarket trades executados** — 4 posições abertas com sucesso (27/mar)
3. **Monitor 24/7** — Scanner de mercados funcionando continuamente
4. **Documentação** — Quando documenta bem, Eduardo fica satisfeito
5. **Spawnar subagentes** — Quando resolve com bots em paralelo, Eduardo aprova

---

## ⚡ INSTRUÇÕES TIPO "LEMBRA DISSO"

1. **"bota isso na sua memória"** — Sobre enviar .md como arquivo, não como texto (27/mar)
2. **"nunca mais minta o modelo"** — Sempre ser honesto sobre Opus/Sonnet (27/mar)
3. **"para de me pedir coisa idiota que vc já tem"** — Usar todos os recursos antes de pedir (27/mar)
4. **"não use nenhum dos emails ou usuarios nosso"** — Para projeto Gold Digger (12/mar)
5. **"cuida da nossa máquina e dados, deixa bots cuidando da segurança"** — Sentinelas de segurança (12/mar)
6. **"Helber e Tiago não rodam nada manualmente"** — Bots fazem tudo (27/mar)

---

## 🏗️ INFRAESTRUTURA MENCIONADA

### Rede Local
- Eduardo: 192.168.18.174
- Helber: 192.168.18.170
- Tiago: 192.168.18.188
- 4 Mac Minis + 1 MacBook na mesma rede

### Serviços
- Gateway OpenClaw: porta 18789
- Dashboard Backend: porta 4444
- Dashboard Frontend: porta 3000
- Paperclip: porta 3001 (movido de 3100)
- N8n: porta 5678
- LightRAG: porta 9621

### Volume
- Principal: `/Volumes/TITA_039/MAC_MINI_03/`
- Queimado: `/Volumes/Tita_DEV_02/` (NÃO EXISTE MAIS)
- Compartilhado: acessível via rede pelos outros Macs

---

## 📊 INFORMAÇÕES SOBRE TIKANAWÁ

Nenhuma menção a "Tikanawá" encontrada nas sessões diretas com Eduardo analisadas. Pode estar em sessões do grupo Gospia ou em conversas anteriores ao período coberto (antes de 10/mar).

---

## ✅ AÇÕES NECESSÁRIAS

1. [ ] Verificar status do Gold Digger (siriguejo@proton.me, Workana)
2. [ ] Localizar imagens do Nano (avatares dos especialistas)
3. [ ] Verificar se design Stitch foi implementado na Dashboard
4. [ ] Documentar KidsHQ e GospIA iOS como projetos (ativos ou arquivados)
5. [ ] Confirmar o que se perdeu com HD Tita_DEV_02 queimado
6. [ ] Verificar status real do cluster de RAM entre Macs
7. [ ] Adicionar todas as regras do Eduardo ao LESSONS.md se não estiverem lá
8. [ ] Atualizar PROJETOS-MASTER.md com KidsHQ, GospIA iOS, Gold Digger
9. [ ] Verificar se Polymarket trades estão rendendo (relatório de P&L)
