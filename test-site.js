const puppeteer = require('puppeteer');

const BASE_URL = 'https://maricafilmcommission.com';
const PAGES = [
  '/',
  '/pt/home-portugues/',
  '/about-us/',
  '/locations/',
  '/contact/',
  '/frequently-asked-questions/',
  '/cadastro-de-fornecedores/'
];

async function testSite() {
  console.log('🚀 Iniciando testes do site Maricá Film Commission\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Collect console errors
  const errors = [];
  const warnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({ page: page.url(), message: msg.text() });
    }
    if (msg.type() === 'warning') {
      warnings.push({ page: page.url(), message: msg.text() });
    }
  });
  
  page.on('pageerror', error => {
    errors.push({ page: page.url(), message: error.message });
  });
  
  // Check for failed requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText
    });
  });

  console.log('📋 Testando páginas:\n');
  
  for (const path of PAGES) {
    const url = BASE_URL + path;
    console.log(`\n🔍 ${url}`);
    
    const start = Date.now();
    
    try {
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      const loadTime = Date.now() - start;
      const status = response.status();
      
      console.log(`   ✅ HTTP ${status} - ${loadTime}ms`);
      
      if (loadTime > 3000) {
        console.log(`   ⚠️  LENTO! (>3s)`);
      }
      
      // Check for mixed content
      const mixedContent = await page.evaluate(() => {
        const elements = document.querySelectorAll('[src^="http://"], [href^="http://"]');
        return Array.from(elements).map(el => ({
          tag: el.tagName,
          attr: el.src || el.href
        })).filter(e => !e.attr.includes('http://www.w3.org'));
      });
      
      if (mixedContent.length > 0) {
        console.log(`   ⚠️  Mixed content encontrado:`);
        mixedContent.forEach(m => console.log(`      - ${m.tag}: ${m.attr}`));
      }
      
      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).filter(img => !img.complete || img.naturalHeight === 0)
          .map(img => img.src).filter(src => src && !src.startsWith('data:'));
      });
      
      if (brokenImages.length > 0) {
        console.log(`   ⚠️  Imagens quebradas:`);
        brokenImages.forEach(img => console.log(`      - ${img}`));
      }
      
      // Test all links on the page
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(href => href.startsWith('https://maricafilmcommission.com'));
      });
      
      console.log(`   📎 ${links.length} links internos encontrados`);
      
    } catch (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
    }
  }
  
  console.log('\n\n📊 RESUMO:\n');
  
  if (errors.length > 0) {
    console.log(`❌ ${errors.length} erros de console:`);
    errors.slice(0, 10).forEach(e => console.log(`   - ${e.message.substring(0, 100)}`));
  } else {
    console.log('✅ Nenhum erro de console');
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} avisos de console`);
  }
  
  if (failedRequests.length > 0) {
    console.log(`❌ ${failedRequests.length} requisições falharam:`);
    failedRequests.slice(0, 10).forEach(r => console.log(`   - ${r.url}: ${r.failure}`));
  } else {
    console.log('✅ Todas requisições OK');
  }
  
  await browser.close();
  console.log('\n✅ Testes concluídos!');
}

testSite().catch(console.error);
