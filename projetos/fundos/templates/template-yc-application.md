# Y Combinator Application — Titanio Studio / VoxDescriber
**Batch:** S26 (Summer 2026) | **Deadline:** May 4, 2026
**Company:** Titanio Studio | **Product:** VoxDescriber
**Version:** 1.0 | **Date:** March 2026

> 📋 **Instructions:** These are draft answers for the YC application. Review each answer, confirm metrics with the team, and record the 1-minute video before submitting. YC reviews thousands of applications — be direct, specific, and honest.

---

## CORE COMPANY INFO

**Company name:** Titanio Studio

**URL:** [titanio.studio or voxdescriber.com — confirm which to use]

**Describe what your company does in 50 characters or less:**
`AI that auto-generates video audio descriptions`

**What is your company going to make? (50 words)**

VoxDescriber is an AI platform that automatically generates audio descriptions for videos — making content accessible to blind and visually impaired viewers at 1/10th the cost of manual production. We're building the "subtitles layer" for the visually impaired: invisible to most, life-changing for millions.

---

## FOUNDERS

**Founder 1: Tiago Arakilian — CEO/Founder**
- Filmmaker and entrepreneur, educated at Université Paris-Sorbonne (Paris IV)
- Founded Titanio Studio in 2006 — 20 years building content that reaches 470M+ viewers
- Led international co-productions with China's CCTV, Globo, Netflix
- Films selected at Sundance, Berlinale, Cannes, TIFF
- Since 2024: leading Titanio's AI transformation — built VoxDescriber prototype, Gospia app, KidsHQ app
- Based in Belo Horizonte, Brazil; speaks Portuguese, English, French

**Founder 2: [PREENCHER — CTO/co-founder technical lead]**
- [Name, background, technical credentials]

---

## THE PRODUCT

**What are you making?**

VoxDescriber is AI software that watches videos and narrates what's happening on screen — automatically, in real-time, in Brazilian Portuguese (expanding to Spanish and English). It makes video content accessible to blind and visually impaired people without requiring a human audio describer.

Think of it this way: subtitles made video watchable for deaf people. VoxDescriber does the same for blind people. We generate the missing audio layer that describes the visual information.

**How does it work?**

Upload a video → our AI analyzes each scene using computer vision → generates natural-language descriptions → converts to speech via neural TTS → syncs audio to natural silence windows in the video → outputs a complete accessible video file.

Current product:
- Functional prototype (TRL 4)
- Processing videos up to 30 minutes
- 74% semantic accuracy (our benchmark)
- 3x real-time processing (improving to 1.5x)
- Two pilot partners testing it now

---

## THE PROBLEM

**Why did you pick this idea to work on?**

Two reasons: we live in the audiovisual world, and we saw an obvious problem nobody was solving.

Titanio Studio has been making films and TV shows for 20 years. We know the content creation industry from the inside — its economics, its workflow, its constraints. When Brazilian law required all video content to have audio descriptions, we watched every production company scramble and give up. The cost was prohibitive: $200 per minute of manual audio description. Nobody could afford it.

We also knew, from 20 years of producing content, that storytelling is about *showing* — and blind people were locked out. 65 million people in Brazil have visual impairments. Less than 3% of Brazilian video content has audio descriptions. That's a massive failure of both the law and the market.

In 2024, we decided we had the unique combination to fix this: 20 years of audiovisual expertise + the AI tools that finally made automation possible.

**What's new about what you make?**

Three things that didn't exist before:

1. **Portuguese-first:** Every existing solution (Microsoft Video Indexer, Amazon Rekognition) is built for English and produces broken, unnatural Portuguese audio descriptions. We built for PT-BR from day one.

2. **Narrative intelligence:** We're not just detecting objects ("there is a chair"). Our model understands narrative context — trained on 20 years of Titanio's own award-winning productions and professional audio description scripts. Our descriptions sound like they were written by a human storyteller.

3. **End-to-end production pipeline:** We generate the complete audio description file, synchronized to silence windows in the original video, ready for broadcast. No other tool does this in one step for Portuguese.

**What do you understand about your business that other companies in it just don't get?**

The market isn't "accessibility software buyers" — it's content creators who need to comply with accessibility laws and can't afford to.

Brazilian law (Lei Brasileira de Inclusão, 2015) requires audio descriptions for all broadcast content. ANCINE regulations enforce this. The pain isn't philosophical ("we want to be inclusive") — it's regulatory and economic. Productions get fined. Platforms get blocked. That's why our B2B sales motion is compliance-first, not mission-first.

The other thing nobody gets: the *voice* matters. The difference between a robotic audio description and a natural one is the difference between Siri reading a novel and an audiobook narrator. We've invested heavily in the voice quality and narrative style because that's what makes users actually want to use it — and what drives renewals.

**How is this different from what's already out there?**

| Competitor | Problem |
|------------|---------|
| Microsoft Video Indexer | English-only quality; no AD file output; no PT-BR |
| Amazon Rekognition | Object detection, not narrative descriptions |
| Manual audio describers | $80–200/minute; 5-10x real-time; not scalable |
| Academic research (UFMG, USP) | Not productized; no commercial offering |
| **VoxDescriber** | PT-BR native; narrative-quality; end-to-end pipeline |

---

## TRACTION

**How far along are you?**

- Working prototype processing videos up to 30 minutes
- 74% semantic accuracy (our internal benchmark against human-produced descriptions)
- 2 pilot partners actively testing: [names pending — confirm before submitting]
- [X] videos processed in the last 30 days
- Gospia and KidsHQ apps (related AI products): [X] downloads, [X] MAU — proof we can ship
- Team: Tiago Arakilian (founder, 20y audiovisual), + [technical co-founder details]

**What do your users say?**

[Insert direct quotes from pilot partners — get these before submitting]

Example: "We've been trying to add audio descriptions to our educational content for 3 years. The cost always stopped us. VoxDescriber is the first thing we've seen that could actually make it happen." — [Pilot partner name/role]

---

## BUSINESS MODEL

**How do you make money?**

B2B SaaS + API:

- **Per-minute pricing:** $X per minute of video processed (like Deepgram for audio)
- **Monthly subscription:** $X/month for up to Y minutes, then per-minute overage
- **Enterprise:** Custom contracts for broadcasters and streaming platforms

Target customers (priority order):
1. Brazilian streaming platforms and TV broadcasters (must comply with ANCINE regulations)
2. Educational content producers (universities, edtech companies)
3. Religious media networks (Titanio's existing relationships — 50M viewers in this segment)
4. Government and public sector content (highest regulatory pressure)

**Unit economics (current estimates):**
- Average contract: R$ 2.500/month (small producer)
- Enterprise: R$ 15.000–50.000/month
- COGS per minute processed: R$ 0,40 (compute + infrastructure)
- Gross margin target: 75%+

---

## MARKET

**What is your market?**

- **Brazil TAM:** R$ 25M/year (content requiring AD compliance)
- **LATAM SAM:** USD 80M (Spanish + Portuguese content creators)
- **Global opportunity:** USD 2B+ (English + subtitles market comparison)

The short-term opportunity is Brazilian compliance. The long-term opportunity is that every video platform in the world needs this — subtitles created a $3B industry; audio descriptions will create another.

---

## GROWTH

**How will you get users?**

**Phase 1 (0-12 months) — Compliance channel:**
ANCINE publishes a list of broadcasters and platforms that violate accessibility rules. We go direct to their legal/compliance teams. This is not "marketing" — it's "you will be fined if you don't act."

**Phase 2 (12-24 months) — Integrations:**
Partner with video hosting platforms (Vimeo, Panda Video Brazil, Hotmart) to offer VoxDescriber as a built-in accessibility feature. Platform pays → we split revenue.

**Phase 3 (24+ months) — Developer API:**
Open the API. Let developers build VoxDescriber into any video workflow. GitHub-style growth for accessibility tooling.

**Why does Titanio have an unfair advantage in distribution?**

We have 20 years of relationships in Brazilian and international media. Globo, Netflix Brazil, streaming platforms, educational publishers — these are existing relationships, not cold leads. Our sales cycle for Phase 1 is referral-based.

---

## WHY Y COMBINATOR

**Why YC? Why now?**

We're building something that needs to be global. The Brazilian compliance market funds our initial growth, but the real prize is becoming the standard for audio description the way Deepgram became the standard for speech-to-text.

YC's network — specifically companies in content, accessibility, and developer tools — would accelerate our path to English-language markets by 2 years. We've bootstrapped to a working prototype and two pilot partners. We need capital and the YC network to 10x our speed.

**If you had a magic cookie that solved one problem instantly, what would you do?**

Fix Portuguese-language training data quality. Our biggest technical bottleneck is that public datasets for NLP/TTS in Portuguese are much smaller and lower quality than English. If we could solve that overnight, our model quality would jump from 74% to 90%+ accuracy immediately — and our competitive moat would become nearly unbreakable for the Portuguese-speaking market (250M+ people).

---

## EQUITY & LEGAL

**Have you incorporated?**
Yes — Titanio Produções Artísticas Ltda, Belo Horizonte, Brazil. [Confirm: will need to incorporate US entity if accepted — typical YC structure: US C-Corp (Delaware) as parent company]

**Have you raised money?**
[PREENCHER — confirmar se houve investimento formal]

**Are any founders working on this full-time?**
[PREENCHER — confirmar dedicação dos fundadores]

---

## VIDEO (1 MINUTE — MANDATORY)

**Script outline:**

0:00-0:10 — Hi, I'm Tiago Arakilian, founder of Titanio Studio. We've been making films and TV shows for 20 years — 40 productions, 40 countries, 470 million viewers.

0:10-0:25 — [Show problem] In Brazil, 65 million people have visual impairments. Less than 3% of video content has audio descriptions. The law requires it. Nobody can afford to comply.

0:25-0:45 — [Show product demo] VoxDescriber fixes that. Upload a video — our AI watches it, describes what's happening, and generates the complete audio description track. [Screen recording of product working]

0:45-0:55 — [Traction] We have two pilot partners testing this now. [Founder 2 intro if applicable]

0:55-1:00 — We're applying to YC because we want to make this the global standard for audio accessibility. This is VoxDescriber.

**Technical notes:**
- Record on phone/laptop camera — natural setting
- Speak directly to camera; don't read from teleprompter
- Show actual product demo (screen recording segment)
- Subtitles not required but helpful

---

*Template criado pelo Victor Capital — Março 2026*
*Revise todos os dados reais antes de submeter. Prazo: 04/05/2026.*
