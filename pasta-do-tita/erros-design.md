# 🔍 Relatório de Problemas de Design — Titanio Dashboard
**Data:** 2026-03-13  
**Analista:** Tita (subagente UI/UX)  
**Arquivos analisados:** `app/`, `components/`, `globals.css`, `tailwind.config.js`, `DASHBOARD_PREVIEW.html`, `DESIGN_BRIEF_DESKTOP_V2.md`

---

## 🔴 CRÍTICO

### 1. Layout principal quebrado em telas menores que 1400px
**Arquivo:** `app/page.tsx`  
**Problema:** O layout usa 3 colunas fixas side-by-side: Sidebar (w-64) + Main Content (flex-1) + ChatPanel (w-96). Em monitores 1280px ou menores, o conteúdo principal fica espremido entre sidebar e chat panel, com espaço insuficiente para os cards internos (grid-cols-4 no dashboard fica ilegível).  
**Severidade:** 🔴 Crítico  
**Correção:**
```css
/* ChatPanel: adicionar breakpoint para esconder ou tornar collapsible */
/* Em telas < 1400px, ChatPanel deve virar overlay ou painel retrátil */
.chat-panel { @apply hidden xl:flex; }
/* Ou adicionar toggle button para mostrar/esconder */
```

---

### 2. DashboardOverview: grid interno com overflow invisível
**Arquivo:** `app/page.tsx` — `DashboardOverview()`  
**Problema:** O container principal usa `h-full` + `grid grid-cols-3 gap-6` mas a `<main>` tem `overflow-hidden`. Isso corta conteúdo que ultrapassa a altura da tela sem mostrar scrollbar. Usuário não consegue rolar para ver cards inferiores.  
**Severidade:** 🔴 Crítico  
**Correção:**
```tsx
// Mudar main de overflow-hidden para overflow-y-auto
<main className="flex-1 overflow-y-auto p-6">
// E remover h-full do DashboardOverview (deixar crescer naturalmente)
```

---

### 3. Senha do projeto hardcoded E exposta no código E na UI
**Arquivo:** `components/ProjectsPanel.tsx`  
**Problema:** A senha `"real"` está hardcoded no código (`if (password === 'real')`). Pior: há uma dica na UI que literalmente diz `💡 Dica: A senha é "real"`. Segurança zero — qualquer um que abra o DevTools ou leia o HTML encontra a senha.  
**Severidade:** 🔴 Crítico (segurança + UX)  
**Correção:**
- Remover a dica da UI imediatamente
- Mover validação de senha para o backend
- Usar bcrypt/hash, nunca comparação direta de string no frontend

---

### 4. BotsPanel: estado vazio sem feedback adequado
**Arquivo:** `components/BotsPanel.tsx`  
**Problema:** Quando a API retorna array vazio (ou falha), a tabela renderiza sem nenhuma linha — aparece uma tabela com cabeçalho flutuando no ar sem conteúdo. Não há estado "empty state" implementado.  
**Severidade:** 🔴 Crítico (UX)  
**Correção:**
```tsx
{bots.length === 0 && (
  <tr>
    <td colSpan={6} className="py-16 text-center text-gray-500">
      <Bot className="mx-auto mb-3 opacity-30" size={40} />
      <p>Nenhum bot encontrado</p>
    </td>
  </tr>
)}
```

---

## 🟡 MÉDIO

### 5. Scrollbar quase invisível — contraste insuficiente
**Arquivo:** `app/globals.css`  
**Problema:** O scrollbar thumb usa `#1a1a25` sobre track `#12121a` — diferença de apenas ~5% de luminância. É virtualmente invisível para o usuário. Só ao hover vira cyan, mas se o usuário não sabe rolar, nunca vai descobrir.  
**Severidade:** 🟡 Médio  
**Correção:**
```css
::-webkit-scrollbar-thumb {
  background: #2a2a3a; /* mais contraste com o track */
  border-radius: 4px;
}
```

---

### 6. ChatPanel: header do chat pulsando infinitamente sem motivo
**Arquivo:** `components/ChatPanel.tsx`  
**Problema:** O avatar da Tita no header tem `animate-pulse` constante, mesmo quando a conexão está offline ou inativa. Pulsar infinitamente é visualmente cansativo e comunica urgência que não existe.  
**Severidade:** 🟡 Médio  
**Correção:**
```tsx
// Remover animate-pulse do avatar — deixar só no indicador de status online
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-xl">
```

---

### 7. SquadPanel: grid de 4 colunas com cards muito largos em telas grandes
**Arquivo:** `components/SquadPanel.tsx`  
**Problema:** `grid-cols-4` é fixo. Em monitores ultrawide (2560px+), os cards ficam excessivamente largos e com muito espaço vazio interno. Em telas 1280px, ficam muito pequenos para mostrar as 3 skill tags corretamente.  
**Severidade:** 🟡 Médio  
**Correção:**
```tsx
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4"
```

---

### 8. ProjectsPanel: modal de senha sem backdrop acessível
**Arquivo:** `components/ProjectsPanel.tsx`  
**Problema:** O modal de senha usa `fixed inset-0 bg-black/50` mas clicar no backdrop NÃO fecha o modal — só o botão "Cancelar" fecha. Comportamento inesperado e diferente do padrão da web.  
**Severidade:** 🟡 Médio  
**Correção:**
```tsx
<div 
  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}
>
```

---

### 9. Header: input de busca sem label acessível (só placeholder)
**Arquivo:** `components/Header.tsx`  
**Problema:** O campo de busca usa apenas `placeholder` como label visual. Isso falha em acessibilidade (WCAG 2.1 — placeholder não substitui label) e quando o usuário começa a digitar, perde o contexto do campo.  
**Severidade:** 🟡 Médio  
**Correção:**
```tsx
<label htmlFor="search" className="sr-only">Buscar</label>
<input id="search" aria-label="Buscar bots, projetos ou comandos" ... />
```

---

### 10. Tipografia inconsistente: mistura de tamanhos sem hierarquia clara
**Arquivos:** `app/page.tsx`, todos os panels  
**Problema:** Os títulos de seção variam entre `text-xl font-bold` (DashboardOverview) e `text-2xl font-bold` (panels dedicados) sem critério. StatCard usa `text-2xl` para valores mas `text-sm` para label — não segue escala tipográfica definida no design brief (que pede Inter com hierarquia clara).  
**Severidade:** 🟡 Médio  
**Correção:** Definir e aplicar escala tipográfica consistente:
```
H1: text-3xl font-bold (títulos de página)
H2: text-xl font-semibold (seções)
H3: text-base font-medium (subseções)
Label: text-sm text-gray-400
Value: text-2xl font-bold
```

---

### 11. Botões sem estado de loading/disabled visual claro
**Arquivo:** `components/BotsPanel.tsx`  
**Problema:** Após clicar em "Iniciar/Pausar/Parar" um bot, o botão não mostra estado de loading — o usuário pode clicar múltiplas vezes. O feedback só vem depois do `fetchBots()` completar. Botão de Stop sempre aparece, mesmo durante a ação.  
**Severidade:** 🟡 Médio  
**Correção:** Adicionar estado `loadingBotId` e mostrar spinner no botão durante a ação.

---

### 12. ResourceBar: última barra sem margin-bottom causa clipping
**Arquivo:** `app/page.tsx` — `ResourceBar()`  
**Problema:** O componente `ResourceBar` usa `mb-4` mas o último item também recebe essa margin, podendo ser cortado pelo `overflow-hidden` do container pai. Visualmente, a última barra (Disco 78%) frequentemente aparece cortada.  
**Severidade:** 🟡 Médio  
**Correção:**
```tsx
// Usar space-y no container pai em vez de mb em cada filho
<div className="space-y-4">
  <ResourceBar ... />
</div>
// E remover mb-4 do ResourceBar
```

---

### 13. Contraste insuficiente — texto gray-500 sobre card #12121a
**Arquivos:** múltiplos  
**Problema:** `text-gray-500` (#6b7280) sobre fundo `#12121a` tem ratio de contraste ~3.2:1, abaixo do mínimo WCAG AA de 4.5:1 para texto normal. Afeta: timestamps no ActivityItem, footer do ChatPanel ("Pressione Enter para enviar"), subtitle dos Stat Cards.  
**Severidade:** 🟡 Médio  
**Correção:** Substituir `text-gray-500` por `text-gray-400` (#9ca3af) que tem ratio ~4.7:1 sobre #12121a.

---

### 14. MacMiniCard: ícone de status muito pequeno, difícil de ver
**Arquivo:** `app/page.tsx` — `MacMiniCard()`  
**Problema:** O indicador de status é `w-2 h-2` (8px) — minúsculo, difícil de distinguir online/offline especialmente para usuários com visão reduzida. Sem label textual de status.  
**Severidade:** 🟡 Médio  
**Correção:**
```tsx
// Aumentar para w-2.5 h-2.5 e adicionar label
<p className="text-xs mt-1">{status === 'online' ? 'Online' : 'Offline'}</p>
```

---

## 🟢 BAIXO

### 15. Sidebar: items do bottom section sem estado ativo
**Arquivo:** `components/Sidebar.tsx`  
**Problema:** Os botões de Email, Integrações e Configurações no rodapé da sidebar não têm estado ativo/selected — mesmo que sejam páginas futuras, deveriam ter feedback visual de hover mais evidente (atualmente `hover:bg-white/5` é quase invisível).  
**Severidade:** 🟢 Baixo  
**Correção:** Aumentar para `hover:bg-white/8` ou usar `hover:bg-card-hover`.

---

### 16. DASHBOARD_PREVIEW.html: não usa as classes do projeto, hard-codes inline
**Arquivo:** `DASHBOARD_PREVIEW.html`  
**Problema:** O preview usa `bg-[#12121a]`, `text-[#00d4ff]` como valores inline em vez das classes da config do Tailwind (`bg-card`, `text-cyan`). Inconsistência entre preview e produção — qualquer mudança de token de design não é refletida no preview.  
**Severidade:** 🟢 Baixo  
**Correção:** Usar as classes semânticas do tailwind.config.js.

---

### 17. SquadPanel: fallback de imagem via DOM manipulation (antipadrão React)
**Arquivo:** `components/SquadPanel.tsx`  
**Problema:** O `onError` do `<img>` usa `document.createElement()` e `appendChild()` — manipulação direta do DOM em React é antipadrão e pode causar bugs de reconciliação. Além disso, o fallback emoji tem tamanho `text-4xl` diferente da imagem original `w-16 h-16`.  
**Severidade:** 🟢 Baixo  
**Correção:**
```tsx
const [imgError, setImgError] = useState(false);
{imgError ? (
  <span className="text-4xl w-16 h-16 flex items-center justify-center">{getEmoji(specialist.id)}</span>
) : (
  <img ... onError={() => setImgError(true)} />
)}
```

---

### 18. Animações: `animate-pulse` em excesso (3+ elementos simultâneos)
**Arquivos:** `Sidebar.tsx`, `ChatPanel.tsx`, `BotsPanel.tsx`  
**Problema:** Múltiplos elementos pulsam ao mesmo tempo: indicador de usuário na sidebar, avatar da Tita, indicador de "Online" da Tita, bots "running" na tabela, notificação no Header. Excesso de movimento cria fadiga visual e dilui o significado do pulse (que deveria indicar algo importante).  
**Severidade:** 🟢 Baixo  
**Correção:** Reservar `animate-pulse` apenas para: status de conexão real e bots ativos. Remover do avatar e do indicador estático de "Online".

---

### 19. Header: botão "Novo Bot" sem ícone (inconsistente com design brief)
**Arquivo:** `components/Header.tsx`  
**Problema:** O botão "+ Novo Bot" usa texto puro com `+`. O design brief pede ícones Lucide consistentes. Outros botões similares no app (ex: "Novo Projeto" em ProjectsPanel) usam `<Plus size={18} />`. Inconsistência de padrão.  
**Severidade:** 🟢 Baixo  
**Correção:**
```tsx
import { Plus } from 'lucide-react';
<motion.button className="...">
  <Plus size={16} className="inline mr-1" />
  Novo Bot
</motion.button>
```

---

### 20. Fonte JetBrains Mono declarada no config mas não importada
**Arquivos:** `tailwind.config.js`, `app/layout.tsx`  
**Problema:** A config do Tailwind declara `font-mono: ['JetBrains Mono', 'monospace']` mas não há `@import` ou `next/font` para JetBrains Mono. O fallback `monospace` cai para a fonte do sistema (Courier New / Monaco), diferente do que o design brief especifica.  
**Severidade:** 🟢 Baixo  
**Correção:** Adicionar no `layout.tsx`:
```tsx
import { JetBrains_Mono } from 'next/font/google';
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'] });
```

---

## 📊 Resumo Executivo

| Severidade | Quantidade | % |
|------------|------------|---|
| 🔴 Crítico | 4 | 20% |
| 🟡 Médio | 10 | 50% |
| 🟢 Baixo | 6 | 30% |
| **Total** | **20** | **100%** |

## 🎯 Prioridade de Correção

**Fazer AGORA (crítico):**
1. Corrigir overflow/scroll do main content (conteúdo cortado)
2. Remover a dica da senha da UI + mover validação para backend
3. Adicionar empty state no BotsPanel

**Fazer LOGO (médio, impacto visual maior):**
4. Corrigir contraste dos textos gray-500
5. Corrigir scrollbar visibility
6. Remover animate-pulse excessivo
7. Corrigir modal backdrop click-to-close
8. Importar JetBrains Mono corretamente

**Fazer quando der (baixo, polish):**
9. Padronizar ícone no botão "+ Novo Bot"
10. Refatorar fallback de imagem do SquadPanel para React puro
