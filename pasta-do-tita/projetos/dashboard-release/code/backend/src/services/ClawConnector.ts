/**
 * ClawConnector - Conecta a Dashboard ao OpenClaw local
 * 
 * Quando um colega instala a Dashboard no Mac Mini dele:
 * 1. Detecta automaticamente o OpenClaw rodando na máquina
 * 2. Faz varredura do workspace local
 * 3. Descobre projetos, bots, e configurações
 * 4. Popula a Dashboard com os dados DAQUELA máquina
 * 
 * Cada instalação é independente - mostra apenas os projetos do dono.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface ClawConfig {
  gatewayUrl: string;
  gatewayPort: number;
  workspacePath: string;
  userName: string;
  userId: string;
  hostname: string;
  isConnected: boolean;
}

export interface DiscoveredProject {
  id: string;
  name: string;
  path: string;
  description: string;
  hasGit: boolean;
  lastModified: string;
  files: number;
  language?: string;
}

export class ClawConnector {
  private config: ClawConfig | null = null;
  private projects: DiscoveredProject[] = [];

  /**
   * Auto-detecta o OpenClaw local e conecta
   */
  async autoConnect(): Promise<ClawConfig> {
    console.log('🔍 Procurando OpenClaw local...');

    // 1. Verificar se openclaw está instalado
    const clawInstalled = await this.isClawInstalled();
    if (!clawInstalled) {
      throw new Error('OpenClaw não encontrado. Instale em: https://github.com/openclaw/openclaw');
    }

    // 2. Detectar gateway URL e porta
    const gatewayUrl = await this.detectGateway();

    // 3. Encontrar workspace
    const workspacePath = await this.findWorkspace();

    // 4. Detectar usuário
    const userName = await this.detectUser();

    this.config = {
      gatewayUrl,
      gatewayPort: 3284, // porta padrão do OpenClaw gateway
      workspacePath,
      userName,
      userId: `user-${Date.now()}`,
      hostname: os.hostname(),
      isConnected: true,
    };

    console.log(`✅ Conectado ao OpenClaw de ${userName}`);
    console.log(`   Workspace: ${workspacePath}`);
    console.log(`   Gateway: ${gatewayUrl}`);

    return this.config;
  }

  /**
   * Verifica se OpenClaw está instalado
   */
  private async isClawInstalled(): Promise<boolean> {
    try {
      await execAsync('which openclaw');
      return true;
    } catch {
      // Tentar caminhos comuns
      const commonPaths = [
        path.join(os.homedir(), '.openclaw'),
        '/usr/local/bin/openclaw',
        path.join(os.homedir(), '.local', 'bin', 'openclaw'),
      ];
      
      for (const p of commonPaths) {
        if (fs.existsSync(p)) return true;
      }
      return false;
    }
  }

  /**
   * Detecta o gateway do OpenClaw
   */
  private async detectGateway(): Promise<string> {
    try {
      // Verificar se gateway está rodando
      const { stdout } = await execAsync('openclaw gateway status 2>/dev/null || echo "offline"');
      
      if (stdout.includes('offline')) {
        console.log('⚠️ Gateway offline, tentando iniciar...');
        await execAsync('openclaw gateway start 2>/dev/null');
      }

      return 'http://localhost:3284';
    } catch {
      return 'http://localhost:3284';
    }
  }

  /**
   * Encontra o workspace do OpenClaw
   */
  private async findWorkspace(): Promise<string> {
    // Caminhos comuns do workspace
    const possiblePaths = [
      path.join(os.homedir(), '.openclaw', 'workspace'),
      // Volumes externos (Mac Mini)
      ...this.findExternalVolumes(),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        // Verificar se tem AGENTS.md ou SOUL.md (indicadores de workspace OpenClaw)
        const hasAgents = fs.existsSync(path.join(p, 'AGENTS.md'));
        const hasSoul = fs.existsSync(path.join(p, 'SOUL.md'));
        
        if (hasAgents || hasSoul) {
          return p;
        }
      }
    }

    // Fallback: usar home
    return path.join(os.homedir(), '.openclaw', 'workspace');
  }

  /**
   * Procura volumes externos (para Mac Minis com HD externo)
   */
  private findExternalVolumes(): string[] {
    const volumesDir = '/Volumes';
    const paths: string[] = [];
    
    try {
      const volumes = fs.readdirSync(volumesDir);
      for (const vol of volumes) {
        // Procurar workspace do OpenClaw em cada volume
        const possiblePaths = [
          path.join(volumesDir, vol, '.openclaw', 'workspace'),
          // Padrão: /Volumes/NOME/HOSTNAME/.openclaw/workspace
        ];
        
        // Buscar recursivamente
        const volPath = path.join(volumesDir, vol);
        try {
          const subDirs = fs.readdirSync(volPath);
          for (const sub of subDirs) {
            const subWorkspace = path.join(volPath, sub, '.openclaw', 'workspace');
            if (fs.existsSync(subWorkspace)) {
              possiblePaths.push(subWorkspace);
            }
          }
        } catch {
          // Ignora volumes que não podem ser lidos
        }
        
        paths.push(...possiblePaths);
      }
    } catch {
      // /Volumes não existe (Linux?)
    }
    
    return paths;
  }

  /**
   * Detecta o usuário do OpenClaw
   */
  private async detectUser(): Promise<string> {
    // Tentar ler USER.md
    if (this.config?.workspacePath) {
      const userMd = path.join(this.config.workspacePath, 'USER.md');
      if (fs.existsSync(userMd)) {
        const content = fs.readFileSync(userMd, 'utf-8');
        const nameMatch = content.match(/\*\*Name:\*\*\s*(.+)/i) || content.match(/\*\*Nome:\*\*\s*(.+)/i);
        if (nameMatch) return nameMatch[1].trim();
      }
    }

    // Fallback: nome do sistema
    return os.userInfo().username;
  }

  /**
   * Faz varredura do workspace e descobre projetos
   */
  async discoverProjects(): Promise<DiscoveredProject[]> {
    if (!this.config) {
      await this.autoConnect();
    }

    const workspace = this.config!.workspacePath;
    console.log(`🔍 Varrendo workspace: ${workspace}`);

    this.projects = [];

    // Estratégia 1: Procurar pastas com package.json, Cargo.toml, etc
    await this.scanForProjects(workspace, 0);

    // Estratégia 2: Procurar repos Git
    await this.scanForGitRepos(workspace);

    // Estratégia 3: Ler contexto-ativo.md se existir
    await this.readActiveContext(workspace);

    // Remover duplicatas
    const seen = new Set<string>();
    this.projects = this.projects.filter(p => {
      if (seen.has(p.path)) return false;
      seen.add(p.path);
      return true;
    });

    console.log(`✅ ${this.projects.length} projetos descobertos`);
    return this.projects;
  }

  /**
   * Escaneia diretórios por marcadores de projeto
   */
  private async scanForProjects(dir: string, depth: number): Promise<void> {
    if (depth > 4) return; // Limitar profundidade

    const projectMarkers = [
      'package.json',     // Node.js
      'Cargo.toml',       // Rust
      'pyproject.toml',   // Python
      'setup.py',         // Python
      'go.mod',           // Go
      'pom.xml',          // Java
      'Gemfile',          // Ruby
      'composer.json',    // PHP
      'Makefile',         // C/C++
      'CMakeLists.txt',   // C/C++
      'pubspec.yaml',     // Flutter/Dart
    ];

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'vendor') continue;

        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Verificar marcadores
          for (const marker of projectMarkers) {
            if (fs.existsSync(path.join(fullPath, marker))) {
              const project = await this.analyzeProject(fullPath, marker);
              if (project) this.projects.push(project);
              break; // Não precisa verificar outros marcadores
            }
          }

          // Continuar recursão
          await this.scanForProjects(fullPath, depth + 1);
        }
      }
    } catch {
      // Diretório inacessível
    }
  }

  /**
   * Procura repos Git no workspace
   */
  private async scanForGitRepos(workspace: string): Promise<void> {
    try {
      const { stdout } = await execAsync(
        `find "${workspace}" -name ".git" -type d -maxdepth 5 2>/dev/null | head -50`
      );

      const gitDirs = stdout.trim().split('\n').filter(Boolean);

      for (const gitDir of gitDirs) {
        const projectDir = path.dirname(gitDir);
        
        // Verificar se já foi descoberto
        if (this.projects.some(p => p.path === projectDir)) continue;

        const project = await this.analyzeProject(projectDir, '.git');
        if (project) this.projects.push(project);
      }
    } catch {
      // find falhou
    }
  }

  /**
   * Lê contexto-ativo.md para projetos extras
   */
  private async readActiveContext(workspace: string): Promise<void> {
    const contextFiles = [
      path.join(workspace, 'contexto-ativo.md'),
      path.join(workspace, 'pasta-do-tita', 'contexto-ativo.md'),
      path.join(workspace, 'MEMORY.md'),
    ];

    for (const file of contextFiles) {
      try {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf-8');
          // Extrair menções a projetos
          const projectMentions = content.match(/\*\*Projetos?\s*(?:ativos?|atuais?):\*\*([^#]*)/i);
          if (projectMentions) {
            console.log(`📋 Projetos encontrados em ${path.basename(file)}`);
          }
        }
      } catch {
        // Arquivo não acessível
      }
    }
  }

  /**
   * Analisa um diretório de projeto
   */
  private async analyzeProject(projectDir: string, marker: string): Promise<DiscoveredProject | null> {
    try {
      const name = path.basename(projectDir);
      const hasGit = fs.existsSync(path.join(projectDir, '.git'));
      
      // Contar arquivos
      let fileCount = 0;
      try {
        const { stdout } = await execAsync(
          `find "${projectDir}" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l`
        );
        fileCount = parseInt(stdout.trim()) || 0;
      } catch {
        fileCount = 0;
      }

      // Detectar linguagem principal
      const language = this.detectLanguage(marker);

      // Ler descrição do package.json ou README
      let description = '';
      const pkgPath = path.join(projectDir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
          description = pkg.description || '';
        } catch {}
      }

      if (!description) {
        const readmePath = path.join(projectDir, 'README.md');
        if (fs.existsSync(readmePath)) {
          const readme = fs.readFileSync(readmePath, 'utf-8');
          const firstLine = readme.split('\n').find(l => l.trim() && !l.startsWith('#'));
          description = firstLine?.trim().substring(0, 200) || '';
        }
      }

      // Última modificação
      const stats = fs.statSync(projectDir);

      return {
        id: `proj-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        name,
        path: projectDir,
        description: description || `Projeto ${language || ''}`.trim(),
        hasGit,
        lastModified: stats.mtime.toISOString(),
        files: fileCount,
        language,
      };
    } catch {
      return null;
    }
  }

  /**
   * Detecta linguagem pelo marcador
   */
  private detectLanguage(marker: string): string {
    const langMap: Record<string, string> = {
      'package.json': 'JavaScript/TypeScript',
      'Cargo.toml': 'Rust',
      'pyproject.toml': 'Python',
      'setup.py': 'Python',
      'go.mod': 'Go',
      'pom.xml': 'Java',
      'Gemfile': 'Ruby',
      'composer.json': 'PHP',
      'Makefile': 'C/C++',
      'CMakeLists.txt': 'C/C++',
      'pubspec.yaml': 'Dart/Flutter',
      '.git': 'Unknown',
    };
    return langMap[marker] || 'Unknown';
  }

  /**
   * Retorna configuração atual
   */
  getConfig(): ClawConfig | null {
    return this.config;
  }

  /**
   * Retorna projetos descobertos
   */
  getProjects(): DiscoveredProject[] {
    return this.projects;
  }

  /**
   * Status da conexão
   */
  getStatus() {
    return {
      connected: this.config?.isConnected || false,
      user: this.config?.userName || 'Desconhecido',
      hostname: this.config?.hostname || os.hostname(),
      workspace: this.config?.workspacePath || 'N/A',
      projectCount: this.projects.length,
      gateway: this.config?.gatewayUrl || 'N/A',
    };
  }
}
