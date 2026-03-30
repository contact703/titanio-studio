# 🦞 Titanio Multi-Agent Collaboration System

> Inspirado no HiClaw (Alibaba) — adaptado para a infraestrutura Titanio existente.

## TL;DR

O HiClaw é um sistema open source da Alibaba (3.2k ⭐) que permite múltiplos agentes IA colaborarem em tempo real dentro de salas de chat Matrix, com transparência total e controle humano. Nós **não precisamos instalar o HiClaw** — já temos infraestrutura melhor. O que fazemos é **copiar os conceitos** e implementar sobre o que já funciona.

## O Conceito

```
Eduardo diz: "Preciso do trailer pronto até sexta"
     ↓
Tita (Manager) analisa, consulta org chart, delega
     ↓
Pós-Produção coordena Editor + Sound Designer
     ↓
Tudo visível na Dashboard + alertas no WhatsApp
     ↓
Eduardo aprova o resultado final
```

## Nossa Infraestrutura (já rodando)

| Componente | URL | Função |
|---|---|---|
| Dashboard Titanio | localhost:4444 | Visualização + controle |
| Paperclip | localhost:3001 | Org chart dos 37 especialistas |
| OpenClaw Gateway | localhost:18789 | WhatsApp + Telegram + Discord |
| N8n | localhost:5678 | Workflows de automação |
| 37 Especialistas | via OpenClaw | Agentes com memória persistente |

## O que Adicionamos

1. **Handoff Protocol** — formato padrão para delegação entre agentes
2. **Task Tracking** — registro de todas as tarefas via N8n
3. **Collaboration Hub** — nova seção na Dashboard
4. **Approval Queue** — fila de decisões para Eduardo/Zica
5. **Autonomy Modes** — do oversight total à autonomia completa

## Documentos do Projeto

| Arquivo | Conteúdo |
|---|---|
| [PESQUISA.md](./PESQUISA.md) | O que é HiClaw, como funciona, stack técnica |
| [ALTERNATIVAS.md](./ALTERNATIVAS.md) | CrewAI, AutoGen, LangGraph, Swarm — comparativo |
| [ARQUITETURA.md](./ARQUITETURA.md) | Nossa arquitetura proposta |
| [IMPLEMENTACAO.md](./IMPLEMENTACAO.md) | Plano passo a passo (7-9 dias) |

## Quick Win (2 horas)

1. N8n webhook para task delegation
2. `tasks.json` para tracking
3. Instrução no SOUL.md da Tita
4. Eduardo já vê delegações no WhatsApp

Zero frameworks novos. Só N8n + JSON.

## Princípios

- 🔧 **Simplicidade** — usar o que já temos, não instalar coisas novas
- 👁️ **Transparência** — tudo visível, sem caixa preta
- 🤝 **Human-in-the-loop** — autonomia é conquistada, não assumida
- 📱 **WhatsApp first** — Eduardo não precisa aprender app novo
- 🧠 **Memória** — especialistas lembram do contexto (já temos!)

---

*Projeto iniciado em 27/03/2026 | Pesquisa e arquitetura por Tita 🐾*
