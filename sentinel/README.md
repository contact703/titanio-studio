# 🛡️ AI Sentinel System — Titanio

Sistema de **failover automático de modelos de IA** sem perda de contexto.

Arquitetado e implementado para a equipe Titanio (Eduardo, Tiago, Helber, Caio).

---

## O Que Faz

Monitora continuamente o uso de cada provedor de IA. Antes de qualquer limite ser atingido (rate limit, quota, token expirado, erro de API), faz **switch automático** e transfere todo o **contexto da sessão** para a nova IA — sem que Eduardo perceba.

### Fluxo Principal

```
[A cada 2 min] sentinel.sh → healthcheck dos providers
                           → se provider atual >= threshold ou em erro
                           → sentinel-switch.sh <from> <to> <reason>
                              ├── lê context-snapshot.json
                              ├── atualiza openclaw.json
                              ├── reinicia gateway
                              ├── injeta contexto na nova IA
                              └── notifica Eduardo no WhatsApp

[A cada 10 min] context-snapshot.sh → captura estado da sessão
                                    → salva em context-snapshot.json
```

---

## Arquivos

| Arquivo | Função |
|---------|--------|
| `providers.json` | Registry de todos os providers com prioridades e limites |
| `usage-state.json` | Estado atual de uso (tokens, RPM, erros, provider ativo) |
| `context-snapshot.json` | Último snapshot do contexto da sessão |
| `switch-history.json` | Histórico de todas as trocas automáticas |
| `sentinel.log` | Log completo de todas as operações |
| `sentinel.sh` | Monitor principal (roda a cada 2 min) |
| `sentinel-switch.sh` | Motor de failover |
| `context-snapshot.sh` | Bot de captura de contexto (roda a cada 10 min) |
| `track-usage.sh` | Hook de rastreamento de uso após cada resposta |
| `add-provider.sh` | Script para adicionar novo provider sem downtime |
| `status.sh` | Dashboard de status |

---

## Providers Configurados

| ID | Provider | Modelo | Prioridade | Limite Diário |
|----|----------|--------|-----------|---------------|
| `anthropic-primary` | Anthropic | claude-sonnet-4-6 | 1 (principal) | 1M tokens |
| `anthropic-secondary` | Anthropic | claude-sonnet-4-6 | 2 (backup) | 1M tokens |
| `kimi-fallback` | Moonshot | kimi-k2.5 | 3 (fallback) | 5M tokens |

### Thresholds de Warning
- Anthropic: 80% do limite diário
- Kimi: 85% do limite diário

---

## Crontab

```cron
# AI Sentinel - Monitor principal (a cada 2 minutos)
*/2 * * * * bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/sentinel.sh

# AI Sentinel - Context snapshot (a cada 10 minutos)
*/10 * * * * bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel/context-snapshot.sh
```

Para verificar o crontab: `crontab -l`
Para editar: `crontab -e`

---

## Comandos Rápidos

### Ver status do sistema
```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sentinel
./status.sh
```

### Ver histórico de switches
```bash
./status.sh --history
```

### Watch mode (atualiza a cada 30s)
```bash
./status.sh --watch
```

### Adicionar novo provider
```bash
./add-provider.sh \
  --id "groq-free" \
  --provider groq \
  --model llama-3.3-70b \
  --key "gsk_xxxxxxxxxx" \
  --priority 4
```

### Forçar switch manual
```bash
./sentinel-switch.sh anthropic-primary kimi-fallback "manual_test"
```

### Registrar uso manual
```bash
./track-usage.sh anthropic-primary 1500
```

### Ver logs
```bash
tail -f sentinel.log
```

---

## Como Funciona o Failover

1. `sentinel.sh` detecta problema no provider atual
2. Chama `sentinel-switch.sh <from> <to> <reason>`
3. Switch lê `context-snapshot.json` (capturado nos últimos 10 min)
4. Atualiza `openclaw.json` com novo provider como primário
5. Reinicia gateway (`openclaw gateway restart`)
6. Injeta recovery prompt via `openclaw system event`
7. Notifica Eduardo no WhatsApp: _"⚡ Sentinel: troca automática..."_
8. Registra em `switch-history.json`

### Recovery Prompt Injetado

```
🔄 RETOMADA AUTOMÁTICA DE CONTEXTO (Sentinel System)

Você acabou de ser ativado como substituto de [PROVIDER_ANTERIOR].

TAREFA EM ANDAMENTO: [tarefa detectada]
PROJETOS ATIVOS: [lista de projetos]
PROMESSAS PENDENTES: [promessas]

[resumo completo das últimas atividades]

Retome exatamente de onde parou. Eduardo pode não ter percebido a troca.
```

---

## Condições de Failover

| Condição | Motivo | Ação |
|----------|--------|------|
| HTTP 429 | Rate limit | Failover imediato |
| HTTP 529 | Servidor sobrecarregado | Failover imediato |
| HTTP 401/403 | Auth error | Failover imediato |
| 3x network error | Rede instável | Failover após 3 tentativas |
| >= warning_threshold daily | Uso elevado | Failover preventivo |

---

## Adicionando um Provider (sem downtime)

```bash
./add-provider.sh \
  --id "openai-backup" \
  --provider openai \
  --model gpt-4o \
  --key "sk-proj-xxxxxxxx" \
  --priority 4 \
  --rpm 500 \
  --tpm 150000 \
  --daily 2000000 \
  --threshold 0.85
```

O script vai:
1. Testar healthcheck da API
2. Adicionar ao `providers.json`
3. Salvar a chave no `openclaw.json`
4. Inicializar rastreamento de uso
5. Adicionar ao fallback chain do openclaw
6. Reiniciar o gateway automaticamente

---

## Estrutura do usage-state.json

```json
{
  "current_provider": "anthropic-primary",
  "last_updated": "2026-03-20T12:00:00Z",
  "providers": {
    "anthropic-primary": {
      "status": "healthy",
      "tokens_today": 45230,
      "tokens_this_hour": 3210,
      "requests_this_minute": 2,
      "consecutive_errors": 0,
      "last_healthcheck": "2026-03-20T12:00:00Z",
      "healthcheck_ok": true
    }
  }
}
```

---

## Troubleshooting

### Sentinel não está rodando
```bash
crontab -l | grep sentinel
# Se vazio, adicionar:
crontab -e
```

### Testar manualmente
```bash
bash sentinel.sh
```

### Provider não troca
```bash
# Ver log
tail -20 sentinel.log

# Forçar switch manual
./sentinel-switch.sh anthropic-primary anthropic-secondary manual_test
```

### Context snapshot vazio
```bash
# Ver se arquivo existe
cat context-snapshot.json

# Rodar manualmente
bash context-snapshot.sh
```

### Gateway não reinicia após switch
```bash
openclaw gateway status
openclaw gateway restart
```

---

## Dependências

- `bash` (padrão no macOS)
- `jq` — `brew install jq`
- `curl` (padrão no macOS)
- `openclaw` CLI (já instalado)
- `bc` (padrão no macOS)

---

## Segurança

- Chaves de API ficam apenas no `openclaw.json` (não expostas em logs)
- Backup automático do `openclaw.json` antes de modificações
- Histórico limitado a 100 entradas
- Logs não contêm dados de mensagens, apenas metadados operacionais

---

## Equipe

Sistema implementado para: **Eduardo, Tiago, Helber, Caio**

Dúvidas ou melhorias: abrir issue no repositório ou contatar Tita via WhatsApp.

---

*Sentinel System v1.0 — Titanio AI Infrastructure — Março 2026*
