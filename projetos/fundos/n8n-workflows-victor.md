# Victor Capital — Workflows N8n
**Criado em:** 18/03/2026
**Sistema:** Titanio Studio — Captação Autônoma de Recursos

---

## 📋 Workflows Criados

### WF1 — Busca Semanal de Editais
- **ID:** `YJnWff0f7i2T367W`
- **URL:** http://192.168.18.174:5678/workflow/YJnWff0f7i2T367W
- **Trigger:** Automático — todo sábado às 9h
- **Função:** Busca FINEP + BNDES, filtra por relevância Titanio, salva relatório e notifica grupo Gospia
- **Status:** Criado (inativo — ativar quando pronto)

### WF2 — Monitor de Prazos
- **ID:** `xi6JAOiw1TicvxjM`
- **URL:** http://192.168.18.174:5678/workflow/xi6JAOiw1TicvxjM
- **Trigger:** Automático — todo dia às 9h
- **Função:** Verifica processos ativos, alerta se prazo < 7 dias
- **Status:** Criado (inativo — ativar quando pronto)
- **Arquivo de dados:** `/projetos/fundos/processos-ativos.json`

### WF3 — Preenchimento Assistido de Editais
- **ID:** `fYxVjIiGI0ZbF1IS`
- **URL:** http://192.168.18.174:5678/workflow/fYxVjIiGI0ZbF1IS
- **Trigger:** Webhook — `POST http://localhost:5678/webhook/victor-capital-edital`
- **Função:** Recebe dados de um edital, gera texto personalizado com IA, retorna template preenchido
- **Como usar:**
  ```bash
  curl -X POST http://localhost:5678/webhook/victor-capital-edital \
    -H "Content-Type: application/json" \
    -d '{
      "nome": "Nome do Edital",
      "organismo": "FINEP",
      "prazo": "2026-04-30",
      "valor": "R$ 500.000",
      "descricao": "Descrição do edital..."
    }'
  ```
- **Status:** Criado (inativo — ativar quando for usar)

### WF4 — Pipeline Completo (Orquestrador)
- **ID:** `FdAlwwGEAAl4OGdM`
- **URL:** http://192.168.18.174:5678/workflow/FdAlwwGEAAl4OGdM
- **Trigger:** Manual — botão "Execute Workflow" no N8n
- **Função:** Analisa 8 fontes de editais, gera relatório consolidado priorizado, envia para WhatsApp
- **Como acionar:** Abrir no N8n e clicar "Execute Workflow"
- **Status:** Criado (pronto para uso manual)

---

## 🚀 Como Ativar os Workflows Automáticos

1. Acesse http://192.168.18.174:5678
2. Login: contact@titaniofilms.com / Titanio2026!
3. Clique no workflow desejado
4. Alterne o toggle "Active" para ON
5. Os schedules passarão a executar automaticamente

---

## 📁 Arquivos do Sistema Victor Capital

```
/projetos/fundos/
├── n8n-workflows-victor.md    # Este arquivo — documentação
├── processos-ativos.json      # Base de dados de editais em andamento
└── editais-semana-YYYY-MM-DD.md  # Relatórios semanais (gerados automaticamente)
```

---

## 🔧 Manutenção e Monitoramento

### Verificar execuções:
- N8n > Workflows > [nome] > Executions

### Adicionar novo processo a monitorar:
Editar `/projetos/fundos/processos-ativos.json` e adicionar:
```json
{
  "id": "proc-XXX",
  "nome": "Nome do Edital",
  "tipo": "edital",
  "status": "inscrito",
  "prazo": "2026-05-30",
  "url": "https://...",
  "observacoes": "Notas relevantes",
  "adicionado": "2026-03-18"
}
```

### Fontes de Alta Prioridade para Victor Capital:
| Fonte | Área | Relevância |
|-------|------|-----------|
| FSA — Fundo Setorial do Audiovisual | Audiovisual | ⭐⭐⭐⭐⭐ |
| ANCINE — Editais | Cinema | ⭐⭐⭐⭐⭐ |
| FINEP — Chamadas Públicas | Tecnologia | ⭐⭐⭐⭐ |
| BNDES Garagem | Startups | ⭐⭐⭐⭐ |
| Ministério da Cultura | Cultura | ⭐⭐⭐ |
| Startup SP | Startups | ⭐⭐⭐ |

---

## 📞 Grupo de Notificações
- **Grupo Gospia:** `120363405462114071@g.us`
- **Canal OpenClaw:** `http://localhost:18789/api/sessions/agent:main:whatsapp:group:120363405462114071@g.us/send`

---
*Victor Capital — Sistema Autônomo de Captação | Titanio Studio*
