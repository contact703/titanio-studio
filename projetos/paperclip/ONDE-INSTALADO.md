# ONDE-INSTALADO.md — Localização do Paperclip

## Instalação Principal (Source Code)

```
/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/paperclip/
```

Este é o repositório open source do Paperclip rodando em modo dev local.

## Dados e Banco de Dados (PostgreSQL Embedded)

```
/Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/
├── db/                     # Cluster PostgreSQL
│   ├── postgresql.conf     # Configuração do Postgres
│   └── PG_VERSION          # Versão do Postgres
└── data/
    └── backups/            # Backups automáticos horários (.sql)
        └── paperclip-YYYYMMDD-HHMMSS.sql
```

## Arquivo de Log do Servidor

```
/tmp/paperclip.log
```

## Logs Internos do Servidor

```
/Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/logs/server.log
```

## Estrutura do Repositório

```
paperclip/
├── server/         # API Express (porta 3100)
├── ui/             # React + Vite (frontend servido pelo server)
├── packages/
│   ├── db/         # Drizzle schema + migrations
│   ├── shared/     # Tipos, constantes, validators
│   └── adapters/   # Claude, Codex, Cursor, Gemini, etc.
├── cli/            # CLI paperclipai
├── doc/            # Documentação operacional
├── start.sh        # Script de inicialização customizado
└── package.json    # pnpm workspace
```

## Versão e Runtime

- **Node.js**: v20.20.2 (via nvm) — Node 22 era incompatível
- **Gerenciador de pacotes**: pnpm (workspace monorepo)
- **Banco**: PostgreSQL embedded (sem DATABASE_URL externa)
- **Porta**: 3100 (127.0.0.1:3100 — local only)
- **Empresa ID**: `b7260a8e-1e1e-48e4-bd70-e06f36b6ab74`

## Licença

MIT License — open source da PaperclipAI
