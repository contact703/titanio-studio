/**
 * Victor Capital — AWS Builder ID via Popup
 * O clique abre nova aba em signin.aws — precisamos gerenciar ela
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-popup';
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
const NAME  = 'Tiago Affonso';

(async () => {
  log('\n---\n## AWS Builder ID via Popup — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 600 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const mainPage = await ctx.newPage();
  mainPage.setDefaultTimeout(30000);

  try {
    await mainPage.goto('https://aws.amazon.com/startups/sign-up', {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await mainPage.waitForTimeout(4000);
    try { await mainPage.click('button:has-text("Aceitar")', { timeout: 3000 }); } catch(e) {}
    await mainPage.waitForTimeout(1000);
    await shot(mainPage, 'signup-page');

    // Aguardar popup quando clicar
    const [popup] = await Promise.all([
      ctx.waitForEvent('page', { timeout: 15000 }),
      mainPage.click('button:has-text("Criar ID do builder")'),
    ]);

    log('✅ Popup aberto: ' + popup.url());
    await popup.waitForLoadState('domcontentloaded');
    await popup.waitForTimeout(3000);
    await popup.screenshot({ path: path.join(OUTDIR, '02-popup-loaded.png') });
    log('Popup URL: ' + popup.url());

    // Aguardar URL de signin
    if (!popup.url().includes('signin')) {
      await popup.waitForURL('**/signin**', { timeout: 10000 }).catch(() => {});
      await popup.waitForTimeout(2000);
    }
    await popup.screenshot({ path: path.join(OUTDIR, '03-popup-signin.png') });
    log('Popup após redirect: ' + popup.url());

    // Mapear campos do formulário no popup
    const popupFields = await popup.$$eval(
      'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])',
      els => els.map(e => ({ type: e.type, id: e.id, name: e.name, ph: e.placeholder.substring(0,40) }))
    );
    log('Campos no popup: ' + JSON.stringify(popupFields));

    // Verificar se há link "Create Account" / "Criar Conta"
    const createLinks = await popup.$$eval('a, button', els =>
      els.filter(e => e.offsetParent !== null).map(e => ({
        text: e.innerText.trim().substring(0,50),
        href: (e.href||'').substring(0,80)
      })).filter(e => /create|sign up|register|criar|registrar/i.test(e.text))
    );
    log('Links criar conta: ' + JSON.stringify(createLinks));

    // Preencher email no campo de login (pode ser para criar conta)
    try {
      // Campo principal de username/email
      const emailInput = await popup.$('#formField14-1773928181320-2717, [type="text"], [placeholder*="email" i], [placeholder*="username" i]');
      if (emailInput) {
        await emailInput.fill(EMAIL);
        log('✅ Email/username preenchido: ' + EMAIL);
      }
    } catch(e) {
      log('⚠️ Campo email não encontrado: ' + e.message.substring(0,60));
    }

    await popup.screenshot({ path: path.join(OUTDIR, '04-email-filled.png') });

    // Verificar se há botão "Create account" vs "Sign In"
    const btnsPopup = await popup.$$eval('button', btns =>
      btns.filter(b => b.offsetParent !== null).map(b => ({
        text: b.innerText.trim().substring(0,50),
        type: b.type,
        id: b.id,
        class: b.className.substring(0,60)
      }))
    );
    log('Botões no popup: ' + JSON.stringify(btnsPopup));

    // Procurar botão "Create Account" ou "Cadastrar"
    for (const [txt, desc] of [
      ['create', 'Create Account'],
      ['criar', 'Criar Conta'],
      ['register', 'Register'],
      ['next', 'Next'],
      ['continuar', 'Continuar'],
    ]) {
      try {
        const btn = await popup.$(`button:has-text("${txt}"), a:has-text("${txt}")`);
        if (btn && await btn.isVisible()) {
          const btnTxt = await btn.innerText().catch(() => '');
          log('🔘 Clicando: "' + btnTxt.trim() + '"');
          await btn.click();
          break;
        }
      } catch(e) {}
    }

    await popup.waitForTimeout(3000);
    await popup.screenshot({ path: path.join(OUTDIR, '05-after-next.png') });
    log('URL após next: ' + popup.url());

    // Verificar se há campo de senha ou criação de conta
    const step2Fields = await popup.$$eval(
      'input:not([type="hidden"]):not([type="checkbox"])',
      els => els.map(e => ({ type: e.type, id: e.id, ph: e.placeholder.substring(0,30) }))
    );
    log('Campos step2: ' + JSON.stringify(step2Fields));

    if (step2Fields.some(f => f.type === 'password')) {
      log('✅ Campo de senha encontrado — criar nova conta ou fazer login');
      const pwdEl = await popup.$('[type="password"]');
      if (pwdEl) {
        await pwdEl.fill(PASS);
        log('✅ Senha preenchida');
      }
    }

    await popup.screenshot({ path: path.join(OUTDIR, '06-state.png') });

    log('');
    log('═══════════════════════════════════════════════');
    log('⚠️  AÇÃO MANUAL POSSÍVEL NECESSÁRIA!');
    log('   O browser está aberto com o popup do AWS Builder ID.');
    log('   Verifique e complete o cadastro manualmente se necessário.');
    log('   Aguardando 120s...');
    log('═══════════════════════════════════════════════');
    log('');

    // Monitorar progresso por 120s
    for (let i = 0; i < 24; i++) {
      await popup.waitForTimeout(5000);
      const currentUrl = popup.url();
      if (currentUrl.includes('profile') || currentUrl.includes('activate') || currentUrl.includes('complete')) {
        log(`✅ Avançou! URL: ${currentUrl}`);
        break;
      }
      if (i % 4 === 0) {
        console.log(`⏳ ${(i+1)*5}s / 120s — URL: ${currentUrl.substring(0,60)}`);
        await popup.screenshot({ path: path.join(OUTDIR, `wait-${(i+1)*5}s.png`) });
      }
    }

    await popup.screenshot({ path: path.join(OUTDIR, 'final-popup.png') });
    log('URL final popup: ' + popup.url());
    log('✅ AWS Popup script concluído. Screenshots: ' + OUTDIR);

  } catch(e) {
    log('❌ ERRO AWS Popup: ' + e.message);
    await mainPage.screenshot({ path: path.join(OUTDIR, 'error.png') }).catch(() => {});
  } finally {
    await b.close();
    log('🏁 AWS Popup script finalizado — ' + new Date().toISOString() + '\n');
  }
})();
