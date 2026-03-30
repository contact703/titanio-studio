/**
 * Victor Capital — NVIDIA Inception — Aplicação Completa
 * Fluxo: email → Sign Up → Create Account → senha → CAPTCHA → submissão
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-phoenix';
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
const LOG_FILE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

let step = 30;
async function shot(page, label) {
  step++;
  const fp = path.join(OUTDIR, `${String(step).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: fp, fullPage: false });
  console.log('📸', fp);
  return fp;
}

function log(msg) { console.log(msg); fs.appendFileSync(LOG_FILE, msg + '\n'); }

const EMAIL = 'tiago@titaniofilms.com';
const PASS = 'TitanioAI2026!';

(async () => {
  log('\n### NVIDIA Inception — Full Apply — ' + new Date().toISOString());
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  try {
    // Step 1: Página inicial
    await page.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(3500);
    try { await page.click('button:has-text("Accept All")', { timeout: 3000 }); } catch(e) {}
    await page.waitForTimeout(1200);

    // Preencher email via input-30
    await page.fill('#input-30', EMAIL);
    log('✅ Email: ' + EMAIL);
    await page.waitForTimeout(700);
    await shot(page, 'email-ready');

    // Clicar "Sign Up / Login" via getByRole (shadow DOM)
    await page.getByRole('button', { name: /sign up/i }).click();
    log('✅ Clicou Sign Up / Login');
    await page.waitForTimeout(2000);

    // Aguardar redirecionamento para login ou create-account
    await page.waitForURL('**/login.nvgs.nvidia.com/**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    log('URL login: ' + page.url());
    await shot(page, 'login-page');

    // Verificar se chegou em create-account ou login
    const currentUrl = page.url();
    if (currentUrl.includes('create-account')) {
      log('📝 Formulário de criação de conta detectado');
      await fillCreateAccount(page);
    } else if (currentUrl.includes('/login')) {
      log('🔑 Página de login detectada — tentando create-account link');
      // Verificar se há link "Criar Conta" / "Create Account"
      try {
        await page.click('a:has-text("Criar"), a:has-text("Create Account"), a:has-text("Sign Up"), button:has-text("Create")', { timeout: 5000 });
        await page.waitForTimeout(2000);
        await shot(page, 'after-create-link');
        log('URL: ' + page.url());
        if (page.url().includes('create-account')) {
          await fillCreateAccount(page);
        }
      } catch(e) {
        log('⚠️ Link criar conta não encontrado: ' + e.message.substring(0,60));
        // Mapear o que está na tela
        const links = await page.$$eval('a', as => as.map(a => ({ text: a.innerText.trim().substring(0,40), href: a.href.substring(0,60) })));
        log('Links disponíveis: ' + JSON.stringify(links.slice(0, 10)));
      }
    }

    await shot(page, 'final-state');
    log('URL final: ' + page.url());

  } catch(e) {
    log('❌ ERRO: ' + e.message);
    await shot(page, 'error').catch(() => {});
  } finally {
    log('⏳ Mantendo browser aberto por 30s...');
    await new Promise(r => setTimeout(r, 30000));
    await b.close();
    log('🏁 Script finalizado\n');
  }
})();

async function fillCreateAccount(page) {
  const LOG_FILE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
  function log(msg) { console.log(msg); fs.appendFileSync(LOG_FILE, msg + '\n'); }
  
  const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-phoenix';
  let s = 40;
  async function shot(pg, label) {
    s++;
    const fp = path.join(OUTDIR, `${String(s).padStart(2,'0')}-${label}.png`);
    await pg.screenshot({ path: fp, fullPage: false });
    console.log('📸', fp);
  }

  await page.waitForTimeout(2000);
  await shot(page, 'create-account-form');

  // Preencher senha
  try {
    await page.fill('#registration_password', 'TitanioAI2026!');
    log('✅ Senha preenchida');
  } catch(e) { log('⚠️ Campo senha: ' + e.message.substring(0,60)); }

  // Preencher confirmação de senha
  try {
    await page.fill('#registration_passwordConfirm', 'TitanioAI2026!');
    log('✅ Confirmação de senha preenchida');
  } catch(e) { log('⚠️ Confirmação senha: ' + e.message.substring(0,60)); }

  await shot(page, 'passwords-filled');

  // Verificar se há checkbox de termos
  try {
    const termsSelectors = [
      'input[type="checkbox"][id*="terms"]',
      'input[type="checkbox"][id*="agree"]',
      'input[type="checkbox"][id*="accept"]',
      'input[type="checkbox"]:not([id*="captcha"]):not([id*="hcaptcha"])'
    ];
    for (const sel of termsSelectors) {
      const chk = await page.$(sel);
      if (chk && !await chk.isChecked()) {
        await chk.check();
        log('✅ Checkbox marcado: ' + sel.substring(0,40));
      }
    }
  } catch(e) {}

  log('');
  log('⚠️  CAPTCHA (hCaptcha) DETECTADO!');
  log('   AÇÃO NECESSÁRIA: Resolva o CAPTCHA na janela do browser.');
  log('   Aguardando até 180 segundos...');
  log('');

  // Aguardar CAPTCHA ser resolvido
  let captchaSolved = false;
  for (let i = 0; i < 36; i++) {
    await page.waitForTimeout(5000);
    
    // Verificar se avançou
    if (!page.url().includes('create-account')) {
      log(`✅ Avançou! URL: ${page.url()}`);
      captchaSolved = true;
      break;
    }
    
    // Verificar resposta do hCaptcha
    const hcaptchaVal = await page.evaluate(() => {
      const el = document.querySelector('[name="h-captcha-response"]');
      return el ? el.value : '';
    }).catch(() => '');
    
    if (hcaptchaVal && hcaptchaVal.length > 10) {
      log(`✅ hCaptcha resolvido em ${(i+1)*5}s`);
      captchaSolved = true;
      break;
    }
    
    if (i % 6 === 0) {
      console.log(`⏳ ${(i+1)*5}s / 180s — aguardando CAPTCHA...`);
      await shot(page, `waiting-captcha-${i}`);
    }
  }

  if (!captchaSolved) {
    log('⚠️ Tempo esgotado — tentando submeter mesmo assim');
  }

  await shot(page, 'captcha-resolved');

  // Clicar "Criar Uma Conta"
  try {
    const createBtn = await page.getByRole('button', { name: /criar uma conta|create account/i });
    if (createBtn) {
      await createBtn.click();
      log('✅ Clicou Criar Uma Conta');
    }
  } catch(e) {
    try {
      await page.click('button[type="submit"]:visible', { timeout: 3000 });
      log('✅ Clicou submit');
    } catch(e2) {
      log('⚠️ Botão criar conta: ' + e2.message.substring(0,60));
    }
  }

  await page.waitForTimeout(5000);
  await shot(page, 'after-create-click');
  log('URL: ' + page.url());

  // Verificar se há tela de verificação de email
  const emailVerification = await page.$('input[placeholder*="code" i], input[placeholder*="verif" i], h1:has-text("verify"), h2:has-text("verify")');
  if (emailVerification) {
    log('📧 Tela de verificação de email detectada!');
    log('   Verifique o email tiago@titaniofilms.com para o código de verificação.');
    await page.waitForTimeout(60000);
    await shot(page, 'verification-email');
  }

  // Aguardar mais
  await page.waitForTimeout(15000);
  await shot(page, 'create-account-final');
  log('URL final create-account: ' + page.url());
}
