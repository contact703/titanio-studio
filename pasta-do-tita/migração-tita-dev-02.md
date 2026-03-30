# Relatório de Migração — Tita_DEV_02
**Data:** 2026-03-20  
**Executado por:** Code Ninja (subagente Tita)  
**Status geral:** ⚠️ AUDITORIA COMPLETA — Push bloqueado (token gh inválido)

---

## 1. Volumes Disponíveis

| Volume | Status |
|--------|--------|
| Macintosh HD | ✅ Montado |
| TITA_039 | ✅ Montado |
| macmini03 | ✅ Montado |
| **Tita_DEV_02** | ❌ **NÃO ENCONTRADO** (HD morto/não montado) |

> O HD Tita_DEV_02 não aparece em `/Volumes/`. O conteúdo que existe está nos backups já feitos anteriormente em TITA_039.

---

## 2. Projetos Encontrados

### 📁 /Volumes/TITA_039/backup-projetos/

| Projeto | Código | Git | Remote GitHub | Status |
|---------|--------|-----|---------------|--------|
| Appgospia | package.json | ✅ | contact703/Appgospia | ✅ Sincronizado |
| KidsHQ | — | ✅ | contact703/KidsHQ | ✅ Sincronizado |
| Recicla_BH_3D | — | ✅ | contact703/Recicla_BH_3D | ✅ Sincronizado |
| aplicativo_gospia_1.0 | package.json | ✅ | contact703/aplicativo_gospia_1.0 | ✅ Sincronizado |
| **gospia-ios** | package.json | ✅ | contact703/gospia-ios | ⚠️ **5 commits não pushados + 7 arquivos modificados** |
| gospia-plus-social | package.json | ✅ | contact703/gospia-plus-social | ✅ Sincronizado |
| guardiao-digital | — | ✅ | contact703/guardiao-digital | ✅ Sincronizado |
| kitesurf-brasil | — | ✅ | contact703/kitesurf-brasil | ✅ Sincronizado |
| **mandaanota** | package.json | ✅ | contact703/mandaanota | ⚠️ **2 arquivos untracked não comitados** |
| marica-film-commission | — | ✅ | contact703/marica-film-commission | ✅ Sincronizado |
| **gospia-ios-v2** | package.json | ✅ | ❌ **Nenhum remote** | 🔴 **Só local — sem GitHub** |
| **gold-digger** | package.json | ❌ | ❌ **Sem git** | 🔴 **Só local — sem GitHub** |
| campaigns | — | ❌ | ❌ | 📁 Apenas arquivos locais |
| documentacao-titanio | — | ❌ | ❌ | 📁 Apenas arquivos locais |
| titanio-dist | — | ❌ | ❌ | 📁 Apenas arquivos locais |
| websites | — | ❌ | ❌ | 📁 Apenas arquivos locais |
| titanio-dashboard-backup-20260312 | — | ❌ | ❌ | 📁 Docs/design briefs apenas |
| titanio-dashboard-v2-backup-20260313 | — | ❌ | ❌ | 📁 Docs/design briefs apenas |

### 📁 /Volumes/TITA_039/Titanio-Backup-2026/apps/

| Projeto | Git | Remote GitHub | Status |
|---------|-----|---------------|--------|
| **gospia** | ❌ | ❌ | 🔴 **Só local — sem git** |
| guardiao-digital | ✅ | contact703/guardiao-digital | ✅ Sincronizado |
| **kidshq** | ❌ | ❌ | 🔴 **Só local — sem git** |
| **kiteme** | ❌ | ❌ | 🔴 **Só local — sem git** |
| mandaanota | ✅ | contact703/mandaanota | ✅ Sincronizado |
| **titanio47** | ❌ | ❌ | 🔴 **Só local — sem git** |

### 📁 /Volumes/TITA_039/Titanio-Backup-2026/sites/
- `marica-film-commission` — cópia do site (sem git aparente)

### 📁 /Volumes/TITA_039/Titanio-Backup-2026/docs/
- `campaigns` — docs
- `project-docs` — docs

---

## 3. O que foi sincronizado pro GitHub

**Nada foi pushado nesta execução.** O token do `gh` CLI expirou/é inválido.

```
gh auth status:
  X Failed to log in to github.com account contact703
  - The token in default is invalid.
```

### O que DEVERIA estar sincronizado (já estava antes):
- Appgospia, KidsHQ, Recicla_BH_3D, aplicativo_gospia_1.0
- gospia-ios (parcial — 5 commits atrasados)
- gospia-plus-social, guardiao-digital, kitesurf-brasil, mandaanota (parcial)
- marica-film-commission

---

## 4. O que ficou SÓ LOCAL (sem GitHub)

| Projeto | Localização | Risco |
|---------|-------------|-------|
| gospia-ios-v2 | backup-projetos/gospia-ios-v2 | 🔴 ALTO |
| gold-digger | backup-projetos/gold-digger | 🔴 ALTO |
| gospia (app) | Titanio-Backup-2026/apps/gospia | 🔴 ALTO |
| kidshq (backup-2026) | Titanio-Backup-2026/apps/kidshq | 🟡 MÉDIO |
| kiteme | Titanio-Backup-2026/apps/kiteme | 🟡 MÉDIO |
| titanio47 | Titanio-Backup-2026/apps/titanio47 | 🟡 MÉDIO |

---

## 5. Itens que precisam de atenção manual do Eduardo

### 🚨 CRÍTICO — Fazer imediatamente

**1. Reautenticar o `gh` CLI:**
```bash
gh auth login
# Escolher GitHub.com → HTTPS → Login with a web browser
```
Sem isso, nenhum push automático funciona.

**2. gospia-ios — 5 commits não pushados:**
```bash
cd /Volumes/TITA_039/backup-projetos/gospia-ios
git push origin master
# Também tem 7 arquivos modificados não comitados:
# App.tsx, app/(app)/(chat)/index.tsx, app/(app)/(forum)/index.tsx
# index.ts, package-lock.json, package.json, tsconfig.json
git add -A && git commit -m "wip: changes from Tita_DEV_02" && git push
```

**3. gospia-ios-v2 — sem remote:**
```bash
cd /Volumes/TITA_039/backup-projetos/gospia-ios-v2
gh repo create contact703/gospia-ios-v2 --private --source=. --push
```

**4. gold-digger — sem git:**
```bash
cd /Volumes/TITA_039/backup-projetos/gold-digger
git init && git add -A && git commit -m "Initial commit: gold-digger backup from Tita_DEV_02"
gh repo create contact703/gold-digger --private --source=. --push
```

**5. Apps sem git em Titanio-Backup-2026:**
```bash
for app in gospia kidshq kiteme titanio47; do
  cd /Volumes/TITA_039/Titanio-Backup-2026/apps/$app
  git init && git add -A && git commit -m "Initial commit: $app backup"
  gh repo create contact703/$app --private --source=. --push
done
```

### ⚠️ ATENÇÃO

**6. mandaanota — 2 arquivos untracked:**
```bash
cd /Volumes/TITA_039/backup-projetos/mandaanota
# Verificar se quer commitar:
# - attached_assets/Captura_de_Tela_2026-01-08_...png
# - attached_assets/Correlação_CTISS_BH_x_Código_Nacional_...xlsx
git add attached_assets/ && git commit -m "chore: add attached assets" && git push
```

**7. gospia-v2 tem remote apontando para gospia-ios (errado):**
```bash
# /Volumes/TITA_039/backup-projetos/gospia-v2
# Remote: origin → https://github.com/contact703/gospia-ios.git
# Isso pode ser intencional (fork/alias) mas vale conferir
```

---

## 6. Resumo Executivo

- **HD Tita_DEV_02:** Não detectado. Conteúdo salvo em backups anteriores no TITA_039.
- **Projetos com código:** 16 encontrados
- **Já no GitHub:** 10 projetos (alguns com pendências de push)
- **Só local (sem GitHub):** 6 projetos precisam ser publicados
- **Push bloqueado:** Token `gh` inválido — Eduardo precisa rodar `gh auth login`
- **Maior risco:** gospia-ios (5 commits perdidos se HD falhar), gospia-ios-v2 e gold-digger (zero backup remoto)

---

*Gerado automaticamente pelo Code Ninja em 2026-03-20*
