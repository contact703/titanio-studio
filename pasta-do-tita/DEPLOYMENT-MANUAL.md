# 🚀 DEPLOYMENT MANUAL — Dashboard Titanio para Helber & Tiago

**Versão:** 3.0  
**Data:** 2026-03-23  
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

---

## PASSO 1: Clonar repositório da Dashboard

```bash
# Clonar do Mac Mini principal (via rede local)
cp -r /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard/code ~/titanio-dashboard

cd ~/titanio-dashboard
npm install
```

---

## PASSO 2: 🧠 SINCRONIZAR MEMÓRIA DOS ESPECIALISTAS (OBRIGATÓRIO)

Este passo garante que todos os especialistas tenham a mesma memória e aprendizado.

```bash
# Clonar repo de memória compartilhada
cd ~/titanio-dashboard
git clone https://github.com/contact703/tita-memory.git .tita-memory

# Copiar memória para o lugar correto
cp -r .tita-memory/pasta-do-tita/memoria-especialistas ./memoria-especialistas

echo "✅ Memória dos especialistas sincronizada"
```

---

## PASSO 3: Configurar variáveis de ambiente

```bash
cat > .env << 'EOF'
# API Keys
ANTHROPIC_API_KEY=sua_key_aqui
OPENAI_API_KEY=sua_key_aqui

# Paths
SPECIALIST_MEMORY_PATH=./memoria-especialistas
TITA_MEMORY_REPO=https://github.com/contact703/tita-memory.git

# Dashboard
PORT=4444
FRONTEND_PORT=3000
EOF
```

---

## PASSO 4: Iniciar serviços

```bash
# Backend
cd ~/titanio-dashboard/backend
npm run build
npm start &

# Frontend
cd ~/titanio-dashboard/frontend  
npm run build
npm start &

echo "✅ Dashboard rodando em http://localhost:4444"
```

---

## PASSO 5: 🔄 Configurar sincronização automática de memória

```bash
# Copiar script de sync do Mac Mini principal
cp /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/sync-specialist-memory.sh ~/bin/

# Testar sync
bash ~/bin/sync-specialist-memory.sh pull
bash ~/bin/sync-specialist-memory.sh push

# Agendar sync a cada 30 minutos (LaunchAgent macOS)
cat > ~/Library/LaunchAgents/com.titanio.memory.sync.plist << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.titanio.memory.sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>bash</string>
        <string>/Users/SEU_USUARIO/bin/sync-specialist-memory.sh</string>
        <string>auto</string>
    </array>
    <key>StartInterval</key>
    <integer>1800</integer>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
PLIST

launchctl load ~/Library/LaunchAgents/com.titanio.memory.sync.plist
echo "✅ Sync automático configurado (a cada 30 min)"
```

---

## PASSO 6: Verificar instalação

```bash
# Verificar backend
curl http://localhost:4444/api/health

# Verificar especialistas com memória
curl http://localhost:4444/api/specialists/automation-bot/memory | jq '.memory.stats'

# Verificar sync funciona
bash ~/bin/sync-specialist-memory.sh auto
```

---

## 🔄 COMO A MEMÓRIA COMPARTILHADA FUNCIONA

```
Mac Mini (TITA_039) — Fonte principal
       ↕ (Git push/pull a cada 30 min)
GitHub (contact703/tita-memory)
       ↕ (Git push/pull a cada 30 min)
Mac do Helber — mesmos especialistas
Mac do Tiago  — mesmos especialistas

Resultado:
- Helber ensina algo ao Code Ninja → vai pro Git
- Tiago faz git pull → Code Ninja do Tiago já sabe
- Tita aprende algo novo → todos recebem
```

---

## 🔑 CREDENCIAIS E ACESSOS

- **GitHub repo memória:** https://github.com/contact703/tita-memory
- **Token GitHub:** pedir para Eduardo (contact@titaniofilms.com)
- **Mac Mini compartilhado:** /Volumes/TITA_039/MAC_MINI_03/ (rede local)
- **N8n workflows:** copiar de /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/n8n-workflows/

---

## 📞 SUPORTE

Se algo falhar:
1. Verificar que Mac Mini está ligado e acessível
2. Verificar conexão de rede local
3. Verificar que GitHub token tem permissão de push
4. Reportar erro para Eduardo/Tita

---

**Atualizado:** 2026-03-23  
**Responsável:** Tita 🐾
