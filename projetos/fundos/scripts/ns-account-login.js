const { chromium } = require('playwright');
const fs = require('fs');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 300 });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();

  // Login no painel Network Solutions
  console.log('Abrindo NS login...');
  await p.goto('https://www.networksolutions.com/manage-it/index.jsp', { waitUntil: 'domcontentloaded', timeout: 20000 });
  console.log('URL:', p.url());
  await p.screenshot({ path: OUTDIR + '/ns-account-01.png' });
  await p.waitForTimeout(3000);

  // Tentar campos de login
  const userField = await p.$('input[name="ns_vc_username"], input[name="username"], input[id*="username"], input[type="email"]');
  if (userField) {
    await userField.fill('contact@titaniofilms.com');
    console.log('✅ Usuário preenchido');
    const pwdField = await p.$('input[type="password"]');
    if (pwdField) {
      await pwdField.fill('Rita16061979!');
      await p.screenshot({ path: OUTDIR + '/ns-account-02.png' });
      await p.keyboard.press('Enter');
      await p.waitForTimeout(5000);
      await p.screenshot({ path: OUTDIR + '/ns-account-03.png' });
      console.log('Pós-login:', p.url());
    }
  } else {
    console.log('Sem campo de login — vendo o que tem na página');
    const links = await p.$$eval('a[href*="email"], a[href*="webmail"], a:has-text("Email"), a:has-text("Webmail")', 
      els => els.map(e => ({ text: e.innerText.trim().substring(0,40), href: e.href.substring(0,80) })));
    console.log('Links de email:', JSON.stringify(links));
  }

  await p.waitForTimeout(15000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
