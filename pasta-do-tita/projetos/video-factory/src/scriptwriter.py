"""
Roteirista IA — transforma texto/ideia em roteiro dividido por cenas.
Usa API do Claude, OpenAI ou Ollama local.
"""
import os
import json
import requests

def generate_script(prompt: str, duration_seconds: int = 60, style: str = "informativo") -> dict:
    """Gera roteiro dividido em cenas a partir de um prompt."""
    
    system = f"""Você é um roteirista de vídeos curtos para redes sociais.
Crie um roteiro de {duration_seconds} segundos no estilo {style}.
Divida em cenas de 5-10 segundos cada.

Responda APENAS em JSON válido neste formato:
{{
    "title": "título do vídeo",
    "scenes": [
        {{
            "number": 1,
            "duration": 8,
            "narration": "texto que será narrado nesta cena",
            "visual_description": "descrição da imagem/ilustração para esta cena",
            "text_overlay": "texto curto que aparece na tela (opcional)"
        }}
    ],
    "total_duration": {duration_seconds},
    "music_mood": "tipo de música de fundo sugerida"
}}"""

    user_msg = f"Crie um vídeo sobre: {prompt}"
    
    # Tentar Claude primeiro, depois OpenAI, depois Ollama
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key:
        return _call_claude(system, user_msg, api_key)
    
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        return _call_openai(system, user_msg, api_key)
    
    # Fallback: Ollama local
    return _call_ollama(system, user_msg)


def _call_claude(system: str, user_msg: str, api_key: str) -> dict:
    resp = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        },
        json={
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 2000,
            "system": system,
            "messages": [{"role": "user", "content": user_msg}]
        },
        timeout=60
    )
    text = resp.json()["content"][0]["text"]
    # Extrair JSON
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    elif "```" in text:
        text = text.split("```")[1].split("```")[0]
    return json.loads(text)


def _call_openai(system: str, user_msg: str, api_key: str) -> dict:
    resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user_msg}
            ],
            "max_tokens": 2000
        },
        timeout=60
    )
    text = resp.json()["choices"][0]["message"]["content"]
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0]
    return json.loads(text)


def _call_ollama(system: str, user_msg: str) -> dict:
    try:
        resp = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "llama3",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_msg}
                ],
                "stream": False
            },
            timeout=120
        )
        text = resp.json()["message"]["content"]
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        return json.loads(text)
    except Exception as e:
        # Roteiro manual de fallback
        return {
            "title": "Vídeo",
            "scenes": [
                {
                    "number": 1,
                    "duration": 10,
                    "narration": user_msg,
                    "visual_description": "Ilustração relacionada ao tema",
                    "text_overlay": ""
                }
            ],
            "total_duration": 10,
            "music_mood": "neutro"
        }


if __name__ == "__main__":
    import sys
    topic = sys.argv[1] if len(sys.argv) > 1 else "inteligência artificial"
    script = generate_script(topic)
    print(json.dumps(script, ensure_ascii=False, indent=2))
