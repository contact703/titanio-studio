# Análise — Apple Developer Program License Agreement
**Data:** 23/03/2026 | **Analisado por:** Legal Advisor / Memory Bot
**PDF:** pasta-do-tita/contratos/apple-developer-program-license-2026.pdf

## Pontos Críticos para a Titânio

### Distribuição de Apps
- Apps iOS/iPadOS/macOS/tvOS/visionOS/watchOS → via App Store (selecionado pela Apple)
- Distribuição limitada em Registered Devices (testes internos)
- Beta testing via TestFlight
- Apps gratuitos → Schedule 1
- Apps pagos / In-App Purchase → **Schedule 2 obrigatório**

### In-App Purchase (crítico para Manda a Nota)
- Obrigatório para conteúdo digital pago na App Store
- PricingModal já usa StoreKit (react-native-iap) ✅
- Qualquer bypass (link externo Stripe etc.) → **rejeição garantida** ← foi o problema!

### Guideline 3.1.1 (causa das rejeições)
- App Store In-App Purchase obrigatório para assinaturas digitais
- Não pode haver link externo de pagamento para conteúdo digital
- Aplicável a: basic_monthly, pro_monthly, enterprise_monthly do Manda a Nota

### Termos Importantes
- Apple pode revogar certificados a qualquer momento
- Apps devem cumprir todas as App Store Guidelines
- EQUIPE: TY646U2BYX (Titanio Producoes Artisticas Ltda)
- Renovação da assinatura: 11 de março de 2027 (US$99/ano)
- Email da conta: contact@titaniofilms.com

### Atenção — Contrato de Apps Pagos (Schedule 2)
- Para cobrar por apps ou In-App Purchase, precisa aceitar o Schedule 2
- Verificar se já está aceito em App Store Connect → Contratos

## Status
- Contrato recebido e analisado em 23/03/2026
- Arquivo preservado em pasta-do-tita/contratos/
