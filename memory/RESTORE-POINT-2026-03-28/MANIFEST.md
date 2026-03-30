# RESTORE POINT — 2026-03-28

**Data:** 2026-03-28 ~00:45 BRT
**Motivo:** Antes do upgrade Memory Engine v1.0
**Criado por:** Tita, a pedido da Zica

## O que foi salvo
- MEMORY.md, LESSONS.md, AGENTS.md, HEARTBEAT.md
- USER.md, TOOLS.md, SOUL.md
- Todos os arquivos memory/*.md
- Scripts bin/*.py e bin/*.sh

## Como restaurar
```bash
bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/memory/RESTORE-POINT-2026-03-28/RESTORE.sh
```

## O que o upgrade adicionou (será removido na restauração)
- `memory/tita-memory.db` — base de dados vetorial
- `bin/tita-memory-engine.py` — motor de busca semântica
- `bin/tita-memory-graph.py` — grafo de conexões entre memórias
- `bin/tita-memory-refresh.sh` — auto-refresh no watchdog
