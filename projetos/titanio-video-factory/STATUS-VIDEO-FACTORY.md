# 📊 STATUS — Titanio Video Factory

**Gerado em:** 27/03/2026 14:15 GMT-3  
**Por:** Tita (bot de documentação)

---

## ✅ STATUS GERAL: OPERACIONAL

Pipeline completa e funcionando. Vídeo de teste gerado com sucesso.

---

## Verificação de Dependências

| Ferramenta | Status | Versão |
|---|---|---|
| ffmpeg | ✅ Instalado | `/opt/homebrew/bin/ffmpeg` |
| moviepy | ✅ Instalado | 1.0.3 |
| edge-tts | ✅ Instalado | 7.2.8 (instalado agora) |
| Pillow | ✅ Instalado | disponível |
| numpy | ✅ Instalado | 2.4.3 |
| anthropic | ✅ Instalado | disponível |
| Python | ✅ 3.x | arm64 (Mac Mini M-series) |

---

## Teste de Produção

### Vídeo de Teste (10s, 2 cenas)
```
Tema:      "Titanio Video Factory"
Cenas:     2 × 5.0s
Resolução: 1080×1920
Voz:       pt-BR-FranciscaNeural (Edge TTS neural)
Saída:     /tmp/teste-titanio-10s.mp4
```

**Resultado:**
- ✅ Narração gerada (edge-tts Microsoft Azure neural)
- ✅ Frames renderizados (MoviePy + Pillow)
- ✅ Vídeo exportado (H.264 + AAC via FFmpeg)
- ⏱️  **Tempo de produção: 6.7 segundos** (para 10s de vídeo)
- 📦 **Tamanho: 154.8KB** (comprimido eficientemente)

Extrapolação para 30s (4 cenas): ~20 segundos de produção (estimado)  
*Performance real pode variar — primeiro teste foi 6.7s para 10s*

---

## Arquivos Criados

```
projetos/titanio-video-factory/
├── README.md              ✅ Documentação completa
├── PLANO.md               ✅ V1 status + V2 roadmap
├── PLANO.md               ✅ Planejamento detalhado
├── video_factory.py       ✅ Script principal (16KB)
├── requirements.txt       ✅ Dependências documentadas
├── STATUS-VIDEO-FACTORY.md ← este arquivo
└── exemplos/
    ├── produtividade.json ✅ Template: 5 hábitos
    ├── dinheiro.json      ✅ Template: renda online
    └── saude.json         ✅ Template: saúde
```

---

## Como Usar Agora

```bash
# Teste rápido (sem Claude — usa roteiro demo)
cd projetos/titanio-video-factory
python3 video_factory.py

# Com tema (usa Claude para roteiro)
python3 video_factory.py --tema "5 dicas de investimento"

# Com roteiro pronto
python3 video_factory.py --roteiro exemplos/produtividade.json

# Voz masculina
python3 video_factory.py --tema "meu tema" --voz pt-BR-AntonioNeural

# Verificar instalação
python3 video_factory.py --check
```

---

## Vozes Testadas

| Voz | Gênero | Qualidade | Status |
|---|---|---|---|
| pt-BR-FranciscaNeural | Feminina | Neural (excelente) | ✅ Testada |
| pt-BR-AntonioNeural | Masculina | Neural (excelente) | ✅ Disponível |

---

## Comparação com Projeto VoxDescriber

O projeto `voxdescriber` (já existente) faz algo diferente:
- **VoxDescriber:** adiciona audiodescrição a vídeos existentes (acessibilidade)
- **Video Factory:** cria vídeos novos a partir de texto (criação de conteúdo)

São complementares, não concorrentes.

---

## Notas Técnicas

### Edge TTS
- API da Microsoft, gratuita, sem limite de uso doméstico
- Requer conexão de internet (não é offline)
- Vozes neurais: qualidade similar ao OpenAI TTS
- Sem necessidade de API key

### MoviePy
- Versão 1.0.3 (estável) — evitar v2.x (breaking changes)
- Usa FFmpeg internamente para codec H.264

### Limitações conhecidas
- Font fallback para PIL default se Helvetica não disponível
- Edge TTS: sem controle de velocidade via SDK direto (usa SSML)
- MoviePy: renderização é single-thread (melhoria futura: paralelo)

---

## Próximos Passos (V2)

1. Dashboard web para gerenciar produções
2. Templates visuais (dark, neon, clean)
3. Batch mode (múltiplos vídeos de CSV)
4. Auto-post Instagram/YouTube
5. Imagens de fundo (Unsplash/Pexels)
6. Animações de texto

---

*Titanio Films — Maricá, RJ — 2026*  
*Pipeline criada por Tita (AI) com stack 100% open source*
