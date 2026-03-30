# 🔐 CREDENCIAIS COMPARTILHADAS vs PESSOAIS

**Data:** 2026-03-22  
**Versão:** 1.0

---

## 📌 ENTENDER A DIFERENÇA

### ✅ COMPARTILHADAS (Todos usam igual)

Essas credenciais são **sincronizadas** entre Contact, Helber e Tiago:

| Recurso | Tipo | Compartilhado? | Por quê? |
|---------|------|---|---|
| **Especialistas (32)** | Memória JSON | ✅ | Aprendem juntos |
| **N8n Workflows (8)** | Workflows | ✅ | Mesma automação |
| **GitHub Repos** | Git repos | ✅ | Código compartilhado |
| **Instagram Titanio** | Credenciais | ✅ | Mesma conta |
| **Supabase** | Database | ✅ | Mesma DB |

### ⚠️ PESSOAIS (Cada um tem seu)

Essas credenciais **NÃO** são compartilhadas:

| Recurso | Tipo | Pessoal? | Por quê? |
|---------|------|---|---|
| **GitHub Token** | Auth | ⚠️ | Cada um loga como si mesmo |
| **Anthropic API Key** | API | ⚠️ | Quota de tokens pessoal |
| **Kimi API Key** | API | ⚠️ | Quota de tokens pessoal |
| **Railway Token** | Deploy | ⚠️ | Deploy com user pessoal |
| **Google OAuth** | Auth | ⚠️ | Cada um usa sua conta Google |

---

## 🔧 SETUP PESSOAL

### Helber

**1. Gerar GitHub Token:**
```bash
gh auth token
# ou https://github.com/settings/tokens/new
```

**2. Gerar Anthropic API Key:**
```
https://console.anthropic.com/settings/keys
```

**3. Preencher seu `.env`:**
```bash
nano ~/titanio-dashboard/code/backend/.env

# Adicionar:
GITHUB_TOKEN=ghp_seu_token_aqui
ANTHROPIC_API_KEY=sk-ant-seu_token_aqui
```

### Tiago

Mesmo processo que Helber. Cada um no seu Mac.

---

## 📦 CREDENCIAIS COMPARTILHADAS — Como funciona?

### 1. Instagram Titanio
```json
{
  "instagram": {
    "user": "titaniodashboard",
    "password": "Rita160679!",
    "email": "contact@titaniofilms.com"
  }
}
```

**Arquivo:** `/cofre/insta-credentials.json`  
**Sincronizado via:** Git (criptografado)  
**Acessível por:** Contact, Helber, Tiago

### 2. Supabase
```bash
SUPABASE_URL=https://tlvsajdsertkbkwmfxkf.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Compartilhado no:** `.env` do repositório (privado)  
**Todos usam:** Mesma database

### 3. Especialistas
```
/memoria-especialistas/
├── code-ninja/
│   ├── memory.json
│   ├── lessons.json
│   └── context.md
├── instagram-poster/
├── debug-hunter/
...
```

**Sincronizado via:** Git  
**Aprendem juntos?** Sim, historia compartilhada

---

## 🔄 FLUXO DE SINCRONIZAÇÃO

```
Contact (Mac Mini)
    ↓
Git Push → GitHub
    ↓
Helber Pull (Mac Helber)
Tiago Pull (Mac Tiago)
    ↓
Todos com:
- Especialistas atualizados
- N8n workflows
- Código sincronizado
```

**Cada um executa:**
```bash
git pull origin main
npm install
./start-backend.sh
```

---

## ✅ VALIDAR CREDENCIAIS

### Compartilhadas

```bash
# Instagram Titanio
curl -s http://localhost:4444/api/instagram/profile

# Supabase
curl -s http://localhost:4444/api/db/health

# Especialistas
curl -s http://localhost:4444/api/squad | jq length
```

### Pessoais

```bash
# GitHub
gh auth status

# Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "Authorization: Bearer $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

---

## ⚠️ SEGURANÇA

### Proteção de Credenciais

- ✅ `.env` **NUNCA** commit no Git
- ✅ Credenciais sensíveis em `~/.titanio/` (local)
- ✅ Instagram password criptografado com `age`
- ✅ GitHub Tokens regeneráveis

### Se vazar uma credencial

```bash
# GitHub Token
gh auth logout && gh auth login

# Anthropic
Regenerar em https://console.anthropic.com

# Supabase
Regenerar em https://app.supabase.com
```

---

## 📋 CHECKLIST PRÉ-SETUP

Antes de compartilhar com Helber/Tiago:

- [ ] GitHub repositório privado criado
- [ ] `.env.example` pronto (sem secrets)
- [ ] Credenciais compartilhadas criptografadas
- [ ] Especialistas sincronizados
- [ ] N8n workflows exportados
- [ ] Documentação atualizada
- [ ] Teste em Mac limpo feito

---

## 🚀 DEPLOYMENT PASSO-A-PASSO

### Pra Contact
```bash
# Já tá feito — tá rodando
```

### Pra Helber
```bash
git clone https://github.com/contact703/titanio-dashboard.git
cd titanio-dashboard
bash install-dashboard.sh

# Adicionar credenciais pessoais:
nano code/backend/.env

# Adicionar:
GITHUB_TOKEN=<seu_token>
ANTHROPIC_API_KEY=<sua_key>

npm start
```

### Pra Tiago
Mesmo que Helber.

---

## 💡 SEMANAL — Sincronizar

```bash
cd ~/titanio-dashboard

# Pull especialistas atualizados
git pull origin main

# Rebuild se houver mudanças
npm install
npm run build
npm start
```

---

## 📞 SUPORTE

- **Credenciais não funcionam?** → Regen a key no provider
- **Especialistas não sincronizam?** → `git pull && git status`
- **N8n workflows faltando?** → Reimportar arquivo
- **Dúvidas?** → Ping @tita

