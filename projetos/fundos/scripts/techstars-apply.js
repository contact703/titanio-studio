const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/techstars';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR,{recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=0;async function shot(p,l){s++;await p.screenshot({path:`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`});log(`📸 ${OUTDIR}/${s}-${l}.png`);}

(async()=>{
  log(`\n### Techstars Anywhere — ${new Date().toISOString()}`);
  const b=await chromium.launch({headless:false,slowMo:400});
  const p=await(await b.newContext({viewport:{width:1280,height:900}})).newPage();
  p.setDefaultTimeout(20000);
  await p.goto('https://apply.techstars.com/',{waitUntil:'domcontentloaded',timeout:20000});
  await p.waitForTimeout(4000);
  await shot(p,'loaded');
  log(`URL: ${p.url()} | Title: ${await p.title()}`);
  const inputs=await p.$$eval('input:not([type="hidden"])',els=>els.map(e=>({type:e.type,id:e.id,ph:e.placeholder})));
  log(`Campos: ${JSON.stringify(inputs)}`);
  try{await p.fill('input[type="email"]','contact@titaniofilms.com');log('✅ email Techstars');}catch(e){}
  try{await p.fill('input[type="password"]','TitanioAI2026!');log('✅ senha Techstars');}catch(e){}
  await shot(p,'filled');
  try{await p.click('button[type="submit"],a:has-text("Sign up"),a:has-text("Apply")',{timeout:4000});await p.waitForTimeout(4000);await shot(p,'after');log(`URL: ${p.url()}`);}catch(e){}
  await p.waitForTimeout(10000);
  await b.close();
})().catch(e=>log(`❌ Techstars: ${e.message.substring(0,80)}`));
