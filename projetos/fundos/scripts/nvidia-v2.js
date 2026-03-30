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
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  await p.goto('https://www.nvidia.com/en-us/startups/', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(3000);

  // Fechar cookie + banner Brasil
  try { await p.click('button:has-text("Accept All")', { timeout: 3000 }); } catch(e) {}
  try { await p.click('.close, button[aria-label="close"], button:has-text("×"), button[class*="close"]', { timeout: 2000 }); } catch(e) {}
  await p.waitForTimeout(1000);

  // Ir direto para a aba "Get Started" que deve ter o form embutido
  try {
    await p.click('a:has-text("Get Started"), button:has-text("Get Started"), [data-tab="get-started"]', { timeout: 5000 });
    console.log('✅ Clicou Get Started');
    await p.waitForTimeout(3000);
    await shot(p, 'get-started');
  } catch(e) {}

  // Rolar para o formulário (está embutido na página, visto nos inputs anteriores)
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await p.waitForTimeout(2000);
  await shot(p, 'mid-scroll');

  // Os campos do formulário foram detectados antes. Tentar preencher por ID
  const formFields = await p.$$eval('input:not([type="hidden"]):not([type="submit"]), select, textarea', els =>
    els.filter(e => e.closest('form') || e.id || e.name).map(e => ({
      tag: e.tagName, type: e.type, id: e.id, name: e.name.substring(0,40),
      placeholder: e.placeholder.substring(0,30), value: e.value
    }))
  );
  console.log('Form fields:', JSON.stringify(formFields, null, 2));

  // Tentar preencher pelo ID do Marketo/Adobe Forms que apareceu
  // Formulário NVIDIA usa Adobe Experience Manager
  const allInputs = await p.$$('input:not([type="hidden"]):not([type="submit"]):not([type="checkbox"])');
  console.log(`Total inputs preenchíveis: ${allInputs.length}`);

  for (const input of allInputs.slice(0, 20)) {
    const id = await input.getAttribute('id').catch(() => '');
    const placeholder = await input.getAttribute('placeholder').catch(() => '');
    const type = await input.getAttribute('type').catch(() => '');
    console.log(`Campo: id=${id}, ph=${placeholder}, type=${type}`);
  }

  await shot(p, 'form-state');
  await p.waitForTimeout(15000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
