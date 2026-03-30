# Guia: Migrando OpenClaw para Plano Anthropic Team

**Autor:** Tita (Claude Opus)  
**Data:** 2026-03-03  
**Contexto:** Eduardo migrou de plano Pessoal para Team da Anthropic e precisou reconfigurar o OpenClaw para usar o novo plano via OAuth (token) ao invés de API key.

---

## 📋 Resumo do Problema

O OpenClaw estava configurado com:
- Plano **Pessoal** da Anthropic (que atingiu o rate limit)
- Autenticação via `anthropic:ita` (token OAuth do plano pessoal)
- Modelo primário: Moonshot/Kimi (fallback quando Anthropic falhava)

**Erro exibido:**
```
⚠️ API rate limit reached. Please try again later.
Your credit balance is too low to access the Anthropic API.
```

**Solução:** Migrar para o plano **Team** usando autenticação OAuth (token) ao invés de API key.

---

## 🎯 Objetivo

Configurar o OpenClaw para usar:
1. **Plano Team** da Anthropic (via OAuth/token)
2. **Claude Opus 4.6** como modelo primário
3. **Kimi K2.5** como fallback

---

## 🛠️ Passo a Passo

### 1. Gerar Token de Setup (no terminal)

Abra um terminal e rode:

```bash
claude setup-token
```

Ou, se não funcionar:

```bash
openclaw setup-token
```

Isso vai abrir o navegador para você fazer login. **IMPORTANTE:** Certifique-se de fazer login no workspace **TEAM**, não no pessoal!

> 💡 **Dica:** O token gerado começa com `sk-ant-oat01-...`

---

### 2. Rodar o Wizard de Configuração

No terminal, execute:

```bash
openclaw configure
```

Siga as etapas:

1. **Local do Gateway:** Selecione "Local (this machine)" (já deve estar selecionado)

2. **Seção para configurar:** Use as setas para selecionar **"Model"** e aperte `Espaço` para marcar, depois `Enter`

3. **Provider:** Selecione **"Anthropic"**

4. **Método de autenticação:** Escolha **"Anthropic token (paste setup-token)"**

5. **Cole o token:** Cole o token gerado no passo 1 (ex: `sk-ant-oat01-...`)

6. **Nome do token:** Pode deixar em branco ou colocar um nome descritivo (ex: `claudio`)

7. **Modelos OAuth:** Selecione os modelos desejados (Claude Sonnet/Opus)

8. **Finalizar:** Selecione **"Continue"** para salvar as configurações

---

### 3. Editar o Config para Definir Modelo Primário

O wizard configura o auth, mas o modelo primário ainda pode estar como Kimi. Para mudar para Claude Opus, edite o arquivo de config:

```bash
nano /Volumes/TITA_039/MAC_MINI_03/.openclaw/openclaw.json
```

#### Alterações necessárias:

**A. Modelo primário (em `agents.defaults.model`):**

```json
"model": {
  "primary": "anthropic/claude-opus-4-6",
  "fallbacks": [
    "anthropic/claude-sonnet-4-6",
    "moonshot/kimi-k2.5"
  ]
}
```

**B. Lista de modelos disponíveis (em `agents.defaults.models`):**

```json
"models": {
  "anthropic/claude-opus-4-6": {},
  "anthropic/claude-sonnet-4-6": {},
  "moonshot/kimi-k2.5": {}
}
```

**C. Ordem de autenticação (em `auth.order`):**

Certifique-se de que o novo perfil de token esteja primeiro:

```json
"order": {
  "anthropic": [
    "anthropic:claudio",
    "anthropic:manual",
    "anthropic:default"
  ]
}
```

> 💡 **Nota:** O nome do perfil (ex: `anthropic:claudio`) é definido quando você nomeia o token no wizard.

---

### 4. Salvar e Sair do Nano

No editor nano:

1. `Ctrl + O` (salvar)
2. `Enter` (confirmar nome do arquivo)
3. `Ctrl + X` (sair)

---

### 5. Reiniciar o Gateway

Para aplicar as mudanças:

```bash
openclaw gateway --force
```

Verifique no output se aparece:

```
[gateway] agent model: anthropic/claude-opus-4-6
```

Se aparecer `moonshot/kimi-k2.5`, revise o passo 3.

---

### 6. Verificar Status

Rode o comando de diagnóstico:

```bash
openclaw doctor
```

Deve mostrar:
- ✅ Gateway running
- ✅ Models: anthropic/claude-opus-4-6
- ✅ Auth: OAuth token ativo
- ✅ No rate limit errors

---

## 🔧 Configuração Final Exemplo

Aqui está um exemplo do arquivo `openclaw.json` configurado corretamente (dados sensíveis removidos):

```json
{
  "meta": {
    "lastTouchedVersion": "2026.2.26",
    "lastTouchedAt": "2026-03-03T21:15:42.707Z"
  },
  "auth": {
    "profiles": {
      "anthropic:claudio": {
        "provider": "anthropic",
        "mode": "token"
      },
      "anthropic:manual": {
        "provider": "anthropic",
        "mode": "token"
      },
      "anthropic:default": {
        "provider": "anthropic",
        "mode": "api_key"
      }
    },
    "order": {
      "anthropic": [
        "anthropic:claudio",
        "anthropic:manual",
        "anthropic:default"
      ]
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-opus-4-6",
        "fallbacks": [
          "anthropic/claude-sonnet-4-6",
          "moonshot/kimi-k2.5"
        ]
      },
      "models": {
        "anthropic/claude-opus-4-6": {},
        "anthropic/claude-sonnet-4-6": {},
        "moonshot/kimi-k2.5": {}
      }
    }
  }
}
```

---

## ⚠️ Dicas Importantes

1. **OAuth vs API Key:** O plano Team usa OAuth (token de sessão), não API key. Isso é diferente de adicionar créditos no console.anthropic.com.

2. **Workspace Correto:** Sempre escolha o workspace **TEAM** quando fizer login no navegador. O pessoal tem limites separados.

3. **Rate Limit do Opus:** Claude Opus consome mais do limite do plano Team. Se bater rate limit, o sistema automaticamente faz fallback para Sonnet ou Kimi.

4. **Backup do Config:** Sempre faça backup do `openclaw.json` antes de editar:
   ```bash
   cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak
   ```

5. **Múltiplos Claws:** Para replicar em outras máquinas:
   - Copie o arquivo `openclaw.json` configurado
   - Ou repita este processo em cada máquina

---

## 🐛 Troubleshooting

### Erro: "API rate limit reached"
**Causa:** Token ainda vinculado ao plano pessoal ou expirado.  
**Solução:** Gere um novo token com `claude setup-token` e repita o processo, garantindo que está logado no workspace Team.

### Erro: "agent model: moonshot/kimi-k2.5" depois de configurar
**Causa:** Modelo primário não foi atualizado no config.  
**Solução:** Verifique se alterou corretamente o campo `agents.defaults.model.primary` no `openclaw.json`.

### Gateway não inicia
**Causa:** Configuração JSON inválida.  
**Solução:** Restaure o backup e tente novamente:
```bash
cp ~/.openclaw/openclaw.json.bak ~/.openclaw/openclaw.json
```

---

## 📚 Referências

- Documentação OpenClaw: https://docs.openclaw.ai
- Configuração de modelos: `openclaw models --help`
- Configuração de agentes: `openclaw agents --help`
- Diagnóstico: `openclaw doctor`

---

## ✅ Checklist de Migração

- [ ] Gerar token com `claude setup-token` (logar no workspace Team)
- [ ] Rodar `openclaw configure` e selecionar Model → Anthropic → Token
- [ ] Editar `openclaw.json` para definir modelo primário como `claude-opus-4-6`
- [ ] Atualizar lista de modelos em `agents.defaults.models`
- [ ] Verificar ordem de autenticação em `auth.order`
- [ ] Salvar e sair do nano (Ctrl+O, Enter, Ctrl+X)
- [ ] Reiniciar gateway: `openclaw gateway --force`
- [ ] Verificar modelo ativo no log: deve aparecer `anthropic/claude-opus-4-6`
- [ ] Rodar `openclaw doctor` para confirmar tudo OK

---

**Nota:** Este guia foi criado durante a migração do Eduardo (Titanio Films) de plano Pessoal para Team em 2026-03-03.

🐾 Tita (Claude Opus) - Assistente Digital da Titanio
