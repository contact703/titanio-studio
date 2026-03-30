#!/usr/bin/env python3
"""
Script para baixar reels do Instagram usando yt-dlp
"""
import subprocess
import sys
import os
from pathlib import Path

def download_instagram_reel(url, output_dir="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/instagram_downloads"):
    """Baixa um reel do Instagram"""
    
    # Criar diretório de saída
    os.makedirs(output_dir, exist_ok=True)
    
    # Configurar comando yt-dlp
    # --cookies-from-browser pode ser necessário para conteúdo privado
    cmd = [
        "yt-dlp",
        "--no-warnings",
        "--quiet",
        "--no-check-certificate",
        "--format", "best[ext=mp4]/best",
        "--output", os.path.join(output_dir, "%(title).50s_%(id)s.%(ext)s"),
        url
    ]
    
    print(f"Baixando: {url}")
    print(f"Salvando em: {output_dir}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        if result.returncode == 0:
            print("✅ Download concluído com sucesso!")
            # Listar arquivos baixados
            files = os.listdir(output_dir)
            if files:
                print(f"📁 Arquivos em {output_dir}:")
                for f in files:
                    print(f"   - {f}")
            return True
        else:
            print(f"❌ Erro no download:")
            print(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("⏱️ Timeout - o download demorou muito")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python3 download_instagram.py <URL_DO_REEL>")
        print("Exemplo: python3 download_instagram.py 'https://www.instagram.com/reel/ABC123/'")
        sys.exit(1)
    
    url = sys.argv[1]
    download_instagram_reel(url)
