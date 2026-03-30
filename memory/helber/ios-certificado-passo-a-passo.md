# Passo a Passo: Certificado iOS para App Store

_Guia para criar certificados e publicar apps na App Store_
_Criado: 12/03/2026_

---

## Pré-requisitos

- Conta Apple Developer ($99/ano)
- Mac com Xcode instalado
- Projeto Expo/React Native com pasta `ios/`

---

## 1. Registrar App ID

**Portal:** https://developer.apple.com/account/

1. Vai em **Certificates, Identifiers & Profiles**
2. Clica em **Identifiers** → **+**
3. Escolhe **App IDs** → **App** → **Continue**
4. Preenche:
   - **Description:** Nome do App (ex: Manda a Nota)
   - **Bundle ID:** Explicit → `com.seuapp.id`
5. Capabilities: marca **Push Notifications** (opcional)
6. **Continue** → **Register**

---

## 2. Criar Distribution Certificate

### 2.1 Gerar arquivo CSR (no Mac)

```bash
cd ~/Desktop
openssl req -new -newkey rsa:2048 -nodes \
  -keyout NomeApp.key \
  -out NomeApp.certSigningRequest \
  -subj "/emailAddress=seu@email.com/CN=Nome Empresa/C=BR"
```

**Arquivos gerados:**
- `NomeApp.key` - Chave privada (GUARDAR!)
- `NomeApp.certSigningRequest` - Arquivo para upload

### 2.2 Criar certificado no portal

1. Vai em **Certificates** → **+**
2. Escolhe **Apple Distribution**
3. **Continue**
4. Faz upload do arquivo `.certSigningRequest`
5. **Continue** → **Download**
6. **Duplo-clique** no arquivo `.cer` para instalar no Keychain

---

## 3. Criar Provisioning Profile

1. Vai em **Profiles** → **+**
2. Escolhe **App Store Connect** (em Distribution)
3. **Continue**
4. Seleciona o App ID criado
5. **Continue**
6. Seleciona o certificado Apple Distribution
7. **Continue**
8. Nome: `NomeApp App Store`
9. **Generate** → **Download**
10. **Duplo-clique** no arquivo `.mobileprovision` para instalar

---

## 4. Configurar Xcode

### Via Interface:
1. Abre o `.xcworkspace` no Xcode
2. Seleciona o projeto na sidebar
3. Target → **Signing & Capabilities**
4. Marca **Automatically manage signing**
5. Seleciona o **Team**

### Via Linha de Comando:
```bash
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination generic/platform=iOS \
  archive \
  -archivePath ~/Desktop/App.xcarchive \
  DEVELOPMENT_TEAM=TEAM_ID \
  CODE_SIGN_STYLE=Automatic \
  -allowProvisioningUpdates
```

---

## 5. Criar Archive

### Via Xcode:
1. Menu: **Product → Archive**
2. Aguarda o build (~5-10 min)
3. Abre o **Organizer** automaticamente

### Via Linha de Comando:
```bash
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination generic/platform=iOS \
  archive \
  -archivePath ~/Desktop/App.xcarchive \
  -allowProvisioningUpdates
```

---

## 6. Upload para App Store Connect

### Via Xcode Organizer:
1. No Organizer, seleciona o Archive
2. Clica **Distribute App**
3. Escolhe **App Store Connect**
4. **Upload**

### Via Transporter (app da Apple):
1. Baixa o Transporter na Mac App Store
2. Exporta o IPA do Archive
3. Arrasta o IPA para o Transporter
4. **Deliver**

---

## 7. App Store Connect

**Portal:** https://appstoreconnect.apple.com/

1. Cria o app em **My Apps** → **+**
2. Preenche metadados:
   - Nome, descrição, screenshots
   - Categoria, palavras-chave
   - Informações de contato
3. Seleciona o build enviado
4. **Submit for Review**

---

## Informações Importantes

### Team ID Titanio
- **Team ID:** TY646U2BYX
- **Nome:** Titanio Producoes Artisticas Ltda

### Certificados no Mac
Verificar certificados instalados:
```bash
security find-identity -v -p codesigning
```

### Arquivos Importantes (GUARDAR!)
- `.key` - Chave privada do certificado
- `.cer` - Certificado (pode baixar novamente)
- `.mobileprovision` - Profile (pode baixar novamente)
- `.p12` - Exportação do certificado com chave (para outros Macs)

### Exportar certificado para outro Mac:
1. Abre **Keychain Access**
2. Encontra o certificado "Apple Distribution"
3. Botão direito → **Export**
4. Salva como `.p12` com senha
5. No outro Mac: duplo-clique no `.p12`

---

## Automação Futura

### Via Fastlane (recomendado):
```bash
# Instalar
gem install fastlane

# Iniciar
cd ios && fastlane init

# Configurar match (gerencia certificados)
fastlane match init
fastlane match appstore

# Build e upload
fastlane release
```

### Via EAS Build (Expo):
```bash
# Instalar
npm install -g eas-cli

# Login
eas login

# Configurar
eas build:configure

# Build para App Store
eas build --platform ios --profile production

# Submit
eas submit --platform ios
```

---

_Este guia pode ser usado para futuros apps iOS da Titanio._
