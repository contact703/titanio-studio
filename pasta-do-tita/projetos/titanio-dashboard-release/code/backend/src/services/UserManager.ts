import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: string;
  lastLogin?: string;
  settings: UserSettings;
  stats: UserStats;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
  timezone: string;
}

export interface UserStats {
  projectsCreated: number;
  tasksCompleted: number;
  botsCreated: number;
  loginCount: number;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  deviceInfo?: string;
}

/**
 * UserManager - Sistema de gerenciamento de usuários multi-tenant
 * 
 * Funcionalidades:
 * - Criação e autenticação de usuários
 * - Isolamento de dados por usuário
 * - Perfis e configurações individuais
 * - Controle de acesso (RBAC)
 */
export class UserManager {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private dataDir: string;

  constructor(basePath: string = process.cwd()) {
    this.dataDir = path.join(basePath, '.data', 'users');
    this.loadUsers();
  }

  /**
   * Carrega usuários do disco
   */
  private loadUsers(): void {
    fs.mkdirSync(this.dataDir, { recursive: true });
    
    const usersFile = path.join(this.dataDir, 'users.json');
    if (fs.existsSync(usersFile)) {
      const data = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
      for (const user of data.users || []) {
        this.users.set(user.id, user);
      }
    }
    
    // Cria usuário admin padrão se não existir
    if (!this.getUserByUsername('admin')) {
      this.createUser({
        name: 'Administrador',
        email: 'admin@titanio.local',
        username: 'admin',
        password: 'admin123', // Deve ser alterado!
        role: 'admin'
      });
    }
  }

  /**
   * Salva usuários no disco
   */
  private saveUsers(): void {
    const usersFile = path.join(this.dataDir, 'users.json');
    fs.writeFileSync(usersFile, JSON.stringify({
      users: Array.from(this.users.values()),
      updatedAt: new Date().toISOString()
    }, null, 2));
  }

  /**
   * Cria novo usuário
   */
  createUser(userData: {
    name: string;
    email: string;
    username: string;
    password: string;
    role?: 'admin' | 'user' | 'guest';
    avatar?: string;
  }): User {
    // Verifica se username já existe
    if (this.getUserByUsername(userData.username)) {
      throw new Error('Username já existe');
    }

    // Verifica se email já existe
    if (this.getUserByEmail(userData.email)) {
      throw new Error('Email já existe');
    }

    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: userData.name,
      email: userData.email,
      username: userData.username,
      passwordHash: this.hashPassword(userData.password),
      avatar: userData.avatar,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      settings: {
        theme: 'dark',
        notifications: true,
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo'
      },
      stats: {
        projectsCreated: 0,
        tasksCompleted: 0,
        botsCreated: 0,
        loginCount: 0
      }
    };

    this.users.set(user.id, user);
    this.saveUsers();

    // Cria diretório do usuário
    this.createUserDirectory(user.id);

    console.log(`👤 Usuário criado: ${user.name} (${user.username})`);
    return user;
  }

  /**
   * Autentica usuário
   */
  authenticate(username: string, password: string): { user: User; session: Session } | null {
    const user = this.getUserByUsername(username);
    
    if (!user) return null;
    
    if (!this.verifyPassword(password, user.passwordHash)) {
      return null;
    }

    // Atualiza estatísticas
    user.stats.loginCount++;
    user.lastLogin = new Date().toISOString();
    this.saveUsers();

    // Cria sessão
    const session = this.createSession(user.id);

    return { user, session };
  }

  /**
   * Cria sessão de usuário
   */
  private createSession(userId: string): Session {
    const session: Session = {
      id: `session-${Date.now()}`,
      userId,
      token: this.generateToken(),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
    };

    this.sessions.set(session.token, session);
    return session;
  }

  /**
   * Valida token de sessão
   */
  validateSession(token: string): User | null {
    const session = this.sessions.get(token);
    
    if (!session) return null;
    
    // Verifica expiração
    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(token);
      return null;
    }

    return this.users.get(session.userId) || null;
  }

  /**
   * Logout
   */
  logout(token: string): boolean {
    return this.sessions.delete(token);
  }

  /**
   * Obtém usuário por ID
   */
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * Obtém usuário por username
   */
  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  /**
   * Obtém usuário por email
   */
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  /**
   * Lista todos os usuários
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Atualiza usuário
   */
  updateUser(userId: string, updates: Partial<User>): User | null {
    const user = this.users.get(userId);
    if (!user) return null;

    Object.assign(user, updates);
    this.saveUsers();
    
    return user;
  }

  /**
   * Atualiza configurações do usuário
   */
  updateUserSettings(userId: string, settings: Partial<UserSettings>): User | null {
    const user = this.users.get(userId);
    if (!user) return null;

    user.settings = { ...user.settings, ...settings };
    this.saveUsers();
    
    return user;
  }

  /**
   * Atualiza estatísticas
   */
  updateUserStats(userId: string, stats: Partial<UserStats>): void {
    const user = this.users.get(userId);
    if (!user) return;

    user.stats = { ...user.stats, ...stats };
    this.saveUsers();
  }

  /**
   * Deleta usuário
   */
  deleteUser(userId: string): boolean {
    const deleted = this.users.delete(userId);
    if (deleted) {
      this.saveUsers();
      // Remove diretório do usuário
      this.deleteUserDirectory(userId);
    }
    return deleted;
  }

  /**
   * Cria diretório do usuário
   */
  private createUserDirectory(userId: string): void {
    const userDir = path.join(this.dataDir, 'data', userId);
    fs.mkdirSync(userDir, { recursive: true });
    
    // Cria subdiretórios
    fs.mkdirSync(path.join(userDir, 'projects'), { recursive: true });
    fs.mkdirSync(path.join(userDir, 'bots'), { recursive: true });
    fs.mkdirSync(path.join(userDir, 'files'), { recursive: true });
  }

  /**
   * Remove diretório do usuário
   */
  private deleteUserDirectory(userId: string): void {
    const userDir = path.join(this.dataDir, 'data', userId);
    if (fs.existsSync(userDir)) {
      fs.rmSync(userDir, { recursive: true });
    }
  }

  /**
   * Obtém diretório de dados do usuário
   */
  getUserDataDirectory(userId: string): string {
    return path.join(this.dataDir, 'data', userId);
  }

  /**
   * Verifica se usuário é admin
   */
  isAdmin(userId: string): boolean {
    const user = this.users.get(userId);
    return user?.role === 'admin';
  }

  /**
   * Hash de senha
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Verifica senha
   */
  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  /**
   * Gera token aleatório
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Estatísticas do sistema
   */
  getStats() {
    return {
      totalUsers: this.users.size,
      activeSessions: this.sessions.size,
      admins: Array.from(this.users.values()).filter(u => u.role === 'admin').length,
      regularUsers: Array.from(this.users.values()).filter(u => u.role === 'user').length
    };
  }
}
