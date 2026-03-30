const puppeteer = require('puppeteer');

async function investigate() {
  console.log('=== INVESTIGAÇÃO DO SITE MARICÁ FILM COMMISSION ===\n');
  
  // Conectar ao Chrome existente
  const browser = await puppeteer.connect({
    browserURL: 'http://127.0.0.1:18800'
  });
  
  const pages = await browser.pages();
  let page = pages.find(p => p.url().includes('maricafilmcommission'));
  
  if (!page) {
    page = await browser.newPage();
    await page.goto('https://maricafilmcommission.com/', { waitUntil: 'networkidle2', timeout: 60000 });
  }
  
  console.log('URL atual:', page.url());
  console.log('Título:', await page.title());
  
  // Coletar erros do console
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Verificar se a página carregou completamente
  console.log('\n--- VERIFICANDO CARREGAMENTO ---');
  
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Primeiros 500 chars do body:', bodyText);
  
  // Verificar scripts pendentes
  const pendingScripts = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[type="litespeed/javascript"]');
    return scripts.length;
  });
  console.log('\nScripts litespeed pendentes:', pendingScripts);
  
  // Verificar se há elementos interativos visíveis
  const interactiveElements = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href]');
    const buttons = document.querySelectorAll('button');
    const nav = document.querySelector('nav');
    return {
      links: links.length,
      buttons: buttons.length,
      hasNav: !!nav,
      navVisible: nav ? window.getComputedStyle(nav).display !== 'none' : false
    };
  });
  console.log('Elementos interativos:', interactiveElements);
  
  // Tentar clicar no menu de navegação
  console.log('\n--- TESTANDO NAVEGAÇÃO ---');
  
  // Procurar link de Locations/Locações
  const locationsLink = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const loc = links.find(a => 
      a.textContent.toLowerCase().includes('location') || 
      a.textContent.toLowerCase().includes('locaç')
    );
    return loc ? { href: loc.href, text: loc.textContent.trim() } : null;
  });
  console.log('Link de locações encontrado:', locationsLink);
  
  if (locationsLink) {
    console.log('\nTentando navegar para locações...');
    try {
      await Promise.all([
        page.waitForNavigation({ timeout: 15000 }),
        page.click(`a[href="${locationsLink.href}"]`)
      ]);
      console.log('Navegou para:', page.url());
    } catch (e) {
      console.log('ERRO ao navegar:', e.message);
    }
  }
  
  // Verificar erros no console após navegação
  await page.evaluate(() => new Promise(r => setTimeout(r, 3000)));
  
  // Capturar estado atual
  const currentState = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    bodyLength: document.body.innerText.length,
    hasContent: document.body.innerText.length > 100
  }));
  console.log('\nEstado após tentativa de navegação:', currentState);
  
  // Verificar erros JS no console
  const jsErrors = await page.evaluate(() => {
    // Tentar capturar erros
    return window.__errors || [];
  });
  
  console.log('\n--- ERROS DO CONSOLE ---');
  console.log('Erros capturados:', consoleErrors.length > 0 ? consoleErrors : 'Nenhum erro capturado');
  
  // Tirar screenshot
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/site-screenshot-1.png', fullPage: false });
  console.log('\nScreenshot salvo: site-screenshot-1.png');
  
  // Testar mudança de idioma
  console.log('\n--- TESTANDO MUDANÇA DE IDIOMA ---');
  
  // Voltar para home
  await page.goto('https://maricafilmcommission.com/', { waitUntil: 'networkidle2', timeout: 60000 });
  
  const languageLink = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const pt = links.find(a => 
      a.href.includes('/pt/') || 
      a.textContent.includes('PT') ||
      a.textContent.includes('Português')
    );
    return pt ? { href: pt.href, text: pt.textContent.trim() } : null;
  });
  console.log('Link de idioma PT encontrado:', languageLink);
  
  if (languageLink) {
    console.log('Tentando mudar para PT...');
    try {
      await Promise.all([
        page.waitForNavigation({ timeout: 15000 }),
        page.click(`a[href="${languageLink.href}"]`)
      ]);
      console.log('Navegou para:', page.url());
    } catch (e) {
      console.log('ERRO ao mudar idioma:', e.message);
    }
  }
  
  await page.screenshot({ path: '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/site-screenshot-2.png', fullPage: false });
  console.log('Screenshot após teste de idioma: site-screenshot-2.png');
  
  console.log('\n=== FIM DA INVESTIGAÇÃO INICIAL ===');
  
  await browser.disconnect();
}

investigate().catch(e => console.error('Erro fatal:', e));
