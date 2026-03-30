import { Bot } from '../types/bot';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * TimeoutResolver Bot
 * 
 * Resolve automaticamente erros de timeout do Kimi (Moonshot).
 * Estratégias:
 * 1. Aumenta timeout para requests longos
 * 2. Divide requests grandes em chunks menores
 * 3. Fallback para Claude se Kimi não responder
 * 4. Monitora latência e ajusta expectativas
 */
export class TimeoutResolver implements Bot {
  id = 'timeout-resolver';
  name = 'Timeout Resolver';
  avatar = '⏱️';
  status: 'idle' | 'running' | 'error' = 'idle';
  
  private timeoutMs = 60000; // Timeout base: 1 minuto
  private maxTimeoutMs = 300000; // Máximo: 5 minutos
  private consecutiveTimeouts = 0;
  private chunkSize = 4000; // Tamanho de chunk para divisão

  /**
   * Resolve erro de timeout
   */
  async resolve(error: any): Promise<void> {
    this.status = 'running';
    console.log('⏱️ TimeoutResolver: Analisando...');
    
    try {
      // Estratégia 1: Aumentar timeout
      await this.increaseTimeout();
      
      // Estratégia 2: Verificar se request é muito grande
      const isLargeRequest = await this.checkRequestSize(error);
      
      if (isLargeRequest) {
        console.log('   → Request muito grande, sugerindo chunking');
        await this.enableChunking();
      }
      
      // Estratégia 3: Verificar conectividade com Kimi
      const kimiHealthy = await this.checkKimiHealth();
      
      if (!kimiHealthy) {
        console.log('   → Kimi não respondendo, alternando para Claude');
        await this.switchToClaude();
      }
      
      // Estratégia 4: Otimizar configurações de rede
      await this.optimizeNetworkConfig();
      
      // Estratégia 5: Se persistente, escalonar
      this.consecutiveTimeouts++;
      if (this.consecutiveTimeouts > 3) {
        console.log('   ⚠️ Timeouts persistentes - escalando para humano');
        await this.escalateToHuman(error);
      }
      
      console.log('✅ TimeoutResolver: Ações aplicadas');
      this.status = 'idle';
      
    } catch (resolveError) {
      console.error('❌ TimeoutResolver: Falha ao resolver', resolveError);
      this.status = 'error';
    }
  }

  /**
   * Aumenta timeout progressivamente
   */
  private async increaseTimeout(): Promise<void> {
    // Aumenta timeout em 30 segundos a cada tentativa
    this.timeoutMs = Math.min(
      this.timeoutMs + 30000,
      this.maxTimeoutMs
    );
    
    process.env.OPENCLAW_REQUEST_TIMEOUT = String(this.timeoutMs);
    
    console.log(`   → Timeout aumentado para ${this.timeoutMs / 1000}s`);
    
    // Atualiza config
    await this.updateConfig({
      requestTimeout: this.timeoutMs,
      maxRetries: 3
    });
  }

  /**
   * Verifica se request é grande demais
   */
  private async checkRequestSize(error: any): Promise<boolean> {
    // Heurística: se contexto > 8000 tokens, provavelmente é grande
    const context = error.context || '';
    const estimatedTokens = context.length / 4; // Aproximação
    
    return estimatedTokens > 8000;
  }

  /**
   * Habilita divisão de requests em chunks
   */
  private async enableChunking(): Promise<void> {
    process.env.OPENCLAW_ENABLE_CHUNKING = 'true';
    process.env.OPENCLAW_CHUNK_SIZE = String(this.chunkSize);
    
    console.log(`   → Chunking habilitado (tamanho: ${this.chunkSize})`);
    
    // Sugere ao usuário
    console.log('   💡 Dica: Para requests grandes, considere dividir em partes menores');
  }

  /**
   * Verifica saúde do serviço Kimi
   */
  private async checkKimiHealth(): Promise<boolean> {
    try {
      // Testa com uma chamada simples/ping
      // Na prática, seria uma chamada real à API
      const startTime = Date.now();
      
      // Simulação: verifica se há muitos timeouts recentes
      if (this.consecutiveTimeouts > 2) {
        return false;
      }
      
      // Verifica latência
      const latency = Date.now() - startTime;
      return latency < 5000; // Se demorar mais que 5s, considera unhealthy
    } catch {
      return false;
    }
  }

  /**
   * Alterna para Claude
   */
  private async switchToClaude(): Promise<void> {
    try {
      // Verifica se Claude está disponível (não em rate limit)
      const claudeAvailable = await this.checkClaudeAvailability();
      
      if (claudeAvailable) {
        process.env.OPENCLAW_DEFAULT_MODEL = 'anthropic/claude-opus-4-6';
        
        await this.updateConfig({
          defaultModel: 'anthropic/claude-opus-4-6',
          fallbackModel: 'moonshot/kimi-k2.5'
        });
        
        console.log('   ✓ Alternado para Claude (fallback ativo)');
        
        // Reseta contador de timeouts
        this.consecutiveTimeouts = 0;
      } else {
        console.log('   ⚠️ Claude também indisponível (rate limit)');
        console.log('   → Aguardando antes de retry...');
        await this.sleep(60000); // Aguarda 1 minuto
      }
    } catch (error) {
      console.error('   ✗ Falha ao alternar para Claude:', error);
    }
  }

  /**
   * Verifica se Claude está disponível
   */
  private async checkClaudeAvailability(): Promise<boolean> {
    // Verifica se não há rate limit ativo
    // Na prática, faria uma chamada de teste
    return true; // Simplificado
  }

  /**
   * Otimiza configurações de rede
   */
  private async optimizeNetworkConfig(): Promise<void> {
    const optimizations = [
      {
        name: 'keepAlive',
        value: true,
        description: 'Mantém conexões abertas'
      },
      {
        name: 'tcpNoDelay',
        value: true,
        description: 'Desabilita Nagle algorithm'
      },
      {
        name: 'connectionTimeout',
        value: 10000,
        description: 'Timeout de conexão: 10s'
      }
    ];
    
    for (const opt of optimizations) {
      console.log(`   → ${opt.description}`);
      process.env[`OPENCLAW_${opt.name.toUpperCase()}`] = String(opt.value);
    }
  }

  /**
   * Escalona para intervenção humana
   */
  private async escalateToHuman(error: any): Promise<void> {
    const escalation = {
      type: 'timeout_persistent',
      severity: 'high',
      consecutiveTimeouts: this.consecutiveTimeouts,
      currentTimeout: this.timeoutMs,
      timestamp: new Date().toISOString(),
      message: 'Múltiplos timeouts detectados. Ambos os modelos (Claude e Kimi) podem estar instáveis.',
      suggestions: [
        'Verificar status das APIs em https://status.anthropic.com',
        'Verificar status da Moonshot',
        'Considerar upgrade de plano para maior throughput',
        'Verificar conexão de rede local'
      ],
      context: error
    };
    
    // Salva alerta
    const fs = await import('fs');
    const path = await import('path');
    const alertPath = path.join(process.cwd(), '.alerts', `escalation-timeout-${Date.now()}.json`);
    
    fs.mkdirSync(path.dirname(alertPath), { recursive: true });
    fs.writeFileSync(alertPath, JSON.stringify(escalation, null, 2));
    
    console.log(`   📧 Escalonamento salvo: ${alertPath}`);
  }

  /**
   * Atualiza configuração
   */
  private async updateConfig(updates: Record<string, any>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(updates)) {
        await execAsync(`openclaw config set ${key} "${value}" 2>/dev/null || true`);
      }
    } catch {
      console.log('   ⚠️ Config atualizada apenas em memória');
    }
  }

  /**
   * Reseta contador de timeouts
   */
  resetTimeoutCounter(): void {
    this.consecutiveTimeouts = 0;
    this.timeoutMs = 60000;
    console.log('⏱️ TimeoutResolver: Contadores resetados');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start(): Promise<void> {
    console.log('⏱️ TimeoutResolver pronto');
  }

  async stop(): Promise<void> {
    this.status = 'idle';
  }
}
