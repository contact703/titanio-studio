const { chromium } = require('playwright');
const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia';
const fs = require('fs');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

let step = 0;
async function shot(page, label) {
  step++;
  const p = `${OUTDIR}/${String(step).padStart(2,'0')}-${label}.png`;
  await page.screenshot({ path: p, fullPage: false });
  console.log('📸', p);
}

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  await p.goto('https://www.nvidia.com/en-us/startups/', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(4000);

  // Fechar cookie banner
  try { await p.click('button:has-text("Accept All"), button:has-text("Reject Optional")', { timeout: 4000 }); console.log('✅ Cookie fechado'); } catch(e) {}
  await p.waitForTimeout(1500);
  
  // Fechar banner Brasil se aparecer
  try { await p.click('button:has-text("Continuar"), button:has-text("Continue"), button:has-text("Dismiss"), button:has-text("×")', { timeout: 3000 }); console.log('✅ Banner Brasil fechado'); } catch(e) {}
  await p.waitForTimeout(1500);
  await shot(p, 'clean');

  // Clicar "Apply Now"
  try {
    await p.click('a:has-text("Apply Now"), button:has-text("Apply Now"), a:has-text("Apply"), .apply-btn', { timeout: 5000 });
    console.log('✅ Clicou Apply Now');
  } catch(e) {
    console.log('Scroll até o botão...');
    await p.evaluate(() => window.scrollTo(0, 600));
    await p.waitForTimeout(1000);
    await p.click('a:has-text("Apply"), button:has-text("Apply")', { timeout: 5000 }).catch(() => console.log('CTA não encontrado'));
  }

  await p.waitForTimeout(4000);
  await shot(p, 'after-apply');
  console.log('URL:', p.url());

  // Preencher formulário se estiver visível
  // Campos típicos do NVIDIA Inception
  const fields = {
    '#first_name, [name*="first"], [id*="firstName"]': 'Tiago',
    '#last_name, [name*="last"], [id*="lastName"]': 'Affonso',
    '#email, [type="email"], [name*="email"]': 'contact@titaniofilms.com',
    '[name*="company"], [id*="company"], [placeholder*="company" i]': 'Titanio Studio',
    '[name*="website"], [id*="website"], [placeholder*="website" i]': 'https://titaniofilms.com',
    '[name*="title"], [id*="title"], [placeholder*="title" i]': 'CEO',
    '[name*="phone"], [id*="phone"], [placeholder*="phone" i]': '+5531838381881',
  };

  for (const [sel, val] of Object.entries(fields)) {
    try {
      await p.fill(sel, val);
      console.log(`✅ ${sel.substring(0,30)} = ${val}`);
    } catch(e) { /* campo não existe */ }
  }

  await shot(p, 'filled');

  // Mapear campos reais que foram encontrados
  const realInputs = await p.$$eval('input:not([type="hidden"]):not([type="checkbox"]):not([type="submit"]), select, textarea', els =>
    els.map(e => ({ type: e.type, name: e.name, id: e.id, value: e.value, ph: e.placeholder.substring(0,30) }))
  );
  console.log('Campos preenchidos:', JSON.stringify(realInputs));

  await p.waitForTimeout(15000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
