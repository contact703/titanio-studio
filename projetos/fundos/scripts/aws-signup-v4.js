/**
 * Victor Capital — AWS Builder ID v4
 * Fix: use click + type instead of fill for React fields
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-v4';
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

async function reactFill(page, selector, value) {
  const el = await page.$(selector);
  if (!el) throw new Error('Element not found: ' + selector);
  await el.click();
  await page.waitForTimeout(200);
  // Select all existing text and replace
  await el.fill('');
  await page.waitForTimeout(100);
  // Type character by character to trigger React onChange
  await el.type(value, { delay: 50 });
  await page.waitForTimeout(300);
  return true;
}

const EMAIL = 'tiago@titaniofilms.com';
const PASS  = 'TitanioAI2026!';
const NAME  = 'Tiago Affonso';

(async () => {
  log('\n---\n## AWS Builder ID v4 — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const mainPage = await ctx.newPage();
  mainPage.setDefaultTimeout(30000);

  try {
    // 1. Sign-up page
    await mainPage.goto('https://aws.amazon.com/startups/sign-up', { waitUntil: 'domcontentloaded' });
    await mainPage.waitForTimeout(3000);
    try { await mainPage.click('button:has-text("Aceitar")', { timeout: 3000 }); } catch(e) {}
    await mainPage.waitForTimeout(1000);

    // 2. Open popup
    const [popup] = await Promise.all([
      ctx.waitForEvent('page', { timeout: 15000 }),
      mainPage.click('button:has-text("Criar ID do builder")'),
    ]);
    log('✅ Popup aberto');
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForTimeout(3000);
    try { await popup.click('button:has-text("Aceitar")', { timeout: 4000 }); log('✅ Cookies'); } catch(e) {}
    await popup.waitForTimeout(1500);

    // 3. Fill email using type (not fill)
    const emailInput = await popup.$('input[type="text"]:not([type="hidden"]):not([type="checkbox"]), input[type="email"]');
    if (emailInput) {
      await emailInput.click();
      await emailInput.type(EMAIL, { delay: 30 });
      log('✅ Email typed: ' + EMAIL);
    }
    await popup.waitForTimeout(500);
    await shot(popup, 'email-typed');

    // 4. Click Continue
    await popup.click('button:has-text("Continuar")', { timeout: 5000 });
    log('✅ Continuar (email)');
    await popup.waitForTimeout(4000);
    await shot(popup, 'after-email-continue');
    log('URL: ' + popup.url());

    // 5. Now we should be on name page — use type not fill
    const nameInput = await popup.$('input[type="text"]:not([type="hidden"]):not([type="checkbox"])');
    if (nameInput) {
      await nameInput.click();
      await popup.waitForTimeout(200);
      // Clear any existing text
      await nameInput.press('Meta+a');
      await popup.waitForTimeout(100);
      await nameInput.type(NAME, { delay: 50 });
      log('✅ Nome typed: ' + NAME);
    } else {
      log('⚠️ Nome field não encontrado');
    }
    await popup.waitForTimeout(500);
    await shot(popup, 'name-typed');

    // Verify the value was set
    const nameVal = await popup.$$eval('input[type="text"]:not([type="hidden"]):not([type="checkbox"])', els => 
      els.map(e => ({ id: e.id, val: e.value, ph: e.placeholder.substring(0,30) }))
    );
    log('Nome field values: ' + JSON.stringify(nameVal));

    // 6. Click Continue (name)
    await popup.click('button:has-text("Continuar")', { timeout: 5000 });
    log('✅ Continuar (nome)');
    await popup.waitForTimeout(4000);
    await shot(popup, 'after-name-continue');
    log('URL: ' + popup.url());

    // 7. Check what's next
    const fields = await popup.$$eval('input:not([type="hidden"]):not([type="checkbox"])', els =>
      els.map(e => ({ type: e.type, id: e.id, ph: e.placeholder.substring(0,40) }))
    );
    log('Next fields: ' + JSON.stringify(fields));

    // Handle email verification
    if (popup.url().includes('verify') || fields.some(f => f.ph.toLowerCase().includes('code') || f.ph.toLowerCase().includes('código'))) {
      log('📧 VERIFICAÇÃO DE EMAIL!');
      log('   Email: ' + EMAIL);
      log('   Aguardando código de verificação...');
      
      // Check if we can read verification email
      log('⏳ Aguardando 180s para verificação manual do email...');
      for (let i = 0; i < 36; i++) {
        await popup.waitForTimeout(5000);
        const url = popup.url();
        if (!url.includes('verify') && !url.includes('enter-email') && url !== 'about:blank') {
          log('✅ Avançou! URL: ' + url);
          break;
        }
        if (i % 6 === 0) {
          await shot(popup, `verify-${(i+1)*5}s`);
          console.log(`⏳ ${(i+1)*5}s / 180s — ${url.substring(0,60)}`);
        }
      }
    }

    // Handle password
    if (fields.some(f => f.type === 'password')) {
      const pwds = await popup.$$('[type="password"]');
      for (const pwd of pwds) {
        await pwd.click();
        await pwd.type(PASS, { delay: 30 });
      }
      log('✅ Senha preenchida');
      await shot(popup, 'password-filled');
      await popup.click('button:has-text("Continuar"), button[type="submit"]', { timeout: 5000 });
      log('✅ Continuar (senha)');
      await popup.waitForTimeout(4000);
    }

    await shot(popup, 'step-next');
    log('URL: ' + popup.url());

    // Keep waiting for manual completion
    log('⏳ Aguardando 60s finais...');
    for (let i = 0; i < 12; i++) {
      await popup.waitForTimeout(5000);
      if (i % 4 === 0) {
        await shot(popup, `wait-${(i+1)*5}s`);
        console.log(`⏳ ${(i+1)*5}s / 60s`);
      }
    }

    await shot(popup, 'final');
    log('URL final: ' + popup.url());

  } catch(e) {
    log('❌ ERRO: ' + e.message.substring(0, 150));
  } finally {
    await b.close();
    log('🏁 AWS v4 finalizado\n');
  }
})();
