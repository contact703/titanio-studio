import { Bot } from '../types/bot';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * ErrorMonitor Bot
 * 
 * Monitora logs do OpenClaw em tempo real, detecta erros comuns
 * e aciona bots especializados para resolução automática.
 */
export class ErrorMonitorBot implements Bot {
  id = 'error-monitor';
  name = 'Error Monitor';
  avatar = '🚨';
  status: 'idle' | 'running' | 'error' = 'idle';
  
  private isRunning = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private errorLog: string[] = [];
  private readonly errorPatterns = [
    {
      pattern: /rate_limit|API rate limit reached/i,
      type: 'rate_limit',
      severity: 'high',
      autoFixable: true,
      resolver: 'rate-limit-resolver'
    },
    {
      pattern: /timed out|timeout|LLM request timed out/i,
      type: 'timeout',
      severity: 'medium',
      autoFixable: true,
      resolver: 'timeout-resolver'
    },
    {
      pattern: /ECONNREFUSED|connection refused/i,
      type: 'connection',
      severity: 'high',
      autoFixable: false,
      resolver: null
    },
    {
      pattern: /ENOTFOUND|getaddrinfo|DNS/i,
      type: 'dns',
      severity: 'high',
      autoFixable: false,
      resolver: null
    }
  ];

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.status = 'running';
    
    console.log('🚨 Error Monitor iniciado');
    console.log('   Monitorando: rate limits, timeouts, connection errors');
    
    // Check inicial
    this.checkForErrors();
    
    // Monitoramento periódico
    this.checkInterval = setInterval(() => {
      this.checkForErrors();
    }, 30000); // A cada 30 segundos
    
    // Também monitora arquivo de log em tempo real
    this.tailLogFile();
  }

  async stop(): Promise<void> {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    this.status = 'idle';
    console.log('🛑 Error Monitor parado');
  }

  /**
   * Verifica logs por erros
   */
  private async checkForErrors(): Promise<void> {
    try {
      // Verificar logs recentes do OpenClaw
      const { stdout } = await execAsync('openclaw logs --limit 50 2>&1 || echo "No logs"');
      
      for (const errorPattern of this.errorPatterns) {
        if (errorPattern.pattern.test(stdout)) {
          const matches = stdout.match(new RegExp(errorPattern.pattern, 'g'));
          const count = matches ? matches.length : 0;
          
          if (count > 0) {
            this.handleError({
              type: errorPattern.type,
              severity: errorPattern.severity,
              count,
              timestamp: new Date().toISOString(),
              autoFixable: errorPattern.autoFixable,
              resolver: errorPattern.resolver,
              context: stdout.substring(0, 500)
            });
          }
        }
      }
    } catch (error) {
      // Ignorar erros de execução
    }
  }

  /**
   * Acompanha arquivo de log em tempo real
   */
  private tailLogFile(): void {
    const logPaths = [
      path.join(process.env.HOME || '', '.openclaw', 'logs', 'openclaw.log'),
      '/var/log/openclaw.log',
      '/tmp/openclaw.log'
    ];
    
    // Verifica qual arquivo existe
    const logFile = logPaths.find(p => fs.existsSync(p));
    
    if (logFile) {
      // Usa tail -f para monitorar em tempo real
      const tail = exec(`tail -n 0 -f "${logFile}"`);
      
      tail.stdout?.on('data', (data) => {
        this.analyzeLogLine(data.toString());
      });
    }
  }

  /**
   * Analiza linha de log
   */
  private analyzeLogLine(line: string): void {
    for (const errorPattern of this.errorPatterns) {
      if (errorPattern.pattern.test(line)) {
        this.handleError({
          type: errorPattern.type,
          severity: errorPattern.severity,
          count: 1,
          timestamp: new Date().toISOString(),
          autoFixable: errorPattern.autoFixable,
          resolver: errorPattern.resolver,
          context: line
        });
      }
    }
  }

  /**
   * Processa erro detectado
   */
  private handleError(error: {
    type: string;
    severity: string;
    count: number;
    timestamp: string;
    autoFixable: boolean;
    resolver: string | null;
    context: string;
  }): void {
    // Evita duplicatas recentes
    const recentError = this.errorLog.find(e => 
      e.includes(error.type) && 
      Date.now() - new Date(error.timestamp).getTime() < 60000
    );
    
    if (recentError) return;
    
    // Log do erro
    this.errorLog.push(`[${error.timestamp}] ${error.type}: ${error.count} ocorrências`);
    
    console.log(`🚨 Erro detectado: ${error.type} (${error.severity})`);
    
    // Se auto-fixable, aciona resolver
    if (error.autoFixable && error.resolver) {
      console.log(`   → Acionando ${error.resolver}...`);
      this.triggerResolver(error.resolver, error);
    } else {
      // Notifica humano
      console.log(`   → Requer intervenção humana`);
      this.notifyHuman(error);
    }
  }

  /**
   * Aciona bot resolvedor
   */
  private triggerResolver(resolverId: string, error: any): void {
    // Importa e aciona resolver dinamicamente
    switch (resolverId) {
      case 'rate-limit-resolver':
        import('./RateLimitResolver').then(({ RateLimitResolver }) => {
          const resolver = new RateLimitResolver();
          resolver.resolve(error);
        });
        break;
      case 'timeout-resolver':
        import('./TimeoutResolver').then(({ TimeoutResolver }) => {
          const resolver = new TimeoutResolver();
          resolver.resolve(error);
        });
        break;
    }
  }

  /**
   * Notifica humano para erros não-auto-fixable
   */
  private notifyHuman(error: any): void {
    // Salva em arquivo para notificação
    const alertPath = path.join(process.cwd(), '.alerts', `error-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(alertPath), { recursive: true });
    fs.writeFileSync(alertPath, JSON.stringify(error, null, 2));
    
    console.log(`   📧 Alerta salvo: ${alertPath}`);
  }

  /**
   * Retorna estatísticas
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      errorsDetected: this.errorLog.length,
      recentErrors: this.errorLog.slice(-10)
    };
  }
}
