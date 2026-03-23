# 🚀 DEPLOYMENT MANUAL — Dashboard Titanio para Helber & Tiago

**Versão:** 2.0  
**Data:** 2026-03-22  
**Status:** ✅ Pronto para produção  

---

## 📋 CHECKLIST DE INSTALAÇÃO

### Pré-requisitos
- [ ] macOS 12+ (Intel ou Apple Silicon)
- [ ] Node.js 18+
- [ ] npm ou yarn
- [ ] GitHub CLI (`brew install gh`)
- [ ] 4GB RAM mínimo
- [ ] 10GB espaço em disco

### 1. Clonar repositório
```bash
git clone https://github.com/contact703/titanio-dashboard.git ~/titanio-dashboard
cd ~/titanio-dashboard
```

### 2. Instalar dependências
```bash
cd code/backend && npm install
cd ../frontend && npm install
cd ../..
```

### 3. Configurar variáveis de ambiente

**Backend (.env):**
```bash
cp code/backend/.env.example code/backend/.env
# Editar e preencher:
# - ANTHROPIC_API_KEY (obrigatório)
# - KIMI_API_KEY (opcional)
# - Outras integrações conforme necessário
```

**Frontend (.env.local):**
```bash
cp code/frontend/.env.example code/frontend/.env.local
# Configurar:
# - NEXT_PUBLIC_API_URL=http://localhost:4444
```

### 4. Iniciar N8n
```bash
docker run -it --rm \
  -p 5678:5678 \
  -e NODE_ENV=production \
  n8nio/n8n
# Importar workflows de: ./n8n-workflows/
```

### 5. Iniciar Backend
```bash
cd code/backend
npm run build
npm start
# Deve responder em http://localhost:4444/api/health
```

### 6. Iniciar Frontend
```bash
cd code/frontend
npm run dev
# Deve abrir em http://localhost:3000
```

### 7. Validar instalação
```bash
curl http://localhost:4444/api/health
curl http://localhost:3000
curl http://localhost:5678
```

---

## 🔐 CREDENCIAIS COMPARTILHADAS

**Arquivo:** `/cofre/shared-credentials.json`

As credenciais **compartilhadas** entre todos:
- ✅ Especialistas (32) — mesmos em todos os Macs
- ✅ N8n workflows (8) — importar nos 3 Macs
- ✅ GitHub repos (30) — sincronizar via git

As credenciais **pessoais** — cada um gera seu:
- ⚠️ GitHub Token — `gh auth token`
- ⚠️ Railway Token — em https://railway.app/account/tokens
- ⚠️ Anthropic API Key — https://console.anthropic.com
- ⚠️ Kimi API Key — https://platform.moonshot.cn

**Instruções:**
1. Abrir `/cofre/SHARED-CREDENTIALS.md`
2. Copiar template
3. Preencher apenas com SUAS credenciais
4. Salvar em `~/.titanio/credentials-SEUNAME.json`

---

## 📊 PORTS USADAS

| Serviço | Port | URL |
|---------|------|-----|
| Backend | 4444 | http://localhost:4444 |
| Frontend | 3000 | http://localhost:3000 |
| N8n | 5678 | http://localhost:5678 |

**Se uma porta tiver ocupada:**
```bash
# Achar processo
lsof -i :4444

# Matar
kill -9 <PID>
```

---

## 🆘 TROUBLESHOOTING

### Backend não sobe
```bash
# Limpar cache
rm -rf code/backend/dist code/backend/node_modules
npm install && npm run build
```

### Frontend fica em branco
```bash
# Verificar se backend tá online
curl http://localhost:4444/api/health

# Se não, iniciar backend primeiro
```

### N8n não abre
```bash
# Verificar se Docker tá rodando
docker ps

# Se não, iniciar Docker Desktop
```

### Especialistas não aparecem
```bash
# Verificar se pasta existe
ls -la ~/titanio-dashboard/memoria-especialistas/

# Se não, clonar novamente
```

---

## 📞 SUPORTE

- **Tita** (AI): Automação, especialistas, workflows
- **Contact**: Dashboard, backend, integrações

**Ping no Telegram/WhatsApp se travar em qualquer passo.**

---

## ✅ VALIDAÇÃO FINAL

Quando tudo estiver funcionando:
```bash
# 1. Backend OK?
curl http://localhost:4444/api/health | jq .squad

# 2. Frontend OK?
curl http://localhost:3000 -I | grep 200

# 3. N8n OK?
curl http://localhost:5678 | grep n8n

# 4. Especialistas OK?
curl http://localhost:4444/api/squad | jq length

# Se tudo retornar ✅, pode usar!
```

---

**Pronto. Qualquer dúvida, é só chamar.**

