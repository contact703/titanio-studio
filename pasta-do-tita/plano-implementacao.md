# 🏗️ Plano de Implementação — Titanio Dashboard
**Arquiteto:** Tita (subagente sênior)  
**Data:** 2026-03-13  
**Baseado em:** análise do projeto, code review, design review, pesquisas OpenClaw

---

## 🚨 SITUAÇÃO ATUAL (RESUMO DO PROBLEMA)

| Problema | Causa Raiz | Impacto |
|---|---|---|
| CSS branco / sem dark theme | Tailwind não está gerando as classes custom | Visual completamente quebrado |
| WebSocket "Desconectado" | Frontend tenta porta 4444, backend pode não estar rodando, ou DB/Redis ausentes | Funcionalidade zero |
| Dados hardcoded | Frontend não chama os endpoints do backend | Dashboard "falso" |
| Múltiplos Next.js | Processos zumbi de sessões anteriores | Conflitos de porta |

---

## 📋 ORDEM DE IMPLEMENTAÇÃO

As fases estão ordenadas por dependência. Não pular fases.

```
FASE 0: Limpar ambiente (30 min)
FASE 1: Corrigir CSS/Tailwind (1h)
FASE 2: Fazer backend rodar sem PostgreSQL/Redis (2h)
FASE 3: Conectar frontend ao backend real (3h)
FASE 4: Métricas reais de sistema (2h)
FASE 5: Cluster/Nodes OpenClaw reais (3h)
FASE 6: Chat com Tita funcional via Socket.io (2h)
FASE 7: Segurança mínima (1h)
```

---

## FASE 0: Limpar Ambiente

### 0.1 Matar processos conflitantes

```bash
# Matar todos os Next.js/Node na porta 3000 e 4444
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:4444 | xargs kill -9 2>/dev/null

# Verificar se limpo
lsof -i:3000
lsof -i:4444
```

### 0.2 Definir diretório de trabalho

```bash
# O projeto está em:
PROJECT_DIR="/Volumes/TITA_039/backup-projetos/titanio-dashboard-backup-20260312-0801/code"
```

---

## FASE 1: Corrigir CSS/Tailwind

### Problema
O dark theme usa classes custom (`bg-dark`, `text-cyan`, `border-glass`) definidas no `tailwind.config.js` mas que provavelmente não estão sendo detectadas pelo Tailwind.

### 1.1 Verificar tailwind.config.js

**Arquivo:** `frontend/tailwind.config.js`

Verificar se `content` inclui todos os paths:
```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',  // adicionar se não existir
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0f',
          card: '#12121a',
          border: '#1a1a2e',
        },
        cyan: {
          DEFAULT: '#00d4ff',
          glow: 'rgba(0, 212, 255, 0.3)',
        },
        purple: {
          DEFAULT: '#a855f7',
          glow: 'rgba(168, 85, 247, 0.3)',
        },
      },
      // ... resto das configurações
    },
  },
}
```

### 1.2 Corrigir globals.css

**Arquivo:** `frontend/app/globals.css`

Garantir que tenha no início:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Forçar dark mode no body */
body {
  background-color: #0a0a0f;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
}

/* Scrollbar customizado — melhorar contraste */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #12121a; }
::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #00d4ff; }
```

### 1.3 Corrigir layout.tsx

**Arquivo:** `frontend/app/layout.tsx`

```tsx
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' });

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} bg-[#0a0a0f] text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### 1.4 Corrigir next.config.js

**Arquivo:** `frontend/next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remover experimental.appDir (obsoleto no Next.js 14)
};

module.exports = nextConfig;
```

### Como testar FASE 1
```bash
cd $PROJECT_DIR/frontend
npm run dev
# Abrir http://localhost:3000
# Fundo deve ser preto (#0a0a0f), não branco
```

---

## FASE 2: Backend Rodando sem PostgreSQL/Redis

### Problema
O backend tem Prisma instalado mas sem schema. Precisa de PostgreSQL e Redis para funcionar. Estratégia: remover essas dependências e usar storage em memória (já é o que acontece) de forma explícita.

### 2.1 Remover Prisma e Redis do backend

**Arquivo:** `backend/package.json`

Remover das `dependencies`:
- `@prisma/client`
- `prisma`
- `ioredis`
- `bullmq`

Remover dos `scripts`:
- `db:migrate`
- `db:generate`

### 2.2 Corrigir ClusterManager (memory leak + Redis inexistente)

**Arquivo:** `backend/src/services/ClusterManager.ts`

```typescript
// Adicionar no início da classe:
private heartbeatInterval: NodeJS.Timeout | null = null;

// Corrigir startHeartbeat():
private startHeartbeat() {
  this.heartbeatInterval = setInterval(() => {
    this.updateLocalNodeStats();
  }, 30000);
}

// Adicionar método stop():
stop() {
  if (this.heartbeatInterval) {
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
  }
}

// REMOVER: import { Redis } from 'ioredis';
// REMOVER: private redis?: Redis;

// Corrigir getTopology() — bug array aninhado:
getTopology() {
  const online = this.nodes.filter(n => n.status === 'online').map(n => n.id);
  return { nodes: online, edges: [] }; // não [online]!
}
```

### 2.3 Corrigir index.ts — erros críticos

**Arquivo:** `backend/src/index.ts`

```typescript
// 1. Alinhar CORS entre REST e Socket.io
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({ origin: CORS_ORIGIN }));

const io = new Server(httpServer, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] }
});

// 2. Adicionar try/catch no handler de chat:
socket.on('chat:message', async (data) => {
  try {
    const { message, userId } = data;
    const response = await chatService.processMessage(message, userId || 'default');
    socket.emit('chat:response', response);
  } catch (error) {
    console.error('Erro no chat:', error);
    socket.emit('chat:error', { message: 'Erro ao processar mensagem' });
  }
});

// 3. Corrigir PORT no .env.example para 4444
```

**Arquivo:** `backend/.env.example`
```env
PORT=4444
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
OPENAI_API_KEY=your_key_here
MAC_ID=1
```

### 2.4 Corrigir SecuritySentinel

**Arquivo:** `backend/src/services/SecuritySentinel.ts`

```typescript
// Corrigir chamadas async sem await/catch:
this.performSecurityChecks().catch(console.error);

setInterval(() => {
  this.performSecurityChecks().catch(console.error);
}, 30000);
```

### Como testar FASE 2
```bash
cd $PROJECT_DIR/backend
cp .env.example .env
npm install
npm run dev

# Em outro terminal:
curl http://localhost:4444/api/health
# Deve retornar: { "status": "ok", ... }

curl http://localhost:4444/api/bots
# Deve retornar array (mesmo que vazio)
```

---

## FASE 3: Conectar Frontend ao Backend Real

### Problema
Todos os dados são hardcoded no frontend. O backend tem os endpoints. Precisamos conectar.

### 3.1 Criar hook de API centralizado

**Arquivo:** `frontend/hooks/useApi.ts` (NOVO)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4444';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

**Arquivo:** `frontend/.env.local` (NOVO)
```env
NEXT_PUBLIC_API_URL=http://localhost:4444
NEXT_PUBLIC_WS_URL=http://localhost:4444
```

### 3.2 Corrigir useSocket.ts — remover double listener

**Arquivo:** `frontend/hooks/useSocket.ts`

```typescript
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4444';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const socket = io(WS_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // CENTRALIZAR aqui, não duplicar no ChatPanel:
    socket.on('chat:response', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }]);
    });

    return () => { socket.disconnect(); };
  }, []);

  const sendMessage = (content: string, userId = 'default') => {
    if (!socketRef.current?.connected) return;
    // Adicionar msg do usuário imediatamente (optimistic):
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }]);
    socketRef.current.emit('chat:message', { message: content, userId });
  };

  return { socket: socketRef.current, connected, messages, sendMessage };
}
```

### 3.3 Corrigir ChatPanel.tsx — usar hook, não duplicar listeners

**Arquivo:** `frontend/components/ChatPanel.tsx`

```typescript
// REMOVER todos os socket.on('chat:response') daqui
// USAR o hook:
const { connected, messages, sendMessage } = useSocket();

// O componente só precisa de:
// - Renderizar messages
// - Chamar sendMessage() no submit
// - Mostrar connected no header
```

### 3.4 Conectar DashboardOverview com dados reais

**Arquivo:** `frontend/app/page.tsx` — componente `DashboardOverview`

```typescript
// Substituir dados hardcoded por:
const [stats, setStats] = useState({ bots: 0, projects: 0, tasks: 0 });

useEffect(() => {
  Promise.all([
    apiFetch<Bot[]>('/api/bots'),
    apiFetch<Project[]>('/api/projects'),
  ]).then(([bots, projects]) => {
    setStats({
      bots: bots.length,
      projects: projects.length,
      tasks: bots.filter(b => b.status === 'running').length,
    });
  }).catch(console.error);
}, []);
```

### 3.5 Conectar ProjectsPanel com dados reais

**Arquivo:** `frontend/components/ProjectsPanel.tsx`

```typescript
// Substituir o array estático:
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  apiFetch<Project[]>('/api/projects')
    .then(setProjects)
    .catch(console.error)
    .finally(() => setLoading(false));
}, []);

// REMOVER a senha hardcoded "real" e a dica da UI completamente
```

### 3.6 Conectar SquadPanel com dados reais

**Arquivo:** `frontend/components/SquadPanel.tsx`

```typescript
const [specialists, setSpecialists] = useState([]);

useEffect(() => {
  apiFetch('/api/squad').then(setSpecialists).catch(console.error);
}, []);

// Implementar o botão "Chamar":
const handleCall = (specialistId: string) => {
  socket?.emit('squad:task', { specialistId, task: 'general', context: '' });
};
```

### 3.7 Conectar BotsPanel com dados reais + fix projectId

**Arquivo:** `frontend/components/BotsPanel.tsx`

```typescript
const [bots, setBots] = useState<Bot[]>([]);
const [projects, setProjects] = useState<Project[]>([]);
const [loadingBotId, setLoadingBotId] = useState<string | null>(null);

useEffect(() => {
  fetchBots();
  apiFetch<Project[]>('/api/projects').then(setProjects);
}, []);

// Fix: exibir nome do projeto, não ID
const getProjectName = (projectId: string) => 
  projects.find(p => p.id === projectId)?.name || projectId;

// Fix: estado de loading no botão de ação
const handleBotAction = async (botId: string, action: string) => {
  setLoadingBotId(botId);
  try {
    await apiFetch(`/api/bots/${botId}/${action}`, { method: 'POST' });
    await fetchBots();
  } finally {
    setLoadingBotId(null);
  }
};

// Adicionar empty state:
{bots.length === 0 && !loading && (
  <tr>
    <td colSpan={6} className="py-16 text-center text-gray-400">
      Nenhum bot criado ainda.
    </td>
  </tr>
)}
```

### Como testar FASE 3
```bash
# Backend rodando na 4444, frontend na 3000
# 1. Abrir http://localhost:3000
# 2. Header deve mostrar "Conectado" (verde)
# 3. Dashboard deve mostrar contagens reais
# 4. Chat deve funcionar (mensagem vai e volta)
# 5. ProjectsPanel não deve mais pedir senha
```

---

## FASE 4: Métricas Reais de Sistema (CPU/RAM/Disco)

### 4.1 Criar endpoint de métricas no backend

**Arquivo:** `backend/src/services/MetricsService.ts` (NOVO)

```typescript
import os from 'os';
import { execSync } from 'child_process';

export class MetricsService {
  getCpuUsage(): number {
    // macOS: usar top -l 1
    try {
      const output = execSync("top -l 1 | grep 'CPU usage' | awk '{print $3}' | tr -d '%'", 
        { encoding: 'utf8', timeout: 5000 });
      return parseFloat(output.trim()) || 0;
    } catch {
      // Fallback: calcular via os.loadavg()
      const load = os.loadavg()[0];
      const cpus = os.cpus().length;
      return Math.min((load / cpus) * 100, 100);
    }
  }

  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return {
      total: Math.round(total / 1024 / 1024 / 1024 * 10) / 10, // GB
      used: Math.round(used / 1024 / 1024 / 1024 * 10) / 10,
      percentage: Math.round((used / total) * 100),
    };
  }

  getDiskUsage() {
    try {
      // macOS: df -h /
      const output = execSync("df -k / | tail -1 | awk '{print $2,$3,$5}'", 
        { encoding: 'utf8', timeout: 5000 });
      const [total, used, pct] = output.trim().split(' ');
      return {
        total: Math.round(parseInt(total) / 1024 / 1024 * 10) / 10, // GB
        used: Math.round(parseInt(used) / 1024 / 1024 * 10) / 10,
        percentage: parseInt(pct),
      };
    } catch {
      return { total: 0, used: 0, percentage: 0 };
    }
  }

  getAll() {
    return {
      cpu: this.getCpuUsage(),
      memory: this.getMemoryUsage(),
      disk: this.getDiskUsage(),
      uptime: os.uptime(),
      hostname: os.hostname(),
      platform: os.platform(),
      timestamp: new Date().toISOString(),
    };
  }
}
```

### 4.2 Adicionar rota no index.ts

**Arquivo:** `backend/src/index.ts`

```typescript
import { MetricsService } from './services/MetricsService';
const metricsService = new MetricsService();

// Adicionar rota:
app.get('/api/metrics', (req, res) => {
  res.json(metricsService.getAll());
});

// Emitir métricas via WebSocket a cada 10 segundos:
setInterval(() => {
  io.emit('metrics:update', metricsService.getAll());
}, 10000);
```

### 4.3 Conectar no DashboardOverview

**Arquivo:** `frontend/app/page.tsx` — `ResourceBar` e `DashboardOverview`

```typescript
// Substituir as barras hardcoded (CPU 45%, RAM 67%, Disco 78%) por:
const [metrics, setMetrics] = useState({ cpu: 0, memory: { percentage: 0 }, disk: { percentage: 0 } });

useEffect(() => {
  apiFetch('/api/metrics').then(setMetrics);
  
  // Atualizar em tempo real via socket:
  socket?.on('metrics:update', setMetrics);
  return () => { socket?.off('metrics:update'); };
}, [socket]);

// ResourceBar agora recebe:
<ResourceBar label="CPU" value={metrics.cpu} color="cyan" />
<ResourceBar label="Memória" value={metrics.memory.percentage} color="purple" />
<ResourceBar label="Disco" value={metrics.disk.percentage} color="green" />
```

### Como testar FASE 4
```bash
curl http://localhost:4444/api/metrics
# Deve retornar JSON com cpu, memory, disk reais
```

---

## FASE 5: Cluster/Nodes OpenClaw Reais

### Contexto técnico
O OpenClaw usa nodes conectados ao Gateway na porta 18789. O comando `openclaw nodes list` lista os nodes. Vamos criar um endpoint no backend do Titanio Dashboard que executa esse comando e retorna os resultados.

### 5.1 Criar serviço de Nodes OpenClaw

**Arquivo:** `backend/src/services/OpenClawNodes.ts` (NOVO)

```typescript
import { execSync } from 'child_process';

export interface OpenClawNode {
  id: string;
  name: string;
  platform: string;
  status: 'online' | 'offline';
  capabilities: string[];
  lastSeen?: string;
}

export class OpenClawNodesService {
  private openclaw: string;

  constructor() {
    // Detectar onde o openclaw está instalado
    try {
      this.openclaw = execSync('which openclaw', { encoding: 'utf8' }).trim();
    } catch {
      this.openclaw = '/usr/local/bin/openclaw';
    }
  }

  async listNodes(): Promise<OpenClawNode[]> {
    try {
      // Tentar com --json primeiro
      const output = execSync(`${this.openclaw} nodes list --json 2>/dev/null || ${this.openclaw} nodes status 2>/dev/null`, {
        encoding: 'utf8',
        timeout: 10000,
      });

      // Tentar parsear JSON
      try {
        const data = JSON.parse(output);
        if (Array.isArray(data)) return data;
        if (data.nodes) return data.nodes;
      } catch {
        // Output não é JSON — parsear texto
        return this.parseTextOutput(output);
      }
    } catch (error) {
      console.error('Erro ao listar nodes OpenClaw:', error);
      return [];
    }

    return [];
  }

  private parseTextOutput(output: string): OpenClawNode[] {
    // Parsear saída de texto do openclaw nodes list
    const lines = output.split('\n').filter(l => l.trim());
    const nodes: OpenClawNode[] = [];
    
    for (const line of lines) {
      // Formato típico: "node-id  platform  online"
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        nodes.push({
          id: parts[0],
          name: parts[0],
          platform: parts[1] || 'unknown',
          status: line.includes('online') ? 'online' : 'offline',
          capabilities: [],
        });
      }
    }

    return nodes;
  }

  async getGatewayStatus(): Promise<{ running: boolean; port: number; version?: string }> {
    try {
      const output = execSync(`${this.openclaw} gateway status 2>/dev/null`, {
        encoding: 'utf8',
        timeout: 5000,
      });
      return {
        running: output.includes('running') || output.includes('online'),
        port: 18789,
      };
    } catch {
      return { running: false, port: 18789 };
    }
  }
}
```

### 5.2 Adicionar rotas de nodes no backend

**Arquivo:** `backend/src/index.ts`

```typescript
import { OpenClawNodesService } from './services/OpenClawNodes';
const openclawNodes = new OpenClawNodesService();

// Listar nodes OpenClaw reais:
app.get('/api/cluster/nodes', async (req, res) => {
  try {
    const nodes = await openclawNodes.listNodes();
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar nodes' });
  }
});

// Status do gateway OpenClaw:
app.get('/api/cluster/gateway', async (req, res) => {
  try {
    const status = await openclawNodes.getGatewayStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar gateway' });
  }
});

// Emitir atualização de nodes via WebSocket a cada 30s:
setInterval(async () => {
  const nodes = await openclawNodes.listNodes();
  io.emit('cluster:nodes', nodes);
}, 30000);
```

### 5.3 Criar componente ClusterPanel no frontend

**Arquivo:** `frontend/components/ClusterPanel.tsx` (NOVO)

```tsx
'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../hooks/useApi';
import { useSocket } from '../hooks/useSocket';

interface OpenClawNode {
  id: string;
  name: string;
  platform: string;
  status: 'online' | 'offline';
  capabilities: string[];
}

export function ClusterPanel() {
  const [nodes, setNodes] = useState<OpenClawNode[]>([]);
  const [gateway, setGateway] = useState<{ running: boolean; port: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    // Carregar estado inicial
    Promise.all([
      apiFetch<OpenClawNode[]>('/api/cluster/nodes'),
      apiFetch<{ running: boolean; port: number }>('/api/cluster/gateway'),
    ]).then(([nodes, gw]) => {
      setNodes(nodes);
      setGateway(gw);
    }).finally(() => setLoading(false));

    // Atualizar em tempo real
    socket?.on('cluster:nodes', setNodes);
    return () => { socket?.off('cluster:nodes'); };
  }, [socket]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">🖥️ Cluster OpenClaw</h2>

      {/* Status do Gateway */}
      <div className={`mb-6 p-4 rounded-lg border ${gateway?.running ? 'border-cyan-500/30 bg-cyan-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${gateway?.running ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <div>
            <p className="text-white font-medium">Gateway OpenClaw</p>
            <p className="text-sm text-gray-400">
              {gateway?.running ? `Online — porta ${gateway.port}` : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Nodes */}
      {loading ? (
        <p className="text-gray-400">Carregando nodes...</p>
      ) : nodes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Nenhum node conectado</p>
          <p className="text-sm mt-2">Rode <code className="bg-black/30 px-1 rounded">openclaw nodes list</code> para verificar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map(node => (
            <div key={node.id} className="bg-[#12121a] border border-[#1a1a2e] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">{node.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${node.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {node.status === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{node.platform}</p>
              {node.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {node.capabilities.map(cap => (
                    <span key={cap} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                      {cap}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5.4 Adicionar aba Cluster na Sidebar e navegação

**Arquivo:** `frontend/components/Sidebar.tsx`

```tsx
// Adicionar ao array de navItems:
{ id: 'cluster', label: 'Cluster', icon: Network, badge: null }

// O import de Network já existe no lucide-react
```

**Arquivo:** `frontend/app/page.tsx`

```tsx
// Adicionar ao switch de renderização de aba:
case 'cluster':
  return <ClusterPanel />;
```

### Como testar FASE 5
```bash
# Verificar se openclaw está acessível:
which openclaw
openclaw nodes list

# Testar endpoint:
curl http://localhost:4444/api/cluster/nodes
curl http://localhost:4444/api/cluster/gateway

# No frontend: clicar em "Cluster" na sidebar
```

---

## FASE 6: Chat com Tita Funcional via Socket.io

### Contexto
O ChatService atual responde com strings hardcoded. Vamos conectá-lo à API da Anthropic/OpenAI real para que a Tita responda de verdade.

### 6.1 Atualizar ChatService para usar IA real

**Arquivo:** `backend/src/services/ChatService.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'; // já no package.json (openai SDK)

export class ChatService {
  private client: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
  }

  async processMessage(message: string, userId: string): Promise<ChatResponse> {
    // Se não tem cliente IA, usar fallback inteligente
    if (!this.client) {
      return this.localFallback(message);
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-haiku-3-5-20241022', // modelo rápido e barato
        max_tokens: 512,
        system: `Você é Tita, assistente IA do Titanio Command Center. 
          Você ajuda Eduardo e sua equipe a gerenciar bots, projetos e o cluster de Mac Minis.
          Seja direta, útil e use emojis quando apropriado. Responda em português.`,
        messages: [{ role: 'user', content: message }],
      });

      return {
        message: response.content[0].type === 'text' ? response.content[0].text : 'Não consegui processar.',
        timestamp: new Date().toISOString(),
        userId,
      };
    } catch (error) {
      console.error('Erro na API Anthropic:', error);
      return this.localFallback(message);
    }
  }

  private localFallback(message: string): ChatResponse {
    const msg = message.toLowerCase();
    
    if (msg.includes('bots') || msg.includes('bot')) {
      return { message: '🤖 Vou buscar os bots para você! Use o painel de Bots para gerenciá-los.', timestamp: new Date().toISOString(), userId: 'tita' };
    }
    if (msg.includes('cluster') || msg.includes('node')) {
      return { message: '🖥️ Veja o status do cluster na aba Cluster. Lá você vê todos os Mac Minis conectados.', timestamp: new Date().toISOString(), userId: 'tita' };
    }
    if (msg.includes('oi') || msg.includes('olá')) {
      return { message: '👋 Oi! Sou a Tita. Como posso ajudar hoje?', timestamp: new Date().toISOString(), userId: 'tita' };
    }
    return { message: '🐾 Entendido! Para respostas completas, configure a ANTHROPIC_API_KEY no .env do backend.', timestamp: new Date().toISOString(), userId: 'tita' };
  }
}
```

### 6.2 Adicionar variável no .env.example

**Arquivo:** `backend/.env.example`

```env
ANTHROPIC_API_KEY=sk-ant-...
```

### Como testar FASE 6
```bash
# Com ANTHROPIC_API_KEY configurada:
# 1. Abrir o chat no dashboard
# 2. Digitar "Oi Tita"
# 3. A resposta deve vir da API real (não hardcoded)

# Sem API key: fallback inteligente baseado em palavras-chave
```

---

## FASE 7: Segurança Mínima

### 7.1 Remover senha hardcoded da UI

**Arquivo:** `frontend/components/ProjectsPanel.tsx`

Remover completamente:
```tsx
// REMOVER ISTO:
<p className="text-center text-xs text-gray-500 mt-4">
  💡 Dica: A senha é "real"
</p>

// REMOVER comparação no frontend:
if (password === 'real') { ... }
```

Substituir por:
```tsx
const handleUnlock = async (password: string) => {
  setLoading(true);
  try {
    const result = await apiFetch('/api/projects/unlock', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    if (result.ok) setUnlocked(true);
    else setError('Senha incorreta');
  } catch {
    setError('Erro ao verificar senha');
  } finally {
    setLoading(false));
  }
};
```

### 7.2 Endpoint de unlock no backend

**Arquivo:** `backend/src/index.ts`

```typescript
app.post('/api/projects/unlock', (req, res) => {
  const { password } = req.body;
  const PROJECT_PASSWORD = process.env.PROJECT_PASSWORD || 'changeme';
  
  // Não usar bcrypt por enquanto (não tem hash armazenado)
  // mas pelo menos tirar do frontend
  if (password === PROJECT_PASSWORD) {
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: 'Senha incorreta' });
  }
});
```

**Arquivo:** `backend/.env.example`

```env
PROJECT_PASSWORD=sua_senha_segura_aqui
```

---

## 📁 LISTA COMPLETA DE ARQUIVOS A MODIFICAR/CRIAR

### Arquivos a MODIFICAR:
```
backend/src/index.ts                    — CORS, try/catch socket, rotas novas
backend/src/services/ClusterManager.ts — memory leak, bug array, remover Redis
backend/src/services/ChatService.ts    — IA real + fallback
backend/src/services/SecuritySentinel.ts — async sem catch
backend/.env.example                   — PORT=4444, variáveis novas
backend/package.json                   — remover prisma/redis/bullmq
frontend/app/page.tsx                  — dados reais, overflow-y-auto
frontend/app/layout.tsx                — fontes corretas
frontend/app/globals.css               — dark theme garantido
frontend/next.config.js                — remover experimental.appDir
frontend/tailwind.config.js            — verificar content paths
frontend/components/ChatPanel.tsx      — remover double listener
frontend/components/ProjectsPanel.tsx  — remover senha da UI
frontend/components/BotsPanel.tsx      — dados reais, loading state, empty state
frontend/components/SquadPanel.tsx     — dados reais, implementar botão "Chamar"
frontend/components/Sidebar.tsx        — adicionar item Cluster
frontend/hooks/useSocket.ts            — centralizar listeners
```

### Arquivos a CRIAR:
```
backend/src/services/MetricsService.ts  — métricas CPU/RAM/Disco reais
backend/src/services/OpenClawNodes.ts   — integração com openclaw nodes
frontend/hooks/useApi.ts                — helper de fetch
frontend/.env.local                     — variáveis de ambiente do frontend
frontend/components/ClusterPanel.tsx    — painel de cluster novo
```

---

## 🧪 PLANO DE TESTES

### Checklist de validação por fase:

```
FASE 0: [ ] Porta 3000 livre [ ] Porta 4444 livre
FASE 1: [ ] Fundo escuro no browser [ ] Fontes carregando [ ] Sem erros Tailwind
FASE 2: [ ] curl /api/health retorna 200 [ ] curl /api/bots retorna array
FASE 3: [ ] Header mostra "Conectado" [ ] Dados reais nos panels
FASE 4: [ ] curl /api/metrics retorna CPU/RAM/Disco reais
FASE 5: [ ] curl /api/cluster/nodes retorna lista [ ] Aba Cluster funciona
FASE 6: [ ] Chat responde (IA ou fallback) [ ] Sem mensagens duplicadas
FASE 7: [ ] Senha não visível no código JS do browser
```

---

## ⚡ SCRIPT DE INÍCIO RÁPIDO

Criar este script para subir tudo de uma vez:

**Arquivo:** `start-titanio.sh` (na raiz do projeto)

```bash
#!/bin/bash
set -e

PROJECT_DIR="/Volumes/TITA_039/backup-projetos/titanio-dashboard-backup-20260312-0801/code"

echo "🧹 Limpando processos anteriores..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4444 | xargs kill -9 2>/dev/null || true
sleep 1

echo "🚀 Iniciando backend (porta 4444)..."
cd "$PROJECT_DIR/backend"
[ ! -f .env ] && cp .env.example .env
npm install --silent
npm run dev &
BACKEND_PID=$!

echo "⏳ Aguardando backend..."
sleep 3

echo "🎨 Iniciando frontend (porta 3000)..."
cd "$PROJECT_DIR/frontend"
[ ! -f .env.local ] && cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4444
NEXT_PUBLIC_WS_URL=http://localhost:4444
EOF
npm install --silent
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Titanio Dashboard rodando!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4444/api/health"
echo ""
echo "Pressione Ctrl+C para parar tudo."

# Cleanup ao sair
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
```

---

## 📊 ESTIMATIVA DE ESFORÇO

| Fase | Tempo estimado | Prioridade |
|---|---|---|
| 0 — Limpar ambiente | 30 min | 🔴 Crítico |
| 1 — Corrigir CSS | 1h | 🔴 Crítico |
| 2 — Backend sem DB | 2h | 🔴 Crítico |
| 3 — Conectar frontend | 3h | 🔴 Crítico |
| 4 — Métricas reais | 2h | 🟡 Importante |
| 5 — Cluster OpenClaw | 3h | 🟡 Importante |
| 6 — Chat com IA real | 1h | 🟡 Importante |
| 7 — Segurança mínima | 30 min | 🟠 Obrigatório |
| **Total** | **~13h** | — |

**Ordem recomendada para uma sessão de trabalho:**
1. Fase 0 + 1 + 2 (manhã — base funcionando)
2. Fase 3 + 7 (tarde — dados reais + segurança)
3. Fase 4 + 5 + 6 (depois — funcionalidades avançadas)

---

*Plano gerado em: 2026-03-13*  
*Próxima revisão: após Fase 3 completada*
