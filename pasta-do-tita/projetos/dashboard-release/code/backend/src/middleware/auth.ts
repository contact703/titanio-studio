import { Request, Response, NextFunction } from 'express';
import { UserManager } from '../services/UserManager';

// Estende o Request do Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: 'admin' | 'user' | 'guest';
      };
      token?: string;
      isAdmin?: boolean;
    }
  }
}

/**
 * Middleware de autenticação JWT
 * 
 * Extrai token do header Authorization e valida
 * Adiciona req.user e req.isAdmin se autenticado
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Verifica se é rota pública
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/health'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Autenticação necessária',
      message: 'Token não fornecido'
    });
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;

  // Valida token
  const userManager = req.app.locals.userManager as UserManager;
  const user = userManager.validateSession(token);

  if (!user) {
    return res.status(401).json({ 
      error: 'Token inválido ou expirado',
      message: 'Faça login novamente'
    });
  }

  // Adiciona usuário ao request
  req.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };
  req.token = token;
  req.isAdmin = user.role === 'admin';

  next();
}

/**
 * Middleware que requer admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Acesso negado',
      message: 'Apenas administradores podem acessar este recurso'
    });
  }
  next();
}

/**
 * Middleware opcional de autenticação
 * Não bloqueia se não autenticado, mas adiciona user se existir
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    const userManager = req.app.locals.userManager as UserManager;
    const user = userManager.validateSession(token);

    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      req.token = token;
      req.isAdmin = user.role === 'admin';
    }
  }

  next();
}
