# 🍎 Credenciais Apple — Compartilhadas entre Especialistas
**Criado em 23/03/2026 | Válido para TODOS os apps da Titanio**

---

## 🔑 Conta Apple Developer

| Campo | Valor |
|-------|-------|
| Apple ID (email) | contact@titaniofilms.com |
| Team ID | TY646U2BYX |
| Empresa | Titanio Producoes Artísticas Ltda |
| App-specific password | hsyx-tswd-rfwi-gpaw |
| Renovação | 11/03/2027 (US$99/ano) |

> ⚠️ Para xcrun altool: SEMPRE usar email `contact@titaniofilms.com`, NUNCA username

---

## 📦 Manda a Nota (app atual)

| Campo | Valor |
|-------|-------|
| Bundle ID | com.mandaanota.app |
| App ID (ASC) | 6760551029 |
| Provisioning Profile UUID | caa1e060-5de7-4c98-ac10-4cb64331b4be |
| Reviewer login | reviewer@mandaanota.app |
| Reviewer senha | AppLeTest* |
| Contato revisão | mandaanota@titanio.studio |
| Build atual | 20 (v1.3.0) — Aguardando revisão |

---

## 🔧 Comandos Padrão (copiar e usar em qualquer app)

### Upload via altool
```bash
xcrun altool --upload-app \
  --type ios \
  --file "~/Desktop/NomeApp-Export/NomeApp.ipa" \
  --apple-id "ID_DO_APP_NO_ASC" \
  --bundle-version "NUMERO_BUILD" \
  --bundle-short-version-string "VERSAO" \
  --username "contact@titaniofilms.com" \
  --password "hsyx-tswd-rfwi-gpaw"
```

### Verificar IPA (confirmar iPhone-only)
```bash
cd /tmp && mkdir ipa_check && cd ipa_check
unzip -q ~/Desktop/NomeApp-Export/NomeApp.ipa -d .
plutil -p ./Payload/NomeApp.app/Info.plist | grep UIDeviceFamily
# iPhone-only = [ 0 => 1 ]
# iPhone+iPad = [ 0 => 1, 1 => 2 ]
```

### Fluxo de troca de build na submissão (CRÍTICO)
```
App Store Connect → App → Distribuição → Versão
→ Compilação → Apagar build antigo (ícone lixeira)
→ Adicionar compilação → Selecionar novo build
→ Salvar → Adicionar para revisão → Enviar para revisão
```

---

## 📋 Conformidade de Exportação
Para apps que usam APENAS HTTPS (sem criptografia própria):
> "Nenhum dos algoritmos mencionados acima"

Para apps com criptografia customizada: consultar Security Guardian.

---

## 📱 Regras para Novos Apps

### Dispositivos suportados
- iPhone-only: `supportsTablet: false` + `TARGETED_DEVICE_FAMILY = "1"`
- iPhone + iPad: `supportsTablet: true` + `TARGETED_DEVICE_FAMILY = "1,2"` (exige screenshots iPad)
- Sempre confirmar no IPA final com `plutil` antes de subir

### Screenshots obrigatórias
- iPhone 6,5 pol: obrigatório (sempre)
- iPad Pro 12,9: obrigatório SE app suportar iPad
- Apple Watch: opcional

### Reviewer credentials por app
Criar email `reviewer@nomeapp.app` com senha padrão `AppLeTest*` (ou variar)

