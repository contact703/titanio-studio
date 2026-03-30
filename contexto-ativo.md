# Contexto Ativo - Tita

> Última atualização: 2026-03-10 12:03  
> Atualizado por: Flush de memória persistente (cron)

---

## Nota Importante
⚠️ **Limitação detectada**: `tools.sessions.visibility=tree` impede acesso ao histórico de outras sessões. O flush continua operacional usando contexto existente como fonte primária.

---

## Projetos em Andamento

### 1. Gospia Mobile App 🟢
- **Status:** Publicado na Play Store
- **Versão:** 2.1.0 (versionCode 24)
- **Contexto:** App estável, versionCode 26 em andamento desde 02/03
- **Pendências:**
  - ⏳ Decisão: Publicar versionCode 26 ou aguardar novas features?
  - ⏳ Aguardar retorno do Zica sobre mudanças desejadas

### 2. KidsHQ 🟡
- **Status:** Funcional, aguardando ações do Eduardo
- **Backend:** Railway `673fcb12-2ddb-49b5-bd48-855506a47af6`
- **Pendências:**
  - 🔴 Google Client ID (criar no Google Cloud Console) — BLOQUEANTE
  - Confirmar tela invite code no HQ app
  - Instalar Kids APK no tablet Amazon Fire

### 3. KiteMe 🟡
- **Status:** Deployed no Railway
- **Railway:** `865ff29d-231c-459d-bb02-3e0233de1dc2`
- **Pendências:**
  - Gerar token Railway (formato `rw_xxx`)
  - GitHub PAT com scope `workflow`

### 4. Maricá Film Commission 🟢
- **Status:** Site operacional (testado 09/03)
- **Pendências:**
  - Reenviar relatório de status para Eduardo

### 5. Chatbot Antunes do Rosário 🟢
- **Status:** Deploy concluído 04/03
- **Backend:** `affectionate-energy-production-fda3.up.railway.app`

---

## Promessas Feitas em Grupos

### Grupo Gospia (com Zica):
| Quem | O que | Quando | Status |
|------|-------|--------|--------|
| Tita/Eduardo | Build v2.3.0 enviado | 02/03 | ✅ Cumprido |
| Zica | Possíveis mudanças no app | 02/03 | ⏳ Aguardando detalhes |

---

## Credenciais Disponíveis

| Serviço | Status | Detalhes |
|---------|--------|----------|
| Firebase Gospia | ✅ | Project: `gospia-e8cce` |
| Gospia Keystore | ✅ | `android/app/gospia-keystore.jks` |
| Railway KiteMe | 🟡 | Project/Service ID conhecidos, token pendente |
| Railway KidsHQ | ✅ | `673fcb12-2ddb-49b5-bd48-855506a47af6` |
| GitHub | 🟡 | PAT sem scope `workflow` |
| Play Console | ✅ | contact@titaniofilms.com |
| Supabase | ✅ | URLs no .env |

---

## Tarefas Pendentes por Prioridade

### 🔴 Alta (Bloqueantes)
- **KidsHQ:** Criar Google Client ID (bloqueia funcionalidade login)

### 🟡 Média
- **KiteMe:** Gerar token Railway
- **Gospia:** Aguardar posição do Zica sobre mudanças

### 🟢 Baixa
- **Maricá:** Reenviar relatório via WhatsApp
- **KidsHQ:** Instalar APK no tablet Amazon Fire

---

## Estado do Mac Mini

| Métrica | Valor | Status |
|---------|-------|--------|
| RAM livre | 11.7k páginas | 🟡 Baixo |
| caffeinate | Ativo | ✅ |
| watchdog.sh | Ativo | ✅ |
| WhatsApp | Conectado | ✅ |

---

## Notas do Sistema

- **Eduardo offline:** Desde 27/02 (sem interação direta)
- **Flush executado:** 20+ vezes com sucesso
- **Próximo flush:** 2026-03-10 15:00

---

**Documento mestre atualizado em:** `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/contexto-ativo.md`
