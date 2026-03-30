/**
 * Victor Capital — ALL PROGRAMS — Final Consolidated Attempt
 * Runs NVIDIA, AWS, Microsoft sequentially with proper error handling
 * Documents exact manual steps needed for each
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos';
const LOG_FILE = path.join(BASE, 'submissao-log.md');

function log(msg) { console.log(msg); fs.appendFileSync(LOG_FILE, msg + '\n'); }

const EMAIL = 'tiago@titaniofilms.com';
const PASS  = 'TitanioAI2026!';
const NAME  = 'Tiago Affonso';

// ═══════════════════════════════════════
// 1. NVIDIA INCEPTION
// ═══════════════════════════════════════
async function nvidia(ctx) {
  const DIR = path.join(BASE, 'screenshots/nvidia-consolidated');
  fs.mkdirSync(DIR, { recursive: true });
  let s = 0;
  const shot = async (p, l) => { s++; const f = path.join(DIR, `${String(s).padStart(2,'0')}-${l}.png`); await p.screenshot({ path: f }); console.log('📸', f); };

  log('\n# 🟢 NVIDIA Inception — ' + new Date().toISOString());
  const page = await ctx.newPage();
  page.setDefaultTimeout(25000);

  try {
    await page.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    try { await page.click('button:has-text("Accept All")', { timeout: 3000 }); } catch(e) {}
    await page.waitForTimeout(1000);

    // Fill email
    await page.locator('#input-30').fill(EMAIL);
    log('✅ Email: ' + EMAIL);
    await page.waitForTimeout(500);

    // Click Sign Up / Login
    await page.getByRole('button', { name: /sign up/i }).click();
    log('✅ Clicou Sign Up / Login');

    // Wait for redirect
    await page.waitForURL('**/nvgs.nvidia.com/**', { timeout: 15000 });
    await page.waitForTimeout(3000);
    log('URL: ' + page.url());

    // Wait for create-account page (may take a moment)
    try {
      await page.waitForURL('**/create-account**', { timeout: 10000 });
      log('✅ Na tela de criar conta');
    } catch(e) {
      log('ℹ️ Em: ' + page.url());
    }
    await page.waitForTimeout(2000);
    await shot(page, 'account-page');

    // Fill password fields
    if (page.url().includes('create-account')) {
      try {
        await page.locator('#registration_password').fill(PASS);
        log('✅ Senha preenchida');
      } catch(e) { log('⚠️ Senha: ' + e.message.substring(0,50)); }
      
      try {
        await page.locator('#registration_passwordConfirm').fill(PASS);
        log('✅ Confirmação preenchida');
      } catch(e) { log('⚠️ Confirmação: ' + e.message.substring(0,50)); }

      await shot(page, 'passwords-filled');

      log('');
      log('⚠️ NVIDIA — BLOQUEIO: hCaptcha');
      log('   Ação manual: resolver "Sou humano" + clicar "Criar Uma Conta"');
      log('   Depois: verificar email tiago@titaniofilms.com para código');
      log('');

      // Wait for captcha or manual intervention (2 min)
      for (let i = 0; i < 24; i++) {
        await page.waitForTimeout(5000);
        if (!page.url().includes('create-account')) {
          log('✅ NVIDIA — Avançou! URL: ' + page.url());
          break;
        }
        if (i === 12) await shot(page, 'waiting-60s');
      }
    } else {
      log('ℹ️ NVIDIA — Pode ser tela de login (conta já existente?)');
      log('   URL: ' + page.url());
    }

    await shot(page, 'nvidia-final');
    log('NVIDIA final URL: ' + page.url());

  } catch(e) {
    log('❌ NVIDIA ERRO: ' + e.message.substring(0,100));
    await shot(page, 'nvidia-error').catch(() => {});
  }
  
  await page.close();
  return page.url().includes('create-account') ? 'bloqueado_captcha' : 
         page.url().includes('application') ? 'bloqueado_auth' : 'avancou';
}

// ═══════════════════════════════════════
// 2. AWS ACTIVATE
// ═══════════════════════════════════════
async function aws(ctx) {
  const DIR = path.join(BASE, 'screenshots/aws-consolidated');
  fs.mkdirSync(DIR, { recursive: true });
  let s = 0;
  const shot = async (p, l) => { s++; const f = path.join(DIR, `${String(s).padStart(2,'0')}-${l}.png`); await p.screenshot({ path: f }); console.log('📸', f); };

  log('\n# 🟠 AWS Activate — ' + new Date().toISOString());
  const mainPage = await ctx.newPage();
  mainPage.setDefaultTimeout(25000);

  try {
    await mainPage.goto('https://aws.amazon.com/startups/sign-up', { waitUntil: 'domcontentloaded' });
    await mainPage.waitForTimeout(3000);
    try { await mainPage.click('button:has-text("Aceitar")', { timeout: 3000 }); } catch(e) {}
    await mainPage.waitForTimeout(1000);
    await shot(mainPage, 'signup-page');

    // Open popup
    const [popup] = await Promise.all([
      ctx.waitForEvent('page', { timeout: 15000 }),
      mainPage.click('button:has-text("Criar ID do builder")'),
    ]);
    log('✅ Popup Builder ID aberto');
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForTimeout(3000);
    try { await popup.click('button:has-text("Aceitar")', { timeout: 4000 }); } catch(e) {}
    await popup.waitForTimeout(1500);
    await shot(popup, 'popup');

    // Fill email
    await popup.locator('input[id^="formField"]').first().fill(EMAIL);
    log('✅ Email: ' + EMAIL);
    await popup.waitForTimeout(500);

    // Continue
    await popup.locator('button:has-text("Continuar")').click();
    log('✅ Continuar');
    await popup.waitForTimeout(5000);
    await shot(popup, 'name-page');
    log('URL: ' + popup.url());

    // Fill name — using locator.first() then fill
    const nameField = popup.locator('input[id^="formField"]').first();
    await nameField.waitFor({ state: 'visible', timeout: 10000 });
    await nameField.fill(NAME);
    await popup.waitForTimeout(300);
    
    const val = await nameField.inputValue();
    log('Nome: "' + val + '"');

    if (val === NAME) {
      await popup.locator('button:has-text("Continuar")').click();
      log('✅ Continuar (nome)');
      await popup.waitForTimeout(5000);
      await shot(popup, 'after-name');
      log('URL: ' + popup.url());

      // Check what's next
      const currentUrl = popup.url();
      if (currentUrl.includes('enter-email') || currentUrl.includes('verify')) {
        // Might need email verification
        log('📧 Possível verificação de email em: ' + currentUrl);
        
        // Check for verification code field
        const allInputs = await popup.$$eval('input:not([type="hidden"])', els =>
          els.map(e => ({ type: e.type, id: e.id, ph: e.placeholder.substring(0,40) }))
        );
        log('Campos: ' + JSON.stringify(allInputs));
        
        log('');
        log('⚠️ AWS — BLOQUEIO: Necessita verificação de email ou erro do servidor');
        log('   Ação manual: Verificar email tiago@titaniofilms.com');
        log('   Se erro: tentar novamente mais tarde');
        log('');
        
        // Wait 90s for manual intervention
        for (let i = 0; i < 18; i++) {
          await popup.waitForTimeout(5000);
          if (!popup.url().includes('enter-email')) {
            log('✅ AWS — Avançou! URL: ' + popup.url());
            break;
          }
          if (i === 9) await shot(popup, 'waiting-45s');
        }
      } else if (currentUrl.includes('password') || currentUrl.includes('create')) {
        log('✅ Na tela de senha!');
        // Fill password
        const pwds = await popup.$$('[type="password"]');
        for (const pwd of pwds) await pwd.fill(PASS);
        log('✅ Senha preenchida');
        await popup.locator('button:has-text("Continuar")').click().catch(() => {});
        await popup.waitForTimeout(3000);
      }
    } else {
      log('⚠️ Nome não preenchido corretamente: "' + val + '"');
    }

    await shot(popup, 'aws-final');
    log('AWS final URL: ' + popup.url());
    await mainPage.close();

  } catch(e) {
    log('❌ AWS ERRO: ' + e.message.substring(0,100));
    await shot(mainPage, 'aws-error').catch(() => {});
  }
  
  return 'avancou';
}

// ═══════════════════════════════════════
// 3. MICROSOFT FOR STARTUPS
// ═══════════════════════════════════════
async function microsoft(ctx) {
  const DIR = path.join(BASE, 'screenshots/ms-consolidated');
  fs.mkdirSync(DIR, { recursive: true });
  let s = 0;
  const shot = async (p, l) => { s++; const f = path.join(DIR, `${String(s).padStart(2,'0')}-${l}.png`); await p.screenshot({ path: f }); console.log('📸', f); };

  log('\n# 🔵 Microsoft for Startups — ' + new Date().toISOString());
  const page = await ctx.newPage();
  page.setDefaultTimeout(25000);

  try {
    await page.goto('https://foundershub.startups.microsoft.com/signup', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await shot(page, 'signup-page');
    log('URL: ' + page.url());
    log('Title: ' + await page.title());

    // Find signup/Azure button
    const btns = await page.$$eval('a, button', els =>
      els.filter(e => e.offsetParent !== null && e.innerText.trim()).map(e => ({
        text: e.innerText.trim().substring(0,60),
        href: (e.href||'').substring(0,80)
      })).filter(e => /sign|inscrever|azure|register|criar|start/i.test(e.text))
    );
    log('Signup buttons: ' + JSON.stringify(btns));

    // Try clicking signup
    for (const sel of [
      'a:has-text("Inscrever-se com o Azure")',
      'a:has-text("Sign up with Azure")',
      'button:has-text("Inscrever-se")',
      'a:has-text("Sign up")',
      'a[href*="login.microsoftonline"]',
    ]) {
      try {
        const el = await page.$(sel);
        if (el && await el.isVisible()) {
          log('🔘 Clicando: ' + sel.substring(0,50));
          await el.click();
          break;
        }
      } catch(e) {}
    }

    await page.waitForTimeout(5000);
    await shot(page, 'after-signup-click');
    log('URL: ' + page.url());

    // If redirected to Microsoft login
    if (page.url().includes('login.microsoftonline') || page.url().includes('login.live')) {
      log('✅ Na tela de login Microsoft');
      
      // Fill email
      const emailField = await page.$('[type="email"], #i0116, [name="loginfmt"]');
      if (emailField) {
        await emailField.fill('contact@titaniofilms.com');
        log('✅ Email MS: contact@titaniofilms.com');
        
        try {
          await page.click('#idSIButton9, button[type="submit"]', { timeout: 3000 });
          log('✅ Next');
          await page.waitForTimeout(3000);
          await shot(page, 'after-email');
        } catch(e) {}
      }
      
      log('');
      log('⚠️ MICROSOFT — BLOQUEIO: Login Microsoft necessário');
      log('   Precisa de conta Microsoft com contact@titaniofilms.com');
      log('   Ação manual: criar conta MS ou usar conta existente');
      log('');
    } else {
      log('ℹ️ Microsoft não redirecionou para login');
    }

    // Wait 60s
    for (let i = 0; i < 12; i++) {
      await page.waitForTimeout(5000);
      if (i === 6) await shot(page, 'waiting-30s');
    }

    await shot(page, 'ms-final');
    log('Microsoft final URL: ' + page.url());

  } catch(e) {
    log('❌ MS ERRO: ' + e.message.substring(0,100));
    await shot(page, 'ms-error').catch(() => {});
  }
  
  await page.close();
}

// ═══════════════════════════════════════
// MAIN
// ═══════════════════════════════════════
(async () => {
  log('\n\n========================================');
  log('# SUBMISSÃO CONSOLIDADA — ' + new Date().toISOString());
  log('========================================\n');

  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });

  const nvidiaResult = await nvidia(ctx);
  log('NVIDIA resultado: ' + nvidiaResult);

  const awsResult = await aws(ctx);
  log('AWS resultado: ' + awsResult);

  await microsoft(ctx);

  await b.close();

  log('\n========================================');
  log('✅ SUBMISSÃO CONSOLIDADA FINALIZADA');
  log('========================================\n');
})().catch(e => {
  log('❌ ERRO FATAL: ' + e.message);
});
