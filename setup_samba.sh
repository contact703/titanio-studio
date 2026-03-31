#!/bin/bash
# Configurar compartilhamento SMB no Mac

# Instalar Samba via Homebrew se não tiver
if ! which smbd; then
    echo "Instalando Samba..."
    brew install samba
fi

# Criar configuração SMB
cat > /usr/local/etc/smb.conf << 'SMBEOF'
[TITA_039]
   comment = Titanio External Drive
   path = /Volumes/TITA_039
   browseable = yes
   read only = no
   create mask = 0755
   directory mask = 0755
   guest ok = yes
   public = yes
   force user = contacttitanio
   force group = staff

[Shared_Drives]
   comment = Shared Drives Network
   path = /Volumes/Shared_Drives
   browseable = yes
   read only = no
   create mask = 0755
   directory mask = 0755
   guest ok = yes
   public = yes
   force user = contacttitanio
   force group = staff
SMBEOF

# Iniciar Samba
sudo brew services start samba

echo "✅ Samba configurado!"
echo "Acesse: smb://$(hostname -f)/TITA_039"
echo "ou: smb://$(hostname -f)/Shared_Drives"
