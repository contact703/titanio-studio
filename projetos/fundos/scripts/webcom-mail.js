const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';
const re = require('path');

(async () => {
  const b = await chromium.launch({ headless: false });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();

  // web.com é o mesmo grupo que Network Solutions
  const urls = [
    'https://email.web.com/',
    'https://webmail.web.com/',
    'https://myaccount.networksolutions.com/',
    'https://www.networksolutions.com/manage-it/email.jsp',
  ];

  for (const url of urls) {
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      const title = await p.title();
      const curr = p.url();
      console.log(url, '->', curr.substring(0,70), '|', title.substring(0,40));
      await p.screenshot({ path: OUTDIR + '/webcom-01.png' });
      break;
    } catch(e) {
      console.log(url, '-> erro:', e.message.substring(0,50));
    }
  }

  await p.waitForTimeout(5000);
  await b.close();
})().catch(e => console.error(e.message));
