# 🎮 SLIME SURGE - Game Design Document

## Nome do Jogo
**SLIME SURGE** (alternativas: Slime Runner, Blob Absorb)

---

## 🎯 Conceito Core

Um slime fofo corre automaticamente por fases coloridas, absorvendo objetos menores para crescer. Quanto maior, mais forte. No final de cada fase, enfrenta um "boss" em comparação de tamanho.

**Gênero:** Hyper-casual Runner  
**Plataformas:** Android, PC (WebGL)  
**Público:** Todos (casual gamers, 13+)

---

## 🕹️ Mecânica Principal

### Controle (One-Touch):
- **Mobile:** Arrastar dedo para esquerda/direita
- **PC:** Mouse ou A/D

### Core Loop:
1. Slime corre automaticamente
2. Jogador desvia de obstáculos
3. Absorve objetos menores (frutas, cubos, moedas)
4. Cresce de tamanho
5. Passa por gates multiplicadores (×2, +10, etc)
6. Boss fight final (comparação de tamanho)
7. Vitória = próximo nível + recompensas

### Regras:
- Absorve apenas objetos **menores** que você
- Tocar objeto **maior** = perde tamanho
- Tamanho zero = game over
- Gates podem multiplicar OU dividir

---

## 🌈 Estética Visual

### Paleta de Cores:
- **Slime:** Verde-limão vibrante (#7FFF00) com brilho
- **Cenário:** Pastéis suaves (rosa, azul bebê, lavanda)
- **Obstáculos:** Vermelho coral (#FF6B6B)
- **Coletáveis:** Dourado, roxo, ciano
- **UI:** Branco com sombras suaves

### Estilo:
- **Low Poly** com shading suave
- Bordas arredondadas
- Partículas em tudo (absorção, vitória, gates)
- Câmera 3/4 isométrica ou third person

### Ambiente:
- Pista flutuante no céu
- Nuvens low poly no fundo
- Arco-íris ocasionais
- Plataformas coloridas

---

## 👾 Personagem: BLOBBY

### Aparência:
- Forma de gota/slime arredondada
- Olhos grandes e expressivos (estilo kawaii)
- Bounce sutil enquanto se move
- Deixa trail de brilho
- Muda de cor conforme skins

### Skins Desbloqueáveis:
1. **Classic Green** (padrão)
2. **Ocean Blue**
3. **Sunset Orange**
4. **Galaxy Purple**
5. **Golden Slime** (premium)
6. **Rainbow** (premium)
7. **Ghost** (translúcido)
8. **Fire Slime**
9. **Ice Slime**
10. **Neon Pink**

### Animações:
- Idle: bounce suave
- Absorb: stretch + squash satisfatório
- Damage: shake + flash vermelho
- Win: pulo + confetti
- Grow: expansão com particles

---

## 📖 Storytelling

### Premissa:
> "No mundo flutuante de Chromia, pequenos slimes sonham em se tornar gigantes. Blobby, o menor de todos, descobre que absorvendo a essência colorida espalhada pelo mundo, pode crescer indefinidamente. Mas cuidado - os Guardiões de cada reino não gostam de intrusos..."

### Progressão Narrativa (sutil):

**Mundo 1 - Pradaria Pastel (Níveis 1-10)**
- Tutorial natural
- Inimigos: Cubos básicos
- Boss: "Cubo Rei" - cubo gigante

**Mundo 2 - Floresta Cristal (Níveis 11-25)**
- Novos coletáveis: cristais
- Obstáculos móveis
- Boss: "Golem de Cristal"

**Mundo 3 - Oceano Cósmico (Níveis 26-40)**
- Plataformas que afundam
- Coletáveis subaquáticos
- Boss: "Leviatã Bolha"

**Mundo 4 - Vulcão Neon (Níveis 41-60)**
- Obstáculos de lava
- Speed boost zones
- Boss: "Magma Titan"

**Mundo 5 - Céu Infinito (Níveis 61-100)**
- Todos os elementos combinados
- Boss Final: "O Slime Ancestral"

### Diálogos (pop-ups curtos):
- Início: "Hora de crescer!"
- Absorção grande: "Yummy!"
- Gate ×2: "DOUBLE!"
- Boss: "Quem é maior agora?"
- Vitória: "Slime Surge!"

---

## 🎵 Áudio

### Música:
- Upbeat, happy, loop de 60 segundos
- Estilo: lo-fi / chiptune moderno
- Variações por mundo

### SFX:
- **Absorb:** "blob" satisfatório
- **Grow:** "whoosh" + sparkle
- **Gate:** "ding" mágico  
- **Damage:** "squish" triste
- **Boss defeat:** fanfarra épica
- **UI:** clicks suaves

---

## 💰 Monetização

### Ads:
1. **Interstitial:** A cada 3 níveis
2. **Rewarded:**
   - Revive (continuar do checkpoint)
   - 2× moedas do nível
   - Skin temporária gratuita
   - Skip nível difícil

### IAP:
1. **Remove Ads:** R$9,90
2. **Starter Pack:** 1000 moedas + skin = R$4,90
3. **Premium Skin Pack:** R$7,90
4. **Mega Bundle:** Tudo = R$19,90

### Moeda Virtual:
- **Gemas:** ganhas em níveis, usadas para skins
- **Boost Tokens:** rewarded ads, powerups temporários

---

## 📱 UI/UX

### Tela Inicial:
```
    [SLIME SURGE]
       🟢
    [▶ JOGAR]
    [🎨 SKINS]  [⚙️]
    
    💎 1,250
```

### HUD In-Game:
```
[Nível 15]     [⏸️]
   
      💎 +5
    
[===🟢===] (barra de tamanho)
```

### Tela de Vitória:
```
    ⭐⭐⭐
   VOCÊ VENCEU!
   
   Tamanho: MEGA!
   Moedas: +150 💎
   
[🎬 2x Moedas] [▶ Próximo]
```

---

## 🛠️ Especificações Técnicas

### Unity:
- Versão: 2022.3 LTS ou 6000
- Render: URP (Universal Render Pipeline)
- Física: Rigidbody simplificado

### Estrutura de Scripts:
```csharp
// Core
GameManager.cs      // Estado do jogo
LevelManager.cs     // Carrega níveis
PlayerController.cs // Movimento slime
SlimeGrowth.cs      // Sistema de absorção

// Gameplay
Collectible.cs      // Itens absorvíveis
Gate.cs             // Multiplicadores
Obstacle.cs         // Dano
BossCompare.cs      // Sistema de boss

// Systems
AudioManager.cs     // Sons e música
UIManager.cs        // Interface
SaveSystem.cs       // Progresso
AdManager.cs        // Anúncios

// Helpers
ObjectPool.cs       // Performance
CameraFollow.cs     // Câmera suave
```

### Assets Necessários:
- Slime (personagem principal) - Blender
- 10 skins variantes
- 50+ coletáveis low poly
- 5 bosses
- 5 cenários
- Partículas
- UI sprites

---

## 📋 Milestones

### Fase 1 - Protótipo (2-3 dias)
- [ ] Movimento básico
- [ ] Sistema de absorção
- [ ] 1 nível jogável

### Fase 2 - Core Loop (3-4 dias)
- [ ] Gates funcionando
- [ ] Boss comparison
- [ ] Progressão de níveis

### Fase 3 - Polish (2-3 dias)
- [ ] Assets finais
- [ ] Partículas
- [ ] Áudio
- [ ] UI completa

### Fase 4 - Monetização (1-2 dias)
- [ ] Ads integrados
- [ ] Sistema de skins
- [ ] Save/Load

### Fase 5 - Build & Test (1-2 dias)
- [ ] Android APK
- [ ] PC Build
- [ ] Bug fixes

---

## 🎯 Diferenciais Competitivos

1. **Visual único** - Low poly + neon vibrante
2. **Personagem carismático** - Blobby com personalidade
3. **Satisfação máxima** - Absorção tem feedback incrível
4. **Meta progression** - Skins motivam replay
5. **Bosses memoráveis** - Momentos virais

---

*"Absorva. Cresça. Domine."*

**SLIME SURGE** 🟢
