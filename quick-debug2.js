const { chromium } = require('playwright');

(async () => {
  console.log('Iniciando...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  const failedRequests = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 150));
  });
  page.on('pageerror', err => errors.push('PAGE: ' + err.message.substring(0, 150)));
  page.on('requestfailed', req => failedRequests.push(req.url().substring(0, 80) + ' - ' + req.failure()?.errorText));
  
  console.log('Carregando (domcontentloaded)...');
  const start = Date.now();
  
  await page.goto('https://maricafilmcommission.com/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  console.log('DOM carregou em', (Date.now() - start)/1000, 's');
  
  // Esperar um pouco mais
  await page.waitForTimeout(5000);
  
  const state = await page.evaluate(() => ({
    readyState: document.readyState,
    title: document.title,
    bodyLength: document.body?.innerText?.length || 0,
    links: document.querySelectorAll('a').length
  }));
  console.log('Estado após 5s:', state);
  
  await page.screenshot({ path: 'debug-dom.png' });
  console.log('Screenshot: debug-dom.png');
  
  if (errors.length > 0) {
    console.log('\nERROS:', errors.length);
    errors.slice(0, 5).forEach(e => console.log('-', e));
  }
  
  if (failedRequests.length > 0) {
    console.log('\nREQUISIÇÕES FALHADAS:', failedRequests.length);
    failedRequests.slice(0, 5).forEach(r => console.log('-', r));
  }
  
  await browser.close();
})();
