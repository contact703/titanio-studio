const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/yc';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, {recursive:true});
function log(m){process.stdout.write(m+'\n');fs.appendFileSync(LOG,m+'\n');}
let s=40; async function shot(p,l){s++;const f=`${OUTDIR}/${String(s).padStart(2,'0')}-${l}.png`;await p.screenshot({path:f});log(`📸 ${f}`);}

const INFO = {
  companyName: 'Titanio Studio',
  url: 'https://titaniofilms.com',
  description: 'AI-powered audio description tool for visually impaired users in Brazil. VoxDescriber generates audio descriptions offline using local AI (WhisperX + Qwen2.5-VL + Piper TTS), targeting 6.5M visually impaired Brazilians, compliant with NBR 15290.',
  founders: 'Tiago Arakilian Affonso',
  email: 'contact@titaniofilms.com',
  linkedin: 'https://www.linkedin.com/in/tiagoarakilian/',
};

(async () => {
  log(`\n### YC Apply Form — ${new Date().toISOString()}`);
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport:{width:1280,height:900} });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  // Login YC primeiro
  await p.goto('https://account.ycombinator.com/?continue=https%3A%2F%2Fapply.ycombinator.com%2Fhome', {waitUntil:'domcontentloaded',timeout:20000});
  await p.waitForTimeout(3000);
  await p.fill('#ycid-input', 'contact@titaniofilms.com');
  await p.fill('#password-input', 'TitanioAI2026!');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(5000);
  log(`URL pós-login: ${p.url()}`);
  await shot(p, 'after-login');

  // Ir para o formulário de aplicação
  if (!p.url().includes('apply.ycombinator.com')) {
    await p.goto('https://apply.ycombinator.com/home', {waitUntil:'domcontentloaded',timeout:15000});
    await p.waitForTimeout(4000);
  }
  await shot(p, 'apply-home');
  log(`URL: ${p.url()} | Title: ${await p.title()}`);

  // Mapear toda a página
  const allText = await p.innerText('body').catch(()=>'');
  log(`Conteúdo da página (500 chars): ${allText.substring(0,500)}`);

  // Procurar botão de iniciar aplicação
  const buttons = await p.$$eval('a, button', els => els.map(e=>({text:e.innerText?.trim().substring(0,50),href:e.href||''})).filter(e=>e.text));
  log(`Buttons: ${JSON.stringify(buttons.slice(0,10))}`);

  // Clicar em Apply/Start Application
  for (const sel of ['a:has-text("Start")', 'a:has-text("New Application")', 'button:has-text("Apply")', 'a:has-text("Apply")', 'a:has-text("Begin")']) {
    try { await p.click(sel, {timeout:3000}); log(`✅ Clicou: ${sel}`); await p.waitForTimeout(3000); break; } catch(e) {}
  }
  await shot(p, 'application-page');
  log(`URL: ${p.url()}`);

  // Preencher campos do formulário
  const fillMap = [
    ['input[name*="company"], input[id*="company"], input[placeholder*="company" i]', INFO.companyName],
    ['input[name*="url"], input[id*="url"], input[placeholder*="url" i]', INFO.url],
    ['textarea[name*="desc"], textarea[id*="desc"], textarea[placeholder*="describe" i]', INFO.description],
    ['input[name*="linkedin"], input[id*="linkedin"], input[placeholder*="linkedin" i]', INFO.linkedin],
  ];

  for (const [sel, val] of fillMap) {
    try { await p.fill(sel, val); log(`✅ ${sel.substring(0,30)} = ${val.substring(0,30)}`); } catch(e) {}
  }

  await shot(p, 'form-filled');
  await p.waitForTimeout(20000);
  await b.close();
  log('🏁 YC Apply Form done');
})().catch(e=>log(`❌ ERRO: ${e.message.substring(0,80)}`));
