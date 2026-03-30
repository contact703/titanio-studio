#!/usr/bin/env python3
"""
TITA Memory Engine v1.0 — Semantic Memory Layer
================================================
Upgrades Tita's memory from keyword-match to semantic understanding.

Uses:
- Ollama nomic-embed-text (local, 768-dim embeddings)
- SQLite + numpy for vector search (zero external deps)
- Hierarchical memory: working → episodic → semantic

Run modes:
  index   — Index all memory files into vector DB
  search  — Semantic search across all memories  
  stats   — Show memory statistics
  refresh — Re-index only changed files
"""

import os
import sys
import json
import glob
import hashlib
import sqlite3
import time
import re
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import urllib.request

# === CONFIG ===
WORKSPACE = os.environ.get("TITA_WORKSPACE", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace")
MEMORY_DIR = os.path.join(WORKSPACE, "memory")
DB_PATH = os.path.join(WORKSPACE, "memory", "tita-memory.db")
OLLAMA_URL = "http://localhost:11434/api/embeddings"
EMBED_MODEL = "nomic-embed-text"
CHUNK_SIZE = 500  # chars per chunk (sweet spot for nomic)
CHUNK_OVERLAP = 100

# Files to index (memory layer hierarchy)
MEMORY_FILES = {
    "semantic": [  # Long-term curated knowledge (highest weight)
        os.path.join(WORKSPACE, "MEMORY.md"),
        os.path.join(WORKSPACE, "LESSONS.md"),
    ],
    "episodic": [],  # Daily logs (medium weight) — populated dynamically
    "reference": [  # Project context (lower weight)
        os.path.join(WORKSPACE, "USER.md"),
        os.path.join(WORKSPACE, "TOOLS.md"),
    ],
}


def get_embedding(text: str) -> list[float]:
    """Get embedding from local Ollama."""
    data = json.dumps({"model": EMBED_MODEL, "prompt": text}).encode()
    req = urllib.request.Request(OLLAMA_URL, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            return result["embedding"]
    except Exception as e:
        print(f"  ⚠️  Embedding failed: {e}")
        return None


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two vectors."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def chunk_text(text: str, source: str) -> list[dict]:
    """Split text into overlapping chunks with metadata."""
    chunks = []
    # Split by sections first (## headers)
    sections = re.split(r'\n(?=##? )', text)
    
    for section in sections:
        section = section.strip()
        if not section or len(section) < 20:
            continue
        
        # Extract section title if present
        title_match = re.match(r'^(#{1,3})\s+(.+)', section)
        title = title_match.group(2) if title_match else ""
        
        # If section is small enough, keep it whole
        if len(section) <= CHUNK_SIZE:
            chunks.append({
                "text": section,
                "source": source,
                "title": title,
                "char_start": 0,
            })
        else:
            # Split long sections into overlapping chunks
            for i in range(0, len(section), CHUNK_SIZE - CHUNK_OVERLAP):
                chunk = section[i:i + CHUNK_SIZE]
                if len(chunk) < 50:
                    continue
                chunks.append({
                    "text": chunk,
                    "source": source,
                    "title": title,
                    "char_start": i,
                })
    
    return chunks


def file_hash(path: str) -> str:
    """Get hash of file contents for change detection."""
    try:
        with open(path, "r") as f:
            return hashlib.md5(f.read().encode()).hexdigest()
    except:
        return ""


def init_db(conn: sqlite3.Connection):
    """Create tables if they don't exist."""
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source TEXT NOT NULL,
            title TEXT,
            text TEXT NOT NULL,
            layer TEXT NOT NULL,  -- semantic, episodic, reference
            embedding BLOB,
            importance REAL DEFAULT 1.0,
            created_at TEXT,
            file_hash TEXT
        );
        
        CREATE TABLE IF NOT EXISTS file_index (
            path TEXT PRIMARY KEY,
            hash TEXT,
            layer TEXT,
            chunk_count INTEGER,
            indexed_at TEXT
        );
        
        CREATE TABLE IF NOT EXISTS search_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT,
            top_result TEXT,
            score REAL,
            searched_at TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_chunks_source ON chunks(source);
        CREATE INDEX IF NOT EXISTS idx_chunks_layer ON chunks(layer);
    """)


def calculate_importance(text: str, layer: str, source: str) -> float:
    """Score importance: semantic > episodic > reference, with content bonuses."""
    base = {"semantic": 1.5, "episodic": 1.0, "reference": 0.7}.get(layer, 1.0)
    
    # Recency bonus for episodic (daily files)
    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', source)
    if date_match:
        try:
            file_date = datetime.strptime(date_match.group(1), "%Y-%m-%d")
            days_ago = (datetime.now() - file_date).days
            recency = max(0.5, 1.0 - (days_ago * 0.02))  # Decay 2% per day, floor 0.5
            base *= recency
        except:
            pass
    
    # Content importance signals
    if any(w in text.lower() for w in ["crítico", "importante", "regra", "nunca", "sempre", "🔴"]):
        base *= 1.3
    if any(w in text.lower() for w in ["lição", "erro", "aprendido", "fix"]):
        base *= 1.2
    if any(w in text.lower() for w in ["helber", "eduardo", "zica", "tita"]):
        base *= 1.1
    
    return round(base, 3)


def index_file(conn: sqlite3.Connection, path: str, layer: str, force: bool = False):
    """Index a single file into the vector DB."""
    if not os.path.exists(path):
        return 0
    
    current_hash = file_hash(path)
    
    # Check if already indexed with same hash
    if not force:
        row = conn.execute("SELECT hash FROM file_index WHERE path = ?", (path,)).fetchone()
        if row and row[0] == current_hash:
            return 0  # No changes
    
    # Read file
    with open(path, "r") as f:
        text = f.read()
    
    if len(text) < 20:
        return 0
    
    # Remove old chunks for this file
    conn.execute("DELETE FROM chunks WHERE source = ?", (path,))
    
    # Chunk the text
    chunks = chunk_text(text, path)
    indexed = 0
    
    for chunk in chunks:
        embedding = get_embedding(chunk["text"])
        if embedding is None:
            continue
        
        importance = calculate_importance(chunk["text"], layer, path)
        
        conn.execute(
            "INSERT INTO chunks (source, title, text, layer, embedding, importance, created_at, file_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (
                path,
                chunk["title"],
                chunk["text"],
                layer,
                np.array(embedding, dtype=np.float32).tobytes(),
                importance,
                datetime.now().isoformat(),
                current_hash,
            ),
        )
        indexed += 1
    
    # Update file index
    conn.execute(
        "INSERT OR REPLACE INTO file_index (path, hash, layer, chunk_count, indexed_at) VALUES (?, ?, ?, ?, ?)",
        (path, current_hash, layer, indexed, datetime.now().isoformat()),
    )
    
    return indexed


def do_index(force: bool = False):
    """Index all memory files."""
    conn = sqlite3.connect(DB_PATH)
    init_db(conn)
    
    total = 0
    
    # Populate episodic files (daily logs)
    daily_files = sorted(glob.glob(os.path.join(MEMORY_DIR, "2*.md")))
    MEMORY_FILES["episodic"] = daily_files
    
    # Also add special memory files
    special = glob.glob(os.path.join(MEMORY_DIR, "*.md"))
    for f in special:
        if not os.path.basename(f).startswith("2") and f not in MEMORY_FILES["semantic"]:
            MEMORY_FILES["reference"].append(f)
    
    for layer, files in MEMORY_FILES.items():
        for path in files:
            basename = os.path.basename(path)
            count = index_file(conn, path, layer, force)
            if count > 0:
                print(f"  📝 {basename}: {count} chunks ({layer})")
                total += count
    
    conn.commit()
    
    # Stats
    total_chunks = conn.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
    total_files = conn.execute("SELECT COUNT(*) FROM file_index").fetchone()[0]
    
    print(f"\n✅ Indexed {total} new chunks")
    print(f"📊 Total: {total_chunks} chunks from {total_files} files")
    print(f"💾 DB: {os.path.getsize(DB_PATH) / 1024:.0f} KB")
    
    conn.close()


def do_search(query: str, top_k: int = 5, layer_filter: str = None):
    """Semantic search across all memories."""
    conn = sqlite3.connect(DB_PATH)
    init_db(conn)
    
    # Get query embedding
    query_emb = get_embedding(query)
    if query_emb is None:
        print("❌ Failed to get query embedding")
        return []
    
    query_vec = np.array(query_emb, dtype=np.float32)
    
    # Load all chunks
    if layer_filter:
        rows = conn.execute(
            "SELECT id, source, title, text, layer, embedding, importance FROM chunks WHERE layer = ?",
            (layer_filter,),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT id, source, title, text, layer, embedding, importance FROM chunks"
        ).fetchall()
    
    if not rows:
        print("⚠️  No indexed memories. Run: tita-memory-engine.py index")
        return []
    
    # Score each chunk
    results = []
    for row in rows:
        chunk_id, source, title, text, layer, emb_blob, importance = row
        chunk_vec = np.frombuffer(emb_blob, dtype=np.float32)
        
        similarity = cosine_similarity(query_vec, chunk_vec)
        # Final score = similarity * importance weight
        score = similarity * importance
        
        results.append({
            "id": chunk_id,
            "source": os.path.basename(source),
            "title": title or "",
            "text": text[:300],
            "layer": layer,
            "similarity": round(similarity, 4),
            "importance": importance,
            "score": round(score, 4),
        })
    
    # Sort by combined score
    results.sort(key=lambda x: x["score"], reverse=True)
    results = results[:top_k]
    
    # Log search
    if results:
        conn.execute(
            "INSERT INTO search_log (query, top_result, score, searched_at) VALUES (?, ?, ?, ?)",
            (query, results[0]["source"], results[0]["score"], datetime.now().isoformat()),
        )
        conn.commit()
    
    conn.close()
    return results


def do_stats():
    """Show memory database statistics."""
    conn = sqlite3.connect(DB_PATH)
    init_db(conn)
    
    total = conn.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
    by_layer = conn.execute("SELECT layer, COUNT(*) FROM chunks GROUP BY layer").fetchall()
    files = conn.execute("SELECT COUNT(*) FROM file_index").fetchone()[0]
    searches = conn.execute("SELECT COUNT(*) FROM search_log").fetchone()[0]
    
    print("🧠 TITA MEMORY ENGINE — Status")
    print("=" * 40)
    print(f"📊 Total chunks: {total}")
    for layer, count in by_layer:
        emoji = {"semantic": "🔴", "episodic": "🟡", "reference": "🟢"}.get(layer, "⚪")
        print(f"  {emoji} {layer}: {count} chunks")
    print(f"📁 Files indexed: {files}")
    print(f"🔍 Searches performed: {searches}")
    
    if os.path.exists(DB_PATH):
        print(f"💾 DB size: {os.path.getsize(DB_PATH) / 1024:.0f} KB")
    
    # Recent searches
    recent = conn.execute(
        "SELECT query, top_result, score, searched_at FROM search_log ORDER BY id DESC LIMIT 5"
    ).fetchall()
    if recent:
        print(f"\n🔍 Recent searches:")
        for q, result, score, when in recent:
            print(f"  '{q[:40]}' → {result} (score: {score})")
    
    conn.close()


def main():
    if len(sys.argv) < 2:
        print("Usage: tita-memory-engine.py [index|search|stats|refresh]")
        print("")
        print("  index          — Full index of all memory files")
        print("  refresh        — Index only changed files")
        print("  search <query> — Semantic search")
        print("  stats          — Show statistics")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "index":
        print("🧠 Indexing ALL memory files...")
        do_index(force=True)
    
    elif cmd == "refresh":
        print("🔄 Refreshing changed files...")
        do_index(force=False)
    
    elif cmd == "search":
        if len(sys.argv) < 3:
            print("Usage: tita-memory-engine.py search <query> [top_k]")
            sys.exit(1)
        query = " ".join(sys.argv[2:])
        top_k = 5
        # Check if last arg is a number
        try:
            top_k = int(sys.argv[-1])
            query = " ".join(sys.argv[2:-1])
        except:
            pass
        
        results = do_search(query, top_k)
        
        if not results:
            print("Nenhum resultado encontrado.")
        else:
            print(f"\n🔍 Resultados para: '{query}'\n")
            for i, r in enumerate(results, 1):
                emoji = {"semantic": "🔴", "episodic": "🟡", "reference": "🟢"}.get(r["layer"], "⚪")
                print(f"{i}. {emoji} [{r['layer']}] {r['source']}")
                if r["title"]:
                    print(f"   📌 {r['title']}")
                print(f"   Score: {r['score']} (sim: {r['similarity']}, imp: {r['importance']})")
                print(f"   {r['text'][:200]}...")
                print()
    
    elif cmd == "stats":
        do_stats()
    
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)


if __name__ == "__main__":
    main()
