const { chromium } = require('playwright');

(async () => {
  console.log('🔬 ANÁLISE PROFUNDA DO SITE\n');
  console.log('=' .repeat(50));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Coletar métricas
  const metrics = {
    requests: { total: 0, failed: 0, slow: [] },
    resources: { js: 0, css: 0, images: 0, fonts: 0, other: 0 },
    timing: {},
    errors: []
  };
  
  page.on('requestfailed', req => {
    metrics.requests.failed++;
    metrics.errors.push('REQ FAIL: ' + req.url().substring(0, 60));
  });
  
  page.on('request', req => {
    metrics.requests.total++;
    const type = req.resourceType();
    if (type === 'script') metrics.resources.js++;
    else if (type === 'stylesheet') metrics.resources.css++;
    else if (type === 'image') metrics.resources.images++;
    else if (type === 'font') metrics.resources.fonts++;
    else metrics.resources.other++;
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      metrics.errors.push('CONSOLE: ' + msg.text().substring(0, 80));
    }
  });
  
  // Carregar página
  console.log('\n📍 Carregando homepage...');
  const t1 = Date.now();
  
  try {
    await page.goto('https://maricafilmcommission.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    metrics.timing.domContentLoaded = Date.now() - t1;
    console.log(`   DOM: ${metrics.timing.domContentLoaded}ms`);
    
    // Esperar mais para JS executar
    await page.waitForTimeout(5000);
    metrics.timing.afterWait = Date.now() - t1;
    
    // Coletar métricas de performance
    const perfMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        // Timing
        ttfb: perf ? Math.round(perf.responseStart) : null,
        domInteractive: perf ? Math.round(perf.domInteractive) : null,
        domComplete: perf ? Math.round(perf.domComplete) : null,
        loadEventEnd: perf ? Math.round(perf.loadEventEnd) : null,
        
        // Paint
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || null,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || null,
        
        // Document state
        readyState: document.readyState,
        
        // DOM size
        elements: document.querySelectorAll('*').length,
        scripts: document.querySelectorAll('script').length,
        
        // Potential issues
        iframes: document.querySelectorAll('iframe').length,
        eventListeners: typeof getEventListeners !== 'undefined' ? 'available' : 'N/A'
      };
    });
    
    console.log('\n📊 MÉTRICAS DE PERFORMANCE:');
    console.log(`   TTFB: ${perfMetrics.ttfb}ms`);
    console.log(`   DOM Interactive: ${perfMetrics.domInteractive}ms`);
    console.log(`   DOM Complete: ${perfMetrics.domComplete}ms`);
    console.log(`   First Paint: ${Math.round(perfMetrics.firstPaint)}ms`);
    console.log(`   First Contentful Paint: ${Math.round(perfMetrics.firstContentfulPaint)}ms`);
    
    console.log('\n📦 RECURSOS:');
    console.log(`   JavaScript: ${metrics.resources.js}`);
    console.log(`   CSS: ${metrics.resources.css}`);
    console.log(`   Imagens: ${metrics.resources.images}`);
    console.log(`   Fontes: ${metrics.resources.fonts}`);
    console.log(`   Outros: ${metrics.resources.other}`);
    console.log(`   Total: ${metrics.requests.total}`);
    
    console.log('\n📐 DOM:');
    console.log(`   Elementos: ${perfMetrics.elements}`);
    console.log(`   Scripts: ${perfMetrics.scripts}`);
    console.log(`   iFrames: ${perfMetrics.iframes}`);
    console.log(`   Estado: ${perfMetrics.readyState}`);
    
    // Verificar o que está bloqueando
    const blockingCheck = await page.evaluate(() => {
      // Verificar se há animações pesadas
      const animations = document.getAnimations ? document.getAnimations().length : 0;
      
      // Verificar se há timers/intervals ativos
      // (não é possível diretamente, mas podemos ver se há muitos scripts)
      
      // Verificar vídeos
      const videos = document.querySelectorAll('video, iframe[src*="vimeo"], iframe[src*="youtube"]');
      
      // Verificar carrosséis/sliders
      const sliders = document.querySelectorAll('.swiper, .slick, .owl-carousel, [class*="carousel"], [class*="slider"]');
      
      return {
        animations,
        videos: videos.length,
        videoSrcs: Array.from(videos).map(v => v.src || v.dataset.src || 'embedded').slice(0, 3),
        sliders: sliders.length
      };
    });
    
    console.log('\n⚠️ POSSÍVEIS PROBLEMAS:');
    console.log(`   Animações ativas: ${blockingCheck.animations}`);
    console.log(`   Vídeos/iFrames: ${blockingCheck.videos}`);
    if (blockingCheck.videos > 0) {
      console.log(`   Fontes: ${blockingCheck.videoSrcs.join(', ')}`);
    }
    console.log(`   Sliders/Carrosséis: ${blockingCheck.sliders}`);
    
    if (metrics.errors.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      metrics.errors.slice(0, 5).forEach(e => console.log(`   - ${e}`));
    }
    
    await page.screenshot({ path: 'analysis-homepage.png' });
    
  } catch (e) {
    console.log('❌ Erro:', e.message.substring(0, 100));
  }
  
  await browser.close();
  console.log('\n' + '='.repeat(50));
  console.log('✅ Análise concluída!');
})();
