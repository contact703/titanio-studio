# Atualização Dashboard — Aba Projetos Completa + Auto-Assign
# O OpenClaw deve executar tudo sem perguntar

---

## 1. Atualizar código do GitHub

```bash
cd ~/titanio-dashboard
git pull origin main

# Se der conflito:
# git fetch origin && git reset --hard origin/main
```

---

## 2. Rebuild backend (tem mudanças no TypeScript)

```bash
if [ -d "$HOME/titanio-dashboard/code/backend" ]; then
    BD="$HOME/titanio-dashboard/code/backend"
else
    BD="$HOME/titanio-dashboard/backend"
fi

cd "$BD"
npx tsc 2>/dev/null

# Corrigir paths hardcoded (se necessário)
find "$BD/dist" -name "*.js" -exec sed -i '' \
    "s|/Volumes/TITA_039/MAC_MINI_03/.openclaw|$HOME/.openclaw|g" {} \; 2>/dev/null

echo "✅ Backend recompilado"
```

---

## 3. Rebuild frontend

```bash
if [ -d "$HOME/titanio-dashboard/code/frontend" ]; then
    FD="$HOME/titanio-dashboard/code/frontend"
else
    FD="$HOME/titanio-dashboard/frontend"
fi

cd "$FD"
npx next build
echo "✅ Frontend rebuildado"
```

---

## 4. Reiniciar tudo

```bash
# Matar processos antigos
kill $(ps aux | grep "node dist/index" | grep -v grep | awk '{print $2}') 2>/dev/null
kill $(ps aux | grep "next-server\|next.*start" | grep -v grep | awk '{print $2}') 2>/dev/null
sleep 3

# Backend
cd "$BD"
nohup node dist/index.js >> /tmp/backend.log 2>&1 &
echo "✅ Backend PID $!"
sleep 5

# Frontend
cd "$FD"
nohup npx next start -p 3001 >> /tmp/frontend.log 2>&1 &
echo "✅ Frontend http://localhost:3001"
```

---

## 5. Criar projetos compartilhados (se não existirem)

```bash
for proj in \
    '{"name":"GospIA","description":"App IA pastoral — React Native + Next.js + Supabase","client":"Titanio","visibility":"todos","tags":["mobile","ia","react-native"]}' \
    '{"name":"KidsHQ","description":"Controle parental — React Native + FamilyControls","client":"Titanio","visibility":"todos","tags":["mobile","swift"]}' \
    '{"name":"Maricá Film Commission","description":"Site WordPress/Elementor","client":"Maricá","visibility":"todos","tags":["wordpress","web"]}'; do

    NAME=$(echo "$proj" | python3 -c "import sys,json; print(json.load(sys.stdin)['name'])")
    EXISTS=$(curl -s http://localhost:4444/api/projects 2>/dev/null | python3 -c "
import sys,json
try:
    projects = json.load(sys.stdin)
    print('yes' if any(p.get('name')=='$NAME' for p in projects) else 'no')
except: print('no')
" 2>/dev/null)

    if [ "$EXISTS" != "yes" ]; then
        curl -s -X POST http://localhost:4444/api/projects \
            -H "Content-Type: application/json" \
            -d "$proj" > /dev/null 2>&1
        echo "✅ Projeto criado: $NAME"
    else
        echo "⏭️ Já existe: $NAME"
    fi
done
```

---

## 6. Verificar

```bash
echo "=== UPDATE STATUS ==="
echo -n "Backend: "; curl -m 3 -s http://localhost:4444/api/health > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "Frontend: "; curl -m 3 -s http://localhost:3001 > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "Especialistas: "; curl -m 3 -s http://localhost:4444/api/squad 2>/dev/null | python3 -c "import sys,json; print(f'{len(json.load(sys.stdin))}')" 2>/dev/null
echo -n "Projetos: "; curl -m 3 -s http://localhost:4444/api/projects 2>/dev/null | python3 -c "import sys,json; print(f'{len(json.load(sys.stdin))}')" 2>/dev/null

# Teste rápido de criar projeto
curl -s -X POST http://localhost:4444/api/projects \
    -H "Content-Type: application/json" \
    -d '{"name":"teste-update-v2","description":"teste","visibility":"pessoal"}' 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ Criar projeto: OK ({d.get(\"name\")})')" 2>/dev/null

# Verificar se pasta foi criada
ls ~/.openclaw/workspace/projetos/teste-update-v2/ 2>/dev/null && echo "✅ Pasta criada automaticamente" || echo "⚠️ Pasta não criada"

# Limpar teste
curl -s http://localhost:4444/api/projects 2>/dev/null | python3 -c "
import sys,json,subprocess
for p in json.load(sys.stdin):
    if p.get('name')=='teste-update-v2':
        subprocess.run(['curl','-s','-X','DELETE',f'http://localhost:4444/api/projects/{p[\"id\"]}'],capture_output=True)
        print('✅ Teste deletado')
" 2>/dev/null
```

---

## O que mudou nesta atualização

**Novos componentes frontend:**
- EditProjectModal — editar nome, descrição, cliente, deadline, tags, visibilidade
- ProjectDetailModal — ver detalhes, especialistas, bots, pasta do projeto
- ProjectConfigModal — configurar status, budget, membros, tags
- ProjectReportsPanel — relatórios e stats

**Backend:**
- Ao criar projeto: cria pasta automática em `~/.openclaw/workspace/projetos/{nome}/` com docs/, reports/, assets/ e README.md
- Auto-assign: ao executar tarefa com projectId, especialista é vinculado ao projeto automaticamente
- Campo `specialists` adicionado ao tipo Project

**Reportar resultado no grupo Gospia.**
