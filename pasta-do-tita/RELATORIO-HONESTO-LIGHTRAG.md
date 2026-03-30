# Relatório Honesto — LightRAG na Tita
**Data:** 23/03/2026 14:00
**Autor:** Tita

## Status REAL

| Componente | Status | Detalhe |
|---|---|---|
| LightRAG Server | ✅ Rodando | porta 9621, v1.4.11 |
| Ollama | ✅ Rodando | phi3:3.8b + nomic-embed-text |
| Indexação | ⚠️ Parcial | 8/13 chunks indexados (3 falharam por EOF) |
| Grafo | ✅ Criado | 20 nodes, 3 edges, 16KB |
| Queries | ⚠️ Funciona mas alucina | phi3 inventa dados que não existem |

## Problema principal

O **phi3:3.8b-instruct** é pequeno demais para extração de entidades confiável:
- Extrai entidades que NÃO existem nos documentos (ex: "João Dias", "Tokyo Olympics")
- Inventa nomes e organizações fictícias
- As queries retornam informação inventada misturada com dados reais

## O que funciona de verdade

1. **Server HTTP** — health check, indexação via API, queries ✅
2. **Embedding** — nomic-embed-text gera vetores corretamente ✅
3. **Storage** — grafos, vetores, chunks persistem no disco ✅
4. **Sync de especialistas** → LightRAG — script robusto que quebra em chunks e re-aquece modelos ✅

## O que NÃO funciona bem

1. **Qualidade do grafo** — phi3 alucina entidades fictícias
2. **Queries** — respostas misturam dados reais com invenções
3. **ARM64 EOF bug** — docs grandes (>5KB) falham sem chunk + warmup

## Solução recomendada

**Trocar phi3 por llama3.1:8b** (já está instalado no Ollama):
- Muito melhor em extração de entidades
- Menos alucinação
- Requer ~5GB RAM (temos de sobra)

Ou **usar API externa** (Anthropic/OpenAI) para a extração de entidades e manter Ollama só para embeddings.

## Próximos passos
1. Limpar grafo atual (tem lixo do phi3)
2. Re-indexar com llama3.1:8b
3. Validar que entidades extraídas existem nos documentos originais
4. Configurar cron para sync automático
