# COMO-INICIAR.md — Inicialização do Paperclip

## Método Rápido (Script Customizado)

```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/paperclip
bash start.sh
```

O script:
1. Ativa o nvm e usa Node v20.20.2
2. Mata processos anteriores de paperclip/dev-watch
3. Aguarda 2 segundos
4. Roda `pnpm dev` em background via nohup
5. Log vai para `/tmp/paperclip.log`

## Verificar se Está Rodando

```bash
curl http://localhost:3100/api/health
lsof -i :3100
```

## Acompanhar o Log

```bash
tail -f /tmp/paperclip.log
```

## Parar o Servidor

```bash
pkill -f "paperclip.*dev-watch"
pkill -f "tsx src/index.ts"
# ou
pkill -f "pnpm dev"
```

## Iniciar Manualmente (Modo Dev)

```bash
# Ativar Node 20 primeiro
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use v20.20.2

cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/paperclip
pnpm dev
```

## Iniciar em Background (Alternativo)

```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/paperclip
nohup pnpm dev > /tmp/paperclip.log 2>&1 &
echo "PID: $!"
```

## Conteúdo do start.sh

```bash
#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use v20.20.2 2>/dev/null
export PATH="$HOME/.local/bin:$PATH"
cd "$(dirname "$0")"
pkill -f "paperclip.*dev-watch" 2>/dev/null
sleep 2
nohup pnpm dev > /tmp/paperclip.log 2>&1 &
echo "Paperclip iniciado em http://localhost:3100"
```

## Acesso

- **Interface Web**: http://localhost:3100
- **API Health**: http://localhost:3100/api/health
- **API Agentes**: http://localhost:3100/api/companies/b7260a8e-1e1e-48e4-bd70-e06f36b6ab74/agents
- **API Goals**: http://localhost:3100/api/companies/b7260a8e-1e1e-48e4-bd70-e06f36b6ab74/goals

## ⚠️ Notas Importantes

1. **Node 22 NÃO funciona** — usar Node 20 via nvm obrigatório
2. **Bug tsx**: foi corrigido pelo Debug Hunter — não reverter patches
3. O banco Postgres embedded inicia automaticamente junto com o servidor
4. Backups automáticos a cada hora em `/Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/data/backups/`
5. Sem `DATABASE_URL` setado = usa PostgreSQL embedded (padrão)

## Autostart (LaunchAgent macOS)

Para iniciar automaticamente no boot:

```bash
# Criar arquivo ~/Library/LaunchAgents/com.titanio.paperclip.plist
# Conteúdo mínimo:
cat > ~/Library/LaunchAgents/com.titanio.paperclip.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.titanio.paperclip</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/paperclip/start.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>
EOF

launchctl load ~/Library/LaunchAgents/com.titanio.paperclip.plist
```
