# 🎬 Auditoria Completa — maricafilmcommission.com
**Data:** 04 de Fevereiro de 2026  
**Método:** web_fetch + browser snapshot/screenshot  

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---|---|
| URLs testadas | 50+ |
| Páginas com erro 404 | **7** |
| Páginas com conteúdo errado | **3** |
| Páginas com conteúdo vazio/mínimo | **3** |
| Redirecionamentos internos | **3** |
| Links quebrados no footer/nav | **3** |
| Erros de português | **3+** |
| Inconsistências PT/EN | **8+** |

**Gravidade geral: 🔴 ALTA** — Múltiplas páginas PT inexistentes ou com conteúdo trocado.

---

## 1️⃣ Status de Todas as URLs

### Páginas Principais — EN

| URL | Status | Observação |
|---|---|---|
| `/` (home) | ✅ 200 | OK |
| `/about-us/` | ✅ 200 | OK |
| `/locations/` | ✅ 200 | OK |
| `/faq/` | ❌ **404** | URL inexistente. A URL real do menu é `/frequently-asked-questions/` |
| `/frequently-asked-questions/` | ✅ 200 | Esta é a URL correta do FAQ EN |
| `/contact/` | ✅ 200 | OK |
| `/cadastro-de-fornecedores/` | ✅ 200 | OK (nota: slug em PT numa página EN) |
| `/filming-authorization-form/` | ✅ 200 | Conteúdo extraído muito escasso (apenas footer) |

### Páginas Principais — PT

| URL | Status | Observação |
|---|---|---|
| `/pt/home-portugues/` | ✅ 200 | OK |
| `/pt/sobre-nos/` | ❌ **404** | URL inexistente. A URL real do menu é `/pt/sobre/` |
| `/pt/sobre/` | ✅ 200 | Esta é a URL correta do Sobre PT |
| `/pt/locacoes/` | ✅ 200 | Conteúdo muito escasso — apenas título e subtítulo |
| `/pt/perguntas-frequentes/` | ✅ 200 | OK |
| `/pt/contato/` | ✅ 200 | OK |
| `/pt/cadastro-de-fornecedores-pt/` | ✅ 200 | OK |
| `/pt/autorizacao-de-filmagem/` | ✅ 200 | Conteúdo extraído muito escasso (apenas footer) |

### Locações — EN (todas OK ✅)

| URL | Status |
|---|---|
| `/itaipuacu-beaches/` | ✅ 200 |
| `/ponta-negra-beach-main/` | ✅ 200 |
| `/recanto-beach/` | ✅ 200 |
| `/restinga-extension/` | ✅ 200 |
| `/aracatiba-lagoon-main/` | ✅ 200 |
| `/sacristia-grotto/` | ✅ 200 |
| `/monkey-rock/` | ✅ 200 |
| `/ponta-negra-lighthouse/` | ✅ 200 |
| `/nossa-senhora-do-amparo-church/` | ✅ 200 |
| `/flamengo-linear-park/` | ✅ 200 |
| `/joao-saldanha-stadium/` | ✅ 200 |
| `/henfil-cinema/` | ✅ 200 |
| `/elephant-rock/` | ✅ 200 |
| `/casa-de-cultura/` | ✅ 200 |
| `/orlando-de-barros-pimentel-square/` | ✅ 200 |
| `/fazenda-itaocaia/` | ✅ 200 |
| `/fazenda-joaquim-pinero/` | ✅ 200 |
| `/aldeia-mata-verde-bonita/` | ✅ 200 |
| `/hospital-municipal-che-guevara/` | ✅ 200 |

### Locações — PT (⚠️ MÚLTIPLOS PROBLEMAS)

| URL | Status | Problema |
|---|---|---|
| `/pt/praias-de-itaipuacu/` | ✅ 200 | OK |
| `/pt/praia-de-ponta-negra/` | ✅ 200 | OK |
| `/pt/praia-do-recanto/` | ❌ **404** | Página não existe |
| `/pt/extensao-da-restinga/` | ✅ 200 | OK |
| `/pt/lagoa-de-aracatiba/` | ⚠️ 200 | Redireciona para `/pt/lagoa-de-aracatiba-2/` |
| `/pt/gruta-da-sacristia/` | ✅ 200 | OK |
| `/pt/pedra-do-macaco/` | ✅ 200 | OK |
| `/pt/farol-de-ponta-negra/` | 🔴 **200 — CONTEÚDO ERRADO** | Title diz "Praia do Recanto", conteúdo é da Praia do Recanto, NÃO do Farol |
| `/pt/igreja-matriz/` | ⚠️ 200 | Redireciona para `/pt/igreja-matriz-de-nossa-senhora-do-amparo-2/` |
| `/pt/parque-linear-flamengo/` | ❌ **404** | Página não existe |
| `/pt/estadio-joao-saldanha/` | ❌ **404** | Página não existe |
| `/pt/cinema-henfil/` | 🔴 **200 — REDIRECIONADO PARA EN** | Redireciona para `/cinema-henfil/` (versão EN!) |
| `/pt/pedra-do-elefante/` | 🔴 **200 — CONTEÚDO EM INGLÊS** | Redireciona para `/pt/pedra-do-elefante-2/` mas exibe conteúdo em inglês |
| `/pt/casa-de-cultura-pt/` | ✅ 200 | OK |
| `/pt/praca-orlando-de-barros-pimentel/` | ✅ 200 | OK |
| `/pt/fazenda-itaocaia-pt/` | ✅ 200 | OK |
| `/pt/fazenda-joaquim-pinero-pt/` | ⚠️ 200 | **Conteúdo quase vazio** — apenas footer aparece |
| `/pt/aldeia-mata-verde-bonita-pt/` | ✅ 200 | OK |
| `/pt/hospital-municipal-dr-che-guevara/` | ❌ **404** | Página não existe |

---

## 2️⃣ Verificação "Cinema Henfil" em Páginas Incorretas

**Objetivo:** O texto "Cinema Henfil" ou "Cine Henfil" NÃO deve aparecer em páginas de outras locações (exceto a própria página do Cinema Henfil e páginas de listagem).

| Página | Contém "Cinema Henfil"? | Status |
|---|---|---|
| Home EN (/) | Sim — no showcase de locações | ✅ Esperado (é uma listagem) |
| Locations EN (/locations/) | Sim — card de locação | ✅ Esperado (é uma listagem) |
| Todas as 19 outras locações EN | Não | ✅ OK |
| Todas as locações PT acessíveis | Não | ✅ OK |

**Resultado: ✅ APROVADO** — Nenhum vazamento de "Cinema Henfil" em páginas individuais de outras locações.

---

## 3️⃣ Consistência PT/EN

### 🔴 Problemas Críticos

1. **Página de Locações PT (`/pt/locacoes/`) extremamente vazia**
   - EN `/locations/` exibe 19+ cards de locações com fotos, links e descrições
   - PT `/pt/locacoes/` exibe APENAS o título "Explore as Locações Únicas de Maricá" e o subtítulo — SEM nenhum card de locação
   - **Impacto:** Visitante PT não consegue navegar para nenhuma locação a partir desta página

2. **3 locações PT com conteúdo errado ou em inglês:**
   - `/pt/farol-de-ponta-negra/` → mostra conteúdo da "Praia do Recanto"
   - `/pt/pedra-do-elefante/` → mostra texto em INGLÊS ao invés de PT
   - `/pt/cinema-henfil/` → redireciona para a versão EN

3. **4 locações PT inexistentes (404):**
   - `/pt/praia-do-recanto/`
   - `/pt/parque-linear-flamengo/`
   - `/pt/estadio-joao-saldanha/`
   - `/pt/hospital-municipal-dr-che-guevara/`

4. **1 locação PT sem conteúdo:**
   - `/pt/fazenda-joaquim-pinero-pt/` → página carrega mas sem nenhum texto descritivo

### ⚠️ Problemas Estruturais

5. **URLs inconsistentes entre menu e slugs esperados:**
   - Menu EN aponta FAQ para `/frequently-asked-questions/` mas a URL esperada `/faq/` dá 404
   - Menu PT aponta "Sobre nós" para `/pt/sobre/` mas a URL esperada `/pt/sobre-nos/` dá 404
   
6. **Slugs com sufixo "-2" (indicativo de duplicatas no WordPress):**
   - `/pt/lagoa-de-aracatiba/` → redireciona para `/pt/lagoa-de-aracatiba-2/`
   - `/pt/pedra-do-elefante/` → redireciona para `/pt/pedra-do-elefante-2/`
   - `/pt/igreja-matriz/` → redireciona para `/pt/igreja-matriz-de-nossa-senhora-do-amparo-2/`

7. **Links na página EN `/locations/` apontam para URLs diferentes das páginas individuais:**
   - Lista aponta para `/ponta-negra-beach-2/` (não `/ponta-negra-beach-main/`)
   - Lista aponta para `/our-lady-of-amparo-parish-church/` (não `/nossa-senhora-do-amparo-church/`)
   - Lista aponta para `/aracatiba-lagoon/` (não `/aracatiba-lagoon-main/`)
   - Lista aponta para `/itapeba-waterfront/` (URL não listada originalmente)

8. **Menu PT não inclui link para Autorização de Filmagem**, mas o menu EN inclui "Filming Authorization" de forma indireta.

9. **Footer PT mantém headings em inglês:**
   - "Quick Links" → deveria ser "Links Rápidos"
   - "Contact info" → deveria ser "Informações de Contato"
   - "Partner" → deveria ser "Parceiro"
   - "Support" → deveria ser "Apoio"

---

## 4️⃣ Erros de Português

### Erros Gramaticais

1. **Igreja Matriz PT** (`/pt/igreja-matriz/`):
   > "embora não **encontrei** os dados precisos"
   
   ❌ Incorreto. Após "embora" exige-se o subjuntivo:
   > "embora não **tenha encontrado** os dados precisos"

2. **Aldeia Mata Verde Bonita PT** (`/pt/aldeia-mata-verde-bonita-pt/`):
   > "A Aldeia Mata Verde Bonita**,** está localizada em território do distrito"
   
   ❌ Vírgula indevida separando sujeito do verbo. Correto:
   > "A Aldeia Mata Verde Bonita está localizada no distrito"

### Erros de Acentuação/Formatação

3. **Título da página de Autorização PT** (tag `<title>`):
   > "Autorizacao de Filmagem"
   
   ❌ Falta cedilha e acento: deve ser "Autorização de Filmagem"

### Questões de Estilo/Naturalidade

4. **Praça Orlando PT**: "possíveis detalhes urbanos (calçamento, luminárias, canteiros)" — tom incerto/dubitativo inadequado para um site institucional. Sugestão: descrever com assertividade.

5. **Gruta da Sacristia PT**: "Geoparque costões interiores" — nome próprio deveria estar capitalizado: "Geoparque Costões e Lagunas" (ou o nome oficial completo).

---

## 5️⃣ Footer — Análise Detalhada

### ✅ Itens Corretos
- **Sem mapa do London Eye** — verificado visualmente via screenshot
- **Copyright 2026** presente: "© 2026 maricafilmcommission. All Rights Reserved."
- **Logo Maricá Film Commission** visível no footer
- Seções "Partner" e "Support" presentes com logos

### ❌ Problemas Encontrados

| Problema | Gravidade | Detalhe |
|---|---|---|
| **Email link quebrado** | 🔴 Alta | `contact@maricafilmcommission.com` tem href="#" ao invés de `mailto:` |
| **Facebook link quebrado** | 🔴 Alta | Ícone do Facebook sem URL (não é um `<a>` funcional) |
| **Telefone placeholder** | 🔴 Alta | "234 567-8912" é claramente um número fictício/template — link vai para "#" |
| **Headings não traduzidos no PT** | ⚠️ Média | "Quick Links", "Contact info", "Partner", "Support" deveriam estar em português na versão PT |
| **"Maricá- RJ" formatação** | ⚠️ Baixa | Falta espaço antes do hífen: deveria ser "Maricá - RJ" |

---

## 6️⃣ Links Quebrados

### No Corpo do Site
| Localização | Link | Problema |
|---|---|---|
| Home EN — CTA | `234 567-8912` | href="#" — número fictício |
| Home EN — CTA | Phone link | href="#" — não funcional |
| Footer (todas as páginas) | Email de contato | href="#" ao invés de mailto: |
| Footer (todas as páginas) | Ícone Facebook | Sem URL/href |

### URLs de Navegação Incorretas (404)
| De onde é linkado | URL Quebrada | Observação |
|---|---|---|
| URL fornecida | `/faq/` | URL real é `/frequently-asked-questions/` |
| URL fornecida | `/pt/sobre-nos/` | URL real é `/pt/sobre/` |
| Locações PT | `/pt/praia-do-recanto/` | Não existe |
| Locações PT | `/pt/parque-linear-flamengo/` | Não existe |
| Locações PT | `/pt/estadio-joao-saldanha/` | Não existe |
| Locações PT | `/pt/hospital-municipal-dr-che-guevara/` | Não existe |

---

## 7️⃣ Problema Global: Título do Site

**Em TODAS as páginas**, o título HTML mostra:
> **"Maricá Film Comission"** (um 'm')

O correto em inglês é **"Commission"** (dois 'm's). O próprio domínio usa `maricafilmcommission.com` com dois 'm's.

⚠️ Isto afeta SEO, credibilidade profissional e consistência com o domínio.

---

## 8️⃣ Observações Adicionais

1. **WordPress Admin Bar visível**: O browser detectou a admin bar do WordPress logada (usuário "contact") — verificar se a sessão está protegida e se caching exclui a admin bar para visitantes.

2. **8 atualizações pendentes** no WordPress — recomenda-se aplicar atualizações de segurança.

3. **Vídeo Vimeo na home** tem título em português ("Marica Film Commission - Apresentação") mesmo na versão EN — considerar título bilíngue.

4. **Slug EN inconsistente**: `/cadastro-de-fornecedores/` é um slug em português para uma página EN. Deveria ser algo como `/supplier-registration/`.

---

## 📋 Prioridades de Correção

### 🔴 Prioridade ALTA (corrigir imediatamente)

1. **Criar as 4 páginas PT faltantes**: Praia do Recanto, Parque Linear Flamengo, Estádio João Saldanha, Hospital Municipal Dr. Che Guevara
2. **Corrigir `/pt/farol-de-ponta-negra/`** — está exibindo conteúdo da Praia do Recanto
3. **Traduzir `/pt/pedra-do-elefante/`** — mostra texto em inglês
4. **Criar versão PT do Cinema Henfil** — `/pt/cinema-henfil/` redireciona para EN
5. **Adicionar conteúdo a `/pt/fazenda-joaquim-pinero-pt/`** — página vazia
6. **Corrigir página de Locações PT** (`/pt/locacoes/`) — adicionar os cards de locação como na versão EN
7. **Corrigir título do site**: "Comission" → "Commission"
8. **Corrigir link do email** no footer: href="#" → href="mailto:contato@maricafilmcommission.com"
9. **Corrigir link do Facebook** no footer — adicionar URL real
10. **Substituir telefone placeholder** "234 567-8912" por número real ou remover

### ⚠️ Prioridade MÉDIA

11. Traduzir headings do footer para PT ("Quick Links" → "Links Rápidos", etc.)
12. Corrigir erro gramatical na Igreja Matriz PT ("encontrei" → "tenha encontrado")
13. Corrigir vírgula indevida na Aldeia Mata Verde Bonita PT
14. Corrigir título da autorização PT ("Autorizacao" → "Autorização")
15. Limpar slugs com sufixo "-2" (duplicatas WordPress)
16. Harmonizar URLs entre `/locations/` e as páginas individuais

### 💡 Prioridade BAIXA

17. Traduzir slug `/cadastro-de-fornecedores/` para EN: `/supplier-registration/`
18. Corrigir formatação "Maricá- RJ" → "Maricá - RJ"
19. Aplicar as 8 atualizações pendentes do WordPress
20. Revisar tom incerto nos textos PT (Praça Orlando, etc.)

---

*Relatório gerado automaticamente em 04/02/2026 às 14:34 (GMT-3)*
