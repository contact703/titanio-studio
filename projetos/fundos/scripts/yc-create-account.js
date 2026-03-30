const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/yc';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, {recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=50;async function shot(p,l){s++;const f=`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`;await p.screenshot({path:f});log(`📸 ${f}`);}

(async () => {
  log(`\n### YC Create Account — ${new Date().toISOString()}`);
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport:{width:1280,height:900} });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  await p.goto('https://account.ycombinator.com/users/sign_up?continue=https%3A%2F%2Fapply.ycombinator.com%2Fhome', {waitUntil:'domcontentloaded',timeout:20000});
  await p.waitForTimeout(4000);
  await shot(p, 'signup');
  log(`URL: ${p.url()}`);

  const inputs = await p.$$eval('input:not([type="hidden"])', els => els.map(e=>({type:e.type,id:e.id,name:e.name,ph:e.placeholder})));
  log(`Campos: ${JSON.stringify(inputs)}`);

  // Preencher campos de criar conta
  try { await p.fill('input[name*="first"], #first_name, input[id*="first"]', 'Tiago'); log('first name'); } catch(e) {}
  try { await p.fill('input[name*="last"], #last_name, input[id*="last"]', 'Affonso'); log('last name'); } catch(e) {}
  try { await p.fill('input[type="email"], input[name*="email"], #email', 'contact@titaniofilms.com'); log('email'); } catch(e) {}
  try { await p.fill('input[type="password"], #password', 'TitanioAI2026!'); log('password'); } catch(e) {}
  try { await p.fill('#password_confirmation, input[name*="confirm"]', 'TitanioAI2026!'); log('confirm'); } catch(e) {}
  try { await p.fill('#_r_4_, input[placeholder*="linkedin" i]', 'https://www.linkedin.com/in/tiagoarakilian/'); log('linkedin'); } catch(e) {}

  await shot(p, 'filled');
  try {
    await p.click('button[type="submit"], input[type="submit"], button:has-text("Create")', {timeout:5000});
    await p.waitForTimeout(5000);
    await shot(p, 'after-submit');
    log(`URL: ${p.url()}`);
  } catch(e) { log(`Submit: ${e.message.substring(0,50)}`); }

  await p.waitForTimeout(15000);
  await b.close();
  log('🏁 YC Create Account done');
})().catch(e=>log(`❌ ERRO: ${e.message.substring(0,80)}`));
