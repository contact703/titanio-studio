import { Specialist, Task, TaskResult } from '../types/squad';

export class SquadManager {
  private specialists: Specialist[] = [
    {
      id: 'code-ninja',
      name: 'Code Ninja',
      avatar: '👨‍💻',
      role: 'Desenvolvimento Full Stack',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Debugging', 'Code Review'],
      status: 'available',
      description: 'Especialista em desenvolvimento rápido e debugging complexo'
    },
    {
      id: 'design-wizard',
      name: 'Design Wizard',
      avatar: '🎨',
      role: 'UI/UX Design',
      skills: ['Figma', 'Tailwind CSS', 'Prototipação', 'Design Systems', 'Animações'],
      status: 'available',
      description: 'Cria interfaces mágicas e experiências incríveis'
    },
    {
      id: 'debug-hunter',
      name: 'Debug Hunter',
      avatar: '🔍',
      role: 'Análise de Logs & Bugs',
      skills: ['Log Analysis', 'Error Tracking', 'Performance', 'Testing'],
      status: 'available',
      description: 'Caça bugs que outros não conseguem encontrar'
    },
    {
      id: 'devops-ninja',
      name: 'DevOps Ninja',
      avatar: '🚀',
      role: 'Infraestrutura & Deploy',
      skills: ['Docker', 'CI/CD', 'AWS', 'Railway', 'Monitoring'],
      status: 'available',
      description: 'Deploya rápido e mantém tudo no ar'
    },
    {
      id: 'aso-specialist',
      name: 'ASO Specialist',
      avatar: '📱',
      role: 'App Store Optimization',
      skills: ['Play Store', 'Keywords', 'Metadata', 'A/B Testing'],
      status: 'available',
      description: 'Faz apps subirem no ranking das lojas'
    },
    {
      id: 'growth-hacker',
      name: 'Growth Hacker',
      avatar: '📈',
      role: 'Growth & Métricas',
      skills: ['Analytics', 'Funnel Optimization', 'Aquisição', 'Métricas'],
      status: 'available',
      description: 'Escala produtos com estratégias de crescimento'
    },
    {
      id: 'api-master',
      name: 'API Master',
      avatar: '🔌',
      role: 'Integrações & APIs',
      skills: ['REST', 'GraphQL', 'Webhooks', 'Third-party APIs', 'OAuth'],
      status: 'available',
      description: 'Conecta qualquer sistema com qualquer outro'
    },
    {
      id: 'security-guard',
      name: 'Security Guard',
      avatar: '🛡️',
      role: 'Segurança',
      skills: ['Auth', 'JWT', 'Encryption', 'Best Practices', 'Auditing'],
      status: 'available',
      description: 'Protege sistemas contra ameaças'
    },
    {
      id: 'ui-ux-architect',
      name: 'UI/UX Architect',
      avatar: '🏛️',
      role: 'Design Systems & Templates',
      skills: ['Figma', '25k+ Templates', 'Design Systems', 'A/B Testing', 'Conversion'],
      status: 'available',
      description: 'Cria design systems escaláveis e otimiza conversão'
    },
    {
      id: 'system-design-guru',
      name: 'System Design Guru',
      avatar: '🏗️',
      role: 'Arquitetura & Escalabilidade',
      skills: ['System Design', 'Microservices', 'Scalability', 'Production', 'Interview Prep'],
      status: 'available',
      description: 'Arquiteta sistemas de grande escala e prepara para entrevistas'
    },
  ];

  getAllSpecialists(): Specialist[] {
    return this.specialists;
  }

  getSpecialist(id: string): Specialist | undefined {
    return this.specialists.find(s => s.id === id);
  }

  summonSpecialist(specialistId: string): Specialist {
    const specialist = this.getSpecialist(specialistId);
    if (specialist) {
      specialist.status = 'busy';
      return specialist;
    }
    throw new Error('Specialist not found');
  }

  async assignTask(specialistId: string, task: string, context: any): Promise<TaskResult> {
    const specialist = this.getSpecialist(specialistId);
    if (!specialist) {
      return { success: false, error: 'Especialista não encontrado' };
    }

    specialist.status = 'busy';

    // Simulate task processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate response based on specialist
    const result = this.generateTaskResponse(specialist, task, context);

    specialist.status = 'available';
    return result;
  }

  private generateTaskResponse(specialist: Specialist, task: string, context: any): TaskResult {
    const responses: Record<string, string> = {
      'code-ninja': `Analisando o código...\n\n✅ Identifiquei o problema!\n\n${task}\n\nSugestão de correção implementada. Testes passando! 🚀`,
      'design-wizard': `Criando mockup...\n\n🎨 Design conceitual pronto!\n\n${task}\n\nCores, tipografia e layout definidos. Protótipo interativo disponível!`,
      'debug-hunter': `Analisando logs...\n\n🔍 Bug encontrado!\n\n${task}\n\nStack trace analisado. Root cause identificada e documentada.`,
      'devops-ninja': `Configurando pipeline...\n\n🚀 Deploy configurado!\n\n${task}\n\nCI/CD rodando. Ambiente pronto para produção!`,
      'aso-specialist': `Otimizando listing...\n\n📱 ASO analysis completo!\n\n${task}\n\nKeywords atualizadas. Metadata otimizada para conversão!`,
      'growth-hacker': `Analisando métricas...\n\n📈 Insights gerados!\n\n${task}\n\nFunnel mapeado. Oportunidades de crescimento identificadas!`,
      'api-master': `Mapeando integração...\n\n🔌 API conectada!\n\n${task}\n\nEndpoints documentados. Webhooks configurados!`,
      'security-guard': `Auditoria de segurança...\n\n🛡️ Scan completo!\n\n${task}\n\nVulnerabilidades identificadas e corrigidas. Sistema seguro!`
    };

    return {
      success: true,
      specialist: specialist.name,
      avatar: specialist.avatar,
      message: responses[specialist.id] || `Tarefa '${task}' concluída por ${specialist.name}!`,
      data: context
    };
  }

  getStatus() {
    const available = this.specialists.filter(s => s.status === 'available').length;
    const busy = this.specialists.filter(s => s.status === 'busy').length;
    return { total: this.specialists.length, available, busy };
  }
}
