// Google for Startups LATAM v2 - Formulário de interesse
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/google-startups';
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
  log(`\n---\n### Google for Startups LATAM v2 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await ctx.newPage();

  try {
    // Tentar URL direto LATAM
    const urls = [
      'https://startup.google.com/programs/accelerator/latin-america/',
      'https://startup.google.com/programs/accelerator/latam/',
      'https://startup.google.com/intl/en/programs/accelerator/',
      'https://startup.google.com/programs/'
    ];
    
    for (const url of urls) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        const title = await page.title();
        const pageUrl = page.url();
        log(`Tentando: ${url} → ${pageUrl} (${title})`);
        
        if (!pageUrl.includes('404') && !title.toLowerCase().includes('not found')) {
          await shot(page, `latam-${urls.indexOf(url)+1}`);
          break;
        }
      } catch(e) {
        log(`⚠️ ${url}: ${e.message.substring(0,80)}`);
      }
    }
    
    // Mapear links de Apply/Form
    const links = await page.$$eval('a, button', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,100), href: e.href || '' }))
         .filter(e => e.text.length > 1)
    );
    log(`Links: ${JSON.stringify(links.slice(0,50))}`);
    
    // Procurar form/apply
    const applyLinks = links.filter(l => /apply|form|interest|inscri|candidat/i.test(l.text + l.href));
    log(`Apply links: ${JSON.stringify(applyLinks)}`);
    
    // Procurar links do Brazil Campus
    const brazilLinks = links.filter(l => /brazil|brasil|s[aã]o paulo/i.test(l.text + l.href));
    log(`Brazil links: ${JSON.stringify(brazilLinks)}`);
    
    // Explorar Brazil Campus
    if (brazilLinks.length > 0) {
      await page.goto(brazilLinks[0].href, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      await shot(page, 'brazil-campus');
      log(`Brazil campus URL: ${page.url()}`);
      
      const campusLinks = await page.$$eval('a', els =>
        els.filter(e => /apply|form|interest|program|acceleration/i.test(e.textContent + e.href))
           .map(e => ({ text: e.textContent.trim().substring(0,80), href: e.href }))
      );
      log(`Campus apply links: ${JSON.stringify(campusLinks)}`);
    }
    
    // Tentar Google Form direto (formulários comuns do Google Startups)
    const googleFormUrls = [
      'https://forms.gle/gfslatam',
      'https://startup.google.com/intl/pt-BR/campus/sao-paulo/',
    ];
    
    for (const url of googleFormUrls) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(2000);
        log(`${url} → ${page.url()}`);
        if (page.url().includes('docs.google.com/forms') || page.url().includes('forms.gle')) {
          log('✅ Google Form encontrado!');
          await shot(page, 'google-form');
          break;
        }
      } catch(e) {}
    }
    
    // São Paulo Campus
    await page.goto('https://startup.google.com/intl/pt-BR/campus/sao-paulo/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    await shot(page, 'sao-paulo-campus');
    log(`SP Campus: ${page.url()} | ${await page.title()}`);
    
    const spLinks = await page.$$eval('a', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,100), href: e.href }))
         .filter(e => e.text.length > 2 && e.href)
    );
    log(`SP links: ${JSON.stringify(spLinks.slice(0,20))}`);
    
    await shot(page, '99-final');
    log(`📌 STATUS Google v2: Exploração concluída. Google for Startups requer conta Google para aplicar.`);
    log(`📌 PRÓXIMO PASSO: Tiago usar https://startup.google.com/intl/pt-BR/campus/sao-paulo/ com conta Google`);

  } catch(e) {
    log(`❌ ERRO Google v2: ${e.message.substring(0,200)}`);
    await shot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 google-latam-v2 finalizado\n');
  }
})();
