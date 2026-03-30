# Estudo de Redes Mac Mini — 14/03/2026 14:24

## SSH sem senha entre Macs — Configuração completa
## SSH sem senha entre Macs — passo a passo

### 1. Gerar chave ed25519 (no Mac de origem)

```bash
ssh-keygen -t ed25519 -C "tita@mac-mini" -f ~/.ssh/id_ed25519
# Pressione Enter duas vezes (sem passphrase)
```

---

### 2. Descobrir o username do Mac remoto

Três formas:

```bash
# No Mac remoto, abrir terminal e rodar:
whoami
# ou
id -un
# ou ver em: Configurações do Sistema → Usuários e Grupos → nome da conta
```

Também funciona descobrir via Bonjour:
```bash
# No Mac de origem:
dns-sd -B _ssh._tcp local   # lista Macs com SSH ativo na rede
```

---

### 3. Descobrir o IP do Mac remoto

```bash
# No Mac remoto:
ipconfig getifaddr en0      # Wi-Fi
ipconfig getifaddr en1      # Ethernet (en1 ou en2 no Mac Mini)

# Ou no Mac de origem:
arp -a | grep -i apple      # lista dispositivos Apple na rede
```

Primeiro, habilitar SSH no Mac remoto:
**Configurações → Geral → Compartilhamento → Acesso Remoto (Login Remoto) → ON**

---

### 4. Copiar chave para o Mac remoto

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub usuario@192.168.18.XXX
# vai pedir senha uma última vez — depois nunca mais
```

Se `ssh-copy-id` não funcionar (macOS às vezes):
```bash
cat ~/.ssh/id_ed25519.pub | ssh usuario@192.168.18.XXX \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

---

### 5. Testar conexão

```bash
ssh usuario@192.168.18.XXX
# deve entrar sem pedir senha
```

---

### 6. Configurar `~/.ssh/config` com alias

```bash
nano ~/.ssh/config
```

```
# Mac Mini principal (este aqui)
Host mac-mini
    HostName 192.168.18.174
    User contacttitanio
    IdentityFile ~/.ssh/id_ed25519

# Outro Mac na rede
Host mac-eduardo
    HostName 192.168.18.XXX
    User eduardo
    IdentityFile ~/.ssh/id_ed25519
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

Depois é só:
```bash
ssh mac-mini          # em vez de ssh contacttitanio@192.168.18.174
ssh mac-eduardo
scp arquivo.txt mac-eduardo:~/Desktop/
rsync -av pasta/ mac-eduardo:~/backup/
```

---

### Troubleshooting rápido

```bash
# Permissões (causa mais comum de falha):
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_ed25519

# Ver o que está acontecendo na conexão:
ssh -v mac-eduardo

# Se o Mac remoto recusar mesmo com chave copiada:
# verificar se /etc/ssh/sshd_config tem:
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys
```

## Descoberta de Macs na rede local — técnicas avançadas
## Descobrir Macs na Rede Local — Guia Completo

### 1. ARP — varredura rápida

```bash
# Ver tabela ARP (só Macs que já comunicaram)
arp -a

# Varredura ativa da rede inteira (mais completo)
# Instalar primeiro:
brew install arp-scan

sudo arp-scan --localnet
sudo arp-scan 192.168.18.0/24

# Filtrar só Apple:
sudo arp-scan --localnet | grep -i apple
```

**Prefixos OUI Apple mais comuns:**
```
MAC prefix    → Produto
a4:cf:99      → MacBook Pro/Air M1/M2
3c:06:30      → Mac Mini M1/M2
d0:11:e5      → Apple Inc (geral)
f4:31:c3      → Apple Inc (geral)
00:17:f2      → Apple Inc (antigo)
bc:d0:74      → iPhone/iPad
8c:85:90      → MacBook
a8:be:27      → MacBook Air
```

Verificar qualquer OUI:
```bash
# Site: https://macvendors.com
# Ou via curl:
curl "https://api.macvendors.com/3c:06:30"
# → Apple, Inc.
```

---

### 2. Bonjour/mDNS — descoberta sem IP fixo

```bash
# Listar todos os Macs com SSH ativo
dns-sd -B _ssh._tcp local

# Listar compartilhamento de tela (VNC)
dns-sd -B _rfb._tcp local

# Listar TODOS os serviços Bonjour na rede
dns-sd -B _services._dns-sd._udp local

# Resolver hostname → IP
dns-sd -G v4 nome-do-mac.local

# Alternativa: avahi (Linux/Homebrew)
brew install avahi
avahi-browse -a           # todos os serviços
avahi-browse _ssh._tcp    # só SSH
```

Exemplo de output do `dns-sd -B _ssh._tcp local`:
```
Browsing for _ssh._tcp.local
DATE: ---Sat 14 Mar 2026---
Timestamp  A/R Flags if Domain  ServiceType  InstanceName
13:45:01   Add  2     7 local.  _ssh._tcp.   MacBook-do-Eduardo
13:45:01   Add  2     8 local.  _ssh._tcp.   Mac-Mini-de-Contact
```

---

### 3. nmap — varredura completa com hostnames

```bash
brew install nmap

# Descobrir todos os hosts ativos
nmap -sn 192.168.18.0/24

# Com detecção de OS e serviços (mais demorado)
sudo nmap -O 192.168.18.0/24

# Só porta SSH (22) aberta
nmap -p 22 --open 192.168.18.0/24

# Output com MAC e fabricante:
sudo nmap -sn 192.168.18.0/24 --script broadcast-arp
```

---

### 4. Descobrir hostname sem SSH

```bash
# Ping com resolução mDNS
ping -c1 192.168.18.XXX    # mostra PTR record se tiver

# Lookup reverso
dns-sd -G v4v6 192.168.18.XXX   # resolve IP → hostname

# Via mDNS diretamente
dig @224.0.0.251 -p 5353 -x 192.168.18.XXX   # multicast DNS

# nbstat (NetBIOS — funciona se Windows sharing ativo)
smbutil lookup 192.168.18.XXX

# Ver nome Bonjour do Mac (no próprio Mac):
scutil --get ComputerName    # "Mac Mini de Contact"
scutil --get LocalHostName   # "Mac-Mini-de-Contact" (usado no .local)
scutil --get HostName        # hostname DNS formal

# Conectar pelo nome sem saber IP:
ssh usuario@Mac-Mini-de-Contact.local
ping Mac-Mini-de-Contact.local
```

---

### 5. Screen Sharing — VNC/RDP remoto

**Ativar no Mac remoto (System Settings):**
```
Configurações → Geral → Compartilhamento → Compartilhamento de Tela → ON
```

**Ou via terminal no Mac remoto:**
```bash
# Ativar Screen Sharing via kickstart
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
  -activate -configure -access -on \
  -clientopts -setvnclegacy -vnclegacy 1 \
  -clientopts -setvncpw -vncpw suasenha \
  -restart -agent -privs -all

# Ativar só VNC (porta 5900):
sudo defaults write /var/db/launchd.db/com.apple.launchd/overrides.plist \
  com.apple.screensharing -dict Disabled -bool false
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.screensharing.plist
```

**Conectar do Mac de origem:**
```bash
# Abrir Screen Sharing nativo:
open vnc://192.168.18.XXX
open vnc://Mac-Mini-de-Contact.local

# Via Finder:
# Cmd+K → vnc://192.168.18.XXX → conectar

# CLI com gravação de sessão (usando RealVNC/TigerVNC):
brew install tiger-vnc
vncviewer 192.168.18.XXX:5900
```

**RDP (se precisar de Windows no Mac):**
```bash
brew install --cask microsoft-remote-desktop
# App: Microsoft Remote Desktop → adicionar PC
```

---

### 6. Ativar SSH com acesso físico ao Mac remoto

```bash
# Opção A — System Preferences (mais simples)
# Configurações → Geral → Compartilhamento → Login Remoto → ON

# Opção B — Terminal no Mac remoto (1 comando)
sudo systemsetup -setremotelogin on

# Verificar se está ativo:
sudo systemsetup -getremotelogin
# → Remote Login: On

# Opção C — launchctl (macOS moderno)
sudo launchctl enable system/com.openssh.sshd
sudo launchctl start com.openssh.sshd

# Verificar porta 22 escutando:
sudo lsof -i :22
netstat -an | grep 22

# Opção D — via kickstart (permite especificar usuários)
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
  -activate -configure -allowAccessFor -allUsers -privs -all
```

---

### Workflow completo de descoberta

```bash
# 1. Mapear rede
sudo arp-scan --localnet | grep -i apple

# 2. Pegar IPs dos Macs encontrados → verificar hostnames
dns-sd -G v4 192.168.18.XXX

# 3. Ver se SSH está aberto
nmap -p 22 --open 192.168.18.0/24

# 4. Tentar conectar pelo Bonjour
ssh usuario@Mac-Mini-de-Contact.local

# 5. Se não sabe o usuário:
# Olhar físico no Mac remoto → ícone do usuário no canto superior direito
# Ou via Bonjour o nome do Mac geralmente inclui o nome do usuário
```

## Deploy automatizado de app Node.js em múltiplos Macs
Vou criar os scripts reais no workspace:

## Configurar OpenClaw em múltiplos Macs — guia completo
Ótimo — tenho os comandos reais. Agora vou criar os scripts:

