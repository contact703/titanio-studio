# Avatares e Distribuição - Titanio Dashboard
**Data:** 2026-03-13

## ✅ TAREFA 1: Avatares reais implementados

### Backend (SquadManager.ts)
- Todos os 8 especialistas agora usam caminhos de imagem real:
  - `code-ninja` → `/specialists/code-ninja.jpg`
  - `design-wizard` → `/specialists/design-wizard.jpg`
  - `debug-hunter` → `/specialists/debug-hunter.jpg`
  - `devops-ninja` → `/specialists/devops-ninja.jpg`
  - `aso-specialist` → `/specialists/aso-specialist.jpg`
  - `growth-hacker` → `/specialists/growth-hacker.jpg`
  - `api-master` → `/specialists/api-master.jpg`
  - `security-guard` → `/specialists/security-guard.jpg`

### Frontend
- `SquadPanel.tsx`: já tinha lógica para detectar emoji vs imagem (campo `isEmoji`) ✅
- `app/page.tsx` (Squad Status): atualizado para mostrar `<img>` quando avatar começa com `/`
- Bug pré-existente corrigido: `BotsPanel`, `ActivityPanel`, `ReportsPanel` não aceitavam props → adicionados tipos opcionais

### Build
- Backend: compilado com sucesso (`npm run build`)
- Frontend: build Next.js concluído com sucesso ✅
- Serviços reiniciados: backend na 4444, frontend na 3000

## ✅ TAREFA 2: Distribuição criada

Pasta: `/Volumes/TITA_039/backup-projetos/titanio-dist/`
- `titanio-helber/` — cópia completa com `.env` customizado (porta 4445/3001)
- `titanio-tiago/` — cópia completa com `.env` customizado (porta 4446/3002)

### .env Helber
- PORT=4445, OWNER_ID=helber, JWT_SECRET=helber-titanio-2026

### .env Tiago  
- PORT=4446, OWNER_ID=tiago, JWT_SECRET=tiago-titanio-2026

## ✅ TAREFA 3: Scripts de start

- `/Volumes/TITA_039/backup-projetos/titanio-dist/titanio-helber/START.sh` → porta 3001/4445
- `/Volumes/TITA_039/backup-projetos/titanio-dist/titanio-tiago/START.sh` → porta 3002/4446
- Ambos com `chmod +x`, instalam deps, fazem build, e sobem em background com `nohup`

## ✅ TAREFA 4: Dashboard Eduardo rebuilda e rodando

- Confirmado via API: `curl http://localhost:4444/api/squad` retorna avatares com paths reais
- Frontend rodando em http://localhost:3000
- Backend rodando em http://localhost:4444

## Instrução para Helber/Tiago
1. Copiar pasta `titanio-helber/` ou `titanio-tiago/` para o Mac deles
2. Rodar `./START.sh` (pode precisar de `chmod +x START.sh` primeiro)
3. Acessar http://localhost:3001 (Helber) ou http://localhost:3002 (Tiago)
4. Precisa ter Node.js 18+ instalado
