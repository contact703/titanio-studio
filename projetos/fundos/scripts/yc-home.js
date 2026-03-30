const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/yc';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, {recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=20; async function shot(p,l){s++;const f=`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`;await p.screenshot({path:f});log(`📸 ${f}`);}

(async () => {
  log(`\n### YC apply.ycombinator.com/home — ${new Date().toISOString()}`);
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport:{width:1280,height:900} });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  // URL real do formulário YC
  await p.goto('https://apply.ycombinator.com/home', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(4000);
  await shot(p, 'home');
  log(`URL: ${p.url()} | Title: ${await p.title()}`);

  const inputs = await p.$$eval('input:not([type="hidden"])', els => els.map(e=>({type:e.type,id:e.id,name:e.name,ph:e.placeholder})));
  log(`Inputs: ${JSON.stringify(inputs)}`);

  const links = await p.$$eval('a', els => els.map(e=>({text:e.innerText?.trim().substring(0,40),href:e.href})).filter(e=>e.text));
  log(`Links: ${JSON.stringify(links.slice(0,8))}`);

  // Tentar fazer login/criar conta
  for (const sel of ['a:has-text("Sign up")', 'a:has-text("Create account")', 'a:has-text("Apply now")', 'button:has-text("Apply")', 'a:has-text("Log in")', 'a:has-text("Login")']) {
    try {
      const el = await p.$(sel);
      if (el) { const t = await el.innerText(); log(`CTA: "${t}"`); await el.click(); break; }
    } catch(e) {}
  }
  await p.waitForTimeout(4000);
  await shot(p, 'after-cta');
  log(`URL: ${p.url()}`);

  // Preencher se tem campos
  try { await p.fill('input[type="email"], input[name*="email"]', 'contact@titaniofilms.com'); log('✅ email'); } catch(e) {}
  try { await p.fill('input[type="password"], input[name*="password"]', 'TitanioAI2026!'); log('✅ senha'); } catch(e) {}
  await shot(p, 'filled');

  try {
    await p.click('button[type="submit"], input[type="submit"]', {timeout:4000});
    await p.waitForTimeout(5000);
    await shot(p, 'submitted');
    log(`URL final: ${p.url()}`);
  } catch(e) {}

  await p.waitForTimeout(15000);
  await b.close();
  log('🏁 YC done');
})().catch(e=>log(`❌ ERRO: ${e.message.substring(0,80)}`));
