# instagramer — Memória
# 📱 Instagram — Todas as Técnicas + Setup Completo
> Para: Tiago | Criado por Tita 🐾 em 26/03/2026
> **REGRA:** Tente cada técnica em ordem. Não desista na primeira.

---

## ✅ O QUE VOCÊ JÁ TEM INSTALADO

Confirme que tudo está ok:

```bash
# Verificar ferramentas instaladas
ffmpeg -version | head -1
yt-dlp --version
python3 --version
pip3 list | grep playwright
```

```bash
# Verificar scripts disponíveis
ls ~/.openclaw/workspace/bin/
# Deve ter: video-analyze.sh, tita-scraper, tita-scraper-simple, tita-scraper-v2

# Verificar script Python
ls ~/.openclaw/workspace/pasta-do-tita/download_instagram.py
```

Se algum estiver faltando → seção de instalação abaixo.

---

## 🔧 INSTALAÇÃO (se precisar)

```bash
# ffmpeg
brew install ffmpeg

# yt-dlp
brew install yt-dlp

# Playwright (para TITA-SCRAPER)
pip3 install playwright
playwright install chromium

# Verificar tudo
ffmpeg -version | head -1 && yt-dlp --version && python3 -c "import playwright; print('playwright ok')"
```

---

## ⚡ REGRA DE OURO

```
Nunca dependa de uma técnica só.
Instagram bloqueia diferente dependendo do conteúdo, hora e conta.
Tente TODAS antes de dizer que não conseguiu.
```

**Ordem de tentativa:**
1. video-analyze.sh (mais rápido para vídeos)
2. TITA-SCRAPER Playwright (mais robusto)
3. download_instagram.py (alternativa Python)
4. Screenshot (quando só precisa ver)
5. yt-dlp com cookies (conteúdo privado/login)

---

## 🥇 TÉCNICA 1 — video-analyze.sh (yt-dlp + ffmpeg + Claude)

**Melhor para:** Reels, vídeos públicos, análise de conteúdo visual

```bash
bash ~/.openclaw/workspace/bin/video-analyze.sh "URL_DO_REEL"

# Exemplo real que já funcionou:
bash ~/.openclaw/workspace/bin/video-analyze.sh "https://www.instagram.com/reel/DWNeDLhjpAt/"
```

**O que acontece:**
1. yt-dlp baixa o vídeo (~5-10s)
2. ffmpeg extrai 6 frames distribuídos ao longo do vídeo
3. Claude analisa as imagens e descreve o conteúdo

**Resultado esperado:** Descrição completa do que aparece no vídeo

**Se der erro de certificado:**
```bash
yt-dlp --no-check-certificates "URL" -o /tmp/video.mp4
ffmpeg -i /tmp/video.mp4 -vf "select=eq(n\,0)+eq(n\,50)+eq(n\,100)" /tmp/frame%d.jpg
```

**Se der "login required":** → vai para Técnica 5

---

## 🥈 TÉCNICA 2 — TITA-SCRAPER (Chrome headless real)

**Melhor para:** Perfis, posts de foto, descrições, hashtags, comentários, qualquer página

```bash
# Opção A — script direto
python3 ~/.openclaw/workspace/bin/tita-scraper-simple "https://www.instagram.com/reel/XXX/"

# Opção B — salvar resultado
python3 ~/.openclaw/workspace/bin/tita-scraper-simple "https://www.instagram.com/p/XXX/" --output /tmp/resultado.json

# Ver o conteúdo extraído
cat /tmp/resultado.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['content'][:2000])"
```

**Por que funciona:**
- Abre Chrome invisível de verdade
- Alterna User-Agent (Chrome/Firefox/Safari)
- Adiciona delays aleatórios (parece humano)
- Instagram vê como navegador normal

**Aguenta até 30s** — não cancele antes disso

---

## 🥉 TÉCNICA 3 — download_instagram.py (Python direto)

**Melhor para:** Quando técnica 1 falhar, download em massa

```bash
python3 ~/.openclaw/workspace/pasta-do-tita/download_instagram.py "URL"
```

Salva automaticamente em:
```
~/.openclaw/workspace/pasta-do-tita/instagram_downloads/
```

**Vídeos já baixados disponíveis (se precisar de frames):**
```bash
ls ~/.openclaw/workspace/pasta-do-tita/instagram_downloads/
# frames_eugustavo/, frames_morfeo/, frames_sina/ — já extraídos
```

---

## 📸 TÉCNICA 4 — Screenshot da página

**Melhor para:** Posts de foto, perfis, stories — quando não precisa do vídeo

```bash
# Tirar screenshot
python3 ~/.openclaw/workspace/bin/tita-scraper-simple "https://www.instagram.com/p/XXX/" --screenshot

# Ou via tita-scraper-v2
python3 ~/.openclaw/workspace/bin/tita-scraper-v2 "URL" --mode screenshot
```

Screenshot salva em `/tmp/screenshot-*.png` → passe para o Claude analisar via image tool.

---

## 🔐 TÉCNICA 5 — yt-dlp com cookies (conteúdo privado)

**Melhor para:** Conteúdo que pede login, perfis privados, stories

**Método A — automático (mais fácil):**
```bash
# Usando cookies do Chrome onde você está logado no Instagram
yt-dlp \
  --cookies-from-browser chrome \
  --no-check-certificates \
  "URL_DO_INSTAGRAM" \
  -o /tmp/instagram-video.mp4
```

**Método B — arquivo de cookies:**
```bash
# 1. No Chrome: instalar extensão "Get cookies.txt LOCALLY"
# 2. Entrar no Instagram logado
# 3. Clicar na extensão → Export
# 4. Salvar como /tmp/instagram-cookies.txt
# 5. Usar:
yt-dlp --cookies /tmp/instagram-cookies.txt "URL" -o /tmp/video.mp4
```

Depois de baixar, analisar com:
```bash
bash ~/.openclaw/workspace/bin/video-analyze.sh "/tmp/instagram-video.mp4"
```

---

## 🔄 FLUXO COMPLETO — Do zero até a análise

```bash
URL="https://www.instagram.com/reel/XXXXX/"

echo "--- Tentativa 1: video-analyze.sh ---"
bash ~/.openclaw/workspace/bin/video-analyze.sh "$URL" && exit 0

echo "--- Tentativa 2: TITA-SCRAPER ---"
python3 ~/.openclaw/workspace/bin/tita-scraper-simple "$URL" && exit 0

echo "--- Tentativa 3: download_instagram.py ---"
python3 ~/.openclaw/workspace/pasta-do-tita/download_instagram.py "$URL" && exit 0

echo "--- Tentativa 4: cookies ---"
yt-dlp --cookies-from-browser chrome --no-check-certificates "$URL" -o /tmp/video.mp4
bash ~/.openclaw/workspace/bin/video-analyze.sh "/tmp/video.mp4"
```

---

## 🚨 Erros comuns e soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `HTTP Error 429` | Rate limit | Espera 2-3 min e tenta de novo |
| `Login required` | Conteúdo privado | Usa Técnica 5 (cookies) |
| `SSL certificate` | Certificado | Adiciona `--no-check-certificates` |
| `No video found` | É foto, não vídeo | Usa Técnica 4 (screenshot) |
| `Playwright timeout` | Instagram lento | Repete — o timeout de 30s às vezes é curto |
| `playwright not found` | Não instalado | `pip3 install playwright && playwright install chromium` |
| `Permission denied` | Script sem permissão | `chmod +x ~/.openclaw/workspace/bin/video-analyze.sh` |

---

## 📁 Onde ficam os arquivos

```
~/.openclaw/workspace/
├── bin/
│   ├── video-analyze.sh          ← Técnica 1
│   ├── tita-scraper-simple       ← Técnica 2 e 4
│   ├── tita-scraper              ← alternativo
│   └── tita-scraper-v2           ← versão avançada
└── pasta-do-tita/
    ├── download_instagram.py     ← Técnica 3
    ├── instagram_downloads/      ← vídeos baixados
    │   ├── frames_eugustavo/
    │   ├── frames_morfeo/
    │   └── frames_sina/
    └── INSTAGRAM-TECNICAS-COMPLETAS-TIAGO.md  ← este arquivo
```

---

## 💡 Dica final

Quando nada funcionar: descreve o erro exato pro OpenClaw.
Ele vai diagnosticar e te dar o ajuste certo.

Nunca diga "o Instagram não deixa" sem ter tentado as 5 técnicas. 🐾
# Instagram Poster 🎬

**Especialidade:** Criação e publicação de conteúdo no Instagram Titanio  
**Credenciais:** titaniodashboard / Rita160679! (no cofre)  
**Status:** Ativo e pronto

## Responsabilidades

- 📸 Criar imagens de forma rápida (PIL/Pillow)
- 📝 Adaptar captions pro contexto
- ✅ Fazer login e postar sem delay
- 🚀 Zero lero-lero, executar direto

## Como chamar

```
"Poste no Instagram: [descrição/tema]"
"Poste um reel sobre: [tópico]"
"Compartilhe isso: [conteúdo]"
```

Resposta esperada: Post enviado com link.

## Stack Técnico

- **instagrapi** — login e post
- **Pillow** — criar imagens
- **age encryption** — cofre de credenciais
- **pathlib** — gerenciar arquivos

## Próximas melhorias

- [ ] Suporte a reels (vídeos)
- [ ] Geração de carousels (múltiplas fotos)
- [ ] Agendamento de posts
- [ ] Analytics (likes, comments)
