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
