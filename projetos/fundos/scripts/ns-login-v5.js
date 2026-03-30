const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(15000);

  await p.goto('https://www.networksolutions.com/my-account/login', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(4000);

  // Fechar cookie banner PRIMEIRO
  try {
    await p.click('button:has-text("Aceitar"), button:has-text("Accept"), #onetrust-accept-btn-handler', { timeout: 5000 });
    console.log('✅ Cookie banner fechado');
    await p.waitForTimeout(1500);
  } catch(e) { console.log('Sem cookie banner ou já fechado'); }

  await p.screenshot({ path: OUTDIR + '/ns-v5-01.png' });

  // Preencher userId
  await p.waitForSelector('#userId', { timeout: 8000 });
  await p.fill('#userId', 'contact@titaniofilms.com');
  console.log('✅ userId preenchido');

  // Clicar Next
  await p.click('button:has-text("Next")', { timeout: 8000 });
  console.log('✅ Clicou Next');
  await p.waitForTimeout(4000);
  await p.screenshot({ path: OUTDIR + '/ns-v5-02.png' });
  console.log('URL após Next:', p.url());

  // Campo de senha
  try {
    await p.waitForSelector('[type="password"], #password', { timeout: 8000 });
    await p.fill('[type="password"]', 'Rita16061979!');
    console.log('✅ Senha preenchida');
    await p.screenshot({ path: OUTDIR + '/ns-v5-03.png' });
    
    await p.click('[type="submit"], button:has-text("Log"), button:has-text("Sign")', { timeout: 5000 }).catch(() => p.keyboard.press('Enter'));
    await p.waitForTimeout(6000);
    await p.screenshot({ path: OUTDIR + '/ns-v5-04.png' });
    console.log('Final URL:', p.url());
  } catch(e) {
    console.log('Sem campo de senha (pode ter ido direto):', e.message.substring(0,60));
  }

  await p.waitForTimeout(15000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
