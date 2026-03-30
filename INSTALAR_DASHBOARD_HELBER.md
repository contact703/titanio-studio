# 🚀 INSTALAR DASHBOARD TITANIO — Helber
**Para:** OpenClaw do Helber  
**Data:** 2026-03-16  
**Compilado por:** Tita 🐾

---

## ⚙️ SUAS CONFIGURAÇÕES

- **OWNER_ID:** `helber`
- **Backend:** porta `4445`
- **Frontend:** porta `3001` → acesse `http://localhost:3001`
- **Cluster peers:** Eduardo `192.168.18.174:4444` · Tiago `192.168.18.188:4446`

---

## 📦 PASSO 1 — O pacote já está no TITA_039

Tudo já está preparado. O caminho é:

```
/Volumes/TITA_039/backup-projetos/titanio-dist/titanio-helber/
```

Copie para o seu Mac:

```bash
cp -r /Volumes/TITA_039/backup-projetos/titanio-dist/titanio-helber ~/titanio-helber
cd ~/titanio-helber
chmod +x INSTALAR.sh INICIAR.sh
```

---

## 🔧 PASSO 2 — Instalar dependências

```bash
./INSTALAR.sh
```

Demora ~5 minutos na primeira vez. O script instala tudo automaticamente.

---

## ▶️ PASSO 3 — Iniciar o Dashboard

```bash
./INICIAR.sh
```

Abra no navegador: **http://localhost:3001**

---

## ✅ PASSO 4 — Verificar

```bash
curl http://localhost:4445/api/ping
# Esperado: {"status":"ok","owner":"helber",...}
```

---

## 🔍 AUTO-DETECÇÃO DO OPENCLAW

O dashboard lê automaticamente o seu `~/.openclaw/openclaw.json` — detecta seu número, modelo e canais. **Zero configuração manual.**

Seu nome aparece no header em **roxo 🟣**

---

## 🖥️ CLUSTER

No painel **Cluster** você vê os três Macs em tempo real:
- 🟢 Eduardo — `192.168.18.174:4444`
- 🟢 Helber — `192.168.18.170:4445` (você)
- 🟢 Tiago — `192.168.18.188:4446`

---

## 🤖 SQUAD — 19 Especialistas

Code Ninja, Design Wizard, Debug Hunter, DevOps Ninja, iOS Specialist, Marketing Ninja, Data Analyst, Memory Bot, Agent Doctor, Security Guardian, Gold Digger, James Arkin e mais.

---

## 🆘 Logs de erro

```bash
tail -50 /tmp/backend-helber.log
tail -50 /tmp/frontend-helber.log
lsof -i :4445    # porta ocupada?
```

Problema? Fala com a Tita 🐾 no grupo Gospia.

---

*Gerado por Tita 🐾 | Titanio Films | 2026-03-16*
