const { chromium } = require('playwright');

(async () => {
  console.log('=== VERIFICAÇÃO COMPLETA DO SITE ===');
  console.log('Início:', new Date().toISOString(), '\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text().substring(0, 100));
  });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message.substring(0, 100)));
  
  // 1. TESTE DA HOMEPAGE EN
  console.log('--- 1. HOMEPAGE EN ---');
  try {
    await page.goto('https://maricafilmcommission.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const title = await page.title();
    console.log('Título:', title);
    
    const bodyLength = await page.evaluate(() => document.body.innerText.length);
    console.log('Conteúdo:', bodyLength, 'chars');
    
    if (bodyLength > 500) {
      results.passed.push('Homepage EN carrega corretamente');
    } else {
      results.failed.push('Homepage EN - conteúdo insuficiente');
    }
    
    await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/check-1-home-en.png' });
  } catch (e) {
    results.failed.push('Homepage EN: ' + e.message);
    console.log('ERRO:', e.message);
  }
  
  // 2. TESTE DO MENU EN
  console.log('\n--- 2. MENU EN ---');
  const menuLinks = await page.evaluate(() => {
    const links = document.querySelectorAll('.elementor-nav-menu a, nav a');
    return Array.from(links).map(a => ({
      text: a.textContent.trim(),
      href: a.href
    })).filter(l => l.href && !l.href.includes('#'));
  });
  console.log('Links do menu:', menuLinks.length);
  menuLinks.forEach(l => console.log('  -', l.text, '->', l.href.substring(0, 60)));
  
  // 3. TESTE DE LOCATIONS EN
  console.log('\n--- 3. LOCATIONS EN ---');
  try {
    await page.goto('https://maricafilmcommission.com/locations/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const locationLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/locations/"]');
      return Array.from(links).map(a => ({
        text: a.textContent.trim().substring(0, 30),
        href: a.href
      })).filter((l, i, arr) => arr.findIndex(x => x.href === l.href) === i);
    });
    
    console.log('Locações encontradas:', locationLinks.length);
    results.passed.push(`Locations EN: ${locationLinks.length} locações listadas`);
    
    await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/check-2-locations-en.png' });
    
    // Testar 5 locações EN
    const testLocations = locationLinks.slice(0, 5);
    for (const loc of testLocations) {
      try {
        await page.goto(loc.href, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
        const hasContent = await page.evaluate(() => document.body.innerText.length > 200);
        if (hasContent) {
          console.log('  ✓', loc.text);
          results.passed.push(`Location EN: ${loc.text}`);
        } else {
          console.log('  ✗', loc.text, '- pouco conteúdo');
          results.warnings.push(`Location EN: ${loc.text} - pouco conteúdo`);
        }
      } catch (e) {
        console.log('  ✗', loc.text, '-', e.message.substring(0, 50));
        results.failed.push(`Location EN: ${loc.text} - ${e.message.substring(0, 30)}`);
      }
    }
  } catch (e) {
    results.failed.push('Locations EN: ' + e.message);
    console.log('ERRO:', e.message);
  }
  
  // 4. TESTE DA HOMEPAGE PT
  console.log('\n--- 4. HOMEPAGE PT ---');
  try {
    await page.goto('https://maricafilmcommission.com/pt/home-portugues/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const bodyLength = await page.evaluate(() => document.body.innerText.length);
    console.log('Conteúdo PT:', bodyLength, 'chars');
    
    if (bodyLength > 500) {
      results.passed.push('Homepage PT carrega corretamente');
    } else {
      results.failed.push('Homepage PT - conteúdo insuficiente');
    }
    
    await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/check-3-home-pt.png' });
  } catch (e) {
    results.failed.push('Homepage PT: ' + e.message);
    console.log('ERRO:', e.message);
  }
  
  // 5. TESTE DE LOCAÇÕES PT
  console.log('\n--- 5. LOCAÇÕES PT ---');
  try {
    await page.goto('https://maricafilmcommission.com/pt/locacoes/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const locationLinksPT = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/pt/"]');
      return Array.from(links)
        .filter(a => a.href.includes('locac') || a.href.includes('praia') || a.href.includes('cinema') || a.href.includes('lagoa'))
        .map(a => ({
          text: a.textContent.trim().substring(0, 30),
          href: a.href
        }))
        .filter((l, i, arr) => arr.findIndex(x => x.href === l.href) === i);
    });
    
    console.log('Locações PT encontradas:', locationLinksPT.length);
    results.passed.push(`Locações PT: ${locationLinksPT.length} locações listadas`);
    
    await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/check-4-locacoes-pt.png' });
    
    // Testar 5 locações PT
    const testLocationsPT = locationLinksPT.slice(0, 5);
    for (const loc of testLocationsPT) {
      try {
        await page.goto(loc.href, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
        const hasContent = await page.evaluate(() => document.body.innerText.length > 200);
        if (hasContent) {
          console.log('  ✓', loc.text);
          results.passed.push(`Locação PT: ${loc.text}`);
        } else {
          console.log('  ✗', loc.text, '- pouco conteúdo');
          results.warnings.push(`Locação PT: ${loc.text} - pouco conteúdo`);
        }
      } catch (e) {
        console.log('  ✗', loc.text, '-', e.message.substring(0, 50));
        results.failed.push(`Locação PT: ${loc.text} - ${e.message.substring(0, 30)}`);
      }
    }
  } catch (e) {
    results.failed.push('Locações PT: ' + e.message);
    console.log('ERRO:', e.message);
  }
  
  // 6. TESTE DE MUDANÇA DE IDIOMA
  console.log('\n--- 6. MUDANÇA DE IDIOMA ---');
  try {
    await page.goto('https://maricafilmcommission.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Procurar link PT
    const ptLink = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const pt = links.find(a => a.href.includes('/pt/'));
      return pt ? pt.href : null;
    });
    
    if (ptLink) {
      console.log('Link PT encontrado:', ptLink);
      await page.goto(ptLink, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      const isPT = await page.evaluate(() => {
        return window.location.href.includes('/pt/') || 
               document.documentElement.lang === 'pt-BR' ||
               document.body.innerText.includes('Locações');
      });
      
      if (isPT) {
        results.passed.push('Mudança de idioma EN→PT funciona');
        console.log('✓ Mudança EN→PT funciona');
      } else {
        results.failed.push('Mudança EN→PT não funcionou');
        console.log('✗ Mudança EN→PT não funcionou');
      }
    } else {
      results.warnings.push('Link PT não encontrado na homepage EN');
      console.log('⚠ Link PT não encontrado');
    }
    
    await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/check-5-idioma.png' });
  } catch (e) {
    results.failed.push('Mudança de idioma: ' + e.message);
    console.log('ERRO:', e.message);
  }
  
  // 7. TESTE DE OUTRAS PÁGINAS
  console.log('\n--- 7. OUTRAS PÁGINAS ---');
  const otherPages = [
    { name: 'About EN', url: 'https://maricafilmcommission.com/about-us/' },
    { name: 'Sobre PT', url: 'https://maricafilmcommission.com/pt/sobre/' },
    { name: 'Contact EN', url: 'https://maricafilmcommission.com/contact/' },
    { name: 'Contato PT', url: 'https://maricafilmcommission.com/pt/contato/' },
    { name: 'FAQ EN', url: 'https://maricafilmcommission.com/faq/' },
    { name: 'FAQ PT', url: 'https://maricafilmcommission.com/pt/perguntas-frequentes/' },
    { name: 'Filming Auth EN', url: 'https://maricafilmcommission.com/filming-authorization-form/' },
    { name: 'Autorização PT', url: 'https://maricafilmcommission.com/pt/autorizacao-de-filmagem/' }
  ];
  
  for (const pg of otherPages) {
    try {
      await page.goto(pg.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      const hasContent = await page.evaluate(() => document.body.innerText.length > 100);
      if (hasContent) {
        console.log('  ✓', pg.name);
        results.passed.push(pg.name);
      } else {
        console.log('  ⚠', pg.name, '- pouco conteúdo');
        results.warnings.push(pg.name + ' - pouco conteúdo');
      }
    } catch (e) {
      console.log('  ✗', pg.name, '-', e.message.substring(0, 40));
      results.failed.push(pg.name + ': ' + e.message.substring(0, 30));
    }
  }
  
  // RESULTADO FINAL
  console.log('\n========================================');
  console.log('=== RESULTADO FINAL ===');
  console.log('========================================\n');
  
  console.log('✅ PASSOU:', results.passed.length);
  results.passed.forEach(p => console.log('   -', p));
  
  console.log('\n⚠️ AVISOS:', results.warnings.length);
  results.warnings.forEach(w => console.log('   -', w));
  
  console.log('\n❌ FALHOU:', results.failed.length);
  results.failed.forEach(f => console.log('   -', f));
  
  if (errors.length > 0) {
    console.log('\n🔴 ERROS CONSOLE:', errors.length);
    errors.slice(0, 5).forEach(e => console.log('   -', e));
  }
  
  console.log('\nFim:', new Date().toISOString());
  
  await browser.close();
})().catch(e => console.error('FATAL:', e.message));
