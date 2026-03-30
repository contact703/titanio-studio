# 🔧 Sync Definitivo v3 — Especialistas + Aprendizado + Definições
> Para: Helber e Tiago | Data: 26/03/2026
> Substitui TODOS os MDs anteriores de sync

---

## O que este fix resolve (tudo de uma vez)

1. **Especialistas novos aparecem em todos os Macs automaticamente** (sem git pull)
2. **Especialistas aprendem de verdade** (lições injetadas no prompt antes de cada tarefa)
3. **Biblioteca de conhecimento** é lida pelo especialista (pesquisas, estudos)
4. **Tudo que um especialista aprende fica disponível para todas as Dashboards**
5. **Compatível com o specialist-definitions.json que o Helber criou**

---

## Arquitetura Final

```
/Volumes/TITA_039/
├── specialist-definitions.json    ← DEFINIÇÕES (quem é cada especialista)
│   Fonte: POST /api/squad ou edição direta
│   Lido por: SquadManager na inicialização
│
├── shared-specialists.json        ← LIÇÕES E MEMÓRIA (o que cada um aprendeu)
│   Fonte: Botão "Sincronizar Tudo" ou auto-export pós-tarefa
│   Lido por: SpecialistSyncService
│
└── [cada Mac]
    └── memoria-especialistas/
        └── {id}/
            ├── lessons.json       ← lições locais (sincroniza com shared)
            ├── memory.json        ← stats do especialista
            └── biblioteca/        ← pesquisas, estudos, documentos
```

**Fluxo:**
- Mac A cria especialista → salva no `specialist-definitions.json`
- Mac B inicia → lê definitions → especialista aparece
- Especialista faz tarefa → lê lições anteriores → executa melhor → salva nova lição
- Mac B sincroniza → lições do Mac A aparecem no Mac B e vice-versa

---

## Passos para implementar

### 1. Atualizar código do backend

```bash
cd ~/titanio-dashboard/code/backend   # ajuste pro path do seu Mac
git pull origin main
```

### 2. Recompilar SquadManager

O `npm run build` pode dar erros de TypeScript por conflitos de merge. Use este método direto:

```bash
node -e "
const ts = require('typescript');
const fs = require('fs');
const src = fs.readFileSync('src/squad/SquadManager.ts', 'utf-8');
const result = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
});
fs.writeFileSync('dist/squad/SquadManager.js', result.outputText);
console.log('SquadManager recompilado');
"
```

### 3. Corrigir paths hardcoded nos JS compilados

```bash
# Descubra seu HOME
echo $HOME

# Se for /Users/helber:
find dist -name "*.js" -exec sed -i '' 's|/Users/macmini03|/Users/helber|g' {} \;
find dist -name "*.js" -exec sed -i '' 's|/Volumes/TITA_039/MAC_MINI_03|/Users/helber|g' {} \;

# Se for /Users/tiago:
find dist -name "*.js" -exec sed -i '' 's|/Users/macmini03|/Users/tiago|g' {} \;
find dist -name "*.js" -exec sed -i '' 's|/Volumes/TITA_039/MAC_MINI_03|/Users/tiago|g' {} \;
```

### 4. Remover endpoint duplicado (IMPORTANTE)

O merge criou um endpoint `/api/specialists/sync` duplicado que crasha. Remover:

```bash
# Procurar a linha com "importedBySpecialist" no dist/index.js
grep -n "importedBySpecialist" dist/index.js
```

Se encontrar, remover o bloco inteiro (o segundo `/api/specialists/sync`):

```bash
# Ou usar este comando que faz automaticamente:
python3 -c "
content = open('dist/index.js').read()
marker = 'const { imported, exported, specialistsUpdated, importedBySpecialist }'
if marker in content:
    # Encontrar e remover o bloco duplicado
    start = content.find('// Sync specialists — bidirecional')
    if start > 0:
        end = content.find('});', content.find('res.status(500)', start)) + 3
        content = content[:start] + '// REMOVIDO: endpoint duplicado' + content[end:]
        open('dist/index.js','w').write(content)
        print('Endpoint duplicado removido')
else:
    print('OK - sem duplicata')
"
```

### 5. Corrigir duplicatas no frontend (ProjectsTab.tsx)

O merge duplicou os botões "Sincronizar Tudo" e "Novo Projeto". Verificar:

```bash
grep -c "Sincronizar Tudo" code/frontend/components/projects/ProjectsTab.tsx
```

Se mostrar **2**, abrir o arquivo e remover o segundo bloco `<div className="flex items-center gap-3">` que tem os mesmos botões.

### 6. Reiniciar

```bash
pkill -f "node dist/index.js"
sleep 2
cd ~/titanio-dashboard/code/backend
nohup node dist/index.js > /tmp/dashboard-backend.log 2>&1 &

# Frontend (se necessário)
cd ~/titanio-dashboard/code/frontend
pkill -f "next dev"
rm -rf .next
nohup npm run dev -- -p 3000 > /tmp/dashboard-frontend.log 2>&1 &
```

### 7. Verificar

```bash
# Backend
sleep 5
curl -s http://localhost:4444/api/health | python3 -c "
import json,sys
d = json.load(sys.stdin)
print(f'Especialistas: {d[\"squad\"][\"total\"]}')
"

# Sync
curl -s http://localhost:4444/api/specialists/sync | python3 -m json.tool

# Frontend
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000
```

**Esperado:**
- Especialistas: **33** (ou mais se criar novos)
- Sync: `success: true`
- Frontend: **200**

---

## Como criar especialista novo (qualquer Mac)

```bash
curl -X POST http://localhost:4444/api/squad \
  -H "Content-Type: application/json" \
  -d '{
    "id": "meu-especialista",
    "name": "🆕 Meu Especialista",
    "role": "Descrição do papel",
    "skills": ["skill1", "skill2"],
    "description": "O que ele faz"
  }'
```

Ele aparece automaticamente em TODOS os Macs na próxima inicialização ou sync.

---

## Como funciona o aprendizado real

**Antes:** especialista fazia tarefa → salvava lição → **esquecia tudo** → repetia erros

**Agora:** especialista faz tarefa → **lê últimas 20 lições de alto impacto + 10 recentes** → executa melhor → salva nova lição → evolui

O prompt do especialista agora inclui:
```
LIÇÕES APRENDIDAS (experiências anteriores — USE para melhorar):
- [high] Nunca fazer rm sem confirmação — usar trash
- [high] Paths hardcoded são problema em multi-Mac
- [medium] Tarefa executada: verificação de segurança completa
...

BIBLIOTECA DE CONHECIMENTO (X documentos disponíveis):
- SINTESE-CODINGKNOWLEDGE.md
- research-design-instagram.md
...
```

---

## Auto-update (git pull automático)

Para nunca mais precisar fazer git pull manual, configurar cron das 5h:

```bash
# Criar script de auto-update
cat > ~/titanio-dashboard/update.sh << 'EOF'
#!/bin/bash
cd ~/titanio-dashboard/code/backend
git pull origin main 2>/dev/null

# Recompilar SquadManager automaticamente
node -e "
const ts = require('typescript');
const fs = require('fs');
const src = fs.readFileSync('src/squad/SquadManager.ts', 'utf-8');
const result = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
});
fs.writeFileSync('dist/squad/SquadManager.js', result.outputText);
" 2>/dev/null

# Corrigir paths para este Mac
HOME_DIR=$(echo $HOME)
find dist -name "*.js" -exec sed -i '' "s|/Users/macmini03|$HOME_DIR|g" {} \; 2>/dev/null
find dist -name "*.js" -exec sed -i '' "s|/Volumes/TITA_039/MAC_MINI_03|$HOME_DIR|g" {} \; 2>/dev/null

# Reiniciar backend
pkill -f "node dist/index.js" 2>/dev/null
sleep 2
nohup node dist/index.js > /tmp/dashboard-backend.log 2>&1 &

echo "[$(date)] Auto-update concluído" >> /tmp/dashboard-auto-update.log
EOF

chmod +x ~/titanio-dashboard/update.sh

# Agendar para rodar todo dia às 5h
(crontab -l 2>/dev/null; echo "0 5 * * * bash ~/titanio-dashboard/update.sh") | crontab -

# Verificar
crontab -l
```

Depois disso, todo dia às 5h: git pull + recompila + corrige paths + reinicia. Zero intervenção.

---

## Checklist final

- [ ] `git pull origin main`
- [ ] Recompilar SquadManager (node -e "...")
- [ ] Corrigir paths (sed)
- [ ] Remover endpoint duplicado
- [ ] Corrigir frontend duplicatas (se houver)
- [ ] Reiniciar backend + frontend
- [ ] Verificar: 33+ especialistas, sync success, frontend 200
- [ ] Clicar "Sincronizar Tudo" na Dashboard

**Se tudo funcionar: reporta no grupo Gospia.** 🐾
