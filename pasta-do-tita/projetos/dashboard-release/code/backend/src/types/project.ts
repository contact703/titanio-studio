export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  status: 'active' | 'archived' | 'completed';
  bots: string[];
  createdAt: string;
  stats: {
    totalBots: number;
    activeBots: number;
    lastActivity: string;
  };
}
