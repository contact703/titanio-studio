# Pesquisa: Sistema Nacional NFS-e — Legislação, Municípios e Diagnóstico Técnico

> **Data da pesquisa:** 05/03/2026  
> **Pesquisador:** Kratos (subagente de pesquisa fiscal)  
> **Contexto:** Análise do erro "O município emissor informado na DPS deve estar parametrizado para utilizar os emissores públicos nacionais, conforme parametrização do município no Sistema Nacional NFS-e."

---

## 1. RESUMO EXECUTIVO

O Sistema Nacional NFS-e é a plataforma unificada criada pela Receita Federal e gerida pelo Comitê Gestor NFS-e (CGNFS-e) para padronizar a emissão de Nota Fiscal de Serviços Eletrônica em todo o Brasil. **Belo Horizonte (IBGE 3106200) aderiu ao sistema nacional em 2025**, com migração em lotes entre outubro de 2025 e janeiro de 2026, mas **MANTÉM o sistema legado BHISS-Digital para emissões anteriores**. O erro analisado indica que o município tentado na DPS **não está parametrizado para aceitar emissores públicos nacionais** no painel administrativo municipal da plataforma nacional.

---

## 2. LEGISLAÇÃO APLICÁVEL

### 2.1 Base Legal Principal

| Norma | Conteúdo |
|---|---|
| **Lei Complementar 116/2003** | Base do ISS: define competência tributária dos municípios, define lista de serviços tributáveis, estabelece o local de incidência |
| **Lei Complementar 123/2006** | Institui o Simples Nacional; cria o CGSN (Comitê Gestor do Simples Nacional) |
| **Resolução CGSN nº 140/2018** | Regulamenta o Simples Nacional, incluindo obrigações assessórias (DAS-MEI, NFS-e para MEIs) |
| **Lei Complementar 157/2016** | Altera a LC 116/2003; impõe ao Município obrigação de disponibilizar NFS-e e transferência de informações ao SPED |
| **Lei Complementar 175/2020** | Altera regras do ISS para serviços prestados a tomadores de outro município; impõe migração ao padrão nacional |
| **Lei Complementar 214/2025** | **Principal impulsionadora da migração em 2025/2026:** regula IBS/CBS (reforma tributária); exige integração obrigatória de todos os municípios ao Sistema Nacional NFS-e até 01/01/2026 |
| **Resolução CGNFS-e nº 001/2021** | Institui o Comitê Gestor da NFS-e (CGNFS-e) como órgão deliberativo do sistema nacional |
| **Portaria RFB nº 2.535/2022** | Regulamenta o Ambiente de Dados Nacional (ADN) e as APIs do sistema nacional |

### 2.2 Normas Técnicas (Notas Técnicas do CGNFS-e)

| Nota Técnica | Data | Conteúdo |
|---|---|---|
| NT SE/CGNFS-e nº 001 | 2022 | Layout inicial da DPS v1.0 |
| NT SE/CGNFS-e nº 004 V2 | 10/12/2025 | **Desobriga campos "IBSCBS" até jan/2026; piloto de testes IBS/CBS** |
| NT SE/CGNFS-e nº 007 | 07/02/2026 | **Novos campos IBS/CBS, atualização ANEXO VII, regras PIS/COFINS** |

### 2.3 Papel do ABRASF

A ABRASF (Associação Brasileira das Secretarias de Finanças das Capitais) historicamente padronizou os webservices de NFS-e municipais (padrão ABRASF SOAP). Com a criação do sistema nacional via Receita Federal/CGNFS-e, o padrão ABRASF passou a coexistir com o nacional — municípios que tinham sistemas próprios ABRASF agora devem migrar ou convivem em transição.

---

## 3. ARQUITETURA DO SISTEMA NACIONAL NFS-e

### 3.1 Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│              SISTEMA NACIONAL NFS-e (Receita Federal)           │
├─────────────────┬───────────────────┬───────────────────────────┤
│     ADN         │      CNC          │       SEFIN NACIONAL      │
│ (Ambiente de    │ (Cadastro         │  (API de emissão de       │
│  Dados Nac.)    │  Nacional         │   NFS-e via DPS)          │
│                 │  Contribuintes)   │                           │
├─────────────────┴───────────────────┴───────────────────────────┤
│     PARÂMETROS MUNICIPAIS (configuração por município)          │
└─────────────────────────────────────────────────────────────────┘
         │                    │
   Emissores Públicos    Emissores Privados
   Nacionais:           (via API SEFIN):
   - Emissor WEB        - Software de gestão
   - App NFS-e Mobile   - ERPs (SAP, TOTVS)
   - App Cidadão        - Sistemas próprios
```

### 3.2 Modalidades de Uso pelos Municípios

**Modalidade A: Emissor Público Nacional**
- Município habilita os emissores WEB e Mobile do governo federal
- Contribuintes usam https://www.nfse.gov.br/EmissorNacional/
- Requer parametrização: campo `emissoresPublicosNacionais = true`

**Modalidade B: Emissor Próprio Municipal (via API)**
- Município mantém seu próprio emissor WEB/App
- API integrada ao ADN para envio dos dados nacionais
- Município pode NÃO habilitar emissores públicos nacionais

**Modalidade C: Sistema Próprio (padrão legado ABRASF)**
- Município ainda não migrou ao padrão nacional
- Opera com webservices SOAP próprios
- **NÃO pode receber DPS no padrão nacional**

---

## 4. DIAGNÓSTICO DO ERRO

### 4.1 Mensagem de Erro Analisada

```
"O município emissor informado na DPS deve estar parametrizado para 
utilizar os emissores públicos nacionais, conforme parametrização 
do município no Sistema Nacional NFS-e."
```

### 4.2 Causa Raiz

O erro é gerado pelo **SEFIN Nacional** quando a API recebe uma DPS e:

1. O código IBGE do município prestador (`<cMunFG>` / município emissor) está presente no sistema nacional (ADN), **MAS**
2. O campo de parametrização municipal **"aceita emissores públicos nacionais"** está configurado como `false` ou ausente

### 4.3 Onde Ocorre na Validação

```
DPS enviada à API SEFIN Nacional
    ↓
Validação campos obrigatórios (OK)
    ↓
Lookup IBGE do município no ADN
    ↓
Verificação parâmetro: "emissoresPublicosNacionais"
    ↓
SE false → ERRO: "O município emissor informado na DPS deve estar 
                   parametrizado para utilizar os emissores públicos nacionais"
```

### 4.4 Cenários que Causam o Erro

| Cenário | Causa |
|---|---|
| Município usa **sistema próprio** (ex: São Paulo via ISS-SP) | Não habilitou emissores nacionais; usa API própria |
| Município **migrou ao nacional mas não liberou emissores públicos** | Configuração do Painel Municipal incompleta |
| **Tentativa de emitir NFS-e para data anterior à migração** | Período pré-migração não coberto pelo sistema nacional |
| **IBGE errado na DPS** | Código de município incorreto enviado no campo `<cMunFG>` |

---

## 5. STATUS DE BELO HORIZONTE (IBGE 3106200)

### 5.1 ✅ BH ADERIU AO SISTEMA NACIONAL

**Confirmado pela Prefeitura de BH (BHISS/SMFA, atualizado 25/02/2026):**

> "SMFA divulga parâmetros necessários para a emissão de NFS-e Nacional cujo ISSQN é devido a Belo Horizonte"

BH migrou em **lotes (ondas) entre outubro de 2025 e janeiro de 2026**:

| Onda | Data | Contribuintes |
|---|---|---|
| 1ª onda | **01/10/2025** | Primeiros contribuintes migrados |
| 2ª onda | **01/11/2025** | Segunda leva |
| 3ª onda | **01/12/2025** | Terceira leva |
| 4ª onda | **01/01/2026** | Últimos contribuintes / novos cadastros |

### 5.2 Situação Atual: Dois Sistemas Coexistem

| Sistema | URL | Status | Uso |
|---|---|---|---|
| **NFS-e Nacional (BH)** | https://www.nfse.gov.br/EmissorNacional/ | ✅ ATIVO | Novas emissões a partir da data de migração |
| **BHISS-Digital (legado)** | https://bhissdigital.pbh.gov.br/nfse/ | ✅ ATIVO | Consultas e emissões legadas; sistema BHISS |

### 5.3 Campos Específicos de BH na DPS

A SMFA publicou parametrização técnica específica para BH:

#### Regime Especial de Tributação (`<regEspTrib>`)
| Valor | Regime | Observação |
|---|---|---|
| `0` | Nenhum | Padrão para a maioria |
| `1` | Ato Cooperado | Exclusivo para cooperativas |
| `2` | Estimativa | Estimativa municipal |
| `4` | Notário ou Registrador | Titulares de cartórios |
| `5` | Profissional Autônomo | Autônomos dispensados de NFS-e |
| `6` | Sociedade de Profissionais | SPL (Sociedades de Profissionais Liberais) |
| `9` | Outros | Beneficiários do PROEMP |

#### Benefício Municipal (`<nBM>`)
| Ambiente | ID do Benefício BH | Uso |
|---|---|---|
| Produção Restrita | `31062000200004` | Testes/homologação |
| Produção | `31062000200002` | Produção real |

#### Código de Tributação Municipal (`<cTribMun>`)
- **Obrigatório para BH**: 3 dígitos (desdobramento local do código LC 116)
- Além do `<cTribNac>` (6 dígitos), BH exige o `<cTribMun>` preenchido
- Consulta: serviço "ISSQN - Correlação CTISS/CNAE e Tabela de Alíquotas"

#### Inscrição Municipal (`<IM>`)
- Campo numérico no layout nacional
- Se IM tem dígito verificador "X" → substituir por "0" na API
- Contribuintes migrados em 01/12/2025 ou após → emitir **SEM IM**

### 5.4 O Erro no Contexto de BH

Se o erro está ocorrendo para BH, os cenários possíveis são:

1. **A NFS-e está sendo emitida para data anterior à migração do contribuinte** (antes da onda de que o contribuinte faz parte)
2. **O contribuinte específico ainda não foi migrado** ao sistema nacional (estava em onda posterior)
3. **BH não habilitou o parâmetro "emissores públicos nacionais"** em algum momento — mas dado que a SMFA publica orientações para uso do emissor nacional, isso é improvável em produção
4. **Bug no sistema emissor**: usando código IBGE incorreto ou formato errado

---

## 6. MUNICÍPIOS: SISTEMA PRÓPRIO vs. SISTEMA NACIONAL

### 6.1 Situação por Categoria

#### ✅ Municípios que ADERIRAM ao Sistema Nacional (exemplos confirmados)

| Município | UF | IBGE | Sistema | Observação |
|---|---|---|---|---|
| Belo Horizonte | MG | 3106200 | Nacional | Migração em lotes out/2025-jan/2026 |
| Manaus | AM | 1302603 | Nacional | Migrou em jan/2026 per LC 214/2025 |
| Municípios pequenos e médios (maioria) | Vários | — | Nacional | Aderiram diretamente ao sistema nacional sem sistema próprio |

#### ⚠️ Municípios que MANTÊM Sistema Próprio (com ou sem integração ADN)

| Município | UF | IBGE | Sistema Próprio | API/Webservice | Status Migração |
|---|---|---|---|---|---|
| **São Paulo** | SP | 3550308 | ISS-SP / NF-e São Paulo | nfe.prefeitura.sp.gov.br | Ainda em transição — sistema próprio ativo |
| **Rio de Janeiro** | RJ | 3304557 | NFS-e Rio | nfse.rio.rj.gov.br | Sistema próprio ativo, integração ADN |
| **Curitiba** | PR | 4106902 | ISS Curitiba | nfse.curitiba.pr.gov.br | Sistema próprio ativo |
| **Fortaleza** | CE | 2304400 | NFS-e Fortaleza | nfse.fortaleza.ce.gov.br | Em análise |
| **Recife** | PE | 2611606 | NFS-e Recife | nfse.recife.pe.gov.br | Sistema próprio |
| **Salvador** | BA | 2927408 | NFS-e Salvador | nfse.salvador.ba.gov.br | Sistema próprio |
| **Porto Alegre** | RS | 4314902 | NFS-e POA | nfse.portoalegre.rs.gov.br | Sistema próprio |

**⚠️ ATENÇÃO:** Esta lista pode estar desatualizada. A LC 214/2025 impôs prazo de 01/01/2026 para integração. Verificar o Painel de Adesões em https://www.gov.br/nfse/pt-br.

### 6.2 Impacto da Lei Complementar 214/2025

A LC 214/2025 (Reforma Tributária) determinou que:
- **Todos os municípios DEVEM estar integrados ao sistema nacional NFS-e até 01/01/2026**
- A não adesão pode resultar em sanções
- Municípios com sistema próprio podem continuar com ele, DESDE QUE transmitam os dados ao ADN
- O parâmetro "emissores públicos nacionais" é opcional — município pode habilitar apenas a integração ADN

---

## 7. DOCUMENTAÇÃO TÉCNICA: DPS E ENDPOINTS

### 7.1 O Documento DPS (Declaração de Prestação de Serviços)

A DPS é o documento XML que origina a NFS-e no sistema nacional. Versão atual: **DPS v1.01**

#### Campos Principais da DPS

```xml
<DPS>
  <!-- IDENTIFICAÇÃO DO EMITENTE -->
  <infDPS Id="...">
    <tpAmb>1</tpAmb>              <!-- 1=Produção, 2=Homologação -->
    <dhEmi>2026-03-05T10:00:00</dhEmi>
    <verAplic>1.01</verAplic>
    
    <!-- PRESTADOR (EMISSOR) -->
    <prest>
      <CNPJ>00000000000000</CNPJ>
      <IM>123456</IM>             <!-- Inscrição Municipal (numérico em BH!) -->
    </prest>
    
    <!-- TOMADOR (DESTINATÁRIO) -->
    <toma>
      <CNPJ>00000000000000</CNPJ>
    </toma>
    
    <!-- SERVIÇO -->
    <serv>
      <locPrest>
        <cLocPrestacao>3106200</cLocPrestacao>  <!-- IBGE do município onde o serviço é prestado -->
      </locPrest>
      <cServ>
        <cTribNac>010101</cTribNac>  <!-- Código Tributação Nacional - 6 dígitos -->
        <cTribMun>001</cTribMun>     <!-- Código Tributação Municipal - 3 dígitos (OBRIGATÓRIO BH) -->
        <cNBS>1.03.01.00.00</cNBS>  <!-- Nomenclatura Brasileira de Serviços -->
      </cServ>
    </serv>
    
    <!-- VALORES -->
    <valores>
      <vServPrest>
        <vServ>1000.00</vServ>
      </vServPrest>
      <vDescCondIncond>
        <vDescIncond>0.00</vDescIncond>
      </vDescCondIncond>
    </valores>
    
    <!-- TRIBUTAÇÃO -->
    <tributos>
      <tribMun>
        <tribISSQN>
          <cLocIncid>3106200</cLocIncid>  <!-- IBGE local incidência ISSQN -->
          <cPaisResult>1058</cPaisResult>
          <tpBM>1</tpBM>
          <nBM>31062000200002</nBM>       <!-- ID Benefício Municipal BH produção -->
          <vCalcTrib>1000.00</vCalcTrib>
          <tpImunidade>0</tpImunidade>
        </tribISSQN>
      </tribMun>
      <regTrib>
        <regEspTrib>0</regEspTrib>  <!-- 0=Nenhum, 1=Coop, 2=Estim... -->
      </regTrib>
    </tributos>
    
    <!-- INFORMAÇÕES COMPLEMENTARES -->
    <xInfComp>Texto livre aqui</xInfComp>
    
  </infDPS>
</DPS>
```

### 7.2 Campo que Indica Emissores Públicos Nacionais

O campo que indica se o município **aceita emissores públicos nacionais** está na API de **PARÂMETROS MUNICIPAIS** (não é retornado na DPS em si — é uma parametrização do município no painel administrativo):

```
API: GET /parametrizacao/municipio/{cIBGE}
Resposta relevante:
{
  "cIBGE": "3106200",
  "nomeMunicipio": "Belo Horizonte",
  "emissoresPublicosNacionais": true,  ← ESTE CAMPO
  "emissorWebNacional": true,
  "appNacional": true,
  "webservicesMunicipais": false,
  ...
}
```

**Endpoint da API de Parametrização:**
- Produção: `https://adn.nfse.gov.br/parametrizacao/docs/index.html`
- Homologação: `https://adn.producaorestrita.nfse.gov.br/parametrizacao/docs/index.html`
- **⚠️ Requer certificado digital do sistema emissor credenciado**

### 7.3 Endpoints Oficiais Confirmados (gov.br, atualizado 29/12/2025)

| API | Produção | Homologação (Prod. Restrita) |
|---|---|---|
| **SEFIN Nacional** (emissão DPS) | `https://sefin.nfse.gov.br/SefinNacional/docs/index` | `https://sefin.producaorestrita.nfse.gov.br/API/SefinNacional/docs/index` |
| **CNC** (contrib. nacional) | `https://adn.nfse.gov.br/cnc/docs/index.html` | `https://adn.producaorestrita.nfse.gov.br/cnc/docs/index.html` |
| **CNC Município** | `https://adn.nfse.gov.br/cnc/municipio/docs/index.html` | `https://adn.producaorestrita.nfse.gov.br/cnc/municipio/docs/index.html` |
| **CNC Consulta** | `https://adn.nfse.gov.br/cnc/consulta/docs/index.html` | `https://adn.producaorestrita.nfse.gov.br/cnc/consulta/docs/index.html` |
| **ADN** (dados nacionais) | `https://adn.nfse.gov.br/docs/index.html` | `https://adn.producaorestrita.nfse.gov.br/docs/index.html` |
| **ADN Municípios** | `https://adn.nfse.gov.br/municipios/docs/index.html` | `https://adn.producaorestrita.nfse.gov.br/municipios/docs/index.html` |
| **ADN Contribuintes** | `https://adn.nfse.gov.br/contribuintes/docs/index.html` | `https://adn.producaorestrita.nfse.gov.br/contribuintes/docs/index.html` |
| **Parâmetros Municipais** | `https://adn.nfse.gov.br/parametrizacao/docs/index.html` | `https://adn.producaorestrita.nfse.gov.br/parametrizacao/docs/index.html` |
| **DANFSE** (impressão) | `https://adn.nfse.gov.br/danfse/docs/index.html` | `https://adn.producaorestrita.nfse.gov.br/danfse/docs/index.html` |

**⚠️ IMPORTANTE:** Todos os endpoints de produção e homologação exigem **certificado digital A1/A3** para autenticação mTLS (HTTP 496 sem certificado).

### 7.4 Autenticação

Os endpoints do sistema nacional NFS-e usam **mTLS (Mutual TLS / SSL certificado cliente)**:
- Certificado ICP-Brasil A1 ou A3
- CN do certificado deve corresponder ao CNPJ do conveniado
- Convênio deve ser formalizado com a Receita Federal via Portal NFS-e

---

## 8. COMO VERIFICAR SE UM MUNICÍPIO ESTÁ NO SISTEMA NACIONAL

### 8.1 Via Emissor Web Nacional

Acesse: https://www.nfse.gov.br/EmissorNacional/
- Tente emitir uma nota para o município
- Se o município não aparecer, ainda usa sistema próprio

### 8.2 Via API de Consulta de Municípios (CNC Municipio)

```http
GET https://adn.nfse.gov.br/cnc/municipio/api/v1/municipio/{cIBGE}
Authorization: [certificado mTLS]
```

Resposta esperada para BH:
```json
{
  "cIBGE": "3106200",
  "xMun": "Belo Horizonte",
  "cUF": "31",
  "xUF": "MG",
  "situacao": "ATIVO",
  "dtInicioVigencia": "2025-10-01"
}
```

### 8.3 Via Painel de Monitoramento de Adesões

URL: https://www.gov.br/nfse/pt-br/conteudo/monitoramento-das-adesoes-a-nfse
- Lista pública dos municípios aderentes
- Atualizado periodicamente

---

## 9. RECOMENDAÇÕES TÉCNICAS PARA O SISTEMA "MANDA A NOTA"

### 9.1 Antes de Emitir a NFS-e

**Passo 1: Verificar se o município usa sistema nacional ou próprio**

```javascript
// Lógica recomendada
async function verificarSistemaMunicipio(codigoIBGE) {
  // Consultar tabela local de municípios
  const municipio = await db.municipios.findOne({ ibge: codigoIBGE });
  
  if (!municipio.usaSistemaNacional) {
    // Redirecionar para API própria do município
    return { sistema: 'proprio', endpoint: municipio.apiEndpoint };
  }
  
  if (!municipio.aceitaEmissoresPublicos) {
    // Município no sistema nacional MAS não aceita emissores públicos
    return { sistema: 'nacional-sem-emissor-publico', endpoint: SEFIN_ENDPOINT };
  }
  
  return { sistema: 'nacional', endpoint: SEFIN_ENDPOINT };
}
```

**Passo 2: Verificar data de adesão do município**
- Se data de competência < data de migração do município → usar API legada
- Para BH: a partir de 01/10/2025 (1ª onda) via sistema nacional

### 9.2 Tratamento do Erro "emissores públicos nacionais"

```javascript
// Ao receber o erro
if (erro.codigo === 'MUNICIPIO_NAO_PARAMETRIZADO_EMISSOR_PUBLICO') {
  // OPÇÕES:
  
  // Opção 1: Município não está no sistema nacional
  // → Verificar se tem API própria (ABRASF/SOAP)
  const apiPropria = buscarApiMunicipio(codigoIBGE);
  if (apiPropria) {
    return emitirViaApiPropria(dps, apiPropria);
  }
  
  // Opção 2: Município está no nacional mas não habilitou emissores públicos
  // → Verificar se o problema é de configuração ou data
  const municipio = await consultarParametrizacaoMunicipal(codigoIBGE);
  if (!municipio.emissoresPublicosNacionais) {
    throw new Error(`Município ${codigoIBGE} não aceita emissores públicos nacionais. 
                     Use o sistema próprio do município.`);
  }
  
  // Opção 3: Data de competência anterior à migração do município
  if (dataCompetencia < municipio.dtInicioVigencia) {
    return emitirViaApiPropria(dps, buscarApiMunicipio(codigoIBGE));
  }
}
```

### 9.3 Tabela de Municípios — Manutenção

Manter uma tabela local atualizada:

```sql
CREATE TABLE municipios_nfse (
  ibge          VARCHAR(7) PRIMARY KEY,
  nome          VARCHAR(100),
  uf            CHAR(2),
  sistema       ENUM('nacional', 'proprio', 'hibrido'),
  api_endpoint  VARCHAR(255),     -- URL da API própria (se houver)
  api_tipo      ENUM('abrasf', 'rest', 'soap', 'nacional'),
  dt_migracao   DATE,             -- Data de início no sistema nacional
  aceita_emissor_publico BOOLEAN, -- Parâmetro "emissoresPublicosNacionais"
  usa_ctrib_mun BOOLEAN,          -- Exige cTribMun além de cTribNac
  updated_at    TIMESTAMP
);

-- BH
INSERT INTO municipios_nfse VALUES (
  '3106200', 'Belo Horizonte', 'MG', 'hibrido',
  'https://bhissdigital.pbh.gov.br/bhiss-ws/nfse', 'abrasf', 
  '2025-10-01', TRUE, TRUE, NOW()
);

-- São Paulo (exemplo sistema próprio)
INSERT INTO municipios_nfse VALUES (
  '3550308', 'São Paulo', 'SP', 'proprio',
  'https://nfe.prefeitura.sp.gov.br/ws/lotenfe.asmx', 'soap',
  NULL, FALSE, FALSE, NOW()
);
```

### 9.4 Campos Críticos da DPS para BH

Para emissão em Belo Horizonte via sistema nacional, SEMPRE incluir:

```xml
<!-- OBRIGATÓRIO BH: cTribMun com 3 dígitos além do cTribNac -->
<cTribNac>010101</cTribNac>
<cTribMun>001</cTribMun>  <!-- ← OBRIGATÓRIO PARA BH -->

<!-- Para contribuintes com benefício -->
<nBM>31062000200002</nBM>  <!-- Produção -->

<!-- regEspTrib conforme regime do prestador -->
<regEspTrib>0</regEspTrib>  <!-- 0=padrão, outros conforme tabela -->

<!-- IM: numérico, "X" substituído por "0" -->
<!-- Contribuintes pós-01/12/2025: omitir IM -->
```

### 9.5 Municipios que AINDA usam API Própria (ABRASF) — Ação Necessária

Para municípios que ainda NÃO estão no sistema nacional, o "Manda a Nota" deve suportar o padrão ABRASF SOAP. Principais serviços ABRASF:

```
WSDL padrão ABRASF:
- RecepcionarLoteRpsV3: envio em lote
- ConsultarSituacaoLoteRpsV3: consulta status
- ConsultarNfseV3: consulta NFS-e
- CancelarNfseV4: cancelamento

Headers SOAP:
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://www.abrasf.org.br/nfse.xsd"
```

### 9.6 Checklist de Qualidade para Emissão

- [ ] Verificar se município está no sistema nacional (tabela atualizada)
- [ ] Verificar data de migração do município
- [ ] Verificar se `emissoresPublicosNacionais = true` para o município
- [ ] Para BH: incluir `<cTribMun>` além de `<cTribNac>`
- [ ] Para BH pós-01/12/2025: NÃO incluir `<IM>` (salvo casos especiais)
- [ ] Para IM com "X" em BH: substituir por "0"
- [ ] Para benefícios BH: usar ID correto por ambiente
- [ ] Certificado digital mTLS configurado para autenticação SEFIN

---

## 10. FONTES E REFERÊNCIAS

| Fonte | URL | Data |
|---|---|---|
| Portal Nacional NFS-e (gov.br) | https://www.gov.br/nfse/pt-br | Acesso mar/2026 |
| APIs Prod. Restrita e Produção | https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/apis-prod-restrita-e-producao | Atualizado 29/12/2025 |
| BHISS - Prefeitura BH | https://prefeitura.pbh.gov.br/fazenda/bhiss | Atualizado 25/02/2026 |
| FAQ NFS-e BH | https://fazenda.pbh.gov.br/nfse/FAQ | Atualizado 2026 |
| NT SE/CGNFS-e nº 007 | https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc/nt-007-se-cgnfse-v1-0.pdf | 07/02/2026 |
| NT SE/CGNFS-e nº 004 V2 | https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc-producao-restrita-piloto/nt-004-se-cgnfse-novo-layout-rtc-v2-00-20251210.pdf | 10/12/2025 |

---

## APÊNDICE: Diagrama de Decisão para Emissão de NFS-e

```
INÍCIO: Emitir NFS-e para município X
       │
       ▼
Município X está no sistema nacional?
       │
   NÃO ──────────────────────────────────► Usar API própria do município
       │                                    (padrão ABRASF SOAP ou REST próprio)
      SIM
       │
       ▼
Data de competência >= data migração?
       │
   NÃO ──────────────────────────────────► Usar API legada do município
       │
      SIM
       │
       ▼
Município aceita emissores públicos nacionais?
       │
   NÃO ──────────────────────────────────► Erro: "O município emissor informado
       │                                    na DPS deve estar parametrizado..."
       │                                    AÇÃO: contatar município ou usar
       │                                    sistema próprio se disponível
      SIM
       │
       ▼
Emitir DPS via SEFIN Nacional ✅
https://sefin.nfse.gov.br/SefinNacional/
```

---

*Relatório gerado em: 2026-03-05 | Kratos — Sistema de Pesquisa Fiscal | Titânio*
