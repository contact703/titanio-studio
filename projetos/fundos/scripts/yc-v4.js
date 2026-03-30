// YC Application v4 - Usar apply.ycombinator.com/home
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/yc-v2';
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
  log(`\n---\n### YC v4 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    await page.goto('https://apply.ycombinator.com/home', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await shot(page, 'v4-01-home');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Links na página
    const links = await page.$$eval('a, button', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,80), href: e.href || '' }))
         .filter(e => e.text.length > 1)
    );
    log(`Links: ${JSON.stringify(links.slice(0,25))}`);
    
    // Procurar Sign Up / Create Account
    const signupLinks = links.filter(l => /sign up|create|register|new account|get started/i.test(l.text + l.href));
    log(`Signup: ${JSON.stringify(signupLinks)}`);
    
    // Tentar clicar em Sign Up
    if (signupLinks.length > 0) {
      if (signupLinks[0].href) {
        await page.goto(signupLinks[0].href, { waitUntil: 'networkidle', timeout: 20000 });
      } else {
        await page.click(`text="${signupLinks[0].text}"`, { timeout: 5000 });
      }
      await page.waitForTimeout(3000);
      await shot(page, 'v4-02-signup');
      log(`URL signup: ${page.url()}`);
    }
    
    // Campos
    const fields = await page.$$eval('input, select, textarea', els =>
      els.map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder }))
         .filter(e => !['hidden'].includes(e.type))
    );
    log(`Campos: ${JSON.stringify(fields)}`);
    
    // Preencher
    if (fields.some(f => f.type === 'email' || /email/i.test(f.placeholder + f.id + f.name))) {
      const emailEl = await page.$('input[type="email"], input[name*="email"], input[placeholder*="email" i]');
      if (emailEl) {
        await emailEl.fill('tiago@titaniofilms.com');
        log('✅ Email YC v4');
      }
    }
    
    const pwdEl = await page.$('input[type="password"]');
    if (pwdEl) {
      await pwdEl.fill('TitanioYC2026!');
      log('✅ Password YC v4');
    }
    
    await shot(page, 'v4-03-filled');
    
    // Submit
    try {
      const btn = await page.$('button[type="submit"], input[type="submit"]');
      if (btn) {
        await btn.click();
        await page.waitForTimeout(4000);
        await shot(page, 'v4-04-result');
        log(`URL resultado: ${page.url()}`);
        log(`Title resultado: ${await page.title()}`);
        
        const txt = await page.evaluate(() => document.body.innerText.substring(0, 400));
        log(`Texto: ${txt}`);
      }
    } catch(e) {
      log(`⚠️ Submit: ${e.message.substring(0,100)}`);
    }
    
    await shot(page, 'v4-99-final');
    log(`URL final: ${page.url()}`);
    log(`📌 STATUS YC v4: Tentativa de signup via apply.ycombinator.com/home`);

  } catch(e) {
    log(`❌ ERRO YC v4: ${e.message.substring(0,200)}`);
    await shot(page, 'v4-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 yc-v4 finalizado\n');
  }
})();
