# BID Lab Application — Titanio Studio / VoxDescriber
**Organization:** IDB Lab (Banco Interamericano de Desarrollo)
**Program:** Innovation Grants for Social Impact in Latin America
**Company:** Titanio Studio | Razão Social: Titanio Produções Artísticas Ltda
**Version:** 1.0 | **Date:** March 2026

> 📋 **Instructions:** The BID Lab uses a development lens — always frame around impact, SDGs, and vulnerable populations. The technology is the *tool*, not the focus. Adapt sections to the specific call you're applying to.

---

## EXECUTIVE SUMMARY

**Organization name:** Titanio Studio (Titanio Produções Artísticas Ltda)

**Country:** Brazil

**City:** Belo Horizonte, Minas Gerais

**Website:** [titanio.studio / voxdescriber.com]

**Contact:** Tiago Arakilian | contact@titaniofilms.com

**Solution name:** VoxDescriber — AI-Powered Audio Description for Visual Accessibility

**One-line pitch:**
VoxDescriber uses AI to automatically generate audio descriptions for video content, making audiovisual media accessible to 65 million visually impaired people in Brazil — at 1/10th the current cost.

**Funding requested:** USD [200.000 — 500.000 — adjust per specific call]

**Project duration:** 24 months

**SDG alignment:** SDG 10 (Reduced Inequalities), SDG 4 (Quality Education), SDG 8 (Decent Work)

---

## 1. PROBLEM STATEMENT

### 1.1 The Problem

In Brazil, 65 million people live with visual impairments — 6.5 million with significant vision loss or total blindness (IBGE Census 2022). These individuals face systematic exclusion from the audiovisual media that increasingly defines modern society: education, news, entertainment, public health communications, and cultural expression.

Brazilian law is clear. The Lei Brasileira de Inclusão (Law 13.146/2015) and ANCINE regulations require audio descriptions (AD) for all broadcast video content. Audio description is the narration that describes visual elements — facial expressions, settings, actions, on-screen text — during natural pauses in dialogue, allowing blind viewers to follow video content.

The law exists. The compliance does not.

**Why not?** Economics. Professional audio description costs R$ 800–1,500 per minute of video (approximately USD 160–300/minute) and requires 5–10 hours of expert human work for each hour of video. For Brazil's media ecosystem — hundreds of TV channels, thousands of streaming shows, millions of educational videos — full compliance would cost billions of dollars annually.

The result: **less than 3% of Brazilian video content has audio descriptions** (ANCINE, 2024). Visually impaired Brazilians are systematically excluded from 97% of the media that shapes education, culture, and civic life.

This is not a problem of will — it's a problem of economics and technology.

### 1.2 Who Bears the Cost

The visually impaired population in Brazil disproportionately includes people from lower-income backgrounds. IBGE data shows that visual impairment rates are 40% higher in families earning below 2 minimum wages. The barriers are therefore doubly exclusionary: those who most need accessible content are those least able to access workarounds (expensive devices, specialized services, personal assistants).

### 1.3 Why Existing Solutions Fail

- **Manual audio description:** Prohibitively expensive; only large broadcasters can partially comply
- **International AI tools (Microsoft, Amazon):** English-optimized; produce low-quality, unnatural Portuguese; no end-to-end pipeline; no Portuguese cultural context
- **Academic research:** Active in Brazilian universities (UFMG, USP) but not productized; no commercial offering
- **Government programs:** Scattered, underfunded, focused on specific content categories only

There is currently no scalable, affordable, Portuguese-native audio description solution available in the Brazilian market.

---

## 2. SOLUTION

### 2.1 What We're Building

VoxDescriber is an AI platform that automatically generates professional-quality audio descriptions for video content in Brazilian Portuguese.

**How it works:**

```
Video input
    ↓
AI scene analysis (computer vision)
    — Identifies objects, people, actions, emotions, settings
    — Understanding narrative context, not just object detection
    ↓
Natural language generation (NLP)
    — Generates natural PT-BR descriptions following ITC-AD standards
    — Adapts style: educational content ≠ entertainment ≠ news
    ↓
Neural speech synthesis (TTS)
    — Human-quality Portuguese voice
    — Matches emotional register of the content
    ↓
Automatic synchronization
    — Detects natural silence windows in original video
    — Inserts descriptions without overlapping dialogue
    ↓
Output: complete accessible video file
```

**Current status:** Functional prototype (Technology Readiness Level 4)
- Processing videos up to 30 minutes
- 74% semantic accuracy in internal benchmarks
- Two pilot partners actively testing

**Project goal:** Reach TRL 7 (operational demonstration) in 24 months with this funding.

### 2.2 Why Titanio Studio

Titanio Studio brings a combination of capabilities unique in this market:

**20 years of audiovisual expertise:**
Founded in 2006 by Tiago Arakilian (Université Paris-Sorbonne), Titanio has produced 40+ productions distributed across 40+ countries, reaching 470+ million viewers. Our productions have been selected at Sundance, Berlinale, Cannes, and TIFF. We co-produced *Kids & Glory* — the first-ever BRICS co-production in cinema history, reaching 250 million viewers on China's CCTV.

This is not incidental. Audio description quality depends on understanding how stories are told visually. Titanio's two decades of storytelling expertise is a competitive moat that no technology startup can replicate.

**AI as core capability (since 2024):**
Titanio placed AI at the center of its creative process in 2024, developing VoxDescriber, Gospia (AI mobile app), KidsHQ (AI parental control app), and generative advertising content. We are a proven AI development team.

**Operating in the target market:**
We have existing relationships with broadcasters, streaming platforms, and content producers across Brazil. VoxDescriber is not being built *for* the market — it's being built *by* someone already inside it.

---

## 3. THEORY OF CHANGE

```
INPUTS
├── IDB Lab Grant: USD [amount]
├── Titanio co-investment: USD [amount] (20% counterpart)
├── Team: 8 professionals (AI, product, audiovisual)
└── Partnerships: [ICT partner], [3 pilot content producers]

    ↓

ACTIVITIES
├── A1: Build dataset — 5,000 annotated video-description pairs (months 1-4)
├── A2: Train/improve AI models — vision, NLP, TTS (months 3-12)
├── A3: Develop end-to-end platform (months 6-18)
├── A4: Pilot with 3 content producers — 200+ hours of content (months 13-24)
├── A5: Community engagement — blind users, audiodescribers, disability orgs (throughout)
└── A6: Publish open-source dataset for PT-BR audio description research (month 20)

    ↓

OUTPUTS (deliverables)
├── O1: VoxDescriber v2.0 — production-ready platform (month 18)
├── O2: 200+ hours of video made accessible via pilots (month 24)
├── O3: 1 patent filed (INPI) for AI-assisted audio description method (month 15)
├── O4: 1 scientific publication on PT-BR audio description AI (month 20)
└── O5: Open dataset published for research community (month 20)

    ↓

SHORT-TERM OUTCOMES (0-24 months)
├── OUT1: 3 content producers capable of affordable AD compliance
├── OUT2: 150,000+ visually impaired users with improved content access via pilots
├── OUT3: AD cost reduced from R$1,200/hour to R$120/hour (90% reduction)
└── OUT4: Business model validated; path to scale established

    ↓

MEDIUM-TERM OUTCOMES (2-5 years)
├── OUT5: VoxDescriber becomes market standard in Brazil (>30% market share)
├── OUT6: Technology licensed to 5+ LATAM countries (Spanish-language expansion)
├── OUT7: 2M+ visually impaired people with meaningfully improved media access
└── OUT8: Brazilian compliance rate for AD increases from 3% to 25%+

    ↓

LONG-TERM IMPACT (5+ years)
└── Visually impaired people in Latin America have equitable access to audiovisual media,
    enabling participation in cultural, educational, and civic life on equal terms
```

### 3.1 Key Assumptions

| Assumption | Evidence/Basis | Risk Level |
|------------|---------------|------------|
| AI can achieve 88%+ accuracy in PT-BR AD | Current 74% prototype; peer research shows 85-90% achievable | Medium |
| Content producers will pay for compliance | Law enforcement increasing; ANCINE fines being issued | Low |
| Visually impaired users will adopt the technology | Community validation planned; no evidence of rejection | Low |
| Business model is sustainable post-grant | R$25M TAM in Brazil; 75% gross margins achievable | Low-Medium |

---

## 4. IMPACT METRICS (IRIS+)

### 4.1 Primary Impact Metrics

| Dimension | Indicator (IRIS+ Code) | Baseline | Year 1 Target | Year 3 Target | Measurement Method |
|-----------|----------------------|---------|--------------|------------|-------------------|
| **Reach** | # individuals directly benefiting (PI9435) | 0 | 150,000 | 2,000,000 | Platform analytics + partner data |
| **Depth — Access** | % of target population with meaningful access | 3% (ANCINE) | 5% | 25% | Industry survey (ANCINE data) |
| **Cost efficiency** | Cost per hour of accessible content produced | R$1,200/h | R$200/h | R$120/h | Internal pricing data |
| **Content volume** | Hours of content made accessible | 0 | 200h | 10,000h | Platform metrics |
| **Gender** | % of female beneficiaries | n/a | 50%+ | 52% | User demographics |
| **Income** | % beneficiaries in low-income households (<2MW) | n/a | 60% | 65% | User survey |

### 4.2 Secondary Impact Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| # content producer partners | 3 (pilot) → 50 (year 3) | CRM data |
| NPS of visually impaired users | ≥70 | User surveys |
| # countries reached (LATAM) | 1 (Brazil) → 5 (year 3) | Business metrics |
| Cost to government of compliance support | Reduction estimated at R$500k/year for public sector content | Government partner data |
| Scientific publications | 1 in year 2 | Publication records |
| Jobs created | 8 direct (project) + 20 indirect | HR records |

### 4.3 SDG Contribution

**SDG 10 — Reduced Inequalities**
- Target 10.2: By 2030, empower and promote the social, economic and political inclusion of all — irrespective of disability
- Indicator: % of visually impaired Brazilians with access to audio-described video content (baseline: 3%, target 24 months: 5%, target 5 years: 25%)

**SDG 4 — Quality Education**
- Target 4.5: Ensure equal access to all levels of education for persons with disabilities
- Indicator: # hours of educational content made accessible (target year 1: 50 hours educational content specifically)

**SDG 8 — Decent Work and Economic Growth**
- Target 8.2: Achieve higher levels of economic productivity through technological upgrading
- Indicator: # jobs created in AI/tech sector in Minas Gerais (target: 8 direct, 20 indirect)

**SDG 17 — Partnerships for the Goals**
- Target 17.16: Multi-stakeholder partnerships for sustainable development
- Indicator: # institutional partnerships (university, content producers, disability organizations)

---

## 5. TEAM

### Tiago Arakilian — CEO & Founder
Filmmaker and entrepreneur educated at Université Paris-Sorbonne (Paris IV, Cinema and Communication). Founded Titanio Studio in 2006, building it into Brazil's leading independent production company with international reach. Personally directed and produced content distributed in 40+ countries to 470M+ viewers. Led Titanio's AI transformation since 2024. Speaks Portuguese, English, and French. Deeply embedded in Brazil's audiovisual ecosystem with existing relationships across broadcasters, distributors, and content platforms.

**Why Tiago is the right person to lead this:**
The intersection of audiovisual storytelling and AI accessibility is exactly his world — not because he pivoted into it, but because Titanio has lived at that intersection for two decades.

### [PREENCHER] — CTO / Lead AI Engineer
[Name, credentials, specific experience with NLP/computer vision/TTS — confirm before submitting]

### [PREENCHER] — Product / Accessibility Lead
[Name, credentials, ideally someone with accessibility expertise or lived experience with visual impairment]

### [PREENCHER] — University Research Partner
[Professor/researcher at UFMG, PUC Minas, or similar — NLP/AI department — confirm partnership]

### Advisory Board (planned)
- [Representative from blind/visually impaired community organization — confirm]
- [Accessibility law expert — confirm]
- [International audio description expert — confirm]

---

## 6. FINANCIAL PROJECTIONS

### 6.1 Project Budget (24 months with IDB Lab Grant)

| Category | IDB Lab (80%) | Titanio Co-investment (20%) | Total |
|----------|--------------|---------------------------|-------|
| Personnel (R&D team) | R$ 456.000 | R$ 114.000 | R$ 570.000 |
| Third-party services | R$ 32.000 | R$ 8.000 | R$ 40.000 |
| Materials & licenses | R$ 36.800 | R$ 9.200 | R$ 46.000 |
| Capital equipment | R$ 35.200 | R$ 8.800 | R$ 44.000 |
| **Total** | **R$ 560.000** | **R$ 140.000** | **R$ 700.000** |
| **In USD (approx.)** | **USD ~101.000** | **USD ~25.000** | **USD ~127.000** |

*Note: For larger IDB Lab grants (USD 200k+), budget scales proportionally with accelerated hiring and faster market expansion.*

### 6.2 Post-Grant Revenue Projections (Business Sustainability)

| Year | Revenue Source | Amount |
|------|---------------|--------|
| Year 1 (2027) | 3 pilot contracts + early customers | R$ 150,000 |
| Year 2 (2028) | 20 paying customers (B2B SaaS) | R$ 600,000 |
| Year 3 (2029) | 80 customers + API + 2 LATAM markets | R$ 2,500,000 |

**Path to financial sustainability:** The business becomes cash-flow positive in Month 24, funded by B2B SaaS contracts with content producers. IDB Lab grant covers the R&D phase; commercial revenue sustains operations thereafter.

**Key financial assumptions:**
- Average B2B contract: R$ 2,500/month (small producer) to R$ 15,000/month (broadcaster)
- Customer acquisition cost: R$ 800 (compliance-driven market = low CAC)
- Gross margin: 72% at scale (AI inference costs decrease with volume)
- Churn: 8% annually (compliance requirement = sticky product)

### 6.3 Social Return on Investment (SROI) Estimate

| Impact | Value | Calculation |
|--------|-------|-------------|
| Economic value of accessibility compliance for 50 producers | R$ 5M | Avg fine avoided: R$ 100k × 50 companies |
| Economic value of content for 150k users (quality-adjusted life years) | R$ 2.7M | IBGE productivity methodology |
| Research/IP value (open dataset, patent) | R$ 500k | Conservative estimate |
| **Total social value created (Year 1-3)** | **R$ 8.2M** | |
| **Investment (IDB Lab grant)** | **~R$ 560k** | |
| **SROI ratio** | **~14:1** | |

---

## 7. SCALABILITY AND REPLICATION

### 7.1 Technical Scalability

VoxDescriber is cloud-native SaaS. Infrastructure scales automatically with demand. Adding a new language (Spanish) requires 6 months of additional training data collection and model fine-tuning — not rebuilding the platform.

**Languages roadmap:**
- Phase 1 (current): Brazilian Portuguese
- Phase 2 (2027): Latin American Spanish (covers Mexico, Colombia, Argentina, Chile, Peru = 200M+ additional people)
- Phase 3 (2028): European Portuguese + English

### 7.2 Replication in Other Countries

The model is directly replicable in any Spanish-speaking Latin American country. The core infrastructure is the same; only the language model and voice synthesis need localization.

IDB Lab investment includes a commitment to publish the methodology and training framework as open-source tooling, enabling civil society organizations and governments in LATAM to implement similar solutions independently.

### 7.3 Partnerships for Scale

- **Disability organizations:** Parceria com organizações de cegos no Brasil e LATAM para co-design e distribuição
- **Regulatory bodies:** Engagement with ANCINE (Brazil), equivalent bodies in Colombia, Mexico for compliance frameworks
- **Academic:** Open dataset contribution to NLP research community in PT-BR/Spanish
- **Media industry:** Partnerships with video hosting platforms for embedded accessibility features

---

## 8. ADDITIONALITY

**Would this project happen without IDB Lab funding?**

Partially. Titanio has bootstrapped to a working prototype using internal resources. However:

- Full R&D to TRL 7 requires investment we cannot fund internally
- Hiring a dedicated AI research team requires runway we don't have
- Conducting rigorous community validation with disability organizations requires dedicated project management
- Publishing an open dataset is a public good that has no revenue return for Titanio

Without this grant, we would continue developing slowly with internal resources — likely reaching TRL 7 in 48 months instead of 24. The grant accelerates impact by 24 months and enables the public-good components (open dataset, academic publication, disability community co-design) that pure commercial funding would not support.

---

## APPENDICES

### A. Letters of Intent (to be attached)
- [ ] Letter of Intent from pilot partner #1 (content producer)
- [ ] Letter of Intent from pilot partner #2
- [ ] Letter of Intent from pilot partner #3
- [ ] Letter of support from blind/VI community organization

### B. Technical Documentation
- [ ] VoxDescriber prototype technical architecture
- [ ] Accuracy benchmark methodology and results

### C. Company Documentation
- [ ] Titanio Studio company registration (CNPJ)
- [ ] Audited financial statements (last 2 years)
- [ ] Portfolio of 40+ productions (select titles)

### D. Team CVs
- [ ] Tiago Arakilian — full CV
- [ ] [CTO/Technical Lead] — full CV
- [ ] [University research partner] — full CV

---

*Template criado pelo Victor Capital para a Titanio Studio — Março 2026*
*Adaptar para o call específico do BID Lab. Verificar requisitos atuais em bidlab.org/en*
