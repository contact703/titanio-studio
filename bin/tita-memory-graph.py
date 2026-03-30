#!/usr/bin/env python3
"""
TITA Memory Graph v1.0 — Relationship mapping between memories
===============================================================
Extracts entities (people, projects, decisions) and maps connections.
Enables multi-hop reasoning: Person → Project → Decision → Result

Run modes:
  build   — Extract entities and build graph from indexed memories
  query   — Find connections for an entity
  stats   — Show graph statistics
"""

import os
import sys
import json
import re
import sqlite3
from collections import defaultdict
from datetime import datetime
from pathlib import Path

WORKSPACE = os.environ.get("TITA_WORKSPACE", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace")
DB_PATH = os.path.join(WORKSPACE, "memory", "tita-memory.db")
GRAPH_PATH = os.path.join(WORKSPACE, "memory", "tita-memory-graph.json")

# Known entities to track
KNOWN_PEOPLE = [
    "Eduardo", "Helber", "Zica", "Tiago", "Caio", "Elber", "Kratos", "Tita"
]
KNOWN_PROJECTS = [
    "Manda a Nota", "mandaanota", "Titanio", "Tikanawá", "Maricá Film Commission",
    "Gospia", "KidsHQ", "Micro SaaS", "Titanio Claw", "OpenClaw",
    "Memory Engine", "Dashboard", "NFS-e", "Play Store", "App Store",
    "Victor Capital", "Tita Nio"
]
KNOWN_CONCEPTS = [
    "iOS", "Android", "Apple", "Google", "RAG", "embeddings", "memória",
    "deploy", "API", "certificado", "NFS-e", "MEI", "Simples Nacional",
    "WhatsApp", "Discord", "Telegram", "cron", "watchdog", "backup"
]


def extract_entities(text: str) -> dict:
    """Extract known entities from text."""
    found = {"people": [], "projects": [], "concepts": []}
    text_lower = text.lower()
    
    for person in KNOWN_PEOPLE:
        if person.lower() in text_lower:
            found["people"].append(person)
    
    for project in KNOWN_PROJECTS:
        if project.lower() in text_lower:
            found["projects"].append(project)
    
    for concept in KNOWN_CONCEPTS:
        if concept.lower() in text_lower:
            found["concepts"].append(concept)
    
    return found


def build_graph():
    """Build entity relationship graph from all memory chunks."""
    conn = sqlite3.connect(DB_PATH)
    
    rows = conn.execute("SELECT source, title, text, layer FROM chunks").fetchall()
    if not rows:
        print("⚠️  No chunks found. Run: tita-memory-engine.py index")
        return
    
    # Graph structure
    graph = {
        "nodes": {},      # entity -> {type, mentions, first_seen, last_seen}
        "edges": [],      # [{source, target, weight, context}]
        "meta": {
            "built_at": datetime.now().isoformat(),
            "total_chunks": len(rows),
        }
    }
    
    # Track co-occurrences
    edge_map = defaultdict(lambda: {"weight": 0, "contexts": []})
    
    for source, title, text, layer in rows:
        entities = extract_entities(text)
        all_entities = []
        
        for etype, names in entities.items():
            for name in names:
                # Update node
                if name not in graph["nodes"]:
                    graph["nodes"][name] = {
                        "type": etype.rstrip("s"),  # people -> person
                        "mentions": 0,
                        "sources": [],
                        "first_seen": os.path.basename(source),
                    }
                graph["nodes"][name]["mentions"] += 1
                if os.path.basename(source) not in graph["nodes"][name]["sources"]:
                    graph["nodes"][name]["sources"].append(os.path.basename(source))
                graph["nodes"][name]["last_seen"] = os.path.basename(source)
                
                all_entities.append(name)
        
        # Create edges for co-occurring entities
        for i, e1 in enumerate(all_entities):
            for e2 in all_entities[i+1:]:
                key = tuple(sorted([e1, e2]))
                edge_map[key]["weight"] += 1
                if len(edge_map[key]["contexts"]) < 3:  # Keep up to 3 contexts
                    ctx = (title or os.path.basename(source))[:60]
                    if ctx not in edge_map[key]["contexts"]:
                        edge_map[key]["contexts"].append(ctx)
    
    # Convert edges
    for (e1, e2), data in edge_map.items():
        if data["weight"] >= 2:  # Only meaningful connections
            graph["edges"].append({
                "source": e1,
                "target": e2,
                "weight": data["weight"],
                "contexts": data["contexts"]
            })
    
    # Sort edges by weight
    graph["edges"].sort(key=lambda x: x["weight"], reverse=True)
    
    # Save
    with open(GRAPH_PATH, "w") as f:
        json.dump(graph, f, indent=2, ensure_ascii=False)
    
    conn.close()
    
    print(f"✅ Memory Graph built!")
    print(f"📊 {len(graph['nodes'])} entities, {len(graph['edges'])} connections")
    print(f"💾 Saved to: {GRAPH_PATH}")
    
    # Show top connections
    print(f"\n🔗 Top connections:")
    for edge in graph["edges"][:10]:
        print(f"  {edge['source']} ↔ {edge['target']} (weight: {edge['weight']})")
        for ctx in edge["contexts"]:
            print(f"    └─ {ctx}")


def query_entity(name: str):
    """Find all connections for an entity."""
    if not os.path.exists(GRAPH_PATH):
        print("⚠️  Graph not built. Run: tita-memory-graph.py build")
        return
    
    with open(GRAPH_PATH) as f:
        graph = json.load(f)
    
    # Find entity (case-insensitive)
    entity = None
    for node_name in graph["nodes"]:
        if node_name.lower() == name.lower():
            entity = node_name
            break
    
    if not entity:
        print(f"❌ Entity '{name}' not found in graph.")
        print(f"Available: {', '.join(sorted(graph['nodes'].keys()))}")
        return
    
    node = graph["nodes"][entity]
    print(f"\n🔍 {entity}")
    print(f"  Type: {node['type']}")
    print(f"  Mentions: {node['mentions']}")
    print(f"  First seen: {node.get('first_seen', '?')}")
    print(f"  Last seen: {node.get('last_seen', '?')}")
    print(f"  Sources: {', '.join(node['sources'][:5])}")
    
    # Find connections
    connections = []
    for edge in graph["edges"]:
        if edge["source"] == entity or edge["target"] == entity:
            other = edge["target"] if edge["source"] == entity else edge["source"]
            connections.append((other, edge["weight"], edge["contexts"]))
    
    connections.sort(key=lambda x: x[1], reverse=True)
    
    if connections:
        print(f"\n🔗 Connections ({len(connections)}):")
        for other, weight, contexts in connections:
            other_type = graph["nodes"].get(other, {}).get("type", "?")
            print(f"  → {other} [{other_type}] (strength: {weight})")
            for ctx in contexts:
                print(f"    └─ {ctx}")
    else:
        print("  No connections found.")


def show_stats():
    """Show graph statistics."""
    if not os.path.exists(GRAPH_PATH):
        print("⚠️  Graph not built. Run: tita-memory-graph.py build")
        return
    
    with open(GRAPH_PATH) as f:
        graph = json.load(f)
    
    print("🧠 TITA MEMORY GRAPH — Stats")
    print("=" * 40)
    print(f"📊 Entities: {len(graph['nodes'])}")
    print(f"🔗 Connections: {len(graph['edges'])}")
    print(f"🕐 Built: {graph['meta']['built_at']}")
    
    # By type
    types = defaultdict(int)
    for node in graph["nodes"].values():
        types[node["type"]] += 1
    
    print(f"\nBy type:")
    for t, count in sorted(types.items()):
        print(f"  {t}: {count}")
    
    # Most connected
    connection_count = defaultdict(int)
    for edge in graph["edges"]:
        connection_count[edge["source"]] += edge["weight"]
        connection_count[edge["target"]] += edge["weight"]
    
    print(f"\n🏆 Most connected:")
    for entity, count in sorted(connection_count.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {entity}: {count} connection strength")


def main():
    if len(sys.argv) < 2:
        print("Usage: tita-memory-graph.py [build|query|stats]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "build":
        build_graph()
    elif cmd == "query":
        if len(sys.argv) < 3:
            print("Usage: tita-memory-graph.py query <entity_name>")
            sys.exit(1)
        query_entity(" ".join(sys.argv[2:]))
    elif cmd == "stats":
        show_stats()
    else:
        print(f"Unknown: {cmd}")


if __name__ == "__main__":
    main()
