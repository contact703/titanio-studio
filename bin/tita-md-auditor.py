#!/usr/bin/env python3
"""
TITA MD Auditor — Analisa TODOS os MDs e classifica:
- ✅ IMPLEMENTADO (código/script/config real existe)
- ❌ SÓ DOCUMENTO (plano/guia sem implementação correspondente)
- 📋 REFERÊNCIA (doc de status, relatório, memória — não precisa implementar)
- 🗑️ OBSOLETO (substituído por versão mais nova ou irrelevante)
"""

import os
import re
from datetime import datetime

WORKSPACE = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"

# Files/dirs that prove implementation exists
IMPLEMENTATION_PROOF = {
    "memory-engine": "bin/tita-memory-engine.py",
    "memory-graph": "bin/tita-memory-graph.py",
    "memory-primer": "bin/tita-memory-primer.py",
    "memory-score": "bin/tita-memory-score.py",
    "memory-refresh": "bin/tita-memory-refresh.sh",
    "lightning": "bin/tita-lightning-bridge.py",
    "project-manager": "bin/tita-project-manager.py",
    "dashboard-backend": "claw-control-center/backend/server.js",
    "dashboard-frontend": "claw-control-center/frontend/build/index.html",
    "polymarket-monitor": "pasta-do-tita/projetos/polymarket-agent/src/monitor.py",
    "jogo-enem": "pasta-do-tita/projetos/jogo-enem/README.md",
    "restore-point": "memory/RESTORE-POINT-2026-03-28/RESTORE.sh",
    "n8n-workflows": "pasta-do-tita/n8n-workflows",
    "especialistas": "pasta-do-tita/memoria-especialistas",
}

# Keywords that indicate a document is about implementation/action
ACTION_KEYWORDS = [
    "instalar", "deploy", "setup", "criar", "implementar", "fix", "upgrade",
    "configurar", "pipeline", "endpoint", "webhook", "integrar", "build",
    "corrigir", "atualizar", "sync", "bootstrap"
]

# Keywords that indicate reference/status docs
REFERENCE_KEYWORDS = [
    "relatório", "relatorio", "status", "diagnóstico", "diagnostico", "auditoria",
    "pesquisa", "research", "guia", "resumo", "análise", "analise", "memória diária"
]

def classify_md(filepath):
    """Classify an MD file."""
    basename = os.path.basename(filepath)
    
    try:
        with open(filepath, 'r', errors='ignore') as f:
            content = f.read()
            first_500 = content[:500].lower()
            size = len(content)
    except:
        return "❓ UNREADABLE", 0, ""
    
    # Daily memory files are always reference
    if re.match(r'^\d{4}-\d{2}-\d{2}', basename):
        return "📋 REFERÊNCIA (memória diária)", size, ""
    
    # Core config files
    if basename in ["AGENTS.md", "SOUL.md", "USER.md", "TOOLS.md", "IDENTITY.md", 
                     "HEARTBEAT.md", "MEMORY.md", "LESSONS.md", "README.md"]:
        return "✅ IMPLEMENTADO (config ativa)", size, ""
    
    # Check if it's a research/report
    for kw in REFERENCE_KEYWORDS:
        if kw in basename.lower() or kw in first_500:
            return "📋 REFERÊNCIA (pesquisa/relatório)", size, ""
    
    # Check if it promises implementation
    promises_action = False
    action_type = ""
    for kw in ACTION_KEYWORDS:
        if kw in basename.lower() or kw in first_500:
            promises_action = True
            action_type = kw
            break
    
    if promises_action:
        # Check if corresponding implementation exists
        implemented = False
        proof = ""
        
        content_lower = content.lower()
        for key, proof_path in IMPLEMENTATION_PROOF.items():
            if key.replace("-", " ") in content_lower or key.replace("-", "") in content_lower:
                full_proof = os.path.join(WORKSPACE, proof_path)
                if os.path.exists(full_proof):
                    implemented = True
                    proof = proof_path
                    break
        
        # Special checks
        if "endpoint" in content_lower and "delegate" in content_lower:
            # Check if endpoints actually exist in server.js
            server = os.path.join(WORKSPACE, "claw-control-center/backend/server.js")
            if os.path.exists(server):
                server_content = open(server).read()
                if "delegate" in server_content:
                    return "✅ IMPLEMENTADO", size, "endpoints exist in server.js"
                else:
                    return "❌ SÓ DOCUMENTO (endpoints não implementados)", size, "server.js não tem delegate"
        
        if "pipeline" in content_lower and "automático" in content_lower:
            server = os.path.join(WORKSPACE, "claw-control-center/backend/server.js")
            if os.path.exists(server):
                server_content = open(server).read()
                if "pipeline" in server_content:
                    return "✅ IMPLEMENTADO", size, "pipelines in server.js"
                else:
                    return "❌ SÓ DOCUMENTO (pipelines não implementados)", size, ""
        
        if implemented:
            return "✅ IMPLEMENTADO", size, f"proof: {proof}"
        else:
            return "❌ SÓ DOCUMENTO (ação prometida sem implementação)", size, f"action: {action_type}"
    
    # Default: reference
    return "📋 REFERÊNCIA", size, ""


def audit_all():
    """Audit all MD files."""
    results = {"✅ IMPLEMENTADO": [], "❌ SÓ DOCUMENTO": [], "📋 REFERÊNCIA": [], "❓": []}
    
    # Scan workspace root
    locations = [
        (WORKSPACE, 1),
        (os.path.join(WORKSPACE, "memory"), 1),
        (os.path.join(WORKSPACE, "pasta-do-tita"), 1),
    ]
    
    all_files = []
    for loc, depth in locations:
        for f in os.listdir(loc):
            if f.endswith(".md"):
                all_files.append(os.path.join(loc, f))
    
    # Classify each
    for filepath in sorted(all_files):
        category, size, note = classify_md(filepath)
        rel_path = os.path.relpath(filepath, WORKSPACE)
        
        key = category.split("(")[0].strip()
        if key not in results:
            key = "❓"
        results[key].append({
            "file": rel_path,
            "category": category,
            "size": size,
            "note": note
        })
    
    return results, all_files


def generate_report():
    results, all_files = audit_all()
    
    total = len(all_files)
    impl = len(results.get("✅ IMPLEMENTADO", []))
    doc_only = len(results.get("❌ SÓ DOCUMENTO", []))
    ref = len(results.get("📋 REFERÊNCIA", []))
    
    report = []
    report.append("# 🔍 Auditoria de TODOS os MDs — Implementado vs Só Documento\n")
    report.append(f"**Data:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    report.append(f"**Total de MDs analisados:** {total}\n")
    report.append("---\n")
    report.append("## Resumo\n")
    report.append(f"| Categoria | Quantidade | % |")
    report.append(f"|---|---|---|")
    report.append(f"| ✅ Implementado | {impl} | {round(impl/total*100)}% |")
    report.append(f"| ❌ Só documento | {doc_only} | {round(doc_only/total*100)}% |")
    report.append(f"| 📋 Referência | {ref} | {round(ref/total*100)}% |")
    report.append(f"| **Total** | **{total}** | **100%** |")
    report.append("")
    
    # Detail each category
    for cat_name, emoji in [("❌ SÓ DOCUMENTO", "❌"), ("✅ IMPLEMENTADO", "✅"), ("📋 REFERÊNCIA", "📋")]:
        items = results.get(cat_name, [])
        if items:
            report.append(f"\n---\n\n## {cat_name} ({len(items)} arquivos)\n")
            for item in items:
                note = f" — {item['note']}" if item['note'] else ""
                report.append(f"- **{item['file']}** ({item['size']}B){note}")
                report.append(f"  {item['category']}")
    
    return "\n".join(report)


if __name__ == "__main__":
    report = generate_report()
    
    # Print to stdout
    print(report)
    
    # Save to file
    output = os.path.join(WORKSPACE, "memory", "auditoria-mds-completa-2026-03-28.md")
    with open(output, "w") as f:
        f.write(report)
    print(f"\n💾 Salvo em: {output}")
