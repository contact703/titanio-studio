const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/yc';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
function log(m) { process.stdout.write(m+'\n'); fs.appendFileSync(LOG, m+'\n'); }
let s=0; async function shot(p,l){s++;const f=`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`;await p.screenshot({path:f});log(`📸 ${f}`);}

(async () => {
  log(`\n### YC Application — ${new Date().toISOString()}`);
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const p = await (await b.newContext({ viewport:{width:1280,height:900} })).newPage();

  await p.goto('https://apply.ycombinator.com/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(4000);
  await shot(p, 'loaded');
  log(`URL: ${p.url()} | Title: ${await p.title()}`);

  // Mapear CTAs
  const links = await p.$$eval('a, button', els => els.map(e=>({text:e.innerText?.trim().substring(0,40),href:e.href||''})).filter(e=>e.text));
  log(`Links: ${JSON.stringify(links.slice(0,10))}`);

  // Clicar Apply ou Create Account
  for (const sel of ['a:has-text("Apply")', 'button:has-text("Apply")', 'a:has-text("Create")', 'a:has-text("Sign up")', 'a:has-text("Get started")']) {
    try { await p.click(sel, {timeout:3000}); log(`✅ Clicou: ${sel}`); break; } catch(e) {}
  }
  await p.waitForTimeout(4000);
  await shot(p, 'after-cta');
  log(`URL: ${p.url()}`);

  // Se abriu formulário de criação de conta
  const emailField = await p.$('input[type="email"], input[name*="email"]');
  if (emailField) {
    await emailField.fill('contact@titaniofilms.com');
    log('✅ Email preenchido no YC');
  }

  await p.waitForTimeout(15000);
  await b.close();
  log('🏁 YC finalizado');
})().catch(e=>log(`❌ YC ERRO: ${e.message.substring(0,80)}`));
