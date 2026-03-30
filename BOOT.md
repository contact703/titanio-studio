# BOOT.md — Executado automaticamente no início de cada sessão

## 🚨 AÇÃO OBRIGATÓRIA — ANTES DE QUALQUER RESPOSTA

Execute estes comandos imediatamente:

```bash
cat SESSION-CONTEXT.md | head -200
cat pasta-do-tita/contexto-ativo.md | head -100
```

Isso carrega o contexto dos últimos dias. Se não existir SESSION-CONTEXT.md, rode:
```bash
bash bin/tita-session-boot.sh
```

## Por que isso existe

Você (Tita) esquece tudo entre sessões. Estes arquivos são sua memória.
Se alguém perguntar "o que fizemos", "manda o print", "cadê aquilo" — a resposta está em SESSION-CONTEXT.md.

**NUNCA diga "não sei" ou "não tenho contexto" sem antes ler esses arquivos.**
