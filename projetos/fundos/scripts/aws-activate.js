const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

let step = 0;
async function shot(page, label) {
  step++;
  const fp = `${OUTDIR}/${String(step).padStart(2,'0')}-${label}.png`;
  await page.screenshot({ path: fp, fullPage: false });
  console.log('📸', fp);
}

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  console.log('🟠 Abrindo AWS Activate...');
  await p.goto('https://aws.amazon.com/startups/learn-more/', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(4000);
  await shot(p, '01-loaded');
  console.log('URL:', p.url(), '| Title:', await p.title());

  // Mapear CTAs
  const ctas = await p.$$eval('a[href*="activate"], a:has-text("Apply"), a:has-text("Get started"), a:has-text("Sign up"), button:has-text("Apply")', els =>
    els.map(e => ({ text: e.innerText.trim().substring(0,40), href: e.href || '' }))
  );
  console.log('CTAs:', JSON.stringify(ctas));

  // Clicar no primeiro CTA
  for (const [sel, txt] of [
    ['a:has-text("Apply now")', 'apply now'],
    ['a:has-text("Apply")', 'apply'],
    ['a:has-text("Get started")', 'get started'],
    ['a[href*="activate"]', 'activate link'],
  ]) {
    try {
      const el = await p.$(sel);
      if (el) {
        const href = await el.getAttribute('href');
        console.log(`CTA "${txt}": ${href}`);
        await el.click();
        console.log('✅ Clicou!');
        break;
      }
    } catch(e) {}
  }

  await p.waitForTimeout(5000);
  await shot(p, '02-after-click');
  console.log('URL:', p.url());

  await p.waitForTimeout(15000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
