const { chromium } = require('playwright');

(async () => {
  console.log('=== VERIFICAÇÃO FINAL DO SITE ===');
  console.log('Início:', new Date().toISOString(), '\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = { passed: 0, failed: 0, warnings: 0, details: [] };
  
  async function testPage(name, url, waitTime = 3000) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(waitTime);
      
      const state = await page.evaluate(() => ({
        bodyLength: document.body?.innerText?.length || 0,
        hasNav: !!document.querySelector('nav, .elementor-nav-menu'),
        hasContent: document.body?.innerText?.length > 200,
        title: document.title
      }));
      
      if (state.hasContent) {
        console.log(`✅ ${name}`);
        results.passed++;
        results.details.push(`✅ ${name}`);
      } else {
        console.log(`⚠️ ${name} - pouco conteúdo (${state.bodyLength} chars)`);
        results.warnings++;
        results.details.push(`⚠️ ${name} - pouco conteúdo`);
      }
      return true;
    } catch (e) {
      console.log(`❌ ${name} - ${e.message.substring(0, 50)}`);
      results.failed++;
      results.details.push(`❌ ${name} - erro`);
      return false;
    }
  }
  
  // TESTE 1: Páginas principais
  console.log('--- PÁGINAS PRINCIPAIS ---');
  await testPage('Homepage EN', 'https://maricafilmcommission.com/');
  await testPage('Homepage PT', 'https://maricafilmcommission.com/pt/home-portugues/');
  await testPage('Locations EN', 'https://maricafilmcommission.com/locations/');
  await testPage('Locações PT', 'https://maricafilmcommission.com/pt/locacoes/');
  await testPage('About EN', 'https://maricafilmcommission.com/about-us/');
  await testPage('Sobre PT', 'https://maricafilmcommission.com/pt/sobre/');
  await testPage('Contact EN', 'https://maricafilmcommission.com/contact/');
  await testPage('Contato PT', 'https://maricafilmcommission.com/pt/contato/');
  await testPage('Filming Auth EN', 'https://maricafilmcommission.com/filming-authorization-form/');
  await testPage('Autorização PT', 'https://maricafilmcommission.com/pt/autorizacao-de-filmagem/');
  
  // TESTE 2: Algumas locações EN
  console.log('\n--- LOCAÇÕES EN ---');
  await testPage('Henfil Cinema', 'https://maricafilmcommission.com/henfil-cinema/');
  await testPage('Elephant Rock', 'https://maricafilmcommission.com/elephant-rock/');
  await testPage('Itapeba Waterfront', 'https://maricafilmcommission.com/itapeba-waterfront/');
  await testPage('Fazenda Itaocaia', 'https://maricafilmcommission.com/fazenda-itaocaia/');
  await testPage('Casa de Cultura', 'https://maricafilmcommission.com/casa-de-cultura/');
  
  // TESTE 3: Algumas locações PT
  console.log('\n--- LOCAÇÕES PT ---');
  await testPage('Cinema Henfil PT', 'https://maricafilmcommission.com/pt/cinema-henfil/');
  await testPage('Praia Ponta Negra PT', 'https://maricafilmcommission.com/pt/praia-de-ponta-negra/');
  await testPage('Orla Itapeba PT', 'https://maricafilmcommission.com/pt/orla-de-itapeba/');
  await testPage('Praias Itaipuaçu PT', 'https://maricafilmcommission.com/pt/praias-de-itaipuacu/');
  
  // TESTE 4: Navegação
  console.log('\n--- TESTE DE NAVEGAÇÃO ---');
  await page.goto('https://maricafilmcommission.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  
  try {
    // Tentar clicar em Locations
    const locLink = page.locator('a:has-text("Locations")').first();
    if (await locLink.count() > 0) {
      await locLink.click({ timeout: 5000 });
      await page.waitForTimeout(3000);
      const url = page.url();
      if (url.includes('locations')) {
        console.log('✅ Navegação para Locations funciona');
        results.passed++;
      } else {
        console.log('⚠️ Navegação para Locations - URL inesperada:', url);
        results.warnings++;
      }
    }
  } catch (e) {
    console.log('❌ Navegação para Locations falhou');
    results.failed++;
  }
  
  // TESTE 5: Mudança de idioma
  console.log('\n--- TESTE DE IDIOMA ---');
  await page.goto('https://maricafilmcommission.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  
  try {
    const ptLink = page.locator('a[href*="/pt/"]').first();
    if (await ptLink.count() > 0) {
      await ptLink.click({ timeout: 5000 });
      await page.waitForTimeout(3000);
      const url = page.url();
      if (url.includes('/pt/')) {
        console.log('✅ Mudança EN→PT funciona');
        results.passed++;
      } else {
        console.log('⚠️ Mudança de idioma - URL inesperada:', url);
        results.warnings++;
      }
    }
  } catch (e) {
    console.log('❌ Mudança de idioma falhou');
    results.failed++;
  }
  
  // RESULTADO FINAL
  console.log('\n========================================');
  console.log('=== RESULTADO FINAL ===');
  console.log('========================================');
  console.log(`✅ Passou: ${results.passed}`);
  console.log(`⚠️ Avisos: ${results.warnings}`);
  console.log(`❌ Falhou: ${results.failed}`);
  console.log('\nFim:', new Date().toISOString());
  
  await browser.close();
})().catch(e => console.error('FATAL:', e.message));
