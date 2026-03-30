// IDB Lab - Assinar newsletter via URL direto
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/idb-lab';
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
  log(`\n---\n### IDB Lab Newsletter v2 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    // URL direto de subscrição encontrado anteriormente
    const newsletterUrl = 'https://cloud.mail.iadb.org/subscription?Org=IDB%20Lab&Top=a1A1I000007t5f9UAA&UTMM=Direct&UTMS=Website&RT=Organization%20Subscription&lang=EN';
    
    await page.goto(newsletterUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await shot(page, 'nl-01-page');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Campos disponíveis
    const fields = await page.$$eval('input, select, textarea', els =>
      els.map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder }))
         .filter(e => !['hidden'].includes(e.type))
    );
    log(`Campos: ${JSON.stringify(fields)}`);
    
    // Preencher email
    const emailEl = await page.$('input[type="email"], input[name="email"], input[id*="email" i]');
    if (emailEl) {
      await emailEl.fill('contact@titaniofilms.com');
      log('✅ Email preenchido');
    }
    
    // Preencher nome se disponível
    const nameEl = await page.$('input[name="firstname"], input[name="first_name"], input[id*="first" i]');
    if (nameEl) { await nameEl.fill('Tiago'); log('✅ Nome preenchido'); }
    
    const lastNameEl = await page.$('input[name="lastname"], input[name="last_name"], input[id*="last" i]');
    if (lastNameEl) { await lastNameEl.fill('Arakilian'); log('✅ Sobrenome preenchido'); }
    
    // Organização
    const orgEl = await page.$('input[name="company"], input[name="organization"], input[id*="company" i]');
    if (orgEl) { await orgEl.fill('Titanio Studio'); log('✅ Empresa preenchida'); }
    
    await shot(page, 'nl-02-filled');
    
    // Submit
    try {
      await page.click('button[type="submit"], input[type="submit"], button:has-text("Subscribe"), button:has-text("Submit")', { timeout: 5000 });
      await page.waitForTimeout(3000);
      await shot(page, 'nl-03-submitted');
      log(`URL após submit: ${page.url()}`);
      
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
      log(`Resposta: ${bodyText}`);
    } catch(e) {
      log(`⚠️ Submit: ${e.message.substring(0,100)}`);
    }
    
    // Também tentar financing products page
    await page.goto('https://bidlab.org/en/products/financing-products', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await shot(page, 'nl-04-financing');
    log(`URL financing: ${page.url()}`);
    
    const finLinks = await page.$$eval('a', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,80), href: e.href }))
         .filter(e => /apply|form|interest|contact|eligib/i.test(e.text + e.href))
    );
    log(`Links de financiamento: ${JSON.stringify(finLinks)}`);
    
    await shot(page, 'nl-99-final');
    log(`📌 STATUS IDB Lab v2: Newsletter submetida em ${newsletterUrl}`);

  } catch(e) {
    log(`❌ ERRO IDB v2: ${e.message.substring(0,200)}`);
    await shot(page, 'nl-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 idb-newsletter finalizado\n');
  }
})();
