const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  // Teste 1: Locations via URL direta
  console.log('1. Locations...');
  await page.goto('https://maricafilmcommission.com/locations/', { 
    waitUntil: 'domcontentloaded', timeout: 30000 
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'nav-locations.png' });
  console.log('   ✅ OK');
  
  // Teste 2: About
  console.log('2. About...');
  await page.goto('https://maricafilmcommission.com/about-us/', { 
    waitUntil: 'domcontentloaded', timeout: 30000 
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'nav-about.png' });
  console.log('   ✅ OK');
  
  // Teste 3: PT
  console.log('3. Português...');
  await page.goto('https://maricafilmcommission.com/pt/home-portugues/', { 
    waitUntil: 'domcontentloaded', timeout: 30000 
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'nav-pt.png' });
  console.log('   ✅ OK');
  
  // Teste 4: Locação específica
  console.log('4. Locação (Henfil Cinema)...');
  await page.goto('https://maricafilmcommission.com/henfil-cinema/', { 
    waitUntil: 'domcontentloaded', timeout: 30000 
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'nav-henfil.png' });
  console.log('   ✅ OK');
  
  await browser.close();
  console.log('\n✅ Navegação OK em todas as páginas!');
})();
