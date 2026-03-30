# 🎮 Análise do Projeto: Titanio Dashboard (Command Center)

**Analisado em:** 2026-03-13  
**Backup:** `/Volumes/TITA_039/backup-projetos/titanio-dashboard-backup-20260312-0801/`  
**Versão:** 1.0.0-alpha

---

## 1. O Que o Projeto Faz

O **Titanio Command Center** é um dashboard desktop para o Eduardo e sua equipe gerenciarem:

- **Bots** (criar, iniciar, pausar, parar, monitorar)
- **Projetos** (organizar bots por cliente/projeto)
- **Squad de especialistas virtuais** — 8 personas de IA com funções distintas (Code Ninja, Design Wizard, Debug Hunter, etc.)
- **Frota de Mac Minis** — até 5 nós em cluster, com balanceamento de carga, migração automática de bots e monitoramento de recursos
- **Chat com Tita** — assistente integrada diretamente na dashboard, com comandos de voz e texto
- **Monitor de gastos de IA** — rastreia custos por provedor (OpenAI, Anthropic, ElevenLabs) com alertas e modo econômico
- **Sistema de e-mail por bot** — cada bot tem um endereço @bots.titanio.dev
- **Gamificação** — sistema de XP, níveis, conquistas e leaderboard

A ideia central é ter um "data center caseiro" onde cada Mac Mini é um nó, eles se descobrem automaticamente via mDNS na rede local, e tudo é gerenciado de um lugar só.

---

## 2. Arquitetura

### Frontend
- **Framework:** Next.js 14 + React 18
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS + Framer Motion (animações)
- **Estado:** Zustand + React Query
- **Real-time:** Socket.io Client
- **Gráficos:** Recharts
- **Ícones:** Lucide React
- **Porta:** 3000

### Backend
- **Runtime:** Node.js + Express
- **Linguagem:** TypeScript
- **Real-time:** Socket.io
- **ORM:** Prisma (PostgreSQL)
- **Filas:** BullMQ + Redis
- **Auth:** JWT + bcryptjs
- **Validação:** Zod + express-validator
- **IA:** OpenAI SDK
- **Porta:** 4444 (mudado de 3333 por conflito com Titanio CC antigo)

### Serviços Backend (estrutura de arquivos)
```
src/
├── index.ts                  # Servidor principal + rotas REST + WebSocket
├── middleware/auth.ts         # JWT auth
├── squad/SquadManager.ts      # 8 especialistas virtuais
└── services/
    ├── BotManager.ts          # CRUD + controle de bots
    ├── ProjectManager.ts      # CRUD de projetos
    ├── ChatService.ts         # Processamento de comandos do chat
    ├── EmailManager.ts        # E-mails por bot
    ├── BillingManager.ts      # Monitor de gastos de IA
    ├── GamificationManager.ts # XP, níveis, conquistas
    ├── ClusterManager.ts      # Gestão da frota de Mac Minis
    └── SecuritySentinel.ts    # Monitoramento de segurança
```

### Design System
- **Tema:** Dark mode (fundo #0a0a0f)
- **Cores principais:** Cyan (#00d4ff) e Purple (#a855f7)
- **Estilo:** Glassmorphism, gradientes, glow sutil
- **Fontes:** Inter + JetBrains Mono + Space Grotesk
- **Layout:** 3 colunas (Sidebar + Main + Chat)

### Dependências externas necessárias
- PostgreSQL
- Redis
- OpenAI API key
- (Opcional) Google OAuth, GitHub token, Railway token

---

## 3. Funcionalidades Implementadas

### ✅ Frontend — UI completa
- Layout 3 colunas com Sidebar, área principal e ChatPanel
- Dashboard Overview com StatCards, atividade recente, frota de Macs, uso de recursos
- Navegação entre abas: Dashboard / Projetos / Bots / Squad
- **ChatPanel** com chat em tempo real com Tita, comandos básicos reconhecidos
- **SquadPanel** — grid 4x2 com 8 especialistas, avatares, status, skills, botão "Chamar"
- **BotsPanel** — CRUD visual de bots, ações play/pause/stop
- **ProjectsPanel** — gerenciamento de projetos
- Header com busca global, notificações, status de conexão WebSocket

### ✅ Backend — API REST + WebSocket
- `GET /api/health` — status do sistema
- `GET /api/squad` — lista especialistas
- `GET /api/bots` — lista bots
- `GET /api/projects` — lista projetos
- `POST /api/projects` — criar projeto
- `POST /api/bots` — criar bot (com e-mail automático)
- `POST /api/bots/:id/start|pause|stop` — controle de bot
- `GET /api/email/:botId` — caixa de entrada do bot
- `POST /api/email/:botId/send` — enviar e-mail
- WebSocket para chat em tempo real
- CORS configurado para localhost:3000

### ✅ Serviços implementados (código presente)
- BotManager, ProjectManager, ChatService
- EmailManager (e-mails por bot)
- BillingManager (tracking de gastos por provedor)
- GamificationManager (XP, níveis, badges, streak)
- ClusterManager (frota multi-nó)
- SecuritySentinel (monitoramento de segurança)
- SquadManager (8 especialistas)

### ✅ Documentação e specs
- README.md completo
- Especificações v1 e v2 com design system detalhado
- FUNCTIONALITY_CHECKLIST.md com status de cada feature
- COMO_FUNCIONA.md explicando a arquitetura de cluster
- Design briefs (desktop, Stitch)
- Preview HTML da dashboard

### ✅ Materiais paralelos (produtos digitais)
O projeto também gerou produtos digitais para venda (Gumroad):
- Ebook "Mac Mini Mastery"
- Pack de Templates Notion
- 105 Prompts de IA
- Checklist de Produtividade
- Ninja Scripts (automação bash)
- Landing page e copy de marketing

---

## 4. Estado Atual

### O que funciona (ou está pronto para funcionar)
- **Frontend:** UI 95% completa visualmente, todos os componentes implementados
- **Backend:** 7 endpoints REST funcionando, WebSocket configurado
- **Chat:** Comandos básicos com Tita respondendo (oi, criar bot, squad, etc.)
- **Squad:** 8 especialistas com avatares e cards completos
- **Design system:** Consistente, dark mode, gradientes, glassmorphism

### O que está incompleto / quebrado
- **Banco de dados:** PostgreSQL e Redis necessários mas provavelmente não configurados localmente — sem isso o backend falha ao iniciar
- **GitHub remote:** Não configurado (só git local)
- **CI/CD:** Não implementado
- **Testes:** Nenhum teste automatizado
- **Integrações externas:** GitHub, Google, Railway — não implementadas
- **Deploy em cloud:** Não feito
- **ClusterManager / mDNS discovery:** Código existe mas não foi testado com múltiplos nós reais
- **App mobile:** Planejado, não iniciado
- **node_modules:** Presentes na pasta `code/` mas o projeto precisa rodar `npm run install:all`
- **next.config.js:** Warning cosmético (não crítico)
- **Autenticação JWT:** Middleware criado mas pode não estar aplicado em todas as rotas

### Avaliação geral
O projeto está em estado **alpha funcional** — a UI e o backend foram desenvolvidos rapidamente (em sessão de trabalho intensa), documentação está bem detalhada, mas falta infraestrutura (DB, Redis) para rodar de verdade e integração completa entre frontend e todos os serviços do backend.

---

## 5. Próximos Passos Sugeridos

### Prioridade Alta — Para rodar o projeto
1. **Setup do banco:** Instalar PostgreSQL localmente ou usar Supabase (gratuito), rodar `prisma migrate dev`
2. **Setup do Redis:** Instalar Redis localmente ou usar Upstash (gratuito) para as filas BullMQ
3. **Configurar .env:** Copiar `.env.example` para `.env` e preencher as variáveis
4. **Instalar dependências:** `cd code && npm run install:all`
5. **Testar backend:** `npm run dev:backend` e verificar `http://localhost:4444/api/health`
6. **Testar frontend:** `npm run dev:frontend` e acessar `http://localhost:3000`

### Prioridade Média — Para completar o MVP
7. **Conectar frontend ao backend real:** Substituir dados mockados pelos dados da API
8. **Autenticação:** Aplicar middleware JWT nas rotas que precisam
9. **GitHub remote:** Criar repositório e fazer push
10. **Testar WebSocket:** Chat em tempo real em profundidade

### Prioridade Baixa — Futuro
11. **CI/CD:** GitHub Actions para build/test automático
12. **Deploy:** Railway ou Fly.io para backend, Vercel para frontend
13. **Integrações:** GitHub, Google, Railway (planejadas na spec v2)
14. **App mobile:** React Native (planejado)
15. **Testes automatizados:** Vitest para backend, Playwright para frontend
16. **mDNS discovery real:** Testar ClusterManager com múltiplos Macs na rede

---

## Notas Adicionais

O projeto foi desenvolvido em sessão intensa na madrugada de 11-12/03/2026 com um "squad" de agentes Claude Code trabalhando em paralelo. A documentação é excelente e o código está bem estruturado para um alpha. O maior risco é a dependência de PostgreSQL + Redis que podem não estar configurados no ambiente atual.

O arquivo `setup_monero_miner.sh` e alguns scripts paralelos (`simulate_activity.py`, `ninja_earning.py`, `RELATORIO_NINJA.md`) são de um "projeto teste real" separado onde os agentes criaram produtos digitais para venda — não fazem parte do core do dashboard.
