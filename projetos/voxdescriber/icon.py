#!/usr/bin/env python3
"""
Gera o ícone do VoxDescriber — 512x512 PNG
Fundo dark #0d0d1a | ondas sonoras roxo/ciano | "VD" estilizado
"""

from PIL import Image, ImageDraw, ImageFilter
import math

SIZE = 512
BG = (13, 13, 26)
PURP = (124, 92, 252)
CYAN = (0, 212, 255)
PINK = (252, 92, 245)
WHITE = (232, 232, 255)

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# ── Fundo com gradiente radial ────────────────────────────────────────────────
bg = Image.new("RGBA", (SIZE, SIZE), BG + (255,))
bg_draw = ImageDraw.Draw(bg)

# Círculo de brilho central
for r in range(220, 0, -1):
    t = 1 - r / 220
    alpha = int(t * 40)
    rc = int(BG[0] + (80 - BG[0]) * t)
    gc = int(BG[1] + (50 - BG[1]) * t)
    bc = int(BG[2] + (100 - BG[2]) * t)
    bg_draw.ellipse(
        [SIZE//2 - r, SIZE//2 - r, SIZE//2 + r, SIZE//2 + r],
        fill=(rc, gc, bc, 255)
    )

img = bg.copy()
draw = ImageDraw.Draw(img)

# ── Bordas arredondadas (máscara) ────────────────────────────────────────────
mask = Image.new("L", (SIZE, SIZE), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle([0, 0, SIZE, SIZE], radius=96, fill=255)

# ── Ondas sonoras ─────────────────────────────────────────────────────────────
cx, cy = SIZE // 2, SIZE // 2

# Barras verticais tipo equalizer
num_bars = 24
bar_area_w = 340
bar_area_h = 220
bar_w = bar_area_w // num_bars - 4
start_x = cx - bar_area_w // 2

# Perfil de amplitudes: onda senoidal dupla
heights = []
for i in range(num_bars):
    t = i / (num_bars - 1)
    h = (
        0.4 + 0.6 * abs(math.sin(t * math.pi * 2.5))
        + 0.2 * abs(math.sin(t * math.pi * 5))
    )
    h = min(1.0, h)
    heights.append(h)

# Normalizar para pico máximo
peak = max(heights)
heights = [h / peak for h in heights]

glow_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow_layer)

bar_colors_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
bar_draw = ImageDraw.Draw(bar_colors_layer)

for i, h in enumerate(heights):
    t = i / (num_bars - 1)
    # Interpolação roxo → ciano → rosa
    if t < 0.5:
        tt = t * 2
        r = int(PURP[0] + (CYAN[0] - PURP[0]) * tt)
        g = int(PURP[1] + (CYAN[1] - PURP[1]) * tt)
        b = int(PURP[2] + (CYAN[2] - PURP[2]) * tt)
    else:
        tt = (t - 0.5) * 2
        r = int(CYAN[0] + (PINK[0] - CYAN[0]) * tt)
        g = int(CYAN[1] + (PINK[1] - CYAN[1]) * tt)
        b = int(CYAN[2] + (PINK[2] - CYAN[2]) * tt)

    color = (r, g, b, 230)
    bar_h = int(bar_area_h * h)
    x0 = start_x + i * (bar_w + 4)
    x1 = x0 + bar_w
    y0 = cy - bar_h // 2
    y1 = cy + bar_h // 2

    # Glow (barra mais larga e transparente)
    gw = bar_w + 8
    gx0 = x0 - 4
    gx1 = x1 + 4
    gy0 = cy - int(bar_h * 0.6)
    gy1 = cy + int(bar_h * 0.6)
    glow_draw.rounded_rectangle([gx0, gy0, gx1, gy1], radius=6, fill=(r, g, b, 40))

    # Barra principal
    bar_draw.rounded_rectangle([x0, y0, x1, y1], radius=4, fill=color)

# Compositar camadas
img = Image.alpha_composite(img.convert("RGBA"), glow_layer)
img = Image.alpha_composite(img, bar_colors_layer)
draw = ImageDraw.Draw(img)

# ── Círculo de microfone central ──────────────────────────────────────────────
# Base do microfone
mic_r = 52
mic_cx, mic_cy = cx, cy - 10

# Sombra do círculo
for rr in range(mic_r + 20, mic_r - 1, -1):
    alpha = int(80 * (1 - (rr - mic_r) / 20))
    draw.ellipse(
        [mic_cx - rr, mic_cy - rr, mic_cx + rr, mic_cy + rr],
        outline=(124, 92, 252, alpha)
    )

# Círculo preenchido (gradiente manual)
circle_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
circle_draw = ImageDraw.Draw(circle_layer)
circle_draw.ellipse(
    [mic_cx - mic_r, mic_cy - mic_r, mic_cx + mic_r, mic_cy + mic_r],
    fill=(20, 15, 45, 255)
)
# Borda gradiente
for angle_step in range(360):
    angle = math.radians(angle_step)
    t = (math.sin(angle) + 1) / 2
    r = int(PURP[0] + (CYAN[0] - PURP[0]) * t)
    g = int(PURP[1] + (CYAN[1] - PURP[1]) * t)
    b_c = int(PURP[2] + (CYAN[2] - PURP[2]) * t)
    px = mic_cx + int(mic_r * math.cos(angle))
    py = mic_cy + int(mic_r * math.sin(angle))
    circle_draw.ellipse([px-3, py-3, px+3, py+3], fill=(r, g, b_c, 200))

img = Image.alpha_composite(img, circle_layer)
draw = ImageDraw.Draw(img)

# ── Letra "V" estilizada ──────────────────────────────────────────────────────
try:
    from PIL import ImageFont
    # Tentar fonte do sistema
    font_path = "/System/Library/Fonts/Helvetica.ttc"
    try:
        font = ImageFont.truetype(font_path, 52)
    except Exception:
        font = ImageFont.load_default()

    text = "VD"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = mic_cx - tw // 2 - bbox[0]
    ty = mic_cy - th // 2 - bbox[1]

    # Texto principal branco
    draw.text((tx, ty), text, font=font, fill=(232, 232, 255, 230))

except Exception as e:
    # Fallback: desenhar um "V" geométrico simples
    v_pts = [
        (mic_cx - 22, mic_cy - 16),
        (mic_cx, mic_cy + 16),
        (mic_cx + 22, mic_cy - 16),
    ]
    draw.line([v_pts[0], v_pts[1]], fill=WHITE + (220,), width=5)
    draw.line([v_pts[1], v_pts[2]], fill=WHITE + (220,), width=5)

# ── Arco de audiodescrição ────────────────────────────────────────────────────
for arc_r, arc_alpha in [(80, 100), (100, 60), (120, 30)]:
    draw.arc(
        [mic_cx - arc_r, mic_cy - arc_r + 20, mic_cx + arc_r, mic_cy + arc_r + 20],
        start=200, end=340,
        fill=(0, 212, 255, arc_alpha), width=3
    )

# ── "VoxDescriber" text na base ───────────────────────────────────────────────
try:
    try:
        font_sm = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 26)
    except Exception:
        font_sm = ImageFont.load_default()

    label = "VoxDescriber"
    bbox2 = draw.textbbox((0, 0), label, font=font_sm)
    lw = bbox2[2] - bbox2[0]
    lx = cx - lw // 2 - bbox2[0]
    ly = SIZE - 80

    # Sombra
    draw.text((lx + 1, ly + 1), label, font=font_sm, fill=(0, 0, 0, 120))

    # Gradiente de texto via múltiplos pontos (aproximado)
    for char_i, char in enumerate(label):
        t = char_i / max(len(label) - 1, 1)
        if t < 0.5:
            tt = t * 2
            cr = int(PURP[0] + (CYAN[0] - PURP[0]) * tt)
            cg = int(PURP[1] + (CYAN[1] - PURP[1]) * tt)
            cb = int(PURP[2] + (CYAN[2] - PURP[2]) * tt)
        else:
            tt = (t - 0.5) * 2
            cr = int(CYAN[0] + (PINK[0] - CYAN[0]) * tt)
            cg = int(CYAN[1] + (PINK[1] - CYAN[1]) * tt)
            cb = int(CYAN[2] + (PINK[2] - CYAN[2]) * tt)

        char_bbox = draw.textbbox((lx, ly), label[:char_i], font=font_sm)
        char_x = lx + (char_bbox[2] - char_bbox[0])
        draw.text((char_x, ly), char, font=font_sm, fill=(cr, cg, cb, 220))

except Exception:
    pass

# ── Aplicar máscara de cantos arredondados ─────────────────────────────────────
img.putalpha(mask)

# Salvar
out = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/voxdescriber/voxdescriber-icon.png"
img.save(out, "PNG")
print(f"✅ Ícone salvo: {out}")
