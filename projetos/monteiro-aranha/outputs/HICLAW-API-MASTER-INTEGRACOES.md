# Projeto Monteiro Aranha — Arquitetura Completa de Integrações & APIs

Vou projetar a stack de integrações do zero. Lendo contexto do projeto primeiro.

---

## 📋 Análise Preliminar

Consultando documentos da biblioteca:

```bash
cat PLANO-SEGURANCA-MONTEIRO-ARANHA.md
cat MA-BRIEFING.md
cat ARQUITETURA-DASHBOARD-CLIENTES.md
```

**Premissas do projeto:**
- Monteiro Aranha: empresa de segurança com acionistas, múltiplos sistemas legados
- Necessidade de canal seguro para acionistas (WhatsApp)
- SSO corporativo (Active Directory)
- API REST para app mobile/web
- Sistema de webhooks para notificações em tempo real
- Integração com ERP/CRM existentes
- Sistema de aprendizado para automatizar tarefas

---

## 🏗️ ARQUITETURA PROPOSTA

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONTEIRO ARANHA — STACK                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   WhatsApp   │  │      AD      │  │   App CLI    │            │
│  │   Business   │  │    (SSO)     │  │    (OAuth)   │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                 │                     │
│         └─────────────────┼─────────────────┘                     │
│                           │                                       │
│                    ┌──────▼────────┐                             │
│                    │   API Gateway  │  (auth, rate limit, log)   │
│                    │  (Kong/Traefik)│                            │
│                    └──────┬─────────┘                             │
│                           │                                       │
│  ┌────────────────────────┼────────────────────────┐             │
│  │                        │                        │             │
│  ▼                        ▼                        ▼             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│ │  Core APIs   │  │  Webhook     │  │  Learning    │            │
│ │  (REST)      │  │  System      │  │  Engine      │            │
│ │  • Acionistas│  │  • Events    │  │  • Tasks     │            │
│ │  • Usuarios  │  │  • Notifs    │  │  • Training  │            │
│ │  • Audit     │  │  • Integration  │  • Model    │            │
│ └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│        │                 │                 │                     │
│        └─────────────────┼─────────────────┘                     │
│                          │                                        │
│              ┌───────────┴───────────┐                            │
│              │                       │                            │
│              ▼                       ▼                            │
│      ┌──────────────┐      ┌──────────────┐                     │
│      │  Adapters    │      │  PostgreSQL  │                     │
│      │  (ERP/CRM)   │      │  + Redis     │                     │
│      │  • SAP       │      │  (cache)     │                     │
│      │  • Salesforce│      │              │                     │
│      │  • Custom    │      │              │                     │
│      └──────────────┘      └──────────────┘                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

# 1️⃣ INTEGRAÇÃO WHATSAPP BUSINESS API — Fluxo Completo

## OpenAPI Spec

```yaml
# ma-whatsapp-api.openapi.yaml
openapi: 3.0.0
info:
  title: Monteiro Aranha WhatsApp Business API
  version: 1.0.0
  description: Canal seguro para acionistas via WhatsApp
servers:
  - url: https://api.monteiro-aranha.com/v1/whatsapp
    description: Production

paths:
  /messages:
    post:
      summary: Enviar mensagem a acionista
      operationId: sendMessageToShareholder
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                phone:
                  type: string
                  pattern: '^\+\d{10,15}$'
                  example: '+5585987654321'
                message:
                  type: string
                  minLength: 1
                  maxLength: 4096
                template_id:
                  type: string
                  description: Usar templates pré-aprovados pela Meta
                  enum:
                    - SHAREHOLDER_UPDATE
                    - DIVIDEND_NOTICE
                    - MEETING_REMINDER
                    - EMERGENCY_ALERT
                media:
                  type: object
                  properties:
                    type:
                      enum: [image, document, video]
                    url:
                      type: string
                      format: uri
                context_id:
                  type: string
                  description: ID da mensagem que está respondendo
              required:
                - phone
              oneOf:
                - required: [message]
                - required: [template_id]
      responses:
        '202':
          description: Mensagem aceita para envio
          content:
            application/json:
              schema:
                type: object
                properties:
                  message_id:
                    type: string
                  status:
                    type: string
                    enum: [queued, sent, delivered, failed]
                  timestamp:
                    type: string
                    format: date-time
        '400':
          description: Request inválido
        '401':
          description: Não autenticado
        '429':
          description: Rate limit excedido

  /messages/{message_id}:
    get:
      summary: Status de mensagem
      operationId: getMessageStatus
      security:
        - bearerAuth: []
      parameters:
        - name: message_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Status atual
          content:
            application/json:
              schema:
                type: object
                properties:
                  message_id:
                    type: string
                  status:
                    enum: [queued, sent, delivered, read, failed]
                  delivery_timestamp:
                    type: string
                    format: date-time
                  error:
                    type: object
                    properties:
                      code:
                        type: string
                      message:
                        type: string

  /templates:
    get:
      summary: Lista templates pré-aprovados
      operationId: listTemplates
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Lista de templates
          content:
            application/json:
              schema:
                type: object
                properties:
                  templates:
                    type: array
                    items:
                      type: object
                      properties:
                        template_id:
                          type: string