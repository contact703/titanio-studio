export interface Specialist {
  id: string;
  name: string;
  avatar: string;
  role: string;
  skills: string[];
  status: 'available' | 'busy' | 'offline';
  description: string;
}

export interface Task {
  id: string;
  specialistId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskResult {
  success: boolean;
  specialist?: string;
  avatar?: string;
  message?: string;
  error?: string;
  data?: any;
}
