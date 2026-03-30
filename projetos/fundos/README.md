# Victor Capital — Inteligência de Captação de Recursos
**Titanio Studio | Belo Horizonte + Nova York**

> *"Da busca à entrega do recurso. Sem atalhos."*

---

## O Que É Isso

Sistema completo para gestão de captação de recursos: lê editais, analisa fit com a Titanio, preenche inscrições personalizadas e acompanha processos do início ao fim.

**Não é uma coleção de templates.** Cada edital é analisado individualmente com IA, e o preenchimento é gerado especificamente para aquele edital, no tom certo, com o produto certo, para aquele financiador específico.

---

## Arquitetura

```
projetos/fundos/
├── scripts/
│   ├── perfil_titanio.py      # Dados completos da empresa (base de tudo)
│   ├── analisar-edital.py     # Motor de análise de editais
│   ├── preencher-edital.py    # Motor de preenchimento inteligente
│   ├── pipeline-captacao.py   # Sistema de acompanhamento (estados)
│   └── exemplo-uso.py         # Demonstração do ciclo completo
├── saidas/                    # JSONs e DOCXs gerados automaticamente
├── pipeline/                  # Estado de cada processo de captação
├── data/                      # Dados auxiliares
├── VICTOR-SYSTEM-PROMPT.md    # Identidade e regras do Victor
├── n8n-workflow-victor.json   # Workflow N8n para automação
└── README.md                  # Este arquivo
```

---

## Instalação

```bash
# Dependências básicas
pip install requests beautifulsoup4 anthropic python-docx

# Opcional: para PDFs
pip install pdfplumber

# Configurar API key
export ANTHROPIC_API_KEY="sua-chave-aqui"
```

---

## Uso Rápido

### 1. Testar o sistema completo (modo simulado)
```bash
cd projetos/fundos/scripts
python exemplo-uso.py --modo simulado
```

### 2. Analisar um edital real
```bash
python analisar-edital.py --url https://finep.gov.br/chamadas-publicas/chamadapublica/788
```

### 3. Gerar preenchimento a partir de análise
```bash
python preencher-edital.py --analise ../saidas/analise_finep_20250318.json --formato docx
```

### 4. Gerenciar o pipeline
```bash
# Dashboard visual
python pipeline-captacao.py --dashboard

# Adicionar edital
python pipeline-captacao.py --adicionar \
  --url "https://finep.gov.br/chamada/..." \
  --titulo "FINEP Mulheres Inovadoras 2025" \
  --prazo "30/06/2025"

# Atualizar estado
python pipeline-captacao.py --atualizar --id ABC123 --estado SUBMETIDO

# Listar todos
python pipeline-captacao.py --listar
```

---

## Fluxo do Pipeline

```
DETECTADO
    ↓
ANALISADO (score calculado)
    ↓
APROVADO_PARA_INSCRICAO (score ≥ 50)  ←  ou REPROVADO (score < 50)
    ↓
EM_PREENCHIMENTO (inscrição sendo gerada)
    ↓
SUBMETIDO (após aprovação humana)
    ↓
EM_ANALISE (aguardando resultado)
    ↓
APROVADO / REPROVADO / COMPLEMENTACAO_SOLICITADA
    ↓
EM_RECURSO (se recurso necessário)
    ↓
APROVADO_FINAL
    ↓
CONTRATO_ASSINADO
    ↓
RECURSO_RECEBIDO 💰
```

---

## Score de Fit (0-100)

| Critério | Pontos |
|---|---|
| Empresa elegível | +20 |
| Produto relevante para o tema | +15 |
| Localização/abrangência ok | +15 |
| Histórico é diferencial | +15 |
| Impacto social (se valorizado) | +10 |
| Capacidade técnica comprovada | +10 |
| Fundador internacional | +5 |
| Presença internacional | +5 |
| Restrição que exclui | -20 |
| Prazo impossível | -15 |
| Escopo incompatível | -10 |

**Recomendações:** ≥70 inscrever | 50-69 adaptar | <50 não inscrever

---

## Tom por Tipo de Financiador

| Financiador | Tom | Produto em foco |
|---|---|---|
| FINEP/CNPq | Técnico-científico, P&D | VoxDescriber (inovação) |
| BNDES | Econômico, retorno, escala | Depende do edital |
| BID Lab | Impacto social, ODS, IRIS+ | VoxDescriber (6,5M) |
| Y Combinator | Direto, tração, mercado | VoxDescriber/Gospia |
| ANCINE | Audiovisual, cultural | Portfólio 40 produções |
| Aceleradoras | Pitch, startup, crescimento | Melhor produto para o tema |

---

## N8n — Integração

Importar `n8n-workflow-victor.json` no N8n.

**Webhook de entrada:** `POST /webhook/victor-edital`
```json
{
  "url": "https://finep.gov.br/chamadas-publicas/...",
  "titulo": "Nome do Edital"
}
```

**Fluxo automático:**
1. Recebe URL → Baixa e analisa → Calcula score
2. Score ≥ 60 → Gera preenchimento completo
3. Notifica grupo WhatsApp com resumo + pede aprovação
4. Registra na auditoria local

---

## Regras de Ouro do Victor

- ✅ Nunca submete sem revisão humana
- ✅ Só usa dados reais da Titanio (jamais inventa)
- ✅ Cada inscrição é única, nunca copia de outra
- ❌ Não pega editais incompatíveis (score < 50)
- ❌ Não promete resultados sem evidência

---

## Produtos Titanio (para referência)

| Produto | Categoria | Impacto chave |
|---|---|---|
| VoxDescriber | Acessibilidade/IA | 6,5M brasileiros com deficiência visual |
| Gospia | Cultura/Comunidade/IA | Comunidades religiosas e culturais |
| KidsHQ | Educação/Infantil/IA | Aprendizagem personalizada |
| Portfólio cinema | Audiovisual | 40+ produções, 40 países, 470M espectadores |
| Comerciais IA | Publicidade/IA | Redução de custo + velocidade |

---

*Victor Capital — Titanio Studio | contact@titaniofilms.com*
