# Monteiro Aranha — Modo Confidencial + Tokenização + Audit Trail | Execução

---

## 📋 Análise do Requisito

Lendo `PLANO-SEGURANCA-MONTEIRO-ARANHA.md` para extrair contexto...

**Requisitos extraídos:**
1. ✅ Modo Confidencial (sessão efêmera, contexto destruído)
2. ✅ Middleware de Tokenização (dados sensíveis → tokens opacos)
3. ✅ Audit Trail com Hash Chain (imutável, auditável)
4. ✅ IA não persiste em lessons.json durante modo confidencial
5. ✅ Log apenas registra existência (não conteúdo)

---

## 🔨 EXECUÇÃO — Código Funcional TypeScript

### 1️⃣ **Sistema de Tokenização (tokenizer.ts)**

```typescript
// src/security/tokenizer.ts
import crypto from 'crypto';

interface TokenMap {
  [token: string]: {
    value: string;
    createdAt: number;
    expiresAt: number;
    category: 'pii' | 'credential' | 'payment' | 'secret';
  };
}

export class DataTokenizer {
  private tokenMap: TokenMap = {};
  private tokenTTL = 3600000; // 1 hora em ms
  private readonly SENSITIVE_PATTERNS = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    cpf: /\d{3}\.\d{3}\.\d{3}-\d{2}/g,
    creditCard: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/g,
    apiKey: /api[_-]?key[\s:=]+[a-zA-Z0-9-_]{32,}/gi,
    jwt: /eyJhbGciOi[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    password: /password[\s:=]+[^\s,}]+/gi,
    phoneNumber: /\(?[0-9]{2}\)?[\s-]?[0-9]{4,5}[\s-]?[0-9]{4}/g,
  };

  /**
   * Gera um token opaco para um valor sensível
   */
  generateToken(value: string, category: 'pii' | 'credential' | 'payment' | 'secret'): string {
    const token = `TOK_${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
    const now = Date.now();

    this.tokenMap[token] = {
      value,
      createdAt: now,
      expiresAt: now + this.tokenTTL,
      category,
    };

    // Auto-cleanup em background
    setTimeout(() => this.revokeToken(token), this.tokenTTL);

    return token;
  }

  /**
   * Detects e tokeniza dados sensíveis automaticamente
   */
  tokenizeContent(content: string): { tokenized: string; tokens: Map<string, string> } {
    const tokens = new Map<string, string>();
    let tokenized = content;

    // Email
    tokenized = tokenized.replace(this.SENSITIVE_PATTERNS.email, (match) => {
      const token = this.generateToken(match, 'pii');
      tokens.set(token, 'email');
      return token;
    });

    // CPF
    tokenized = tokenized.replace(this.SENSITIVE_PATTERNS.cpf, (match) => {
      const token = this.generateToken(match, 'pii');
      tokens.set(token, 'cpf');
      return token;
    });

    // Cartão de Crédito
    tokenized = tokenized.replace(this.SENSITIVE_PATTERNS.creditCard, (match) => {
      const token = this.generateToken(match, 'payment');
      tokens.set(token, 'card');
      return token;
    });

    // API Keys
    tokenized = tokenized.replace(this.SENSITIVE_PATTERNS.apiKey, (match) => {
      const token = this.generateToken(match, 'secret');
      tokens.set(token, 'apiKey');
      return token;
    });

    // JWT
    tokenized = tokenized.replace(this.SENSITIVE_PATTERNS.jwt, (match) => {
      const token = this.generateToken(match, 'credential');
      tokens.set(token, 'jwt');
      return token;
    });

    // Passwords
    tokenized = tokenized.replace(this.SENSITIVE_PATTERNS.password, (match) => {
      const token = this.generateToken(match, 'credential');
      tokens.set(token, 'password');
      return token;
    });

    // Phone Numbers
    tokenized = tokenized.replace(this.SENSITIVE_PATTERNS.phoneNumber, (match) => {
      const token = this.generateToken(match, 'pii');
      tokens.set(token, 'phone');
      return token;
    });

    return { tokenized, tokens };
  }

  /**
   * Revoga um token (torna irrecuperável)
   */
  revokeToken(token: string): boolean {
    if (this.tokenMap[token]) {
      delete this.tokenMap[token];
      return true;
    }
    return false;
  }

  /**
   * Recupera valor apenas com acesso explícito (audit trail ativado)
   */
  detokenize(token: string, auditLog: AuditLogger): string | null {
    const entry = this.tokenMap[token];

    if (!entry) {
      auditLog.logTokenAccess(token, 'REVOKED', 'token not found');
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      auditLog.logTokenAccess(token, 'EXPIRED', entry.category);
      delete this.tokenMap[token];
      return null;
    }

    auditLog.logTokenAccess(token, 'SUCCESS', entry.category);
    return entry.value;
  }

  /**
   * Status do tokenizer (para monitoramento)
   */
  getStatus(): { activeTokens: number; categories: Record<string, number> } {
    const categories: Record<string, number> = {
      pii: 0,
      credential: 0,
      payment: 0,
      secret: 0,
    };

    Object.values(this.tokenMap).forEach((entry) => {
      if (entry.expiresAt > Date.now()) {
        categories[entry.category]++;
      }
    });

    return {
      activeTokens: Object.keys(this.tokenMap).length,
      categories,
    };
  }

  /**
   * Limpa TODOS os tokens (usado ao finalizar sessão confidencial)
   */
  purgeAll(): void {
    this.tokenMap = {};
  }
}

// Singleton global
export const tokenizer = new DataTokenizer();
```

---

### 2️⃣ **Audit Trail com Hash Chain (auditLogger.ts)**

```typescript
// src/security/auditLogger.ts
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface AuditEntry {
  timestamp: number;
  action: string;
  actor: string;
  resource: string;
  status: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'REVOKED' | 'EXPIRED';
  metadata: Record<string, any>;
  hash: string;
  previousHash: string