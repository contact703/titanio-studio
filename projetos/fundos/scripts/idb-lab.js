// IDB Lab (BID) - Newsletter + Interesse em financiamento
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
  log(`\n---\n### IDB Lab Newsletter — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    await page.goto('https://bidlab.org/en', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await shot(page, '01-landing');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Procurar newsletter e formulários
    const links = await page.$$eval('a, button', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,80), href: e.href || '' }))
         .filter(e => e.text.length > 1)
    );
    log(`Links principais: ${JSON.stringify(links.slice(0,40))}`);
    
    // Procurar newsletter/subscribe
    const subLinks = links.filter(l => /newsletter|subscribe|sign up|inscrever|notif/i.test(l.text + l.href));
    log(`Subscribe links: ${JSON.stringify(subLinks)}`);
    
    // Procurar formulário de financiamento/apply
    const fundLinks = links.filter(l => /fund|financ|apply|grant|invest|startup/i.test(l.text + l.href));
    log(`Funding links: ${JSON.stringify(fundLinks)}`);
    
    // Scroll até o footer para achar newsletter
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    await shot(page, '02-footer');
    
    // Tentar encontrar campo de email no footer
    const emailFields = await page.$$('input[type="email"], input[placeholder*="email" i]');
    log(`Email fields encontrados: ${emailFields.length}`);
    
    if (emailFields.length > 0) {
      await emailFields[0].fill('contact@titaniofilms.com');
      log('✅ Email preenchido no newsletter');
      await page.waitForTimeout(500);
      await shot(page, '03-email-filled');
      
      // Tentar submit newsletter
      try {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        await shot(page, '04-newsletter-submitted');
        log(`URL após newsletter: ${page.url()}`);
      } catch(e) {
        log(`⚠️ Submit newsletter: ${e.message.substring(0,100)}`);
      }
    }
    
    // Explorar Contact/Apply
    try {
      await page.goto('https://bidlab.org/en/contact', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      await shot(page, '05-contact');
      log(`URL contato: ${page.url()}`);
      
      // Campos do formulário de contato
      const contactFields = await page.$$eval('input, textarea, select', els =>
        els.map(e => ({ tag: e.tagName, type: e.type, id: e.id, name: e.name, placeholder: e.placeholder }))
           .filter(e => !['hidden', 'submit'].includes(e.type))
      );
      log(`Campos contato: ${JSON.stringify(contactFields)}`);
      
      // Preencher formulário de contato se existir
      if (contactFields.length > 0) {
        // Nome
        try {
          const nameField = await page.$('input[name*="name" i], input[placeholder*="name" i], input[id*="name" i]');
          if (nameField) { await nameField.fill('Tiago Arakilian Affonso'); log('✅ Nome preenchido'); }
        } catch(e) {}
        
        // Email
        try {
          const emailField = await page.$('input[type="email"], input[name*="email" i]');
          if (emailField) { await emailField.fill('tiago@titaniofilms.com'); log('✅ Email preenchido'); }
        } catch(e) {}
        
        // Mensagem
        try {
          const msgField = await page.$('textarea');
          if (msgField) {
            await msgField.fill('Hello, I am Tiago Arakilian Affonso, founder of Titanio Studio (titaniofilms.com), a Brazilian AI startup developing VoxDescriber — an AI-powered audio description system using WhisperX, Qwen2.5, and Piper TTS, designed for 6.5 million visually impaired Brazilians. Our solution works offline and complies with NBR 15290. I am writing to express interest in IDB Lab funding opportunities and innovation programs. We are in pre-revenue stage and looking for early-stage support. Please add me to your newsletter and let me know how to apply to relevant programs. Thank you.');
            log('✅ Mensagem preenchida');
          }
        } catch(e) {}
        
        await shot(page, '06-contact-filled');
        
        // Submit
        try {
          await page.click('button[type="submit"], input[type="submit"]', { timeout: 5000 });
          await page.waitForTimeout(2000);
          await shot(page, '07-contact-submitted');
          log(`URL após contato: ${page.url()}`);
        } catch(e) {
          log(`⚠️ Submit contato: ${e.message.substring(0,100)}`);
        }
      }
    } catch(e) {
      log(`⚠️ Contato: ${e.message.substring(0,100)}`);
    }
    
    // Explorar programas e oportunidades
    try {
      await page.goto('https://bidlab.org/en/initiatives', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      await shot(page, '08-initiatives');
      log(`Iniciativas URL: ${page.url()}`);
    } catch(e) {}
    
    await shot(page, '99-final');
    log(`📌 STATUS IDB Lab: Exploração concluída. Newsletter e contato tentados.`);

  } catch(e) {
    log(`❌ ERRO IDB: ${e.message.substring(0,200)}`);
    await shot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 idb-lab finalizado\n');
  }
})();
