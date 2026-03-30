const { chromium } = require('playwright');

(async () => {
  console.log('=== INVESTIGAÇÃO v2 ===\n');
  console.log('Tempo início:', new Date().toISOString());
  
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  
  // Monitorar requisições de rede
  const requests = [];
  const failedRequests = [];
  
  page.on('request', req => {
    requests.push({ url: req.url(), time: Date.now() });
  });
  
  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), error: req.failure()?.errorText });
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('CONSOLE ERROR:', msg.text().substring(0, 200));
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message.substring(0, 200));
  });
  
  console.log('\nCarregando site (domcontentloaded apenas)...');
  
  try {
    // Usar domcontentloaded em vez de networkidle
    await page.goto('https://maricafilmcommission.com/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    console.log('DOM carregado em:', new Date().toISOString());
    console.log('URL:', page.url());
    
  } catch (e) {
    console.log('Erro ao carregar:', e.message);
  }
  
  // Esperar um pouco e verificar estado
  await page.waitForTimeout(5000);
  
  console.log('\n--- ESTADO APÓS 5s ---');
  const state = await page.evaluate(() => ({
    readyState: document.readyState,
    bodyLength: document.body?.innerText?.length || 0,
    bodyText: document.body?.innerText?.substring(0, 200) || 'vazio',
    pendingScripts: document.querySelectorAll('script[type="litespeed/javascript"]').length,
    totalScripts: document.querySelectorAll('script').length,
    links: document.querySelectorAll('a').length
  }));
  console.log(state);
  
  // Screenshot
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/estado-5s.png' });
  console.log('Screenshot: estado-5s.png');
  
  // Esperar mais e verificar novamente
  console.log('\nEsperando mais 10s...');
  await page.waitForTimeout(10000);
  
  console.log('\n--- ESTADO APÓS 15s ---');
  const state2 = await page.evaluate(() => ({
    readyState: document.readyState,
    bodyLength: document.body?.innerText?.length || 0,
    pendingScripts: document.querySelectorAll('script[type="litespeed/javascript"]').length,
    activeXHRs: performance.getEntriesByType('resource').filter(r => !r.responseEnd).length
  }));
  console.log(state2);
  
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/estado-15s.png' });
  console.log('Screenshot: estado-15s.png');
  
  // Testar clique
  console.log('\n--- TENTANDO CLICAR ---');
  try {
    const link = page.locator('a').filter({ hasText: /location/i }).first();
    if (await link.count() > 0) {
      const href = await link.getAttribute('href');
      console.log('Link encontrado:', href);
      await link.click({ timeout: 5000 });
      console.log('Clique executado');
      await page.waitForTimeout(3000);
      console.log('URL após clique:', page.url());
    } else {
      console.log('Link não encontrado');
      
      // Listar todos os links
      const allLinks = await page.evaluate(() => 
        Array.from(document.querySelectorAll('a')).slice(0, 15).map(a => ({
          text: a.textContent.trim().substring(0, 30),
          href: a.href
        }))
      );
      console.log('Links disponíveis:', allLinks);
    }
  } catch (e) {
    console.log('Erro ao clicar:', e.message);
  }
  
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/estado-apos-clique.png' });
  
  // Requisições que falharam
  console.log('\n--- REQUISIÇÕES FALHADAS ---');
  console.log(failedRequests.slice(0, 10));
  
  console.log('\n--- TOTAL DE REQUISIÇÕES ---');
  console.log('Total:', requests.length);
  
  console.log('\n=== FIM ===');
  console.log('Tempo fim:', new Date().toISOString());
  
  await browser.close();
})().catch(e => console.error('FATAL:', e.message));
