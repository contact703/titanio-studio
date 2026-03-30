# 🔍 Code Review - Titanio Dashboard
**Data:** 2026-03-13  
**Analisado por:** Tita (subagent code review)  
**Projeto:** `/Volumes/TITA_039/backup-projetos/titanio-dashboard-backup-20260312-0801/code/`

---

## 📊 Resumo Executivo

| Severidade | Quantidade |
|------------|-----------|
| 🔴 Crítico | 8 |
| 🟡 Médio | 14 |
| 🟢 Baixo | 10 |
| **Total** | **32** |

---

## 🔴 ERROS CRÍTICOS

---

### CRÍTICO-01 — Senha exposta no frontend
**Arquivo:** `frontend/components/ProjectsPanel.tsx` — linhas 23, 44, 149  
**Problema:** A senha do projeto "Teste Real" está hardcoded no frontend E exibida como dica na UI. Qualquer pessoa que abra o DevTools do navegador vê a senha no código JS compilado.
```tsx
// linha 44 — comparação hardcoded
if (password === 'real') {

// linha 149 — EXPOSTO NA TELA!
<p className="text-center text-xs text-gray-500 mt-4">
  💡 Dica: A senha é "real"
</p>
```
**Severidade:** CRÍTICO — anula completamente qualquer proteção  
**Correção:** Remover a dica da UI. Fazer a validação via chamada à API (POST com a senha), não comparar no frontend. Usar JWT ou session token retornado pelo backend.

---

### CRÍTICO-02 — Auth sem segurança real (plain text password)
**Arquivo:** `backend/src/middleware/auth.ts` — linhas 5, 24  
**Problema:** O "sistema de auth" compara string plain text. Não usa JWT, não usa hash. A senha "real" é hardcoded no código-fonte do servidor.
```ts
const PROJECT_PASSWORD = 'real'; // hardcoded!
if (token !== PROJECT_PASSWORD) { // comparação plain text
```
**Severidade:** CRÍTICO — qualquer pessoa com acesso ao repositório tem a senha  
**Correção:** Usar JWT assinado com `jsonwebtoken` (já está no package.json!). Armazenar senha com hash via `bcryptjs` (também já instalado). Implementar login real com endpoint `/api/auth/login`.

---

### CRÍTICO-03 — Prisma instalado mas sem schema, banco nunca conecta
**Arquivo:** `backend/package.json`  
**Problema:** `@prisma/client` e `prisma` estão nas dependências, há scripts de migração, mas **não existe `prisma/schema.prisma`** no projeto. Rodar `npm run db:migrate` ou `prisma generate` vai falhar imediatamente. Todo o dado está em memória (in-memory), o que significa que ao reiniciar o servidor **todos os dados são perdidos**.
```json
"db:migrate": "prisma migrate dev",  // vai quebrar
"db:generate": "prisma generate",    // vai quebrar
```
**Severidade:** CRÍTICO — sem persistência de dados, tudo é perdido ao reiniciar  
**Correção:** Criar `prisma/schema.prisma` com os modelos (Bot, Project, etc.) OU remover Prisma das dependências e adotar outra solução de persistência (SQLite simples, arquivo JSON, etc.).

---

### CRÍTICO-04 — Unhandled Promise Rejection nos eventos de socket
**Arquivo:** `backend/src/index.ts` — linhas 178-195  
**Problema:** O handler `socket.on('chat:message', async (data) => {...})` não tem try/catch. Se `chatService.processMessage()` lançar exceção, gera UnhandledPromiseRejection que pode derrubar o processo Node em versões mais recentes.
```ts
socket.on('chat:message', async (data) => {
  const { message, userId } = data;
  // SEM TRY/CATCH!
  const response = await chatService.processMessage(message, userId);
```
**Severidade:** CRÍTICO — pode derrubar o servidor inteiro  
**Correção:**
```ts
socket.on('chat:message', async (data) => {
  try {
    const response = await chatService.processMessage(message, userId);
    // ...
  } catch (error) {
    socket.emit('chat:error', { message: 'Erro ao processar mensagem' });
  }
});
```

---

### CRÍTICO-05 — Memory leak no ClusterManager (setInterval sem cleanup)
**Arquivo:** `backend/src/services/ClusterManager.ts` — linhas 95-99  
**Problema:** `startHeartbeat()` cria um `setInterval` mas não armazena a referência para cleanup. A classe não tem método `stop()`. Se o ClusterManager for instanciado várias vezes (ex: hot-reload em dev), os intervals se acumulam.
```ts
private startHeartbeat() {
  setInterval(() => {  // referência perdida!
    this.updateLocalNodeStats();
  }, 30000);
}
```
**Severidade:** CRÍTICO (medium-term) — memory leak em ambiente de desenvolvimento com hot-reload  
**Correção:**
```ts
private heartbeatInterval: NodeJS.Timeout | null = null;

private startHeartbeat() {
  this.heartbeatInterval = setInterval(() => {
    this.updateLocalNodeStats();
  }, 30000);
}

stop() {
  if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
}
```

---

### CRÍTICO-06 — Redis importado mas nunca inicializado (ClusterManager)
**Arquivo:** `backend/src/services/ClusterManager.ts` — linhas 1, 20  
**Problema:** `Redis` é importado de `ioredis` e declarado como `private redis?: Redis`, mas **nunca é instanciado**. Qualquer feature que dependesse de Redis não funciona silenciosamente.
```ts
import { Redis } from 'ioredis'; // importado
// ...
private redis?: Redis; // declarado, nunca usado
```
**Severidade:** CRÍTICO — funcionalidade prometida (cluster distribuído) não funciona  
**Correção:** Inicializar Redis no constructor se necessário: `this.redis = new Redis(process.env.REDIS_URL)`, ou remover a importação se Redis não for usado.

---

### CRÍTICO-07 — PORT no .env.example diverge do código
**Arquivo:** `backend/.env.example` linha 1 vs `backend/src/index.ts` linha ~220  
**Problema:** `.env.example` define `PORT=3333`, mas `index.ts` usa `process.env.PORT || 4444`. O frontend aponta para `http://localhost:4444`. Se alguém seguir o `.env.example` sem ver o código, o sistema não conecta.
```
.env.example: PORT=3333
index.ts:     const PORT = process.env.PORT || 4444
frontend:     fetch('http://localhost:4444/...')
```
**Severidade:** CRÍTICO — impede o projeto de rodar ao seguir a documentação  
**Correção:** Alinhar `.env.example` para `PORT=4444` ou alterar o fallback no código para 3333.

---

### CRÍTICO-08 — Dados duplicados no socket (double event listener)
**Arquivo:** `frontend/hooks/useSocket.ts` + `frontend/components/ChatPanel.tsx`  
**Problema:** O hook `useSocket` registra listeners para `chat:response` e `squad:summoned`. O `ChatPanel` recebe o mesmo socket e registra **os mesmos listeners novamente**. Cada mensagem dispara os dois handlers.
```ts
// useSocket.ts linha 34
newSocket.on('chat:response', (data) => { ... });

// ChatPanel.tsx linha 58
socket.on('chat:response', (data) => { ... }); // DUPLICADO!
```
**Severidade:** CRÍTICO — mensagens aparecem duplicadas na UI; o estado de `messages` do hook é populado mas nunca usado (dados perdidos).  
**Correção:** Centralizar o gerenciamento de mensagens em um único lugar (no hook OU no componente, não nos dois). O ChatPanel deve usar o `messages` e `sendMessage` retornados pelo hook.

---

## 🟡 ERROS MÉDIOS

---

### MÉDIO-01 — Dependências instaladas mas nunca usadas no backend
**Arquivo:** `backend/package.json`  
**Problema:** Várias dependências pagas (tamanho/tempo de build) estão instaladas mas completamente inutilizadas:

| Pacote | Usado? | Impacto |
|--------|--------|---------|
| `bullmq` | ❌ Nunca importado | 2.3MB desnecessário |
| `ws` | ❌ Nunca importado | Socket.io já inclui |
| `zod` | ❌ Nunca importado | Validação prometida ausente |
| `openai` | ❌ Nunca importado | ChatService não usa IA real |
| `jsonwebtoken` | ❌ Nunca importado | Auth não usa JWT |
| `bcryptjs` | ❌ Nunca importado | Sem hash de senha |

**Severidade:** MÉDIO — aumenta bundle, tempo de build e superfície de ataque  
**Correção:** Remover das dependências ou implementar as funcionalidades que justificam sua presença.

---

### MÉDIO-02 — `@types/*` em dependencies em vez de devDependencies
**Arquivo:** `backend/package.json` — linhas 14-15  
**Problema:** `@types/bcryptjs` e `@types/jsonwebtoken` estão em `dependencies` (produção) em vez de `devDependencies`. Type definitions não devem ir para produção.
```json
"dependencies": {
  "@types/bcryptjs": "^2.4.6",   // deveria ser devDependencies
  "@types/jsonwebtoken": "^9.0.5" // deveria ser devDependencies
}
```
**Correção:** Mover para `devDependencies`.

---

### MÉDIO-03 — Import não utilizado em EmailManager
**Arquivo:** `backend/src/services/EmailManager.ts` — linha 1  
**Problema:** `Bot` type é importado mas nunca usado no arquivo.
```ts
import { Bot } from '../types/bot'; // NUNCA USADO
```
**Correção:** Remover o import.

---

### MÉDIO-04 — `getTopology()` retorna estrutura errada (array aninhado)
**Arquivo:** `backend/src/services/ClusterManager.ts` — linha ~155  
**Problema:** `nodes: [online]` cria `string[][]` (array de arrays) quando deveria ser `string[]`.
```ts
return {
  nodes: [online], // BUG: cria [[id1, id2]] em vez de [id1, id2]
  edges
};
```
**Correção:** `return { nodes: online, edges };`

---

### MÉDIO-05 — SecuritySentinel: performSecurityChecks sem await e sem .catch()
**Arquivo:** `backend/src/services/SecuritySentinel.ts` — linhas 30, 37  
**Problema:** `performSecurityChecks()` é `async` mas é chamado sem `await` e sem `.catch()`, causando potenciais unhandled rejections.
```ts
this.performSecurityChecks(); // async sem await nem .catch()
setInterval(() => {
  this.performSecurityChecks(); // idem
}, 30000);
```
**Correção:**
```ts
this.performSecurityChecks().catch(console.error);
setInterval(() => {
  this.performSecurityChecks().catch(console.error);
}, 30000);
```

---

### MÉDIO-06 — BillingManager: alerts crescem infinitamente por sessão
**Arquivo:** `backend/src/services/BillingManager.ts` — método `checkBudgetAlert()`  
**Problema:** Cada chamada a `addCost()` executa `checkBudgetAlert()` que pode adicionar um novo alert ao array `this.alerts`. Se o orçamento estiver acima de 50%, cada custo adicionado cria um novo alert. O array é truncado a 100 mas os alertas duplicados não são deduplicados.  
**Correção:** Verificar se já existe alert para o mesmo threshold antes de adicionar. Usar um Set ou mapa de thresholds já alertados.

---

### MÉDIO-07 — ChatService.processMessage é async sem necessidade
**Arquivo:** `backend/src/services/ChatService.ts` — linha 15  
**Problema:** `async processMessage(...)` nunca usa `await` internamente. Todos os retornos são síncronos. Isso é enganoso e adiciona overhead desnecessário de Promise.
```ts
async processMessage(message: string, userId: string): Promise<ChatResponse> {
  // sem nenhum await aqui
  return { message: '...' };
}
```
**Correção:** Remover `async` ou implementar chamada real à API de IA (OpenAI, Anthropic etc.).

---

### MÉDIO-08 — CORS inconsistente entre REST e Socket.io
**Arquivo:** `backend/src/index.ts` — linhas 23-26 e 29  
**Problema:** Socket.io tem CORS restrito a `localhost:3000`, mas o Express REST usa `cors()` sem restrições (aceita qualquer origin).
```ts
const io = new Server(httpServer, {
  cors: { origin: "http://localhost:3000" } // restrito
});
app.use(cors()); // SEM RESTRIÇÃO - qualquer origem
```
**Correção:** Usar a mesma configuração de CORS para ambos, idealmente via variável de ambiente `CORS_ORIGIN`.

---

### MÉDIO-09 — GamificationManager: initializeAchievements() não persiste no Map
**Arquivo:** `backend/src/services/GamificationManager.ts` — método `getAchievements()`  
**Problema:** Para usuários não encontrados no Map, retorna `this.initializeAchievements()` que cria uma NOVA lista a cada chamada, sem salvar no Map. Progresso nunca persiste para usuários novos.
```ts
getAchievements(userId: string): Achievement[] {
  return this.achievements.get(userId) || this.initializeAchievements();
  // ^ nova lista descartada a cada call
}
```
**Correção:**
```ts
getAchievements(userId: string): Achievement[] {
  if (!this.achievements.has(userId)) {
    this.achievements.set(userId, this.initializeAchievements());
  }
  return this.achievements.get(userId)!;
}
```

---

### MÉDIO-10 — ProjectsPanel, SquadPanel e Dashboard com dados hardcoded
**Arquivos:** `frontend/components/ProjectsPanel.tsx`, `frontend/components/SquadPanel.tsx`, `frontend/app/page.tsx`  
**Problema:** As três telas usam arrays estáticos hardcoded em vez de buscar dados do backend. O backend tem endpoints (`/api/projects`, `/api/squad`) mas o frontend ignora completamente.
- ProjectsPanel: `const projects = [...]` — 6 projetos fixos
- SquadPanel: `const specialists = [...]` — 8 especialistas fixos
- DashboardOverview: Stats fixos ("12 bots", "5 projetos", etc.)

**Correção:** Usar `fetch()` ou React Query (já instalado!) para buscar dados reais do backend.

---

### MÉDIO-11 — BotsPanel: exibe projectId em vez do nome do projeto
**Arquivo:** `frontend/components/BotsPanel.tsx` — linha ~95  
**Problema:** A coluna "Projeto" exibe o ID cru (`project-1`) em vez do nome legível.
```tsx
<td className="py-4 px-4 text-sm">{bot.projectId}</td>
// mostra: "project-1" em vez de "Gospia Mobile"
```
**Correção:** Fazer fetch dos projetos também e fazer lookup por ID para exibir o nome.

---

### MÉDIO-12 — BotsPanel: useEffect sem dependência correta (fetchBots)
**Arquivo:** `frontend/components/BotsPanel.tsx` — linhas 28-30  
**Problema:** `fetchBots` é chamado dentro de `useEffect([])` mas a função `fetchBots` é definida fora do effect sem `useCallback`. React hooks lint rule reporta isso como dependência faltando.
```tsx
useEffect(() => {
  fetchBots(); // fetchBots não está no array de deps
}, []); // warning: react-hooks/exhaustive-deps
```
**Correção:** Mover `fetchBots` para dentro do useEffect ou usar `useCallback`.

---

### MÉDIO-13 — SquadPanel: botão "Chamar" não faz nada
**Arquivo:** `frontend/components/SquadPanel.tsx` — linha ~80  
**Problema:** O botão "Chamar" não tem `onClick` handler. Ele renderiza mas clicar não dispara nenhuma ação.
```tsx
<motion.button
  disabled={specialist.status !== 'available'}
  className="..."
  // SEM onClick!
>
  Chamar
</motion.button>
```
**Correção:** Implementar chamada via socket: `socket.emit('squad:task', { specialistId, task, context })`.

---

### MÉDIO-14 — next.config.js com flag deprecated no Next.js 14
**Arquivo:** `frontend/next.config.js`  
**Problema:** `experimental: { appDir: true }` é obsoleto no Next.js 14. O App Router é estável e essa configuração pode causar warnings ou comportamento inesperado.
```js
const nextConfig = {
  experimental: {
    appDir: true, // DEPRECATED no Next.js 14
  },
}
```
**Correção:** Remover o bloco `experimental` inteiramente (ou deixar o objeto vazio).

---

## 🟢 ERROS BAIXOS / MELHORIAS

---

### BAIXO-01 — onKeyPress deprecated no React
**Arquivo:** `frontend/components/ChatPanel.tsx` — linha ~130  
**Problema:** `onKeyPress` está deprecated desde React 17. Use `onKeyDown`.
```tsx
onKeyPress={handleKeyPress} // deprecated
```
**Correção:** `onKeyDown={handleKeyPress}`

---

### BAIXO-02 — Botões sem funcionalidade (Header e Sidebar)
**Arquivos:** `frontend/components/Header.tsx`, `frontend/components/Sidebar.tsx`  
**Problema:** Vários botões não fazem nada:
- Header: "+ Novo Bot" — sem onClick
- Sidebar: "Email", "Integrações", "Configurações" — sem onClick e sem rota

---

### BAIXO-03 — Task interface declarada mas nunca usada
**Arquivo:** `backend/src/types/squad.ts` — linhas 12-19  
**Problema:** A interface `Task` está definida mas nunca é usada em nenhum arquivo do projeto.
```ts
export interface Task { ... } // nunca importada
```
**Correção:** Remover ou implementar o uso.

---

### BAIXO-04 — Autenticação do ProjectsPanel não desbloqueia funcionalidade real
**Arquivo:** `frontend/components/ProjectsPanel.tsx`  
**Problema:** Após autenticação bem-sucedida, o código apenas faz `console.log()`. Não carrega dados do projeto protegido, não chama o endpoint `/api/teste-real`.
```ts
console.log('✅ Acesso autorizado ao Projeto Teste Real'); // só isso!
```

---

### BAIXO-05 — ClusterManager: IP hardcoded nos nodes
**Arquivo:** `backend/src/services/ClusterManager.ts` — linhas ~25-70  
**Problema:** IPs `192.168.1.101-105` estão hardcoded. Em qualquer ambiente diferente do original, o cluster não funciona.  
**Correção:** Configurar via variáveis de ambiente ou arquivo de config.

---

### BAIXO-06 — MAC_ID sem valor padrão significativo
**Arquivo:** `backend/src/services/ClusterManager.ts` — linha ~18  
**Problema:** `this.localNodeId = 'mac-${process.env.MAC_ID || '1'}'` — se `MAC_ID` não estiver definido, assume 'mac-1'. Não está documentado no `.env.example`.  
**Correção:** Adicionar `MAC_ID=1` ao `.env.example`.

---

### BAIXO-07 — ChatPanel: timestamp inconsistente (Date vs string)
**Arquivo:** `frontend/components/ChatPanel.tsx` — linha ~15  
**Problema:** Interface `Message` define `timestamp: Date`, mas quando mensagens chegam do socket, são criadas com `timestamp: new Date(data.timestamp)` (correto) ou `timestamp: new Date()` (correto). Porém o componente nunca renderiza o timestamp na UI, então não quebra — mas é inconsistente.

---

### BAIXO-08 — Leaderboard hardcoda nome "Eduardo"
**Arquivo:** `backend/src/services/GamificationManager.ts` — linha ~177  
**Problema:** O leaderboard sempre mostra "Eduardo" como nome, independente do userId.
```ts
name: 'Eduardo', // Would come from user profile
```

---

### BAIXO-09 — Nenhuma validação de input nas rotas POST
**Arquivo:** `backend/src/index.ts` — rotas POST  
**Problema:** `express-validator` está instalado mas nunca usado. As rotas POST aceitam qualquer body sem validação:
```ts
app.post('/api/projects', (req, res) => {
  const { name, description, client } = req.body; // sem validação
  const project = projectManager.createProject(name, description, client);
```
Se `name` for `undefined`, o projeto é criado com nome undefined.

---

### BAIXO-10 — SecuritySentinel detecta padrões de nome em processos (falso positivo potencial)
**Arquivo:** `backend/src/services/SecuritySentinel.ts`  
**Problema:** Detecta "miner" em qualquer processo — poderia disparar alerta para processos legítimos como "container-miner" ou qualquer processo com esses nomes no path. Além disso, cada verificação cria um novo ID único (`proc-${Date.now()}`), então processos suspeitos geram alertas repetidos a cada 30 segundos.

---

## 📋 Resumo de Ações Prioritárias

### Para o projeto RODAR:
1. ✅ Alinhar PORT (`.env.example` para 4444)
2. ✅ Criar `prisma/schema.prisma` ou remover Prisma e usar outro storage
3. ✅ Inicializar Redis no ClusterManager ou remover a funcionalidade

### Para o projeto ser SEGURO:
4. 🔒 Remover senha da UI ("Dica: A senha é real")
5. 🔒 Implementar JWT real com `jsonwebtoken` + `bcryptjs` (já instalados)
6. 🔒 Mover validação de senha para o backend

### Para o projeto funcionar CORRETAMENTE:
7. 🐛 Corrigir double event listeners (useSocket + ChatPanel)
8. 🐛 Adicionar try/catch nos handlers de socket
9. 🐛 Corrigir `getTopology()` — `nodes: [online]` → `nodes: online`
10. 🐛 Adicionar cleanup do setInterval no ClusterManager

---

*Análise realizada em: 2026-03-13 às 11:14 GMT-3*  
*Total de arquivos analisados: 20 arquivos de código-fonte*
