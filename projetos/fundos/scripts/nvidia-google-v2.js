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
  await page.screenshot({ path: fp, fullPage: false });
  log(`📸 ${fp}`);
}

(async () => {
  log(`\n### NVIDIA Google Login v2 — ${new Date().toISOString()}`);

  // Usar Playwright Chromium embutido (não Chrome externo)
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();

  // Ir para URL de create-account NVIDIA com email já na URL
  const url = 'https://login.nvgs.nvidia.com/v1/create-account?preferred_nvidia=true&context=Initial&theme=Bright&locale=pt-BR&prompt=default&email=tiago%40titaniofilms.com&client_id=323893095789756813';
  log(`Abrindo: ${url.substring(0,80)}...`);
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(4000);
  await shot(p, '01-create-account');
  log(`URL: ${p.url().substring(0,80)}`);
  log(`Title: ${await p.title()}`);

  // Ver campos
  const inputs = await p.$$eval('input:not([type="hidden"])', els => els.map(e => ({ type: e.type, id: e.id, value: e.value })));
  log(`Campos: ${JSON.stringify(inputs)}`);

  // Tentar "Continuar com Google" DIRETO nesta tela (sem captcha!)
  try {
    await p.click('a:has-text("Continuar com o Google"), button:has-text("Continuar com o Google"), [data-provider="google"]', { timeout: 5000 });
    log('✅ Clicou Google!');
    await p.waitForTimeout(5000);
    await shot(p, '02-google');
    log(`URL Google: ${p.url().substring(0,80)}`);
  } catch(e) {
    log(`Google não encontrado: ${e.message.substring(0,50)}`);
    
    // Tentar "Mais Opções de Inscrição"
    try {
      await p.click('a:has-text("Mais Opções"), button:has-text("Mais Opções")', { timeout: 3000 });
      log('✅ Clicou Mais Opções');
      await p.waitForTimeout(3000);
      await shot(p, '02-more-options');
    } catch(e2) { log(`Mais opções: ${e2.message.substring(0,40)}`); }
    
    // Ver o que tem
    const allClickable = await p.$$eval('a, button', els => els.map(e => ({ text: e.innerText?.trim().substring(0,40), tag: e.tagName })).filter(e => e.text));
    log(`Elementos clicáveis: ${JSON.stringify(allClickable)}`);
    await shot(p, '02-fallback');
  }

  await p.waitForTimeout(20000);
  await b.close();
  log('🏁 Finalizado');
})().catch(e => {
  log(`❌ ERRO: ${e.message.substring(0,100)}`);
  process.exit(1);
});
