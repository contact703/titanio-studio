# 📚 Great Brazilian Classics Collection
## Arquitetura de Automação N8N — Documentação Técnica

> **Versão:** 1.0 | **Autor:** Titanio Team | **Data:** 27/03/2026
> 
> Apresentação para desenvolvedores sobre os workflows de automação para publicação de clássicos da literatura brasileira em múltiplos idiomas.

---

## 🎯 Visão Geral

O projeto **Great Brazilian Classics Collection** automatiza dois processos principais:

| Workflow | ID | Função |
|----------|-----|--------|
| **Tradutor Literário** | `QNVgctU0Kca9r2VE` | Tradução de livros para 10+ idiomas |
| **Cover Generator** | `cover-generator` | Geração automática de capas KDP |

### Fluxo Completo

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐
│  Texto PT   │───▶│  TRADUTOR N8N   │───▶│ COVER GENERATOR │───▶│  KDP Ready  │
│  (Original) │    │   (7 camadas)   │    │    (Python)     │    │   Package   │
└─────────────┘    └─────────────────┘    └─────────────────┘    └─────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │  Claude + Kimi + Gemini │
              │    (Multi-LLM Chain)    │
              └─────────────────────────┘
```

---

## 🔄 Workflow 1: Tradutor Literário (7 Camadas)

### ID: `QNVgctU0Kca9r2VE`
### Endpoint: `POST http://localhost:5678/webhook/tradutor-literario`

### Arquitetura do Pipeline

```
 ENTRADA                    PROCESSAMENTO                              SAÍDA
    │                            │                                        │
    ▼                            ▼                                        ▼
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│   N1   │──▶│   N2   │──▶│   N3   │──▶│   N4   │──▶│   N5   │──▶│   N6   │──▶│   N7   │
│Webhook │   │ Prep   │   │Claude  │   │ Kimi   │   │Gemini  │   │Validar │   │Learning│
└────────┘   └────────┘   └────────┘   └────────┘   └────────┘   └────────┘   └────────┘
```

### Detalhamento das Camadas

#### **N1 — Webhook (Entrada)**
```json
{
  "texto": "Capítulo 1: A mudança...",
  "idioma_destino": "EN",
  "variante": "US",
  "genero": "literário",
  "glossario": { "sertão": "backlands", "retirante": "refugee" },
  "autor": "Graciliano Ramos",
  "obra": "Vidas Secas",
  "capitulo": 1
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `texto` | string | ✅ | Texto fonte em português |
| `idioma_destino` | string | ✅ | Código: EN, ES, DE, FR, ZH, RU, JA, KO, AR |
| `variante` | string | ❌ | US/UK para EN, simplified/traditional para ZH |
| `genero` | string | ❌ | literário, técnico, informal |
| `glossario` | object | ❌ | Termos específicos pré-definidos |
| `gerar_capa` | boolean | ❌ | Se true, dispara Cover Generator |

---

#### **N2 — Preparador (Prompt Assembly)**

Monta o prompt sistemático com:
- Instruções específicas por idioma
- Contexto da obra e autor
- Glossário de termos regionais
- Regras de preservação de estilo

```javascript
// Exemplo de montagem
const prompt = `
Você é um tradutor literário especializado em ${idioma}.
Obra: "${obra}" de ${autor}
Gênero: Realismo Regional Brasileiro

GLOSSÁRIO OBRIGATÓRIO:
${Object.entries(glossario).map(([k,v]) => `- "${k}" → "${v}"`).join('\n')}

REGRAS:
1. Preservar ritmo e cadência do original
2. Manter registro coloquial onde apropriado
3. Adaptar expressões idiomáticas sem perder significado
4. Manter pontuação estilística do autor

TEXTO PARA TRADUZIR:
${texto}
`;
```

---

#### **N3 — Claude (Tradução Principal)**

| Configuração | Valor |
|--------------|-------|
| **Modelo** | claude-3-opus / claude-sonnet-4 |
| **Temperatura** | 0.3 (consistência) |
| **Max Tokens** | 8000 |
| **API** | Anthropic direto |

**Especialidades:**
- Melhor para EN, ES, DE, FR
- Excelente preservação de nuances literárias
- Compreensão profunda de contexto cultural

---

#### **N4 — Kimi (Idiomas Asiáticos)**

| Configuração | Valor |
|--------------|-------|
| **Modelo** | moonshot-v1-128k |
| **Endpoint** | api.moonshot.ai |
| **API Key** | `sk-fk265...` |

**Especialidades:**
- Chinês (ZH): Simplificado e Tradicional
- Japonês (JA): Honoríficos e Keigo
- Coreano (KO): Níveis de formalidade

**Quando ativado:**
```javascript
const asianLanguages = ['ZH', 'JA', 'KO'];
if (asianLanguages.includes(idioma_destino)) {
  // Roteamento para Kimi
}
```

---

#### **N5 — Gemini (Revisão de Ritmo)**

| Configuração | Valor |
|--------------|-------|
| **Modelo** | gemini-2.5-flash |
| **API Key** | `AIzaSyDr...` |
| **Função** | Revisor de fluência |

**Prompt de revisão:**
```
Revise esta tradução verificando:
1. Fluência natural no idioma alvo
2. Ritmo e cadência preservados
3. Consistência terminológica
4. Erros gramaticais ou de concordância

Retorne APENAS o texto revisado, sem comentários.
```

---

#### **N6 — Validador**

Verificações automáticas:
- ✅ Comprimento compatível (±20% do original)
- ✅ Termos do glossário aplicados
- ✅ Sem texto em português residual
- ✅ Formatação de parágrafos preservada
- ✅ Encoding UTF-8 válido

```javascript
const validations = {
  lengthRatio: translated.length / original.length,
  glossaryHits: countGlossaryUsage(translated, glossario),
  residualPT: detectPortuguese(translated),
  encoding: validateUTF8(translated)
};

if (validations.lengthRatio < 0.7 || validations.lengthRatio > 1.4) {
  throw new Error('Tradução com tamanho suspeito');
}
```

---

#### **N7 — Learning Output**

Salva métricas para aprendizado contínuo:

```json
{
  "timestamp": "2026-03-27T20:00:00Z",
  "obra": "Vidas Secas",
  "capitulo": 1,
  "idioma": "EN",
  "tokens_entrada": 2340,
  "tokens_saida": 2180,
  "tempo_total_ms": 45000,
  "custo_estimado_usd": 0.42,
  "quality_score": 0.94
}
```

---

## 🎨 Workflow 2: Cover Generator

### Endpoint: `POST http://localhost:5678/webhook/cover-generator`

### Arquitetura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Webhook    │───▶│  Validar    │───▶│  Python     │───▶│  Parsear    │───▶│  Resposta   │
│  Request    │    │  Config     │    │  generate   │    │  Resultado  │    │  JSON       │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                                    │
       │                                    ▼
       │                          ┌─────────────────┐
       │                          │   Pillow/PIL    │
       │                          │   Image Proc    │
       │                          └─────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INPUT JSON                                                          │
│  {                                                                   │
│    "title_en": "BARREN LIVES",                                      │
│    "title_pt": "Vidas Secas",                                       │
│    "author": "Graciliano Ramos",                                    │
│    "background_image": "/path/to/sertao.jpg",                       │
│    "collection_label": "GREAT BRAZILIAN CLASSICS COLLECTION"        │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Especificações Técnicas da Capa

| Parâmetro | Valor | Razão |
|-----------|-------|-------|
| **Dimensões** | 1600 × 2560 px | Padrão KDP Kindle |
| **DPI** | 300 | Qualidade impressão |
| **Formato** | JPEG | Requisito KDP |
| **Qualidade** | 95% | Balanço tamanho/qualidade |
| **Cor** | RGB | Requisito digital |

### Script Python: `generate_cover.py`

```python
#!/usr/bin/env python3
"""
Gerador de capas para Great Brazilian Classics Collection
"""

# Dimensões KDP
COVER_W, COVER_H = 1600, 2560
JPEG_QUALITY = 95

# Fontes
FONT_TITLE    = "PlayfairDisplay-Variable.ttf"    # Título EN (serifada elegante)
FONT_SUBTITLE = "PlayfairDisplay-Italic.ttf"      # Título PT (itálico)
FONT_LABEL    = "Raleway-Variable.ttf"            # Collection label
FONT_AUTHOR   = "Raleway-Variable.ttf"            # Nome do autor

# Cores
WHITE     = (255, 255, 255, 255)
GOLD      = (212, 175, 55, 255)      # Detalhes premium
CREAM     = (255, 248, 220, 255)     # Fundos suaves
DARK_OVER = (10, 8, 6)               # Overlay escuro
```

### Layout da Capa

```
┌────────────────────────────────────────┐
│                                        │
│  GREAT BRAZILIAN CLASSICS COLLECTION   │  ← Label (Raleway, gold, topo)
│  ════════════════════════════════════  │  ← Linha decorativa
│                                        │
│                                        │
│                                        │
│              BARREN LIVES              │  ← Título EN (Playfair, grande)
│              ───────────               │
│              Vidas Secas               │  ← Título PT (Playfair Italic)
│                                        │
│                                        │
│                                        │
│          [IMAGEM DE FUNDO]             │  ← Background com overlay escuro
│          (sertão, paisagem)            │
│                                        │
│                                        │
│                                        │
│         GRACILIANO RAMOS               │  ← Autor (Raleway, base)
│                                        │
│              [LOGO]                    │  ← Titanio logo (opcional)
│                                        │
└────────────────────────────────────────┘
```

### Exemplo de Chamada

```bash
curl -X POST http://localhost:5678/webhook/cover-generator \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "BARREN LIVES",
    "title_pt": "Vidas Secas", 
    "author": "Graciliano Ramos",
    "background_image": "/path/to/sertao-landscape.jpg",
    "collection_label": "GREAT BRAZILIAN CLASSICS COLLECTION",
    "overlay_opacity": 120
  }'
```

### Resposta de Sucesso

```json
{
  "success": true,
  "output_path": "/workspace/output/barren-lives-1711569600000.jpg",
  "file_size_kb": 342,
  "title_en": "BARREN LIVES",
  "title_pt": "Vidas Secas",
  "author": "Graciliano Ramos",
  "generated_at": "2026-03-27T20:00:00.000Z"
}
```

---

## 🔗 Integração Entre Workflows

### Fluxo Automatizado Completo

Quando o tradutor finaliza um capítulo e `gerar_capa: true`:

```
                                  ┌─────────────────┐
                                  │   N7 Learning   │
                                  │     Output      │
                                  └────────┬────────┘
                                           │
                                           │ gerar_capa === true?
                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  HTTP Request Node: "Disparar Cover Generator"                      │
│                                                                      │
│  POST http://localhost:5678/webhook/cover-generator                 │
│                                                                      │
│  Body:                                                               │
│  {                                                                   │
│    "title_en": "{{ config.title_en }}",                             │
│    "title_pt": "{{ config.title_pt }}",                             │
│    "author": "{{ config.author }}",                                 │
│    "background_image": "{{ config.background_image }}"              │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Idiomas Suportados

| Código | Idioma | Modelo Principal | Variantes |
|--------|--------|------------------|-----------|
| `EN` | Inglês | Claude | US, UK |
| `ES` | Espanhol | Claude | neutral, LA, ES |
| `DE` | Alemão | Claude | - |
| `FR` | Francês | Claude | FR, CA |
| `ZH` | Chinês | Kimi | simplified, traditional |
| `JA` | Japonês | Kimi | - |
| `KO` | Coreano | Kimi | - |
| `RU` | Russo | Claude | - |
| `AR` | Árabe | Claude | MSA |
| `PT` | Português | - | BR (base) |

---

## 💰 Custos Estimados

### Por Capítulo (~3000 palavras)

| Operação | Custo USD |
|----------|-----------|
| Claude (tradução) | ~$0.30 |
| Kimi (asiáticos) | ~$0.10 |
| Gemini (revisão) | ~$0.02 |
| **Total/capítulo** | **~$0.42** |

### Por Livro Completo (~25k palavras, 13 capítulos)

| Idioma | Custo |
|--------|-------|
| 1 idioma | ~$5.50 |
| 3 idiomas (EN+ES+DE) | ~$16.50 |
| 10 idiomas | ~$55.00 |

---

## 🚀 Como Executar

### 1. Verificar N8N
```bash
curl http://localhost:5678/healthz
# Deve retornar: {"status":"ok"}
```

### 2. Testar Tradução
```bash
curl -X POST http://localhost:5678/webhook/tradutor-literario \
  -H "Content-Type: application/json" \
  -d '{
    "texto": "A família de retirantes seguia pela estrada poeirenta do sertão.",
    "idioma_destino": "EN",
    "autor": "Graciliano Ramos",
    "obra": "Vidas Secas"
  }'
```

### 3. Testar Geração de Capa
```bash
curl -X POST http://localhost:5678/webhook/cover-generator \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "TEST COVER",
    "title_pt": "Capa Teste",
    "author": "Autor Teste",
    "background_image": "/path/to/image.jpg"
  }'
```

---

## 📁 Estrutura de Arquivos

```
projetos/brazilian-classics/
├── workflow/
│   ├── tradutor-cover-integration.md    # Documentação de integração
│   └── cover-generator-workflow.json    # Exportação do workflow N8N
├── scripts/
│   ├── generate_cover.py                # Script Python de geração
│   └── batch_covers.py                  # Processamento em lote
├── fonts/
│   ├── PlayfairDisplay-Variable.ttf     # Fonte título
│   ├── PlayfairDisplay-Italic.ttf       # Fonte subtítulo
│   └── Raleway-Variable.ttf             # Fonte labels
├── output/                              # Capas geradas
└── assets/
    └── titanio-logo.png                 # Logo da coleção
```

---

## 🔒 Segurança

- ✅ Sanitização de inputs (sem shell injection)
- ✅ Validação de campos obrigatórios
- ✅ Cleanup de arquivos temporários
- ✅ Rate limiting no webhook
- ✅ Logs de auditoria

---

## 📞 Contato

**Equipe Titanio**
- Repositório: GitHub (contact@titaniofilms.com)
- Dashboard: http://localhost:4444
- N8N: http://localhost:5678

---

*Documento gerado em 27/03/2026 — Titanio Films*
