const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/google-startups';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, {recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=0;async function shot(p,l){s++;const f=`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`;await p.screenshot({path:f});log(`📸 ${f}`);}

(async () => {
  log(`\n### Google for Startups — ${new Date().toISOString()}`);
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport:{width:1280,height:900} });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  await p.goto('https://startup.google.com/programs/accelerator/', {waitUntil:'domcontentloaded',timeout:20000});
  await p.waitForTimeout(4000);
  await shot(p, 'loaded');
  log(`URL: ${p.url()} | Title: ${await p.title()}`);

  const links = await p.$$eval('a', els => els.map(e=>({text:e.innerText?.trim().substring(0,50),href:e.href})).filter(e=>e.text));
  log(`Links: ${JSON.stringify(links.slice(0,10))}`);

  // Clicar em Apply ou expressão de interesse
  for (const sel of ['a:has-text("Apply")', 'a:has-text("Interest")', 'a:has-text("Notify")', 'button:has-text("Apply")']) {
    try { const el = await p.$(sel); if (el) { const t = await el.innerText(); const h = await el.getAttribute('href'); log(`CTA: "${t}" -> ${h}`); await el.click(); break; } } catch(e) {}
  }
  await p.waitForTimeout(4000);
  await shot(p, 'after-cta');
  log(`URL: ${p.url()}`);

  // Preencher formulário se disponível
  try { await p.fill('input[type="email"], input[name*="email"]', 'contact@titaniofilms.com'); log('✅ email GFS'); } catch(e) {}
  await shot(p, 'filled');
  await p.waitForTimeout(8000);
  await b.close();
  log('🏁 Google Startups done');
})().catch(e=>log(`❌ GFS ERRO: ${e.message.substring(0,80)}`));
