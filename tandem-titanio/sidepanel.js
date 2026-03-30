/**
 * sidepanel.js — Tandem Titanio Side Panel
 * Painel lateral principal — onde a Tita vive no browser
 */

// ── Elementos ────────────────────────────────────────────

const statusBadge  = document.getElementById('statusBadge');
const statusEmoji  = document.getElementById('statusEmoji');
const statusLabel  = document.getElementById('statusLabel');
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const sendBtn      = document.getElementById('sendBtn');
const captureBtn   = document.getElementById('captureBtn');
const taskBtn      = document.getElementById('taskBtn');
const taskField    = document.getElementById('taskField');
const taskInput    = document.getElementById('taskInput');
const taskSendBtn  = document.getElementById('taskSendBtn');
const taskCancelBtn = document.getElementById('taskCancelBtn');
const historyList  = document.getElementById('historyList');

// ── Estado ────────────────────────────────────────────────

let actionHistory = [];
let isWaitingResponse = false;

// ── Utilitários ───────────────────────────────────────────

/** Formata tempo relativo */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'agora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
  return `${Math.floor(diff / 3600000)}h`;
}

/** Adiciona mensagem ao chat */
function addMessage(text, type = 'tita') {
  // Remove loading se existir
  const loading = chatMessages.querySelector('.message.loading');
  if (loading) loading.remove();

  const msg = document.createElement('div');
  msg.className = `message ${type}`;

  if (type === 'tita') {
    msg.innerHTML = `<div class="message-header">🐾 Tita</div>${escapeHtml(text).replace(/\n/g, '<br>')}`;
  } else if (type === 'user') {
    msg.textContent = text;
  } else {
    msg.textContent = text;
  }

  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

/** Adiciona indicador de loading */
function addLoadingMessage() {
  const msg = document.createElement('div');
  msg.className = 'message tita loading';
  msg.innerHTML = `
    <div class="message-header">🐾 Tita</div>
    <div class="dots">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return msg;
}

/** Escape HTML */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Adiciona ação ao histórico */
async function addToHistory(icon, text) {
  const item = { icon, text, timestamp: Date.now() };
  actionHistory.unshift(item);
  actionHistory = actionHistory.slice(0, 5); // Mantém últimas 5

  await chrome.storage.local.set({ actionHistory, lastAction: text.slice(0, 50) });
  renderHistory();
}

/** Renderiza histórico */
function renderHistory() {
  if (actionHistory.length === 0) return;

  historyList.innerHTML = actionHistory.map(item => `
    <li class="history-item">
      <span class="history-icon">${item.icon}</span>
      <span class="history-text">${escapeHtml(item.text)}</span>
      <span class="history-time">${timeAgo(item.timestamp)}</span>
    </li>
  `).join('');
}

// ── Status ────────────────────────────────────────────────

/** Atualiza indicador de status */
function setStatus(status) {
  statusBadge.className = 'status-badge';
  const dot = document.getElementById('dot-openclaw');

  switch (status) {
    case 'online':
      statusBadge.classList.add('online');
      statusEmoji.textContent = '🟢';
      statusLabel.textContent = 'Tita Online';
      if (dot) { dot.className = 'integration-dot on'; }
      break;
    case 'offline':
      statusBadge.classList.add('offline');
      statusEmoji.textContent = '🔴';
      statusLabel.textContent = 'Offline';
      if (dot) { dot.className = 'integration-dot off'; }
      break;
    default:
      statusBadge.classList.add('checking');
      statusEmoji.textContent = '⏳';
      statusLabel.textContent = 'Verificando';
      if (dot) { dot.className = 'integration-dot checking'; }
  }
}

/** Verifica status das integrações */
async function checkIntegrations() {
  setStatus('checking');

  chrome.runtime.sendMessage({ type: 'CHECK_STATUS' }, (resp) => {
    setStatus(resp?.status || 'offline');
  });

  // Checar status do dashboard (Google, Instagram, n8n)
  checkDashboardIntegrations();
}

/** Verifica integrações do dashboard Titanio */
async function checkDashboardIntegrations() {
  const integrations = [
    { id: 'google', url: 'http://localhost:3001/api/google/status' },
    { id: 'instagram', url: 'http://localhost:3001/api/instagram/status' },
    { id: 'n8n', url: 'http://localhost:5678/api/v1/workflows?limit=1' }
  ];

  for (const { id, url } of integrations) {
    const dot = document.getElementById(`dot-${id}`);
    if (!dot) continue;

    try {
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(3000),
        headers: { 'Content-Type': 'application/json' }
      });
      dot.className = `integration-dot ${resp.ok ? 'on' : 'off'}`;
    } catch {
      dot.className = 'integration-dot off';
    }
  }
}

// ── Envio de mensagens ────────────────────────────────────

/** Envia mensagem de chat para a Tita */
async function sendMessage(text, context = '') {
  if (!text.trim() || isWaitingResponse) return;

  isWaitingResponse = true;
  sendBtn.disabled = true;

  addMessage(text, 'user');
  addToHistory('💬', text);
  addLoadingMessage();

  chrome.runtime.sendMessage(
    { type: 'SEND_MESSAGE', payload: { message: text, context } },
    (resp) => {
      isWaitingResponse = false;
      sendBtn.disabled = false;

      if (resp?.success) {
        addMessage(resp.response, 'tita');
      } else {
        addMessage(
          `❌ Erro ao conectar com a Tita: ${resp?.error || 'Verifique se o OpenClaw está rodando.'}`,
          'system'
        );
      }
    }
  );

  chatInput.value = '';
  chatInput.style.height = 'auto';
}

// ── Event Listeners ───────────────────────────────────────

/** Enviar com Enter (Shift+Enter = nova linha) */
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(chatInput.value.trim());
  }
});

/** Auto-resize do textarea */
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
});

/** Botão enviar */
sendBtn.addEventListener('click', () => {
  sendMessage(chatInput.value.trim());
});

/** Capturar contexto da página */
captureBtn.addEventListener('click', async () => {
  captureBtn.disabled = true;
  captureBtn.textContent = '⏳ Capturando...';

  chrome.runtime.sendMessage({ type: 'CAPTURE_CONTEXT' }, async (resp) => {
    captureBtn.disabled = false;
    captureBtn.textContent = '📸 Capturar contexto';

    if (resp?.success && resp.context) {
      const ctx = resp.context;
      const contextSummary = `📸 Página capturada!\n🔗 URL: ${ctx.url}\n📄 Título: ${ctx.title}${ctx.selectedText ? `\n✏️ Selecionado: "${ctx.selectedText.slice(0, 200)}"` : ''}`;

      addMessage(contextSummary, 'system');
      addToHistory('📸', ctx.title || ctx.url);

      await sendMessage(
        `Analise o contexto desta página para mim.`,
        `URL: ${ctx.url}\nTítulo: ${ctx.title}\nDescrição: ${ctx.metaDescription}\nH1: ${ctx.h1}\n${ctx.selectedText ? `Texto selecionado: "${ctx.selectedText.slice(0, 500)}"` : ''}`
      );
    } else {
      addMessage('❌ Não foi possível capturar o contexto da página.', 'system');
    }
  });
});

/** Botão "Deixa a Tita fazer" */
taskBtn.addEventListener('click', () => {
  taskField.classList.toggle('visible');
  if (taskField.classList.contains('visible')) {
    taskInput.focus();
  }
});

taskCancelBtn.addEventListener('click', () => {
  taskField.classList.remove('visible');
  taskInput.value = '';
});

taskSendBtn.addEventListener('click', async () => {
  const task = taskInput.value.trim();
  if (!task) return;

  taskField.classList.remove('visible');

  // Captura contexto da página junto com a tarefa
  chrome.runtime.sendMessage({ type: 'CAPTURE_CONTEXT' }, async (resp) => {
    const ctx = resp?.context;
    const context = ctx
      ? `URL atual: ${ctx.url}\nTítulo: ${ctx.title}\n${ctx.selectedText ? `Selecionado: "${ctx.selectedText.slice(0, 500)}"` : ''}`
      : '';

    addToHistory('🤖', task);
    await sendMessage(`🤖 TAREFA: ${task}`, context);
    taskInput.value = '';
  });
});

/** Collapsibles */
document.querySelectorAll('.collapsible-header').forEach(header => {
  header.addEventListener('click', () => {
    const targetId = header.dataset.target;
    const body = document.getElementById(targetId);
    const icon = header.querySelector('.collapse-icon');

    if (body) {
      body.classList.toggle('open');
      icon?.classList.toggle('open');
    }
  });
});

// ── Inicialização ─────────────────────────────────────────

async function init() {
  // Carrega histórico salvo
  const data = await chrome.storage.local.get(['actionHistory', 'connectionStatus']);
  if (data.actionHistory) {
    actionHistory = data.actionHistory;
    renderHistory();
  }

  // Verifica status
  setStatus(data.connectionStatus || 'checking');
  checkIntegrations();

  // Recheck a cada 30s
  setInterval(checkIntegrations, 30_000);

  chatInput.focus();
}

init();
