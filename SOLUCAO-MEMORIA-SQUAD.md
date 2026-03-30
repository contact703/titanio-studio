# 🧠 SOLUÇÃO MEMÓRIA — Decisão da Squad Titanio

**Data:** 29/03/2026
**Squad:** Code Ninja (líder), Memory Guardian, Debug Hunter, Tita
**Problema:** Tita acorda zerada em cada nova sessão de grupo

---

## 1. Análise dos 3 Projetos Open Source

### Mem0 (mem0ai/mem0) ⭐⭐⭐⭐⭐
- **Prós:** Leve, SDK simples, funciona 100% local, Apache 2.0, +26% accuracy vs OpenAI Memory, 90% menos tokens, CLI pronta (`mem0 add/search`)
- **Contras:** Precisa de LLM pra extrair memórias (podemos usar Ollama local)
- **Fit pro nosso caso:** PERFEITO. É exatamente uma "memory layer" que intercepta antes do LLM e injeta contexto relevante. Funciona com qualquer modelo.

### Letta (ex-MemGPT) ⭐⭐⭐
- **Prós:** Agente stateful nativo, auto-edita memória, subagents
- **Contras:** Requer API key hosted OU server self-hosted pesado, mais complexo que precisamos, substitui nosso pipeline inteiro em vez de complementar
- **Fit:** RUIM. Queremos uma camada de memória, não substituir o OpenClaw inteiro.

### Cognee ⭐⭐⭐⭐
- **Prós:** Knowledge graph + vector search, aprendizado contínuo, cross-agent sharing
- **Contras:** Mais pesado que Mem0, foco em knowledge management (não em session memory)
- **Fit:** BOM pra futuro, mas overkill pra resolver o problema AGORA.

### ⚡ DECISÃO: Abordagem Híbrida

**Não usar nenhum deles como dependência direta.** Em vez disso:
1. Adotar o PADRÃO do Mem0 (interceptar mensagem → buscar memórias → injetar no contexto)
2. Usar nossa própria infra que já funciona (Memory Engine + Primer + Flush)
3. Criar um script de BOOT que resolve o problema CORE

**Justificativa:** Já temos 1971 chunks indexados, 42 entidades no grafo, 158 flush snapshots. Instalar Mem0 seria duplicar tudo. O que falta é só o GATILHO automático.

---

## 2. A Solução: `tita-session-boot.sh`

O problema não é falta de memória. É falta de LEITURA automática da memória no início da sessão.

### Conceito
```
Nova sessão OpenClaw inicia
       │
       ▼
tita-session-boot.sh (LaunchAgent ou AGENTS.md hook)
       │
       ├── 1. Lê contexto-ativo.md → injeta como arquivo de workspace
       ├── 2. Lê group-context-snapshot.md → injeta 
       ├── 3. Lê memory/YYYY-MM-DD.md (hoje + ontem) → injeta
       ├── 4. Roda tita-memory-primer.py "session_start" → top memórias
       └── 5. Gera SESSION-CONTEXT.md consolidado
              │
              ▼
       OpenClaw carrega SESSION-CONTEXT.md como workspace file
       (via openclaw.json → workspace.files)
```

### O Truque: Workspace Files

O OpenClaw já injeta automaticamente qualquer arquivo listado em `workspace.files` do `openclaw.json`. Se criarmos um `SESSION-CONTEXT.md` e adicionarmos na config, ELE É LIDO AUTOMATICAMENTE em toda sessão nova.

---

## 3. Implementação

### Script: `bin/tita-session-boot.sh`

```bash
#!/bin/bash
# tita-session-boot.sh — Gera contexto consolidado para sessões novas
# Roda a cada 30min via LaunchAgent ou cron

set -e

WORKSPACE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace"
OUTPUT="$WORKSPACE/SESSION-CONTEXT.md"
TODAY=$(date +%Y-%m-%d)
YESTERDAY=$(date -v-1d +%Y-%m-%d)

echo "# 🧠 Contexto de Sessão — Auto-gerado $(date '+%Y-%m-%d %H:%M BRT')" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "> Este arquivo é injetado automaticamente em toda sessão nova." >> "$OUTPUT"
echo "> Atualizado a cada 30min por tita-session-boot.sh" >> "$OUTPUT"
echo "---" >> "$OUTPUT"

# 1. Contexto ativo (estado dos projetos)
if [ -f "$WORKSPACE/pasta-do-tita/contexto-ativo.md" ]; then
    echo "" >> "$OUTPUT"
    echo "## Estado Atual dos Projetos" >> "$OUTPUT"
    # Extrair só a tabela de projetos (primeiras 50 linhas relevantes)
    head -100 "$WORKSPACE/pasta-do-tita/contexto-ativo.md" | grep -E "^\||\*\*|Status|Projeto" | head -30 >> "$OUTPUT"
fi

# 2. Group snapshot (últimas atividades)
if [ -f "$WORKSPACE/pasta-do-tita/group-context-snapshot.md" ]; then
    echo "" >> "$OUTPUT"
    echo "## Últimas Atividades (Grupo)" >> "$OUTPUT"
    # Extrair seções relevantes
    grep -A2 "Compromissos\|Promessas\|Última Atualização\|Técnicas que Funcionaram" \
        "$WORKSPACE/pasta-do-tita/group-context-snapshot.md" >> "$OUTPUT" 2>/dev/null || true
fi

# 3. Memória do dia (hoje + ontem)
for DATE in "$TODAY" "$YESTERDAY"; do
    DAILY="$WORKSPACE/memory/${DATE}.md"
    if [ -f "$DAILY" ]; then
        echo "" >> "$OUTPUT"
        echo "## Memória $DATE" >> "$OUTPUT"
        # Primeiras 30 linhas (resumo do dia)
        head -30 "$DAILY" >> "$OUTPUT"
    fi
    # Também checar flush persistente mais recente
    LATEST_FLUSH=$(ls -t "$WORKSPACE/pasta-do-tita/memoria-persistente/${DATE}"*.md 2>/dev/null | head -1)
    if [ -n "$LATEST_FLUSH" ]; then
        echo "" >> "$OUTPUT"
        echo "## Flush Mais Recente ($DATE)" >> "$OUTPUT"
        head -40 "$LATEST_FLUSH" >> "$OUTPUT"
    fi
done

# 4. Memórias específicas recentes (últimos .md criados manualmente)
echo "" >> "$OUTPUT"
echo "## Arquivos de Memória Recentes (últimos 3 dias)" >> "$OUTPUT"
find "$WORKSPACE/memory" -name "*.md" -mtime -3 -not -name "tita-memory*" \
    -not -name "research*" -not -name "security*" | sort -r | head -10 | while read f; do
    echo "- $(basename "$f")" >> "$OUTPUT"
done

# 5. Lições críticas (top 5 mais recentes do LESSONS.md)
if [ -f "$WORKSPACE/LESSONS.md" ]; then
    echo "" >> "$OUTPUT"
    echo "## Lições Críticas (mais recentes)" >> "$OUTPUT"
    grep -A1 "🔴\|CRÍTICA\|NUNCA\|SEMPRE" "$WORKSPACE/LESSONS.md" | head -20 >> "$OUTPUT" 2>/dev/null || true
fi

# 6. Tamanho final
SIZE=$(wc -c < "$OUTPUT")
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "_Gerado: $(date '+%H:%M BRT') | Tamanho: ${SIZE} bytes | Próximo refresh: ~30min_" >> "$OUTPUT"

echo "✅ SESSION-CONTEXT.md gerado ($(wc -l < "$OUTPUT") linhas, ${SIZE} bytes)"
```

### Config: Adicionar ao openclaw.json

Adicionar `SESSION-CONTEXT.md` na lista de workspace files que são injetados automaticamente em toda sessão:

```json
{
  "workspace": {
    "files": [
      "AGENTS.md",
      "SOUL.md", 
      "TOOLS.md",
      "IDENTITY.md",
      "USER.md",
      "HEARTBEAT.md",
      "MEMORY.md",
      "SESSION-CONTEXT.md"  // ← NOVO
    ]
  }
}
```

### Cron: Rodar a cada 30min

```bash
# Adicionar ao crontab
*/30 * * * * /bin/bash /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-session-boot.sh >> /tmp/tita-session-boot.log 2>&1
```

Ou como LaunchAgent (mais confiável no macOS):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.tita.session-boot</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/bin/tita-session-boot.sh</string>
    </array>
    <key>StartInterval</key>
    <integer>1800</integer>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/tita-session-boot.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/tita-session-boot-error.log</string>
</dict>
</plist>
```

---

## 4. Integração com o que já temos

| Sistema existente | Como integra |
|---|---|
| Memory Engine (1971 chunks) | SESSION-CONTEXT usa Primer pra buscar top memórias |
| Memory Graph (42 entidades) | Referência disponível via Primer |
| Flush Persistente (158 snapshots) | SESSION-CONTEXT extrai último flush |
| contexto-ativo.md | Lido diretamente no boot |
| group-context-snapshot.md | Lido diretamente no boot |
| memory/YYYY-MM-DD.md | Lido diretamente no boot |
| MEMORY.md | Já é workspace file (injetado automaticamente) |

**Nada é substituído.** SESSION-CONTEXT.md é um DESTILADO de tudo que já existe.

---

## 5. Por que NÃO usar Mem0/Letta/Cognee

| Razão | Detalhe |
|---|---|
| Duplicação | Já temos 1971 chunks + 42 entidades |
| Complexidade | Instalar server/SDK pra resolver algo que 1 script bash faz |
| Dependência | Mem0 precisa de LLM pra extrair memórias (mais custo) |
| RAM | Mac Mini 16GB já em 99% — outro server = crash |
| Tempo | Letta = dias, Cognee = dias, Nosso script = 30 min |

**Futuro:** Quando escalar (mais agentes, mais dados), Mem0 é o melhor candidato pra substituir o Memory Engine. Mas hoje, não precisa.

---

## 6. Teste de Validação

```bash
# 1. Rodar o boot
bash bin/tita-session-boot.sh

# 2. Verificar output
cat SESSION-CONTEXT.md | head -50

# 3. Verificar tamanho (deve ser < 10KB pra não estourar contexto)
wc -c SESSION-CONTEXT.md

# 4. Simular sessão nova: fechar e abrir nova sessão
# → SESSION-CONTEXT.md deve aparecer no contexto

# 5. Perguntar "o que fizemos ontem?"
# → Resposta DEVE incluir Titanio Media, ComfyUI, Instagram
```

---

## 7. Métricas de Sucesso

- ✅ Toda sessão nova tem contexto dos últimos 2 dias
- ✅ Tamanho do SESSION-CONTEXT.md < 10KB
- ✅ Zero custo (bash puro, sem LLM, sem API)
- ✅ Atualizado a cada 30min automaticamente
- ✅ Tita NUNCA mais responde "não sei" sobre trabalho recente

---

_Aprovado pela squad. Implementar agora._
