/**
 * Victor Capital — AWS Builder ID + Activate Credits
 * Fluxo: sign-up → Criar ID do builder → preencher perfil → solicitar créditos
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-builder';
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
  log('\n---\n## AWS Builder ID + Activate — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  try {
    // 1. Página de sign-up AWS Startups
    await page.goto('https://aws.amazon.com/startups/sign-up', {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(4000);
    try { await page.click('button:has-text("Aceitar"), button:has-text("Accept")', { timeout: 3000 }); } catch(e) {}
    await page.waitForTimeout(1000);
    await shot(page, 'signup-page');
    log('URL: ' + page.url());

    // Clicar "Criar ID do builder"
    let builderIdClicked = false;
    for (const sel of [
      'button:has-text("Criar ID do builder")',
      'a:has-text("Criar ID do builder")',
      'button:has-text("Create your AWS Builder ID")',
      'button:has-text("Create Builder ID")',
      'a[href*="builder"]',
      'button:visible:first-of-type',
    ]) {
      try {
        const el = await page.$(sel);
        if (el && await el.isVisible()) {
          const txt = await el.innerText().catch(() => '');
          log('🔘 Clicando: "' + txt.trim() + '"');
          await el.click();
          builderIdClicked = true;
          break;
        }
      } catch(e) {}
    }

    if (!builderIdClicked) {
      log('⚠️ Botão Builder ID não encontrado — mapeando...');
      const allBtns = await page.$$eval('button, a', els =>
        els.filter(e => e.offsetParent !== null && e.innerText.trim()).map(e => ({
          text: e.innerText.trim().substring(0,50), href: (e.href||''), tag: e.tagName
        }))
      );
      log('Botões visíveis: ' + JSON.stringify(allBtns.slice(0,15)));
    }

    await page.waitForTimeout(4000);
    await shot(page, 'after-builder-click');
    log('URL após Builder ID: ' + page.url());

    // Aguardar possível navegação para builder.aws.amazon.com ou similar
    const newUrl = page.url();

    if (newUrl.includes('builder') || newUrl.includes('signup') || newUrl.includes('register')) {
      log('✅ Entrou em fluxo de criação de conta Builder ID');

      // Preencher nome
      for (const sel of ['[placeholder*="name" i]', '[id*="name" i]', '[name*="name" i]']) {
        try {
          const el = await page.$(sel);
          if (el && await el.isVisible()) {
            await el.fill(NAME);
            log('✅ Nome: ' + NAME);
            break;
          }
        } catch(e) {}
      }

      // Preencher email
      for (const sel of ['[type="email"]', '[id*="email" i]', '[name*="email" i]', '[placeholder*="email" i]']) {
        try {
          const el = await page.$(sel);
          if (el && await el.isVisible()) {
            await el.fill(EMAIL);
            log('✅ Email: ' + EMAIL);
            break;
          }
        } catch(e) {}
      }

      // Preencher senha
      for (const sel of ['[type="password"]', '[id*="password" i]']) {
        try {
          const el = await page.$(sel);
          if (el && await el.isVisible()) {
            await el.fill(PASS);
            log('✅ Senha preenchida');
            break;
          }
        } catch(e) {}
      }

      await shot(page, 'builder-form-filled');

      // Mapear campos reais
      const fields = await page.$$eval(
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), select, textarea',
        els => els.map(e => ({ type: e.type, id: e.id, name: e.name, ph: e.placeholder.substring(0,30), val: e.value.substring(0,20) }))
      );
      log('Campos: ' + JSON.stringify(fields));

      log('⏳ Aguardando 120s para completar verificação / CAPTCHA / email...');
      await page.waitForTimeout(120000);
      await shot(page, 'after-wait');
      log('URL após espera: ' + page.url());

    } else {
      log('ℹ️ Não entrou em fluxo de Builder ID. Página atual:');
      const title = await page.title();
      log('Title: ' + title);

      // Scroll para ver o conteúdo
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(1000);
      await shot(page, 'page-content');

      // Mapear todos os botões visíveis
      const visibleBtns = await page.$$eval('button:visible, a:visible', els =>
        els.filter(e => e.innerText.trim()).map(e => ({
          text: e.innerText.trim().substring(0,50),
          href: (e.href||'').substring(0,80)
        })).slice(0,20)
      );
      log('Botões/links visíveis: ' + JSON.stringify(visibleBtns));

      await page.waitForTimeout(20000);
      await shot(page, 'final-state');
    }

    await shot(page, 'end');
    log('✅ AWS Builder ID script concluído. URL: ' + page.url());

  } catch(e) {
    log('❌ ERRO AWS Builder: ' + e.message);
    await shot(page, 'error').catch(() => {});
  } finally {
    await b.close();
    log('🏁 AWS Builder ID finalizado — ' + new Date().toISOString() + '\n');
  }
})();
