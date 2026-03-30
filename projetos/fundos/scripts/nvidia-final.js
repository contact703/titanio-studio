/**
 * Victor Capital — NVIDIA Inception — Script Final
 * Fluxo completo: email → Sign Up → detecta redirect → preenche → aguarda CAPTCHA 3min
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-final';
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
const LOG_FILE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

let step = 0;
async function shot(page, label) {
  step++;
  const fp = path.join(OUTDIR, `${String(step).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: fp, fullPage: false });
  console.log('📸', fp);
  return fp;
}
function log(msg) { console.log(msg); fs.appendFileSync(LOG_FILE, msg + '\n'); }

const EMAIL = 'tiago@titaniofilms.com';
const PASS  = 'TitanioAI2026!';

(async () => {
  log('\n---\n## NVIDIA Inception — Script Final — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 600 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  try {
    // 1. Página inicial NVIDIA Phoenix
    await page.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(4000);
    try { await page.click('button:has-text("Accept All")', { timeout: 3000 }); await page.waitForTimeout(1000); } catch(e) {}
    await shot(page, 'loaded');

    // 2. Preencher email
    await page.fill('#input-30', EMAIL);
    log('✅ Email preenchido: ' + EMAIL);
    await page.waitForTimeout(700);

    // 3. Clicar Sign Up / Login (shadow DOM → usa getByRole)
    await page.getByRole('button', { name: /sign up/i }).click();
    log('✅ Clicou Sign Up / Login');
    await shot(page, 'clicked-signup');

    // 4. Aguardar landing em nvgs (pode ir para /login/identifier primeiro)
    await page.waitForURL('**/nvgs.nvidia.com/**', { timeout: 15000 });
    await page.waitForTimeout(2000);
    log('🌐 URL nvgs: ' + page.url());
    await shot(page, 'nvgs-landing');

    // 5. Se for login/identifier — o email pode já existir OU redireciona para create-account
    //    Aguardar até 10s para ver se redireciona para create-account
    if (page.url().includes('/login/identifier')) {
      log('ℹ️ Em /login/identifier — aguardando redirect para create-account...');
      try {
        await page.waitForURL('**/create-account**', { timeout: 10000 });
        log('✅ Redirecionou para create-account');
      } catch(e) {
        log('ℹ️ Não redirecionou — email pode já ter conta. Verificando...');
      }
      await page.waitForTimeout(2000);
      await shot(page, 'identifier-resolved');
    }

    const finalUrl = page.url();
    log('URL atual: ' + finalUrl);

    if (finalUrl.includes('create-account')) {
      // ==== FLUXO: CRIAR NOVA CONTA ====
      log('\n📝 FLUXO: CRIAÇÃO DE CONTA');
      await page.waitForTimeout(2000);

      // Preencher senha
      await page.fill('#registration_password', PASS);
      await page.waitForTimeout(400);
      log('✅ Senha preenchida');

      // Preencher confirmação
      await page.fill('#registration_passwordConfirm', PASS);
      await page.waitForTimeout(400);
      log('✅ Confirmação de senha preenchida');

      await shot(page, 'passwords-done');

      // Aceitar termos se houver checkbox
      try {
        const checkboxes = await page.$$('input[type="checkbox"]:not([id*="captcha"]):not([id*="hcaptcha"]):not([id*="recaptcha"])');
        for (const chk of checkboxes) {
          if (!await chk.isChecked()) {
            await chk.check();
            const id = await chk.getAttribute('id') || 'unknown';
            log('✅ Checkbox marcado: ' + id);
          }
        }
      } catch(e) {}

      log('');
      log('═══════════════════════════════════════════════');
      log('⚠️  AÇÃO MANUAL NECESSÁRIA — CAPTCHA hCaptcha');
      log('   Na janela do browser:');
      log('   1. Clique em "Sou humano" / "I am human"');
      log('   2. Complete o desafio visual se aparecer');
      log('   3. O script vai detectar e prosseguir');
      log('   Aguardando até 180 segundos...');
      log('═══════════════════════════════════════════════\n');

      // Aguardar resolução do CAPTCHA (até 3 minutos)
      let captchaOk = false;
      for (let i = 0; i < 36; i++) {
        await page.waitForTimeout(5000);

        // Verificar se saiu da tela de create-account
        if (!page.url().includes('create-account')) {
          log(`✅ Saiu de create-account após ${(i+1)*5}s — possivelmente avançou!`);
          captchaOk = true;
          break;
        }

        // Verificar hCaptcha response
        const hval = await page.evaluate(() => {
          const el = document.querySelector('[name="h-captcha-response"]');
          return el ? el.value.length : 0;
        }).catch(() => 0);

        if (hval > 10) {
          log(`✅ hCaptcha resolvido! (${(i+1)*5}s)`);
          captchaOk = true;
          break;
        }

        // Verificar reCAPTCHA
        const rval = await page.evaluate(() => {
          const el = document.querySelector('[name="g-recaptcha-response"]');
          return el ? el.value.length : 0;
        }).catch(() => 0);

        if (rval > 10) {
          log(`✅ reCAPTCHA resolvido! (${(i+1)*5}s)`);
          captchaOk = true;
          break;
        }

        if (i % 4 === 0) {
          console.log(`⏳ Aguardando CAPTCHA... ${(i+1)*5}s / 180s`);
          await shot(page, `captcha-wait-${(i+1)*5}s`);
        }
      }

      if (!captchaOk) {
        log('⚠️ CAPTCHA não resolvido em 180s — tentando submeter de qualquer forma');
      }

      await shot(page, 'pre-submit');

      // Clicar "Criar Uma Conta" / "Create Account"
      let submitted = false;
      for (const sel of [
        'button:has-text("Criar Uma Conta")',
        'button:has-text("Create Account")',
        'button:has-text("Create an Account")',
        'button[type="submit"]:visible',
        'form button:last-of-type',
      ]) {
        try {
          const el = await page.$(sel);
          if (el && await el.isVisible()) {
            await el.click();
            log('✅ Clicou: ' + sel.substring(0, 50));
            submitted = true;
            break;
          }
        } catch(e) {}
      }

      if (!submitted) {
        log('⚠️ Botão submit não encontrado — tentando getByRole');
        try {
          await page.getByRole('button', { name: /criar|create/i }).click({ timeout: 5000 });
          submitted = true;
          log('✅ Clicou via getByRole');
        } catch(e) {
          log('❌ Submit não foi possível: ' + e.message.substring(0, 60));
        }
      }

      await page.waitForTimeout(5000);
      await shot(page, 'after-submit');
      log('URL pós-submit: ' + page.url());

      // Verificar se há verificação de email
      await page.waitForTimeout(3000);
      const hasVerifyCode = await page.$('input[maxlength="6"], input[placeholder*="code" i], input[placeholder*="código" i]');
      if (hasVerifyCode) {
        log('📧 VERIFICAÇÃO DE EMAIL detectada!');
        log('   Verifique o email tiago@titaniofilms.com');
        log('   Copie o código de 6 dígitos e insira na janela do browser');
        await shot(page, 'verify-email-screen');
        await page.waitForTimeout(120000); // 2 min para código de email
        await shot(page, 'verify-after-wait');
      }

    } else if (finalUrl.includes('/login') || finalUrl.includes('/identifier')) {
      // ==== FLUXO: EMAIL JÁ EXISTE — FAZER LOGIN ====
      log('\n🔑 FLUXO: EMAIL JÁ TEM CONTA — FAZER LOGIN');

      // Verificar se há campo de senha na tela
      const pwdField = await page.$('#password, [type="password"]');
      if (pwdField) {
        await pwdField.fill(PASS);
        log('✅ Senha preenchida na tela de login');
        await shot(page, 'login-pwd-filled');

        try {
          await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Continuar")', { timeout: 5000 });
          log('✅ Clicou Login');
        } catch(e) {}

        await page.waitForTimeout(5000);
        await shot(page, 'after-login');
        log('URL pós-login: ' + page.url());
      } else {
        // Mapear campos disponíveis
        const inputs = await page.$$eval('input:not([type="hidden"])', els => els.map(e => ({
          id: e.id, type: e.type, ph: e.placeholder.substring(0,30)
        })));
        log('Campos na tela: ' + JSON.stringify(inputs));
        await shot(page, 'login-state');
        log('⚠️ Campo de senha não encontrado na tela de login');
      }
    }

    // Estado final
    await page.waitForTimeout(5000);
    await shot(page, 'final');
    log('\n✅ NVIDIA — Estado final: ' + page.url());
    log('📌 Screenshots: ' + OUTDIR);

    // Aguardar 30s extras
    log('⏳ Aguardando 30s finais...');
    await page.waitForTimeout(30000);
    await shot(page, 'end');

  } catch(e) {
    log('❌ ERRO GERAL: ' + e.message);
    await shot(page, 'error').catch(() => {});
    await page.waitForTimeout(10000);
  } finally {
    await b.close();
    log('🏁 Script NVIDIA Final concluído — ' + new Date().toISOString() + '\n');
  }
})();
