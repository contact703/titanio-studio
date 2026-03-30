# VoxDescriber — Design Document Completo
**Versão:** 1.0  
**Data:** Março 2026  
**Autor:** Design Wizard — Squad Titanio  
**Stack:** PySide6 (Qt) / Tauri  
**Plataformas:** macOS + Windows  

---

## 🎯 Visão do Produto

VoxDescriber transforma a audiodescrição de vídeos — uma tarefa manual, cara e lenta — em um processo automatizado por IA. O usuário sobe um vídeo, configura parâmetros, e em minutos tem um vídeo acessível pronto para distribuição.

**Público-alvo:** Produtores de conteúdo, emissoras de TV, cineastas independentes, plataformas de streaming.

---

## 🎨 Identidade Visual

### Nome
**VoxDescriber** — mantido. Alternativas caso necessário:
- **Narrata** — mais elegante, internacional
- **AudioVis** — técnico, direto
- **DescribeAI** — claro mas genérico

Recomendação: manter **VoxDescriber** com tagline *"Audiodescrição inteligente para todo conteúdo."*

---

### Paleta de Cores

```
PRIMÁRIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Indigo Profundo     #1A1F3C   Fundo principal (dark mode)
  Indigo Médio        #252B52   Superfícies / cards
  Indigo Claro        #2E3566   Bordas / divisores

ACENTO PRINCIPAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Violeta Vibrante    #7C5CFC   CTAs primários, destaques
  Violeta Hover       #6A4AE8   Estado hover dos botões
  Violeta Suave       #3D2F7A   Backgrounds de seleção

ACENTO SECUNDÁRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Ciano Elétrico      #00D4FF   Progresso, ondas de áudio, ativo
  Ciano Suave         #00AACE   Variante hover

STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Verde Sucesso       #22C55E   Etapas concluídas, exportação OK
  Âmbar Aviso         #F59E0B   Avisos, etapa em andamento
  Vermelho Erro       #EF4444   Erros, cancelamento

NEUTROS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Branco Texto        #F0F2FF   Texto principal
  Cinza Médio         #8890B5   Texto secundário / placeholder
  Cinza Escuro        #4A5080   Texto desabilitado
```

**Nota:** O app usa dark mode como padrão (ambientes de edição de vídeo são tipicamente escuros). Light mode é opcional nas configurações.

---

### Tipografia

```
FAMÍLIA PRINCIPAL
  Inter — Sans-serif moderna, excelente legibilidade em telas
  Fallback: SF Pro (macOS), Segoe UI (Windows)

HIERARQUIA
  H1 — Inter Bold 28px      Títulos de tela
  H2 — Inter SemiBold 20px  Títulos de seção
  H3 — Inter Medium 16px    Subtítulos
  Body — Inter Regular 14px Texto geral
  Small — Inter Regular 12px Labels, timestamps, captions
  Mono — JetBrains Mono 12px Log em tempo real

ESPAÇAMENTO
  Line-height: 1.5x para body, 1.3x para headings
```

---

### Conceito do Ícone

```
╔════════════════════════╗
║                        ║
║   ▶  ──── ))) ──────   ║
║       onda de som      ║
║       saindo de um     ║
║       play button      ║
║                        ║
╚════════════════════════╝
```

**Descrição detalhada:**
- Forma base: quadrado arredondado com gradiente de **#7C5CFC → #00D4FF** (diagonal, 135°)
- Centro: triângulo de play estilizado em branco
- À direita do play: 3 ondas de som curvas (como ícone de volume) em branco com 70% de opacidade
- Abaixo das ondas: linha de texto pequena simulando closed caption (—)
- Tom: tecnológico mas acessível, não frio

---

## 🖥️ WIREFRAMES — TELAS PRINCIPAIS

### TELA 1: Landing / Drop de Vídeo

```
┌─────────────────────────────────────────────────────────────────────┐
│  Arquivo    Configurações    Ajuda                         ● ○ ×   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│              ▶))) VoxDescriber                                      │
│              Audiodescrição inteligente para todo conteúdo          │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                                                             │   │
│   │                                                             │   │
│   │                     ┌──────────┐                           │   │
│   │                     │          │                           │   │
│   │                     │  🎬      │                           │   │
│   │                     │          │                           │   │
│   │                     └──────────┘                           │   │
│   │                                                             │   │
│   │              Arraste seu vídeo aqui                         │   │
│   │                                                             │   │
│   │           ┌─────────────────────────┐                      │   │
│   │           │   + Selecionar arquivo  │                      │   │
│   │           └─────────────────────────┘                      │   │
│   │                                                             │   │
│   │     Formatos aceitos: MP4 · MOV · AVI · MKV · WebM         │   │
│   │               Tamanho máximo: 10GB                          │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│   (Borda tracejada com leve animação de pulso em #7C5CFC)           │
│                                                                     │
│   Arquivos recentes:                                                │
│   🎬 entrevista_2026.mp4        3.2 GB    há 2 dias   [Reabrir]   │
│   🎬 short_titanio.mp4          580 MB   há 5 dias   [Reabrir]   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Estado de drag-over: borda tracejada vira sólida em #7C5CFC,
fundo da drop zone acende com overlay #3D2F7A + "Solte para carregar"
```

---

### TELA 2: Configurações de Processamento

```
┌─────────────────────────────────────────────────────────────────────┐
│  Arquivo    Configurações    Ajuda                         ● ○ ×   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ◀ Voltar      🎬 entrevista_2026.mp4   (3.2 GB · 00:24:38)        │
│                                                                     │
│  ─── Modelo de IA ──────────────────────────────────────────────   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   ⚡ Rápido  │  │  ⚖ Balancea  │  │  ✨ Qualidade│             │
│  │              │  │     do       │  │              │             │
│  │  ~3 min/hr   │  │  ~8 min/hr   │  │ ~20 min/hr   │             │
│  │   de vídeo   │  │  de vídeo    │  │  de vídeo    │             │
│  │              │  │              │  │              │             │
│  │ Ideal para   │  │ Recomendado  │  │ Broadcast,   │             │
│  │ rascunhos e  │  │ para maioria │  │ streaming    │             │
│  │ testes       │  │ dos casos    │  │ profissional │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                         [SELECIONADO: borda #7C5CFC + bg #3D2F7A]  │
│                                                                     │
│  ─── Voz Narradora ─────────────────────────────────────────────   │
│                                                                     │
│  Idioma:  [PT-BR ▼]                                                 │
│                                                                     │
│  Voz:     [▼ Ana — Feminina, neutra, clara          ] [▶ Ouvir]   │
│           > Ana — Feminina, neutra, clara                           │
│             Carlos — Masculino, grave, formal                       │
│             Bia — Feminina, jovem, dinâmica                         │
│             Voz personalizada (arquivo .wav)...                     │
│                                                                     │
│  Volume da narração                                                 │
│  Silêncio ──────────●────────── Dominante                          │
│             0%  25%  [75%]  100%                                    │
│                                                                     │
│  Sensibilidade de silêncio (mínimo entre falas para inserir AD)     │
│  1s ────────────●──────────────────── 5s                           │
│         [2.5 segundos]                                              │
│                                                                     │
│  ─── Opções avançadas ▼ (colapsado) ────────────────────────────   │
│                                                                     │
│           ┌────────────────────────────────────┐                   │
│           │     🚀 Iniciar Processamento        │                   │
│           └────────────────────────────────────┘                   │
│     Estimativa: ~3 min 15 seg com modelo Balanceado                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### TELA 3: Processamento em Andamento

```
┌─────────────────────────────────────────────────────────────────────┐
│  Arquivo    Configurações    Ajuda                         ● ○ ×   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Processando: entrevista_2026.mp4                                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  🎬 [frame do vídeo pausado — thumbnail extraído]            │   │
│  │                                                              │   │
│  │  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  43%   │   │
│  │  [barra de progresso em gradiente #7C5CFC → #00D4FF]        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Tempo restante estimado: ~1 min 52 seg                             │
│                                                                     │
│  ─── Etapas ────────────────────────────────────────────────────   │
│                                                                     │
│  ✅  Análise de áudio             Concluído em 0:18                 │
│  ✅  Extração de frames           Concluído em 0:42                 │
│  ⏳  Geração de descrições        Em andamento... (frame 847/2340)  │
│  ○   Síntese de voz               Aguardando                        │
│  ○   Montagem final               Aguardando                        │
│                                                                     │
│  ─── Log em tempo real ▼ ──────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ [17:23:41] Frame 847: "Homem de terno azul gesticula ao     │   │
│  │           fundo de uma sala de conferências iluminada"       │   │
│  │ [17:23:40] Frame 846: Cena de interior identificada          │   │
│  │ [17:23:39] Frame 845: 3 pessoas detectadas, sem movimento    │   │
│  │ [17:23:38] Frame 844: Transição de cena                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│           ┌──────────────────────────────┐                         │
│           │         ✕ Cancelar           │                         │
│           └──────────────────────────────┘                         │
│           (botão secundário, vermelho suave)                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### TELA 4: Preview do Resultado

```
┌─────────────────────────────────────────────────────────────────────┐
│  Arquivo    Configurações    Ajuda                         ● ○ ×   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Preview: entrevista_2026.mp4   ✅ 47 audiodescrições geradas       │
│                                                                     │
│  ┌───────────────────────────────────┐  ┌─────────────────────┐   │
│  │                                   │  │  📋 Audiodescrições  │   │
│  │  [PLAYER DE VÍDEO 16:9]           │  │                     │   │
│  │                                   │  │ 00:00:03 ✏          │   │
│  │  ████████████████████░░░░░  8:22  │  │ "Sala de conferi-   │   │
│  │  ◀◀  ▶  ▶▶  🔊───●──  [HD]       │  │ ências vazia, luz   │   │
│  │                                   │  │ natural pelas jane-  │   │
│  │  ┌─────────────────────────────┐  │  │ las"                │   │
│  │  │  ○ Original  ●  Com AD      │  │  ├─────────────────────┤   │
│  │  └─────────────────────────────┘  │  │ 00:00:47 ✏          │   │
│  │  (toggle animado, ciano = ativo)  │  │ "Homem de terno     │   │
│  │                                   │  │ azul entra pela     │   │
│  │  AD atual:                        │  │ porta direita"      │   │
│  │  ┌─────────────────────────────┐  │  ├─────────────────────┤   │
│  │  │ "Sala de conferências vazia │  │  │ 00:01:12 ✏          │   │
│  │  │  luz natural pelas janelas" │  │  │ "Três executivos    │   │
│  │  └─────────────────────────────┘  │  │ se cumprimentam"    │   │
│  │                                   │  ├─────────────────────┤   │
│  └───────────────────────────────────┘  │  [+ Adicionar AD]   │   │
│                                          └─────────────────────┘   │
│                                                                     │
│  ┌────────────────────┐    ┌──────────────────────────────────┐    │
│  │  ◀ Reprocessar     │    │        📤 Exportar →             │    │
│  └────────────────────┘    └──────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

Ao clicar em ✏ numa AD: abre inline editor (campo de texto + botões
Salvar / Cancelar + botão [▶ Regenerar com IA])
```

---

### TELA 5: Exportação

```
┌─────────────────────────────────────────────────────────────────────┐
│  Arquivo    Configurações    Ajuda                         ● ○ ×   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ◀ Voltar ao Preview        Exportar: entrevista_2026.mp4           │
│                                                                     │
│  ─── Formato de saída ──────────────────────────────────────────   │
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │   🎬 MP4 com AD      │  │   📦 MKV + trilha    │               │
│  │   embutida           │  │   separada           │               │
│  │                      │  │                      │               │
│  │   Áudio AD mixado    │  │   Áudio AD como      │               │
│  │   diretamente no     │  │   track independente │               │
│  │   vídeo final        │  │   (mais flexível)    │               │
│  │   Recomendado para   │  │   Recomendado para   │               │
│  │   redes sociais      │  │   broadcast e OTT    │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                     │
│  ┌──────────────────────┐                                          │
│  │   📄 Apenas SRT      │                                          │
│  │   (legenda/script)   │                                          │
│  │                      │                                          │
│  │   Arquivo de texto   │                                          │
│  │   com timestamps     │                                          │
│  │   para uso externo   │                                          │
│  └──────────────────────┘                                          │
│                                                                     │
│  ─── Qualidade de exportação ───────────────────────────────────   │
│                                                                     │
│  ( ) 1080p — HD  (tamanho estimado: 4.1 GB)                        │
│  (●) Mesma qualidade do original  (~3.2 GB)  ← Recomendado         │
│  ( ) Comprimido — Web  (~1.4 GB)                                    │
│                                                                     │
│  ─── Destino ───────────────────────────────────────────────────   │
│                                                                     │
│  📁 /Users/eduardo/Movies/VoxDescriber/   [Alterar]                │
│  Nome:  entrevista_2026_AD.mp4                           [✏]       │
│                                                                     │
│          ┌──────────────────────────────────────────┐              │
│          │           📤 Exportar agora               │              │
│          └──────────────────────────────────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes de UI Reutilizáveis

### `VideoDropZone`
```
Herda de: QWidget
Estado: idle | drag_over | file_loaded | error

Comportamentos:
- idle: borda tracejada 2px #4A5080, fundo transparente, ícone centralizado
- drag_over: borda sólida 2px #7C5CFC, fundo #1F1A3C, pulse animation 0.8s
- file_loaded: mostra thumbnail + nome + tamanho + botão "Trocar arquivo"
- error: borda #EF4444, mensagem de erro inline

Sinais Qt:
  fileDropped(path: str)
  fileSelected(path: str)

Métodos públicos:
  setAcceptedFormats(formats: list[str])
  setMaxSizeGB(size: float)
  reset()
```

---

### `ModelSelector`
```
Herda de: QWidget (3 cards filhos: ModelCard)
Estado por card: unselected | selected | hover | disabled

ModelCard contém:
  - Ícone (emoji ou SVG)
  - Nome do modelo
  - Tempo estimado por hora de vídeo
  - Descrição de uso ideal
  - Borda highlight quando selected: 2px #7C5CFC

Sinal:
  modelChanged(model: str)  # "fast" | "balanced" | "quality"

Props:
  defaultModel: str = "balanced"
  showEstimates: bool = True
```

---

### `VoiceSelector`
```
Herda de: QHBoxLayout (QComboBox + QPushButton)

ComboBox customizado:
  - Item template: [nome — gênero, tom, descrição]
  - Suporte a item especial "Voz personalizada..." (abre QFileDialog)

Botão Preview:
  - Ícone ▶ / ⏹ (toggle durante reprodução)
  - Reproduz ~5 segundos de amostra da voz selecionada
  - Usa QMediaPlayer interno

Sinais:
  voiceChanged(voice_id: str)
  previewRequested(voice_id: str)

Props:
  language: str = "pt-BR"
  voices: list[VoiceModel]
```

---

### `ProgressStepper`
```
Herda de: QWidget

Renderiza lista vertical de etapas. Cada etapa tem:
  - Ícone circular (✅ done | ⏳ active | ○ pending | ✕ error)
  - Nome da etapa
  - Detalhe (tempo, contagem, mensagem de erro)
  - Linha conectora vertical entre etapas

Estados de ícone por cor:
  done   → #22C55E  (verde)
  active → #F59E0B  (âmbar, com animação de rotação ou pulso)
  pending→ #4A5080  (cinza)
  error  → #EF4444  (vermelho)

Método:
  updateStep(step_id: str, status: StepStatus, detail: str = "")
```

---

### `ADEditor`
```
Herda de: QTableWidget customizado

Colunas:
  | Timestamp | Audiodescrição | Duração | Ações |

Comportamentos:
  - Double-click na linha: abre campo de edição inline
  - Botão ✏ por linha: edição
  - Botão 🗑 por linha: remover (com confirmação)
  - Botão [+ Adicionar AD] no rodapé
  - Seleção de linha destaca no player externo (via sinal)

Sinais:
  adEdited(index: int, old_text: str, new_text: str)
  adDeleted(index: int)
  adAdded(timestamp: float, text: str)
  rowSelected(timestamp: float)

Suporte a undo/redo (Ctrl+Z / Ctrl+Y) via QUndoStack
```

---

### `VideoPlayer`
```
Herda de: QWidget (QVideoWidget + controles customizados)

Controles:
  - Play/Pause (Space)
  - Seek bar (click + drag)
  - Retroceder/avançar 5s (← →)
  - Volume (scroll do mouse)
  - Toggle "Original / Com AD" (QToggleButton customizado)
    → troca entre duas tracks de áudio em tempo real
  - Marcadores visuais na seek bar nas posições das ADs
    (bolinhas pequenas em #00D4FF)

Sinais:
  positionChanged(ms: int)
  modeChanged(mode: str)  # "original" | "ad"
  playbackStateChanged(state: str)
```

---

## 🎯 UX — Experiência do Usuário

### Gestão de Tempo de Espera

| Vídeo     | Modelo Rápido | Balanceado | Qualidade |
|-----------|--------------|------------|-----------|
| 5 min     | ~15 seg      | ~40 seg    | ~1:40     |
| 30 min    | ~1:30        | ~4:00      | ~10:00    |
| 1h        | ~3:00        | ~8:00      | ~20:00    |
| 2h+       | ~6:00        | ~16:00     | ~40:00    |

**Estratégias para comunicar espera:**
1. **Estimativa antes de começar** — na Tela 2, calcular e mostrar antes do clique
2. **Progress bar por etapa** — não só % geral, mas qual etapa está rodando
3. **Log ao vivo** — usuário vê o processamento acontecer (não parece travado)
4. **Notificação do sistema** — ao completar, notificação nativa (macOS/Windows)
5. **Estimativa dinâmica** — "tempo restante: X min" atualizado a cada 5 segundos
6. **Microcopy motivacional** — "47 cenas analisadas ✓", "Mais 823 pra ir!"

---

### Tratamento de Erros — Design Amigável

```
Princípio: NUNCA mostrar stack traces ou mensagens técnicas para o usuário.

Formato padrão de erro:
┌────────────────────────────────────────────────────────┐
│  ⚠️  Não foi possível processar o arquivo              │
│                                                        │
│  O codec H.265/HEVC deste vídeo não é suportado        │
│  pela sua versão do ffmpeg.                            │
│                                                        │
│  O que você pode fazer:                                │
│  • Converter o vídeo para H.264 antes de importar      │
│  • Usar HandBrake (gratuito) para converter            │
│                                                        │
│  [📋 Copiar detalhes técnicos]  [Tentar outro arquivo] │
└────────────────────────────────────────────────────────┘

Categorias de erro e mensagens:
  arquivo_corrompido → "Parece que o arquivo está danificado..."
  codec_nao_suportado → "Formato não reconhecido..."
  sem_silencio → "Não encontrei pausas suficientes no áudio..."
  sem_api_key → "Configure sua chave de API nas Configurações..."
  memoria_insuficiente → "Vídeo muito grande para o modelo selecionado..."
  timeout → "O processamento demorou mais que o esperado..."
```

---

### Acessibilidade (a ironia resolvida)

Um app de acessibilidade que não é acessível seria um desastre de relações públicas. Aqui está o plano:

**Screen Readers:**
- Todos os widgets Qt devem ter `setAccessibleName()` e `setAccessibleDescription()`
- VideoDropZone: label "Área de soltar arquivo de vídeo, pressione Enter para abrir seletor"
- ProgressStepper: emite atualização de acessibilidade a cada mudança de etapa
- ADEditor: células anunciadas corretamente ("Audiodescrição em 00:47, editar com F2")

**Contraste:**
- Todos os textos passam WCAG AA (mínimo 4.5:1)
- Textos grandes (#F0F2FF sobre #1A1F3C = contraste 14:1 ✅)
- Botões CTA (#F0F2FF sobre #7C5CFC = contraste 7:1 ✅)
- Não depender só de cor para indicar estado (usar ícones + texto também)

**Navegação por teclado:**
- Tab order lógico em todas as telas
- Focus ring visível (2px sólido #00D4FF, não o padrão do OS)
- Nenhuma função acessível só por mouse

**Motor de voz:**
- Preview de voz no seletor acessível por teclado (F5 = preview da voz atual)
- Descrição textual de cada voz no tooltip

---

### Shortcuts de Teclado

```
GLOBAIS
─────────────────────────────────────────
Cmd/Ctrl + O          Abrir arquivo
Cmd/Ctrl + ,          Configurações
Cmd/Ctrl + Q          Sair
F1                    Ajuda

TELA 2 — CONFIGURAÇÕES
─────────────────────────────────────────
1 / 2 / 3             Selecionar modelo Rápido/Balanceado/Qualidade
F5                    Preview da voz selecionada
Enter                 Iniciar processamento

TELA 3 — PROCESSAMENTO
─────────────────────────────────────────
Escape                Cancelar (pede confirmação)
L                     Expandir/colapsar log

TELA 4 — PREVIEW
─────────────────────────────────────────
Space                 Play / Pause
← →                   Retroceder / avançar 5 segundos
↑ ↓                   Navegar entre audiodescrições na lista
A                     Toggle Original / Com AD
E ou F2               Editar AD selecionada
Cmd/Ctrl + Z          Desfazer edição
Cmd/Ctrl + E          Ir para exportação

TELA 5 — EXPORTAÇÃO
─────────────────────────────────────────
Enter                 Exportar
Escape                Voltar ao preview
```

---

## 📐 Especificações de Layout

```
JANELA
  Tamanho mínimo: 960 × 640 px
  Tamanho padrão: 1280 × 800 px
  Redimensionável: sim
  Modo fullscreen: sim (F11)

ESPAÇAMENTOS (grid de 8px)
  Margem das telas: 32px
  Gap entre seções: 24px
  Gap entre componentes: 16px
  Padding interno dos cards: 20px
  Border-radius dos cards: 12px
  Border-radius dos botões: 8px

BOTÕES
  CTA primário: bg #7C5CFC, texto branco, padding 12px 32px
  Secundário: borda 1px #4A5080, fundo transparente, texto #8890B5
  Destrutivo: borda 1px #EF4444, texto #EF4444, fundo transparente

ANIMAÇÕES
  Transições de estado: 150ms ease-in-out
  Hover nos cards: scale(1.02) + shadow elevation
  Drop zone pulse: keyframe 2s loop, opacity 0.5 → 1 → 0.5
  Ícone de loading: rotação 1s linear loop
```

---

## 🗺️ Fluxo de Navegação

```
[Tela 1: Drop]
     │
     ▼ arquivo selecionado
[Tela 2: Configurações]
     │                   │
     ▼ iniciar           ◀ voltar
[Tela 3: Processamento]
     │                   │
     ▼ concluído         ▼ cancelado → Tela 1
[Tela 4: Preview]
     │          │        │
     ▼ exportar ▼ editar ◀ reprocessar → Tela 2
[Tela 5: Export]
     │
     ▼ exportado
[Notificação + abrir pasta]
     │
     ▼ novo arquivo?
[Tela 1: Drop]
```

---

## 📦 Estrutura de Arquivos do Projeto UI

```
voxdescriber/
├── ui/
│   ├── components/
│   │   ├── video_drop_zone.py
│   │   ├── model_selector.py
│   │   ├── voice_selector.py
│   │   ├── progress_stepper.py
│   │   ├── ad_editor.py
│   │   └── video_player.py
│   ├── screens/
│   │   ├── screen_drop.py
│   │   ├── screen_config.py
│   │   ├── screen_processing.py
│   │   ├── screen_preview.py
│   │   └── screen_export.py
│   ├── styles/
│   │   ├── theme.py          # paleta, fonte, constantes
│   │   ├── dark.qss          # Qt stylesheet dark mode
│   │   └── light.qss         # Qt stylesheet light mode
│   ├── assets/
│   │   ├── icons/            # SVGs
│   │   └── fonts/            # Inter + JetBrains Mono
│   └── main_window.py        # janela principal + roteamento
├── core/                     # lógica de negócio (separada da UI)
└── main.py
```

---

## 🔮 Próximos Passos

1. **Protótipo interativo** — Converter wireframes para Figma ou Penpot
2. **Implementar tema** — Criar `dark.qss` com todas as variáveis de cor
3. **VideoDropZone** — Componente mais crítico, implementar primeiro
4. **Design System doc** — Exportar tokens de design (JSON) para consistência
5. **Teste de acessibilidade** — VoiceOver (macOS) + NVDA (Windows) antes do beta
6. **Internacionalização** — Preparar para EN-US, ES desde o início (Qt i18n)

---

*Design Document criado pela Squad Titanio — VoxDescriber v1.0*  
*"Tornando cada vídeo acessível para todos."*
