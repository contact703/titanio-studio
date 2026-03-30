# 📊 Contábil Spec — Base de Conhecimento Tributária e Contábil
**Especialista:** Contábil Spec  
**Criado/Atualizado:** 17/03/2026 (v2 — Módulos 13–20 adicionados)  
**Fontes:** LC 116/2003, LC 123/2006, Código Civil (Lei 10.406/2002), CLT, eSocial S-1.3, FGTS Digital, Receita Federal, Nubank Blog, prática Manda a Nota!

---

## MÓDULO 1 — ISS: IMPOSTO SOBRE SERVIÇOS

### 1.1 Fundamento Legal
**Base:** LC 116/2003 (Art. 1º ao Art. 10) — lida direto da fonte

**Art. 1º LC 116:** O ISS tem como fato gerador a prestação de serviços constantes da lista anexa, ainda que não seja atividade preponderante do prestador. Incide também sobre serviço proveniente do exterior.

**Art. 2º LC 116 — NÃO INCIDE:**
- I — Exportações de serviços para o exterior do País
- II — Relação de emprego, trabalhadores avulsos, diretores de conselho
- III — Intermediação em mercado de títulos, depósitos bancários, principal e juros de operações de crédito

> ⚠️ **Atenção:** Serviço desenvolvido no Brasil cujo RESULTADO aqui se verifique NÃO é exportação, mesmo que pagamento seja feito do exterior. (LC 116, Art. 2º, parágrafo único)

### 1.2 Local do Imposto — Art. 3º LC 116 (25 exceções)

**Regra geral:** ISS é devido no município do **estabelecimento prestador** (ou domicílio do prestador se não houver estabelecimento).

**Exceções (ISS devido no local da execução/tomador):**
- Cessão de mão-de-obra (17.05) → município do tomador
- Construção civil (7.02, 7.19) → local da obra
- Demolição (7.04) → local da demolição
- Limpeza/manutenção pública (7.10) → local da execução
- Varrição/coleta de lixo (7.09) → local da execução
- Guarda/estacionamento (11.01) → onde o bem estiver
- Vigilância (11.02) → domicílio dos bens vigiados
- Planos de saúde (4.22, 4.23) → domicílio do beneficiário
- Cartão de crédito (15.01) → domicílio do titular do cartão
- Consórcio → domicílio do consorciado
- Arrendamento mercantil → domicílio do arrendatário

### 1.3 Contribuinte e Responsabilidade — Arts. 5º e 6º LC 116

**Art. 5º:** Contribuinte é o **prestador** do serviço.

**Art. 6º:** Municípios PODEM, mediante lei, atribuir responsabilidade ao **tomador** (retenção na fonte). O responsável paga integral, multas e acréscimos, mesmo que não tenha feito a retenção.

**Art. 6º §2º — Tomador é responsável OBRIGATORIAMENTE quando:**
- Serviço proveniente do exterior
- PJ tomadora dos serviços: 3.05, 7.02, 7.04, 7.05, 7.09, 7.10, 7.12, 7.16, 7.17, 7.19, 11.02, 17.05, 17.10

### 1.4 Alíquotas do ISS

| Item | Alíquota Mínima (LC 157/2016) | Alíquota Máxima (LC 116/2003) |
|------|-------------------------------|-------------------------------|
| Regra geral | **2%** | **5%** |
| Exceção | Pode ser menor por benefício fiscal específico | 5% é o teto absoluto |

**Municípios principais:**
- São Paulo (SP): 2% a 5%
- Belo Horizonte (MG): 2% a 5%
- Rio de Janeiro (RJ): 2% a 5%
- Curitiba (PR): 2% a 5%

### 1.5 ISS e MEI — Regra Especial

MEI recolhe ISS **fixo mensal de R$ 5,00** no DAS-MEI, independente do faturamento.

**Não há ISS proporcional sobre cada nota para MEI** — está coberto pelo DAS fixo.

**Se tomador reter ISS de MEI:**
- Campo `indISS=2` na NFS-e
- O valor retido é deduzido do DAS-MEI do mês
- Se exceder o DAS, o excesso é crédito

### 1.6 ISS e Simples Nacional

Para empresas **Simples Nacional (não MEI)**:
- ISS está incluído no DAS mensal
- Percentual do ISS varia por Anexo e faixa de faturamento
- Se tomador retém ISS: deduzir do valor do DAS no período

---

## MÓDULO 2 — SIMPLES NACIONAL: ESTRUTURA COMPLETA

### 2.1 O que é (Fonte: Receita Federal)

Regime compartilhado de arrecadação, cobrança e fiscalização de tributos para ME e EPP. Previsto na **LC 123/2006**.

**Características (confirmadas pela fonte oficial):**
- Facultativo e irretratável para o ano-calendário
- Unifica: IRPJ, CSLL, PIS/COFINS, IPI, ICMS, ISS e CPP
- DAS único até dia 20 do mês subsequente
- Declaração única e simplificada (DEFIS)
- Prazo DAS: **dia 20 do mês seguinte** ao faturamento

### 2.2 Quem Pode Optar

**Microempresa (ME):** faturamento até R$ 360.000/ano  
**Empresa de Pequeno Porte (EPP):** faturamento R$ 360.001 a R$ 4.800.000/ano

**Impedimentos:**
- Pessoa jurídica de direito público
- Serviços financeiros (banco, seguro, financeira)
- Prestação de serviços em filial de empresa estrangeira
- Regime de tributação diferenciado do cônjuge/parente
- Débitos com a Fazenda Nacional (salvo parcelamento)

### 2.3 Os 5 Anexos — Tabelas Atualizadas

#### ANEXO III — Serviços em Geral (alíquota 6% a 33%)
*Inclui: TI, educação, saúde básica, fotografia, publicidade, manutenção*

| Faixa | Receita Bruta 12 meses | Alíquota Nominal | Parcela a Deduzir |
|-------|------------------------|------------------|-------------------|
| 1ª | Até 180.000 | 6,00% | — |
| 2ª | De 180.001 a 360.000 | 11,20% | R$ 9.360,00 |
| 3ª | De 360.001 a 720.000 | 13,20% | R$ 17.640,00 |
| 4ª | De 720.001 a 1.800.000 | 16,00% | R$ 35.640,00 |
| 5ª | De 1.800.001 a 3.600.000 | 21,00% | R$ 125.640,00 |
| 6ª | De 3.600.001 a 4.800.000 | 33,00% | R$ 648.000,00 |

**Distribuição Anexo III (1ª faixa):**
IRPJ 4% + CSLL 3,5% + COFINS 12,82% + PIS 2,78% + CPP 43,4% + ISS 33,5%

#### ANEXO IV — Construção Civil e Serviços (4,5% a 33%)
*Inclui: construção civil, vigilância, limpeza, conservação*

| Faixa | Receita Bruta 12 meses | Alíquota Nominal | Parcela a Deduzir |
|-------|------------------------|------------------|-------------------|
| 1ª | Até 180.000 | 4,50% | — |
| 2ª | De 180.001 a 360.000 | 9,00% | R$ 8.100,00 |
| 3ª | De 360.001 a 720.000 | 10,20% | R$ 12.420,00 |
| 4ª | De 720.001 a 1.800.000 | 14,00% | R$ 39.780,00 |
| 5ª | De 1.800.001 a 3.600.000 | 22,00% | R$ 183.780,00 |
| 6ª | De 3.600.001 a 4.800.000 | 33,00% | R$ 828.000,00 |

> Anexo IV: **CPP não incluído** (empresa paga INSS patronal separado)

#### ANEXO V — Profissões Intelectuais (15,5% a 30,5%)
*Inclui: medicina, advocacia, contabilidade, engenharia, arquitetura, TI-consultoria*

| Faixa | Receita Bruta 12 meses | Alíquota Nominal | Parcela a Deduzir |
|-------|------------------------|------------------|-------------------|
| 1ª | Até 180.000 | 15,50% | — |
| 2ª | De 180.001 a 360.000 | 18,00% | R$ 4.500,00 |
| 3ª | De 360.001 a 720.000 | 19,50% | R$ 9.900,00 |
| 4ª | De 720.001 a 1.800.000 | 20,50% | R$ 17.100,00 |
| 5ª | De 1.800.001 a 3.600.000 | 23,00% | R$ 62.100,00 |
| 6ª | De 3.600.001 a 4.800.000 | 30,50% | R$ 540.000,00 |

### 2.4 Fórmula de Cálculo do DAS

```
1. Calcular alíquota efetiva:
   AE = (RBT12 × Alíquota Nominal − Parcela a Deduzir) / RBT12

2. Aplicar ao faturamento do mês:
   DAS = Faturamento do mês × AE

Onde RBT12 = Receita Bruta Total dos últimos 12 meses
```

**Exemplo prático:**
- Empresa com RBT12 = R$ 240.000 (faixa 2 do Anexo III)
- AE = (240.000 × 11,20% − 9.360) / 240.000 = (26.880 − 9.360) / 240.000 = 7,30%
- Mês com faturamento R$ 20.000: DAS = 20.000 × 7,30% = **R$ 1.460**

### 2.5 Fator R — Critério de Migração Anexo V → Anexo III

**Fator R = Folha de Salários (12 meses) ÷ Receita Bruta (12 meses)**

- **Fator R ≥ 28%:** empresa aplica Anexo III
- **Fator R < 28%:** empresa aplica Anexo V

**Folha de salários inclui:**
- Pró-labore dos sócios
- Salários de empregados registrados
- FGTS patronal
- 13º salário pago
- Férias pagas
- INSS patronal

**Importante:** MEI geralmente não tem pró-labore formal definido — Fator R tende a ser zero.

---

## MÓDULO 3 — MEI: MICROEMPREENDEDOR INDIVIDUAL

### 3.1 Características e Limites (2025)

| Parâmetro | Valor |
|-----------|-------|
| Faturamento anual máximo | R$ 81.000 (LC 187/2021) |
| Faturamento mensal médio proporcional | R$ 6.750 |
| Empregado permitido | 1 (salário mínimo ou piso da categoria) |
| INSS mensal | R$ 66,60 (5% do salário mínimo) |
| ISS mensal | R$ 5,00 |
| ICMS mensal | R$ 1,00 |
| DAS Comércio | R$ 67,60 |
| DAS Serviços | R$ 71,60 |
| DAS Misto (comércio+serviços) | R$ 72,60 |

### 3.2 DAS-MEI — Prazo e Pagamento

**Prazo:** Dia 20 de cada mês

**Como pagar:**
- App MEI (gov.br)
- CNPJ do empreendedor no banco
- Aplicativo Meu Simples Nacional
- Bancos conveniados

**Consequências de não pagar:**
- Juros Selic sobre o valor
- Impossibilidade de parcelar via Simples
- Dívida Ativa da União após 6 meses de atraso
- Perda de benefícios previdenciários (INSS)

### 3.3 DASN-SIMEI — Declaração Anual

**O que é:** Declaração Anual de Faturamento do MEI (Simples Ele)

**Prazo:** **31 de maio** do ano seguinte

**Onde:** Portal do Empreendedor → gov.br/mei → "Declaração Anual de Faturamento"

**O que informar:**
- Receita bruta total do ano civil
- Receita por atividade (comércio / indústria / serviços)
- Se teve empregado e qual o salário

**ATENÇÃO — deve declarar mesmo com faturamento ZERO**

**Multas por não declarar:**
- Mínimo: R$ 50,00
- 2% ao mês-calendário sobre os tributos devidos (mínimo R$ 50,00, máximo 20%)
- CNPJ suspenso → impossibilidade de emitir certidões, alvará, etc.

### 3.4 Quando o MEI Ultrapassa o Limite

**Excesso ≤ 20% (até R$ 97.200):**
- Migra para ME do Simples a partir de **1º de janeiro** do ano seguinte
- Recolhe DAS normal pelo excedente
- Não retroage

**Excesso > 20% (acima de R$ 97.200):**
- Migra imediatamente com efeitos **retroativos a 1º de janeiro** do mesmo ano
- Tributa tudo retroativamente como ME Simples
- Penalizações severas

**O que fazer quando ultrapassar:**
1. Verificar exatamente o quanto excedeu
2. Se ≤ 20%: fazer DAS complementar e migrar no início do próximo ano
3. Se > 20%: contratar contador imediatamente para fazer a regularização retroativa

### 3.5 Benefícios Previdenciários do MEI (INSS)

Com pagamentos em dia, o MEI tem direito a:
- **Aposentadoria por idade** (65H/62M com 15 anos de contribuição)
- **Aposentadoria por invalidez**
- **Auxílio-doença** (após 12 meses de contribuição)
- **Salário-maternidade** (após 10 meses de contribuição)
- **Pensão por morte** (dependentes)

**Atenção:** A alíquota de 5% do INSS do MEI gera contribuição mínima — para aposentadoria por tempo de contribuição, é necessário complementar com 15% adicional.

---

## MÓDULO 4 — RETENÇÕES NA NOTA FISCAL

### 4.1 Mapa Completo de Retenções

#### MEI e Simples Nacional → Tomador PJ

```
REGRA: Não se retém tributos federais de optantes do Simples.
BASE LEGAL: LC 123/2006, Art. 4º — "As ME e EPP optantes pelo Simples
Nacional não sofrerão retenção na fonte de IRRF, CSLL, COFINS e PIS."

IRRF:      ❌ NÃO retém
CSLL:      ❌ NÃO retém  
PIS:       ❌ NÃO retém
COFINS:    ❌ NÃO retém
ISS:       ⚠️ Depende da lei municipal + tipo de serviço
INSS:      ⚠️ Apenas cessão de mão-de-obra (11%)
```

#### Lucro Real / Lucro Presumido → Tomador PJ

```
IRRF:      ✅ 1,5% (serviços gerais)
           ✅ 1,0% (limpeza, vigilância, transporte de carga, factoring)
           ✅ 4,8% (corretagem, intermediação)
CSLL:      ✅ 1,0%
PIS:       ✅ 0,65%
COFINS:    ✅ 3,0%
Total:     ✅ 6,15% (serviços gerais) ou 5,65% (limpeza/vigilância)
ISS:       ✅ Conforme lei municipal (2% a 5%)
INSS:      ✅ 11% (cessão de mão-de-obra)
```

### 4.2 IRRF — Retenção de Imposto de Renda na Fonte

**Base legal:** IN RFB 1.234/2012

**Quem está sujeito:**
- Prestadores pessoas jurídicas do Lucro Real ou Presumido
- Valores acima de R$ 10,00 por competência (abaixo = aguarda acumular)

**Alíquotas por tipo de serviço:**

| Tipo de Serviço | Alíquota IRRF |
|----------------|---------------|
| Prestação de serviços gerais | 1,5% |
| Limpeza, conservação, zeladoria | 1,0% |
| Vigilância e segurança | 1,0% |
| Transporte de carga | 1,0% |
| Factoring | 1,0% |
| Corretagem, representação comercial | 4,8% |
| Serviços profissionais (medicina, advocacia em PJ) | 1,5% |
| Construção civil — trabalho + material | 1,5% |
| Construção civil — somente trabalho | 1,5% |

**CUIDADO:** Se a empresa é do Simples → **NÃO retém nada.**  
Tomador deve verificar o regime do prestador antes de reter.

### 4.3 INSS — Retenção de 11%

**Quando retém:** Cessão de mão-de-obra e empreitada de construção civil

**Cessão de mão-de-obra** (retém 11%):
- Disponibilização de trabalhadores
- Trabalho nas dependências do tomador
- Trabalhador sob subordinação indireta do tomador
- Exemplos: vigilância, limpeza, TI terceirizado no site do cliente

**Empreitada** (geralmente não retém 11%):
- Resultado específico acordado em contrato
- Trabalho nos meios do próprio prestador
- Resultado é entregue (não a força de trabalho)
- Exemplos: desenvolvimento de software, produção audiovisual, consultoria

**ATENÇÃO para construção civil:**
- Empreitada de construção civil COM cessão de MO → retém 11%
- Empreitada total (material + MO) → retém 11% sobre 50% do valor

### 4.4 Como Identificar o Regime Tributário do Prestador

Na NFS-e, o campo `opSimpNac` informa:
- 1 = Não optante (retém tributos)
- 2 = MEI (não retém tributos federais)
- 3 = ME/EPP Simples (não retém tributos federais)

Também verificar:
- Consultar CNPJ na Receita: https://www.receita.fazenda.gov.br → situação cadastral
- SINTEGRA / Simples Nacional
- Declaração escrita do prestador na nota fiscal

### 4.5 O Que Fazer Quando o Tomador Retém Indevidamente

Se MEI/Simples Nacional receber nota com retenção indevida de IRRF/CSLL/PIS/COFINS:

1. **Comunicar imediatamente** o tomador por escrito
2. **Anexar** prova do enquadramento no Simples (certidão de optante)
3. **Solicitar restituição** do valor retido
4. Se não devolver: **PERD/COMP** na Receita Federal (restituição administrativa)
5. Prazo: **5 anos** a contar do pagamento indevido

---

## MÓDULO 5 — IMPOSTO DE RENDA — COMPLETO

### 5.1 IRPF — Pessoa Física (Sócio/MEI)

**Prazo IRPF 2026 (ano-base 2025):** **29 de maio de 2026** *(confirmado Receita Federal)*

**Obrigado a declarar quem:**
- Teve rendimentos tributáveis acima de **R$ 30.639,90** em 2025
- Teve rendimentos isentos/não tributáveis acima de **R$ 200.000**
- Teve ganho de capital (venda de imóvel, carro, etc.)
- Realizou operações na bolsa de valores (qualquer valor)
- Tinha em 31/12 bens/direitos acima de **R$ 800.000**
- Passou à condição de residente no Brasil em 2025

### 5.2 Tabela IRPF 2025 (Declaração 2026)

| Base de Cálculo Mensal | Alíquota | Parcela a Deduzir |
|------------------------|----------|-------------------|
| Até R$ 2.259,20 | Isento | — |
| De R$ 2.259,21 a R$ 2.826,65 | 7,5% | R$ 169,44 |
| De R$ 2.826,66 a R$ 3.751,05 | 15% | R$ 381,44 |
| De R$ 3.751,06 a R$ 4.664,68 | 22,5% | R$ 662,77 |
| Acima de R$ 4.664,68 | 27,5% | R$ 896,00 |

**Deduções permitidas:**
- Dependentes: R$ 2.275,08/ano por dependente
- Educação: até R$ 3.561,50/ano por pessoa
- Previdência oficial (INSS): dedução integral
- Previdência privada (PGBL): até 12% da renda bruta tributável
- Despesas médicas: sem limite (comprovadas)
- Livro caixa (autônomos/empresários): despesas necessárias à atividade

### 5.3 MEI e Distribuição de Lucros — Como Declarar

**Distribuição de lucros do MEI para o sócio é ISENTA de IR.**

**Como calcular o lucro distribuível isento:**

**Método 1 — Com contabilidade:**
Lucro = Receitas − Despesas documentadas

**Método 2 — Sem contabilidade (percentual presumido):**
- Atividade de comércio e indústria: **8% da receita bruta**
- Atividade de serviços em geral: **32% da receita bruta**
- Atividade de serviços hospitalares: **8% da receita bruta**

**Exemplo MEI de serviços:**
- Faturamento anual: R$ 60.000
- Lucro presumido: 32% × 60.000 = R$ 19.200
- R$ 19.200 de distribuição de lucros = **ISENTO de IR**
- Valor acima de R$ 19.200: tributável como rendimento normal

**Onde declarar no IRPF:**
- Ficha "Rendimentos Isentos e Não Tributáveis"
- Código 09 — "Lucros e dividendos recebidos"
- Informar CNPJ da empresa pagadora

### 5.4 Prazo e Multas IRPF

| Situação | Multa |
|----------|-------|
| Atraso na entrega | R$ 165,74 mínimo + 1% ao mês sobre o imposto devido (máx 20%) |
| Sonegação | 75% a 150% do imposto devido + juros Selic |
| Não declarar sendo obrigado | Mesmo que não deva imposto: R$ 165,74 |

### 5.5 Malha Fina — Como Evitar

**Principais motivos de cair na malha fina:**
1. Despesas médicas sem recibo (NF ou recibo obrigatório)
2. Rendimento omitido (recebi mas não declarei)
3. Divergência entre o que declarei e o que o pagador informou (DIRF)
4. Dedução de dependente que também declarou sozinho
5. Imposto retido na fonte diferente do informado pelo pagador
6. Ganho de capital não declarado (venda de imóvel/carro)

**Como sair da malha fina:**
1. Verificar pendências em e-CAC (eCAC.fazenda.gov.br)
2. Enviar declaração retificadora com correções
3. Prazo: geralmente 2-3 meses para regularizar

---

## MÓDULO 6 — NFS-e: SISTEMA NACIONAL COMPLETO

### 6.1 Estrutura do Sistema Nacional NFS-e (SEFIN)

**API:** `https://sefin.nfse.gov.br/SefinNacional`  
**Autenticação:** mTLS com certificado A1 (e-CNPJ)  
**Schema:** DPS v1.01  
**Cobertura:** Todos os 5.565 municípios brasileiros

### 6.2 Campos Obrigatórios da DPS

```xml
<DPS>
  <infDPS>
    <tpAmb>1</tpAmb>                    <!-- 1=Produção, 2=Homologação -->
    <dhEmi>2026-03-16T10:00:00-03:00</dhEmi>  <!-- Data e hora UTC-3 -->
    <verAplic>1.0</verAplic>
    <serie>1</serie>
    <nDPS>1</nDPS>                       <!-- Número sequencial -->
    <dCompet>2026-03</dCompet>           <!-- Competência da nota -->
    <prest>                              <!-- PRESTADOR -->
      <CNPJ>12345678000195</CNPJ>
      <IM>123456</IM>                    <!-- Inscrição Municipal -->
      <xNome>Nome do Prestador</xNome>
      <end>...</end>
    </prest>
    <toma>                               <!-- TOMADOR -->
      <CPF_CNPJ>
        <CNPJ>98765432000110</CNPJ>      <!-- ou CPF para PF -->
      </CPF_CNPJ>
      <xNome>Nome do Tomador</xNome>
      <end>...</end>
    </toma>
    <serv>                               <!-- SERVIÇO -->
      <xDescServ>Descrição do serviço prestado</xDescServ>
      <cTribNac>130301</cTribNac>        <!-- Código tributário nacional LC116 -->
      <cTribMun>001</cTribMun>           <!-- Código municipal (se exigido) -->
      <cNBS>114081100</cNBS>             <!-- NBS: 9 dígitos sem pontos -->
      <cIntContrib>                      <!-- Informações do contribuinte -->
        <opSimpNac>2</opSimpNac>         <!-- 1=Não optante, 2=MEI, 3=Simples -->
      </cIntContrib>
    </serv>
    <valores>
      <vServPrest>
        <vReceb>1000.00</vReceb>         <!-- Valor recebido -->
      </vServPrest>
      <trib>
        <!-- Para MEI (opSimpNac=2): -->
        <totTrib>
          <pTotTribSN>0.00</pTotTribSN> <!-- Alíquota Simples: usar pTotTribSN, NUNCA indTotTrib para Simples -->
        </totTrib>
      </trib>
    </valores>
  </infDPS>
</DPS>
```

### 6.3 Códigos cTribNac — Os Mais Usados (LC 116/2003)

| cTribNac | Item LC116 | Serviço | Anexo Simples |
|----------|-----------|---------|---------------|
| 010101 | 1.01 | Desenvolvimento de software | III |
| 010601 | 1.06 | Consultoria em informática | III* |
| 010701 | 1.07 | Suporte técnico | III |
| 010801 | 1.08 | Planejamento, confecção, manutenção de sites | III |
| 080201 | 8.02 | Instrução e treinamento | III |
| 120101 | 12.01 | Shows e espetáculos artísticos | III |
| 130201 | 13.02 | Fonografia e gravação de sons | III |
| 130301 | 13.03 | Fotografia e cinematografia | III |
| 170101 | 17.01 | Assessoria e consultoria geral | V |
| 170601 | 17.06 | Propaganda e publicidade | III |
| 171201 | 17.12 | Administração de bens/negócios | III |
| 040101 | 4.01 | Medicina | V |
| 041201 | 4.12 | Odontologia | V |
| 070101 | 7.01 | Engenharia | V |
| 070104 | 7.04 | Arquitetura | V |
| 070201 | 7.02 | Construção civil | IV |

*Com Fator R: pode ser Anexo III

### 6.4 NBS — Nomenclatura Brasileira de Serviços

**Formato XML:** 9 dígitos sem pontos (ex: `114081100`)  
**Formato display:** `1.1408.11.00`  
**Fonte oficial:** Anexo VIII do CGNFS-e  

**Correlação NBS ↔ cTribNac (mais usados):**

| cTribNac | NBS | Serviço |
|----------|-----|---------|
| 130301 | 114081100 | Fotografia/videografia de eventos |
| 130201 | 125011100 | Gravação de som em estúdio |
| 010101 | 115021000 | Desenvolvimento de software |
| 010701 | 115013000 | Suporte técnico em informática |
| 170601 | 119930000 | Publicidade e propaganda |
| 080201 | 119910000 | Treinamento e capacitação |

### 6.5 Erros Mais Comuns na NFS-e e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "código não administrado pelo município" | cTribNac inválido para o município | Verificar lista oficial + usar ctrib-fallback |
| "trib incomplete content" | totTrib sem campo correto | MEI/Simples: `pTotTribSN`, nunca `indTotTrib` |
| "NBS inexistente" | NBS fora da tabela oficial | Usar correlação oficial nbs-correlacao.json |
| "cTribMun inválido" | Código municipal incorreto | Calcular a partir do cTribNac: últimos 2 dígitos |
| "CNPJ/CPF inválido" | Número com formatação errada | Apenas números, sem pontos/barras/traços |
| "certificado expirado" | A1 vencido | Renovar no banco ou pelo e-CNPJ |
| "signature invalid" | Hora do servidor desincronizada | Sincronizar NTP do servidor |
| "Item 13.01 não existe" | Revogado pela LC 157/2016 | Usar 130301 (13.03) para fotografia |

---

## MÓDULO 7 — OBRIGAÇÕES ACESSÓRIAS ANUAIS

### 7.1 Calendário Completo

| Obrigação | Quem | Prazo | Onde |
|-----------|------|-------|------|
| **DAS-MEI** | MEI | Dia 20 de cada mês | App MEI |
| **DASN-SIMEI** | MEI | 31 de maio | gov.br/mei |
| **DEFIS** | ME/EPP Simples | 31 de março | Portal Simples Nacional |
| **IRPF** | Pessoa física obrigada | 29/maio/2026 (confirmado) | e-CAC |
| **DIRF** | Quem fez retenções | 28 de fevereiro | e-CAC |
| **DCTF** | Lucro Real/Presumido | Mensal (15 do mês seguinte) | e-CAC |
| **EFD-Contribuições** | Lucro Real/Presumido | Mensal (10 do mês seguinte) | SPED |
| **ECF** | Lucro Real/Presumido | 31 de julho | SPED |
| **ECD** | Lucro Real obrigatório | 31 de maio | SPED |

### 7.2 DEFIS — Declaração Simples Nacional

**O que é:** Declaração de Informações Socioeconômicas e Fiscais  
**Quem:** ME e EPP do Simples (exceto MEI — esse faz DASN-SIMEI)  
**Prazo:** 31 de março  
**Onde:** Portal Simples Nacional  

**O que informar:**
- Receitas por atividade e por mês
- Informações sobre sócios
- Se tem filial
- Informações sobre empregados

### 7.3 DIRF — Declaração de IR Retido na Fonte

**Quem declara:** Toda pessoa jurídica que efetuou retenção na fonte  
**Prazo:** Último dia útil de fevereiro  
**Consequência de não entregar:** Multa de R$ 1.500 a R$ 3.000/mês  

**O que informar:**
- CNPJ/CPF de cada beneficiário
- Valor dos pagamentos
- Valor do imposto retido por código de retenção

---

## MÓDULO 8 — PLANEJAMENTO TRIBUTÁRIO LEGAL

### 8.1 Princípio e Limites

**Planejamento tributário legal = elisão fiscal** (permitido)  
**Sonegação fiscal = evasão fiscal** (crime)

**Diferença:**
- Elisão: escolher entre classificações legalmente válidas aquela de menor carga
- Evasão: omitir receita, falsificar documentos, usar código errado para pagar menos

**Regra de ouro:** A classificação escolhida DEVE descrever com precisão o que foi efetivamente realizado.

### 8.2 Casos Práticos — Economia Real

| Serviço | Código errado (comum) | Código correto (otimizado) | Anexo | Economia |
|---------|----------------------|---------------------------|-------|---------|
| Produção de vídeo/filme | 170101 (Assessoria) | 130301 (Cinematografia) | V→III | Até 9,5% |
| Podcast/gravação áudio | 170101 (Assessoria) | 130201 (Fonografia) | V→III | Até 9,5% |
| Design gráfico | 170101 (Assessoria) | 170601 (Publicidade) | V→III | Até 9,5% |
| Treinamento/palestra | 170101 (Assessoria) | 080201 (Instrução) | V→III | Até 9,5% |
| Marketing/social media | 170101 (Assessoria) | 170601 (Publicidade) | V→III | Até 9,5% |
| Consultoria em TI | 170101 (Assessoria geral) | 010601 (Consultoria TI) | V→III | Até 9,5% |
| Copywriting | 170101 (Assessoria) | 170601 (Publicidade) | V→III | Até 9,5% |
| Gestão operacional/BPO | 170101 (Consultoria) | 171201 (Administração) | V→III | Variável |

### 8.3 Cuidados no Planejamento Tributário

1. **CNAE compatível:** A empresa deve ter o CNAE correspondente ao serviço
2. **Contrato reflete a realidade:** Contrato de prestação de serviço deve usar os termos corretos
3. **Descrição na nota:** Deve descrever o que foi efetivamente feito
4. **Consistência:** Não alternar de código conforme conveniência tributária
5. **Documentação:** Guardar evidências do serviço prestado (entregáveis, e-mails, contratos)

---

## MÓDULO 9 — SERVIÇOS INTERNACIONAIS

### 9.1 ISS na Exportação de Serviços

**Regra geral (Art. 2º LC 116):** NÃO incide ISS sobre exportações de serviços.

**Mas INCIDE quando:** O resultado do serviço se verifica no Brasil, mesmo que o pagador seja do exterior.

**Isenção se aplica quando:**
- Cliente é empresa/pessoa no exterior
- O resultado (uso/fruição do serviço) ocorre fora do Brasil
- Exemplo: desenvolver software para usar exclusivamente nos EUA

**NÃO é isenção quando:**
- Filme produzido aqui para vender aqui (mesmo que cliente pague em dólar)
- Consultoria sobre empresa brasileira feita remotamente para sócio estrangeiro
- Marketing de produto vendido no Brasil

**Na NFS-e:** `indISS=4` (exportação de serviços)

### 9.2 Câmbio e Tributação

**Converter pelo PTAX do dia do recebimento**

**Onde encontrar o PTAX:** Banco Central do Brasil — bcb.gov.br → câmbio → consultar taxas

**Exemplo:**
- Recebeu USD 1.000 em 15/03/2026
- PTAX compra em 15/03/2026: R$ 5,85
- Valor para a nota: R$ 5.850,00

**Conta bancária em dólar:** Se o MEI receber via conta internacional (Wise, Payoneer), o valor em reais no dia do recebimento é o faturamento declarado na DASN-SIMEI.

---

## MÓDULO 10 — REGIMES TRIBUTÁRIOS PARA CRESCIMENTO

### 10.1 Simples Nacional → Lucro Presumido → Lucro Real

À medida que a empresa cresce, pode ser vantajoso mudar de regime:

**Lucro Presumido:**
- Faturamento até R$ 78 milhões/ano
- Alíquotas: IRPJ 15% + CSLL 9% sobre lucro presumido
- Lucro presumido para serviços: 32% da receita
- Mais vantajoso que Simples para empresas com margens muito altas

**Lucro Real:**
- Obrigatório acima de R$ 78 milhões
- Tributa sobre o lucro real apurado
- Vantajoso para empresas com prejuízo ou margens baixas
- Obrigatório para instituições financeiras

### 10.2 Quando Sair do Simples

**Pode ser vantajoso sair quando:**
- Faturamento na 6ª faixa (alíquota efetiva Simples > Presumido)
- Empresa tem folha alta (Fator R > 28% — melhor no Presumido)
- Atividade sujeita a créditos de PIS/COFINS no regime não-cumulativo

**Calcular ponto de equivalência:**
- Simples 6ª faixa Anexo III: até 33%
- Lucro Presumido (serviços): IRPJ 4,8% + CSLL 2,88% + PIS 0,65% + COFINS 3% + ISS 2-5% = ~14-17%

---

## MÓDULO 11 — REFORMA TRIBUTÁRIA 2026+

### 11.1 O que Muda com a EC 132/2023

**Novos tributos criados:**
- **IBS** (Imposto sobre Bens e Serviços) — substitui ICMS + ISS
- **CBS** (Contribuição sobre Bens e Serviços) — substitui PIS + COFINS
- **IS** (Imposto Seletivo) — sobre itens prejudiciais (cigarros, bebidas alcoólicas, armas)

**LC 214/2025:** Regulamentação principal aprovada em 2025

### 11.2 Cronograma de Transição

| Período | Evento |
|---------|--------|
| 2026 | NF-e e NFS-e continuam como hoje |
| 2026 | CBS começa com alíquota 0,1% (teste) |
| 2027 | CBS começa a valer de fato |
| 2029 | IBS começa a ser cobrado |
| 2029-2032 | Redução gradual do ICMS e ISS |
| 2033 | ICMS e ISS extintos; só IBS + CBS |

### 11.3 Impacto para MEI e Simples

- **Simples Nacional continua existindo**
- MEI e Simples terão alíquota reduzida do IBS/CBS
- O DAS unificado deverá incluir IBS/CBS no lugar de ICMS/ISS
- Todos os detalhes ainda em regulamentação
- **Ação recomendada:** Monitorar publicações do CGSN e CONFAZ

---

## MÓDULO 12 — PERGUNTAS FREQUENTES (FAQ)

**P: MEI precisa de contador?**  
R: Não é obrigatório, mas recomendado quando: está próximo do limite de faturamento, tem dúvidas sobre IR pessoa física, precisa migrar para ME, ou está sendo auditado.

**P: Qual a diferença entre nota fiscal e fatura?**  
R: Fatura é documento de cobrança. Nota fiscal é documento fiscal obrigatório que comprova a operação perante a Receita. MEI deve emitir NFS-e e pode emitir junto uma fatura.

**P: MEI pode receber em espécie?**  
R: Sim, mas deve emitir nota e declarar o valor normalmente. Não emitir nota = sonegação.

**P: O que acontece se emitir nota com código errado?**  
R: Prefeitura pode rejeitar. Se aceitar e auditar depois: multa de 20% a 100% do valor do imposto, mais juros. Se for sistemático: caracteriza sonegação.

**P: Posso ter MEI e ser empregado CLT ao mesmo tempo?**  
R: Sim. O CNPJ MEI e o CPF são entidades separadas para fins tributários. Mas atenção: se seu empregador proibir atividade paralela no contrato de trabalho, pode haver consequência trabalhista.

**P: Distribuição de lucros tem teto?**  
R: Para MEI/Simples, pode distribuir todo o lucro apurado. O que for distribuído além do lucro real (sem contabilidade: além do percentual presumido) é tributado como pró-labore.

**P: Como pagar menos imposto legalmente?**  
R: (1) Usar o cTribNac correto que gere menor carga, (2) manter despesas documentadas para elevar o custo e reduzir lucro distribuível tributável, (3) avaliar periodicamente se Simples ainda é o regime mais vantajoso.

---

## FONTES OFICIAIS VERIFICADAS

| Fonte | URL | Conteúdo |
|-------|-----|---------|
| LC 116/2003 (lida diretamente) | planalto.gov.br/lcp116 | ISS, lista serviços, local imposto |
| LC 123/2006 (lida diretamente) | planalto.gov.br/lcp123 | Simples, MEI, proibição retenção |
| Receita Federal — IRPF 2026 | receita.fazenda.gov.br | Prazo: 29/maio/2026 |
| Simples Nacional (RF) | receita.fazenda.gov.br/SimplesNacional | Tabelas, prazos, DAS |
| Portal MEI | gov.br/mei | DASN-SIMEI, DAS-MEI |
| SEFIN NFS-e | sefin.nfse.gov.br | API, schema DPS v1.01 |

*Base compilada em 16/03/2026 (v1). Atualizada em 17/03/2026 com Módulos 13-20 (v2).*

---

# PARTE 2 — O QUE UM CONTADOR FAZ E O QUE AS EMPRESAS PRECISAM

---

## MÓDULO 13 — OS SERVIÇOS DO CONTADOR: VISÃO GERAL

### 13.1 Por que toda empresa precisa de contador

**Base legal:** Art. 1.179 do Código Civil (Lei 10.406/2002):
> "O empresário e a sociedade empresária são obrigados a seguir um sistema de contabilidade, mecanizado ou não, com base na escrituração uniforme de seus livros."

**Confirmado pela fonte (Nubank/Código Civil):**
- Toda sociedade empresarial (com fins lucrativos ou não) é obrigada por lei
- A escrituração deve ser feita por contador registrado no **CRC** (Conselho Regional de Contabilidade)
- **Exceção:** MEI está dispensado de contador e escrituração formal (LC 128/2008)

### 13.2 As 10 Grandes Funções de um Contador para Empresas

| # | Função | O que é | Periodicidade |
|---|--------|---------|---------------|
| 1 | **Abertura de empresa** | Registro, CNPJ, alvará, regime tributário | Uma vez |
| 2 | **Escrituração contábil** | Registro de todas as transações financeiras | Diária/mensal |
| 3 | **Folha de pagamento** | Cálculo de salários, INSS, FGTS, IR | Mensal |
| 4 | **Apuração de impostos** | Cálculo e guias de DAS, IRPJ, CSLL, etc. | Mensal/trimestral |
| 5 | **Obrigações acessórias** | DEFIS, DIRF, DCTF, ECD, ECF, eSocial | Mensal/anual |
| 6 | **Demonstrações financeiras** | Balanço, DRE, DFC, DMPL | Mensal/anual |
| 7 | **Planejamento tributário** | Escolha do melhor regime, redução legal de impostos | Anual |
| 8 | **Assessoria trabalhista** | Admissão, demissão, férias, 13º, rescisão | Contínuo |
| 9 | **Certidões e regularidade** | CND federal, estadual, municipal, FGTS | Sob demanda |
| 10 | **Encerramento de empresa** | Baixa, distrato, quitação de obrigações | Uma vez |

---

## MÓDULO 14 — ABERTURA DE EMPRESA: PASSO A PASSO COMPLETO

### 14.1 O que o contador faz na abertura

1. **Definir o tipo jurídico** mais adequado:

| Tipo | Quando usar | Nº de sócios |
|------|-------------|--------------|
| MEI | Faturamento até R$ 81k, profissão listada | 1 (sem sócios) |
| EI (Empresário Individual) | Profissão não listada MEI, sem sócios | 1 |
| EIRELI (extinta — use SLU) | — | — |
| SLU (Soc. Limitada Unipessoal) | 1 sócio, responsabilidade limitada | 1 |
| LTDA | 2+ sócios, responsabilidade limitada | 2 ou + |
| SA (Sociedade Anônima) | Capital aberto ou grande empresa | 2 ou + |

2. **Escolher o regime tributário**:
   - MEI → DAS fixo
   - Simples Nacional → melhor para a maioria das ME/EPP
   - Lucro Presumido → faturamento alto, margem alta
   - Lucro Real → obrigatório acima de R$ 78mi ou prejuízo recorrente

3. **Escolher o CNAE** (Classificação Nacional de Atividades Econômicas):
   - Afeta alíquota do ISS, elegibilidade ao Simples, fiscal municipal
   - Até 3 CNAEs secundários podem ser registrados

4. **Registrar na Junta Comercial** (JUCESP em SP):
   - Contrato Social ou Declaração de Firma Individual
   - Custo: R$ 200–800 dependendo do estado
   - Prazo: 3–30 dias úteis

5. **Obter CNPJ** (via integração Junta ↔ Receita Federal):
   - Automático após registro na Junta
   - Ou via Portal REDESIM

6. **Inscrição Estadual** (se houver comércio ou indústria):
   - SEFAZ do estado
   - Para serviços puros: geralmente não obrigatória

7. **Inscrição Municipal / Alvará**:
   - Cadastro de Contribuintes Mobiliários (CCM)
   - Alvará de Funcionamento / Localização
   - Vistoria sanitária/bombeiros (dependendo da atividade)

8. **Opção pelo Simples Nacional**:
   - Prazo: até o último dia útil de **janeiro** para novas empresas (30 dias após abertura)
   - Via Portal Simples Nacional

### 14.2 Documentos necessários para abertura (LTDA)

```
Sócios:
- RG e CPF
- Comprovante de residência atualizado
- Certidão de casamento (se aplicável)
- Qualificação profissional (diploma, CRO, CRM, OAB, etc. — se regulamentada)

Empresa:
- Contrato Social (redigido pelo contador)
- Endereço do estabelecimento
- Contrato de locação ou declaração de proprietário
- IPTU do imóvel (para alvará)
```

### 14.3 Custos estimados de abertura (2026)

| Item | Custo estimado |
|------|---------------|
| Junta Comercial (SP) | R$ 250–600 |
| Alvará Municipal (SP) | R$ 0–1.500 |
| Honorários contador (abertura) | R$ 500–2.000 |
| Certificado Digital A1 (e-CNPJ) | R$ 200–400 |
| **Total estimado** | **R$ 950–4.500** |

### 14.4 Tempo médio de abertura por estado

| Estado | Tempo médio |
|--------|-------------|
| São Paulo | 3–7 dias úteis |
| Rio de Janeiro | 7–15 dias úteis |
| Minas Gerais | 5–10 dias úteis |
| Outros estados | 10–30 dias úteis |

---

## MÓDULO 15 — ESCRITURAÇÃO CONTÁBIL: O NÚCLEO DO TRABALHO

### 15.1 O que é escrituração

É o registro cronológico de todas as operações que afetam o patrimônio da empresa:
- Vendas e recebimentos
- Compras e pagamentos
- Empréstimos e financiamentos
- Depreciações de ativos
- Folha de pagamento

**Base legal:** Art. 1.179 Código Civil + NBC TG 1000 (Normas Brasileiras de Contabilidade para PMEs)

### 15.2 Livros Obrigatórios

| Livro | Para quem | Conteúdo |
|-------|-----------|----------|
| **Livro Diário** | Lucro Real obrigatório; outros recomendado | Registro cronológico de todas as operações |
| **Livro Razão** | Complementar ao Diário | Agrupamento por conta contábil |
| **Livro Caixa** | Autônomos/MEI | Entradas e saídas de caixa |
| **Livro de Apuração do Lucro Real (LALUR)** | Lucro Real | Ajustes do lucro contábil para tributário |
| **Livro de Inventário** | Comércio/Indústria | Controle de estoque |

### 15.3 Plano de Contas Padrão (PME)

```
ATIVO
  1.1 Ativo Circulante
    1.1.1 Caixa e Equivalentes
    1.1.2 Contas a Receber
    1.1.3 Estoques
    1.1.4 Impostos a Recuperar
  1.2 Ativo Não Circulante
    1.2.1 Imobilizado (máquinas, veículos, computadores)
    1.2.2 Intangível (software, marca, patente)

PASSIVO
  2.1 Passivo Circulante
    2.1.1 Fornecedores
    2.1.2 Salários a Pagar
    2.1.3 Impostos a Pagar
    2.1.4 Empréstimos de Curto Prazo
  2.2 Passivo Não Circulante
    2.2.1 Empréstimos de Longo Prazo
  2.3 Patrimônio Líquido
    2.3.1 Capital Social
    2.3.2 Lucros/Prejuízos Acumulados
    2.3.3 Reservas

RECEITAS
  3.1 Receita Bruta de Vendas/Serviços
  3.2 Deduções (impostos sobre receita)
  3.3 Receita Líquida

DESPESAS
  4.1 Custo dos Serviços/Mercadorias
  4.2 Despesas Operacionais
  4.3 Despesas Financeiras
```

---

## MÓDULO 16 — FOLHA DE PAGAMENTO: DO CÁLCULO AO eSocial

### 16.1 Salário Mínimo 2026 (confirmado gov.br/eSocial)

**R$ 1.621,00** (a partir de 1º de janeiro de 2026)

### 16.2 Encargos Patronais — O que a Empresa Paga

| Encargo | Alíquota | Base de Cálculo |
|---------|---------|-----------------|
| INSS Patronal | 20% | Sobre salário bruto |
| RAT (Risco Acidente Trabalho) | 1%, 2% ou 3% | Conforme grau de risco da atividade |
| FGTS | 8% | Sobre salário bruto |
| Salário Educação | 2,5% | Sobre folha |
| INCRA | 0,2% | Sobre folha |
| SENAI/SESI/SESC/SENAC | 1,0% a 1,5% | Conforme atividade |
| SEBRAE | 0,6% | Sobre folha |
| **Total aprox.** | **~33–38%** | Sobre salário |

> ⚠️ Simples Nacional: CPP (previdência patronal) está incluída no DAS. Não paga INSS patronal separado — **exceto Anexo IV**.

### 16.3 Descontos do Funcionário (Salário Bruto → Líquido)

**Tabela INSS Funcionário 2026 (alíquota progressiva):**

| Faixa Salarial | Alíquota |
|---------------|---------|
| Até R$ 1.518,00 | 7,5% |
| De R$ 1.518,01 a R$ 2.793,88 | 9,0% |
| De R$ 2.793,89 a R$ 4.190,83 | 12,0% |
| De R$ 4.190,84 a R$ 8.157,41 | 14,0% |
| Acima de R$ 8.157,41 | Teto (fixo sobre teto: R$ 908,86) |

**IRRF sobre salário:** tabela progressiva (isento até R$ 2.259,20/mês)

**Exemplo de cálculo completo:**
```
Salário bruto:          R$ 3.000,00
(-) INSS (9% + 12%):   R$   262,38  (progressivo)
(=) Base IRRF:          R$ 2.737,62
(-) IRRF (7,5%):        R$    37,64  (após deduções)
(=) Salário líquido:    R$ 2.700,00 (aprox.)

Custo empresa:
Salário:                R$ 3.000,00
(+) INSS 20%:           R$   600,00
(+) FGTS 8%:            R$   240,00
(+) RAT 2%:             R$    60,00
(+) Terceiros ~3%:      R$    90,00
Total custo empresa:    R$ 3.990,00 (~133% do salário)
```

### 16.4 Obrigações Mensais da Folha

| Prazo | Obrigação | Como |
|-------|-----------|------|
| Até dia 7 do mês seguinte | FGTS Digital (competência anterior) | app.fgts.gov.br |
| Até dia 20 | INSS (GPS ou via eSocial) | eSocial + GNRE |
| Até dia 20 | IRRF sobre salários (DARF cód. 0561) | e-CAC |
| Até dia 7 | eSocial S-1200 (remuneração) | Portal eSocial |
| Mensalmente | Contracheque/Recibo para o funcionário | Obrigatório |

### 16.5 eSocial — Sistema de Escrituração Digital

**Leiaute atual:** v. S-1.3 (NT 06/2026) — confirmado gov.br

**Eventos principais:**

| Evento | O que informa |
|--------|---------------|
| S-1000 | Dados do empregador (cadastro) |
| S-1005 | Tabela de estabelecimentos |
| S-2200 | Admissão de empregado |
| S-2206 | Alteração contratual (salário, cargo, função) |
| S-2230 | Afastamento (atestado, INSS, licença) |
| S-2299 | Desligamento (demissão, pedido de demissão, morte) |
| S-1200 | Remuneração do período (folha) |
| S-1210 | Pagamentos de rendimentos PF |
| S-1202 | Remuneração servidor público |
| S-5001 | Consolidação contribuições por trabalhador |
| S-5011 | Consolidação da folha |

**FGTS Digital:** Obrigatório desde março/2024. Substituiu a GFIP. Guia gerada automaticamente via eSocial e paga pelo app.fgts.gov.br.

### 16.6 Eventos Trabalhistas e Prazos Críticos

| Evento | Prazo | O que fazer |
|--------|-------|-------------|
| Admissão | Antes do início das atividades | eSocial S-2200 + CTPS + exame admissional |
| Férias | Avisar 30 dias antes | Aviso de férias assinado |
| 13º salário (1ª parcela) | Novembro (até dia 30) | Folha especial |
| 13º salário (2ª parcela) | Dezembro (até dia 20) | Folha especial + INSS + IRRF |
| Rescisão (pedido demissão) | Até 10 dias após aviso | Termo + TRCT assinado |
| Rescisão (demissão sem justa causa) | Até 10 dias | TRCT + FGTS + multa 40% |
| Rescisão (demissão justa causa) | Até 10 dias | TRCT (sem saque FGTS) |

---

## MÓDULO 17 — DEMONSTRAÇÕES FINANCEIRAS PARA EMPRESAS

### 17.1 O que são e por que importam

Documentos que traduzem a saúde financeira da empresa em números padronizados. Obrigatórios para Lucro Real (anual via ECD/SPED). Recomendados para todos.

### 17.2 Balanço Patrimonial (BP)

Fotografia do patrimônio em uma data específica (geralmente 31/12).

```
ATIVO                           PASSIVO + PL
────────────────────────────────────────────────────────
Ativo Circulante:               Passivo Circulante:
  Caixa: R$ 50.000               Fornecedores: R$ 30.000
  Clientes: R$ 80.000            Salários: R$ 15.000
  Estoques: R$ 20.000            Impostos: R$ 10.000
                                 FGTS: R$ 5.000

Ativo Não Circulante:           Passivo Não Circulante:
  Computadores: R$ 40.000        Empréstimo LP: R$ 80.000
  Veículos: R$ 60.000
                                Patrimônio Líquido:
                                 Capital: R$ 50.000
                                 Lucros: R$ 60.000

TOTAL ATIVO: R$ 250.000         TOTAL P+PL: R$ 250.000
```

### 17.3 DRE — Demonstração do Resultado do Exercício

Mostra o lucro/prejuízo do período.

```
(+) Receita Bruta de Serviços:           R$ 500.000
(-) Impostos sobre receita (ISS, DAS):   R$ (30.000)
(=) Receita Líquida:                     R$ 470.000

(-) Custo dos Serviços (CPV/CSP):        R$ (180.000)
(=) Lucro Bruto:                         R$ 290.000

(-) Despesas Operacionais:               R$ (120.000)
   - Salários e encargos: R$ 80.000
   - Aluguel: R$ 20.000
   - Software/Cloud: R$ 15.000
   - Outros: R$ 5.000

(-) Despesas Financeiras:                R$ (10.000)
(=) Lucro Antes do IR (LAIR):            R$ 160.000

(-) IRPJ (se Lucro Presumido/Real):      R$ (24.000)
(-) CSLL:                                R$ (14.400)
(=) Lucro Líquido:                       R$ 121.600
```

### 17.4 DFC — Demonstração do Fluxo de Caixa

Essencial para gestão: mostra o dinheiro que ENTROU e SAIU (diferente do lucro contábil).

**3 categorias:**
- **Operacional:** receitas e pagamentos do dia a dia
- **Investimento:** compra/venda de ativos fixos
- **Financiamento:** empréstimos, dividendos, aporte de sócios

### 17.5 Indicadores Financeiros que o Contador Calcula

| Indicador | Fórmula | Referência saudável |
|-----------|---------|---------------------|
| Liquidez Corrente | Ativo Circulante / Passivo Circulante | ≥ 1,5 |
| Margem Líquida | Lucro Líquido / Receita Líquida | Varia por setor |
| Giro do Ativo | Receita / Ativo Total | ≥ 1 |
| Endividamento | Passivo Total / Patrimônio Líquido | ≤ 1 (conservador) |
| EBITDA | Lucro + Juros + Depr. + Amort. | Base de avaliação |
| Prazo Médio Recebimento | Clientes / Receita × 30 | Quanto menor, melhor |
| Prazo Médio Pagamento | Fornecedores / Compras × 30 | Quanto maior, melhor |

---

## MÓDULO 18 — PLANEJAMENTO TRIBUTÁRIO: COMO O CONTADOR AJUDA A PAGAR MENOS (LEGALMENTE)

### 18.1 Escolha do Regime — A Decisão mais Importante

A cada virada de ano, o contador deve avaliar:

**Para empresas de serviços:**

```
Receita anual até R$ 360.000:
→ Simples Nacional quase sempre vantajoso

Receita R$ 360.001 a R$ 4.800.000:
→ Comparar Simples vs. Lucro Presumido
→ Calcular Fator R (folha ÷ receita)
→ Se Fator R ≥ 28%: Simples Anexo III (6%)
→ Se Fator R < 28%: Simples Anexo V (15,5%) vs. Presumido (~14-17%)

Receita acima de R$ 4.800.000:
→ Lucro Presumido ou Lucro Real obrigatório
```

### 18.2 Simulação de Regime — Exemplo Prático

**Empresa de consultoria, R$ 2.000.000/ano, folha R$ 400.000:**

```
Fator R = R$400.000 / R$2.000.000 = 20% → Anexo V

OPÇÃO A — Simples Anexo V (1ª faixa 5):
RBT12 = R$ 2.000.000 → Alíquota nominal 21%, parcela R$ 125.640
Alíquota efetiva = (2.000.000 × 21% - 125.640) / 2.000.000 = 14,72%
DAS anual: R$ 294.400

OPÇÃO B — Lucro Presumido:
IRPJ = 32% × R$2.000.000 × 15% = R$ 96.000
CSLL = 32% × R$2.000.000 × 9% = R$ 57.600
PIS = R$ 2.000.000 × 0,65% = R$ 13.000
COFINS = R$ 2.000.000 × 3% = R$ 60.000
ISS = R$ 2.000.000 × 3% (média SP) = R$ 60.000
INSS patronal = R$ 400.000 × 20% = R$ 80.000
Total: R$ 366.600

→ Simples mais vantajoso: economia de R$ 72.200/ano!
```

### 18.3 Pró-labore vs. Distribuição de Lucros

**Pró-labore:** tributado como renda do trabalho (IR + INSS)
**Distribuição de lucros:** isenta de IR para sócios (LC 123/2006, Art. 14)

**Estratégia:** minimizar pró-labore (para INSS mínimo) e maximizar distribuição de lucros.

**Limite do pró-labore mínimo:**
- Não há mínimo legal definido para sócios
- Recomendação prática: pelo menos 1 salário mínimo (R$ 1.621,00) para não chamar atenção
- Para calcular Fator R: pró-labore de sócios é computado na folha

### 18.4 Créditos e Recuperação Tributária

O contador pode identificar impostos pagos a mais nos últimos **5 anos** (prazo prescricional) e solicitar restituição/compensação via:
- **PERD/COMP** (Pedido Eletrônico de Restituição, Ressarcimento e Compensação) no e-CAC
- Compensação com tributos futuros (mesmo código ou não, depende do tipo)

**Exemplos comuns de créditos recuperáveis:**
- ISS retido indevidamente por tomador de MEI/Simples
- INSS sobre pró-labore recolhido em excesso
- PIS/COFINS de regime cumulativo vs. não-cumulativo

---

## MÓDULO 19 — CERTIDÕES E REGULARIDADE FISCAL

### 19.1 Certidões Necessárias e Como Obter

| Certidão | Órgão | Prazo validade | Como obter |
|---------|-------|----------------|------------|
| **CND Federal** (tributos federais) | Receita Federal | 180 dias | receita.fazenda.gov.br |
| **CPEND** (tributos + INSS) | Receita + PGFN | 180 dias | receita.fazenda.gov.br |
| **CRF** (FGTS) | CEF/Ministério Trabalho | 30 dias | trabalhadores.caixa.gov.br |
| **CND Estadual** (ICMS) | SEFAZ do estado | Varia | SEFAZ-SP, SEFAZ-MG, etc. |
| **CND Municipal** (ISS, IPTU) | Prefeitura | Varia | Prefeitura municipal |
| **Certidão de Distribuição** | TJ do estado | 30 dias | TJSP, TJMG, etc. |
| **Certidão de Falência** | Cartório/TJ | 30 dias | Cartório local |

### 19.2 Quando as Certidões são Exigidas

- Participação em licitações públicas
- Abertura de conta bancária PJ
- Solicitação de empréstimos/financiamentos
- Novos contratos com empresas grandes
- Emissão de notas para alguns tomadores
- Distribuição de lucros (recomendado)
- Venda de participação societária

### 19.3 Como Regularizar Débitos

**Parcelamento de débitos federais:**
- Via e-CAC: `Meus débitos → Negociar dívidas`
- Programas especiais: REFIS, PERT (quando disponíveis)
- Parcelamento padrão: 60x (sem desconto) ou programas com redução de multas

**Dívida Ativa da União (PGFN):**
- Se virou dívida ativa: acessar Regularize (regularize.pgfn.gov.br)
- Podem oferecer desconto de até 100% em juros e multas (Transação Tributária)

---

## MÓDULO 20 — ENCERRAMENTO DE EMPRESA

### 20.1 Quando e Como Encerrar

**Situações:**
- Encerramento voluntário (empresa não deu certo ou negócio finalizado)
- Cancelamento por inatividade (Receita cancela CNPJs inativos por 5+ anos)

**Passo a passo:**

```
1. QUITAR TODOS OS DÉBITOS
   → Tributários (Receita Federal, estado, município)
   → Trabalhistas (funcionários, INSS, FGTS)
   → Comerciais (fornecedores)

2. BAIXA DA INSCRIÇÃO MUNICIPAL
   → Comunicar encerramento na prefeitura
   → Solicitar certidão de quitação ISS

3. BAIXA DA INSCRIÇÃO ESTADUAL (se houver)
   → SEFAZ do estado
   → Encerrar regime de ICMS

4. BAIXA NA RECEITA FEDERAL (CNPJ)
   → Via REDESIM / Portal Gov.br
   → Apresentar DTE (Domicílio Tributário Eletrônico)

5. BAIXA NA JUNTA COMERCIAL
   → Distrato Social assinado (LTDA)
   → Registro do encerramento

6. ENCERRAR OBRIGAÇÕES ACESSÓRIAS
   → Última DEFIS ou DASN-SIMEI
   → ECF final (Lucro Real)
   → eSocial: evento de encerramento

7. ENCERRAR CONTA BANCÁRIA PJ
   → Após confirmação da baixa
```

**Prazo total estimado:** 30–180 dias (dependendo de pendências)

### 20.2 MEI — Baixa Simplificada

MEI pode encerrar diretamente no Portal do Empreendedor (gov.br/mei):
- Clicar em "Baixa da Empresa"
- Informar faturamento até a data
- Sem necessidade de contador

**Custo:** Gratuito para MEI  
**Prazo:** Imediato (CNPJ cancelado no dia)

---

## MÓDULO 21 — O QUE O CONTÁBIL SPEC PODE FAZER (CAPACIDADES)

### 21.1 O que o especialista consegue realizar diretamente

| Capacidade | Como executa |
|------------|-------------|
| Orientar sobre abertura de empresa | Tipo jurídico, regime, CNAEs, documentos — orientação completa |
| Calcular carga tributária | Simulação Simples vs. Presumido vs. Real com números reais |
| Calcular DAS do Simples | Fórmula com RBT12, alíquota efetiva, faixas corretas |
| Calcular folha de pagamento | Salário bruto → líquido com INSS e IRRF |
| Calcular custo total de funcionário | Incluindo todos os encargos patronais |
| Orientar sobre obrigações acessórias | Calendário fiscal completo, prazos, o que enviar |
| Identificar retenções indevidas | MEI/Simples: não retém IRRF/CSLL/PIS/COFINS |
| Orientar sobre DASN-SIMEI | Prazo, o que declarar, penalidades |
| Orientar sobre IRPF | Quem declara, prazo, distribuição de lucros, como declarar MEI |
| Orientar sobre NFS-e | cTribNac correto, campos XML, erros comuns |
| Identificar otimização tributária | 8 casos mapeados com economia potencial |
| Orientar sobre certidões | Quais emitir, onde, prazo de validade |
| Orientar sobre encerramento | Passo a passo completo |
| Explicar termos contábeis | Balanço, DRE, Patrimônio Líquido, EBITDA, etc. |
| Orientar sobre eSocial | Eventos, prazos, o que cada evento faz |
| Calcular multas e penalidades | Por atraso de DAS, DASN-SIMEI não entregue, etc. |

### 21.2 O que requer confirmação profissional

> O Contábil Spec orienta com base no conhecimento técnico consolidado.
> Ações concretas que afetam patrimônio (registrar livros, assinar documentos, 
> enviar declarações, emitir certidões) devem ser realizadas por contador 
> registrado no CRC.

| Situação | Orientação do Spec | Ação final |
|----------|-------------------|------------|
| Calcular DAS | ✅ Faz o cálculo | ✅ Empresa implementa |
| Identificar regime ideal | ✅ Simula e orienta | Contador confirma e registra |
| Orientar folha de pagamento | ✅ Cálculo e explicação | RH/contador executa |
| Planejamento tributário | ✅ Identifica oportunidades | Contador implementa legalmente |
| Redigir Contrato Social | ❌ Não redige documentos legais | Contador ou advogado |
| Assinar ECD/ECF | ❌ Requer CRC ativo | Contador habilitado |

---

## MÓDULO 22 — GLOSSÁRIO CONTÁBIL COMPLETO

| Termo | Definição |
|-------|-----------|
| **Ativo** | Bens e direitos da empresa (o que ela tem/é devido a ela) |
| **Passivo** | Obrigações da empresa (o que ela deve a terceiros) |
| **Patrimônio Líquido** | Ativo − Passivo = riqueza própria dos sócios |
| **Balanço Patrimonial** | Foto do patrimônio em data específica |
| **DRE** | Demonstração do Resultado: receitas menos despesas = lucro |
| **DFC** | Demonstração do Fluxo de Caixa: dinheiro real que entrou/saiu |
| **EBITDA** | Lucro antes de juros, impostos, depreciação e amortização |
| **Capital de Giro** | Dinheiro disponível para operação do dia a dia |
| **Liquidez** | Capacidade de pagar obrigações no prazo |
| **Pró-labore** | Remuneração dos sócios pelo trabalho na empresa (tributável) |
| **Distribuição de Lucros** | Participação nos resultados da empresa (isenta de IR) |
| **Depreciação** | Perda de valor de ativos ao longo do tempo |
| **Regime de Competência** | Registra receitas/despesas quando geradas, não quando pagas |
| **Regime de Caixa** | Registra somente entradas e saídas efetivas de dinheiro |
| **RAT** | Risco Acidente de Trabalho — encargo patronal (1%, 2% ou 3%) |
| **FAP** | Fator Acidentário de Prevenção — multiplica o RAT (0,5 a 2,0) |
| **TRCT** | Termo de Rescisão do Contrato de Trabalho |
| **GFIP** | Substituída pelo FGTS Digital (desde março/2024) |
| **SPED** | Sistema Público de Escrituração Digital |
| **ECD** | Escrituração Contábil Digital (substitui Livro Diário em papel) |
| **ECF** | Escrituração Contábil Fiscal (substitui DIPJ) |
| **DCTF** | Declaração de Débitos e Créditos Tributários Federais |
| **DIRF** | Declaração do Imposto de Renda Retido na Fonte |
| **REDESIM** | Rede Nacional para a Simplificação do Registro de Empresas |
| **CRC** | Conselho Regional de Contabilidade |
| **CFC** | Conselho Federal de Contabilidade |

---

*Base v2 compilada em 17/03/2026. Fontes verificadas: LC 123/2006, Código Civil (L10.406/2002), eSocial NT 06/2026, FGTS Digital gov.br, Nubank Blog (contabilidade), tabelas oficiais Receita Federal 2026.*
