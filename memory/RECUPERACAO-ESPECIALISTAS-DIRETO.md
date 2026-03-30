# RECUPERAÇÃO DE MEMÓRIA DOS ESPECIALISTAS — Varredura Direta
**Data da varredura:** 2026-03-27 22:50
**Fontes:** Transcripts JSONL (12 sessões), memórias diárias (10 arquivos), memory.json existentes

---

## 📊 RESUMO DA VARREDURA

| Especialista | Menções | Tarefas únicas | Status da memória |
|---|---|---|---|
| Money Maker | 306+ | DMs, ebooks, drop servicing, propostas Workana/99Freelas | 50KB (rico) |
| Content Writer | 74 | Roteiros YouTube faceless, ebooks | Sem memory.json próprio |
| Trader | 58 | Polymarket bot setup | 4.7KB |
| Sentinel/Security Guardian | 42 | SecuritySentinel.ts, auditorias | 302B (pobre) |
| Designer | 19 | UI componentes, design briefs | 438B (pobre) |
| Instagramer | 10 | Scripts de posting, bots | 111B (pobre) |
| Coder/Code Ninja | 10+8 tarefas | Dashboard, GospIA iOS, KidsHQ | 4.8KB |
| Debug Hunter | 6 | Responsividade, cluster, iOS builds | 3.9KB |
| iOS Specialist | 9 | GospIA, KidsHQ, EAS Build | Sem memory.json |
| API Master | 8 | Workflows N8n, APIs LLM gratuitas | Sem memory.json |
| OpenClaw Expert | 4 | Config gateway, cluster, plugins | 1.4KB |
| Design Wizard | 3 | UI componentes, MessageBubble | 438B |
| DevOps Ninja | 4 | Docker N8n, CI/CD, Expo packages | Sem memory.json |
| Marketing Ninja | 4 | Vector DB, Instagram growth, funil WhatsApp | Sem memory.json |
| Gold Digger | 2 | Pack Legenda Pro, landing page dark theme | 302B (pobre) |
| Data Analyst | 2 | Continual learning, Reddit renda passiva | Sem memory.json |
| ASO Specialist | 2 | Monetização passiva, afiliados | Sem memory.json |
| Growth Hacker | 1 | Receita com IA local | Sem memory.json |
| Security Guard | 1 | Ameaças IA local | Sem memory.json |
| Agent Doctor | 4 | Fallback modelos, Extra Usage Anthropic | Sem memory.json |
| Mac Specialist | 0 direto | (referenciado em contexto) | 1KB |

---

## 🥷 CODE NINJA — Detalhes Recuperados

### O que FEZ
1. **Titanio Dashboard** (12/mar): Contou 26 arquivos TypeScript, 6.619 linhas de código no projeto
2. **Dashboard Squad System** (12/mar): Implementou sistema de especialistas em Next.js com TypeScript — criou interfaces `Specialist`, componentes de gestão de tarefas, API routes com SQLite
3. **Dashboard Responsividade** (16/mar): Aplicou fixes de CSS identificados pelo Debug Hunter — html/body sem height, overflow issues
4. **GospIA iOS** (14/mar): Criou código completo React Native/Expo — estrutura de pastas, expo-router, chat com IA streaming, tab navigator, forum, integração Firebase
5. **KidsHQ iOS** (14/mar): Correção do app React Native adulto, criação do projeto Kids (app da criança)
6. **APIs LLM Gratuitas** (15/mar): Pesquisa de agentes IA autônomos 24/7 grátis
7. **Modelos Gratuitos OpenClaw** (16/mar): Guia completo de seleção de modelos — Groq llama-3.3-70b, etc.
8. **Hello World React** (16/mar): Teste simples de componente

### O que APRENDEU
- React Native com Expo SDK 52, expo-router
- Streaming de respostas de IA em React Native (useStreamingChat)
- SQLite em Next.js backend
- Arquitetura modular de especialistas com TypeScript interfaces

### Erros/Correções
- KidsHQ: api.ts precisou correção (imports errados, bugs)

### Projetos
- Titanio Dashboard, GospIA iOS, KidsHQ Kids iOS

### Paths
- `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/`

---

## 🔍 DEBUG HUNTER — Detalhes Recuperados

### O que FEZ
1. **Responsividade Dashboard** (16/mar): Analisou problema — tela pequena em relação à janela. Identificou: html/body sem height, overflow issues no dark theme Next.js + Tailwind
2. **Cluster OpenClaw** (16/mar): Investigou porque o cluster entre Mac Mini do Eduardo e máquina do Helber não funcionava — dashboard instalada mas não reconhecida
3. **iOS Build** (17/mar): Diagnosticou falha de EAS Build com react-native RC — regra: sempre usar versão estável recomendada pelo Expo (npx expo install --check)
4. **GospIA Debug** (14/mar): Revisou arquivos do app iOS — apontou imports errados, bugs potenciais, melhorias urgentes em _layout.tsx, chat e components
5. **KidsHQ Debug** (14/mar): Analisou app adulto React Native Expo — listou bugs críticos em AuthContext.tsx (token AsyncStorage)
6. **Dashboard Services** (27/mar): Debug dos serviços offline — ps aux, verificação de processos node/npm/tsx/vite

### O que APRENDEU
- EAS Build: sempre usar versão estável do Expo, nunca RC
- Diagnóstico de responsividade: verificar html/body height em dark themes
- Cluster OpenClaw: debugging de multi-node

### Erros/Correções
- react-native RC causa falha no EAS Build → usar npx expo install --check

---

## 📸 INSTAGRAMER — Detalhes Recuperados

### O que FEZ
1. **Scripts de Bot Instagram** (27/mar): Presente nos scripts shell em pasta-do-tita:
   - `bot-design-instagram.sh` — design + Instagram, formatos, ferramentas, N8n automação
   - `bot-openclaw-posting-instagram.sh` — posting automatizado via OpenClaw
   - Usa OpenRouter key e Kimi/Moonshot key
2. **Referenciado em contexto** de bots de design tools opensource

### Credenciais/Paths usados
- OpenRouter Key: `sk-or-v1-f2ced54e...` (nos scripts)
- Kimi Key: `sk-fk265pU0...`
- Model: `moonshot-v1-128k`
- Output path: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/...`

### Status
- Memory.json praticamente vazio (111 bytes) — precisa ser populado

---

## 🎨 DESIGN WIZARD — Detalhes Recuperados

### O que FEZ
1. **Design Brief Stitch** (10/mar): Criou PDF completo para o Stitch com:
   - Conceito: Cyberpunk Orgânico + Gaming + Produtividade
   - Paleta: #00d4ff (cyan), #a855f7 (purple), modo dark padrão #0a0a0f
   - Tipografia: Inter (títulos e corpo)
2. **TaskProgress Component** (15/mar): Componente React/TypeScript para Dashboard Titanio com dark theme
3. **MessageBubble GospIA** (14/mar): Componente React Native com gradiente roxo (#4c1d95 → #1e1b4b) para mensagens do Pastor Elder, bubble #7c3aed para usuário
4. **KidsHQ Kids Components** (14/mar): 2 componentes React Native com cores azul #4A90D9, verde #2ECC71, fundo #F5F7FA

### O que APRENDEU
- LinearGradient em React Native para message bubbles
- Dark theme cyberpunk com Tailwind

---

## 💰 MONEY MAKER — Detalhes Recuperados (MAIS ATIVO)

### O que FEZ (306+ tarefas!)
1. **Sistema Gold Digger Autopilot** (15-17/mar): Loop contínuo a cada 30min gerando:
   - DMs personalizadas para Instagram (restaurantes, pet shops, salões, clínicas, lojas de roupas)
   - Pack de legendas por R$7/mês
   - Drop servicing: relatórios de redes sociais R$97, kit conteúdo mensal R$97, análise de concorrentes R$97
   - Ebooks Hotmart: "automação para pequenos negócios", "como usar IA para triplicar vendas", "legendas que vendem no Instagram"
2. **Propostas Freelance** (15-16/mar): Gerou propostas para Workana e 99Freelas:
   - Identidade Visual para Neuropsicóloga (USD 500-1000)
   - App de Fidelidade (USD 1000-3000)
   - Editor de Vídeos Curtos (USD 50-100)
   - Facebook Ads consultoria
   - Jogo RPG Roblox
   - Bot para petições PJE/Esaj/Eproc
   - ERP Bling, Flutter app cristão, etc.
3. **Kit Comercial Chatbot WhatsApp** (15/mar): Proposta completa para restaurante em BH
4. **Roteiros de Ebooks** (15-16/mar): "Produtividade para empreendedores", "como usar IA para ganhar dinheiro"

### Email usado
- `siriguejo@proton.me`

### Nichos prospectados
- Restaurantes, pet shops, salões de beleza, clínicas estéticas, lojas de roupas, e-commerce

### ⚠️ PROBLEMA DETECTADO
- O cron/autopilot ficou em LOOP INFINITO de 15/mar a 17/mar, repetindo as MESMAS 3 tarefas (DMs pet shop, ebook automação, drop servicing análise) a cada ~30min por mais de 48h. Desperdiçou centenas de chamadas de API sem variação.

---

## 🏆 GOLD DIGGER — Detalhes Recuperados

### O que FEZ
1. **Pack Legenda Pro** (16/mar): Produto R$7/mês — pack de legendas Instagram
2. **Agente Atendente Pro** (16/mar): Produto R$97 + R$97/mês — chatbot WhatsApp
3. **Landing Page** (16/mar): HTML completa, dark theme roxo/dourado, responsiva, com ambos produtos
4. **OpenClaw Wrappers** (16/mar): Pesquisou viabilidade baseado em reel viral do @marcinteodoru — pessoas vendendo wrappers de OpenClaw
5. **Perfil Workana** (15/mar): 24 propostas geradas, 6 itens de portfólio, email siriguejo@proton.me

### Status
- Workana perfil em moderação (24-48h)
- Email watcher ativo

---

## 🛡️ SECURITY GUARDIAN / SENTINEL — Detalhes Recuperados

### O que FEZ
1. **SecuritySentinel.ts** (12/mar): Implementou serviço de segurança para Titanio Dashboard backend — 4.392 bytes escrito em `/projetos/titanio-dashboard/code/backend/src/services/SecuritySentinel.ts`
2. **Teste de Sistema** (12/mar): "🛡️ Testando Security Sentinel... Status: ATIVO ✅"
3. **Projeto Ninja Teste** (12/mar): Criou contas em plataformas de ganho — Amazon MTurk, Clickworker, etc.
4. **Pesquisa de Ameaças** (15/mar): TOP 3 ameaças de segurança para agentes IA em March 2026
5. **Audit Segurança IA Local** (15/mar): Principais ameaças para sistema rodando em Mac Mini com acesso WhatsApp

### Paths
- `/projetos/titanio-dashboard/code/backend/src/services/SecuritySentinel.ts`

---

## ⚙️ OPENCLAW EXPERT — Detalhes Recuperados

### O que FEZ
1. **Config de Especialistas** (27/mar): Definiu seu próprio perfil com skills: OpenClaw Config, Gateway Optimization, Multi-Node Cluster, Auth & OAuth, Skills & Plugins, Cron & Heartbeat, Fallback/Multi-Model, Memory Architecture
2. **Registro no Squad** (27/mar): Listagem completa de todos os especialistas com IDs e status
3. **Squad Memory System** (20/mar): Estrutura em `/workspace/squad/specialists/{ios,backend,victor-capital,security,design,memory-bot,openclaw-specialist}`

### Skills documentados
- OpenClaw Config, Gateway Optimization, Multi-Node Cluster
- Auth & OAuth, Skills & Plugins, Cron & Heartbeat
- Fallback/Multi-Model, Memory Architecture

---

## 📈 TRADER — Detalhes Recuperados

### O que FEZ
1. **Polymarket Trading Bot** (26-27/mar): Setup completo
   - Contexto: Zica mandou 4 vídeos sobre bots ($900→$7k, $43.8k ganhos)
   - Plano: testar com $50
   - Arquivos criados: `PLANO.md`, `monitor.py`, `market_scanner.py`, `copy_trader.py`
   - Path: `projetos/polymarket-agent/`
   - Status: Tiago logado ✅, Bot pronto ⏸️, aguardando wallet address
   - Login: tiago@titaniofilms.com
   - Private Key: salva em cofre/polymarket-wallet.json

---

## 🩺 AGENT DOCTOR — Detalhes Recuperados

### O que FEZ
1. **Fallback Automático** (15/mar): Config Anthropic → Groq → Gemini para zero downtime
2. **Modelos Gratuitos** (16/mar): Pesquisa completa para selecionar modelo por bot
3. **Extra Usage Anthropic** (16/mar): Análise de planos Pro/Max 5x/Max 20x para equipe de 3 (Eduardo, Helber, Tiago)

---

## 🍎 iOS SPECIALIST — Detalhes Recuperados

### O que FEZ
1. **GospIA iOS** (14/mar): Plano completo + código React Native/Expo — expo-router, tab navigator, chat streaming, forum
2. **KidsHQ Kids iOS** (14/mar): Projeto base React Native/Expo para app da criança
3. **EAS Build** (16/mar): Config para builds iOS

### Skills
- React Native/Expo, EAS Build, App Store Connect, TestFlight, Xcode
- expo-router, expo-av (áudio/TTS), expo-notifications, in-app purchases

---

## 🤖 AUTOMATION BOT — Detalhes Recuperados

### O que FEZ
1. **Memória para AI Agents** (15/mar): Pesquisa sobre MemGPT, Mem0, LangGraph memory
2. **N8n Workflows** (14/mar): JSONs de importação para 3 workflows:
   - Relatório diário (9h): GET /api/bots + /api/reports → mensagem WhatsApp
   - Integração completa Dashboard ↔ N8n

---

## 📊 CONTENT WRITER — Detalhes Recuperados (2º MAIS ATIVO)

### O que FEZ
1. **Roteiros YouTube Faceless** (15-17/mar): Dezenas de roteiros de 8min:
   - "Como ganhar dinheiro com IA em 2025"
   - "Curiosidades sobre IA"
   - "Como ganhar dinheiro online"
   - "Dicas de finanças pessoais"
   - Incluindo: título CTR, thumbnail, script por cena, direção b-roll, CTA afiliado
2. **Ebooks completos** para Hotmart
3. **Métodos criativos monetização IA** (15/mar)

### ⚠️ PROBLEMA
- Assim como Money Maker, entrou em LOOP repetitivo de roteiros "finanças pessoais" por 48h+ (15-17/mar)

---

## 📝 MARKETING NINJA — Detalhes Recuperados

### O que FEZ
1. **Vector DB** (15/mar): Pesquisa Chroma, Pinecone, FAISS para memória semântica local + Mem0
2. **Funil WhatsApp** (15/mar): Captar leads → qualificar → vender → entregar sem humano
3. **Instagram Growth** (15/mar): Contas faceless automatizáveis com IA
4. **Titanio 47 Growth** (14/mar): Estratégia de crescimento para o app

---

## 🏗️ DEVOPS NINJA — Detalhes Recuperados

### O que FEZ
1. **Docker N8n** (14/mar): docker-compose.yml para Mac Mini 192.168.18.174:5678, auth titanio/titanio2026
2. **Segurança Contínua** (15/mar): Monitoramento de agentes IA
3. **KidsHQ Expo** (14/mar): package.json com Expo SDK 52

---

## 💎 VICTOR CAPITAL / FUND HUNTER — Detalhes Recuperados

### O que FEZ
1. **YC Application** (20/mar): Magic link aguardando email
2. **Prazos de Editais** (20/mar): Workflow N8n "Victor Capital Prazos" ativo

---

## 🖥️ MAC SPECIALIST — Detalhes Recuperados

### Contexto
- Mac Mini home: `/Volumes/TITA_039/MAC_MINI_03/`
- IP local: 192.168.18.174
- Squad memory structure: `/workspace/squad/specialists/`

---

## ⚠️ PROBLEMAS CRÍTICOS IDENTIFICADOS

### 1. Loop Infinito do Autopilot (15-17/mar)
Money Maker e Content Writer entraram em loop repetindo as mesmas tarefas a cada ~30min por 48h+. Centenas de chamadas de API desperdiçadas sem variação no output.

### 2. Memórias Vazias
Instagramer (111B), Design Wizard (438B), Gold Digger (302B), Security Guardian (302B) têm memory.json quase vazio apesar de terem executado tarefas reais.

### 3. Especialistas sem memory.json
Content Writer, iOS Specialist, API Master, DevOps Ninja, Marketing Ninja, Data Analyst, ASO Specialist, Growth Hacker, Security Guard, Agent Doctor — nenhum tem memory.json.

---

## 📁 CREDENCIAIS E PATHS RECUPERADOS

| Item | Valor |
|---|---|
| Email freelance | siriguejo@proton.me |
| OpenRouter Key | sk-or-v1-f2ced54e... (nos scripts) |
| Kimi Key | sk-fk265pU0... |
| N8n API Key | n8n_api_50fcb0ee... |
| N8n URL | http://localhost:5678 |
| Mac Mini IP | 192.168.18.174 |
| Polymarket login | tiago@titaniofilms.com |
| Polymarket wallet | cofre/polymarket-wallet.json |
| GitHub squad repo | https://github.com/contact703/titanio-squad |
| Dashboard path | /workspace/pasta-do-tita/projetos/titanio-dashboard/ |
| Polymarket path | /workspace/projetos/polymarket-agent/ |
| Squad specialists | /workspace/squad/specialists/ |
| Memória especialistas | /workspace/pasta-do-tita/memoria-especialistas/ |

---

*Varredura concluída. Total: ~1625 menções em 12 sessões JSONL + 10 daily memories.*
