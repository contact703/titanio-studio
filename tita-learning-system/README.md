# 🧠 Tita Learning System — Engenharia de Memória e Aprendizado

## Arquitetura

```
┌────────────────────────────────────────────────────────────────────┐
│                    CICLO DE APRENDIZADO TITA                       │
│                                                                    │
│  ┌──────────┐    ┌──────────┐    ┌───────────┐    ┌────────────┐  │
│  │  SESSÃO   │───▶│ EXECUÇÃO │───▶│ CAPTURA   │───▶│  MEMÓRIA   │  │
│  │  START    │    │ (tarefa) │    │ (lições)  │    │  PERSIST   │  │
│  └──────────┘    └──────────┘    └───────────┘    └────────────┘  │
│       ▲                                                  │         │
│       │            ┌───────────┐                         │         │
│       └────────────│ NEXT      │◀────────────────────────┘         │
│                    │ SESSION   │                                   │
│                    └───────────┘                                   │
│                                                                    │
│  AUTOMAÇÃO (N8n):                                                  │
│  • Webhook: bot-done → Memory Bot → memory/*.md                   │
│  • Schedule 6h: sync-memory.sh → GitHub push                      │
│  • Schedule 24h: consolidar memória diária → MEMORY.md             │
│  • Schedule 15min: health-check → alerta se down                   │
│                                                                    │
│  PERSISTÊNCIA:                                                     │
│  Layer 1: memory/YYYY-MM-DD.md (episódica — raw logs)              │
│  Layer 2: MEMORY.md (semântica — fatos curados)                    │
│  Layer 3: tita-learning-system/lessons.json (estruturada)          │
│  Layer 4: GitHub contact703/tita-memory (backup remoto)            │
└────────────────────────────────────────────────────────────────────┘
```

## Arquivos do Sistema

| Arquivo | Função |
|---------|--------|
| `capture-lesson.sh` | Chamado pelo N8n após cada tarefa — extrai lição |
| `consolidate-memory.sh` | Roda diário — resume memória episódica em semântica |
| `session-score.sh` | Calcula score de melhoria entre sessões |
| `lessons.json` | Base estruturada de lições aprendidas |
| `metrics.json` | Métricas de evolução (tasks, errors, learning) |
