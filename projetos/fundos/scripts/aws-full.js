const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws2';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR,{recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=0;async function shot(p,l){s++;await p.screenshot({path:`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`});log(`📸 ${OUTDIR}/${s}-${l}.png`);}

(async()=>{
  log(`\n### AWS Activate Full — ${new Date().toISOString()}`);
  const b=await chromium.launch({headless:false,slowMo:400});
  const p=await(await b.newContext({viewport:{width:1280,height:900}})).newPage();
  p.setDefaultTimeout(20000);

  // AWS Activate Founders - formulário direto
  await p.goto('https://aws.amazon.com/startups/learn-more/',{waitUntil:'domcontentloaded',timeout:20000});
  await p.waitForTimeout(4000);
  await shot(p,'loaded');
  log(`URL: ${p.url()}`);

  // Mapear todos os CTAs
  const ctas=await p.$$eval('a,button',els=>els.map(e=>({text:e.innerText?.trim().substring(0,50),href:e.href||''})).filter(e=>e.text&&e.text.length>2));
  log(`CTAs: ${JSON.stringify(ctas.slice(0,15))}`);

  // Clicar em Apply/Get credits
  for(const[s,n]of[
    ['a:has-text("Apply")','Apply'],
    ['a:has-text("Get started")','Get started'],
    ['a:has-text("Get credits")','Get credits'],
    ['a:has-text("Activate")','Activate'],
    ['a[href*="activate"]','activate link'],
    ['a[href*="startup"]','startup link'],
  ]){
    try{
      const el=await p.$(s);
      if(el){const href=await el.getAttribute('href');log(`CTA "${n}": ${href}`);await el.click();await p.waitForTimeout(4000);break;}
    }catch(e){}
  }
  await shot(p,'after-cta');
  log(`URL: ${p.url()}`);

  // Preencher formulário se disponível
  const inputs=await p.$$eval('input:not([type="hidden"]):not([type="checkbox"]),select,textarea',els=>els.map(e=>({type:e.type,id:e.id,name:e.name,ph:e.placeholder})));
  log(`Campos: ${JSON.stringify(inputs)}`);

  for(const[sel,val]of[
    ['input[type="email"],input[name*="email"]','contact@titaniofilms.com'],
    ['input[name*="company"],input[id*="company"]','Titanio Studio'],
    ['input[name*="first"],input[id*="first"]','Tiago'],
    ['input[name*="last"],input[id*="last"]','Affonso'],
    ['input[name*="website"],input[id*="website"]','https://titaniofilms.com'],
    ['input[name*="phone"],input[type="tel"]','+5531838381881'],
  ]){try{await p.fill(sel,val);}catch(e){}}

  await shot(p,'filled');
  try{await p.click('button[type="submit"],input[type="submit"]',{timeout:4000});await p.waitForTimeout(5000);await shot(p,'submitted');log(`URL final: ${p.url()}`);}catch(e){}
  await p.waitForTimeout(10000);
  await b.close();
})().catch(e=>log(`❌ AWS: ${e.message.substring(0,80)}`));
