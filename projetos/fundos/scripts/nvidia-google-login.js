const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-google';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

function log(msg) {
  const line = `${msg}\n`;
  process.stdout.write(line);
  fs.appendFileSync(LOG, line);
}

let step = 0;
async function shot(page, label) {
  step++;
  const fp = `${OUTDIR}/${String(step).padStart(2,'0')}-${label}.png`;
  await page.screenshot({ path: fp, fullPage: false });
  log(`📸 ${fp}`);
}

(async () => {
  log(`\n### NVIDIA — Google Login — ${new Date().toISOString()}`);

  // Usar Chrome existente com perfil (sessão Google ativa)
  const CHROME_PATH = '/Volumes/TITA_039/MAC_MINI_03/APPs/Google Chrome.app/Contents/MacOS/Google Chrome';
  
  const b = await chromium.launch({
    headless: false,
    slowMo: 500,
    executablePath: CHROME_PATH,
  });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(20000);

  // Ir direto para a URL de create-account que já tem o email pré-preenchido
  const createAccountUrl = 'https://programs.nvidia.com/phoenix/application?ncid=no-ncid';
  await p.goto(createAccountUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(4000);

  // Fechar cookies
  try { await p.click('button:has-text("Accept All"), #onetrust-accept-btn-handler', { timeout: 3000 }); } catch(e) {}
  await p.waitForTimeout(1000);

  // Preencher email
  await p.waitForSelector('#input-30');
  await p.fill('#input-30', 'tiago@titaniofilms.com');
  log('✅ Email: tiago@titaniofilms.com');
  await shot(p, 'email-filled');

  // Clicar Sign Up / Login
  await p.click('.slds-button.slds-button_brand', { timeout: 8000 });
  log('✅ Clicou Sign Up/Login');
  await p.waitForTimeout(4000);
  await shot(p, 'after-signup');
  log(`URL: ${p.url()}`);

  // Agora clicar "Continuar com o Google" — sem captcha!
  try {
    await p.click('a:has-text("Continuar com o Google"), button:has-text("Continuar com o Google"), a:has-text("Continue with Google")', { timeout: 8000 });
    log('✅ Clicou Continuar com Google!');
    await p.waitForTimeout(5000);
    await shot(p, 'google-flow');
    log(`URL Google: ${p.url()}`);
    
    // Se abriu seleção de conta Google
    const bodyText = await p.innerText('body').catch(() => '');
    if (bodyText.includes('conta') || bodyText.includes('account') || bodyText.includes('Choose')) {
      log('🔑 Seleção de conta Google — tentando email da Titanio');
      try {
        await p.click(`text=contact@titaniofilms.com`, { timeout: 5000 });
        await p.waitForTimeout(3000);
        await shot(p, 'google-account-selected');
      } catch(e) {
        // Tentar preencher email se precisar
        const emailInput = await p.$('input[type="email"]');
        if (emailInput) {
          await emailInput.fill('contact@titaniofilms.com');
          await p.keyboard.press('Enter');
          await p.waitForTimeout(3000);
        }
      }
    }

    await shot(p, 'google-result');
    log(`URL final: ${p.url()}`);
  } catch(e) {
    log(`⚠️ Google login: ${e.message.substring(0,80)}`);
    
    // Verificar o que tem na página
    const links = await p.$$eval('a, button', els => els.map(e => ({ text: e.innerText?.trim().substring(0,40), href: e.href||'' })).filter(e => e.text));
    log(`Links disponíveis: ${JSON.stringify(links.slice(0,10))}`);
    await shot(p, 'fallback');
  }

  await p.waitForTimeout(20000);
  await b.close();
  log('🏁 NVIDIA Google Login finalizado');
})().catch(e => log(`❌ ERRO FATAL: ${e.message.substring(0,100)}`));
