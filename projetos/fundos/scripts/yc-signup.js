// YC Signup - Preencher formulário real
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
  log(`\n---\n### YC Signup FINAL — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    await page.goto('https://account.ycombinator.com/?continue=https%3A%2F%2Fapply.ycombinator.com%2Fhome', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    await shot(page, 'final-01-form');
    log(`URL: ${page.url()}`);
    
    // Preencher todos os campos identificados
    // First Name (id: _r_1_ ou campo de texto)
    const inputs = await page.$$('input[type="text"]');
    log(`Text inputs: ${inputs.length}`);
    
    // First name
    const firstNameEl = await page.$('#_r_1_');
    if (firstNameEl) {
      await firstNameEl.fill('Tiago');
      log('✅ First Name: Tiago');
    }
    
    // Last name
    const lastNameEl = await page.$('#_r_2_');
    if (lastNameEl) {
      await lastNameEl.fill('Arakilian Affonso');
      log('✅ Last Name: Arakilian Affonso');
    }
    
    // Email (campo 3)
    const emailEl = await page.$('#_r_3_');
    if (emailEl) {
      await emailEl.fill('tiago@titaniofilms.com');
      log('✅ Email: tiago@titaniofilms.com');
    }
    
    // Username
    const usernameEl = await page.$('#ycid-input');
    if (usernameEl) {
      await usernameEl.fill('tiago_titanio');
      log('✅ Username: tiago_titanio');
    }
    
    // Password
    const pwdEl = await page.$('#password-input');
    if (pwdEl) {
      await pwdEl.fill('TitanioYC2026!');
      log('✅ Password: TitanioYC2026!');
    }
    
    // LinkedIn
    const linkedinEl = await page.$('#_r_4_');
    if (linkedinEl) {
      await linkedinEl.fill('https://www.linkedin.com/in/tiago-arakilian/');
      log('✅ LinkedIn: https://www.linkedin.com/in/tiago-arakilian/');
    }
    
    await shot(page, 'final-02-filled');
    
    // Submit
    await page.click('text="Sign Up"', { timeout: 5000 });
    await page.waitForTimeout(5000);
    await shot(page, 'final-03-result');
    log(`URL resultado: ${page.url()}`);
    log(`Title resultado: ${await page.title()}`);
    
    const txt = await page.evaluate(() => document.body.innerText.substring(0, 600));
    log(`Texto: ${txt}`);
    
    // Verificar sucesso
    if (page.url().includes('apply.ycombinator.com') && !page.url().includes('account.ycombinator')) {
      log('🎉 YC: SUCESSO! Conta criada e redirecionado para aplicação!');
      await shot(page, 'final-04-apply');
      
      // Mapear campos da aplicação
      const appFields = await page.$$eval('input, textarea, select', els =>
        els.map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder }))
           .filter(e => !['hidden'].includes(e.type))
      );
      log(`Campos aplicação: ${JSON.stringify(appFields.slice(0,20))}`);
    } else if (txt.includes('verification') || txt.includes('email') || txt.includes('confirm')) {
      log('📧 YC: Email de verificação enviado! Checar tiago@titaniofilms.com');
    }
    
    await shot(page, 'final-99-final');
    log(`📌 STATUS YC FINAL: First=Tiago, Last=Arakilian Affonso, Email=tiago@titaniofilms.com, User=tiago_titanio`);

  } catch(e) {
    log(`❌ ERRO YC Final: ${e.message.substring(0,200)}`);
    await shot(page, 'final-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 yc-signup finalizado\n');
  }
})();
