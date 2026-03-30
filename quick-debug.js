const { chromium } = require('playwright');

(async () => {
  console.log('Iniciando browser headless...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text().substring(0, 100));
    }
  });
  page.on('pageerror', err => {
    errors.push('PAGE ERROR: ' + err.message.substring(0, 100));
  });
  
  console.log('Carregando site...');
  const startTime = Date.now();
  
  try {
    await page.goto('https://maricafilmcommission.com/', { 
      waitUntil: 'networkidle', 
      timeout: 60000 
    });
    console.log('Carregou em', (Date.now() - startTime)/1000, 's');
  } catch (e) {
    console.log('Timeout ou erro:', e.message.substring(0, 100));
  }
  
  // Capturar estado
  const state = await page.evaluate(() => ({
    readyState: document.readyState,
    title: document.title,
    bodyLength: document.body?.innerText?.length || 0,
    links: document.querySelectorAll('a').length,
    images: document.querySelectorAll('img').length
  }));
  
  console.log('Estado:', state);
  
  // Screenshot
  await page.screenshot({ path: 'site-debug.png', fullPage: false });
  console.log('Screenshot salvo: site-debug.png');
  
  // Erros
  if (errors.length > 0) {
    console.log('\nERROS ENCONTRADOS:');
    errors.forEach(e => console.log('-', e));
  } else {
    console.log('\nNenhum erro no console');
  }
  
  await browser.close();
  console.log('Fim');
})();
