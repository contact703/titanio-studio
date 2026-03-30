const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(30000);

  await p.goto('https://www.networksolutions.com/my-account/login', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(5000);
  await p.screenshot({ path: OUTDIR + '/ns-v4-01.png' });
  console.log('URL:', p.url());

  // Campo de login é #userId
  try {
    await p.waitForSelector('#userId', { timeout: 10000 });
    await p.fill('#userId', 'contact@titaniofilms.com');
    console.log('✅ userId preenchido');
    await p.screenshot({ path: OUTDIR + '/ns-v4-02.png' });
  } catch(e) {
    console.log('❌ userId err:', e.message.substring(0,60));
  }

  // Clicar no botão de continuar/next
  try {
    await p.click('button:has-text("Log"), button:has-text("Sign"), button:has-text("Next"), button:has-text("Continuar"), button:has-text("Continue"), #continueBtn, .btn-primary', { timeout: 5000 });
    console.log('✅ Clicou continuar');
    await p.waitForTimeout(4000);
    await p.screenshot({ path: OUTDIR + '/ns-v4-03.png' });
  } catch(e) {
    console.log('Erro botão:', e.message.substring(0,50));
    await p.keyboard.press('Tab');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(4000);
    await p.screenshot({ path: OUTDIR + '/ns-v4-03b.png' });
  }

  // Verificar se pediu senha
  const pwdVisible = await p.$('#password, [type="password"]');
  if (pwdVisible) {
    await p.fill('#password, [type="password"]', 'Rita16061979!');
    console.log('✅ Senha preenchida');
    await p.click('[type="submit"], button:has-text("Log")', { timeout: 5000 }).catch(() => p.keyboard.press('Enter'));
    await p.waitForTimeout(6000);
    await p.screenshot({ path: OUTDIR + '/ns-v4-04.png' });
    console.log('Final URL:', p.url());
  }

  await p.waitForTimeout(15000);
  await b.close();
  console.log('✅ Finalizado');
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
