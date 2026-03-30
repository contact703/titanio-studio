# 📋 Victor Capital — Log de Submissão de Programas Cloud
**Última atualização:** 2026-03-19 11:10 BRT
**Responsável automação:** Victor Capital (subagent)

---

## Resumo Executivo

| Programa | Status | Bloqueio | Ação Manual |
|---|---|---|---|
| 🟢 NVIDIA Inception | ⚠️ Conta parcial | hCaptcha | Resolver CAPTCHA + verificar email |
| 🟠 AWS Activate | ⚠️ Parcial | Erro servidor | Re-tentar "Continuar" ou esperar |
| 🔵 Microsoft Startups | ⚠️ Login pendente | Código email | Enviar código → verificar email |

**Nenhum programa foi totalmente submetido** — todos exigem interação humana em pontos de autenticação (CAPTCHA, verificação de email, ou login com código).

---

## 1. 🟢 NVIDIA Inception Program

**URL:** https://programs.nvidia.com/phoenix/application?ncid=no-ncid
**Email usado:** tiago@titaniofilms.com

### Progresso
- ✅ Acessou formulário Phoenix
- ✅ Preencheu email `tiago@titaniofilms.com` no campo `#input-30`
- ✅ Clicou "Sign Up / Login" (botão shadow DOM via `getByRole`)
- ✅ Redirecionou para `login.nvgs.nvidia.com/v1/create-account` (conta não existia)
- ✅ Preencheu senha: `TitanioAI2026!`
- ✅ Preencheu confirmação de senha
- ❌ **BLOQUEADO: hCaptcha "Sou humano"** — não pode ser resolvido programaticamente

### Ação Manual Necessária
1. Abrir: https://programs.nvidia.com/phoenix/application?ncid=no-ncid
2. Digitar `tiago@titaniofilms.com` no campo de email
3. Clicar "Sign Up / Login"
4. Na tela de criação de conta: digitar senha `TitanioAI2026!` + confirmar
5. **Resolver hCaptcha** (clicar "Sou humano")
6. Clicar "Criar Uma Conta"
7. **Verificar email** tiago@titaniofilms.com para código de confirmação
8. Após login, preencher formulário Inception com dados abaixo

### Dados para o Formulário Inception
- **Company:** Titanio Studio
- **Website:** https://titaniofilms.com
- **Country:** Brazil
- **Stage:** Early Stage
- **Employees:** 1-10
- **Revenue:** Pre-revenue
- **Title:** CEO
- **Phone:** +5531838381881
- **AI/ML Use Case:**
  > VoxDescriber uses local AI inference (WhisperX for speech recognition, Qwen2.5-VL for visual understanding, Piper TTS for speech synthesis) to generate audio descriptions for visually impaired users. GPU acceleration is critical for real-time video analysis. NVIDIA compute would reduce processing time from minutes to seconds per video segment, serving 6.5M visually impaired Brazilians (NBR 15290 compliant).

- **How you use NVIDIA tech:**
  > We use NVIDIA GPUs (RTX series) for local inference of vision-language models (Qwen2.5-VL) and WhisperX. NVIDIA Inception credits/discounts would unlock enterprise-grade inference for our accessibility pipeline.

### Screenshots
- `/screenshots/nvidia-phoenix/` — tentativas anteriores
- `/screenshots/nvidia-consolidated/` — tentativa consolidada
- `/screenshots/nvidia-v5/` — versão com screenshot do formulário

---

## 2. 🟠 AWS Activate (Builder ID)

**URL:** https://aws.amazon.com/startups/sign-up
**Email usado:** tiago@titaniofilms.com

### Progresso
- ✅ Acessou página de sign-up AWS Startups
- ✅ Clicou "Criar ID do builder" (abre popup em nova aba)
- ✅ Aceitou cookies no popup
- ✅ Preencheu email `tiago@titaniofilms.com`
- ✅ Clicou "Continuar" → redirecionou para `profile.aws.amazon.com/#/signup/enter-email`
- ✅ Preencheu nome "Tiago Affonso" (campo dinâmico `formField29-*`)
- ✅ Clicou "Continuar" (nome)
- ❌ **BLOQUEADO: Erro do servidor** — "Desculpe, houve um erro ao processar sua solicitação"

### Ação Manual Necessária
1. Abrir: https://aws.amazon.com/startups/sign-up
2. Clicar "Criar ID do builder"
3. Na popup: aceitar cookies, digitar email `tiago@titaniofilms.com`, clicar "Continuar"
4. Digitar nome "Tiago Affonso", clicar "Continuar"
5. Se der erro: esperar alguns minutos e tentar novamente
6. Completar verificação de email quando solicitado
7. Criar senha quando solicitado
8. Após Builder ID criado → preencher perfil da startup:

### Dados para Perfil
- **Company:** Titanio Studio
- **Website:** https://titaniofilms.com
- **Country:** Brazil
- **Stage:** Idea / Early Stage
- **Startup description:**
  > Titanio Studio develops AI-powered accessibility and media tools for the Brazilian market. VoxDescriber automates audio description for visually impaired users using on-device AI. We are pre-revenue, bootstrapped, seeking infrastructure to scale our AI pipeline.

- **How you'll use AWS credits:**
  > EC2 instances for model training and inference, S3 for media storage, Lambda for API endpoints, and Polly for TTS fallback. AWS credits allow us to test cloud deployment before committing to paid plans.

### Screenshots
- `/screenshots/aws-consolidated/` — tentativa consolidada
- `/screenshots/aws-v5/` — nome preenchido com sucesso
- `/screenshots/aws-popup/` — popup do Builder ID

---

## 3. 🔵 Microsoft for Startups — Founders Hub

**URL:** https://foundershub.startups.microsoft.com/signup (redireciona para portal.startups.microsoft.com/signup)
**Email usado:** contact@titaniofilms.com

### Progresso
- ✅ Acessou página de signup
- ✅ Clicou "Inscrever-se com o Azure"
- ✅ Redirecionou para login.microsoftonline.com
- ✅ Preencheu email `contact@titaniofilms.com`
- ✅ Clicou Next — conta Microsoft reconhecida!
- ❌ **BLOQUEADO: Código de verificação por email** — precisa clicar "Enviar código" e verificar email

### Ação Manual Necessária
1. Abrir: https://portal.startups.microsoft.com/signup
2. Clicar "Inscrever-se com o Azure"
3. Digitar `contact@titaniofilms.com`
4. Clicar "Enviar código"
5. Verificar email contact@titaniofilms.com para código
6. Inserir código → login completo
7. Preencher formulário Founders Hub:

### Dados para Formulário
- **Company name:** Titanio Studio
- **Company website:** https://titaniofilms.com
- **Country:** Brazil
- **Stage:** Early Stage (Seed/Pre-seed)
- **Industry:** Artificial Intelligence / Media & Entertainment
- **Funding stage:** Bootstrapped
- **Startup description:**
  > Titanio Studio is a Brazilian AI startup building accessibility and media technology. Our flagship product, VoxDescriber, is an offline AI-powered audio description tool for visually impaired users, targeting 6.5 million Brazilians with visual disabilities — in compliance with NBR 15290. We use local AI models (WhisperX, Qwen2.5-VL, Piper TTS). Azure OpenAI and TTS services would directly accelerate our infrastructure.

- **Problem solved:**
  > Audio description for the visually impaired is expensive and inaccessible in Brazil. 96% of Brazilian content lacks proper audio description. VoxDescriber automates this at near-zero cost using on-device AI.

- **Microsoft cloud usage:**
  > Azure OpenAI API for NLG, Azure TTS for voice synthesis in pt-BR, and Azure compute for model inference.

### Screenshots
- `/screenshots/ms-consolidated/` — tentativa consolidada

---

## Notas Técnicas

### Por que não foi possível submeter automaticamente?
1. **NVIDIA**: hCaptcha é resistente a automação por design
2. **AWS**: O signup usa um popup para outra aba + erro transitório do servidor
3. **Microsoft**: Login passwordless requer código enviado por email

### Recomendações
- **Prioridade 1**: Microsoft (mais fácil — conta já existe, só precisa do código)
- **Prioridade 2**: NVIDIA (conta precisa ser criada, mas formulário é curto)
- **Prioridade 3**: AWS (erro do servidor pode ser temporário, tentar amanhã)

### Credenciais preparadas
| Serviço | Email | Senha |
|---|---|---|
| NVIDIA | tiago@titaniofilms.com | TitanioAI2026! |
| AWS Builder ID | tiago@titaniofilms.com | TitanioAI2026! |
| Microsoft | contact@titaniofilms.com | (conta existente, login por código) |

---
## 📸 Análise Visual das Screenshots — 2026-03-19T14:10:00

### Observações das imagens capturadas:

**Techstars**: Conta criada com sucesso (confirmado visualmente). Tela mostra "Account activation — You must verify your email address. An email with instructions has been sent to you." → VERIFICAR tiago@titaniofilms.com AGORA.

**Techstars Accelerators**: Screenshot mostra MÚLTIPLOS programas abertos com deadline Jun 10, 2026:
- **Techstars Anywhere Accelerator** — "Anywhere" (global/remoto) — Apply by Jun 10
- Techstars Tokyo (Apply by May 6)
- Techstars AI Health Baltimore — Apply by Jun 10
- ABN AMRO + Techstars Future of Finance — Apply by Jun 10
- Entre outros ~15 programas

**AWS**: Screenshot confirma formulário com email `contact@titaniofilms.com` preenchido, mas campo "AWS account name" aparece vazio com erro "An AWS account name is required" → o script preencheu o nome mas o valor não persistiu. Ação: completar manualmente.

**Google for Startups São Paulo**: Banner visível: "O Campus está temporariamente fechado. Estamos construindo um novo espaço para apoiar o futuro da inovação no Brasil." → Campus SP fechado temporariamente. Há newsletter para notificações.

**IDB Lab**: Página /contact retornou 404. Formulários Airtable válidos:
- Grant: https://airtable.com/apperI6xBpfHml1rE/pagSorajtGqp8nX7h/form
- Loans: https://airtable.com/apperI6xBpfHml1rE/pagoG70Ks13qsy4JU/form

**F6S**: Bot detection — "We think you might be a bot" — bloqueado por anti-bot.

