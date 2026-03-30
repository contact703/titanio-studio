// IDB Lab Airtable v3 - Aguardar React render + mouse click
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/idb-lab';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG, msg + '\n');
}

async function shot(page, name) {
  const file = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  log(`📸 ${file}`);
}

const DADOS = {
  nome: 'Tiago Arakilian Affonso',
  email: 'tiago@titaniofilms.com',
  empresa: 'Titanio Studio',
  site: 'https://titaniofilms.com',
  descricao: 'VoxDescriber: AI audio description system for 6.5M visually impaired Brazilians. Uses WhisperX + Qwen2.5 LLM + Piper TTS. Works offline. Complies with NBR 15290. Pre-revenue stage targeting media companies and OTT platforms.',
  pais: 'Brazil',
};

(async () => {
  const ts = new Date().toISOString();
  log(`\n---\n### IDB Lab Airtable v3 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await ctx.newPage();

  try {
    await page.goto('https://airtable.com/apperI6xBpfHml1rE/pagSorajtGqp8nX7h/form', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Aguardar mais para React renderizar
    await page.waitForTimeout(8000);
    await shot(page, 'at3-01-loaded');
    log(`URL: ${page.url()}`);
    
    // Tentar aguardar seletores Airtable específicos
    try {
      await page.waitForSelector('[data-testid], .cellContainer, .fieldCellContainer, input, textarea', { timeout: 15000 });
      log('✅ Seletor encontrado');
    } catch(e) {
      log(`⚠️ Timeout aguardando seletor: ${e.message.substring(0,100)}`);
    }
    
    await shot(page, 'at3-02-after-wait');
    
    // Verificar todos os elementos clicáveis
    const clickables = await page.$$eval('button, input, textarea, [role="textbox"], [tabindex]', els =>
      els.map(e => ({
        tag: e.tagName, type: e.type || '', id: e.id,
        'aria-label': e.getAttribute('aria-label') || '',
        'data-testid': e.getAttribute('data-testid') || '',
        text: e.textContent.trim().substring(0, 50),
        visible: (() => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })()
      }))
      .filter(e => e.visible)
    );
    log(`Elementos clicáveis visíveis: ${JSON.stringify(clickables.slice(0,30))}`);
    
    // Listar todos inputs/textareas de qualquer tipo
    const allFields = await page.$$eval('*', els =>
      els.filter(e => {
        const role = e.getAttribute('role');
        const tag = e.tagName.toLowerCase();
        return (tag === 'input' || tag === 'textarea' || role === 'textbox' || e.contentEditable === 'true');
      })
      .map(e => ({
        tag: e.tagName, id: e.id, type: e.type || '',
        role: e.getAttribute('role') || '',
        ce: e.contentEditable,
        'aria-label': e.getAttribute('aria-label') || '',
        visible: (() => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })()
      }))
      .filter(e => e.visible)
    );
    log(`Todos campos visíveis: ${JSON.stringify(allFields.slice(0,20))}`);
    
    // Tentar clicar em células Airtable (divs clicáveis)
    // Airtable forms usam estrutura de grid
    const cells = await page.$$('.cellContainer, [class*="cell"], [class*="field"], [class*="input"]');
    log(`Células: ${cells.length}`);
    
    // Se nada funcionar, tentar scroll e screenshot para ver o que está na página
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    await shot(page, 'at3-03-scroll-top');
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
    await page.waitForTimeout(1000);
    await shot(page, 'at3-04-scroll-mid');
    
    // Extrair texto visível para entender o formulário
    const pageText = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const texts = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text.length > 2 && text.length < 100) texts.push(text);
      }
      return texts.slice(0, 50);
    });
    log(`Texto visível: ${JSON.stringify(pageText)}`);
    
    // Tentar pelo keyboard: Tab para navegar
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await shot(page, 'at3-05-tab1');
    
    // Verificar qual elemento ficou focado
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el?.tagName, id: el?.id, class: el?.className?.substring(0, 80), type: el?.type };
    });
    log(`Focado após Tab: ${JSON.stringify(focused)}`);
    
    // Tentar digitar
    await page.keyboard.type(DADOS.nome);
    await page.waitForTimeout(500);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await page.keyboard.type(DADOS.email);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);
    await page.keyboard.type(DADOS.empresa);
    
    await shot(page, 'at3-06-typed');
    
    // Tentar submit com Enter ou clique
    try {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      await shot(page, 'at3-07-enter');
    } catch(e) {}
    
    // Tentar clicar em qualquer botão de submit
    const submitBtns = await page.$$('button, [role="button"]');
    for (const btn of submitBtns) {
      const text = await btn.evaluate(e => e.textContent.trim());
      const visible = await btn.isVisible();
      if (visible && /submit|send|enviar/i.test(text)) {
        log(`Clicando botão: ${text}`);
        await btn.click();
        await page.waitForTimeout(3000);
        await shot(page, 'at3-08-btn-click');
        break;
      }
    }
    
    await shot(page, 'at3-99-final');
    log(`📌 STATUS IDB Airtable v3: Formulário requer interação manual — React app pesado`);
    log(`📌 URL DIRETO: https://airtable.com/apperI6xBpfHml1rE/pagSorajtGqp8nX7h/form`);
    log(`📌 ALTERNATIVA: https://airtable.com/apperI6xBpfHml1rE/pagoG70Ks13qsy4JU/form (Loans)`);

  } catch(e) {
    log(`❌ ERRO IDB v3: ${e.message.substring(0,200)}`);
    await shot(page, 'at3-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 idb-airtable-v3 finalizado\n');
  }
})();
