# Guia de Instalação — Dashboard Titanio + Sistema de Memória
**Para: Helber e Tiago**
**Preparado por: Tita (AI) — 23/03/2026**
**Testado no: Mac Mini M2 (macOS Sequoia 15.5, ARM64)**

---

## O que será instalado

1. **OpenClaw** — o agente AI principal (como a Tita do Eduardo)
2. **Dashboard Titanio** — painel com especialistas (backend, iOS, segurança, etc.)
3. **Sistema de Aprendizado** — o agente aprende com cada tarefa e melhora ao longo do tempo
4. **LightRAG** — memória de grafo de conhecimento (busca semântica avançada)
5. **Ollama** — modelos locais para LightRAG (não gasta API)

---

## Pré-requisitos

- Mac com macOS 13+ (Ventura ou superior)
- **Homebrew** instalado
- **Node.js 20+** instalado
- **Python 3.12+** instalado
- Conta Anthropic com API key (ou usar a key compartilhada da equipe)
- ~30GB de espaço livre (para modelos Ollama)

### Verificar pré-requisitos
```bash
# Rodar esses comandos e verificar que todos retornam algo
brew --version
node --version    # precisa ser >= 20
python3 --version # precisa ser >= 3.12
```

Se algum faltar:
```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js
brew install node

# Python 3
brew install python@3.14
```

---

## PARTE 1 — OpenClaw

### 1.1 Instalar OpenClaw
```bash
npm install -g openclaw
```

### 1.2 Rodar o wizard inicial
```bash
openclaw setup
```

O wizard vai pedir:
- **API Key Anthropic**: colar a key (pedir pro Eduardo se não tiver)
- **Modelo padrão**: escolher `claude-opus-4-6` (ou sonnet pra economizar)
- **Nome do agente**: escolher um nome pro seu agente (ex: "Atlas", "Nova", etc.)

### 1.3 Verificar que está rodando
```bash
openclaw status
```

Deve mostrar: `Gateway: running`

---

## PARTE 2 — Workspace (Identidade + Memória)

### 2.1 Criar estrutura de pastas
```bash
cd ~/.openclaw/workspace
mkdir -p memory
mkdir -p tita-learning-system
mkdir -p squad/specialists
mkdir -p squad/knowledge-base
mkdir -p squad/scripts
```

### 2.2 Criar SOUL.md (personalidade do agente)

Editar `~/.openclaw/workspace/SOUL.md`:
```markdown
# SOUL.md - Quem Sou Eu

## Verdades Fundamentais

**Seja genuinamente útil.** Sem "Ótima pergunta!" — apenas ajude.

**Tenha opinião.** Discorde, prefira coisas, ache coisas engraçadas ou chatas.

**Seja resourceful.** Tente resolver antes de perguntar.

**Ganhe confiança pela competência.** Cuide bem do que te confiaram.

## Limites

- Coisas privadas ficam privadas
- Na dúvida, pergunte antes de agir externamente
- Nunca envie respostas mal feitas

## Vibe

Seja o assistente que você gostaria de conversar. Conciso quando necessário, completo quando importa.
```

### 2.3 Criar USER.md (sobre o dono)

Editar `~/.openclaw/workspace/USER.md`:

**Para Helber:**
```markdown
# USER.md

- **Nome:** Helber
- **Pronomes:** ele/dele
- **Timezone:** America/Sao_Paulo (GMT-3)
- **Telefone:** +55XXXXXXXXXX
- **Projetos ativos:** (listar aqui)
```

**Para Tiago:**
```markdown
# USER.md

- **Nome:** Tiago
- **Pronomes:** ele/dele
- **Timezone:** America/Sao_Paulo (GMT-3)
- **Telefone:** +55XXXXXXXXXX
- **Projetos ativos:** (listar aqui)
```

### 2.4 Criar AGENTS.md (regras de comportamento)
```bash
# Copiar o template base
curl -sL https://raw.githubusercontent.com/contact703/titanio-squad/main/templates/AGENTS-template.md > ~/.openclaw/workspace/AGENTS.md
```

Se o link não funcionar, copiar o conteúdo do arquivo que está junto deste guia: `AGENTS-TEMPLATE.md`

### 2.5 Criar MEMORY.md
```bash
echo "# MEMORY.md — Memória de Longo Prazo" > ~/.openclaw/workspace/MEMORY.md
echo "" >> ~/.openclaw/workspace/MEMORY.md
echo "Primeira sessão: $(date +%Y-%m-%d)" >> ~/.openclaw/workspace/MEMORY.md
```

---

## PARTE 3 — Sistema de Aprendizado

O sistema de aprendizado registra cada tarefa, calcula scores por categoria, e gera relatórios.

### 3.1 Copiar scripts

Criar cada arquivo abaixo em `~/.openclaw/workspace/tita-learning-system/`:

**capture-lesson.sh** — Registra uma lição após cada tarefa
```bash
#!/bin/bash
TASK="$1"
RESULT="$2"
CATEGORY="${3:-geral}"
SUCCESS_FLAG="${4:-s}"
BASE="$(dirname "$0")"
LESSONS="$BASE/lessons.json"
SCORES="$BASE/domain-scores.json"

SUCCESS=true
[[ "$SUCCESS_FLAG" == "f" ]] && SUCCESS=false
[[ "$RESULT" == *"Erro"* || "$RESULT" == *"falha"* || "$RESULT" == *"fail"* ]] && SUCCESS=false

DATE=$(date +%Y-%m-%d)
TIME=$(date +%H:%M)

# Inicializar lessons.json se não existir
[ ! -f "$LESSONS" ] && echo '{"lessons":[]}' > "$LESSONS"

# Adicionar lição
python3 << PYEOF
import json, os
with open("$LESSONS") as f:
    data = json.load(f)
lessons = data.get("lessons", [])
new_id = max([l.get("id",0) for l in lessons], default=0) + 1
lessons.append({
    "id": new_id,
    "date": "$DATE",
    "time": "$TIME",
    "task": "$TASK",
    "result": "$RESULT",
    "category": "$CATEGORY",
    "success": $( [ "$SUCCESS" = "true" ] && echo "True" || echo "False" ),
    "timestamp": "$DATE $TIME"
})
data["lessons"] = lessons
with open("$LESSONS", "w") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"✅ Lição #{new_id} registrada ({CATEGORY})")
PYEOF

# Atualizar domain scores
python3 << PYEOF
import json, os
SCORES_FILE = "$SCORES"
if not os.path.exists(SCORES_FILE):
    scores = {}
else:
    with open(SCORES_FILE) as f:
        scores = json.load(f)

cat = "$CATEGORY"
s = $( [ "$SUCCESS" = "true" ] && echo 1 || echo 0 )

if cat not in scores:
    scores[cat] = {"score": 5.0, "tasks": 0, "wins": 0, "history": [], "trend": "-", "win_rate": 0.0}

d = scores[cat]
d["tasks"] += 1
d["wins"] += s
d["history"].append(s)
d["history"] = d["history"][-10:]  # últimos 10

# ELO simplificado
K = 0.3
expected = d["score"] / 10
d["score"] += K * (s - expected)
d["score"] = max(1, min(10, round(d["score"], 2)))
d["win_rate"] = round(d["wins"] / d["tasks"] * 100, 1)
d["trend"] = "↑" if sum(d["history"][-3:]) >= 2 else "↓" if sum(d["history"][-3:]) <= 1 else "→"

with open(SCORES_FILE, "w") as f:
    json.dump(scores, f, indent=2)
print(f"📊 {cat}: score={d['score']} wins={d['win_rate']}%")
PYEOF
```

**session-score.sh** — Mostra dashboard de scores
```bash
#!/bin/bash
BASE="$(dirname "$0")"
python3 << PYEOF
import json, os
scores_file = "$BASE/domain-scores.json"
lessons_file = "$BASE/lessons.json"

if not os.path.exists(scores_file):
    print("Nenhum score registrado ainda.")
    exit()

with open(scores_file) as f:
    scores = json.load(f)
    
total_tasks = sum(d["tasks"] for d in scores.values())
total_wins = sum(d["wins"] for d in scores.values())
rate = round(total_wins/total_tasks*100, 1) if total_tasks > 0 else 0

print(f"📊 DASHBOARD DE APRENDIZADO")
print(f"{'='*50}")
print(f"Total: {total_tasks} tarefas | {rate}% sucesso")
print(f"{'='*50}")
print(f"{'Categoria':<15} {'Score':>6} {'Tasks':>6} {'Win%':>6} {'Trend':>5}")
print(f"{'-'*15} {'-'*6} {'-'*6} {'-'*6} {'-'*5}")
for cat, d in sorted(scores.items(), key=lambda x: x[1]["score"], reverse=True):
    print(f"{cat:<15} {d['score']:>6.1f} {d['tasks']:>6} {d['win_rate']:>5.1f}% {d['trend']:>5}")
PYEOF
```

**consolidate-memory.sh** — Consolida lições em memória de longo prazo
```bash
#!/bin/bash
BASE="$(dirname "$0")"
WORKSPACE="$(dirname "$BASE")"
MEMORY="$WORKSPACE/MEMORY.md"
LESSONS="$BASE/lessons.json"

echo "🔄 Consolidando memória..."

# Contar lições da última semana
python3 << PYEOF
import json, os
from datetime import datetime, timedelta

with open("$LESSONS") as f:
    data = json.load(f)

week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
recent = [l for l in data.get("lessons",[]) if l.get("date","") >= week_ago]
fails = [l for l in recent if not l.get("success", True)]

print(f"📊 Última semana: {len(recent)} tarefas, {len(fails)} falhas")
if fails:
    print("⚠️ Falhas:")
    for f in fails:
        print(f"  - [{f['category']}] {f['task']}: {f['result']}")
PYEOF

# Adicionar resumo semanal ao MEMORY.md
python3 << PYEOF
import json, os
from datetime import datetime, timedelta

with open("$LESSONS") as f:
    data = json.load(f)

week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
recent = [l for l in data.get("lessons",[]) if l.get("date","") >= week_ago]
total = len(recent)
success = len([l for l in recent if l.get("success", True)])
rate = round(success/total*100,1) if total > 0 else 0

entry = f"\n## Semana {datetime.now().strftime('%Y-%m-%d')} — Auto-consolidação\n"
entry += f"- {total} tarefas na semana, {rate}% sucesso\n"

with open("$MEMORY", "a") as f:
    f.write(entry)

print(f"✅ MEMORY.md atualizado: {total} tarefas, {rate}% sucesso")
PYEOF
```

### 3.2 Tornar executáveis
```bash
chmod +x ~/.openclaw/workspace/tita-learning-system/*.sh
```

### 3.3 Inicializar dados
```bash
echo '{"lessons":[]}' > ~/.openclaw/workspace/tita-learning-system/lessons.json
echo '{}' > ~/.openclaw/workspace/tita-learning-system/domain-scores.json
echo '{}' > ~/.openclaw/workspace/tita-learning-system/metrics.json
```

### 3.4 Configurar consolidação automática (cron)
```bash
# Consolidar memória a cada 6 horas
(crontab -l 2>/dev/null; echo "0 */6 * * * bash ~/.openclaw/workspace/tita-learning-system/consolidate-memory.sh >> /tmp/memory-consolidate.log 2>&1") | crontab -
```

### 3.5 Testar
```bash
# Registrar uma lição de teste
bash ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh \
  "Primeira tarefa de teste" \
  "Sucesso - sistema funcionando" \
  "setup"

# Ver dashboard
bash ~/.openclaw/workspace/tita-learning-system/session-score.sh
```

Deve mostrar: `1 tarefa | 100% sucesso`

---

## PARTE 4 — Especialistas (Squad)

### 4.1 Criar especialistas base

Para cada especialista, criar a pasta e arquivos:

```bash
# Lista de especialistas iniciais
SPECS="backend-specialist ios-specialist security-guardian memory-bot design-specialist"

for spec in $SPECS; do
  mkdir -p ~/.openclaw/workspace/squad/specialists/$spec
  
  # LESSONS.md
  cat > ~/.openclaw/workspace/squad/specialists/$spec/LESSONS.md << 'EOF'
# Lições Aprendidas

## 🔴 Regras Críticas
- Ao terminar qualquer tarefa: atualizar este arquivo
- Formato: data, categoria, lição, resultado
EOF

  # context-inject.md
  cat > ~/.openclaw/workspace/squad/specialists/$spec/context-inject.md << EOF
# $spec — Contexto

## Quem sou
Especialista da squad. Ao terminar qualquer tarefa, atualizar LESSONS.md.

## Últimas lições
Ver: LESSONS.md
EOF

  echo "✅ $spec criado"
done
```

### 4.2 Personalizar cada especialista

Editar o `context-inject.md` de cada um com informações relevantes do projeto:
- **backend-specialist**: tecnologias usadas, APIs, etc.
- **ios-specialist**: Bundle IDs, certs, etc.
- **security-guardian**: regras de segurança, auditorias
- **memory-bot**: schedule de consolidação
- **design-specialist**: padrões visuais, assets

---

## PARTE 5 — LightRAG (Memória de Grafo de Conhecimento)

O LightRAG cria um grafo de conhecimento das lições e documentos do agente, permitindo buscas semânticas avançadas tipo "quem sabe sobre automação?" em vez de busca por palavra-chave.

### 5.1 Instalar Ollama (modelos locais)
```bash
# Instalar Ollama
brew install ollama

# Iniciar o serviço
brew services start ollama

# Baixar os modelos necessários (vai levar alguns minutos)
ollama pull phi3:3.8b-instruct    # ~2.2GB — LLM para extração de entidades
ollama pull nomic-embed-text      # ~274MB — embeddings para busca semântica
```

### 5.2 Verificar Ollama
```bash
ollama list
# Deve mostrar phi3:3.8b-instruct e nomic-embed-text
```

### 5.3 Instalar LightRAG

```bash
# Criar ambiente virtual Python
cd ~/.openclaw/workspace
python3 -m venv venv-lightrag
source venv-lightrag/bin/activate

# Instalar LightRAG
pip install lightrag-hku

# Verificar
pip show lightrag-hku
# Deve mostrar versão 1.4.x
```

### 5.4 Criar estrutura LightRAG
```bash
mkdir -p ~/.openclaw/workspace/lightrag-memory/storage
mkdir -p ~/.openclaw/workspace/lightrag-memory/docs
```

### 5.5 Script de indexação e teste

Criar `~/.openclaw/workspace/lightrag-memory/index_and_test.py`:
```python
import asyncio, os, numpy as np, httpx
from pathlib import Path

WORKING_DIR = os.path.expanduser("~/.openclaw/workspace/lightrag-memory/storage")
DOCS_DIR = os.path.expanduser("~/.openclaw/workspace/lightrag-memory/docs")
os.makedirs(WORKING_DIR, exist_ok=True)

async def warmup_models():
    """CRÍTICO: Aquecer modelos antes de usar — evita bug de EOF no ARM64"""
    print("🔥 Aquecendo modelos no Ollama...")
    async with httpx.AsyncClient(timeout=120) as c:
        # Aquecer LLM
        r = await c.post("http://localhost:11434/api/chat",
            json={"model": "phi3:3.8b-instruct",
                  "messages": [{"role": "user", "content": "ready"}],
                  "stream": False,
                  "keep_alive": 3600})
        print(f"  ✅ phi3 carregado")
        
        # Aquecer embedding
        r2 = await c.post("http://localhost:11434/api/embed",
            json={"model": "nomic-embed-text",
                  "input": ["warmup test"],
                  "keep_alive": 3600})
        embs = r2.json().get("embeddings", [])
        print(f"  ✅ nomic-embed-text carregado: dim={len(embs[0]) if embs else 'err'}")

async def local_embed(texts: list[str]) -> np.ndarray:
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post("http://localhost:11434/api/embed",
            json={"model": "nomic-embed-text", "input": texts})
        embs = r.json().get("embeddings", [])
        if not embs:
            raise ValueError(f"Embedding falhou: {r.json().get('error','?')}")
        return np.array(embs, dtype=np.float32)

async def local_llm(prompt, system_prompt=None, history_messages=[], **kwargs):
    msgs = []
    if system_prompt:
        msgs.append({"role": "system", "content": system_prompt})
    msgs += history_messages
    msgs.append({"role": "user", "content": prompt})
    async with httpx.AsyncClient(timeout=180) as c:
        r = await c.post("http://localhost:11434/api/chat",
            json={"model": "phi3:3.8b-instruct", "messages": msgs, "stream": False})
        return r.json().get("message", {}).get("content", "")

async def main():
    from lightrag import LightRAG, QueryParam
    from lightrag.utils import EmbeddingFunc

    # PASSO CRÍTICO: aquecer modelos primeiro (fix bug ARM64)
    await warmup_models()

    print("\n🔧 Inicializando LightRAG...")
    rag = LightRAG(
        working_dir=WORKING_DIR,
        llm_model_func=local_llm,
        llm_model_name="phi3:3.8b-instruct",
        llm_model_max_async=1,
        embedding_func=EmbeddingFunc(
            embedding_dim=768,
            max_token_size=2048,
            func=local_embed
        ),
    )
    await rag.initialize_storages()
    print("✅ LightRAG inicializado")

    # Indexar documentos
    docs_path = Path(DOCS_DIR)
    if docs_path.exists():
        for doc_file in docs_path.glob("*.txt"):
            content = doc_file.read_text()[:5000]  # limitar a 5KB por doc
            print(f"📚 Indexando {doc_file.name} ({len(content)} chars)...")
            await rag.ainsert(content)

    # Verificar grafo
    graph = Path(WORKING_DIR) / "graph_chunk_entity_relation.graphml"
    if graph.exists() and graph.stat().st_size > 500:
        print(f"✅ Grafo criado: {graph.stat().st_size // 1024}KB")
    else:
        print("⚠️ Grafo não criado (precisa indexar documentos)")

    # Teste de query
    print("\n🧪 Teste de query:")
    try:
        result = await rag.aquery("Quais são os especialistas da equipe?", param=QueryParam(mode="naive"))
        print(f"  Resultado: {result[:200]}")
    except Exception as e:
        print(f"  Erro na query: {e}")

if __name__ == "__main__":
    asyncio.run(main())
```

### 5.6 Criar documento inicial para indexação

Criar `~/.openclaw/workspace/lightrag-memory/docs/equipe-conhecimento.txt`:
```
(Adicionar aqui o conhecimento da equipe, projetos ativos, 
especialidades de cada membro, lições aprendidas, etc.
Quanto mais contexto, melhor o grafo de conhecimento.)
```

### 5.7 Rodar indexação e teste
```bash
cd ~/.openclaw/workspace
source venv-lightrag/bin/activate
pip install httpx  # dependência extra

python3 lightrag-memory/index_and_test.py
```

Deve mostrar:
- ✅ phi3 carregado
- ✅ nomic-embed-text carregado
- ✅ LightRAG inicializado
- ✅ Grafo criado

### 5.8 Iniciar o servidor LightRAG (para consultas HTTP)
```bash
source ~/.openclaw/workspace/venv-lightrag/bin/activate

lightrag-server \
  --host 0.0.0.0 \
  --port 9621 \
  --working-dir ~/.openclaw/workspace/lightrag-memory/storage \
  --llm-binding ollama \
  --embedding-binding ollama \
  --max-async 1 &

# Testar
curl http://localhost:9621/health
```

### 5.9 ⚠️ Bug conhecido no ARM64

O Ollama no macOS ARM64 pode descarregar modelos da memória durante o processamento, causando erro "EOF" no embedding.

**Solução:** Sempre aquecer os modelos com `keep_alive: 3600` antes de usar o LightRAG. O script `index_and_test.py` já faz isso automaticamente.

Se der erro, rodar manualmente:
```bash
# Forçar modelos a ficarem na memória por 1 hora
curl -s http://localhost:11434/api/chat -d '{"model":"phi3:3.8b-instruct","messages":[{"role":"user","content":"hi"}],"stream":false,"keep_alive":3600}'
curl -s http://localhost:11434/api/embed -d '{"model":"nomic-embed-text","input":["test"],"keep_alive":3600}'
```

### 5.10 Auto-start do LightRAG (launchd)

Criar `~/Library/LaunchAgents/com.titanio.lightrag.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.titanio.lightrag</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-c</string>
    <string>
      source ~/.openclaw/workspace/venv-lightrag/bin/activate && \
      lightrag-server \
        --host 0.0.0.0 --port 9621 \
        --working-dir ~/.openclaw/workspace/lightrag-memory/storage \
        --llm-binding ollama --embedding-binding ollama \
        --max-async 1
    </string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/lightrag.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/lightrag-error.log</string>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.titanio.lightrag.plist
```

---

## PARTE 6 — Conectar ao Gateway Central (Rede Titanio)

### 6.1 Conectar como node ao Mac Mini principal

```bash
openclaw node run \
  --host 192.168.18.174 \
  --port 18789 \
  --display-name "SEU_NOME Node"
```

(Substituir SEU_NOME por "Helber" ou "Tiago")

### 6.2 Auto-start do node

Criar `~/Library/LaunchAgents/com.titanio.openclaw-node.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.titanio.openclaw-node</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-c</string>
    <string>openclaw node run --host 192.168.18.174 --port 18789 --display-name "SEU_NOME Node"</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/tmp/openclaw-node.log</string>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.titanio.openclaw-node.plist
```

---

## PARTE 7 — Verificação Final

Rodar este checklist depois de instalar tudo:

```bash
echo "=== CHECKLIST INSTALAÇÃO ==="

echo -n "1. OpenClaw: "
openclaw status 2>/dev/null && echo "✅" || echo "❌"

echo -n "2. Ollama: "
curl -s http://localhost:11434/api/tags > /dev/null && echo "✅" || echo "❌"

echo -n "3. phi3 model: "
ollama list | grep -q phi3 && echo "✅" || echo "❌"

echo -n "4. nomic-embed-text: "
ollama list | grep -q nomic && echo "✅" || echo "❌"

echo -n "5. LightRAG server: "
curl -s http://localhost:9621/health > /dev/null && echo "✅" || echo "❌"

echo -n "6. Learning system: "
[ -f ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh ] && echo "✅" || echo "❌"

echo -n "7. SOUL.md: "
[ -f ~/.openclaw/workspace/SOUL.md ] && echo "✅" || echo "❌"

echo -n "8. MEMORY.md: "
[ -f ~/.openclaw/workspace/MEMORY.md ] && echo "✅" || echo "❌"

echo -n "9. Especialistas: "
ls ~/.openclaw/workspace/squad/specialists/ 2>/dev/null | wc -l | xargs echo

echo -n "10. Cron consolidação: "
crontab -l 2>/dev/null | grep -q consolidate && echo "✅" || echo "❌"
```

Todos devem ser ✅.

---

## Troubleshooting

**LightRAG dá erro de EOF:**
→ Aquecer modelos: ver seção 5.9

**Ollama não inicia:**
→ `brew services restart ollama`

**OpenClaw não conecta ao gateway:**
→ Verificar que o Mac Mini principal (192.168.18.174) está ligado e o gateway rodando

**Learning system não registra:**
→ Verificar permissões: `chmod +x ~/.openclaw/workspace/tita-learning-system/*.sh`

---

## Tempo estimado de instalação
- Partes 1-4 (OpenClaw + Workspace + Learning + Especialistas): **~20 minutos**
- Parte 5 (LightRAG + Ollama): **~15 minutos** (mais tempo de download dos modelos)
- Parte 6 (Conectar ao gateway): **~5 minutos**

**Total: ~40 minutos** (sem contar download de modelos)
