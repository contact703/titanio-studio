import asyncio
import os
import sys

# Verificar se Ollama está rodando
import urllib.request
try:
    urllib.request.urlopen("http://localhost:11434/api/tags", timeout=3)
    print("✅ Ollama rodando")
except:
    print("❌ Ollama não está rodando")
    sys.exit(1)

# Importar LightRAG
from lightrag import LightRAG, QueryParam
from lightrag.llm.ollama import ollama_model_complete, ollama_embed
from lightrag.utils import EmbeddingFunc
import numpy as np

WORKING_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/lightrag-memory/storage"

async def main():
    print("🔧 Inicializando LightRAG com Ollama...")
    
    rag = LightRAG(
        working_dir=WORKING_DIR,
        llm_model_func=ollama_model_complete,
        llm_model_name="llama3.1:8b",
        llm_model_max_async=1,
        llm_model_max_token_size=8192,
        llm_model_kwargs={"host": "http://localhost:11434", "options": {"num_ctx": 8192}},
        embedding_func=EmbeddingFunc(
            embedding_dim=768,
            max_token_size=8192,
            func=lambda texts: ollama_embed(
                texts, embed_model="nomic-embed-text", host="http://localhost:11434"
            ),
        ),
    )
    
    print("✅ LightRAG inicializado")
    return rag

if __name__ == "__main__":
    rag = asyncio.run(main())
    print("✅ Pronto para indexar documentos")
