const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';

(async () => {
  const b = await chromium.launch({ headless: false });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();

  const tryUrls = [
    'https://mail.networksolutions.com/',
    'https://email.networksolutions.com/',
    'https://login.networksolutions.com/',
  ];

  for (const url of tryUrls) {
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      const title = await p.title();
      console.log('URL:', p.url(), '| Title:', title.substring(0,50));
      await p.screenshot({ path: OUTDIR + '/ns-webmail-try.png' });

      const user = await p.$('input[type="email"], input[name="email"], input[name="username"], input[name="user"], input[id*="user"], input[id*="email"]');
      if (user) {
        console.log('✅ Campo de login encontrado!');
        await user.fill('contact@titaniofilms.com');
        const pwd = await p.$('input[type="password"]');
        if (pwd) {
          await pwd.fill('Rita16061979!');
          await p.screenshot({ path: OUTDIR + '/ns-filled.png' });
          await p.keyboard.press('Enter');
          await p.waitForTimeout(6000);
          await p.screenshot({ path: OUTDIR + '/ns-after-login.png' });
          console.log('Pós-login:', p.url());
          
          // Buscar email Microsoft
          const bodyText = await p.innerText('body').catch(() => '');
          const code = bodyText.match(/\b(\d{6,8})\b/);
          if (code) console.log('🔑 CÓDIGO:', code[1]);
        }
        break;
      }
    } catch(e) {
      console.log(url, '->', e.message.substring(0,60));
    }
  }

  await p.waitForTimeout(10000);
  await b.close();
})().catch(e => console.error(e.message));
