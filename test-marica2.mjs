import { chromium } from 'playwright';

console.log('Teste v2 - com domcontentloaded...');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

try {
  console.log('\n1. Abrindo página (domcontentloaded)...');
  await page.goto('https://maricafilmcommission.com/locations/', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  console.log('   ✓ DOM carregou em', page.url());
  
  // Esperar mais um pouco
  await page.waitForTimeout(3000);
  
  console.log('\n2. Contando elementos...');
  const links = await page.locator('a').count();
  const images = await page.locator('img').count();
  console.log('   Links:', links, '| Imagens:', images);
  
  console.log('\n3. Verificando link About Us...');
  const aboutLink = page.locator('a.elementor-item:has-text("About")').first();
  const aboutVisible = await aboutLink.isVisible().catch(() => false);
  console.log('   Visível:', aboutVisible);
  
  if (aboutVisible) {
    console.log('\n4. Clicando em About Us...');
    await aboutLink.click();
    await page.waitForTimeout(3000);
    console.log('   URL após clique:', page.url());
    
    if (page.url().includes('about')) {
      console.log('   ✓ NAVEGAÇÃO FUNCIONOU!');
    } else {
      console.log('   ✗ Navegação falhou - ainda em:', page.url());
    }
  }
  
  console.log('\n5. Testando card de locação...');
  await page.goto('https://maricafilmcommission.com/locations/', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(3000);
  
  const locationCard = page.locator('a[href*="/aracatiba"], a[href*="/ponta-negra"], a[href*="/beach"]').first();
  const cardVisible = await locationCard.isVisible().catch(() => false);
  console.log('   Card visível:', cardVisible);
  
  if (cardVisible) {
    const href = await locationCard.getAttribute('href');
    console.log('   Clicando em:', href);
    await locationCard.click();
    await page.waitForTimeout(3000);
    console.log('   URL após clique:', page.url());
    
    if (page.url() !== 'https://maricafilmcommission.com/locations/') {
      console.log('   ✓ NAVEGAÇÃO DO CARD FUNCIONOU!');
    } else {
      console.log('   ✗ Navegação do card falhou');
    }
  }

} catch (e) {
  console.log('ERRO:', e.message);
}

console.log('\n=== ERROS ===');
errors.forEach(e => console.log('  •', e.substring(0, 150)));
if (errors.length === 0) console.log('  Nenhum');

await browser.close();
