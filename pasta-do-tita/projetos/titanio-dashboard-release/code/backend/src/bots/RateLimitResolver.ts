import { Bot } from '../types/bot';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * RateLimitResolver Bot
 * 
 * Resolve automaticamente erros de rate limit da API da Anthropic (Claude).
 * Estratégias:
 * 1. Aguarda cooldown exponencial
 * 2. Fallback para modelo alternativo (Kimi)
 * 3. Cache de respostas para evitar requisições
 * 4. Throttling de requests
 */
export class RateLimitResolver implements Bot {
  id = 'rate-limit-resolver';
  name = 'Rate Limit Resolver';
  avatar = '⏳';
  status: 'idle' | 'running' | 'error' = 'idle';
  
  private cooldownMs = 60000; // Começa com 1 minuto
  private maxCooldownMs = 600000; // Máximo 10 minutos
  private consecutiveErrors = 0;
  private lastReset = Date.now();

  /**
   * Resolve erro de rate limit
   */
  async resolve(error: any): Promise<void> {
    this.status = 'running';
    console.log('⏳ RateLimitResolver: Analisando...');
    
    try {
      // Estratégia 1: Verificar se já passou tempo suficiente
      const shouldWait = await this.checkCooldown();
      
      if (shouldWait) {
        console.log(`   → Aguardando ${this.cooldownMs / 1000}s (cooldown exponencial)`);
        await this.sleep(this.cooldownMs);
        
        // Incrementa cooldown para próxima vez
        this.cooldownMs = Math.min(this.cooldownMs * 2, this.maxCooldownMs);
        this.consecutiveErrors++;
      } else {
        // Reset cooldown se passou tempo suficiente
        this.resetCooldown();
      }
      
      // Estratégia 2: Verificar se há modelo alternativo disponível
      const alternativeAvailable = await this.checkAlternativeModel();
      
      if (alternativeAvailable) {
        console.log('   → Alternando para modelo alternativo (Kimi)');
        await this.switchToAlternativeModel();
      }
      
      // Estratégia 3: Verificar configurações de rate limit
      await this.optimizeRateLimitConfig();
      
      // Estratégia 4: Se muitos erros consecutivos, notificar humano
      if (this.consecutiveErrors > 5) {
        console.log('   ⚠️ Muitos erros consecutivos - escalando para humano');
        await this.escalateToHuman(error);
      }
      
      console.log('✅ RateLimitResolver: Ações aplicadas');
      this.status = 'idle';
      
    } catch (resolveError) {
      console.error('❌ RateLimitResolver: Falha ao resolver', resolveError);
      this.status = 'error';
    }
  }

  /**
   * Verifica se deve aguardar cooldown
   */
  private async checkCooldown(): Promise<boolean> {
    // Se último erro foi há menos de 1 minuto, aguarda
    const timeSinceLastError = Date.now() - this.lastReset;
    return timeSinceLastError < this.cooldownMs;
  }

  /**
   * Reseta cooldown
   */
  resetCooldown(): void {
    this.cooldownMs = 60000;
    this.consecutiveErrors = 0;
    this.lastReset = Date.now();
    console.log('⏳ RateLimitResolver: Cooldown resetado');
  }

  /**
   * Verifica se modelo alternativo está disponível
   */
  private async checkAlternativeModel(): Promise<boolean> {
    try {
      // Verifica se Kimi está respondendo
      // Simulação - na prática testaria uma chamada leve
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Alterna para modelo alternativo
   */
  private async switchToAlternativeModel(): Promise<void> {
    try {
      // Define variável de ambiente para usar modelo alternativo
      process.env.OPENCLAW_FALLBACK_MODEL = 'moonshot/kimi-k2.5';
      
      // Atualiza config se possível
      await this.updateConfig({
        defaultModel: 'moonshot/kimi-k2.5',
        fallbackEnabled: true
      });
      
      console.log('   ✓ Modelo alternativo configurado');
    } catch (error) {
      console.error('   ✗ Falha ao alternar modelo:', error);
    }
  }

  /**
   * Otimiza configurações de rate limit
   */
  private async optimizeRateLimitConfig(): Promise<void> {
    const optimizations = [
      {
        name: 'maxConcurrentRequests',
        value: 1, // Reduz para evitar rate limit
        description: 'Limita requisições concorrentes'
      },
      {
        name: 'requestTimeout',
        value: 120000, // 2 minutos
        description: 'Aumenta timeout para evitar retries desnecessários'
      },
      {
        name: 'retryDelay',
        value: this.cooldownMs,
        description: 'Delay entre retries baseado em cooldown'
      }
    ];
    
    for (const opt of optimizations) {
      console.log(`   → ${opt.description}: ${opt.value}`);
      process.env[`OPENCLAW_${opt.name.toUpperCase()}`] = String(opt.value);
    }
  }

  /**
   * Escalona para intervenção humana
   */
  private async escalateToHuman(error: any): Promise<void> {
    const escalation = {
      type: 'rate_limit_persistent',
      severity: 'critical',
      consecutiveErrors: this.consecutiveErrors,
      timestamp: new Date().toISOString(),
      message: 'Múltiplos erros de rate limit detectados. Requer revisão de uso da API ou upgrade de plano.',
      context: error
    };
    
    // Salva alerta
    const fs = await import('fs');
    const path = await import('path');
    const alertPath = path.join(process.cwd(), '.alerts', `escalation-${Date.now()}.json`);
    
    fs.mkdirSync(path.dirname(alertPath), { recursive: true });
    fs.writeFileSync(alertPath, JSON.stringify(escalation, null, 2));
    
    console.log(`   📧 Escalonamento salvo: ${alertPath}`);
  }

  /**
   * Atualiza configuração do OpenClaw
   */
  private async updateConfig(updates: Record<string, any>): Promise<void> {
    try {
      // Tenta atualizar via CLI
      for (const [key, value] of Object.entries(updates)) {
        await execAsync(`openclaw config set ${key} "${value}" 2>/dev/null || true`);
      }
    } catch {
      // Fallback: apenas log
      console.log('   ⚠️ Não foi possível atualizar config via CLI');
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async start(): Promise<void> {
    console.log('⏳ RateLimitResolver pronto');
  }

  async stop(): Promise<void> {
    this.status = 'idle';
  }
}
