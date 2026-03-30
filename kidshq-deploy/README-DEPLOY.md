# 🚀 KidsHQ - Status do Deploy (05/03/2026)

## ✅ O QUE FOI FEITO

### 1. Bug {{name}} Corrigido ✅
- **Arquivos:** `pt-BR.json` e `en.json`
- **Mudança:** `"Olá, {{name}}!"` → `"Olá, %{name}!"`
- **Commit:** `dcbaf39`
- **Status:** No GitHub ✅

### 2. Java Instalado ✅
- **Versão:** OpenJDK 17
- **Local:** `/opt/homebrew/opt/openjdk@17`
- **Status:** Configurado no PATH ✅

### 3. Prebuild do App ✅
- **Comando:** `npx expo prebuild --platform android`
- **Status:** Concluído ✅
- **Resultado:** Pasta `/android` gerada

### 4. Política de Privacidade Criada ✅
- **Arquivo:** `privacy-policy-kidshq.html`
- **Local:** `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/kidshq-deploy/`
- **Status:** Pronta para publicar ⚠️

---

## ❌ O QUE FALTA / BLOQUEIOS

### 1. Build do App (AAB) ❌
**Erro:** `SDK location not found. Define ANDROID_HOME`

**Causa:** Android SDK não instalado no Mac

**Solução:**
```bash
# Opção 1: Instalar Android Studio no Mac
# Opção 2: Fazer build no Windows (recomendado)
# Opção 3: Usar EAS Build (Expo) - precisa login
```

### 2. Backend - Rotas 404 ❌
**Problema:** Endpoints retornam 404
- `/api/auth/login` → 404
- `/api/auth/register` → 404

**URL:** `https://api-production-adc6.up.railway.app`

**Causa provável:** Deploy do Railway não atualizou

**Solução:**
1. Acessar https://railway.app
2. Projeto: `KidsHQ`
3. Ir em Deployments → Redeploy
4. Ou fazer commit vazio: `git commit --allow-empty -m "trigger deploy" && git push`

### 3. Política de Privacidade Publicada ❌
**Precisa publicar em:** `https://titaniofilms.com/kids/privacy-policy`

**Arquivo pronto:** `kidshq-deploy/privacy-policy.html`

---

## 📋 CHECKLIST FINAL PARA PLAY STORE

- [ ] Corrigir deploy do backend (Railway)
- [ ] Build do app HQ (Android Studio Windows ou EAS)
- [ ] Build do app Kids (já tem AAB pronto?)
- [ ] Publicar política de privacidade no site
- [ ] Testar end-to-end:
  - [ ] Criar conta pai
  - [ ] Adicionar filho
  - [ ] Vincular dispositivo
  - [ ] Ver dados em tempo real
- [ ] Subir AABs na Play Store
- [ ] Preencher formulários da Play Store

---

## 🔧 COMANDOS ÚTEIS

### Verificar Backend
```bash
curl https://api-production-adc6.up.railway.app/health
curl https://api-production-adc6.up.railway.app/api/auth/register \
  -X POST -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456"}'
```

### Build Local (Mac - se tiver Android SDK)
```bash
cd /Volumes/TITA_039/backup-projetos/KidsHQ/kidshq-hq/android
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=/Users/seuusuario/Library/Android/sdk
./gradlew bundleRelease
```

### Forçar Deploy Railway
```bash
cd /Volumes/TITA_039/backup-projetos/KidsHQ
git commit --allow-empty -m "trigger: rebuild"
git push origin main
```

---

## 📂 LOCAIS IMPORTANTES

```
/Volumes/TITA_039/backup-projetos/KidsHQ/          ← Código fonte
/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/kidshq-deploy/  ← Arquivos para deploy
/tmp/openclaw/uploads/                             ← AABs prontos (se existirem)
```

---

## ⚠️ PRIORIDADES

1. **🔴 CRÍTICO:** Corrigir backend (rotas 404)
2. **🔴 CRÍTICO:** Publicar política de privacidade
3. **🟡 ALTO:** Fazer build do app HQ
4. **🟡 ALTO:** Testar end-to-end
5. **🟢 MÉDIO:** Subir na Play Store

---

## 🆘 SUPORTE

**Problemas técnicos:**
- Backend: Verificar Railway dashboard
- Build: Instalar Android Studio ou usar Windows
- Deploy: Usar EAS (Expo) com login

---

*Atualizado em: 05/03/2026 - 14:00*
*Por: Tita 🤖*
