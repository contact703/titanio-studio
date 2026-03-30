# STATUS-PAPERCLIP.md — Relatório Completo

**Gerado em**: 2026-03-27 14:30 GMT-3  
**Por**: Tita (bot de documentação — subagente)

---

## ✅ Resumo Executivo

| Item | Status |
|------|--------|
| Paperclip encontrado | ✅ |
| Servidor rodando | ✅ Reiniciado com sucesso |
| API respondendo | ✅ http://localhost:3100 |
| Empresa configurada | ✅ Titanio Studio |
| Agentes | ✅ 7 agentes ativos |
| Goals | ✅ 3 goals ativas |
| Banco de dados | ✅ PostgreSQL embedded |
| Backups | ✅ 12 backups horários |
| Documentação | ✅ Criada em projetos/paperclip/ |

---

## 📍 Localização

```
Source Code:  /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos/paperclip/
Dados/DB:     /Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/
Backups:      /Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/data/backups/
Log runtime:  /tmp/paperclip.log
```

---

## 🖥️ Servidor

| Campo | Valor |
|-------|-------|
| **URL** | http://localhost:3100 |
| **Versão** | 0.3.1 |
| **Modo** | local_trusted |
| **Exposição** | private (127.0.0.1 only) |
| **Auth** | ready (bootstrapped) |
| **Node** | v20.20.2 (nvm) — Node 22 incompatível |
| **Banco** | PostgreSQL embedded |

### Health Check (ao vivo)
```json
{
  "status": "ok",
  "version": "0.3.1",
  "deploymentMode": "local_trusted",
  "deploymentExposure": "private",
  "authReady": true,
  "bootstrapStatus": "ready",
  "bootstrapInviteActive": false,
  "features": {
    "companyDeletionEnabled": true
  }
}
```

---

## 🏢 Empresa: Titanio Studio

```
ID: b7260a8e-1e1e-48e4-bd70-e06f36b6ab74
Status: active
Issue prefix: TIT
Descrição: Produtora de tecnologia e conteúdo digital. IA, automação, apps, vídeos.
```

---

## 🤖 Agentes (7/7 confirmados via API)

| # | Nome | Role | Título | Status | URL Key |
|---|------|------|--------|--------|---------|
| 1 | Tita | ceo | COO | idle | tita |
| 2 | Code Ninja | engineer | Lead Engineer | idle | code-ninja |
| 3 | Debug Hunter | qa | QA Lead | idle | debug-hunter |
| 4 | Instagramer | cmo | Social Media | idle | instagramer |
| 5 | Designer | designer | Creative Director | idle | designer |
| 6 | Video Specialist | general | Video Producer | idle | video-specialist |
| 7 | Automation Bot | devops | DevOps | idle | automation-bot |

**Nota**: Todos usando `adapterType: process` — aguardando configuração de adaptadores reais (Claude, Codex, etc.)

---

## 🎯 Goals (3/3 confirmadas via API)

| # | Título | Status | Descrição |
|---|--------|--------|-----------|
| 1 | Video Factory — Pipeline automático de vídeo | active | 100% open source: texto → roteiro → imagens → narração → renderização → WhatsApp/Instagram |
| 2 | Dashboard Titanio — Central multi-Mac | active | 33+ especialistas, notificações, sync 3 Macs, AutoLearn |
| 3 | Manda a Nota — NFS-e para MEI | active | App emissão automática NFS-e. Android OK, iOS pendente Apple. |

---

## 💾 Backups

- **Intervalo**: Horário automático
- **Retenção**: 30 dias
- **Total atual**: 12 arquivos
- **Último**: `paperclip-20260327-100015.sql` (154.6K)
- **Localização**: `/Volumes/TITA_039/MAC_MINI_03/.paperclip/instances/default/data/backups/`

---

## 📋 Incidentes Conhecidos

### Bug tsx (resolvido)
- **O quê**: Bug no tsx que impedia o servidor de iniciar
- **Quando**: Na instalação inicial
- **Quem resolveu**: Debug Hunter (QA Lead)
- **Status**: ✅ Corrigido (patches aplicados via pnpm)

### Conflito postmaster.pid (resolvido automaticamente)
- **O quê**: PostgreSQL falhou ao iniciar (lock file existia)
- **Quando**: 2026-03-27 às 01:00
- **Causa**: Restart sem tempo de cleanup
- **Status**: ✅ Resolvido automaticamente pelo servidor na segunda tentativa

### Servidor parou às 13:55
- **O quê**: Processo recebeu SIGTERM
- **Causa**: Provavelmente reinício do Mac ou kill manual
- **Status**: ✅ Reiniciado durante esta sessão de documentação

---

## 📁 Documentação Criada

```
/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/paperclip/
├── ONDE-INSTALADO.md      ✅ Localização completa
├── COMO-INICIAR.md        ✅ Comandos e scripts de início
├── STATUS.md              ✅ Estado dos agentes e goals
├── INTEGRACAO-FUTURA.md   ✅ Como integrar com Dashboard Titanio
├── BACKUP-CONFIG.md       ✅ Backup completo da configuração
└── STATUS-PAPERCLIP.md    ✅ Este relatório
```

---

## 🚀 Próximos Passos

1. **Autostart**: Configurar LaunchAgent para Paperclip iniciar automaticamente no boot
2. **Adaptadores**: Configurar adaptadores reais nos agentes (Claude via OpenClaw, Codex, etc.)
3. **Integração Dashboard**: Criar widget que mostra status dos agentes em tempo real
4. **n8n**: Criar workflow de alerta quando algum agente mudar de status
5. **Goals**: Atribuir `ownerAgentId` às goals (ex: Tita como owner do Dashboard Titanio)

---

*Documentação gerada automaticamente pelo bot de documentação do OpenClaw.*
