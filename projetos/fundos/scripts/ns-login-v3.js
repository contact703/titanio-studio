const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();

  await p.goto('https://www.networksolutions.com/my-account/login', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: OUTDIR + '/ns-v3-01.png' });
  console.log('URL:', p.url(), '| Title:', await p.title());

  const inputs = await p.$$eval('input:not([type="hidden"])', els => els.map(e => ({ type: e.type, name: e.name, id: e.id, ph: e.placeholder })));
  console.log('Inputs visíveis:', JSON.stringify(inputs));

  try { await p.fill('#username, #email, [name="username"], [name="email"]', 'contact@titaniofilms.com'); console.log('email ok'); } catch(e) { console.log('email err:', e.message.substring(0,50)); }
  try { await p.fill('#password, [name="password"]', 'Rita16061979!'); console.log('pwd ok'); } catch(e) { console.log('pwd err:', e.message.substring(0,50)); }

  await p.screenshot({ path: OUTDIR + '/ns-v3-02.png' });

  try { await p.click('[type="submit"]', { timeout: 3000 }); } catch(e) { await p.keyboard.press('Enter'); }
  await p.waitForTimeout(8000);
  await p.screenshot({ path: OUTDIR + '/ns-v3-03.png' });
  console.log('Final URL:', p.url());

  await p.waitForTimeout(15000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
