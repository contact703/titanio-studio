import { Bot } from '../types/bot';
import * as fs from 'fs';
import * as path from 'path';

export interface BotInstance {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'idle' | 'running' | 'error' | 'paused';
  ownerId?: string; // null = bot global (compartilhado)
  projectId?: string;
  isGlobal: boolean;
  createdAt: string;
  lastRun?: string;
  runCount: number;
  errorCount: number;
  config: Record<string, any>;
}

/**
 * BotManager - Gerencia bots globais e de usuário
 * 
 * Bots Globais:
 * - Compartilhados entre todos os usuários
 * - Ex: ErrorMonitor, RateLimitResolver, etc
 * - Só admin pode criar/editar
 * 
 * Bots de Usuário:
 * - Pertencem a um usuário específico
 * - Ex: Bot de email do Eduardo, Bot de scraping do Tiago
 * - Cada usuário vê apenas seus bots
 */
export class BotManager {
  private bots: Map<string, BotInstance> = new Map();
  private dataDir: string;

  constructor(basePath: string = process.cwd()) {
    this.dataDir = path.join(basePath, '.data', 'bots');
    this.loadBots();
    this.initializeGlobalBots();
  }

  /**
   * Carrega bots do disco
   */
  private loadBots(): void {
    fs.mkdirSync(this.dataDir, { recursive: true });
    
    const botsFile = path.join(this.dataDir, 'bots.json');
    if (fs.existsSync(botsFile)) {
      const data = JSON.parse(fs.readFileSync(botsFile, 'utf-8'));
      for (const bot of data.bots || []) {
        this.bots.set(bot.id, bot);
      }
    }
  }

  /**
   * Salva bots no disco
   */
  private saveBots(): void {
    const botsFile = path.join(this.dataDir, 'bots.json');
    fs.writeFileSync(botsFile, JSON.stringify({
      bots: Array.from(this.bots.values()),
      updatedAt: new Date().toISOString()
    }, null, 2));
  }

  /**
   * Inicializa bots globais do sistema
   */
  private initializeGlobalBots(): void {
    const globalBots = [
      {
        id: 'bot-error-monitor',
        name: 'Error Monitor',
        description: 'Monitora logs e detecta erros automaticamente',
        type: 'error-monitor',
        isGlobal: true
      },
      {
        id: 'bot-rate-limit-resolver',
        name: 'Rate Limit Resolver',
        description: 'Resolve erros de rate limit da API',
        type: 'rate-limit-resolver',
        isGlobal: true
      },
      {
        id: 'bot-timeout-resolver',
        name: 'Timeout Resolver',
        description: 'Resolve timeouts de requisições',
        type: 'timeout-resolver',
        isGlobal: true
      },
      {
        id: 'bot-media-processor',
        name: 'Media Processor',
        description: 'Processa vídeos e áudios automaticamente',
        type: 'media-processor',
        isGlobal: true
      },
      {
        id: 'bot-knowledge-sync',
        name: 'Knowledge Sync',
        description: 'Sincroniza conhecimento entre máquinas',
        type: 'knowledge-sync',
        isGlobal: true
      },
      {
        id: 'bot-claw-cluster',
        name: 'Claw Cluster Manager',
        description: 'Gerencia cluster de OpenClaw',
        type: 'claw-cluster',
        isGlobal: true
      }
    ];

    for (const botData of globalBots) {
      if (!this.bots.has(botData.id)) {
        const bot: BotInstance = {
          id: botData.id,
          name: botData.name,
          description: botData.description,
          type: botData.type,
          status: 'running',
          isGlobal: true,
          createdAt: new Date().toISOString(),
          runCount: 0,
          errorCount: 0,
          config: {}
        };
        this.bots.set(bot.id, bot);
      }
    }

    this.saveBots();
  }

  /**
   * Cria novo bot
   */
  createBot(
    name: string,
    description: string,
    type: string,
    ownerId: string,
    isGlobal: boolean = false,
    projectId?: string,
    config?: Record<string, any>
  ): BotInstance {
    // Só admin pode criar bots globais
    // (Na prática, verificaríamos se o usuário é admin)
    
    const bot: BotInstance = {
      id: `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      type,
      status: 'idle',
      ownerId: isGlobal ? undefined : ownerId,
      projectId,
      isGlobal,
      createdAt: new Date().toISOString(),
      runCount: 0,
      errorCount: 0,
      config: config || {}
    };

    this.bots.set(bot.id, bot);
    this.saveBots();

    console.log(`🤖 Bot criado: ${name} (${isGlobal ? 'Global' : 'User'})`);
    return bot;
  }

  /**
   * Obtém bot por ID
   */
  getBot(id: string, userId?: string, isAdmin?: boolean): BotInstance | undefined {
    const bot = this.bots.get(id);
    if (!bot) return undefined;

    // Bot global: todos podem ver
    if (bot.isGlobal) return bot;

    // Bot de usuário: só dono ou admin pode ver
    if (isAdmin || bot.ownerId === userId) return bot;

    return undefined;
  }

  /**
   * Lista bots de um usuário (inclui globais)
   */
  getUserBots(userId: string, isAdmin?: boolean): BotInstance[] {
    const allBots = Array.from(this.bots.values());
    
    // Admin vê todos
    if (isAdmin) return allBots;
    
    // Usuário vê:
    // - Todos os bots globais
    // - Seus próprios bots
    return allBots.filter(bot => 
      bot.isGlobal || bot.ownerId === userId
    );
  }

  /**
   * Lista apenas bots globais
   */
  getGlobalBots(): BotInstance[] {
    return Array.from(this.bots.values()).filter(bot => bot.isGlobal);
  }

  /**
   * Lista apenas bots de um usuário específico (exclui globais)
   */
  getBotsByOwner(ownerId: string): BotInstance[] {
    return Array.from(this.bots.values()).filter(bot => 
      !bot.isGlobal && bot.ownerId === ownerId
    );
  }

  /**
   * Lista bots por projeto
   */
  getBotsByProject(projectId: string, userId?: string, isAdmin?: boolean): BotInstance[] {
    return Array.from(this.bots.values()).filter(bot => {
      if (bot.projectId !== projectId) return false;
      
      // Bot global: todos veem
      if (bot.isGlobal) return true;
      
      // Bot de usuário: só dono ou admin
      return isAdmin || bot.ownerId === userId;
    });
  }

  /**
   * Atualiza bot
   */
  updateBot(
    id: string,
    updates: Partial<BotInstance>,
    userId?: string,
    isAdmin?: boolean
  ): BotInstance | null {
    const bot = this.getBot(id, userId, isAdmin);
    if (!bot) return null;

    // Só admin pode editar bots globais
    if (bot.isGlobal && !isAdmin) return null;

    // Só dono ou admin pode editar bots de usuário
    if (!bot.isGlobal && !isAdmin && bot.ownerId !== userId) return null;

    Object.assign(bot, updates);
    this.saveBots();
    
    return bot;
  }

  /**
   * Inicia bot
   */
  startBot(id: string, userId?: string, isAdmin?: boolean): boolean {
    return this.updateBot(id, { status: 'running' }, userId, isAdmin) !== null;
  }

  /**
   * Pausa bot
   */
  pauseBot(id: string, userId?: string, isAdmin?: boolean): boolean {
    return this.updateBot(id, { status: 'paused' }, userId, isAdmin) !== null;
  }

  /**
   * Para bot
   */
  stopBot(id: string, userId?: string, isAdmin?: boolean): boolean {
    return this.updateBot(id, { status: 'idle' }, userId, isAdmin) !== null;
  }

  /**
   * Deleta bot
   */
  deleteBot(id: string, userId?: string, isAdmin?: boolean): boolean {
    const bot = this.getBot(id, userId, isAdmin);
    if (!bot) return false;

    // Não deleta bots globais
    if (bot.isGlobal) return false;

    // Só dono ou admin pode deletar
    if (!isAdmin && bot.ownerId !== userId) return false;

    const deleted = this.bots.delete(id);
    if (deleted) {
      this.saveBots();
    }
    return deleted;
  }

  /**
   * Estatísticas
   */
  getStatus(): { 
    total: number; 
    running: number; 
    idle: number; 
    error: number;
    global: number;
    user: number;
  } {
    const bots = Array.from(this.bots.values());
    return {
      total: bots.length,
      running: bots.filter(b => b.status === 'running').length,
      idle: bots.filter(b => b.status === 'idle').length,
      error: bots.filter(b => b.status === 'error').length,
      global: bots.filter(b => b.isGlobal).length,
      user: bots.filter(b => !b.isGlobal).length
    };
  }

  /**
   * Estatísticas por usuário
   */
  getUserStats(userId: string): { total: number; running: number; idle: number } {
    const bots = this.getBotsByOwner(userId);
    return {
      total: bots.length,
      running: bots.filter(b => b.status === 'running').length,
      idle: bots.filter(b => b.status === 'idle').length
    };
  }

  /**
   * Obtém todos os bots (apenas para admin)
   */
  getAllBots(): BotInstance[] {
    return Array.from(this.bots.values());
  }
}
