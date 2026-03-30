# INTEGRACAO-FUTURA.md — Integração com Dashboard Titanio

## Visão Geral

O Dashboard Titanio (goal ativo no Paperclip) e o próprio Paperclip são sistemas complementares:

- **Paperclip**: Orquestrador de agentes IA — atribui tarefas, monitora progresso, gerencia goals
- **Dashboard Titanio**: Central de monitoramento multi-Mac com 33+ especialistas, notificações, sync entre 3 Macs

A integração natural é: **Dashboard Titanio consome a API do Paperclip para exibir status em tempo real.**

---

## API do Paperclip (Base URL: http://localhost:3100/api)

### Endpoints Principais

```
GET  /api/health
GET  /api/companies/:companyId
GET  /api/companies/:companyId/agents
GET  /api/companies/:companyId/goals
GET  /api/companies/:companyId/issues
GET  /api/companies/:companyId/activity-log
POST /api/companies/:companyId/goals
POST /api/companies/:companyId/agents/:agentId/runs
```

### Company ID da Titanio Studio
```
b7260a8e-1e1e-48e4-bd70-e06f36b6ab74
```

### Exemplos de Chamadas

```bash
# Status da empresa
curl http://localhost:3100/api/companies/b7260a8e-1e1e-48e4-bd70-e06f36b6ab74

# Listar agentes
curl http://localhost:3100/api/companies/b7260a8e-1e1e-48e4-bd70-e06f36b6ab74/agents

# Listar goals
curl http://localhost:3100/api/companies/b7260a8e-1e1e-48e4-bd70-e06f36b6ab74/goals

# Health check
curl http://localhost:3100/api/health
```

---

## Integração via Dashboard Titanio (Goal Ativo)

O goal "Dashboard Titanio — Central multi-Mac" já está no Paperclip como `active`. A integração ideal:

### 1. Widget de Status de Agentes

O Dashboard pode mostrar um card "Agentes Paperclip" com:
```javascript
// Polling a cada 30s
const PAPERCLIP_API = 'http://localhost:3100/api'
const COMPANY_ID = 'b7260a8e-1e1e-48e4-bd70-e06f36b6ab74'

async function getAgentsStatus() {
  const res = await fetch(`${PAPERCLIP_API}/companies/${COMPANY_ID}/agents`)
  return res.json()
}
```

### 2. Widget de Goals

```javascript
async function getGoals() {
  const res = await fetch(`${PAPERCLIP_API}/companies/${COMPANY_ID}/goals`)
  return res.json()
}
```

### 3. Activity Feed

```javascript
async function getActivityLog() {
  const res = await fetch(`${PAPERCLIP_API}/companies/${COMPANY_ID}/activity-log`)
  return res.json()
}
```

---

## Integração via n8n (Já Instalado)

O n8n está rodando na porta 5678. Pode criar workflows que:

1. **Polling Paperclip → Notificação WhatsApp**:
   - Trigger: cron a cada 5 minutos
   - Node HTTP: GET agents com status != idle
   - Condition: se algum agente em run/error
   - Action: POST para webhook OpenClaw → WhatsApp Eduardo

2. **Goal Completion → Dashboard Update**:
   - Trigger: webhook Paperclip (configurar no settings)
   - Action: atualizar painel do Dashboard Titanio

3. **Novo Issue → Alerta**:
   - Trigger: poll de `/issues` a cada 10 min
   - Action: notificar no canal relevante

---

## Integração via OpenClaw (MCP/Skills)

O OpenClaw já tem acesso ao Tita (agente principal). Pode criar uma skill:

```markdown
# skill: paperclip-status
# desc: Consulta status do Paperclip/Titanio Studio via API local
```

Comandos naturais que Tita poderia responder:
- "Qual o status dos agentes?" → GET /agents
- "Como estão as goals?" → GET /goals
- "Quais issues abertas?" → GET /issues
- "Atribua a task X para o Code Ninja" → POST /tasks/assign

---

## Autenticação

Atualmente, a instância roda em modo `local_trusted` (sem autenticação). Para acesso externo:

```bash
# Variáveis de ambiente para configuração futura
PAPERCLIP_AUTH_MODE=api_key
PAPERCLIP_API_KEY=<chave-gerada>
```

---

## Exposição Remota (acesso de outros Macs)

O servidor escuta apenas em `127.0.0.1:3100`. Para acesso dos outros Macs da Titanio:

**Opção 1: Tailscale** (recomendado — já pode estar configurado)
```bash
# No Mac principal:
# Paperclip já na porta 3100
# Outros Macs acessam via: http://<tailscale-ip>:3100
# Mas precisa mudar o bind de 127.0.0.1 para 0.0.0.0
```

**Opção 2: ngrok / Cloudflare Tunnel**
```bash
ngrok http 3100
```

**Opção 3: SSH Tunnel dos outros Macs**
```bash
ssh -L 3100:localhost:3100 contacttitanio@<ip-mac-principal>
```

---

## Próximos Passos Recomendados

1. **Imediato**: Configurar autostart via LaunchAgent (ver COMO-INICIAR.md)
2. **Curto prazo**: Criar skill no OpenClaw para consultar Paperclip via linguagem natural
3. **Médio prazo**: Widget do Dashboard mostrando status agentes + goals em tempo real
4. **Longo prazo**: Configurar adaptadores dos agentes (Claude, Codex, etc.) para que executem tarefas reais
