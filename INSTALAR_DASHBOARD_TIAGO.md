# 🚀 INSTALAR DASHBOARD TITANIO — Tiago
**Para:** OpenClaw do Tiago  
**Data:** 2026-03-16  
**Compilado por:** Tita 🐾

---

## ⚙️ SUAS CONFIGURAÇÕES

- **OWNER_ID:** `tiago`
- **Backend:** porta `4446`
- **Frontend:** porta `3002` → acesse `http://localhost:3002`
- **Cluster peers:** Eduardo `192.168.18.174:4444` · Helber `192.168.18.170:4445`

---

## 📦 PASSO 1 — O pacote já está no TITA_039

Tudo já está preparado. O caminho é:

```
/Volumes/TITA_039/backup-projetos/titanio-dist/titanio-tiago/
```

Copie para o seu Mac:

```bash
cp -r /Volumes/TITA_039/backup-projetos/titanio-dist/titanio-tiago ~/titanio-tiago
cd ~/titanio-tiago
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

Abra no navegador: **http://localhost:3002**

---

## ✅ PASSO 4 — Verificar

```bash
curl http://localhost:4446/api/ping
# Esperado: {"status":"ok","owner":"tiago",...}
```

---

## 🔍 AUTO-DETECÇÃO DO OPENCLAW

O dashboard lê automaticamente o seu `~/.openclaw/openclaw.json` — detecta seu número, modelo e canais. **Zero configuração manual.**

Seu nome aparece no header em **amarelo 🟡**

---

## 🖥️ CLUSTER

No painel **Cluster** você vê os três Macs em tempo real:
- 🟢 Eduardo — `192.168.18.174:4444`
- 🟢 Helber — `192.168.18.170:4445`
- 🟢 Tiago — `192.168.18.188:4446` (você)

---

## 🤖 SQUAD — 19 Especialistas

Você tem um especialista exclusivo configurado com seu projeto:

### 📚 James Arkin — Lançamento Literário & KDP
Já sabe tudo sobre sua trilogia:
- Thirteen Marks ✅ · Never Go Postal ✅ (ASIN: B0GRX89N98) · The Glass Inheritance 🔜
- Promo FREE: 20-24/03/2026 (Fussy Librarian + ManyBooks já pagos)
- ROI real, estratégia de blogs, revistas literárias

Clique no card e peça qualquer coisa:
*"Escreve o post do Instagram para o dia 20/03 anunciando Never Go Postal grátis"*

---

## 🆘 Logs de erro

```bash
tail -50 /tmp/backend-tiago.log
tail -50 /tmp/frontend-tiago.log
lsof -i :4446    # porta ocupada?
```

Problema? Fala com a Tita 🐾 no grupo Gospia.

---

*Gerado por Tita 🐾 | Titanio Films | 2026-03-16*
