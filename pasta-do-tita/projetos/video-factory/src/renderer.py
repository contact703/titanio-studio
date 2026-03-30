"""
Renderizador — monta o vídeo final com MoviePy + FFmpeg.
Combina: imagens + narração + legendas + música.
"""
import os
from moviepy import (
    ImageClip, AudioFileClip, TextClip, CompositeVideoClip,
    concatenate_videoclips, CompositeAudioClip
)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")


def render_video(
    scenes: list,
    image_paths: list,
    audio_paths: list,
    output_name: str = "video_final.mp4",
    width: int = 1080,
    height: int = 1920,
    music_path: str = None
) -> str:
    """
    Renderiza o vídeo final.
    
    scenes: lista de cenas do roteiro
    image_paths: lista de paths das imagens
    audio_paths: lista de dicts com {number, path, text}
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, output_name)
    
    clips = []
    
    for i, scene in enumerate(scenes):
        number = scene.get("number", i + 1)
        duration = scene.get("duration", 5)
        narration_text = scene.get("narration", "")
        
        # Imagem de fundo
        img_path = image_paths[i] if i < len(image_paths) else image_paths[-1]
        img_clip = (
            ImageClip(img_path)
            .resized((width, height))
            .with_duration(duration)
        )
        
        # Áudio da narração (se existir)
        audio_info = next((a for a in audio_paths if a["number"] == number), None)
        if audio_info and os.path.exists(audio_info["path"]):
            audio_clip = AudioFileClip(audio_info["path"])
            # Ajustar duração da cena ao áudio
            actual_duration = max(duration, audio_clip.duration + 0.5)
            img_clip = img_clip.with_duration(actual_duration)
            img_clip = img_clip.with_audio(audio_clip)
        
        # Legenda estilizada
        if narration_text:
            try:
                # Legenda com fundo semi-transparente
                txt_clip = (
                    TextClip(
                        text=narration_text,
                        font_size=42,
                        color="white",
                        font="Helvetica-Bold",
                        stroke_color="black",
                        stroke_width=2,
                        size=(width - 120, None),
                        method="caption"
                    )
                    .with_duration(img_clip.duration)
                    .with_position(("center", height - 350))
                )
                img_clip = CompositeVideoClip([img_clip, txt_clip])
            except Exception as e:
                print(f"⚠️ Legenda falhou na cena {number}: {e}")
        
        clips.append(img_clip)
    
    if not clips:
        raise ValueError("Nenhum clip gerado!")
    
    # Concatenar todas as cenas
    final = concatenate_videoclips(clips, method="compose")
    
    # Adicionar música de fundo (se tiver)
    if music_path and os.path.exists(music_path):
        music = AudioFileClip(music_path).with_volume_scaled(0.15)
        if music.duration < final.duration:
            # Loop da música
            loops_needed = int(final.duration / music.duration) + 1
            from moviepy import concatenate_audioclips
            music = concatenate_audioclips([music] * loops_needed)
        music = music.subclipped(0, final.duration)
        
        if final.audio:
            final = final.with_audio(CompositeAudioClip([final.audio, music]))
        else:
            final = final.with_audio(music)
    
    # Renderizar
    print(f"🎬 Renderizando {len(clips)} cenas...")
    final.write_videofile(
        output_path,
        fps=30,
        codec="libx264",
        audio_codec="aac",
        preset="medium",
        threads=4,
        logger="bar"
    )
    
    print(f"✅ Vídeo renderizado: {output_path}")
    return output_path


if __name__ == "__main__":
    print("Use pipeline.py para renderizar vídeos completos.")
