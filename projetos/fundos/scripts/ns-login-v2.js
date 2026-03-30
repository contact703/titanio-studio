const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  
  p.setDefaultTimeout(20000);

  console.log('Abrindo NS login...');
  await p.goto('https://www.networksolutions.com/my-account/login', { waitUntil: 'networkidle', timeout: 20000 });
  console.log('URL:', p.url());
  await p.waitForTimeout(3000);
  await p.screenshot({ path: OUTDIR + '/ns-login-01.png' });

  // Mapear todos os inputs
  const inputs = await p.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder, visible: e.offsetParent !== null })));
  console.log('Inputs:', JSON.stringify(inputs));

  // Preencher email
  const emailSel = 'input[type="email"], input[name*="user"], input[name*="email"], input[id*="user"], input[id*="email"]';
  await p.waitForSelector(emailSel, { timeout: 10000 });
  await p.fill(emailSel, 'contact@titaniofilms.com');
  console.log('✅ Email preenchido');
  
  const pwdSel = 'input[type="password"]';
  await p.waitForSelector(pwdSel, { timeout: 5000 });
  await p.fill(pwdSel, 'Rita16061979!');
  console.log('✅ Senha preenchida');
  
  await p.screenshot({ path: OUTDIR + '/ns-login-02.png' });
  
  // Clicar no botão de submit
  try {
    await p.click('button[type="submit"], input[type="submit"], button:has-text("Log"), button:has-text("Sign")', { timeout: 5000 });
  } catch(e) {
    await p.keyboard.press('Enter');
  }
  
  await p.waitForTimeout(6000);
  await p.screenshot({ path: OUTDIR + '/ns-login-03.png' });
  console.log('Pós-login:', p.url());
  console.log('Title:', await p.title());

  // Buscar link de email/webmail
  const emailLinks = await p.$$eval('a', els => 
    els.filter(e => /email|webmail|mail/i.test(e.href + e.innerText))
       .map(e => ({ text: e.innerText.trim().substring(0,40), href: e.href.substring(0,80) }))
  );
  console.log('Links email:', JSON.stringify(emailLinks.slice(0,5)));

  await p.waitForTimeout(15000);
  await b.close();
  console.log('✅ Finalizado');
})().catch(e => console.error('ERRO:', e.message.substring(0,150)));
