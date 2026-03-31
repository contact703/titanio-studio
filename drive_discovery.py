#!/usr/bin/env python3
"""
Sistema de Descoberta e Configuração de Drives em Rede
Descobre drives na rede e configura automaticamente
"""

import subprocess
import json
import time
import os
from datetime import datetime

class NetworkDriveDiscovery:
    def __init__(self):
        self.network_range = "192.168.18."  # Rede local
        self.exclude_names = ["TITA_039", "Macintosh HD"]  # Já configurados
        self.discovered_drives = []
        
    def scan_network_smb(self):
        """Escanear rede procurando compartilhamentos SMB"""
        print("🔍 Escaneando rede por compartilhamentos SMB...")
        
        discovered = []
        
        # Verificar roteador/gateway primeiro
        try:
            result = subprocess.run(
                ["smbutil", "view", "//192.168.18.1"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    if "Disk" in line or "Share" in line:
                        share_name = line.strip().split()[0] if line.strip().split() else ""
                        if share_name and share_name not in self.exclude_names:
                            discovered.append({
                                "host": "192.168.18.1",
                                "share": share_name,
                                "type": "smb",
                                "discovered_at": datetime.now().isoformat()
                            })
        except:
            pass
        
        # Verificar outros IPs comuns da rede
        common_ips = ["192.168.18.100", "192.168.18.101", "192.168.18.102", "192.168.18.103"]
        
        for ip in common_ips:
            try:
                result = subprocess.run(
                    ["smbutil", "view", f"//{ip}"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0:
                    for line in result.stdout.split('\n'):
                        if line.strip() and not line.startswith("Share") and not line.startswith("Type"):
                            parts = line.strip().split()
                            if len(parts) >= 2:
                                share_name = parts[0]
                                share_type = parts[1] if len(parts) > 1 else "Unknown"
                                
                                if share_name not in self.exclude_names:
                                    discovered.append({
                                        "host": ip,
                                        "share": share_name,
                                        "type": "smb",
                                        "discovered_at": datetime.now().isoformat()
                                    })
            except:
                pass
        
        return discovered
    
    def check_mounted_network_drives(self):
        """Verificar drives de rede já montados"""
        print("🔍 Verificando drives de rede montados...")
        
        mounted = []
        try:
            result = subprocess.run(["mount"], capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if "//" in line and "/Volumes/" in line:
                    parts = line.split()
                    if len(parts) >= 3:
                        source = parts[0]  # //host/share
                        mount_point = parts[2]  # /Volumes/Name
                        
                        if "TITA_039" not in source:  # Excluir o já configurado
                            mounted.append({
                                "source": source,
                                "mount_point": mount_point,
                                "type": "smb_mounted",
                                "discovered_at": datetime.now().isoformat()
                            })
        except:
            pass
        
        return mounted
    
    def create_mount_script(self, drive_info):
        """Criar script pra montar drive em rede"""
        script_name = f"mount_{drive_info['host'].replace('.', '_')}_{drive_info['share']}.sh"
        
        script = f"""#!/bin/bash
# Montar drive {drive_info['share']} de {drive_info['host']}

MOUNT_POINT="/Volumes/Network_{drive_info['share']}"
NETWORK_PATH="smb://{drive_info['host']}/{drive_info['share']}"

echo "🔌 Montando drive em rede..."
echo "Fonte: $NETWORK_PATH"
echo "Destino: $MOUNT_POINT"

# Criar ponto de montagem
sudo mkdir -p "$MOUNT_POINT"

# Montar via SMB
sudo mount_smbfs "//$NETWORK_PATH" "$MOUNT_POINT"

if [ $? -eq 0 ]; then
    echo "✅ Drive montado com sucesso!"
    echo "Acesse em: $MOUNT_POINT"
else
    echo "❌ Erro ao montar drive"
    exit 1
fi
"""
        
        script_path = f"/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/mount_{script_name}"
        with open(script_path, "w") as f:
            f.write(script)
        
        os.chmod(script_path, 0o755)
        
        return script_path
    
    def scan_and_configure(self):
        """Escanear e configurar drives encontrados"""
        print("="*60)
        print("🔍 ESCANEANDO DRIVES EM REDE")
        print("="*60)
        
        # Descobrir drives SMB
        smb_drives = self.scan_network_smb()
        mounted_drives = self.check_mounted_network_drives()
        
        all_drives = smb_drives + mounted_drives
        
        if not all_drives:
            print("ℹ️  Nenhum drive adicional encontrado na rede")
            print("   - Verificando novamente em 60 segundos...")
            time.sleep(60)
            return self.scan_and_configure()  # Tentar novamente
        
        print(f"✅ Encontrados {len(all_drives)} drives na rede:")
        
        configured = []
        for drive in all_drives:
            print(f"\n📁 Drive encontrado:")
            print(f"   Host: {drive['host']}")
            print(f"   Share: {drive['share']}")
            print(f"   Tipo: {drive['type']}")
            
            # Criar script de montagem
            script_path = self.create_mount_script(drive)
            configured.append({
                "drive": drive,
                "mount_script": script_path,
                "configured_at": datetime.now().isoformat()
            })
            
            print(f"   ✅ Script criado: {os.path.basename(script_path)}")
        
        # Salvar descoberta
        discovery_file = "/Volumes/TITA_039/discovered_drives.json"
        with open(discovery_file, "w") as f:
            json.dump(configured, f, indent=2)
        
        print(f"\n✅ Configuração salva em: {discovery_file}")
        print("\n💡 Próximo passo: Execute os scripts de montagem que foram criados")
        
        return configured

if __name__ == "__main__":
    scanner = NetworkDriveDiscovery()
    scanner.scan_and_configure()
