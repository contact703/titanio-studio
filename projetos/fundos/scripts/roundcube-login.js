const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(20000);

  // Tentar webmail Roundcube/Dovecot no mesmo servidor
  const urls = [
    'https://smtp.titaniofilms.com/roundcube',
    'https://smtp.titaniofilms.com/webmail',
    'https://smtp.titaniofilms.com/mail',
    'http://smtp.titaniofilms.com/webmail',
  ];

  for (const url of urls) {
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const t = await p.title();
      console.log(url, '->', p.url(), '|', t.substring(0,40));
      await p.screenshot({ path: OUTDIR + '/rc-01.png' });

      const userField = await p.$('#rcmloginuser, input[name="_user"], input[name="user"], input[id*="user"]');
      if (userField) {
        console.log('✅ Roundcube encontrado!');
        await userField.fill('contact@titaniofilms.com');
        await p.fill('#rcmloginpwd, input[name="_pass"], input[type="password"]', 'Rita160679!');
        await p.click('#rcmloginsubmit, button[type="submit"], input[type="submit"]');
        await p.waitForTimeout(5000);
        await p.screenshot({ path: OUTDIR + '/rc-02-after-login.png' });
        console.log('Pós-login:', p.url());
        break;
      }
    } catch(e) {
      console.log(url, '->', e.message.substring(0,50));
    }
  }

  await p.waitForTimeout(10000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,80)));
