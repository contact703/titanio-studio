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
        slug = text[:30].replace(" ", "_").replace("/", "").replace("\n", "_")
        output = os.path.join(OUTPUT_DIR, f"banner_{slug}_{datetime.now().strftime('%H%M%S')}_{random.randint(100,999)}.png")
    
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
    
    size = "1080x1920" if style == "reels" else "1920x1080"
    w, h = map(int, size.split("x"))
    
    # Generate AI images for all frames, fallback to banners
    for i, (scene, s) in enumerate(zip(scenes, styles)):
        # Try SDXL-Turbo local first
        img = generate_image_sdxl_turbo(scene, width=min(w, 512), height=min(h, 512))
        if img and os.path.exists(img):
            # Upscale to target size
            from PIL import Image as PILImage
            pil_img = PILImage.open(img)
            if pil_img.size != (w, h):
                pil_img = pil_img.resize((w, h), PILImage.LANCZOS)
                pil_img.save(img)
            images.append(img)
        else:
            # Banner fallback
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




# Global SDXL-Turbo pipeline cache
_sdxl_pipe = None

def generate_image_sdxl_turbo(prompt, output=None, width=512, height=512):
    """Generate image using SDXL-Turbo locally (M4 chip, ~7s per image)."""
    global _sdxl_pipe
    
    if not output:
        slug = prompt[:20].replace(" ", "_").replace("/", "_").replace("\n", "_")
        output = os.path.join(OUTPUT_DIR, f"ai_sdxl_{slug}_{datetime.now().strftime('%H%M%S')}_{random.randint(100,999)}.png")
    
    try:
        import torch
        from diffusers import AutoPipelineForText2Image
        
        if _sdxl_pipe is None:
            print("🎨 Loading SDXL-Turbo (first time takes ~60s)...")
            _sdxl_pipe = AutoPipelineForText2Image.from_pretrained(
                "stabilityai/sdxl-turbo",
                torch_dtype=torch.float16 if torch.backends.mps.is_available() else torch.float32,
                variant="fp16" if torch.backends.mps.is_available() else None,
                local_files_only=True
            )
            device = "mps" if torch.backends.mps.is_available() else "cpu"
            _sdxl_pipe.to(device)
            print(f"  ✅ Model loaded on {device}")
        
        print(f"🎨 Generating image...")
        import time
        start = time.time()
        image = _sdxl_pipe(
            prompt=prompt + ", high quality, professional, 4k",
            num_inference_steps=4,
            guidance_scale=0.0,
            width=width,
            height=height
        ).images[0]
        
        image.save(output)
        gen_time = time.time() - start
        print(f"✅ AI Image saved: {output} ({gen_time:.1f}s, SDXL-Turbo local)")
        return output
        
    except Exception as e:
        print(f"⚠️ SDXL-Turbo error: {str(e)[:80]}")
        return None


async def generate_image_free_api(prompt, output=None, width=1024, height=1024):
    """Generate image using Stable Horde (free, no API key needed)."""
    import urllib.request
    import urllib.parse
    import time
    import base64
    
    if not output:
        slug = prompt[:20].replace(" ", "_").replace("/", "_").replace("\n", "_")
        output = os.path.join(OUTPUT_DIR, f"ai_image_{slug}_{datetime.now().strftime('%H%M%S')}_{random.randint(100,999)}.png")
    
    # Stable Horde - free community GPU cluster
    # Anonymous key = 0000000000 (free, slower queue)
    horde_url = "https://stablehorde.net/api/v2/generate/async"
    
    # Limit to 768x768 for free tier (above 885x885 needs kudos)
    w = min(width, 768)
    h = min(height, 768)
    
    payload = json.dumps({
        "prompt": prompt + ", high quality, professional, 4k",
        "params": {
            "width": w, "height": h,
            "steps": 20, "sampler_name": "k_euler",
            "cfg_scale": 7, "seed": str(random.randint(0, 999999))
        },
        "nsfw": False,
        "models": ["FLUX.1 [schnell]", "AlbedoBase XL (SDXL)", "Juggernaut XL"]
    })
    
    try:
        print(f"🎨 Generating AI image via Stable Horde (free)...")
        req = urllib.request.Request(horde_url, data=payload.encode(),
              headers={"Content-Type": "application/json", "apikey": "0000000000"})
        resp = urllib.request.urlopen(req, timeout=15)
        result = json.loads(resp.read())
        job_id = result.get("id")
        
        if not job_id:
            print(f"⚠️ Horde error: {result}")
            return generate_banner(prompt, style="neon")
        
        # Poll for completion (max 2 min)
        print(f"⏳ Queued (ID: {job_id[:8]}...)...")
        for attempt in range(24):
            time.sleep(5)
            check = urllib.request.urlopen(
                f"https://stablehorde.net/api/v2/generate/check/{job_id}", timeout=10)
            status = json.loads(check.read())
            
            if status.get("done"):
                break
            
            pos = status.get("queue_position", "?")
            wait = status.get("wait_time", "?")
            if attempt % 4 == 0:
                print(f"  ⏳ Position: {pos}, ETA: {wait}s")
        
        # Get the result
        result_url = f"https://stablehorde.net/api/v2/generate/status/{job_id}"
        result_resp = urllib.request.urlopen(result_url, timeout=15)
        result_data = json.loads(result_resp.read())
        
        generations = result_data.get("generations", [])
        if generations:
            img_data = generations[0].get("img", "")
            model_used = generations[0].get("model", "unknown")
            
            if img_data.startswith("http"):
                img_resp = urllib.request.urlopen(img_data, timeout=30)
                img_bytes = img_resp.read()
            else:
                img_bytes = base64.b64decode(img_data)
            
            # Save and convert to PNG
            temp_path = output.replace(".png", "_raw.webp")
            with open(temp_path, "wb") as f:
                f.write(img_bytes)
            
            # Convert to PNG
            from PIL import Image as PILImage
            img = PILImage.open(temp_path)
            # Upscale to target size if smaller
            if img.size[0] < width or img.size[1] < height:
                img = img.resize((width, height), PILImage.LANCZOS)
            img.save(output)
            os.remove(temp_path)
            
            print(f"✅ AI Image saved: {output} (model: {model_used})")
            return output
        
        print("⚠️ No image generated")
        return generate_banner(prompt, style="neon")
        
    except Exception as e:
        print(f"⚠️ Stable Horde error: {str(e)[:80]}")
        return generate_banner(prompt, style="neon")

def generate_video_veo(prompt, output=None, duration=8, aspect_ratio="9:16", model="veo-2.0-generate-001"):
    """Generate real text-to-video using Google Veo API (async long-running op)."""
    import urllib.request
    import urllib.parse
    import time

    api_key = os.environ.get("GOOGLE_AI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        print("❌ GOOGLE_AI_API_KEY não configurada")
        return None

    if not output:
        slug = prompt[:24].replace(" ", "_").replace("/", "_")
        output = os.path.join(OUTPUT_DIR, f"veo_{slug}_{datetime.now().strftime('%H%M%S')}.mp4")

    submit_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:predictLongRunning?key={api_key}"
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "aspectRatio": aspect_ratio,
            "personGeneration": "allow_all",
            "durationSeconds": int(duration),
        },
    }

    print(f"🎬 Veo submit ({model})...")
    req = urllib.request.Request(
        submit_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )

    try:
        submit_resp = urllib.request.urlopen(req, timeout=30)
        submit_data = json.loads(submit_resp.read())
    except Exception as e:
        print(f"❌ Submit failed: {e}")
        return None

    op_name = submit_data.get("name")
    if not op_name:
        print(f"❌ Operação inválida: {submit_data}")
        return None

    print(f"⏳ Operation: {op_name}")
    poll_url = f"https://generativelanguage.googleapis.com/v1beta/{op_name}?key={api_key}"

    done = None
    for _ in range(80):  # ~10 min max
        time.sleep(8)
        try:
            data = json.loads(urllib.request.urlopen(poll_url, timeout=20).read())
        except Exception as e:
            print(f"⚠️ Poll error: {e}")
            continue

        if data.get("done"):
            done = data
            break

    if not done:
        print("❌ Timeout aguardando Veo")
        return None

    if "error" in done:
        print(f"❌ Veo error: {done['error']}")
        return None

    samples = (
        done.get("response", {})
        .get("generateVideoResponse", {})
        .get("generatedSamples", [])
    )
    if not samples:
        print(f"❌ Sem samples no response: {done}")
        return None

    video_uri = samples[0].get("video", {}).get("uri")
    if not video_uri:
        print("❌ Sem URI de vídeo")
        return None

    sep = "&" if "?" in video_uri else "?"
    download_url = f"{video_uri}{sep}key={api_key}"
    try:
        video_bytes = urllib.request.urlopen(download_url, timeout=120).read()
        with open(output, "wb") as f:
            f.write(video_bytes)
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return None

    print(f"✅ Veo video saved: {output}")
    return output


def pipeline_real(prompt, duration=8, ratio="9:16"):
    """One-command real pipeline using Veo text-to-video."""
    print(f"🚀 Pipeline REAL: {prompt}")
    video = generate_video_veo(prompt, duration=duration, aspect_ratio=ratio)
    if not video:
        print("❌ Falha na geração Veo")
        return None
    print("✅ Pipeline REAL concluída")
    print(f"🎬 Vídeo: {video}")
    return video


def main():
    if len(sys.argv) < 2:
        print("Titanio Media v1.0\n")
        print("  banner <texto> [--style neon|dark|fire|ocean|gradient]")
        print("  narrar <texto> [--voice antonio|francisca]")
        print("  video <texto> [--style reels|youtube|story]")
        print("  image <prompt> [--comfyui]")
        print("  animate <image_path> [--driving d0|d10|talking]")
        print("  veo <prompt> [--duration 8] [--ratio 9:16]")
        print("  pipeline-real <prompt> [--duration 8] [--ratio 9:16]")
        print("  pipeline <tema> [--style reels|youtube]")
        print("  test")
        sys.exit(1)
    
    cmd = sys.argv[1]
    text = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
    
    # Parse --style and --voice flags
    style = "neon"
    voice = "antonio"
    driving = "d0"
    duration = 8
    ratio = "9:16"
    for i, arg in enumerate(sys.argv):
        if arg == "--style" and i + 1 < len(sys.argv):
            style = sys.argv[i + 1]
            text = text.replace(f"--style {style}", "").strip()
        if arg == "--voice" and i + 1 < len(sys.argv):
            voice = sys.argv[i + 1]
            text = text.replace(f"--voice {voice}", "").strip()
        if arg == "--driving" and i + 1 < len(sys.argv):
            driving = sys.argv[i + 1]
            text = text.replace(f"--driving {driving}", "").strip()
        if arg == "--duration" and i + 1 < len(sys.argv):
            try:
                duration = int(sys.argv[i + 1])
            except:
                duration = 8
            text = text.replace(f"--duration {sys.argv[i + 1]}", "").strip()
        if arg == "--ratio" and i + 1 < len(sys.argv):
            ratio = sys.argv[i + 1]
            text = text.replace(f"--ratio {ratio}", "").strip()
    
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
            result = generate_image_sdxl_turbo(text or "a futuristic robot")
            if not result:
                asyncio.run(generate_image_free_api(text or "a futuristic robot"))
    elif cmd == "animate":
        if not text:
            print("❌ Uso: animate <image_path> [--driving d0|d10|talking]")
            sys.exit(1)
        animate_portrait(text, driving=driving)
    elif cmd == "veo":
        generate_video_veo(
            text or "A person stands up, picks up a phone and starts talking to camera",
            duration=duration,
            aspect_ratio=ratio,
        )
    elif cmd == "pipeline-real":
        pipeline_real(
            text or "A person stands up, picks up a phone and starts talking to camera",
            duration=duration,
            ratio=ratio,
        )
    elif cmd == "pipeline":
        asyncio.run(full_pipeline(text or "Inteligência Artificial", style=style))
    elif cmd == "test":
        asyncio.run(test_all())
    else:
        print(f"Unknown: {cmd}")


def animate_portrait(image_path, output_path=None, driving="d0"):
    """Animate a portrait image using LivePortrait (open source)."""
    import subprocess
    import os
    
    lp_dir = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/LivePortrait"
    
    if not output_path:
        base = os.path.basename(image_path).replace('.png', '').replace('.jpg', '')
        output_path = os.path.join(OUTPUT_DIR, f"animated_{base}.mp4")
    
    # Find driving video/template
    driving_path = f"{lp_dir}/assets/examples/driving/{driving}.mp4"
    if not os.path.exists(driving_path):
        driving_path = f"{lp_dir}/assets/examples/driving/{driving}.pkl"
    
    if not os.path.exists(driving_path):
        print(f"⚠️ Driving template not found: {driving}")
        driving_path = f"{lp_dir}/assets/examples/driving/d0.mp4"
    
    print(f"🎭 Animating portrait with LivePortrait...")
    print(f"   Source: {image_path}")
    print(f"   Driving: {driving_path}")
    
    result = subprocess.run([
        sys.executable, f"{lp_dir}/inference.py",
        "-s", image_path,
        "-d", driving_path,
        "-o", os.path.dirname(output_path) + "/",
        "--no-flag-use-half-precision"
    ], capture_output=True, text=True, cwd=lp_dir)
    
    # Find the generated video
    base = os.path.basename(image_path).replace('.png', '').replace('.jpg', '')
    driving_base = os.path.basename(driving_path).replace('.mp4', '').replace('.pkl', '')
    generated = os.path.join(os.path.dirname(output_path), f"{base}--{driving_base}.mp4")
    
    if os.path.exists(generated):
        os.rename(generated, output_path)
        print(f"✅ Animated video: {output_path}")
        return output_path
    else:
        print(f"⚠️ Animation failed: {result.stderr[-500:] if result.stderr else 'unknown error'}")
        return None


# Add to main() command handling
# Usage: titanio-media.py animate <image> [--driving talking|d0|d10]


if __name__ == "__main__":
    main()
