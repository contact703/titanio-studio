# LESSONS.md — O que a Tita Aprendeu

> **Quando ler:** Início de sessão com tarefas complexas, antes de deploy, antes de comunicar em grupos.
> **Quando escrever:** Ao detectar erro, receber feedback do Eduardo, concluir tarefa com insight novo.

---

## 🔴 Regras Críticas (aprendidas na marra)

- Verificar credenciais ANTES de iniciar qualquer deploy ou integração
- Nunca afirmar status de projeto sem ler `contexto-ativo.md` primeiro
- Endpoint WhatsApp via OpenClaw: `POST /api/message` (não `/api/message/send`)
- `GITHUB_TOKEN` sem scope `workflow` não cria GitHub Actions — confirmar escopos
- `N8N_ENCRYPTION_KEY` deve ser sempre a mesma após primeiro uso
- **Especialistas usam Opus ou Sonnet (modelos pagos).** IAs gratuitas (StepFlash, Nemotron, Groq free, etc.) = APENAS para tarefas simples e buscas rápidas, SEMPRE com fallback de outras gratuitas configurado (nunca depender de uma só). Subagentes podem receber instruções incorretas — verificar regra antes de executar qualquer mudança de modelo. (Corrigido 2026-03-28, original 2026-03-20)

## 🟡 Preferências do Eduardo

- Respostas diretas, sem "Claro!", "Com certeza!", "Ótima pergunta!"
- WhatsApp é canal principal para urgências
- Prefere soluções práticas entregues, não opções para escolher
- Quando offline 2+ dias: tarefas de infra podem ser feitas proativamente

## 🟢 O que Funciona Bem

- Flushes de memória a cada 3h funcionam — manter
- Estrutura MEMORY.md + daily notes é sólida
- Sub-agentes especializados (Code Ninja, DevOps, etc.) produzem resultado melhor

---

## 📚 Lições por Data

<!-- Adicionar novas lições abaixo, mais recentes primeiro -->

### 2026-03-14
- N8n Docker: usar `host.docker.internal` para acessar serviços do Mac host
- Workflows N8n: criar sub-workflow "Send WhatsApp" reutilizável evita duplicação
- Grupo Gospia ID: `120363405462114071@g.us`
- N8n webhooks: URL de produção é `/webhook/`, URL de teste é `/webhook-test/` (só funciona com editor aberto)

---

## 🚫 Anti-patterns — Nunca Fazer

- Nunca hardcodar tokens/senhas em arquivos de código
- Nunca criar "mega-workflows" — um workflow, uma responsabilidade
- Nunca assumir que endpoint REST segue convenção padrão sem verificar
- Nunca fazer `rm` sem confirmação — usar `trash` ou pedir permissão
- **NUNCA escrever plano pra outro Claw sem implementar aqui primeiro.** Se é bom o suficiente pra mandar, é bom o suficiente pra fazer. (Incidente 2026-03-28: escrevi MDs com pipelines, endpoints e integração Dashboard pro Helber — o Kratos implementou tudo, eu não fiz nada aqui. Zica cobrou.)
- **NUNCA gerar MD como substituto de implementação.** Documento é consequência do trabalho, não o trabalho em si.

- **29/03/2026:** Nunca apostar no Polymarket sem análise real de notícias e dados. Ser ousado mas com base.

- **29/03/2026:** SEMPRE usar especialistas via HiClaw em vez de spawnar agents genéricos. Especialistas aprendem e acumulam lições.
