const puppeteer = require('puppeteer');

const BASE_URL = 'https://maricafilmcommission.com';
const visited = new Set();
const errors = [];
const slow = [];

async function checkLink(url, browser) {
  if (visited.has(url)) return;
  if (!url.startsWith(BASE_URL)) return;
  
  visited.add(url);
  
  const page = await browser.newPage();
  
  try {
    const start = Date.now();
    const response = await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    const time = Date.now() - start;
    
    const status = response.status();
    const shortUrl = url.replace(BASE_URL, '');
    
    if (status >= 400) {
      errors.push({ url: shortUrl, status });
      console.log(`❌ ${status} - ${shortUrl}`);
    } else if (time > 3000) {
      slow.push({ url: shortUrl, time });
      console.log(`⚠️  ${status} - ${shortUrl} (${time}ms LENTO)`);
    } else {
      console.log(`✅ ${status} - ${shortUrl} (${time}ms)`);
    }
    
    // Get all internal links
    if (status < 400 && visited.size < 100) {
      const links = await page.evaluate((base) => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => a.href)
          .filter(h => h.startsWith(base) && !h.includes('#') && !h.includes('?'))
          .filter(h => !h.match(/\.(pdf|jpg|png|gif|mp4|zip)$/i));
      }, BASE_URL);
      
      await page.close();
      
      for (const link of links) {
        if (!visited.has(link) && visited.size < 100) {
          await checkLink(link, browser);
        }
      }
    } else {
      await page.close();
    }
    
  } catch (error) {
    const shortUrl = url.replace(BASE_URL, '');
    errors.push({ url: shortUrl, error: error.message });
    console.log(`❌ ERRO - ${shortUrl}: ${error.message.substring(0, 50)}`);
    await page.close();
  }
}

async function main() {
  console.log('🔗 Verificando links do site...\n');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  
  await checkLink(BASE_URL + '/', browser);
  
  await browser.close();
  
  console.log('\n📊 RESUMO:');
  console.log(`   Total verificado: ${visited.size}`);
  console.log(`   Erros (4xx/5xx): ${errors.length}`);
  console.log(`   Lentos (>3s): ${slow.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERROS:');
    errors.forEach(e => console.log(`   ${e.status || 'ERR'} - ${e.url}`));
  }
}

main().catch(console.error);
