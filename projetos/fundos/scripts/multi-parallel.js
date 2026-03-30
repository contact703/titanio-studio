const { chromium } = require('playwright');
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const BASE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';
const fs = require('fs');
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}

async function runTask(name, fn) {
  try {
    await fn();
    log(`✅✅ ${name} CONCLUÍDO`);
  } catch(e) {
    log(`❌ ${name} ERRO: ${e.message.substring(0,80)}`);
  }
}

async function idbSubscribe() {
  const dir = `${BASE}/idb2`; fs.mkdirSync(dir, {recursive:true});
  const b = await chromium.launch({ headless: false, slowMo: 300 });
  const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  await p.goto('https://bidlab.org/en/subscribe', {waitUntil:'domcontentloaded',timeout:15000});
  await p.waitForTimeout(3000);
  await p.screenshot({path:`${dir}/01.png`});
  const inputs = await p.$$eval('input:not([type="hidden"])', els=>els.map(e=>({id:e.id,type:e.type,ph:e.placeholder})));
  log(`IDB sub inputs: ${JSON.stringify(inputs)}`);
  // Tentar preencher email
  try { await p.fill('input[type="email"], input[name*="email"], input[id*="email"]', 'contact@titaniofilms.com'); } catch(e) {}
  try { await p.fill('input[name*="first"], input[id*="first"]', 'Tiago'); } catch(e) {}
  try { await p.fill('input[name*="last"], input[id*="last"]', 'Affonso'); } catch(e) {}
  await p.screenshot({path:`${dir}/02.png`});
  try { await p.click('button[type="submit"], input[type="submit"]', {timeout:5000}); await p.waitForTimeout(3000); } catch(e) {}
  await p.screenshot({path:`${dir}/03-result.png`});
  log(`IDB result URL: ${p.url()}`);
  await b.close();
}

async function googleForStartupsLatam() {
  const dir = `${BASE}/google-latam`; fs.mkdirSync(dir, {recursive:true});
  const b = await chromium.launch({ headless: false, slowMo: 300 });
  const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  // Buscar programa LATAM específico
  await p.goto('https://startup.google.com/intl/pt-BR/programs/', {waitUntil:'domcontentloaded',timeout:15000});
  await p.waitForTimeout(3000);
  await p.screenshot({path:`${dir}/01.png`});
  log(`GFS Programs: ${p.url()}`);
  const links = await p.$$eval('a', els => els.map(e=>({text:e.innerText?.trim().substring(0,50),href:e.href})).filter(e=>e.text&&e.href&&(e.href.includes('accelerator')||e.href.includes('latam')||e.href.includes('brasil')||e.href.includes('brazil'))));
  log(`GFS LATAM links: ${JSON.stringify(links)}`);
  // Tentar créditos Google Cloud para startups
  await p.goto('https://startup.google.com/cloud/', {waitUntil:'domcontentloaded',timeout:15000});
  await p.waitForTimeout(3000);
  await p.screenshot({path:`${dir}/02-cloud.png`});
  log(`GFS Cloud URL: ${p.url()}`);
  const applyLinks = await p.$$eval('a, button', els => els.map(e=>({text:e.innerText?.trim().substring(0,40),href:e.href||''})).filter(e=>e.text&&(e.text.toLowerCase().includes('apply')||e.text.toLowerCase().includes('start')||e.text.toLowerCase().includes('get')||e.text.toLowerCase().includes('inscr'))));
  log(`GFS Cloud CTAs: ${JSON.stringify(applyLinks.slice(0,5))}`);
  if (applyLinks.length > 0 && applyLinks[0].href) {
    await p.goto(applyLinks[0].href, {waitUntil:'domcontentloaded',timeout:15000});
    await p.waitForTimeout(3000);
    await p.screenshot({path:`${dir}/03-apply.png`});
    log(`GFS Apply URL: ${p.url()}`);
  }
  await b.close();
}

async function ycSignUp() {
  const dir = `${BASE}/yc2`; fs.mkdirSync(dir, {recursive:true});
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
  // Enviar magic link - mais simples que criar conta
  await p.goto('https://account.ycombinator.com/magic?continue=https%3A%2F%2Fapply.ycombinator.com%2Fhome', {waitUntil:'domcontentloaded',timeout:15000});
  await p.waitForTimeout(3000);
  await p.screenshot({path:`${dir}/01-magic.png`});
  log(`YC magic URL: ${p.url()}`);
  const inputs = await p.$$eval('input:not([type="hidden"])', els=>els.map(e=>({type:e.type,id:e.id,ph:e.placeholder})));
  log(`YC magic inputs: ${JSON.stringify(inputs)}`);
  try {
    await p.fill('input[type="email"], #_r_1_, input[name*="email"]', 'contact@titaniofilms.com');
    log('✅ YC magic email preenchido');
    await p.click('button[type="submit"], input[type="submit"]', {timeout:5000});
    await p.waitForTimeout(4000);
    await p.screenshot({path:`${dir}/02-sent.png`});
    log(`YC magic result: ${p.url()}`);
    const body = await p.innerText('body').catch(()=>'');
    if (body.includes('sent') || body.includes('enviado') || body.includes('check')) {
      log('✅ YC magic link ENVIADO para contact@titaniofilms.com!');
    }
  } catch(e) { log(`YC magic err: ${e.message.substring(0,50)}`); }
  await b.close();
}

// Executar em paralelo
log(`\n### Multi-Parallel Submissions — ${new Date().toISOString()}`);
Promise.all([
  runTask('IDB Subscribe', idbSubscribe),
  runTask('Google for Startups LATAM', googleForStartupsLatam),
  runTask('YC Magic Link', ycSignUp),
]).then(() => log('✅ Todas as tarefas paralelas concluídas')).catch(e => log(`ERRO GERAL: ${e.message}`));
