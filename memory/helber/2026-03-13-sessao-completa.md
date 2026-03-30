# 2026-03-13 — Sessão Completa (Backup antes do reset)

## 🎯 PROJETO PRINCIPAL: Manda a Nota

### O Que É
Sistema único de emissão automática de NFS-e para MEI no Brasil. Usuário descreve serviço em chat/voz → nota emitida no portal gov.br.

### Repositórios
- **Site + Backend:** `/Users/macmini03/Desktop/mandaanota/`
- **Mobile Android:** `/Users/macmini03/Desktop/mandaanota/mobile-android/`
- **Shadow API:** `/Users/macmini03/Desktop/HelberDev/Projetos/Criacao de APIs/backend/`

### Deploy
- **Site:** Railway → `mandaanota.titanio.studio`
- **Shadow API:** Railway → `aplicativo-api-production-5163.up.railway.app`
- **App Android:** Play Store → `com.mandaanota.app`
- **App iOS:** ⏳ Em processo de build para App Store

---

## 📱 ESTADO ATUAL DO iOS (ONDE PARAMOS)

### O que já temos ✅
- Certificado Apple Distribution instalado (Titanio Producoes Artisticas Ltda)
- Team ID: TY646U2BYX
- Bundle ID: com.mandaanota.app
- Provisioning Profile "Manda A Nota" (Type: App Store, Active, Expires 2027/03/12)

### Arquivos na Área de Trabalho
- `TitanioDistribution.key` - Chave privada
- `TitanioDistribution.p12` - Certificado + chave (senha: 123456)
- `distribution.cer` - Certificado Apple Distribution
- `Manda_A_Nota.mobileprovision` - Profile App Store
- `iOS-Certificado-Guia-Completo.md` - Guia completo

### Último comando tentado
```bash
cd /Users/macmini03/Desktop/mandaanota/mobile-android/ios && \
xcodebuild -workspace MandaaNota.xcworkspace \
  -scheme MandaaNota \
  -configuration Release \
  -destination generic/platform=iOS \
  archive \
  -archivePath /Users/macmini03/Desktop/MandaaNota.xcarchive \
  DEVELOPMENT_TEAM=TY646U2BYX \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  PROVISIONING_PROFILE_SPECIFIER="Manda A Nota" \
  CODE_SIGN_STYLE=Manual \
  -allowProvisioningUpdates
```

### Próximo passo
1. Verificar se o Archive foi criado em ~/Desktop/MandaaNota.xcarchive
2. Se sim: Upload para App Store Connect via Xcode Organizer
3. Depois: Testar via TestFlight

---

## ✅ O QUE JÁ FOI FEITO (Sessões 10-13 Março)

### Emissão NFS-e
- ✅ Wizard 4 etapas para TODOS os usuários (removido fluxo simplificado)
- ✅ Endereço do tomador na emissão A1 (busca pelo CNPJ)
- ✅ NFS-e automática de vendas (quando alguém compra plano)
- ✅ Email automático com PDF após emissão de vendas
- ✅ Descrição: "Compra de plano de aplicativo - Plano [Nome]"
- ✅ Valor: direto do Stripe (session.amount_total)

### Resiliência
- ✅ Keep-alive: Manda a Nota pinga Shadow API cada 4 min
- ✅ Retry com backoff: 3 tentativas em erros de conexão
- ✅ Endpoints /health e /ping na Shadow API

### App Mobile
- ✅ PDF download via expo-sharing
- ✅ Botão WhatsApp baixa PDF e compartilha
- ✅ Anti-triplicação (debounce 3s)
- ✅ Sync iOS/Android (build number 15)

### Site
- ✅ Botão WhatsApp atualizado (Web Share API + PDF)

---

## 🔑 CONFIGURAÇÃO ATUAL OpenClaw

### Chave Única
```
ANTHROPIC_API_KEY=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
```

### Referência de chaves salva em
`/Users/macmini03/Desktop/OpenClaw-Chaves-Config.md`

---

## 📁 ARQUIVOS IMPORTANTES

### Memória
- `/Users/macmini03/.openclaw/workspace/MEMORY.md` - Memória de longo prazo
- `/Users/macmini03/.openclaw/workspace/memory/` - Memórias diárias

### Documentação
- `/Users/macmini03/.openclaw/workspace/memory/mandaanota-arquitetura.md` - Arquitetura completa
- `/Users/macmini03/Desktop/iOS-Certificado-Guia-Completo.md` - Guia iOS

---

## 🧠 CONTEXTO HELBER

- Nome: Helber Gomes
- WhatsApp: +553189336628
- Empresa: Titânio (São Paulo)
- Projeto principal: Manda a Nota
- Disse: "Você tá fazendo o impossível, esse aplicativo é considerado impossível de tão único"

---

## ⏭️ PRÓXIMOS PASSOS (para retomar)

1. **Verificar se Archive iOS foi criado**
2. **Upload para App Store Connect**
3. **Configurar TestFlight para testes**
4. **Publicar na App Store**

---

_Backup salvo às 10:40 de 13/03/2026_
_Sessão: 195k/200k tokens (97%)_
