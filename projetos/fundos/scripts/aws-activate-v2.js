// AWS Activate Founders v2 - Criar conta AWS + aplicar
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-activate-v2';
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
  log(`\n---\n### AWS Activate v2 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    // AWS Activate direto
    await page.goto('https://aws.amazon.com/startups/credits', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await shot(page, '01-credits-page');
    log(`URL: ${page.url()}`);
    
    // Aceitar cookies se aparecer
    try {
      await page.click('button:has-text("Aceitar")', { timeout: 3000 });
      log('✅ Cookies aceitos');
    } catch(e) {}
    
    // Ir para sign-up
    await page.goto('https://aws.amazon.com/startups/sign-up', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await shot(page, '02-signup');
    log(`Title: ${await page.title()}`);
    
    // Procurar formulário de inscrição
    const formFields = await page.$$eval('input, select', els =>
      els.map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder }))
    );
    log(`Campos: ${JSON.stringify(formFields)}`);
    
    // Tentar Builder ID (a melhor opção para AWS Activate sem conta)
    // Navegar para https://profile.aws.amazon.com/
    await page.goto('https://profile.aws.amazon.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await shot(page, '03-aws-profile');
    log(`URL Profile: ${page.url()}`);
    
    // Verificar se tem criar conta/sign up
    const links = await page.$$eval('a, button', els =>
      els.map(e => ({ text: e.textContent.trim().substring(0,80), href: e.href || '' }))
         .filter(e => e.text.length > 0)
    );
    log(`Links: ${JSON.stringify(links.slice(0,20))}`);
    
    // Tentar criar Builder ID
    try {
      await page.click('text=/create|sign up|register/i', { timeout: 5000 });
      await page.waitForTimeout(2000);
      await shot(page, '04-create-account');
      log(`URL criação: ${page.url()}`);
      
      // Preencher email
      const emailField = await page.$('input[type="email"], input[name="email"]');
      if (emailField) {
        await emailField.fill('contact@titaniofilms.com');
        log('✅ Email preenchido');
        await page.waitForTimeout(500);
        
        // Next/Continue
        try {
          await page.click('button[type="submit"], button:has-text("Next"), button:has-text("Continue")', { timeout: 5000 });
          await page.waitForTimeout(2000);
          await shot(page, '05-after-submit');
          log(`URL após submit: ${page.url()}`);
        } catch(e) {
          log(`⚠️ Submit: ${e.message.substring(0,100)}`);
        }
      }
    } catch(e) {
      log(`⚠️ Create account: ${e.message.substring(0,100)}`);
    }
    
    // Tentar rota alternativa: AWS Console novo usuário
    await page.goto('https://signin.aws.amazon.com/signup?request_type=register', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await shot(page, '06-aws-signup-form');
    log(`URL AWS Signup: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    const signupFields = await page.$$eval('input', els =>
      els.map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder, label: document.querySelector(`label[for="${e.id}"]`)?.textContent?.trim() || '' }))
    );
    log(`Campos signup: ${JSON.stringify(signupFields)}`);
    
    // Preencher formulário de criação de conta AWS
    try {
      // Email field
      const emailEl = await page.$('#emailAddress, input[name="emailAddress"], input[type="email"]');
      if (emailEl) {
        await emailEl.fill('contact@titaniofilms.com');
        log('✅ Email AWS preenchido');
      }
      
      // Senha
      const pwdEl = await page.$('#password, input[type="password"]');
      if (pwdEl) {
        await pwdEl.fill('TitanioAI2026!');
        log('✅ Senha AWS preenchida');
      }
      
      // Confirmar senha
      const pwd2 = await page.$('#rePassword, #confirmPassword, input[name="rePassword"]');
      if (pwd2) {
        await pwd2.fill('TitanioAI2026!');
        log('✅ Confirmar senha preenchida');
      }
      
      await shot(page, '07-form-filled');
      
      // Submit
      await page.click('button[type="submit"], #btn-createaccount, input[type="submit"]', { timeout: 5000 });
      await page.waitForTimeout(3000);
      await shot(page, '08-after-submit');
      log(`URL após submit AWS: ${page.url()}`);
      
    } catch(e) {
      log(`⚠️ Form fill: ${e.message.substring(0,100)}`);
    }
    
    await shot(page, '99-final');
    log(`URL final: ${page.url()}`);
    log(`📌 STATUS: AWS — Tentativa de criar conta AWS em progresso. Verificar se email de verificação chegou em contact@titaniofilms.com`);

  } catch(e) {
    log(`❌ ERRO: ${e.message.substring(0,200)}`);
    await shot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 aws-activate-v2 finalizado\n');
  }
})();
