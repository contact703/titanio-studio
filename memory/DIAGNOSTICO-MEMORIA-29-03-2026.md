# 🧠 DIAGNÓSTICO: Por que Tita acordou burra em 29/03/2026

## O Problema
Zica pediu print da seção de mídia e MD pro Helber/Tiago. Tita respondeu "não tenho contexto" — INACEITÁVEL dado que tinha feito TUDO no dia anterior.

## Causa Raiz (3 falhas encadeadas)

### FALHA 1: Sessão de grupo não persiste
- OpenClaw cria nova sessão de grupo a cada restart
- Nova sessão = contexto ZERADO
- Todas as conversas anteriores do grupo somem do contexto imediato
- **Isso é o core do problema.** Cada sessão nova começa sem memória conversacional.

### FALHA 2: Não ler arquivos de memória antes de responder
- Tita tem 5 sistemas de memória implementados (Engine, Graph, Primer, Score, Persistente)
- MAS a sessão de grupo não executa o pre-flight automaticamente
- O Primer (tita-memory-primer.py) funciona quando chamado, mas NÃO é chamado automaticamente em sessões de grupo
- Os flush files (pasta-do-tita/memoria-persistente/) registram TUDO a cada 3h — inclusive o que Zica pediu e o que foi feito
- Mas eu não li eles antes de responder

### FALHA 3: AGENTS.md diz "ler contexto-ativo.md SEMPRE" — mas não fez
- A regra tá escrita em AGENTS.md item 5: "SEMPRE read pasta-do-tita/contexto-ativo.md"
- contexto-ativo.md tem TUDO: Titanio Media criado, posts no Instagram, ComfyUI instalado
- Se eu tivesse lido contexto-ativo.md, teria respondido corretamente na PRIMEIRA mensagem

## O Gap Real
```
O que temos:           O que falta:
✅ Memory Engine        ❌ Injeção automática no contexto de grupo
✅ Memory Graph         ❌ Pre-flight antes de CADA resposta
✅ Memory Primer        ❌ Primer rodando em sessão de grupo
✅ Flush persistente    ❌ Flush sendo lido na sessão
✅ contexto-ativo.md    ❌ Lido automaticamente no start da sessão
```

## Solução Proposta

### Imediata (agora)
1. ✅ Atualizar MEMORY.md com Titanio Media, ComfyUI, Instagram
2. ✅ Registrar lição em LESSONS.md
3. ✅ Criar este diagnóstico

### Curto prazo (hoje/amanhã)
4. Criar um STARTUP-CHECKLIST.md que lista os 5 arquivos obrigatórios:
   - contexto-ativo.md
   - group-context-snapshot.md
   - memory/YYYY-MM-DD.md (hoje)
   - memory/YYYY-MM-DD.md (ontem)
   - MEMORY.md (se sessão principal)
5. Primeiro ato de qualquer sessão: ler esses 5 antes de responder qualquer coisa

### Médio prazo
6. Fazer o Primer rodar como middleware antes de CADA resposta em grupo
7. Ou: criar um bot/sentinel que injeta contexto no início de cada sessão nova
