import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SecurityAlert {
  id: string;
  type: 'network' | 'process' | 'file' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  details?: any;
}

export class SecuritySentinel {
  private alerts: SecurityAlert[] = [];
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    console.log('🛡️ Security Sentinel iniciado');
    
    // Verificações a cada 30 segundos
    this.checkInterval = setInterval(() => {
      this.performSecurityChecks();
    }, 30000);
    
    // Primeira verificação imediata
    this.performSecurityChecks();
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🛡️ Security Sentinel parado');
  }

  private async performSecurityChecks() {
    await Promise.all([
      this.checkNetworkConnections(),
      this.checkSuspiciousProcesses(),
      this.checkDiskSpace(),
      this.checkSystemLoad()
    ]);
  }

  private async checkNetworkConnections() {
    try {
      const { stdout } = await execAsync('netstat -an | grep LISTEN | wc -l');
      const connections = parseInt(stdout.trim());
      
      if (connections > 100) {
        this.addAlert({
          id: `net-${Date.now()}`,
          type: 'network',
          severity: 'medium',
          message: `Muitas conexões de rede: ${connections}`,
          timestamp: new Date().toISOString(),
          details: { connections }
        });
      }
    } catch (error) {
      // Silently fail
    }
  }

  private async checkSuspiciousProcesses() {
    try {
      const suspiciousPatterns = ['miner', 'crypto', 'trojan', 'keylogger'];
      const { stdout } = await execAsync('ps aux');
      
      for (const pattern of suspiciousPatterns) {
        if (stdout.toLowerCase().includes(pattern)) {
          this.addAlert({
            id: `proc-${Date.now()}`,
            type: 'process',
            severity: 'critical',
            message: `Processo suspeito detectado: ${pattern}`,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  private async checkDiskSpace() {
    try {
      const { stdout } = await execAsync('df -h / | tail -1 | awk \'{print $5}\' | sed \'s/%//\'');
      const usage = parseInt(stdout.trim());
      
      if (usage > 85) {
        this.addAlert({
          id: `disk-${Date.now()}`,
          type: 'system',
          severity: 'high',
          message: `Disco quase cheio: ${usage}%`,
          timestamp: new Date().toISOString(),
          details: { usage }
        });
      }
    } catch (error) {
      // Silently fail
    }
  }

  private async checkSystemLoad() {
    try {
      const { stdout } = await execAsync('uptime | awk -F"load averages:" \'{print $2}\' | awk \'{print $1}\' | sed \'s/,//\'');
      const load = parseFloat(stdout.trim());
      
      if (load > 4.0) {
        this.addAlert({
          id: `load-${Date.now()}`,
          type: 'system',
          severity: load > 8.0 ? 'critical' : 'medium',
          message: `Carga do sistema alta: ${load}`,
          timestamp: new Date().toISOString(),
          details: { load }
        });
      }
    } catch (error) {
      // Silently fail
    }
  }

  private addAlert(alert: SecurityAlert) {
    this.alerts.push(alert);
    // Mantém apenas últimos 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
    console.log(`🚨 [${alert.severity.toUpperCase()}] ${alert.message}`);
  }

  getAlerts(severity?: string): SecurityAlert[] {
    if (severity) {
      return this.alerts.filter(a => a.severity === severity);
    }
    return this.alerts.slice(-20); // Últimos 20
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      totalAlerts: this.alerts.length,
      criticalAlerts: this.alerts.filter(a => a.severity === 'critical').length,
      highAlerts: this.alerts.filter(a => a.severity === 'high').length,
      lastCheck: this.alerts.length > 0 ? this.alerts[this.alerts.length - 1].timestamp : null
    };
  }
}
