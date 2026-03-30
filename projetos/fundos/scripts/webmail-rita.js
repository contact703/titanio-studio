const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/webmail-rita';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR,{recursive:true});
const log = m => { process.stdout.write(m+'\n'); };

(async()=>{
  const b = await chromium.launch({headless:false, slowMo:400});
  const p = await (await b.newContext({viewport:{width:1280,height:900}, ignoreHTTPSErrors:true})).newPage();

  // Tentar NS account login com senha correta
  await p.goto('https://www.networksolutions.com/my-account/login', {waitUntil:'domcontentloaded', timeout:20000});
  await p.waitForTimeout(4000);

  // Fechar cookie
  try { await p.click('#onetrust-accept-btn-handler', {timeout:3000}); } catch(e) {}
  await p.waitForTimeout(1000);

  // Preencher userId
  await p.waitForSelector('#userId');
  await p.fill('#userId', 'tiago.arakilian@gmail.com');
  await p.screenshot({path:`${OUTDIR}/01-user.png`});

  await p.click('button:has-text("Next")', {timeout:8000});
  await p.waitForTimeout(4000);
  await p.screenshot({path:`${OUTDIR}/02-after-next.png`});
  log(`URL: ${p.url()}`);
  log(`Texto: ${(await p.innerText('body').catch(()=>'')).substring(0,200)}`);

  await p.waitForTimeout(10000);
  await b.close();
})().catch(e=>log(`ERRO: ${e.message.substring(0,80)}`));
