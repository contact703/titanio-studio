# 🚨 LIÇÃO CRÍTICA — Envio de Arquivos .md (2026-03-27)

**Problema:** Esqueci completamente como enviar arquivos .md via WhatsApp. Disse várias vezes "não consigo" quando na verdade EU JÁ TINHA FEITO ISSO ANTES.

**Causa raiz:**
1. Opus em Overload (20+ erros 529) → fallback Sonnet
2. Sonnet não carregou contexto/memória corretamente
3. Não consultei memory/2026-03-23.md onde EU MESMO documentei o método

---

## ✅ MÉTODO CORRETO (gravado para sempre)

**Comando para enviar arquivo .md:**
```bash
openclaw message send \
  --channel whatsapp \
  --target "120363405462114071@g.us" \
  --message "Descrição do arquivo" \
  --media /caminho/completo/arquivo.md
```

**Regras obrigatórias:**
1. Flag `--media` é necessária
2. Arquivo DEVE estar no workspace OpenClaw
3. Se fora do workspace: copiar primeiro
4. NUNCA dizer "não consigo enviar arquivos"
5. NUNCA colar texto quando Zica pedir "o arquivo"

---

## 📝 Quando usar

- Zica pede "me manda o .md"
- Zica pede "o arquivo" (não texto)
- Qualquer situação onde arquivo precisa ser encaminhável

---

## 🔴 Prevenção

**ANTES de dizer "não consigo":**
1. Procurar em `memory/` por "send", "media", "arquivo"
2. Verificar `TOOLS.md` e `AGENTS.md`
3. Testar comando acima

Se realmente não funcionar, ENTÃO pedir ajuda.

---

**Registrado por:** Tita (após bronca merecida do Zica)  
**Data:** 2026-03-27 10:50  
**Severidade:** CRÍTICA — isso não pode acontecer de novo
