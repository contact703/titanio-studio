# Pesquisa: UI/UX Dashboard Enterprise — Aprovações, Login, Atendimento

## Fluxos de Aprovação (DocuSign, SAP Fiori, ServiceNow)
- Status badge colorido (amarelo=pendente, verde=aprovado, vermelho=urgente)
- Botão "Aprovar" inline na tabela (sem navegação extra)
- Bulk approval (checkbox + "Aprovar selecionados")
- Contador no menu: "🔔 3 aprovações pendentes"
- Mobile-first: 2 toques pra aprovar no celular

## Login Enterprise (para não-técnicos)
- SSO como padrão (Google/Microsoft)
- MFA via SMS/WhatsApp (não TOTP — intimidador pra executivos)
- Tour guiado de 3 passos no primeiro acesso
- Linguagem simples: "Aprovar documento" não "Submit approval workflow"
- Sessão longa pra quem acessa raramente

## Atendimento ao Acionista (Salesforce, Zendesk, HubSpot)
- Visão 360° do acionista (timeline de interações)
- SLA visual: barra de progresso colorida
- Prazo em linguagem natural: "Resposta até amanhã às 18h"
- Notificação proativa via WhatsApp
- Timeline do caso: Recebido → Em análise → Aprovação → Concluído

## Indicadores de IA Trabalhando (Copilot, ChatGPT Enterprise)
- Progress steps com checklist (não spinner genérico)
- Tempo estimado
- Botão cancelar sempre visível
- Resultado com validação humana: "IA sugeriu X — Você concorda?"
- Animação pulse suave no ícone do agente

## White-Label
- CSS Custom Properties por tenant (--color-primary, --color-brand)
- Logo, cores, favicon, domínio customizado por cliente
- Preview em tempo real no admin
- Dark mode automático
