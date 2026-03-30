const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Teste final após purge do cache...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const failed = [];
  page.on('requestfailed', req => {
    const url = req.url();
    if (url.includes('maricafilmcommission')) {
      failed.push(url.substring(0, 70));
    }
  });
  
  console.log('=== HOMEPAGE ===');
  const t1 = Date.now();
  try {
    await page.goto('https://maricafilmcommission.com/', { 
      waitUntil: 'load',
      timeout: 30000 
    });
    console.log('✅ Carregou em', (Date.now() - t1)/1000, 's');
    await page.waitForTimeout(2000);
    
    const state = await page.evaluate(() => ({
      title: document.title,
      links: document.querySelectorAll('a').length,
      images: document.querySelectorAll('img').length
    }));
    console.log('Estado:', state);
    await page.screenshot({ path: 'final-homepage.png' });
    
  } catch (e) {
    console.log('❌', e.message.substring(0, 80));
  }
  
  console.log('\n=== LOCATIONS ===');
  try {
    await page.goto('https://maricafilmcommission.com/locations/', { 
      waitUntil: 'load',
      timeout: 20000 
    });
    console.log('✅ Locations carregou');
    await page.screenshot({ path: 'final-locations.png' });
  } catch (e) {
    console.log('❌', e.message.substring(0, 80));
  }
  
  console.log('\n=== PT ===');
  try {
    await page.goto('https://maricafilmcommission.com/pt/home-portugues/', { 
      waitUntil: 'load',
      timeout: 20000 
    });
    console.log('✅ PT carregou');
    await page.screenshot({ path: 'final-pt.png' });
  } catch (e) {
    console.log('❌', e.message.substring(0, 80));
  }
  
  console.log('\n=== RESUMO ===');
  console.log('Requests falhadas:', failed.length);
  if (failed.length > 0) {
    failed.slice(0, 5).forEach(f => console.log('  -', f));
  }
  
  await browser.close();
  console.log('\n✅ Teste concluído!');
})();
