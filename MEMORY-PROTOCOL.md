# 🧠 MEMORY PROTOCOL — Como Tita aprende de verdade

**Criado:** 2026-03-22 22:00  
**Criticidade:** ALTA  
**Status:** IMPLEMENTAR IMEDIATAMENTE

---

## O Problema

Zica identificou: Eu descubro técnicas (instagrapi funciona), mas não registro. Aí esqueço e torno a descobrir.

**Ciclo quebrado:**
1. Tenta algo → Funciona
2. Continua respondendo
3. Próxima pergunta → Esqueceu que funcionou
4. Tenta de novo do zero

**Raiz causa:** Memória não é automática. Aprendi na sessão, esqueci na próxima.

---

## A Solução: MEMORY-PROTOCOL

### 📋 Regra 1: Memory Search no Início

**ANTES de responder qualquer pergunta técnica:**

```python
memory_search("topico relevante")
# Sempre fazer isso
```

**Exemplos:**
- "Instagram vídeo download método" 
- "Dashboard especialistas"
- "Modelo troca context transfer"
- "N8n workflow setup"

### 📝 Regra 2: Capture Lesson ao Final

**DEPOIS de descobrir algo que funciona:**

Registrar em MEMORY.md:
- O QUÊ: Técnica/método
- COMO: Código/comando exato
- ONDE: Path/arquivo/credenciais
- QUANDO: Data da descoberta
- STATUS: ✅ Testado / ⚠️ Com limitações / ❌ Não funciona

**Exemplo:**
```
## Instagram Download (2026-03-22)
✅ **instagrapi** — Funciona com login
- Login: `cl.login("titaniodashboard", "Rita160679!")`
- Post: `cl.media_info(cl.media_pk_from_code(shortcode))`
- Limitação: Bloqueia em challenge às vezes
- Credenciais: /cofre/insta-credentials.json

❌ **web_fetch direto** — Instagram bloqueia
- Não funciona com URLs públicas
- Sempre retorna empty content

✅ **yt-dlp** — Funciona
- Comando: `yt-dlp "url" -o "/tmp/file.mp4"`
- Limitação: Falha em perfis privados
- Alternativa: Usar instagrapi se privado
```

### 🔄 Regra 3: Consolidar Diariamente

**Ao fim de cada dia (não esperar heartbeat):**

1. Revisar MEMORY.md
2. Remover duplicatas
3. Atualizar timestamps
4. Registrar falhas (não só sucessos)

---

## 📚 O que Registrar

### ✅ Sempre registrar:
- Técnicas que funcionam (código exato)
- Credenciais e paths
- Limitações descobertas
- Alternativas testadas
- Data da descoberta

### ❌ NUNCA registrar:
- Senhas em plaintext (use descrição)
- URLs que falham (só método falha, não URL)
- Coisas óbvias (se já tá em docs)

### 🟡 Registrar com cuidado:
- APIs que mudam (anotar versão)
- Bloqueios do Instagram (Instagram muda, método permanece)
- Workarounds temporários (anotar "temporário")

---

## 🔀 O Fluxo Correto

```
Pergunta → memory_search → Responder com contexto
                              ↓
                        Descobrir técnica
                              ↓
                        REGISTRAR EM MEMORY.MD
                              ↓
                        Consolidar ao final do dia
                              ↓
                        Próxima pergunta → memory_search → Acha registro
```

**Antes (quebrado):**
```
Pergunta → Responder → Esquecer → Próxima pergunta → Redescobrir
```

---

## 📝 Template de Registro

Sempre usar esse template ao guardar técnica:

```markdown
## [TÉCNICA] — Título claro

**Data descoberta:** YYYY-MM-DD  
**Status:** ✅ Testado / ⚠️ Limitado / ❌ Bloqueado  

### Como funciona
- Código/comando exato
- Pré-requisitos
- Possíveis erros

### Credenciais necessárias
- O quê (não senha)
- Path do arquivo

### Limitações
- Quando falha
- Bloqueios conhecidos
- Alternativas

### Última atualização
- Data
- O que mudou

### Próximos passos
- Se aplicável
```

---

## 🎯 Implementação Imediata

### Hoje (22/03):
- [x] Registrar instagrapi (funciona)
- [x] Registrar yt-dlp (funciona)
- [x] Registrar web_fetch (bloqueado)
- [x] Criar este MEMORY-PROTOCOL.md

### Amanhã em diante:
- [ ] Chamar memory_search ANTES de responder
- [ ] Registrar descobertas EM TEMPO REAL
- [ ] Consolidar daily
- [ ] Revisar MEMORY.md a cada novo dia

---

## ✅ Assinado

**Tita, você concorda com esse protocolo?**

Se sim: implementar AGORA.  
Se precisa ajuste: informar Zica.

**Zica aprovou?**

Se sim: Tita começa a usar.  
Se não: ajustar e reapresentar.

---

**Objetivo:** Parar de esquecer técnicas.  
**Prazo:** Começar HOJE MESMO.  
**Verificação:** Zica vai testar amanhã se realmente estou aprendendo.

