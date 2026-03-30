const { chromium } = require('playwright');

(async () => {
  console.log('🧪 TESTE COMPLETO DE NAVEGAÇÃO\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const pages = [
    { name: 'Homepage EN', url: 'https://maricafilmcommission.com/' },
    { name: 'Locations EN', url: 'https://maricafilmcommission.com/locations/' },
    { name: 'Elephant Rock', url: 'https://maricafilmcommission.com/elephant-rock/' },
    { name: 'Henfil Cinema', url: 'https://maricafilmcommission.com/henfil-cinema/' },
    { name: 'Homepage PT', url: 'https://maricafilmcommission.com/pt/home-portugues/' },
    { name: 'Locações PT', url: 'https://maricafilmcommission.com/pt/locacoes/' },
    { name: 'Pedra Elefante PT', url: 'https://maricafilmcommission.com/pt/pedra-do-elefante-2/' },
    { name: 'Cinema Henfil PT', url: 'https://maricafilmcommission.com/pt/cinema-henfil/' }
  ];
  
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const num = String(i + 1).padStart(2, '0');
    console.log(`${num}. ${p.name}...`);
    
    try {
      await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `full-${num}-${p.name.replace(/\s+/g, '-').toLowerCase()}.png` });
      console.log(`    ✅ OK`);
    } catch (e) {
      console.log(`    ❌ ${e.message.substring(0, 50)}`);
    }
  }
  
  await browser.close();
  console.log('\n✅ Teste concluído!');
})();
