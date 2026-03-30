# Instalação da Dashboard Titanio — Tiago
**Cole este guia no Mac do Tiago e siga os passos**

## Pré-requisitos
- Node.js 20+ (`node --version`)
- PostgreSQL (`brew install postgresql@16 && brew services start postgresql@16`)
- Redis (`brew install redis && brew services start redis`)

## 1. Copiar código da Dashboard

**Opção A — Via rede (Mac Mini do Eduardo ligado):**
```bash
mkdir -p ~/titanio-dashboard
rsync -av --exclude='node_modules' --exclude='.next' \
  /Volumes/TITA_039/backup-projetos/titanio-dist/titanio-tiago/code/ \
  ~/titanio-dashboard/
```

**Opção B — Via USB/airdrop:**
Copiar a pasta `titanio-dist/titanio-tiago/code/` para `~/titanio-dashboard/`

## 2. Configurar .env do Backend

```bash
cat > ~/titanio-dashboard/backend/.env << 'EOF'
PORT=4446
NODE_ENV=development
DATABASE_URL="postgresql://$(whoami):@localhost:5432/titanio_tiago?schema=public"
REDIS_URL="redis://localhost:6379"
OWNER_ID=tiago
OWNER_NAME=Tiago
OWNER_AVATAR=🧑‍💻
GATEWAY_HOST=192.168.18.174
GATEWAY_PORT=18789
BOT_SCOPE_DEFAULT=user
OWNER_PHONE=+55XXXXXXXXXX
OPENCLAW_SESSION_KEY=agent:main:main
EOF
```

## 3. Criar banco de dados

```bash
createdb titanio_tiago
```

## 4. Instalar dependências e buildar

```bash
# Backend
cd ~/titanio-dashboard/backend
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push
npx tsc
echo "✅ Backend pronto"

# Frontend
cd ~/titanio-dashboard/frontend
npm install --legacy-peer-deps

# Configurar proxy para backend
cat > next.config.js << 'NEXTJS'
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/backend/:path*', destination: 'http://localhost:4446/:path*' }]
  },
};
module.exports = nextConfig;
NEXTJS

npx next build
echo "✅ Frontend pronto"
```

## 5. Testar

```bash
# Terminal 1 — Backend
cd ~/titanio-dashboard/backend
node dist/index.js
# Deve mostrar: Server running on port 4446

# Terminal 2 — Frontend
cd ~/titanio-dashboard/frontend
npx next start -p 3002
# Acessar: http://localhost:3002
```

## 6. Script de inicialização rápida

```bash
cat > ~/titanio-dashboard/start.sh << 'EOF'
#!/bin/bash
echo "▶ Iniciando Dashboard Tiago..."
lsof -ti :4446 | xargs kill -9 2>/dev/null
lsof -ti :3002 | xargs kill -9 2>/dev/null
sleep 1

cd ~/titanio-dashboard/backend
nohup node dist/index.js > /tmp/backend-tiago.log 2>&1 &
echo "✅ Backend PID $! (porta 4446)"

sleep 3
cd ~/titanio-dashboard/frontend
nohup npx next start -p 3002 > /tmp/frontend-tiago.log 2>&1 &
echo "✅ Frontend em http://localhost:3002"
EOF
chmod +x ~/titanio-dashboard/start.sh
```

Para iniciar: `bash ~/titanio-dashboard/start.sh`

## 7. Auto-start (launchd)

```bash
cat > ~/Library/LaunchAgents/com.titanio.dashboard-backend.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.titanio.dashboard-backend</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-c</string>
    <string>cd ~/titanio-dashboard/backend && node dist/index.js</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/backend-tiago.log</string>
  <key>StandardErrorPath</key><string>/tmp/backend-tiago-error.log</string>
</dict>
</plist>
EOF

cat > ~/Library/LaunchAgents/com.titanio.dashboard-frontend.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.titanio.dashboard-frontend</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string><string>-c</string>
    <string>cd ~/titanio-dashboard/frontend && npx next start -p 3002</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/tmp/frontend-tiago.log</string>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/com.titanio.dashboard-backend.plist
launchctl load ~/Library/LaunchAgents/com.titanio.dashboard-frontend.plist
```

## 8. Checklist

```bash
echo -n "1. PostgreSQL: "; pg_isready > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "2. Redis: "; redis-cli ping 2>/dev/null | grep -q PONG && echo "✅" || echo "❌"
echo -n "3. Backend: "; curl -s http://localhost:4446/api/ping > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "4. Frontend: "; curl -s http://localhost:3002 > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "5. Gateway: "; curl -s http://192.168.18.174:18789 > /dev/null 2>&1 && echo "✅" || echo "❌ (Mac principal desligado?)"
```

## Stack da Dashboard
- **Backend:** Express + Prisma + PostgreSQL + Redis + Socket.IO
- **Frontend:** Next.js 14 + React + TailwindCSS + Zustand + Recharts
- **Portas:** Backend 4446 / Frontend 3002

## Troubleshooting

**npm install falha:**
→ Apagar `node_modules` e `package-lock.json`, tentar de novo com `--legacy-peer-deps`

**Prisma erro:**
→ `npx prisma generate && npx prisma db push`

**Backend não conecta ao PostgreSQL:**
→ `brew services restart postgresql@16` e verificar `DATABASE_URL` no .env

**Frontend dá erro de build:**
→ `rm -rf .next && npx next build`
