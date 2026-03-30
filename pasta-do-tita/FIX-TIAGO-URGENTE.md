# 🚑 Fix Urgente Tiago — Copiar e Colar no Terminal
> Data: 26/03/2026 | Resolve: backend travado, sync quebrado, git conflito

**Copie TUDO abaixo e cole no terminal de uma vez. Não precisa fazer nada mais.**

---

```bash
#!/bin/bash
echo "🔧 FIX TIAGO — Iniciando..."

cd ~/titanio-dashboard/code/backend || cd ~/titanio-dashboard || { echo "❌ Pasta não encontrada"; exit 1; }

# 1. Matar tudo que tá rodando
echo "1/8 Matando processos..."
pkill -f "node dist/index.js" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

# 2. Resolver git
echo "2/8 Resolvendo git..."
git stash 2>/dev/null
git checkout -- . 2>/dev/null
git pull origin main 2>&1 || {
    echo "Git pull falhou, resetando..."
    git fetch origin main
    git reset --hard origin/main
}
git stash pop 2>/dev/null

# 3. Recompilar SquadManager
echo "3/8 Recompilando SquadManager..."
cd code/backend 2>/dev/null || true
node -e "
const ts = require('typescript');
const fs = require('fs');
const src = fs.readFileSync('src/squad/SquadManager.ts', 'utf-8');
const result = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
});
fs.writeFileSync('dist/squad/SquadManager.js', result.outputText);
console.log('✅ SquadManager recompilado');
"

# 4. Corrigir TODOS os paths hardcoded
echo "4/8 Corrigindo paths..."
MY_HOME="$HOME"
find dist -name "*.js" -exec sed -i '' "s|/Users/macmini03|$MY_HOME|g" {} \; 2>/dev/null
find dist -name "*.js" -exec sed -i '' "s|/Volumes/TITA_039/MAC_MINI_03|$MY_HOME|g" {} \; 2>/dev/null
echo "   Paths corrigidos para: $MY_HOME"

# 5. Remover endpoint duplicado que crasha
echo "5/8 Removendo endpoint duplicado..."
python3 -c "
f = 'dist/index.js'
c = open(f).read()
bad = 'importedBySpecialist'
if bad in c:
    start = c.rfind('// Sync specialists', 0, c.find(bad))
    if start > 0:
        end = c.find('});', c.find('res.status(500)', start)) + 3
        c = c[:start] + '// REMOVIDO: endpoint duplicado\n' + c[end:]
        open(f, 'w').write(c)
        print('✅ Endpoint duplicado removido')
    else:
        print('⚠️ Bloco não encontrado com precisão — verifique manualmente')
else:
    print('✅ Sem duplicata')
"

# 6. Garantir DASHBOARD_USER no .env
echo "6/8 Configurando identidade..."
if ! grep -q "DASHBOARD_USER" .env 2>/dev/null; then
    echo "" >> .env
    echo "DASHBOARD_USER=tiago" >> .env
    echo "   DASHBOARD_USER=tiago adicionado ao .env"
else
    echo "   DASHBOARD_USER já existe no .env"
fi

# 7. Criar pasta de memória dos especialistas se não existir
echo "7/8 Criando pastas necessárias..."
mkdir -p "$MY_HOME/.openclaw/workspace/pasta-do-tita/memoria-especialistas" 2>/dev/null
mkdir -p "$MY_HOME/titanio-dashboard/code/backend/media/incoming" 2>/dev/null
mkdir -p "$MY_HOME/titanio-dashboard/code/backend/media/processed" 2>/dev/null

# 8. Iniciar backend
echo "8/8 Iniciando backend..."
nohup node --max-old-space-size=512 dist/index.js > /tmp/dashboard-backend.log 2>&1 &
sleep 6

# Verificar
HEALTH=$(curl -s --max-time 5 http://localhost:4444/api/health 2>/dev/null)
if echo "$HEALTH" | grep -q "ok"; then
    SPECIALISTS=$(echo "$HEALTH" | python3 -c "import json,sys; print(json.load(sys.stdin)['squad']['total'])" 2>/dev/null)
    echo ""
    echo "========================================="
    echo "✅ BACKEND ONLINE — $SPECIALISTS especialistas"
    echo "========================================="
    echo ""
    echo "Agora teste o sync:"
    echo "  curl -s http://localhost:4444/api/specialists/sync | python3 -m json.tool"
    echo ""
    echo "Para o frontend:"
    echo "  cd ../frontend && pkill -f 'next dev' && rm -rf .next && nohup npm run dev -- -p 3001 > /tmp/dashboard-frontend.log 2>&1 &"
else
    echo ""
    echo "❌ Backend não respondeu. Verificar log:"
    echo "  tail -20 /tmp/dashboard-backend.log"
fi
```

---

## Se o script acima não funcionar

Execute linha por linha:

```bash
# Ir pro diretório
cd ~/titanio-dashboard/code/backend

# Matar tudo
pkill -f "node dist/index.js"

# Reset total do git (CUIDADO: perde mudanças locais)
git fetch origin main
git reset --hard origin/main

# Recompilar
node -e "const ts=require('typescript');const fs=require('fs');const src=fs.readFileSync('src/squad/SquadManager.ts','utf-8');const r=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}});fs.writeFileSync('dist/squad/SquadManager.js',r.outputText);console.log('OK')"

# Corrigir paths
find dist -name "*.js" -exec sed -i '' "s|/Users/macmini03|$HOME|g" {} \;
find dist -name "*.js" -exec sed -i '' "s|/Volumes/TITA_039/MAC_MINI_03|$HOME|g" {} \;

# Adicionar identidade
echo "DASHBOARD_USER=tiago" >> .env

# Criar pastas
mkdir -p $HOME/.openclaw/workspace/pasta-do-tita/memoria-especialistas

# Iniciar
nohup node --max-old-space-size=512 dist/index.js > /tmp/dashboard-backend.log 2>&1 &

# Testar (esperar 6 segundos)
sleep 6 && curl -s http://localhost:4444/api/health
```

---

## Depois do backend funcionar — Frontend:

```bash
cd ~/titanio-dashboard/code/frontend
pkill -f "next dev"
rm -rf .next
nohup npm run dev -- -p 3001 > /tmp/dashboard-frontend.log 2>&1 &
sleep 20
curl -s -o /dev/null -w '%{http_code}' http://localhost:3001
```

Deve retornar **200**.

---

**Se NADA funcionar:** manda o erro no grupo que a Tita resolve. 🐾
