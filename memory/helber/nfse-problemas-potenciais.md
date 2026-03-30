# Relatório de Auditoria: Problemas Potenciais na Emissão NFS-e
**Projeto:** Manda a Nota  
**Data:** 2026-03-05  
**Auditor:** Kratos (subagente especialista fiscal)  
**Arquivos analisados:** `server/nfse-api.ts`, `server/routes.ts`, `shared/schema.ts`

---

## Resumo Executivo

Foram identificados **38 problemas** distribuídos em:
- 🔴 **11 Críticos** — podem causar falha total ou emissão com dados errados
- 🟡 **17 Médios** — causam problemas em cenários específicos
- 🟢 **10 Baixos** — melhorias importantes mas não bloqueantes

> ⚠️ Os problemas críticos 1, 3 e 4 são os mais urgentes: causam **emissão com código de serviço errado (saneamento ambiental para todos)**, **duplicidade de nDPS** e **cancelamento sempre falha** com erro de assinatura.

---

## 🔴 PROBLEMAS CRÍTICOS

---

### C1 — nDPS baseado em timestamp: risco real de duplicidade

**Arquivo:** `nfse-api.ts` (linha ~185)  
**Descrição:** O número da DPS (`nDPS`) é gerado como timestamp Unix em segundos:
```typescript
const nDPSNum = Math.floor(Date.now() / 1000).toString();
```
**Causa:** Dois usuários emitindo no mesmo segundo compartilham o mesmo `nDPS`. Pior ainda: se o **mesmo prestador** emitir duas notas no mesmo segundo (clique duplo, retry), o SEFAZ rejeitará a segunda com erro de duplicidade de DPS (`E0601` — DPS duplicado).

**Impacto:** Rejeição pela SEFAZ. Em produção com múltiplos usuários, a colisão é certa.  
**Nota:** O nDPS deve ser sequencial e **único por serie+prestador**, persistido em banco.

**Solução:**
```typescript
// No banco: adicionar coluna nfse_sequence por usuário
// ALTER TABLE nfse_users ADD COLUMN nfse_sequence INTEGER DEFAULT 0;

// Na emissão:
const seqResult = await db
  .update(users)
  .set({ nfseSequence: sql`nfse_sequence + 1` })
  .where(eq(users.id, userId))
  .returning({ seq: users.nfseSequence });
const nDPSNum = String(seqResult[0].seq).padStart(15, '0');
```

---

### C2 — cNBS padrão errado: "101050000" = Saneamento Ambiental

**Arquivo:** `nfse-api.ts` (linha ~140)  
**Descrição:** O cNBS default hardcodado é `"101050000"`.  
```typescript
const cNBS = dps.servico.cNBS || '101050000';
```
**Causa:** O código NBS `1.0105.00.00` (formato com pontos) corresponde a **"Serviços de saneamento e tratamento ambiental"**. Quase todos os prestadores de serviços de TI, consultoria, design, etc. estão emitindo NFS-e com código de saneamento ambiental.

**Impacto:** Emissão aceita pela SEFAZ (a validação do cNBS é fraca) mas **fiscalmente incorreta**. Pode gerar autuação fiscal no prestador.

**Solução:** Usar código NBS apropriado por grupo de serviço:
```typescript
// Mapa cTribNac → cNBS correto (9 dígitos sem pontos)
const NBS_MAP: Record<string, string> = {
  '010101': '120011000', // Desenvolvimento de sistemas
  '010201': '120011000', // Programação
  '010301': '120013000', // Hospedagem/processamento de dados
  '010401': '120011000', // Elaboração de programas
  '010501': '120011100', // Licenciamento de software
  '010601': '120012000', // Consultoria em TI
  '010701': '120012000', // Suporte técnico
  '010801': '120011000', // Criação de páginas web
  '170101': '112012000', // Consultoria empresarial
  '170601': '112013000', // Publicidade/marketing
  '230101': '112013000', // Design
  // ... adicionar todos
};
const cNBS = dps.servico.cNBS || NBS_MAP[dps.servico.cTribNac] || '120012000';
```

---

### C3 — cNBS nunca é passado do routes.ts para o DPS

**Arquivo:** `routes.ts` (múltiplos locais de emissão)  
**Descrição:** Em todos os pontos de emissão no routes.ts, o objeto `dpsData` é construído **sem o campo `cNBS`**:
```typescript
servico: {
  descricao: invoice.descricao,
  valor: Number(invoice.valorServico),
  cTribNac: user.ctribNac || invoice.ctribNac || "010101",
  cTribMun: user.ctribMun || invoice.ctribMun || undefined,
  // ← cNBS NUNCA PASSADO AQUI
},
```
**Causa:** O campo `cNBS` foi adicionado ao `DPSData` mas nunca integrado na camada de routes. O chat determina o cNBS correto via IA (ex: "1.2001.20.00") mas esse valor é descartado.

**Impacto:** **100% das emissões usam cNBS = "101050000" (saneamento ambiental)**. Problema universal.

**Solução:**
```typescript
// Em todos os pontos de criação de dpsData em routes.ts:
servico: {
  descricao: invoice.descricao,
  valor: Number(invoice.valorServico),
  cTribNac: invoice.ctribNac || user.ctribNac || "010101",
  cTribMun: invoice.ctribMun || user.ctribMun || undefined,
  cNBS: (invoice as any).cNBS || undefined, // Adicionar campo cNBS na tabela invoices
},
```
E adicionar coluna `cNBS` na tabela `nfse_invoices`.

---

### C4 — Cancelamento: assinatura XML sempre falha (Id ausente no XML)

**Arquivo:** `nfse-api.ts` — função `cancelarNFSe`  
**Descrição:** O XML de cancelamento é gerado com `<infPedEvento>` **sem atributo Id**:
```xml
<infPedEvento>   ← sem Id="infPedEvento"
  <tpEvento>e101101</tpEvento>
  ...
</infPedEvento>
```
Mas a função `signXml` tenta assinar referenciando:
```typescript
signXml(eventoXml, certData, "infPedEvento");
// xpath: //*[@Id='infPedEvento'] → NÃO ENCONTRA NADA
```
**Causa:** O código usa o mesmo mecanismo de assinatura da emissão, mas o XML de cancelamento não foi estruturado com o atributo `Id` necessário para a referência da assinatura XMLDSig.

**Impacto:** **Cancelamento de NFS-e nunca funciona** via certificado A1. Sempre lança erro.

**Solução:**
```xml
<!-- XML corrigido de cancelamento -->
<pedEvento xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">
  <infPedEvento Id="infPedEvento">   ← ADICIONAR Id
    <tpEvento>e101101</tpEvento>
    <chNFSe>${chaveAcesso}</chNFSe>
    ...
  </infPedEvento>
</pedEvento>
```

---

### C5 — Extração do certificado PFX pode pegar o certificado errado

**Arquivo:** `nfse-api.ts` — função `extractCertificateFromPfx`  
**Descrição:** O código pega sempre o índice `[0]` do bag de certificados:
```typescript
const certBag = certBags[forge.pki.oids.certBag];
if (certBag && certBag.length > 0 && certBag[0].cert) {
  certificate = forge.pki.certificateToPem(certBag[0].cert);
```
**Causa:** PFX de certificados A1 frequentemente contém cadeia completa (certificado da entidade final + certificado intermediário + raiz). A ordem dos bags **não é garantida** — o índice [0] pode ser o certificado raiz ou intermediário.

**Impacto:** A SEFAZ rejeita a autenticação mTLS porque o certificado enviado não é o certificado da empresa. Erro intermitente dependendo da CA emissora.

**Solução:**
```typescript
// Selecionar o certificado com menor notAfter (mais próximo da validade)
// ou verificar se o CN contém o CNPJ do prestador
const certBag = certBags[forge.pki.oids.certBag] || [];
let entityCert = certBag[0]?.cert;
for (const bag of certBag) {
  const cn = bag.cert?.subject.getField('CN')?.value || '';
  if (/\d{14}/.test(cn)) { // certificado com CNPJ no CN = certificado da empresa
    entityCert = bag.cert;
    break;
  }
}
```

---

### C6 — dhEmi muito no passado causa rejeição por janela temporal

**Arquivo:** `nfse-api.ts` — funções `getAccurateTime` e `generateDPSXml`  
**Descrição:** A função `getAccurateTime` subtrai **30 segundos** do horário do Google como "margem de segurança". No fallback (erro de rede), subtrai **120 segundos (2 minutos)**:
```typescript
resolve(new Date(new Date(dateHeader).getTime() - 30000)); // -30s
resolve(new Date(Date.now() - 120000)); // fallback: -2min
```
**Causa:** O SEFAZ valida se o `dhEmi` está dentro de uma janela de tempo aceitável (tipicamente ±5 minutos). Com o fallback de -120s, o dhEmi pode ultrapassar a janela se houver latência adicional de rede.

**Impacto:** Com timeout no servidor Google + latência alta, o dhEmi pode ser rejeitado.

**Solução:** Usar apenas -10s de margem, e no fallback usar `Date.now()` sem subtração:
```typescript
resolve(new Date(new Date(dateHeader).getTime() - 10000)); // -10s apenas
req.on('error', () => resolve(new Date())); // fallback: hora atual, sem subtração
```

---

### C7 — Sem timeout na requisição à API SEFAZ

**Arquivo:** `nfse-api.ts` — função `sendToNFSeAPI`  
**Descrição:** A função `https.request` não define timeout:
```typescript
const options: https.RequestOptions = {
  hostname: url.hostname,
  port: 443,
  path: url.pathname,
  method,
  cert: certData.certificate,
  key: certData.privateKey,
  // ← SEM timeout
};
```
**Causa:** Se a API do SEFAZ demorar ou travar, a requisição fica pendente indefinidamente, bloqueando o processo Node.js.

**Impacto:** Usuários ficam esperando sem feedback. Em produção com muitas requisições pendentes, pode esgotar memória/sockets.

**Solução:**
```typescript
const options: https.RequestOptions = {
  // ...demais campos...
  timeout: 30000, // 30 segundos
};

req.on('timeout', () => {
  req.destroy();
  reject(new Error('Timeout na comunicação com SEFAZ (30s)'));
});
```

---

### C8 — JSON.parse da resposta SEFAZ pode lançar exceção não tratada

**Arquivo:** `nfse-api.ts` — função `emitirNFSe`  
**Descrição:** No bloco de erro:
```typescript
} else {
  try {
    const errorData = JSON.parse(response.body); // ← pode explodir
```
Mas fora do bloco de sucesso `(200/201)`, se a SEFAZ retornar HTML de erro (502, 503, 504 com página de manutenção), o `JSON.parse` lança `SyntaxError` que não é capturado dentro do `try/catch` interno.

**Causa:** O `try/catch` interno trata o parse mas faz `catch {}` e define `errorMsg = 'Erro ao processar resposta da SEFAZ'`, o que é correto. Porém o `consultarNFSe` e `cancelarNFSe` **não têm esse try/catch** no parse:
```typescript
// consultarNFSe - sem try/catch no parse:
const errorData = JSON.parse(response.body); // explosão se HTML
```

**Impacto:** Falha silenciosa ou erro 500 inesperado em cancelamento/consulta.

**Solução:** Adicionar try/catch em `consultarNFSe` e `cancelarNFSe`:
```typescript
let errorData: any = {};
try { errorData = JSON.parse(response.body); } catch {}
```

---

### C9 — regEspTrib pode enviar string não-numérica para o SEFAZ

**Arquivo:** `nfse-api.ts` — função `generateDPSXml`  
**Descrição:**
```typescript
const regEspTrib = dps.prestador.regimeEspecial && dps.prestador.regimeEspecial !== 'nenhum'
  ? dps.prestador.regimeEspecial : '0';
```
Se `regimeEspecial` no banco contiver valores como `'autonomo'`, `'profissional_liberal'`, ou qualquer string não-numérica, esse valor vai direto para o XML.

**Causa:** O schema NFS-e exige código numérico: `0=Nenhum, 1=Microempresa Municipal, 2=Estimativa, 3=Sociedade de Profissionais, 4=Cooperativa, 5=Microempresário Individual (MEI), 6=Microempresário e Empresa de Pequeno Porte`.

**Impacto:** Rejeição por `E0999 - Erro de validação do schema XSD`.

**Solução:**
```typescript
const REGIME_ESPECIAL_MAP: Record<string, string> = {
  'nenhum': '0', '0': '0',
  'microempresa_municipal': '1', '1': '1',
  'estimativa': '2', '2': '2',
  'sociedade_profissionais': '3', '3': '3',
  'cooperativa': '4', '4': '4',
  'mei': '5', '5': '5',
  'micro_pequeno': '6', '6': '6',
};
const regEspTrib = REGIME_ESPECIAL_MAP[dps.prestador.regimeEspecial || ''] ?? '0';
```

---

### C10 — opSimpNac mapeamento incorreto para MEI no schema v1.01

**Arquivo:** `nfse-api.ts` — função `generateDPSXml`  
**Descrição:**
```typescript
const opSimpNac = dps.prestador.simplesNacional === 'mei' ? '2'
  : dps.prestador.simplesNacional === 'optante' ? '3'
  : '1';
```
**Causa:** O comentário diz `(schema v1.01)` mas os valores no XSD nacional são: `1=Não optante SN, 2=Microempreendedor Individual (MEI), 3=Microempresa/Empresa de Pequeno Porte`. O mapeamento parece correto, mas o **regApTribSN** para opSimpNac=3 está sendo incluído com valor fixo `1`:
```typescript
const regApTribSN = opSimpNac === '3' ? `\n        <regApTribSN>1</regApTribSN>` : '';
```
O valor `1` (Regime de Caixa) pode ser incorreto para muitos MEPPs que optam pelo Regime de Competência (`regApTribSN=2`). Isso é uma configuração por empresa.

**Impacto:** Empresa tributada incorretamente pelo regime de caixa quando deveria ser competência.

**Solução:** Adicionar campo `regimeApuracaoSN` no cadastro do usuário e usar esse valor.

---

### C11 — Senha do certificado com chave padrão insegura

**Arquivo:** `routes.ts`  
**Descrição:**
```typescript
const ENCRYPTION_KEY = crypto.scryptSync(
  process.env.SESSION_SECRET || 'default-secret-key', // ← chave padrão!
  'salt', 32
);
```
**Causa:** Se `SESSION_SECRET` não estiver configurada no ambiente de produção, todos os certificados são criptografados com `'default-secret-key'` — chave conhecida publicamente.

**Impacto:** Vazamento da chave do banco expõe todas as senhas de certificados A1 dos usuários. Catastrófico para compliance.

**Solução:**
```typescript
if (!process.env.SESSION_SECRET) {
  throw new Error('FATAL: SESSION_SECRET environment variable is required');
}
const ENCRYPTION_KEY = crypto.scryptSync(process.env.SESSION_SECRET, 'salt', 32);
```

---

## 🟡 PROBLEMAS MÉDIOS

---

### M1 — codigoMunicipio fallback para São Paulo quando não configurado

**Arquivo:** `routes.ts` — função `resolveCodigoMunicipioIbge`  
**Causa:** Se o usuário não tem `codigoMunicipio` e o CEP falha, o sistema usa São Paulo (3550308). Uma nota emitida com município errado é tecnicamente inválida.

**Solução:** Bloquear a emissão com erro claro se o código IBGE não puder ser resolvido:
```typescript
if (!resolvedCode) {
  throw new Error('Município do prestador não identificado. Configure o código IBGE no seu perfil.');
}
```

---

### M2 — CNPJ/CPF do tomador não validado matematicamente

**Arquivo:** `routes.ts` e `nfse-api.ts`  
**Causa:** O sistema não verifica os dígitos verificadores do CNPJ/CPF do tomador. Um CNPJ com os dois últimos dígitos errados é aceito localmente mas rejeitado pela SEFAZ.

**Solução:**
```typescript
function validateCnpjDigits(cnpj: string): boolean {
  const n = cnpj.replace(/\D/g, '');
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  let sum = 0, pos = 5;
  for (let i = 0; i < 12; i++) { sum += parseInt(n[i]) * pos--; if (pos < 2) pos = 9; }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(n[12])) return false;
  sum = 0; pos = 6;
  for (let i = 0; i < 13; i++) { sum += parseInt(n[i]) * pos--; if (pos < 2) pos = 9; }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(n[13]);
}
```

---

### M3 — dhEvento do cancelamento usa ISO UTC em vez de BRT com offset

**Arquivo:** `nfse-api.ts` — função `cancelarNFSe`  
**Causa:**
```typescript
<dhEvento>${new Date().toISOString()}</dhEvento>
// gera: "2026-03-05T20:31:00.000Z" ← UTC com 'Z'
```
O SEFAZ exige offset explícito: `"2026-03-05T17:31:00-03:00"`.

**Solução:** Reutilizar o mesmo mecanismo de formatação BRT da emissão:
```typescript
const emissionTime = await getAccurateTime();
const dhEvento = formatBRT(emissionTime); // mesmo helper de generateDPSXml
```

---

### M4 — Descrição do serviço sem validação de tamanho mínimo/máximo

**Arquivo:** `nfse-api.ts` — função `generateDPSXml`  
**Causa:** O XSD da NFS-e nacional exige `xDescServ` com mínimo de 5 e máximo de 2000 caracteres. O código não valida isso.

**Solução:**
```typescript
const descricao = dps.servico.descricao.substring(0, 2000);
if (descricao.trim().length < 5) {
  throw new Error('Descrição do serviço deve ter pelo menos 5 caracteres');
}
```

---

### M5 — Inscrição Municipal não validada por formato

**Arquivo:** `nfse-api.ts`  
**Causa:** A IM é enviada diretamente sem validação. Alguns municípios exigem formato específico (somente números, com hífen, etc.). Uma IM mal formatada gera `E0403`.

**Solução:** Ao menos limpar caracteres não-alfanuméricos e validar comprimento:
```typescript
const im = (dps.prestador.inscricaoMunicipal || '').replace(/[^a-zA-Z0-9\-]/g, '');
if (im && im.length > 20) throw new Error('Inscrição Municipal inválida (máx 20 chars)');
```

---

### M6 — CNAE não validado: pode ter menos ou mais de 7 dígitos

**Arquivo:** `routes.ts` e `nfse-api.ts`  
**Causa:** O CNAE principal é usado no cadastro e nunca validado quanto ao formato (deve ter exatamente 7 dígitos numéricos). Um CNAE de 8 dígitos (com formatação incluída, ex: "6201-5/01") pode ser armazenado e enviado errado.

**Solução:**
```typescript
const cleanCnae = user.cnaePrincipal.replace(/[.\-\/]/g, '');
if (!/^\d{7}$/.test(cleanCnae)) {
  throw new Error(`CNAE inválido: ${user.cnaePrincipal}. Deve ter 7 dígitos.`);
}
```

---

### M7 — tpRetISSQN hardcodado como "1" (Normal) para todos os serviços

**Arquivo:** `nfse-api.ts` — função `generateDPSXml`  
**Causa:**
```typescript
<tpRetISSQN>1</tpRetISSQN>
```
Para serviços sujeitos à retenção na fonte pelo tomador (ex: serviços prestados a órgãos públicos, grandes tomadores obrigados a reter), o valor correto seria `2` (Retido pelo Tomador).

**Impacto:** Nota emitida sem retenção quando deveria ter, gerando obrigação fiscal indevida ao prestador.

**Solução:** Adicionar campo `retencaoIssqn` no formulário e mapear para o campo correto:
```typescript
const tpRetISSQN = dps.servico.retencaoIssqn ? '2' : '1';
```

---

### M8 — tpAmb hardcodado como "1" (Produção) — sem suporte a homologação

**Arquivo:** `nfse-api.ts`  
**Causa:** Não há forma de testar sem enviar para produção.

**Solução:**
```typescript
const tpAmb = process.env.NFSE_AMBIENTE === 'homologacao' ? '2' : '1';
const NFSE_API_BASE = tpAmb === '2'
  ? 'https://hom.sefin.nfse.gov.br/SefinNacional'
  : 'https://sefin.nfse.gov.br/SefinNacional';
```

---

### M9 — Sem verificação de municípios não aderentes ao Sistema Nacional

**Arquivo:** `routes.ts` e `nfse-api.ts`  
**Causa:** Vários municípios brasileiros (especialmente os de grande porte que já tinham sistema próprio antes de 2023) ainda não aderiram ao Sistema Nacional NFS-e. O código envia para qualquer código IBGE sem verificar a lista de aderentes.

**Impacto:** Emissão rejeitada com erro de município não cadastrado.

**Solução:** Manter lista de municípios aderentes (disponível via API do SEFAZ) e validar antes de emitir. Alternativamente, interceptar o erro específico e exibir mensagem clara ao usuário.

---

### M10 — cTribNac fallback "010101" para todos os serviços sem código configurado

**Arquivo:** `routes.ts`  
**Causa:**
```typescript
cTribNac: user.ctribNac || invoice.ctribNac || "010101",
```
Se o usuário não configurou `ctribNac` e a nota não tem o código, usa "010101" (Análise e Desenvolvimento de Sistemas) para **qualquer tipo de serviço**.

**Impacto:** Uma cabeleireira emite NFS-e como "desenvolvimento de sistemas". Tecnicamente aceita pelo SEFAZ mas fiscalmente incorreta.

**Solução:** Bloquear emissão se não houver `ctribNac` válido, ou usar o código determinado pelo chat AI (que já está sendo descartado — ver C3).

---

### M11 — Email do tomador não validado antes de inserir no XML

**Arquivo:** `nfse-api.ts`  
**Causa:** O email é escapado com `escapeXml` mas não validado quanto ao formato. Um email como `"sem-email"` ou `""` pode gerar erro no schema.

**Solução:**
```typescript
const emailTomador = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dps.tomador.email || '')
  ? `<email>${escapeXml(dps.tomador.email!)}</email>` : '';
```

---

### M12 — Sem retry/backoff para erros transitórios do SEFAZ

**Arquivo:** `nfse-api.ts`  
**Causa:** Se o SEFAZ retornar 503 (manutenção programada), a emissão falha permanentemente sem nenhuma tentativa de retry.

**Solução:** Implementar retry com backoff exponencial para erros 5xx:
```typescript
for (let attempt = 1; attempt <= 3; attempt++) {
  const response = await sendToNFSeAPI(...);
  if (response.statusCode < 500) break;
  if (attempt < 3) await new Promise(r => setTimeout(r, 2000 * attempt));
}
```

---

### M13 — Concorrência: dois requests simultâneos podem gerar mesmo nDPS

**Arquivo:** `nfse-api.ts` e `routes.ts`  
**Causa:** Em ambientes com múltiplos workers (PM2 cluster, Railway multi-instance), dois processos podem gerar o mesmo timestamp no mesmo segundo.

**Impacto:** Rejeição por DPS duplicado. Risco aumenta com a solução C1 se não usar transação atômica.

**Solução:** A solução de sequência atômica do banco (C1) resolve isso se usar `UPDATE ... RETURNING` em transação.

---

### M14 — Senha do certificado pode aparecer em logs de erro

**Arquivo:** `routes.ts`  
**Causa:** Em blocos de erro, a variável `certPassword` (após decrypt) pode ser incluída em stack traces ou logs do servidor se a serialização de erro não for controlada.

**Solução:** Garantir que `certPassword` nunca seja serializado em logs.

---

### M15 — Sem verificação de prazo máximo para cancelamento

**Arquivo:** `nfse-api.ts` — função `cancelarNFSe`  
**Causa:** O SEFAZ permite cancelamento apenas dentro de um prazo (geralmente 30 dias após a emissão, variando por município). O código não verifica a data de emissão antes de tentar cancelar.

**Solução:**
```typescript
const emittedAt = new Date(invoice.issuedAt!);
const daysSinceEmission = (Date.now() - emittedAt.getTime()) / (1000 * 60 * 60 * 24);
if (daysSinceEmission > 30) {
  return { success: false, error: 'Prazo de cancelamento de 30 dias expirado' };
}
```

---

### M16 — Falta campo `fone` e `email` do prestador no XML

**Arquivo:** `nfse-api.ts`  
**Causa:** O XML gerado não inclui `<fone>` e `<email>` do prestador dentro do bloco `<prest>`. O worker paralelo (`builders.ts`) inclui esses campos. Dependendo do município, podem ser obrigatórios.

**Solução:**
```typescript
${user.telefone ? `<fone>${user.telefone.replace(/\D/g, '').substring(0, 11)}</fone>` : ''}
${user.email ? `<email>${escapeXml(user.email)}</email>` : ''}
```

---

### M17 — Endpoint /api/tax-codes/seed sem autenticação

**Arquivo:** `routes.ts`  
**Causa:**
```typescript
app.post("/api/tax-codes/seed", async (req: Request, res: Response) => {
```
Qualquer pessoa pode chamar esse endpoint e reimportar/sobrescrever os códigos tributários.

**Solução:** Adicionar `requireAuth` e verificar se é admin, ou remover o endpoint de produção.

---

## 🟢 PROBLEMAS BAIXOS

---

### B1 — serie hardcodada como "00001"

**Causa:** Se o prestador usar dois sistemas de emissão diferentes, pode haver conflito de série+nDPS.  
**Solução:** Tornar série configurável por usuário ou usar série baseada no sistema (ex: "MAN01").

---

### B2 — verAplic inconsistente entre nfse-api.ts e nfse-worker/builders.ts

**Causa:** `nfse-api.ts` usa `"MANDAANOTA-1.0"`, o worker usa `"GOSPIA-1.0"`. O worker parece ser de outro projeto. Confirmar qual é o sistema correto e unificar.

---

### B3 — Sem logging estruturado para auditoria fiscal

**Causa:** Logs são `console.log/error` sem estrutura. Para auditoria fiscal, é necessário rastrear: qual CNPJ emitiu, para quem, qual valor, qual timestamp, qual resposta da SEFAZ.

**Solução:** Implementar logging estruturado (JSON) com esses campos.

---

### B4 — Nota fica em "processing" permanentemente se o processo falhar

**Causa:** A nota é criada com `status: "processing"` antes de chamar o SEFAZ. Se o processo crashar nesse intervalo, a nota fica presa em "processing" para sempre.

**Solução:** Adicionar job de reconciliação ou timeout automático para notas em "processing" há mais de X minutos.

---

### B5 — Sem validação do cTribNac contra tabela válida

**Causa:** Qualquer string pode ser enviada como `cTribNac`. Um código inexistente é rejeitado com `E0501`.

**Solução:** Validar contra a tabela `nfse_tax_codes` antes de emitir.

---

### B6 — nfse-worker/builders.ts tem email hardcodado

**Causa:** O arquivo `/nfse-worker/src/nfse/builders.ts` linha contém:
```typescript
<email>helber@gospia.app</email>
```
Email pessoal hardcodado no código de produção.

**Solução:** Usar dados do prestador do banco de dados.

---

### B7 — Falta de validação de CNPJ de tomador inativo/suspenso

**Causa:** O SEFAZ pode rejeitar notas para tomadores com CNPJ na situação INAPTA, BAIXADA ou SUSPENSA. O sistema não verifica a situação cadastral do tomador antes de emitir.

**Solução:** Verificar o campo `situacao` retornado pela ReceitaWS antes de prosseguir com a emissão.

---

### B8 — Valor do serviço sem validação de mínimo

**Causa:** Valor 0 ou negativo passa pela validação e pode ser enviado ao SEFAZ.

**Solução:**
```typescript
if (dps.servico.valor <= 0) {
  throw new Error('Valor do serviço deve ser maior que zero');
}
```

---

### B9 — cLocEmi e cLocPrestacao sempre iguais

**Causa:** O código usa o mesmo `codigoIbge` para ambos os campos. Em prestação de serviços em município diferente do domicílio do prestador, `cLocPrestacao` deve ser o município onde o serviço foi prestado.

**Solução:** Adicionar campo `municipioPrestacao` distinto de `municipioDomicilio` no formulário.

---

### B10 — Emissão automática sem double-check dos dados confirmados

**Causa:** Quando o usuário digita "sim", o sistema recarrega os dados do chat anterior e emite **sem mostrar novamente os dados ao usuário**. Se o usuário demorar a confirmar e uma mensagem interveio no meio, pode emitir com dados errados.

**Solução:** Limpar o `pendingInvoiceData` após um timeout (ex: 10 minutos de inatividade) e exigir nova confirmação.

---

## Priorização de Correções

### 🚨 Sprint Imediato (semana 1)

| # | Problema | Esforço | Impacto |
|---|----------|---------|---------|
| C3 | cNBS nunca passado nas emissões | 2h | Todos os usuários emitindo com código errado |
| C4 | Cancelamento com assinatura quebrada | 1h | Cancelamento 100% inoperante |
| C1 | nDPS por timestamp — duplicidade | 4h | Rejeições em produção |
| C11 | SESSION_SECRET com valor padrão | 30min | Segurança crítica |
| C7 | Sem timeout na API SEFAZ | 1h | Travamentos em produção |
| C8 | JSON.parse sem try/catch | 1h | Crashes em cancelamento/consulta |

### ⚠️ Sprint Próxima (semana 2)

| # | Problema | Esforço | Impacto |
|---|----------|---------|---------|
| C2 | cNBS padrão errado | 3h | Incorreção fiscal |
| C5 | Certificado errado extraído do PFX | 3h | Falhas intermitentes com algumas CAs |
| C9 | regEspTrib com string não-numérica | 1h | Rejeição por XSD |
| C6 | dhEmi muito no passado | 1h | Rejeição por janela temporal |
| M1 | codigoMunicipio fallback SP | 2h | Notas com município errado |
| M2 | CNPJ/CPF sem validação de dígitos | 2h | Rejeições evitáveis |
| M3 | dhEvento cancelamento em UTC | 30min | Inconsistência timezone |

### 📋 Backlog

- M4 a M17: Validações e melhorias diversas
- B1 a B10: Melhorias de qualidade e observabilidade

---

## Código de Correção Prioritária

### Fix C3 + C2: cNBS correto nas emissões

```typescript
// Adicionar em nfse-api.ts — mapa NBS por cTribNac
export const CTRIBNAC_TO_NBS: Record<string, string> = {
  '010101': '120011000', '010201': '120011000', '010301': '120013000',
  '010401': '120011000', '010501': '120011100', '010601': '120012000',
  '010701': '120012000', '010801': '120011000', '010901': '120014000',
  '020101': '120021000',
  '040101': '109011000', '040201': '109011000', '040301': '109011000',
  '040601': '109011000', '040801': '109011000', '041001': '109011000',
  '041201': '109011000', '041601': '109011000',
  '060101': '109031000', '060201': '109031000', '060301': '109031000', '060401': '109031000',
  '070101': '113011000', '070201': '113021000', '070501': '113021000',
  '071001': '113021000', '071101': '113021000', '071301': '113021000',
  '080101': '108011000', '080201': '108011000',
  '090101': '111011000', '090201': '111011000',
  '100501': '112011000', '100801': '112011000',
  '120701': '105011000', '120801': '105011000', '121301': '105021000',
  '130201': '105021000', '130301': '105021000', '130501': '105021000',
  '140101': '115011000', '140201': '115011000', '140601': '115011000',
  '140901': '115011000', '141201': '115011000',
  '170101': '112012000', '170201': '112012000', '170401': '112012000',
  '170601': '112013000', '170901': '112012000', '171401': '117011000',
  '171601': '117021000', '171901': '117031000', '172401': '112012000',
  '230101': '112013000',
  '350101': '112014000',
};

// Em generateDPSXml, substituir:
const cNBS = dps.servico.cNBS
  || CTRIBNAC_TO_NBS[dps.servico.cTribNac]
  || '120012000'; // fallback genérico: assessoria empresarial
```

### Fix C4: Id no XML de cancelamento

```typescript
// cancelarNFSe — substituir o XML:
const cancelId = `EVT${cleanCnpj}${Date.now()}`;
const eventoXml = `<?xml version="1.0" encoding="UTF-8"?>
<pedEvento xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">
  <infPedEvento Id="${cancelId}">
    <tpEvento>e101101</tpEvento>
    <chNFSe>${chaveAcesso}</chNFSe>
    <nSeqEvento>1</nSeqEvento>
    <dhEvento>${formatBRT(await getAccurateTime())}</dhEvento>
    <e101101>
      <xMotivo>${motivo.substring(0, 255)}</xMotivo>
    </e101101>
  </infPedEvento>
</pedEvento>`;

const signedXml = signXml(eventoXml, certData, cancelId); // usar cancelId, não "infPedEvento"
```

### Fix C1: nDPS sequencial em banco

```sql
-- Migração
ALTER TABLE nfse_users ADD COLUMN IF NOT EXISTS nfse_sequence INTEGER DEFAULT 0;
```

```typescript
// routes.ts — antes de chamar emitirNFSe:
const seqResult = await pool.query(
  `UPDATE nfse_users SET nfse_sequence = nfse_sequence + 1
   WHERE id = $1 RETURNING nfse_sequence`,
  [userId]
);
const nDPSSequence = String(seqResult.rows[0].nfse_sequence);

// Passar no dpsData:
dpsData.servico.nDPSOverride = nDPSSequence; // novo campo opcional
```

```typescript
// nfse-api.ts — generateDPSXml, substituir:
const nDPSNum = dps.servico.nDPSOverride
  || Math.floor(Date.now() / 1000).toString(); // fallback temporário
```

### Fix C11: SESSION_SECRET obrigatória

```typescript
// routes.ts — início do arquivo:
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === 'default-secret-key') {
  throw new Error('FATAL: Configure SESSION_SECRET no .env com valor forte e único!');
}
```

### Fix C7 + C8: Timeout e JSON.parse seguro

```typescript
// nfse-api.ts — sendToNFSeAPI:
const options: https.RequestOptions = {
  // ...
  timeout: 30000,
};
req.on('timeout', () => {
  req.destroy();
  reject(new Error('Timeout (30s) na comunicação com o SEFAZ. Tente novamente.'));
});

// consultarNFSe e cancelarNFSe — substituir parse direto:
let errorData: any = {};
try { errorData = JSON.parse(response.body); } catch (e) {
  return { success: false, error: 'Resposta inesperada do SEFAZ (não-JSON)', errorCode: String(response.statusCode) };
}
```

---

## Checklist de Validação Pré-Emissão (recomendado implementar)

```typescript
export function validateDPSBeforeEmit(dps: DPSData, user: User): string[] {
  const errors: string[] = [];

  // CNPJ/CPF do tomador
  const doc = dps.tomador.documento.replace(/\D/g, '');
  if (doc.length === 14 && !validateCnpjDigits(doc)) errors.push('CNPJ do tomador inválido');
  if (doc.length === 11 && !validateCpfDigits(doc)) errors.push('CPF do tomador inválido');
  if (doc.length !== 11 && doc.length !== 14) errors.push('Documento do tomador deve ter 11 (CPF) ou 14 (CNPJ) dígitos');

  // Nome do tomador
  if (!dps.tomador.nome || dps.tomador.nome.trim().length < 3) errors.push('Nome do tomador obrigatório');

  // Valor
  if (!dps.servico.valor || dps.servico.valor <= 0) errors.push('Valor do serviço deve ser maior que zero');

  // Descrição
  const desc = dps.servico.descricao?.trim() || '';
  if (desc.length < 5) errors.push('Descrição muito curta (mín 5 chars)');
  if (desc.length > 2000) errors.push('Descrição muito longa (máx 2000 chars)');

  // Código tributário
  if (!dps.servico.cTribNac) errors.push('Código de tributação nacional obrigatório');

  // Município
  if (!dps.municipio.codigoIbge || dps.municipio.codigoIbge === '3550308') {
    errors.push('Verifique o código IBGE do município — está usando São Paulo como padrão');
  }

  // Certificado (se A1)
  if (user.certificateType === 'a1' && user.certificateExpiresAt) {
    const daysUntilExpiry = (new Date(user.certificateExpiresAt).getTime() - Date.now()) / 86400000;
    if (daysUntilExpiry <= 0) errors.push('Certificado digital expirado');
    if (daysUntilExpiry <= 7) errors.push(`Certificado expira em ${Math.ceil(daysUntilExpiry)} dias`);
  }

  return errors;
}
```

---

*Relatório gerado em 2026-03-05 por auditoria automatizada do sistema Manda a Nota*
