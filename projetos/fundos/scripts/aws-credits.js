/**
 * Victor Capital — AWS Activate Credits
 * URL correta: https://aws.amazon.com/startups/credits
 * E signup: https://aws.amazon.com/startups/sign-up
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-credits';
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

(async () => {
  log('\n---\n## AWS Credits — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  try {
    // 1. Ir para página de créditos AWS
    log('🟠 Abrindo AWS Startups Credits...');
    await page.goto('https://aws.amazon.com/startups/credits', {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(4000);
    try { await page.click('button:has-text("Aceitar")', { timeout: 3000 }); } catch(e) {}
    await shot(page, 'credits-page');
    log('URL: ' + page.url());
    log('Title: ' + await page.title());

    // Mapear CTAs
    const ctas = await page.$$eval('a:not([href="#"]), button', els =>
      els.filter(e => e.offsetParent !== null && e.innerText.trim()).map(e => ({
        text: e.innerText.trim().substring(0,60),
        href: (e.href||'').substring(0,100),
        tag: e.tagName
      }))
    );
    console.log('CTAs credits page:', JSON.stringify(ctas.slice(0, 25), null, 2));
    log('CTAs: ' + JSON.stringify(ctas.filter(c => /apply|credit|sign|inscrever|ativar|activate|get/i.test(c.text + c.href)).slice(0,10)));

    await shot(page, 'credits-full');

    // Ir para sign-up
    log('\n🔗 Indo para sign-up AWS Startups...');
    await page.goto('https://aws.amazon.com/startups/sign-up', {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(4000);
    await shot(page, 'signup-page');
    log('URL signup: ' + page.url());
    log('Title: ' + await page.title());

    // Mapear formulário
    const formEls = await page.$$eval(
      'input:not([type="hidden"]):not([type="submit"]), select, textarea',
      els => els.map(e => ({
        type: e.type||'', id: e.id||'', name: e.name||'',
        placeholder: (e.placeholder||'').substring(0,40),
        label: (e.getAttribute('aria-label')||'').substring(0,40)
      }))
    );
    log('Formulário signup: ' + JSON.stringify(formEls));
    await shot(page, 'signup-form');

    // Aguardar 20s para análise visual
    await page.waitForTimeout(20000);
    await shot(page, 'signup-20s');

    // Tentar preencher campos comuns
    const fieldMap = [
      ['[type="email"], [id*="email" i], [name*="email" i]', 'tiago@titaniofilms.com'],
      ['[id*="firstName" i], [name*="first" i], [placeholder*="First" i]', 'Tiago'],
      ['[id*="lastName" i], [name*="last" i], [placeholder*="Last" i]', 'Affonso'],
      ['[id*="company" i], [name*="company" i]', 'Titanio Studio'],
      ['[id*="website" i], [name*="website" i]', 'https://titaniofilms.com'],
    ];

    for (const [sel, val] of fieldMap) {
      try {
        const el = await page.$(sel);
        if (el && await el.isVisible()) {
          await el.fill(val);
          log('✅ ' + sel.substring(0,30) + ' = ' + val);
        }
      } catch(e) {}
    }

    await shot(page, 'fields-filled');
    await page.waitForTimeout(20000);
    await shot(page, 'final');
    log('URL final AWS: ' + page.url());

  } catch(e) {
    log('❌ ERRO AWS Credits: ' + e.message);
    await shot(page, 'error').catch(() => {});
  } finally {
    await b.close();
    log('🏁 AWS Credits script finalizado\n');
  }
})();
