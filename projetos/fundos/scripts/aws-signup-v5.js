/**
 * Victor Capital — AWS Builder ID v5
 * Fix: find name field by dynamic ID pattern, use dispatchEvent for React
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-v5';
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
  log('\n---\n## AWS Builder ID v5 — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const mainPage = await ctx.newPage();
  mainPage.setDefaultTimeout(30000);

  try {
    await mainPage.goto('https://aws.amazon.com/startups/sign-up', { waitUntil: 'domcontentloaded' });
    await mainPage.waitForTimeout(3000);
    try { await mainPage.click('button:has-text("Aceitar")', { timeout: 3000 }); } catch(e) {}
    await mainPage.waitForTimeout(1000);

    const [popup] = await Promise.all([
      ctx.waitForEvent('page', { timeout: 15000 }),
      mainPage.click('button:has-text("Criar ID do builder")'),
    ]);
    log('✅ Popup aberto');
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForTimeout(3000);
    try { await popup.click('button:has-text("Aceitar")', { timeout: 4000 }); } catch(e) {}
    await popup.waitForTimeout(1500);

    // Fill email using locator
    await popup.locator('input[id^="formField"]').first().fill(EMAIL);
    log('✅ Email: ' + EMAIL);
    await popup.waitForTimeout(500);

    // Continue
    await popup.locator('button:has-text("Continuar")').click();
    log('✅ Continuar (email)');
    await popup.waitForTimeout(4000);
    await shot(popup, 'name-page');
    log('URL: ' + popup.url());

    // Now on name page — find the input by formField ID pattern
    // Use locator which works with dynamic IDs
    const nameLocator = popup.locator('input[id^="formField"]').first();
    await nameLocator.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click into the field first
    await nameLocator.click();
    await popup.waitForTimeout(200);
    
    // Use fill — this should work with Playwright's input simulation
    await nameLocator.fill(NAME);
    await popup.waitForTimeout(300);
    
    // Verify
    const nameValue = await nameLocator.inputValue();
    log('Nome value after fill: "' + nameValue + '"');
    
    if (!nameValue) {
      // Fallback: use keyboard
      log('⚠️ Fill falhou — tentando keyboard...');
      await nameLocator.click({ clickCount: 3 }); // select all
      await popup.keyboard.type(NAME, { delay: 50 });
      await popup.waitForTimeout(300);
      const nameValue2 = await nameLocator.inputValue();
      log('Nome value after keyboard: "' + nameValue2 + '"');
    }
    
    await shot(popup, 'name-filled');

    // Click Continue
    await popup.locator('button:has-text("Continuar")').click();
    log('✅ Continuar (nome)');
    await popup.waitForTimeout(4000);
    await shot(popup, 'after-name');
    log('URL: ' + popup.url());

    // Map next step
    const allInputs = await popup.$$eval('input:not([type="hidden"]):not([type="checkbox"])', els =>
      els.map(e => ({ type: e.type, id: e.id, ph: e.placeholder.substring(0,40), val: e.value.substring(0,20) }))
    );
    log('Next fields: ' + JSON.stringify(allInputs));

    // Handle verification code
    if (popup.url().includes('verify') || popup.url().includes('confirmation') || 
        allInputs.some(f => /code|código|verif/i.test(f.ph))) {
      log('');
      log('📧 VERIFICAÇÃO DE EMAIL NECESSÁRIA!');
      log('   Verifique: ' + EMAIL);
      log('   Aguardando até 180s...');
      log('');
      
      for (let i = 0; i < 36; i++) {
        await popup.waitForTimeout(5000);
        const currentUrl = popup.url();
        // Check if advanced past verification
        if (!currentUrl.includes('verify') && !currentUrl.includes('enter-email') && !currentUrl.includes('confirmation')) {
          log('✅ Verificação concluída! URL: ' + currentUrl);
          break;
        }
        if (i % 6 === 0) {
          await shot(popup, `verify-${(i+1)*5}s`);
          console.log(`⏳ ${(i+1)*5}s`);
        }
      }
    }

    // Handle password
    const pwdInputs = await popup.$$('[type="password"]');
    if (pwdInputs.length > 0) {
      for (const pwd of pwdInputs) {
        await pwd.fill(PASS);
      }
      log('✅ Senha(s) preenchida(s)');
      await shot(popup, 'pwd');
      await popup.locator('button:has-text("Continuar")').click().catch(() => {});
      await popup.waitForTimeout(4000);
    }

    await shot(popup, 'state');
    log('Estado: ' + popup.url());

    // Wait for completion
    log('⏳ 60s finais...');
    for (let i = 0; i < 12; i++) {
      await popup.waitForTimeout(5000);
      if (i % 4 === 0) {
        await shot(popup, `final-${(i+1)*5}s`);
        console.log(`⏳ ${(i+1)*5}s`);
      }
    }
    
    await shot(popup, 'final');
    log('URL final: ' + popup.url());

  } catch(e) {
    log('❌ ERRO: ' + e.message.substring(0, 150));
  } finally {
    await b.close();
    log('🏁 AWS v5 finalizado\n');
  }
})();
