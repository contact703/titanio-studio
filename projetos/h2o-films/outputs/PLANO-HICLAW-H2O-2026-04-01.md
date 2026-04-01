# PLANO HICLAW — H2O FILMS (Controle Central Titanio)

Data: 01/04/2026
Autor: Time HiClaw + Tita

## 1) Objetivo do Produto
Criar uma operação distribuída onde:
- A Titanio mantém o controle central (agente principal, governança, observabilidade, automações).
- A H2O opera no dia a dia em outro estado (WhatsApp + dashboard simplificada + especialistas).
- O sistema roda quase todo automático com aprovações humanas em pontos críticos.

## 2) Arquitetura Proposta (Titanio ↔ H2O)
### Núcleo Titanio (central)
- OpenClaw Gateway central (orquestra agentes/especialistas)
- n8n central (workflows e integrações)
- Dashboard Command Center (status, aprovações, auditoria)
- Banco central (PocketBase/Postgres) para filmes, campanhas, tarefas, métricas e logs

### Nó H2O (remoto)
- WhatsApp como interface operacional principal
- Dashboard web simplificada (status + aprovar/publicar)
- Equipe local usando especialistas por fila de tarefas

### Integrações
- Instagram, Ads (Meta/Google/TikTok/YouTube), Manda a Nota/NFS-e
- Webhooks assinados (HMAC), retries e idempotência

## 3) Especialistas Ativos (base já existente)
- Film Promoter
- Cinema Social
- Film Catalog
- Press Agent
- Ad Creator
- Revenue Tracker

## 4) Automações Prioritárias
### P1 (semana 1-2)
1. Intake inteligente no WhatsApp (roteia para especialista)
2. Lançamento de filme “1 clique” (checklist completo)
3. Auto-Post (09h/14h/19h)
4. Relatório executivo semanal automático no WhatsApp

### P2 (semana 3-4)
5. Calendário editorial com aprovação por WhatsApp
6. Auto-Reels diário (pipeline curto)
7. Clipping de imprensa + alertas críticos
8. NFS-e automatizada por evento financeiro

### P3 (mês 2)
9. Gestão de comentários/DM com escalonamento
10. A/B de criativos de tráfego (semi-automático)
11. Alertas de anomalia de performance
12. Dashboard tempo real (Command Center completo)

## 5) Ferramentas que viabilizam tudo
- OpenClaw: agentes, sessões, roteamento por canal, memória, execução
- n8n: automação, integrações e agendamentos
- PocketBase/Postgres: dados operacionais e CRM
- WhatsApp: interface operacional de baixa fricção
- Tailscale/VPN: conectividade segura entre Titanio e H2O
- Observabilidade (logs+métricas+alertas): operação confiável

## 6) Segurança e Governança
- RBAC por perfil (admin Titanio / gestor H2O / operador H2O)
- MFA para perfis críticos
- Auditoria completa (quem fez o quê, quando)
- Cofre de secrets + rotação periódica
- Backup criptografado + teste de restore
- Aprovação humana para ações sensíveis (publicação/financeiro)

## 7) Plano 30/60/90 dias
### 0-30 dias (fundação + piloto)
- Subir stack central
- Conectar 1-3 unidades piloto
- Telemetria básica + alertas críticos
- Runbook inicial + treino N1/N2

### 31-60 dias (escala inicial)
- Expandir para 10-20 unidades
- Onboarding automático
- RBAC completo + trilha de auditoria
- SLA/SLO + backup/restore validados

### 61-90 dias (hardening + go-live pleno)
- Expandir para 30-50+ unidades
- Testes de carga e resiliência
- DR/rollback formalizados
- Operação contínua e relatório executivo mensal

## 8) KPIs principais
- Tempo de resposta no WhatsApp
- % de roteamento correto para especialista
- % de publicação no prazo
- Taxa de sucesso de comandos
- Tempo de detecção/resposta a incidentes
- Engajamento e performance de campanhas
- Tempo de emissão NFS-e

## 9) Estimativa de Infra Mensal
- Cenário baixo: R$ 3.500 a R$ 8.000
- Cenário médio: R$ 9.000 a R$ 22.000
(sem custo de equipe)

## 10) Próximos Passos (ação imediata)
1. Aprovar arquitetura Titanio↔H2O
2. Definir lista de funcionários que falarão com especialistas no WhatsApp
3. Escolher modo de aprovação (obrigatória x automática por tipo)
4. Iniciar Sprint 1 com P1 (4 automações)
5. Rodar piloto de 14 dias e ajustar
