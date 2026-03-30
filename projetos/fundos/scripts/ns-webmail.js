const { chromium } = require('playwright');
const path = require('path');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';

(async () => {
  const b = await chromium.launch({ headless: false });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();

  const urls = [
    'https://webmail.networksolutions.com',
    'https://email.networksolutions.com',
    'https://www.networksolutions.com/webmail',
  ];

  for (const url of urls) {
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      const title = await p.title();
      console.log('URL:', p.url(), '| Title:', title);
      await p.screenshot({ path: path.join(OUTDIR, 'ns-01.png') });

      // Procurar campo de email/username
      const emailInput = await p.$('input[type="email"], input[name="email"], input[name="username"], input[name="user"], input[id*="email"], input[id*="user"]');
      if (emailInput) {
        await emailInput.fill('contact@titaniofilms.com');
        console.log('✅ Email preenchido em', url);

        const pwdInput = await p.$('input[type="password"]');
        if (pwdInput) {
          await pwdInput.fill('Rita160679!)');
          console.log('✅ Senha preenchida');
          await p.screenshot({ path: path.join(OUTDIR, 'ns-02-filled.png') });
          await p.keyboard.press('Enter');
          await p.waitForTimeout(5000);
          await p.screenshot({ path: path.join(OUTDIR, 'ns-03-after-login.png') });
          console.log('URL pós-login:', p.url());

          // Buscar email da Microsoft
          const bodyText = await p.innerText('body').catch(() => '');
          if (bodyText.includes('microsoft') || bodyText.includes('Microsoft')) {
            const code = bodyText.match(/\b(\d{6,8})\b/);
            if (code) console.log('🔑 CÓDIGO MICROSOFT:', code[1]);
          }
        }
        break;
      }
    } catch (e) {
      console.log(url, '-> erro:', e.message.substring(0, 60));
    }
  }

  await p.waitForTimeout(10000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message));
