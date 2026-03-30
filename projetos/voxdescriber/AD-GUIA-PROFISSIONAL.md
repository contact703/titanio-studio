# Guia Profissional de Audiodescrição (AD)
*Ada Vox — VoxDescriber — Março 2026*

---

## 1. O QUE É AUDIODESCRIÇÃO

Narração oral inserida nos silêncios de um conteúdo audiovisual para torná-lo acessível a pessoas com deficiência visual. A AD não substitui o áudio original — ela **complementa** o que os olhos veriam.

---

## 2. TIMING — A REGRA DE OURO

| Duração do slot | Regra |
|---|---|
| < 1.5s | NÃO usar — áudio será cortado |
| 1.5–3s | 1 frase curta, máx 6–7 palavras |
| 3–6s | 1–2 frases, máx 12–15 palavras |
| > 6s | Descrição completa de cena |

**Margem de segurança:** Nunca usar mais de 90% da duração do slot.

**Velocidade de referência:** `say -v Luciana -r 150` = ~2.5 palavras/segundo.
- 1.5s → 3–4 palavras máximo  
- 3s → 7 palavras  
- 6s → 14 palavras  
- 10s → 22 palavras  

**Regra absoluta:** NUNCA sobrepor diálogos ou sons narrativos.

---

## 3. O QUE DESCREVER (por prioridade)

1. **AÇÕES principais** — o que os personagens FAZEM (verbo no presente)
2. **PERSONAGENS novos** — aparência essencial na primeira aparição
3. **AMBIENTE** — quando muda drasticamente de cena anterior
4. **TEXTO NA TELA** — títulos, letreiros, créditos, mensagens
5. **EMOÇÕES visíveis** — que não estão expressas no áudio

---

## 4. O QUE NÃO DESCREVER

- Sons já audíveis (explosão, choro, risadas, música tocando)
- Coisas óbvias pelo contexto auditivo
- Interpretações subjetivas ("parece triste", "talvez seja")
- Detalhes irrelevantes para a narrativa
- Câmera/enquadramento (exceto quando crucial: "câmera subjetiva", "plongée")

---

## 5. COMO ESCREVER — ESTILO PROFISSIONAL

### Regras de redação

- **Tempo verbal: presente** — "Ele corre", não "Ele correu"
- **Frase completa** — nunca cortar no meio de uma ideia
- **Objetividade** — descrição factual, não opinativa
- **Vocabulário claro** — sem jargões técnicos desnecessários
- **Voz ativa** — "João abre a porta", não "A porta é aberta por João"

### Exemplos práticos

❌ **ERRADO:** "Vista aérea de barcos no..."  
✅ **CERTO:** "Vista aérea do porto."

❌ **ERRADO:** "Ele parece muito nervoso e assustado com o que vê."  
✅ **CERTO:** "Ele recua, olhos arregalados."

❌ **ERRADO:** "Uma mulher bonita de cabelos vermelhos longos e lisos..."  
✅ **CERTO:** "Mulher de cabelo vermelho desce as escadas."

### Princípio "menor e completa"

> Se não couber tudo: **descrição menor e completa > descrição maior cortada**

---

## 6. PERSONAGENS — PRIMEIRAS APARIÇÕES

Na primeira vez que um personagem aparece, descrever:
- Característica física mais marcante (cor do cabelo, acessório, roupa)
- Etnia/pele quando relevante para a narrativa
- Idade aproximada quando relevante

Não descrever: altura relativa sem referência, peso, beleza subjetiva.

---

## 7. REFERÊNCIAS E NORMAS

### Brasileiras
- **ABNT NBR 16452** — Audiodescrição: parâmetros para serviços de AD em obras audiovisuais
  - Define: clareza de dicção, adequação ao estilo da obra, respeito ao ritmo original
  - Proíbe: descrições que revelem spoilers de surpresas narrativas ainda não ocorridas
  - Exige: sincronia com o conteúdo visual, sem sobreposição de diálogos

### Internacionais
- **Netflix AD Style Guide** — Descrever ações, ambientes, figurinos, expressões faciais, texto na tela. Tom deve combinar com o tom da obra.
- **BBC AD Guidelines** — Priorizar ações e movimento. Indicar mudanças de cena. Descrever humor visual que seria perdido.
- **DCMP (EUA)** — Linguagem clara e concisa. Identificar personagens com consistência ao longo da obra.

---

## 8. PIPELINE TÉCNICO

```bash
# 1. Detectar silêncios (slots)
ffmpeg -i input.mp4 -af silencedetect=noise=-35dB:d=1.5 -f null - 2>&1

# 2. Gerar TTS de teste
say -v Luciana -r 150 "Texto de audiodescrição." -o /tmp/ad_teste.aiff
afconvert /tmp/ad_teste.aiff /tmp/ad_teste.wav -d LEI16 -f WAVE
ffprobe -i /tmp/ad_teste.wav -show_entries format=duration -v quiet -of csv="p=0"

# 3. Mixar com ducking (AD em destaque, trilha baixa)
ffmpeg -i video.mp4 -i ad_completa.wav \
  -filter_complex "[0:a]volume=0.3[bg];[1:a]volume=1.5[fg];[bg][fg]amix=inputs=2:duration=first[out]" \
  -map 0:v -map "[out]" -c:v copy -c:a aac output.mp4
```

---

## 9. CHECKLIST ANTES DE ENTREGAR

- [ ] Nenhum AD sobrepõe diálogo
- [ ] Todos os slots < 1.5s foram removidos
- [ ] Cada frase é completa (sem cortes)
- [ ] Frases no tempo presente
- [ ] Texto na tela foi descrito
- [ ] Personagens principais foram apresentados na primeira aparição
- [ ] Duração do áudio < 90% do slot
- [ ] Áudio mixado com ducking adequado

---

*Guia baseado em: ABNT NBR 16452, Netflix AD Style Guide, BBC AD Guidelines, DCMP Best Practices*
