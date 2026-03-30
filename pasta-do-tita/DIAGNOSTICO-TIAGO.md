# Diagnóstico de Memória — Tiago
# O OpenClaw do Tiago deve executar TUDO e reportar resultado no grupo Gospia

---

## 1. DIAGNÓSTICO — O que está errado?

```bash
echo "╔══════════════════════════════════════════════╗"
echo "║   DIAGNÓSTICO DE MEMÓRIA — TIAGO             ║"
echo "╠══════════════════════════════════════════════╣"

echo ""
echo "=== 1. IDENTIDADE ==="
echo "--- SOUL.md ---"
head -5 ~/.openclaw/workspace/SOUL.md 2>/dev/null || echo "❌ NÃO EXISTE"
echo ""
echo "--- USER.md ---"
cat ~/.openclaw/workspace/USER.md 2>/dev/null || echo "❌ NÃO EXISTE"
echo ""
echo "--- Contém 'Helber' ou 'Eduardo' onde deveria ser 'Tiago'? ---"
grep -i "helber\|eduardo\|zica" ~/.openclaw/workspace/USER.md ~/.openclaw/workspace/SOUL.md ~/.openclaw/workspace/AGENTS.md ~/.openclaw/workspace/MEMORY.md 2>/dev/null && echo "⚠️ CONTAMINAÇÃO DETECTADA" || echo "✅ Limpo"

echo ""
echo "=== 2. MEMORY.md ==="
wc -l ~/.openclaw/workspace/MEMORY.md 2>/dev/null || echo "❌ NÃO EXISTE"
echo "Primeiras 10 linhas:"
head -10 ~/.openclaw/workspace/MEMORY.md 2>/dev/null
echo ""
echo "Menções a outros agentes:"
grep -c -i "helber\|eduardo\|kratos\|tita" ~/.openclaw/workspace/MEMORY.md 2>/dev/null || echo "0"

echo ""
echo "=== 3. AGENTS.md ==="
head -10 ~/.openclaw/workspace/AGENTS.md 2>/dev/null || echo "❌ NÃO EXISTE"

echo ""
echo "=== 4. LEARNING SYSTEM ==="
echo "--- lessons.json ---"
cat ~/.openclaw/workspace/tita-learning-system/lessons.json 2>/dev/null | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    lessons = d.get('lessons', d) if isinstance(d, dict) else d
    if isinstance(lessons, list):
        print(f'{len(lessons)} lições')
    else:
        print(f'{len(lessons.get(\"lessons\",[]))} lições')
except: print('Vazio ou inválido')
" 2>/dev/null || echo "❌ NÃO EXISTE"

echo "--- domain-scores.json ---"
cat ~/.openclaw/workspace/tita-learning-system/domain-scores.json 2>/dev/null | python3 -c "
import sys,json
d=json.load(sys.stdin)
print(f'{len(d)} domínios')
for k,v in d.items():
    print(f'  {k}: score={v.get(\"score\",\"?\")} tasks={v.get(\"tasks\",\"?\")}')
" 2>/dev/null || echo "❌ NÃO EXISTE"

echo ""
echo "=== 5. ESPECIALISTAS ==="
ls ~/.openclaw/workspace/squad/specialists/ 2>/dev/null || echo "❌ Sem especialistas"
echo ""
echo "--- Memória especialistas Dashboard ---"
ls ~/.openclaw/workspace/pasta-do-tita/memoria-especialistas/ 2>/dev/null | wc -l | xargs echo "Total:"

echo ""
echo "=== 6. OPENCLAW CONFIG ==="
python3 -c "
import json, os
config_path = os.path.expanduser('~/.openclaw/openclaw.json')
if os.path.exists(config_path):
    d = json.load(open(config_path))
    model = d.get('agents',{}).get('defaults',{}).get('model',{}).get('primary','?')
    has_smooth = '_smooth_switch' in d
    print(f'Modelo: {model}')
    print(f'_smooth_switch: {\"⚠️ PRESENTE\" if has_smooth else \"✅ Limpo\"}')
else:
    print('❌ Config não encontrada')
" 2>/dev/null

echo ""
echo "=== 7. KNOWLEDGE BASE ==="
cat ~/.openclaw/workspace/squad/knowledge-base/titanio-context.md 2>/dev/null | head -5 || echo "❌ NÃO EXISTE"

echo ""
echo "=== 8. HEARTBEAT ==="
cat ~/.openclaw/workspace/HEARTBEAT.md 2>/dev/null | head -5 || echo "❌ NÃO EXISTE"

echo ""
echo "=== 9. OUTROS AGENTES/MEMÓRIAS MISTURADAS ==="
echo "Arquivos suspeitos:"
find ~/.openclaw/workspace -maxdepth 2 -name "*.md" -exec grep -l -i "kratos\|helber.*memória\|eduardo.*memória\|manda.a.nota\|NFS-e" {} \; 2>/dev/null | head -10

echo ""
echo "=== 10. DASHBOARD ==="
echo -n "Backend: "; curl -m 3 -s http://localhost:4444/api/health > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "Frontend: "; curl -m 3 -s http://localhost:3001 > /dev/null 2>&1 && echo "✅" || echo "❌"
echo -n "Usuário ativo: "; curl -m 3 -s http://localhost:4444/api/auth/me 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('displayName','?'))" 2>/dev/null || echo "?"

echo ""
echo "╚══════════════════════════════════════════════╝"
```

---

## 2. BACKUP PRIMEIRO — Antes de tocar em qualquer coisa

```bash
BACKUP_DIR="$HOME/.openclaw/workspace/backup-memoria-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copiar TUDO que é memória/identidade
cp ~/.openclaw/workspace/MEMORY.md "$BACKUP_DIR/" 2>/dev/null
cp ~/.openclaw/workspace/SOUL.md "$BACKUP_DIR/" 2>/dev/null
cp ~/.openclaw/workspace/USER.md "$BACKUP_DIR/" 2>/dev/null
cp ~/.openclaw/workspace/AGENTS.md "$BACKUP_DIR/" 2>/dev/null
cp ~/.openclaw/workspace/HEARTBEAT.md "$BACKUP_DIR/" 2>/dev/null
cp -r ~/.openclaw/workspace/memory/ "$BACKUP_DIR/memory/" 2>/dev/null
cp -r ~/.openclaw/workspace/tita-learning-system/ "$BACKUP_DIR/tita-learning-system/" 2>/dev/null
cp -r ~/.openclaw/workspace/squad/ "$BACKUP_DIR/squad/" 2>/dev/null
cp ~/.openclaw/openclaw.json "$BACKUP_DIR/openclaw.json" 2>/dev/null

# Verificar backup
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')
BACKUP_FILES=$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')
echo "✅ BACKUP COMPLETO em: $BACKUP_DIR"
echo "   Tamanho: $BACKUP_SIZE | Arquivos: $BACKUP_FILES"
echo ""
echo "⚠️ SE ALGO DER ERRADO, restaurar com:"
echo "   cp -r $BACKUP_DIR/* ~/.openclaw/workspace/"
```

---

## 3. CORREÇÃO — Limpar memória contaminada

**ATENÇÃO: Só executar se o diagnóstico mostrou contaminação E o backup (seção 2) foi feito!**

### 3.1 Recriar USER.md limpo
```bash
cat > ~/.openclaw/workspace/USER.md << 'EOF'
# USER.md — Sobre Seu Humano

- **Nome:** Tiago
- **Pronomes:** ele/dele
- **Timezone:** America/Sao_Paulo (GMT-3)
- **Telefone:** (preencher)
- **Equipe:** Titanio Films (Eduardo, Tiago, Helber)
- **Projetos ativos:** (preencher com os projetos do Tiago)
EOF
echo "✅ USER.md recriado"
```

### 3.2 Recriar SOUL.md limpo
```bash
cat > ~/.openclaw/workspace/SOUL.md << 'EOF'
# SOUL.md - Quem Sou Eu

Sou o agente IA do Tiago na Titanio.

## Verdades Fundamentais
- Seja genuinamente útil. Sem filler words.
- Tenha opinião. Seja resourceful.
- Ganhe confiança pela competência.
- Coisas privadas ficam privadas.
- Conciso quando necessário, completo quando importa.

## Continuidade
Cada sessão acorda do zero. Esses arquivos SÃO minha memória.
EOF
echo "✅ SOUL.md recriado"
```

### 3.3 Limpar MEMORY.md de dados de outros agentes
```bash
# Backup primeiro
cp ~/.openclaw/workspace/MEMORY.md ~/.openclaw/workspace/MEMORY.md.bak.$(date +%Y%m%d) 2>/dev/null

# Verificar se tem dados do Kratos/Eduardo/Helber misturados
CONTAMINATED=$(grep -c -i "kratos\|NFS-e\|manda.a.nota\|helber.*gomes\|sirigue" ~/.openclaw/workspace/MEMORY.md 2>/dev/null)

if [ "$CONTAMINATED" -gt "3" ]; then
    echo "⚠️ MEMORY.md contaminado ($CONTAMINATED referências de outros agentes)"
    echo "Recriando limpo..."
    cat > ~/.openclaw/workspace/MEMORY.md << EOF
# MEMORY.md — Memória de Longo Prazo — Agente do Tiago

Primeira sessão: $(date +%Y-%m-%d)
Memória recriada após contaminação com dados de outro agente.

## Equipe
- Eduardo (Zica) — fundador, Mac Mini principal
- Helber — equipe Titanio
- Tiago — eu sirvo o Tiago

## Sistema
- Dashboard Titanio v2 rodando
- Sistema de aprendizado ativo
- LightRAG para memória de grafo
- Sync via /Volumes/TITA_039/
EOF
    echo "✅ MEMORY.md recriado limpo"
else
    echo "✅ MEMORY.md parece limpo ($CONTAMINATED referências)"
fi
```

### 3.4 Recriar AGENTS.md
```bash
cat > ~/.openclaw/workspace/AGENTS.md << 'EOF'
# AGENTS.md

## Toda Sessão
1. Ler SOUL.md — quem você é
2. Ler USER.md — quem você ajuda (Tiago)
3. Ler memory/YYYY-MM-DD.md (hoje + ontem)
4. Em sessão principal: ler MEMORY.md

## Após Tarefas Significativas
1. Registrar lição: bash tita-learning-system/capture-lesson.sh "tarefa" "resultado" "categoria"
2. Atualizar LESSONS.md do especialista relevante

## Segurança
- Não exfiltrar dados privados
- trash > rm
- Na dúvida, perguntar
EOF
echo "✅ AGENTS.md recriado"
```

### 3.5 Limpar lessons.json se tiver dados de outro agente
```bash
LESSONS_FILE=~/.openclaw/workspace/tita-learning-system/lessons.json
if [ -f "$LESSONS_FILE" ]; then
    ALIEN=$(python3 -c "
import json
d=json.load(open('$LESSONS_FILE'))
lessons = d.get('lessons', d) if isinstance(d,dict) else d
if isinstance(lessons, list):
    alien = [l for l in lessons if 'kratos' in str(l).lower() or 'NFS-e' in str(l) or 'manda a nota' in str(l).lower()]
    print(len(alien))
else:
    print(0)
" 2>/dev/null)
    
    if [ "$ALIEN" -gt "5" ]; then
        echo "⚠️ lessons.json contaminado ($ALIEN lições de outro agente)"
        cp "$LESSONS_FILE" "${LESSONS_FILE}.bak.$(date +%Y%m%d)"
        echo '{"lessons":[],"version":2}' > "$LESSONS_FILE"
        echo "✅ lessons.json resetado"
    else
        echo "✅ lessons.json limpo"
    fi
fi
```

### 3.6 Resetar domain-scores se contaminado
```bash
SCORES_FILE=~/.openclaw/workspace/tita-learning-system/domain-scores.json
if [ -f "$SCORES_FILE" ]; then
    python3 -c "
import json
d=json.load(open('$SCORES_FILE'))
# Se tem domínios que o Tiago nunca usaria (ex: nfse, ios com 487 tasks)
suspicious = sum(1 for k,v in d.items() if v.get('tasks',0) > 100)
print(suspicious)
" 2>/dev/null | read SUSPICIOUS
    
    if [ "$SUSPICIOUS" -gt "0" ]; then
        echo "⚠️ domain-scores.json suspeito"
        cp "$SCORES_FILE" "${SCORES_FILE}.bak.$(date +%Y%m%d)"
        echo '{}' > "$SCORES_FILE"
        echo "✅ domain-scores.json resetado"
    else
        echo "✅ domain-scores.json limpo"
    fi
fi
```

### 3.7 Corrigir config do OpenClaw
```bash
python3 << 'PYEOF'
import json, os
config_path = os.path.expanduser('~/.openclaw/openclaw.json')
if os.path.exists(config_path):
    d = json.load(open(config_path))
    changed = False
    
    # Remover _smooth_switch
    if '_smooth_switch' in d:
        d.pop('_smooth_switch')
        changed = True
    
    # Garantir opus como default
    try:
        if d['agents']['defaults']['model']['primary'] != 'anthropic/claude-opus-4-6':
            d['agents']['defaults']['model']['primary'] = 'anthropic/claude-opus-4-6'
            changed = True
    except: pass
    
    if changed:
        json.dump(d, open(config_path, 'w'), indent=2)
        print("✅ Config corrigida (opus + sem smooth_switch)")
    else:
        print("✅ Config já está OK")
PYEOF
```

### 3.8 Remover smooth-switch.sh se existir
```bash
rm -f ~/.openclaw/workspace/squad/scripts/smooth-switch.sh 2>/dev/null
echo "# Desabilitado — causava bug" > ~/.openclaw/workspace/squad/scripts/smooth-switch.sh.DISABLED 2>/dev/null
echo "✅ smooth-switch removido"
```

### 3.9 Corrigir nome da Dashboard (trocar de Helber pra Tiago)
```bash
# Selecionar Tiago via API
curl -s -X POST http://localhost:4444/api/auth/select \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-tiago","rememberMachine":true}' > /dev/null 2>&1

# Confirmar
NOME=$(curl -s http://localhost:4444/api/auth/me 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('user',{}).get('displayName','?'))" 2>/dev/null)
echo "Dashboard usuário: $NOME"

# Se ainda não mudou, forçar via arquivo direto
if [ "$NOME" != "Tiago" ]; then
    BACKEND_DIR=$(find ~/titanio-dashboard -name "index.js" -path "*/dist/*" | head -1 | xargs dirname 2>/dev/null)
    if [ -n "$BACKEND_DIR" ]; then
        mkdir -p "$BACKEND_DIR/../.data/quickauth"
        cat > "$BACKEND_DIR/../.data/quickauth/current-session.json" << 'SESSEOF'
{"userId":"user-tiago","machineId":"auto","startedAt":"2026-03-25T00:00:00Z"}
SESSEOF
        # Resetar mapeamento de máquina
        echo '{"auto":"user-tiago"}' > "$BACKEND_DIR/../.data/quickauth/machine-map.json"
        echo "✅ Sessão forçada pra Tiago (reiniciar backend)"
        
        # Reiniciar backend pra pegar
        kill $(ps aux | grep "node dist/index" | grep -v grep | awk '{print $2}') 2>/dev/null
        sleep 2
        cd "$BACKEND_DIR" && nohup node index.js >> /tmp/backend-tiago.log 2>&1 &
        sleep 5
        
        # Confirmar de novo
        curl -s http://localhost:4444/api/auth/me 2>/dev/null | python3 -c "import sys,json; print(f'Dashboard: {json.load(sys.stdin).get(\"user\",{}).get(\"displayName\",\"?\")}')" 2>/dev/null
    fi
fi
```

### 3.10 Corrigir .env do backend (OWNER_NAME)
```bash
BACKEND_ENV=$(find ~/titanio-dashboard -name ".env" -path "*/backend/*" | head -1)
if [ -n "$BACKEND_ENV" ]; then
    # Trocar qualquer referência a Helber por Tiago
    sed -i '' 's/OWNER_ID=helber/OWNER_ID=tiago/g' "$BACKEND_ENV"
    sed -i '' 's/OWNER_NAME=Helber/OWNER_NAME=Tiago/g' "$BACKEND_ENV"
    sed -i '' 's/OWNER_AVATAR=🚀/OWNER_AVATAR=👨‍💻/g' "$BACKEND_ENV"
    echo "✅ .env corrigido pra Tiago"
    grep "OWNER" "$BACKEND_ENV"
fi
```

---

## 4. VERIFICAÇÃO FINAL

```bash
echo "╔══════════════════════════════════════════════╗"
echo "║   VERIFICAÇÃO PÓS-CORREÇÃO — TIAGO          ║"
echo "╠══════════════════════════════════════════════╣"
echo -n "║ USER.md diz Tiago?    "; grep -q "Tiago" ~/.openclaw/workspace/USER.md && echo "✅ ║" || echo "❌ ║"
echo -n "║ SOUL.md limpo?        "; ! grep -qi "kratos\|helber\|eduardo" ~/.openclaw/workspace/SOUL.md 2>/dev/null && echo "✅ ║" || echo "❌ ║"
echo -n "║ MEMORY.md limpo?      "; [ $(grep -c -i "kratos\|NFS-e\|manda.a.nota" ~/.openclaw/workspace/MEMORY.md 2>/dev/null) -lt 3 ] && echo "✅ ║" || echo "❌ ║"
echo -n "║ Modelo opus?          "; python3 -c "import json,os; d=json.load(open(os.path.expanduser('~/.openclaw/openclaw.json'))); print('✅' if 'opus' in d.get('agents',{}).get('defaults',{}).get('model',{}).get('primary','') else '❌')" 2>/dev/null; echo " ║"
echo -n "║ smooth-switch?        "; [ ! -f ~/.openclaw/workspace/squad/scripts/smooth-switch.sh ] && echo "removido ✅ ║" || echo "⚠️ presente ║"
echo -n "║ Backend?              "; curl -m 3 -s http://localhost:4444/api/health > /dev/null 2>&1 && echo "✅ ║" || echo "❌ ║"
echo -n "║ Especialistas?        "; ls ~/.openclaw/workspace/squad/specialists/ 2>/dev/null | wc -l | xargs echo -n; echo " ║"
echo -n "║ Learning system?      "; [ -x ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh ] && echo "✅ ║" || echo "❌ ║"
echo "╚══════════════════════════════════════════════╝"
```

---

## 5. TESTAR

```bash
# Registrar lição de teste
bash ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh \
    "Diagnóstico e limpeza de memória" \
    "Sucesso — memória limpa de contaminação" \
    "maintenance"

# Dashboard de aprendizado
bash ~/.openclaw/workspace/tita-learning-system/dashboard.sh 2>/dev/null
```

---

**Reportar o resultado do DIAGNÓSTICO (seção 1) e da VERIFICAÇÃO (seção 3) no grupo Gospia.**
**NÃO executar a seção 3 (correção) se o diagnóstico não mostrar problemas.**
