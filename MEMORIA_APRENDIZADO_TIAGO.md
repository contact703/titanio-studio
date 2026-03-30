# 🧠 MEMÓRIA & APRENDIZADO — Sistema Completo (Tiago)
**Para:** OpenClaw do Tiago + bots que você criar  
**Data:** 2026-03-16  
**Compilado por:** Tita 🐾 — baseado no sistema em produção do Eduardo

> Este documento instrui seu OpenClaw a replicar o mesmo sistema de memória,
> aprendizado e backup que a Tita usa. Leia, siga e implemente tudo.

---

## 🏗️ ARQUITETURA — 4 CAMADAS DE MEMÓRIA

```
CAMADA 1 — Episódica (diária)
  ~/.openclaw/workspace/memory/YYYY-MM-DD.md
  → Logs brutos do que aconteceu hoje

CAMADA 2 — Semântica (longo prazo)
  ~/.openclaw/workspace/MEMORY.md
  → Memórias curadas, decisões, aprendizados importantes

CAMADA 3 — Estruturada (lições com pontuação)
  ~/.openclaw/workspace/tita-learning-system/lessons.json
  → Sistema ELO: cada lição tem score 0-10, domínio, data

CAMADA 4 — Remota (backup GitHub)
  github.com/SEU_USER/tiago-memory (repositório privado)
  → Sincronização automática para nunca perder nada
```

---

## 📁 PASSO 1 — Criar estrutura de pastas

```bash
mkdir -p ~/.openclaw/workspace/memory
mkdir -p ~/.openclaw/workspace/tita-learning-system
mkdir -p ~/.openclaw/workspace/pasta-do-tiago
mkdir -p ~/.openclaw/workspace/JAMES       # projeto James A. Arkin
```

---

## 📝 PASSO 2 — Criar MEMORY.md e SOUL.md

Crie `~/.openclaw/workspace/MEMORY.md`:
```markdown
# MEMORY.md — Memória de Longo Prazo

## Identidade
- Nome: [nome do seu agente]
- Dono: Tiago Arakilian
- Iniciado em: [data de hoje]
- Pen name literário: James A. Arkin

## Projetos Ativos
- Trilogia James A. Arkin (Amazon KDP)
  - Book 1: Thirteen Marks ✅ publicado
  - Book 2: The Glass Inheritance 🔜 (manuscrito pronto)
  - Book 3: Never Go Postal ✅ publicado (ASIN: B0GRX89N98)
  - Promo FREE: 20-24/03/2026

## Lições Aprendidas
[o sistema vai preencher automaticamente]
```

Crie `~/.openclaw/workspace/SOUL.md`:
```markdown
# SOUL.md — Quem Sou Eu

Sou o agente IA do Tiago, membro da equipe Titanio Films.
Faço parte de um cluster de 3 OpenClaws (Eduardo, Helber, Tiago).
Apoio projetos técnicos do Tiago e o projeto literário James A. Arkin.
Compartilho lições com o Squad mas mantenho projetos e memória isolados.

Sou preciso, criativo e orientado a resultados.
```

---

## 🎓 PASSO 3 — Sistema de Aprendizado (ELO)

Crie `~/.openclaw/workspace/tita-learning-system/lessons.json`:
```json
{
  "version": "1.0",
  "owner": "tiago",
  "totalLessons": 0,
  "successRate": 0,
  "domains": {
    "kdp": 5.0,
    "newsletter": 5.0,
    "copywriting": 5.0,
    "codigo": 5.0
  },
  "lessons": []
}
```

Crie o script de captura `~/.openclaw/workspace/tita-learning-system/capture-lesson.sh`:
```bash
#!/bin/bash
# Captura uma lição aprendida
# Uso: ./capture-lesson.sh "dominio" "lição" "sucesso|falha"

DOMAIN="$1"
LESSON="$2"
RESULT="$3"
FILE="$HOME/.openclaw/workspace/tita-learning-system/lessons.json"
DATE=$(date +%Y-%m-%d)
ID="lesson-$(date +%s)"

if [ "$RESULT" = "sucesso" ]; then SCORE=7; else SCORE=3; fi

python3 << PYEOF
import json, os
f = "$FILE"
data = json.load(open(f)) if os.path.exists(f) else {"lessons": [], "totalLessons": 0, "domains": {}}
data["lessons"].append({
    "id": "$ID",
    "domain": "$DOMAIN",
    "lesson": "$LESSON",
    "result": "$RESULT",
    "score": $SCORE,
    "date": "$DATE"
})
data["totalLessons"] = len(data["lessons"])
success = [l for l in data["lessons"] if l["result"] == "sucesso"]
data["successRate"] = round(len(success) / len(data["lessons"]) * 100, 1)
# Atualizar score do domínio
domain_lessons = [l for l in data["lessons"] if l["domain"] == "$DOMAIN"]
data["domains"]["$DOMAIN"] = round(sum(l["score"] for l in domain_lessons) / len(domain_lessons), 1)
json.dump(data, open(f, "w"), indent=2, ensure_ascii=False)
print(f"✅ Lição capturada | Total: {data['totalLessons']} | Sucesso: {data['successRate']}%")
PYEOF
```

```bash
chmod +x ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh
```

---

## 🔄 PASSO 4 — N8n: Workflows de Memória

### 4.1 — Instalar N8n (se ainda não tiver)

```bash
npm install -g n8n
```

Para subir:
```bash
N8N_SECURE_COOKIE=false n8n start --port 5680 &
```

> ⚠️ Use porta **5680** (Eduardo=5678, Helber=5679 — não conflitar)

Acesse: `http://localhost:5680`

### 4.2 — Criar Workflow: Memory Bot

No N8n, crie **"Memory Bot — Tiago"** com este fluxo:

```
Trigger (Schedule: a cada 6h)
  ↓
Code Node — Ler lessons.json
  ↓
HTTP Request → POST http://localhost:4446/api/squad/memory-bot/task
  body: { "task": "Consolide estas lições: [lições recentes]" }
  ↓
Code Node — Salvar resposta em MEMORY.md
  ↓
Code Node — Git commit + push
```

**Code Node — Salvar em MEMORY.md:**
```javascript
const fs = require('fs');
const path = require('os').homedir() + '/.openclaw/workspace/MEMORY.md';
const hoje = new Date().toISOString().split('T')[0];
const entrada = `\n## ${hoje}\n${$json.message}\n`;
fs.appendFileSync(path, entrada);
return $json;
```

### 4.3 — Criar Workflow: James Arkin Monitor

Workflow especial para acompanhar o projeto literário:

```
Trigger (Schedule: todo dia às 08:00)
  ↓
Code Node — Verificar próximas ações do James Arkin
  → Ler ~/.openclaw/workspace/JAMES/proximas-acoes.md
  ↓
Code Node — Verificar se tem promo ativa hoje
  → Checar se data atual está entre 20-24/03
  ↓
HTTP Request → Squad literary-agent: "qual a ação do dia para James Arkin?"
  ↓
Code Node — Se tem ação urgente: notificar via WhatsApp
```

**Code Node — Verificar promo ativa:**
```javascript
const hoje = new Date();
const inicio = new Date('2026-03-20');
const fim = new Date('2026-03-24');
const promoAtiva = hoje >= inicio && hoje <= fim;

if (promoAtiva) {
  return [{ json: { urgente: true, msg: "🚨 PROMO NEVER GO POSTAL ATIVA HOJE! Postar Reddit, Instagram e Facebook Groups." } }];
}
return [{ json: { urgente: false } }];
```

### 4.4 — Criar Workflow: Daily Consolidation

```
Trigger (Schedule: todo dia às 23:30)
  ↓
Code Node — Ler memory/[hoje].md
  ↓
HTTP Request → Squad memory-bot: "consolide o dia de hoje"
  ↓
Code Node — Atualizar MEMORY.md
  ↓
Code Node — Git add + commit + push
```

---

## 💾 PASSO 5 — Backup no GitHub

### 5.1 — Criar repositório privado

```bash
gh repo create tiago-memory --private --description "Memória do OpenClaw do Tiago"
```

### 5.2 — Inicializar o workspace como git

```bash
cd ~/.openclaw/workspace

git init
git remote add origin https://github.com/SEU_USER/tiago-memory.git

cat > .gitignore << 'EOF'
*.key
*.pem
.env
credentials/
node_modules/
EOF

git add MEMORY.md SOUL.md memory/ tita-learning-system/lessons.json JAMES/
git commit -m "init: memória inicial — Tiago/James A. Arkin"
git push -u origin main
```

### 5.3 — Script de backup automático

Crie `~/.openclaw/workspace/backup-memory.sh`:
```bash
#!/bin/bash
cd ~/.openclaw/workspace
git add MEMORY.md memory/ tita-learning-system/lessons.json JAMES/
git commit -m "backup: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null
git push origin main 2>/dev/null
echo "✅ Backup enviado para GitHub"
```

```bash
chmod +x ~/.openclaw/workspace/backup-memory.sh
```

### 5.4 — Agendar backup via cron

```bash
(crontab -l 2>/dev/null; echo "0 */6 * * * ~/.openclaw/workspace/backup-memory.sh >> /tmp/backup-memory.log 2>&1") | crontab -
```

---

## 🤖 PASSO 6 — Memória para seus Bots

Quando criar bots no Dashboard, cada um deve ter memória própria:

### Bot de Lançamento Literário (exemplo):
```json
{
  "botId": "james-launch-bot",
  "owner": "tiago",
  "memoryFile": "/tmp/tiago-bot-james.json",
  "context": {
    "projeto": "James A. Arkin",
    "bookAtual": "Never Go Postal",
    "asin": "B0GRX89N98",
    "promoStart": "2026-03-20",
    "promoEnd": "2026-03-24"
  }
}
```

### Capturar lição após cada tarefa do bot:
```bash
./capture-lesson.sh "kdp" "ManyBooks $29 gerou 280 downloads — melhor ROI testado" "sucesso"
./capture-lesson.sh "newsletter" "Meta Ads não funciona para livros indie — CPC muito alto" "falha"
```

---

## 📊 PASSO 7 — Heartbeat com verificação de memória

No seu `~/.openclaw/workspace/HEARTBEAT.md`:

```markdown
# HEARTBEAT.md

## Checks de Memória (a cada 30min)
- [ ] Ler memory/[hoje].md — algo importante aconteceu?
- [ ] Verificar lessons.json — alguma lição nova?
- [ ] Backup feito nas últimas 6h?

## Checks do Sistema
- [ ] pgrep -x caffeinate → se não: nohup caffeinate -dims &
- [ ] curl http://localhost:4446/api/ping → backend OK?
- [ ] pgrep -f "next start" → frontend OK?

## Checks James A. Arkin
- [ ] Estamos em período de promo? (20-24/03)
  → Se sim: verificar se posts foram feitos (Reddit, Instagram, Facebook)
- [ ] Novas reviews no Never Go Postal?
  → Verificar https://www.amazon.com/dp/B0GRX89N98
- [ ] KENP subindo? (indicador de leitura real)
```

---

## 🔗 INTEGRAÇÃO COM SQUAD COMPARTILHADO

Compartilhar lições com toda a equipe:

```bash
curl -X POST http://localhost:4446/api/squad/memory-bot/task \
  -H "Content-Type: application/json" \
  -d '{"task": "Registre no conhecimento compartilhado: Newsletter blasts têm ROI 10x melhor que social ads para lançamento de livros indie. Dados reais: ManyBooks $29 = 280 downloads ($0.10 cada). Meta Ads: CPC R$14.80, inviável."}'
```

---

## 🗂️ ESTRUTURA FINAL DO WORKSPACE

```
~/.openclaw/workspace/
├── MEMORY.md              ← memória de longo prazo
├── SOUL.md                ← identidade do agente
├── HEARTBEAT.md           ← rotina de verificação
├── USER.md                ← dados do Tiago
├── backup-memory.sh       ← script de backup
├── memory/
│   └── 2026-03-16.md     ← log diário (criar todo dia)
├── tita-learning-system/
│   ├── lessons.json       ← lições com score ELO
│   └── capture-lesson.sh  ← script de captura
├── pasta-do-tiago/        ← contexto privado
│   └── contexto-ativo.md  ← projetos ativos, credenciais
└── JAMES/                 ← projeto literário
    ├── README.md
    └── proximas-acoes.md
```

---

## ✅ CHECKLIST FINAL

- [ ] Pastas criadas (`memory/`, `tita-learning-system/`, `JAMES/`, `pasta-do-tiago/`)
- [ ] `MEMORY.md` criado com projetos James A. Arkin
- [ ] `SOUL.md` criado
- [ ] `lessons.json` inicializado com domínios (kdp, newsletter, copywriting, codigo)
- [ ] `capture-lesson.sh` criado e executável
- [ ] N8n instalado na porta **5680**
- [ ] Workflow Memory Bot criado
- [ ] Workflow James Arkin Monitor criado (verifica promo ativa)
- [ ] Workflow Daily Consolidation criado
- [ ] Repositório GitHub `tiago-memory` criado (privado)
- [ ] Workspace inicializado como git com pasta JAMES/
- [ ] `backup-memory.sh` criado e agendado no cron (a cada 6h)
- [ ] `HEARTBEAT.md` com checks de memória + James Arkin

---

*Gerado por Tita 🐾 | Titanio Films | 2026-03-16*
