# Dashboard Titanio — Deployment Guide

**Status**: Pronto para instalar em múltiplos Mac Minis

## 1. O que é COMPARTILHADO (Squad de 30 Especialistas)

Todos os Macs têm acesso aos mesmos 30 especialistas:
- code-ninja, debug-hunter, design-wizard, devops-ninja, aso-specialist...
- Memória sincronizada via GitHub (pasta `/memoria-especialistas/`)
- Qualquer Mac pode disparar tarefas para qualquer especialista

**Arquivo**: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/squad-specialists.json`

## 2. O que é LOCAL (específico de cada Mac)

Cada Mac Mini tem seu próprio:
- **Backend port** (4444, 4445, 4446...)
- **N8n instance** (5678, 5679, 5680...)
- **Banco de dados local** (se tiver)
- **Credenciais pessoais** (GitHub token, API keys)
- **Cluster nó local**

## 3. Instalação em Novo Mac Mini

### Step 1: Clonar o repositório
```bash
git clone https://github.com/contact703/titanio-dashboard.git
cd titanio-dashboard
```

### Step 2: Instalar dependências
```bash
# Backend
cd code/backend
npm install

# Frontend
cd ../frontend
npm install
cd ../..
```

### Step 3: Configurar variáveis de ambiente

**Backend `.env`:**
```bash
PORT=4444  # Ou 4445/4446 para outros Macs
WORKSPACE=/path/to/workspace  # Seu workspace local
GITHUB_TOKEN=ghp_xxxxx  # Token pessoal GitHub
N8N_URL=http://localhost:5678
```

**N8n:**
```bash
# Instalar N8n localmente
npm install -g n8n

# Ou usar Docker
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n
```

### Step 4: Iniciar os serviços

```bash
# Terminal 1: Backend
cd code/backend
npm run build
npm start

# Terminal 2: N8n
n8n start

# Terminal 3: Frontend (opcional, para GUI)
cd code/frontend
npm run dev
```

### Step 5: Sincronizar Squad

Baixar especialistas compartilhados:
```bash
# GitHub sync automático
git clone https://github.com/contact703/titanio-squad.git memoria-especialistas
```

## 4. Configuração N8n em Novo Mac

### Import workflows
```bash
# Exportar de um Mac:
n8n export:workflow --backup > workflows-export.json

# Importar em novo Mac:
n8n import:workflow --input workflows-export.json
```

Ou importar via UI (Admin → Workflows → Import)

**22 workflows já configurados e testados** estão em:
`/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/squad/n8n/`

## 5. Checklist de Instalação

- [ ] Clonar repositório
- [ ] npm install (backend + frontend)
- [ ] Criar `.env` com PORT e GITHUB_TOKEN (pessoal)
- [ ] npm run build && npm start (backend)
- [ ] n8n start (em porta local)
- [ ] Verificar http://localhost:4444/api/health
- [ ] Sincronizar Squad (memoria-especialistas)
- [ ] Importar N8n workflows (opcional, para automação)

## 6. Endpoints Importantes

```bash
# Health check
curl http://localhost:4444/api/health

# Squad (especialistas compartilhados)
curl http://localhost:4444/api/squad

# Status do Mac local
curl http://localhost:4444/api/cluster

# OpenClaw live
curl http://localhost:4444/api/openclaw/live
```

## 7. Troubleshooting

**Backend não inicia:**
```bash
# Verificar porta
lsof -i :4444
# Mudar para 4445 no .env se necessário
```

**N8n não conecta ao backend:**
```bash
# Verificar N8n_URL no .env
# Padrão: http://localhost:5678
```

**Squad vazio:**
```bash
# Sincronizar memória
git pull origin main (em memoria-especialistas/)
```

**RAM baixa (< 50k páginas):**
```bash
# Fechar Chrome, Simulators
# Ou aumentar swap se necessário
```

## 8. Credenciais (NÃO COMPARTILHAR)

Cada Mac precisa de seus próprios:
- `GITHUB_TOKEN` — gerado em GitHub Settings → Developer Settings
- `OPENCLAW_TOKEN` — gerado no OpenClaw local
- Chaves API de integrações (Railway, Supabase, etc)

**Nunca commit credenciais no Git!** Use `.env.local` (gitignored)

## 9. Monitoramento

Após instalação, rodar:
```bash
# Health check automático a cada 30s
curl -s http://localhost:4444/api/health | jq .

# Ver logs
tail -f /tmp/dashboard-backend.log

# N8n execuções
curl http://localhost:5678/api/v1/executions (com API key)
```

## 10. Atualizações

Quando há updates no repositório:

```bash
# Pull das atualizações
git pull origin main

# Recompile
npm run build

# Restart backend
kill $(pgrep -f dist/index.js)
npm start
```

---

**Versão**: 2026-03-21  
**Última atualização**: 21/03/2026  
**Testado em**: Mac Mini Contact (Mac 1)
