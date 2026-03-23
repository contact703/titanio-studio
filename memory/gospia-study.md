# Gospia — Estudo Completo do App

## 🎯 O que é o Gospia
App de **aconselhamento espiritual com IA** — um "Pastor Virtual" chamado **Pastor Elder** que conversa como terapeuta/conselheiro religioso. Tem rede social religiosa, rádio gospel, sistema de pagamentos (Pro), e emissão de NFSe.

**URL**: https://www.gospia.app
**GitHub**: https://github.com/contact703/Appgospia.git

---

## 🏗️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Estilo** | Tailwind CSS 4 (dark/light mode) |
| **Banco** | Supabase (PostgreSQL + Auth + RLS + Realtime) |
| **IA** | Groq API (Llama 3.3 70B, fallback: Llama 3.1 70B → 8B → Mixtral) |
| **Pagamentos** | Stripe + MercadoPago (PIX) |
| **Hospedagem** | Vercel (nixpacks.toml presente, mas doc diz Vercel) |
| **Storage** | Cloudflare R2 (músicas da rádio) |
| **TTS** | ElevenLabs (API key presente) + Web Speech API (fallback) |
| **NFSe Worker** | Node.js separado (TypeScript) |

---

## 🔐 Variáveis de Ambiente Necessárias

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
OPENAI_API_KEY=
ELEVEN_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
MP_ACCESS_TOKEN= (MercadoPago)
NEXT_PUBLIC_APP_URL=
NFSE_DANFSE_BASE_URL=
```

---

## 📁 Estrutura de Arquivos

### Páginas
- `/` — Home (AppLayout → Login ou Chat)
- `/radiogospia` — Player de rádio gospel
- `/compartilhado/[id]` — Página de compartilhamento de conversas
- `/privacidade` — Política de privacidade
- `/auth/callback` — Callback OAuth Google

### API Routes (Backend)
| Rota | Função |
|------|--------|
| `POST /api/chat` | Chat com Pastor Elder (Groq API) |
| `POST /api/chat/gen-title` | Gera título automático pra conversa |
| `POST /api/moderate` | Moderação de conteúdo |
| `POST /api/tts` | Text-to-speech (ElevenLabs) |
| `GET/POST /api/personality` | Perfil de personalidade MBTI |
| `POST /api/personality/update` | Atualiza perfil MBTI |
| `POST /api/payment/pix` | Gera QR Code PIX (MercadoPago) |
| `POST /api/payment/stripe` | Checkout Stripe |
| `POST /api/payment/webhook` | Webhook de pagamento |
| `POST /api/webhooks/mercadopago` | Webhook MercadoPago |
| `POST /api/webhooks/stripe` | Webhook Stripe |
| `POST /api/share` | Compartilhar conversa |
| `GET /api/share/download` | Download de conversa |
| `POST /api/referral/claim` | Sistema de referral |
| `DELETE /api/user/delete` | Deletar conta |
| `GET /api/nfse/[chave]/pdf` | Download PDF da NFSe |

### API Routes Sociais
| Rota | Função |
|------|--------|
| **Perfis** | |
| `GET /api/social/profiles/me` | Meu perfil |
| `GET /api/social/profiles/[userId]` | Perfil de outro usuário |
| **Amigos** | |
| `POST /api/social/friend-requests/send` | Enviar pedido de amizade |
| `GET /api/social/friend-requests/pending` | Pedidos pendentes |
| `POST /api/social/friend-requests/[id]/accept` | Aceitar |
| `POST /api/social/friend-requests/[id]/reject` | Rejeitar |
| `GET /api/social/friends/me` | Meus amigos |
| `DELETE /api/social/friends/[id]` | Remover amigo |
| **Conversas (DMs)** | |
| `GET /api/social/conversations` | Listar conversas |
| `GET /api/social/conversations/[id]/messages` | Mensagens da conversa |
| `POST /api/social/conversations/[id]/mark-read` | Marcar como lido |
| `POST /api/social/conversations/private/get-or-create` | Criar/obter DM |
| `POST /api/social/messages/direct` | Enviar DM |
| **Posts/Feed** | |
| `GET/POST /api/social/posts` | Listar/criar posts |
| `GET /api/social/posts/feed` | Feed |
| `GET/DELETE /api/social/posts/[id]` | Ver/deletar post |
| `POST /api/social/posts/[id]/like` | Curtir |
| `GET/POST /api/social/posts/[id]/comments` | Comentários |
| **Fórum** | |
| `GET /api/social/forum/categories` | Categorias |
| `GET/POST /api/social/forum/posts` | Posts do fórum |
| `GET /api/social/forum/posts/[id]` | Ver post |
| `POST /api/social/forum/posts/[id]/like` | Curtir |
| `GET/POST /api/social/forum/posts/[id]/comments` | Comentários |
| **Grupos** | |
| `POST /api/social/groups/create` | Criar grupo |
| `GET /api/social/groups/me` | Meus grupos |
| `GET /api/social/groups/explore` | Explorar grupos |
| `GET /api/social/groups/[id]` | Detalhes |
| `GET /api/social/groups/[id]/members` | Membros |
| `GET/POST /api/social/groups/[id]/messages` | Mensagens |
| `POST /api/social/groups/[id]/join` | Entrar |
| `POST /api/social/groups/[id]/leave` | Sair |
| **Salas de Oração** | |
| `GET/POST /api/social/prayer-rooms` | Listar/criar salas |
| `GET /api/social/prayer-rooms/[id]` | Ver sala |
| `GET/POST /api/social/prayer-rooms/[id]/messages` | Mensagens |
| `POST /api/social/prayer-rooms/[id]/join` | Entrar |
| `POST /api/social/prayer-rooms/[id]/leave` | Sair |
| **Notificações** | |
| `GET /api/social/notifications` | Listar |
| `POST /api/social/notifications/[id]/mark-read` | Marcar lida |
| `POST /api/social/notifications/mark-all-read` | Marcar todas |
| **Outros** | |
| `POST /api/social/reports` | Denúncias |
| `GET /api/social/users/search` | Buscar usuários |

### Componentes React
- `AppLayout.tsx` — Layout principal (orquestra tudo)
- `ChatInterface.tsx` — Interface de chat com o Pastor
- `Sidebar.tsx` + `MobileMenu` — Sidebar com conversas
- `Header.tsx` — Header com pastor atual
- `Navigation.tsx` — Navegação
- `LoginScreen.tsx` — Tela de login
- `AuthModal.tsx` — Modal de autenticação
- `ProModal.tsx` — Modal de assinatura Pro
- `SubscriptionModal.tsx` — Modal de subscription
- `ProfileModal.tsx` — Modal de perfil
- `TaxProfileModal.tsx` — Modal de dados fiscais (CPF/CNPJ)
- `ComingSoonModal.tsx` — Modal "Em Breve"
- `PixCheckout.tsx` — Checkout PIX
- `RadioWrapper.tsx` — Wrapper da rádio
- `ThemeToggle.tsx` — Toggle dark/light mode
- `UserProfile.tsx` — Componente de perfil

### Lib/Services
- `services/PASTOR_CHAT_SERVICE.ts` — Service principal do chat (Groq)
- `services/audio.ts` — Serviço de áudio
- `services/chat.ts` — Serviço de chat
- `constants/PASTOR_PROMPTS.ts` — System prompts + MBTI instructions (16 tipos!)
- `contexts/RadioContext.tsx` — Context da rádio gospel
- `hooks/useUserProfile.ts` — Hook de perfil
- `lib/personality/*` — Análise MBTI (analyzer, questions, styles)
- `lib/supabase/*` — Clients Supabase (admin, client, server)
- `lib/stripe.ts` — Stripe config
- `lib/gender.ts` — Detecção de gênero
- `lib/safariAudio.ts` — Fix para audio no Safari
- `lib/social-middleware.ts` — Middleware social
- `lib/email/templates.ts` — Templates de email
- `utils/audioCache.ts` — Cache de áudio

---

## 🗄️ Banco de Dados (Supabase/PostgreSQL)

### Tabelas Principais
| Tabela | Função |
|--------|--------|
| `profiles` | Perfis de usuários (nome, avatar, tier, credits, gender, MBTI, is_pro, subscription_end_date, username, bio, city, church_name, is_banned) |
| `conversations` | Sessões de chat |
| `messages` | Mensagens de chat (role: user/assistant) |

### Tabelas Sociais
| Tabela | Função |
|--------|--------|
| `friend_requests` | Pedidos de amizade (pending/accepted/rejected) |
| `friends` | Amizades confirmadas (user1 < user2) |
| `direct_messages` | DMs entre amigos (text/image/audio/prayer) |
| `forum_categories` | 6 categorias: Oração, Testemunhos, Estudos Bíblicos, Dúvidas, Louvor, Comunidade |
| `forum_posts` | Posts do fórum (título, conteúdo, imagem, likes, comments) |
| `forum_comments` | Comentários (com threading via parent_id) |
| `forum_likes` | Likes em posts e comentários |
| `prayer_rooms` | Salas de oração (max 5 membros) |
| `prayer_room_members` | Membros das salas |
| `prayer_room_messages` | Mensagens nas salas (text/prayer_request/system) |
| `social_notifications` | Notificações (friend_request, message, like, comment, room_invite, mention) |
| `reports` | Denúncias (user/post/comment/message/room) |

### Tabelas de Billing
| Tabela | Função |
|--------|--------|
| `billing_tax_profiles` | Dados fiscais (CPF/CNPJ, endereço) |
| `billing_orders` | Pedidos (Stripe/PIX, status, amount) |
| `nfse_documents` | Documentos NFSe (queued/processing/issued/error) |
| `nfse_jobs` | Fila de jobs NFSe (issue/cancel) |
| `email_outbox` | Fila de emails |

### Tabela Rádio
| Tabela | Função |
|--------|--------|
| `songs` | Músicas/jingles (URL R2, category, play_count) |

### Funções RPC
- `are_friends(user_a, user_b)` — Verifica amizade
- `accept_friend_request(request_id)` — Aceita + cria amizade
- `billing_process_payment(...)` — Processa pagamento completo
- `billing_process_refund(...)` — Processa reembolso
- `nfse_claim_job(worker_id)` — Worker pega job NFSe
- `deduct_credits(user_id, amount)` — Deduz créditos
- `increment_play_count(song_id)` — Conta play da música

### RLS (Row Level Security)
- Todas as tabelas têm RLS habilitado
- Usuários só veem seus próprios dados
- Posts do fórum/criar posts → requer `is_pro = true`
- Realtime habilitado para: `direct_messages`, `prayer_room_messages`, `social_notifications`

---

## 💰 Sistema de Monetização

### Plano Free
- Chat com Pastor Elder (limitado por créditos)
- Acesso à rádio
- Leitura do fórum

### Plano Pro (R$ 29,90/mês)
- Chat ilimitado
- DMs
- Criar posts no fórum
- Comentar/curtir
- Salas de oração
- NFSe automática

### Pagamento
- **PIX** via MercadoPago (QR Code)
- **Cartão** via Stripe
- Webhook processa pagamento → atualiza `is_pro` + `subscription_end_date` + gera NFSe

---

## 🤖 IA — Pastor Elder

### Fluxo
1. User envia mensagem
2. API monta system prompt (base + gênero + MBTI)
3. Groq API (Llama 3.3 70B) processa
4. Resposta truncada em 1600 chars
5. Em background: deduz crédito + analisa personalidade MBTI
6. Análise MBTI acumula scores ao longo do tempo (EI/SN/TF/JP)

### Personalidade Adaptativa
- 16 estilos MBTI diferentes (INFP, INTJ, ENFJ, etc.)
- Cada tipo recebe tom, conteúdo e abordagem diferentes
- Análise progressiva: cada mensagem contribui -0.3 a +0.3 por eixo
- Quando confiança alta, aplica estilo automaticamente

### Fases do Atendimento
1. Acolhimento → 2. Descoberta → 3. Teste MBTI natural → 4. Terapia personalizada → 5. Encerramento

---

## 📻 Rádio Gospia
- Player de música gospel
- Músicas armazenadas no Cloudflare R2
- Jingles intercalados (não permite skip durante jingle)
- Controle de volume, seek, next
- Contagem de plays

---

## 📄 NFSe Worker (Serviço Separado)
- Worker Node.js/TypeScript
- Emite NFSe automaticamente após pagamento
- Usa certificado PFX para assinar XML
- Integra com API nacional de NFSe
- Fila de jobs (pending → processing → completed/failed)
- Envia email com PDF da nota

---

## 🚀 Deploy
- **Frontend**: Vercel (Next.js)
- **Banco**: Supabase Cloud
- **Músicas**: Cloudflare R2
- **NFSe Worker**: Precisa deploy separado (possivelmente Railway ou similar)
- nixpacks.toml presente mas parece ser resquício

---

## 📝 Git History (Últimos commits)
```
d06d223 Add moderation api
dfca622 Dont show jingle
014e3fc Fix jingle skip
65c267e Vinhetas Radio gospia
8cd3713 Radio gospia
cea6fb5 Radio gospia
0266a7a play store badge
c8c5031 Schemas SQL
39880fc feat: complete social backend implementation
d52eda1 rede social 2
39f1be9 Rede social Friends
ba4b674 correct 4
7b7a305 correct 2
e9c7f51 Corrected
192dc09 Implementacao rede social
```

---

## ⚠️ Observações para Modificações

1. **Supabase credentials** — precisa das chaves do projeto Supabase existente
2. **Groq API** — precisa de API key válida
3. **MercadoPago** — token de produção configurado
4. **Stripe** — secret key + webhook secret + price ID
5. **RLS** — cuidado ao alterar, segurança depende disso
6. **NFSe** — certificado PFX real presente no worker (sensível!)
7. **2 versões** — `aplicativo_gospia_1.0` (versão antiga) e `Appgospia` (versão atual/completa)
8. **Fórum/Social restrito a PRO** — as policies do RLS verificam `is_pro = true`

---

## 📱 APP MOBILE (React Native / Expo)

### Dados Técnicos
- **Framework**: React Native + Expo SDK 52
- **Package**: `app.gospia.mobile`
- **Versão**: 2.0.0 (versionCode 19)
- **Instalado**: 22/01/2026, última atualização 28/01/2026
- **APK**: 34MB (~2.2MB JS bundle)
- **Bundle ID iOS**: `app.gospia.mobile`
- **EAS Project**: `a9ffc1de-c522-4b03-9c12-f911b700b126`
- **Owner Expo**: `titanio`

### Supabase
- URL: `https://tlvsajdsertkbkwmfxkf.supabase.co`

### APIs usadas no app
- Groq: `api.groq.com/openai/v1/chat/completions` + `/audio/transcription`
- ElevenLabs: `api.elevenlabs.io/v1/text-to-speech/JXi4NKtAyD89KaHCKIGWe`
- Jitsi Meet: `meet.jit.si` (video calls)
- Backend: `www.gospia.app/api/*` (moderate, share, payment, etc.)

### Conta logada no Motorola
- **Nome**: Contact Support
- **Email**: contact@titaniofilms.com
- **Tier**: PRO
- **Créditos**: 740
- **Amigos**: 2
- **Status**: "A paz de Deus"

### Telas do App (4 tabs)
1. **Inicio**: Versículo do Dia, 4 cards (Oração do Dia, Versículo, Desabafar, Dúvida Bíblica), botão "Iniciar Conversa"
2. **Conversar**: Chat com Pastor Elder (PRO - Ilimitado), botões Ouvir (TTS) e Compartilhar, input de voz (microfone)
3. **Comunidade**: Perfil do usuário, Acesso Rápido (Feed, Amigos, Mensagens, Forum, Buscar, Alertas), Feed de Fotos com likes, "Publicar Foto", "Em Alta no Forum"
4. **Perfil**: Avatar, nome, email, badge PRO, créditos, toggle Versículo Diário, Gerenciar Assinatura, Sair

### Permissões Android
- RECORD_AUDIO (mensagens de voz/Whisper)
- INTERNET
- ACCESS_NETWORK_STATE
- MODIFY_AUDIO_SETTINGS

---

## 🔀 DIFERENÇAS: WEB vs APP MOBILE

| Feature | Web (Next.js) | App (React Native) |
|---------|--------------|-------------------|
| **Framework** | Next.js 16 + React 19 | React Native + Expo SDK 52 |
| **Deploy** | Vercel | Play Store (EAS Build) |
| **Auth** | Google OAuth (Supabase) | Google OAuth (Supabase) |
| **Chat** | Via API route server-side | Via API route (www.gospia.app) |
| **TTS** | Web Speech API + ElevenLabs | ElevenLabs direto |
| **STT** | Web Speech API (browser) | expo-av + Groq Whisper API |
| **Rádio** | Página /radiogospia (browser) | Não visível nas telas |
| **Video Calls** | Não implementado | Jitsi Meet |
| **Navegação** | Sidebar + modais | Bottom tabs (4) |
| **Tema** | Dark/Light mode (Tailwind) | Tema fixo (azul/branco) |
| **Sidebar** | Histórico de conversas | Não tem sidebar |
| **Home** | Direto no chat | Tela com versículo + ações rápidas |
| **Social** | API routes prontas mas UI limitada | Comunidade completa (Feed de Fotos, Forum, Amigos, DMs) |
| **NFSe** | Worker separado + modal | Gerenciar Assinatura |
| **Fotos** | Não tem feed de fotos | Feed de Fotos com likes + publicar |
| **Pagamento** | Stripe + PIX na web | Via www.gospia.app (web) |

### Pontos de Atenção para Modificações
1. **Código fonte do app mobile NÃO está no backup** — precisa do projeto Expo original
2. **O bundle JS é compilado** — não dá pra editar diretamente, precisa do source
3. **APIs compartilhadas** — web e app usam as mesmas APIs em `www.gospia.app`
4. **Supabase é compartilhado** — mesmo banco pra web e app
5. **Mudar API = afeta ambos** — cuidado ao alterar endpoints
6. **App tem features exclusivas** — video calls (Jitsi), fotos, que o web não tem
7. **Web tem features exclusivas** — Rádio, dark mode, sidebar de histórico
