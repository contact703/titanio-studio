# 📋 Relatório: Especialistas — Memória, Aprendizado e Autonomia

**Data:** 28/03/2026
**Solicitado por:** Zica

---

## 1. Distribuição de Conhecimento (feita agora)

| Especialista | Antes | Depois | Fonte |
|---|---|---|---|
| ios-specialist | 49B | 75KB | iOS research 73KB |
| code-ninja | 45B | 70KB | Dev research 43KB + Gospia guia 23KB |
| money-maker | 46B | 68KB | Money research 25KB (já tinha 42KB LESSONS) |
| automation-bot | 49B | 35KB | Agents free research 34KB |
| memory-bot | 45B | 33KB | Memory research + Evermind + recall |
| security-guardian | 52B | 30KB | Security research 30KB |
| fund-hunter | 46B | 25KB | Money research 25KB |
| marketing-director | 53B | 15KB | Gospia study 15KB |
| debug-hunter | 47B | 11KB | Lições críticas + debug report |
| devops-ninja | 47B | 10KB | Network study + network map |
| instagramer | 0B | 9KB | Técnicas Instagram |
| openclaw-specialist | 0B | 9KB | Setup Helber/Tiago |
| gold-digger | 46B | 7KB | Polymarket data |
| trader | 0B | 7KB | Polymarket data |
| content-writer | 49B | 5KB | (já tinha 5KB LESSONS) |

---

## 2. Estado Atual — Classificação

**🟢 RICOS (15 especialistas — prontos pra receber tarefas):**
ios-specialist, code-ninja, money-maker, automation-bot, memory-bot, security-guardian, fund-hunter, marketing-director, debug-hunter, devops-ninja, instagramer, openclaw-specialist, gold-digger, trader, content-writer

**🟡 BÁSICOS (3 — precisam de mais contexto):**
api-master, designer-specialist, instagram-poster

**🔴 VAZIOS (19 — sem conhecimento útil):**
advogado-titanio, agent-doctor, aso-specialist, audiodesc-specialist, ceo-titanio, data-analyst, design-wizard, design-master, diretor-de-arte, growth-hacker, literary-agent, mac-specialist, marketing-ninja, memory-guardian, mentor-titanio, n8n-master, radio-gospia, security-guard, social-watcher, tradutor, whatsapp-titanio

---

## 3. O Que FALTA Para Autonomia

### 🔴 CRÍTICO — Sem isso não funciona

**3.1. Context.md precisa de instruções reais**
Cada especialista tem um context.md de ~70 bytes (só header). Precisa ter:
- Qual é a missão dele
- Que tipo de tarefas ele aceita
- Que ferramentas/APIs ele pode usar
- Qual modelo usar (Opus pra trabalho sério, gratuito pra busca simples)
- Quando pedir ajuda vs quando agir sozinho
- Com quais outros especialistas ele colabora

**3.2. Sistema de despacho de tarefas**
Hoje: Tita recebe tudo e faz tudo sozinha. Não tem como direcionar tarefa pro especialista certo automaticamente.
Precisa: Router que analisa a tarefa e manda pro especialista adequado.

**3.3. Fallback chain de modelos**
Regra da Zica: especialistas usam Opus/Sonnet, gratuitos só pra tarefas simples com fallback de outras gratuitas.
Precisa: Config por especialista definindo:
```
primário: opus
secundário: sonnet  
tarefas simples: groq-free → stepflash → nemotron (chain)
```

### 🟡 IMPORTANTE — Melhora qualidade

**3.4. Sem LESSONS.md na maioria**
Só 8/38 especialistas têm LESSONS com conteúdo real. Os outros não aprendem com erros.
Precisa: Hook pós-tarefa que força o especialista a registrar lição.

**3.5. Sem sessions/histórico**
Só 6 especialistas têm pasta sessions/. Os outros não têm registro de que tarefas já fizeram.
Precisa: Log automático de cada tarefa executada.

**3.6. Especialistas duplicados/redundantes**
- security-guard vs security-guardian (mesmo papel)
- design-wizard vs design-master vs designer-specialist vs diretor-de-arte (4 de design!)
- marketing-ninja vs marketing-director vs growth-hacker (3 de marketing)
- memory-bot vs memory-guardian (2 de memória)
- n8n-master vs automation-bot (2 de automação)
Precisa: Consolidar duplicatas. Menos especialistas, mais profundos.

### 🟢 BOM TER — Pra escalar

**3.7. Memory Engine integrado nos especialistas**
Hoje o Memory Engine só indexa os arquivos da Tita. Deveria indexar as memórias de cada especialista também.
Precisa: Expandir engine pra ler pasta-do-tita/memoria-especialistas/*/

**3.8. Cross-specialist memory**
Especialistas não sabem o que os outros sabem. Code-ninja não sabe que debug-hunter já resolveu um bug parecido.
Precisa: Grafo de conhecimento compartilhado.

**3.9. Auto-evaluation**
Sem métrica de qualidade por especialista. Não sabemos quem é bom e quem é inútil.
Precisa: Score por especialista (igual o Memory Score da Tita).

---

## 4. Plano para Autonomia — 3 Fases

### Fase 1: Fundação (1-2 dias)
- [ ] Consolidar duplicatas (38 → ~20 especialistas)
- [ ] Escrever context.md real para os 15 ricos
- [ ] Definir model chain por especialista
- [ ] Criar template de context.md padrão

### Fase 2: Infraestrutura (3-5 dias)
- [ ] Router de tarefas (analisa pedido → manda pro especialista certo)
- [ ] Hook pós-tarefa (forçar registro de LESSONS)
- [ ] Log automático de sessions
- [ ] Expandir Memory Engine pros especialistas

### Fase 3: Autonomia (1-2 semanas)
- [ ] Score por especialista
- [ ] Cross-specialist search
- [ ] Auto-assignment de tarefas do HEARTBEAT
- [ ] Cron jobs por especialista (cada um checa sua área)

---

## 5. Especialistas Recomendados para Desativar

Estes podem ser removidos ou absorvidos:

| Desativar | Absorver em |
|---|---|
| security-guard | security-guardian |
| design-master | design-wizard |
| designer-specialist | design-wizard |
| diretor-de-arte | design-wizard |
| marketing-ninja | marketing-director |
| growth-hacker | marketing-director |
| memory-guardian | memory-bot |
| n8n-master | automation-bot |
| sessions | (não é especialista, é pasta) |
| social-watcher | instagramer |
| instagram-poster | instagramer |

**Resultado: 38 → ~25 especialistas ativos**

---

## 6. Top 5 Prioridades Imediatas

1. **Consolidar duplicatas** — menos é mais, especialistas focados produzem melhor
2. **Context.md real** — sem instruções claras, o especialista não sabe o que fazer
3. **Model chain** — Opus/Sonnet pra trabalho, gratuitos com fallback pra buscas
4. **Router de tarefas** — Tita não deveria fazer tudo, deveria delegar
5. **Hook de aprendizado** — todo erro vira lição automaticamente

---

*Relatório por Tita, 28/03/2026*
*"15 especialistas ricos em conhecimento, 19 vazios. Consolidar e instrumentar antes de escalar."*
