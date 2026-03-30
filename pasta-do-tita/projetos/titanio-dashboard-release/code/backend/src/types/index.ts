export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;           // Dono do projeto
  members?: string[];        // Membros (inclui dono)
  client?: string;
  deadline?: string;
  budget?: number;
  tags?: string[];
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  tasksCompleted: number;
  tasksTotal: number;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'paused' | 'stopped';
  projectId: string;
  type: 'whatsapp' | 'email' | 'discord' | 'telegram' | 'custom';
  createdAt: string;
  stats: {
    messagesProcessed: number;
    uptime: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}
