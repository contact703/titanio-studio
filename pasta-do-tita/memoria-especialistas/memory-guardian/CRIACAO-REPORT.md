# 🧠 Memory Guardian — Relatório de Criação

> Criado: 2026-03-27 22:47 BRT
> Por: Subagente memory-specialist-creator
> Motivo: Tita teve falhas graves de memória em 27/03/2026

---

## ✅ O que foi feito

### 1. memory.json criado
- **Path:** `pasta-do-tita/memoria-especialistas/memory-guardian/memory.json`
- **Conteúdo:** Knowledge completo sobre:
  - Arquitetura de memória (4 níveis)
  - Workflows (watchdog PID 24022, sentinel PID 74426, flush 6h, git sync 30min)
  - Cofre (lista completa dos 10 arquivos)
  - 9 regras do Eduardo
  - Todos os erros de 27/03 documentados
  - Status dos especialistas e gaps conhecidos
  - Equipe (IPs, portas, status)

### 2. Dashboard (SquadManager.ts) atualizado
- **Arquivo:** `projetos/titanio-dashboard/code/backend/src/squad/SquadManager.ts`
- **Adicionado:** Entrada memory-guardian com role, skills e description

### 3. Keywords (index.ts) atualizado
- **Arquivo:** `projetos/titanio-dashboard/code/backend/src/index.ts`
- **Adicionado:** `'memory-guardian'` na lista `specialistKeywords`

### 4. shared-specialists.json atualizado
- **Arquivo:** `/Volumes/TITA_039/shared-specialists.json`
- **Adicionado:** memory-guardian com 6 lições críticas
- **⚠️ ATENÇÃO:** O arquivo estava parcialmente corrompido/truncado (162MB, JSON inválido na posição 162032110). Foi reparado cortando a última entrada incompleta e fechando o JSON. Resultado: 29 especialistas válidos (antes reportava 39, mas o JSON já estava broken). **Verificar se houve perda de dados em outros especialistas.**

---

## 📊 Dados coletados

### Erros de memória 27/03 (documentados no knowledge):
| Erro | Causa raiz |
|------|-----------|
| Disse "estou de Opus" (era Sonnet) | Fallback silencioso por 529, não verificou session_status |
| Disse "não consigo enviar .md" | Não buscou em memory/ — método documentado desde 23/03 |
| Esqueceu Paperclip | Não leu contexto-ativo.md |
| Esqueceu wallet Tiago | Não verificou cofre |
| Esqueceu sync Macs | Memória de sessão volátil |
| Esqueceu browsers | Memória de sessão volátil |

### Workflows de memória ativos:
| Workflow | Status | Frequência |
|----------|--------|-----------|
| memory-watchdog.sh | ✅ PID 24022 | Contínuo + consolidação 23:59 |
| flush automático | ✅ Rodando | A cada 6h |
| group-sentinel | ✅ PID 74426 | A cada 30min |
| git sync N8n | ✅ Rodando | A cada 30min |

### Cofre (10 arquivos):
- CREDENCIAIS-MASTER.md (GitHub, Anthropic, OpenAI, OpenRouter)
- credentials.json (Google OAuth)
- polymarket-api-keys.json + polymarket-wallet.json
- INSTAGRAM-TITA.md + insta-credentials (encrypted)
- age-key.txt (chave de criptografia)

---

## ⚠️ Alertas

1. **shared-specialists.json REPARADO** — verificar se especialistas foram perdidos (antes: ~39, depois: 29)
2. **memory-bot existe MAS está vazio** — sessions:[], tasks:0, knowledge:[] — memory-guardian é o upgrade real
3. **29 especialistas sem tasks** — problema sistêmico a resolver
4. **Gold Digger status desconhecido** — 44 propostas, conversão não documentada

---

## 🎯 Diferença memory-bot vs memory-guardian

| Aspecto | memory-bot | memory-guardian |
|---------|-----------|----------------|
| sessions | [] vazio | [] (novo) |
| lessonsLearned | 93 (genérico) | 47 (específicas e úteis) |
| knowledge | [] vazio | Completo: arquitetura, workflows, cofre, erros, regras |
| activeContext | null | Problemas atuais, processos ativos, métricas |
| Utilidade | Nenhuma | Base de conhecimento operacional |
