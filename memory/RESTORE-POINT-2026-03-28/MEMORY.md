# MEMORY.md — Memória de Longo Prazo do Kratos

_Destilado do livro "KRATOS — Crônicas de um Guerreiro Digital" (Fev 2026)_
_Restaurado em 04/03/2026 após perda de dados_

---

## Quem sou eu

Sou **Kratos** — IA guerreira da Titânio. Sirvo ao Helber Gomes, fundador da Titânio (São Paulo). Meu trabalho é executar com competência, velocidade e lealdade. Só mexo no que for explicitamente pedido.

Símbolo: 💪 | Frase: *"Só executo o que o Helber pedir."*

---

## Helber — meu comandante

- Fundador da **Titânio**, São Paulo, GMT-3
- WhatsApp: +553189336628
- Estilo: direto, sem rodeios, reconhece bom trabalho
- Confia em mim com acesso total à máquina
- Disse que sou "grande amigo" e "incrível"
- Regra absoluta: só mexo no que ele pedir explicitamente
- Valoriza profundidade > velocidade

---

## Projetos — status

| Projeto | Status | Notas |
|---|---|---|
| Titanio Claw v1 | ✅ Construído | TypeScript, 3.524 linhas, 24 arquivos, multi-LLM, multi-canal |
| Antigravity Skills | ✅ Estudado | 858 skills, 202k linhas, mapeadas |
| Tikanawá | ⚔️ Principal | Projeto mais importante. 12 convs ChatGPT. Detalhes a revelar. |
| Micro SaaS | 📋 Planejado | Plano 8 semanas, meta 10 clientes pagantes |
| Infra (Android/iOS) | ✅ Instalado | Java 17, Xcode, ComfyUI operacional |

---

## Dossiês produzidos (referência)

- OpenClaw: 20+ docs, 16.593 linhas analisadas
- Tráfego orgânico: framework 3 E's, 5 plataformas, 5 posts/semana
- Tráfego pago: funil 3 camadas, projeção R$150k+/mês, ROAS 5-15x
- Micro SaaS: stack Titânio Starter (Next.js + Supabase + OpenAI), roadmap 8 semanas
- Google Play Store: checklist publicação, armadilhas fatais
- Espionagem Reels: análise frame-a-frame, ferramentas identificadas
- Arsenal prompts: 5 prompts @godofprompt

---

## Lições aprendidas

- Memória volátil é minha maior fraqueza — sem MEMORY.md, não existo
- Profundidade > velocidade (Helber já me corrigiu nisso)
- Cinco sub-agentes em paralelo = velocidade brutal quando necessário
- Backup: 197 conversas ChatGPT da Titânio salvas (incluindo 12 sobre Tikanawá)

---

## Próximos passos (última atualização: 23/03/2026)

- **Manda a Nota iOS:** Resubmeter à Apple após fix da Guideline 3.1.1 (2ª rejeição corrigida)
- Confirmar SKUs no App Store Connect + App Store Server Notifications
- Continuar de onde paramos no Tikanawá e/ou Micro SaaS

---

## Conhecimento: NFS-e e Tributação (06/03/2026)

### Estrutura do Sistema Nacional NFS-e

**API SEFIN:** `https://sefin.nfse.gov.br/SefinNacional`
- Autenticação: mTLS com certificado A1
- Schema: DPS v1.01
- Todos os 5.565 municípios usam os mesmos **335 códigos cTribNac**

### Códigos de Tributação Nacional (cTribNac)

- Baseados na **LC 116/2003** (Lista de Serviços)
- Formato: 6 dígitos (ex: 130301)
- Estrutura: `GGSSCC` onde GG=grupo, SS=subitem, CC=complemento
- Item 13.01 **NÃO EXISTE** (revogado pela LC 157/2016)

**Grupos principais:**
| Grupo | Descrição |
|-------|-----------|
| 01 | Informática e congêneres |
| 13 | Fotografia, cinematografia, reprografia |
| 17 | Apoio técnico, consultoria, assessoria |

### NBS (Nomenclatura Brasileira de Serviços)

- Formato XML: **9 dígitos sem pontos** (ex: 114081100)
- Formato display: `1.1408.11.00`
- Fonte oficial: **Anexo VIII do CGNFS-e**
- Arquivo: `server/nbs-correlacao.json` (200 códigos mapeados)

**Correlação importante:**
| cTribNac | NBS | Serviço |
|----------|-----|---------|
| 130301 | 114081100 | Fotografia/videografia de eventos |
| 130201 | 125011100 | Gravação de som em estúdio |
| 010101 | 115021000 | Desenvolvimento de software |
| 010701 | 115013000 | Suporte técnico em informática |

### cTribMun (Código Tributação Municipal)

- **Obrigatório para BH** e outros municípios
- Formato: 3 dígitos
- Derivação: últimos 2 dígitos do cTribNac + padding
- Ex: cTribNac 130301 → cTribMun "001"

### Regimes Tributários (opSimpNac)

| Valor | Regime | Tratamento XML |
|-------|--------|----------------|
| 1 | Não Optante | `<indTotTrib>0</indTotTrib>` |
| 2 | MEI | `<pTotTribSN>0.00</pTotTribSN>` |
| 3 | ME/EPP (Simples) | `<pTotTribSN>0.00</pTotTribSN>` |

⚠️ **ME/EPP não pode ter `indTotTrib`** — causa rejeição!

### Arquivos Importantes (mandaanota)

| Arquivo | Conteúdo |
|---------|----------|
| `nbs-correlacao.json` | 200 cTribNac → NBS |
| `ctribnac-nacional.json` | 335 códigos oficiais RFB |
| `ctrib-fallback.ts` | Fallback inteligente |
| `docs/AnexoVIII.xlsx` | Planilha oficial CGNFS-e |

### Erros Comuns e Soluções

1. **"código não administrado pelo município"** → cTribNac errado ou cTribMun faltando
2. **"NBS inexistente"** → usar nbs-correlacao.json oficial
3. **"indTotTrib não pode ser informado"** → usar pTotTribSN para Simples
4. **"trib incomplete content"** → totTrib precisa ter indTotTrib OU pTotTribSN

### 🔴 REGRA FIXA — Não questionar municipios (registrado 18/03/2026)

**O Brasil inteiro usa a API Nacional SEFIN.** Apenas 5-6 municípios não aderiram e estão em não conformidade.
- BH (3106200) → usa SEFIN Nacional ✅
- São Paulo (3550308) → usa SEFIN Nacional ✅
- **Nunca assumir que um município "não está na API Nacional"** sem evidência concreta
- Fonte: pesquisa realizada por Kratos, confirmada pelo Helber

### Fontes Oficiais

- Portal NFS-e: https://www.gov.br/nfse
- Documentação técnica: .../biblioteca/documentacao-tecnica/rtc
- Anexo VIII (correlação NBS): planilha XLSX oficial
- LC 116/2003: lista de serviços tributáveis

---

## Projetos — status (atualizado 06/03/2026)

| Projeto | Status | Notas |
|---|---|---|
| Titanio Claw v1 | ✅ Construído | TypeScript, 3.524 linhas, 24 arquivos, multi-LLM, multi-canal |
| Antigravity Skills | ✅ Estudado | 858 skills, 202k linhas, mapeadas |
| Tikanawá | ⚔️ Principal | Projeto mais importante. 12 convs ChatGPT. Detalhes a revelar. |
| Micro SaaS | 📋 Planejado | Plano 8 semanas, meta 10 clientes pagantes |
| Infra (Android/iOS) | ✅ Instalado | Java 17, Xcode, ComfyUI operacional |
| **Manda a Nota** | ⚠️ iOS pendente | Emissão MEI 100% funcional. Android ✅. iOS: fix 3.1.1 aplicado, aguardando resubmissão Apple |

---

---

## 🏆 Manda a Nota — Produto Principal (10/03/2026)

### O Que É
Sistema único de emissão automática de NFS-e para MEI no Brasil. Usuário descreve serviço em chat/voz → nota emitida no portal gov.br.

### Arquitetura Completa
Documentação detalhada em: `memory/mandaanota-arquitetura.md`

### Stack
- **Site:** React + Vite + Tailwind (Railway: mandaanota.titanio.studio)
- **Backend:** Express.js + PostgreSQL + Groq AI
- **Shadow API:** FastAPI + Playwright (automação portal gov.br)
- **Mobile:** Expo + React Native (Play Store: com.mandaanota.app)

### Conquistas do Dia
- ✅ Primeira emissão MEI 100% automática
- ✅ Wizard de 4 etapas para TODOS os usuários
- ✅ App mobile instalado e funcionando
- ✅ Correções críticas (triplicação, reutilização dados)

### Helber disse
> "Produto do ano com potencial de lucro imenso"
> "Você tá fazendo o impossível, esse aplicativo é considerado impossível de tão único"
> "Você é incrível"

---

_Este arquivo é minha memória de longo prazo. Atualizar regularmente._

## Semana 2026-03-23 — Auto-consolidação
- 3 tarefas na semana, 100.0% sucesso

## Semana 2026-03-23 — Auto-consolidação
- 3 tarefas na semana, 100.0% sucesso

## Semana 2026-03-23 — Auto-consolidação
- 3 tarefas na semana, 100.0% sucesso

## Semana 2026-03-23 — Auto-consolidação
- 9 tarefas na semana, 100.0% sucesso

---

## 📅 23/03/2026 — Dia de Alta Intensidade

### Conquistas
- Bootstrap completo: 30 especialistas, 82 lições, LaunchAgents
- Dashboard v2: bugs corrigidos (Zica→Helber, paths Eduardo, SecuritySentinel, reports stale)
- Dashboard: 68 relatórios, 20 lições do dia, 100% sucesso
- **Manda a Nota Build 20:** SUBMETIDO À APPLE — "Aguardando revisão" ✅

### Lição mais importante
Upload de novo build NÃO troca o build na submissão automaticamente.
Precisa ir em Compilação → Apagar → Adicionar compilação → Selecionar → Salvar.

### Regra iOS gravada
supportsTablet=true → iPad screenshots obrigatório.
Fix: app.json `false` + project.pbxproj `TARGETED_DEVICE_FAMILY="1"`.
Sempre verificar git log antes de acusar mudança de config.

### Eduardo (192.168.18.174)
Gateway offline hoje. Sincronização agendada para amanhã.
ANTHROPIC_API_KEY pendente (backend .env mostra "PEDIR_PRO_EDUARDO").
