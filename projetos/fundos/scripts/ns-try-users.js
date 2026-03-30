const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';

const USERS = [
  'tiago@titaniofilms.com',
  'tiagoarakilian@gmail.com',
  'titaniofilms@gmail.com',
  'tiago.arakilian@gmail.com',
  'contato@titaniofilms.com',
];

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 300 });
  const ctx = await b.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(15000);

  for (const user of USERS) {
    await p.goto('https://www.networksolutions.com/my-account/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await p.waitForTimeout(3000);

    // Fechar cookies se necessário
    try { await p.click('#onetrust-accept-btn-handler', { timeout: 2000 }); } catch(e) {}

    await p.waitForSelector('#userId');
    await p.fill('#userId', user);
    await p.click('button:has-text("Next")');
    await p.waitForTimeout(3000);

    const text = await p.innerText('body').catch(() => '');
    if (text.includes('not found') || text.includes('não encontrado')) {
      console.log('❌', user, '- not found');
    } else if (text.includes('password') || text.includes('senha') || text.includes('Password')) {
      console.log('✅✅✅', user, '- SENHA PEDIDA!');
      await p.screenshot({ path: OUTDIR + '/ns-found-user.png' });
      // Tentar senha
      await p.fill('[type="password"]', 'Rita16061979!').catch(() => {});
      await p.keyboard.press('Enter');
      await p.waitForTimeout(5000);
      await p.screenshot({ path: OUTDIR + '/ns-logged-in.png' });
      console.log('URL:', p.url());
      break;
    } else {
      console.log('?', user, '- resultado desconhecido');
      await p.screenshot({ path: OUTDIR + `/ns-try-${user.replace('@','_at_')}.png` });
    }
  }

  await p.waitForTimeout(5000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
