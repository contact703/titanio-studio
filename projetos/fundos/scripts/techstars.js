// Techstars Anywhere - Explorar formulário de aplicação
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/techstars';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG, msg + '\n');
}

async function shot(page, name) {
  const file = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  log(`📸 ${file}`);
}

(async () => {
  const ts = new Date().toISOString();
  log(`\n---\n### Techstars — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    await page.goto('https://www.techstars.com/accelerators', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await shot(page, '01-landing');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Links na página
    const links = await page.$$eval('a, button', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,80), href: e.href || '' }))
         .filter(e => e.text.length > 1)
    );
    log(`Links: ${JSON.stringify(links.slice(0,40))}`);
    
    // Procurar Anywhere/LATAM/Apply
    const applyLinks = links.filter(l => /anywhere|apply|latam|latin|brazil|global/i.test(l.text + l.href));
    log(`Apply links: ${JSON.stringify(applyLinks)}`);
    
    // Tentar Techstars Anywhere
    try {
      const anywhereLink = links.find(l => /anywhere/i.test(l.text + l.href));
      if (anywhereLink && anywhereLink.href) {
        await page.goto(anywhereLink.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
        await shot(page, '02-anywhere');
        log(`URL Anywhere: ${page.url()}`);
      }
    } catch(e) {
      log(`⚠️ Anywhere: ${e.message.substring(0,100)}`);
    }
    
    // Tentar URL direta
    await page.goto('https://www.techstars.com/accelerators/techstars-anywhere', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await shot(page, '03-anywhere-direct');
    log(`URL direta Anywhere: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Botões de Apply
    const applyBtns = await page.$$eval('a, button', els =>
      els.filter(e => /apply|aplicar|start|inscrever/i.test(e.textContent + e.href))
         .map(e => ({ text: e.textContent.trim().substring(0,80), href: e.href || '' }))
    );
    log(`Apply buttons: ${JSON.stringify(applyBtns)}`);
    
    // Clicar em Apply
    if (applyBtns.length > 0 && applyBtns[0].href) {
      await page.goto(applyBtns[0].href, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      await shot(page, '04-apply-form');
      log(`URL apply: ${page.url()}`);
      log(`Title apply: ${await page.title()}`);
      
      // Campos do formulário
      const formFields = await page.$$eval('input, textarea, select', els =>
        els.map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder }))
           .filter(e => !['hidden'].includes(e.type))
      );
      log(`Campos: ${JSON.stringify(formFields.slice(0,20))}`);
      
      // Se for Gust/F6S (plataformas comuns da Techstars)
      if (page.url().includes('gust.com') || page.url().includes('f6s.com') || page.url().includes('techstars.com/application')) {
        log('✅ Formulário de aplicação encontrado!');
        
        // Preencher email
        const emailEl = await page.$('input[type="email"], input[name="email"]');
        if (emailEl) {
          await emailEl.fill('tiago@titaniofilms.com');
          log('✅ Email preenchido');
        }
        
        await shot(page, '05-form-started');
      }
    } else {
      // Tentar clicar diretamente
      try {
        await page.click('text=/apply now|apply/i', { timeout: 5000 });
        await page.waitForTimeout(2000);
        await shot(page, '04-after-apply-click');
        log(`URL após apply: ${page.url()}`);
      } catch(e) {
        log(`⚠️ Apply click: ${e.message.substring(0,100)}`);
      }
    }
    
    // Explorar programa Brazil/LATAM na Techstars
    await page.goto('https://www.techstars.com/accelerators', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Scroll para ver todos os programas
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);
    await shot(page, '05-programs-scroll');
    
    // Todos os links de programas
    const programLinks = await page.$$eval('a[href*="techstars.com/accelerators/"]', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,80), href: e.href }))
    );
    log(`Programas disponíveis: ${JSON.stringify(programLinks)}`);
    
    await shot(page, '99-final');
    log(`📌 STATUS Techstars: Mapeamento concluído. Verificar programa ativo para LATAM/Anywhere 2026`);

  } catch(e) {
    log(`❌ ERRO Techstars: ${e.message.substring(0,200)}`);
    await shot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 techstars finalizado\n');
  }
})();
