/**
 * Victor Capital — NVIDIA Inception — Create Account
 * Preenche senha + confirma + aguarda CAPTCHA + clica Criar Conta
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-phoenix';
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const LOG_FILE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

let step = 20;
async function shot(page, label) {
  step++;
  const fp = path.join(OUTDIR, `${String(step).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: fp, fullPage: false });
  console.log('📸', fp);
  return fp;
}

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + '\n');
}

const EMAIL = 'tiago@titaniofilms.com';
const PASS = 'TitanioAI2026!';

(async () => {
  log('\n### NVIDIA — Create Account — ' + new Date().toISOString());

  const b = await chromium.launch({ 
    headless: false, 
    slowMo: 500,
    args: ['--start-maximized']
  });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  try {
    // Ir direto para a página de criação de conta com email pré-preenchido
    // Primeiro precisamos passar pelo formulário inicial para obter o token JWT correto
    await page.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(3000);

    // Aceitar cookies
    try { await page.click('button:has-text("Accept All")', { timeout: 3000 }); } catch(e) {}
    await page.waitForTimeout(1000);

    // Preencher email
    await page.fill('#input-30', EMAIL);
    log('✅ Email: ' + EMAIL);
    await page.waitForTimeout(800);

    // Clicar Sign Up / Login
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.className.includes('slds-button_brand') || b.innerText.includes('Sign Up') || b.innerText.includes('Login'));
      if (btn) { btn.click(); return true; }
      return false;
    });
    log(clicked ? '✅ Clicou Sign Up / Login' : '⚠️ Botão não encontrado via JS');

    // Aguardar redirecionamento para create-account
    await page.waitForURL('**/create-account**', { timeout: 15000 }).catch(() => log('⚠️ Não redirecionou para create-account'));
    await page.waitForTimeout(2000);
    await shot(page, 'create-account');
    log('URL: ' + page.url());

    // Preencher senha
    await page.fill('#registration_password', PASS);
    await page.waitForTimeout(500);
    
    // Preencher confirmação de senha
    await page.fill('#registration_passwordConfirm', PASS);
    await page.waitForTimeout(500);
    
    log('✅ Senha e confirmação preenchidas');
    await shot(page, 'passwords-filled');

    // Verificar se precisa aceitar termos
    try {
      const termsChk = await page.$('input[type="checkbox"][id*="terms"], input[type="checkbox"][id*="agree"]');
      if (termsChk) {
        const checked = await termsChk.isChecked();
        if (!checked) {
          await termsChk.check();
          log('✅ Termos aceitos');
        }
      }
    } catch(e) {}

    await shot(page, 'before-captcha');
    log('');
    log('⚠️  CAPTCHA DETECTADO!');
    log('   Aguardando 120s para que o CAPTCHA seja resolvido manualmente...');
    log('   Resolva o hCaptcha "Sou humano" na janela do browser.');
    log('');
    
    // Aguardar resolução do CAPTCHA (120 segundos)
    // Verificar a cada 5s se o CAPTCHA foi resolvido
    let captchaDone = false;
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(5000);
      
      // Verificar se o h-captcha-response foi preenchido
      const captchaResponse = await page.$eval(
        '[name="h-captcha-response"], #h-captcha-response-0qvxa8toon4b',
        el => el.value
      ).catch(() => '');
      
      if (captchaResponse && captchaResponse.length > 10) {
        log(`✅ CAPTCHA resolvido! (${i*5}s)`);
        captchaDone = true;
        break;
      }
      
      // Verificar se já avançou para próxima tela
      const url = page.url();
      if (!url.includes('create-account')) {
        log('✅ Redirecionou — CAPTCHA resolvido e conta criada!');
        captchaDone = true;
        break;
      }
      
      console.log(`⏳ Aguardando CAPTCHA... ${(i+1)*5}s / 120s`);
    }

    await shot(page, 'after-captcha-wait');
    
    if (!captchaDone) {
      log('⚠️ CAPTCHA não foi resolvido em 120s');
      // Tentar clicar "Criar Uma Conta" mesmo assim para ver o que acontece
    }

    // Clicar "Criar Uma Conta"
    try {
      await page.click('button:has-text("Criar Uma Conta"), button:has-text("Create Account"), button[type="submit"]', { timeout: 5000 });
      log('✅ Clicou Criar Uma Conta');
      await page.waitForTimeout(5000);
      await shot(page, 'after-create');
      log('URL após criar: ' + page.url());
    } catch(e) {
      log('⚠️ Botão criar conta: ' + e.message.substring(0,80));
    }

    // Aguardar possível email de verificação
    await page.waitForTimeout(5000);
    await shot(page, 'step3');
    log('URL final: ' + page.url());
    log('Title: ' + await page.title());

    // Verificar se há campo de verificação de email
    const verifyInput = await page.$('input[type="text"][id*="code"], input[placeholder*="code" i], input[placeholder*="verification" i]');
    if (verifyInput) {
      log('📧 Campo de verificação de email detectado — aguardando email...');
      await page.waitForTimeout(30000);
      await shot(page, 'verification-step');
    }

    // Aguardar mais para análise
    log('⏳ Aguardando 30s...');
    await page.waitForTimeout(30000);
    await shot(page, 'end');

  } catch(e) {
    log('❌ ERRO: ' + e.message);
    await shot(page, 'error').catch(() => {});
  } finally {
    await b.close();
    log('🏁 Script NVIDIA create-account finalizado\n');
  }
})();
