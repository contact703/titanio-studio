const puppeteer = require('puppeteer');

async function analyzePerformance() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Enable request interception to measure resources
  await page.setRequestInterception(true);
  
  const resources = {
    images: [],
    scripts: [],
    styles: [],
    fonts: [],
    other: []
  };
  
  page.on('request', request => {
    request.continue();
  });
  
  page.on('response', async response => {
    const url = response.url();
    const headers = response.headers();
    const contentLength = parseInt(headers['content-length'] || '0');
    const contentType = headers['content-type'] || '';
    
    const resource = {
      url: url.length > 80 ? url.substring(0, 80) + '...' : url,
      size: contentLength,
      type: contentType
    };
    
    if (contentType.includes('image')) {
      resources.images.push(resource);
    } else if (contentType.includes('javascript')) {
      resources.scripts.push(resource);
    } else if (contentType.includes('css')) {
      resources.styles.push(resource);
    } else if (contentType.includes('font')) {
      resources.fonts.push(resource);
    } else if (contentLength > 1000) {
      resources.other.push(resource);
    }
  });
  
  console.log('🔍 Analisando https://maricafilmcommission.com/\n');
  
  const start = Date.now();
  await page.goto('https://maricafilmcommission.com/', { waitUntil: 'networkidle0' });
  const totalTime = Date.now() - start;
  
  // Get performance metrics
  const metrics = await page.metrics();
  const performanceTiming = await page.evaluate(() => JSON.stringify(performance.timing));
  const timing = JSON.parse(performanceTiming);
  
  console.log('⏱️  TEMPOS:');
  console.log(`   DNS: ${timing.domainLookupEnd - timing.domainLookupStart}ms`);
  console.log(`   Conexão: ${timing.connectEnd - timing.connectStart}ms`);
  console.log(`   TTFB: ${timing.responseStart - timing.requestStart}ms`);
  console.log(`   Download: ${timing.responseEnd - timing.responseStart}ms`);
  console.log(`   DOM Ready: ${timing.domContentLoadedEventEnd - timing.navigationStart}ms`);
  console.log(`   Total: ${totalTime}ms`);
  
  console.log('\n📊 RECURSOS:');
  
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  const totalImages = resources.images.reduce((a, b) => a + b.size, 0);
  const totalScripts = resources.scripts.reduce((a, b) => a + b.size, 0);
  const totalStyles = resources.styles.reduce((a, b) => a + b.size, 0);
  const totalFonts = resources.fonts.reduce((a, b) => a + b.size, 0);
  
  console.log(`   📷 Imagens: ${resources.images.length} arquivos (${formatSize(totalImages)})`);
  console.log(`   📜 Scripts: ${resources.scripts.length} arquivos (${formatSize(totalScripts)})`);
  console.log(`   🎨 CSS: ${resources.styles.length} arquivos (${formatSize(totalStyles)})`);
  console.log(`   🔤 Fontes: ${resources.fonts.length} arquivos (${formatSize(totalFonts)})`);
  
  // Show largest resources
  console.log('\n🐘 MAIORES RECURSOS:');
  
  const allResources = [...resources.images, ...resources.scripts, ...resources.styles, ...resources.fonts];
  allResources.sort((a, b) => b.size - a.size);
  
  allResources.slice(0, 10).forEach((r, i) => {
    console.log(`   ${i + 1}. ${formatSize(r.size)} - ${r.url}`);
  });
  
  // Check for lazy loading
  const lazyImages = await page.evaluate(() => {
    return document.querySelectorAll('img[loading="lazy"], img[data-src]').length;
  });
  
  const totalImagesOnPage = await page.evaluate(() => {
    return document.querySelectorAll('img').length;
  });
  
  console.log(`\n🖼️  IMAGENS NA PÁGINA: ${totalImagesOnPage}`);
  console.log(`   Com lazy loading: ${lazyImages}`);
  console.log(`   Sem lazy loading: ${totalImagesOnPage - lazyImages}`);
  
  // Check render blocking resources
  const renderBlockingScripts = await page.evaluate(() => {
    return document.querySelectorAll('script:not([async]):not([defer])[src]').length;
  });
  
  console.log(`\n⚡ OTIMIZAÇÃO:`);
  console.log(`   Scripts bloqueantes: ${renderBlockingScripts}`);
  
  await browser.close();
}

analyzePerformance().catch(console.error);
