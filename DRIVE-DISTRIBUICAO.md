# 📦 DISTRIBUIÇÃO VIA GOOGLE DRIVE

## 🚀 PARA O ZICA (ENVIAR):

### 1. Compactar a Dashboard
```bash
cd /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pasta-do-tita/projetos
zip -r titanio-dashboard-v2.0.zip titanio-dashboard/ -x "*/node_modules/*" "*/.git/*"
```

### 2. Subir no Google Drive
1. Acesse: https://drive.google.com
2. Arraste o arquivo `titanio-dashboard-v2.0.zip`
3. Clique com direito no arquivo → **Compartilhar**
4. Configurar:
   - **Qualquer pessoa com o link** pode visualizar
   - Copie o link de compartilhamento

### 3. Pegar ID do arquivo
O link vai ser tipo:
```
https://drive.google.com/file/d/1ABC123xyz/view
```
O ID é: `1ABC123xyz`

### 4. Criar link direto de download
Substitua o ID no link:
```
https://drive.google.com/uc?export=download&id=1ABC123xyz
```

---

## 🎯 PARA TIAGO E HELBER (INSTALAR):

### Método 1: Download + Instalação Automática

1. **Baixe o arquivo** do link que o Zica enviar
2. **Abra Terminal** (Cmd + Espaço, digite "Terminal")
3. **Execute UM comando:**

```bash
cd ~/Downloads && unzip titanio-dashboard-v2.0.zip && cd titanio-dashboard && ./install.sh
```

4. **Aguarde 2-3 minutos** (instala sozinho)

5. **Acesse:** http://localhost:3000

6. **Clique no seu nome** (Tiago ou Helber)

✅ **PRONTO!**

---

### Método 2: Um Comando (Quando tiver link direto)

Quando o Zica enviar o link direto do Drive:

```bash
curl -L "https://drive.google.com/uc?export=download&id=SEU_ID_AQUI" -o titanio.zip && unzip titanio.zip && cd titanio-dashboard && ./install.sh
```

---

## 📋 CHECKLIST PARA O ZICA

- [ ] Criar ZIP da Dashboard
- [ ] Subir no Google Drive
- [ ] Configurar compartilhamento (qualquer pessoa com link)
- [ ] Pegar ID do arquivo
- [ ] Enviar link pro grupo do Tiago e Helber

---

## ✅ O QUE TIAGO E HELBER VÃO TER:

Após instalação:
- ✅ Dashboard completa rodando
- ✅ Cluster conectado com sua máquina
- ✅ 10 especialistas de IA
- ✅ 6 bots globais protegendo
- ✅ Projetos isolados
- ✅ Login sem senha (só clicar no nome)

---

## 🚀 COMANDO FINAL (Para Tiago/Helber)

**Copiar e colar no Terminal:**

```bash
cd ~/Downloads && curl -L "LINK_DO_DRIVE" -o titanio.zip && unzip titanio.zip && cd titanio-dashboard && ./install.sh
```

*(Substituir LINK_DO_DRIVE pelo link que Zica enviar)*

---

**Feito! 🐾🚀**
