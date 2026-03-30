// YC Application v2 - Criar conta e iniciar rascunho
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
  log(`\n---\n### YC Application v2 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    // Ir para a página de aplicação YC
    await page.goto('https://apply.ycombinator.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await shot(page, '01-apply-landing');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Links/botões na página
    const links = await page.$$eval('a, button', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,80), href: e.href || '' }))
         .filter(e => e.text.length > 1)
    );
    log(`Links: ${JSON.stringify(links.slice(0,30))}`);
    
    // Procurar Create Account / Sign Up
    const signupLinks = links.filter(l => /sign up|create|register|new account/i.test(l.text + l.href));
    log(`Signup links: ${JSON.stringify(signupLinks)}`);
    
    // Tentar criar conta
    try {
      await page.click('text=/sign up|create account|register/i', { timeout: 5000 });
      await page.waitForTimeout(2000);
      await shot(page, '02-signup-form');
      log(`URL signup: ${page.url()}`);
    } catch(e) {
      log(`⚠️ Signup link: ${e.message.substring(0,100)}`);
      // Tentar URL direta
      await page.goto('https://account.ycombinator.com/users/sign_up', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      await shot(page, '02-signup-direct');
      log(`URL direta signup: ${page.url()}`);
    }
    
    // Mapear campos do formulário
    const formFields = await page.$$eval('input, select, textarea', els =>
      els.map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder, label: '' }))
         .filter(e => !['hidden'].includes(e.type))
    );
    log(`Campos: ${JSON.stringify(formFields)}`);
    
    // Preencher formulário de criação de conta
    try {
      // Email
      const emailEl = await page.$('input[type="email"], input[name="email"], #user_email');
      if (emailEl) {
        await emailEl.fill('tiago@titaniofilms.com');
        log('✅ Email YC preenchido');
      }
      
      // Senha
      const pwdEl = await page.$('input[type="password"], input[name="password"], #user_password');
      if (pwdEl) {
        await pwdEl.fill('TitanioYC2026!');
        log('✅ Senha YC preenchida');
      }
      
      // Confirmar senha
      const pwd2 = await page.$('input[name="password_confirmation"], #user_password_confirmation');
      if (pwd2) {
        await pwd2.fill('TitanioYC2026!');
        log('✅ Confirmar senha preenchida');
      }
      
      await shot(page, '03-form-filled');
      
      // Submit
      await page.click('input[type="submit"], button[type="submit"]', { timeout: 5000 });
      await page.waitForTimeout(3000);
      await shot(page, '04-after-submit');
      log(`URL após submit: ${page.url()}`);
      
      // Verificar resultado
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      log(`Resposta: ${bodyText}`);
      
    } catch(e) {
      log(`⚠️ Form fill: ${e.message.substring(0,100)}`);
    }
    
    // Se chegou no dashboard, tentar acessar aplicação
    if (page.url().includes('apply.ycombinator.com') && !page.url().includes('sign')) {
      log('✅ Possível acesso ao dashboard!');
      await shot(page, '05-dashboard');
      
      // Procurar botão de nova aplicação
      try {
        await page.click('text=/new application|start application|apply/i', { timeout: 5000 });
        await page.waitForTimeout(2000);
        await shot(page, '06-new-app');
        log(`URL nova app: ${page.url()}`);
      } catch(e) {
        log(`⚠️ New application: ${e.message.substring(0,100)}`);
      }
    }
    
    await shot(page, '99-final');
    log(`URL final: ${page.url()}`);
    log(`📌 STATUS YC: Tentativa de criar conta com tiago@titaniofilms.com / TitanioYC2026!`);

  } catch(e) {
    log(`❌ ERRO YC: ${e.message.substring(0,200)}`);
    await shot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 yc-v2 finalizado\n');
  }
})();
