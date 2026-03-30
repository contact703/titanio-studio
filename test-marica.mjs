import { chromium } from 'playwright';

console.log('Iniciando teste real do site...');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// Capturar erros
const errors = [];
page.on('console', msg => {
  if (msg.type() === 'error') {
    errors.push(msg.text());
  }
});

page.on('pageerror', error => {
  errors.push('Page Error: ' + error.message);
});

try {
  console.log('\n1. Abrindo página de locações...');
  await page.goto('https://maricafilmcommission.com/locations/', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  console.log('   ✓ Página carregou');
  
  console.log('\n2. Verificando links do menu...');
  const menuLinks = await page.locator('nav a, .elementor-nav-menu a').count();
  console.log('   Links do menu encontrados:', menuLinks);
  
  console.log('\n3. Tentando clicar em "About Us"...');
  const aboutLink = page.locator('a:has-text("About")').first();
  if (await aboutLink.count() > 0) {
    await aboutLink.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log('   ✓ Navegou para:', page.url());
  } else {
    console.log('   ✗ Link "About" não encontrado');
  }
  
  console.log('\n4. Voltando para Locations...');
  await page.goto('https://maricafilmcommission.com/locations/', {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  
  console.log('\n5. Tentando clicar em uma locação...');
  const locationCard = page.locator('a[href*="ponta-negra"], a[href*="beach"], a[href*="lagoon"]').first();
  if (await locationCard.count() > 0) {
    const href = await locationCard.getAttribute('href');
    console.log('   Clicando em:', href);
    await locationCard.click({ timeout: 5000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    console.log('   ✓ Navegou para:', page.url());
  } else {
    console.log('   ✗ Nenhum card de locação encontrado');
  }
  
} catch (e) {
  console.log('   ✗ ERRO:', e.message);
}

console.log('\n=== ERROS DE CONSOLE ===');
if (errors.length > 0) {
  errors.forEach(e => console.log('  •', e.substring(0, 200)));
} else {
  console.log('  Nenhum erro');
}

await browser.close();
console.log('\n✓ Teste finalizado');
