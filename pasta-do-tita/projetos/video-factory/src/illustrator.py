"""
Gerador de ilustrações para as cenas.
Usa Stable Diffusion (ComfyUI), DALL-E ou fallback com gradientes.
"""
import os
import json
import requests
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random
import math

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output", "images")

# Cores vibrantes para gradientes
PALETTES = [
    [(26, 26, 64), (74, 0, 224)],       # Deep blue → purple
    [(15, 32, 39), (44, 83, 100)],       # Dark teal
    [(44, 62, 80), (189, 195, 199)],     # Slate → silver
    [(142, 68, 173), (52, 152, 219)],    # Purple → blue
    [(231, 76, 60), (241, 196, 15)],     # Red → yellow
    [(0, 0, 0), (67, 67, 67)],           # Black → dark gray
    [(25, 25, 112), (0, 191, 255)],      # Midnight → sky blue
    [(72, 61, 139), (255, 105, 180)],    # Indigo → pink
]


def generate_images(scenes: list, width: int = 1080, height: int = 1920) -> list:
    """Gera imagens para cada cena. Retorna lista de paths."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    paths = []
    for scene in scenes:
        desc = scene.get("visual_description", "")
        number = scene.get("number", len(paths) + 1)
        text_overlay = scene.get("text_overlay", "")
        
        # Tentar Stable Diffusion local primeiro
        path = _try_comfyui(desc, number, width, height)
        
        if not path:
            # Fallback: gradiente estilizado com texto
            path = _create_stylized_image(desc, text_overlay, number, width, height)
        
        paths.append(path)
    
    return paths


def _try_comfyui(prompt: str, scene_num: int, w: int, h: int) -> str:
    """Tenta gerar via ComfyUI/Stable Diffusion local."""
    try:
        resp = requests.post(
            "http://localhost:8188/prompt",
            json={"prompt": _build_comfyui_workflow(prompt, w, h)},
            timeout=120
        )
        if resp.status_code == 200:
            # Buscar imagem gerada
            prompt_id = resp.json().get("prompt_id")
            # Esperar e baixar...
            return None  # TODO: implementar polling ComfyUI
    except:
        pass
    return None


def _build_comfyui_workflow(prompt: str, w: int, h: int) -> dict:
    """Monta workflow ComfyUI."""
    return {}  # placeholder


def _create_stylized_image(description: str, text_overlay: str, scene_num: int, 
                           width: int, height: int) -> str:
    """Cria imagem estilizada com gradiente, formas e texto."""
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)
    
    # Gradiente de fundo
    palette = PALETTES[scene_num % len(PALETTES)]
    c1, c2 = palette
    for y in range(height):
        ratio = y / height
        r = int(c1[0] + (c2[0] - c1[0]) * ratio)
        g = int(c1[1] + (c2[1] - c1[1]) * ratio)
        b = int(c1[2] + (c2[2] - c1[2]) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Adicionar formas decorativas
    for _ in range(random.randint(3, 8)):
        x = random.randint(0, width)
        y = random.randint(0, height)
        size = random.randint(50, 300)
        opacity_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        opacity_draw = ImageDraw.Draw(opacity_layer)
        color = (
            random.randint(200, 255),
            random.randint(200, 255),
            random.randint(200, 255),
            random.randint(10, 40)
        )
        opacity_draw.ellipse([x-size, y-size, x+size, y+size], fill=color)
        img = Image.alpha_composite(img.convert("RGBA"), opacity_layer).convert("RGB")
    
    draw = ImageDraw.Draw(img)
    
    # Texto overlay
    display_text = text_overlay or _summarize(description)
    if display_text:
        _draw_centered_text(draw, display_text, width, height)
    
    # Salvar
    path = os.path.join(OUTPUT_DIR, f"scene_{scene_num:03d}.png")
    img.save(path, "PNG")
    return path


def _summarize(text: str, max_words: int = 8) -> str:
    """Resume descrição visual em poucas palavras."""
    words = text.split()[:max_words]
    return " ".join(words)


def _draw_centered_text(draw: ImageDraw, text: str, width: int, height: int):
    """Desenha texto centralizado com sombra."""
    # Tentar usar fonte do sistema
    font_size = width // 15
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    # Quebrar texto em linhas
    words = text.split()
    lines = []
    current_line = ""
    for word in words:
        test = f"{current_line} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] > width * 0.8:
            if current_line:
                lines.append(current_line)
            current_line = word
        else:
            current_line = test
    if current_line:
        lines.append(current_line)
    
    # Calcular posição
    line_height = font_size * 1.4
    total_height = len(lines) * line_height
    y_start = (height - total_height) / 2
    
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x = (width - text_width) / 2
        y = y_start + i * line_height
        
        # Sombra
        draw.text((x + 3, y + 3), line, fill=(0, 0, 0), font=font)
        # Texto
        draw.text((x, y), line, fill=(255, 255, 255), font=font)


if __name__ == "__main__":
    test_scenes = [
        {"number": 1, "visual_description": "Inteligência artificial", "text_overlay": "O FUTURO É AGORA"},
        {"number": 2, "visual_description": "Robô criativo", "text_overlay": "IA + CRIATIVIDADE"},
    ]
    paths = generate_images(test_scenes)
    for p in paths:
        print(f"✅ {p}")
