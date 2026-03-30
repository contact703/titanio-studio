import { SquadManager } from '../squad/SquadManager';
import { BotManager } from './BotManager';
import { ProjectManager } from './ProjectManager';

interface ChatResponse {
  message: string;
  actions?: any[];
  specialist?: string;
}

export class ChatService {
  constructor(
    private squad: SquadManager,
    private bots: BotManager,
    private projects: ProjectManager
  ) {}

  async processMessage(message: string, userId: string): Promise<ChatResponse> {
    const lowerMsg = message.toLowerCase();

    // Bot creation commands
    if (lowerMsg.includes('criar bot') || lowerMsg.includes('novo bot')) {
      return this.handleBotCreation(message);
    }

    // Project commands
    if (lowerMsg.includes('novo projeto') || lowerMsg.includes('criar projeto')) {
      return this.handleProjectCreation(message);
    }

    // Squad commands
    if (lowerMsg.includes('chamar') || lowerMsg.includes('preciso de') || lowerMsg.includes('ajuda com')) {
      return this.handleSquadSummon(message);
    }

    // Bot management
    if (lowerMsg.includes('listar bots') || lowerMsg.includes('ver bots')) {
      const botList = this.bots.getAllBots()
        .map(b => `• ${b.name} (${b.status})`)
        .join('\n');
      return {
        message: `📋 Bots ativos:\n\n${botList || 'Nenhum bot criado ainda.'}`
      };
    }

    // Project listing
    if (lowerMsg.includes('listar projetos') || lowerMsg.includes('ver projetos')) {
      const projList = this.projects.getAllProjects()
        .map(p => `• ${p.name} (${p.status}) - ${p.stats.totalBots} bots`)
        .join('\n');
      return {
        message: `📁 Projetos:\n\n${projList || 'Nenhum projeto criado ainda.'}`
      };
    }

    // Squad listing
    if (lowerMsg.includes('squad') || lowerMsg.includes('especialistas') || lowerMsg.includes('equipe')) {
      const squadList = this.squad.getAllSpecialists()
        .map(s => `${s.avatar} ${s.name} (${s.status})`)
        .join('\n');
      return {
        message: `👥 Squad de Especialistas:\n\n${squadList}`
      };
    }

    // Default response
    return {
      message: `Olá! Sou a Tita, sua assistente no Titanio Command Center.\n\nPosso te ajudar com:\n• Criar bots (digite "criar bot")\n• Criar projetos (digite "novo projeto")\n• Chamar especialistas (digite "chamar [nome]")\n• Listar bots, projetos ou squad\n\nO que você precisa? 🤖`
    };
  }

  private handleBotCreation(message: string): ChatResponse {
    // Extract bot name if provided
    const nameMatch = message.match(/(?:chamado|nome|de|para)\s+(\w+)/i);
    const name = nameMatch ? nameMatch[1] : 'Novo Bot';

    return {
      message: `🤖 Vou criar um bot chamado "${name}"!\n\nPreciso de algumas informações:\n\n1. Qual a função principal deste bot?\n2. Qual projeto ele pertence?\n3. Quais integrações ele precisa (WhatsApp, Email, etc)?\n\nMe responde com essas informações que eu configuro tudo!`,
      actions: [
        { type: 'create_bot', name },
        { type: 'ask_project' },
        { type: 'ask_integrations' }
      ]
    };
  }

  private handleProjectCreation(message: string): ChatResponse {
    const nameMatch = message.match(/(?:chamado|nome|de|para)\s+(\w+)/i);
    const name = nameMatch ? nameMatch[1] : 'Novo Projeto';

    return {
      message: `📁 Vou criar o projeto "${name}"!\n\nMe diz:\n\n1. Qual a descrição do projeto?\n2. Qual o cliente?\n3. Já tem algum bot para adicionar?\n\nAssim que você responder, crio o projeto e já deixo ele pronto para usar!`,
      actions: [
        { type: 'create_project', name },
        { type: 'ask_description' },
        { type: 'ask_client' }
      ]
    };
  }

  private handleSquadSummon(message: string): ChatResponse {
    const specialists = this.squad.getAllSpecialists();
    
    // Try to identify which specialist
    const keywords: Record<string, string> = {
      'codigo': 'code-ninja',
      'design': 'design-wizard',
      'debug': 'debug-hunter',
      'bug': 'debug-hunter',
      'deploy': 'devops-ninja',
      'infra': 'devops-ninja',
      'aso': 'aso-specialist',
      'play store': 'aso-specialist',
      'metricas': 'growth-hacker',
      'api': 'api-master',
      'integracao': 'api-master',
      'seguranca': 'security-guard',
      'auth': 'security-guard'
    };

    for (const [keyword, specialistId] of Object.entries(keywords)) {
      if (message.toLowerCase().includes(keyword)) {
        const specialist = this.squad.getSpecialist(specialistId);
        if (specialist) {
          return {
            message: `Chamando ${specialist.avatar} ${specialist.name}...`,
            specialist: specialistId
          };
        }
      }
    }

    return {
      message: `Posso chamar um especialista do squad! Temos:\n\n${specialists.map(s => `${s.avatar} ${s.name} - ${s.role}`).join('\n')}\n\nQual você precisa?`,
    };
  }
}
