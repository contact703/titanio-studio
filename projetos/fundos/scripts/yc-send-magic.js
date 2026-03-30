const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/yc-magic';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR,{recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=0;async function shot(p,l){s++;const f=`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`;await p.screenshot({path:f});log(`📸 ${f}`);}

(async()=>{
  log(`\n### YC Magic Link Send — ${new Date().toISOString()}`);
  const b=await chromium.launch({headless:false,slowMo:500});
  const p=await(await b.newContext({viewport:{width:1280,height:900}})).newPage();
  p.setDefaultTimeout(20000);

  // URL exata da tela que Zica mostrou
  await p.goto('https://account.ycombinator.com/magic?continue=https%3A%2F%2Fapply.ycombinator.com%2Fhome',{waitUntil:'domcontentloaded',timeout:20000});
  await p.waitForTimeout(4000);
  await shot(p,'loaded');
  log(`URL: ${p.url()}`);

  // Preencher email
  await p.waitForSelector('input[type="email"], input[placeholder*="example"]');
  await p.fill('input[type="email"], input[placeholder*="example"]', 'contact@titaniofilms.com');
  log('✅ Email: contact@titaniofilms.com');
  await shot(p,'email-filled');

  // Clicar "Send login link"
  await p.click('button:has-text("Send"), input[type="submit"], button[type="submit"]', {timeout:5000});
  log('✅ Clicou Send login link!');
  await p.waitForTimeout(5000);
  await shot(p,'sent');
  log(`URL final: ${p.url()}`);

  const body = await p.innerText('body').catch(()=>'');
  if (body.includes('sent') || body.includes('check') || body.includes('email')) {
    log('🎉 MAGIC LINK ENVIADO para contact@titaniofilms.com!');
  }
  log('📧 Eduardo/Tiago: verificar email contact@titaniofilms.com e clicar no link do YC');

  await p.waitForTimeout(10000);
  await b.close();
  log('🏁 YC magic done');
})().catch(e=>log(`❌ ERRO: ${e.message.substring(0,80)}`));
