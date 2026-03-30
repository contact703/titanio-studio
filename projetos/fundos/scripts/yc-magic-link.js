const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/yc';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, {recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=30; async function shot(p,l){s++;const f=`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`;await p.screenshot({path:f});log(`📸 ${f}`);}

(async () => {
  log(`\n### YC Magic Link — ${new Date().toISOString()}`);
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport:{width:1280,height:900} });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  // YC usa login por magic link OU username/password
  // Tentar criar conta primeiro com username
  await p.goto('https://account.ycombinator.com/?continue=https%3A%2F%2Fapply.ycombinator.com%2Fhome', {waitUntil:'domcontentloaded',timeout:20000});
  await p.waitForTimeout(4000);
  await shot(p, 'login-page');
  log(`URL: ${p.url()}`);

  // Preencher username e senha diretamente
  await p.fill('#ycid-input', 'contact@titaniofilms.com');
  await p.fill('#password-input', 'TitanioAI2026!');
  log('✅ Credenciais preenchidas');
  await shot(p, 'creds-filled');

  await p.keyboard.press('Enter');
  await p.waitForTimeout(4000);
  await shot(p, 'after-login');
  log(`URL: ${p.url()}`);

  const body = await p.innerText('body').catch(()=>'');
  if (body.includes('Invalid') || body.includes('incorrect') || body.includes('wrong')) {
    log('❌ Credenciais inválidas — tentando criar conta via magic link');
    
    // Ir para magic link / criar conta
    await p.goto('https://account.ycombinator.com/magic?continue=https%3A%2F%2Fapply.ycombinator.com%2Fhome', {waitUntil:'domcontentloaded'});
    await p.waitForTimeout(3000);
    await shot(p, 'magic-link');
    
    const emailField = await p.$('input[type="email"], input[name*="email"], #_r_1_');
    if (emailField) {
      await emailField.fill('contact@titaniofilms.com');
      log('✅ Email para magic link');
      await p.click('button[type="submit"], input[type="submit"]', {timeout:5000}).catch(()=>p.keyboard.press('Enter'));
      await p.waitForTimeout(4000);
      await shot(p, 'magic-sent');
      log(`URL: ${p.url()}`);
      log('📧 Magic link enviado para contact@titaniofilms.com — precisamos acessar o email pra finalizar');
    }
  } else if (p.url().includes('apply.ycombinator.com')) {
    log('✅✅ LOGIN YC OK!');
    await shot(p, 'logged-in');
    
    // Preencher aplicação
    const appInputs = await p.$$eval('input:not([type="hidden"]), textarea', els => els.map(e=>({id:e.id,type:e.type,ph:e.placeholder})));
    log(`Campos aplicação: ${JSON.stringify(appInputs.slice(0,10))}`);
  }

  await p.waitForTimeout(15000);
  await b.close();
  log('🏁 YC Magic Link done');
})().catch(e=>log(`❌ ERRO: ${e.message.substring(0,80)}`));
