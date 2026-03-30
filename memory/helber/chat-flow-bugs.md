# Bug Report — Fluxo de Chat NFS-e (Manda a Nota)
**Data:** 2026-03-05  
**Arquivo analisado:** `/Users/macmini03/Desktop/mandaanota/server/routes.ts`  
**Analista:** Kratos / Subagent

---

## Sumário Executivo

Foram identificados **4 bugs críticos** no fluxo de chat de emissão de NFS-e. Os bugs são inter-relacionados e criam uma experiência onde o sistema emite notas com dados errados, ignora correções do usuário e vaza dados entre sessões.

---

## BUG 1 — cTribNac ignorado na confirmação (linha ~2090-2107)
**Gravidade: CRÍTICA**

### O problema
Quando o usuário confirma a emissão digitando "sim" ou similar, o código busca o último `DADOS DA NOTA` no histórico e reconstrói o `pendingInvoiceData`. Porém, ele **não extrai o `Cód. Tributação Nacional`** da mensagem formatada — usa o default do usuário (`user?.ctribNac || '010101'`).

### Código com bug (linha ~2090-2107):
```typescript
// Trecho PROBLEMÁTICO — não extrai cTribNac da mensagem:
if (msg.role === 'assistant' && msg.content.includes('DADOS DA NOTA:')) {
  const cnpjMatch = msg.content.match(/CNPJ\/CPF:\s*([0-9.\-\/]+)/i);
  const valorMatch = msg.content.match(/Valor:\s*R\$\s*([\d.,]+)/i);
  const tomadorMatch = msg.content.match(/Tomador:\s*([^\n\r]+)/i);
  const servicoMatch = msg.content.match(/Servi[cç]o:\s*([^\n\r]+)/i);
  // ⚠️ NUNCA extrai "Cód. Tributação Nacional" da mensagem!

  if (documento && valor > 0 && descricao && tomadorNome) {
    const user = await storage.getUser(userId);
    pendingInvoiceData = {
      // ...
      ctribNac: user?.ctribNac || '010101',  // ← SEMPRE usa o default do usuário
      // ...
    };
  }
}
```

A mensagem do assistente tem a linha:
```
Cód. Tributação Nacional: 01.07.01 — Suporte técnico em informática
```

Mas o código **ignora completamente** essa linha e usa o código padrão cadastrado no perfil do usuário.

### Correção:
```typescript
if (msg.role === 'assistant' && msg.content.includes('DADOS DA NOTA:')) {
  const cnpjMatch = msg.content.match(/CNPJ\/CPF:\s*([0-9.\-\/]+)/i);
  const valorMatch = msg.content.match(/Valor:\s*R\$\s*([\d.,]+)/i);
  const tomadorMatch = msg.content.match(/Tomador:\s*([^\n\r]+)/i);
  const servicoMatch = msg.content.match(/Servi[cç]o:\s*([^\n\r]+)/i);
  // ✅ ADICIONAR: extrai cTribNac da mensagem formatada
  const ctribMatch = msg.content.match(/C[oó]d\.?\s+Tributa[cç][aã]o\s+Nacional:\s*(\d{2}[.\-]?\d{2}[.\-]?\d{2})/i);

  const documento = cnpjMatch?.[1]?.replace(/\D/g, '') || '';
  const valorStr = valorMatch?.[1]?.replace(/\./g, '').replace(',', '.') || '0';
  const valor = parseFloat(valorStr);
  const tomadorNome = tomadorMatch?.[1]?.trim() || '';
  const descricao = servicoMatch?.[1]?.trim() || '';
  
  // ✅ Limpa formatação "01.07.01" → "010701"
  const ctribNacFromMsg = ctribMatch?.[1]?.replace(/[.\-]/g, '') || '';

  if (documento && valor > 0 && descricao && tomadorNome) {
    const user = await storage.getUser(userId);
    pendingInvoiceData = {
      tomadorNome,
      tomadorDocumento: documento,
      tomadorEmail: '',
      valorServico: String(valor),
      descricao,
      // ✅ Usa o cTribNac da mensagem se disponível, senão fallback
      ctribNac: ctribNacFromMsg || user?.ctribNac || '010101',
      ctribMun: user?.ctribMun || undefined,
    };
    break;
  }
}
```

---

## BUG 2 — Sistema emite imediatamente após AI reformular dados (linha ~2885-2890)
**Gravidade: CRÍTICA — ESTE É O BUG PRINCIPAL**

### O problema
Quando o usuário corrige dados ("o serviço está errado, é consultoria"), o fluxo funciona assim:
1. Mensagem do usuário vai para o AI (não é uma confirmação → passa pelo confirmPatterns)
2. O AI processa a correção e responde com um NOVO `DADOS DA NOTA:` com os dados atualizados
3. O código parseia o `DADOS DA NOTA` → cria `invoiceData`
4. **Imediatamente verifica `if (hasAutomation && invoiceData)` e EMITE SEM PEDIR CONFIRMAÇÃO**

O código em `routes.ts` ao redor da linha 2885:
```typescript
if (invoiceData) {
  // TRIGGER AUTOMATIC EMISSION   ← ⚠️ DISPARA SEM CONFIRMAR!
  if (hasAutomation && invoiceData) {
    // ... emit immediately ...
  }
}
```

Isso significa que **qualquer resposta do AI com `DADOS DA NOTA:` dispara emissão imediata** — incluindo quando o AI está apenas apresentando dados corrigidos para nova confirmação.

### Correção — Remover emissão automática do fluxo AI:
A emissão automática a partir da resposta do AI deve ser **completamente removida**. O fluxo correto é:
1. AI responde com `DADOS DA NOTA:` → salva como pending com `invoiceData` no campo da mensagem
2. Usuário diz "sim/confirmo" → ENTÃO emite

```typescript
// ✅ VERSÃO CORRIGIDA - Apenas salva como pending, nunca emite aqui
if (invoiceData) {
  // Não emitir aqui! O invoiceData fica salvo na mensagem do assistente.
  // A emissão só ocorre quando o usuário confirmar explicitamente via confirmPatterns.
  console.log("Invoice data extracted, saving as pending confirmation:", invoiceData);
  // Continua normalmente, o invoiceData será salvo junto com a mensagem
}

// REMOVER COMPLETAMENTE o bloco:
// if (hasAutomation && invoiceData) { ... emit ... }
// E também o bloco do portal dentro do mesmo if
```

O `invoiceData` já é salvo na mensagem do assistente (linha ~3030):
```typescript
const savedMessage = await storage.createChatMessage({
  userId,
  role: "assistant",
  content: assistantMessage,
  invoiceData: invoiceData ? JSON.stringify(invoiceData) : null,  // ← salvo aqui
});
```
Isso é suficiente. A confirmação posterior (`confirmPatterns`) vai encontrar esse dado e emitir.

---

## BUG 3 — Auto-completar "manutenção de computador" (linhas ~2515-2520 e ~2836-2843)
**Gravidade: ALTA**

### O problema — dupla origem

#### Origem A: PRE-AI BYPASS (linha ~2515-2520)
O "bypass pré-AI" tenta extrair serviço da mensagem com regex que captura palavras-chave e EXPANDE automaticamente:
```typescript
// ⚠️ Captura qualquer ocorrência da palavra no texto
const svcKw = message.match(/(?:manuten[cç][aã]o|consultoria|suporte|desenvolvimento|...|contabilidade)(?:\s+(?:de\s+)?[\w\s]*(?:teste)?)?/i);
if (svcKw) preDescricao = svcKw[0].trim();
```
Se o usuário digitar algo como _"CNPJ 123 valor 500 o cliente tem manutenção de hardware"_, o sistema captura "manutenção de hardware" como descrição do serviço prestado.

#### Origem B: taxCodesInfo injetado no prompt (linha ~2413-2423)
```typescript
const taxCodesInfo = suggestedTaxCodes.length > 0
  ? `\nCODIGOS TRIBUTARIOS DISPONIVEIS (baseado nos CNAEs do prestador):
Use a opcao mais especifica para o CNAE selecionado:

RECOMENDADO:           ← ⚠️ A palavra "RECOMENDADO" influencia o LLM
- cTribNac: ${tc.cTribNac}
- Descricao: ${tc.descricao}  ← Se CNAE é 9511-8, "Reparação e manutenção de computadores" aparece aqui
...`
```
Se o CNAE principal do prestador é `9511-8` (Reparação e manutenção de computadores), o campo `taxCodesInfo` injeta _"Reparação e manutenção de computadores"_ como o código RECOMENDADO. O LLM (Llama 3.1-8b) interpreta isso como sugestão e preenche o serviço com "manutenção de computador" mesmo sem o usuário ter dito isso.

#### Origem C: Exemplo hardcoded no SYSTEM_PROMPT (linha ~330-338)
O SYSTEM_PROMPT tem um exemplo que usa exatamente CNPJ `08103457000133` e descreve o serviço como **"criação e manutenção de computadores"**. Se o tomador do usuário coincide com esse CNPJ (empresa Titânio), o LLM pode copiar o exemplo.

### Correção:

**Fix A — PRE-AI BYPASS:** Exigir descrição explícita antes de fazer bypass, nunca inferir por keyword:
```typescript
// ✅ Remover o fallback por keyword. Se não extraiu descrição explícita, ir para AI
if (!preDescricao) {
  // NÃO usar keyword match aqui — vai para o AI pedir ao usuário
  // const svcKw = message.match(...)  ← REMOVER ESTE BLOCO
}

// Só faz bypass se o usuário EXPLICITAMENTE informou a descrição
if (hasDocument && preTomadorNome && preValor > 0 && preDescricao) {
  // OK - descrição veio da mensagem do usuário, não de keyword guess
}
```

**Fix B — taxCodesInfo:** Renomear de "RECOMENDADO" para "DISPONÍVEL" e marcar como referência secundária:
```typescript
const taxCodesInfo = suggestedTaxCodes.length > 0
  ? `\nCODIGOS TRIBUTARIOS DISPONIVEIS PARA REFERENCIA (baseado no CNAE do prestador - use apenas como referência, determine pelo SERVICO DESCRITO pelo usuario):

${suggestedTaxCodes.slice(0, 8).map((tc, i) => `OPCAO ${i + 1} (CNAE ${tc.cnaeRelacionados}):
- cTribNac: ${tc.cTribNac}
- Descricao: ${tc.descricao}
- Palavras-chave: ${tc.palavrasChave || 'N/A'}`).join('\n\n')}`
  : '\nATENCAO: Nao encontrei codigos tributarios para o CNAE do usuario.';
```

**Fix C — SYSTEM_PROMPT:** Substituir o exemplo que usa CNPJ real por CNPJ fictício:
```
// Linha ~326: Mudar o CNPJ do exemplo de 08103457000133 para 00000000000000 ou 99999999000191
Usuário: "emitir nota para CNPJ 99.999.999/0001-91 valor 2500 suporte técnico e configuração de estações de trabalho"
```

---

## BUG 4 — Dados de emissão anterior persistem no histórico (linhas ~2067-2070, ~2215, ~2970)
**Gravidade: ALTA**

### O problema
O chat só é limpo em dois momentos:
1. Emissão bem-sucedida via fluxo de confirmação (linha ~2215): `await storage.clearChatMessages(userId)`
2. **Não limpa em falha de emissão**

Se a emissão falha (erro de SEFAZ, timeout, etc.), a mensagem `DADOS DA NOTA:` permanece no histórico. Na próxima interação:
- Se o usuário digitar qualquer coisa que case com `confirmPatterns` (ex: "ok", "certo", "sim"), o sistema VAI EMITIR a nota anterior que falhou, sem apresentar os dados novamente.

Além disso, se usuário A inicia emissão, não confirma, e usuário B (mesma conta, sessão diferente) digita "sim" por qualquer motivo, a nota de A pode ser emitida em nome de B.

### Correção:

**Fix A — Limpar após qualquer tentativa de emissão (sucesso ou falha):**
```typescript
// No confirmation flow (linha ~2215) — já limpa em sucesso
if (result.success) {
  await storage.clearChatMessages(userId);
}
// ✅ ADICIONAR: também limpa em erro para não deixar dado stale
// if (!result.success) {
//   await storage.clearChatMessages(userId);  // ou marcar o invoiceData como "usado"
// }
```

**Fix B — Marcar mensagem de DADOS DA NOTA como "consumida" após confirmação:**
Uma solução mais elegante: em vez de limpar tudo, atualizar o `invoiceData` da mensagem para `null` após consumir:
```typescript
// Após extrair pendingInvoiceData da mensagem histórica, marcar como consumido:
await storage.updateChatMessageInvoiceData(msg.id, null);  // precisa criar este método
```

**Fix C — Verificar se já existe emissão recente antes de disparar:**
```typescript
// Antes de emitir, verificar se não há nota "processing" recente (últimos 5 min)
const recentInvoices = await storage.getInvoices(userId);
const veryRecentProcessing = recentInvoices.find(inv => 
  inv.status === 'processing' && 
  inv.createdAt && 
  (Date.now() - new Date(inv.createdAt).getTime()) < 5 * 60 * 1000
);
if (veryRecentProcessing) {
  return res.json({ error: "Já existe uma emissão em andamento" });
}
```

---

## Análise do System Prompt

### Pontos positivos:
1. A tabela de palavras-chave → cTribNac é bem estruturada e abrangente
2. Instrução explícita: "O CNAE do prestador serve como referência SECUNDÁRIA, NÃO como fator principal" — **correto**
3. Formato fixo de resposta (`DADOS DA NOTA:`) facilita parsing

### Problemas identificados no System Prompt:

#### 1. Exemplo com CNPJ real (linha ~326-340):
O exemplo usa o CNPJ `08103457000133` (empresa real — Titânio Produções Artísticas Ltda). Se um usuário quer emitir para essa empresa, o LLM pode copiar a descrição do exemplo em vez de usar a descrição fornecida pelo usuário.
**Correção:** Usar CNPJ fictício como `00.000.000/0001-00`.

#### 2. Falta instrução sobre correções:
O system prompt não tem instrução explícita sobre o que fazer quando o usuário diz que um dado está errado. O LLM pode apresentar novamente o DADOS DA NOTA sem instrução clara.
**Adicionar ao SYSTEM_PROMPT:**
```
FLUXO DE CORREÇÃO:
- Se o usuário disser que algum dado está errado, ATUALIZE apenas o dado mencionado
- Apresente novamente o DADOS DA NOTA completo com a correção
- Peça confirmação novamente
- NUNCA infira que a correção é uma confirmação
- NUNCA sugira um serviço que o usuário não mencionou
- Exemplo: "o serviço está errado, é consultoria" → atualizar Serviço para "consultoria" e mostrar DADOS DA NOTA novamente
```

#### 3. Contradição taxCodesInfo vs SYSTEM_PROMPT:
O SYSTEM_PROMPT diz "CNAE é referência SECUNDÁRIA", mas o contexto dinâmico injetado diz "RECOMENDADO" apontando para o código do CNAE. O LLM (Llama 3.1-8b, modelo pequeno) tende a seguir o contexto mais recente (o `taxCodesInfo`) em vez da instrução do system prompt.
**Correção:** Alinhar a linguagem do `taxCodesInfo` com o system prompt.

#### 4. Modelo LLM inadequado para o task:
`llama-3.1-8b-instant` é um modelo pequeno e rápido, mas propenso a alucinar e seguir padrões de exemplo em vez de instruções. Para um sistema fiscal com implicações legais/financeiras, considerar migrar para `llama-3.3-70b-versatile` ou `mixtral-8x7b-32768` via Groq (ainda gratuito no tier básico), ou `claude-3-haiku` via API Anthropic.

---

## Resumo das Correções por Prioridade

| Prioridade | Bug | Linha | Correção |
|---|---|---|---|
| 🔴 P0 | Emissão imediata após correção do usuário | ~2885 | Remover bloco de emissão automática do fluxo AI |
| 🔴 P0 | cTribNac errado na confirmação | ~2090-2107 | Adicionar regex para extrair cTribNac do DADOS DA NOTA |
| 🟠 P1 | "manutenção" auto-completado | ~2515 + ~2836 | Remover fallback por keyword no bypass; ajustar taxCodesInfo |
| 🟠 P1 | Dados persistem entre sessões | ~2215 | Limpar chat após qualquer tentativa de emissão (sucesso ou falha) |
| 🟡 P2 | Exemplo com CNPJ real no prompt | ~326 | Substituir por CNPJ fictício |
| 🟡 P2 | Falta instrução de correção no prompt | ~147 | Adicionar bloco FLUXO DE CORREÇÃO |

---

## Diagrama do Fluxo Correto (como deveria ser)

```
Usuário envia mensagem
        ↓
É uma confirmação (sim/ok/etc)?
  ├── SIM → busca DADOS DA NOTA mais recente no histórico
  │         → emite com os dados armazenados
  │         → limpa histórico (sucesso OU falha)
  │
  └── NÃO → envia para AI com contexto do usuário
              ↓
         AI responde com DADOS DA NOTA?
          ├── SIM → salva mensagem com invoiceData
          │         → NÃO emite → aguarda confirmação do usuário
          │
          └── NÃO → salva mensagem sem invoiceData
                    → aguarda próxima mensagem do usuário
```

---

*Relatório gerado em 2026-03-05 por Kratos (subagent Manda a Nota analysis)*
