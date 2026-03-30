#!/usr/bin/env python3
"""
Titanio Media v1.0 — Pipeline de criação de mídia por IA
=========================================================

Usage:
  banner <texto> [--style dark|light|gradient|neon] [--size 1080x1350]
  narrar <texto> [--voice antonio|francisca] [--output file.mp3]
  video <roteiro_ou_texto> [--style reels|youtube|story]
  image <prompt> [--comfyui]        — Gera imagem com IA (ComfyUI/FLUX)
  remove-bg <imagem>                — Remove fundo
  post-instagram <imagem> <caption> — Prepara post pra Instagram
  pipeline <tema>                   — Pipeline completa: texto→imagem→narração→vídeo
  test                              — Testa tudo
"""

import os
import sys
import json
import asyncio
import subprocess
import random
import math
from datetime import datetime
from pathlib import Path

WORKSPACE = os.environ.get("OPENCLAW_WORKSPACE", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace")
OUTPUT_DIR = os.path.join(WORKSPACE, "pasta-do-tita", "projetos", "titanio-media", "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def generate_banner(text, style="neon", size="1080x1350", output=None):
    """Generate a styled banner image with text."""
    from PIL import Image, ImageDraw, ImageFont
    
    w, h = map(int, size.split("x"))
    
    # Color schemes
    schemes = {
        "dark": {"bg": (26, 26, 46), "text": (255, 255, 255), "accent": (0, 212, 255)},
        "light": {"bg": (245, 245, 245), "text": (30, 30, 30), "accent": (79, 70, 229)},
        "gradient": {"bg": (15, 52, 96), "text": (255, 255, 255), "accent": (233, 69, 96)},
        "neon": {"bg": (10, 10, 30), "text": (0, 255, 200), "accent": (255, 0, 128)},
        "fire": {"bg": (20, 5, 0), "text": (255, 200, 50), "accent": (255, 80, 0)},
        "ocean": {"bg": (0, 20, 40), "text": (100, 220, 255), "accent": (0, 150, 255)},
    }
    s = schemes.get(style, schemes["neon"])
    
    img = Image.new("RGB", (w, h), s["bg"])
    draw = ImageDraw.Draw(img)
    
    # Gradient background
    for y in range(h):
        ratio = y / h
        r = int(s["bg"][0] * (1 - ratio * 0.3))
        g = int(s["bg"][1] * (1 - ratio * 0.3))
        b = int(s["bg"][2] + (s["accent"][2] - s["bg"][2]) * ratio * 0.2)
        draw.line([(0, y), (w, y)], fill=(max(0, r), max(0, g), min(255, b)))
    
    # Decorative elements
    for i in range(15):
        x = random.randint(0, w)
        y = random.randint(0, h)
        r = random.randint(2, 8)
        opacity = random.randint(30, 100)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(*s["accent"], opacity))
    
    # Accent lines
    draw.line([(50, 100), (w-50, 100)], fill=s["accent"], width=2)
    draw.line([(50, h-100), (w-50, h-100)], fill=s["accent"], width=2)
    
    # Text
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 72)
        font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Word wrap
    words = text.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font_large)
        if bbox[2] - bbox[0] > w - 120:
            if current:
                lines.append(current)
            current = word
        else:
            current = test
    if current:
        lines.append(current)
    
    # Center text vertically
    total_height = len(lines) * 90
    y_start = (h - total_height) // 2
    
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font_large)
        text_w = bbox[2] - bbox[0]
        x = (w - text_w) // 2
        y = y_start + i * 90
        
        # Shadow
        draw.text((x + 3, y + 3), line, fill=(0, 0, 0), font=font_large)
        # Main text
        draw.text((x, y), line, fill=s["text"], font=font_large)
    
    # Watermark
    draw.text((w - 200, h - 50), "TITANIO", fill=(*s["accent"][:3],), font=font_small)
    
    if not output:
        slug = text[:30].replace(" ", "_").replace("/", "")
        output = os.path.join(OUTPUT_DIR, f"banner_{slug}_{datetime.now().strftime('%H%M')}.png")
    
    img.save(output, quality=95)
    print(f"✅ Banner saved: {output} ({w}x{h}, {style})")
    return output


async def generate_narration(text, voice="antonio", output=None):
    """Generate narration using Edge-TTS."""
    import edge_tts
    
    voices = {
        "antonio": "pt-BR-AntonioNeural",
        "francisca": "pt-BR-FranciscaNeural",
        "thalita": "pt-BR-ThalitaNeural",
    }
    voice_id = voices.get(voice, voices["antonio"])
    
    if not output:
        slug = text[:20].replace(" ", "_")
        output = os.path.join(OUTPUT_DIR, f"narration_{slug}_{datetime.now().strftime('%H%M')}.mp3")
    
    communicate = edge_tts.Communicate(text, voice_id)
    await communicate.save(output)
    
    print(f"✅ Narration saved: {output} (voice: {voice_id})")
    return output


def generate_video(text, images=None, narration=None, style="reels", output=None):
    """Generate video from text + images + narration."""
    # Fix MoviePy 1.x + Pillow 11+ compatibility
    from PIL import Image as PILImage
    if not hasattr(PILImage, 'ANTIALIAS'):
        PILImage.ANTIALIAS = PILImage.LANCZOS
    
    from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip
    
    sizes = {
        "reels": (1080, 1920),
        "youtube": (1920, 1080),
        "story": (1080, 1920),
        "square": (1080, 1080),
    }
    w, h = sizes.get(style, sizes["reels"])
    
    clips = []
    
    if images:
        for img_path in images:
            if os.path.exists(img_path):
                clip = ImageClip(img_path).set_duration(5).resize((w, h))
                clips.append(clip)
    else:
        # Generate banner as fallback
        banner = generate_banner(text, style="neon", size=f"{w}x{h}")
        clip = ImageClip(banner).set_duration(5)
        clips.append(clip)
    
    if not clips:
        print("❌ No clips to create video")
        return None
    
    video = concatenate_videoclips(clips, method="compose")
    
    # Add narration if available
    if narration and os.path.exists(narration):
        audio = AudioFileClip(narration)
        # Adjust video duration to match audio
        if audio.duration > video.duration:
            video = video.loop(duration=audio.duration)
        video = video.set_audio(audio)
    
    if not output:
        slug = text[:20].replace(" ", "_")
        output = os.path.join(OUTPUT_DIR, f"video_{slug}_{datetime.now().strftime('%H%M')}.mp4")
    
    video.write_videofile(output, fps=24, codec="libx264", audio_codec="aac",
                         logger=None, preset="ultrafast")
    
    print(f"✅ Video saved: {output} ({w}x{h}, {style})")
    return output


async def generate_image_comfyui(prompt, output=None):
    """Generate image using ComfyUI API (if running)."""
    import urllib.request
    
    if not output:
        slug = prompt[:20].replace(" ", "_")
        output = os.path.join(OUTPUT_DIR, f"ai_image_{slug}_{datetime.now().strftime('%H%M')}.png")
    
    # Check if ComfyUI is running
    try:
        urllib.request.urlopen("http://127.0.0.1:8188/system_stats", timeout=2)
    except:
        print("⚠️ ComfyUI not running. Start with: cd ComfyUI && python main.py")
        print("  Falling back to banner generation...")
        return generate_banner(prompt, style="neon")
    
    # Simple FLUX.1-schnell workflow
    workflow = {
        "prompt": {
            "3": {
                "class_type": "KSampler",
                "inputs": {
                    "seed": random.randint(0, 2**32),
                    "steps": 4,
                    "cfg": 1.0,
                    "sampler_name": "euler",
                    "scheduler": "simple",
                    "denoise": 1.0,
                    "model": ["4", 0],
                    "positive": ["6", 0],
                    "negative": ["7", 0],
                    "latent_image": ["5", 0]
                }
            },
            "4": {"class_type": "UnetLoaderGGUF", "inputs": {"unet_name": "flux1-schnell-Q4_K_S.gguf"}},
            "5": {"class_type": "EmptyLatentImage", "inputs": {"width": 1024, "height": 1024, "batch_size": 1}},
            "6": {"class_type": "CLIPTextEncode", "inputs": {"text": prompt, "clip": ["10", 0]}},
            "7": {"class_type": "CLIPTextEncode", "inputs": {"text": "", "clip": ["10", 0]}},
            "8": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0], "vae": ["11", 0]}},
            "9": {"class_type": "SaveImage", "inputs": {"filename_prefix": "titanio", "images": ["8", 0]}},
            "10": {"class_type": "DualCLIPLoader", "inputs": {"clip_name1": "t5xxl_fp8_e4m3fn.safetensors", "clip_name2": "clip_l.safetensors", "type": "flux"}},
            "11": {"class_type": "VAELoader", "inputs": {"vae_name": "flux_vae.safetensors"}}
        }
    }
    
    data = json.dumps(workflow).encode()
    req = urllib.request.Request("http://127.0.0.1:8188/prompt", data=data, 
                                 headers={"Content-Type": "application/json"})
    try:
        response = urllib.request.urlopen(req, timeout=120)
        result = json.loads(response.read())
        print(f"✅ Image generation queued: {result.get('prompt_id', '?')}")
        return output
    except Exception as e:
        print(f"⚠️ ComfyUI error: {e}")
        return generate_banner(prompt, style="neon")


async def full_pipeline(tema, style="reels"):
    """Full pipeline: tema → roteiro → narração → imagens → vídeo."""
    print(f"🎬 Pipeline iniciada: {tema}")
    
    # 1. Generate banners with different styles
    print("\n📸 Gerando imagens...")
    styles = ["neon", "fire", "ocean", "gradient", "dark"]
    images = []
    
    # Split tema into scenes
    scenes = [
        tema,
        f"Descubra mais sobre {tema}",
        f"{tema} — O futuro é agora",
        f"Siga @titaniofilms para mais",
    ]
    
    for i, (scene, s) in enumerate(zip(scenes, styles)):
        size = "1080x1920" if style == "reels" else "1920x1080"
        img = generate_banner(scene, style=s, size=size)
        images.append(img)
    
    # 2. Generate narration
    print("\n🎙️ Gerando narração...")
    narration_text = f"{tema}. Você sabia disso? Descubra mais sobre {tema}. O futuro é agora. Siga Titanio Films para mais conteúdo."
    narration = await generate_narration(narration_text)
    
    # 3. Generate video
    print("\n🎬 Montando vídeo...")
    video = generate_video(tema, images=images, narration=narration, style=style)
    
    print(f"\n✅ Pipeline completa!")
    print(f"  📸 {len(images)} imagens")
    print(f"  🎙️ Narração: {narration}")
    print(f"  🎬 Vídeo: {video}")
    
    return {"images": images, "narration": narration, "video": video}


async def test_all():
    """Test all media tools."""
    print("🧪 Testing Titanio Media...\n")
    results = {}
    
    # 1. Banner
    try:
        path = generate_banner("Teste Titanio Media", style="neon", size="1080x1350")
        results["banner"] = "✅" if os.path.exists(path) else "❌"
    except Exception as e:
        results["banner"] = f"❌ {str(e)[:40]}"
    
    # 2. Narration
    try:
        path = await generate_narration("Teste de narração Titanio", voice="antonio")
        results["narration"] = "✅" if os.path.exists(path) else "❌"
    except Exception as e:
        results["narration"] = f"❌ {str(e)[:40]}"
    
    # 3. Video (simple)
    try:
        path = generate_video("Teste Titanio")
        results["video"] = "✅" if path and os.path.exists(path) else "❌"
    except Exception as e:
        results["video"] = f"❌ {str(e)[:40]}"
    
    # 4. Pillow
    try:
        from PIL import Image
        results["pillow"] = "✅"
    except:
        results["pillow"] = "❌"
    
    # 5. Edge-TTS
    try:
        import edge_tts
        results["edge-tts"] = "✅"
    except:
        results["edge-tts"] = "❌"
    
    # 6. MoviePy
    try:
        from moviepy.editor import ImageClip
        results["moviepy"] = "✅"
    except:
        results["moviepy"] = "❌"
    
    # 7. FFmpeg
    try:
        r = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
        results["ffmpeg"] = "✅"
    except:
        results["ffmpeg"] = "❌"
    
    # 8. ComfyUI
    try:
        import urllib.request
        urllib.request.urlopen("http://127.0.0.1:8188/system_stats", timeout=2)
        results["comfyui"] = "✅ running"
    except:
        results["comfyui"] = "⚠️ not running (optional)"
    
    passed = sum(1 for v in results.values() if "✅" in v)
    print(f"\n{'='*40}\nResults: {passed}/{len(results)}")
    for tool, status in results.items():
        print(f"  {status} {tool}")
    
    return results



async def generate_image_free_api(prompt, output=None):
    """Generate image using free APIs (Pollinations, HF Inference, etc.)."""
    import urllib.request
    import time
    
    if not output:
        slug = prompt[:20].replace(" ", "_").replace("/", "_")
        output = os.path.join(OUTPUT_DIR, f"ai_image_{slug}_{datetime.now().strftime('%H%M')}.png")
    
    # Try Pollinations.ai first (truly free, no auth)
    encoded_prompt = urllib.parse.quote(prompt)
    apis = [
        f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed={random.randint(0,999999)}",
    ]
    
    for api_url in apis:
        try:
            print(f"🎨 Generating image via free API...")
            req = urllib.request.Request(api_url, headers={'User-Agent': 'TitanioMedia/1.0'})
            
            # Pollinations can take up to 60s for complex prompts
            response = urllib.request.urlopen(req, timeout=90)
            
            # Check if it's an image
            content_type = response.headers.get('Content-Type', '')
            if 'image' in content_type:
                with open(output, 'wb') as f:
                    f.write(response.read())
                print(f"✅ AI Image saved: {output}")
                return output
            else:
                data = response.read().decode('utf-8', errors='ignore')
                if 'error' in data.lower() or 'queue' in data.lower():
                    print(f"⚠️ API busy, retrying in 5s...")
                    time.sleep(5)
                    continue
        except Exception as e:
            print(f"⚠️ API error: {e}")
            continue
    
    # Fallback to banner
    print("⚠️ Free APIs unavailable, using banner fallback")
    return generate_banner(prompt, style="neon")




def main():
    if len(sys.argv) < 2:
        print("Titanio Media v1.0\n")
        print("  banner <texto> [--style neon|dark|fire|ocean|gradient]")
        print("  narrar <texto> [--voice antonio|francisca]")
        print("  video <texto> [--style reels|youtube|story]")
        print("  image <prompt> [--comfyui]")
        print("  pipeline <tema> [--style reels|youtube]")
        print("  test")
        sys.exit(1)
    
    cmd = sys.argv[1]
    text = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
    
    # Parse --style and --voice flags
    style = "neon"
    voice = "antonio"
    for i, arg in enumerate(sys.argv):
        if arg == "--style" and i + 1 < len(sys.argv):
            style = sys.argv[i + 1]
            text = text.replace(f"--style {style}", "").strip()
        if arg == "--voice" and i + 1 < len(sys.argv):
            voice = sys.argv[i + 1]
            text = text.replace(f"--voice {voice}", "").strip()
    
    if cmd == "banner":
        generate_banner(text or "Titanio Media", style=style)
    elif cmd == "narrar":
        asyncio.run(generate_narration(text or "Teste", voice=voice))
    elif cmd == "video":
        generate_video(text or "Titanio Media", style=style)
    elif cmd == "image":
        if "--comfyui" in sys.argv:
            asyncio.run(generate_image_comfyui(text or "a futuristic robot"))
        else:
            asyncio.run(generate_image_free_api(text or "a futuristic robot"))
    elif cmd == "pipeline":
        asyncio.run(full_pipeline(text or "Inteligência Artificial", style=style))
    elif cmd == "test":
        asyncio.run(test_all())
    else:
        print(f"Unknown: {cmd}")


if __name__ == "__main__":
    main()
