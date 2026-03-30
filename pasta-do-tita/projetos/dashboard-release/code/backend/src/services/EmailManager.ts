import { Bot } from '../types/bot';

export interface EmailMessage {
  id: string;
  botId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
  attachments?: string[];
  status: 'unread' | 'read' | 'replied';
  labels: string[];
  createdAt: string;
}

export class EmailManager {
  private emails: Map<string, EmailMessage[]> = new Map();
  private botEmails: Map<string, string> = new Map(); // botId -> email

  constructor() {
    // Initialize with some test data
    this.initializeTestData();
  }

  private initializeTestData() {
    // Create email addresses for existing bots
    this.botEmails.set('bot-1', 'whatsapp-autoreply@bots.titanio.dev');
    this.botEmails.set('bot-2', 'email-assistant@bots.titanio.dev');
    
    // Add test emails
    this.emails.set('bot-1', [
      {
        id: 'email-1',
        botId: 'bot-1',
        from: 'cliente@gospia.com',
        to: 'whatsapp-autoreply@bots.titanio.dev',
        subject: 'Suporte Técnico Urgente',
        body: 'Olá, preciso de ajuda com o sistema.',
        status: 'unread',
        labels: ['suporte', 'urgente'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'email-2',
        botId: 'bot-1',
        from: 'marketing@empresa.com',
        to: 'whatsapp-autoreply@bots.titanio.dev',
        subject: 'Proposta de Parceria',
        body: 'Gostaríamos de propor uma parceria.',
        status: 'read',
        labels: ['parceria'],
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }

  createEmailForBot(botId: string, botName: string): string {
    const sanitizedName = botName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const email = `${sanitizedName}@bots.titanio.dev`;
    this.botEmails.set(botId, email);
    this.emails.set(botId, []);
    return email;
  }

  getEmailAddress(botId: string): string | undefined {
    return this.botEmails.get(botId);
  }

  getEmails(botId: string): EmailMessage[] {
    return this.emails.get(botId) || [];
  }

  getAllEmails(): { botId: string; email: string; messages: EmailMessage[] }[] {
    return Array.from(this.botEmails.entries()).map(([botId, email]) => ({
      botId,
      email,
      messages: this.getEmails(botId)
    }));
  }

  sendEmail(botId: string, to: string, subject: string, body: string): EmailMessage {
    const email: EmailMessage = {
      id: `email-${Date.now()}`,
      botId,
      from: this.botEmails.get(botId) || 'bot@titanio.dev',
      to,
      subject,
      body,
      status: 'read',
      labels: ['sent'],
      createdAt: new Date().toISOString()
    };

    const botEmails = this.emails.get(botId) || [];
    botEmails.push(email);
    this.emails.set(botId, botEmails);

    return email;
  }

  receiveEmail(botId: string, from: string, subject: string, body: string): EmailMessage {
    const email: EmailMessage = {
      id: `email-${Date.now()}`,
      botId,
      from,
      to: this.botEmails.get(botId) || 'bot@titanio.dev',
      subject,
      body,
      status: 'unread',
      labels: ['inbox'],
      createdAt: new Date().toISOString()
    };

    const botEmails = this.emails.get(botId) || [];
    botEmails.push(email);
    this.emails.set(botId, botEmails);

    return email;
  }

  markAsRead(emailId: string): boolean {
    for (const [botId, emails] of this.emails.entries()) {
      const email = emails.find(e => e.id === emailId);
      if (email) {
        email.status = 'read';
        return true;
      }
    }
    return false;
  }

  getStats() {
    let total = 0;
    let unread = 0;
    
    for (const emails of this.emails.values()) {
      total += emails.length;
      unread += emails.filter(e => e.status === 'unread').length;
    }

    return { total, unread, botsWithEmail: this.botEmails.size };
  }
}
