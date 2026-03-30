# Chaves Anthropic - Configuração Tita

## Chave Primária
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

## Chave Secundária (Backup)
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

## Comandos
# Trocar para secundária:
# openclaw gateway config.patch '{"env":{"ANTHROPIC_API_KEY":"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"}}'

# Trocar para primária:
# openclaw gateway config.patch '{"env":{"ANTHROPIC_API_KEY":"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"}}'
