const { chromium } = require('playwright');

(async () => {
  console.log('=== INVESTIGAÇÃO PROFUNDA - PLAYWRIGHT ===\n');
  
  // Conectar ao Chrome existente
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const contexts = browser.contexts();
  
  if (contexts.length === 0) {
    console.log('Nenhum contexto encontrado');
    return;
  }
  
  const context = contexts[0];
  const pages = context.pages();
  
  let page = pages.find(p => p.url().includes('maricafilmcommission'));
  
  if (!page) {
    console.log('Página não encontrada, abrindo nova...');
    page = await context.newPage();
    await page.goto('https://maricafilmcommission.com/', { waitUntil: 'networkidle', timeout: 60000 });
  }
  
  console.log('URL:', page.url());
  console.log('Título:', await page.title());
  
  // Coletar erros de console
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message);
  });
  
  // Verificar estado
  console.log('\n--- ESTADO DO DOM ---');
  const state = await page.evaluate(() => ({
    bodyLength: document.body.innerText.length,
    bodyText: document.body.innerText.substring(0, 300),
    links: document.querySelectorAll('a').length,
    scriptsTotal: document.querySelectorAll('script').length,
    scriptsPending: document.querySelectorAll('script[type="litespeed/javascript"]').length,
    images: document.querySelectorAll('img').length,
    imagesLoaded: Array.from(document.querySelectorAll('img')).filter(i => i.complete).length
  }));
  
  console.log('Body:', state.bodyLength, 'chars');
  console.log('Links:', state.links);
  console.log('Scripts pendentes:', state.scriptsPending, '/', state.scriptsTotal);
  console.log('Imagens:', state.imagesLoaded, '/', state.images);
  console.log('\nTexto:', state.bodyText.substring(0, 200), '...');
  
  // Screenshot inicial
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pw-screenshot-1.png' });
  console.log('\nScreenshot 1 salvo');
  
  // Verificar menu
  console.log('\n--- MENU ---');
  const menuItems = await page.evaluate(() => {
    const items = document.querySelectorAll('.elementor-nav-menu a, nav a');
    return Array.from(items).slice(0, 8).map(a => ({
      text: a.textContent.trim(),
      href: a.href,
      visible: a.offsetParent !== null
    }));
  });
  menuItems.forEach(item => {
    console.log(`  ${item.visible ? '✓' : '✗'} ${item.text} -> ${item.href}`);
  });
  
  // Tentar clicar em Locations
  console.log('\n--- TESTE: CLICAR EM LOCATIONS ---');
  try {
    const locLink = await page.locator('a:has-text("Locations"), a:has-text("Locações"), a[href*="/locations"]').first();
    if (await locLink.count() > 0) {
      console.log('Link encontrado, clicando...');
      await locLink.click({ timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      console.log('URL após clique:', page.url());
    } else {
      console.log('Link não encontrado');
    }
  } catch (e) {
    console.log('ERRO ao clicar:', e.message);
  }
  
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pw-screenshot-2.png' });
  console.log('Screenshot 2 salvo');
  
  // Voltar e testar idioma
  console.log('\n--- TESTE: MUDAR IDIOMA ---');
  await page.goto('https://maricafilmcommission.com/', { waitUntil: 'networkidle', timeout: 60000 });
  
  try {
    const ptLink = await page.locator('a[href*="/pt/"], a:has-text("PT"), a:has-text("Português")').first();
    if (await ptLink.count() > 0) {
      console.log('Link PT encontrado, clicando...');
      await ptLink.click({ timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      console.log('URL após mudar idioma:', page.url());
    } else {
      console.log('Link PT não encontrado');
    }
  } catch (e) {
    console.log('ERRO ao mudar idioma:', e.message);
  }
  
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/pw-screenshot-3.png' });
  console.log('Screenshot 3 salvo');
  
  // Erros coletados
  console.log('\n--- ERROS COLETADOS ---');
  if (errors.length > 0) {
    errors.forEach(e => console.log('  ERROR:', e));
  } else {
    console.log('  Nenhum erro capturado');
  }
  
  console.log('\n=== FIM ===');
  
  await browser.close();
})().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
