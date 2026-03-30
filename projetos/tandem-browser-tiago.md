# Tandem Browser — Projeto para o Tiago
> Gerado pela Tita | 18/03/2026

## O que é o Tandem Browser?

O **Tandem Browser** é um navegador Electron (como o Chrome, mas construído do zero) feito especificamente para **colaboração entre humano e IA** — no caso, o OpenClaw.

Em vez de usar o Chrome e tentar encaixar a IA depois, o Tandem foi construído **com a IA como cidadão de primeira classe** desde o início.

**GitHub:** https://github.com/hydro13/tandem-browser

---

## O que ele faz (e por que o Tiago quer isso)

O vídeo mostra o Tandem em ação — um browser onde:
- O **humano navega normalmente** à esquerda
- O **OpenClaw (IA) tem acesso total** via API local em `127.0.0.1:8765`
- Os dois trabalham **juntos na mesma sessão** — a IA vê o que o humano está vendo e pode agir sobre isso
- Painel lateral com WhatsApp, Telegram, Discord, Gmail, Calendar, Instagram, X — tudo integrado
- Painel direito **Wingman** = onde o OpenClaw mora (chat, activity feed, screenshots, contexto do agente)

**A grande sacada:** segurança real. 6 camadas de segurança entre o conteúdo web e o agente — sem vazamento de credenciais, sem fingerprinting, sem automação silenciosa.

---

## Três perguntas para o Tiago antes de desenvolver

Antes de mandar o Claw desenvolver, preciso de 3 respostas do Tiago:

**1. Você quer um browser completo do zero (como o Tandem), ou prefere uma extensão/sidebar que se integra ao Chrome existente?**
> O Tandem é um app separado (Electron). Uma extensão do Chrome seria mais rápida de fazer e qualquer um instala sem baixar nada novo. Qual faz mais sentido para o caso de uso da Titanio?

**2. Quais são os principais casos de uso que você quer que a IA faça dentro do browser?**
Por exemplo:
- Pesquisar e preencher editais automaticamente (Victor Capital)
- Navegar e postar em redes sociais
- Monitorar páginas específicas
- Fazer scraping de informações
- Outra coisa?

**3. Você quer que o browser/extensão funcione com o OpenClaw (Tita) ou com outra IA?**
> O Tandem original é feito pra OpenClaw. Se quiser usar com Claude diretamente via API, ou com outro modelo, isso muda a arquitetura.

---

## O que o Claw vai construir (após as respostas)

Com base no Tandem como inspiração, o plano sugerido é:

### Opção A — Extensão Chrome (mais rápida, 1-2 dias)
- Sidebar no Chrome com o OpenClaw/Tita integrada
- A IA vê a página atual e pode agir sobre ela
- Painel de chat lateral
- Botão "Deixa a Tita fazer isso" em qualquer página

### Opção B — Tandem Fork (versão Titanio, 1-2 semanas)
- Fork do Tandem Browser
- Personalizado com a identidade Titanio
- Wingman lateral com Tita
- Integração direta com Victor Capital, VoxDescriber, Gospia
- Painéis laterais com WhatsApp (grupo Gospia), Gmail, Instagram

---

## Como rodar o Tandem original (para testar)

```bash
# Pré-requisitos: Node.js 18+, npm
git clone https://github.com/hydro13/tandem-browser
cd tandem-browser
npm install
npm start
```

Plataformas: **macOS** (principal), Linux (secundário), Windows (ainda não validado).

---

## Links úteis

- **Repositório:** https://github.com/hydro13/tandem-browser
- **Vídeo que o Tiago viu:** https://www.instagram.com/reel/DV8U4t-E2MZ/
- **Criador do vídeo:** @julian.goldie_ no Instagram
- **Versão atual:** 0.62.16 (developer preview)

---

*Responda as 3 perguntas e o Claw começa a desenvolver! 🚀*
