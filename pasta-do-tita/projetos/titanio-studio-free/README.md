# ��� Titanio Studio Free — Dashboard 100% Gratuito

> Versão gratuita do Titanio Studio usando apenas ferramentas free tier.

## 💰 Custo Total: R$ 0,00/mês

| Serviço | Uso | Limite Grátis |
|---------|-----|---------------|
| **Supabase** | Backend + Auth + DB | 500MB DB, 1GB storage, 50K MAU |
| **Vercel** | Hosting | 100GB bandwidth, unlimited deploys |
| **Groq** | IA (LLM) | 14.400 req/dia |
| **N8n local** | Automação | Ilimitado |
| **Cloudflare** | DNS | Ilimitado |

---

## 🚀 Setup Rápido (5 minutos)

### 1. Criar conta Supabase (grátis)

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a ANON KEY das configurações

### 2. Criar conta Groq (grátis)

1. Acesse [console.groq.com](https://console.groq.com)
2. Crie uma API key
3. Copie a key

### 3. Configurar o projeto

```bash
# Entrar na pasta do dashboard
cd dashboard

# Copiar arquivo de ambiente
cp .env.local.example .env.local

# Editar com suas keys
nano .env.local
```

Conteúdo do `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
GROQ_API_KEY=sua-groq-key
N8N_WEBHOOK_URL=http://localhost:5678/webhook
```

### 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

### 5. Deploy na Vercel (grátis)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Ou conecte o GitHub e faça deploy automático.

---

## 📁 Estrutura

```
titanio-studio-free/
├── dashboard/              # Next.js app
│   ├── src/
│   │   ├── app/           # Páginas (App Router)
│   │   │   ├── page.tsx   # Dashboard principal
│   │   │   ├── campanhas/ # Gestão de campanhas
│   │   │   ├── calendario/# Calendário editorial
│   │   │   ├── copywriter/# IA para gerar copies
│   │   │   └── api/       # API Routes
│   │   ├── components/    # Componentes React
│   │   └── lib/           # Utilitários (Supabase, Groq)
│   └── .env.local         # Variáveis de ambiente
├── n8n-workflows/         # Workflows de automação
└── README.md
```

---

## ✨ Funcionalidades

### ✅ Implementado
- [x] Dashboard com stats
- [x] Lista de campanhas
- [x] Calendário editorial
- [x] IA Copywriter (Groq)
- [x] Compositor de posts
- [x] Integração N8n (webhook)

### 🚧 Em desenvolvimento
- [ ] Autenticação Supabase
- [ ] CRUD campanhas no banco
- [ ] Agendamento real de posts
- [ ] Integração Meta Graph API
- [ ] Integração Google Ads API
- [ ] Analytics reais

---

## 🔧 Workflows N8n

Para os posts funcionarem automaticamente, importe os workflows no N8n:

1. **titanio-post**: Recebe post do dashboard → posta no Instagram
2. **titanio-scheduler**: Cron que verifica posts agendados
3. **titanio-analytics**: Puxa métricas das plataformas

(Workflows em `/n8n-workflows/`)

---

## 🎨 Screenshots

**Dashboard Principal**
- Cards de stats (impressões, cliques, conversões)
- Lista de campanhas ativas
- Compositor rápido de posts

**IA Copywriter**
- Input de prompt
- Seleção de estilo (casual/profissional/urgente)
- Gera 3 variações para escolher

**Calendário Editorial**
- Visualização mensal
- Posts agendados por dia
- Indicadores de plataforma

---

## 🛠️ Stack Técnica

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **IA**: Groq API (Llama 3.1 70B)
- **Automação**: N8n self-hosted
- **Icons**: Lucide React
- **Charts**: Recharts

---

## 📝 Próximos Passos

1. **Configurar Supabase** — criar tabelas de campanhas/posts
2. **Importar workflows N8n** — automação de posts
3. **Conectar Meta Graph API** — publicar no Instagram real
4. **Deploy Vercel** — colocar online

---

## 🤝 Suporte

Dúvidas? Fala com a Tita no grupo Gospia!

---

*Criado pela equipe Titanio em 06/04/2026*
