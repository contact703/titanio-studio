#!/usr/bin/env python3
"""
Sistema de Integração do Drive TITA_039 com Ecosistema Titanio
"""

import json
import time
import os
import subprocess
from datetime import datetime

class DriveIntegrationSystem:
    def __init__(self):
        self.drive_path = "/Volumes/TITA_039"
        self.network_path = "smb://192.168.18.174/TITA_039"
        self.bots_path = "/Volumes/TITA_039/Bots_Data"
        self.backups_path = "/Volumes/TITA_039/Backups/diarios"
        self.shared_path = "/Volumes/TITA_039/Shared/Especialistas"
        
    def check_drive_status(self):
        """Verificar se drive está montado e acessível"""
        if os.path.exists(self.drive_path):
            stats = os.statvfs(self.drive_path)
            total = stats.f_blocks * stats.f_frsize
            free = stats.f_bavail * stats.f_frsize
            used = total - free
            
            return {
                "status": "mounted",
                "total_gb": total / (1024**3),
                "used_gb": used / (1024**3),
                "free_gb": free / (1024**3),
                "percentage": (used / total) * 100
            }
        else:
            return {"status": "not_mounted", "error": "Drive não encontrado"}
    
    def setup_bot_integration(self):
        """Configurar integração com bots"""
        print("🔧 Configurando integração com bots...")
        
        # Criar estrutura para bots salvarem dados
        bot_folders = [
            "polymarket/trades",
            "polymarket/logs", 
            "polymarket/sessions",
            "victor_capital/editais",
            "instagram/data",
            "titanio_media/outputs",
            "shared/dashboards"
        ]
        
        for folder in bot_folders:
            full_path = os.path.join(self.bots_path, folder)
            os.makedirs(full_path, exist_ok=True)
            print(f"   ✅ {folder}")
        
        # Criar arquivo de configuração
        config = {
            "network_drive": self.network_path,
            "local_path": self.drive_path,
            "bots_directories": bot_folders,
            "created_at": datetime.now().isoformat(),
            "status": "active"
        }
        
        with open(os.path.join(self.bots_path, "config.json"), "w") as f:
            json.dump(config, f, indent=2)
        
        print("✅ Integração com bots configurada!")
    
    def create_backup_system(self):
        """Criar sistema de backup automático"""
        print("💾 Criando sistema de backup automático...")
        
        # Criar script de backup
        backup_script = """#!/bin/bash
# Backup automático do sistema Titanio

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/Volumes/TITA_039/Backups/diarios/$DATE"

mkdir -p $BACKUP_DIR

# Backup dos projetos
cp -r /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos $BACKUP_DIR/

# Backup das sessões
cp -r /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/sessions $BACKUP_DIR/

# Backup do memory
cp /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/MEMORY.md $BACKUP_DIR/

# Backup dos bots
cp -r /Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/polymarket-bot $BACKUP_DIR/

echo "✅ Backup completo realizado em $BACKUP_DIR"
"""
        
        with open(os.path.join(self.backups_path, "backup.sh"), "w") as f:
            f.write(backup_script)
        
        os.chmod(os.path.join(self.backups_path, "backup.sh"), 0o755)
        
        print("✅ Sistema de backup criado!")
    
    def create_network_access_script(self):
        """Criar script de acesso via rede"""
        print("🌐 Criando script de acesso via rede...")
        
        access_script = f"""#!/bin/bash
# Acessar drive TITA_039 via rede

echo "🔌 Acessando drive TITA_039 via rede..."
echo "Endereço: {self.network_path}"
echo ""
echo "📁 Pastas disponíveis:"
ls -la "{self.drive_path}"
echo ""
echo "💡 Dica: Use 'open smb://192.168.18.174/TITA_039' no Finder"
"""
        
        with open("/Volumes/TITA_039/access_network.sh", "w") as f:
            f.write(access_script)
        
        os.chmod("/Volumes/TITA_039/access_network.sh", 0o755)
        
        print("✅ Script de acesso via rede criado!")
    
    def generate_status_report(self):
        """Gerar relatório de status"""
        drive_status = self.check_drive_status()
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "drive_status": drive_status,
            "network_access": {
                "address": self.network_path,
                "local_ip": "192.168.18.174",
                "protocol": "SMB"
            },
            "integration_status": {
                "bots_configured": os.path.exists(self.bots_path),
                "backup_system": os.path.exists(self.backups_path),
                "shared_access": os.path.exists(self.shared_path)
            },
            "recommendations": [
                "Acesse via Finder: smb://192.168.18.174/TITA_039",
                "Use para salvar dados dos bots",
                "Configure backups automáticos",
                "Compartilhe com equipe via rede"
            ]
        }
        
        # Salvar relatório
        with open("/Volumes/TITA_039/status_report.json", "w") as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def run_integration(self):
        """Executar integração completa"""
        print("="*60)
        print("🚀 INTEGRANDO DRIVE TITA_039 COM ECOSISTEMA TITANIO")
        print("="*60)
        
        # Verificar status inicial
        status = self.check_drive_status()
        print(f"📊 Status do drive: {status['status']}")
        print(f"💾 Espaço: {status['used_gb']:.1f}GB usados de {status['total_gb']:.1f}GB total")
        print(f"📈 Utilização: {status['percentage']:.1f}%")
        
        # Executar configurações
        self.setup_bot_integration()
        self.create_backup_system()
        self.create_network_access_script()
        
        # Gerar relatório final
        report = self.generate_status_report()
        
        print("\n" + "="*60)
        print("✅ INTEGRAÇÃO COMPLETA!")
        print("="*60)
        print(f"🌐 Acesso via rede: {report['network_access']['address']}")
        print(f"📁 Estrutura criada para bots")
        print(f"💾 Backup automático configurado")
        print(f"📊 Status salvo em: status_report.json")
        print("\n💡 Próximo passo: Configure seus bots pra salvar dados aqui!")

if __name__ == "__main__":
    system = DriveIntegrationSystem()
    system.run_integration()
