# 📸 Resumo: Pesquisa de Ações no Instagram via OpenClaw
> Gerado em: 2026-03-26 | Bot: Instagramer Research Bot v2 | 15 rounds
> Para: Especialistas Instagramer + OpenClaw Expert

## Bibliotecas Principais Identificadas

### instagrapi (⭐ Principal — API Privada)
- Lib Python que usa a API privada do Instagram
- Permite: postar foto/vídeo/reels/stories, DM, follow/unfollow, comentar, curtir, buscar dados
- GitHub: https://github.com/subzeroid/instagrapi
- Instalação: `pip install instagrapi`

### Instagram Graph API (Oficial — Business/Creator)
- API oficial para contas business/creator
- Permite: postar, métricas, gerenciar conteúdo
- Requer: conta business + app Meta Developer
- Limite: mais restrita que API privada

### yt-dlp + ffmpeg (Download/Análise)
- Baixar reels, extrair frames, analisar conteúdo
- Ver tecnicas-instagram.md para detalhes completos

## Anti-Ban: 10 Mandamentos

1. **Delays humanos** — nunca ações instantâneas, simular tempo de leitura
2. **Limites diários** — máx 50 follows, 100 likes, 20 DMs por dia
3. **User-agent realista** — usar device fingerprint de celular real
4. **Sessão persistente** — não fazer login a cada ação
5. **Aquecimento de conta** — começar com poucas ações, aumentar gradualmente
6. **Proxies residenciais** — nunca datacenter IPs
7. **Horários variados** — não agir sempre no mesmo horário
8. **Mix de ações** — combinar curtidas, comentários, follows (não só um tipo)
9. **Respeitar rate limits** — parar imediatamente ao receber 429
10. **Conta verificada** — número de telefone confirmado reduz bloqueios

## Ações Possíveis via instagrapi

```python
from instagrapi import Client

cl = Client()
cl.login("usuario", "senha")

# POSTAR
cl.photo_upload("foto.jpg", "Caption aqui")
cl.video_upload("video.mp4", "Caption")
cl.clip_upload("reel.mp4", "Caption")  # Reels
cl.album_upload(["1.jpg","2.jpg"], "Caption")  # Carousel

# STORIES
cl.photo_upload_to_story("story.jpg")
cl.video_upload_to_story("story.mp4")

# DM
user_id = cl.user_id_from_username("usuario_alvo")
cl.direct_send("Olá!", [user_id])

# INTERAGIR
cl.media_like(media_id)
cl.media_comment(media_id, "Ótimo post!")
cl.user_follow(user_id)

# COLETAR DADOS
posts = cl.user_medias(user_id, amount=20)
followers = cl.user_followers(user_id)
hashtag_posts = cl.hashtag_medias_top("openclaw", amount=10)
```

## Gerenciar Múltiplas Contas

```python
# Sessão salva em JSON — não faz login toda vez
cl.load_settings("session.json")
# ou
cl.dump_settings("session.json")  # salvar após login

# Múltiplas contas = múltiplos arquivos de sessão
accounts = {
    "conta1": Client(),
    "conta2": Client(),
}
```

## Análises e Pesquisas

- **Hashtags:** `cl.hashtag_medias_top("hashtag")` — top posts
- **Concorrentes:** `cl.user_medias(user_id)` — posts de qualquer conta pública
- **Engajamento:** likes + comments / followers
- **Audiência:** `cl.user_followers(user_id)` — lista de seguidores
- **Tendências:** monitorar hashtags relevantes diariamente

## Integração com OpenClaw

```bash
# Via N8n workflow:
# 1. OpenClaw recebe comando no WhatsApp
# 2. N8n webhook trigga script Python
# 3. Script usa instagrapi para agir
# 4. Resultado volta pro OpenClaw → responde no WhatsApp

# Ou direto via exec tool do OpenClaw:
python3 -c "
from instagrapi import Client
cl = Client()
cl.load_settings('/path/session.json')
cl.media_like('MEDIA_ID')
print('Curtido!')
"
```

## Fontes
- Reddit: r/webscraping, r/Instagram, r/Python, r/LocalLLaMA
- GitHub: instagrapi, instagram-py, instarest
- Documentação: https://subzeroid.github.io/instagrapi/
