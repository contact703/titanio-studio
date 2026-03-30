#!/bin/bash
# tita-session-boot.sh — Gera contexto consolidado para sessões novas
# Roda a cada 30min via LaunchAgent
# Resultado: SESSION-CONTEXT.md é injetado automaticamente em toda sessão

set -e

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
OUTPUT="$WORKSPACE/SESSION-CONTEXT.md"
TODAY=$(date +%Y-%m-%d)
YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d)
DAY3=$(date -v-2d +%Y-%m-%d 2>/dev/null || date -d "2 days ago" +%Y-%m-%d)
DAY4=$(date -v-3d +%Y-%m-%d 2>/dev/null || date -d "3 days ago" +%Y-%m-%d)
DAY5=$(date -v-4d +%Y-%m-%d 2>/dev/null || date -d "4 days ago" +%Y-%m-%d)

echo "# 🧠 Contexto de Sessão — Auto-gerado $(date '+%Y-%m-%d %H:%M BRT')" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "> LEIA ISTO ANTES DE RESPONDER QUALQUER COISA." >> "$OUTPUT"
echo "> Este arquivo contém o que aconteceu nos últimos dias." >> "$OUTPUT"
echo "> Se alguém perguntar 'o que fizemos', a resposta está aqui." >> "$OUTPUT"
echo "---" >> "$OUTPUT"

# 1. Contexto ativo (estado dos projetos — CRÍTICO)
CTX="$WORKSPACE/pasta-do-tita/contexto-ativo.md"
if [ -f "$CTX" ]; then
    echo "" >> "$OUTPUT"
    echo "## 📋 Estado Atual dos Projetos" >> "$OUTPUT"
    # Extrair tabela de projetos + equipe + IPs
    sed -n '/## 📋 Projetos em Andamento/,/## 📦 Projetos Adicionais/p' "$CTX" | head -40 >> "$OUTPUT" 2>/dev/null
    echo "" >> "$OUTPUT"
    # Extrair equipe
    sed -n '/## 👥 Equipe/,/---/p' "$CTX" | head -20 >> "$OUTPUT" 2>/dev/null
fi

# 2. Group snapshot (compromissos e atividades recentes)
SNAP="$WORKSPACE/pasta-do-tita/group-context-snapshot.md"
if [ -f "$SNAP" ]; then
    echo "" >> "$OUTPUT"
    echo "## 🤝 Compromissos e Atividades Recentes" >> "$OUTPUT"
    # Compromissos + Promessas + Técnicas
    grep -B1 -A3 "Compromissos\|Promessas\|Técnicas que Funcionaram" "$SNAP" >> "$OUTPUT" 2>/dev/null || true
fi

# 3. Memória do dia (hoje + ontem)
for DATE in "$TODAY" "$YESTERDAY" "$DAY3" "$DAY4" "$DAY5"; do
    # Diário principal
    DAILY="$WORKSPACE/memory/${DATE}.md"
    if [ -f "$DAILY" ]; then
        LINES=$(wc -l < "$DAILY")
        echo "" >> "$OUTPUT"
        echo "## 📅 Memória $DATE ($LINES linhas)" >> "$OUTPUT"
        head -30 "$DAILY" >> "$OUTPUT"
        if [ "$LINES" -gt 30 ]; then
            echo "... (mais $((LINES-30)) linhas em memory/${DATE}.md)" >> "$OUTPUT"
        fi
    fi
    
    # Flush persistente mais recente do dia
    LATEST_FLUSH=$(ls -t "$WORKSPACE/pasta-do-tita/memoria-persistente/${DATE}"*.md 2>/dev/null | head -1)
    if [ -n "$LATEST_FLUSH" ]; then
        echo "" >> "$OUTPUT"
        echo "## 🔄 Último Flush $DATE ($(basename "$LATEST_FLUSH"))" >> "$OUTPUT"
        # Extrair: O que aconteceu + Decisões + Compromissos
        sed -n '/O que aconteceu\|Decisões Tomadas\|Compromissos Assumidos\|Lições Aprendidas/,/^---$/p' "$LATEST_FLUSH" | head -40 >> "$OUTPUT" 2>/dev/null
    fi
done

# 4. Memórias manuais recentes (criadas nos últimos 3 dias, não auto-geradas)
echo "" >> "$OUTPUT"
echo "## 📝 Memórias Recentes (últimos 3 dias)" >> "$OUTPUT"
find "$WORKSPACE/memory" -name "*.md" -mtime -3 \
    -not -name "tita-memory*" -not -name "research*" \
    -not -name "security*" -not -name "RESTORE*" \
    -not -name "watchdog*" -not -name "system*" \
    -not -name "2026-03-2[0-7].md" 2>/dev/null | sort -r | head -10 | while read f; do
    BNAME=$(basename "$f")
    FSIZE=$(wc -c < "$f" | tr -d ' ')
    echo "- **$BNAME** (${FSIZE} bytes)" >> "$OUTPUT"
done

# 5. Lições críticas
if [ -f "$WORKSPACE/LESSONS.md" ]; then
    echo "" >> "$OUTPUT"
    echo "## ⚠️ Lições Críticas" >> "$OUTPUT"
    grep -B1 -A1 "🔴\|CRÍTICA\|NUNCA mais\|SEMPRE ler\|PERMANENTE" "$WORKSPACE/LESSONS.md" 2>/dev/null | head -20 >> "$OUTPUT" || true
fi

# 5.5 Recuperação de especialistas (o que cada um fez recentemente)
RECUP="$WORKSPACE/memory/RECUPERACAO-ESPECIALISTAS-GOSPIA.md"
if [ -f "$RECUP" ]; then
    echo "" >> "$OUTPUT"
    echo "## 👥 Último Trabalho dos Especialistas" >> "$OUTPUT"
    # Extrair resumo geral
    sed -n '/RESUMO GERAL/,/CREDENCIAIS/p' "$RECUP" | head -25 >> "$OUTPUT" 2>/dev/null || true
fi

# 5.6 Últimos MDs criados (pra saber o que entregamos)
echo "" >> "$OUTPUT"
echo "## 📄 Últimos Arquivos Criados (workspace root)" >> "$OUTPUT"
find "$WORKSPACE" -maxdepth 1 -name "*.md" -mtime -5 -not -name "SESSION-CONTEXT.md" 2>/dev/null | sort -r | head -15 | while read f; do
    BNAME=$(basename "$f")
    MDATE=$(stat -f "%Sm" -t "%d/%m %H:%M" "$f" 2>/dev/null || stat -c "%y" "$f" 2>/dev/null | cut -d. -f1)
    echo "- **$BNAME** ($MDATE)" >> "$OUTPUT"
done

# 6. Ferramentas key (pra não esquecer o que tem instalado)
echo "" >> "$OUTPUT"
echo "## 🛠️ Ferramentas Instaladas" >> "$OUTPUT"
echo "- **titanio-media.py** — Pipeline mídia IA (banners, narração, vídeo, imagens FLUX)" >> "$OUTPUT"
echo "- **ComfyUI + FLUX.1-schnell** — Geração de imagens IA (6.3GB, porta 8188)" >> "$OUTPUT"
echo "- **Memory Engine** — 1971+ chunks, busca semântica local (nomic-embed-text)" >> "$OUTPUT"
echo "- **Memory Graph** — 42+ entidades, 331+ conexões" >> "$OUTPUT"
echo "- **Instagram @titaniodashboard** — Posts via instagrapi" >> "$OUTPUT"
echo "- **Dashboard Titanio 2.0** — 3 instâncias (Eduardo:4444, Helber:4445, Tiago:4446)" >> "$OUTPUT"

# Footer
SIZE=$(wc -c < "$OUTPUT" | tr -d ' ')
LINES=$(wc -l < "$OUTPUT" | tr -d ' ')
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "_Gerado: $(date '+%H:%M BRT %d/%m/%Y') | ${LINES} linhas, ${SIZE} bytes | Refresh: a cada 30min_" >> "$OUTPUT"

echo "✅ SESSION-CONTEXT.md gerado (${LINES} linhas, ${SIZE} bytes)"
