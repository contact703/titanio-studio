const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/idb';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, {recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=0;async function shot(p,l){s++;const f=`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`;await p.screenshot({path:f});log(`📸 ${f}`);}

(async () => {
  log(`\n### IDB Lab — ${new Date().toISOString()}`);
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport:{width:1280,height:900} });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  await p.goto('https://bidlab.org/en', {waitUntil:'domcontentloaded',timeout:20000});
  await p.waitForTimeout(4000);
  await shot(p, 'loaded');
  log(`URL: ${p.url()} | Title: ${await p.title()}`);

  // Assinar newsletter
  const emailField = await p.$('input[type="email"], input[name*="email"], input[placeholder*="email" i]');
  if (emailField) {
    await emailField.fill('contact@titaniofilms.com');
    log('✅ Email newsletter IDB');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(3000);
    await shot(p, 'newsletter-submitted');
    log(`URL: ${p.url()}`);
  }

  // Buscar formulários de contato/interest
  const links = await p.$$eval('a', els => els.map(e=>({text:e.innerText?.trim().substring(0,40),href:e.href})).filter(e=>e.text&&(e.href.includes('contact')||e.href.includes('apply')||e.href.includes('innovate')||e.text.toLowerCase().includes('apply')||e.text.toLowerCase().includes('contact')||e.text.toLowerCase().includes('submit'))));
  log(`IDB links: ${JSON.stringify(links.slice(0,5))}`);

  if (links.length > 0) {
    await p.goto(links[0].href, {waitUntil:'domcontentloaded',timeout:15000});
    await p.waitForTimeout(3000);
    await shot(p, 'contact-page');
    log(`Contact URL: ${p.url()}`);
  }

  await p.waitForTimeout(8000);
  await b.close();
  log('🏁 IDB done');
})().catch(e=>log(`❌ IDB ERRO: ${e.message.substring(0,80)}`));
