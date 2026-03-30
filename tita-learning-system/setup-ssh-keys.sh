#!/bin/bash
# setup-ssh-keys.sh — Configura acesso SSH sem senha nos outros Macs da rede
# Deve ser rodado UMA VEZ quando tiver acesso físico ou senha ao Mac remoto

TARGET_IP="$1"
TARGET_USER="$2"

if [ -z "$TARGET_IP" ] || [ -z "$TARGET_USER" ]; then
  echo "Uso: ./setup-ssh-keys.sh <IP> <usuario>"
  echo "Ex:  ./setup-ssh-keys.sh 192.168.18.170 helber"
  exit 1
fi

echo "🔑 Configurando SSH sem senha para $TARGET_USER@$TARGET_IP"

# Garantir que temos uma chave ed25519
if [ ! -f ~/.ssh/id_ed25519.pub ]; then
  echo "Gerando nova chave SSH..."
  ssh-keygen -t ed25519 -C "tita@titanio" -f ~/.ssh/id_ed25519 -N ""
fi

# Copiar chave pública para o destino
echo "Copiando chave pública..."
ssh-copy-id -i ~/.ssh/id_ed25519.pub "$TARGET_USER@$TARGET_IP"

# Adicionar ao ~/.ssh/config
echo "Configurando alias..."
cat >> ~/.ssh/config << CONF

Host titanio-$TARGET_IP
  HostName $TARGET_IP
  User $TARGET_USER
  IdentityFile ~/.ssh/id_ed25519
  StrictHostKeyChecking no
CONF

# Testar
echo ""
echo "Testando conexão..."
ssh "titanio-$TARGET_IP" "hostname && echo '✅ SSH sem senha funcionando!'"
