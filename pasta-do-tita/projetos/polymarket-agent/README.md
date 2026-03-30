# 🎰 Polymarket Agent

**Status:** 🟡 Monitor ativo
**Criado:** 2026-03-26
**Custo:** R$ ~0.01/dia (Claude fallback)
**Especialista:** trader

## O Que É
Bot de trading automatizado no Polymarket. Monitora mercados, analisa oportunidades com IA, executa trades.

## Stack
- Python + py-clob-client (SDK Polymarket)
- Modelos: Nemotron/StepFlash (free) → Claude (fallback)
- Monitor 24/7 com scan a cada 10min

## Posições
- OKC Thunder YES $12
- Drake NO $15 (ERRO de outcome)
- Avalanche NO $8
- Saldo: $4.86

## Como Rodar
```bash
bash start-monitor.sh
```
