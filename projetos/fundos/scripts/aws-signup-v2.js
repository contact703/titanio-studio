/**
 * Victor Capital — AWS Builder ID — v2 (cookie handling + popup)
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-signup-v2';
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
const LOG_FILE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

let step = 0;
async function shot(pg, label) {
  step++;
  const fp = path.join(OUTDIR, `${String(step).padStart(2,'0')}-${label}.png`);
  await pg.screenshot({ path: fp, fullPage: false });
  console.log('📸', fp);
}
function log(msg) { console.log(msg); fs.appendFileSync(LOG_FILE, msg + '\n'); }

const EMAIL = 'tiago@titaniofilms.com';
const PASS  = 'TitanioAI2026!';
const NAME  = 'Tiago Affonso';

(async () => {
  log('\n---\n## AWS Builder ID v2 — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const mainPage = await ctx.newPage();
  mainPage.setDefaultTimeout(30000);

  try {
    // Go to sign-up page
    await mainPage.goto('https://aws.amazon.com/startups/sign-up', { waitUntil: 'domcontentloaded' });
    await mainPage.waitForTimeout(3000);
    try { await mainPage.click('button:has-text("Aceitar")', { timeout: 3000 }); log('✅ Cookies aceitos (main)'); } catch(e) {}
    await mainPage.waitForTimeout(1000);

    // Click "Criar ID do builder" and capture popup
    const [popup] = await Promise.all([
      ctx.waitForEvent('page', { timeout: 15000 }),
      mainPage.click('button:has-text("Criar ID do builder")'),
    ]);
    log('✅ Popup aberto');

    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForTimeout(4000);

    // CRITICAL: Accept cookies in popup FIRST
    try {
      await popup.click('button:has-text("Aceitar"), button:has-text("Accept")', { timeout: 5000 });
      log('✅ Cookies aceitos (popup)');
      await popup.waitForTimeout(1500);
    } catch(e) {
      log('ℹ️ No cookie banner in popup');
    }

    await shot(popup, 'popup-clean');
    log('Popup URL: ' + popup.url());

    // Now fill email field
    const emailField = await popup.$('input[type="text"], input[type="email"], [placeholder*="email" i], [placeholder*="username" i]');
    if (emailField) {
      await emailField.fill(EMAIL);
      log('✅ Email: ' + EMAIL);
    } else {
      // Try with dynamic ID
      const allInputs = await popup.$$('input:not([type="hidden"]):not([type="checkbox"])');
      if (allInputs.length > 0) {
        await allInputs[0].fill(EMAIL);
        log('✅ Email (first input): ' + EMAIL);
      }
    }

    await shot(popup, 'email-filled');

    // Look for "Create your AWS Builder ID" link or "Next" button
    const allBtns = await popup.$$eval('button, a', els =>
      els.filter(e => e.offsetParent !== null && e.innerText.trim()).map(e => ({
        text: e.innerText.trim().substring(0,60), tag: e.tagName
      }))
    );
    log('Buttons: ' + JSON.stringify(allBtns));

    // Click "Create your AWS Builder ID" or "Next"
    let clicked = false;
    for (const txt of ['Create your AWS Builder ID', 'Criar o ID do builder da AWS', 'Create', 'Criar', 'Next', 'Próximo', 'Continue', 'Continuar']) {
      try {
        const btn = await popup.getByRole('button', { name: new RegExp(txt, 'i') });
        if (await btn.isVisible()) {
          await btn.click();
          log('✅ Clicou: "' + txt + '"');
          clicked = true;
          break;
        }
      } catch(e) {}
      try {
        const link = await popup.getByRole('link', { name: new RegExp(txt, 'i') });
        if (await link.isVisible()) {
          await link.click();
          log('✅ Clicou link: "' + txt + '"');
          clicked = true;
          break;
        }
      } catch(e) {}
    }

    if (!clicked) {
      // Try clicking the main submit
      try {
        await popup.click('button[type="submit"]', { timeout: 3000 });
        log('✅ Clicou submit');
      } catch(e) {
        log('⚠️ Nenhum botão clicado');
      }
    }

    await popup.waitForTimeout(4000);
    await shot(popup, 'after-action');
    log('URL após ação: ' + popup.url());

    // Map new fields
    const fields2 = await popup.$$eval('input:not([type="hidden"]):not([type="checkbox"])', els =>
      els.map(e => ({ type: e.type, id: e.id, ph: e.placeholder.substring(0,40), val: e.value.substring(0,20) }))
    );
    log('Campos step 2: ' + JSON.stringify(fields2));

    // If we see password/name fields, fill them
    for (const [sel, val] of [
      ['[placeholder*="Your name" i], [placeholder*="Seu nome" i], [placeholder*="name" i]:not([type="email"])', NAME],
      ['[type="password"]', PASS],
    ]) {
      try {
        const el = await popup.$(sel);
        if (el && await el.isVisible()) {
          await el.fill(val);
          log('✅ ' + sel.substring(0,30) + ' = ' + (sel.includes('password') ? '***' : val));
        }
      } catch(e) {}
    }

    await shot(popup, 'step2-filled');

    // Check if there's email verification code input
    const codeInput = await popup.$('input[maxlength="6"], [placeholder*="code" i], [placeholder*="código" i], [placeholder*="verification" i]');
    if (codeInput) {
      log('📧 VERIFICAÇÃO DE EMAIL DETECTADA — código precisa ser inserido manualmente');
      log('   Verifique: ' + EMAIL);
      await shot(popup, 'verification-needed');
    }

    // Wait for manual completion
    log('⏳ Aguardando 90s para interação manual...');
    for (let i = 0; i < 18; i++) {
      await popup.waitForTimeout(5000);
      if (i % 4 === 0) {
        await shot(popup, `wait-${(i+1)*5}s`);
        console.log(`⏳ ${(i+1)*5}s / 90s`);
      }
    }

    await shot(popup, 'final');
    log('URL final: ' + popup.url());

  } catch(e) {
    log('❌ ERRO: ' + e.message.substring(0, 120));
    try { await mainPage.screenshot({ path: path.join(OUTDIR, 'error.png') }); } catch(e2) {}
  } finally {
    await b.close();
    log('🏁 AWS Builder ID v2 finalizado\n');
  }
})();
