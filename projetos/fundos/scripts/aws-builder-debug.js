/**
 * Debug: capturar URL real do botão "Criar ID do builder"
 */
const { chromium } = require('playwright');
const fs = require('fs');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-builder';
const LOG_FILE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
function log(msg) { console.log(msg); fs.appendFileSync(LOG_FILE, msg + '\n'); }

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  // Interceptar navegação
  page.on('request', req => {
    if (!req.url().includes('cookie') && !req.url().includes('analytics') && !req.url().includes('pixel')) {
      if (req.resourceType() === 'document') {
        console.log('📡 NAV:', req.url().substring(0,100));
      }
    }
  });

  // Interceptar abertura de popups
  ctx.on('page', newPage => {
    console.log('🆕 NOVA PÁGINA/POPUP:', newPage.url());
    log('🆕 Popup detectado: ' + newPage.url());
    newPage.on('load', () => {
      console.log('🆕 Popup loaded:', newPage.url());
      log('🆕 Popup URL final: ' + newPage.url());
      newPage.screenshot({ path: OUTDIR + '/popup-page.png' });
    });
  });

  await page.goto('https://aws.amazon.com/startups/sign-up', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  try { await page.click('button:has-text("Aceitar")', { timeout: 2000 }); } catch(e) {}
  await page.waitForTimeout(1000);

  // Inspecionar o botão diretamente
  const btnInfo = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, a'));
    const btn = btns.find(b => b.innerText.includes('Criar ID do builder') || b.innerText.includes('Create your AWS Builder'));
    if (!btn) return null;
    return {
      tag: btn.tagName,
      text: btn.innerText,
      href: btn.href || 'none',
      onclick: btn.getAttribute('onclick') || 'none',
      'data-href': btn.getAttribute('data-href') || 'none',
      'data-url': btn.getAttribute('data-url') || 'none',
      outerHTML: btn.outerHTML.substring(0, 300),
    };
  });
  log('Botão Builder ID info: ' + JSON.stringify(btnInfo, null, 2));

  // Verificar shadow DOM
  const shadowInfo = await page.evaluate(() => {
    function searchInShadowDom(root) {
      const all = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.shadowRoot) {
          all.push({
            tag: node.tagName,
            id: node.id,
            class: node.className.substring(0,50),
            shadowHTML: node.shadowRoot.innerHTML.substring(0,200)
          });
        }
      }
      return all;
    }
    return searchInShadowDom(document);
  });
  log('Shadow DOM elementos: ' + shadowInfo.length);
  if (shadowInfo.length > 0) log('Shadow DOM: ' + JSON.stringify(shadowInfo.slice(0,5), null, 2));

  // Tentar clicar e verificar o que acontece
  await page.click('button:has-text("Criar ID do builder")').catch(e => log('Erro click: ' + e.message));
  await page.waitForTimeout(3000);
  
  const allPages = ctx.pages();
  log('Páginas abertas: ' + allPages.length);
  for (const p of allPages) {
    log('  Página: ' + p.url());
  }
  
  await page.screenshot({ path: OUTDIR + '/debug-after.png' });
  log('URL: ' + page.url());

  // Verificar se abriu nova aba
  if (allPages.length > 1) {
    const newPage = allPages[1];
    await newPage.waitForTimeout(3000);
    log('Nova aba URL: ' + newPage.url());
    await newPage.screenshot({ path: OUTDIR + '/new-tab.png' });
    
    // Preencher formulário na nova aba
    const inputs = await newPage.$$eval('input:not([type="hidden"])', els => 
      els.map(e => ({ type: e.type, id: e.id, ph: e.placeholder.substring(0,30) }))
    );
    log('Campos na nova aba: ' + JSON.stringify(inputs));
  }

  await page.waitForTimeout(20000);
  await b.close();
  log('🏁 Debug concluído\n');
})();
