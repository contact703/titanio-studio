const { chromium } = require('playwright');

(async () => {
  console.log('=== INVESTIGAÇÃO v3 - NOVO BROWSER ===\n');
  console.log('Tempo início:', new Date().toISOString());
  
  // Iniciar novo browser
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Monitorar
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text().substring(0, 150));
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message.substring(0, 150));
  });
  
  page.on('requestfailed', req => {
    console.log('REQUEST FAILED:', req.url().substring(0, 80), req.failure()?.errorText);
  });
  
  console.log('Carregando site...');
  const startTime = Date.now();
  
  try {
    await page.goto('https://maricafilmcommission.com/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    console.log('DOM carregado em', (Date.now() - startTime)/1000, 's');
  } catch (e) {
    console.log('Erro ao carregar:', e.message);
  }
  
  // Capturar estado imediato
  console.log('\n--- ESTADO IMEDIATO ---');
  let state = await page.evaluate(() => ({
    readyState: document.readyState,
    bodyLength: document.body?.innerText?.length || 0,
    title: document.title,
    pendingScripts: document.querySelectorAll('script[type="litespeed/javascript"]').length
  }));
  console.log(state);
  
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/v3-inicial.png' });
  
  // Esperar mais
  console.log('\nEsperando 10s para scripts carregarem...');
  await page.waitForTimeout(10000);
  
  console.log('\n--- ESTADO APÓS 10s ---');
  state = await page.evaluate(() => ({
    readyState: document.readyState,
    bodyLength: document.body?.innerText?.length || 0,
    pendingScripts: document.querySelectorAll('script[type="litespeed/javascript"]').length,
    totalScripts: document.querySelectorAll('script').length,
    links: document.querySelectorAll('a').length,
    visibleText: document.body?.innerText?.substring(0, 300) || ''
  }));
  console.log('readyState:', state.readyState);
  console.log('bodyLength:', state.bodyLength);
  console.log('pendingScripts:', state.pendingScripts, '/', state.totalScripts);
  console.log('links:', state.links);
  console.log('texto:', state.visibleText.substring(0, 150));
  
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/v3-10s.png' });
  
  // Listar menu
  console.log('\n--- MENU ITEMS ---');
  const menuItems = await page.evaluate(() => {
    const items = document.querySelectorAll('nav a, .elementor-nav-menu a, .menu-item a');
    return Array.from(items).slice(0, 12).map(a => ({
      text: a.textContent.trim(),
      href: a.href,
      visible: a.offsetParent !== null && a.offsetWidth > 0
    }));
  });
  menuItems.forEach(item => console.log(`  ${item.visible ? '✓' : '✗'} "${item.text}" -> ${item.href.substring(0, 60)}`));
  
  // Tentar clicar em Locations
  console.log('\n--- CLIQUE EM LOCATIONS ---');
  try {
    const locLink = page.locator('a:has-text("Locations")').first();
    if (await locLink.count() > 0) {
      console.log('Clicando...');
      await locLink.click({ timeout: 5000 });
      await page.waitForTimeout(5000);
      console.log('URL após clique:', page.url());
      await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/v3-locations.png' });
    } else {
      console.log('Link Locations não encontrado');
    }
  } catch (e) {
    console.log('Erro:', e.message);
  }
  
  // Testar idioma
  console.log('\n--- MUDANÇA DE IDIOMA ---');
  await page.goto('https://maricafilmcommission.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  try {
    const ptLink = page.locator('a[href*="/pt/"]').first();
    if (await ptLink.count() > 0) {
      const href = await ptLink.getAttribute('href');
      console.log('Link PT encontrado:', href);
      await ptLink.click({ timeout: 5000 });
      await page.waitForTimeout(5000);
      console.log('URL após mudar idioma:', page.url());
      await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/v3-portugues.png' });
    } else {
      console.log('Link PT não encontrado');
    }
  } catch (e) {
    console.log('Erro:', e.message);
  }
  
  console.log('\n=== FIM ===');
  console.log('Tempo total:', (Date.now() - startTime)/1000, 's');
  
  await browser.close();
})().catch(e => console.error('FATAL:', e.message));
