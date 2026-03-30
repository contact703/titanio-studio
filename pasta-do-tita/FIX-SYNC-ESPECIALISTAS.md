# 🔧 Fix: Sync Especialistas + Aprendizado Real
> Para: Helber e Tiago | Data: 26/03/2026 (ATUALIZADO)
> Corrige: Sync de especialistas novos + Lições injetadas no prompt + Biblioteca de conhecimento

---

## O que acontecia

O botão "Sincronizar Tudo" sincronizava **lições e memória** dos especialistas, mas **NÃO criava especialistas novos** que foram adicionados por outro Mac. A lista de especialistas era hardcoded no `SquadManager.ts`.

## O que foi corrigido (3 coisas)

**1. Especialistas novos sincronizam automaticamente**
O `SquadManager.ts` agora carrega especialistas do `shared-specialists.json` na inicialização. Se alguém criar um novo, aparece em todos.

**2. Especialistas agora APRENDEM DE VERDADE**
Antes: salvava lições mas nunca relia. Agora: antes de cada tarefa, carrega as últimas 20 lições de alto impacto + 10 recentes e injeta no prompt. O especialista evolui com cada tarefa.

**3. Biblioteca de conhecimento acessível**
Pesquisas e estudos dos bots são salvos em `biblioteca/` e lidos automaticamente pelo especialista na próxima tarefa.

---

## Passos para implementar

### 1. Atualizar o código

```bash
cd ~/titanio-dashboard/code/backend  # ou onde estiver o backend
git pull origin main
```

### 2. Recompilar

```bash
npm run build
```

**Se `npm run build` der erro de TypeScript** (conflitos no index.ts), use o fix abaixo:

```bash
# Compilar só o SquadManager manualmente
node -e "
const ts = require('typescript');
const fs = require('fs');
const src = fs.readFileSync('src/squad/SquadManager.ts', 'utf-8');
const result = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
});
fs.writeFileSync('dist/squad/SquadManager.js', result.outputText);
console.log('SquadManager.js recompilado');
"
```

### 3. Corrigir paths hardcoded (IMPORTANTE)

Os arquivos compilados podem ter paths do Mac do Eduardo (`/Users/macmini03` ou `/Volumes/TITA_039/MAC_MINI_03`). Corrigir para o path do SEU Mac:

```bash
# Descubra seu HOME
echo $HOME

# Substitua nos arquivos compilados
# Se seu HOME é /Users/helber:
find dist -name "*.js" -exec sed -i '' 's|/Users/macmini03|/Users/helber|g' {} \;
find dist -name "*.js" -exec sed -i '' 's|/Volumes/TITA_039/MAC_MINI_03|/Users/helber|g' {} \;

# Se seu HOME é /Users/tiago:
find dist -name "*.js" -exec sed -i '' 's|/Users/macmini03|/Users/tiago|g' {} \;
find dist -name "*.js" -exec sed -i '' 's|/Volumes/TITA_039/MAC_MINI_03|/Users/tiago|g' {} \;
```

### 4. Reiniciar o backend

```bash
# Matar backend antigo
pkill -f "node dist/index.js"

# Iniciar novo
nohup node dist/index.js > /tmp/dashboard-backend.log 2>&1 &

# Verificar
sleep 5
curl -s http://localhost:4444/api/health | python3 -m json.tool
```

### 5. Clicar "Sincronizar Tudo" na Dashboard

Agora deve trazer todos os 32 especialistas, incluindo:
- 📸 Instagramer
- ⚙️ OpenClaw Expert
- Qualquer especialista que o Helber criar

---

## Como funciona agora

```
Mac A cria especialista → adiciona no shared-specialists.json
                                    ↓
Mac B clica "Sincronizar" → SquadManager lê o shared → especialista aparece
                                    ↓
Mac C clica "Sincronizar" → mesma coisa → todos iguais
```

**Não precisa mais:** git pull, npm run build, nem restart para novos especialistas aparecerem. Só clicar "Sincronizar Tudo".

---

## Verificação final

Após implementar, rode:

```bash
curl -s http://localhost:4444/api/health | python3 -c "
import json,sys
d = json.load(sys.stdin)
print(f'Especialistas: {d[\"squad\"][\"total\"]}')
"
```

Deve mostrar: **32 especialistas** (ou mais, se o Helber criou algum novo).

---

**Dúvidas?** Manda no grupo Gospia que a Tita resolve. 🐾
