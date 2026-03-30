# Atualização — Projetos Sincronizados + Botão Novo Projeto
# O OpenClaw deve executar tudo sem perguntar

---

## 1. Atualizar código da Dashboard (git pull)

```bash
cd ~/titanio-dashboard
git pull origin main 2>/dev/null

# Se der conflito, forçar:
# git fetch origin && git reset --hard origin/main
```

---

## 2. Rebuild frontend

```bash
if [ -d "$HOME/titanio-dashboard/code/frontend" ]; then
    FRONTEND_DIR="$HOME/titanio-dashboard/code/frontend"
else
    FRONTEND_DIR="$HOME/titanio-dashboard/frontend"
fi

cd "$FRONTEND_DIR"
npx next build
```

---

## 3. Reiniciar frontend

```bash
# Matar frontend antigo
kill $(ps aux | grep "next-server\|next.*start" | grep -v grep | awk '{print $2}') 2>/dev/null
sleep 2

cd "$FRONTEND_DIR"
nohup npx next start -p 3001 > /tmp/frontend.log 2>&1 &
sleep 5
echo "✅ Frontend reiniciado"
```

---

## 4. Corrigir paths hardcoded (se necessário)

```bash
# O backend tem paths do Mac do Eduardo. Corrigir se ainda não foi feito:
if [ -d "$HOME/titanio-dashboard/code/backend/dist" ]; then
    BACKEND_DIST="$HOME/titanio-dashboard/code/backend/dist"
elif [ -d "$HOME/titanio-dashboard/backend/dist" ]; then
    BACKEND_DIST="$HOME/titanio-dashboard/backend/dist"
fi

find "$BACKEND_DIST" -name "*.js" -exec sed -i '' \
    "s|/Volumes/TITA_039/MAC_MINI_03/.openclaw|$HOME/.openclaw|g" {} \; 2>/dev/null

echo "✅ Paths corrigidos"
```

---

## 5. Sincronizar projetos compartilhados

Os projetos com visibilidade "todos" devem aparecer pra todo mundo.
Criar projetos base compartilhados se não existirem:

```bash
# Criar projetos compartilhados da Titanio
for proj in '{"name":"GospIA","description":"App de IA pastoral - React Native + Next.js + Supabase","client":"Titanio","visibility":"todos","tags":["mobile","ia","react-native"]}' \
            '{"name":"KidsHQ","description":"Controle parental - React Native + FamilyControls","client":"Titanio","visibility":"todos","tags":["mobile","swift","parental"]}' \
            '{"name":"Maricá Film Commission","description":"Site WordPress/Elementor","client":"Maricá","visibility":"todos","tags":["wordpress","web"]}'; do
    
    # Só criar se não existir (checar pelo nome)
    NAME=$(echo "$proj" | python3 -c "import sys,json; print(json.load(sys.stdin)['name'])")
    EXISTS=$(curl -s http://localhost:4444/api/projects 2>/dev/null | python3 -c "
import sys,json
projects = json.load(sys.stdin) if isinstance(json.load(open('/dev/stdin') if False else sys.stdin), list) else []
print('yes' if any(p.get('name')=='$NAME' for p in projects) else 'no')
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

## 6. Reiniciar backend (pegar novas configs)

```bash
kill $(ps aux | grep "node dist/index" | grep -v grep | awk '{print $2}') 2>/dev/null
sleep 2

if [ -d "$HOME/titanio-dashboard/code/backend" ]; then
    cd "$HOME/titanio-dashboard/code/backend"
else
    cd "$HOME/titanio-dashboard/backend"
fi
nohup node dist/index.js >> /tmp/backend.log 2>&1 &
sleep 5

curl -m 5 -s http://localhost:4444/api/projects | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'✅ {len(d)} projetos carregados')
shared = [p for p in d if p.get('visibility')=='todos']
print(f'   {len(shared)} compartilhados')
" 2>/dev/null || echo "❌ Backend não respondeu"
```

---

## 7. Verificação

```bash
echo "=== UPDATE STATUS ==="
echo -n "Backend: "; curl -m 3 -s http://localhost:4444/api/health > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "Frontend: "; curl -m 3 -s http://localhost:3001 > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "Projetos: "; curl -m 3 -s http://localhost:4444/api/projects 2>/dev/null | python3 -c "import sys,json; print(f'{len(json.load(sys.stdin))} projetos')" 2>/dev/null
echo -n "Novo Projeto: "; curl -m 3 -s -X POST http://localhost:4444/api/projects \
    -H "Content-Type: application/json" \
    -d '{"name":"teste-update","description":"teste","visibility":"pessoal"}' 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'✅ criou {d.get(\"name\",\"?\")}')" 2>/dev/null
# Deletar projeto de teste
curl -m 3 -s http://localhost:4444/api/projects 2>/dev/null | python3 -c "
import sys,json,subprocess
for p in json.load(sys.stdin):
    if p.get('name')=='teste-update':
        subprocess.run(['curl','-s','-X','DELETE',f'http://localhost:4444/api/projects/{p[\"id\"]}'],capture_output=True)
        print('   (teste deletado)')
" 2>/dev/null
```

**Reportar resultado no grupo Gospia.**
