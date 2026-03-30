#!/usr/bin/env python3
"""
Gerador de capas para Great Brazilian Classics Collection
Dimensões KDP: 1600 × 2560 px | 300 DPI | JPEG 95%

Uso:
    python3 generate_cover.py --title-en "BARREN LIVES" --title-pt "Vidas Secas" \
        --author "Graciliano Ramos" --output output/barren-lives.jpg

Dependências: pip install Pillow
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("ERRO: Pillow não instalado. Execute: pip install Pillow")
    sys.exit(1)

# === CONSTANTES ===
COVER_W, COVER_H = 1600, 2560
JPEG_QUALITY = 95
DPI = 300

# Cores
WHITE = (255, 255, 255, 255)
GOLD = (212, 175, 55, 255)
CREAM = (255, 248, 220, 255)
DARK = (10, 8, 6, 255)
DARK_OVERLAY = (10, 8, 6)

# Diretórios
SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
FONTS_DIR = PROJECT_DIR / "fonts"
OUTPUT_DIR = PROJECT_DIR / "output"


def load_font(name: str, size: int) -> ImageFont.FreeTypeFont:
    """Carrega fonte do diretório fonts/ ou usa fallback."""
    font_path = FONTS_DIR / name
    if font_path.exists():
        return ImageFont.truetype(str(font_path), size)
    # Fallback: tenta fontes do sistema
    for fallback in [
        "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ]:
        if os.path.exists(fallback):
            return ImageFont.truetype(fallback, size)
    return ImageFont.load_default()


def draw_centered_text(
    draw: ImageDraw.Draw,
    text: str,
    y: int,
    font: ImageFont.FreeTypeFont,
    fill: tuple,
    max_width: int = COVER_W - 200,
):
    """Desenha texto centralizado horizontalmente."""
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    x = (COVER_W - text_w) // 2
    # Shadow
    draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, 128))
    # Main text
    draw.text((x, y), text, font=font, fill=fill)


def draw_decorative_line(draw: ImageDraw.Draw, y: int, color: tuple, width: int = 400):
    """Linha decorativa centralizada."""
    x_start = (COVER_W - width) // 2
    x_end = x_start + width
    draw.line([(x_start, y), (x_end, y)], fill=color, width=2)
    # Detalhes nas pontas
    draw.ellipse([x_start - 4, y - 4, x_start + 4, y + 4], fill=color)
    draw.ellipse([x_end - 4, y - 4, x_end + 4, y + 4], fill=color)


def generate_cover(
    title_en: str,
    title_pt: str = "",
    author: str = "",
    background_image: str = "",
    collection_label: str = "GREAT BRAZILIAN CLASSICS COLLECTION",
    overlay_opacity: int = 120,
    output_path: str = "",
) -> str:
    """Gera capa KDP completa."""

    # Criar imagem base
    if background_image and os.path.exists(background_image):
        bg = Image.open(background_image).convert("RGBA")
        bg = bg.resize((COVER_W, COVER_H), Image.Resampling.LANCZOS)
        # Overlay escuro
        overlay = Image.new("RGBA", (COVER_W, COVER_H), (*DARK_OVERLAY, overlay_opacity))
        img = Image.alpha_composite(bg, overlay)
    else:
        # Gradient escuro elegante
        img = Image.new("RGBA", (COVER_W, COVER_H), DARK)
        draw_grad = ImageDraw.Draw(img)
        for y in range(COVER_H):
            r = int(10 + (y / COVER_H) * 20)
            g = int(8 + (y / COVER_H) * 15)
            b = int(6 + (y / COVER_H) * 25)
            draw_grad.line([(0, y), (COVER_W, y)], fill=(r, g, b, 255))

    draw = ImageDraw.Draw(img)

    # Fontes
    font_label = load_font("Raleway-Variable.ttf", 28)
    font_title = load_font("PlayfairDisplay-Variable.ttf", 72)
    font_subtitle = load_font("PlayfairDisplay-Italic.ttf", 36)
    font_author = load_font("Raleway-Variable.ttf", 32)

    # === LAYOUT ===

    # Collection label (topo)
    y_pos = 180
    draw_centered_text(draw, collection_label, y_pos, font_label, GOLD)

    # Linha decorativa
    y_pos += 60
    draw_decorative_line(draw, y_pos, GOLD, 500)

    # Título EN (centro-superior)
    y_pos = COVER_H // 2 - 120
    draw_centered_text(draw, title_en.upper(), y_pos, font_title, WHITE)

    # Linha separadora
    y_pos += 100
    draw_decorative_line(draw, y_pos, CREAM, 300)

    # Título PT (abaixo)
    if title_pt:
        y_pos += 30
        draw_centered_text(draw, title_pt, y_pos, font_subtitle, CREAM)

    # Autor (base)
    y_pos = COVER_H - 350
    draw_centered_text(draw, author.upper(), y_pos, font_author, WHITE)

    # Borda decorativa
    border_margin = 40
    draw.rectangle(
        [border_margin, border_margin, COVER_W - border_margin, COVER_H - border_margin],
        outline=(*GOLD[:3], 80),
        width=2,
    )

    # === SALVAR ===
    if not output_path:
        filename = title_en.lower().replace(" ", "-").replace("/", "") + f"-{int(__import__('time').time())}.jpg"
        output_path = str(OUTPUT_DIR / filename)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Converter RGBA → RGB para JPEG
    img_rgb = img.convert("RGB")
    img_rgb.save(output_path, "JPEG", quality=JPEG_QUALITY, dpi=(DPI, DPI))

    file_size_kb = os.path.getsize(output_path) / 1024
    print(f"✅ Capa gerada: {output_path} ({file_size_kb:.0f} KB)")
    return output_path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gerar capa KDP - Brazilian Classics")
    parser.add_argument("--title-en", required=True, help="Título em inglês")
    parser.add_argument("--title-pt", default="", help="Título em português")
    parser.add_argument("--author", required=True, help="Nome do autor")
    parser.add_argument("--background", default="", help="Caminho da imagem de fundo")
    parser.add_argument("--label", default="GREAT BRAZILIAN CLASSICS COLLECTION")
    parser.add_argument("--opacity", type=int, default=120, help="Opacidade do overlay")
    parser.add_argument("--output", default="", help="Caminho de saída")

    args = parser.parse_args()
    generate_cover(
        title_en=args.title_en,
        title_pt=args.title_pt,
        author=args.author,
        background_image=args.background,
        collection_label=args.label,
        overlay_opacity=args.opacity,
        output_path=args.output,
    )
