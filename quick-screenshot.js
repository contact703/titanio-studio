const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  console.log('Carregando...');
  const t1 = Date.now();
  
  await page.goto('https://maricafilmcommission.com/', { 
    waitUntil: 'domcontentloaded',
    timeout: 45000 
  });
  console.log('DOM:', (Date.now() - t1)/1000, 's');
  
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'test-browser.png', fullPage: false });
  console.log('Screenshot salvo: test-browser.png');
  
  // Testar click em Locations
  console.log('Clicando em Locations...');
  try {
    await page.click('text=Locations', { timeout: 5000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-locations.png' });
    console.log('Locations OK');
  } catch (e) {
    console.log('Erro Locations:', e.message.substring(0, 50));
  }
  
  await browser.close();
  console.log('✅ Teste concluído');
})();
