# Relatório de Testes - App Gospia (Moto G35)
**Data:** 2026-03-02 10:10
**Dispositivo:** Motorola Moto G35 5G (ZF525B2CW4)
**App Version:** 2.2.0 (versionCode 25)

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. BUILD DEBUG (Bloqueante)
**Status:** 🔴 CRÍTICO

O app instalado é um **build de DEBUG**, não RELEASE. Isso significa:
- Tenta conectar no Metro bundler em `localhost:8081` (servidor de desenvolvimento)
- Quando não encontra o Metro, mostra tela vermelha de erro: "Unable to load script"
- O JavaScript não está empacotado no APK — precisa do servidor de dev rodando

**Evidência:**
```
flags=[ DEBUGGABLE HAS_CODE ... ]
```

**Solução:** Gerar build de produção:
```bash
cd gospia-mobile-app
npx expo prebuild --platform android
cd android
./gradlew assembleRelease  # ou bundleRelease pra Play Store
```

---

### 2. FIREBASE/PUSH NOTIFICATIONS (Alto)
**Status:** 🟡 NÃO FUNCIONA

**Erro no logcat:**
```
Erro ao registrar push: [Error: Make sure to complete the guide at 
https://docs.expo.dev/push-notifications/fcm-credentials/ : 
Default FirebaseApp is not initialized in this process app.gospia.mobile. 
Make sure to call FirebaseApp.initializeApp(Context) first.]
code: 'E_REGISTRATION_FAILED'
```

**Causa:** O arquivo `google-services.json` está com valores placeholder:
```json
{
  "project_number": "000000000000",
  "mobilesdk_app_id": "1:000000000000:android:0000000000000000",
  "api_key": [{ "current_key": "placeholder" }]
}
```

**Solução:**
1. Entrar em https://console.firebase.google.com
2. Criar/acessar projeto "gospia-mobile"
3. Adicionar app Android → package: `app.gospia.mobile`
4. Baixar `google-services.json` REAL
5. Substituir no projeto: `gospia-mobile-app/google-services.json`
6. Adicionar plugin no `app.json`:
```json
"plugins": [
  ["expo-notifications", { "icon": "./assets/notification-icon.png" }],
  "@react-native-firebase/app"
]
```

---

### 3. FUNCIONALIDADES NÃO TESTADAS (Pendente)
Devido ao build de debug crashar, não foi possível testar completamente:

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Chat Texto | ⚠️ Parcial | Tela apareceu inicialmente, mas app crashou depois |
| Modo Voz | ⚠️ Não testado | Código existe (Whisper → ElevenLabs), mas não validado |
| Rádio Gospia | ⚠️ Não testado | Botão na Home, não foi possível acessar |
| Comunidade | ⚠️ Não testado | Aba existe, não acessível |
| Perfil | ⚠️ Parcial | Mostrou créditos (739), toggle de notificações OFF |

---

## ✅ O QUE FUNCIONA

1. **App instala e abre** (mesmo com build debug)
2. **Interface básica renderiza** quando Metro tá disponível
3. **Autenticação** parece estar funcionando (usuário "Contact Support" logado)
4. **Créditos PRO** mostrando 739 créditos

---

## 📋 CHECKLIST PARA PRÓXIMO BUILD

- [ ] Gerar **build RELEASE** (não debug)
- [ ] Substituir `google-services.json` com credenciais reais do Firebase
- [ ] Verificar se Expo Push Notifications está configurado com projectId correto
- [ ] Testar fluxo completo: Home → Chat texto → Chat voz → Rádio → Comunidade
- [ ] Validar integração Supabase (radio, mensagens)
- [ ] Testar ElevenLabs TTS no modo voz

---

## 🛠️ COMANDOS ÚTEIS PRO EDUARDO

```bash
# 1. Instalar dependências
cd ~/Desktop/edu/gospia/gospia-mobile-app
npm install

# 2. Prebuild Android
npx expo prebuild --platform android --clean

# 3. Build Release
npx expo run:android --variant release

# OU manual:
cd android
./gradlew assembleRelease
# APK gerado em: android/app/build/outputs/apk/release/app-release.apk
```

---

**Resumo:** O app precisa de um build de produção e configuração Firebase real antes de poder ser testado/end-to-end.
