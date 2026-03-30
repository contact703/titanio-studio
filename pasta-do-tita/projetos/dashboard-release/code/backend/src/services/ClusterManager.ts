import { Redis } from 'ioredis';

export interface ClusterNode {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'busy';
  resources: {
    cpu: number;
    ram: number;
    ramTotal: number;
    disk: number;
  };
  lastHeartbeat: string;
  botsRunning: string[];
}

export class ClusterManager {
  private nodes: Map<string, ClusterNode> = new Map();
  private redis?: Redis;
  private localNodeId: string;

  constructor() {
    this.localNodeId = `mac-${process.env.MAC_ID || '1'}`;
    this.initializeNodes();
    this.startHeartbeat();
  }

  private initializeNodes() {
    // Mac Mini 1 (Local)
    this.nodes.set('mac-1', {
      id: 'mac-1',
      name: 'Mac Mini - Node 1',
      host: '192.168.1.101',
      port: 4444,
      status: 'online',
      resources: { cpu: 45, ram: 62, ramTotal: 8192, disk: 78 },
      lastHeartbeat: new Date().toISOString(),
      botsRunning: ['bot-1', 'bot-2']
    });

    // Mac Mini 2 (Cluster)
    this.nodes.set('mac-2', {
      id: 'mac-2',
      name: 'Mac Mini - Node 2',
      host: '192.168.1.102',
      port: 4444,
      status: 'online',
      resources: { cpu: 32, ram: 45, ramTotal: 8192, disk: 65 },
      lastHeartbeat: new Date().toISOString(),
      botsRunning: []
    });

    // Mac Mini 3-5 (Standby)
    this.nodes.set('mac-3', {
      id: 'mac-3',
      name: 'Mac Mini - Node 3',
      host: '192.168.1.103',
      port: 4444,
      status: 'offline',
      resources: { cpu: 0, ram: 0, ramTotal: 8192, disk: 0 },
      lastHeartbeat: new Date(Date.now() - 3600000).toISOString(),
      botsRunning: []
    });

    this.nodes.set('mac-4', {
      id: 'mac-4',
      name: 'Mac Mini - Node 4',
      host: '192.168.1.104',
      port: 4444,
      status: 'offline',
      resources: { cpu: 0, ram: 0, ramTotal: 8192, disk: 0 },
      lastHeartbeat: new Date(Date.now() - 7200000).toISOString(),
      botsRunning: []
    });

    this.nodes.set('mac-5', {
      id: 'mac-5',
      name: 'Mac Mini - Node 5',
      host: '192.168.1.105',
      port: 4444,
      status: 'offline',
      resources: { cpu: 0, ram: 0, ramTotal: 8192, disk: 0 },
      lastHeartbeat: new Date(Date.now() - 86400000).toISOString(),
      botsRunning: []
    });
  }

  private startHeartbeat() {
    // Update local node stats every 30 seconds
    setInterval(() => {
      this.updateLocalNodeStats();
    }, 30000);
  }

  private updateLocalNodeStats() {
    const node = this.nodes.get(this.localNodeId);
    if (node) {
      // In real implementation, get actual system stats
      node.resources.cpu = Math.floor(Math.random() * 30) + 20;
      node.resources.ram = Math.floor(Math.random() * 40) + 40;
      node.lastHeartbeat = new Date().toISOString();
    }
  }

  getNodes(): ClusterNode[] {
    return Array.from(this.nodes.values());
  }

  getOnlineNodes(): ClusterNode[] {
    return this.getNodes().filter(n => n.status === 'online');
  }

  getNode(nodeId: string): ClusterNode | undefined {
    return this.nodes.get(nodeId);
  }

  getClusterStats() {
    const nodes = this.getNodes();
    const online = nodes.filter(n => n.status === 'online');
    
    const totalRam = nodes.reduce((sum, n) => sum + n.resources.ramTotal, 0);
    const usedRam = nodes.reduce((sum, n) => 
      sum + (n.resources.ram * n.resources.ramTotal / 100), 0);
    
    const totalBots = nodes.reduce((sum, n) => sum + n.botsRunning.length, 0);
    
    return {
      totalNodes: nodes.length,
      onlineNodes: online.length,
      offlineNodes: nodes.length - online.length,
      totalRamMB: totalRam,
      usedRamMB: Math.floor(usedRam),
      freeRamMB: totalRam - Math.floor(usedRam),
      ramPercentage: Math.floor((usedRam / totalRam) * 100),
      totalBotsRunning: totalBots,
      averageCpu: online.length > 0 
        ? online.reduce((sum, n) => sum + n.resources.cpu, 0) / online.length 
        : 0
    };
  }

  async migrateBot(botId: string, fromNodeId: string, toNodeId: string): Promise<boolean> {
    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);
    
    if (!fromNode || !toNode || toNode.status !== 'online') {
      return false;
    }
    
    // Remove from source
    fromNode.botsRunning = fromNode.botsRunning.filter(id => id !== botId);
    
    // Add to destination
    toNode.botsRunning.push(botId);
    
    // In real implementation, would actually migrate the process
    console.log(`🔄 Bot ${botId} migrado de ${fromNodeId} para ${toNodeId}`);
    
    return true;
  }

  findBestNodeForBot(): ClusterNode | null {
    const online = this.getOnlineNodes();
    if (online.length === 0) return null;
    
    // Find node with lowest RAM usage
    return online.sort((a, b) => a.resources.ram - b.resources.ram)[0];
  }

  async distributeLoad(): Promise<void> {
    const online = this.getOnlineNodes();
    if (online.length < 2) return;
    
    // Find most and least loaded nodes
    const sorted = online.sort((a, b) => b.resources.ram - a.resources.ram);
    const mostLoaded = sorted[0];
    const leastLoaded = sorted[sorted.length - 1];
    
    // If difference is significant (> 30%), migrate a bot
    if (mostLoaded.resources.ram - leastLoaded.resources.ram > 30 && mostLoaded.botsRunning.length > 1) {
      const botToMigrate = mostLoaded.botsRunning[0];
      await this.migrateBot(botToMigrate, mostLoaded.id, leastLoaded.id);
    }
  }

  getTopology(): { nodes: string[][]; edges: { from: string; to: string; status: string }[] } {
    const online = this.getOnlineNodes().map(n => n.id);
    
    // Create a mesh topology between online nodes
    const edges: { from: string; to: string; status: string }[] = [];
    
    for (let i = 0; i < online.length; i++) {
      for (let j = i + 1; j < online.length; j++) {
        edges.push({
          from: online[i],
          to: online[j],
          status: 'connected'
        });
      }
    }
    
    return {
      nodes: [online],
      edges
    };
  }

  async checkNodeHealth(nodeId: string): Promise<boolean> {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    
    const lastHeartbeat = new Date(node.lastHeartbeat);
    const now = new Date();
    const diff = now.getTime() - lastHeartbeat.getTime();
    
    // If no heartbeat in 2 minutes, mark as offline
    if (diff > 120000) {
      node.status = 'offline';
      return false;
    }
    
    return true;
  }

  // Memory optimization across cluster
  getMemoryOptimization(): { canOptimize: boolean; actions: string[] } {
    const stats = this.getClusterStats();
    const actions: string[] = [];
    
    if (stats.ramPercentage > 80) {
      actions.push('RAM acima de 80% - migrar bots para node com mais espaço');
    }
    
    if (stats.onlineNodes < stats.totalNodes / 2) {
      actions.push('Menos da metade dos nós online - verificar conectividade');
    }
    
    const online = this.getOnlineNodes();
    const avgCpu = online.reduce((sum, n) => sum + n.resources.cpu, 0) / online.length;
    
    if (avgCpu > 70) {
      actions.push('CPU média alta - distribuir carga entre nós');
    }
    
    return {
      canOptimize: actions.length > 0,
      actions
    };
  }
}
