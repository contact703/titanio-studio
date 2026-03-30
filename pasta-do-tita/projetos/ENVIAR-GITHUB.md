# 🚀 COMO ENVIAR PRO GITHUB (2 MINUTOS)

## OPÇÃO 1: GitHub Desktop (MAIS FÁCIL)

1. Baixe: https://desktop.github.com
2. Instale e abra
3. Faça login com Google (contact@titaniofilms.com)
4. Clique "Add" → escolha pasta titanio-dashboard
5. Preencha:
   - Repository name: dashboard
   - Description: Dashboard inteligente para times
6. Clique "Publish repository"
✅ PRONTO!

## OPÇÃO 2: Terminal (1 COMANDO)

```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard

# Criar repo e subir tudo em um comando
hub create -d "Dashboard inteligente para times" && git push -u origin main
```

Se não tiver hub instalado:
```bash
brew install hub
```

## OPÇÃO 3: Site do GitHub

1. Acesse: github.com/new
2. Crie repo "dashboard"
3. Execute no terminal:
```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard
git remote remove origin
git remote add origin https://github.com/titanio/dashboard.git
git branch -M main
git push -u origin main
```

---

**Escolha uma e pronto! 🚀**
