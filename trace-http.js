const { chromium } = require('playwright');

(async () => {
  console.log('🔍 Rastreando origem das requisições HTTP...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const httpDetails = [];
  
  page.on('request', req => {
    const url = req.url();
    if (url.startsWith('http://') && url.includes('maricafilmcommission')) {
      httpDetails.push({
        url: url.substring(0, 80),
        initiator: req.frame()?.url()?.substring(0, 50) || 'unknown',
        resourceType: req.resourceType()
      });
    }
  });
  
  console.log('Carregando...');
  await page.goto('https://maricafilmcommission.com/', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  await page.waitForTimeout(5000);
  
  console.log('\n=== REQUISIÇÕES HTTP ===');
  console.log('Total:', httpDetails.length);
  
  // Agrupar por tipo
  const byType = {};
  httpDetails.forEach(d => {
    byType[d.resourceType] = (byType[d.resourceType] || 0) + 1;
  });
  console.log('\nPor tipo:', byType);
  
  // Mostrar exemplos únicos
  const unique = [...new Set(httpDetails.map(d => d.url))];
  console.log('\nURLs únicas:', unique.length);
  unique.slice(0, 5).forEach(u => console.log('  -', u));
  
  await browser.close();
})();
