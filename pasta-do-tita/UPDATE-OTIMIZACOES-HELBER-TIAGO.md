# Update — Otimizações + Auto-update diário
# O OpenClaw deve executar tudo sem perguntar

---

## 1. Atualizar código

```bash
cd ~/titanio-dashboard
git pull origin main 2>/dev/null || { git fetch origin && git reset --hard origin/main; }
```

---

## 2. Rebuild

```bash
if [ -d "$HOME/titanio-dashboard/code/backend" ]; then
    BD="$HOME/titanio-dashboard/code/backend"
    FD="$HOME/titanio-dashboard/code/frontend"
else
    BD="$HOME/titanio-dashboard/backend"
    FD="$HOME/titanio-dashboard/frontend"
fi

cd "$BD" && npx tsc 2>/dev/null

# Corrigir paths hardcoded
find "$BD/dist" -name "*.js" -exec sed -i '' \
    "s|/Volumes/TITA_039/MAC_MINI_03/.openclaw|$HOME/.openclaw|g" {} \; 2>/dev/null

cd "$FD" && npx next build 2>/dev/null
```

---

## 3. Reiniciar

```bash
kill $(ps aux | grep "node.*dist/index" | grep -v grep | awk '{print $2}') 2>/dev/null
kill $(ps aux | grep "next-server\|next.*start" | grep -v grep | awk '{print $2}') 2>/dev/null
sleep 3

cd "$BD" && nohup node --max-old-space-size=512 dist/index.js >> /tmp/backend.log 2>&1 &
sleep 5
cd "$FD" && nohup npx next start -p 3001 >> /tmp/frontend.log 2>&1 &
sleep 5
```

---

## 4. Otimizar OpenClaw config

```bash
python3 << 'PYEOF'
import json, os
config = os.path.expanduser('~/.openclaw/openclaw.json')
if os.path.exists(config):
    d = json.load(open(config))
    d.pop('_smooth_switch', None)
    
    defaults = d.get('agents', {}).get('defaults', {})
    defaults['contextPruning'] = {'mode': 'cache-ttl', 'ttl': '30m'}
    defaults['compaction'] = {'mode': 'safeguard'}
    defaults['heartbeat'] = {'every': '45m'}
    defaults['maxConcurrent'] = 4
    defaults['subagents'] = {'maxConcurrent': 6}
    
    if 'model' in defaults:
        defaults['model']['primary'] = 'anthropic/claude-opus-4-6'
    
    json.dump(d, open(config, 'w'), indent=2)
    print("✅ Config otimizada (context 30m, heartbeat 45m, opus)")
PYEOF
```

---

## 5. Remover smooth-switch (bug que revertia modelo)

```bash
rm -f ~/.openclaw/workspace/squad/scripts/smooth-switch.sh 2>/dev/null
echo "# Desabilitado" > ~/.openclaw/workspace/squad/scripts/smooth-switch.sh.DISABLED 2>/dev/null
```

---

## 6. Criar update.sh (auto-update diário)

```bash
cat > ~/titanio-dashboard/update.sh << 'UPDATEEOF'
#!/bin/bash
# Auto-update Dashboard Titanio
echo "🔄 Atualizando Dashboard... $(date)"

cd ~/titanio-dashboard
git pull origin main 2>/dev/null || { git fetch origin && git reset --hard origin/main; }

if [ -d "code/backend" ]; then BD="code/backend"; FD="code/frontend"
else BD="backend"; FD="frontend"; fi

cd ~/titanio-dashboard/$BD && npx tsc 2>/dev/null
find dist -name "*.js" -exec sed -i '' "s|/Volumes/TITA_039/MAC_MINI_03/.openclaw|$HOME/.openclaw|g" {} \; 2>/dev/null
cd ~/titanio-dashboard/$FD && npx next build 2>/dev/null

# Restart
kill $(ps aux | grep "node.*dist/index" | grep -v grep | awk '{print $2}') 2>/dev/null
kill $(ps aux | grep "next-server" | grep -v grep | awk '{print $2}') 2>/dev/null
sleep 3
cd ~/titanio-dashboard/$BD && nohup node --max-old-space-size=512 dist/index.js >> /tmp/backend.log 2>&1 &
sleep 5
cd ~/titanio-dashboard/$FD && nohup npx next start -p 3001 >> /tmp/frontend.log 2>&1 &

# Sync
sleep 5
curl -s http://localhost:4444/api/projects/sync > /dev/null 2>&1
curl -s http://localhost:4444/api/specialists/sync > /dev/null 2>&1

echo "✅ Update completo $(date)"
UPDATEEOF
chmod +x ~/titanio-dashboard/update.sh
echo "✅ update.sh criado"
```

---

## 7. Cron auto-update diário 5h da manhã

```bash
(crontab -l 2>/dev/null | grep -v "update.sh"; echo "0 5 * * * bash ~/titanio-dashboard/update.sh >> /tmp/dashboard-update.log 2>&1") | crontab -
echo "✅ Cron: auto-update todo dia 5h"
```

---

## 8. Verificar

```bash
echo "=== STATUS ==="
echo -n "Backend: "; curl -m 3 -s http://localhost:4444/api/health > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "Frontend: "; curl -m 3 -s http://localhost:3001 > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "Especialistas: "; curl -m 3 -s http://localhost:4444/api/squad 2>/dev/null | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null
echo -n "Update cron: "; crontab -l 2>/dev/null | grep -q "update.sh" && echo "✅" || echo "❌"
echo -n "Modelo: "; python3 -c "import json,os; d=json.load(open(os.path.expanduser('~/.openclaw/openclaw.json'))); print(d.get('agents',{}).get('defaults',{}).get('model',{}).get('primary','?'))" 2>/dev/null
```

---

**O que muda:**
- 31 especialistas (novo: ⚙️ OpenClaw Expert)
- Config otimizada (context 30m, heartbeat 45m, sem smooth-switch)
- Auto-update diário 5h da manhã (git pull + rebuild + sync)
- Backend com limite 512MB
- Modelo fixo Opus

**Reportar resultado da seção 8 no grupo Gospia.**
