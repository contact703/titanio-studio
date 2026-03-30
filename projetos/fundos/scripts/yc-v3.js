// YC Application v3 - Aguardar carregamento JS + criar conta
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
  log(`\n---\n### YC v3 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    // Página de sign_up com aguardo de JS
    await page.goto('https://account.ycombinator.com/users/sign_up', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await shot(page, 'v3-01-signup');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Campos após JS
    const fields = await page.$$eval('input, select, textarea', els =>
      els.map(e => ({ 
        type: e.type, id: e.id, name: e.name, placeholder: e.placeholder,
        label: document.querySelector(`label[for="${e.id}"]`)?.textContent?.trim() || ''
      }))
      .filter(e => !['hidden'].includes(e.type))
    );
    log(`Campos após JS: ${JSON.stringify(fields)}`);
    
    // Tentar diferentes seletores para email
    let emailFilled = false;
    const emailSelectors = ['input[type="email"]', 'input[name="email"]', 'input[name="user[email]"]', '#user_email', 'input[placeholder*="email" i]'];
    for (const sel of emailSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.fill('tiago@titaniofilms.com');
          log(`✅ Email preenchido com seletor: ${sel}`);
          emailFilled = true;
          break;
        }
      } catch(e) {}
    }
    
    if (!emailFilled) log('⚠️ Campo email não encontrado');
    
    // Senha
    let pwdFilled = false;
    const pwdSelectors = ['input[type="password"]', 'input[name="password"]', 'input[name="user[password]"]', '#user_password'];
    for (const sel of pwdSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.fill('TitanioYC2026!');
          log(`✅ Senha preenchida: ${sel}`);
          pwdFilled = true;
          break;
        }
      } catch(e) {}
    }
    
    // Confirmar senha
    const pwd2Selectors = ['input[name="password_confirmation"]', 'input[name="user[password_confirmation]"]', '#user_password_confirmation'];
    for (const sel of pwd2Selectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.fill('TitanioYC2026!');
          log(`✅ Confirmar senha: ${sel}`);
          break;
        }
      } catch(e) {}
    }
    
    await shot(page, 'v3-02-filled');
    
    // Tentar submeter
    let submitted = false;
    const submitSelectors = ['input[type="submit"]', 'button[type="submit"]', 'button:has-text("Sign up")', 'button:has-text("Create account")', '.form-submit'];
    for (const sel of submitSelectors) {
      try {
        await page.click(sel, { timeout: 3000 });
        submitted = true;
        log(`✅ Submit com: ${sel}`);
        break;
      } catch(e) {}
    }
    
    if (!submitted) {
      // Tentar Enter
      await page.keyboard.press('Enter');
      log('⚠️ Tentei Enter');
    }
    
    await page.waitForTimeout(4000);
    await shot(page, 'v3-03-after-submit');
    log(`URL após submit: ${page.url()}`);
    
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    log(`Texto da página: ${bodyText}`);
    
    // Se passou para dashboard
    if (!page.url().includes('sign_up') && !page.url().includes('sign_in')) {
      log('✅ YC: Possível sucesso no cadastro!');
      await shot(page, 'v3-04-success');
      
      // Ir para aplicação
      await page.goto('https://apply.ycombinator.com/home', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);
      await shot(page, 'v3-05-apply-home');
      log(`URL apply home: ${page.url()}`);
    }
    
    await shot(page, 'v3-99-final');
    log(`URL final: ${page.url()}`);
    log(`📌 STATUS YC v3: Email=tiago@titaniofilms.com, Senha=TitanioYC2026!`);

  } catch(e) {
    log(`❌ ERRO YC v3: ${e.message.substring(0,200)}`);
    await shot(page, 'v3-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 yc-v3 finalizado\n');
  }
})();
