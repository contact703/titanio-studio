/**
 * Victor Capital — AWS Activate Founders
 * URL: https://aws.amazon.com/startups/learn-more/
 * Objetivo: Chegar no formulário de aplicação e preencher dados Titanio Studio
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-final';
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

const DATA = {
  firstName:   'Tiago',
  lastName:    'Affonso',
  email:       'tiago@titaniofilms.com',
  company:     'Titanio Studio',
  website:     'https://titaniofilms.com',
  country:     'Brazil',
  stage:       'Early Stage',
  employees:   '1-10',
  description: 'Titanio Studio builds AI-powered accessibility tools for Brazil. VoxDescriber automates audio description for 6.5 million visually impaired Brazilians using on-device AI (WhisperX, Qwen2.5-VL, Piper TTS), fully compliant with NBR 15290. We are pre-revenue, bootstrapped, seeking cloud infrastructure to scale our AI pipeline.',
  awsUse:      'EC2 for model inference, S3 for media storage, Polly for TTS fallback, Lambda for API endpoints. AWS credits enable us to test cloud deployment at scale before committing to paid plans.',
};

(async () => {
  log('\n---\n## AWS Activate — Script Full — ' + new Date().toISOString());

  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  try {
    log('🟠 Navegando para AWS Activate...');
    await page.goto('https://aws.amazon.com/startups/learn-more/', {
      waitUntil: 'domcontentloaded', timeout: 30000
    });
    await page.waitForTimeout(4000);
    await shot(page, 'loaded');
    log('URL: ' + page.url());
    log('Title: ' + await page.title());

    // Mapear CTAs na página
    const ctas = await page.$$eval('a, button', els => 
      els.filter(e => e.offsetParent !== null).map(e => ({
        text: e.innerText.trim().substring(0,50),
        href: (e.href || '').substring(0,80),
        tag: e.tagName
      })).filter(e => e.text)
    );
    log('CTAs visíveis: ' + JSON.stringify(ctas.slice(0, 20)));

    // Procurar link de aplicação
    const applyLinks = ctas.filter(c => 
      /apply|activate|get credit|sign up|start/i.test(c.text) ||
      /activate|apply/i.test(c.href)
    );
    log('Links de aplicação: ' + JSON.stringify(applyLinks));

    // Tentar clicar no CTA principal
    let clicked = false;
    for (const [sel, desc] of [
      ['a:has-text("Apply now")', 'Apply now'],
      ['a:has-text("Apply")', 'Apply'],
      ['a:has-text("Get started")', 'Get started'],
      ['a:has-text("Get credits")', 'Get credits'],
      ['a[href*="activate"]', 'activate link'],
      ['a[href*="apply"]', 'apply link'],
      ['button:has-text("Apply")', 'button Apply'],
    ]) {
      try {
        const el = await page.$(sel);
        if (el && await el.isVisible()) {
          const href = await el.getAttribute('href') || '';
          const txt = await el.innerText().catch(() => '');
          log(`🔗 Clicando: "${txt.trim()}" → ${href.substring(0,60)}`);
          await el.click();
          clicked = true;
          break;
        }
      } catch(e) {}
    }

    if (!clicked) {
      log('⚠️ CTA não encontrado na página principal — tentando URL direta');
      // Tentar URL direta do AWS Activate
      await page.goto('https://activate.aws.amazon.com/', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(async () => {
        await page.goto('https://aws.amazon.com/activate/', { waitUntil: 'domcontentloaded', timeout: 20000 });
      });
    }

    await page.waitForTimeout(4000);
    await shot(page, 'after-cta');
    log('URL após CTA: ' + page.url());

    // Se redirecionou para /activate ou formulário
    const urlNow = page.url();
    log('URL atual: ' + urlNow);

    // Mapear formulário se existir
    const formInputs = await page.$$eval(
      'input:not([type="hidden"]):not([type="submit"]), select, textarea',
      els => els.map(e => ({
        tag: e.tagName, type: e.type||'', id: e.id||'',
        name: e.name||'', placeholder: (e.placeholder||'').substring(0,40),
        label: (e.getAttribute('aria-label')||'').substring(0,40)
      }))
    );
    log('Campos formulário: ' + JSON.stringify(formInputs));

    await shot(page, 'form-state');

    // Tentar preencher campos
    for (const [sels, val] of [
      [['[id*="firstName" i]','[name*="first" i]','[placeholder*="First" i]'], DATA.firstName],
      [['[id*="lastName" i]','[name*="last" i]','[placeholder*="Last" i]'], DATA.lastName],
      [['[type="email"]','[id*="email" i]','[name*="email" i]'], DATA.email],
      [['[id*="company" i]','[name*="company" i]','[placeholder*="company" i]'], DATA.company],
      [['[id*="website" i]','[name*="website" i]','[placeholder*="website" i]'], DATA.website],
    ]) {
      for (const sel of sels) {
        try {
          const el = await page.$(sel);
          if (el && await el.isVisible()) {
            await el.fill(val);
            log(`✅ ${sel.substring(0,30)} = ${val}`);
            break;
          }
        } catch(e) {}
      }
    }

    await shot(page, 'fields-filled');

    // Aguardar para análise
    log('⏳ Aguardando 30s para análise da página AWS...');
    await page.waitForTimeout(30000);
    await shot(page, 'final');
    log('URL final AWS: ' + page.url());

  } catch(e) {
    log('❌ ERRO AWS: ' + e.message);
    await shot(page, 'error').catch(() => {});
  } finally {
    await b.close();
    log('🏁 Script AWS Activate finalizado — ' + new Date().toISOString() + '\n');
  }
})();
