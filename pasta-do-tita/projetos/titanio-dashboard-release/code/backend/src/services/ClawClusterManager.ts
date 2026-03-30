import { Bot } from '../types/bot';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ClawClusterManager
 * 
 * Gerencia múltiplas instâncias de OpenClaw na rede.
 * Funcionalidades:
 * - Descoberta de claws na rede
 * - Health check contínuo
 * - Failover automático
 * - Load balancing
 * - Redirecionamento de tarefas
 */
export class ClawClusterManager implements Bot {
  id = 'claw-cluster-manager';
  name = 'Claw Cluster Manager';
  avatar = '🕸️';
  status: 'idle' | 'running' | 'error' = 'idle';
  
  private claws: Map<string, ClawInstance> = new Map();
  private isRunning = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 segundos
  private readonly FAILOVER_TIMEOUT = 60000; // 1 minuto para considerar morto

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.status = 'running';
    
    console.log('🕸️ Claw Cluster Manager iniciado');
    
    // Descobrir claws na rede
    await this.discoverClaws();
    
    // Iniciar health check
    this.startHealthChecks();
    
    console.log(`   ${this.claws.size} claws na rede`);
    console.log(`   Health check: a cada ${this.HEALTH_CHECK_INTERVAL / 1000}s`);
  }

  async stop(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.isRunning = false;
    this.status = 'idle';
    console.log('🛑 Claw Cluster Manager parado');
  }

  /**
   * Descobre claws na rede
   */
  private async discoverClaws(): Promise<void> {
    // 1. Ler configuração de claws conhecidos
    const configPath = path.join(process.cwd(), '.sync', 'cluster-config.json');
    
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      
      for (const claw of config.claws || []) {
        this.claws.set(claw.id, {
          id: claw.id,
          name: claw.name,
          host: claw.host,
          port: claw.port || 4444,
          userName: claw.userName,
          status: 'unknown',
          lastSeen: null,
          load: 0,
          capabilities: claw.capabilities || []
        });
      }
    }
    
    // 2. Adicionar claw local
    const localId = this.getLocalClawId();
    this.claws.set(localId, {
      id: localId,
      name: process.env.USER || 'local',
      host: 'localhost',
      port: 4444,
      userName: process.env.USER || 'local',
      status: 'online',
      lastSeen: new Date().toISOString(),
      load: 0,
      capabilities: ['local', 'primary'],
      isLocal: true
    });
    
    // 3. Descobrir via multicast/broadcast (futuro)
    // await this.discoverViaMulticast();
  }

  /**
   * Inicia health checks periódicos
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAllClawsHealth();
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Verifica saúde de todos os claws
   */
  private async checkAllClawsHealth(): Promise<void> {
    for (const [id, claw] of this.claws) {
      if (claw.isLocal) {
        // Local sempre online
        claw.status = 'online';
        claw.lastSeen = new Date().toISOString();
        continue;
      }
      
      try {
        const isHealthy = await this.checkClawHealth(claw);
        
        if (isHealthy) {
          claw.status = 'online';
          claw.lastSeen = new Date().toISOString();
          
          // Se estava offline, notifica que voltou
          if (claw.status === 'offline') {
            console.log(`✅ Claw ${claw.name} voltou online!`);
          }
        } else {
          this.handleClawUnhealthy(claw);
        }
      } catch (error) {
        this.handleClawUnhealthy(claw);
      }
    }
  }

  /**
   * Verifica saúde de um claw específico
   */
  private async checkClawHealth(claw: ClawInstance): Promise<boolean> {
    try {
      // Tenta conectar na API do claw
      const response = await fetch(`http://${claw.host}:${claw.port}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        claw.load = data.squad?.busy || 0;
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Lida com claw não-saudável
   */
  private handleClawUnhealthy(claw: ClawInstance): void {
    const lastSeen = claw.lastSeen ? new Date(claw.lastSeen).getTime() : 0;
    const timeOffline = Date.now() - lastSeen;
    
    if (claw.status === 'online') {
      // Primeira vez que detecta problema
      claw.status = 'unstable';
      console.log(`⚠️ Claw ${claw.name} instável (${timeOffline / 1000}s offline)`);
    } else if (timeOffline > this.FAILOVER_TIMEOUT && claw.status !== 'offline') {
      // Considera morto após timeout
      claw.status = 'offline';
      console.log(`❌ Claw ${claw.name} OFFLINE (${timeOffline / 1000}s sem resposta)`);
      
      // Dispara failover
      this.triggerFailover(claw);
    }
  }

  /**
   * Aciona failover para um claw morto
   */
  private triggerFailover(deadClaw: ClawInstance): void {
    console.log(`🔄 Failover: Redirecionando tarefas de ${deadClaw.name}`);
    
    // Encontra claws disponíveis
    const availableClaws = this.getAvailableClaws();
    
    if (availableClaws.length === 0) {
      console.log('   ⚠️ Nenhum claw disponível para failover!');
      return;
    }
    
    // Seleciona claw com menor carga
    const targetClaw = availableClaws.reduce((prev, curr) => 
      prev.load < curr.load ? prev : curr
    );
    
    console.log(`   → Tarefas redirecionadas para ${targetClaw.name}`);
    
    // Notifica (pode salvar em arquivo para processamento posterior)
    this.saveFailoverEvent(deadClaw, targetClaw);
  }

  /**
   * Obtém claws disponíveis
   */
  private getAvailableClaws(): ClawInstance[] {
    return Array.from(this.claws.values()).filter(
      c => c.status === 'online' && !c.isLocal
    );
  }

  /**
   * Salva evento de failover
   */
  private saveFailoverEvent(from: ClawInstance, to: ClawInstance): void {
    const event = {
      type: 'failover',
      timestamp: new Date().toISOString(),
      from: { id: from.id, name: from.name },
      to: { id: to.id, name: to.name },
      reason: 'claw_offline'
    };
    
    const eventsPath = path.join(process.cwd(), '.sync', 'failover-events.json');
    
    let events: any[] = [];
    if (fs.existsSync(eventsPath)) {
      events = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
    }
    
    events.push(event);
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
  }

  /**
   * Obtém ID único do claw local
   */
  private getLocalClawId(): string {
    const configPath = path.join(process.cwd(), '.sync', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.machineId || `claw-${Date.now()}`;
    }
    return `claw-${Date.now()}`;
  }

  /**
   * Redireciona tarefa para claw disponível
   */
  async redirectTask(task: any): Promise<ClawInstance | null> {
    const available = this.getAvailableClaws();
    
    if (available.length === 0) {
      return null;
    }
    
    // Load balancing: menor carga
    const target = available.reduce((prev, curr) => 
      prev.load < curr.load ? prev : curr
    );
    
    console.log(`🔄 Tarefa redirecionada para ${target.name} (load: ${target.load})`);
    
    return target;
  }

  /**
   * Retorna estatísticas do cluster
   */
  getStats(): ClusterStats {
    const all = Array.from(this.claws.values());
    
    return {
      total: all.length,
      online: all.filter(c => c.status === 'online').length,
      offline: all.filter(c => c.status === 'offline').length,
      unstable: all.filter(c => c.status === 'unstable').length,
      claws: all.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        load: c.load,
        isLocal: c.isLocal || false
      }))
    };
  }

  /**
   * Registra novo claw no cluster
   */
  registerClaw(claw: Partial<ClawInstance>): void {
    const id = claw.id || `claw-${Date.now()}`;
    
    this.claws.set(id, {
      id,
      name: claw.name || 'unknown',
      host: claw.host || 'localhost',
      port: claw.port || 4444,
      userName: claw.userName || 'unknown',
      status: 'unknown',
      lastSeen: null,
      load: 0,
      capabilities: claw.capabilities || []
    });
    
    console.log(`➕ Claw registrado: ${claw.name} (${id})`);
  }
}

interface ClawInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  userName: string;
  status: 'online' | 'offline' | 'unstable' | 'unknown';
  lastSeen: string | null;
  load: number;
  capabilities: string[];
  isLocal?: boolean;
}

interface ClusterStats {
  total: number;
  online: number;
  offline: number;
  unstable: number;
  claws: Array<{
    id: string;
    name: string;
    status: string;
    load: number;
    isLocal: boolean;
  }>;
}
