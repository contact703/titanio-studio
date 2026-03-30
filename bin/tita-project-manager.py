#!/usr/bin/env python3
"""
TITA Project Manager v1.0 — Organização automática de projetos
===============================================================
Garante que toda tarefa nova segue a estrutura organizada.

Usage:
  new <nome> [--specialist <name>]  — Cria projeto novo com estrutura
  task <projeto> <tarefa>           — Registra task no projeto + Dashboard
  output <projeto> <arquivo>        — Move output pra pasta certa
  list                              — Lista todos os projetos
  status                            — Status de todos os projetos
  check                             — Verifica organização (lint)
"""

import os
import sys
import json
from datetime import datetime
from uuid import uuid4

WORKSPACE = os.environ.get("TITA_WORKSPACE", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace")
PROJECTS_DIR = os.path.join(WORKSPACE, "pasta-do-tita", "projetos")
TASKS_FILE = os.path.join(WORKSPACE, "pasta-do-tita", "tasks.json")
MASTER_FILE = os.path.join(WORKSPACE, "pasta-do-tita", "PROJETOS-MASTER.md")
LIGHTNING = os.path.join(WORKSPACE, "bin", "tita-lightning-bridge.py")


def create_project(name: str, specialist: str = None, description: str = ""):
    """Create a new project with standard structure."""
    slug = name.lower().replace(" ", "-").replace("_", "-")
    project_dir = os.path.join(PROJECTS_DIR, slug)
    
    if os.path.exists(project_dir):
        print(f"⚠️  Projeto '{slug}' já existe em {project_dir}")
        return
    
    # Create structure
    for subdir in ["src", "outputs", "docs", "logs", "assets"]:
        os.makedirs(os.path.join(project_dir, subdir), exist_ok=True)
    
    # Create README.md
    spec_text = f"**Especialista:** {specialist}" if specialist else "**Especialista:** —"
    readme = f"""# {name}

**Status:** 📋 Novo
**Criado:** {datetime.now().strftime('%Y-%m-%d')}
**Custo:** R$ 0.00
{spec_text}

## O Que É
{description or 'TODO — descrever o projeto'}

## Stack
TODO

## Estrutura
```
{slug}/
├── src/       ← Código fonte
├── outputs/   ← Outputs gerados
├── docs/      ← Documentação
├── logs/      ← Logs de execução
├── assets/    ← Imagens, vídeos, etc
└── README.md  ← Este arquivo
```

## Como Rodar
TODO

## Próximos Passos
- [ ] Definir scope
- [ ] Implementar MVP
"""
    
    with open(os.path.join(project_dir, "README.md"), "w") as f:
        f.write(readme)
    
    # Create .gitkeep in empty dirs
    for subdir in ["src", "outputs", "docs", "logs", "assets"]:
        gitkeep = os.path.join(project_dir, subdir, ".gitkeep")
        if not os.listdir(os.path.join(project_dir, subdir)):
            open(gitkeep, "w").close()
    
    # Register in tasks.json
    try:
        tasks = json.load(open(TASKS_FILE))
    except:
        tasks = {"active_tasks": [], "completed_tasks": []}
    
    tasks["active_tasks"].append({
        "id": f"{slug}-project",
        "title": f"{name} — Setup",
        "requester": "System",
        "assigned_to": specialist or "unassigned",
        "status": "new",
        "handoff_chain": [specialist] if specialist else [],
        "handoff_index": 0,
        "created_at": datetime.now().isoformat() + "Z",
        "updated_at": datetime.now().isoformat() + "Z",
        "result": None,
        "mode": "supervised",
        "context": description,
        "project_path": f"pasta-do-tita/projetos/{slug}/"
    })
    
    json.dump(tasks, open(TASKS_FILE, "w"), indent=2, ensure_ascii=False)
    
    print(f"✅ Projeto '{name}' criado!")
    print(f"  📁 {project_dir}")
    print(f"  📄 README.md gerado")
    print(f"  📋 Registrado no tasks.json")
    if specialist:
        print(f"  🤖 Assigned to: {specialist}")


def add_task(project: str, task_title: str, specialist: str = None):
    """Add a task to a project."""
    slug = project.lower().replace(" ", "-")
    project_dir = os.path.join(PROJECTS_DIR, slug)
    
    if not os.path.exists(project_dir):
        print(f"❌ Projeto '{slug}' não encontrado. Use: new {project}")
        return
    
    # Add to tasks.json
    try:
        tasks = json.load(open(TASKS_FILE))
    except:
        tasks = {"active_tasks": [], "completed_tasks": []}
    
    task_id = str(uuid4())[:8]
    tasks["active_tasks"].append({
        "id": f"{slug}-{task_id}",
        "title": task_title,
        "requester": "Zica",
        "assigned_to": specialist or "unassigned",
        "status": "new",
        "handoff_chain": [specialist] if specialist else [],
        "handoff_index": 0,
        "created_at": datetime.now().isoformat() + "Z",
        "updated_at": datetime.now().isoformat() + "Z",
        "result": None,
        "mode": "supervised",
        "context": "",
        "project_path": f"pasta-do-tita/projetos/{slug}/"
    })
    
    json.dump(tasks, open(TASKS_FILE, "w"), indent=2, ensure_ascii=False)
    
    # Log to project's logs
    log_path = os.path.join(project_dir, "logs", f"{datetime.now().strftime('%Y-%m-%d')}.md")
    with open(log_path, "a") as f:
        f.write(f"\n## {datetime.now().strftime('%H:%M')} — {task_title}\n")
        f.write(f"- Assigned to: {specialist or 'unassigned'}\n")
        f.write(f"- Status: new\n")
    
    print(f"✅ Task adicionada ao projeto '{slug}'")
    print(f"  📋 \"{task_title}\"")
    if specialist:
        print(f"  🤖 Assigned to: {specialist}")


def list_projects():
    """List all projects."""
    if not os.path.exists(PROJECTS_DIR):
        print("Nenhum projeto encontrado.")
        return
    
    print("📁 Projetos:")
    for d in sorted(os.listdir(PROJECTS_DIR)):
        full = os.path.join(PROJECTS_DIR, d)
        if not os.path.isdir(full):
            continue
        
        readme = os.path.join(full, "README.md")
        status = "?"
        if os.path.exists(readme):
            content = open(readme).read()
            if "✅ Ativo" in content:
                status = "✅"
            elif "⏸️ Parado" in content:
                status = "⏸️"
            elif "📋" in content:
                status = "📋"
            else:
                status = "📁"
        
        files = sum(1 for _, _, fs in os.walk(full) for f in fs if not f.startswith("."))
        print(f"  {status} {d}/ ({files} files)")


def check_organization():
    """Check if everything is organized correctly."""
    issues = []
    
    # Check all projects have README.md
    if os.path.exists(PROJECTS_DIR):
        for d in os.listdir(PROJECTS_DIR):
            full = os.path.join(PROJECTS_DIR, d)
            if os.path.isdir(full):
                if not os.path.exists(os.path.join(full, "README.md")):
                    issues.append(f"❌ {d}/ sem README.md")
                # Check standard dirs (only for projects created after 28/03/2026)
                readme_path = os.path.join(full, "README.md")
                is_new = False
                if os.path.exists(readme_path):
                    content = open(readme_path).read()
                    is_new = "2026-03-28" in content or "📋 Novo" in content
                if is_new:
                    for subdir in ["src", "outputs", "docs"]:
                        if not os.path.exists(os.path.join(full, subdir)):
                            issues.append(f"⚠️ {d}/ sem {subdir}/")
    
    # Check tasks.json has project_path
    try:
        tasks = json.load(open(TASKS_FILE))
        for task in tasks.get("active_tasks", []):
            if not task.get("project_path"):
                issues.append(f"⚠️ Task '{task['title'][:40]}' sem project_path")
    except:
        issues.append("❌ tasks.json não encontrado ou inválido")
    
    # Check PROJETOS-MASTER.md exists
    if not os.path.exists(MASTER_FILE):
        issues.append("⚠️ PROJETOS-MASTER.md não encontrado")
    
    if issues:
        print(f"🔍 {len(issues)} issues encontradas:")
        for i in issues:
            print(f"  {i}")
    else:
        print("✅ Tudo organizado! Zero issues.")
    
    return len(issues)


def show_status():
    """Show status of all projects with Lightning grades."""
    lightning_stats = {}
    stats_file = os.path.join(WORKSPACE, "memory", "lightning", "specialist-stats.json")
    if os.path.exists(stats_file):
        lightning_stats = json.load(open(stats_file))
    
    try:
        tasks = json.load(open(TASKS_FILE))
    except:
        tasks = {"active_tasks": [], "completed_tasks": []}
    
    print("📊 Status dos Projetos:")
    print(f"{'Projeto':<25} {'Tasks':<8} {'Status':<12} {'Specialist':<20} {'Grade':<10}")
    print("─" * 75)
    
    if os.path.exists(PROJECTS_DIR):
        for d in sorted(os.listdir(PROJECTS_DIR)):
            full = os.path.join(PROJECTS_DIR, d)
            if not os.path.isdir(full):
                continue
            
            # Count tasks for this project
            project_tasks = [t for t in tasks.get("active_tasks", []) 
                           if t.get("project_path", "").rstrip("/").endswith(d)]
            completed = [t for t in tasks.get("completed_tasks", [])
                        if t.get("project_path", "").rstrip("/").endswith(d)]
            
            specialist = project_tasks[0]["assigned_to"] if project_tasks else "—"
            grade = lightning_stats.get(specialist, {}).get("grade", "—")
            
            total_tasks = len(project_tasks) + len(completed)
            status = "active" if project_tasks else ("done" if completed else "new")
            
            print(f"  {d:<23} {total_tasks:<8} {status:<12} {specialist:<20} {grade:<10}")


def main():
    if len(sys.argv) < 2:
        print("TITA Project Manager v1.0")
        print("")
        print("Usage:")
        print("  new <nome> [--specialist <name>] [--desc <description>]")
        print("  task <projeto> <tarefa> [--specialist <name>]")
        print("  list")
        print("  status")
        print("  check")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "new":
        if len(sys.argv) < 3:
            print("Usage: new <nome> [--specialist <name>]")
            sys.exit(1)
        name = sys.argv[2]
        specialist = None
        desc = ""
        for i, arg in enumerate(sys.argv):
            if arg == "--specialist" and i + 1 < len(sys.argv):
                specialist = sys.argv[i + 1]
            if arg == "--desc" and i + 1 < len(sys.argv):
                desc = sys.argv[i + 1]
        create_project(name, specialist, desc)
    
    elif cmd == "task":
        if len(sys.argv) < 4:
            print("Usage: task <projeto> <tarefa> [--specialist <name>]")
            sys.exit(1)
        project = sys.argv[2]
        task_title = sys.argv[3]
        specialist = None
        for i, arg in enumerate(sys.argv):
            if arg == "--specialist" and i + 1 < len(sys.argv):
                specialist = sys.argv[i + 1]
        add_task(project, task_title, specialist)
    
    elif cmd == "list":
        list_projects()
    
    elif cmd == "status":
        show_status()
    
    elif cmd == "check":
        check_organization()
    
    else:
        print(f"Unknown: {cmd}")


if __name__ == "__main__":
    main()
