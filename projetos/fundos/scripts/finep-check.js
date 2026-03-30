const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/finep';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR,{recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=0;async function shot(p,l){s++;await p.screenshot({path:`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`});log(`📸 ${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`);}

(async()=>{
  log(`\n### FINEP Mulheres Inovadoras — ${new Date().toISOString()}`);
  const b=await chromium.launch({headless:false,slowMo:300});
  const p=await(await b.newContext({viewport:{width:1280,height:900}})).newPage();
  await p.goto('http://www.finep.gov.br/chamadas-publicas/chamadapublica/781',{waitUntil:'domcontentloaded',timeout:20000});
  await p.waitForTimeout(4000);
  await shot(p,'loaded');
  log(`URL: ${p.url()} | Title: ${await p.title()}`);
  const body=await p.innerText('body').catch(()=>'');
  log(`Conteúdo (800 chars): ${body.substring(0,800)}`);
  const links=await p.$$eval('a',els=>els.map(e=>({text:e.innerText?.trim().substring(0,50),href:e.href})).filter(e=>e.text&&(e.href.includes('inscri')||e.href.includes('submit')||e.href.includes('apply')||e.text.toLowerCase().includes('inscri')||e.text.toLowerCase().includes('submeter')||e.text.toLowerCase().includes('participar'))));
  log(`Links inscrição: ${JSON.stringify(links)}`);
  await p.waitForTimeout(5000);
  await b.close();
})().catch(e=>log(`❌ FINEP: ${e.message.substring(0,80)}`));
