# 🚀 Titanio Dashboard

**Dashboard inteligente para times de desenvolvimento. Multi-usuário, cluster de máquinas e IA integrada.**

---

## ✨ Instalação Rápida (1 comando!)

```bash
curl -fsSL https://raw.githubusercontent.com/titanio/dashboard/main/install.sh | bash
```

**Pronto!** O instalador faz tudo automaticamente:
- ✅ Baixa do GitHub
- ✅ Instala dependências (Node.js, npm)
- ✅ Configura usuário (Tiago ou Helber)
- ✅ Conecta no cluster
- ✅ Cria estrutura de pastas
- ✅ Configura ambiente

---

## 🎯 O que é?

Uma Dashboard que conecta vários Macs em um único sistema:

- **👥 Multi-usuário** - Cada um com seus projetos (sem senha!)
- **🕸️ Cluster** - Se sua máquina cair, trabalho continua em outra
- **🤖 IA** - 10 especialistas para ajudar no código/design
- **🎬 Mídia** - Transcreve vídeos/áudios automaticamente
- **🔄 Sync** - Dados sincronizados entre todas as máquinas

---

## 🖥️ Requisitos

- **macOS** 12+ (Monterey ou superior)
- **Node.js** 18+ (instalado automaticamente)
- **Git** (instalado automaticamente)
- **8GB+ RAM** recomendado

---

## 🚀 Como Usar

### 1. Instalar

```bash
curl -fsSL https://raw.githubusercontent.com/titanio/dashboard/main/install.sh | bash
```

Durante a instalação:
- Escolha seu nome (Tiago ou Helber)
- Digite o IP da sua máquina na rede (ex: 192.168.1.102)
- Aguarde a instalação completa (2-3 minutos)

### 2. Iniciar

```bash
cd ~/titanio-dashboard
./start.sh
```

### 3. Acessar

Abra no navegador: **http://localhost:3000**

### 4. Fazer Login

Clique no seu nome (Tiago ou Helber) - **sem senha!**

---

## 👥 Usuários

| Nome | Avatar | Função |
|------|--------|--------|
| Zica | 👑 | Admin |
| Tiago | 👨‍💻 | Desenvolvedor |
| Helber | 🚀 | Desenvolvedor |

**Como funciona:**
- Cada um clica no próprio nome
- Vê apenas seus projetos
- Trabalha independentemente
- Mas compartilha ferramentas (bots globais)

---

## 🕸️ Cluster (O Mais Importante!)

### O que é?

Se sua máquina travar ou ficar sem internet, o sistema **automaticamente** redireciona seu trabalho para outra máquina disponível.

### Como funciona:

```
Tiago trabalhando → Mac trava
                           ↓
              Cluster detecta em 30 segundos
                           ↓
        Trabalho vai para Mac do Helber
                           ↓
              Tiago continua sem perder nada!
```

### Benefícios:

- ✅ **Nunca perca trabalho** por problema de máquina
- ✅ **RAM compartilhada** - somamos a memória de todos os Macs
- ✅ **Load balancing** - distribui tarefas entre máquinas
- ✅ **Failover automático** - sem intervenção manual

---

## 👨‍💻 Squad (Especialistas de IA)

10 especialistas prontos para ajudar:

### Desenvolvimento
- **Code Ninja** - Programação e debugging
- **Debug Hunter** - Encontra bugs difíceis
- **DevOps Ninja** - Deploy e infraestrutura
- **API Master** - Integrações

### Design
- **Design Wizard** - UI/UX e prototipação
- **UI/UX Architect** - Design systems

### Produto
- **ASO Specialist** - Otimização de apps
- **Growth Hacker** - Métricas e crescimento
- **Security Guard** - Segurança
- **System Design Guru** - Arquitetura

**Como usar:** Chame o especialista no chat da Dashboard!

---

## 🤖 Bots Globais (Rodam 24/7)

6 bots trabalhando para todos:

| Bot | Função |
|-----|--------|
| 🚨 Error Monitor | Detecta erros automaticamente |
| ⏳ RateLimitResolver | Resolve rate limits da API |
| ⏱️ TimeoutResolver | Resolve timeouts |
| 🎬 Media Processor | Transcreve vídeos/áudios |
| 🧠 Knowledge Sync | Sincroniza dados entre máquinas |
| 🕸️ Claw Cluster | Gerencia o cluster |

---

## 📁 Projetos

Crie e gerencie seus projetos:

```bash
# Criar projeto
curl -X POST http://localhost:4444/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Meu Projeto","description":"Descrição"}'
```

**Privacidade:** Seu projeto é seu. Ninguém vê até você convidar.

---

## 🎬 Media Processor

Transcreve vídeos e áudios automaticamente:

```bash
# Copiar arquivo para pasta
mv video.mp4 ~/titanio-dashboard/media/incoming/

# Aguardar processamento automático
# Resultado em: ~/titanio-dashboard/media/processed/video.txt
```

**Formatos:** MP4, MOV, AVI, MKV, MP3, WAV, M4A

---

## 📡 API

Endpoints disponíveis:

```bash
# Ver status
curl http://localhost:4444/api/health

# Listar usuários
curl http://localhost:4444/api/auth/users

# Selecionar usuário (sem senha!)
curl -X POST http://localhost:4444/api/auth/select \
  -d '{"userId":"user-tiago"}'

# Listar projetos
curl http://localhost:4444/api/projects

# Ver cluster
curl http://localhost:4444/api/cluster
```

---

## 🛠️ Scripts Úteis

```bash
# Iniciar Dashboard
./start.sh

# Ver status do cluster
./status.sh

# Ver logs
tail -f ~/.openclaw/logs/error-resolver.log
```

---

## 📂 Estrutura de Pastas

```
titanio-dashboard/
├── code/
│   ├── backend/          # API e lógica
│   └── frontend/         # Interface web
├── squad/                # Especialistas
│   ├── code-ninja/
│   ├── design-wizard/
│   └── ...
├── media/                # Processamento de mídia
│   ├── incoming/         # Coloque arquivos aqui
│   └── processed/        # Resultados aqui
├── docs/                 # Documentação
├── install.sh            # Script de instalação
└── start.sh              # Script para iniciar
```

---

## 🔧 Troubleshooting

### Porta 4444 em uso
```bash
# Matar processo na porta
lsof -ti:4444 | xargs kill -9
```

### Erro de permissão
```bash
# Dar permissão aos scripts
chmod +x install.sh start.sh status.sh
```

### Node.js não encontrado
```bash
# Instalar via Homebrew (macOS)
brew install node@20
```

---

## 🤝 Time

- **Zica** 👑 - Admin e idealizador
- **Tiago** 👨‍💻 - Desenvolvedor
- **Helber** 🚀 - Desenvolvedor

---

## 📄 Licença

MIT - Uso livre para o time Titanio

---

## 🐾 Suporte

Problemas? Pergunte no grupo!

**Dashboard Titanio v2.0** 🚀
