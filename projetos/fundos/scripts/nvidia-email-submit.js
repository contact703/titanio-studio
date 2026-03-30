const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

let step = 0;
async function shot(page, label) {
  step++;
  const fp = `${OUTDIR}/${String(step).padStart(2,'0')}-${label}.png`;
  await page.screenshot({ path: fp, fullPage: false });
  console.log('📸', fp);
}

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  await p.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(4000);

  // Fechar cookie banner
  try { await p.click('button:has-text("Accept All"), #onetrust-accept-btn-handler', { timeout: 4000 }); console.log('✅ Cookie aceito'); } catch(e) {}
  await p.waitForTimeout(1500);
  await shot(p, '01-loaded');

  // Preencher o email no campo "Enter your business email"
  await p.waitForSelector('#input-30, input[placeholder*="email" i], input[placeholder*="business email" i]', { timeout: 10000 });
  await p.fill('#input-30', 'contact@titaniofilms.com');
  console.log('✅ Email preenchido: contact@titaniofilms.com');
  await shot(p, '02-email-filled');

  // Procurar botão de submit/next
  const submitSels = [
    'button[type="submit"]',
    'button:has-text("Apply")',
    'button:has-text("Continue")',
    'button:has-text("Next")',
    'button:has-text("Submit")',
    'button:has-text("Start")',
    'input[type="submit"]',
    '.submit-btn',
    '[data-testid*="submit"]',
  ];

  let submitted = false;
  for (const sel of submitSels) {
    try {
      await p.click(sel, { timeout: 3000 });
      console.log('✅ Submit clicado:', sel);
      submitted = true;
      break;
    } catch(e) {}
  }

  if (!submitted) {
    console.log('Tentando Enter...');
    await p.keyboard.press('Enter');
  }

  await p.waitForTimeout(5000);
  await shot(p, '03-after-submit');
  console.log('URL pós-submit:', p.url());
  console.log('Title:', await p.title());

  // Ver se pediu mais info ou confirmou
  const bodyText = await p.innerText('body').catch(() => '');
  if (bodyText.includes('thank') || bodyText.includes('obrigado') || bodyText.includes('success') || bodyText.includes('confirm')) {
    console.log('🎉 SUBMISSÃO CONFIRMADA!');
  } else if (bodyText.includes('error') || bodyText.includes('invalid') || bodyText.includes('required')) {
    console.log('⚠️ Erro na submissão');
  }

  // Se abriu novo formulário com mais campos, mapear
  const moreFields = await p.$$eval('input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]), select, textarea', els =>
    els.map(e => ({ id: e.id, ph: (e.placeholder||'').substring(0,30), type: e.type }))
  );
  console.log('Campos na próxima etapa:', JSON.stringify(moreFields));

  await p.waitForTimeout(20000);
  await b.close();
  console.log('✅ DONE. Screenshots:', OUTDIR);
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
