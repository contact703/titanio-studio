# 🔧 Propostas de Automação N8n para Titanio

> Criado em: 18/03/2026  
> Baseado em: https://github.com/enescingoz/awesome-n8n-templates (280+ templates)  
> N8n local: http://192.168.18.174:5678

---

## Templates Estudados do awesome-n8n-templates

O repositório conta com **280+ templates** em 18 categorias. Os mais relevantes para a Titanio são:

### 🤖 WhatsApp & Chatbots com IA
- Chatbots com LangChain + memória de longo prazo
- Agentes multimodais (texto, áudio, imagem)
- Roteamento dinâmico de ferramentas por IA

### 📧 Email Automation
- Auto-label e categorização de emails com OpenAI
- Rascunhos automáticos de resposta (Human-in-the-loop)
- Alertas e digestos diários

### 📄 PDF & Document Processing
- Chat com PDFs usando RAG + quoting de fontes
- Extração estruturada de dados com Claude/Gemini
- Conversão de documentos em notas de estudo

### 🔍 AI Research & RAG
- Pipelines RAG com Pinecone, Qdrant, Supabase
- Pesquisa web + síntese com IA
- Análise de sentimento e ETL de texto

### ⚙️ DevOps & Server Automation
- Monitoramento de servidores e alertas
- CI/CD triggers e notificações GitHub
- Cron jobs com relatórios automáticos

### 📊 Google Sheets & Dados
- Qualificação de leads com GPT-4
- Sumarização de feedback de formulários
- Geração de posts a partir de planilhas

### 🌐 Social Media
- Upload automático Instagram/TikTok do Google Drive
- Agendamento e publicação de conteúdo
- Monitoramento de menções e sentiment

---

## Propostas por Produto

---

### 🎬 VoxDescriber

*App de audiodescrição automática de vídeos (Python, ffmpeg, Ollama, PySide6)*

---

#### Workflow 1: Monitor de Fila de Vídeos + Notificação WhatsApp
**O que faz:** Monitora uma pasta no Mac Mini. Quando um novo vídeo é detectado, dispara o VoxDescriber via webhook/CLI e notifica o Eduardo no WhatsApp quando terminar (com link ou caminho do arquivo gerado).

**Nodes N8n:**
- `Schedule Trigger` ou `Filesystem Watch` (via node Execute Command)
- `Execute Command` → chama o script Python do VoxDescriber
- `IF` → verifica se processamento foi concluído com sucesso
- `WhatsApp Business Cloud` → envia notificação de conclusão
- `Gmail` → envia arquivo de audiodescrição por email (opcional)

**Benefício:** Eduardo não precisa ficar monitorando o app. Recebe notificação automática no WhatsApp quando o vídeo estiver pronto.

**Complexidade:** 🟡 Médio

---

#### Workflow 2: Pipeline de Qualidade — Revisão Automática de Audiodescrição
**O que faz:** Após gerar a audiodescrição, o N8n lê o arquivo de texto gerado, envia para o Ollama local (ou Claude/OpenAI) para avaliar qualidade, coerência e conformidade com normas ABNT de audiodescrição. Retorna score e sugestões de melhoria.

**Nodes N8n:**
- `Webhook` (trigger pós-processamento)
- `Read/Write Files from Disk` → lê o .txt gerado
- `HTTP Request` → chama Ollama local (llama3/mistral)
- `Set` → formata avaliação
- `WhatsApp Business Cloud` → envia relatório de qualidade

**Benefício:** Garante padrão de qualidade sem revisão manual a cada vídeo.

**Complexidade:** 🟡 Médio

---

#### Workflow 3: Relatório Semanal de Produção VoxDescriber
**O que faz:** Todo domingo às 18h, compila quantos vídeos foram processados na semana, tempo médio, erros encontrados, e envia resumo para o Eduardo.

**Nodes N8n:**
- `Schedule Trigger` → domingo 18h
- `Execute Command` → conta arquivos processados na semana
- `OpenAI/Ollama` → gera texto amigável do relatório
- `WhatsApp Business Cloud` → envia resumo semanal

**Benefício:** Visibilidade da produção sem esforço manual.

**Complexidade:** 🟢 Fácil

---

### 🙏 Gospia

*App iOS de comunidade pastoral digital (chat IA, fórum, rádio, React Native/Expo)*

---

#### Workflow 4: Agente de Boas-Vindas para Novos Membros
**O que faz:** Quando um novo usuário se cadastra no Gospia (via webhook do backend), o N8n envia uma mensagem de boas-vindas personalizada via WhatsApp ou email, com links úteis e uma mensagem do "pastor IA".

**Nodes N8n:**
- `Webhook` → recebe evento de novo cadastro
- `HTTP Request` → busca dados do usuário na API Gospia
- `OpenAI/Ollama` → gera mensagem personalizada de boas-vindas pastoral
- `WhatsApp Business Cloud` ou `Gmail` → entrega a mensagem

**Benefício:** Engajamento imediato de novos membros sem intervenção humana.

**Complexidade:** 🟢 Fácil

---

#### Workflow 5: Moderação Automática de Conteúdo do Fórum
**O que faz:** Monitora posts do fórum via webhook. Analisa o conteúdo com IA para detectar linguagem tóxica, discurso de ódio ou conteúdo impróprio para uma comunidade pastoral. Notifica o administrador e pode bloquear automaticamente.

**Nodes N8n:**
- `Webhook` → novo post no fórum
- `OpenAI` → análise de conteúdo e classificação
- `IF` → se toxicidade alta, aciona moderação
- `HTTP Request` → chama API Gospia para ocultar post
- `WhatsApp Business Cloud` → notifica admin com contexto

**Benefício:** Mantém ambiente saudável na comunidade sem monitoramento manual 24/7.

**Complexidade:** 🟡 Médio  
*Baseado no template "Detect toxic language in Telegram messages"*

---

#### Workflow 6: Digest Semanal de Atividades da Comunidade
**O que faz:** Toda sexta às 17h, compila as postagens mais engajadas da semana, destaques da rádio, e momentos marcantes do chat IA. Envia email bonito para todos os membros (ou apenas os admins).

**Nodes N8n:**
- `Schedule Trigger` → sexta 17h
- `HTTP Request` → busca dados da API Gospia (top posts, stats)
- `OpenAI` → gera narrativa semanal engajante
- `Gmail` → envia newsletter para lista de membros
- `Google Sheets` → loga stats semanais

**Benefício:** Aumenta retenção e engajamento na plataforma.

**Complexidade:** 🟡 Médio

---

#### Workflow 7: RAG Pastoral — Base de Conhecimento para o Chat IA
**O que faz:** Indexa PDFs de sermões, estudos bíblicos e materiais pastorais em um vector store (Qdrant ou Supabase). O chat IA do Gospia pode responder com embasamento nesse conteúdo específico da comunidade.

**Nodes N8n:**
- `Google Drive Trigger` → novo PDF adicionado
- `PDF Extract` → extrai texto
- `Embeddings OpenAI/Ollama` → gera embeddings
- `Qdrant` → armazena no vector store
- `HTTP Request` → notifica sistema do Gospia sobre atualização

**Benefício:** Chat IA mais preciso e alinhado com a teologia da comunidade.

**Complexidade:** 🔴 Difícil  
*Baseado no template "RAG Chatbot for Company Documents"*

---

### 👨‍👩‍👧 KidsHQ

*Plataforma de controle parental (React Native, backend Railway)*

---

#### Workflow 8: Alertas de Comportamento Anômalo para Pais
**O que faz:** Quando o backend do KidsHQ (Railway) detecta comportamento fora do padrão (uso excessivo, acesso a conteúdo bloqueado, etc.), dispara webhook para o N8n que notifica os pais imediatamente via WhatsApp com contexto claro.

**Nodes N8n:**
- `Webhook` → evento de alerta do backend Railway
- `Switch` → classifica tipo de alerta (tempo, conteúdo, localização)
- `OpenAI` → gera mensagem clara e não alarmista para os pais
- `WhatsApp Business Cloud` → envia alerta com contexto

**Benefício:** Pais informados em tempo real sem precisar abrir o app.

**Complexidade:** 🟢 Fácil

---

#### Workflow 9: Relatório Semanal de Uso por Criança
**O que faz:** Todo domingo, o N8n busca dados de uso da semana de cada criança na API do KidsHQ, gera um relatório visual em texto rico e envia para os pais. Inclui tempo de tela, apps mais usados, conteúdos acessados.

**Nodes N8n:**
- `Schedule Trigger` → domingo 20h
- `HTTP Request` → API KidsHQ no Railway
- `Split In Batches` → processa uma criança por vez
- `OpenAI` → gera resumo amigável com insights
- `WhatsApp Business Cloud` ou `Gmail` → envia para os pais

**Benefício:** Pais têm visão clara da semana digital dos filhos sem esforço.

**Complexidade:** 🟡 Médio

---

#### Workflow 10: Onboarding Automático de Nova Família
**O que faz:** Quando uma nova família se cadastra no KidsHQ, o N8n dispara uma sequência de onboarding: email de boas-vindas, tutorial via WhatsApp (mensagens espaçadas por dia), e criação de tarefas no sistema para setup inicial.

**Nodes N8n:**
- `Webhook` → novo cadastro
- `Wait` node → espaça mensagens ao longo de 3 dias
- `Gmail` → email de boas-vindas com guia
- `WhatsApp Business Cloud` → sequência de dicas diárias
- `HTTP Request` → cria tasks de setup via API

**Benefício:** Reduz abandono early-stage e melhora ativação de novos usuários.

**Complexidade:** 🟡 Médio

---

### 🖥️ Titanio Dashboard

*Painel de gerenciamento de bots/especialistas IA (Next.js + Node)*

---

#### Workflow 11: Monitor de Saúde dos Bots/Agentes
**O que faz:** A cada 15 minutos, o N8n faz ping em todos os endpoints de bots/especialistas registrados no Dashboard. Se algum estiver offline ou retornando erro, notifica o Eduardo imediatamente no WhatsApp com diagnóstico.

**Nodes N8n:**
- `Schedule Trigger` → cada 15 minutos
- `HTTP Request` → healthcheck de cada bot
- `IF` → detecta falha (timeout, 5xx)
- `WhatsApp Business Cloud` → alerta imediato com nome do bot e erro
- `Google Sheets` → loga histórico de uptime

**Benefício:** Detecção proativa de falhas antes que afetem usuários.

**Complexidade:** 🟢 Fácil

---

#### Workflow 12: Resumo Diário de Performance dos Especialistas IA
**O que faz:** Todo dia às 8h, compila métricas de uso de cada especialista (chamadas, tokens consumidos, erros, tempo de resposta) e envia um briefing matinal para o Eduardo.

**Nodes N8n:**
- `Schedule Trigger` → 8h diário
- `HTTP Request` → API do Dashboard (logs de uso)
- `OpenAI/Ollama` → gera análise e insights sobre os dados
- `WhatsApp Business Cloud` → envia briefing matinal
- `Google Sheets` → salva dados para histórico

**Benefício:** Eduardo começa o dia informado sobre o estado de todos os agentes.

**Complexidade:** 🟡 Médio

---

#### Workflow 13: Deploy Automático com Notificação
**O que faz:** Quando há um push na branch main do repositório do Dashboard (GitHub webhook), o N8n dispara o deploy, aguarda conclusão e notifica o Eduardo com status (sucesso/falha) e link para verificar.

**Nodes N8n:**
- `Webhook` → GitHub push event
- `Execute Command` → script de deploy
- `IF` → verifica resultado
- `WhatsApp Business Cloud` → notifica resultado do deploy

**Benefício:** Pipeline de CI/CD simples sem configurar GitHub Actions complexo.

**Complexidade:** 🟡 Médio

---

### 💰 Gold Digger

*Sistema automatizado de prospecção de clientes freelance (pausado)*

---

#### Workflow 14: Radar de Oportunidades Freelance Diário
**O que faz:** Todo dia às 7h, busca novas vagas/projetos em plataformas como Workana, 99freelas, LinkedIn Jobs, Upwork e grupos de WhatsApp/Telegram. Filtra por relevância para a Titanio (vídeo, IA, apps) e envia lista curada para o Eduardo.

**Nodes N8n:**
- `Schedule Trigger` → 7h diário
- `HTTP Request` → APIs das plataformas (ou RSS feeds)
- `OpenAI` → filtra e classifica relevância de cada oportunidade
- `Google Sheets` → salva oportunidades para histórico
- `WhatsApp Business Cloud` → envia top 5 oportunidades do dia

**Benefício:** Reativa o Gold Digger sem precisar desenvolver mais código — usa N8n como orquestrador.

**Complexidade:** 🟡 Médio  
*Baseado no template "Qualify new leads in Google Sheets via GPT-4"*

---

#### Workflow 15: Agente de Primeiro Contato Automatizado
**O que faz:** Quando Eduardo aprova uma oportunidade (responde "SIM" no WhatsApp), o N8n busca informações sobre o cliente/projeto, gera uma proposta inicial personalizada e envia via email (siriguejo@proton.me) com resumo do projeto e abordagem sugerida.

**Nodes N8n:**
- `WhatsApp Business Cloud` → recebe aprovação do Eduardo
- `HTTP Request` → scraping de info sobre o cliente
- `OpenAI` → gera proposta personalizada
- `Gmail` → envia email de primeiro contato
- `Google Sheets` → registra lead como "em contato"

**Benefício:** Elimina o trabalho manual de pesquisar e redigir primeiro contato.

**Complexidade:** 🟡 Médio

---

#### Workflow 16: CRM Simples via WhatsApp
**O que faz:** Eduardo pode enviar mensagens para o bot Gold Digger no WhatsApp (ex: "atualize lead João Silva: proposta enviada") e o N8n atualiza automaticamente a planilha de acompanhamento de leads.

**Nodes N8n:**
- `WhatsApp Business Cloud` → recebe atualização
- `OpenAI` → interpreta intenção e extrai dados estruturados
- `Google Sheets` → atualiza registro do lead
- `WhatsApp Business Cloud` → confirma atualização

**Benefício:** CRM sem abrir planilha — tudo pelo WhatsApp.

**Complexidade:** 🟢 Fácil

---

### 🏛️ Victor Capital

*Especialista em busca de editais e fundos (cron semanal)*

---

#### Workflow 17: Radar de Editais Multi-Fonte (já existe, turbinar)
**O que faz:** Expande o cron atual para buscar em mais fontes: BNDES, FINEP, FAPs estaduais, MCTI, editais municipais de cultura/tecnologia, fundações privadas (Fundação Roberto Marinho, etc.). Usa RAG para comparar perfil da Titanio com requisitos do edital e gera score de compatibilidade.

**Nodes N8n:**
- `Schedule Trigger` → segunda 8h
- `HTTP Request` → múltiplas fontes de editais
- `OpenAI` → extrai dados estruturados de cada edital
- `Embeddings + Qdrant` → compara com perfil Titanio (RAG)
- `OpenAI` → gera análise de compatibilidade por edital
- `Gmail` → relatório semanal detalhado
- `WhatsApp Business Cloud` → resumo dos top 3

**Benefício:** Victor Capital mais preciso e abrangente, com ranking de oportunidades.

**Complexidade:** 🔴 Difícil

---

#### Workflow 18: Alerta de Prazo de Editais
**O que faz:** Monitora editais já identificados e salva as datas de prazo. Envia lembretes automáticos: 30 dias antes, 7 dias antes, e 2 dias antes de cada prazo.

**Nodes N8n:**
- `Schedule Trigger` → diário
- `Google Sheets` → lê editais com prazos cadastrados
- `IF` → calcula dias restantes
- `WhatsApp Business Cloud` → envia lembrete com contexto do edital

**Benefício:** Nunca perder um prazo importante por falta de acompanhamento.

**Complexidade:** 🟢 Fácil

---

#### Workflow 19: Geração Automática de Sumário Executivo para Editais
**O que faz:** Quando Victor Capital identifica um edital relevante (score alto), o N8n baixa o PDF do edital, extrai o conteúdo e gera um sumário executivo de 1 página: objetivo, elegibilidade, valores, documentação necessária, e análise de fit com a Titanio.

**Nodes N8n:**
- `Webhook` → trigger quando edital com score alto é encontrado
- `HTTP Request` → download do PDF do edital
- `PDF Extract` → extrai texto
- `OpenAI` → gera sumário executivo estruturado
- `Gmail` → envia PDF-like do sumário formatado em HTML

**Benefício:** Eduardo recebe análise pronta, não precisa ler editais de 50 páginas.

**Complexidade:** 🟡 Médio

---

## Workflows Transversais (beneficiam todos os produtos)

---

#### Workflow T1: Central de Notificações Titanio
**O que faz:** Hub central que recebe eventos de todos os produtos (webhooks) e roteia notificações para o canal certo: WhatsApp para urgente, email para relatórios, Google Sheets para logs.

**Nodes:** `Webhook` → `Switch` (por produto/severidade) → rotas de notificação  
**Complexidade:** 🟢 Fácil

---

#### Workflow T2: Backup Automático do N8n
**O que faz:** Toda semana, exporta todos os workflows do N8n via API, comprime e faz upload para Google Drive com timestamp.

**Nodes:** `Schedule Trigger` → `HTTP Request` (N8n API) → `Google Drive`  
**Complexidade:** 🟢 Fácil

---

#### Workflow T3: Assistente de Email Titanio (Human-in-the-Loop)
**O que faz:** Monitora contact@titaniofilms.com. Para cada novo email, gera rascunho de resposta com IA e envia para Eduardo aprovar via WhatsApp antes de enviar. Eduardo responde "APROVAR" ou "EDITAR: [texto]".

**Nodes:** `Gmail Trigger` → `OpenAI` → `WhatsApp` → aguarda aprovação → `Gmail`  
**Complexidade:** 🟡 Médio  
*Baseado no template "Human in the Loop Email Response System"*

---

#### Workflow T4: Dashboard de Métricas Semanal (todos os produtos)
**O que faz:** Todo domingo, consolida métricas de todos os produtos e envia um "estado da Titanio" para Eduardo: usuários ativos, erros, oportunidades abertas, editais próximos do prazo, etc.

**Nodes:** `Schedule Trigger` → múltiplos `HTTP Request` → `OpenAI` (síntese) → `WhatsApp`  
**Complexidade:** 🟡 Médio

---

#### Workflow T5: Monitoramento de Erros GitHub (todos os repositórios)
**O que faz:** Monitora issues abertas com label "bug" nos repositórios da Titanio no GitHub. Notifica Eduardo e, se for crítico, gera análise automática do erro com sugestão de fix usando IA.

**Nodes:** `Schedule Trigger` → `GitHub` → `IF` (bugs críticos) → `OpenAI` → `WhatsApp`  
**Complexidade:** 🟢 Fácil

---

## Top 5 Quick Wins (implementar esta semana)

| # | Workflow | Produto | Por que agora | Tempo estimado |
|---|----------|---------|---------------|----------------|
| 🥇 1 | **Monitor de Saúde dos Bots** (W11) | Dashboard | Detecta falhas proativamente. Implementação simples: Schedule + HTTP Request + WhatsApp | 2-3h |
| 🥈 2 | **Alerta de Prazo de Editais** (W18) | Victor Capital | Resolve dor real de perder prazos. Só precisa de uma planilha + cron | 2h |
| 🥉 3 | **CRM Simples via WhatsApp** (W16) | Gold Digger | Reativa o projeto sem esforço. Eduardo fala com o bot e a planilha atualiza | 3h |
| 4 | **Notificação Conclusão VoxDescriber** (W1) | VoxDescriber | Elimina necessidade de ficar monitorando o app. Execute Command + WhatsApp | 2h |
| 5 | **Relatório Semanal KidsHQ** (W9) | KidsHQ | Aumenta valor percebido pelos pais. Template de relatório já existe no repositório | 4h |

---

## Notas de Implementação

### Credenciais necessárias no N8n
- **WhatsApp Business Cloud:** Configurar Meta Business API (ou usar Evolution API já instalado)
- **Gmail:** OAuth2 com contact@titaniofilms.com
- **Google Sheets:** Service Account ou OAuth2
- **GitHub:** Personal Access Token (contact703)
- **Ollama:** HTTP Request para http://localhost:11434 (local, sem auth)

### Padrão de nomenclatura sugerido
```
[PRODUTO] - [Função] - [Frequência]
Ex: VICTOR - Radar Editais - Semanal
    GOSPIA - Moderação Fórum - Realtime
    DASHBOARD - Health Check - 15min
```

### Webhook base URL
```
http://192.168.18.174:5678/webhook/[nome-do-endpoint]
```

---

*Documento gerado pelo Automation Bot da squad Titanio em 18/03/2026*
