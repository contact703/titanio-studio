# 🛠️ TITA-SCRAPER — Guia para a Equipe

**Data:** 2026-03-22 23:10 UTC / 20:10 BRT  
**Para:** Zica, Helber, Tiago, Eduardo  
**O que é:** Ferramenta para acessar qualquer site (mesmo bloqueado) e extrair conteúdo

---

## 🎯 O QUE É TITA-SCRAPER

Basicamente: **um robô que abre sites como navegador real e copia o conteúdo**.

```
❌ Forma antiga (não funciona):
curl https://instagram.com/reel/XXX
→ Instagram bloqueia → erro

✅ Forma nova (TITA-SCRAPER):
Abre Chrome de verdade
→ Parece um usuário real
→ Instagram permite
→ Extrai conteúdo
```

---

## 🤔 POR QUE PRECISAMOS

**Problema:**
- Instagram, YouTube, sites dinâmicos bloqueiam requisições simples
- `web_fetch` (curl) não funciona neles
- Precisa de browser real com JavaScript rendering

**Solução:**
- TITA-SCRAPER usa Playwright (simulador de navegador)
- Parece Chrome/Firefox de verdade
- Instagram/YouTube/etc deixam acessar
- Extrai qualquer conteúdo visível

---

## 🚀 COMO FUNCIONA

### Passo a passo:

```
1. Você chama: tita-scraper "https://instagram.com/reel/XXX"
   ↓
2. Script abre Chrome headless (invisível)
   ↓
3. Chrome acessa URL (Instagram vê como navegador normal)
   ↓
4. Aguarda carregamento (networkidle = tudo pronto)
   ↓
5. Extrai HTML/conteúdo
   ↓
6. Retorna JSON com dados
   ↓
7. Você usa os dados (links, descrição, etc)
```

### Features internas:

```
✅ User-Agent real (Chrome, Firefox, Safari alternando)
✅ Delays aleatórios (não acessa instantaneamente)
✅ Headers realistas (Accept, DNT, etc)
✅ Timeout de 30s (não trava infinitamente)
✅ Caching (não repete scrape da mesma URL)
✅ JSON output (fácil de processar)
```

---

## 📝 COMO USAR

### Opção 1: Linha de Comando

```bash
# Scraping básico
python3 /bin/tita-scraper-simple "https://instagram.com/reel/DWND0avCJf_/"

# Com seletor CSS (extrair elemento específico)
python3 /bin/tita-scraper-simple "https://example.com" --selector "article"

# Salvar em arquivo JSON
python3 /bin/tita-scraper-simple "https://example.com" --output result.json
```

### Opção 2: Python Script

```python
from pathlib import Path
import json
import subprocess

# Função helper
def scrape(url, selector=None):
    cmd = ['python3', '/bin/tita-scraper-simple', url]
    if selector:
        cmd.extend(['--selector', selector])
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(result.stdout)

# Uso
data = scrape("https://instagram.com/reel/XXX")
print(f"Conteúdo: {data['content'][:500]}")
print(f"Tamanho: {data['content_length']} chars")
```

### Opção 3: Bash Script

```bash
#!/bin/bash

URL="https://instagram.com/reel/DWND0avCJf_/"
SCRAPER="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-scraper-simple"

echo "🌐 Scraping: $URL"
python3 "$SCRAPER" "$URL" | jq '.content_length'

echo "✅ Done"
```

---

## 📊 EXEMPLOS REAIS

### Exemplo 1: Extrair descrição de Instagram reel

```bash
python3 /bin/tita-scraper-simple \
  "https://www.instagram.com/reel/DWND0avCJf_/" \
  --output reel-content.json

# Resultado em reel-content.json:
cat reel-content.json | jq '.content' | grep -i "UI UX Pro Max"
```

### Exemplo 2: Scraping de artigo de notícia

```bash
python3 /bin/tita-scraper-simple \
  "https://exemplo.com/artigo" \
  --selector "article" \
  --output artigo.json
```

### Exemplo 3: Extrair dados com Python

```python
import json
import subprocess

def get_instagram_content(url):
    result = subprocess.run([
        'python3', '/bin/tita-scraper-simple', url
    ], capture_output=True, text=True)
    
    data = json.loads(result.stdout)
    
    if data['success']:
        # Processa conteúdo
        content = data['content']
        
        # Extrai texto
        text = re.sub(r'<[^>]+>', '', content)  # Remove HTML
        
        return {
            'text': text[:1000],
            'size': data['content_length'],
            'url': data['url']
        }
    
    return None

# Uso
info = get_instagram_content("https://instagram.com/reel/XXX")
print(info)
```

---

## 🔗 INTEGRAÇÃO NA DASHBOARD

### Backend (Node.js)

```typescript
// routes/scraper.ts
import { execSync } from 'child_process';

app.post('/api/scrape', (req, res) => {
    const { url, selector } = req.body;
    
    try {
        let cmd = `python3 /bin/tita-scraper-simple "${url}"`;
        if (selector) {
            cmd += ` --selector "${selector}"`;
        }
        
        const output = execSync(cmd).toString();
        const data = JSON.parse(output);
        
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});
```

### Frontend (React)

```tsx
// pages/tools/scraper.tsx
import { useState } from 'react';

export default function ScraperPage() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleScrape = async () => {
        setLoading(true);
        
        const res = await fetch('/api/scrape', {
            method: 'POST',
            body: JSON.stringify({ url })
        });
        
        const data = await res.json();
        setResult(data.data);
        setLoading(false);
    };
    
    return (
        <div>
            <input value={url} onChange={e => setUrl(e.target.value)} />
            <button onClick={handleScrape} disabled={loading}>
                {loading ? 'Scraping...' : 'Scrape'}
            </button>
            {result && (
                <div>
                    <p>Size: {result.content_length} chars</p>
                    <p>Content: {result.content.substring(0, 200)}...</p>
                </div>
            )}
        </div>
    );
}
```

---

## ⚠️ LIMITAÇÕES E CUIDADOS

### O que funciona:
```
✅ Instagram reels, posts, histórias
✅ YouTube (página, descrição)
✅ Sites com JavaScript pesado
✅ Conteúdo dinâmico (comentários, likes)
✅ Logins simples (usuário/senha)
```

### O que NÃO funciona:
```
❌ Videos/áudios (extrai link, não arquivo)
❌ Conteúdo privado (precisa login)
❌ Sites com CloudFlare Enterprise (desafio complexo)
❌ Conteúdo Adobe Flash (desatualizado)
```

### Rate Limiting:
```
⚠️ Não fazer scrape da mesma URL >10x por hora
⚠️ Não fazer scrape massivo de domínio (Instagram bloqueia)
⚠️ Usar delays entre requisições (já vem automático)
```

---

## 📋 CHECKLIST PARA USAR

- [ ] Verificar se Playwright instalado: `pip3 list | grep playwright`
- [ ] Se não: `pip3 install playwright && playwright install`
- [ ] Testar scraper: `python3 /bin/tita-scraper-simple "https://example.com"`
- [ ] Se funcionar: usar normalmente
- [ ] Se falhar: reportar erro + URL

---

## 🚨 TROUBLESHOOTING

### Erro: "Playwright not installed"
```bash
pip3 install playwright
playwright install
```

### Erro: "Timeout"
URL está muito pesada ou site está down
```bash
# Tentar de novo em 5 min
sleep 300
python3 /bin/tita-scraper-simple "$URL"
```

### Erro: "Permission denied"
```bash
chmod +x /bin/tita-scraper-simple
```

### Erro: "This event loop is already running"
Use `/bin/tita-scraper-simple` (não v2)

---

## 💡 DICAS

### 1. Cachear resultados
```bash
# Primeira vez (pode demorar)
python3 /bin/tita-scraper-simple "https://example.com" > cache.json

# Segunda vez (instantâneo)
cat cache.json  # reutiliza resultado
```

### 2. Extrair informação específica
```bash
python3 /bin/tita-scraper-simple "https://example.com" | \
  jq '.content' | \
  grep -i "palavra-chave"
```

### 3. Integrar em N8n workflow
```json
{
  "nodes": [
    {
      "name": "HTTP Request",
      "type": "httpRequest",
      "url": "http://localhost:4444/api/scrape",
      "method": "POST",
      "body": {
        "url": "https://example.com"
      }
    }
  ]
}
```

---

## 📞 SUPORTE

**Se não funcionar:**
1. Verificar path: `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-scraper-simple`
2. Testar: `python3 /bin/tita-scraper-simple "https://example.com"`
3. Reportar erro exato + URL
4. Eu fixo

---

## 🎯 PARA CADA PESSOA

### Zica (Operacional)
- Use: `python3 /bin/tita-scraper-simple "URL"`
- Ou via Dashboard: POST `/api/scrape`
- Extrair dados de qualquer site

### Helber/Tiago (Integração)
- Documentação: este arquivo
- Exemplos: acima
- Integrar em seus projetos: Backend + Frontend code

### Eduardo (Produção)
- Monitorar rate limits
- Não scrape massivo
- Usar caching quando possível

---

## ✅ STATUS

| Aspecto | Status |
|---------|--------|
| Script | ✅ Operacional |
| Teste | ✅ Confirmado |
| Documentação | ✅ Completa |
| Dashboard | ✅ Integrado |
| Suporte | ✅ Disponível |

---

**Criado:** 2026-03-22 23:10 UTC  
**Responsável:** Tita 🐾  
**Próximas atualizações:** conforme necessário

