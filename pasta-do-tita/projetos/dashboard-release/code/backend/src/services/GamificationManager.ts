export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalTasks: number;
  totalBotsCreated: number;
  totalProjectsCreated: number;
  streakDays: number;
  lastActive: string;
}

export class GamificationManager {
  private userStats: Map<string, UserStats> = new Map();
  private achievements: Map<string, Achievement[]> = new Map();
  private leaderboards: Map<string, { userId: string; score: number; name: string }[]> = new Map();

  constructor() {
    this.initializeAchievements();
    this.initializeTestUser();
  }

  private initializeAchievements(): Achievement[] {
    return [
      {
        id: 'first-bot',
        name: 'Primeiro Bot',
        description: 'Crie seu primeiro bot',
        icon: '🤖',
        rarity: 'common',
        maxProgress: 1
      },
      {
        id: 'bot-master',
        name: 'Mestre dos Bots',
        description: 'Crie 10 bots',
        icon: '👾',
        rarity: 'rare',
        maxProgress: 10
      },
      {
        id: 'project-starter',
        name: 'Iniciador de Projetos',
        description: 'Crie seu primeiro projeto',
        icon: '📁',
        rarity: 'common',
        maxProgress: 1
      },
      {
        id: 'squad-commander',
        name: 'Comandante do Squad',
        description: 'Chame todos os 8 especialistas',
        icon: '👥',
        rarity: 'epic',
        maxProgress: 8
      },
      {
        id: 'debug-hunter',
        name: 'Caçador de Bugs',
        description: 'Resolva 50 problemas com Debug Hunter',
        icon: '🔍',
        rarity: 'rare',
        maxProgress: 50
      },
      {
        id: 'speed-demon',
        name: 'Velocista',
        description: 'Complete uma tarefa em menos de 5 minutos',
        icon: '⚡',
        rarity: 'common',
        maxProgress: 1
      },
      {
        id: 'weekend-warrior',
        name: 'Guerreiro de Fim de Semana',
        description: 'Trabalhe 5 dias consecutivos',
        icon: '💪',
        rarity: 'rare',
        maxProgress: 5
      },
      {
        id: 'legendary-builder',
        name: 'Construtor Lendário',
        description: 'Alcance o nível 50',
        icon: '👑',
        rarity: 'legendary',
        maxProgress: 50
      }
    ];
  }

  private initializeTestUser() {
    const userId = 'user-1';
    
    this.userStats.set(userId, {
      level: 12,
      xp: 3450,
      xpToNextLevel: 5000,
      totalTasks: 47,
      totalBotsCreated: 3,
      totalProjectsCreated: 2,
      streakDays: 5,
      lastActive: new Date().toISOString()
    });

    const achievements = this.initializeAchievements();
    // Unlock some achievements
    achievements[0].unlockedAt = new Date(Date.now() - 86400000 * 5).toISOString(); // first-bot
    achievements[0].progress = 1;
    
    achievements[2].unlockedAt = new Date(Date.now() - 86400000 * 3).toISOString(); // project-starter
    achievements[2].progress = 1;
    
    achievements[4].progress = 23; // debug-hunter in progress
    
    this.achievements.set(userId, achievements);
  }

  getUserStats(userId: string): UserStats {
    return this.userStats.get(userId) || {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalTasks: 0,
      totalBotsCreated: 0,
      totalProjectsCreated: 0,
      streakDays: 0,
      lastActive: new Date().toISOString()
    };
  }

  addXP(userId: string, amount: number, reason: string): { leveledUp: boolean; newLevel?: number } {
    const stats = this.getUserStats(userId);
    stats.xp += amount;
    
    let leveledUp = false;
    let newLevel = stats.level;
    
    while (stats.xp >= stats.xpToNextLevel) {
      stats.xp -= stats.xpToNextLevel;
      stats.level++;
      stats.xpToNextLevel = Math.floor(stats.xpToNextLevel * 1.2);
      leveledUp = true;
      newLevel = stats.level;
    }
    
    this.userStats.set(userId, stats);
    return { leveledUp, newLevel };
  }

  getAchievements(userId: string): Achievement[] {
    return this.achievements.get(userId) || this.initializeAchievements();
  }

  updateAchievementProgress(userId: string, achievementId: string, progress: number): Achievement | null {
    const achievements = this.getAchievements(userId);
    const achievement = achievements.find(a => a.id === achievementId);
    
    if (achievement) {
      achievement.progress = Math.min(progress, achievement.maxProgress || 1);
      
      if (achievement.progress >= (achievement.maxProgress || 1) && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date().toISOString();
        // Add XP for unlocking
        const xpReward = this.getXPReward(achievement.rarity);
        this.addXP(userId, xpReward, `Conquista desbloqueada: ${achievement.name}`);
      }
      
      this.achievements.set(userId, achievements);
      return achievement;
    }
    
    return null;
  }

  private getXPReward(rarity: string): number {
    switch (rarity) {
      case 'common': return 100;
      case 'rare': return 250;
      case 'epic': return 500;
      case 'legendary': return 1000;
      default: return 50;
    }
  }

  trackActivity(userId: string): void {
    const stats = this.getUserStats(userId);
    const lastActive = new Date(stats.lastActive);
    const now = new Date();
    
    const daysSinceLastActive = Math.floor((now.getTime() - lastActive.getTime()) / 86400000);
    
    if (daysSinceLastActive === 1) {
      stats.streakDays++;
      this.addXP(userId, 50 * stats.streakDays, `Streak de ${stats.streakDays} dias!`);
    } else if (daysSinceLastActive > 1) {
      stats.streakDays = 0;
    }
    
    stats.lastActive = now.toISOString();
    this.userStats.set(userId, stats);
  }

  getLeaderboard(): { position: number; name: string; level: number; xp: number }[] {
    const entries = Array.from(this.userStats.entries()).map(([userId, stats]) => ({
      userId,
      name: 'Eduardo', // Would come from user profile
      level: stats.level,
      xp: stats.xp + (stats.level * 10000) // Total XP calculation
    }));
    
    return entries
      .sort((a, b) => b.xp - a.xp)
      .map((e, i) => ({ ...e, position: i + 1 }));
  }

  getGlobalStats() {
    const allStats = Array.from(this.userStats.values());
    
    return {
      totalUsers: allStats.length,
      averageLevel: allStats.reduce((sum, s) => sum + s.level, 0) / allStats.length,
      totalBotsCreated: allStats.reduce((sum, s) => sum + s.totalBotsCreated, 0),
      totalProjectsCreated: allStats.reduce((sum, s) => sum + s.totalProjectsCreated, 0),
      totalTasksCompleted: allStats.reduce((sum, s) => sum + s.totalTasks, 0)
    };
  }
}
