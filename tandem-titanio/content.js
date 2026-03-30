/**
 * content.js — Tandem Titanio Content Script
 * Injeta contexto da página e escuta eventos do side panel
 */

// Captura texto selecionado e envia para o background
document.addEventListener('mouseup', () => {
  const selected = window.getSelection()?.toString().trim();
  if (selected && selected.length > 10) {
    chrome.storage.local.set({ selectedText: selected });
  }
});

// Expõe contexto da página para o background
window.__titanioContext = {
  getPageInfo: () => ({
    url: window.location.href,
    title: document.title,
    selectedText: window.getSelection()?.toString() || '',
    metaDescription: document.querySelector('meta[name="description"]')?.content || '',
    h1: document.querySelector('h1')?.textContent?.trim() || '',
    bodyText: document.body?.innerText?.slice(0, 2000) || '' // Primeiros 2000 chars
  })
};

// Escuta mensagens do side panel (via background)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_CONTEXT') {
    sendResponse({
      success: true,
      context: window.__titanioContext.getPageInfo()
    });
  }
});

console.log('[Tandem Titanio] Content script ativo 🐾');
