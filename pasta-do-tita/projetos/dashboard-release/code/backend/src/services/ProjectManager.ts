import { Project, Bot } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * ProjectManager - Gerencia projetos com isolamento por usuário
 * 
 * Cada usuário vê apenas seus próprios projetos
 * Admin pode ver todos os projetos
 */
export class ProjectManager {
  private projects: Map<string, Project> = new Map();
  private dataDir: string;

  constructor(basePath: string = process.cwd()) {
    this.dataDir = path.join(basePath, '.data', 'projects');
    this.loadProjects();
  }

  /**
   * Carrega projetos do disco
   */
  private loadProjects(): void {
    fs.mkdirSync(this.dataDir, { recursive: true });
    
    const projectsFile = path.join(this.dataDir, 'projects.json');
    if (fs.existsSync(projectsFile)) {
      const data = JSON.parse(fs.readFileSync(projectsFile, 'utf-8'));
      for (const project of data.projects || []) {
        this.projects.set(project.id, project);
      }
    }
  }

  /**
   * Salva projetos no disco
   */
  private saveProjects(): void {
    const projectsFile = path.join(this.dataDir, 'projects.json');
    fs.writeFileSync(projectsFile, JSON.stringify({
      projects: Array.from(this.projects.values()),
      updatedAt: new Date().toISOString()
    }, null, 2));
  }

  /**
   * Cria novo projeto (associado a um usuário)
   */
  createProject(
    name: string, 
    description: string, 
    ownerId: string,
    options?: {
      client?: string;
      deadline?: string;
      budget?: number;
      tags?: string[];
    }
  ): Project {
    const project: Project = {
      id: `project-${Date.now()}`,
      name,
      description,
      ownerId, // Usuário dono do projeto
      members: [ownerId], // Membros do projeto (começa com o dono)
      client: options?.client,
      deadline: options?.deadline,
      budget: options?.budget,
      tags: options?.tags || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasksCompleted: 0,
      tasksTotal: 0
    };

    this.projects.set(project.id, project);
    this.saveProjects();

    // Cria diretório do projeto
    const projectDir = path.join(this.dataDir, 'files', project.id);
    fs.mkdirSync(projectDir, { recursive: true });

    console.log(`📁 Projeto criado: ${name} (Owner: ${ownerId})`);
    return project;
  }

  /**
   * Obtém projeto por ID
   */
  getProject(id: string, userId?: string, isAdmin?: boolean): Project | undefined {
    const project = this.projects.get(id);
    
    if (!project) return undefined;
    
    // Se não especificou usuário, retorna (uso interno)
    if (!userId) return project;
    
    // Admin vê tudo
    if (isAdmin) return project;
    
    // Usuário comum só vê se for dono ou membro
    if (project.ownerId === userId || project.members?.includes(userId)) {
      return project;
    }
    
    return undefined;
  }

  /**
   * Lista projetos de um usuário
   */
  getUserProjects(userId: string, isAdmin?: boolean): Project[] {
    const allProjects = Array.from(this.projects.values());
    
    // Admin vê todos
    if (isAdmin) return allProjects;
    
    // Usuário vê apenas seus projetos (dono ou membro)
    return allProjects.filter(p => 
      p.ownerId === userId || p.members?.includes(userId)
    );
  }

  /**
   * Lista todos os projetos (apenas para admin)
   */
  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  /**
   * Atualiza projeto
   */
  updateProject(
    id: string, 
    updates: Partial<Project>, 
    userId?: string, 
    isAdmin?: boolean
  ): Project | null {
    const project = this.getProject(id, userId, isAdmin);
    if (!project) return null;

    Object.assign(project, updates, { updatedAt: new Date().toISOString() });
    this.saveProjects();
    
    return project;
  }

  /**
   * Deleta projeto
   */
  deleteProject(id: string, userId?: string, isAdmin?: boolean): boolean {
    const project = this.getProject(id, userId, isAdmin);
    if (!project) return false;

    // Só dono ou admin pode deletar
    if (!isAdmin && project.ownerId !== userId) return false;

    const deleted = this.projects.delete(id);
    if (deleted) {
      this.saveProjects();
    }
    return deleted;
  }

  /**
   * Adiciona membro ao projeto
   */
  addMember(projectId: string, userId: string, addedBy?: string, isAdmin?: boolean): boolean {
    const project = this.getProject(projectId, addedBy, isAdmin);
    if (!project) return false;

    // Só dono ou admin pode adicionar membros
    if (!isAdmin && project.ownerId !== addedBy) return false;

    if (!project.members) project.members = [];
    
    if (!project.members.includes(userId)) {
      project.members.push(userId);
      project.updatedAt = new Date().toISOString();
      this.saveProjects();
    }
    
    return true;
  }

  /**
   * Remove membro do projeto
   */
  removeMember(projectId: string, userId: string, removedBy?: string, isAdmin?: boolean): boolean {
    const project = this.getProject(projectId, removedBy, isAdmin);
    if (!project) return false;

    // Só dono ou admin pode remover membros
    if (!isAdmin && project.ownerId !== removedBy) return false;

    if (project.members) {
      project.members = project.members.filter(m => m !== userId);
      project.updatedAt = new Date().toISOString();
      this.saveProjects();
    }
    
    return true;
  }

  /**
   * Estatísticas
   */
  getStatus(): { total: number; active: number; completed: number } {
    const projects = Array.from(this.projects.values());
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length
    };
  }

  /**
   * Estatísticas por usuário
   */
  getUserStats(userId: string): { total: number; active: number; completed: number } {
    const projects = this.getUserProjects(userId);
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length
    };
  }
}
