# ios-specialist — Lições
## Regras
- Atualizar após cada tarefa

## Lições iOS Session — 2026-03-23
- ✅ supportsTablet=true exige iPad screenshots obrigatório — fix: TARGETED_DEVICE_FAMILY=1
- ✅ Fix iPhone-only: app.json supportsTablet=false + project.pbxproj TARGETED_DEVICE_FAMILY=1
- ✅ xcrun altool requer EMAIL da conta Apple ID, não username

## Lições Críticas — iPad/iPhone (23/03/2026)
- ✅ REGRA OURO: supportsTablet=true desde build 1 original (código herdado, não mudança da Titanio)
- ✅ NUNCA assumir que a configuração de dispositivo está correta — sempre checar git log
- ✅ iPhone-only exige AMBOS: app.json supportsTablet:false + project.pbxproj TARGETED_DEVICE_FAMILY="1"
- ✅ Upload de novo build NÃO atualiza a submissão — precisa trocar manualmente na seção Compilação
- ✅ IPA correto = UIDeviceFamily=[1] (confirmar com unzip + plutil antes de submeter)
