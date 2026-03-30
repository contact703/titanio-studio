#!/usr/bin/env python3
"""
TITA Real-Learning v1.0 — Especialistas aprendem de verdade
============================================================
Quando um especialista completa uma tarefa:
1. Extrai lições do resultado
2. Dedup contra LESSONS.md existente
3. Registra no LESSONS.md do especialista
4. Atualiza Lightning trace
5. Se erro → registra no LESSONS como falha

Usage:
  learn <specialist> <task> <result> <score:0-10> [notes]
  dedup <specialist>  — Remove lições duplicadas
  audit               — Verifica saúde das lições de todos
"""

import os
import sys
import json
import hashlib
from datetime import datetime

WORKSPACE = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
SPECIALISTS_DIR = os.path.join(WORKSPACE, "pasta-do-tita", "memoria-especialistas")
SMART_LIMIT = 500  # max lines


def learn(specialist, task, result, score, notes=""):
    """Register learning for a specialist."""
    lessons_path = os.path.join(SPECIALISTS_DIR, specialist, "LESSONS.md")
    
    # Ensure file exists
    if not os.path.exists(lessons_path):
        os.makedirs(os.path.dirname(lessons_path), exist_ok=True)
        with open(lessons_path, "w") as f:
            f.write(f"# {specialist} — Lições\n## Regras\n- Atualizar após cada tarefa\n")
    
    # Read existing
    with open(lessons_path) as f:
        existing = f.read()
    
    # Dedup — hash the learning text
    learning_hash = hashlib.md5(notes.encode()).hexdigest()[:8]
    if notes and notes in existing:
        print(f"⚠️ Dedup: lição já existe em {specialist}/LESSONS.md")
        return False
    
    # Smart limit
    lines = existing.split("\n")
    if len(lines) > SMART_LIMIT:
        print(f"🧹 Smart limit: {len(lines)} → {SMART_LIMIT - 100}")
        lines = lines[:5] + lines[-(SMART_LIMIT - 100):]  # Keep header + recent
        existing = "\n".join(lines)
    
    # Append
    entry = f"\n## {datetime.now().strftime('%Y-%m-%d %H:%M')} — {task[:80]}\n"
    entry += f"**Status:** {'✅ Sucesso' if score >= 7 else '⚠️ Parcial' if score >= 4 else '❌ Falha'}\n"
    entry += f"**Score:** {score}/10\n"
    if notes:
        entry += f"- {notes}\n"
    if score < 5:
        entry += f"- **LIÇÃO:** Analisar causa da falha e corrigir\n"
    
    with open(lessons_path, "w") as f:
        f.write(existing + entry)
    
    # Log to Lightning
    result_str = "success" if score >= 7 else ("partial" if score >= 4 else "fail")
    os.system(f'python3 {WORKSPACE}/bin/tita-lightning-bridge.py log "{specialist}" "{task}" "{result_str}" "{score}" "{notes}" 2>/dev/null')
    
    print(f"✅ {specialist}: lição registrada (score {score}/10)")
    return True


def dedup_specialist(specialist):
    """Remove duplicate lessons from a specialist."""
    lessons_path = os.path.join(SPECIALISTS_DIR, specialist, "LESSONS.md")
    if not os.path.exists(lessons_path):
        print(f"⚠️ {specialist}: sem LESSONS.md")
        return 0
    
    with open(lessons_path) as f:
        lines = f.readlines()
    
    seen = set()
    cleaned = []
    removed = 0
    
    for line in lines:
        stripped = line.strip()
        if stripped and len(stripped) > 20:
            line_hash = hashlib.md5(stripped.encode()).hexdigest()
            if line_hash in seen:
                removed += 1
                continue
            seen.add(line_hash)
        cleaned.append(line)
    
    if removed > 0:
        with open(lessons_path, "w") as f:
            f.writelines(cleaned)
        print(f"🧹 {specialist}: {removed} duplicatas removidas")
    else:
        print(f"✅ {specialist}: sem duplicatas")
    
    return removed


def audit_all():
    """Audit all specialists' learning health."""
    if not os.path.exists(SPECIALISTS_DIR):
        print("❌ Specialists dir not found")
        return
    
    print("🔍 Auditoria de Aprendizado dos Especialistas")
    print("=" * 55)
    
    total_lessons = 0
    total_lines = 0
    issues = []
    
    for name in sorted(os.listdir(SPECIALISTS_DIR)):
        spec_dir = os.path.join(SPECIALISTS_DIR, name)
        if not os.path.isdir(spec_dir):
            continue
        
        # Check if deactivated
        ctx_path = os.path.join(spec_dir, "context.md")
        if os.path.exists(ctx_path) and "DESATIVADO" in open(ctx_path).read():
            continue
        
        lessons_path = os.path.join(spec_dir, "LESSONS.md")
        memory_path = os.path.join(spec_dir, "MEMORY.md")
        
        les_size = os.path.getsize(lessons_path) if os.path.exists(lessons_path) else 0
        mem_size = os.path.getsize(memory_path) if os.path.exists(memory_path) else 0
        les_lines = len(open(lessons_path).readlines()) if os.path.exists(lessons_path) else 0
        
        total_lessons += 1 if les_size > 100 else 0
        total_lines += les_lines
        
        # Count actual lesson entries (## date patterns)
        lesson_count = 0
        if os.path.exists(lessons_path):
            content = open(lessons_path).read()
            lesson_count = content.count("## 2026-")
        
        status = "✅" if les_size > 100 and mem_size > 1000 else ("⚠️" if les_size > 0 or mem_size > 0 else "🔴")
        
        print(f"  {status} {name:<25} MEMORY:{mem_size:>7}B  LESSONS:{les_size:>6}B ({lesson_count} entries, {les_lines} lines)")
        
        if les_size < 100:
            issues.append(f"{name}: LESSONS.md vazio ou muito pequeno")
        if mem_size < 100:
            issues.append(f"{name}: MEMORY.md vazio ou muito pequeno")
        if les_lines > SMART_LIMIT:
            issues.append(f"{name}: LESSONS.md muito grande ({les_lines} lines)")
    
    print(f"\n📊 Total: {total_lessons} especialistas com lições | {total_lines} linhas de aprendizado")
    
    if issues:
        print(f"\n⚠️ Issues ({len(issues)}):")
        for i in issues:
            print(f"  - {i}")
    else:
        print("\n✅ Sem issues!")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  learn <specialist> <task> <result> <score> [notes]")
        print("  dedup <specialist>")
        print("  audit")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "learn":
        if len(sys.argv) < 6:
            print("Usage: learn <specialist> <task> <result> <score> [notes]")
            sys.exit(1)
        learn(sys.argv[2], sys.argv[3], sys.argv[4], int(sys.argv[5]),
              " ".join(sys.argv[6:]) if len(sys.argv) > 6 else "")
    elif cmd == "dedup":
        if len(sys.argv) < 3:
            # Dedup all
            for name in os.listdir(SPECIALISTS_DIR):
                if os.path.isdir(os.path.join(SPECIALISTS_DIR, name)):
                    dedup_specialist(name)
        else:
            dedup_specialist(sys.argv[2])
    elif cmd == "audit":
        audit_all()
    else:
        print(f"Unknown: {cmd}")


if __name__ == "__main__":
    main()
