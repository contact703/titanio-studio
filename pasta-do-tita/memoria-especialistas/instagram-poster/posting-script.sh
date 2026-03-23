#!/bin/bash
# Instagram Poster — Script de Postagem Rápida
# Uso: bash posting-script.sh "Tema do post" "Caption (opcional)"

TEMA="${1:-OpenClaw}"
CAPTION="${2:-}"

python3 << EOF
from instagrapi import Client
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json
import sys

tema = "$TEMA"
caption_custom = """$CAPTION"""

# Caption padrão se não informado
if not caption_custom.strip():
    caption_custom = f"🚀 {tema}\n\n✅ Automação real\n✅ Sem bloqueios\n✅ Custo zero\n\n#OpenClaw #AI #Automation #Mac"

print(f"📸 Criando post sobre: {tema}")

# 1. Criar imagem
img = Image.new('RGB', (1080, 1350), color='#0a0e27')
draw = ImageDraw.Draw(img)

try:
    font_big = ImageFont.truetype("/Library/Fonts/Arial.ttf", 60)
    font_normal = ImageFont.truetype("/Library/Fonts/Arial.ttf", 36)
except:
    font_big = ImageFont.load_default()
    font_normal = ImageFont.load_default()

draw.text((540, 200), f"🚀 {tema}", fill='#00ff00', font=font_big, anchor="mm")
draw.text((540, 600), caption_custom, fill='#ffffff', font=font_normal, anchor="mm", align="center")

img_path = f"/tmp/insta_{tema.replace(' ', '_')}.png"
img.save(img_path)
print(f"✅ Imagem criada")

# 2. Fazer login
print("🔐 Conectando ao Instagram...")
cl = Client()
cl.login("titaniodashboard", "Rita160679!")
print("✅ Login OK")

# 3. Postar
print(f"📤 Postando...")
media = cl.photo_upload(path=img_path, caption=caption_custom)
print(f"✅ POSTADO!")
print(f"🔗 https://www.instagram.com/p/{media.code}/")

EOF
