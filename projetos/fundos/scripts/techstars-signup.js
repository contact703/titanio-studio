// Techstars - Criar conta via login.techstars.com
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
  log(`\n---\n### Techstars Signup — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    // URL de registro encontrada
    const registerUrl = 'https://login.techstars.com/auth/realms/techstars/protocol/openid-connect/registrations?client_id=apply&redirect_uri=https%3A%2F%2Fapply.techstars.com%2F%3Fsource%3Dnav&state=97c0b009-a8a1-40a9-8a53-cf4a5aa48f27&response_mode=fragment&response_type=code&scope=openid&nonce=5d994c11-148c-4d3a-8121-3de34c68c9dd';
    
    await page.goto(registerUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    await shot(page, 'ts-01-register');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    const fields = await page.$$eval('input', els =>
      els.map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder, autocomplete: e.autocomplete }))
         .filter(e => !['hidden'].includes(e.type))
    );
    log(`Campos: ${JSON.stringify(fields)}`);
    
    // Preencher formulário
    const fill = async (selector, value) => {
      try {
        const el = await page.$(selector);
        if (el) { await el.fill(value); log(`✅ ${selector}: ${value}`); return true; }
      } catch(e) { log(`⚠️ ${selector}: ${e.message.substring(0,80)}`); }
      return false;
    };
    
    // Campos comuns do Keycloak register form
    await fill('#firstName', 'Tiago');
    await fill('#lastName', 'Arakilian Affonso');
    await fill('#email', 'tiago@titaniofilms.com');
    await fill('#username', 'tiago_titanio');
    await fill('#password', 'TitanioTS2026!');
    await fill('#password-confirm', 'TitanioTS2026!');
    
    // Campos alternativos
    await fill('input[name="firstName"]', 'Tiago');
    await fill('input[name="lastName"]', 'Arakilian Affonso');
    await fill('input[name="email"]', 'tiago@titaniofilms.com');
    await fill('input[name="password"]', 'TitanioTS2026!');
    await fill('input[name="password-confirm"]', 'TitanioTS2026!');
    
    await shot(page, 'ts-02-filled');
    
    // Submit
    try {
      await page.click('input[type="submit"], button[type="submit"], #kc-form-buttons input', { timeout: 5000 });
      await page.waitForTimeout(5000);
      await shot(page, 'ts-03-result');
      log(`URL resultado: ${page.url()}`);
      log(`Title: ${await page.title()}`);
      
      const txt = await page.evaluate(() => document.body.innerText.substring(0, 500));
      log(`Texto: ${txt}`);
      
      if (page.url().includes('apply.techstars.com')) {
        log('🎉 Techstars: SUCESSO! Conta criada!');
        await shot(page, 'ts-04-success');
      }
    } catch(e) {
      log(`⚠️ Submit: ${e.message.substring(0,100)}`);
    }
    
    await shot(page, 'ts-99-final');
    log(`URL final: ${page.url()}`);
    log(`📌 STATUS Techstars Signup: Email=tiago@titaniofilms.com, Senha=TitanioTS2026!`);

  } catch(e) {
    log(`❌ ERRO Techstars Signup: ${e.message.substring(0,200)}`);
    await shot(page, 'ts-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 techstars-signup finalizado\n');
  }
})();
