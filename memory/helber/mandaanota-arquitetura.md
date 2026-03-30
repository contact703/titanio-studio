# Manda a Nota — Arquitetura Completa

_Documento de referência para futuras APIs e atualizações_
_Criado: 10/03/2026_

---

## 🎯 O Que É

**Manda a Nota** é um sistema de emissão automática de NFS-e (Nota Fiscal de Serviço Eletrônica) para MEI no Brasil. O usuário descreve o serviço em linguagem natural (chat ou voz) e a nota é emitida automaticamente no portal gov.br.

**Único no mercado** — nenhum outro sistema faz isso.

---

## 🏗️ Arquitetura

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                     MANDA A NOTA                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   FRONTEND   │    │   BACKEND    │    │  SHADOW API  │  │
│  │   (React)    │◄──►│  (Node.js)   │◄──►│  (FastAPI)   │  │
│  │              │    │              │    │              │  │
│  │ • Site Web   │    │ • Auth       │    │ • Playwright │  │
│  │ • App Mobile │    │ • Chat AI    │    │ • Portal MEI │  │
│  │              │    │ • Invoices   │    │ • PDF Gen    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Repositórios & Deploy

| Componente | Repositório | Deploy | URL |
|------------|-------------|--------|-----|
| Site + Backend | `/Desktop/mandaanota/` | Railway | `mandaanota.titanio.studio` |
| Shadow API | `/Desktop/HelberDev/Projetos/Criacao de APIs/backend/` | Railway | `aplicativo-api-production-5163.up.railway.app` |
| App Mobile | `/Desktop/mandaanota/mobile-android/` | Play Store | `com.mandaanota.app` |

---

## 🔧 Stack Técnica

### Frontend (Site)
- **Framework:** React + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Routing:** Wouter
- **State:** TanStack Query
- **Local:** `client/src/`

### Backend (Node.js)
- **Framework:** Express.js
- **ORM:** Drizzle + PostgreSQL
- **Auth:** Session-based (express-session)
- **AI:** Groq (Llama) para chat
- **Email:** Resend
- **Local:** `server/`

### Shadow API (Python)
- **Framework:** FastAPI
- **Automação:** Playwright (headless browser)
- **Portal:** www.nfse.gov.br/EmissorNacional
- **Auth:** Cookies salvos no PostgreSQL
- **Local:** `app/api/nfse.py`

### Mobile (React Native)
- **Framework:** Expo SDK 52
- **Navigation:** expo-router
- **Auth:** AsyncStorage + Bearer token
- **Voice:** expo-speech-recognition
- **Local:** `mobile-android/`

---

## 📋 Fluxo de Emissão (4 Etapas)

```
USUÁRIO                    MANDA A NOTA                 PORTAL GOV.BR
   │                            │                            │
   │  "emite nota 500 reais    │                            │
   │   consultoria CNPJ xxx"   │                            │
   │ ─────────────────────────>│                            │
   │                            │                            │
   │                            │  1. Analisa com IA (Groq) │
   │                            │  2. Extrai dados          │
   │                            │  3. Busca cTribNac        │
   │                            │                            │
   │  "Confirma? Valor: R$500  │                            │
   │   Tomador: Empresa X"     │                            │
   │ <─────────────────────────│                            │
   │                            │                            │
   │  "sim"                    │                            │
   │ ─────────────────────────>│                            │
   │                            │                            │
   │                            │  POST /nfse/emit ─────────>│
   │                            │                            │
   │                            │  ETAPA 1: Pessoas          │
   │                            │  • Data competência        │
   │                            │  • Município prestador     │
   │                            │  • CPF/CNPJ tomador        │
   │                            │                            │
   │                            │  ETAPA 2: Serviço          │
   │                            │  • Município prestação     │
   │                            │  • cTribNac (dropdown)     │
   │                            │  • Descrição serviço       │
   │                            │  • NBS (opcional)          │
   │                            │                            │
   │                            │  ETAPA 3: Valores          │
   │                            │  • Valor do serviço        │
   │                            │  • Tributos: "Não informar"│
   │                            │                            │
   │                            │  ETAPA 4: Emitir           │
   │                            │  • Clica #btnProsseguir    │
   │                            │  • Extrai chave acesso     │
   │                            │                            │
   │                            │ <───────── Sucesso ────────│
   │                            │                            │
   │  "✅ Nota emitida!        │                            │
   │   Número: 2326"           │                            │
   │ <─────────────────────────│                            │
```

---

## 🗄️ Banco de Dados

### Tabelas Principais (Manda a Nota)

```sql
-- Usuários
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  cpf_cnpj VARCHAR,
  certificate_type VARCHAR, -- 'none' | 'a1'
  certificate_data TEXT,    -- Base64 do .pfx
  portal_connected_at TIMESTAMP,
  invoices_used INT,
  invoices_limit INT,
  plan VARCHAR,
  plan_expires_at TIMESTAMP
)

-- Notas Fiscais
invoices (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  tomador_nome VARCHAR,
  tomador_documento VARCHAR,
  tomador_email VARCHAR,
  valor_servico DECIMAL,
  descricao TEXT,
  ctrib_nac VARCHAR,      -- Código tributação nacional
  ctrib_mun VARCHAR,      -- Código tributação municipal
  status VARCHAR,         -- 'pending' | 'processing' | 'issued' | 'error' | 'cancelled'
  numero_nfse VARCHAR,
  chave_acesso VARCHAR,
  issued_at TIMESTAMP
)

-- Chat
chat_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  role VARCHAR,           -- 'user' | 'assistant'
  content TEXT,
  invoice_data JSONB,     -- Dados extraídos para emissão
  created_at TIMESTAMP
)
```

### Tabelas Shadow API

```sql
-- Sessões do Portal
nfse_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR UNIQUE,
  email VARCHAR,
  cookies TEXT,           -- Cookies do portal gov.br
  is_active BOOLEAN,
  last_ping TIMESTAMP,
  expires_at TIMESTAMP,
  encrypted_cpf_cnpj TEXT,
  encrypted_password TEXT
)
```

---

## 🔑 Endpoints Principais

### Backend (Node.js)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Login do usuário |
| `/api/auth/register` | POST | Registro |
| `/api/user` | GET | Dados do usuário logado |
| `/api/chat/send` | POST | Envia mensagem no chat |
| `/api/chat/messages` | GET | Histórico do chat |
| `/api/invoices` | GET | Lista notas fiscais |
| `/api/invoices/:id/pdf` | GET | Download PDF da nota |
| `/api/invoices/:id/whatsapp-link` | GET | Link WhatsApp para enviar |
| `/api/invoices/:id/send-email` | POST | Envia email com PDF |
| `/api/invoices/:id/cancel` | POST | Cancela nota |
| `/api/nfse/portal/login` | POST | Login no portal gov.br |
| `/api/nfse/portal/status` | GET | Status da conexão |

### Shadow API (FastAPI)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/nfse/emit` | POST | Emite NFS-e via Playwright |
| `/nfse/cancel` | POST | Cancela NFS-e |
| `/nfse/pdf` | GET | Baixa PDF do portal |
| `/nfse/login` | POST | Faz login no portal |
| `/nfse/status` | GET | Verifica sessão ativa |
| `/nfse/ping` | POST | Keep-alive da sessão |

---

## 📊 Códigos de Tributação (cTribNac)

### Mapeamento CNAE → cTribNac

```python
CNAE_TO_CTRIBNAC = {
    # Tecnologia
    "6201501": "01.05.01",  # Desenvolvimento de software
    "6202300": "01.07.01",  # Suporte técnico
    "6204000": "01.04.01",  # Consultoria em TI
    
    # Fotografia/Vídeo
    "7420001": "13.03.01",  # Fotografia
    "5911199": "13.02.01",  # Produção de vídeo
    
    # Consultoria
    "7020400": "17.01.01",  # Consultoria empresarial
    "6920601": "17.14.01",  # Contabilidade
    
    # ... (335 códigos no total)
}
```

### Arquivo de Correlação NBS

```
server/nbs-correlacao.json
```

Contém 200 mapeamentos cTribNac → NBS oficiais do Anexo VIII CGNFS-e.

---

## 🐛 Bugs Conhecidos & Soluções

### 1. MEI + Tributos Federais
**Problema:** Portal rejeita nota se preencher campos de PIS/COFINS
**Solução:** Para MEI, marcar "Não informar" em tributos (não preencher dropdowns federais)

### 2. Município Prestador Disabled
**Problema:** Campo preenchido automaticamente e disabled causava timeout
**Solução:** Verificar `chosen-disabled` antes de tentar preencher

### 3. Botão Emitir é Link
**Problema:** `#btnProsseguir` é `<a>`, não `<button>`
**Solução:** Usar `page.goto(href)` ao invés de click

### 4. Triplicação de Notas (App)
**Problema:** Múltiplos envios da mesma mensagem
**Solução:** `isSendingRef` + debounce de 3 segundos

### 5. Reutilização de Dados Antigos
**Problema:** Chat não limpo após erro causava reuso de dados
**Solução:** `clearChatMessages()` em todos os blocos catch

### 6. Formulário Simplificado vs Wizard
**Problema:** Usuários com serviço favorito usavam form simplificado (dados errados)
**Solução:** TODOS usam wizard de 4 etapas, simplificado desativado

---

## 🚀 Próximas Features (Ideias)

### Financeiro
- Dashboard de faturamento mensal
- Relatórios por período
- Exportação para contabilidade
- Integração com bancos (Open Finance)

### Contabilidade
- Geração de livro caixa
- Cálculo automático de impostos (DAS)
- Alertas de vencimento
- Integração com contador

### Automação
- Emissão recorrente (mensalidade)
- Templates de serviços frequentes
- Lembrete de notas pendentes
- Cancelamento em lote

### Mobile
- Notificações push
- Widget de emissão rápida
- Leitor de QR Code (dados do tomador)
- Histórico offline

---

## 📝 Comandos Úteis

```bash
# Deploy Manda a Nota (Site + Backend)
cd /Users/macmini03/Desktop/mandaanota
git push origin main  # Railway auto-deploy

# Deploy Shadow API
cd "/Users/macmini03/Desktop/HelberDev/Projetos/Criacao de APIs/backend"
railway up

# Build App Mobile
cd /Users/macmini03/Desktop/mandaanota/mobile-android
npx expo run:android

# Logs Railway
railway logs
```

---

## 🏆 Conquistas

- **10/03/2026:** Primeira emissão MEI 100% automática ✅
- **10/03/2026:** App mobile instalado e funcionando ✅
- **10/03/2026:** Wizard de 4 etapas para TODOS os usuários ✅
- **10/03/2026:** Correção de bugs críticos (triplicação, reutilização) ✅

---

_"Produto do ano com potencial de lucro imenso"_ — Helber Gomes

_Este documento é referência viva. Atualizar conforme o sistema evolui._
