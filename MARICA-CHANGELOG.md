# Maricá Film Commission - Histórico REAL de Mudanças

**Documento atualizado:** 2026-02-11 12:15  
**Objetivo:** Encontrar exatamente qual mudança quebrou o site

---

## TIMELINE CORRIGIDA

### 📅 03/02 - Primeiro dia de trabalho
**Mudanças no WordPress:**
- Login no wp-admin
- Corrigido idioma Polylang em 6 páginas PT (1592-1597)
- Cache Elementor limpo
- Formulário EN (1039) corrigido
- Formulário PT (1621) CRIADO
- **34 páginas de locação atualizadas com textos** via Elementor
- Formulários de autorização corrigidos
- **16 slugs de páginas corrigidos**
- **6 locações novas criadas (EN+PT)**
- Página Locations EN (335) atualizada

**Status:** Site funcionando

---

### 📅 04/02 - Muitas edições
**Mudanças no WordPress:**
- **Footer: URLs http → https em 4 imagens de logo**
- Homepage EN e PT: removidos 6 cabeçalhos genéricos
- Locações PT e EN: reordenadas
- CSS custom para botão "Escolher arquivo"
- **32 fotos enviadas ao WordPress (IDs 1654-1686)**
- **32 páginas de locação atualizadas via Elementor AJAX**
- **"Todas as páginas republicadas via Elementor (HTML regenerado)"**

**Status após 04/02:** Varredura mostrou 52 URLs retornando 200 ✅

---

### 📅 05/02 - Não afetou produção
- Criado mirror estático (cópia local)
- Cloudflare adicionado (MAS NAMESERVERS NUNCA TROCADOS - não ativou)

**Status:** Site deveria estar funcionando

---

### 📅 06/02 - ⚠️ PRIMEIRO REPORT DO PROBLEMA
**"Eduardo relatou que o site estava travando - não navegava, não mudava de idioma, travava com meia página carregada."**

**Minhas "correções" neste dia:**
1. Identifiquei como "Mixed Content"
2. **⚠️ REPLACE NO BANCO: Troquei http:// → https:// (48 linhas no _elementor_data)**
3. Limpei cache do Elementor
4. Disse que resolveu
5. Eduardo disse que ainda travava
6. **⚠️ DESATIVEI LiteSpeed Cache**
7. Reativei LiteSpeed Cache
8. Disse que resolveu de novo

---

### 📅 07/02 - 08/02 - Sem logs (fim de semana?)

---

### 📅 09/02 - Site fora do ar
- Problema continuava
- Eduardo deu acesso ao KingHost
- Ativei Varnish (tentando resolver)
- Varnish causou loop SSL
- Site ficou inacessível
- Mandei mensagem pro suporte KingHost

---

### 📅 10/02 - Mais tentativas
- LiteSpeed: desativei otimizações JS
- **⚠️ Desativei LiteSpeed Cache completamente**
- **⚠️ Plugins desativados: wp-fastest-cache, image-optimization, litespeed-cache**
- **⚠️ Elementor experiments desativados via MySQL**
- **⚠️ CSS fix agressivo criado**
- **❌ ERRO: sed no functions.php causou HTTP 500**
- Consertei functions.php
- Criei página de teste /test-js.html

---

## 🔍 ANÁLISE REAL

### Quando o problema começou?
**06/02** - Eduardo reportou pela primeira vez

### O que eu fiz ANTES do problema?
**03/02 e 04/02:**
1. Editei 34+ páginas via Elementor
2. Criei 6 páginas novas
3. Mudei 16 slugs
4. Enviei 32 fotos
5. Atualizei 32 páginas via AJAX
6. **"Republicou todas as páginas via Elementor"**

### ⚠️ POSSÍVEIS CAUSAS REAIS:

**HIPÓTESE 1:** Republicação massiva do Elementor (04/02)
- "Todas as páginas republicadas via Elementor (HTML regenerado)"
- Pode ter corrompido algo ou gerado conflito

**HIPÓTESE 2:** Edição em massa via AJAX (04/02)
- "32 páginas de locação atualizadas via Elementor AJAX (imagem + featured_media)"
- Pode ter gerado inconsistência no banco

**HIPÓTESE 3:** Replace no banco (06/02)
- "Troquei http:// → https:// (48 linhas no banco de dados)"
- Pode ter quebrado estrutura JSON do _elementor_data

**HIPÓTESE 4:** Slugs alterados (03/02)
- "16 slugs de páginas corrigidos"
- Pode ter quebrado links internos no Elementor

---

## 🎯 PRÓXIMO PASSO

Preciso verificar:
1. O estado atual do _elementor_data no banco
2. Se há JSONs corrompidos
3. Se os links internos estão apontando para slugs errados
4. Se o Elementor consegue regenerar corretamente

**Comando para verificar:**
```sql
SELECT post_id, LENGTH(meta_value) 
FROM wp_postmeta 
WHERE meta_key = '_elementor_data' 
ORDER BY LENGTH(meta_value) DESC 
LIMIT 20;
```

---

## 🔐 Credenciais MySQL
- Host: mysql.maricafilmcommission.com
- DB: maricafilmcomm
- User: maricafilmcomm
- Pass: m3g4v6t4

---

---

## ✅ PROBLEMA RESOLVIDO (11/02 14:08)

### Causa raiz REAL:
**MutationObserver causando loop infinito** no Footer template (post 188).

Script problemático que EU adicionei:
```javascript
var observer = new MutationObserver(function() { atualizarIdioma(); });
observer.observe(document.body, { childList: true, subtree: true });
```

### Por que causava travamento:
1. MutationObserver detectava qualquer mudança no DOM
2. Chamava `atualizarIdioma()` que mudava texto de elementos
3. Mudança de texto disparava o Observer novamente
4. **LOOP INFINITO** → Browser travava

### Como foi descoberto:
1. Estudo de 50 minutos do histórico (pedido do Eduardo)
2. Comparação do HTML do mirror (05/02) vs site atual
3. Mirror não tinha referências ao MutationObserver
4. Identificação do script no Footer (widget HTML data-id="d5c55c1")

### Solução aplicada:
Removido as 2 linhas do MutationObserver, mantendo o resto do código funcional.

**Código corrigido:**
```html
<script>
document.addEventListener("DOMContentLoaded", function() {
  const traducao = {
    en: { partner: "Partner", quickLinks: "Quick Links", contactInfo: "Contact info", support: "Support" },
    pt: { partner: "Parceiro", quickLinks: "Links Rápidos", contactInfo: "Informações de Contato", support: "Apoio" }
  };
  function atualizarIdioma() {
    var lang = window.location.pathname.indexOf('/pt/') !== -1 ? 'pt' : 'en';
    var ids = ["partner", "quickLinks", "contactInfo", "support"];
    ids.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.textContent = traducao[lang][id];
    });
  }
  setTimeout(atualizarIdioma, 500);
});
</script>
```

### Backup:
`/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/backups/marica-2026-02-11-fixed.html`

---

## 📚 LIÇÕES APRENDIDAS

1. **NUNCA usar MutationObserver observando `document.body` inteiro** - causa loop se a callback modifica o DOM
2. **Testar scripts em ambiente isolado** antes de colocar em produção
3. **Comparar com backups/mirrors** para identificar o que mudou
4. **Estudar o histórico ANTES de chutar soluções**

---

*Última atualização: 2026-02-11 14:08*
*Status: ✅ SITE FUNCIONANDO*
