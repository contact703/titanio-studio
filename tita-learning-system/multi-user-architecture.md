# Arquitetura Multi-Usuário Titanio — Helber & Tiago

## Visão Geral

Cada membro tem um ecossistema INDEPENDENTE e PERSONALIZADO:
- Seu próprio OpenClaw (agent configurado com a identidade deles)
- Sua própria memória e sistema de aprendizado
- Seu próprio Dashboard com projetos pessoais
- Mas CONECTADOS ao gateway central (192.168.18.174)

```
┌─────────────────────────────────────────────────────────────────┐
│                    REDE TITANIO LOCAL                           │
│                                                                 │
│  ┌─────────────────┐    ┌────────────────┐  ┌───────────────┐  │
│  │ Mac Mini TITA   │    │ Mac Mini HELBER │  │ Mac Mini TIAGO│  │
│  │ .174            │    │ .170 (ou .169) │  │ .188 (ou .169)│  │
│  │                 │    │                │  │               │  │
│  │ • OpenClaw GW   │◀───│ • openclaw node│  │ • openclaw node│  │
│  │   port 18789    │    │   → conecta GW │  │   → conecta GW│  │
│  │ • Dashboard 3000│    │ • Dashboard 3001│  │ • Dashboard 3002│
│  │ • Backend 4444  │    │ • Backend 4445 │  │ • Backend 4446│  │
│  │ • N8n 5678      │    │ • Memória própria│  │ • Memória própria│
│  │ • Memória Tita  │    │ • Projetos Helber│  │ • Projetos Tiago│
│  └─────────────────┘    └────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Estrutura de Pastas por Usuário

### Helber (~/.openclaw/workspace/)
```
~/.openclaw/workspace/
├── SOUL.md          (personalidade do agente do Helber)
├── USER.md          (quem é o Helber)
├── MEMORY.md        (memória longa duração)
├── AGENTS.md
├── HEARTBEAT.md
├── memory/
│   └── YYYY-MM-DD.md
├── tita-learning-system/
│   ├── lessons.json
│   ├── metrics.json
│   ├── capture-lesson.sh
│   ├── consolidate-memory.sh
│   └── session-score.sh
└── projetos/        (projetos do Helber)
```

### Tiago (igual, identidade diferente)

## Arquivos de Identidade

### SOUL.md do Helber
- Nome do agente: (a definir com Helber)
- Especialidades: (projetos do Helber)
- Tom/personalidade própria

### USER.md do Helber
- Nome: Helber
- Telefone: (a confirmar)
- Projetos ativos: (a confirmar com Helber)

## Backend .env por usuário

Helber:
```
PORT=4445
OWNER_ID=helber
OPENCLAW_SESSION_KEY=agent:main:main
OWNER_PHONE=<telefone do Helber>
OPENCLAW_GATEWAY=192.168.18.174:18789
USER_NAME=Helber
```

Tiago:
```
PORT=4446
OWNER_ID=tiago
OPENCLAW_SESSION_KEY=agent:main:main
OWNER_PHONE=<telefone do Tiago>
OPENCLAW_GATEWAY=192.168.18.174:18789
USER_NAME=Tiago
```

## OpenClaw Node nos outros Macs

Cada Mac roda como NODE conectado ao gateway central:
```bash
# Rodar no boot (launchd)
openclaw node run \
  --host 192.168.18.174 \
  --port 18789 \
  --display-name "Helber Node"
```

Isso permite:
- Tita ver e comandar os Macs do Helber/Tiago pelo cluster
- Compartilhar tarefas pesadas entre os Macs
- Cada um rodar suas automações localmente

## Pendências para Implementar

- [ ] Saber telefone do Helber e Tiago
- [ ] Saber usuário/senha SSH dos Macs deles (ou ativar SSH manualmente)
- [ ] Definir nome dos agentes deles (como se chama o AI do Helber?)
- [ ] Listar projetos ativos de cada um
- [ ] Rodar deploy-dashboard.sh quando tiver acesso
