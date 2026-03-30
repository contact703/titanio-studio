#!/usr/bin/env python3
"""
TITA Memory Primer v1.0 — Pre-flight Memory Injection
======================================================
Runs BEFORE the LLM sees a message. Finds relevant memories
and outputs them as context to inject into the prompt.

Also handles keyword triggers — specific words that force
lookup of specific files.

Usage:
  # Get memory context for a message
  python3 tita-memory-primer.py "manda o arquivo md aqui"
  
  # Output: JSON with memories to inject
"""

import os
import sys
import json
import re
from datetime import datetime

# Import from memory engine
sys.path.insert(0, os.path.dirname(__file__))
from importlib.util import spec_from_file_location, module_from_spec

WORKSPACE = os.environ.get("TITA_WORKSPACE", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace")

# === KEYWORD TRIGGERS ===
# When these words appear, FORCE read of specific files
KEYWORD_TRIGGERS = {
    # File sending (CRITICAL — caused 2 failures)
    "arquivo": ["memory/LICAO-CRITICA-MD-ENVIO.md", "memory/REGRA-ENVIO-MD-WHATSAPP.md"],
    "manda o md": ["memory/LICAO-CRITICA-MD-ENVIO.md", "memory/REGRA-ENVIO-MD-WHATSAPP.md"],
    "envia o arquivo": ["memory/LICAO-CRITICA-MD-ENVIO.md"],
    "manda aqui": ["memory/LICAO-CRITICA-MD-ENVIO.md"],
    "manda pra mim": ["memory/LICAO-CRITICA-MD-ENVIO.md"],
    "envia pra mim": ["memory/LICAO-CRITICA-MD-ENVIO.md"],
    "envia pra": ["memory/LICAO-CRITICA-MD-ENVIO.md"],
    "manda pra": ["memory/LICAO-CRITICA-MD-ENVIO.md"],
    "baixar": ["memory/LICAO-CRITICA-MD-ENVIO.md"],
    "relatório": ["memory/LICAO-CRITICA-MD-ENVIO.md"],
    ".md": ["memory/LICAO-CRITICA-MD-ENVIO.md"],
    
    # Polymarket / investments
    "polymarket": ["memory/2026-03-26.md", "projetos/polymarket-agent/RELATORIO-INVESTIMENTOS.md"],
    "investimento": ["memory/2026-03-26.md", "projetos/polymarket-agent/RELATORIO-INVESTIMENTOS.md"],
    "trading": ["memory/2026-03-26.md"],
    "poly": ["memory/2026-03-26.md"],
    "aposta": ["memory/2026-03-26.md"],
    "mercado de previsão": ["memory/2026-03-26.md"],
    
    # iOS / Apple
    "ios": ["memory/2026-03-23.md"],
    "apple": ["memory/2026-03-23.md"],
    "app store": ["memory/2026-03-23.md"],
    "rejeição": ["memory/2026-03-23.md"],
    "submissão": ["memory/2026-03-23.md"],
    
    # Memory system
    "memória": ["memory/pesquisa-problema-memoria-recall-2026-03-28.md", "memory/relatorio-memoria-evermind-vs-tita.md"],
    "memory engine": ["memory/debug-report-memory-engine-2026-03-28.md"],
    "recall": ["memory/pesquisa-problema-memoria-recall-2026-03-28.md"],
    "evermind": ["memory/relatorio-memoria-evermind-vs-tita.md"],
    "msa": ["memory/relatorio-memoria-evermind-vs-tita.md"],
    
    # Projects
    "manda a nota": ["memory/2026-03-06.md"],
    "mandaanota": ["memory/2026-03-06.md"],
    "nfs-e": ["memory/2026-03-06.md"],
    "nota fiscal": ["memory/2026-03-06.md"],
    "mei": ["memory/2026-03-06.md"],
    "maricá": ["memory/2026-02-09.md"],
    "film commission": ["memory/2026-02-09.md"],
    "gospia": ["memory/gospia-guia-master.md"],
    "dashboard": ["memory/2026-03-23.md"],
    "tikanawá": ["MEMORY.md"],
    
    # People
    "helber": ["MEMORY.md"],
    "tiago": ["memory/HELBER-TIAGO-SETUP.md"],
    "eduardo": ["USER.md"],
    "zica": ["memory/gospia-guia-master.md"],
    
    # Errors & lessons
    "erro": ["LESSONS.md"],
    "lição": ["LESSONS.md"],
    "bug": ["LESSONS.md"],
    "problema": ["LESSONS.md"],
    "webhook": ["LESSONS.md", "memory/2026-03-23.md"],
    "stripe": ["LESSONS.md", "memory/2026-03-23.md"],
    "500": ["LESSONS.md"],
    "crash": ["LESSONS.md"],
    
    # Model selection
    "modelo": ["LESSONS.md"],
    "gratuito": ["LESSONS.md", "memory/research-agents-free-2026-03-15.md"],
    "free": ["LESSONS.md", "memory/research-agents-free-2026-03-15.md"],
    "opus": ["LESSONS.md"],
    "sonnet": ["LESSONS.md"],
    "fallback": ["LESSONS.md"],
    "especialista": ["LESSONS.md"],
    
    # Upgrade/deploy
    "upgrade": ["UPGRADE-MEMORIA-V2-COMPLETO.md"],
    "deploy": ["LESSONS.md"],
    "restaurar": ["memory/RESTORE-POINT-2026-03-28/MANIFEST.md"],
    "restore": ["memory/RESTORE-POINT-2026-03-28/MANIFEST.md"],
}

# Auto-expanding: scan memory/ for date-specific triggers
# Any mention of a date like "26/03" or "março" finds matching daily files
import glob as _glob
for _f in _glob.glob(os.path.join(WORKSPACE, "memory", "2026-03-*.md")):
    _day = os.path.basename(_f).replace(".md", "").split("-")[-1]
    if _day.isdigit():
        KEYWORD_TRIGGERS[f"{_day}/03"] = [_f]
        KEYWORD_TRIGGERS[f"dia {_day}"] = [_f]

# === CRITICAL RULES ===  
# These get injected when ANY of these patterns match
CRITICAL_RULES = [
    {
        "pattern": r"mand[ae].*(?:arquivo|md|\.md|documento)",
        "inject": "🔴 REGRA CRÍTICA: Usar `openclaw message send --media /path/arquivo.md` para enviar arquivos. NUNCA colar texto quando pedem arquivo.",
        "source": "memory/LICAO-CRITICA-MD-ENVIO.md"
    },
    {
        "pattern": r"(?:envi|mand).*(?:aqui|grupo|chat|pra mim|pra eu)",
        "inject": "🔴 LEMBRETE: Se pedirem pra mandar/enviar algo, verificar se é arquivo ou texto. Se for arquivo: --media.",
        "source": "memory/REGRA-ENVIO-MD-WHATSAPP.md"
    },
]


def load_engine():
    """Load memory engine for semantic search."""
    engine_path = os.path.join(WORKSPACE, "bin", "tita-memory-engine.py")
    spec = spec_from_file_location("engine", engine_path)
    engine = module_from_spec(spec)
    spec.loader.exec_module(engine)
    return engine


def find_keyword_triggers(message: str) -> list:
    """Find keyword triggers in message."""
    triggered_files = []
    msg_lower = message.lower()
    
    for keyword, files in KEYWORD_TRIGGERS.items():
        if keyword.lower() in msg_lower:
            for f in files:
                full_path = os.path.join(WORKSPACE, f)
                if os.path.exists(full_path) and full_path not in triggered_files:
                    triggered_files.append(full_path)
    
    return triggered_files


def find_critical_rules(message: str) -> list:
    """Find critical rules that match the message."""
    matched = []
    for rule in CRITICAL_RULES:
        if re.search(rule["pattern"], message, re.IGNORECASE):
            matched.append(rule)
    return matched


def read_file_summary(path: str, max_lines: int = 20) -> str:
    """Read first N lines of a file as summary."""
    try:
        with open(path) as f:
            lines = f.readlines()[:max_lines]
            return "".join(lines).strip()
    except:
        return ""


def prime(message: str) -> dict:
    """Main priming function. Returns context to inject."""
    result = {
        "timestamp": datetime.now().isoformat(),
        "message": message[:200],
        "critical_rules": [],
        "keyword_files": [],
        "semantic_matches": [],
        "total_context_chars": 0,
    }
    
    # 1. Critical rules (highest priority)
    rules = find_critical_rules(message)
    for rule in rules:
        result["critical_rules"].append({
            "rule": rule["inject"],
            "source": rule["source"],
        })
    
    # 2. Keyword triggers
    triggered = find_keyword_triggers(message)
    for path in triggered[:3]:  # Max 3 files
        summary = read_file_summary(path, 15)
        if summary:
            result["keyword_files"].append({
                "file": os.path.basename(path),
                "path": path,
                "summary": summary[:500],
            })
    
    # 3. Semantic search (if engine available)
    try:
        engine = load_engine()
        matches = engine.do_search(message, top_k=3)
        for m in matches:
            if m["similarity"] >= 0.55:  # Higher threshold for priming
                result["semantic_matches"].append({
                    "source": m["source"],
                    "title": m["title"],
                    "text": m["text"][:300],
                    "score": m["score"],
                    "layer": m["layer"],
                })
    except Exception as e:
        result["semantic_error"] = str(e)
    
    # Calculate total context size
    total = 0
    for r in result["critical_rules"]:
        total += len(r["rule"])
    for f in result["keyword_files"]:
        total += len(f["summary"])
    for m in result["semantic_matches"]:
        total += len(m["text"])
    result["total_context_chars"] = total
    
    return result


def format_for_injection(primed: dict) -> str:
    """Format primed context for injection into LLM prompt."""
    parts = []
    
    if primed["critical_rules"]:
        parts.append("⚠️ REGRAS ATIVAS:")
        for r in primed["critical_rules"]:
            parts.append(f"  {r['rule']}")
    
    if primed["keyword_files"]:
        parts.append("\n📎 MEMÓRIAS RELEVANTES:")
        for f in primed["keyword_files"]:
            parts.append(f"  [{f['file']}]")
            parts.append(f"  {f['summary'][:200]}...")
    
    if primed["semantic_matches"]:
        parts.append("\n🔍 CONTEXTO SEMÂNTICO:")
        for m in primed["semantic_matches"]:
            title = f" — {m['title']}" if m["title"] else ""
            parts.append(f"  [{m['source']}{title}] (score: {m['score']})")
            parts.append(f"  {m['text'][:150]}...")
    
    return "\n".join(parts) if parts else ""


def main():
    if len(sys.argv) < 2:
        print("Usage: tita-memory-primer.py <message>")
        print("  Returns JSON with relevant memories to inject before LLM processing")
        sys.exit(1)
    
    message = " ".join(sys.argv[1:])
    
    primed = prime(message)
    
    # Output mode
    if "--json" in sys.argv:
        print(json.dumps(primed, indent=2, ensure_ascii=False))
    else:
        formatted = format_for_injection(primed)
        if formatted:
            print(formatted)
            print(f"\n📊 Total context: {primed['total_context_chars']} chars")
            print(f"🔴 Critical rules: {len(primed['critical_rules'])}")
            print(f"📎 Keyword files: {len(primed['keyword_files'])}")
            print(f"🔍 Semantic matches: {len(primed['semantic_matches'])}")
        else:
            print("Nenhuma memória relevante encontrada.")


if __name__ == "__main__":
    main()
