const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Iniciando teste real do site...\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Ver o browser real
    slowMo: 500       // Mais lento para ver o que acontece
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  
  const page = await context.newPage();
  
  // Coletar erros
  const errors = [];
  const requests = { total: 0, failed: 0, slow: [] };
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text().substring(0, 100));
    }
  });
  
  page.on('pageerror', err => {
    errors.push('JS ERROR: ' + err.message.substring(0, 100));
  });
  
  page.on('request', req => requests.total++);
  
  page.on('requestfailed', req => {
    requests.failed++;
    console.log('❌ Request failed:', req.url().substring(0, 60));
  });
  
  // TESTE 1: Homepage
  console.log('=== TESTE 1: HOMEPAGE ===');
  const t1 = Date.now();
  
  try {
    await page.goto('https://maricafilmcommission.com/', { 
      waitUntil: 'load',  // Não esperar networkidle
      timeout: 30000 
    });
    console.log('✅ Homepage carregou em', (Date.now() - t1)/1000, 's');
    
    // Esperar mais um pouco para JS executar
    await page.waitForTimeout(3000);
    
    // Screenshot
    await page.screenshot({ path: 'test-homepage.png' });
    console.log('📸 Screenshot: test-homepage.png');
    
    // Verificar estado
    const state = await page.evaluate(() => ({
      title: document.title,
      links: document.querySelectorAll('a').length,
      images: document.querySelectorAll('img').length,
      visibleText: document.body.innerText.length,
      menuVisible: !!document.querySelector('nav, .elementor-nav-menu')
    }));
    console.log('Estado:', JSON.stringify(state, null, 2));
    
  } catch (e) {
    console.log('❌ Erro homepage:', e.message.substring(0, 100));
    await page.screenshot({ path: 'test-homepage-error.png' });
  }
  
  // TESTE 2: Clicar em Locations
  console.log('\n=== TESTE 2: NAVEGAR PARA LOCATIONS ===');
  try {
    await page.click('text=Locations', { timeout: 5000 });
    await page.waitForTimeout(3000);
    console.log('✅ Clicou em Locations');
    console.log('URL atual:', page.url());
    await page.screenshot({ path: 'test-locations.png' });
  } catch (e) {
    console.log('❌ Erro ao clicar Locations:', e.message.substring(0, 80));
  }
  
  // TESTE 3: Voltar e testar PT
  console.log('\n=== TESTE 3: MUDAR PARA PORTUGUÊS ===');
  try {
    await page.goto('https://maricafilmcommission.com/pt/home-portugues/', {
      waitUntil: 'load',
      timeout: 20000
    });
    await page.waitForTimeout(2000);
    console.log('✅ Página PT carregou');
    console.log('URL:', page.url());
    await page.screenshot({ path: 'test-pt.png' });
  } catch (e) {
    console.log('❌ Erro página PT:', e.message.substring(0, 80));
  }
  
  // Resumo
  console.log('\n=== RESUMO ===');
  console.log('Requests:', requests.total, '| Falhadas:', requests.failed);
  console.log('Erros JS:', errors.length);
  if (errors.length > 0) {
    console.log('Primeiros erros:');
    errors.slice(0, 3).forEach(e => console.log('  -', e));
  }
  
  await browser.close();
  console.log('\n✅ Teste concluído!');
})();
