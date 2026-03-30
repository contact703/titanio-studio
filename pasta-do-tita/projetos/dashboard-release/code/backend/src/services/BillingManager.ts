export interface CostEntry {
  id: string;
  provider: 'openai' | 'anthropic' | 'google' | 'elevenlabs' | 'other';
  service: string;
  amount: number;
  currency: 'USD' | 'BRL';
  botId?: string;
  projectId?: string;
  description: string;
  timestamp: string;
}

export interface BudgetAlert {
  id: string;
  threshold: number;
  currentSpend: number;
  percentage: number;
  triggered: boolean;
}

export class BillingManager {
  private costs: CostEntry[] = [];
  private monthlyBudget: number = 500; // Default $500
  private alerts: BudgetAlert[] = [];

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData() {
    // Add some test costs
    const now = new Date();
    
    this.costs.push(
      {
        id: 'cost-1',
        provider: 'openai',
        service: 'gpt-4',
        amount: 45.20,
        currency: 'USD',
        botId: 'bot-1',
        projectId: 'project-1',
        description: 'WhatsApp Auto-Reply - Mensagens processadas',
        timestamp: new Date(now.getTime() - 86400000).toISOString()
      },
      {
        id: 'cost-2',
        provider: 'anthropic',
        service: 'claude-3-opus',
        amount: 32.50,
        currency: 'USD',
        botId: 'bot-2',
        projectId: 'project-1',
        description: 'Email Assistant - Análise de emails',
        timestamp: new Date(now.getTime() - 172800000).toISOString()
      },
      {
        id: 'cost-3',
        provider: 'elevenlabs',
        service: 'text-to-speech',
        amount: 12.80,
        currency: 'USD',
        description: 'TTS para notificações',
        timestamp: new Date(now.getTime() - 259200000).toISOString()
      },
      {
        id: 'cost-4',
        provider: 'openai',
        service: 'dall-e-3',
        amount: 8.40,
        currency: 'USD',
        description: 'Geração de imagens para dashboard',
        timestamp: new Date(now.getTime() - 345600000).toISOString()
      }
    );
  }

  addCost(entry: Omit<CostEntry, 'id' | 'timestamp'>): CostEntry {
    const cost: CostEntry = {
      ...entry,
      id: `cost-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.costs.push(cost);
    this.checkBudgetAlert();
    return cost;
  }

  getCosts(filters?: { botId?: string; projectId?: string; provider?: string }): CostEntry[] {
    let filtered = this.costs;
    
    if (filters?.botId) {
      filtered = filtered.filter(c => c.botId === filters.botId);
    }
    if (filters?.projectId) {
      filtered = filtered.filter(c => c.projectId === filters.projectId);
    }
    if (filters?.provider) {
      filtered = filtered.filter(c => c.provider === filters.provider);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getMonthlySpend(): { total: number; byProvider: Record<string, number>; byService: Record<string, number> } {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyCosts = this.costs.filter(c => new Date(c.timestamp) >= monthStart);
    
    const total = monthlyCosts.reduce((sum, c) => sum + c.amount, 0);
    
    const byProvider: Record<string, number> = {};
    const byService: Record<string, number> = {};
    
    for (const cost of monthlyCosts) {
      byProvider[cost.provider] = (byProvider[cost.provider] || 0) + cost.amount;
      byService[cost.service] = (byService[cost.service] || 0) + cost.amount;
    }
    
    return { total, byProvider, byService };
  }

  setBudget(amount: number): void {
    this.monthlyBudget = amount;
    this.checkBudgetAlert();
  }

  getBudget(): number {
    return this.monthlyBudget;
  }

  checkBudgetAlert(): BudgetAlert | null {
    const spend = this.getMonthlySpend();
    const percentage = (spend.total / this.monthlyBudget) * 100;
    
    let threshold = 0;
    if (percentage >= 100) threshold = 100;
    else if (percentage >= 90) threshold = 90;
    else if (percentage >= 75) threshold = 75;
    else if (percentage >= 50) threshold = 50;
    
    if (threshold > 0) {
      const alert: BudgetAlert = {
        id: `alert-${Date.now()}`,
        threshold,
        currentSpend: spend.total,
        percentage,
        triggered: true
      };
      this.alerts.push(alert);
      return alert;
    }
    
    return null;
  }

  getStats() {
    const spend = this.getMonthlySpend();
    const allTime = this.costs.reduce((sum, c) => sum + c.amount, 0);
    
    return {
      monthlySpend: spend.total,
      monthlyBudget: this.monthlyBudget,
      remaining: this.monthlyBudget - spend.total,
      percentage: (spend.total / this.monthlyBudget) * 100,
      allTimeSpend: allTime,
      byProvider: spend.byProvider,
      byService: spend.byService,
      totalTransactions: this.costs.length
    };
  }

  getEconomyMode(): boolean {
    const spend = this.getMonthlySpend();
    return spend.total >= this.monthlyBudget * 0.9; // 90% do budget
  }
}
