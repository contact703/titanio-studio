#!/usr/bin/env python3
"""
📸 Instagram Auto-Poster — Bot com IA Gratuita
Usa OpenRouter (modelos free) ou Kimi pra gerar caption.
Posta vídeo como Reel no Instagram via instagrapi.

Criado pelo Instagramer + Tita em 26/03/2026.
"""
import os
import sys
import json
import time
import requests
from pathlib import Path
from instagrapi import Client

# ══════════════════════════════════════
# CONFIGURAÇÃO
# ══════════════════════════════════════

COFRE_PATH = os.path.expanduser("~/.openclaw/workspace/pasta-do-tita/cofre")
SESSION_PATH = os.path.join(COFRE_PATH, "tita-insta-session.json")

# Instagram creds
INSTA_USER = os.getenv("INSTA_USER", "titaniodashboard")
INSTA_PASS = os.getenv("INSTA_PASS", "Rita160679!")

# IA gratuita via OpenRouter
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", 
    "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")

# Kimi/Moonshot como fallback
KIMI_KEY = os.getenv("KIMI_API_KEY",
    "sk-fk265pU0KeCBynUsqVYEI9pKobqewoMImIkAGQ6tlEbssx4i")


# ══════════════════════════════════════
# GERAÇÃO DE CAPTION COM IA GRATUITA
# ══════════════════════════════════════

def generate_caption_openrouter(topic: str, style: str = "profissional") -> str:
    """Gera caption usando modelo gratuito do OpenRouter."""
    
    # Modelos gratuitos no OpenRouter (atualizado 26/03/2026)
    free_models = [
        "qwen/qwen3-next-80b-a3b-instruct:free",
        "openai/gpt-oss-120b:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "z-ai/glm-4.5-air:free",
        "minimax/minimax-m2.5:free",
        "stepfun/step-3.5-flash:free",
    ]
    
    prompt = f"""Crie uma caption para Instagram Reels sobre: {topic}

Estilo: {style}
Formato:
- Primeira linha: hook forte (curiosidade ou impacto)
- 2-3 linhas de conteúdo
- Call to action
- 5-8 hashtags relevantes em português

Responda APENAS com a caption, sem explicações."""

    for model in free_models:
        try:
            resp = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 500
                },
                timeout=30
            )
            
            if resp.status_code == 200:
                data = resp.json()
                caption = data["choices"][0]["message"]["content"].strip()
                print(f"✅ Caption gerada com {model}")
                return caption
            else:
                print(f"⚠️ {model} retornou {resp.status_code}, tentando próximo...")
                
        except Exception as e:
            print(f"⚠️ {model} falhou: {e}")
            continue
    
    return None


def generate_caption_kimi(topic: str, style: str = "profissional") -> str:
    """Gera caption usando Kimi/Moonshot (fallback)."""
    try:
        resp = requests.post(
            "https://api.moonshot.cn/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {KIMI_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "moonshot-v1-8k",
                "messages": [{"role": "user", "content": f"""Crie uma caption para Instagram Reels sobre: {topic}

Estilo: {style}. Hook forte + conteúdo + CTA + 5-8 hashtags em português.
Responda APENAS com a caption."""}],
                "max_tokens": 500
            },
            timeout=30
        )
        
        if resp.status_code == 200:
            caption = resp.json()["choices"][0]["message"]["content"].strip()
            print("✅ Caption gerada com Kimi")
            return caption
    except Exception as e:
        print(f"⚠️ Kimi falhou: {e}")
    
    return None


def generate_caption(topic: str, style: str = "profissional") -> str:
    """Tenta gerar caption: OpenRouter (free) → Kimi → fallback manual."""
    
    # 1. OpenRouter (modelos gratuitos)
    caption = generate_caption_openrouter(topic, style)
    if caption:
        return caption
    
    # 2. Kimi
    caption = generate_caption_kimi(topic, style)
    if caption:
        return caption
    
    # 3. Anthropic Claude (sempre funciona, custo mínimo)
    api_key = os.getenv("ANTHROPIC_API_KEY", "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")
    try:
        resp = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={"x-api-key": api_key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            json={"model": "claude-sonnet-4-20250514", "max_tokens": 500,
                  "messages": [{"role": "user", "content": f"Crie uma caption para Instagram Reels sobre: {topic}\nEstilo: {style}. Hook forte + conteúdo + CTA + 5-8 hashtags em português.\nResponda APENAS com a caption."}]},
            timeout=30
        )
        if resp.status_code == 200:
            caption = resp.json()["content"][0]["text"].strip()
            print("✅ Caption gerada com Claude (fallback)")
            return caption
    except:
        pass

    # 4. Fallback manual
    print("⚠️ Nenhuma IA disponível — usando caption padrão")
    return f"""🎬 {topic}

Conteúdo gerado 100% por IA — do roteiro ao vídeo editado, sem abrir editor.

Quer saber como? Comenta aqui! 👇

#inteligenciaartificial #automacao #tecnologia #produtividade #ia #titanio"""


# ══════════════════════════════════════
# POSTER INSTAGRAM
# ══════════════════════════════════════

def login_instagram() -> Client:
    """Login no Instagram com sessão persistida."""
    cl = Client()
    
    # Tentar sessão salva
    if os.path.exists(SESSION_PATH):
        try:
            cl.load_settings(SESSION_PATH)
            cl.login(INSTA_USER, INSTA_PASS)
            cl.get_timeline_feed()  # Testar se sessão é válida
            print("✅ Login via sessão salva")
            return cl
        except Exception as e:
            print(f"⚠️ Sessão expirada: {e}")
    
    # Login novo
    cl.login(INSTA_USER, INSTA_PASS)
    cl.dump_settings(SESSION_PATH)
    print("✅ Login novo — sessão salva")
    return cl


def post_reel(video_path: str, caption: str, thumbnail_path: str = None) -> dict:
    """Posta vídeo como Reel no Instagram."""
    
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Vídeo não encontrado: {video_path}")
    
    cl = login_instagram()
    
    print(f"📤 Postando Reel...")
    print(f"   Vídeo: {video_path}")
    print(f"   Caption: {caption[:100]}...")
    
    try:
        media = cl.clip_upload(
            video_path,
            caption=caption,
            thumbnail=thumbnail_path
        )
        
        result = {
            "success": True,
            "media_id": str(media.id),
            "media_pk": str(media.pk),
            "code": media.code,
            "url": f"https://www.instagram.com/reel/{media.code}/",
            "caption": caption[:200],
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        print(f"\n✅ REEL POSTADO!")
        print(f"   🔗 {result['url']}")
        
        # Salvar sessão atualizada
        cl.dump_settings(SESSION_PATH)
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }


# ══════════════════════════════════════
# PIPELINE COMPLETO
# ══════════════════════════════════════

def auto_post(video_path: str, topic: str, style: str = "profissional") -> dict:
    """Pipeline completo: gera caption com IA gratuita + posta no Instagram."""
    
    print("="*50)
    print("📸 INSTAGRAM AUTO-POSTER")
    print("="*50)
    
    # 1. Gerar caption
    print("\n✍️ Gerando caption com IA gratuita...")
    caption = generate_caption(topic, style)
    print(f"\n📝 Caption:\n{caption}\n")
    
    # 2. Postar
    print("📤 Postando no Instagram...")
    result = post_reel(video_path, caption)
    
    if result["success"]:
        # Salvar log
        log_path = os.path.join(os.path.dirname(video_path), "instagram_posts.json")
        posts = []
        if os.path.exists(log_path):
            posts = json.load(open(log_path))
        posts.append({**result, "topic": topic, "video": video_path})
        json.dump(posts, open(log_path, "w"), ensure_ascii=False, indent=2)
    
    return result


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python insta_poster.py <video.mp4> <tema>")
        print("Exemplo: python insta_poster.py output/video.mp4 'dicas de produtividade'")
        sys.exit(1)
    
    video = sys.argv[1]
    topic = sys.argv[2]
    style = sys.argv[3] if len(sys.argv) > 3 else "profissional"
    
    result = auto_post(video, topic, style)
    print(json.dumps(result, ensure_ascii=False, indent=2))
