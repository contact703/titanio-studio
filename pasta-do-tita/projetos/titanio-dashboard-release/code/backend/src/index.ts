import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { requireAuth, requireAdmin } from './middleware/auth';
import { SquadManager } from './squad/SquadManager';
import { BotManager } from './services/BotManager';
import { ProjectManager } from './services/ProjectManager';
import { ChatService } from './services/ChatService';
import { EmailManager } from './services/EmailManager';
import { BillingManager } from './services/BillingManager';
import { GamificationManager } from './services/GamificationManager';
import { ClusterManager } from './services/ClusterManager';
import { SecuritySentinel } from './services/SecuritySentinel';
import { ClawConnector } from './services/ClawConnector';
import { KnowledgeSync, getKnowledgeSync } from './services/KnowledgeSync';
import { ErrorMonitorBot } from './bots/ErrorMonitor';
import { RateLimitResolver } from './bots/RateLimitResolver';
import { TimeoutResolver } from './bots/TimeoutResolver';
import { ClawClusterManager } from './services/ClawClusterManager';
import { MediaProcessorBot } from './bots/MediaProcessorBot';
import { UserManager } from './services/UserManager';
import { QuickAuth } from './services/QuickAuth';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize services
const userManager = new UserManager();
const quickAuth = new QuickAuth(); // Sistema sem senha para Zica, Tiago, Helber
const squadManager = new SquadManager();
const botManager = new BotManager();
const projectManager = new ProjectManager();
const emailManager = new EmailManager();

// Make auth services available to middleware
app.locals.userManager = userManager;
app.locals.quickAuth = quickAuth;

// QuickAuth middleware (sem senha!)
app.use(quickAuth.middleware());
const billingManager = new BillingManager();
const gamificationManager = new GamificationManager();
const clusterManager = new ClusterManager();
const securitySentinel = new SecuritySentinel();
const clawConnector = new ClawConnector();
const chatService = new ChatService(squadManager, botManager, projectManager);

// Start security sentinel
securitySentinel.start();

// Auto-connect to local OpenClaw on startup
(async () => {
  try {
    const config = await clawConnector.autoConnect();
    console.log(`🔗 Dashboard conectada ao OpenClaw de ${config.userName}`);
    
    // Discover local projects
    const discoveredProjects = await clawConnector.discoverProjects();
    console.log(`📂 ${discoveredProjects.length} projetos locais encontrados`);
    
    // Import discovered projects into ProjectManager
    for (const dp of discoveredProjects) {
      const existing = projectManager.getAllProjects().find(p => p.name === dp.name);
      if (!existing) {
        projectManager.createProject(dp.name, dp.description, config.userName);
        console.log(`  + ${dp.name} (${dp.language || 'unknown'})`);
      }
    }
  } catch (error) {
    console.log('⚠️ OpenClaw não detectado - modo standalone');
  }
})();

// Initialize and start Knowledge Sync
const knowledgeSync = getKnowledgeSync(process.cwd());
knowledgeSync.start();

console.log('🧠 Knowledge Sync inicializado');

// Initialize Error Resolver Bots
const errorMonitor = new ErrorMonitorBot();
const rateLimitResolver = new RateLimitResolver();
const timeoutResolver = new TimeoutResolver();

// Start error monitoring
(async () => {
  try {
    await errorMonitor.start();
    await rateLimitResolver.start();
    await timeoutResolver.start();
    console.log('🤖 Error Resolver Bots iniciados');
    console.log('   🚨 ErrorMonitor - Monitorando logs em tempo real');
    console.log('   ⏳ RateLimitResolver - Resolvendo rate limits Claude');
    console.log('   ⏱️ TimeoutResolver - Resolvendo timeouts Kimi');
  } catch (error) {
    console.log('⚠️ Erro ao iniciar Error Resolver Bots:', error);
  }
})();

// Initialize Claw Cluster Manager (failover entre máquinas)
const clawClusterManager = new ClawClusterManager();

// Start cluster manager
(async () => {
  try {
    await clawClusterManager.start();
    console.log('🕸️ Claw Cluster Manager iniciado');
    console.log('   Failover automático entre máquinas');
    console.log('   Load balancing de tarefas');
  } catch (error) {
    console.log('⚠️ Erro ao iniciar Cluster Manager:', error);
  }
})();

// Initialize Media Processor (vídeos e áudios)
const mediaProcessor = new MediaProcessorBot();

// Start media processor
(async () => {
  try {
    await mediaProcessor.start();
    console.log('🎬 Media Processor iniciado');
    console.log('   Monitorando: media/incoming/');
    console.log('   Transcrição automática com Whisper');
  } catch (error) {
    console.log('⚠️ Erro ao iniciar Media Processor:', error);
  }
})();

// ==================== QUICK AUTH ROUTES (Sem senha!) ====================

// Lista usuários disponíveis (Zica, Tiago, Helber)
app.get('/api/auth/users', (req, res) => {
  const users = quickAuth.getAvailableUsers();
  res.json({
    success: true,
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      displayName: u.displayName,
      avatar: u.avatar,
      role: u.role,
      color: u.color,
      isCurrent: u.id === quickAuth.getCurrentUser()?.id
    }))
  });
});

// Seleciona usuário (apenas clica, sem senha!)
app.post('/api/auth/select', (req, res) => {
  try {
    const { userId, rememberMachine } = req.body;
    const user = quickAuth.selectUser(userId, rememberMachine !== false);
    
    if (user) {
      res.json({
        success: true,
        message: `Bem-vindo, ${user.displayName}!`,
        user: {
          id: user.id,
          name: user.name,
          displayName: user.displayName,
          avatar: user.avatar,
          role: user.role,
          color: user.color
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuário atual
app.get('/api/auth/me', (req, res) => {
  const user = quickAuth.getCurrentUser();
  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        displayName: user.displayName,
        avatar: user.avatar,
        role: user.role,
        color: user.color
      }
    });
  } else {
    res.json({
      success: false,
      message: 'Nenhum usuário selecionado'
    });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  quickAuth.logout();
  res.json({ success: true, message: 'Até logo!' });
});

// Troca de usuário
app.post('/api/auth/switch', (req, res) => {
  try {
    const { userId } = req.body;
    quickAuth.logout();
    const user = quickAuth.selectUser(userId);
    
    if (user) {
      res.json({
        success: true,
        message: `Trocado para ${user.displayName}`,
        user: {
          id: user.id,
          name: user.name,
          displayName: user.displayName,
          avatar: user.avatar,
          role: user.role
        }
      });
    } else {
      res.status(400).json({ success: false, error: 'Usuário não encontrado' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Status do QuickAuth
app.get('/api/auth/status', (req, res) => {
  res.json(quickAuth.getStats());
});

// Reseta mapeamento da máquina (útil para trocar usuário na mesma máquina)
app.post('/api/auth/reset-machine', (req, res) => {
  quickAuth.resetMachineMapping();
  res.json({ success: true, message: 'Mapeamento resetado. Selecione seu usuário novamente.' });
});

// ==================== PROTECTED ROUTES ====================

// Health check (público)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    squad: squadManager.getStatus(),
    bots: botManager.getStatus(),
    projects: projectManager.getStatus()
  });
});

app.get('/api/squad', (req, res) => {
  res.json(squadManager.getAllSpecialists());
});

// Helper para obter usuário atual do QuickAuth
const getCurrentUserId = () => quickAuth.getCurrentUser()?.id || 'user-zica';
const isCurrentUserAdmin = () => quickAuth.isAdmin();

// Bots - user sees global bots + their own
app.get('/api/bots', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const bots = botManager.getUserBots(userId, isAdmin);
  res.json(bots);
});

// Global bots (admin only)
app.get('/api/bots/global', (req, res) => {
  if (!isCurrentUserAdmin()) {
    return res.status(403).json({ error: 'Apenas admin' });
  }
  res.json(botManager.getGlobalBots());
});

// Create bot (user creates personal bot, admin can create global)
app.post('/api/bots', (req, res) => {
  try {
    const { name, description, type, isGlobal, projectId, config } = req.body;
    const userId = getCurrentUserId();
    const isAdmin = isCurrentUserAdmin();
    
    // Só admin pode criar bots globais
    const botIsGlobal = isGlobal === true && isAdmin;
    
    const bot = botManager.createBot(
      name, 
      description, 
      type || 'custom',
      userId,
      botIsGlobal,
      projectId,
      config
    );
    
    // Create email for the bot (se for bot de usuário)
    if (!botIsGlobal) {
      const email = emailManager.createEmailForBot(bot.id, bot.name);
      res.json({ ...bot, email });
    } else {
      res.json(bot);
    }
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get specific bot
app.get('/api/bots/:id', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const bot = botManager.getBot(req.params.id, userId, isAdmin);
  if (bot) {
    res.json(bot);
  } else {
    res.status(404).json({ error: 'Bot não encontrado' });
  }
});

// Bot control routes
app.post('/api/bots/:id/start', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const success = botManager.startBot(req.params.id, userId, isAdmin);
  if (success) {
    res.json({ success: true, message: 'Bot iniciado' });
  } else {
    res.status(404).json({ success: false, error: 'Bot não encontrado ou sem permissão' });
  }
});

app.post('/api/bots/:id/pause', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const success = botManager.pauseBot(req.params.id, userId, isAdmin);
  if (success) {
    res.json({ success: true, message: 'Bot pausado' });
  } else {
    res.status(404).json({ success: false, error: 'Bot não encontrado ou sem permissão' });
  }
});

app.post('/api/bots/:id/stop', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const success = botManager.stopBot(req.params.id, userId, isAdmin);
  if (success) {
    res.json({ success: true, message: 'Bot parado' });
  } else {
    res.status(404).json({ success: false, error: 'Bot não encontrado ou sem permissão' });
  }
});

app.delete('/api/bots/:id', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const success = botManager.deleteBot(req.params.id, userId, isAdmin);
  if (success) {
    res.json({ success: true, message: 'Bot deletado' });
  } else {
    res.status(403).json({ success: false, error: 'Não foi possível deletar o bot' });
  }
});

// Projects - user sees only their projects (admin sees all)
app.get('/api/projects', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const projects = projectManager.getUserProjects(userId, isAdmin);
  res.json(projects);
});

// All projects (admin only)
app.get('/api/projects/all', (req, res) => {
  if (!isCurrentUserAdmin()) {
    return res.status(403).json({ error: 'Apenas admin' });
  }
  res.json(projectManager.getAllProjects());
});

// Create project
app.post('/api/projects', (req, res) => {
  try {
    const { name, description, client, deadline, budget, tags } = req.body;
    const userId = getCurrentUserId();
    const project = projectManager.createProject(
      name, 
      description, 
      userId,
      { client, deadline, budget, tags }
    );
    res.json(project);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get specific project
app.get('/api/projects/:id', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const project = projectManager.getProject(req.params.id, userId, isAdmin);
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: 'Projeto não encontrado' });
  }
});

// Update project
app.patch('/api/projects/:id', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const project = projectManager.updateProject(
    req.params.id, 
    req.body, 
    userId, 
    isAdmin
  );
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: 'Projeto não encontrado ou sem permissão' });
  }
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const success = projectManager.deleteProject(req.params.id, userId, isAdmin);
  if (success) {
    res.json({ success: true, message: 'Projeto deletado' });
  } else {
    res.status(403).json({ error: 'Não foi possível deletar o projeto' });
  }
});

// Add member to project
app.post('/api/projects/:id/members', (req, res) => {
  const { userId: memberId } = req.body;
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const success = projectManager.addMember(req.params.id, memberId, userId, isAdmin);
  if (success) {
    res.json({ success: true, message: 'Membro adicionado' });
  } else {
    res.status(403).json({ error: 'Não foi possível adicionar membro' });
  }
});

// Remove member from project
app.delete('/api/projects/:id/members/:memberId', (req, res) => {
  const userId = getCurrentUserId();
  const isAdmin = isCurrentUserAdmin();
  const success = projectManager.removeMember(req.params.id, req.params.memberId, userId, isAdmin);
  if (success) {
    res.json({ success: true, message: 'Membro removido' });
  } else {
    res.status(403).json({ error: 'Não foi possível remover membro' });
  }
});

// Email routes
app.get('/api/email', (req, res) => {
  res.json(emailManager.getAllEmails());
});

app.get('/api/email/:botId', (req, res) => {
  const emails = emailManager.getEmails(req.params.botId);
  res.json(emails);
});

app.post('/api/email/:botId/send', (req, res) => {
  const { to, subject, body } = req.body;
  const email = emailManager.sendEmail(req.params.botId, to, subject, body);
  res.json(email);
});

// Billing routes
app.get('/api/billing', (req, res) => {
  res.json(billingManager.getStats());
});

app.get('/api/billing/costs', (req, res) => {
  res.json(billingManager.getCosts());
});

// Gamification routes
app.get('/api/gamification/stats', (req, res) => {
  res.json(gamificationManager.getUserStats('user-1'));
});

app.get('/api/gamification/achievements', (req, res) => {
  res.json(gamificationManager.getAchievements('user-1'));
});

app.get('/api/gamification/leaderboard', (req, res) => {
  res.json(gamificationManager.getLeaderboard());
});

// Cluster routes
app.get('/api/cluster', (req, res) => {
  res.json(clusterManager.getClusterStats());
});

app.get('/api/cluster/nodes', (req, res) => {
  res.json(clusterManager.getNodes());
});

app.get('/api/cluster/topology', (req, res) => {
  res.json(clusterManager.getTopology());
});

// Project Teste Real - Protected Routes
// Senha: "real"
app.get('/api/teste-real', requireAuth, (req, res) => {
  const project = projectManager.getProject('project-1773285880948');
  if (!project) {
    return res.status(404).json({ error: 'Projeto não encontrado' });
  }
  const bots = botManager.getBotsByProject('project-1773285880948');
  res.json({
    project,
    bots,
    message: '🔒 Projeto Teste Real - Acesso autorizado',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/teste-real/bots/:action', requireAuth, (req, res) => {
  const { action } = req.params;
  const bots = botManager.getBotsByProject('project-1773285880948');
  
  let results = [];
  for (const bot of bots) {
    let success = false;
    if (action === 'start') success = botManager.startBot(bot.id);
    else if (action === 'pause') success = botManager.pauseBot(bot.id);
    else if (action === 'stop') success = botManager.stopBot(bot.id);
    
    results.push({ botId: bot.id, action, success });
  }
  
  res.json({
    message: `✅ Ação "${action}" executada em ${bots.length} bots`,
    results,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/teste-real/earnings', requireAuth, (req, res) => {
  // Simulated earnings data for Teste Real
  res.json({
    project: 'Teste Real',
    earnings: {
      total: 0,
      pending: 0,
      today: 0,
      potential: 'Calculando...'
    },
    activities: [
      { time: new Date().toISOString(), action: 'Projeto iniciado', value: 0 }
    ],
    nextActions: [
      'Criar contas em plataformas freelancer',
      'Publicar primeiro artigo no Medium',
      'Gerar primeiros leads qualificados'
    ],
    message: '💰 Dashboard de ganhos - Projeto Teste Real',
    timestamp: new Date().toISOString()
  });
});

// Knowledge Sync routes
app.get('/api/sync/status', (req, res) => {
  res.json(knowledgeSync.getStatus());
});

app.post('/api/sync/trigger', async (req, res) => {
  try {
    const result = await knowledgeSync.sync();
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/sync/stats', async (req, res) => {
  try {
    const stats = await knowledgeSync.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sync/config', (req, res) => {
  try {
    knowledgeSync.updateConfig(req.body);
    res.json({ success: true, config: knowledgeSync.getStatus().config });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// OpenClaw Connection routes
app.get('/api/claw/status', (req, res) => {
  res.json(clawConnector.getStatus());
});

app.post('/api/claw/connect', async (req, res) => {
  try {
    const config = await clawConnector.autoConnect();
    res.json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/claw/projects', (req, res) => {
  res.json(clawConnector.getProjects());
});

app.post('/api/claw/discover', async (req, res) => {
  try {
    const projects = await clawConnector.discoverProjects();
    res.json({ success: true, projects, count: projects.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Security Sentinel routes
app.get('/api/security/status', (req, res) => {
  res.json(securitySentinel.getStatus());
});

app.get('/api/security/alerts', (req, res) => {
  const { severity } = req.query;
  res.json(securitySentinel.getAlerts(severity as string));
});

// Error Resolver Bot routes
app.get('/api/error-bots/status', (req, res) => {
  res.json({
    errorMonitor: errorMonitor.getStats(),
    rateLimitResolver: { status: rateLimitResolver.status },
    timeoutResolver: { status: timeoutResolver.status }
  });
});

app.post('/api/bots/rate-limit-resolver/trigger', async (req, res) => {
  try {
    await rateLimitResolver.resolve({
      type: 'manual_trigger',
      timestamp: new Date().toISOString(),
      context: 'Manual trigger from API'
    });
    res.json({ success: true, message: 'RateLimitResolver acionado' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/bots/timeout-resolver/trigger', async (req, res) => {
  try {
    await timeoutResolver.resolve({
      type: 'manual_trigger',
      timestamp: new Date().toISOString(),
      context: 'Manual trigger from API'
    });
    res.json({ success: true, message: 'TimeoutResolver acionado' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/error-bots/reset', (req, res) => {
  try {
    rateLimitResolver.resetCooldown?.();
    timeoutResolver.resetTimeoutCounter?.();
    res.json({ success: true, message: 'Contadores resetados' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Claw Cluster routes (failover entre máquinas)
app.get('/api/cluster/claws', (req, res) => {
  res.json(clawClusterManager.getStats());
});

app.post('/api/cluster/claws', (req, res) => {
  try {
    const { id, name, host, port, userName, capabilities } = req.body;
    clawClusterManager.registerClaw({ id, name, host, port, userName, capabilities });
    res.json({ success: true, message: 'Claw registrado' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cluster/redirect', async (req, res) => {
  try {
    const target = await clawClusterManager.redirectTask(req.body);
    if (target) {
      res.json({ success: true, target, message: `Tarefa redirecionada para ${target.name}` });
    } else {
      res.status(503).json({ success: false, error: 'Nenhum claw disponível' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Media Processor routes
app.get('/api/media/status', (req, res) => {
  res.json(mediaProcessor.getStats());
});

app.post('/api/media/process', async (req, res) => {
  try {
    const { filePath } = req.body;
    const result = await mediaProcessor.processFile(filePath);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota para upload de mídia (simulada)
app.post('/api/media/upload', async (req, res) => {
  try {
    // Aqui processaria upload real de arquivo
    // Por enquanto, apenas retorna instruções
    res.json({
      success: true,
      message: 'Coloque arquivos em media/incoming/ para processamento automático',
      supportedFormats: ['.mp4', '.mov', '.mp3', '.wav', '.m4a'],
      instructions: [
        '1. Copie vídeos/áudios para: media/incoming/',
        '2. Media Processor detecta automaticamente',
        '3. Aguarde processamento (transcrição)',
        '4. Resultado em: media/processed/'
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cluster/distribute', async (req, res) => {
  await clusterManager.distributeLoad();
  res.json({ success: true });
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('chat:message', async (data) => {
    const { message, userId } = data;
    
    // Process message with Tita
    const response = await chatService.processMessage(message, userId);
    
    socket.emit('chat:response', {
      id: Date.now(),
      sender: 'tita',
      message: response.message,
      actions: response.actions,
      timestamp: new Date().toISOString()
    });

    // If specialist is needed, summon them
    if (response.specialist) {
      const specialist = squadManager.summonSpecialist(response.specialist);
      socket.emit('squad:summoned', {
        specialist: specialist.name,
        avatar: specialist.avatar,
        message: `${specialist.name} entrou no chat!`
      });
    }
  });

  socket.on('squad:task', async (data) => {
    const { specialistId, task, context } = data;
    const result = await squadManager.assignTask(specialistId, task, context);
    socket.emit('squad:result', result);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4444;
httpServer.listen(PORT, () => {
  console.log(`🚀 Titanio Backend running on port ${PORT}`);
  console.log(`📡 WebSocket ready for real-time connections`);
  console.log(`👥 Squad ready with ${squadManager.getAllSpecialists().length} specialists`);
  console.log(`📧 Email system: ${emailManager.getStats().botsWithEmail} bots with email`);
  console.log(`💰 Billing: $${billingManager.getStats().monthlySpend.toFixed(2)} this month`);
  console.log(`🎮 Gamification: Level ${gamificationManager.getUserStats('user-1').level}`);
  console.log(`🖥️ Cluster: ${clusterManager.getClusterStats().onlineNodes}/${clusterManager.getClusterStats().totalNodes} nodes online`);
  console.log(`🧠 Combined RAM: ${clusterManager.getClusterStats().freeRamMB}MB free / ${clusterManager.getClusterStats().totalRamMB}MB total`);
  console.log(`🕸️ Claw Cluster: ${clawClusterManager.getStats().online}/${clawClusterManager.getStats().total} claws online`);
  console.log(`🎬 Media Processor: ${mediaProcessor.getStats().processedFiles} arquivos processados`);
});
