/**
 * KnowledgeSync - Sistema de sincronização de conhecimento entre máquinas
 * 
 * Permite que o Squad compartilhe conhecimento entre diferentes instalações
 * da Dashboard. Cada máquina mantém seu conhecimento local sincronizado
 * com um hub central (Git ou servidor).
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

export interface KnowledgeNode {
  id: string;
  machineId: string;
  machineName: string;
  specialistId: string;
  type: 'memory' | 'task' | 'skill';
  content: string;
  hash: string;
  timestamp: string;
  version: number;
}

export interface SyncConfig {
  version: string;
  machineId: string;
  machineName: string;
  syncEnabled: boolean;
  syncInterval: number; // seconds
  knowledgeHub: 'git' | 's3' | 'custom';
  hubUrl?: string;
  lastSync: string | null;
}

export class KnowledgeSync {
  private config: SyncConfig;
  private syncDir: string;
  private isRunning = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(private dashboardPath: string) {
    this.syncDir = path.join(dashboardPath, '.sync');
    this.config = this.loadConfig();
  }

  /**
   * Carrega configuração de sync
   */
  private loadConfig(): SyncConfig {
    const configPath = path.join(this.syncDir, 'config.json');
    
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    // Config padrão
    return {
      version: '1.0.0',
      machineId: crypto.randomUUID(),
      machineName: require('os').hostname(),
      syncEnabled: true,
      syncInterval: 300, // 5 minutos
      knowledgeHub: 'git',
      lastSync: null,
    };
  }

  /**
   * Salva configuração
   */
  private saveConfig() {
    const configPath = path.join(this.syncDir, 'config.json');
    fs.mkdirSync(this.syncDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Inicia sync automático
   */
  start() {
    if (this.isRunning || !this.config.syncEnabled) return;

    this.isRunning = true;
    console.log('🔄 Knowledge Sync iniciado');
    console.log(`   Intervalo: ${this.config.syncInterval}s`);
    console.log(`   Hub: ${this.config.knowledgeHub}`);

    // Sync inicial
    this.sync();

    // Sync periódico
    this.syncInterval = setInterval(() => {
      this.sync();
    }, this.config.syncInterval * 1000);
  }

  /**
   * Para sync automático
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Knowledge Sync parado');
  }

  /**
   * Executa sincronização
   */
  async sync(): Promise<{ pushed: number; pulled: number }> {
    if (!this.config.syncEnabled) {
      return { pushed: 0, pulled: 0 };
    }

    console.log('🔄 Sincronizando conhecimento...');

    try {
      // 1. Coletar conhecimento local
      const localKnowledge = await this.collectLocalKnowledge();
      
      // 2. Push para hub
      const pushed = await this.pushToHub(localKnowledge);
      
      // 3. Pull do hub
      const pulled = await this.pullFromHub();
      
      // 4. Atualizar timestamp
      this.config.lastSync = new Date().toISOString();
      this.saveConfig();

      console.log(`✅ Sync completo: ${pushed} enviados, ${pulled} recebidos`);
      
      return { pushed, pulled };
    } catch (error) {
      console.error('❌ Erro no sync:', error);
      return { pushed: 0, pulled: 0 };
    }
  }

  /**
   * Coleta todo conhecimento local
   */
  private async collectLocalKnowledge(): Promise<KnowledgeNode[]> {
    const nodes: KnowledgeNode[] = [];
    const squadDir = path.join(this.dashboardPath, 'squad');

    if (!fs.existsSync(squadDir)) return nodes;

    const specialists = fs.readdirSync(squadDir);

    for (const specialistId of specialists) {
      const specialistPath = path.join(squadDir, specialistId);
      
      if (!fs.statSync(specialistPath).isDirectory()) continue;

      // Ler memórias
      const memoryPath = path.join(specialistPath, 'memory', 'README.md');
      if (fs.existsSync(memoryPath)) {
        const content = fs.readFileSync(memoryPath, 'utf-8');
        nodes.push({
          id: `${this.config.machineId}-${specialistId}-memory`,
          machineId: this.config.machineId,
          machineName: this.config.machineName,
          specialistId,
          type: 'memory',
          content,
          hash: this.computeHash(content),
          timestamp: new Date().toISOString(),
          version: 1,
        });
      }

      // Ler tarefas
      const tasksPath = path.join(specialistPath, 'tasks');
      if (fs.existsSync(tasksPath)) {
        const tasks = fs.readdirSync(tasksPath).filter(f => f.endsWith('.md'));
        for (const task of tasks) {
          const content = fs.readFileSync(path.join(tasksPath, task), 'utf-8');
          nodes.push({
            id: `${this.config.machineId}-${specialistId}-task-${task}`,
            machineId: this.config.machineId,
            machineName: this.config.machineName,
            specialistId,
            type: 'task',
            content,
            hash: this.computeHash(content),
            timestamp: new Date().toISOString(),
            version: 1,
          });
        }
      }
    }

    return nodes;
  }

  /**
   * Envia conhecimento para hub
   */
  private async pushToHub(nodes: KnowledgeNode[]): Promise<number> {
    if (this.config.knowledgeHub === 'git') {
      return this.pushToGitHub(nodes);
    }
    // Outros hubs (S3, custom) podem ser implementados
    return 0;
  }

  /**
   * Push para repositório Git
   */
  private async pushToGitHub(nodes: KnowledgeNode[]): Promise<number> {
    const hubDir = path.join(this.syncDir, 'hub');
    
    // Criar estrutura de sync
    fs.mkdirSync(hubDir, { recursive: true });

    let pushed = 0;

    for (const node of nodes) {
      const nodePath = path.join(
        hubDir,
        'knowledge',
        node.specialistId,
        `${node.type}.json`
      );

      fs.mkdirSync(path.dirname(nodePath), { recursive: true });

      // Verificar se mudou
      let shouldWrite = true;
      if (fs.existsSync(nodePath)) {
        const existing = JSON.parse(fs.readFileSync(nodePath, 'utf-8'));
        if (existing.hash === node.hash) {
          shouldWrite = false;
        }
      }

      if (shouldWrite) {
        fs.writeFileSync(nodePath, JSON.stringify(node, null, 2));
        pushed++;
      }
    }

    return pushed;
  }

  /**
   * Recebe conhecimento do hub
   */
  private async pullFromHub(): Promise<number> {
    const hubDir = path.join(this.syncDir, 'hub', 'knowledge');
    
    if (!fs.existsSync(hubDir)) return 0;

    let pulled = 0;
    const specialists = fs.readdirSync(hubDir);

    for (const specialistId of specialists) {
      const specialistHubDir = path.join(hubDir, specialistId);
      if (!fs.statSync(specialistHubDir).isDirectory()) continue;

      // Pular conhecimento da própria máquina
      const files = fs.readdirSync(specialistHubDir);
      
      for (const file of files) {
        const nodePath = path.join(specialistHubDir, file);
        const node: KnowledgeNode = JSON.parse(fs.readFileSync(nodePath, 'utf-8'));

        // Pular se for da mesma máquina
        if (node.machineId === this.config.machineId) continue;

        // Aplicar conhecimento localmente
        const applied = await this.applyKnowledge(node);
        if (applied) pulled++;
      }
    }

    return pulled;
  }

  /**
   * Aplica conhecimento recebido localmente
   */
  private async applyKnowledge(node: KnowledgeNode): Promise<boolean> {
    const specialistPath = path.join(
      this.dashboardPath,
      'squad',
      node.specialistId
    );

    // Criar estrutura se não existir
    fs.mkdirSync(path.join(specialistPath, 'memory'), { recursive: true });

    // Mesclar conhecimento
    const localMemoryPath = path.join(specialistPath, 'memory', 'README.md');
    
    if (node.type === 'memory') {
      if (fs.existsSync(localMemoryPath)) {
        const localContent = fs.readFileSync(localMemoryPath, 'utf-8');
        const merged = this.mergeKnowledge(localContent, node.content, node.machineName);
        fs.writeFileSync(localMemoryPath, merged);
      } else {
        // Adicionar header indicando origem
        const contentWithSource = `<!-- Conhecimento de: ${node.machineName} -->\n${node.content}`;
        fs.writeFileSync(localMemoryPath, contentWithSource);
      }
      return true;
    }

    return false;
  }

  /**
   * Mescla dois conhecimentos
   */
  private mergeKnowledge(local: string, remote: string, source: string): string {
    // Estratégia simples: adiciona seção do remoto se não existir
    if (local.includes(`<!-- Conhecimento de: ${source} -->`)) {
      return local; // Já foi mesclado
    }

    return `${local}\n\n---\n\n<!-- Conhecimento de: ${source} -->\n${remote}`;
  }

  /**
   * Computa hash de conteúdo
   */
  private computeHash(content: string): string {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Retorna status do sync
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      lastSync: this.config.lastSync,
    };
  }

  /**
   * Atualiza configuração
   */
  updateConfig(updates: Partial<SyncConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    
    // Reiniciar se necessário
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Retorna estatísticas
   */
  async getStats() {
    const local = await this.collectLocalKnowledge();
    
    return {
      localNodes: local.length,
      machineId: this.config.machineId,
      machineName: this.config.machineName,
      specialists: [...new Set(local.map(n => n.specialistId))],
    };
  }
}

// Singleton export
let instance: KnowledgeSync | null = null;

export function getKnowledgeSync(dashboardPath?: string): KnowledgeSync {
  if (!instance && dashboardPath) {
    instance = new KnowledgeSync(dashboardPath);
  }
  if (!instance) {
    throw new Error('KnowledgeSync not initialized');
  }
  return instance;
}
