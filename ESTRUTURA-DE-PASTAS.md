# 📁 ESTRUTURA DE PASTAS - Tita

> Atualizado: 2026-03-05
> Status: ✅ Organizado

---

## 🏠 LOCAL PRINCIPAL (Workspace)
**Caminho:** `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/`

### Arquivos de Configuração:
- `AGENTS.md` - Configurações do agente
- `HEARTBEAT.md` - Checklist de heartbeat
- `IDENTITY.md` - Identidade da Tita
- `SOUL.md` - Personalidade
- `USER.md` - Informações do Eduardo
- `contexto-ativo.md` - Contexto atual (cópia)
- `TOOLS.md` - Notas de ferramentas

### Memória Persistente:
**Caminho:** `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/`

```
pasta-do-tita/
├── contexto-ativo.md          ← Contexto principal
└── memoria-persistente/       ← Flush automático a cada 3h
    ├── 2026-03-04_18h.md
    ├── 2026-03-04_21h.md
    ├── 2026-03-05_03h.md
    ├── 2026-03-05_06h.md
    └── ...
```

---

## 💾 BACKUPS DE PROJETOS
**Caminho:** `/Volumes/TITA_039/backup-projetos/`

### Projetos Ativos:
- `KidsHQ/` ← **ATUALIZADO** (clone do GitHub, correção do bug aplicada)
- `KidsHQ-old/` ← Backup anterior (pode ser removido)
- `kitesurf-brasil/` ← KiteMe
- `gospia-plus-social/` ← Gospia
- `aplicativo_gospia_1.0/` ← Gospia v1
- `Appgospia/` ← Gospia legacy
- `mandaanota/`
- `marica-film-commission/`
- `guardiao-digital/`
- `Recicla_BH_3D/`
- `campaigns/`

### Outros:
- `apks/` ← APKs compilados
- `docs/` ← Documentação

---

## 📦 TITANIO-BACKUP-2026
**Caminho:** `/Volumes/TITA_039/Titanio-Backup-2026/`

```
Titanio-Backup-2026/
├── apps/           ← Apps compilados
├── assets/         ← Ícones, imagens
├── docs/           ← Documentação
└── sites/          ← Sites estáticos
```

---

## 🗂️ Tita_DEV_02 (PERDIDO)
**Status:** ❌ Offline permanentemente

**O que era:**
- `/Volumes/Tita_DEV_02/pasta-do-tita/`
- `/Volumes/Tita_DEV_02/backup-projetos/`

**Fallback:** Tudo agora está em `/Volumes/TITA_039/`

---

## 🐛 KidsHQ - Status da Correção

### Bug Corrigido ✅
- **Problema:** `{{name}}` em vez do nome real
- **Causa:** i18n-js usa `%{name}` não `{{name}}`
- **Arquivos corrigidos:**
  - `pt-BR.json`: `"welcome": "Olá, %{name}!"`
  - `en.json`: `"welcome": "Hello, %{name}!"`
- **Commit:** `dcbaf39` no GitHub
- **Status:** ✅ Subido pro repo contact703/KidsHQ

### Onde está o código:
```
/Volumes/TITA_039/backup-projetos/KidsHQ/
├── backend/           ← Node.js, Railway
├── kidshq-hq/         ← App dos pais (React Native/Expo)
├── kidshq-kids/       ← App das crianças (Android)
├── web-dashboard/     ← Dashboard web
└── releases/          ← AABs prontos
```

---

## ⚙️ Configuração do Heartbeat

**Arquivo:** `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/HEARTBEAT.md`

**Caminhos corretos:**
- Contexto: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/contexto-ativo.md`
- Memória: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/memoria-persistente/`
- Backups: `/Volumes/TITA_039/backup-projetos/`

---

## 📝 Notas

- **Tita_DEV_02 foi perdido** - Eduardo confirmou que não volta
- **Fallback estável** em TITA_039 há 6+ dias
- **Cron de memória** funcionando a cada 3h
- **GitHub** contact703/KidsHQ está atualizado

---

*Documentação mantida por Tita 🐾*
