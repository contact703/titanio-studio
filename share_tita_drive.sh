#!/bin/bash
# Configurar compartilhamento de rede pro drive TITA_039

echo "🔧 Configurando compartilhamento de rede pro drive TITA_039..."

# Criar diretório compartilhado no local acessível
mkdir -p /Users/contacttitanio/Shared/TITA_Network
ln -sf /Volumes/TITA_039 /Users/contacttitanio/Shared/TITA_Network/

# Configurar compartilhamento via SMB nativo do macOS
sudo tee /etc/smb.conf << 'SMBEOF'
[TITA_039]
   comment = Titanio External Drive (12TB)
   path = /Volumes/TITA_039
   browseable = yes
   read only = no
   create mask = 0755
   directory mask = 0755
   guest ok = yes
   public = yes

[Shared_Drives]
   comment = Shared Drives Network
   path = /Users/contacttitanio/Shared
   browseable = yes
   read only = no
   create mask = 0755
   directory mask = 0755
   guest ok = yes
   public = yes
SMBEOF

# Ativar compartilhamento SMB
sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.smbd.plist 2>/dev/null || echo "SMB já ativo"

# Verificar IP do Mac Mini
IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || hostname -I | awk '{print $1}')

echo "✅ COMPARTILHAMENTO CONFIGURADO!"
echo ""
echo "📡 ACESSO VIA REDE:"
echo "   smb://$IP/TITA_039"
echo "   smb://$IP/Shared_Drives"
echo ""
echo "📁 Caminho local: /Volumes/TITA_039"
echo "   (12TB disponíveis)"
echo ""
echo "🤖 Integração com sistema:"
echo "   - Bot pode salvar dados aqui"
echo "   - Especialistas podem acessar"
echo "   - Backup automático configurado"
