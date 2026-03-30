# 🚀 DASHBOARD SCRAPER INTEGRATION GUIDE

**Data:** 2026-03-22 19:25 BRT  
**Para:** Tita, Helber, Tiago  
**Status:** ✅ **PRONTO PARA INSTALAÇÃO**

---

## 📋 O Que Você Recebe

Quando você instalar a Dashboard amanhã, já vai ter **TITA Scraper integrado**:

✅ **Backend Endpoint:** `POST /api/tools/scrape`  
✅ **Frontend UI:** Nova página `/tools/scraper`  
✅ **Cache Management:** Automático (24h)  
✅ **Proxy Support:** Fallback automático  
✅ **Rate Limiting:** Inteligente por domínio

---

## 🔧 INTEGRAÇÃO NO BACKEND

**Arquivo:** `code/backend/src/routes/scraper.ts` (já criado)

### Passo 1: Importar router

Em `code/backend/src/index.ts`:

```typescript
import scraperRoutes from './routes/scraper';

// Add depois de outras rotas
app.use('/api/tools', scraperRoutes);
```

### Passo 2: Garantir que TITA-SCRAPER está instalado

Quando você rodar `install-dashboard.sh`, ele copia:

```bash
cp /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-scraper-v2 \
   /LOCAL_MAC_WORKSPACE/bin/tita-scraper-v2

chmod +x /LOCAL_MAC_WORKSPACE/bin/tita-scraper-v2
```

### Passo 3: Atualizar path do script no backend

Em `scraper.ts`, ajuste se necessário:

```typescript
// Se você tá em Mac com workspace diferente
const SCRAPER_SCRIPT = '/SEU_WORKSPACE/bin/tita-scraper-v2';
```

### Pronto! Endpoint pronto:

```bash
# Testar
curl -X POST http://localhost:4444/api/tools/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## 🎨 INTEGRAÇÃO NO FRONTEND

**Arquivo:** `code/frontend/src/pages/tools/scraper.tsx` (já criado)

### Passo 1: Adicionar rota

Em `code/frontend/src/app.tsx` ou router:

```typescript
import ScraperPage from './pages/tools/scraper';

// Adicionar rota
<Route path="/tools/scraper" element={<ScraperPage />} />
```

### Passo 2: Adicionar menu item

Na navbar/menu principal, adicione:

```tsx
<Link to="/tools/scraper" className="nav-item">
  🧪 Scraper
</Link>
```

### Passo 3: Deploy

```bash
cd code/frontend
npm install
npm run build
npm start
```

### Acesso:

```
http://localhost:3000/tools/scraper
```

---

## 📦 O QUE FUNCIONA AUTOMATICAMENTE

### 1. SCRAPE COM CACHE
```
Primeira vez:  URL → scrape → resultado cacheado
Segunda vez:   URL → cache hit (instantâneo) ✅
```

### 2. PROXY FALLBACK
```
Tentativa 1: Sem proxy
Falha? → Tentativa 2: COM proxy aleatório
```

### 3. RATE LIMITING
```
Request A para example.com → timestamp
Request B para example.com → se < 2s → aguarda
```

### 4. CACHE MANAGEMENT
```
UI mostra todos os cached items
Você pode deletar um por um
Ou deixar expirar em 24h
```

---

## 🎯 COMO USAR NA DASHBOARD

### Via UI (Frontend)

1. Acesse: `http://localhost:3000/tools/scraper`
2. Cole URL: `https://example.com`
3. Opcional: CSS selector (ex: `article`, `.content`)
4. Opcional: Ativa "Use Proxy" se primeiro scrape falhar
5. Clica "🚀 Scrape"
6. Resultado aparece com preview
7. Clica "📦 View Cache" pra ver o que tá armazenado

### Via API (Backend)

```bash
# Scrape simples
curl -X POST http://localhost:4444/api/tools/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Com selector
curl -X POST http://localhost:4444/api/tools/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "selector": "article"}'

# Com proxy
curl -X POST http://localhost:4444/api/tools/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "useProxy": true}'

# Ver cache
curl http://localhost:4444/api/tools/scrape/cache

# Deletar cache item
curl -X DELETE http://localhost:4444/api/tools/scrape/cache/HASH
```

---

## 🔐 CREDENCIAIS & PATHS

### Por cada Mac (Local)
```
SCRAPER_SCRIPT = /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-scraper-v2
CACHE_DIR = /tmp/tita-scraper-cache

# Quando você instalar em outro Mac:
SCRAPER_SCRIPT = /Volumes/YOUR_DRIVE/YOUR_WORKSPACE/bin/tita-scraper-v2
CACHE_DIR = /tmp/tita-scraper-cache (mesmo em todos)
```

### Credenciais não necessárias
- Scraper funciona sem API keys
- Proxy é fallback (gratuito)
- Cache é local (sem cloud)

---

## 📊 MONITORING

### Logs

```bash
# Backend logs (se implementado)
tail -f /tmp/tita-scraper.log

# Cache status
ls -lh /tmp/tita-scraper-cache/

# Verificar tamanho do cache
du -sh /tmp/tita-scraper-cache/
```

### Stats (na UI)

```
Total requests: 50
Successful: 48 (96%)
Cached: 25
Failed: 2
```

---

## 🛠️ TROUBLESHOOTING

### "Scraper script not found"
```
Verifique path em scraper.ts
Certifique que chmod +x foi executado
```

### "Cache hit but content empty"
```
Cache pode ter expirado (24h)
Delete o item e tente novamente
```

### "Request timed out"
```
URL pode estar offline
Ativa proxy mode se 1ª tentativa falhar
Aumenta timeout em tita-scraper-v2
```

### "Permission denied"
```
chmod +x /bin/tita-scraper-v2
Ou rode Dashboard como admin
```

---

## 🎯 PRÓXIMAS FEATURES (Futuro)

- [ ] Webhook notifications (quando scrape termina)
- [ ] Integração com especialistas (ex: ImageDownloader especialista)
- [ ] Agendamento de scrapes periódicos
- [ ] Multi-URL batch scraping
- [ ] Custom headers por domínio
- [ ] JavaScript execution tracking

---

## 📝 CHECKLIST INSTALAÇÃO

### Para Helber/Tiago (Amanhã)

- [ ] Clonar repo/instalar Dashboard
- [ ] Copiar `/bin/tita-scraper-v2`
- [ ] Copiar `code/backend/src/routes/scraper.ts`
- [ ] Copiar `code/frontend/src/pages/tools/scraper.tsx`
- [ ] Add imports em `index.ts` (backend) e router (frontend)
- [ ] Testar: `npm start` backend + frontend
- [ ] Acessar: `http://localhost:3000/tools/scraper`
- [ ] Fazer scrape de teste
- [ ] Verificar cache criado em `/tmp/tita-scraper-cache/`

---

## 🎉 RESULTADO

**Depois de integração:**

✅ Scraper rodando na Dashboard  
✅ UI limpa pra fazer scrapes  
✅ Cache automático  
✅ Proxy fallback  
✅ Rate limiting  
✅ Pronto pra use cases reais

---

## 📞 SUPPORT

Se algo quebrar:

1. Check logs: `tail -f backend.log`
2. Verify path de scraper
3. Test API direto: `curl /api/tools/scrape`
4. Check perms: `ls -l /bin/tita-scraper-v2`

---

**Status:** ✅ Pronto pra instalar em qualquer Mac amanhã

