# 🦌 HiClaw DeerFlow Upgrade — Guia Completo

> **Para:** Claw do Helber e Claw do Tiago
> **De:** Tita + Code Ninja + Debug Hunter
> **Data:** 29/03/2026
> **Ref:** github.com/bytedance/deer-flow (analisado e adaptado)

---

## O QUE É

Upgrade do nosso HiClaw (Task Manager multi-agente) inspirado no DeerFlow da ByteDance.
NÃO estamos instalando o DeerFlow — estamos copiando os conceitos que fazem sentido e integrando no que já temos.

---

## O QUE COPIAMOS DO DEERFLOW

### 1. Memory Middleware (PRINCIPAL)
Intercepta TODA mensagem ANTES do agente responder e injeta contexto relevante.

**Antes (nosso problema):**
```
Mensagem → Agente → Resposta (sem contexto, esquece tudo)
```

**Depois (DeerFlow style):**
```
Mensagem → Memory Middleware → Injeta contexto → Agente → Resposta → Salva memória
```

Implementação: `tita-session-boot.sh` gera `SESSION-CONTEXT.md` que é injetado automaticamente.
Upgrade: agora também roda `tmem query` antes de responder.

### 2. Memória Estruturada (não só markdown)
DeerFlow usa JSON estruturado:
```json
{
  "user": {
    "workContext": {"summary": "...", "updatedAt": "..."},
    "personalContext": {"summary": "...", "updatedAt": "..."},
    "topOfMind": {"summary": "...", "updatedAt": "..."}
  },
  "history": {
    "recentMonths": {"summary": "..."},
    "earlierContext": {"summary": "..."},
    "longTermBackground": {"summary": "..."}
  },
  "facts": [{"content": "...", "category": "...", "confidence": 0.8}]
}
```

Implementação nossa: `tmem curate` + `memory/context-tree.json` + `memory/curated-knowledge.json`

### 3. Per-Agent Memory
Cada agente tem memória ISOLADA — não compartilha tudo com todos.

Implementação nossa: `pasta-do-tita/memoria-especialistas/{id}/` — JÁ TEMOS!
- lessons.json (lições)
- memory.json (knowledge + sessões)
- context.md (contexto do especialista)

### 4. Debounce de Salvamento
Não salva a cada mensagem — espera 30 segundos e consolida.

Implementação: nosso flush persistente (a cada 3h) + SESSION-CONTEXT (a cada 30min)

### 5. Task Decomposition (Sub-Agents)
Coordinator quebra tarefa complexa → delega pra especialistas → consolida resultado.

Implementação: HiClaw com pipelines — JÁ TEMOS!
- `POST /api/tasks/delegate` com `handoff_chain`
- 8 pipelines pré-configurados (video, bug-fix, segurança, etc.)

---

## O QUE NÃO COPIAMOS (e por quê)

| Feature DeerFlow | Por que NÃO | Alternativa nossa |
|---|---|---|
| Docker Sandbox | RAM 97%, Docker mataria o Mac | Especialistas no mesmo filesystem (ok pra nosso uso) |
| LangChain/LangGraph | Dependência pesada + Python | HiClaw TypeScript nativo na Dashboard |
| Frontend React deles | Já temos Dashboard 2.0 completa | 15 painéis, 141 endpoints |
| Cloud hosting | Queremos tudo local | Mac Mini 24/7 |

---

## PASSO 1 — Atualizar tmem (Titanio Memory CLI)

O `tmem` já implementa os conceitos do DeerFlow. Copiem do Mac do Eduardo:

```bash
scp contacttitanio@192.168.18.174:/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tmem ~/workspace/bin/tmem
chmod +x ~/workspace/bin/tmem
```

Ajustar WORKSPACE path no script.

Comandos disponíveis:
```bash
tmem query "pergunta"     # Busca semântica (como DeerFlow memory read)
tmem curate "fato"        # Guarda conhecimento (como DeerFlow memory write)
tmem learn "lição"        # Registra lição (salva em LESSONS.md também)
tmem who "pessoa"         # Info sobre pessoa
tmem project "nome"       # Info sobre projeto
tmem tree                 # Context tree (como DeerFlow memory structure)
tmem status               # Visão geral
tmem test                 # Teste automático (10 perguntas)
tmem recall               # Últimos 3 dias
tmem refresh              # Reindexar
tmem score                # Nota de qualidade
```

---

## PASSO 2 — Atualizar SESSION-CONTEXT.md

O `tita-session-boot.sh` gera contexto automático a cada 30min. Copiem:

```bash
scp contacttitanio@192.168.18.174:/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-session-boot.sh ~/workspace/bin/
chmod +x ~/workspace/bin/tita-session-boot.sh
# Ajustar WORKSPACE path
# Instalar LaunchAgent (ver INSTALAR-TMEM-HELBER-TIAGO.md)
```

---

## PASSO 3 — Atualizar AGENTS.md e SOUL.md

Copiar REGRA #0 e Regra de Ouro (ver INSTALAR-TMEM-HELBER-TIAGO.md).

---

## PASSO 4 — Git Pull da Dashboard

```bash
cd pasta-do-tita/projetos/titanio-dashboard
git pull origin main
```

Traz:
- ✅ Aba Mídia (MediaPanel.tsx) — galeria + gerador + pipeline
- ✅ 5 endpoints /api/media/*
- ✅ Sidebar atualizada com aba Mídia

---

## PASSO 5 — Testar Tudo

```bash
# 1. tmem funcionando
tmem status
tmem query "o que fizemos ontem"
tmem curate "teste de curadoria DeerFlow upgrade"

# 2. SESSION-CONTEXT gerado
bash bin/tita-session-boot.sh
cat SESSION-CONTEXT.md | head -20

# 3. Memory test
tmem test  # Meta: 10/10

# 4. Dashboard com aba Mídia
# Abrir http://localhost:3001 (Helber) ou :3002 (Tiago)
# Verificar aba Mídia no menu lateral

# 5. HiClaw delegação
curl -s -X POST http://localhost:4445/api/tasks/delegate \
  -H "Content-Type: application/json" \
  -d '{"title":"teste upgrade","specialistId":"code-ninja","requester":"teste","description":"teste"}'
```

---

## COMPARAÇÃO: ANTES vs DEPOIS

| Aspecto | Antes | Depois (DeerFlow upgrade) |
|---|---|---|
| Memória | Markdown disperso | tmem CLI + context tree + curated JSON |
| Sessão nova | Zerada | SESSION-CONTEXT.md (5 dias, auto) |
| Busca | grep manual | Semântica (2095 chunks) |
| Especialistas | Memória isolada ✅ | Memória isolada + tmem curate ✅ |
| Delegação | HiClaw básico | HiClaw + 8 pipelines + handoff |
| Dashboard | 14 abas | 15 abas (+ Mídia) |
| Teste | Manual | Automático 2x/dia (10 perguntas) |
| Score | Sem tracking | Score C→A (tracking contínuo) |

---

## STACK COMPLETO (pós-upgrade)

```
Mensagem do usuário
       │
       ▼
[SESSION-CONTEXT.md] ← injetado automaticamente (5 dias de contexto)
       │
       ▼  
[AGENTS.md REGRA #0] ← forçar leitura antes de responder
       │
       ▼
[memory_search] ← busca semântica (2095 chunks)
       │
       ▼
[tmem query] ← knowledge curado (19+ entries, context tree)
       │
       ▼
LLM responde com contexto completo
       │
       ▼
[tmem curate] ← salva novo conhecimento automaticamente
       │
       ▼
[Memory Score] ← tracking de qualidade
```

---

## CHECKLIST

- [ ] Copiar tmem + scripts do Mac Eduardo
- [ ] Ajustar paths
- [ ] `tmem status` funciona
- [ ] `tita-session-boot.sh` gera SESSION-CONTEXT.md
- [ ] LaunchAgent instalado (auto 30min)
- [ ] AGENTS.md com REGRA #0
- [ ] SOUL.md com Regra de Ouro
- [ ] Git pull Dashboard (aba Mídia)
- [ ] `tmem test` → meta 10/10
- [ ] `tmem curate "teste"` funciona
- [ ] HiClaw delegação funciona

---

*DeerFlow (ByteDance) analisado, adaptado e integrado. Zero dependências novas. 100% local.*
*Código fonte DeerFlow clonado em: workspace/deer-flow/ (referência)*
🐾
