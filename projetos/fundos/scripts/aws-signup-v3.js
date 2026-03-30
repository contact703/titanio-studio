/**
 * Victor Capital — AWS Builder ID — v3 (full flow with name + continue clicks)
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-v3';
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
  log('\n---\n## AWS Builder ID v3 — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const mainPage = await ctx.newPage();
  mainPage.setDefaultTimeout(30000);

  try {
    // 1. Open sign-up page
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

    // 3. Accept cookies in popup
    try { await popup.click('button:has-text("Aceitar")', { timeout: 4000 }); log('✅ Cookies popup'); } catch(e) {}
    await popup.waitForTimeout(1500);
    await shot(popup, 'popup-clean');

    // 4. Fill email
    const emailInput = await popup.$('input[type="text"]:not([type="hidden"]):not([type="checkbox"]), input[type="email"]');
    if (emailInput) {
      await emailInput.fill(EMAIL);
      log('✅ Email: ' + EMAIL);
    }
    await popup.waitForTimeout(500);

    // 5. Click "Continuar"
    await popup.click('button:has-text("Continuar"), button:has-text("Continue")', { timeout: 5000 });
    log('✅ Clicou Continuar (step 1)');
    await popup.waitForTimeout(3000);
    await shot(popup, 'name-page');
    log('URL: ' + popup.url());

    // 6. Fill name field
    const nameInput = await popup.$('input[type="text"]:not([type="hidden"]):not([type="checkbox"]), input[placeholder*="nome" i], input[placeholder*="name" i]');
    if (nameInput) {
      await nameInput.fill(NAME);
      log('✅ Nome: ' + NAME);
    }
    await popup.waitForTimeout(500);
    await shot(popup, 'name-filled');

    // 7. Click "Continuar" again
    await popup.click('button:has-text("Continuar"), button:has-text("Continue")', { timeout: 5000 });
    log('✅ Clicou Continuar (step 2)');
    await popup.waitForTimeout(4000);
    await shot(popup, 'after-name');
    log('URL: ' + popup.url());

    // 8. Check what's next — could be email verification, password, etc.
    const fields = await popup.$$eval('input:not([type="hidden"]):not([type="checkbox"])', els =>
      els.map(e => ({ type: e.type, id: e.id, ph: e.placeholder.substring(0,40), val: e.value.substring(0,20) }))
    );
    log('Campos: ' + JSON.stringify(fields));

    // If email verification code field
    const codeField = fields.find(f => f.ph.toLowerCase().includes('code') || f.ph.toLowerCase().includes('código') || f.ph.toLowerCase().includes('verif'));
    if (codeField) {
      log('');
      log('═══════════════════════════════════════════════');
      log('📧 VERIFICAÇÃO DE EMAIL — código necessário!');
      log('   Verifique: ' + EMAIL);
      log('   Insira o código no browser manualmente');
      log('   Aguardando 180s...');
      log('═══════════════════════════════════════════════');
      log('');
      
      for (let i = 0; i < 36; i++) {
        await popup.waitForTimeout(5000);
        const url = popup.url();
        if (!url.includes('enter-email') && !url.includes('verify')) {
          log('✅ Avançou! URL: ' + url);
          break;
        }
        if (i % 6 === 0) {
          await shot(popup, `verify-wait-${(i+1)*5}s`);
          console.log(`⏳ ${(i+1)*5}s / 180s`);
        }
      }
    }

    // If password field
    const pwdField = fields.find(f => f.type === 'password');
    if (pwdField) {
      const pwds = await popup.$$('[type="password"]');
      for (const pwd of pwds) {
        await pwd.fill(PASS);
      }
      log('✅ Senha preenchida');
      await shot(popup, 'pwd-filled');
      
      // Click continue/submit
      try {
        await popup.click('button:has-text("Continuar"), button:has-text("Continue"), button[type="submit"]', { timeout: 5000 });
        log('✅ Clicou Continuar (password)');
      } catch(e) {}
    }

    await popup.waitForTimeout(3000);
    await shot(popup, 'step3');
    log('URL step3: ' + popup.url());

    // Map what we see now
    const fields3 = await popup.$$eval('input:not([type="hidden"]):not([type="checkbox"])', els =>
      els.map(e => ({ type: e.type, id: e.id, ph: e.placeholder.substring(0,40), val: e.value.substring(0,20) }))
    ).catch(() => []);
    log('Campos step3: ' + JSON.stringify(fields3));

    // Wait for any manual steps
    log('⏳ Aguardando 60s para completar...');
    for (let i = 0; i < 12; i++) {
      await popup.waitForTimeout(5000);
      if (i % 4 === 0) {
        await shot(popup, `final-wait-${(i+1)*5}s`);
        console.log(`⏳ ${(i+1)*5}s / 60s`);
      }
    }
    
    await shot(popup, 'final');
    log('URL final: ' + popup.url());

  } catch(e) {
    log('❌ ERRO: ' + e.message.substring(0, 150));
    try { await mainPage.screenshot({ path: path.join(OUTDIR, 'error.png') }); } catch(e2) {}
  } finally {
    await b.close();
    log('🏁 AWS Builder ID v3 finalizado\n');
  }
})();
