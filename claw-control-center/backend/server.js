/**
 * Claw Control Center - Backend
 * Arquitetura Híbrida: Cada nó gerencia local + federa com outros
 */

const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configurações
const CONFIG = {
  PORT: process.env.CCC_PORT || 3000,
  NODE_NAME: process.env.CCC_NODE_NAME || require('os').hostname(),
  OPENCLAW_GATEWAY: process.env.OPENCLAW_GATEWAY || 'ws://127.0.0.1:18789',
  OPENCLAW_API: process.env.OPENCLAW_API || 'http://127.0.0.1:18789',
  FEDERATION_NODES: JSON.parse(process.env.FEDERATION_NODES || '[]'),
  WORKSPACE: process.env.OPENCLAW_WORKSPACE || '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace',
  DATA_DIR: process.env.CCC_DATA_DIR || './data'
};

// Estado global
const state = {
  nodes: new Map(), // Map<nodeId, NodeInfo>
  agents: new Map(), // Map<agentId, AgentInfo>
  sessions: new Map(), // Map<sessionId, SessionInfo>
  logs: [], // Array<LogEntry>
  jobs: new Map(), // Map<jobId, CronJob>
  connections: new Map() // Map<nodeId, WebSocket>
};

// Inicialização
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

// ==================== API LOCAL ====================

/**
 * Descobre agents e sessões do OpenClaw local
 */
async function discoverLocalAgents() {
  try {
    // Tenta conectar ao gateway OpenClaw
    const response = await axios.get(`${CONFIG.OPENCLAW_API}/api/sessions`, {
      timeout: 5000,
      headers: { 'Accept': 'application/json' }
    }).catch(() => ({ data: [] }));

    const sessions = response.data || [];
    
    // Processa sessões em agents
    const localAgents = sessions.map(session => ({
      id: session.key || session.id,
      nodeId: CONFIG.NODE_NAME,
      name: extractAgentName(session),
      type: classifyAgentType(session),
      status: session.active ? 'running' : 'idle',
      model: session.model || 'unknown',
      tokensIn: session.tokens?.in || 0,
      tokensOut: session.tokens?.out || 0,
      uptime: session.age || 0,
      lastActivity: new Date(session.updatedAt || Date.now()),
      sessionKey: session.key,
      pid: session.pid,
      capabilities: session.capabilities || []
    }));

    // Atualiza estado
    for (const agent of localAgents) {
      state.agents.set(agent.id, agent);
    }

    return localAgents;
  } catch (err) {
    console.log('OpenClaw gateway não disponível, modo standalone');
    return [];
  }
}

function extractAgentName(session) {
  if (session.key?.includes('cron')) return `Cron-${session.key.slice(-8)}`;
  if (session.key?.includes('codex')) return 'Codex Agent';
  if (session.key?.includes('main')) return 'Main Agent';
  return session.key?.split(':').pop() || 'Unknown';
}

function classifyAgentType(session) {
  if (session.key?.includes('cron')) return { type: 'fixed', persistence: 'permanent' };
  if (session.key?.includes('main')) return { type: 'fixed', persistence: 'permanent' };
  if (session.key?.includes('codex')) return { type: 'temporary', persistence: 'ephemeral' };
  return { type: 'temporary', persistence: 'session' };
}

// ==================== FEDERAÇÃO ====================

/**
 * Conecta a outro nó da federação
 */
async function connectToNode(nodeConfig) {
  const { id, host, port, token } = nodeConfig;
  
  try {
    // Verifica se já conectado
    if (state.connections.has(id)) {
      return state.connections.get(id);
    }

    // Testa conexão HTTP primeiro
    const health = await axios.get(`http://${host}:${port}/api/health`, {
      timeout: 3000,
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    if (health.data.status !== 'ok') {
      throw new Error('Node not healthy');
    }

    // Conecta WebSocket para updates em tempo real
    const wsUrl = `ws://${host}:${port}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log(`Conectado ao nó: ${id} (${host}:${port})`);
      ws.send(JSON.stringify({
        type: 'auth',
        nodeId: CONFIG.NODE_NAME,
        token: token
      }));
    });

    ws.on('message', (data) => {
      handleFederatedMessage(id, JSON.parse(data));
    });

    ws.on('close', () => {
      console.log(`Desconectado do nó: ${id}`);
      state.connections.delete(id);
      state.nodes.delete(id);
      // Retry em 30s
      setTimeout(() => connectToNode(nodeConfig), 30000);
    });

    ws.on('error', (err) => {
      console.error(`Erro na conexão com ${id}:`, err.message);
    });

    state.connections.set(id, ws);
    state.nodes.set(id, {
      id,
      host,
      port,
      status: 'connected',
      lastSeen: new Date(),
      agents: [],
      info: health.data
    });

    return ws;
  } catch (err) {
    console.error(`Falha ao conectar em ${id}:`, err.message);
    // Retry em 30s
    setTimeout(() => connectToNode(nodeConfig), 30000);
    return null;
  }
}

/**
 * Processa mensagens de nós federados
 */
function handleFederatedMessage(fromNodeId, message) {
  switch (message.type) {
    case 'agent_update':
      // Atualiza info de agent de outro nó
      for (const agent of message.agents) {
        agent.nodeId = fromNodeId;
        state.agents.set(`${fromNodeId}:${agent.id}`, agent);
      }
      broadcastToClients({ type: 'agents_updated', source: fromNodeId });
      break;

    case 'log_entry':
      // Recebe log de outro nó
      message.log.nodeId = fromNodeId;
      addLogEntry(message.log);
      break;

    case 'command_request':
      // Outro nó quer executar comando aqui
      handleRemoteCommand(fromNodeId, message);
      break;

    case 'node_info':
      // Info do nó
      state.nodes.set(fromNodeId, { ...state.nodes.get(fromNodeId), ...message.info });
      break;
  }
}

/**
 * Broadcast para todos os clientes WebSocket locais
 */
function broadcastToClients(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// ==================== ROTAS API ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    node: CONFIG.NODE_NAME,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    openclaw: state.agents.size > 0 ? 'connected' : 'standalone',
    federation: {
      connected: state.connections.size,
      total: CONFIG.FEDERATION_NODES.length
    }
  });
});

// Lista todos os agents (locais + federados)
app.get('/api/agents', async (req, res) => {
  // Atualiza agents locais
  await discoverLocalAgents();

  // Coleta agents de todos os nós
  const allAgents = Array.from(state.agents.values());
  
  res.json({
    node: CONFIG.NODE_NAME,
    agents: allAgents,
    summary: {
      total: allAgents.length,
      running: allAgents.filter(a => a.status === 'running').length,
      fixed: allAgents.filter(a => a.type?.type === 'fixed').length,
      temporary: allAgents.filter(a => a.type?.type === 'temporary').length,
      byNode: allAgents.reduce((acc, a) => {
        acc[a.nodeId] = (acc[a.nodeId] || 0) + 1;
        return acc;
      }, {})
    }
  });
});

// Detalhes de um agent
app.get('/api/agents/:id', (req, res) => {
  const agent = state.agents.get(req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }
  res.json(agent);
});

// Executa ação em um agent
app.post('/api/agents/:id/action', async (req, res) => {
  const { id } = req.params;
  const { action, payload } = req.body;
  const agent = state.agents.get(id);

  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Se agent é remoto (federado), proxy para o nó correto
  if (agent.nodeId !== CONFIG.NODE_NAME) {
    const node = state.nodes.get(agent.nodeId);
    if (!node) {
      return res.status(503).json({ error: 'Node unavailable' });
    }
    
    try {
      const response = await axios.post(
        `http://${node.host}:${node.port}/api/agents/${id}/action`,
        { action, payload },
        { timeout: 10000 }
      );
      return res.json(response.data);
    } catch (err) {
      return res.status(502).json({ error: 'Proxy failed', details: err.message });
    }
  }

  // Executa ação local
  const result = await executeLocalAction(agent, action, payload);
  res.json(result);
});

async function executeLocalAction(agent, action, payload) {
  switch (action) {
    case 'pause':
      // Envia sinal de pausa para a sessão
      return { status: 'paused', agent: agent.id };
    
    case 'resume':
      return { status: 'resumed', agent: agent.id };
    
    case 'kill':
      // Mata a sessão
      return { status: 'killed', agent: agent.id };
    
    case 'send_message':
      // Envia mensagem para a sessão
      return { status: 'sent', message: payload.message };
    
    case 'get_logs':
      // Retorna logs do agent
      return { logs: getAgentLogs(agent.id) };
    
    default:
      return { error: 'Unknown action' };
  }
}

// Logs consolidados (local + federado)
app.get('/api/logs', (req, res) => {
  const { agentId, nodeId, level, limit = 100, since } = req.query;
  
  let logs = state.logs;
  
  if (agentId) logs = logs.filter(l => l.agentId === agentId);
  if (nodeId) logs = logs.filter(l => l.nodeId === nodeId);
  if (level) logs = logs.filter(l => l.level === level);
  if (since) logs = logs.filter(l => new Date(l.timestamp) > new Date(since));
  
  logs = logs.slice(-limit);
  
  res.json({ logs, total: state.logs.length });
});

// Gerenciamento de Cron Jobs
app.get('/api/jobs', async (req, res) => {
  // Tenta pegar do OpenClaw local
  try {
    const response = await axios.get(`${CONFIG.OPENCLAW_API}/api/cron/jobs`, {
      timeout: 5000
    });
    res.json({ jobs: response.data, source: 'openclaw' });
  } catch {
    // Retorna jobs gerenciados pelo CCC
    res.json({ 
      jobs: Array.from(state.jobs.values()),
      source: 'ccc'
    });
  }
});

app.post('/api/jobs', (req, res) => {
  const job = {
    id: uuidv4(),
    createdAt: new Date(),
    nodeId: CONFIG.NODE_NAME,
    ...req.body
  };
  state.jobs.set(job.id, job);
  res.json(job);
});

// Lista nós da federação
app.get('/api/nodes', (req, res) => {
  const nodes = Array.from(state.nodes.values()).map(n => ({
    id: n.id,
    host: n.host,
    port: n.port,
    status: n.status,
    lastSeen: n.lastSeen,
    agentCount: Array.from(state.agents.values()).filter(a => a.nodeId === n.id).length
  }));
  
  // Adiciona nó local
  nodes.unshift({
    id: CONFIG.NODE_NAME,
    host: 'localhost',
    port: CONFIG.PORT,
    status: 'local',
    lastSeen: new Date(),
    agentCount: Array.from(state.agents.values()).filter(a => a.nodeId === CONFIG.NODE_NAME).length
  });
  
  res.json({ nodes, thisNode: CONFIG.NODE_NAME });
});

// ==================== TASKS & PIPELINES ====================

const TASKS_FILE = path.join(CONFIG.WORKSPACE, 'pasta-do-tita', 'tasks.json');
const LIGHTNING_TRACES = path.join(CONFIG.WORKSPACE, 'memory', 'lightning', 'traces.jsonl');
const LIGHTNING_STATS = path.join(CONFIG.WORKSPACE, 'memory', 'lightning', 'specialist-stats.json');
const SPECIALISTS_DIR = path.join(CONFIG.WORKSPACE, 'pasta-do-tita', 'memoria-especialistas');

// Pipelines automáticos por keyword
const PIPELINES = [
  { keywords: ['video', 'vídeo', 'reels'], chain: ['content-writer', 'design-wizard', 'instagramer'], name: 'Video Pipeline' },
  { keywords: ['bug', 'fix', 'erro', 'crash', '500'], chain: ['debug-hunter', 'code-ninja'], name: 'Bug Fix Pipeline' },
  { keywords: ['instagram', 'post', 'social'], chain: ['content-writer', 'design-wizard', 'instagramer'], name: 'Social Media Pipeline' },
  { keywords: ['tradução', 'translate', 'inglês'], chain: ['tradutor', 'content-writer'], name: 'Translation Pipeline' },
  { keywords: ['deploy', 'publicar', 'release'], chain: ['code-ninja', 'devops-ninja'], name: 'Deploy Pipeline' },
  { keywords: ['marketing', 'campanha', 'ads'], chain: ['marketing-director', 'content-writer', 'instagramer'], name: 'Marketing Pipeline' },
  { keywords: ['segurança', 'security', 'vulnerabilidade'], chain: ['security-guardian', 'openclaw-specialist'], name: 'Security Pipeline' },
  { keywords: ['design', 'ui', 'layout', 'thumbnail'], chain: ['design-wizard', 'code-ninja'], name: 'Design Pipeline' },
  { keywords: ['pesquisa', 'research', 'análise'], chain: ['memory-bot', 'code-ninja'], name: 'Research Pipeline' },
  { keywords: ['automação', 'cron', 'workflow', 'n8n'], chain: ['automation-bot', 'devops-ninja'], name: 'Automation Pipeline' },
  { keywords: ['ios', 'apple', 'app store'], chain: ['ios-specialist', 'code-ninja', 'debug-hunter'], name: 'iOS Pipeline' },
  { keywords: ['polymarket', 'trading', 'investimento'], chain: ['trader', 'gold-digger'], name: 'Trading Pipeline' },
];

async function loadTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { active_tasks: [], completed_tasks: [] };
  }
}

async function saveTasks(tasks) {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function detectPipeline(title) {
  const lower = title.toLowerCase();
  for (const pipeline of PIPELINES) {
    if (pipeline.keywords.some(kw => lower.includes(kw))) {
      return pipeline;
    }
  }
  return null;
}

// Dedup lessons (anti-loop)
async function deduplicateLessons(specialist) {
  const lessonsPath = path.join(SPECIALISTS_DIR, specialist, 'LESSONS.md');
  try {
    const content = await fs.readFile(lessonsPath, 'utf-8');
    const lines = content.split('\n');
    const seen = new Set();
    const deduped = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length < 10 || !seen.has(trimmed)) {
        seen.add(trimmed);
        deduped.push(line);
      }
    }
    if (deduped.length < lines.length) {
      await fs.writeFile(lessonsPath, deduped.join('\n'));
      return lines.length - deduped.length;
    }
    return 0;
  } catch { return 0; }
}

// Log to Lightning
async function logToLightning(specialist, task, result, score, notes = '') {
  const trace = {
    timestamp: new Date().toISOString(),
    specialist,
    task: task.substring(0, 200),
    result,
    score,
    notes,
    reward: score / 10.0,
    span_type: 'agent_action'
  };
  try {
    await fs.appendFile(LIGHTNING_TRACES, JSON.stringify(trace) + '\n');
    // Update stats
    let stats = {};
    try { stats = JSON.parse(await fs.readFile(LIGHTNING_STATS, 'utf-8')); } catch {}
    if (!stats[specialist]) {
      stats[specialist] = { total_tasks: 0, successes: 0, failures: 0, total_score: 0, avg_score: 0, streak: 0, best_streak: 0, grade: 'N/A' };
    }
    const s = stats[specialist];
    s.total_tasks++;
    s.total_score += score;
    s.avg_score = Math.round((s.total_score / s.total_tasks) * 100) / 100;
    if (result === 'success') { s.successes++; s.streak++; s.best_streak = Math.max(s.best_streak, s.streak); }
    else { s.failures++; s.streak = 0; }
    s.grade = s.avg_score >= 9 ? 'AAA 🏆' : s.avg_score >= 8 ? 'AA ⭐' : s.avg_score >= 7 ? 'A 🟢' : s.avg_score >= 5 ? 'B 🟡' : s.avg_score >= 3 ? 'C 🟠' : 'D 🔴';
    s.last_task = trace.timestamp;
    await fs.writeFile(LIGHTNING_STATS, JSON.stringify(stats, null, 2));
  } catch (err) { console.error('Lightning log error:', err.message); }
}

// POST /api/tasks/delegate — Delegar task com pipeline automático
app.post('/api/tasks/delegate', async (req, res) => {
  const { title, requester = 'Zica', specialist, context = '', project_path = '' } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });

  const pipeline = specialist ? null : detectPipeline(title);
  const chain = specialist ? [specialist] : (pipeline ? pipeline.chain : ['code-ninja']);

  const tasks = await loadTasks();
  const task = {
    id: uuidv4(),
    title,
    requester,
    assigned_to: chain[0],
    status: 'active',
    handoff_chain: chain,
    handoff_index: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    result: null,
    mode: pipeline ? 'pipeline' : 'supervised',
    context,
    project_path,
    pipeline_name: pipeline ? pipeline.name : null
  };
  tasks.active_tasks.push(task);
  await saveTasks(tasks);

  broadcastToClients({ type: 'task_delegated', task });
  res.json({ task, pipeline: pipeline ? pipeline.name : 'manual' });
});

// GET /api/tasks — Listar tasks
app.get('/api/tasks', async (req, res) => {
  const tasks = await loadTasks();
  res.json(tasks);
});

// POST /api/tasks/:id/handoff — Handoff para próximo especialista
app.post('/api/tasks/:id/handoff', async (req, res) => {
  const tasks = await loadTasks();
  const task = tasks.active_tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { result = '', score = 7 } = req.body;

  // Log current specialist
  await logToLightning(task.assigned_to, task.title, 'success', score, `Handoff: ${result.substring(0, 100)}`);
  await deduplicateLessons(task.assigned_to);

  // Move to next in chain
  task.handoff_index++;
  if (task.handoff_index < task.handoff_chain.length) {
    task.assigned_to = task.handoff_chain[task.handoff_index];
    task.updated_at = new Date().toISOString();
    task.status = 'active';
  } else {
    // Chain complete
    task.status = 'completed';
    task.result = result;
    task.updated_at = new Date().toISOString();
    tasks.completed_tasks.push(task);
    tasks.active_tasks = tasks.active_tasks.filter(t => t.id !== task.id);
  }

  await saveTasks(tasks);
  broadcastToClients({ type: 'task_updated', task });
  res.json({ task });
});

// GET /api/tasks/pipelines — Listar pipelines disponíveis
app.get('/api/tasks/pipelines', (req, res) => {
  res.json({ pipelines: PIPELINES });
});

// POST /api/tasks/:id/complete — Completar task + auto-log Lightning
app.post('/api/tasks/:id/complete', async (req, res) => {
  const tasks = await loadTasks();
  const task = tasks.active_tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { result = '', score = 8 } = req.body;

  task.status = 'completed';
  task.result = result;
  task.updated_at = new Date().toISOString();

  // Auto-log Lightning
  await logToLightning(task.assigned_to, task.title, 'success', score, result.substring(0, 200));
  
  // Dedup lessons
  await deduplicateLessons(task.assigned_to);

  // Append lesson to specialist
  const lessonPath = path.join(SPECIALISTS_DIR, task.assigned_to, 'LESSONS.md');
  try {
    const lesson = `\n\n## ${new Date().toISOString().substring(0, 16)} — ${task.title.substring(0, 60)}\n- Status: ✅ Sucesso (score: ${score}/10)\n- Resultado: ${result.substring(0, 200)}\n`;
    await fs.appendFile(lessonPath, lesson);
  } catch {}

  tasks.completed_tasks.push(task);
  tasks.active_tasks = tasks.active_tasks.filter(t => t.id !== task.id);
  await saveTasks(tasks);

  broadcastToClients({ type: 'task_completed', task });
  res.json({ task, lightning_logged: true });
});

// GET /api/lightning/report — Performance dos especialistas
app.get('/api/lightning/report', async (req, res) => {
  try {
    const stats = JSON.parse(await fs.readFile(LIGHTNING_STATS, 'utf-8'));
    const sorted = Object.entries(stats).sort((a, b) => b[1].avg_score - a[1].avg_score);
    const total_tasks = Object.values(stats).reduce((s, v) => s + v.total_tasks, 0);
    const total_success = Object.values(stats).reduce((s, v) => s + v.successes, 0);
    const avg = total_tasks > 0 ? Math.round(Object.values(stats).reduce((s, v) => s + v.total_score, 0) / total_tasks * 100) / 100 : 0;
    res.json({ specialists: Object.fromEntries(sorted), total_tasks, total_success, team_average: avg });
  } catch {
    res.json({ specialists: {}, total_tasks: 0, total_success: 0, team_average: 0 });
  }
});

// GET /api/lightning/traces — Traces recentes
app.get('/api/lightning/traces', async (req, res) => {
  const { specialist, limit = 20 } = req.query;
  try {
    const data = await fs.readFile(LIGHTNING_TRACES, 'utf-8');
    let traces = data.trim().split('\n').map(l => JSON.parse(l));
    if (specialist) traces = traces.filter(t => t.specialist === specialist);
    traces = traces.slice(-parseInt(limit));
    res.json({ traces, total: traces.length });
  } catch {
    res.json({ traces: [], total: 0 });
  }
});

// ==================== FILE MANAGER ====================

// File Manager - Lista arquivos do workspace
app.get('/api/files', async (req, res) => {
  const { path: relPath = '' } = req.query;
  const fullPath = path.join(CONFIG.WORKSPACE, relPath);
  
  try {
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const files = entries.map(e => ({
      name: e.name,
      type: e.isDirectory() ? 'directory' : 'file',
      path: path.join(relPath, e.name)
    }));
    res.json({ files, path: relPath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== WEBSOCKET ====================

wss.on('connection', (ws, req) => {
  console.log('Novo cliente conectado ao Control Center');
  
  // Envia estado atual
  ws.send(JSON.stringify({
    type: 'init',
    node: CONFIG.NODE_NAME,
    agents: Array.from(state.agents.values()),
    nodes: Array.from(state.nodes.values())
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      handleClientMessage(ws, msg);
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

function handleClientMessage(ws, msg) {
  switch (msg.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;
    
    case 'subscribe_agent':
      // Cliente quer updates de um agent específico
      ws.agentSubscription = msg.agentId;
      break;
    
    case 'execute_command':
      // Cliente quer executar comando em um agent
      handleRemoteCommand(CONFIG.NODE_NAME, msg);
      break;
  }
}

// ==================== HELPERS ====================

function addLogEntry(log) {
  state.logs.push({
    ...log,
    timestamp: log.timestamp || new Date()
  });
  
  // Mantém apenas últimos 10k logs
  if (state.logs.length > 10000) {
    state.logs = state.logs.slice(-10000);
  }
  
  broadcastToClients({ type: 'new_log', log });
}

function getAgentLogs(agentId) {
  return state.logs.filter(l => l.agentId === agentId).slice(-100);
}

// ==================== STARTUP ====================

async function start() {
  // Garante diretório de dados
  await fs.mkdir(CONFIG.DATA_DIR, { recursive: true });
  
  // Conecta a nós federados
  for (const node of CONFIG.FEDERATION_NODES) {
    connectToNode(node);
  }
  
  // Descobre agents locais periodicamente
  setInterval(discoverLocalAgents, 5000);
  await discoverLocalAgents();
  
  // Inicia servidor
  server.listen(CONFIG.PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║        🎛️ CLAW CONTROL CENTER                          ║
╠════════════════════════════════════════════════════════╣
║  Node: ${CONFIG.NODE_NAME.padEnd(45)} ║
║  Port: ${CONFIG.PORT.toString().padEnd(45)} ║
║  OpenClaw: ${CONFIG.OPENCLAW_GATEWAY.padEnd(41)} ║
║  Federation: ${CONFIG.FEDERATION_NODES.length.toString().padEnd(39)} ║
╚════════════════════════════════════════════════════════╝

Dashboard: http://localhost:${CONFIG.PORT}
API: http://localhost:${CONFIG.PORT}/api
    `);
  });
}

start().catch(console.error);
