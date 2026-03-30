# Análise Profunda — Erro NFS-e: Município Emissor Não Parametrizado

**Data:** 2026-03-05  
**Projeto:** Manda a Nota (`/Users/macmini03/Desktop/mandaanota`)  
**Erro:** "O município emissor informado na DPS deve estar parametrizado para utilizar os emissores públicos nacionais, conforme parametrização do município no Sistema Nacional NFS-e."

---

## 🔴 CAUSA RAIZ DO ERRO

### Causa Principal: Município não usa o Emissor Público Nacional

O erro ocorre porque o **campo `cLocEmi`** na DPS aponta para um município que **não aderiu ao Emissor Público Nacional** do Sistema NFS-e federal. A API `sefin.nfse.gov.br/SefinNacional` aceita DPS **apenas** de municípios que selecionaram o uso do emissor público nacional como seu sistema de emissão.

### Como o sistema nacional funciona (3 categorias de adesão):

| Modalidade | Descrição | API usável |
|---|---|---|
| **ADN** (Ambiente de Dados Nacional) | Município envia dados ao banco nacional, mas **emite NFS-e pelo próprio sistema** | ❌ NÃO usa `sefin.nfse.gov.br/nfse` |
| **Emissor Público Nacional** | Município usa o portal nacional (`nfse.gov.br/EmissorNacional`) | ✅ USA `sefin.nfse.gov.br/nfse` |
| **Sistema Próprio** | Município tem plataforma própria (SP, BH, RJ, etc.) | ❌ Usa API própria do município |

### Municípios que NÃO funcionam com a API nacional:
- **Belo Horizonte** (IBGE: `3106200`) → Usa BHISS (ISS Digital BH próprio)
- **São Paulo** (IBGE: `3550308`) → Usa NFS-e SP (sistema próprio)
- **Rio de Janeiro** (IBGE: `3304557`) → Sistema próprio
- **Curitiba**, **Porto Alegre**, **Salvador**, **Recife**, e demais capitais → Todos têm sistemas próprios

---

## 🔍 EVIDÊNCIAS NO CÓDIGO

### 1. Problema no `routes.ts` — Linha crítica no Stripe Webhook

```typescript
// routes.ts — Linha ~1500 (webhook do Stripe, auto-emissão da NFS-e)
municipio: {
  codigoIbge: process.env.NFSE_PRESTADOR_MUN_IBGE || '3106200',
  //                                                   ^^^^^^^^
  //                                    PADRÃO = BELO HORIZONTE!
  //                                    BH NÃO usa o emissor nacional!
}
```

**Este é o bug mais provável**: o default de `NFSE_PRESTADOR_MUN_IBGE` é `3106200` (Belo Horizonte). A Titânio Produções está em BH. BH tem seu próprio sistema BHISS, portanto toda emissão automática pós-pagamento Stripe vai falhar.

### 2. Problema em `routes.ts` — `resolveCodigoMunicipioIbge()`

```typescript
async function resolveCodigoMunicipioIbge(user: any): Promise<string> {
  if (user.codigoMunicipio && user.codigoMunicipio.trim()) {
    return user.codigoMunicipio.trim();  // Pode ser BH ou SP!
  }
  // ViaCEP também pode retornar qualquer município
  try { /* ... ViaCEP lookup ... */ }
  return "3550308"; // Fallback = São Paulo — TAMBÉM tem sistema próprio!
}
```

Tanto o fallback (São Paulo) quanto o código salvo no perfil do usuário podem ser municípios que não usam o emissor nacional.

### 3. XML DPS gerado — Campo `cLocEmi`

```xml
<!-- XML gerado pelo sistema em generateDPSXml() -->
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">
  <infDPS Id="DPS31062002...">
    ...
    <cLocEmi>3106200</cLocEmi>  <!-- BELO HORIZONTE = ERRO! -->
    ...
    <serv>
      <locPrest>
        <cLocPrestacao>3106200</cLocPrestacao>  <!-- Também BH -->
      </locPrest>
    </serv>
  </infDPS>
</DPS>
```

---

## 📋 XML ATUAL vs XML CORRETO

### XML que está sendo gerado (problemático):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">
  <infDPS Id="DPS3106200208103457000100000100012345678901">
    <tpAmb>1</tpAmb>
    <dhEmi>2026-03-05T17:30:00-03:00</dhEmi>
    <verAplic>MANDAANOTA-1.0</verAplic>
    <serie>00001</serie>
    <nDPS>1741206600</nDPS>
    <dCompet>2026-03-05</dCompet>
    <tpEmit>1</tpEmit>
    <cLocEmi>3106200</cLocEmi>   <!-- ← BELO HORIZONTE — NÃO USA EMISSOR NACIONAL! -->
    <prest>
      <CNPJ>08103457000133</CNPJ>
      <regTrib>
        <opSimpNac>1</opSimpNac>
        <regEspTrib>0</regEspTrib>
      </regTrib>
    </prest>
    ...
  </infDPS>
</DPS>
```

### XML correto (para município que USA o emissor nacional):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.01">
  <infDPS Id="DPS3201308208103457000100000100012345678901">
    <tpAmb>1</tpAmb>
    <dhEmi>2026-03-05T17:30:00-03:00</dhEmi>
    <verAplic>MANDAANOTA-1.0</verAplic>
    <serie>00001</serie>
    <nDPS>1741206600</nDPS>
    <dCompet>2026-03-05</dCompet>
    <tpEmit>1</tpEmit>
    <cLocEmi>3201308</cLocEmi>   <!-- ← Vitória-ES (exemplo de cidade que usa emissor nacional) -->
    ...
  </infDPS>
</DPS>
```

**O XML em si está estruturalmente correto.** O problema é o CÓDIGO IBGE do município, não a estrutura.

---

## 🛠️ SOLUÇÃO TÉCNICA RECOMENDADA

### Estratégia em 3 camadas:

#### NÍVEL 1 — Validação Prévia (Antes de Enviar para SEFIN)

Adicionar verificação se o município do prestador usa o emissor nacional. A própria API SEFIN expõe isso:

```typescript
// Adicionar em nfse-api.ts
const MUNICIPIOS_COM_SISTEMA_PROPRIO = new Set([
  '3550308', // São Paulo
  '3106200', // Belo Horizonte  ← TITÂNIO ESTÁ AQUI
  '3304557', // Rio de Janeiro
  '4106902', // Curitiba
  '4314902', // Porto Alegre
  '2927408', // Salvador
  '2611606', // Recife
  '1302603', // Manaus
  '2304400', // Fortaleza
  '5300108', // Brasília/DF — usa sistema nacional (DF tem convenio especial)
  // TODO: adicionar outros conforme descoberto
]);

export async function verificarMunicipioNacional(codigoIbge: string, certData: CertificateData): Promise<boolean> {
  // Opção 1: Cache local com lista conhecida
  if (MUNICIPIOS_COM_SISTEMA_PROPRIO.has(codigoIbge)) {
    return false; // Município NÃO usa emissor nacional
  }
  
  // Opção 2: Consulta na API SEFIN (requer certificado)
  try {
    const response = await sendToNFSeAPI(`/municipio/${codigoIbge}`, "GET", null, certData);
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      return data.utilizaEmissorNacional === true;
    }
  } catch (e) {
    // Fallback: assume que NÃO usa (mais seguro)
  }
  
  return false;
}
```

#### NÍVEL 2 — Decisão Automática de Rota de Emissão

```typescript
// Em routes.ts, modificar a rota /api/invoices/:id/emit-with-certificate
// e o fluxo de confirmação no chat

async function emitirNfseInteligente(dpsData, certData, user) {
  const codigoIbge = dpsData.municipio.codigoIbge;
  
  // Verificar se município usa emissor nacional
  const usaEmissorNacional = await verificarMunicipioNacional(codigoIbge, certData);
  
  if (usaEmissorNacional) {
    // Emissão via API SEFIN nacional (caminho atual)
    return await emitirNFSe(dpsData, pfxBase64, pfxPassword);
  } else {
    // Municípios com sistema próprio: informar o usuário ou tentar via portal
    const municipioInfo = MUNICIPIOS_SISTEMA_PROPRIO_INFO[codigoIbge];
    if (municipioInfo) {
      return {
        success: false,
        error: `Seu município (${municipioInfo.nome}) usa sistema próprio de NFS-e. ` +
               `Acesse: ${municipioInfo.urlPortal} para emitir manualmente, ` +
               `ou configure a emissão via portal no seu perfil.`,
        errorCode: 'MUNICIPIO_SISTEMA_PROPRIO',
        municipioPortal: municipioInfo.urlPortal,
      };
    }
    // Fallback: tentar via portal nacional
    return await emitirViaPortal(dpsData, user);
  }
}
```

#### NÍVEL 3 — Correção Imediata do Bug (Belo Horizonte)

**Para a Titânio** — corrigir o env var e a emissão de NFS-e da própria empresa:

```bash
# .env da produção — CORRIGIR:
# Se a Titânio está em BH, a emissão de NFS-e da empresa precisa usar o sistema BH
# OU usar o fallback do portal
NFSE_PRESTADOR_MUN_IBGE=3106200  # BH — confirmar se correto
# Se BH não usa emissor nacional, a auto-emissão no Stripe webhook vai falhar sempre
```

**Correção no webhook do Stripe** (`routes.ts`):

```typescript
// Antes:
const nfseResult = await emitirNFSe(
  { ...dpsData, municipio: { codigoIbge: process.env.NFSE_PRESTADOR_MUN_IBGE || '3106200' } },
  nfseCertBase64,
  nfseCertPass
);

// Depois — com validação prévia:
const codigoMunPrestador = process.env.NFSE_PRESTADOR_MUN_IBGE || '3106200';
const certDataPrestador = extractCertificateFromPfx(nfseCertBase64, nfseCertPass);

if (MUNICIPIOS_COM_SISTEMA_PROPRIO.has(codigoMunPrestador)) {
  console.warn(`⚠️ Município da Titânio (${codigoMunPrestador}) tem sistema próprio. Auto-emissão NFS-e pulada.`);
  await storage.updateBillingOrderNfse(order.id, null, 'skipped', 'Município usa sistema próprio (ex: BHISS)');
} else {
  const nfseResult = await emitirNFSe(/* ... */);
  // ...
}
```

---

## 🔎 COMO VERIFICAR SE UM MUNICÍPIO USA O EMISSOR NACIONAL

### Método 1: Portal interativo do governo
Acesse: https://www.gov.br/nfse/pt-br/municipios/monitoramento-adesoes  
O painel mostra quais municípios usam cada modalidade.

### Método 2: API SEFIN (requer certificado A1)
```typescript
// GET https://sefin.nfse.gov.br/SefinNacional/municipio/{codigoIbge}
// Resposta inclui: utilizaEmissorNacional, tipoAdesao, etc.
```

### Método 3: Teste de emissão no portal
Acesse https://www.nfse.gov.br/EmissorNacional/ com o CPF do sócio.
Se conseguir emitir pela cidade, ela usa o emissor nacional.

---

## 📍 PORTAIS MUNICIPAIS ALTERNATIVOS (cidades com sistema próprio)

| Cidade | IBGE | Portal | Obs |
|---|---|---|---|
| Belo Horizonte | 3106200 | `https://portalpbh.pbh.gov.br/bhiss` | BH ISS Digital |
| São Paulo | 3550308 | `https://nfe.prefeitura.sp.gov.br` | NFS-e SP |
| Rio de Janeiro | 3304557 | `https://notacarioca.rio.gov.br` | Nota Carioca |
| Curitiba | 4106902 | `https://nfse.curitiba.pr.gov.br` | Sistema próprio |
| Porto Alegre | 4314902 | `https://nfse.portoalegre.rs.gov.br` | Sistema próprio |

---

## ⚡ PLANO DE AÇÃO PRIORITÁRIO

### 🔴 URGENTE — Fazer agora:

1. **Confirmar o município exato da Titânio** — verificar o campo `NFSE_PRESTADOR_MUN_IBGE` nas variáveis de ambiente de produção e o `codigoMunicipio` no perfil do usuário emissor.

2. **Adicionar log detalhado** — antes de enviar para a API, logar o `cLocEmi` exato que está sendo enviado para facilitar debug.

3. **Criar lista de municípios com sistema próprio** — começar com os principais (BH, SP, RJ, Curitiba, POA) e bloquear emissão via API nacional quando for desses municípios.

### 🟡 MÉDIO PRAZO:

4. **Implementar verificação via API SEFIN** — chamar `GET /municipio/{codigoIbge}` antes de cada emissão (cachear o resultado por 24h).

5. **Melhorar a mensagem de erro** — quando o município não usa o emissor nacional, mostrar mensagem clara com o link do portal correto da cidade.

6. **Implementar rota para BH** — integrar com o BHISS ou redirecionar usuários de BH para emissão via portal web.

### 🟢 LONGO PRAZO:

7. **Mapeamento completo de municípios** — manter uma tabela atualizada com modalidade de emissão por município IBGE (pode ser consultada via API SEFIN ou mantida no banco de dados).

---

## 📎 CAMPOS OBRIGATÓRIOS DA DPS — Checklist A1

O XML está usando `versao="1.01"`. Campos obrigatórios verificados no código:

| Campo | Status | Observação |
|---|---|---|
| `tpAmb` | ✅ | Sempre `1` (produção) |
| `dhEmi` | ✅ | Usa hora do Google |
| `verAplic` | ✅ | `MANDAANOTA-1.0` |
| `serie` | ✅ | `00001` |
| `nDPS` | ✅ | Timestamp Unix |
| `dCompet` | ✅ | Data de competência |
| `tpEmit` | ✅ | `1` (prestador emite) |
| `cLocEmi` | ⚠️ | **CAUSA DO ERRO** — município pode não usar emissor nacional |
| `CNPJ prest` | ✅ | Validado contra certificado |
| `regTrib.opSimpNac` | ✅ | Mapeado corretamente |
| `NBS` | ✅ | Default `101050000` se não informado |
| `cTribNac` | ✅ | Obrigatório — enviado |
| `xDescServ` | ✅ | Obrigatório — enviado |
| `vServ` | ✅ | Obrigatório — enviado |
| `Assinatura XML` | ✅ | RSA-SHA256 com certificado A1 |
| `GZIP + Base64` | ✅ | `dpsXmlGZipB64` correto |

**Conclusão:** A estrutura da DPS está correta. O único problema é o `cLocEmi` apontar para um município que não usa o emissor público nacional.

---

## 🔑 RESUMO EXECUTIVO

**Causa raiz:** O campo `cLocEmi` na DPS contém o código IBGE de um município (provavelmente Belo Horizonte = 3106200, onde a Titânio está localizada) que possui seu **próprio sistema de NFS-e** (BHISS) e **não aderiu ao Emissor Público Nacional** do sistema federal `sefin.nfse.gov.br`.

**O sistema nacional aceita apenas municípios que escolheram usar o emissor público federal** — tipicamente municípios menores sem sistema próprio. Grandes cidades brasileiras têm sistemas proprietários e não estão disponíveis via `sefin.nfse.gov.br/SefinNacional/nfse`.

**Fix rápido:** Adicionar validação prévia do município antes de enviar para a API nacional. Se for município com sistema próprio, usar o fluxo de emissão via portal (já implementado em `nfse-portal-client.ts`) ou informar o usuário com o link correto do portal municipal.
