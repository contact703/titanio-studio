import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface QuickUser {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  role: 'admin' | 'user';
  color: string;
  machineId?: string;
  lastActive?: string;
}

/**
 * QuickAuth - Sistema de identificação rápida sem senha
 * 
 * Para times pequenos que confiam entre si.
 * Apenas seleciona quem está usando, sem senha necessária.
 */
export class QuickAuth {
  private users: Map<string, QuickUser> = new Map();
  private currentUser: QuickUser | null = null;
  private dataDir: string;
  private machineId: string;

  constructor(basePath: string = process.cwd()) {
    this.dataDir = path.join(basePath, '.data', 'quickauth');
    this.machineId = this.getMachineId();
    this.initializeUsers();
    this.loadCurrentUser();
  }

  /**
   * Inicializa os 3 usuários fixos
   */
  private initializeUsers(): void {
    const defaultUsers: QuickUser[] = [
      {
        id: 'user-zica',
        name: 'zica',
        displayName: 'Zica',
        avatar: '👑',
        role: 'admin',
        color: '#FF6B6B'
      },
      {
        id: 'user-tiago',
        name: 'tiago',
        displayName: 'Tiago',
        avatar: '👨‍💻',
        role: 'user',
        color: '#4ECDC4'
      },
      {
        id: 'user-helber',
        name: 'helber',
        displayName: 'Helber',
        avatar: '🚀',
        role: 'user',
        color: '#45B7D1'
      }
    ];

    for (const user of defaultUsers) {
      this.users.set(user.id, user);
    }

    // Tenta identificar automaticamente pela máquina
    this.autoIdentify();
  }

  /**
   * Obtém ID único da máquina
   */
  private getMachineId(): string {
    const configPath = path.join(process.cwd(), '.sync', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return config.machineId || this.generateMachineId();
    }
    return this.generateMachineId();
  }

  /**
   * Gera ID de máquina
   */
  private generateMachineId(): string {
    return `machine-${os.hostname()}-${Date.now()}`;
  }

  /**
   * Tenta identificar usuário automaticamente
   */
  private autoIdentify(): void {
    // Mapeamento de máquina para usuário
    const machineMap: Record<string, string> = this.loadMachineMap();
    
    if (machineMap[this.machineId]) {
      const userId = machineMap[this.machineId];
      const user = this.users.get(userId);
      if (user) {
        this.currentUser = user;
        this.updateLastActive(user.id);
      }
    }
  }

  /**
   * Carrega mapeamento máquina → usuário
   */
  private loadMachineMap(): Record<string, string> {
    const mapPath = path.join(this.dataDir, 'machine-map.json');
    if (fs.existsSync(mapPath)) {
      return JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
    }
    return {};
  }

  /**
   * Salva mapeamento máquina → usuário
   */
  private saveMachineMap(map: Record<string, string>): void {
    fs.mkdirSync(this.dataDir, { recursive: true });
    const mapPath = path.join(this.dataDir, 'machine-map.json');
    fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  }

  /**
   * Carrega usuário atual
   */
  private loadCurrentUser(): void {
    const sessionPath = path.join(this.dataDir, 'current-session.json');
    if (fs.existsSync(sessionPath)) {
      const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
      if (session.userId) {
        this.currentUser = this.users.get(session.userId) || null;
      }
    }
  }

  /**
   * Salva sessão atual
   */
  private saveSession(userId: string): void {
    fs.mkdirSync(this.dataDir, { recursive: true });
    const sessionPath = path.join(this.dataDir, 'current-session.json');
    fs.writeFileSync(sessionPath, JSON.stringify({
      userId,
      machineId: this.machineId,
      startedAt: new Date().toISOString()
    }, null, 2));
  }

  /**
   * Lista todos os usuários disponíveis
   */
  getAvailableUsers(): QuickUser[] {
    return Array.from(this.users.values()).map(user => ({
      ...user,
      isCurrent: user.id === this.currentUser?.id
    }));
  }

  /**
   * Seleciona usuário (sem senha!)
   */
  selectUser(userId: string, rememberMachine: boolean = true): QuickUser | null {
    const user = this.users.get(userId);
    if (!user) return null;

    this.currentUser = user;
    this.updateLastActive(userId);
    this.saveSession(userId);

    // Lembra esta máquina para este usuário
    if (rememberMachine) {
      const machineMap = this.loadMachineMap();
      machineMap[this.machineId] = userId;
      this.saveMachineMap(machineMap);
    }

    console.log(`👤 Usuário selecionado: ${user.displayName} ${user.avatar}`);
    return user;
  }

  /**
   * Obtém usuário atual
   */
  getCurrentUser(): QuickUser | null {
    return this.currentUser;
  }

  /**
   * Verifica se tem usuário selecionado
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Faz logout (limpa sessão)
   */
  logout(): void {
    this.currentUser = null;
    const sessionPath = path.join(this.dataDir, 'current-session.json');
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
    }
  }

  /**
   * Troca de usuário
   */
  switchUser(userId: string): QuickUser | null {
    this.logout();
    return this.selectUser(userId);
  }

  /**
   * Atualiza última atividade
   */
  private updateLastActive(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.lastActive = new Date().toISOString();
    }
  }

  /**
   * Verifica se é admin
   */
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  /**
   * Obtém estatísticas
   */
  getStats() {
    return {
      totalUsers: this.users.size,
      currentUser: this.currentUser?.displayName || null,
      isAuthenticated: this.isAuthenticated(),
      machineId: this.machineId,
      machineMapped: !!this.loadMachineMap()[this.machineId]
    };
  }

  /**
   * Reseta mapeamento de máquina (útil para trocar quem usa a máquina)
   */
  resetMachineMapping(): void {
    const machineMap = this.loadMachineMap();
    delete machineMap[this.machineId];
    this.saveMachineMap(machineMap);
    this.logout();
  }

  /**
   * API: Middleware para Express
   */
  middleware() {
    return (req: any, res: any, next: any) => {
      req.quickAuth = this;
      req.currentUser = this.currentUser;
      req.isAdmin = this.isAdmin();
      next();
    };
  }
}
