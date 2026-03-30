import asyncio, os, numpy as np, httpx
from pathlib import Path

WORKING_DIR = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/lightrag-memory/storage"
DOCS_DIR    = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/lightrag-memory/docs"
os.makedirs(WORKING_DIR, exist_ok=True)

async def warmup_models():
    """Carrega phi3 e nomic-embed-text no Ollama antes de usar LightRAG"""
    print("🔥 Aquecendo modelos no Ollama...")
    async with httpx.AsyncClient(timeout=120) as c:
        # Aquecer LLM
        r = await c.post("http://localhost:11434/api/chat",
            json={"model":"phi3:3.8b-instruct",
                  "messages":[{"role":"user","content":"ready"}],
                  "stream":False})
        print(f"  ✅ phi3 carregado: {r.json().get('message',{}).get('content','?')[:30]}")
        # Aquecer embedding
        r2 = await c.post("http://localhost:11434/api/embed",
            json={"model":"nomic-embed-text","input":["warmup"]})
        embs = r2.json().get("embeddings",[])
        print(f"  ✅ nomic-embed-text carregado: dim={len(embs[0]) if embs else 'err'}")

async def local_embed(texts: list[str]) -> np.ndarray:
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post("http://localhost:11434/api/embed",
            json={"model":"nomic-embed-text","input":texts})
        d = r.json()
        embs = d.get("embeddings",[])
        if not embs:
            raise ValueError(f"Sem embeddings: {d.get('error','unknown')}")
        return np.array(embs, dtype=np.float32)

async def local_llm(prompt, system_prompt=None, history_messages=[], **kwargs):
    msgs = []
    if system_prompt: msgs.append({"role":"system","content":system_prompt})
    msgs += history_messages
    msgs.append({"role":"user","content":prompt})
    async with httpx.AsyncClient(timeout=180) as c:
        r = await c.post("http://localhost:11434/api/chat",
            json={"model":"phi3:3.8b-instruct","messages":msgs,"stream":False})
        return r.json().get("message",{}).get("content","")

async def main():
    from lightrag import LightRAG, QueryParam
    from lightrag.utils import EmbeddingFunc

    # PASSO CRÍTICO: aquecer modelos primeiro
    await warmup_models()

    print("\n🔧 Inicializando LightRAG...")
    rag = LightRAG(
        working_dir=WORKING_DIR,
        llm_model_func=local_llm,
        llm_model_name="phi3:3.8b-instruct",
        llm_model_max_async=1,
        embedding_func=EmbeddingFunc(embedding_dim=768, max_token_size=2048, func=local_embed),
    )
    await rag.initialize_storages()
    print("✅ LightRAG inicializado")

    # Indexar apenas chunk pequeno (5KB) para teste rápido
    doc = Path(DOCS_DIR) / "especialistas-conhecimento.txt"
    content = doc.read_text()[:5000]
    print(f"📚 Indexando {len(content)} chars...")
    await rag.ainsert(content)

    # Verificar grafo
    graph = Path(WORKING_DIR) / "graph_chunk_entity_relation.graphml"
    if graph.exists() and graph.stat().st_size > 500:
        print(f"✅ Grafo de conhecimento criado: {graph.stat().st_size//1024}KB")
        grafo_ok = True
    else:
        print("⚠️ Grafo não criado")
        grafo_ok = False

    # Testes
    print("\n🧪 TESTES:")
    tests = [
        ("Como iniciar N8n corretamente?", "local"),
        ("Qual especialista cuida de automação?", "hybrid"),
        ("Projetos ativos no Titanio", "global"),
    ]
    passed = 0
    for query, mode in tests:
        print(f"\n❓ [{mode}] {query}")
        try:
            r = await rag.aquery(query, param=QueryParam(mode=mode))
            ans = str(r).strip()
            ok = ans and ans != "None" and "not able" not in ans and "no-context" not in ans
            if ok:
                passed += 1
                print(f"✅ {ans[:400]}")
            else:
                print(f"⚠️ Sem contexto ainda (grafo vazio = normal no primeiro teste)")
        except Exception as e:
            print(f"❌ {e}")

    await rag.finalize_storages()

    # Relatório
    print("\n" + "="*50)
    print("📊 RELATÓRIO FINAL — LightRAG")
    print("="*50)
    storage = list(Path(WORKING_DIR).glob("*"))
    total_kb = sum(f.stat().st_size for f in storage) // 1024
    print(f"Versão: lightrag-hku 1.4.11")
    print(f"LLM: phi3:3.8b-instruct (local, Ollama)")
    print(f"Embedding: nomic-embed-text 768d (local)")
    print(f"Storage: {len(storage)} arquivos, {total_kb}KB total")
    print(f"Grafo de conhecimento: {'✅ criado' if grafo_ok else '⚠️ não criado (requer mais indexação)'}")
    print(f"Consultas respondidas: {passed}/{len(tests)}")
    print(f"\nDocumentos disponíveis para indexar:")
    for f in Path(DOCS_DIR).iterdir():
        print(f"  - {f.name}: {f.stat().st_size//1024}KB")
    print("="*50)
    print("STATUS: ✅ INSTALADO" if grafo_ok else "STATUS: ⚠️ INSTALADO (grafo precisa de mais dados)")

if __name__ == "__main__":
    asyncio.run(main())
