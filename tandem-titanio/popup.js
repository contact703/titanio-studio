/**
 * popup.js — Tandem Titanio Popup
 * Mini painel com status e ações rápidas
 */

const statusBadge = document.getElementById('statusBadge');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const lastAction = document.getElementById('lastAction');
const openPanelBtn = document.getElementById('openPanelBtn');
const captureBtn = document.getElementById('captureBtn');

/** Atualiza UI de status */
function setStatus(status) {
  statusBadge.className = 'status-badge';
  switch (status) {
    case 'online':
      statusBadge.classList.add('online');
      statusDot.textContent = '🟢';
      statusText.textContent = 'Tita Online';
      break;
    case 'offline':
      statusBadge.classList.add('offline');
      statusDot.textContent = '🔴';
      statusText.textContent = 'Offline';
      break;
    default:
      statusBadge.classList.add('checking');
      statusDot.textContent = '⏳';
      statusText.textContent = 'Verificando...';
  }
}

/** Carrega estado do storage */
async function loadState() {
  const data = await chrome.storage.local.get(['connectionStatus', 'lastAction']);
  setStatus(data.connectionStatus || 'checking');
  if (data.lastAction) {
    lastAction.textContent = data.lastAction;
  }
}

/** Abre o side panel */
openPanelBtn.addEventListener('click', async () => {
  chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
  window.close();
});

/** Captura e envia contexto da página */
captureBtn.addEventListener('click', async () => {
  captureBtn.disabled = true;
  captureBtn.textContent = '⏳ Capturando...';

  chrome.runtime.sendMessage({ type: 'CAPTURE_CONTEXT' }, async (resp) => {
    if (resp?.success && resp.context) {
      const ctx = resp.context;
      const contextText = `📸 Contexto capturado:\n🔗 ${ctx.url}\n📄 ${ctx.title}${ctx.selectedText ? `\n✏️ Selecionado: "${ctx.selectedText}"` : ''}`;

      // Abre side panel e envia contexto
      chrome.runtime.sendMessage({
        type: 'SEND_MESSAGE',
        payload: {
          message: 'Acabei de capturar o contexto desta página para você.',
          context: contextText
        }
      });

      await chrome.storage.local.set({ lastAction: `📸 ${ctx.title?.slice(0, 40)}` });
    }

    captureBtn.disabled = false;
    captureBtn.textContent = '📸 Capturar página atual';
    window.close();
  });
});

// Verifica status ao abrir
chrome.runtime.sendMessage({ type: 'CHECK_STATUS' }, (resp) => {
  setStatus(resp?.status || 'offline');
});

// Carrega estado salvo
loadState();
