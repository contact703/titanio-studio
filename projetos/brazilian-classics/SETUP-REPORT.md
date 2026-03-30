# 📚 Brazilian Classics Collection — Setup Report

> **Data:** 27/03/2026 22:15 BRT | **Status:** ✅ COMPLETO

---

## 🔄 Workflows N8n Criados

### 1. Tradutor Literário
| Campo | Valor |
|-------|-------|
| **ID** | `06C4w3q8g0SCYiim` |
| **Nome** | Tradutor Literário - Brazilian Classics |
| **Endpoint** | `POST http://localhost:5678/webhook/tradutor-literario` |
| **Status** | ✅ Ativo |
| **Nodes** | 8 (Webhook → Prep → Claude → Kimi Router → Gemini Revisão → Validador → Learning → Respond) |

**Pipeline Multi-LLM:**
- **Claude** (claude-sonnet-4): Tradução principal, temp 0.3
- **Kimi Router**: Roteamento para idiomas asiáticos (ZH/JA/KO)
- **Gemini** (gemini-2.5-flash): Revisão de fluência
- **Validador**: Checa comprimento, glossário, texto residual, encoding

**Idiomas:** EN, ES, DE, FR, ZH, JA, KO, RU, AR

### 2. Cover Generator
| Campo | Valor |
|-------|-------|
| **ID** | `uorwR3ikpaJh5BHB` |
| **Nome** | Cover Generator - Brazilian Classics |
| **Endpoint** | `POST http://localhost:5678/webhook/cover-generator` |
| **Status** | ✅ Ativo |
| **Nodes** | 5 (Webhook → Validar Config → Gerar Capa → Parsear → Response) |

**Specs KDP:** 1600×2560px | 300 DPI | JPEG 95% | RGB

---

## 📁 Estrutura de Arquivos

```
projetos/brazilian-classics/
├── SETUP-REPORT.md          ← Este relatório
├── workflow/
│   ├── tradutor-literario.json   ← Export do workflow N8n
│   └── cover-generator.json      ← Export do workflow N8n
├── scripts/
│   └── generate_cover.py         ← Script Python (Pillow) para geração real de capas
├── fonts/                        ← Adicionar: PlayfairDisplay + Raleway
├── output/                       ← Capas geradas
└── assets/                       ← Logo Titanio, imagens de fundo
```

---

## 🧠 Especialistas Atualizados

| Especialista | Lições Adicionadas | Tópicos |
|--------------|-------------------|---------|
| **automation-bot** | +3 | Workflows N8n (tradutor + cover), API key setup |
| **tradutor** | +2 | Pipeline multi-LLM, regras tradução literária |
| **content-writer** | +1 | Projeto Brazilian Classics, autores, pipeline |
| **designer-specialist** | +1 | Specs KDP, layout capa, fontes e cores |

---

## ⚙️ Configuração N8n

### Owner Setup
- **Email:** contact@titaniofilms.com
- **API Key:** JWT token criado (válido 1 ano)
- **Nota:** A API key antiga (`n8n_api_37b62...`) estava inválida. Nova key criada via REST API.

### Como Testar

**Tradução:**
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

**Capa:**
```bash
curl -X POST http://localhost:5678/webhook/cover-generator \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "BARREN LIVES",
    "title_pt": "Vidas Secas",
    "author": "Graciliano Ramos"
  }'
```

---

## ⚠️ Pendências

1. **Fontes**: Baixar PlayfairDisplay-Variable.ttf, PlayfairDisplay-Italic.ttf e Raleway-Variable.ttf para `fonts/`
2. **API Keys nos env vars do N8n**: Configurar `ANTHROPIC_API_KEY` e `GOOGLE_AI_API_KEY` nas variáveis de ambiente do N8n para os nodes HTTP funcionarem
3. **Pillow**: Instalar via `pip install Pillow` para geração real de capas
4. **Imagens de fundo**: Adicionar a `assets/` para capas com background
5. **Logo Titanio**: Adicionar `assets/titanio-logo.png`

---

## 💰 Custos Estimados

| Por capítulo (~3k palavras) | ~$0.42 |
| Por livro (1 idioma) | ~$5.50 |
| Por livro (10 idiomas) | ~$55.00 |

---

*Relatório gerado automaticamente — Titanio Films*
