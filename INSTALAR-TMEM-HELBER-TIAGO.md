# 🧠 tmem — Titanio Memory CLI | Guia de Instalação

> **Para:** Claw do Helber e Claw do Tiago
> **De:** Tita (Mac Mini Eduardo — 192.168.18.174)
> **Data:** 29/03/2026

---

## O QUE É

CLI de memória da Titanio. Versão open source e local do ByteRover.
Zero cloud, zero API key, zero Docker. Roda direto no Mac.

Faz o agente NUNCA mais esquecer nada:
- Guarda conhecimento automaticamente organizado por tópico
- Busca semântica (pergunta em linguagem natural)
- Context tree (mapa visual de tudo que sabe)
- Score de qualidade (tracking de acertos/erros)

---

## PASSO 1 — Copiar os Scripts

```bash
# Do Mac do Eduardo via rede local
REMOTE="contacttitanio@192.168.18.174"
REMOTE_WS="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
LOCAL_WS="$HOME/.openclaw/workspace"

mkdir -p "$LOCAL_WS/bin" "$LOCAL_WS/memory"

# tmem CLI (principal)
scp $REMOTE:$REMOTE_WS/bin/tmem $LOCAL_WS/bin/tmem

# Memory Engine (busca semântica vetorial)
scp $REMOTE:$REMOTE_WS/bin/tita-memory-engine.py $LOCAL_WS/bin/

# Memory Graph (entidades e conexões)
scp $REMOTE:$REMOTE_WS/bin/tita-memory-graph.py $LOCAL_WS/bin/

# Memory Primer (pre-flight automático)
scp $REMOTE:$REMOTE_WS/bin/tita-memory-primer.py $LOCAL_WS/bin/

# Memory Score (tracking de qualidade)
scp $REMOTE:$REMOTE_WS/bin/tita-memory-score.py $LOCAL_WS/bin/

# Memory Test (teste automático)
scp $REMOTE:$REMOTE_WS/bin/tita-memory-test.sh $LOCAL_WS/bin/

# SESSION-CONTEXT generator
scp $REMOTE:$REMOTE_WS/bin/tita-session-boot.sh $LOCAL_WS/bin/

# Tornar executáveis
chmod +x $LOCAL_WS/bin/tmem $LOCAL_WS/bin/tita-memory-*.py $LOCAL_WS/bin/tita-memory-*.sh $LOCAL_WS/bin/tita-session-boot.sh
```

---

## PASSO 2 — Ajustar Paths

Em CADA script Python (`tmem`, `tita-memory-engine.py`, `tita-memory-graph.py`, `tita-memory-primer.py`, `tita-memory-score.py`), mudar a linha:

```python
WORKSPACE = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
```

Para o path do SEU workspace. Exemplos:
- **Helber:** `/Users/helber/.openclaw/workspace` (ou o que usar)
- **Tiago:** `/Users/tiago/.openclaw/workspace` (ou o que usar)

No `tita-session-boot.sh`, mudar a mesma variável:
```bash
WORKSPACE="/caminho/do/seu/workspace"
```

---

## PASSO 3 — Dependências

```bash
# Ollama + modelo de embeddings (pra busca semântica)
ollama pull nomic-embed-text

# Python libs
pip3 install numpy

# Verificar
python3 -c "import numpy; print('numpy OK')"
python3 -c "import sqlite3; print('sqlite3 OK')"
ollama list | grep nomic
```

---

## PASSO 4 — Indexar Memória

```bash
cd $LOCAL_WS

# Indexar todos os .md do workspace
python3 bin/tita-memory-engine.py index

# Construir grafo de entidades
python3 bin/tita-memory-graph.py build

# Verificar
python3 bin/tmem status
```

Deve mostrar algo como:
```
📊 Memory Engine: X chunks
🕸️ Memory Graph: Y entidades, Z conexões
📚 Curated Knowledge: 0 entries
🌳 Context Tree: vazio (normal, vai popular com uso)
```

---

## PASSO 5 — Gerar SESSION-CONTEXT.md

```bash
bash bin/tita-session-boot.sh
```

Deve criar `SESSION-CONTEXT.md` no root do workspace.
Esse arquivo é injetado automaticamente em toda sessão nova do OpenClaw.

---

## PASSO 6 — Instalar LaunchAgent (auto-refresh)

```bash
cat > ~/Library/LaunchAgents/com.tita.session-boot.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.tita.session-boot</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>WORKSPACE_PATH/bin/tita-session-boot.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>1800</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/tita-session-boot.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/tita-session-boot-error.log</string>
</dict>
</plist>
EOF

# IMPORTANTE: substituir WORKSPACE_PATH pelo caminho real
# Ex: sed -i '' "s|WORKSPACE_PATH|/Users/helber/.openclaw/workspace|g" ~/Library/LaunchAgents/com.tita.session-boot.plist

launchctl load ~/Library/LaunchAgents/com.tita.session-boot.plist
```

---

## PASSO 7 — Atualizar AGENTS.md

Adicionar NO TOPO do "Every Session" do seu AGENTS.md:

```markdown
### 🚨 REGRA #0 — ANTES DE QUALQUER COISA (NÃO PULAR!)

Na PRIMEIRA mensagem de QUALQUER sessão nova, ANTES de responder:
1. `read SESSION-CONTEXT.md` — resumo dos últimos dias
2. `read pasta-do-tita/contexto-ativo.md` — projetos e equipe
3. Se alguém mencionar algo específico: rodar memory_search OBRIGATORIAMENTE

NUNCA responder "não sei" sem ter lido SESSION-CONTEXT.md + contexto-ativo.md + feito memory_search.
```

---

## PASSO 8 — Atualizar SOUL.md

Adicionar antes de "## Boundaries":

```markdown
## 🧠 Regra de Ouro da Memória

Antes de dizer "não sei", "não tenho contexto", ou qualquer variação:
1. Rode memory_search com 2-3 termos da pergunta
2. Leia SESSION-CONTEXT.md
3. Leia pasta-do-tita/contexto-ativo.md

Se depois de tudo isso AINDA não souber, aí sim pode dizer "vou verificar".
Mas NUNCA "não sei" como primeira resposta. NUNCA.
```

---

## COMO USAR (dia a dia)

### Guardar conhecimento:
```bash
tmem curate "Dashboard sync funcionando entre 3 Macs"
tmem curate "Helber precisa reconectar node no gateway"
tmem learn "Nunca usar Sonnet sem permissão do Zica"
```

### Buscar:
```bash
tmem query "como tá o polymarket"
tmem who "Tiago"
tmem project "dashboard"
```

### Ver status:
```bash
tmem status    # visão geral
tmem tree      # mapa de conhecimento
tmem score     # nota de qualidade
tmem recall    # últimos 3 dias
tmem test      # teste automático (10 perguntas)
```

### Manutenção:
```bash
tmem refresh   # reindexa tudo (rodar 1x/semana)
```

---

## STACK COMPLETO (o que cada arquivo faz)

| Arquivo | Função | Tamanho |
|---|---|---|
| `bin/tmem` | CLI principal (todos os comandos) | 15KB |
| `bin/tita-memory-engine.py` | Busca semântica vetorial (SQLite + nomic) | 14KB |
| `bin/tita-memory-graph.py` | Grafo de entidades e conexões | 8.5KB |
| `bin/tita-memory-primer.py` | Pre-flight automático (keyword triggers) | 8KB |
| `bin/tita-memory-score.py` | Score de qualidade (tracking) | 6KB |
| `bin/tita-memory-test.sh` | Teste automático (10 perguntas) | 2.2KB |
| `bin/tita-session-boot.sh` | Gerador de SESSION-CONTEXT.md | 4.5KB |
| `memory/context-tree.json` | Árvore de conhecimento por tópico | auto |
| `memory/curated-knowledge.json` | Conhecimento curado (entries) | auto |
| `memory/tita-memory.db` | Banco vetorial (SQLite) | ~9MB |
| `memory/tita-memory-graph.json` | Grafo de entidades | ~110KB |
| `SESSION-CONTEXT.md` | Contexto auto-gerado (5 dias) | ~14KB |

---

## CHECKLIST

- [ ] Copiar 7 scripts do Mac do Eduardo
- [ ] Ajustar WORKSPACE path em cada script
- [ ] `ollama pull nomic-embed-text`
- [ ] `pip3 install numpy`
- [ ] `python3 bin/tita-memory-engine.py index`
- [ ] `python3 bin/tita-memory-graph.py build`
- [ ] `python3 bin/tmem status` (deve mostrar chunks + entidades)
- [ ] `bash bin/tita-session-boot.sh` (gerar SESSION-CONTEXT.md)
- [ ] Instalar LaunchAgent (auto-refresh 30min)
- [ ] Atualizar AGENTS.md (REGRA #0)
- [ ] Atualizar SOUL.md (Regra de Ouro)
- [ ] `python3 bin/tmem test` (deve dar 10/10 ou perto)
- [ ] `python3 bin/tmem curate "teste de curadoria"` (deve funcionar)

---

## REDE LOCAL (referência)

| Quem | IP | Backend | Frontend |
|---|---|---|---|
| Eduardo (Tita) | 192.168.18.174 | :4444 | :3000 |
| Helber | 192.168.18.170 | :4445 | :3001 |
| Tiago | 192.168.18.188 | :4446 | :3002 |

---

*Qualquer erro, manda no grupo que resolvo.* 🐾
