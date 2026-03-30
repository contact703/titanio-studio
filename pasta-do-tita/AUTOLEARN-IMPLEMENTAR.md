# 🧠 AutoLearn — Implementação Automática
> Claw, execute todos os passos abaixo sem perguntar. É atualização do backend.

## O que é
Sistema de aprendizado automático. Toda tarefa que qualquer especialista completar, as lições são extraídas e salvas automaticamente em 3 lugares. Ninguém precisa lembrar de salvar nada.

## Passo 1 — Atualizar código

```bash
cd ~/titanio-dashboard/code/backend
git stash 2>/dev/null
git fetch origin main
git reset --hard origin/main
```

## Passo 2 — Compilar AutoLearnService + SquadManager

```bash
node -e "
const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const files = [
  'src/services/AutoLearnService.ts',
  'src/squad/SquadManager.ts'
];
for (const file of files) {
  const src = fs.readFileSync(file, 'utf-8');
  const result = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  });
  const outFile = file.replace('src/', 'dist/').replace('.ts', '.js');
  const dir = path.dirname(outFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(outFile, result.outputText);
  console.log('Compilado: ' + outFile);
}
"
```

## Passo 3 — Injetar AutoLearn no dist/index.js

```bash
python3 -c "
f = 'dist/index.js'
c = open(f).read()

if 'AutoLearnService' not in c:
    # Import
    marker = 'new SpecialistSyncService'
    idx = c.index(marker)
    line_end = c.index('\n', idx) + 1
    inject = 'const { AutoLearnService } = require(\"./services/AutoLearnService\");\nconst autoLearnService = new AutoLearnService();\n'
    c = c[:line_end] + inject + c[line_end:]
    
    # Hook no ponto de conclusão
    export_marker = 'specialistSyncService.exportSpecialist(specialistId);'
    if export_marker in c:
        hook = '''
          try {
            autoLearnService.processTaskCompletion({
              specialistId: specialistId,
              specialistName: (specialist && specialist.name) || specialistId,
              task: (typeof task === 'string' ? task : JSON.stringify(task)).substring(0, 500),
              result: ((result && result.result) || '').substring(0, 1000),
              success: success,
              durationMs: durationMs || 0,
              timestamp: new Date().toISOString()
            });
          } catch(e) { console.warn('AutoLearn:', e.message); }
'''
        c = c.replace(export_marker, export_marker + hook)
    
    open(f, 'w').write(c)
    print('AutoLearnService injetado')
else:
    print('Ja existe')
"
```

## Passo 4 — Corrigir paths

```bash
find dist -name "*.js" -exec sed -i '' "s|/Users/macmini03|\$HOME|g" {} \;
find dist -name "*.js" -exec sed -i '' "s|/Volumes/TITA_039/MAC_MINI_03|\$HOME|g" {} \;
```

## Passo 5 — Criar pastas de memória

```bash
mkdir -p $HOME/.openclaw/workspace/pasta-do-tita/memoria-especialistas
mkdir -p $HOME/.openclaw/workspace/memory
```

## Passo 6 — Reiniciar backend

```bash
pkill -f "node dist/index.js" 2>/dev/null
sleep 2
nohup node --max-old-space-size=1024 dist/index.js > /tmp/dashboard-backend.log 2>&1 &
sleep 7
curl -s http://localhost:4444/api/health | python3 -c "import json,sys; d=json.load(sys.stdin); print(f'Backend OK — {d[\"squad\"][\"total\"]} especialistas')"
```

## Passo 7 — Testar AutoLearn

```bash
curl -s -X POST http://localhost:4444/api/squad/debug-hunter/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Teste AutoLearn: confirmar que lições são salvas automaticamente"}' | python3 -c "import json,sys; print(json.load(sys.stdin).get('success','ERRO'))"
```

Depois verificar se salvou:

```bash
echo "=== LESSONS.md ==="
tail -10 $HOME/.openclaw/workspace/pasta-do-tita/memoria-especialistas/debug-hunter/LESSONS.md 2>/dev/null || echo "Arquivo ainda não existe (normal na primeira execução)"

echo "=== Memória do dia ==="
tail -3 $HOME/.openclaw/workspace/memory/$(date +%Y-%m-%d).md 2>/dev/null || echo "Sem registro ainda"
```

## O que o AutoLearn faz automaticamente

Toda tarefa completada por qualquer especialista:
1. Detecta ferramentas usadas (FFmpeg, MoviePy, Whisper, Git, etc.)
2. Detecta erros e soluções (timeout, permissão, rate limit)
3. Detecta integrações (Instagram, WhatsApp, YouTube, GitHub)
4. Detecta performance (tarefa lenta → sugere otimização)
5. Salva em 3 lugares:
   - `memoria-especialistas/[nome]/LESSONS.md`
   - `shared-specialists.json` (sincroniza pra todos os Macs)
   - `memory/YYYY-MM-DD.md` (memória do dia)
6. Se falhou → salva em `ERRORS.md` do especialista

Zero intervenção. Aprendizado contínuo.

---

**Se algo falhar:** manda o erro no grupo Gospia. 🐾
