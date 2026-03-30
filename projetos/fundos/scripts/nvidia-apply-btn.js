const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia';
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
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  await p.goto('https://www.nvidia.com/en-us/startups/', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(3000);

  // Fechar banners
  try { await p.click('button:has-text("Accept All")', { timeout: 3000 }); } catch(e) {}
  await p.waitForTimeout(500);
  try { await p.click('[class*="close"], button[aria-label*="close"], .nv-banner button', { timeout: 2000 }); } catch(e) {}

  // Ir para aba Get Started
  await p.click('a:has-text("Get Started")', { timeout: 5000 }).catch(() => {});
  await p.waitForTimeout(2000);

  // Scroll até o botão "Apply Now" na seção Get Started
  await p.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('a, button'));
    const applyBtn = btns.find(b => b.innerText.trim() === 'Apply Now');
    if (applyBtn) applyBtn.scrollIntoView();
  });
  await p.waitForTimeout(1000);
  await shot(p, 'before-apply');

  // Pegar o href do botão Apply Now
  const applyLinks = await p.$$eval('a:has-text("Apply"), a[href*="inception"], a[href*="apply"]', els =>
    els.map(e => ({ text: e.innerText.trim(), href: e.href }))
  );
  console.log('Apply links:', JSON.stringify(applyLinks));

  // Clicar o Apply Now na seção Get Started
  await p.click('a:has-text("Apply Now")', { timeout: 5000 }).catch(async () => {
    console.log('Tentando via JS click...');
    await p.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('a'));
      const btn = btns.find(b => b.innerText.trim().includes('Apply Now'));
      if (btn) { console.log('href:', btn.href); btn.click(); }
    });
  });

  await p.waitForTimeout(5000);
  await shot(p, 'after-apply-click');
  console.log('URL pós-click:', p.url());
  console.log('Title:', await p.title());

  await p.waitForTimeout(15000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
