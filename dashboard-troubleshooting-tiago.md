# 🚨 Dashboard Down — Diagnóstico e Correção

**Problema reportado:**
```
• :4446 (Backend Titanio) ❌
• :3002 (Frontend) ❌
• :4444 / :3001 (HEARTBEAT.md) ❌
```

Todos os serviços da Dashboard estão offline. Siga os passos abaixo na ordem.

---

## 1️⃣ Verificar Processos Rodando

```bash
# Checar se os serviços estão rodando
ps aux | grep -E "node|npm|tsx|vite" | grep -v grep

# Checar portas em uso
lsof -i :4446
lsof -i :3002
lsof -i :4444
lsof -i :3001
```

**Se nada aparecer:** os serviços não estão rodando. Vá para o passo 2.

---

## 2️⃣ Localizar os Projetos

```bash
# Encontrar onde está a Dashboard
find ~ -name "dashboard*" -type d 2>/dev/null | head -10
find ~/.openclaw -name "*dashboard*" -type d 2>/dev/null
find ~/projetos -name "*dashboard*" -type d 2>/dev/null
```

**Paths prováveis:**
- `~/.openclaw/workspace/projetos/dashboard/`
- `~/projetos/dashboard/`
- `~/.openclaw/skills/agent-dashboard/`

---

## 3️⃣ Iniciar Backend (:4446)

```bash
# Entre no diretório do backend
cd /caminho/para/dashboard/backend  # ajuste o caminho

# Instalar dependências (se necessário)
npm install

# Iniciar o servidor
npm run dev
# ou
node server.js
# ou
tsx server.ts
```

**Testar se subiu:**
```bash
curl http://localhost:4446/health
# ou
curl http://localhost:4446/api/status
```

---

## 4️⃣ Iniciar Frontend (:3002)

```bash
# Entre no diretório do frontend
cd /caminho/para/dashboard/frontend  # ajuste o caminho

# Instalar dependências (se necessário)
npm install

# Iniciar o dev server
npm run dev
# ou
vite
```

**Testar se subiu:**
```bash
curl http://localhost:3002
```

Abra no navegador: `http://localhost:3002`

---

## 5️⃣ Verificar HEARTBEAT.md (:4444 / :3001)

Esses serviços podem ser:
- Um segundo backend/frontend
- Um servidor de monitoramento
- Um webhook/API para heartbeats

```bash
# Procurar por scripts que usam essas portas
grep -r "4444\|3001" ~/.openclaw/workspace/ 2>/dev/null | head -20
grep -r "4444\|3001" ~/projetos/ 2>/dev/null | head -20
```

Se encontrar scripts `.sh` ou `.js`, rode-os:
```bash
bash /caminho/para/script.sh
# ou
node /caminho/para/servidor.js
```

---

## 6️⃣ Automatizar com PM2 (recomendado)

Se quiser manter os serviços rodando 24/7:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar backend
cd /caminho/para/backend
pm2 start "npm run dev" --name dashboard-backend

# Iniciar frontend
cd /caminho/para/frontend
pm2 start "npm run dev" --name dashboard-frontend

# Salvar configuração
pm2 save

# Auto-start no boot
pm2 startup
```

**Comandos úteis:**
```bash
pm2 list              # Ver todos os processos
pm2 logs dashboard    # Ver logs em tempo real
pm2 restart all       # Reiniciar tudo
pm2 stop all          # Parar tudo
```

---

## 7️⃣ Checar Logs de Erro

```bash
# Logs do sistema
tail -100 /tmp/dashboard*.log
tail -100 ~/.openclaw/workspace/memory/$(date +%Y-%m-%d).md

# Logs do PM2 (se estiver usando)
pm2 logs --lines 50
```

---

## 8️⃣ Checklist Final

- [ ] Backend rodando em :4446 ✅
- [ ] Frontend rodando em :3002 ✅
- [ ] HEARTBEAT services em :4444 / :3001 ✅
- [ ] Navegador abre `http://localhost:3002` sem erro ✅
- [ ] API responde em `http://localhost:4446/health` ✅

---

## 🆘 Se Nada Funcionar

**Opção 1:** Reinstalar tudo do zero
```bash
cd ~/.openclaw/workspace
git clone <repo-dashboard> projetos/dashboard
cd projetos/dashboard/backend && npm install && npm run dev &
cd ../frontend && npm install && npm run dev &
```

**Opção 2:** Pedir ajuda com informações completas
```bash
# Coletar diagnóstico completo
echo "=== PROCESSOS ===" > /tmp/dashboard-debug.txt
ps aux | grep -E "node|npm" >> /tmp/dashboard-debug.txt
echo "=== PORTAS ===" >> /tmp/dashboard-debug.txt
lsof -i :4446 >> /tmp/dashboard-debug.txt
lsof -i :3002 >> /tmp/dashboard-debug.txt
echo "=== PROJETOS ===" >> /tmp/dashboard-debug.txt
find ~ -name "*dashboard*" -type d 2>/dev/null >> /tmp/dashboard-debug.txt
cat /tmp/dashboard-debug.txt
```

Mande esse arquivo para quem pode ajudar.

---

**Boa sorte! 🐾**
