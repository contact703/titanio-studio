/**
 * background.js — Tandem Titanio Service Worker
 * Conecta a extensão ao OpenClaw gateway (Tita)
 * via HTTP em http://localhost:18789
 */

const GATEWAY_URL = 'http://localhost:18789';
const AUTH_TOKEN = 'e60ccf70d272c2dc7203130b129a47ae97fa57df656f64e8';

// Estado da conexão (persistido no storage)
let connectionStatus = 'checking';

/**
 * Verifica se o gateway OpenClaw está online
 */
async function checkGatewayHealth() {
  try {
    const resp = await fetch(`${GATEWAY_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    connectionStatus = resp.ok ? 'online' : 'offline';
  } catch {
    // Tenta rota alternativa — OpenClaw pode usar /status
    try {
      const resp2 = await fetch(`${GATEWAY_URL}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      connectionStatus = resp2.ok ? 'online' : 'offline';
    } catch {
      connectionStatus = 'offline';
    }
  }

  await chrome.storage.local.set({ connectionStatus, lastCheck: Date.now() });
  return connectionStatus;
}

/**
 * Envia mensagem para a Tita via OpenClaw gateway
 * @param {string} message - Texto da mensagem
 * @param {string} context - Contexto adicional (URL, título, etc.)
 * @returns {Promise<string>} Resposta da Tita
 */
async function sendToTita(message, context = '') {
  const fullMessage = context
    ? `[Contexto do browser: ${context}]\n\n${message}`
    : message;

  // Tenta endpoint de sessão do OpenClaw
  const endpoints = [
    // Endpoint principal — sessão WhatsApp/direto
    {
      url: `${GATEWAY_URL}/api/sessions/send`,
      body: {
        session: 'agent:main',
        message: fullMessage,
        channel: 'extension'
      }
    },
    // Fallback — endpoint de mensagem genérico
    {
      url: `${GATEWAY_URL}/api/message`,
      body: {
        text: fullMessage,
        source: 'tandem-browser'
      }
    }
  ];

  for (const endpoint of endpoints) {
    try {
      const resp = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(endpoint.body),
        signal: AbortSignal.timeout(30000)
      });

      if (resp.ok) {
        const data = await resp.json();
        return data.response || data.message || data.text || '✅ Mensagem enviada para a Tita!';
      }
    } catch {
      // Tenta próximo endpoint
      continue;
    }
  }

  throw new Error('Não foi possível conectar ao OpenClaw. Verifique se está rodando em http://localhost:18789');
}

/**
 * Captura contexto da aba ativa
 */
async function capturePageContext(tabId) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => ({
        url: window.location.href,
        title: document.title,
        selectedText: window.getSelection()?.toString() || '',
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        h1: document.querySelector('h1')?.textContent?.trim() || ''
      })
    });
    return result?.result || null;
  } catch {
    return null;
  }
}

// ── Listeners de mensagem ─────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type, payload } = request;

  switch (type) {
    case 'CHECK_STATUS':
      checkGatewayHealth().then(status => sendResponse({ status }));
      return true; // async

    case 'SEND_MESSAGE':
      sendToTita(payload.message, payload.context || '')
        .then(response => sendResponse({ success: true, response }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'CAPTURE_CONTEXT':
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (!tabs[0]) {
          sendResponse({ success: false, error: 'Nenhuma aba ativa' });
          return;
        }
        const context = await capturePageContext(tabs[0].id);
        sendResponse({ success: true, context });
      });
      return true;

    case 'OPEN_SIDE_PANEL':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.sidePanel.open({ tabId: tabs[0].id });
        }
        sendResponse({ success: true });
      });
      return true;

    default:
      sendResponse({ error: 'Tipo de mensagem desconhecido' });
  }
});

// ── Inicialização ─────────────────────────────────────────

// Verifica status ao iniciar
checkGatewayHealth();

// Recheck a cada 30 segundos
setInterval(checkGatewayHealth, 30_000);

// Clique no ícone da extensão → abre side panel
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

console.log('[Tandem Titanio] Service worker iniciado 🚀');
