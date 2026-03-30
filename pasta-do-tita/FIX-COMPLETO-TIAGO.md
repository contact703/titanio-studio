# Fix Completo — Dashboard + Especialistas + Nome — Tiago
# O OpenClaw do Tiago deve executar TUDO sem perguntar

---

## 1. DIAGNÓSTICO — Ver o estado atual

```bash
echo "╔══════════════════════════════════════════════╗"
echo "║        DIAGNÓSTICO TIAGO                      ║"
echo "╠══════════════════════════════════════════════╣"

echo -n "║ Backend (4444):    "; curl -m 3 -s http://localhost:4444/api/health > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ Frontend (3001):   "; curl -m 3 -s http://localhost:3001 > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ Especialistas:     "; curl -m 3 -s http://localhost:4444/api/squad 2>/dev/null | python3 -c "import sys,json; print(f'{len(json.load(sys.stdin))} ║')" 2>/dev/null || echo "? ║"
echo -n "║ Usuário Dashboard: "; curl -m 3 -s http://localhost:4444/api/auth/me 2>/dev/null | python3 -c "import sys,json; print(f'{json.load(sys.stdin).get(\"user\",{}).get(\"displayName\",\"?\")} ║')" 2>/dev/null || echo "? ║"
echo -n "║ .env OWNER_NAME:   "; grep "OWNER_NAME" $(find ~/titanio-dashboard -name ".env" -path "*/backend/*" | head -1) 2>/dev/null || echo "? ║"

echo ""
echo "║ Teste especialista (Code Ninja):"
curl -m 15 -s -X POST http://localhost:4444/api/squad/code-ninja/task \
  -H "Content-Type: application/json" \
  -d '{"task":"Diga apenas: OK","context":"Teste rápido"}' 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'║   Resposta: {d.get(\"result\",\"FALHOU\")[:50]}')
print(f'║   Sucesso: {d.get(\"success\",\"?\")}')
" 2>/dev/null || echo "║   ❌ FALHOU"

echo "╚══════════════════════════════════════════════╝"
```

---

## 2. CORRIGIR NOME — Helber → Tiago

### 2.1 Trocar via API
```bash
curl -s -X POST http://localhost:4444/api/auth/select \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-tiago","rememberMachine":true}' > /dev/null 2>&1

# Confirmar
NOME=$(curl -s http://localhost:4444/api/auth/me 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('displayName','?'))" 2>/dev/null)
echo "Dashboard mostra: $NOME"
```

### 2.2 Forçar no arquivo de sessão
```bash
BACKEND_DIR=$(find ~/titanio-dashboard -name "index.js" -path "*/dist/*" | head -1 | xargs dirname 2>/dev/null)
[ -z "$BACKEND_DIR" ] && BACKEND_DIR="$HOME/titanio-dashboard/backend/dist"

mkdir -p "$BACKEND_DIR/../.data/quickauth"

cat > "$BACKEND_DIR/../.data/quickauth/current-session.json" << 'EOF'
{"userId":"user-tiago","machineId":"auto","startedAt":"2026-03-25T00:00:00Z"}
EOF

# Machine map
cat > "$BACKEND_DIR/../.data/quickauth/machine-map.json" << 'EOF'
{"auto":"user-tiago"}
EOF

echo "✅ Sessão forçada: Tiago"
```

### 2.3 Corrigir .env
```bash
BACKEND_ENV=$(find ~/titanio-dashboard -name ".env" -path "*/backend/*" | head -1)
if [ -n "$BACKEND_ENV" ]; then
    sed -i '' 's/OWNER_ID=helber/OWNER_ID=tiago/g' "$BACKEND_ENV" 2>/dev/null
    sed -i '' 's/OWNER_ID=eduardo/OWNER_ID=tiago/g' "$BACKEND_ENV" 2>/dev/null
    sed -i '' 's/OWNER_NAME=Helber/OWNER_NAME=Tiago/g' "$BACKEND_ENV" 2>/dev/null
    sed -i '' 's/OWNER_NAME=Eduardo/OWNER_NAME=Tiago/g' "$BACKEND_ENV" 2>/dev/null
    sed -i '' 's/OWNER_NAME=Zica/OWNER_NAME=Tiago/g' "$BACKEND_ENV" 2>/dev/null
    
    # Garantir que tem as linhas certas
    grep -q "OWNER_ID" "$BACKEND_ENV" || echo "OWNER_ID=tiago" >> "$BACKEND_ENV"
    grep -q "OWNER_NAME" "$BACKEND_ENV" || echo "OWNER_NAME=Tiago" >> "$BACKEND_ENV"
    
    echo "✅ .env corrigido:"
    grep "OWNER" "$BACKEND_ENV"
fi
```

### 2.4 Reiniciar backend pra pegar as mudanças
```bash
kill $(ps aux | grep "node.*dist/index" | grep -v grep | awk '{print $2}') 2>/dev/null
sleep 3

if [ -d "$HOME/titanio-dashboard/code/backend" ]; then
    cd "$HOME/titanio-dashboard/code/backend"
else
    cd "$HOME/titanio-dashboard/backend"
fi
nohup node --max-old-space-size=512 dist/index.js >> /tmp/backend-tiago.log 2>&1 &
sleep 6

# Selecionar Tiago de novo após restart
curl -s -X POST http://localhost:4444/api/auth/select \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-tiago","rememberMachine":true}' > /dev/null 2>&1

NOME=$(curl -s http://localhost:4444/api/auth/me 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('displayName','?'))" 2>/dev/null)
echo "Dashboard agora mostra: $NOME"
```

---

## 3. CONFIGURAR AGENTS.MD — Ensinar a usar especialistas

```bash
cat >> ~/.openclaw/workspace/AGENTS.md << 'AGENTSEOF'

## Como Usar Especialistas da Dashboard

A Dashboard Titanio tem 31 especialistas. Para usar qualquer um via API:

### Chamar um especialista
```bash
curl -X POST http://localhost:4444/api/squad/{ID}/task \
  -H "Content-Type: application/json" \
  -d '{"task":"descrição da tarefa","context":"contexto adicional"}'
```

### IDs dos especialistas mais úteis
- **code-ninja** — Desenvolvimento Full Stack (JS, TS, React, Node)
- **design-wizard** — UI/UX Design (Figma, Tailwind, Protótipos)
- **debug-hunter** — Análise de Logs & Bugs
- **devops-ninja** — Infraestrutura & Deploy
- **content-writer** — Conteúdo & Copy (posts, roteiros, blogs)
- **marketing-ninja** — Growth & Marketing (SEO, Ads, Growth)
- **marketing-director** — CMO Strategy (McKinsey, Go-to-Market)
- **data-analyst** — Dados & Analytics
- **automation-bot** — N8n & Automação
- **ios-specialist** — iOS & React Native
- **security-guardian** — Segurança
- **tradutor** — Tradutor multi-idioma
- **diretor-de-arte** — Direção de Arte & Visual IA
- **openclaw-specialist** — Expert em OpenClaw & Gateway

### Exemplo prático
Para pedir ao Content Writer criar um post:
```bash
curl -X POST http://localhost:4444/api/squad/content-writer/task \
  -H "Content-Type: application/json" \
  -d '{"task":"Crie um post de Instagram sobre IA para pequenos negócios","context":"Tom casual, máximo 150 palavras, incluir hashtags"}'
```

### Regras importantes
1. NUNCA invente endpoints — use APENAS `POST /api/squad/{id}/task`
2. O especialista fica "ocupado" durante a tarefa e volta a "disponível" depois
3. Pode passar `projectId` no body pra vincular ao projeto automaticamente
4. Use sub-agentes do OpenClaw quando precisar de VÁRIOS especialistas em paralelo
5. NÃO exponha seu raciocínio interno — resolva e entregue o resultado final
AGENTSEOF

echo "✅ AGENTS.md atualizado com guia de especialistas"
```

---

## 4. TESTAR CONEXÃO CLAW ↔ DASHBOARD

```bash
echo "=== TESTE DE CONEXÃO ==="

# 1. Health
echo -n "1. Backend health: "
curl -m 5 -s http://localhost:4444/api/health | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(f'OK — {d.get(\"squad\",{}).get(\"total\",\"?\")} especialistas, {d.get(\"bots\",{}).get(\"total\",\"?\")} bots')
" 2>/dev/null || echo "FALHOU"

# 2. Squad
echo -n "2. Listar especialistas: "
curl -m 5 -s http://localhost:4444/api/squad | python3 -c "
import sys,json; d=json.load(sys.stdin)
available = sum(1 for s in d if s.get('status')=='available')
print(f'{len(d)} total, {available} disponíveis')
" 2>/dev/null || echo "FALHOU"

# 3. Tarefa real
echo "3. Tarefa pro Content Writer:"
curl -m 30 -s -X POST http://localhost:4444/api/squad/content-writer/task \
  -H "Content-Type: application/json" \
  -d '{"task":"Escreva uma frase motivacional de 1 linha sobre trabalho em equipe","context":"Máximo 15 palavras"}' | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(f'   Resposta: {d.get(\"result\",\"?\")[:100]}')
print(f'   Sucesso: {d.get(\"success\",\"?\")}')
" 2>/dev/null || echo "   FALHOU — verificar ANTHROPIC_API_KEY no .env"

# 4. Projetos
echo -n "4. Projetos: "
curl -m 5 -s http://localhost:4444/api/projects | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(f'{len(d)} projetos')
" 2>/dev/null || echo "FALHOU"

# 5. Sync
echo -n "5. Sync: "
curl -m 10 -s http://localhost:4444/api/projects/sync | python3 -c "
import sys,json; d=json.load(sys.stdin)
print(f'Importados: {d.get(\"imported\",0)}, Exportados: {d.get(\"exported\",0)}')
" 2>/dev/null || echo "FALHOU"

# 6. Auth
echo -n "6. Usuário: "
curl -m 3 -s http://localhost:4444/api/auth/me | python3 -c "
import sys,json; print(json.load(sys.stdin).get('user',{}).get('displayName','?'))
" 2>/dev/null || echo "?"
```

---

## 5. SE O TESTE 3 FALHAR (especialista não responde)

O problema mais comum é a **ANTHROPIC_API_KEY** no .env. Verificar:

```bash
BACKEND_ENV=$(find ~/titanio-dashboard -name ".env" -path "*/backend/*" | head -1)
echo "=== API KEY ==="
grep "ANTHROPIC_API_KEY" "$BACKEND_ENV" 2>/dev/null | head -1 | sed 's/\(.\{20\}\).*/\1.../'

# Se não tiver ou estiver como PEDIR_PRO_EDUARDO:
echo ""
echo "Se a key estiver faltando, pedir pro Eduardo e adicionar:"
echo "  echo 'ANTHROPIC_API_KEY=sk-ant-...' >> $BACKEND_ENV"
echo "  Depois reiniciar: kill \$(ps aux | grep 'node.*dist/index' | grep -v grep | awk '{print \$2}') && cd $(dirname $BACKEND_ENV) && nohup node --max-old-space-size=512 dist/index.js >> /tmp/backend-tiago.log 2>&1 &"
```

---

## 6. VERIFICAÇÃO FINAL

```bash
echo "╔══════════════════════════════════════════════╗"
echo "║    VERIFICAÇÃO FINAL — TIAGO                  ║"
echo "╠══════════════════════════════════════════════╣"
echo -n "║ Dashboard nome:     "; curl -m 3 -s http://localhost:4444/api/auth/me 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('displayName','?'))" 2>/dev/null; echo " ║"
echo -n "║ Backend:            "; curl -m 3 -s http://localhost:4444/api/health > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ Frontend:           "; curl -m 3 -s http://localhost:3001 > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ Especialistas:      "; curl -m 3 -s http://localhost:4444/api/squad 2>/dev/null | python3 -c "import sys,json; print(f'{len(json.load(sys.stdin))} ║')" 2>/dev/null || echo "? ║"
echo -n "║ API especialista:   "; curl -m 15 -s -X POST http://localhost:4444/api/squad/code-ninja/task -H "Content-Type: application/json" -d '{"task":"diga OK","context":"teste"}' 2>/dev/null | python3 -c "import sys,json; print('✅ ║' if json.load(sys.stdin).get('success') else '❌ ║')" 2>/dev/null || echo "❌ ║"
echo -n "║ AGENTS.md atualizado: "; grep -q "api/squad" ~/.openclaw/workspace/AGENTS.md 2>/dev/null && echo "✅ ║" || echo "❌ ║"
echo -n "║ .env OWNER_NAME:   "; grep "OWNER_NAME" $(find ~/titanio-dashboard -name ".env" -path "*/backend/*" | head -1) 2>/dev/null | awk -F= '{print $2" ║"}'
echo "╚══════════════════════════════════════════════╝"
```

---

**Reportar resultado das seções 1 e 6 no grupo Gospia.**
