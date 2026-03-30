/**
 * Victor Capital — NVIDIA Inception — Clicar Sign Up / Login
 * Email: tiago@titaniofilms.com
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-phoenix';
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const LOG_FILE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

let step = 10; // Continua numeração anterior
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

(async () => {
  log('\n### NVIDIA Inception — Sign Up Submit — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 600 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(35000);

  try {
    await page.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(4000);

    // Aceitar cookies
    try { await page.click('button:has-text("Accept All")', { timeout: 3000 }); } catch(e) {}
    await page.waitForTimeout(1500);

    // Preencher email
    await page.fill('#input-30', 'tiago@titaniofilms.com');
    log('✅ Email preenchido: tiago@titaniofilms.com');
    await page.waitForTimeout(1000);
    await shot(page, 'email-filled');

    // Clicar Sign Up / Login (botão verde)
    // Tentar múltiplos seletores
    let clicked = false;
    const signupSelectors = [
      'button:has-text("Sign Up / Login")',
      'button:has-text("Sign Up")',
      'button:has-text("Login")',
      'button[type="submit"]',
      '.slds-button.slds-button_brand',
      'button.slds-button_brand',
      'lightning-button button',
    ];

    for (const sel of signupSelectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          const txt = await el.innerText().catch(() => '');
          log(`🔘 Tentando clicar: "${txt.trim()}" (${sel.substring(0,50)})`);
          await el.click();
          clicked = true;
          log('✅ Clicou com sucesso!');
          break;
        }
      } catch(e) {
        log(`⚠️ ${sel.substring(0,40)}: ${e.message.substring(0,50)}`);
      }
    }

    if (!clicked) {
      // Tentar via JavaScript
      log('🔧 Tentando click via JS...');
      const jsClicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText.includes('Sign Up') || b.innerText.includes('Login'));
        if (btn) { btn.click(); return btn.innerText; }
        return null;
      });
      if (jsClicked) {
        log('✅ JS click: ' + jsClicked.trim());
        clicked = true;
      }
    }

    await page.waitForTimeout(5000);
    await shot(page, 'after-signup-click');
    log('URL após click: ' + page.url());
    log('Title: ' + await page.title());

    // Verificar se abriu nova página / popup
    const pages = ctx.pages();
    log(`Páginas abertas: ${pages.length}`);

    // Aguardar redirecionamento / formulário seguinte
    await page.waitForTimeout(5000);
    await shot(page, 'step2');
    log('URL step2: ' + page.url());

    // Mapear novos campos que apareceram
    const inputs2 = await page.$$eval(
      'input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]), select, textarea',
      els => els.map(e => ({
        type: e.type || '', id: e.id || '', name: e.name || '',
        placeholder: (e.placeholder||'').substring(0,40),
        value: (e.value||'').substring(0,30)
      }))
    );
    log('📋 Campos step2: ' + JSON.stringify(inputs2));

    // Se formulário de cadastro apareceu, preencher
    const DATA = {
      firstName: 'Tiago', lastName: 'Affonso',
      password: 'TitanioAI2026!',
      company: 'Titanio Studio',
      website: 'https://titaniofilms.com',
    };

    for (const [sel, val] of [
      ['[id*="firstName" i], [name*="first" i], [placeholder*="First name" i]', DATA.firstName],
      ['[id*="lastName" i], [name*="last" i], [placeholder*="Last name" i]', DATA.lastName],
      ['[id*="password" i], [type="password"]', DATA.password],
      ['[id*="company" i], [name*="company" i], [placeholder*="company" i]', DATA.company],
      ['[id*="website" i], [name*="website" i], [placeholder*="website" i]', DATA.website],
    ]) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.fill(val);
          const id = await el.getAttribute('id') || sel.substring(0,25);
          log(`✅ ${id} = ${val}`);
        }
      } catch(e) {}
    }

    await shot(page, 'step2-filled');

    // Aguardar interação manual se necessário (email de verificação, CAPTCHA, etc.)
    log('⏳ Aguardando 60s para análise / ação manual...');
    await page.waitForTimeout(60000);

    await shot(page, 'final');
    log('📌 NVIDIA — ver screenshots: ' + OUTDIR);

  } catch(e) {
    log('❌ ERRO NVIDIA: ' + e.message);
    await shot(page, 'error').catch(() => {});
  } finally {
    await b.close();
    log('🏁 Script NVIDIA finalizado\n');
  }
})();
