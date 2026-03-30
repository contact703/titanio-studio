const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-google';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
function log(msg) { process.stdout.write(msg + '\n'); fs.appendFileSync(LOG, msg + '\n'); }
let step = 40;
async function shot(page, label) {
  step++;
  const fp = `${OUTDIR}/${String(step).padStart(2,'0')}-${label}.png`;
  await page.screenshot({ path: fp });
  log(`📸 ${fp}`);
}

(async () => {
  log(`\n### NVIDIA Google v4 — ${new Date().toISOString()}`);
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();

  // Repetir fluxo até a tela de senha Google
  await p.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(4000);
  try { await p.click('#onetrust-accept-btn-handler', { timeout: 3000 }); } catch(e) {}

  await p.fill('#input-30', 'tiago@titaniofilms.com');
  await p.click('.slds-button.slds-button_brand', { timeout: 8000 });
  await p.waitForTimeout(4000);

  try { await p.click('a:has-text("Mais Opções"), button:has-text("Mais Opções")', { timeout: 5000 }); } catch(e) {}
  await p.waitForTimeout(2000);

  await p.click('a:has-text("Continuar com o Google"), a:has-text("Google"), button:has-text("Google")', { timeout: 5000 });
  await p.waitForTimeout(4000);

  // Preencher email Google: tiago
  const emailInput = await p.$('input[type="email"]');
  if (emailInput) {
    await emailInput.fill('tiago');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(3000);
  }

  // AGORA: estamos na tela de senha
  await shot(p, 'pwd-screen');
  log(`URL pwd: ${p.url().substring(0,80)}`);

  // Inserir as senhas que temos
  const passwords = ['Rita160679!', 'Rita16061979!', 'TitanioAI2026!', 'Titanio2026!'];
  
  for (const pwd of passwords) {
    const pwdField = await p.$('input[type="password"], input[name="password"]');
    if (pwdField) {
      await pwdField.fill('');
      await pwdField.fill(pwd);
      log(`Tentando senha: ${pwd.substring(0,8)}...`);
      await p.click('#passwordNext, [data-idom-class="ncp6yc"], button:has-text("Avançar"), button[type="submit"]', { timeout: 5000 }).catch(() => p.keyboard.press('Enter'));
      await p.waitForTimeout(4000);
      await shot(p, `pwd-try-${pwd.substring(0,8)}`);
      
      const url = p.url();
      const body = await p.innerText('body').catch(() => '');
      log(`URL: ${url.substring(0,60)} | erro: ${body.includes('incorret') || body.includes('incorreta') || body.includes('wrong')}`);
      
      if (!body.includes('incorret') && !body.includes('incorreta') && !url.includes('challenge/pwd')) {
        log(`✅ SENHA OK: ${pwd}`);
        break;
      }
    }
  }

  await shot(p, 'final');
  log(`URL final: ${p.url().substring(0,80)}`);
  
  await p.waitForTimeout(20000);
  await b.close();
  log('🏁 v4 finalizado');
})().catch(e => log(`❌ ERRO: ${e.message.substring(0,100)}`));
