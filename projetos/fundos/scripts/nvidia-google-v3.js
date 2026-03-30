const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-google';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';
function log(msg) { process.stdout.write(msg + '\n'); fs.appendFileSync(LOG, msg + '\n'); }
let step = 0;
async function shot(page, label) {
  step++;
  const fp = `${OUTDIR}/${String(step).padStart(2,'0')}-${label}.png`;
  await page.screenshot({ path: fp });
  log(`📸 ${fp}`);
}

(async () => {
  log(`\n### NVIDIA Google Login v3 — ${new Date().toISOString()}`);
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();

  // Fluxo completo: formulário → email → Sign Up → tela criar conta → clicar Google
  await p.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(4000);
  try { await p.click('#onetrust-accept-btn-handler', { timeout: 3000 }); } catch(e) {}
  await p.waitForTimeout(1000);

  await p.fill('#input-30', 'tiago@titaniofilms.com');
  log('✅ Email preenchido');

  // Clicar Sign Up
  await p.click('.slds-button.slds-button_brand', { timeout: 8000 });
  log('✅ Sign Up clicado');
  await p.waitForTimeout(5000);
  await shot(p, '01-after-signup');
  log(`URL: ${p.url().substring(0,80)}`);

  // Estamos na tela "Crie Sua Conta" com captcha
  // Clicar "Mais Opções De Inscrição" que mostra Google OAuth
  try {
    await p.click('a:has-text("Mais Opções"), button:has-text("Mais Opções"), [href*="more"]', { timeout: 5000 });
    log('✅ Clicou Mais Opções');
    await p.waitForTimeout(3000);
    await shot(p, '02-mais-opcoes');
  } catch(e) { log(`⚠️ Mais Opções: ${e.message.substring(0,50)}`); }

  // Tentar Google
  try {
    await p.click('a:has-text("Continuar com o Google"), a:has-text("Google"), button:has-text("Google"), [data-provider="google"], img[alt*="Google"]', { timeout: 5000 });
    log('✅ Google clicado!');
    await p.waitForTimeout(5000);
    await shot(p, '03-google-flow');
    log(`URL Google: ${p.url().substring(0,80)}`);

    // Se pedir para escolher conta
    const body = await p.innerText('body').catch(() => '');
    if (body.includes('conta') || body.includes('Choose') || body.includes('accounts.google')) {
      log('Seleção de conta Google...');
      // Clicar em conta da Titanio ou inserir email
      try { await p.click(`text=contact@titaniofilms.com`, { timeout: 3000 }); }
      catch(e) {
        const emailField = await p.$('input[type="email"]');
        if (emailField) {
          await emailField.fill('contact@titaniofilms.com');
          await p.keyboard.press('Enter');
          await p.waitForTimeout(3000);
        }
      }
      await shot(p, '04-google-account');
    }
  } catch(e) {
    log(`⚠️ Google: ${e.message.substring(0,60)}`);
    // Ver o que tem disponível
    const elems = await p.$$eval('a, button', els => els.map(e => e.innerText?.trim().substring(0,40)).filter(Boolean));
    log(`Disponível: ${JSON.stringify(elems)}`);
    await shot(p, '03-fallback');
  }

  log(`URL final: ${p.url().substring(0,80)}`);
  await p.waitForTimeout(25000);
  await b.close();
  log('🏁 v3 finalizado');
})().catch(e => log(`❌ ERRO: ${e.message.substring(0,100)}`));
