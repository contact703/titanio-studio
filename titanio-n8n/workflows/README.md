# Titanio N8n Workflows

Workflows prontos para importar no N8n.

## Como importar

1. Abra http://localhost:5678
2. Menu → Workflows → **Import from File**
3. Selecione o arquivo `.json`
4. Clique **Save** e depois **Activate**

## Workflows

| Arquivo | Nome | Trigger | Descrição |
|---|---|---|---|
| `wf-001-relatorio-diario.json` | Relatório Diário | Cron 9h | Busca bots+reports e envia para grupo Gospia |
| `wf-002-alerta-bot-concluido.json` | Alerta Bot Concluído | Webhook POST | Notifica Eduardo quando bot finaliza tarefa |
| `wf-003-sync-memoria-github.json` | Sync Memória GitHub | Cron 6/6h | Verifica novos commits e notifica se houver updates |

## Variáveis de ambiente necessárias

Configure no `.env` antes de subir:

```
GITHUB_TOKEN=ghp_xxx        # token com read:repo
EDUARDO_WHATSAPP=+5531...   # número WhatsApp
GOSPIA_GROUP_ID=xxx         # ID do grupo Gospia
```

## Webhook URL (WF-002)

A Dashboard deve chamar:
```
POST http://localhost:5678/webhook/bot-task-done
Content-Type: application/json

{
  "bot_name": "Code Ninja",
  "task_id": "task-123",
  "task_title": "Implementar feature X",
  "status": "success",
  "duration_ms": 45000,
  "output_summary": "Feature implementada com sucesso.",
  "tokens_used": 1200
}
```
