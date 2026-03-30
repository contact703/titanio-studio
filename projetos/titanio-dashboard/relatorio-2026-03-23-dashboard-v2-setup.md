# Relatório — Titanio Dashboard v2 Setup
**Data:** 2026-03-23 | **Projeto:** Titanio Dashboard | **Responsável:** DevOps Ninja + Code Ninja + Debug Hunter
**Status:** ✅ Operacional

---

## Resumo
Dashboard Titânio v2 instalada, configurada e operacional no Mac Mini 03 (Helber).

## Serviços Ativos
| Serviço | Porta | Status |
|---------|-------|--------|
| Backend (Node.js) | 4444 | 🟢 |
| Frontend (Next.js) | 3001 | 🟢 |
| PostgreSQL 16 | 5432 | 🟢 |
| Redis | 6379 | 🟢 |
| N8n | 5679 | 🟢 |
| LightRAG | 9621 | 🟢 |
| Ollama | 11434 | 🟢 |
| Watchdog | — | 🟢 |
| Caffeinate | — | 🟢 |

## Bugs Corrigidos

### 1. Bug "Zica" (Debug Hunter)
- **Causa:** `useState('zica')` em 4 arquivos frontend como default
- **Fix:** Alterado para 'helber' em `page.tsx`, `Header.tsx`, `Sidebar.tsx`
- **Nota:** localStorage do browser pode cachear — `localStorage.setItem('titanio-user','helber')`

### 2. SecuritySentinel Falso Positivo
- **Causa:** Grep por "crypto" detectava CryptoTokenKit do macOS como minerador
- **Fix:** Padrões específicos: xmrig, cryptominer, coinhive

### 3. Paths Eduardo Hardcoded
- **Causa:** Código continha `/Volumes/TITA_039/MAC_MINI_03/.openclaw`
- **Fix:** Substituído por `/Users/macmini03/.openclaw` em src/ e dist/

### 4. N8n API Desativada (v2.9.4)
- **Causa:** N8n 2.9.4 desativou API pública por padrão
- **Fix:** Workflows criados diretamente via SQLite + shared_workflow + workflow_publish_history

## Integrações
- ✅ 30 especialistas com memória individual
- ✅ LightRAG consultável (82 lições no grafo)
- ✅ N8n 5 workflows automatizando memória
- ✅ TITA_039 como backup físico (23MB)
- ✅ GitHub como backup cloud

---
*Relatório gerado por Kratos | 23/03/2026 19:35*
