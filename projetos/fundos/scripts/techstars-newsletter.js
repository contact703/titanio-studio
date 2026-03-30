// Techstars - Newsletter signup + accelerator-hub exploração
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
  log(`\n---\n### Techstars Newsletter + Hub — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    // 1. Newsletter Techstars
    const nlUrl = 'https://accelerate.techstars.com/en/techstars-newsletter-subscribe?utm_source=emailnewsletter&utm_medium=website&utm_campaign=footer';
    await page.goto(nlUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await shot(page, 'nl-01-page');
    log(`URL NL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    const fields = await page.$$eval('input, select, textarea', els =>
      els.map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder }))
         .filter(e => !['hidden'].includes(e.type))
    );
    log(`Campos NL: ${JSON.stringify(fields)}`);
    
    // Email
    try {
      const emailEl = await page.$('input[type="email"], input[name*="email" i]');
      if (emailEl) {
        await emailEl.fill('tiago@titaniofilms.com');
        log('✅ Email newsletter: tiago@titaniofilms.com');
      }
    } catch(e) {}
    
    // Nome
    try {
      const nameEl = await page.$('input[name*="first" i], input[name*="name" i]');
      if (nameEl) {
        await nameEl.fill('Tiago');
        log('✅ Nome preenchido');
      }
    } catch(e) {}
    
    await shot(page, 'nl-02-filled');
    
    try {
      await page.click('button[type="submit"], input[type="submit"]', { timeout: 5000 });
      await page.waitForTimeout(3000);
      await shot(page, 'nl-03-submitted');
      log(`URL após NL submit: ${page.url()}`);
      const txt = await page.evaluate(() => document.body.innerText.substring(0, 300));
      log(`Resposta NL: ${txt}`);
    } catch(e) {
      log(`⚠️ NL submit: ${e.message.substring(0,100)}`);
    }
    
    // 2. Accelerator Hub - Encontrar programas abertos
    await page.goto('https://www.techstars.com/accelerator-hub', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    await shot(page, 'hub-01-page');
    log(`URL Hub: ${page.url()}`);
    log(`Title Hub: ${await page.title()}`);
    
    const hubLinks = await page.$$eval('a', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,100), href: e.href }))
         .filter(e => e.text.length > 2)
    );
    log(`Hub links: ${JSON.stringify(hubLinks.slice(0,30))}`);
    
    // Procurar programas com apply
    const applyLinks = hubLinks.filter(l => /apply|open|inscri/i.test(l.text + l.href));
    log(`Aplicação links hub: ${JSON.stringify(applyLinks)}`);
    
    // Tentar apply via hub
    if (applyLinks.length > 0 && applyLinks[0].href) {
      await page.goto(applyLinks[0].href, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
      await shot(page, 'hub-02-apply');
      log(`URL apply hub: ${page.url()}`);
    }
    
    await shot(page, 'hub-99-final');
    log(`📌 STATUS Techstars Newsletter: Submetido em ${nlUrl}`);

  } catch(e) {
    log(`❌ ERRO Techstars NL: ${e.message.substring(0,200)}`);
    await shot(page, 'nl-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 techstars-newsletter finalizado\n');
  }
})();
