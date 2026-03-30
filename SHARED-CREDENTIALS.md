# Credenciais Compartilhadas — Squad Titanio

## ✅ COMPARTILHADAS (usar como-está em todos os Macs)

```
Repositórios GitHub (READ-ONLY):
- https://github.com/contact703/titanio-squad
- https://github.com/contact703/titanio-dashboard
- https://github.com/contact703/memoria-especialistas

N8n Workflows: 22 workflows testados (importar via arquivo)

Especialistas: 30 especialistas no squad (sincronizar via git)

OpenClaw Token (local): Cada Mac gera seu próprio ao iniciar
```

## ❌ NÃO COMPARTILHAR (cada Mac precisa do seu)

```
GitHub Personal Token: ghp_xxxxx (gerar em GitHub → Settings → Developer)
OpenClaw API Token: Gerado localmente pelo OpenClaw
Railway Token: Se usar Railway, pegar do console
Supabase Keys: Se usar Supabase
API Keys: Qualquer chave pessoal de integração
```

## 📝 Como Gerar GitHub Token (pessoal)

1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Selecionar scopes:
   - ✅ repo (read + write)
   - ✅ workflow (read + write)
4. Copy e guardar em `.env` (NUNCA commit)

## 🔐 Arquivo .env (cada Mac)

```bash
# .env.local (gitignored, não compartilhar)
PORT=4444
GITHUB_TOKEN=ghp_PESSOAL_DO_SEU_MAC
WORKSPACE=/path/local
N8N_URL=http://localhost:5678
```

## 📦 Squad Compartilhado

Localização em todos os Macs:
```
~/openclaw/workspace/memoria-especialistas/
  ├── especialistas/
  │   ├── code-ninja.md
  │   ├── debug-hunter.md
  │   └── [outros 28]
  └── README.md
```

Sincronizar:
```bash
cd memoria-especialistas
git pull origin main  # Puxar updates dos colegas
git push origin main  # Enviar suas atualizações
```

## 🚀 N8n Workflows Compartilhados

Arquivo de export:
```
squad/n8n/workflows-export.json
```

Importar em novo Mac:
```bash
# Via CLI
n8n import:workflow --input workflows-export.json

# Via UI
Abrir http://localhost:5678 → Admin → Workflows → Import
```

---

**Versão**: 2026-03-21  
**Importante**: Cada Mac pode ler o squad compartilhado mas NUNCA deve modificar credenciais de outro colega.
