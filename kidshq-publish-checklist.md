# KidsHQ Play Console - Checklist de Publicação

## Arquivos Prontos para Upload

### KidsHQ HQ (App dos Pais)
- **AAB**: `/tmp/openclaw/uploads/kidshq-hq-v4.aab` (34MB, versionCode 4, targetSdk 35)
- **Ícone**: `/tmp/openclaw/uploads/kidshq-hq-icon.png` (512x512)
- **Screenshots**: `/tmp/openclaw/uploads/kidshq-screen1.png`, `screen2.png`, `screen3.png`
- **Feature Graphic**: N/A (não criado)

### KidsHQ Kids (App das Crianças)
- **AAB**: `/tmp/openclaw/uploads/kidshq-kids-release.aab` (5.4MB, versionCode 1)
- **Ícone**: `/tmp/openclaw/uploads/kidshq-kids-icon.png` (512x512)
- **Feature Graphic**: `/tmp/openclaw/uploads/kidshq-kids-feature.png` (1024x500)
- **Screenshots**: `/tmp/openclaw/uploads/kidshq-kids-screen1.png`, `screen2.png`, `screen3.png`

---

## Configurações já Feitas

### KidsHQ HQ ✅
- [x] App criado (ID: 4972983290233964590)
- [x] Store listing (nome, descrições)
- [x] Content rating (L/Everyone)
- [x] Target audience (18+)
- [x] Data safety preenchido
- [x] Categoria: Tools
- [x] 177 países selecionados
- [x] Release criado (aguardando AAB)

### KidsHQ Kids ✅
- [x] App criado (ID: 4975253365929803196)
- [x] Nome: KidsHQ Kids
- [x] Tipo: App / Free
- [ ] Store listing completa
- [ ] Content rating
- [ ] Data safety
- [ ] Categoria
- [ ] Países
- [ ] Release

---

## O que Falta Fazer Manualmente

### KidsHQ Kids - Store Listing
1. Acesse: https://play.google.com/console/u/0/developers/5325699403726106959/app/4975253365929803196/main-store-listing
2. Upload dos assets:
   - App icon: `kidshq-kids-icon.png`
   - Feature graphic: `kidshq-kids-feature.png`
   - Phone screenshots: `kidshq-kids-screen1/2/3.png`
3. Clique "Save"

### KidsHQ Kids - Configurações
4. Privacy policy: `https://titaniofilms.com/kids/privacy-policy`
5. App access: "All functionality available"
6. Ads: No
7. Content rating: All Other App Types, todas "No"
8. Target audience: 18+
9. Data safety: similar ao HQ
10. Category: Tools
11. Contact: contact@titaniofilms.com
12. Countries: All 177

### Releases
13. Production → Create release
14. Upload AAB correspondente
15. Release notes en-US: "First release"
16. Release notes pt-BR: "Primeiro lançamento"
17. Send for review

---

## Problema Conhecido
O upload de arquivos (ícones, screenshots, AABs) não funciona via automação do browser. Você precisará fazer esses uploads manualmente no Play Console.

Todos os arquivos estão em: `/tmp/openclaw/uploads/`
