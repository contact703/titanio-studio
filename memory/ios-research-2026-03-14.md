# Pesquisa iOS Dev — 14/03/2026 19:13

## React Native para iOS — Fundamentos 2025
## React Native para iOS — 2025

### 1. Setup — Xcode + Simulador

```bash
# Instalar Xcode via App Store (necessário, ~15GB)
# Depois:
sudo xcode-select --install
sudo xcodebuild -runFirstLaunch

# CocoaPods (gerenciador de dependências iOS)
sudo gem install cocoapods
# ou via Homebrew (preferido no M1/M2):
brew install cocoapods

# Criar projeto com Expo (recomendado 2025)
npx create-expo-app@latest MeuApp --template
cd MeuApp

# Rodar no simulador
npx expo run:ios

# Listar simuladores disponíveis
xcrun simctl list devices
# Rodar em dispositivo específico
npx expo run:ios --device "iPhone 15 Pro"
```

**Abrir Simulator manualmente:**
```bash
open -a Simulator
# Ou dentro do Xcode: Xcode → Open Developer Tool → Simulator
```

---

### 2. Estrutura de Projeto (Expo Router)

```
MeuApp/
├── app/                      ← rotas (file-based routing)
│   ├── _layout.tsx           ← root layout, providers globais
│   ├── index.tsx             ← tela "/" (home)
│   ├── (tabs)/               ← grupo de tabs
│   │   ├── _layout.tsx       ← configuração das tabs
│   │   ├── index.tsx         ← tab 1
│   │   └── perfil.tsx        ← tab 2
│   └── [id].tsx              ← rota dinâmica
├── components/               ← componentes reutilizáveis
├── hooks/                    ← custom hooks
├── assets/                   ← imagens, fontes
├── ios/                      ← código nativo iOS (gerado)
│   ├── MeuApp.xcworkspace    ← abrir no Xcode
│   └── MeuApp/
│       └── Info.plist        ← permissões e configurações
├── android/                  ← código nativo Android
├── app.json                  ← configuração Expo
└── babel.config.js
```

---

### 3. iOS vs Android — Diferenças Críticas no RN

| Aspecto | iOS | Android |
|---|---|---|
| **Safe area** | Notch/Dynamic Island/Home indicator obrigatório | Menos crítico |
| **Teclado** | Comportamento diferente — usar `KeyboardAvoidingView behavior="padding"` | `behavior="height"` |
| **Sombras** | `shadow*` props | `elevation` |
| **Fontes** | SF Pro nativa | Roboto |
| **Status bar** | Estilo claro/escuro, não cor de fundo | Cor de fundo configurável |
| **Permissões** | Obrigatório `Info.plist` + runtime request | `AndroidManifest.xml` |
| **Back button** | Não existe (swipe gesture) | Botão físico/virtual |
| **Deep links** | URL Schemes + Universal Links | Intent Filters + App Links |
| **Push** | APNs (Apple Push Notification service) | FCM |

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    // Sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Sombra Android
    elevation: 5,
  },
  padding: {
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
  }
});

// Código por plataforma
if (Platform.OS === 'ios') {
  // lógica específica iOS
}
```

---

### 4. Componentes Nativos Essenciais iOS

```tsx
import {
  SafeAreaView,
  StatusBar,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// SafeAreaView — SEMPRE usar como root no iOS
export default function Screen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* StatusBar no iOS */}
      <StatusBar
        barStyle="dark-content"        // "light-content" para fundo escuro
        backgroundColor="transparent"  // ignorado no iOS
        translucent                    // ignorado no iOS
      />

      {/* KeyboardAvoidingView — crítico no iOS */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView>
          {/* conteúdo */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Pressable — substituto moderno de TouchableOpacity
function BotaoNativo({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        backgroundColor: '#007AFF',  // azul iOS nativo
        padding: 16,
        borderRadius: 12,
      })}
      // Feedback háptico iOS
      onPressIn={() => {
        // import * as Haptics from 'expo-haptics';
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
    >
      <Text style={{ color: 'white', fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}
```

---

### 5. Navegação com Expo Router

```tsx
// app/_layout.tsx — root layout
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',      // slide up no iOS
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

// app/(tabs)/_layout.tsx — tabs
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarStyle: { paddingBottom: 4 }, // ajuste para iPhone com home indicator
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

// Navegação programática
import { router } from 'expo-router';

router.push('/perfil');
router.push('/produto/123');      // rota dinâmica
router.replace('/login');         // sem volta
router.back();

// Receber params
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();
```

---

### 6. Permissões iOS

**Passo 1 — `Info.plist` (obrigatório, sem isso o app crasha):**
```xml
<!-- ios/MeuApp/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>Usamos a câmera para tirar fotos do seu perfil.</string>

<key>NSMicrophoneUsageDescription</key>
<string>Usamos o microfone para gravar áudios.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>Acesso à galeria para selecionar imagens.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Usamos sua localização para mostrar lojas próximas.</string>

<key>NSUserNotificationsUsageDescription</key>
<string>Enviamos notificações sobre pedidos e ofertas.</string>
```

**Com Expo, configurar no `app.json`:**
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Para tirar fotos do perfil",
        "NSMicrophoneUsageDescription": "Para gravar áudios",
        "NSPhotoLibraryUsageDescription": "Para selecionar imagens"
      }
    },
    "plugins": [
      ["expo-camera", { "cameraPermission": "Para tirar fotos" }],
      ["expo-notifications", { "sounds": ["notification.wav"] }]
    ]
  }
}
```

**Passo 2 — Solicitar em runtime:**
```tsx
import { Camera } from 'expo-camera';
import * as Notifications from 'expo-notifications';
import * as MediaLibrary from 'expo-media-library';

// Câmera
const [permission, requestPermission] = Camera.useCameraPermissions();

async function pedirPermissaoCamera() {
  if (permission?.status !== 'granted') {
    const result = await requestPermission();
    if (!result.granted) {
      // Usuário negou — redirecionar para Settings
      Alert.alert(
        'Permissão necessária',
        'Habilite a câmera nas Configurações do iPhone.',
        [
          { text: 'Cancelar' },
          { text: 'Abrir Configurações', onPress: () => Linking.openSettings() }
        ]
      );
    }
  }
}

// Notificações Push
async function configurarNotificacoes() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  // Token APNs (via Expo)
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'seu-expo-project-id',
  });

  // Configurar como mostrar quando app está em foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}
```

---

### 7. Pegadinhas iOS Mais Comuns

**❌ Esqueceu SafeAreaView → conteúdo atrás do notch**
```tsx
// Errado
<View style={{ flex: 1 }}>

// Certo
<SafeAreaView style={{ flex: 1 }}>
// ou com insets para controle fino:
<View style={{ flex: 1, paddingTop: insets.top }}>
```

**❌ Fonte não existe no iOS → silenciosamente usa fallback**
```tsx
// Sempre verificar: fontFamily deve ser nome exato do iOS
// 'System' → SF Pro (correto)
// 'sans-serif' → não funciona no iOS, usar undefined ou 'System'
fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
```

**❌ `position: fixed` não existe → usar `position: absolute`**
```tsx
// React Native não tem fixed — para header/footer fixo:
style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
```

**❌ Teclado sobrepõe input → KeyboardAvoidingView mal configurado**
```tsx
// behavior DEVE ser 'padding' no iOS, não 'height'
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
```

**❌ `ScrollView` dentro de `FlatList` → loop infinito de layout**
```tsx
// Nunca aninhar ScrollView/FlatList sem dimensões fixas
// Usar ListHeaderComponent e ListFooterComponent no FlatList
```

**❌ Imagens sem dimensões → não renderiza**
```tsx
// Sempre definir width e height em imagens locais
<Image source={require('./foto.png')} style={{ width: 100, height: 100 }} />
```

**❌ `Info.plist` sem description → crash na submissão ao App Store**
```
Toda permissão usada DEVE ter descrição clara
Apple rejeita apps com "null" ou descrições genéricas
```

**❌ Testar só no simulador → surpresas no device físico**
```bash
# Sempre testar em device real antes de submeter
# Simulador não tem: câmera real, notificações push, Bluetooth, biometria
npx expo run:ios --device  # lista devices físicos conectados
```

## Expo EAS Build — Build e Deploy iOS completo
## Build iOS com Expo EAS — Fluxo Completo 2025

### 1. `app.json` / `app.config.js` — Configuração iOS

```typescript
// app.config.ts (preferido — tem TypeScript e lógica dinâmica)
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Titanio Dashboard",
  slug: "titanio-dashboard",          // único, sem espaços
  version: "2.1.0",                   // exibida no App Store
  orientation: "portrait",
  scheme: "titanio",                  // deep link: titanio://

  ios: {
    bundleIdentifier: "com.titaniofilms.dashboard",  // NUNCA mudar após publicar
    buildNumber: "24",                // incrementar a cada build (inteiro como string)
    supportsTablet: false,
    requireFullScreen: true,
    icon: "./assets/icon.png",        // 1024x1024 PNG, sem alpha, sem transparência
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#1a1a2e",
    },
    infoPlist: {
      NSCameraUsageDescription: "Para fotos de perfil",
      NSMicrophoneUsageDescription: "Para gravação de vídeo",
      NSPhotoLibraryUsageDescription: "Para selecionar imagens",
      UIBackgroundModes: ["remote-notification"],
    },
    associatedDomains: [              // Universal Links
      "applinks:titaniofilms.com",
    ],
    entitlements: {
      "aps-environment": "production", // push notifications
    },
  },

  android: {
    package: "com.titaniofilms.dashboard",
    versionCode: 24,
  },

  extra: {
    eas: {
      projectId: "xxxx-xxxx-xxxx-xxxx",  // ID do projeto EAS
    },
  },

  plugins: [
    "expo-router",
    ["expo-camera", { cameraPermission: "Para fotos de perfil" }],
    ["expo-notifications", {
      icon: "./assets/notification-icon.png",
      color: "#007AFF",
      sounds: ["./assets/notification.wav"],
    }],
  ],

  updates: {
    url: "https://u.expo.dev/xxxx-xxxx-xxxx-xxxx",  // OTA updates
  },
  runtimeVersion: { policy: "appVersion" },
});
```

---

### 2. `eas.json` — Perfis de Build

```json
{
  "cli": {
    "version": ">= 10.0.0",
    "appVersionSource": "remote"     // EAS gerencia buildNumber automaticamente
  },
  "build": {
    "development": {
      "developmentClient": true,     // instala expo-dev-client
      "distribution": "internal",   // TestFlight ou ADB direto
      "ios": {
        "simulator": false,          // true = build para simulador (.app)
        "resourceClass": "m-medium"  // máquina de build Apple Silicon
      }
    },
    "preview": {
      "distribution": "internal",   // TestFlight interno
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "autoIncrement": true,         // incrementa buildNumber automaticamente
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "contact@titaniofilms.com",
        "ascAppId": "123456789",     // App Store Connect App ID
        "appleTeamId": "XXXXXXXXXX"  // Team ID no Apple Developer
      }
    }
  }
}
```

---

### 3. Certificates e Provisioning Profiles

**Como funciona:**

```
Apple Developer Account
├── Certificates (quem pode assinar)
│   ├── Development Certificate  → debug em devices físicos
│   └── Distribution Certificate → App Store / TestFlight
│
├── Identifiers (o que está sendo assinado)
│   └── App ID: com.titaniofilms.dashboard
│
└── Provisioning Profiles (combina tudo)
    ├── Development Profile → device + developer cert
    ├── Ad Hoc Profile      → devices específicos
    └── App Store Profile   → distribuição pública
```

**EAS gerencia tudo automaticamente:**

```bash
# Na primeira vez, EAS pergunta:
# "Generate a new Apple Distribution Certificate?" → Y
# "Generate a new provisioning profile?" → Y
# Ele cria, assina e armazena nos servidores EAS

# Ver o que EAS tem armazenado
eas credentials --platform ios

# Baixar credentials localmente (backup)
eas credentials --platform ios --output ./credentials-backup

# Resetar e recriar (se expirou ou corrompeu)
eas credentials --platform ios --clear-cache
```

**Fazer manualmente (quando necessário):**

```bash
# 1. Em developer.apple.com → Certificates → criar Distribution Certificate
#    Baixar .cer → duplo clique → instala no Keychain

# 2. Exportar do Keychain como .p12:
#    Keychain Access → My Certificates → clic direito → Export
#    Guardar senha do .p12

# 3. Criar Provisioning Profile em developer.apple.com
#    Profiles → + → App Store → selecionar App ID → selecionar Certificate

# 4. Informar ao EAS:
eas credentials --platform ios
# Selecionar "Add existing..."
```

---

### 4. Development vs Production Build

```bash
# ── Development Build ──────────────────────────────────────
# Para: devs testando, hot reload, debugging
# Contém: expo-dev-client, DevMenu, logs detalhados
# Distribui: TestFlight ou cabo USB

eas build --platform ios --profile development

# Instalar no device via TestFlight ou:
# xcrun devicectl device install app --device <uuid> build.ipa

# ── Preview Build ───────────────────────────────────────────
# Para: QA, stakeholders, testes internos
# Contém: app quase-production, sem DevMenu
# Distribui: TestFlight (interno, sem review da Apple)

eas build --platform ios --profile preview

# ── Production Build ────────────────────────────────────────
# Para: App Store público
# Contém: código otimizado, sem logs, sem debug
# Distribui: App Store (passa por review)

eas build --platform ios --profile production

# Rodar localmente (sem enviar para servidores EAS):
eas build --platform ios --local
# Requer Xcode instalado, mais lento mas grátis
```

**Diferenças técnicas:**

| | Development | Preview | Production |
|---|---|---|---|
| `__DEV__` | `true` | `false` | `false` |
| DevMenu | ✅ | ❌ | ❌ |
| Fast Refresh | ✅ | ❌ | ❌ |
| Source maps | ✅ | parcial | ❌ |
| Minificação | ❌ | ✅ | ✅ |
| OTA Updates | ❌ | ✅ | ✅ |
| Tamanho .ipa | ~80MB | ~30MB | ~25MB |

---

### 5. Fluxo Completo do Zero ao App Store

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login
eas login
# ou com token (CI/CD):
export EXPO_TOKEN=seu_token_aqui

# 3. Inicializar projeto
eas init
# → cria projectId no app.json

# 4. Configurar build
# → criar eas.json como acima

# 5. Build production
eas build --platform ios --profile production

# Acompanhar em tempo real:
# https://expo.dev/accounts/org/projects/app/builds

# 6. Quando terminar — submeter ao App Store
eas submit --platform ios --profile production --latest
# --latest usa o build mais recente automaticamente

# Ou submeter build específico:
eas submit --platform ios --profile production \
  --id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# 7. No App Store Connect (appstoreconnect.apple.com):
# → TestFlight → aguardar processing (~10-30min)
# → Adicionar testadores internos → testar
# → Distribution → App Review → Submit for Review
# → Apple leva 1-3 dias para aprovar (primeira vez pode ser mais)
```

---

### 6. Erros Comuns e Soluções

**❌ `No profiles for 'com.titaniofilms.dashboard' were found`**
```bash
# Bundle identifier não existe no Apple Developer
# Solução:
# developer.apple.com → Identifiers → + → App ID
# ou deixar EAS criar:
eas build --platform ios --profile production
# EAS pergunta se quer criar → Y
```

**❌ `Certificate has expired`**
```bash
# Certificado de distribuição expirou (válido por 1 ano)
eas credentials --platform ios
# Selecionar → Remove → depois fazer novo build (EAS cria novo cert)
```

**❌ `The bundle version must be higher than the previously uploaded version`**
```bash
# buildNumber (CFBundleVersion) precisa incrementar
# No eas.json:
"autoIncrement": true   # EAS incrementa automaticamente

# Ou manualmente no app.config.ts:
buildNumber: "25"       # era 24
```

**❌ `Missing Push Notification Entitlement`**
```json
// app.config.ts → ios → entitlements:
{
  "aps-environment": "production"
}
// E no infoPlist:
{
  "UIBackgroundModes": ["remote-notification"]
}
```

**❌ `Image format not supported` (ícone)**
```bash
# Ícone DEVE ser:
# - 1024x1024 pixels exatos
# - PNG sem alpha channel (sem transparência)
# - Sem cantos arredondados (Apple adiciona automaticamente)

# Verificar:
file icon.png          # → PNG image data, 1024 x 1024
identify icon.png      # (ImageMagick) → verificar alpha

# Remover alpha:
magick icon.png -alpha off icon-clean.png
```

**❌ `Provisioning profile doesn't include the entitlement`**
```bash
# Entitlement adicionado mas profile não foi atualizado
eas credentials --platform ios --clear-cache
# Novo build → EAS gera profile atualizado
```

**❌ Build travado ou falhou no EAS**
```bash
# Ver logs detalhados:
eas build:view          # lista builds recentes
eas build:view <id>     # logs do build específico

# Build local para debugar:
eas build --platform ios --local --profile production
# Mostra erro completo no terminal
```

**❌ `Your app crashed on launch` (TestFlight)**
```bash
# Causes mais comuns:
# 1. Variável de ambiente faltando em produção
#    → checar todas as process.env.* usadas

# 2. Módulo nativo não configurado no Info.plist
#    → comparar Info.plist do build com dev

# 3. Font não incluída no bundle
#    → usar expo-font com useFonts hook

# Obter crash logs:
# Xcode → Window → Devices and Simulators → device → View Device Logs
# Ou no App Store Connect → TestFlight → Crashes
```

---

### Checklist antes de submeter

```bash
# 1. Incrementar version e buildNumber
# 2. Testar em device físico (não só simulador)
# 3. Testar sem internet (modo avião)
# 4. Testar acessibilidade (VoiceOver)
# 5. Screenshots em todos os tamanhos obrigatórios:
#    6.9" (iPhone 16 Pro Max), 6.5" (iPhone 11), 12.9" iPad
# 6. Descrição e metadata no App Store Connect
# 7. Privacy policy URL (obrigatório desde 2023)
# 8. Responder questionário de privacidade no ASC

eas build --platform ios --profile production
eas submit --platform ios --profile production --latest
```

## Apple Developer Program — App Store Connect completo
## App Store Connect — Guia Completo 2025

### 1. Conta Apple Developer

**Custo e tipos:**

| Tipo | Custo | Para quem |
|---|---|---|
| Individual | US$ 99/ano | Pessoa física, app no seu nome |
| Organization | US$ 99/ano | Empresa, CNPJ, app no nome da empresa |
| Enterprise | US$ 299/ano | Distribuição interna (sem App Store) |

**Processo de registro:**

```
1. developer.apple.com → Enroll
2. Fazer login com Apple ID (criar um dedicado para a empresa)
3. Escolher: Individual ou Organization
4. Organization → precisará de:
   - D-U-N-S Number (gratuito, pedir em dnb.com/duns, leva ~5 dias)
   - Razão social exata como no CNPJ
   - Autoridade legal que pode assinar (CEO/sócio)
5. Pagar US$ 99 (cartão de crédito, sem parcelamento)
6. Aprovação: Individual = imediato, Organization = 2-5 dias
```

**Após aprovação:**
```
developer.apple.com     → criar certificados, Bundle IDs, profiles
appstoreconnect.apple.com → gerenciar apps, reviews, vendas, TestFlight
```

---

### 2. Bundle ID e App ID

**No Apple Developer Portal:**

```
developer.apple.com
→ Certificates, Identifiers & Profiles
→ Identifiers
→ + (novo)
→ App IDs
→ App
→ Preencher:

  Description: Titanio Dashboard
  Bundle ID: Explicit → com.titaniofilms.dashboard
             (NUNCA usar Wildcard — bloqueia push notifications)

→ Capabilities (marcar o que o app usa):
  ☑ Push Notifications
  ☑ Associated Domains        (Universal Links)
  ☑ Sign in with Apple        (obrigatório se tiver login social)
  ☑ HealthKit                 (se usar)
  ☑ In-App Purchase           (se tiver compras)

→ Continue → Register
```

**Regras do Bundle ID:**
```
✅ com.titaniofilms.dashboard
✅ com.titaniofilms.titanio47
❌ com.titaniofilms.meu app    (sem espaços)
❌ com.titaniofilms            (muito genérico)
❌ titanio                     (sem domínio reverso)

⚠️  Uma vez publicado, NUNCA mude o Bundle ID
    Mudar = app diferente, perda de reviews e histórico
```

---

### 3. Criar App no App Store Connect

```
appstoreconnect.apple.com
→ My Apps
→ + → New App

Preencher:
  Platforms: iOS (e iPadOS se suportar)
  Name: Titanio Dashboard            ← nome público (máx 30 chars)
  Primary Language: Portuguese (Brazil)
  Bundle ID: com.titaniofilms.dashboard  ← o que foi registrado
  SKU: TITANIO-DASHBOARD-001         ← código interno, nunca aparece publicamente
  User Access: Full Access

→ Create
```

**Estrutura do App Store Connect:**
```
App
├── App Store (metadados públicos)
│   ├── App Information
│   ├── Pricing and Availability
│   ├── App Privacy
│   └── Versions
│       └── 1.0 Prepare for Submission
│           ├── Screenshots
│           ├── Description, Keywords
│           └── Build (link ao TestFlight)
├── TestFlight
│   ├── Internal Testing
│   └── External Testing
├── Analytics
└── Payments & Financial Reports
```

---

### 4. Screenshots — Tamanhos Obrigatórios 2025

**Mínimo obrigatório (sem isso não consegue submeter):**

| Dispositivo | Resolução | Tamanho tela |
|---|---|---|
| **iPhone 6.9"** | 1320 × 2868 px | iPhone 16 Pro Max ← **obrigatório** |
| **iPhone 6.5"** | 1284 × 2778 px | iPhone 14 Plus / 13 Pro Max |
| **iPad 12.9"** | 2048 × 2732 px | iPad Pro ← se suportar iPad |

**Recomendados (Apple usa para outros tamanhos automaticamente):**

| Dispositivo | Resolução |
|---|---|
| iPhone 5.5" | 1242 × 2208 px |
| iPhone 4.7" | 750 × 1334 px |
| iPad 11" | 1668 × 2388 px |

**Gerar screenshots com Expo/Simulator:**

```bash
# Rodar no simulador do tamanho correto
npx expo run:ios --device "iPhone 16 Pro Max"

# No Simulator: File → Save Screen (Cmd+S)
# Ou via linha de comando:
xcrun simctl io booted screenshot screenshot.png

# Automatizar com Fastlane Snapshot:
brew install fastlane
fastlane snapshot init
# Configura capturas automáticas em todos os tamanhos
fastlane snapshot
```

**Boas práticas de screenshot:**
```
✅ Mostrar o app em uso real, não tela vazia
✅ Adicionar texto explicativo sobre a screenshot
✅ Usar o mesmo esquema de cores das primeiras 3
✅ Máximo 10 screenshots por idioma
❌ Não usar moldura de iPhone adicionada manualmente (Apple rejeita se detectar)
❌ Não usar imagens de outras marcas sem permissão
❌ Não mostrar preço em screenshots (muda por região)
```

---

### 5. Metadados — Preencher Corretamente

```
App Store Connect → App → Version → App Store

━━━ NAME (30 chars máx) ━━━
Titanio Dashboard

━━━ SUBTITLE (30 chars máx) ━━━
Gerencie seus bots de IA

━━━ DESCRIPTION (4000 chars) ━━━
Primeira linha é a mais importante — aparece antes do "mais"

Titanio Dashboard é a central de comando para seus agentes de IA.
Gerencie múltiplos bots especializados, acompanhe tarefas em tempo
real e receba notificações inteligentes diretamente no WhatsApp.

Funcionalidades:
• Dashboard em tempo real com status de todos os agentes
• Notificações instantâneas quando tarefas são concluídas
• Relatórios diários automáticos
• Integração com N8n para automações avançadas
• Suporte a múltiplos modelos de IA

━━━ KEYWORDS (100 chars, separados por vírgula, SEM espaço) ━━━
IA,agente,bot,automação,dashboard,assistente,inteligência,workflow,n8n

Dicas keywords:
- Não repetir palavras que já estão no nome/subtitle
- Usar singular (Apple busca plural automaticamente)
- Incluir termos em inglês mesmo com app em PT
- Não usar nomes de concorrentes (rejeição)

━━━ PROMOTIONAL TEXT (170 chars — atualizável sem novo build) ━━━
Novidade: relatórios diários automáticos via WhatsApp! Atualize hoje.

━━━ SUPPORT URL ━━━
https://titaniofilms.com/suporte

━━━ MARKETING URL (opcional) ━━━
https://titaniofilms.com/dashboard

━━━ PRIVACY POLICY URL (OBRIGATÓRIO) ━━━
https://titaniofilms.com/privacidade
```

**Categorias:**
```
App Store Connect → App Information → Category

Primary Category:   Productivity       (ou Business)
Secondary Category: Utilities

Escolher bem — afeta descoberta orgânica
```

**Pricing:**
```
App Store Connect → Pricing and Availability
→ Price: Free
→ Availability: Brazil (ou All Countries)
→ Pre-Orders: opcional
```

---

### 6. Review Guidelines — Principais Regras

**Causas mais comuns de rejeição:**

```
🔴 REJEIÇÃO IMEDIATA:

1. Bugs óbvios / crashes
   → Testar exaustivamente antes de submeter

2. Placeholder content
   → "Lorem ipsum", "TODO", telas vazias = rejeição

3. Dados falsos / demo fictício
   → Se tiver login, conta de teste funcional obrigatória

4. Coletar dados sem Privacy Policy
   → privacy policy URL obrigatória e acessível

5. Funcionalidade quebrada
   → Todos os botões e telas devem funcionar

6. Copiar interface de outro app (especialmente apps Apple)
   → Design original ou baseado em UI kit padrão

7. Pagamentos externos sem usar In-App Purchase
   → "Compre em nosso site" = rejeição
   → Apple leva 15-30% de qualquer compra digital

8. Conteúdo de adulto sem restrição de idade adequada

9. VPN/proxy sem declaração adequada de uso

10. Web scraping de conteúdo protegido
```

**Dicas para aprovação:**

```
✅ Conta de demo funcional para o reviewer
   (Notes for App Review → "Email: demo@app.com / Senha: Demo123")

✅ Explicar funcionalidades não óbvias
   (câmera que tira foto automaticamente → explicar por quê)

✅ Se precisar de login para usar o app → oferecer "Guest mode"
   ou conta de teste sem precisar cadastro

✅ Todas as permissões com usage description clara e específica

✅ Sem referências a plataformas concorrentes (Android, Google Play)
   em screenshots ou no texto

✅ App funciona offline ou mensagem clara quando precisa de internet
```

---

### 7. TestFlight — Beta Testing

```
App Store Connect → TestFlight

━━━ Internal Testing (sem review da Apple) ━━━
- Máx: 100 testadores
- Quem pode ser: membros do Apple Developer Team
- Disponível: minutos após upload do build
- Duração: 90 dias por build

→ Testadores Internos → + → adicionar por email
→ Build fica disponível automaticamente

━━━ External Testing (review rápida da Apple ~24h) ━━━
- Máx: 10.000 testadores
- Quem pode ser: qualquer pessoa com o link
- Disponível: após Beta App Review (~1 dia)
- Duração: 90 dias por build

→ External Groups → Create Group → "Beta Público"
→ + Build → submeter para Beta Review
→ Após aprovação: Public Link (compartilhar com qualquer pessoa)
→ testflight.apple.com/join/XXXXXXXX

━━━ Notas do build (What to Test) ━━━
Escrever o que mudou e o que testar:
"Nova versão com:
- Dashboard em tempo real
- Notificações WhatsApp
Por favor testar: conexão com múltiplos agentes, recebimento de notificação"
```

**Instalar TestFlight nos devices:**
```
App Store → buscar "TestFlight" → instalar
→ Abrir link do convite ou código de acesso
```

---

### 8. Submeter para Review

**Checklist antes de submeter:**

```bash
# 1. Build produção gerado e no TestFlight
eas build --platform ios --profile production
eas submit --platform ios --profile production --latest

# 2. Aguardar processing no App Store Connect (~15-30min)
# Status: "Processing" → "Ready to Submit"
```

**No App Store Connect:**

```
Version → 1.0.0 → Prepare for Submission

1. Screenshots: ✅ todos os tamanhos
2. Description/Keywords: ✅ preenchidos
3. Build: selecionar o build do TestFlight
4. App Review Information:
   - Sign-in required? Yes/No
   - Demo account: email + senha funcional
   - Notes: explicar qualquer coisa não óbvia
     "Este app requer conexão com servidor local na rede.
      Para review: usar servidor de demonstração em demo.titaniofilms.com"
   - Attachment: opcional (vídeo demonstrando o app)

5. Version Release:
   - Manually release (você libera quando quiser após aprovação)
   - Automatically release (libera assim que aprovado)
   - Scheduled (data específica)

6. Add to Review → Submit
```

**Timeline típico:**

```
Dia 0: Submit for Review
Dia 1: "In Review" (Apple começou a analisar)
Dia 1-3: "Approved" ← primeira submissão pode levar mais
          ou "Rejected" (vem com motivo detalhado)

Se rejeitado:
→ Ler o motivo com atenção
→ Corrigir o problema específico
→ Reply na mesma thread explicando o que foi feito
→ "Appeal" se discordar (demora mais)
→ Resubmeter

Aceleração de review (casos específicos):
→ Request Expedited Review (botão no ASC)
→ Justificar: bug crítico, evento com data, etc.
→ Não garantido, mas costuma funcionar
```

**Após aprovação:**
```
→ Se "Manually release": botão "Release This Version"
→ Propagação nas lojas: 1-24h para aparecer globalmente
→ Notificar usuários do TestFlight → migrar para versão pública
```

## React Native — Chat IA + Social + Áudio + Pagamento
## React Native iOS — Implementações Funcionais

### 1. Chat com IA — Streaming de Respostas

```typescript
// hooks/useStreamingChat.ts
import { useState, useCallback, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export function useStreamingChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userText: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      createdAt: new Date(),
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    abortRef.current = new AbortController();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          stream: true,
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortRef.current.signal,
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.delta?.text || '';
            if (!delta) continue;

            setMessages(prev =>
              prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: m.content + delta }
                  : m
              )
            );
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: 'Erro ao conectar. Tente novamente.' }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  }, [messages]);

  const stopStreaming = () => abortRef.current?.abort();

  return { messages, isStreaming, sendMessage, stopStreaming };
}

// components/ChatScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, FlatList, TextInput, Pressable, Text,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useStreamingChat } from '../hooks/useStreamingChat';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { messages, isStreaming, sendMessage, stopStreaming } = useStreamingChat();

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[
            styles.bubble,
            item.role === 'user' ? styles.userBubble : styles.aiBubble
          ]}>
            <Text style={styles.bubbleText}>
              {item.content}
              {isStreaming && item.role === 'assistant' &&
               item.id === messages[messages.length - 1]?.id && (
                <Text style={styles.cursor}>▋</Text>
              )}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Mensagem..."
          multiline
          maxLength={4000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <Pressable
          style={styles.sendBtn}
          onPress={isStreaming ? stopStreaming : handleSend}
        >
          {isStreaming
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.sendText}>➤</Text>
          }
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: { margin: 8, padding: 12, borderRadius: 16, maxWidth: '80%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#F2F2F7' },
  bubbleText: { fontSize: 16, color: '#000' },
  cursor: { color: '#007AFF' },
  inputRow: { flexDirection: 'row', padding: 8, gap: 8, backgroundColor: '#fff' },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 16, maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 18 },
});
```

---

### 2. TTS com ElevenLabs + expo-av

```bash
npm install expo-av
```

```typescript
// hooks/useElevenLabsTTS.ts
import { useState, useCallback } from 'react';
import { Audio } from 'expo-av';

const ELEVEN_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_KEY!;
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam — ou criar voz customizada

export function useElevenLabsTTS() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const speak = useCallback(async (text: string) => {
    try {
      // Parar áudio anterior
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      setIsLoading(true);

      // Configurar modo de áudio iOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,   // toca mesmo no modo silencioso
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Chamar ElevenLabs API
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVEN_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: 0.2,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('ElevenLabs error');

      // Converter para base64 (React Native não suporta blob direto)
      const arrayBuffer = await response.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const uri = `data:audio/mpeg;base64,${base64}`;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 }
      );

      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            newSound.unloadAsync();
            setSound(null);
          }
        }
      });

      setSound(newSound);
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sound]);

  const stop = useCallback(async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  }, [sound]);

  return { speak, stop, isPlaying, isLoading };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Uso no componente:
// const { speak, stop, isPlaying } = useElevenLabsTTS();
// <Pressable onPress={() => speak(lastAIMessage)}>
//   <Text>{isPlaying ? 'Parar' : '🔊 Ouvir'}</Text>
// </Pressable>
```

---

### 3. Gravação de Voz com expo-av

```typescript
// hooks/useVoiceRecorder.ts
import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

export function useVoiceRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Pedir permissão
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) throw new Error('Permissão de microfone negada');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
        // HIGH_QUALITY = AAC, 44100 Hz, stereo
      );

      setRecording(rec);
      setIsRecording(true);
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (!recording) return null;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      setAudioUri(uri);

      // Resetar modo de áudio
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      return uri;
    } catch (err) {
      console.error('Erro ao parar gravação:', err);
      return null;
    }
  }, [recording]);

  // Transcrever com OpenAI Whisper
  const transcribe = useCallback(async (uri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    } as any);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    return data.text || '';
  }, []);

  return {
    isRecording,
    audioUri,
    startRecording,
    stopRecording,
    transcribe,
  };
}

// components/VoiceButton.tsx — botão pressionar-e-segurar
import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

export function VoiceButton({ onTranscription }: { onTranscription: (text: string) => void }) {
  const { isRecording, startRecording, stopRecording, transcribe } = useVoiceRecorder();

  return (
    <Pressable
      style={[styles.btn, isRecording && styles.recording]}
      onPressIn={async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await startRecording();
      }}
      onPressOut={async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const uri = await stopRecording();
        if (uri) {
          const text = await transcribe(uri);
          if (text) onTranscription(text);
        }
      }}
    >
      <Text style={styles.icon}>{isRecording ? '⏹' : '🎤'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center',
  },
  recording: { backgroundColor: '#FF3B30' },
  icon: { fontSize: 24 },
});
```

---

### 4. Social Features — Estrutura de Telas

```typescript
// app/(tabs)/social/_layout.tsx
import { Stack } from 'expo-router';

export default function SocialLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Social' }} />
      <Stack.Screen name="amigos" options={{ title: 'Amigos' }} />
      <Stack.Screen name="grupos/index" options={{ title: 'Grupos' }} />
      <Stack.Screen name="grupos/[id]" options={{ title: 'Grupo' }} />
      <Stack.Screen name="forum/index" options={{ title: 'Fórum' }} />
      <Stack.Screen name="forum/[postId]" options={{ title: 'Post' }} />
      <Stack.Screen
        name="usuario/[id]"
        options={{ presentation: 'modal', title: 'Perfil' }}
      />
    </Stack>
  );
}

// app/(tabs)/social/amigos.tsx
import React, { useState } from 'react';
import { View, FlatList, TextInput, Text, Pressable, Image, StyleSheet } from 'react-native';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export default function AmigosScreen() {
  const [search, setSearch] = useState('');
  const [friends] = useState<Friend[]>([/* API */]);
  const [requests] = useState<Friend[]>([/* pendentes */]);

  const filtered = friends.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar amigos..."
      />

      {requests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitações ({requests.length})</Text>
          {requests.map(req => (
            <View key={req.id} style={styles.requestItem}>
              <Image source={{ uri: req.avatar }} style={styles.avatar} />
              <Text style={styles.name}>{req.name}</Text>
              <Pressable style={styles.acceptBtn} onPress={() => {}}>
                <Text style={{ color: '#fff' }}>Aceitar</Text>
              </Pressable>
              <Pressable style={styles.rejectBtn} onPress={() => {}}>
                <Text style={{ color: '#FF3B30' }}>Recusar</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={f => f.id}
        renderItem={({ item }) => (
          <Pressable style={styles.friendItem}>
            <View>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={[
                styles.statusDot,
                { backgroundColor: item.status === 'online' ? '#34C759' : '#ccc' }
              ]} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.status}>
                {item.status === 'online' ? 'Online' : `Visto ${item.lastSeen}`}
              </Text>
            </View>
            <Pressable onPress={() => {/* abrir chat */}}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

// app/(tabs)/social/forum/[postId].tsx — thread de fórum
import { useLocalSearchParams, router } from 'expo-router';

export default function ForumPost() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [reply, setReply] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={comments}
        ListHeaderComponent={<PostHeader postId={postId} />}
        keyExtractor={c => c.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Image source={{ uri: item.author.avatar }} style={styles.commentAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.commentAuthor}>{item.author.name}</Text>
              <Text>{item.content}</Text>
              <Pressable onPress={() => setReply(`@${item.author.name} `)}>
                <Text style={styles.replyLink}>Responder</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <View style={styles.replyBox}>
        <TextInput
          value={reply}
          onChangeText={setReply}
          placeholder="Escrever comentário..."
          style={styles.replyInput}
          multiline
        />
        <Pressable onPress={() => {/* postar */}}>
          <Text style={{ color: '#007AFF', fontWeight: '600' }}>Enviar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { margin: 16, padding: 12, backgroundColor: '#F2F2F7', borderRadius: 10 },
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
  requestItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  friendItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ccc' },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  statusDot: { width: 10, height: 10, borderRadius: 5, position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#fff' },
  name: { fontWeight: '600', fontSize: 15 },
  status: { color: '#8E8E93', fontSize: 13 },
  acceptBtn: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  rejectBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  comment: { flexDirection: 'row', padding: 12, gap: 8 },
  commentAuthor: { fontWeight: '600', marginBottom: 2 },
  replyLink: { color: '#007AFF', fontSize: 13, marginTop: 4 },
  replyBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#ccc', gap: 8 },
  replyInput: { flex: 1, padding: 10, backgroundColor: '#F2F2F7', borderRadius: 20 },
});
```

---

### 5. In-App Purchase — StoreKit

```bash
npx expo install expo-in-app-purchases
# ou a alternativa mais ativa em 2025:
npm install react-native-purchases  # RevenueCat (recomendado)
```

```typescript
// hooks/useInAppPurchase.ts — com RevenueCat (mais confiável)
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { useEffect, useState } from 'react';

const REVENUECAT_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS!;

export function useInAppPurchase() {
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    Purchases.configure({ apiKey: REVENUECAT_KEY_IOS });
    loadOfferings();
    checkSubscription();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (err) {
      console.error('Erro ao carregar ofertas:', err);
    }
  };

  const checkSubscription = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      // Checar se tem entitlement "premium" ativo
      setIsPremium(info.entitlements.active['premium'] !== undefined);
    } catch (err) {
      console.error('Erro ao checar assinatura:', err);
    }
  };

  const purchase = async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(customerInfo);
      setIsPremium(customerInfo.entitlements.active['premium'] !== undefined);
      return true;
    } catch (err: any) {
      if (!err.userCancelled) {
        console.error('Erro na compra:', err);
      }
      return false;
    }
  };

  const restore = async () => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      setIsPremium(info.entitlements.active['premium'] !== undefined);
    } catch (err) {
      console.error('Erro ao restaurar:', err);
    }
  };

  return { packages, isPremium, customerInfo, purchase, restore };
}

// components/PaywallScreen.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useInAppPurchase } from '../hooks/useInAppPurchase';

export default function PaywallScreen({ onClose }: { onClose: () => void }) {
  const { packages, isPremium, purchase, restore } = useInAppPurchase();

  if (isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>✅ Você é Premium!</Text>
        <Pressable onPress={onClose}><Text>Fechar</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 Titanio Premium</Text>
      <Text style={styles.subtitle}>Desbloqueie todos os recursos</Text>

      {['✅ Agentes ilimitados', '✅ Relatórios avançados',
        '✅ Suporte prioritário', '✅ API sem limites'].map(f => (
        <Text key={f} style={styles.feature}>{f}</Text>
      ))}

      <View style={styles.packages}>
        {packages.map(pkg => (
          <Pressable
            key={pkg.identifier}
            style={styles.packageBtn}
            onPress={async () => {
              const ok = await purchase(pkg);
              if (ok) {
                Alert.alert('Sucesso!', 'Bem-vindo ao Premium! 🎉');
                onClose();
              }
            }}
          >
            <Text style={styles.packageTitle}>{pkg.product.title}</Text>
            <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
            {pkg.packageType === 'ANNUAL' && (
              <Text style={styles.badge}>Melhor valor</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable onPress={restore}>
        <Text style={styles.restoreLink}>Restaurar compras anteriores</Text>
      </Pressable>

      <Text style={styles.legal}>
        Renovado automaticamente. Cancele quando quiser.
        {'\n'}Termos · Privacidade
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 17, color: '#666', marginBottom: 24 },
  feature: { fontSize: 17, marginBottom: 8, alignSelf: 'flex-start' },
  packages: { width: '100%', gap: 12, marginTop: 24 },
  packageBtn: {
    backgroundColor: '#007AFF', padding: 20,
    borderRadius: 16, alignItems: 'center',
  },
  packageTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  packagePrice: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 4 },
  badge: {
    backgroundColor: '#FFD60A', color: '#000',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, fontSize: 12, fontWeight: '700', marginTop: 6,
  },
  restoreLink: { color: '#007AFF', marginTop: 20 },
  legal: { color: '#8E8E93', fontSize: 11, textAlign: 'center', marginTop: 16 },
});
```

---

### 6. Push Notifications — Completo

```typescript
// hooks/usePushNotifications.ts
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert, Linking } from 'react-native';
import { router } from 'expo-router';

// Configurar comportamento global (fora do componente)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    registerForPushNotifications();

    // Notificação recebida com app ABERTO
    notificationListener.current = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('Notificação recebida:', notification);
        // Atualizar badge, tocar som customizado, etc.
      }
    );

    // Usuário TOCOU na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      response => {
        const data = response.notification.request.content.data;

        // Deep link baseado no tipo
        switch (data.type) {
          case 'chat':
            router.push(`/chat/${data.chatId}`);
            break;
          case 'bot_done':
            router.push(`/bots/${data.botId}`);
            break;
          case 'friend_request':
            router.push('/social/amigos');
            break;
          default:
            router.push('/');
        }
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.log('Push só funciona em device físico');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Notificações desativadas',
        'Ative nas Configurações para receber alertas.',
        [
          { text: 'Agora não' },
          { text: 'Configurações', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    // Token Expo (para enviar via Expo Push API)
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'seu-expo-project-id', // app.json → extra.eas.projectId
    });
    setExpoPushToken(token.data);

    // Salvar token no backend
    await fetch('https://seu-backend.com/api/push-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.data, platform: 'ios' }),
    });
  };

  // Agendar notificação local
  const scheduleLocal = async (title: string, body: string, seconds = 5) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: 'default', badge: 1 },
      trigger: { seconds },
    });
  };

  // Cancelar todas
  const cancelAll = () => Notifications.cancelAllScheduledNotificationsAsync();

  // Resetar badge
  const clearBadge = () => Notifications.setBadgeCountAsync(0);

  return { expoPushToken, scheduleLocal, cancelAll, clearBadge };
}

// Enviar push do backend (Node.js) via Expo Push API:
async function sendPush(expoPushToken: string, title: string, body: string, data = {}) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      badge: 1,
      priority: 'high',
      // iOS específico:
      _displayInForeground: true,
    }),
  });
}

// Exemplo de uso: quando bot finaliza tarefa
// sendPush(userToken, '✅ Bot finalizado!', 'Code Ninja concluiu o deploy', { type: 'bot_done', botId: '123' })
```

**Integrar tudo no `app/_layout.tsx`:**

```typescript
export default function RootLayout() {
  const { clearBadge } = usePushNotifications();

  useEffect(() => {
    // Limpar badge quando abrir o app
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') clearBadge();
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <Stack />
    </SafeAreaProvider>
  );
}
```

## Migrando Next.js para React Native iOS — Estratégia
## Migração Next.js → React Native iOS

### 1. O que Reaproveitar vs Reescrever

```
NEXT.JS ATUAL                    REACT NATIVE
─────────────────────────────────────────────────
✅ REAPROVEITAR (direto):
   Supabase client               → mesmo SDK (@supabase/supabase-js)
   Lógica de negócio (hooks)     → copiar quase sem mudança
   Tipos TypeScript              → copiar 100%
   Validação (zod, yup)          → copiar 100%
   API routes do Next.js         → viram endpoints do backend existente
   Variáveis de ambiente         → EXPO_PUBLIC_* em vez de NEXT_PUBLIC_*
   React Query / Zustand         → funciona igual
   Formatação / utils            → copiar 100%

🔄 ADAPTAR (pequenas mudanças):
   fetch/axios calls             → funciona, mas adicionar timeout/retry
   Auth logic                    → trocar next-auth por expo-auth-session
   Routing (useRouter Next)      → expo-router (API similar)
   Image (next/image)            → <Image> do RN + expo-image
   Link (next/link)              → <Link> do expo-router

❌ REESCREVER DO ZERO:
   Todo o JSX/TSX com HTML       → componentes RN (View, Text, etc.)
   CSS/Tailwind/styled-components→ StyleSheet.create ou NativeWind
   CSS Grid/Flexbox CSS          → Flexbox RN (similar, sem grid)
   Animações CSS                 → react-native-reanimated
   localStorage                  → AsyncStorage / SecureStore
   cookies                       → SecureStore para tokens
   window/document              → não existe no RN
   <head>, <meta>, SEO           → não existe no RN
```

---

### 2. Estrutura de Pastas Recomendada

```
MeuAppRN/
├── app/                          ← expo-router (telas)
│   ├── _layout.tsx               ← providers, auth gate
│   ├── index.tsx                 ← redirect para /(app) ou /auth
│   ├── (auth)/                   ← grupo sem tab bar
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── onboarding.tsx
│   ├── (app)/                    ← grupo autenticado
│   │   ├── _layout.tsx           ← tab navigator
│   │   ├── (home)/
│   │   │   ├── index.tsx         ← dashboard
│   │   │   └── [id].tsx          ← detalhe
│   │   ├── (social)/
│   │   │   ├── index.tsx
│   │   │   └── [userId].tsx
│   │   └── perfil/
│   │       └── index.tsx
│   └── modal/                    ← telas modais
│       └── configuracoes.tsx
│
├── src/                          ← lógica (copiada do Next.js)
│   ├── lib/
│   │   ├── supabase.ts           ← ⬅️ COPIAR do Next.js, mudar 2 linhas
│   │   ├── api.ts                ← fetch helpers
│   │   └── constants.ts
│   ├── hooks/                    ← ⬅️ COPIAR maioria do Next.js
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts
│   │   ├── useProfile.ts
│   │   └── useStream.ts
│   ├── stores/                   ← ⬅️ COPIAR (Zustand funciona igual)
│   │   ├── authStore.ts
│   │   └── appStore.ts
│   ├── types/                    ← ⬅️ COPIAR 100%
│   │   ├── database.types.ts     ← gerado pelo Supabase CLI
│   │   └── index.ts
│   └── utils/                    ← ⬅️ COPIAR maioria
│       ├── format.ts
│       ├── validation.ts
│       └── dates.ts
│
├── components/                   ← ❌ reescrever em RN
│   ├── ui/                       ← primitivos
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Avatar.tsx
│   │   └── Badge.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── BottomSheet.tsx
│   └── features/
│       ├── PostCard.tsx
│       └── ChatBubble.tsx
│
├── assets/                       ← ⬅️ COPIAR imagens/ícones (converter SVG)
├── app.config.ts
├── eas.json
└── babel.config.js
```

---

### 3. Supabase — Mesmo Backend, Mudança Mínima

```typescript
// src/lib/supabase.ts — ANTES (Next.js)
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// src/lib/supabase.ts — DEPOIS (React Native)
// Diferença: storage diferente para persistir sessão
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore para tokens (mais seguro que AsyncStorage)
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,    // ← única diferença real
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,          // ← importante: false no RN
    },
  }
);

// Todos os hooks do Supabase funcionam igual:
// const { data } = await supabase.from('posts').select('*');
// const channel = supabase.channel('room').on(...).subscribe();
// supabase.storage.from('avatars').upload(...)
```

```typescript
// Gerador de tipos Supabase — rodar no projeto Next.js existente:
npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.types.ts

// Copiar o arquivo para o projeto RN — funciona 100% igual
```

**Realtime no RN funciona igual:**
```typescript
// hooks/useRealtimeMessages.ts — COPIAR do Next.js sem mudança
useEffect(() => {
  const channel = supabase
    .channel(`messages:${chatId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `chat_id=eq.${chatId}`,
    }, payload => {
      setMessages(prev => [...prev, payload.new as Message]);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [chatId]);
```

---

### 4. Google OAuth no iOS com expo-auth-session

```bash
npx expo install expo-auth-session expo-web-browser expo-crypto
```

```typescript
// src/hooks/useGoogleAuth.ts
import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from '../lib/supabase';

// IMPORTANTE: necessário para fechar o browser após login
WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    // Criar em console.cloud.google.com → Credenciais → IDs de cliente OAuth
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    // Não precisa de androidClientId se só for iOS
  });

  useEffect(() => {
    handleGoogleResponse();
  }, [response]);

  const handleGoogleResponse = async () => {
    if (response?.type !== 'success') return;

    const { authentication } = response;
    if (!authentication?.idToken) return;

    // Passar token do Google para o Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: authentication.idToken,
      access_token: authentication.accessToken,
    });

    if (error) console.error('Supabase Google auth error:', error);
    // Supabase gerencia a sessão automaticamente após isso
  };

  return {
    signInWithGoogle: () => promptAsync(),
    isReady: !!request,
  };
}

// Configurar no Google Cloud Console:
// 1. console.cloud.google.com → APIs & Services → Credentials
// 2. Create Credentials → OAuth Client ID
// 3. Application type: iOS
// 4. Bundle ID: com.titaniofilms.dashboard
// 5. Copiar o "iOS Client ID" → EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID

// app.config.ts — adicionar scheme:
// scheme: "com.titaniofilms.dashboard"
// ios.bundleIdentifier: "com.titaniofilms.dashboard"

// app/(auth)/login.tsx
import { useGoogleAuth } from '../../src/hooks/useGoogleAuth';

export default function Login() {
  const { signInWithGoogle, isReady } = useGoogleAuth();

  return (
    <Pressable
      style={styles.googleBtn}
      onPress={signInWithGoogle}
      disabled={!isReady}
    >
      <Image source={require('../../assets/google-icon.png')} style={{ width: 20, height: 20 }} />
      <Text style={styles.googleText}>Continuar com Google</Text>
    </Pressable>
  );
}
```

---

### 5. Tema Claro/Escuro

```typescript
// src/theme/index.ts
export const colors = {
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7',
    primary: '#007AFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    danger: '#FF3B30',
    success: '#34C759',
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    primary: '#0A84FF',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    danger: '#FF453A',
    success: '#30D158',
  },
} as const;

// hooks/useTheme.ts
import { useColorScheme } from 'react-native';
import { colors } from '../theme';

export function useTheme() {
  const scheme = useColorScheme(); // 'light' | 'dark' | null
  const isDark = scheme === 'dark';
  const theme = colors[isDark ? 'dark' : 'light'];

  const styles = (light: object, dark?: object) =>
    isDark && dark ? dark : light;

  return { theme, isDark, styles };
}

// Uso no componente:
function MeuComponente() {
  const { theme, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: theme.background, flex: 1 }}>
      <Text style={{ color: theme.text, fontSize: 17 }}>
        Modo {isDark ? 'escuro' : 'claro'}
      </Text>
      <View style={{
        backgroundColor: theme.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
      }}>
        <Text style={{ color: theme.textSecondary }}>Card secundário</Text>
      </View>
    </View>
  );
}

// NativeWind (alternativa — Tailwind no RN):
// npm install nativewind tailwindcss
// <View className="bg-white dark:bg-black flex-1">
// <Text className="text-black dark:text-white text-lg">
```

---

### 6. Tempo Estimado — MVP Realista

```
FASE 1 — Setup e estrutura (3-5 dias)
  ├─ Criar projeto Expo + expo-router
  ├─ Copiar src/ (hooks, types, utils, stores)
  ├─ Configurar Supabase no RN
  ├─ Auth Google + Supabase funcionando
  └─ Tema claro/escuro

FASE 2 — Telas core (2-3 semanas)
  ├─ Login / Onboarding (2 dias)
  ├─ Home / Dashboard (3 dias)
  ├─ Tela principal do produto (5 dias)
  ├─ Perfil + Configurações (2 dias)
  └─ Navegação completa (2 dias)

FASE 3 — Features mobile-specific (1-2 semanas)
  ├─ Push notifications (2 dias)
  ├─ Câmera / galeria (1 dia)
  ├─ Haptics + animações (2 dias)
  └─ Offline support básico (2 dias)

FASE 4 — Polimento + Submit (1 semana)
  ├─ Screenshots + metadados App Store
  ├─ TestFlight com 10 pessoas
  ├─ Fix bugs encontrados
  └─ Submit para review

TOTAL MVP REALISTA:
  1 dev experiente em RN: 5-6 semanas
  1 dev vindo do React/Next.js: 8-10 semanas
  2 devs: 4-5 semanas

ACELERADORAS:
  ✅ Supabase já configurado → economiza 1 semana
  ✅ Lógica (hooks/types) existente → economiza 1 semana
  ✅ Design system Next.js definido → facilita RN

PEGADINHAS QUE ADICIONAM TEMPO:
  ⚠️  Primeira vez no Xcode/provisioning → +2-3 dias
  ⚠️  App rejeitado na review → +1 semana (resubmit)
  ⚠️  Push notifications APNs → +2 dias
  ⚠️  Animações complexas → +tempo indefinido
  ⚠️  Suporte a iPad além de iPhone → +30% do tempo UI
```

**Ordem de prioridade para MVP:**
```
Semana 1: Auth + 1 tela core funcionando
Semana 2-3: Fluxo principal completo
Semana 4: Polimento iOS (safe area, teclado, gestos)
Semana 5: TestFlight + submit
```

