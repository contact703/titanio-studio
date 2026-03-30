# 🚀 GOSPIA - GUIA MASTER COMPLETO

> **Documento de referência completo para o projeto Gospia**
> **Última atualização:** 29 de Janeiro de 2026
> **Versão do App:** 2.1.0 (versionCode 24)
> **Status:** ✅ Aprovado na Play Store

---

## 📋 ÍNDICE

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)
4. [Funcionalidades Implementadas](#4-funcionalidades-implementadas)
5. [Configuração do Ambiente](#5-configuração-do-ambiente)
6. [Banco de Dados (Supabase)](#6-banco-de-dados-supabase)
7. [Sistema Social Completo](#7-sistema-social-completo)
8. [Build e Deploy](#8-build-e-deploy)
9. [Requisitos Play Store 2025/2026](#9-requisitos-play-store-20252026)
10. [Solução do Erro 16KB](#10-solução-do-erro-16kb)
11. [Credenciais e Senhas](#11-credenciais-e-senhas)
12. [Troubleshooting](#12-troubleshooting)
13. [Checklist de Publicação](#13-checklist-de-publicação)

---

## 1. Visão Geral do Projeto

### O que é o Gospia?

Gospia é um aplicativo mobile de comunidade cristã com:
- **Chat com IA** (Pastor Gospia) - Orientação espiritual via Groq
- **Rede Social** - Feed, posts, likes, comentários
- **Fórum** - Discussões por categorias
- **Sistema de Amizades** - Seguir, amigos bilaterais
- **Notificações** - Curtidas e comentários
- **Sistema PRO** - Assinatura premium

### Dados do App

| Item | Valor |
|------|-------|
| **Nome** | Gospia |
| **Package** | app.gospia.mobile |
| **Versão Atual** | 2.1.0 |
| **versionCode** | 24 |
| **Play Store** | Publicado |

---

## 2. Stack Tecnológico

### Frontend (Mobile)

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React Native** | 0.79.6 | Framework mobile |
| **Expo** | 53.0.0 | Toolchain |
| **TypeScript** | 5.8.3 | Linguagem |
| **React Navigation** | 6.x | Navegação |

### Backend

| Tecnologia | Uso |
|------------|-----|
| **Supabase** | Auth, Database, Storage |
| **Groq** | IA (Chat) - Whisper + LLaMA |
| **ElevenLabs** | TTS (Text-to-Speech) |
| **Vercel** | API Backend |

### Configurações Android

| Item | Valor |
|------|-------|
| **compileSdkVersion** | 35 |
| **targetSdkVersion** | 35 |
| **minSdkVersion** | 24 |
| **buildToolsVersion** | 35.0.0 |
| **ndkVersion** | 27.1.12297006 |

---

## 3. Estrutura do Projeto

```
gospia-mobile-app/
├── android/                    # Código nativo Android
├── assets/                     # Imagens e ícones
├── src/
│   ├── components/
│   │   └── social/            # Componentes do sistema social
│   │       ├── UIComponents.tsx
│   │       └── ReportButton.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx    # Contexto de autenticação
│   ├── lib/
│   │   └── supabase.ts        # Cliente Supabase
│   ├── screens/
│   │   ├── social/            # Telas do sistema social
│   │   │   ├── SocialHomeScreen.tsx
│   │   │   ├── FeedScreen.tsx
│   │   │   ├── ForumHomeScreen.tsx
│   │   │   ├── ForumPostScreen.tsx
│   │   │   ├── PostDetailScreen.tsx
│   │   │   ├── UserProfileScreen.tsx
│   │   │   ├── CreateFeedPostScreen.tsx
│   │   │   ├── CreateForumPostScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   └── ChatScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ChatPastorScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── UpgradeScreen.tsx
│   └── services/
│       ├── social/
│       │   ├── feed.ts        # Lógica do Feed
│       │   ├── forum.ts       # Lógica do Fórum
│       │   ├── friends.ts     # Sistema de amizades
│       │   └── notifications.ts # Notificações
│       └── pushNotifications.ts # Push notifications
├── app.json                   # Configuração Expo
├── App.tsx                    # Entry point
├── package.json               # Dependências
└── .env                       # Variáveis de ambiente
```

---

## 4. Funcionalidades Implementadas

### 4.1 Sistema de Chat com IA

- ✅ Chat com Pastor Gospia (Groq LLaMA)
- ✅ Gravação de áudio (Whisper STT)
- ✅ Ouvir resposta (ElevenLabs TTS)
- ✅ Compartilhar mensagens
- ✅ Sistema de créditos

### 4.2 Sistema Social - Feed

- ✅ Criar posts com imagem
- ✅ Curtir posts (❤️)
- ✅ Comentar em posts
- ✅ Deletar próprios posts/comentários
- ✅ Algoritmo de relevância
- ✅ Pull-to-refresh
- ✅ Infinite scroll

### 4.3 Sistema Social - Fórum

- ✅ Categorias (Oração, Testemunho, Estudo, Dúvidas, Louvor, Geral)
- ✅ Criar posts no fórum
- ✅ Comentar em posts
- ✅ Curtir posts e comentários
- ✅ Deletar próprios posts/comentários
- ✅ Filtrar por categoria

### 4.4 Sistema de Amizades

- ✅ Seguir usuários
- ✅ Amigos bilaterais (quando ambos se seguem)
- ✅ Contagem de amigos no perfil
- ✅ Lista de amigos

### 4.5 Notificações

- ✅ Notificação de curtida (feed e fórum)
- ✅ Notificação de comentário (feed e fórum)
- ✅ Roteamento correto (feed → PostDetail, forum → ForumPost)
- ✅ Contador de não lidas
- ✅ Marcar como lida

### 4.6 Perfis

- ✅ Visualizar perfil de outros usuários
- ✅ Mostrar posts do usuário
- ✅ Botão de chat direto
- ✅ Badge PRO
- ✅ Contagem de amigos

---

## 5. Configuração do Ambiente

### 5.1 Pré-requisitos

```bash
# Node.js 20+
node -v  # v20.x.x

# npm
npm -v

# Android Studio com SDK 35
# NDK 27.1.12297006
```

### 5.2 Instalação

```bash
# Clonar/copiar projeto
cd C:\Users\Eduardo\Appgospia\gospia-mobile-app

# Instalar dependências
npm install --legacy-peer-deps

# Criar arquivo .env
```

### 5.3 Arquivo .env

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
EXPO_PUBLIC_GROQ_API_KEY=sua-groq-key
EXPO_PUBLIC_ELEVEN_API_KEY=sua-eleven-key
EXPO_PUBLIC_API_URL=https://seu-backend.vercel.app
```

### 5.4 Rodar em Desenvolvimento

```bash
# Prebuild Android
npx expo prebuild --platform android --clean

# Rodar no emulador/dispositivo
npx expo run:android
```

---

## 6. Banco de Dados (Supabase)

### 6.1 Tabelas Principais

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  church TEXT,
  city TEXT,
  state TEXT,
  personality_type TEXT,
  is_pro BOOLEAN DEFAULT false,
  credits INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### feed_posts
```sql
CREATE TABLE feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id),
  image_url TEXT NOT NULL,
  caption TEXT,
  location TEXT,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### feed_likes / feed_comments
```sql
CREATE TABLE feed_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### forum_posts / forum_likes / forum_comments
```sql
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'geral',
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### follows (Sistema de Amizades)
```sql
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

#### social_notifications
```sql
CREATE TABLE social_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.2 RPC Functions

```sql
-- Incrementar/Decrementar likes do feed
CREATE OR REPLACE FUNCTION increment_feed_likes(post_id UUID)
RETURNS void AS $$
  UPDATE feed_posts SET like_count = GREATEST(0, like_count + 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_feed_likes(post_id UUID)
RETURNS void AS $$
  UPDATE feed_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL;

-- Incrementar/Decrementar comments do feed
CREATE OR REPLACE FUNCTION increment_feed_comments(post_id UUID)
RETURNS void AS $$
  UPDATE feed_posts SET comment_count = GREATEST(0, comment_count + 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_feed_comments(post_id UUID)
RETURNS void AS $$
  UPDATE feed_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL;

-- Forum likes/comments (mesma lógica)
CREATE OR REPLACE FUNCTION increment_forum_likes(post_id UUID)
RETURNS void AS $$
  UPDATE forum_posts SET like_count = GREATEST(0, like_count + 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_forum_likes(post_id UUID)
RETURNS void AS $$
  UPDATE forum_posts SET like_count = GREATEST(0, like_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION increment_forum_comments(post_id UUID)
RETURNS void AS $$
  UPDATE forum_posts SET comment_count = GREATEST(0, comment_count + 1) WHERE id = post_id;
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION decrement_forum_comments(post_id UUID)
RETURNS void AS $$
  UPDATE forum_posts SET comment_count = GREATEST(0, comment_count - 1) WHERE id = post_id;
$$ LANGUAGE SQL;
```

### 6.3 RLS Policies

```sql
-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Feed Posts
CREATE POLICY "Anyone can view feed posts" ON feed_posts
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Authenticated users can create posts" ON feed_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts" ON feed_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Feed Likes
CREATE POLICY "Anyone can view likes" ON feed_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can like" ON feed_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON feed_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Feed Comments
CREATE POLICY "Anyone can view comments" ON feed_comments
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Authenticated can comment" ON feed_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments" ON feed_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Forum (mesmas policies)
CREATE POLICY "Anyone can view forum posts" ON forum_posts
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Authenticated can create forum posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own forum posts" ON forum_posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own forum comments" ON forum_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Follows
CREATE POLICY "Anyone can view follows" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Authenticated can follow" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- Notifications
CREATE POLICY "Users can view own notifications" ON social_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can create notifications" ON social_notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON social_notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 7. Sistema Social Completo

### 7.1 Arquitetura do Feed

```
FeedScreen.tsx
    │
    ├── loadFeed() → getFeed() [feed.ts]
    │       │
    │       ├── Busca posts do Supabase
    │       ├── Carrega author de cada post
    │       ├── Calcula relevance_score
    │       ├── Ordena por relevância
    │       └── Retorna posts com user_liked
    │
    ├── handleLike() → toggleLike() [feed.ts]
    │       │
    │       ├── Verifica se já curtiu
    │       ├── INSERT ou DELETE em feed_likes
    │       ├── Chama RPC increment/decrement
    │       └── Cria notificação [pushNotifications.ts]
    │
    └── renderPost()
            │
            ├── Avatar do autor
            ├── Nome + Badge PRO
            ├── Imagem do post
            ├── Botão de curtir
            ├── Contagem de likes
            └── Link para comentários
```

### 7.2 Algoritmo de Relevância

```typescript
function calculateRelevanceScore(post, currentUser, followingIds): number {
  let score = 0;
  
  // Base: likes (max 30 pontos)
  score += Math.min(post.like_count * 2, 30);
  
  // Recência (max 20 pontos)
  const hoursAgo = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 1) score += 20;
  else if (hoursAgo < 6) score += 15;
  else if (hoursAgo < 24) score += 10;
  else if (hoursAgo < 72) score += 5;
  
  // Segue o autor (25 pontos)
  if (followingIds.has(post.author_id)) score += 25;
  
  // Mesma igreja (15 pontos)
  if (currentUser?.church === post.author?.church) score += 15;
  
  // Mesma cidade (10 pontos)
  if (currentUser?.city === post.author?.city) score += 10;
  
  // Mesmo estado (5 pontos)
  if (currentUser?.state === post.author?.state) score += 5;
  
  // Personalidade compatível (10 pontos)
  // ... lógica de compatibilidade
  
  // Autor PRO (5 pontos)
  if (post.author?.is_pro) score += 5;
  
  return score;
}
```

### 7.3 Sistema de Notificações

```typescript
// pushNotifications.ts

export async function createLikeNotification(
  postOwnerId: string,
  likerName: string,
  postId: string,
  source: 'feed' | 'forum' = 'feed'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === postOwnerId) return;
  
  await supabase.from('social_notifications').insert({
    user_id: postOwnerId,
    type: 'post_like',
    title: 'Nova curtida',
    body: `${likerName} curtiu sua publicação`,
    data: { postId, source }
  });
}

export async function createCommentNotification(
  postOwnerId: string,
  commenterName: string,
  postId: string,
  commentPreview: string,
  source: 'feed' | 'forum' = 'feed'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id === postOwnerId) return;
  
  await supabase.from('social_notifications').insert({
    user_id: postOwnerId,
    type: 'post_comment',
    title: 'Novo comentário',
    body: `${commenterName}: ${commentPreview.substring(0, 50)}...`,
    data: { postId, source }
  });
}
```

### 7.4 Roteamento de Notificações

```typescript
// notifications.ts

export function getNotificationRoute(notif: SocialNotification) {
  switch (notif.type) {
    case 'post_like':
    case 'post_comment':
      if (notif.data?.postId) {
        if (notif.data?.source === 'forum') {
          return { screen: 'ForumPost', params: { postId: notif.data.postId } };
        } else {
          return { screen: 'PostDetail', params: { postId: notif.data.postId } };
        }
      }
      return null;
    case 'new_follower':
      if (notif.data?.oderId) {
        return { screen: 'UserProfile', params: { userId: notif.data.followerId } };
      }
      return null;
    default:
      return null;
  }
}
```

---

## 8. Build e Deploy

### 8.1 Build de Desenvolvimento (APK Debug)

```bash
cd C:\Users\Eduardo\Appgospia\gospia-mobile-app

# Prebuild
npx expo prebuild --platform android --clean

# Build APK
cd android
.\gradlew assembleRelease

# Instalar no dispositivo
& "C:\Users\Eduardo\AppData\Local\Android\Sdk\platform-tools\adb.exe" install -r ".\app\build\outputs\apk\release\app-release.apk"
```

### 8.2 Build de Produção (AAB)

#### No Android Studio:

1. **File** → **Open** → `C:\Users\Eduardo\Appgospia\gospia-mobile-app\android`
2. **File** → **Sync Project with Gradle Files**
3. **Build** → **Clean Project**
4. **Build** → **Generate Signed Bundle / APK**
5. Selecionar **Android App Bundle**
6. Configurar keystore:
   - Path: `C:\Users\Eduardo\Appgospia\gospia-keystore.jks`
   - Senha: `160679`
   - Alias: `gospia`
   - Key password: `160679`
7. Build variant: **release**
8. **Create**

#### Arquivo gerado:
`android/app/build/outputs/bundle/release/app-release.aab`

### 8.3 Upload na Play Console

1. Acessa: https://play.google.com/console
2. Seleciona **Gospia**
3. **Test and release** → **Production**
4. **Create new release**
5. Upload do arquivo `.aab`
6. Adicionar release notes
7. **Review release** → **Start rollout to Production**

---

## 9. Requisitos Play Store 2025/2026

### 9.1 Requisitos Obrigatórios

| Requisito | Prazo | Status Gospia |
|-----------|-------|---------------|
| **targetSdkVersion 35** | 31 Ago 2025 | ✅ 35 |
| **16KB Page Size** | 1 Nov 2025 | ✅ Resolvido |
| **AAB Format** | Obrigatório | ✅ Usando |
| **Privacy Policy** | Sempre | ✅ Configurado |
| **Data Safety** | Sempre | ✅ Preenchido |

### 9.2 Versões Mínimas para 16KB

| Componente | Mínimo | Gospia |
|------------|--------|--------|
| **React Native** | 0.77+ | ✅ 0.79.6 |
| **Expo SDK** | 53+ | ✅ 53.0.0 |
| **NDK** | r27+ | ✅ 27.1.12297006 |
| **Gradle** | 8.4+ | ✅ 8.10.2 |

---

## 10. Solução do Erro 16KB

### 10.1 O Problema

A Play Store passou a exigir suporte a 16KB page size para apps Android 15+. Apps com bibliotecas nativas compiladas com 4KB não são aceitos.

### 10.2 Erro que Aparecia

```
Error: Your app does not support 16 KB memory page sizes.
```

### 10.3 A Solução

**O problema era que Expo 52 + React Native 0.76.9 tinham bibliotecas nativas compiladas com 4KB.**

#### Passo a passo da solução:

```bash
# 1. Backup
Copy-Item package.json package.json.backup

# 2. Upgrade Expo para 53
npx expo install expo@^53.0.0

# 3. Corrigir dependências
npm install --legacy-peer-deps
npx expo install --fix -- --legacy-peer-deps

# 4. Verificar versões
# Expo: 53.0.0
# React Native: 0.79.6

# 5. Prebuild limpo
npx expo prebuild --platform android --clean

# 6. Build no Android Studio
```

### 10.4 Configurações que NÃO funcionaram sozinhas

Estas configurações **NÃO resolvem** se a versão do React Native for antiga:

- `useLegacyPackaging = true`
- `extractNativeLibs = true`
- `ndkVersion = "27.1.12297006"`

**A única solução real é atualizar para React Native 0.77+ (preferencialmente 0.79+).**

### 10.5 app.json Final

```json
{
  "expo": {
    "name": "Gospia",
    "slug": "gospia-mobile-app",
    "version": "2.1.0",
    "android": {
      "package": "app.gospia.mobile",
      "versionCode": 24
    },
    "plugins": [
      ["expo-av", { "microphonePermission": "..." }],
      ["expo-build-properties", {
        "android": {
          "compileSdkVersion": 35,
          "targetSdkVersion": 35,
          "buildToolsVersion": "35.0.0",
          "ndkVersion": "27.1.12297006"
        }
      }],
      "expo-font",
      "expo-asset"
    ]
  }
}
```

---

## 11. Credenciais e Senhas

### 11.1 Keystore Android

| Item | Valor |
|------|-------|
| **Arquivo** | `C:\Users\Eduardo\Appgospia\gospia-keystore.jks` |
| **Senha** | `160679` |
| **Alias** | `gospia` |
| **Key Password** | `160679` |

⚠️ **IMPORTANTE:** Guarde a keystore em local seguro! Sem ela não é possível atualizar o app na Play Store.

### 11.2 Supabase

- **URL:** Configurado no `.env`
- **Anon Key:** Configurado no `.env`

### 11.3 APIs

- **Groq API:** Configurado no `.env`
- **ElevenLabs:** Configurado no `.env`

---

## 12. Troubleshooting

### 12.1 Erro: "16KB page size not supported"

**Solução:** Upgrade para Expo 53+ e React Native 0.79+

### 12.2 Erro: "versionCode already used"

**Solução:** Incrementar versionCode no app.json e rebuild

### 12.3 Erro: "Invalid login credentials" (Play Console)

**Solução:** Configurar conta de teste no Supabase (auto-confirm)

### 12.4 Erro: Build demora muito

**Normal** após upgrade de versão. Primeira build pode levar 15-30 minutos.

### 12.5 Erro: Dependências incompatíveis

**Solução:** Usar `--legacy-peer-deps` no npm install

### 12.6 Erro: Autor não aparece no Feed

**Solução:** Garantir que o map preserva o author:
```typescript
return posts.map(p => ({ ...p, author: p.author, user_liked: ... }));
```

---

## 13. Checklist de Publicação

### 13.1 Antes de Buildar

- [ ] Incrementar `versionCode` no app.json
- [ ] Verificar `.env` com variáveis corretas
- [ ] Rodar `npx expo prebuild --platform android --clean`
- [ ] Verificar targetSdkVersion = 35

### 13.2 No Android Studio

- [ ] Sync Project with Gradle Files
- [ ] Build → Clean Project
- [ ] Generate Signed Bundle (AAB)
- [ ] Usar keystore correta

### 13.3 Na Play Console

- [ ] Upload do AAB
- [ ] Verificar se não há erros (16KB, etc)
- [ ] Adicionar release notes
- [ ] Review release
- [ ] Start rollout

### 13.4 Após Publicação

- [ ] Aguardar aprovação (1-24h para updates)
- [ ] Testar no dispositivo após disponível
- [ ] Monitorar crashes no Play Console

---

## 📌 Comandos Rápidos

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Prebuild
npx expo prebuild --platform android --clean

# Build APK debug
cd android && .\gradlew assembleRelease

# Instalar APK
adb install -r .\app\build\outputs\apk\release\app-release.apk

# Verificar versões
Get-Content package.json | Select-String '"expo"|"react-native"'
Get-Content android\app\build.gradle | Select-String "versionCode"
```

---

## 🏆 Histórico de Versões

| Versão | versionCode | Data | Mudanças |
|--------|-------------|------|----------|
| 2.1.0 | 24 | 29/01/2026 | 16KB fix, Expo 53, RN 0.79.6 |
| 2.0.0 | 18-23 | Jan/2026 | Sistema social completo |
| 1.x | 1-17 | Dez/2025 | Versões iniciais |

---

**Documento criado em:** 29 de Janeiro de 2026
**Autor:** Desenvolvimento Gospia
**Status:** ✅ App aprovado e publicado na Play Store

