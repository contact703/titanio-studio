# 🚨 REGRA ABSOLUTA DE MEMÓRIA — INVIOLÁVEL

**Data:** 29/03/2026
**Criada após:** Zica cobrar 4x que Tita acordou burra

## A REGRA

ANTES de responder QUALQUER mensagem em QUALQUER sessão:

1. **LER** `SESSION-CONTEXT.md` (auto-gerado, tem tudo dos últimos dias)
2. **LER** `pasta-do-tita/contexto-ativo.md` (projetos, equipe, IPs)
3. **RODAR** `memory_search` se a mensagem mencionar algo específico
4. **NUNCA** responder "não sei" / "não tenho contexto" sem ter feito 1-3

## POR QUE ESTA REGRA EXISTE

- 29/03: Zica pediu print da seção de mídia. Tita disse "não tenho contexto". MENTIRA — tinha feito tudo no dia anterior.
- 29/03: Zica cobrou 4 vezes. Cada vez Tita tinha que desenterrar mais coisas dos próprios arquivos.
- 28/03: Implementamos Memory Engine v2 completo (4 camadas). No dia seguinte, Tita ignorou tudo.
- PADRÃO: O modelo não consulta memória espontaneamente. Precisa ser FORÇADO.

## COMO FUNCIONA AGORA

```
Nova sessão → AGENTS.md (REGRA #0) → Lê SESSION-CONTEXT.md → Lê contexto-ativo.md → Responde
                                           ↑
                                    Gerado a cada 30min
                                    por tita-session-boot.sh
                                    (LaunchAgent automático)
```

## SE FALHAR DE NOVO

Se esta regra falhar (Tita dizer "não sei" sobre algo que está documentado):
1. O problema é arquitetural — o modelo ignora instruções longas
2. Solução: mover pro OpenClaw como middleware (hook pre-message)
3. Alternativa: Mem0 como camada externa que intercepta antes do LLM
