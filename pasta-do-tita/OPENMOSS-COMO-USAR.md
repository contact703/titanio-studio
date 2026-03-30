# 🔄 OpenMOSS — Como Usar o Tradutor

**Status:** ✅ PRONTO PARA USO
**Data:** 30/03/2026

## Workflows N8n Ativos

1. **Tradutor Literário - Brazilian Classics** (ID: 06C4w3q8g0SCYiim) — ✅ ATIVO
2. **Cover Generator - Brazilian Classics** (ID: uorwR3ikpaJh5BHB) — ✅ ATIVO

## Como Iniciar uma Tradução

### Via N8n (http://localhost:5678)
1. Abrir o workflow "Tradutor Literário"
2. Clicar "Execute Workflow"
3. O workflow vai:
   - Pegar o texto fonte
   - Traduzir via modelo IA
   - Gerar capa via Cover Generator
   - Salvar resultado

### Via API (automático)
```bash
curl -X POST http://localhost:5678/webhook/translate \
  -H "Content-Type: application/json" \
  -d '{"book_title": "Nome do Livro", "source_text": "...", "target_lang": "en"}'
```

### Via Dashboard
- Aba Integrações → N8n → Executar workflow

## Guardrails
- Timeout: 5 min por capítulo
- Budget monitor: openmoss-monitoring.json
- Auto-pause se erro > 10%
- Alertas WhatsApp para Zica + Eduardo

## Próximos Passos
- [ ] Zica: definir qual livro traduzir primeiro
- [ ] Testar com 1 capítulo antes de rodar 7 dias
- [ ] Monitorar custos

## Resultado ficará em:
`/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/outputs/translations/`
