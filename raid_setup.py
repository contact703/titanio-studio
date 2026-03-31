#!/usr/bin/env python3
"""
Sistema de Configuração e Monitoramento de RAID
Detecta e configura automaticamente RAID devices
"""

import subprocess
import json
import time
import os
from datetime import datetime

class RAIDSetupSystem:
    def __init__(self):
        self.raid_devices = []
        self.drivers_path = "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/drivers"
        self.raid_path = "/Volumes/TITA_039/RAID_Devices"
        
    def scan_for_raid_devices(self):
        """Escanear por dispositivos RAID"""
        print("🔍 Escaneando por dispositivos RAID...")
        
        raid_devices = []
        
        # Verificar via diskutil
        try:
            result = subprocess.run(["diskutil", "list"], capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if "RAID" in line or "external" in line:
                    parts = line.strip().split()
                    if len(parts) >= 4:
                        device = {
                            "device": parts[0] if parts[0].startswith("/dev/") else None,
                            "type": parts[1] if len(parts) > 1 else "unknown",
                            "name": parts[2] if len(parts) > 2 else "unknown",
                            "size": parts[3] if len(parts) > 3 else "unknown",
                            "discovered_at": datetime.now().isoformat()
                        }
                        if device["device"] and "TITA_039" not in device["name"]:
                            raid_devices.append(device)
        except Exception as e:
            print(f"❌ Erro ao escanear com diskutil: {e}")
        
        # Verificar via system_profiler
        try:
            result = subprocess.run(["system_profiler", "SPStorageDataType"], capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if "RAID" in line or "external" in line:
                    raid_devices.append({
                        "info": line.strip(),
                        "source": "system_profiler",
                        "discovered_at": datetime.now().isoformat()
                    })
        except:
            pass
        
        return raid_devices
    
    def check_drivers_availability(self):
        """Verificar se há drivers disponíveis"""
        print("🔍 Verificando drivers disponíveis...")
        
        drivers = []
        
        # Procurar por drivers na pasta especificada
        if os.path.exists(self.drivers_path):
            for root, dirs, files in os.walk(self.drivers_path):
                for file in files:
                    if any(ext in file.lower() for ext in ['.dmg', '.pkg', '.kext', 'raid', 'storage']):
                        drivers.append({
                            "file": file,
                            "path": os.path.join(root, file),
                            "type": self.identify_driver_type(file),
                            "found_at": datetime.now().isoformat()
                        })
        
        # Procurar por drivers de RAID específicos
        raid_patterns = ["raid", "storage", "driver", "mount", "mountain", "pet"]
        for pattern in raid_patterns:
            try:
                result = subprocess.run(["find", "/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace", "-name", f"*{pattern}*", "-type", "f"], capture_output=True, text=True)
                for line in result.stdout.strip().split('\n'):
                    if line and pattern in line.lower():
                        drivers.append({
                            "file": os.path.basename(line),
                            "path": line,
                            "type": "found_by_pattern",
                            "pattern": pattern,
                            "found_at": datetime.now().isoformat()
                        })
            except:
                pass
        
        return drivers
    
    def create_raid_monitor(self):
        """Criar monitoramento para RAID"""
        monitor_script = f"""#!/bin/bash
# Monitoramento de RAID - Titanio System

echo "🔍 Monitorando RAID devices..."

while true; do
    echo "$(date): Verificando dispositivos..."
    
    # Listar dispositivos
    diskutil list | grep -i "raid\|external" | while read line; do
        echo "$(date): $line"
    done
    
    # Verificar montagens
    mount | grep -i "/dev/disk" | while read line; do
        echo "$(date): $line"
    done
    
    sleep 60
done
"""
        
        script_path = "/Volumes/TITA_039/RAID_Monitor.sh"
        with open(script_path, "w") as f:
            f.write(monitor_script)
        
        os.chmod(script_path, 0o755)
        
        return script_path
    
    def setup_raid_integration(self):
        """Configurar integração completa com RAID"""
        print("🔧 Configurando integração com RAID...")
        
        # Criar estrutura para RAID
        raid_folders = [
            "data",
            "logs", 
            "backups",
            "monitoring",
            "shared"
        ]
        
        for folder in raid_folders:
            full_path = os.path.join(self.raid_path, folder)
            os.makedirs(full_path, exist_ok=True)
            print(f"   ✅ {folder}")
        
        # Criar configuração
        config = {
            "raid_path": self.raid_path,
            "monitor_script": self.create_raid_monitor(),
            "configured_at": datetime.now().isoformat(),
            "status": "configured"
        }
        
        with open(os.path.join(self.raid_path, "config.json"), "w") as f:
            json.dump(config, f, indent=2)
        
        print("✅ Integração com RAID configurada!")
    
    def run_setup(self):
        """Executar configuração completa"""
        print("="*60)
        print("🚀 CONFIGURANDO SISTEMA RAID")
        print("="*60)
        
        # Descobrir dispositivos
        raid_devices = self.scan_for_raid_devices()
        drivers = self.check_drivers_availability()
        
        print(f"📊 Dispositivos encontrados: {len(raid_devices)}")
        print(f"🔧 Drivers encontrados: {len(drivers)}")
        
        if raid_devices:
            print("\n📁 Dispositivos RAID encontrados:")
            for device in raid_devices:
                print(f"   {device}")
        
        if drivers:
            print("\n🔧 Drivers encontrados:")
            for driver in drivers:
                print(f"   {driver}")
        
        # Configurar integração
        self.setup_raid_integration()
        
        # Criar monitoramento
        monitor_script = self.create_raid_monitor()
        
        print("\n" + "="*60)
        print("✅ CONFIGURAÇÃO RAID COMPLETA!")
        print("="*60)
        print(f"🌐 Monitor criado: {monitor_script}")
        print(f"📁 Estrutura criada em: {self.raid_path}")
        print(f"📊 Status salvo em: config.json")
        print("\n💡 O sistema está pronto para RAID!")

if __name__ == "__main__":
    raid_system = RAIDSetupSystem()
    raid_system.run_setup()
