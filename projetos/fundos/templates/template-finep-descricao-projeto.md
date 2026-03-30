# Template FINEP — Descrição de Projeto de Inovação
**Empresa:** Titanio Produções Artísticas Ltda (Titanio Studio)
**Produto:** VoxDescriber — Plataforma de Audiodescrição Automática com IA
**Edital-alvo:** FINEP Subvenção Econômica / FAPEMIG / Chamadas de Inovação em IA
**Versão:** 1.0 | **Data:** Março 2026

> 💡 **Instruções de uso:** Substitua os campos marcados com `[PREENCHER]` antes de submeter.
> Os textos em *itálico* são orientações — remova antes de enviar.

---

## 1. IDENTIFICAÇÃO DO PROJETO

**Título:** VoxDescriber — Plataforma de Audiodescrição Automática por Inteligência Artificial para Conteúdo Audiovisual em Português Brasileiro

**Acrônimo:** VOXDESC-AI

**Área do Conhecimento (CNPq):** 1.03.08.00-4 — Sistemas de Computação; 6.08.00.00-2 — Linguística

**Coordenador:** Tiago Arakilian
**Empresa proponente:** Titanio Produções Artísticas Ltda
**CNPJ:** [PREENCHER]
**Endereço:** Savassi, Belo Horizonte, Minas Gerais

**Instituição Parceira (ICT):** [PREENCHER — ex: UFMG, PUC Minas, CEFET-MG]
**Pesquisador Responsável na ICT:** [PREENCHER]

---

## 2. RESUMO EXECUTIVO DO PROJETO (máx. 300 palavras)

O VoxDescriber é um sistema de audiodescrição automatizada baseado em inteligência artificial, desenvolvido pela Titanio Studio para tornar conteúdo audiovisual acessível a pessoas com deficiência visual. O sistema combina modelos de visão computacional, processamento de linguagem natural (NLP) e síntese de voz (TTS) para analisar cenas de vídeo e gerar descrições auditivas precisas em português brasileiro, de forma automática e escalável.

A Titanio Studio traz para este projeto 20 anos de expertise em produção audiovisual — 40+ produções distribuídas em mais de 40 países, exibidas para mais de 470 milhões de espectadores, com presença em festivais como Sundance, Berlinale, Cannes e TIFF. Essa trajetória confere à empresa um entendimento único sobre linguagem audiovisual e narrativa, essencial para desenvolver uma solução de audiodescrição que seja tecnicamente precisa e artisticamente coerente.

O projeto busca financiamento de R$ 500.000 para desenvolver a versão 2.0 do VoxDescriber ao longo de 18 meses, elevando a acurácia semântica de 74% (protótipo atual) para 88% em corpus de validação independente, e realizando um piloto com 3 produtoras de conteúdo, processando mínimo de 200 horas de vídeo.

O impacto social é direto: os 6,5 milhões de brasileiros com deficiência visual (IBGE, 2023) têm acesso hoje a menos de 3% do conteúdo audiovisual produzido no país (ANCINE, 2024). O VoxDescriber pode reduzir o custo de produção de audiodescrição de R$ 1.200/hora (processo manual) para R$ 120/hora (processo automatizado), viabilizando economicamente a acessibilidade para emissoras, plataformas de streaming e produtoras independentes.

---

## 3. PROBLEMA E OPORTUNIDADE

### 3.1 Contexto e Justificativa

O Brasil possui 6,5 milhões de pessoas com deficiência visual, sendo 506 mil cegas e 6 milhões com baixa visão (IBGE, Censo Demográfico 2022). Essa população tem direito legalmente garantido à audiodescrição em conteúdo audiovisual pela Lei Brasileira de Inclusão (Lei nº 13.146/2015) e pela regulamentação da ANCINE (Instrução Normativa nº 116/2014).

No entanto, a realidade é outra: menos de 3% do conteúdo audiovisual produzido no Brasil conta com audiodescrição adequada (ANCINE, 2024). A razão é econômica: a produção manual de audiodescrição custa entre R$ 800 e R$ 1.500 por hora de vídeo e demora de 5 a 10 horas de trabalho humano para cada hora de conteúdo. Para uma emissora ou plataforma que produz centenas de horas por mês, esse custo é proibitivo.

A inteligência artificial torna possível resolver esse problema de forma escalável. Avanços recentes em modelos de visão computacional (CLIP, LLaVA, GPT-4V), NLP em português (BERTimbau, Sabiá) e síntese de voz neural (XTTS, Tacotron) abriram uma janela de oportunidade única para o desenvolvimento de sistemas de audiodescrição automática de alta qualidade.

### 3.2 Lacuna Tecnológica (Technology Gap)

As soluções existentes de audiodescrição automática para o português brasileiro são inexistentes ou inadequadas:

- **Soluções internacionais** (Microsoft Video Indexer, Amazon Rekognition): funcionam bem em inglês mas apresentam qualidade insuficiente em português, com erros semânticos que comprometem a experiência do usuário
- **Soluções nacionais**: inexistentes no mercado comercial; existem pesquisas acadêmicas isoladas sem produto viável
- **VoxDescriber (posição atual)**: único produto comercial em desenvolvimento para audiodescrição automática em PT-BR, em estágio de protótipo (TRL 4)

O projeto propõe elevar o VoxDescriber do TRL 4 (validação em laboratório) para o TRL 7 (demonstração em ambiente operacional real) ao longo de 18 meses.

### 3.3 Oportunidade de Mercado

| Segmento | Volume Estimado | Potencial de Receita Anual |
|----------|----------------|--------------------------|
| Emissoras de TV abertas e fechadas | 180 emissoras | R$ 8M |
| Plataformas de streaming (BR) | 15 plataformas | R$ 3M |
| Produtoras de conteúdo educacional | 500+ empresas | R$ 12M |
| Conteúdo religioso (nicho da Titanio) | 50+ canais | R$ 2M |
| **Total TAM (Brasil)** | | **R$ 25M/ano** |

---

## 4. DESCRIÇÃO DA SOLUÇÃO TÉCNICA

### 4.1 O VoxDescriber — Arquitetura Técnica

O VoxDescriber é uma plataforma SaaS que processa vídeos via API e retorna faixas de audiodescrição em formato ADO (Audio Description Only) compatível com padrões internacionais (ITC-AD).

**Pipeline tecnológico:**

```
Entrada de vídeo
    ↓
[Módulo 1] Análise de cena (visão computacional)
    Modelo: fine-tuned LLaVA + CLIP
    Output: descrição estruturada de cada cena
    ↓
[Módulo 2] Geração de texto (NLP)
    Modelo: BERTimbau + GPT-4 (PT-BR)
    Output: texto de audiodescrição natural e coerente
    ↓
[Módulo 3] Síntese de voz (TTS)
    Modelo: XTTS v2 (voz neural em PT-BR)
    Output: faixa de áudio .mp3/.wav
    ↓
[Módulo 4] Sincronização temporal
    Alinha descrições com janelas de silêncio no vídeo
    Output: faixa AD sincronizada com timecode
    ↓
Saída: arquivo de vídeo com AD integrada
```

### 4.2 Diferenciais Tecnológicos

1. **Sensibilidade narrativa:** O modelo foi treinado com dados de audiodescrição humana de alta qualidade, incluindo obras premiadas da Titanio, resultando em descrições mais poéticas e contextualmente ricas
2. **Português brasileiro nativo:** Dataset de treinamento em PT-BR, com expressões regionais e referências culturais brasileiras
3. **Integração audiovisual profissional:** Respeita convenções técnicas de audiodescrição (janelas de silêncio, priorização de informação visual relevante)
4. **Pipeline end-to-end:** Único produto do mercado brasileiro que vai do vídeo bruto à faixa de AD finalizada sem intervenção humana obrigatória

### 4.3 Estado atual do produto (TRL 4)

- Protótipo funcional processando vídeos de até 30 minutos
- Acurácia semântica atual: 74% (validado com 50 amostras)
- Tempo de processamento: 3x o tempo real (ex: 10 min de vídeo = 30 min de processamento)
- Teste com 2 produtoras parceiras em curso

---

## 5. OBJETIVOS SMART

### Objetivo Geral

Desenvolver e validar o VoxDescriber v2.0, sistema de audiodescrição automatizada baseado em IA para conteúdo audiovisual em português brasileiro, elevando a acurácia semântica para ≥88% e processando mínimo de 200 horas de vídeo em piloto com 3 produtoras, em 18 meses.

### Objetivos Específicos

| # | Objetivo | Indicador | Meta | Prazo |
|---|----------|-----------|------|-------|
| OE1 | Aprimorar módulo de visão computacional | Acurácia de identificação de objetos/contexto | ≥92% em dataset de 2.000 cenas | Mês 6 |
| OE2 | Otimizar geração de texto em PT-BR | Score BLEU em corpus validado | ≥0,72 em 200 amostras | Mês 10 |
| OE3 | Reduzir tempo de processamento | Razão tempo de processamento/duração do vídeo | ≤1,5x (de 3x atual) | Mês 12 |
| OE4 | Validar em ambiente real com produtoras | NPS coletado com produtoras piloto | ≥70 | Mês 16 |
| OE5 | Realizar piloto comercial | Horas de conteúdo processadas | ≥200 horas com 3 produtoras | Mês 18 |
| OE6 | Proteger propriedade intelectual | Pedido de patente depositado no INPI | 1 pedido | Mês 15 |

---

## 6. METODOLOGIA

### Fase 1 — Dados e Infraestrutura (Meses 1-4)

**M1-M2 — Curadoria de dataset:**
- Construção de dataset proprietário de audiodescrição em PT-BR com 5.000 pares vídeo-descrição
- Parceria com [ICT PARCEIRA] para coleta e anotação de dados
- Protocolo de anotação desenvolvido com audiodescritor certificado (padrões ABNT NBR 15602)

**M3-M4 — Infraestrutura de treinamento:**
- Configuração de cluster GPU (AWS SageMaker / Azure ML)
- Pipeline de dados automatizado para treinamento contínuo
- Repositório de modelos com controle de versão

### Fase 2 — Desenvolvimento (Meses 3-12)

**M3-M6 — Módulo de Visão Computacional:**
- Fine-tuning do LLaVA-7B com dataset proprietário
- Integração com CLIP para representação semântica de cenas
- Benchmark contra GPT-4V e modelos comerciais

**M5-M10 — Módulo de Geração de Texto:**
- Desenvolvimento de prompt engineering especializado para audiodescrição
- Fine-tuning de modelo de linguagem em PT-BR para o domínio audiovisual
- Avaliação por audiodescritores certificados (padrões ITC-AD)

**M8-M12 — Módulo de TTS e Sincronização:**
- Integração XTTS v2 com voz neural customizada para AD
- Algoritmo de detecção de janelas de silêncio para inserção de AD
- Sincronização automática com timecodes do vídeo

### Fase 3 — Validação e Piloto (Meses 13-18)

**M13-M16 — Testes com usuários finais:**
- Grupos focais com usuários com deficiência visual (mínimo 20 participantes)
- Validação técnica por audiodescritor certificado (ABNT)
- Ajustes baseados em feedback

**M15-M18 — Piloto comercial:**
- Parceria com 3 produtoras de conteúdo (contratos de piloto já em negociação)
- Processamento de 200+ horas de conteúdo real
- Coleta de NPS e métricas de satisfação

### Gestão de Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Dataset insuficiente para treinamento | Média | Alto | Parceria com 2 ICTs para ampliar coleta |
| Qualidade insuficiente do modelo | Média | Alto | Abordagem híbrida: IA + revisão humana opcional |
| Dificuldade em captar produtoras para piloto | Baixa | Médio | Já em negociação com 3 produtoras parceiras |
| Atraso na infraestrutura de GPU | Baixa | Baixo | Créditos Microsoft Azure + AWS como backup |

---

## 7. METAS E INDICADORES

| Meta | Descrição | Indicador de Verificação | Prazo |
|------|-----------|--------------------------|-------|
| M1 | Dataset de treinamento concluído | Relatório técnico + arquivo de dados anotados | Mês 4 |
| M2 | Módulo visão computacional v2 | Acurácia ≥92% em benchmark interno | Mês 6 |
| M3 | Módulo NLP v2 | Score BLEU ≥0,72 (validação externa) | Mês 10 |
| M4 | Sistema integrado v2.0 | Demo funcional end-to-end | Mês 12 |
| M5 | Validação com usuários | Relatório de grupos focais + NPS ≥70 | Mês 16 |
| M6 | Pedido de patente | Protocolo INPI | Mês 15 |
| M7 | Piloto concluído | 200h processadas + relatório de produtoras | Mês 18 |
| M8 | Publicação científica | Artigo submetido em periódico Qualis A2 | Mês 18 |

---

## 8. CRONOGRAMA

| Atividade | M1 | M2 | M3 | M4 | M5 | M6 | M7 | M8 | M9 | M10 | M11 | M12 | M13 | M14 | M15 | M16 | M17 | M18 |
|-----------|----|----|----|----|----|----|----|----|----|----|-----|-----|-----|-----|-----|-----|-----|-----|
| Curadoria de dataset | ██ | ██ | ██ | ██ | | | | | | | | | | | | | | |
| Infraestrutura de treinamento | ██ | ██ | ██ | ██ | | | | | | | | | | | | | | |
| Módulo visão computacional | | | ██ | ██ | ██ | ██ | | | | | | | | | | | | |
| Módulo NLP / geração de texto | | | | | ██ | ██ | ██ | ██ | ██ | ██ | | | | | | | | |
| Módulo TTS e sincronização | | | | | | | | ██ | ██ | ██ | ██ | ██ | | | | | | |
| Integração e testes internos | | | | | | | | | | | ██ | ██ | | | | | | |
| Grupos focais com usuários | | | | | | | | | | | | | ██ | ██ | ██ | ██ | | |
| Pedido de patente (INPI) | | | | | | | | | | | | | | | ██ | | | |
| Piloto comercial (3 produtoras) | | | | | | | | | | | | | | | ██ | ██ | ██ | ██ |
| Relatório final + publicação | | | | | | | | | | | | | | | | | ██ | ██ |

---

## 9. ORÇAMENTO DETALHADO

### 9.1 Recursos Humanos (Custeio)

| Função | Qtd | Dedicação | Salário/mês | Meses | Total |
|--------|-----|-----------|-------------|-------|-------|
| Pesquisador Sênior (IA/NLP) | 1 | 80% | R$ 15.000 | 18 | R$ 216.000 |
| Engenheiro de ML | 1 | 100% | R$ 10.000 | 18 | R$ 180.000 |
| Desenvolvedor Backend | 1 | 60% | R$ 8.000 | 12 | R$ 57.600 |
| Bolsista Mestrado (ICT parceira) | 1 | 100% | R$ 2.200 | 18 | R$ 39.600 |
| Audiodescritor Consultor | 1 | 20% | R$ 5.000 | 12 | R$ 12.000 |
| Coordenador de Projeto | 1 | 30% | R$ 12.000 | 18 | R$ 64.800 |
| **SUBTOTAL RH** | | | | | **R$ 570.000** |

### 9.2 Serviços de Terceiros (Custeio)

| Item | Descrição | Valor |
|------|-----------|-------|
| Consultoria PI (patente) | Elaboração e depósito de pedido de patente INPI | R$ 12.000 |
| Auditoria técnica independente | Validação da acurácia do modelo por instituto externo | R$ 15.000 |
| Grupos focais (pesquisa com usuários) | Organização e condução com pessoas com deficiência visual | R$ 8.000 |
| Tradução técnica (documentação) | Documentação técnica em inglês para expansão | R$ 5.000 |
| **SUBTOTAL SERVIÇOS** | | **R$ 40.000** |

### 9.3 Material de Consumo (Custeio)

| Item | Valor |
|------|-------|
| Licenças de software (anotação, ML, monitoramento) | R$ 18.000 |
| Créditos de computação em nuvem (treinamento) | R$ 25.000 |
| Material de escritório e expediente | R$ 3.000 |
| **SUBTOTAL MATERIAL** | | **R$ 46.000** |

### 9.4 Capital (Equipamentos)

| Item | Valor |
|------|-------|
| Servidor local para inferência (GPU) | R$ 35.000 |
| Equipamentos de captura de áudio (estúdio para TTS) | R$ 9.000 |
| **SUBTOTAL CAPITAL** | | **R$ 44.000** |

### 9.5 Resumo Orçamentário

| Categoria | Valor | % |
|-----------|-------|---|
| Recursos Humanos | R$ 570.000 | 84,2% |
| Serviços Terceiros | R$ 40.000 | 5,9% |
| Material de Consumo | R$ 46.000 | 6,8% |
| Capital | R$ 44.000 | 6,5% |
| **TOTAL DO PROJETO** | **R$ 677.000** | **100%** |
| **Solicitado ao Edital (75%)** | **R$ 500.000** | |
| **Contrapartida Titanio (25%)** | **R$ 177.000** | |

---

## 10. IMPACTO ESPERADO

### 10.1 Impacto Social

**Acesso à informação e cultura:**
- Meta de 18 meses: 200 horas de conteúdo audiodescritor produzidas automaticamente
- Alcance estimado: 150.000 usuários com deficiência visual via plataformas parceiras
- Custo reduzido: de R$ 1.200/hora (manual) para R$ 120/hora (automatizado = 90% de redução)
- Cumprimento facilitado da legislação de acessibilidade para emissoras e produtoras

**Alinhamento com ODS:**
- ODS 10 (Redução das Desigualdades): inclusão de PcD visual no consumo de mídia
- ODS 4 (Educação de Qualidade): acesso a conteúdo educacional audiovisual
- ODS 8 (Trabalho e Crescimento): geração de empregos qualificados em IA/tecnologia em MG

### 10.2 Impacto Econômico

- Geração de 8 empregos diretos qualificados durante o projeto
- Potencial de receita recorrente: R$ 2,5M/ano (ano 3)
- Licenciamento da tecnologia para mercado LATAM (fase posterior)
- Contribuição para o polo de IA de Minas Gerais

### 10.3 Impacto Científico-Tecnológico

- 1 artigo científico em periódico Qualis A2 (NLP/audiodescrição PT-BR)
- 1 pedido de patente no INPI
- Dataset proprietário de audiodescrição em PT-BR (potencial de publicação como recurso aberto)
- Formação de 1 mestrando na área de IA e acessibilidade

---

## 11. EQUIPE

### Tiago Arakilian — Fundador e Coordenador Geral
Cineasta e empreendedor formado pela Universidade Paris-Sorbonne (Paris IV), com especialização em cinema e comunicação. Fundador da Titanio Studio em 2006, responsável por produções distribuídas em 40+ países e exibidas para 470+ milhões de espectadores. Experiência em coproduções internacionais (China, Europa) e gestão de projetos culturais e tecnológicos de grande escala. Lidera a transição da empresa para IA desde 2024.

### [PREENCHER] — Pesquisador Sênior (IA/NLP)
[Inserir currículo resumido: formação, experiência em IA, publicações relevantes]

### [PREENCHER] — Engenheiro de Machine Learning
[Inserir currículo resumido: formação técnica, projetos anteriores]

### [PREENCHER — ICT] — Pesquisador Responsável na Universidade Parceira
[Inserir currículo: titulação, linhas de pesquisa, experiência com projetos empresa-ICT]

---

## 12. EXPERIÊNCIA ANTERIOR EM INOVAÇÃO

A Titanio Studio possui histórico comprovado de inovação tecnológica aplicada ao audiovisual:

- **Kids & Glory (2018):** Primeira coprodução BRICS da história do cinema — 250 milhões de espectadores na CCTV, envolvendo integração tecnológica com parceiros chineses
- **VoxDescriber v1.0 (2024-2025):** Protótipo funcional de audiodescrição por IA, desenvolvido internamente com recursos próprios, atualmente em TRL 4 com dois pilotos em andamento
- **Gospia e KidsHQ (2024-2025):** Aplicativos com IA desenvolvidos e publicados nas lojas Google Play e App Store, demonstrando capacidade de desenvolvimento e lançamento de produtos tecnológicos
- **Comerciais Generativos (2024-2026):** Produção de conteúdo publicitário usando ferramentas de IA generativa (Midjourney, Sora, RunwayML) para clientes corporativos

---

## APÊNDICE — INFORMAÇÕES COMPLEMENTARES

### Carta de Intenção — Produtoras Piloto

*[ANEXAR cartas de intenção das 3 produtoras que participarão do piloto]*

### Descrição Técnica do Protótipo Atual

*[ANEXAR documentação técnica do VoxDescriber v1.0]*

### Portfólio Audiovisual

*[ANEXAR lista de produções com distribuição internacional e prêmios recebidos]*

---

*Template criado pelo Victor Capital para a Titanio Studio — Março 2026*
*Adaptar conforme edital específico. Revisar com contador antes de submeter.*
