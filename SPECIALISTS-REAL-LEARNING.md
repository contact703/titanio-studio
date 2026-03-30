# 🧠 REAL-LEARNING-SYSTEM para Especialistas

**Data:** 2026-03-22 23:10  
**Criticidade:** CRÍTICA  
**Status:** Implementando AGORA  

---

## O Problema

Especialistas têm arquivos de memória (memory.json, lessons.json) mas **ninguém os atualiza.**

```
Especialista completa tarefa → Aprende algo → memory.json = SEM MUDANÇA
Próxima tarefa: Especialista não lembra nada
```

**Isso não é aprendizado real. É só um arquivo vazio.**

---

## A Solução: TASK-LEARNING-HOOK

Quando especialista COMPLETA tarefa, sistema vai:

1. **Capturar o que aprendeu** (extração automática)
2. **Atualizar memory.json** (guardar permanentemente)
3. **Registrar lição** em lessons.json
4. **Consolidar** no memory.json pra próxima tarefa

---

## Implementação

### 1. Task Completion Hook

Depois que especialista termina tarefa:

```bash
# Script: /bin/tita-specialist-learned
specialist_id=$1
task_id=$2
task_description=$3
result=$4
learning=$5  # O que aprendeu

# 1. Atualizar memory.json do especialista
update_memory_json "$specialist_id" "$learning"

# 2. Registrar em lessons.json
register_lesson "$specialist_id" "$task_id" "$learning"

# 3. Atualizar stats
increment_stats "$specialist_id" "tasks_completed"
increment_stats "$specialist_id" "lessons_learned"

# 4. Consolidar (remover duplicatas de lições)
consolidate_specialist_memory "$specialist_id"
```

### 2. Memory.json (Estrutura Real)

Antes (vazio):
```json
{
  "specialistId": "code-ninja",
  "recentTasks": [],
  "knowledge": []
}
```

Depois (com aprendizado real):
```json
{
  "specialistId": "code-ninja",
  "lastLearned": "2026-03-22T23:10:00Z",
  "recentTasks": [
    {
      "id": "task-001",
      "title": "Corrigir bug loop 401",
      "learned": "401 errors causados por token expirado em SecureStore",
      "date": "2026-03-22T23:10:00Z"
    }
  ],
  "knowledge": [
    "401 errors = token expirado (guardar token refresh)",
    "SecureStore em iOS = encrypt automático",
    "useEffect cleanup importante pra memory leaks"
  ]
}
```

### 3. Lessons.json (Capturando Lições)

```json
{
  "specialistId": "code-ninja",
  "lessonsLearned": [
    {
      "id": "lesson-001",
      "category": "ios",
      "task": "task-001",
      "title": "401 = token expirado",
      "description": "Quando vê 401, primeiro checar se token tá no SecureStore e se tá expirado",
      "solution": "Implementar token refresh automático no interceptor",
      "learnedAt": "2026-03-22T23:10:00Z",
      "applicable": true,
      "priority": "high"
    }
  ]
}
```

### 4. Especialista Consulta Própria Memória

Antes de próxima tarefa:

```python
# Quando code-ninja recebe nova tarefa
def start_task(specialist_id, task):
    # CONSULTAR PRÓPRIA MEMÓRIA
    specialist_memory = load_specialist_memory(specialist_id)
    
    # INJETAR CONHECIMENTO NO CONTEXTO
    context = f"""
    Você é {specialist_id}.
    
    Seu conhecimento anterior:
    {specialist_memory['knowledge']}
    
    Tarefas similares que você já completou:
    {specialist_memory['recentTasks']}
    
    Agora faça: {task}
    """
    
    return execute_with_context(context)
```

---

## Fluxo Real

```
Tarefa chega pro Code-Ninja
    ↓
Code-Ninja CARREGA seu memory.json (conhecimento anterior)
    ↓
Code-Ninja executa tarefa COM contexto da memória
    ↓
Code-Ninja termina
    ↓
[TASK-LEARNING-HOOK executa]
    ↓
Extrai: "Aprendi que 401 = token expirado"
    ↓
UPDATE memory.json com nova lição
UPDATE lessons.json com novo conhecimento
    ↓
Próxima vez Code-Ninja vê 401 → JÁ SABE o que fazer
```

---

## Scripts a Criar

### 1. tita-specialist-learned
```bash
#!/bin/bash
# Roda quando especialista completa tarefa

specialist_id=$1
task_result=$2

# Extrair o que foi aprendido (via LLM)
learning=$(extract_learning_from_result "$task_result")

# Atualizar memória do especialista
update_specialist_memory "$specialist_id" "$learning"

# Registrar lição
register_specialist_lesson "$specialist_id" "$learning"

# Consolid​ar
consolidate_specialist_memory "$specialist_id"

echo "✅ [$specialist_id] Aprendizado registrado"
```

### 2. tita-specialist-memory-loader
```bash
#!/bin/bash
# Carrega memória do especialista antes de tarefa

specialist_id=$1

# Ler memory.json
memory=$(cat "/memoria-especialistas/$specialist_id/memory.json")

# Ler lessons.json  
lessons=$(cat "/memoria-especialistas/$specialist_id/lessons.json")

# Retornar como contexto
echo "SPECIALIST_KNOWLEDGE=$memory"
echo "SPECIALIST_LESSONS=$lessons"
```

### 3. tita-specialist-consolidate
```bash
#!/bin/bash
# Consolida memória semanal (remover duplicatas, resumir)

for specialist in /memoria-especialistas/*/; do
    id=$(basename "$specialist")
    
    # Remover duplicatas de lições
    jq '.lessonsLearned |= unique_by(.title)' "$specialist/lessons.json" > temp.json
    mv temp.json "$specialist/lessons.json"
    
    # Manter só últimas 50 tarefas
    jq '.recentTasks |= .[-50:]' "$specialist/memory.json" > temp.json
    mv temp.json "$specialist/memory.json"
    
    echo "✅ Consolidado: $id"
done
```

---

## Integração no Código

Quando especialista termina tarefa no Dashboard:

```typescript
// code/backend/src/routes/specialists.ts

app.post('/api/squad/:id/task/complete', async (req, res) => {
    const { id } = req.params;
    const { taskId, result, learning } = req.body;
    
    // 1. Salvar resultado da tarefa
    await saveLearning(id, taskId, result, learning);
    
    // 2. [REAL-LEARNING-HOOK]
    await captureAndUpdateMemory(id, learning);
    
    // 3. Retornar sucesso
    res.json({ 
        success: true, 
        learningCaptured: true,
        specialist: id,
        newKnowledge: learning 
    });
});
```

---

## Validação

**Teste que aprendizado é real:**

```bash
# 1. Code-Ninja completa tarefa sobre 401
curl -X POST http://localhost:4444/api/squad/code-ninja/task/complete \
  -d '{"learning": "401 = token expirado em SecureStore"}'

# 2. Verificar memory.json foi atualizado
cat /memoria-especialistas/code-ninja/memory.json | jq .knowledge

# Esperado:
# ["401 = token expirado em SecureStore"]

# 3. Próxima tarefa, Code-Ninja já conhece
curl -X POST http://localhost:4444/api/squad/code-ninja/task \
  -d '{"task": "Fix 401 error"}'

# Resposta deve incluir: "Já vi isso antes: token expirado"
```

---

## Timeline

**Hoje (22/03) - Noite:**
- [x] Documentar REAL-LEARNING-SYSTEM
- [ ] Criar scripts tita-specialist-*
- [ ] Integrar no Backend (POST /task/complete)
- [ ] Integrar no Frontend (UI mostra "Especialista aprendeu X")

**Amanhã (23/03):**
- [ ] Testar: Especialista completa tarefa → Memory atualiza
- [ ] Verificar: Próxima tarefa usa novo conhecimento
- [ ] Validar: Memory.json tem aprendizado real

**Próximo fim de semana:**
- [ ] Consolidação automática semanal (rodar script)
- [ ] Especialistas mais antigos têm mais conhecimento
- [ ] Score de aprendizado aumenta visualmente no Dashboard

---

## Garantia

**Diferença desta vez:**

Antes eu disse: "Scripts prontos" (mas não rodavam)  
Agora vou: **Integrar no código real**, testar hoje à noite, mostrar aprendizado real amanhã

**Especialistas VÃO aprender. De verdade.**

