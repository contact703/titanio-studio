#!/usr/bin/env python3
"""
Titanio Direct Tools — MCP → Tool Calls Diretas
=================================================
Inspirado em @agentic.james: MCP servers desperdiçam tokens na negociação
de protocolo. Tool calling direto é mais eficiente.

Em vez de:
  MCP Server → negotiate → list tools → select → call → parse response
  (muitos tokens gastos em protocolo)

Fazemos:
  Agente → chama função Python direto → resultado
  (zero overhead de protocolo)

Uso: python3 titanio-direct-tools.py [list|call <tool> <args>]
"""

import os
import sys
import json
import subprocess
from datetime import datetime

WORKSPACE = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"

# ============================================================
# TOOLS REGISTRY — Cada tool é uma função Python direta
# ============================================================

TOOLS = {}

def register(name, description, params=None):
    """Decorator pra registrar tool"""
    def decorator(func):
        TOOLS[name] = {
            "function": func,
            "description": description,
            "params": params or [],
        }
        return func
    return decorator


# --- MEMORY TOOLS ---

@register("memory_search", "Busca semântica na memória", ["query"])
def memory_search(query):
    result = subprocess.run(
        ["python3", f"{WORKSPACE}/bin/tita-memory-engine.py", "search", query],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout[:500]


@register("memory_curate", "Guarda novo conhecimento", ["text"])
def memory_curate(text):
    result = subprocess.run(
        ["python3", f"{WORKSPACE}/bin/tmem", "curate", text],
        capture_output=True, text=True, timeout=10
    )
    return result.stdout


@register("memory_recall", "Contexto dos últimos 3 dias", [])
def memory_recall():
    result = subprocess.run(
        ["python3", f"{WORKSPACE}/bin/tmem", "recall"],
        capture_output=True, text=True, timeout=15
    )
    return result.stdout[:800]


# --- SYSTEM TOOLS ---

@register("system_health", "Status de todos os serviços", [])
def system_health():
    result = subprocess.run(
        ["bash", f"{WORKSPACE}/bin/titanio-monitor.sh", "check"],
        capture_output=True, text=True, timeout=15
    )
    return result.stdout


@register("system_squad", "Lista de especialistas", [])
def system_squad():
    import requests
    r = requests.get("http://localhost:4444/api/squad", timeout=5)
    data = r.json()
    return f"{len(data)} especialistas ativos"


@register("system_tasks", "Tasks ativas no HiClaw", [])
def system_tasks():
    import requests
    r = requests.get("http://localhost:4444/api/tasks", timeout=5)
    data = r.json()
    active = len(data.get("active_tasks", []))
    completed = len(data.get("completed_tasks", []))
    return f"{active} ativas, {completed} completadas"


# --- MEDIA TOOLS ---

@register("media_banner", "Gera banner", ["text", "style"])
def media_banner(text, style="neon"):
    result = subprocess.run(
        ["python3", f"{WORKSPACE}/bin/titanio-media.py", "banner", text, "--style", style],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout


@register("media_gallery", "Lista outputs de mídia", [])
def media_gallery():
    import glob
    files = glob.glob(f"{WORKSPACE}/pasta-do-tita/projetos/titanio-media/outputs/*")
    return f"{len(files)} arquivos de mídia"


# --- DELEGATION TOOLS ---

@register("delegate_task", "Delega tarefa pra especialista", ["title", "specialist", "description"])
def delegate_task(title, specialist, description):
    import requests
    r = requests.post("http://localhost:4444/api/tasks/delegate",
        json={"title": title, "specialistId": specialist, "requester": "Tita", "description": description},
        timeout=5
    )
    return r.json().get("success", False)


# --- INSTAGRAM TOOLS ---

@register("instagram_post", "Posta no Instagram", ["image_path", "caption"])
def instagram_post(image_path, caption):
    result = subprocess.run(
        ["bash", f"{WORKSPACE}/bin/titanio-auto-post.sh", "post"],
        capture_output=True, text=True, timeout=120
    )
    return result.stdout[-200:]


# --- POLYMARKET TOOLS ---

@register("polymarket_portfolio", "Checa portfolio Polymarket", [])
def polymarket_portfolio():
    result = subprocess.run(
        ["python3", f"{WORKSPACE}/projetos/polymarket-agent/smart-trader-v2.py", "portfolio"],
        capture_output=True, text=True, timeout=60
    )
    return result.stdout[:500]


# --- SECURITY TOOLS ---

@register("security_scan", "Scan de segurança", [])
def security_scan():
    result = subprocess.run(
        ["bash", f"{WORKSPACE}/bin/security-scan.sh"],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout[:500]


# ============================================================
# CLI
# ============================================================

def main():
    if len(sys.argv) < 2:
        print("Titanio Direct Tools — Tool Calling sem MCP overhead")
        print(f"\n{len(TOOLS)} tools registradas:\n")
        for name, tool in sorted(TOOLS.items()):
            params = ", ".join(tool["params"])
            print(f"  {name}({params}) — {tool['description']}")
        print(f"\nUso: {sys.argv[0]} call <tool> [args...]")
        print(f"      {sys.argv[0]} list")
        return

    cmd = sys.argv[1]

    if cmd == "list":
        print(json.dumps({name: {"description": t["description"], "params": t["params"]}
                         for name, t in TOOLS.items()}, indent=2))

    elif cmd == "call":
        tool_name = sys.argv[2] if len(sys.argv) > 2 else ""
        args = sys.argv[3:] if len(sys.argv) > 3 else []

        if tool_name not in TOOLS:
            print(f"❌ Tool '{tool_name}' não existe. Use 'list' pra ver disponíveis.")
            return

        tool = TOOLS[tool_name]
        try:
            result = tool["function"](*args)
            print(result)
        except Exception as e:
            print(f"❌ Erro: {e}")

    elif cmd in TOOLS:
        # Atalho: chamar direto pelo nome
        args = sys.argv[2:] if len(sys.argv) > 2 else []
        try:
            result = TOOLS[cmd]["function"](*args)
            print(result)
        except Exception as e:
            print(f"❌ Erro: {e}")


if __name__ == "__main__":
    main()
