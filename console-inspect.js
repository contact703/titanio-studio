const { chromium } = require('playwright');

(async () => {
  console.log('🔬 INSPEÇÃO DO CONSOLE - DIAGNÓSTICO COMPLETO\n');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Coletar TUDO
  const data = {
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    failedRequests: [],
    slowRequests: [],
    resources: { total: 0, byType: {} },
    timing: {}
  };
  
  // Console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      data.consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      data.consoleWarnings.push(msg.text());
    }
  });
  
  // Page errors (JS exceptions)
  page.on('pageerror', err => {
    data.pageErrors.push(err.message);
  });
  
  // Request tracking
  const requestTimes = new Map();
  page.on('request', req => {
    requestTimes.set(req.url(), Date.now());
    data.resources.total++;
    const type = req.resourceType();
    data.resources.byType[type] = (data.resources.byType[type] || 0) + 1;
  });
  
  page.on('requestfinished', req => {
    const start = requestTimes.get(req.url());
    if (start) {
      const duration = Date.now() - start;
      if (duration > 1000) {
        data.slowRequests.push({ url: req.url().substring(0, 60), time: duration });
      }
    }
  });
  
  page.on('requestfailed', req => {
    data.failedRequests.push({
      url: req.url().substring(0, 80),
      error: req.failure()?.errorText || 'unknown'
    });
  });
  
  // Carregar página
  console.log('\n📍 CARREGANDO HOMEPAGE...\n');
  const t1 = Date.now();
  
  try {
    await page.goto('https://maricafilmcommission.com/', {
      waitUntil: 'load',
      timeout: 60000
    });
    data.timing.loadTime = Date.now() - t1;
  } catch (e) {
    console.log('⚠️ Timeout no load, continuando...');
    data.timing.loadTime = 60000;
  }
  
  // Esperar JS executar
  await page.waitForTimeout(5000);
  
  // Coletar métricas do browser
  const perfData = await page.evaluate(() => {
    const perf = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    const resources = performance.getEntriesByType('resource');
    
    // Recursos lentos
    const slowRes = resources
      .filter(r => r.duration > 500)
      .map(r => ({ name: r.name.split('/').pop().substring(0, 30), duration: Math.round(r.duration) }))
      .slice(0, 10);
    
    return {
      navigation: perf ? {
        ttfb: Math.round(perf.responseStart),
        domInteractive: Math.round(perf.domInteractive),
        domComplete: Math.round(perf.domComplete),
        loadEventEnd: Math.round(perf.loadEventEnd)
      } : null,
      paint: {
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      },
      slowResources: slowRes,
      totalResources: resources.length
    };
  });
  
  // OUTPUT
  console.log('='.repeat(60));
  console.log('📊 MÉTRICAS DE PERFORMANCE');
  console.log('='.repeat(60));
  
  if (perfData.navigation) {
    console.log(`\n⏱️ Timing:`);
    console.log(`   TTFB:            ${perfData.navigation.ttfb}ms`);
    console.log(`   DOM Interactive: ${perfData.navigation.domInteractive}ms`);
    console.log(`   DOM Complete:    ${perfData.navigation.domComplete}ms`);
    console.log(`   Load Event:      ${perfData.navigation.loadEventEnd}ms`);
  }
  
  console.log(`\n🎨 Paint:`);
  console.log(`   First Paint:     ${Math.round(perfData.paint.firstPaint || 0)}ms`);
  console.log(`   FCP:             ${Math.round(perfData.paint.fcp || 0)}ms`);
  
  console.log('\n' + '='.repeat(60));
  console.log('📦 RECURSOS');
  console.log('='.repeat(60));
  console.log(`\nTotal: ${data.resources.total} requests`);
  console.log('Por tipo:', JSON.stringify(data.resources.byType));
  
  if (perfData.slowResources.length > 0) {
    console.log('\n🐢 Recursos lentos (>500ms):');
    perfData.slowResources.forEach(r => console.log(`   - ${r.name}: ${r.duration}ms`));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('❌ ERROS');
  console.log('='.repeat(60));
  
  console.log(`\n🔴 Console Errors: ${data.consoleErrors.length}`);
  data.consoleErrors.slice(0, 5).forEach(e => console.log(`   - ${e.substring(0, 100)}`));
  
  console.log(`\n🟡 Console Warnings: ${data.consoleWarnings.length}`);
  data.consoleWarnings.slice(0, 3).forEach(w => console.log(`   - ${w.substring(0, 100)}`));
  
  console.log(`\n💥 Page Errors (JS): ${data.pageErrors.length}`);
  data.pageErrors.slice(0, 3).forEach(e => console.log(`   - ${e.substring(0, 100)}`));
  
  console.log(`\n🚫 Failed Requests: ${data.failedRequests.length}`);
  data.failedRequests.slice(0, 5).forEach(r => console.log(`   - ${r.url} [${r.error}]`));
  
  // Verificar problemas específicos
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DIAGNÓSTICO');
  console.log('='.repeat(60));
  
  const issues = [];
  
  if (perfData.navigation?.ttfb > 2000) {
    issues.push('🔴 CRÍTICO: TTFB muito alto (' + perfData.navigation.ttfb + 'ms) - Servidor lento');
  }
  
  if (perfData.navigation?.domComplete > 5000) {
    issues.push('🟠 ALERTA: DOM Complete lento (' + perfData.navigation.domComplete + 'ms)');
  }
  
  if (data.failedRequests.length > 0) {
    issues.push('🔴 CRÍTICO: ' + data.failedRequests.length + ' requisições falhando');
  }
  
  if (data.pageErrors.length > 0) {
    issues.push('🟠 ALERTA: ' + data.pageErrors.length + ' erros de JavaScript');
  }
  
  if (data.consoleErrors.length > 0) {
    issues.push('🟡 AVISO: ' + data.consoleErrors.length + ' erros no console');
  }
  
  if (issues.length === 0) {
    issues.push('✅ Nenhum problema crítico encontrado');
  }
  
  console.log('\n');
  issues.forEach(i => console.log(i));
  
  await browser.close();
  console.log('\n' + '='.repeat(60));
  console.log('✅ INSPEÇÃO CONCLUÍDA');
  console.log('='.repeat(60));
})();
