# 🚀 COMO SUBIR PRO GITHUB

## Método 1: Criar Repo Manual (Recomendado - 2 minutos)

1. Acesse: https://github.com/new
2. Preencha:
   - **Owner:** titanio (ou sua conta)
   - **Repository name:** dashboard
   - **Description:** Dashboard inteligente para times de desenvolvimento
   - **Public** ou **Private** (como preferir)
   - ✅ Marque "Add a README file"
3. Clique **Create repository**

4. No terminal, execute:
```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/titanio-dashboard

# Adicionar novo remote
git remote remove origin
git remote add origin https://github.com/SEU_USER/dashboard.git

# Push
git branch -M main
git push -u origin main
```

## Método 2: Usar GitHub Desktop

1. Baixe: https://desktop.github.com/
2. Faça login com conta Google (contact@titaniofilms.com)
3. Arraste a pasta titanio-dashboard
4. Publique no GitHub

## Método 3: Token de Acesso

1. Gere token: https://github.com/settings/tokens
2. Permissões: repo, workflow
3. Execute:
```bash
git remote remove origin
git remote add origin https://TOKEN@github.com/titanio/dashboard.git
git push -u origin main
```

---

**Depois de subir:**
- Tiago e Helber instalam com:
```bash
curl -fsSL https://raw.githubusercontent.com/titanio/dashboard/main/install.sh | bash
```
