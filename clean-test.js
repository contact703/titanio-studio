const { chromium } = require('playwright');

(async () => {
  console.log('🧹 Teste com cache limpo...\n');
  
  const browser = await chromium.launch({ headless: true });
  // Contexto novo = sem cache
  const context = await browser.newContext({
    bypassCSP: true
  });
  const page = await context.newPage();
  
  const httpRequests = [];
  const httpsRequests = [];
  
  page.on('request', req => {
    const url = req.url();
    if (url.startsWith('http://')) {
      httpRequests.push(url.substring(0, 80));
    } else if (url.startsWith('https://')) {
      httpsRequests.push(url);
    }
  });
  
  console.log('Carregando homepage...');
  await page.goto('https://maricafilmcommission.com/', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  await page.waitForTimeout(5000); // Esperar recursos carregarem
  
  console.log('\n=== RESUMO ===');
  console.log('Requests HTTPS:', httpsRequests.length);
  console.log('Requests HTTP:', httpRequests.length);
  
  if (httpRequests.length > 0) {
    console.log('\nRequests HTTP (problema):');
    [...new Set(httpRequests)].slice(0, 10).forEach(r => console.log('  -', r));
  }
  
  await page.screenshot({ path: 'clean-test.png' });
  await browser.close();
  
  console.log('\n✅ Concluído');
})();
