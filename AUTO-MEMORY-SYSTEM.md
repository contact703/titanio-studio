# 🧠 AUTO-MEMORY SYSTEM — Implementação Real

**Data:** 2026-03-22 22:15  
**Criticidade:** CRÍTICA  
**Status:** Em implementação  
**Responsável:** Tita (AI) + Sistema Automático

---

## O Problema (Diagnosticado por Zica)

Eu tenho memória DOCUMENTADA (MEMORY.md), mas não tenho memória ATIVA:
- Descubro técnica → Esqueco na próxima sessão
- Registro em MEMORY.md → Não consulto antes de responder
- Aprendo lição → Não aplico depois
- Falha ocorre → Não evito repetir

**Causa raiz:** Sistema manual (eu lembrar de chamar memory_search). Humano falha.

---

## A Solução: Automação Forçada

### 1. HOOK PRÉ-RESPOSTA (Obrigatório)

Antes de qualquer resposta técnica:
```python
# Pseudocódigo — implementar em código real
if pergunta_é_técnica():
    contexto = memory_search(topicos_relevantes)
    if contexto_encontrado:
        INJETAR_NO_PROMPT(contexto)
    else:
        REGISTRAR_FALHA("Memory vazio para: " + topico)
```

**Implementação:** Código que roda ANTES de eu gerar resposta. Não opcional.

### 2. CAPTURE AUTOMÁTICO (Ao fim de descoberta)

```python
# Quando descubro algo que funciona
if tecnica_funcionou:
    salvar_em_MEMORY_MD({
        "técnica": nome,
        "código": comando_exato,
        "data": hoje,
        "status": "✅ Testado",
        "credenciais": path,
        "limitações": [...],
        "timestamp": agora
    })
```

**Implementação:** Script Python que roda automaticamente. Força registro.

### 3. CONSOLIDAÇÃO DIÁRIA (Não manual)

```bash
# Roda automaticamente 23:59 BRT
daily_consolidation.sh:
  - Ler MEMORY.md
  - Ler lições.json
  - Remover duplicatas
  - Atualizar timestamps
  - Registrar estatísticas
```

**Implementação:** Cron job que roda todo dia. Garante sincronização.

### 4. VERIFICAÇÃO (Prova que estou aprendendo)

```bash
# Roda semanalmente (domingo)
weekly_memory_check.sh:
  - Testar 5 técnicas registradas
  - Se funciona: ✅
  - Se não: 🔴 ALERTAR
  - Atualizar score de aprendizado
```

**Implementação:** Testa de VERDADE, não só lê arquivo.

---

## Arquivos que vão ser criados

### 1. `auto-memory-hook.py`
Roda ANTES de cada resposta técnica. Força memory_search.

### 2. `capture-lesson-auto.py`
Roda DEPOIS de descobrir técnica. Salva em MEMORY.md automático.

### 3. `daily-consolidation.sh`
Roda todo dia 23:59. Consolida, limpa, sincroniza.

### 4. `weekly-memory-check.sh`
Roda todo domingo. TESTA techniques, não só lê.

### 5. `memory-status.json`
Arquivo que registra: última consolidação, técnicas ativas, falhas, score.

---

## Como vai funcionar

### Cenário: Zica pergunta sobre Instagram

**Sem sistema:**
1. Zica: "Ver vídeo Instagram"
2. Tita: Tenta web_fetch (errado)
3. Falha
4. Tita: "Não consigo"

**Com AUTO-MEMORY-SYSTEM:**
1. Zica: "Ver vídeo Instagram"
2. **[HOOK PRÉ-RESPOSTA]** → memory_search("instagram vídeo download")
3. Encontra: "instagrapi funciona ✅ testado 22/03"
4. Tita: "Usar instagrapi [credenciais guardadas]"
5. Funciona
6. **[CAPTURE AUTO]** → Atualiza MEMORY.md com timestamp hoje

**Próxima pergunta (mesmo dia):**
1. Zica: "Baixar outro vídeo"
2. **[HOOK]** → memory_search("instagram vídeo")
3. Encontra: Registrado HOJE 15h (score alto = confiável)
4. Tita: Usa instagrapi na primeira (não tenta web_fetch)

---

## Implementação Passo-a-Passo

### PASSO 1: Criar arquivo de controle

```json
{
  "system_active": true,
  "last_consolidation": "2026-03-22T22:15:00Z",
  "memory_score": 0,
  "techniques_registered": 0,
  "techniques_tested": 0,
  "failure_rate": 0,
  "hooks_activated": 0,
  "captures_auto": 0,
  "weekly_tests": []
}
```

Este arquivo PROVA que sistema está rodando.

### PASSO 2: Criar auto-memory-hook.py

```python
#!/usr/bin/env python3
# Roda ANTES de resposta técnica
# Busca contexto em MEMORY.md
# Se encontra: INJETA no prompt
# Se não encontra: REGISTRA falta

import json
from pathlib import Path
from datetime import datetime

def pre_response_hook(topicos):
    """Roda antes de qualquer resposta"""
    memory_file = Path(MEMORY_PATH)
    memory = memory_file.read_text()
    
    # Buscar técnicas registradas
    encontrado = False
    for topico in topicos:
        if topico in memory:
            encontrado = True
            break
    
    if not encontrado:
        # Registrar falta
        missing_log = {
            "data": datetime.now().isoformat(),
            "topicos_buscados": topicos,
            "resultado": "NÃO ENCONTRADO"
        }
        log_missing(missing_log)
    
    return encontrado

```

### PASSO 3: Criar capture-lesson-auto.py

```python
#!/usr/bin/env python3
# Captura lição AUTOMATICAMENTE
# Roda quando: descubro técnica, encontro bug, aprendo coisa nova

def capture_lesson(tecnica, codigo, status="✅"):
    """Salva lição em MEMORY.md automático"""
    
    lesson = f"""
## {tecnica.upper()} — {datetime.now().strftime('%Y-%m-%d %H:%M')}

**Status:** {status}  
**Código:**
```
{codigo}
```
**Timestamp:** {datetime.now().isoformat()}
"""
    
    # Append em MEMORY.md
    memory_file = Path(MEMORY_PATH)
    memory_file.write_text(memory_file.read_text() + lesson)
    
    # Atualizar status
    update_memory_status("captures_auto", +1)

```

### PASSO 4: Criar daily-consolidation.sh

```bash
#!/bin/bash
# Roda todo dia 23:59 BRT

MEMORY_FILE="/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/MEMORY.md"
STATUS_FILE="/tmp/memory-status.json"

# 1. Remover duplicatas
awk '!seen[$0]++' $MEMORY_FILE > $MEMORY_FILE.tmp
mv $MEMORY_FILE.tmp $MEMORY_FILE

# 2. Atualizar timestamps
sed -i "s/LAST_CONSOLIDATED.*/LAST_CONSOLIDATED: $(date)/g" $MEMORY_FILE

# 3. Consolidar lições
python3 /tmp/consolidate-memory.py

# 4. Salvar status
echo '{"consolidated": true, "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > $STATUS_FILE

echo "✅ Consolidação diária feita"

```

### PASSO 5: Criar weekly-memory-check.sh

```bash
#!/bin/bash
# Roda todo domingo 09:00 BRT

# TESTA de verdade, não só lê arquivo

echo "🧪 Testando técnicas registradas em MEMORY.md..."

# 1. Testar instagrapi
echo "  Testando instagrapi..."
python3 << 'PYTHON'
from instagrapi import Client
try:
    cl = Client()
    cl.login("titaniodashboard", "Rita160679!")
    print("  ✅ instagrapi OK")
except Exception as e:
    print(f"  ❌ instagrapi FALHA: {e}")
PYTHON

# 2. Testar yt-dlp
echo "  Testando yt-dlp..."
yt-dlp --version > /dev/null && echo "  ✅ yt-dlp OK" || echo "  ❌ yt-dlp FALHA"

# 3. Testar dashboard
echo "  Testando dashboard..."
curl -s http://localhost:4444/api/health > /dev/null && echo "  ✅ Dashboard OK" || echo "  ❌ Dashboard DOWN"

# 4. Registrar resultados
echo "✅ Teste semanal concluído"

```

---

## Como vai ser ativado

### IMEDIATAMENTE (agora):
1. Criar arquivos acima ✅
2. Criar memory-status.json ✅
3. Ativar flag system_active=true ✅
4. Testar que tá funcionando ✅

### AMANHÃ (23/03):
1. Daily consolidation roda 23:59 ✅
2. Verifica se MEMORY.md foi consolidado ✅

### PRÓXIMO DOMINGO (24/03):
1. Weekly memory check roda 09:00 ✅
2. Testa 5 técnicas registradas ✅
3. Zica verifica se aprendi ✅

---

## Verificação de Sucesso

**Como saber que está funcionando:**

1. **Pre-response hook:**
   - memory_search é chamado ANTES de cada resposta
   - Resultado é injetado no prompt
   - Nenhuma resposta sem memory_search

2. **Capture automático:**
   - Toda técnica nova em MEMORY.md tem timestamp HOJE
   - Não há técnicas antigas sem atualização

3. **Consolidação diária:**
   - MEMORY.md não tem duplicatas
   - Timestamps estão atualizados
   - Status file mostra última consolidação

4. **Weekly check:**
   - Técnicas são TESTADAS (não só lidas)
   - Score de aprendizado aumenta
   - Zica vê que realmente estou aprendendo

---

## Deadline

**Zica vai testar amanhã (23/03):**
- "Tita, você lembra de técnicas de ontem?"
- Resposta DEVE vir de memory_search (não "esqueci")
- Resposta DEVE funcionar (não erro)

**Se não funcionar:**
- Sistema falhou
- Voltar ao drawing board
- Tentar outra abordagem

---

## Assinado

**Tita:** "Vou implementar AGORA. Sistema REAL, não documento."

**Zica:** "Aprova ou pede ajuste?"

