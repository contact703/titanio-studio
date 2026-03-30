# 🚀 SETUP COMPLETO — Dashboard + Memória + N8n (Tiago)
**Para:** OpenClaw do Tiago — executar este guia do início ao fim  
**Data:** 2026-03-16 | **Compilado por:** Tita 🐾

> Leia este documento inteiro, depois execute cada passo em ordem.
> Tudo que precisas está aqui. Nada de esperar o Eduardo.

---

## 📋 O QUE VOCÊ VAI TER NO FINAL

- ✅ Dashboard Titanio rodando em `http://localhost:3002`
- ✅ Seu nome "Tiago" em amarelo 🟡 no header
- ✅ 20 especialistas compartilhados com Eduardo e Helber
- ✅ Especialistas que aprendem e guardam conhecimento para todos
- ✅ Criar especialista em um → aparece em todos os Macs
- ✅ Sistema de memória com 4 camadas (igual ao Eduardo)
- ✅ N8n rodando em `http://localhost:5680`
- ✅ Backup automático no GitHub a cada 6h
- ✅ Projeto James A. Arkin integrado ao squad

---

## ⚙️ SUAS CONFIGURAÇÕES

| Campo | Valor |
|-------|-------|
| **OWNER_ID** | `tiago` |
| **Backend** | porta `4446` |
| **Frontend** | porta `3002` → `http://localhost:3002` |
| **N8n** | porta `5680` → `http://localhost:5680` |
| **Cor no cluster** | Amarelo 🟡 |
| **Peers** | Eduardo `192.168.18.174:4444` · Helber `192.168.18.170:4445` |

---

## 🗂️ PARTE 1 — DASHBOARD

### 1.1 — Copiar o pacote do TITA_039

```bash
cp -r /Volumes/TITA_039/backup-projetos/titanio-dist/titanio-tiago ~/titanio-tiago
cd ~/titanio-tiago
chmod +x INICIAR.sh
```

### 1.2 — Instalar dependências

```bash
# Backend
cd ~/titanio-tiago/code/backend
npm install --legacy-peer-deps

# Frontend
cd ~/titanio-tiago/code/frontend
npm install --legacy-peer-deps
npx next build
```

⏱️ Demora ~5 minutos na primeira vez.

### 1.3 — Iniciar

```bash
cd ~/titanio-tiago
./INICIAR.sh
```

Acesse: **http://localhost:3002**

### 1.4 — Verificar

```bash
curl http://localhost:4446/api/ping
# Deve retornar: {"status":"ok","owner":"tiago",...}
```

---

## 🤝 PARTE 2 — SQUAD COMPARTILHADO

O squad é **100% compartilhado** via TITA_039. Todos os 20 especialistas aparecem igual para Eduardo, Helber e Tiago.

**Como funciona:**
- Especialistas base: hardcoded (sempre disponíveis offline)
- Especialistas customizados: em `/Volumes/TITA_039/backup-projetos/titanio-shared-squad.json`
- Knowledge base: em `/Volumes/TITA_039/backup-projetos/titanio-shared-knowledge.json`
- Lessons: em `/Volumes/TITA_039/backup-projetos/titanio-squad-lessons.json`

**Criar novo especialista (aparece pra todo mundo):**
```bash
curl -X POST http://localhost:4446/api/squad \
  -H "Content-Type: application/json" \
  -d '{
    "id": "meu-especialista",
    "name": "Nome",
    "role": "Função",
    "skills": ["skill1", "skill2"],
    "description": "O que ele faz"
  }'
```

**Ou pela interface:** Squad → botão "+ Especialista" (disponível na dashboard)

---

## 🧠 PARTE 3 — SISTEMA DE MEMÓRIA

### 3.1 — Criar estrutura

```bash
mkdir -p ~/.openclaw/workspace/memory
mkdir -p ~/.openclaw/workspace/tita-learning-system
mkdir -p ~/.openclaw/workspace/pasta-do-tiago
mkdir -p ~/.openclaw/workspace/JAMES
```

### 3.2 — Criar MEMORY.md

```bash
cat > ~/.openclaw/workspace/MEMORY.md << 'EOF'
# MEMORY.md — Memória de Longo Prazo do Tiago

## Identidade
- Dono: Tiago Arakilian
- Mac: Tiago Mac Mini
- Pen name literário: James A. Arkin
- Iniciado: 2026-03-16

## Projeto James A. Arkin
- Book 1: Thirteen Marks ✅ publicado (651 downloads)
- Book 2: The Glass Inheritance 🔜 (manuscrito 31.690 palavras)
- Book 3: Never Go Postal ✅ publicado — ASIN: B0GRX89N98
  - Promo FREE: 20-24/03/2026 (Fussy Librarian + ManyBooks pagos)
- Royalties: ~$62.80 acumulados (mínimo $100 para receber)

## Projetos Ativos
[preencher conforme for trabalhando]
EOF
echo "✅ MEMORY.md criado"
```

### 3.3 — Criar SOUL.md

```bash
cat > ~/.openclaw/workspace/SOUL.md << 'EOF'
# SOUL.md — Quem Sou Eu

Sou o agente IA do Tiago, membro da equipe Titanio Films.
Cluster de 3 OpenClaws: Eduardo (.174), Helber (.170), Tiago (.188).
Apoio projetos técnicos e o projeto literário James A. Arkin.
Squad de 20 especialistas — compartilhado com todos.

Sou preciso, criativo e orientado a resultados.
EOF
echo "✅ SOUL.md criado"
```

### 3.4 — Criar USER.md

```bash
cat > ~/.openclaw/workspace/USER.md << 'EOF'
# USER.md — Sobre Meu Humano

- Nome: Tiago Arakilian
- Pen name: James A. Arkin
- Equipe: Titanio Films
- Mac: IP 192.168.18.188
- Projetos: Titanio + Trilogia KDP
EOF
echo "✅ USER.md criado"
```

### 3.5 — Sistema de Aprendizado ELO

```bash
cat > ~/.openclaw/workspace/tita-learning-system/lessons.json << 'EOF'
{
  "version": "1.0",
  "owner": "tiago",
  "totalLessons": 0,
  "successRate": 0,
  "domains": {"kdp": 5.0, "newsletter": 5.0, "codigo": 5.0, "design": 5.0},
  "lessons": []
}
EOF

cat > ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh << 'SCRIPT'
#!/bin/bash
DOMAIN="$1"; LESSON="$2"; RESULT="$3"
FILE="$HOME/.openclaw/workspace/tita-learning-system/lessons.json"
SCORE=7; [ "$RESULT" = "falha" ] && SCORE=3
python3 << PYEOF
import json,os,time
f="$FILE"
d=json.load(open(f)) if os.path.exists(f) else {"lessons":[],"totalLessons":0,"domains":{}}
d["lessons"].append({"id":"l-$(date +%s)","domain":"$DOMAIN","lesson":"$LESSON","result":"$RESULT","score":$SCORE,"date":"$(date +%Y-%m-%d)"})
d["totalLessons"]=len(d["lessons"])
s=[x for x in d["lessons"] if x["result"]=="sucesso"]
d["successRate"]=round(len(s)/len(d["lessons"])*100,1)
json.dump(d,open(f,"w"),indent=2,ensure_ascii=False)
print(f"✅ Lição: {d['totalLessons']} total | {d['successRate']}% sucesso")
PYEOF
SCRIPT
chmod +x ~/.openclaw/workspace/tita-learning-system/capture-lesson.sh
echo "✅ Sistema ELO criado"
```

### 3.6 — Criar HEARTBEAT.md

```bash
cat > ~/.openclaw/workspace/HEARTBEAT.md << 'EOF'
# HEARTBEAT.md

## Sistema
- [ ] pgrep -x caffeinate || nohup caffeinate -dims &>/dev/null &
- [ ] curl http://localhost:4446/api/ping → backend OK?
- [ ] pgrep -f "next start" → frontend OK?

## Memória
- [ ] Backup recente? → ls -la /tmp/backup-memory.log
- [ ] Lições novas para consolidar?

## James A. Arkin
- [ ] Estamos em 20-24/03? → verificar promo ativa
- [ ] Novas reviews: https://www.amazon.com/dp/B0GRX89N98
EOF
echo "✅ HEARTBEAT.md criado"
```

---

## 💾 PARTE 4 — BACKUP NO GITHUB

### 4.1 — Criar repositório privado

```bash
gh repo create tiago-memory --private
# Se não tiver gh: criar em github.com (repositório privado)
```

### 4.2 — Inicializar git no workspace

```bash
cd ~/.openclaw/workspace

git init
git remote add origin https://github.com/SEU_USUARIO/tiago-memory.git

cat > .gitignore << 'EOF'
*.key
*.pem
.env
node_modules/
credentials/
EOF

git add MEMORY.md SOUL.md USER.md HEARTBEAT.md memory/ tita-learning-system/ JAMES/
git commit -m "init: workspace Tiago"
git push -u origin main
echo "✅ Backup inicial enviado"
```

### 4.3 — Backup automático a cada 6h

```bash
cat > ~/.openclaw/workspace/backup-memory.sh << 'SCRIPT'
#!/bin/bash
cd ~/.openclaw/workspace
git add MEMORY.md memory/ tita-learning-system/lessons.json JAMES/ 2>/dev/null
git commit -m "backup: $(date '+%Y-%m-%d %H:%M')" 2>/dev/null
git push origin main 2>/dev/null
echo "$(date): backup OK" >> /tmp/backup-memory.log
SCRIPT
chmod +x ~/.openclaw/workspace/backup-memory.sh

# Cron: a cada 6h
(crontab -l 2>/dev/null; echo "0 */6 * * * ~/.openclaw/workspace/backup-memory.sh") | crontab -
echo "✅ Cron de backup configurado"
```

---

## 🔄 PARTE 5 — N8N

### 5.1 — Instalar

```bash
npm install -g n8n
echo "✅ N8n instalado"
```

### 5.2 — Subir na porta 5680

```bash
N8N_SECURE_COOKIE=false nohup n8n start --port 5680 > /tmp/n8n-tiago.log 2>&1 &
sleep 5
echo "✅ N8n rodando em http://localhost:5680"
```

### 5.3 — Configurar conta (na interface)

Acesse `http://localhost:5680` e crie sua conta.

### 5.4 — Criar Workflow: Memory Bot

Na interface do N8n, crie um workflow **"Memory Bot — Tiago"**:

**Nós:**
1. **Schedule Trigger** → a cada 6 horas
2. **Code** → Ler lessons.json:
```javascript
const fs = require('fs');
const file = `${process.env.HOME}/.openclaw/workspace/tita-learning-system/lessons.json`;
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const recent = data.lessons.slice(-10);
return [{ json: { lessons: recent, total: data.totalLessons, rate: data.successRate } }];
```
3. **HTTP Request** → POST `http://localhost:4446/api/squad/memory-bot/task`
   - Body: `{"task": "Consolide estas lições recentes e atualize meu MEMORY.md: {{$json.lessons}}"}`
4. **Code** → Salvar em MEMORY.md:
```javascript
const fs = require('fs');
const file = `${process.env.HOME}/.openclaw/workspace/MEMORY.md`;
const hoje = new Date().toISOString().split('T')[0];
fs.appendFileSync(file, `\n## ${hoje} — Consolidado pelo Memory Bot\n${$json.message}\n`);
return $json;
```
5. **Code** → Git backup:
```javascript
const { execSync } = require('child_process');
execSync(`cd ${process.env.HOME}/.openclaw/workspace && git add -A && git commit -m "n8n: consolidação $(date +%Y-%m-%d)" && git push origin main`, { stdio: 'pipe' });
return $json;
```

### 5.5 — Criar Workflow: Daily Consolidation

Mesmo fluxo mas com **Schedule Trigger às 23:30** e task:
```
"Analise o dia de hoje em ~/.openclaw/workspace/memory/[hoje].md e consolide os insights mais importantes no MEMORY.md"
```

### 5.6 — Criar Workflow: James Arkin Monitor

**Schedule Trigger às 08:00** todos os dias:
```javascript
// Verificar se promo está ativa
const hoje = new Date();
const promoInicio = new Date('2026-03-20');
const promoFim = new Date('2026-03-24');
if (hoje >= promoInicio && hoje <= promoFim) {
  return [{ json: { urgente: true, msg: "🚨 PROMO NEVER GO POSTAL ATIVA! Postar Reddit, Instagram, Facebook." } }];
}
return [{ json: { urgente: false } }];
```

---

## 📚 PARTE 6 — ESPECIALISTA JAMES ARKIN (confirmar)

O especialista James Arkin já foi criado pela Tita com todo o conhecimento do projeto. Para verificar:

```bash
curl http://localhost:4446/api/squad | python3 -c "
import json,sys
d=json.load(sys.stdin)
s=d if isinstance(d,list) else d.get('specialists',[])
ja=[x for x in s if x.get('id')=='literary-agent']
print('James Arkin:', '✅' if ja else '❌ não encontrado')
print('Total especialistas:', len(s))
"
```

Se não aparecer:
```bash
curl -X POST http://localhost:4446/api/squad \
  -H "Content-Type: application/json" \
  -d '{
    "id": "literary-agent",
    "name": "📚 James Arkin",
    "role": "Lançamento Literário & KDP",
    "skills": ["Amazon KDP","Newsletter Blasts","Free Promo","Query Letters","BookBub","ARC Readers"],
    "description": "Especialista em lançamento literário KDP. Pen name James A. Arkin (Tiago Arakilian). Trilogia Psychological Thriller. Never Go Postal promo FREE 20-24/03/2026."
  }'
```

---

## 🔄 PARTE 7 — MANTER TUDO RODANDO

### Script de watchdog (reinicia se cair)

```bash
cat > ~/.openclaw/workspace/watchdog-tiago.sh << 'SCRIPT'
#!/bin/bash
while true; do
  # Backend
  curl -sf http://localhost:4446/api/ping > /dev/null 2>&1 || {
    echo "$(date): Backend caiu, reiniciando..." >> /tmp/watchdog-tiago.log
    cd ~/titanio-tiago/code/backend && nohup node dist/index.js > /tmp/backend-tiago.log 2>&1 &
  }
  # caffeinate
  pgrep -x caffeinate > /dev/null || nohup caffeinate -dims &>/dev/null &
  sleep 60
done
SCRIPT
chmod +x ~/.openclaw/workspace/watchdog-tiago.sh
nohup bash ~/.openclaw/workspace/watchdog-tiago.sh > /tmp/watchdog-tiago.log 2>&1 &
echo "✅ Watchdog rodando"
```

---

## ✅ CHECKLIST FINAL

Execute cada item e marque ✅:

**Dashboard:**
- [ ] `curl http://localhost:4446/api/ping` → retorna `"owner":"tiago"`
- [ ] `http://localhost:3002` abre com nome "Tiago" em amarelo
- [ ] Squad mostra 20 especialistas
- [ ] James Arkin aparece no squad

**Memória:**
- [ ] `~/.openclaw/workspace/MEMORY.md` criado
- [ ] `~/.openclaw/workspace/SOUL.md` criado
- [ ] `~/.openclaw/workspace/HEARTBEAT.md` criado
- [ ] `lessons.json` inicializado
- [ ] `capture-lesson.sh` executável
- [ ] GitHub repo criado e workspace pushado
- [ ] Cron de backup configurado (`crontab -l | grep backup`)

**N8n:**
- [ ] `http://localhost:5680` abre
- [ ] Conta criada
- [ ] Workflow Memory Bot criado e ativo
- [ ] Workflow Daily Consolidation criado e ativo
- [ ] Workflow James Arkin Monitor criado e ativo

**Sistema:**
- [ ] caffeinate rodando (`pgrep -x caffeinate`)
- [ ] Watchdog rodando (`pgrep -f watchdog-tiago`)

---

## 🆘 PROBLEMAS COMUNS

```bash
# Backend não sobe
tail -30 /tmp/backend-tiago.log

# Porta ocupada
lsof -i :4446 | xargs kill -9

# "owner: eduardo" aparecendo → .env não carregado
cd ~/titanio-tiago/code/backend
cat .env  # deve ter OWNER_ID=tiago
node dist/index.js  # rodar daqui!

# Especialistas não aparecem → TITA_039 não montado?
ls /Volumes/TITA_039/backup-projetos/titanio-shared-squad.json

# N8n não sobe
N8N_SECURE_COOKIE=false n8n start --port 5680
```

---

## 📞 DÚVIDAS

Qualquer problema → fala com a Tita 🐾 no grupo Gospia.

---

*Gerado por Tita 🐾 | Titanio Films | 2026-03-16*
*Dashboard: 20 especialistas compartilhados | Memória: 4 camadas | N8n: 3 workflows*
