const { chromium } = require('playwright');

(async () => {
  console.log('🖥️ TESTE VISUAL NO BROWSER\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Browser visível!
    slowMo: 1000      // 1 segundo entre ações
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // 1. Homepage EN
  console.log('1. Homepage EN...');
  await page.goto('https://maricafilmcommission.com/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 45000 
  });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'visual-1-home-en.png' });
  console.log('   ✅ Screenshot salvo');
  
  // 2. Locations EN
  console.log('2. Locations EN...');
  await page.goto('https://maricafilmcommission.com/locations/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'visual-2-locations-en.png' });
  console.log('   ✅ Screenshot salvo');
  
  // 3. Uma locação específica EN
  console.log('3. Elephant Rock (EN)...');
  await page.goto('https://maricafilmcommission.com/elephant-rock/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'visual-3-elephant-en.png' });
  console.log('   ✅ Screenshot salvo');
  
  // 4. Homepage PT
  console.log('4. Homepage PT...');
  await page.goto('https://maricafilmcommission.com/pt/home-portugues/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'visual-4-home-pt.png' });
  console.log('   ✅ Screenshot salvo');
  
  // 5. Locações PT
  console.log('5. Locações PT...');
  await page.goto('https://maricafilmcommission.com/pt/locacoes/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'visual-5-locacoes-pt.png' });
  console.log('   ✅ Screenshot salvo');
  
  // 6. Uma locação específica PT
  console.log('6. Pedra do Elefante (PT)...');
  await page.goto('https://maricafilmcommission.com/pt/pedra-do-elefante-2/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'visual-6-pedra-pt.png' });
  console.log('   ✅ Screenshot salvo');
  
  // 7. Cinema Henfil PT
  console.log('7. Cinema Henfil (PT)...');
  await page.goto('https://maricafilmcommission.com/pt/cinema-henfil/', { 
    waitUntil: 'domcontentloaded', 
    timeout: 30000 
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'visual-7-henfil-pt.png' });
  console.log('   ✅ Screenshot salvo');
  
  await browser.close();
  console.log('\n✅ TESTE CONCLUÍDO - 7 páginas testadas!');
})();
