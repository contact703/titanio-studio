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

const INFO = {
  firstName: 'Tiago',
  lastName: 'Affonso',
  email: 'contact@titaniofilms.com',
  company: 'Titanio Studio',
  website: 'https://titaniofilms.com',
  title: 'CEO',
  phone: '+5531838381881',
  country: 'Brazil',
  description: 'Titanio Studio develops AI-powered accessibility tools. VoxDescriber creates audio descriptions for 6.5M visually impaired Brazilians using local AI (WhisperX, Qwen2.5-VL, Piper TTS). NVIDIA GPU acceleration would reduce inference from minutes to seconds, enabling real-time accessibility.'
};

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  console.log('🟢 Abrindo formulário NVIDIA...');
  await p.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(5000);
  await shot(p, 'form-loaded');
  console.log('URL:', p.url());
  console.log('Title:', await p.title());

  // Mapear todos os campos
  const allFields = await p.$$eval('input:not([type="hidden"]):not([type="submit"]), select, textarea', els =>
    els.map(e => ({
      tag: e.tagName, type: e.type||'', id: e.id||'', name: (e.name||'').substring(0,40),
      placeholder: (e.placeholder||'').substring(0,30), label: (e.getAttribute('aria-label')||'').substring(0,30)
    }))
  );
  console.log('CAMPOS:', JSON.stringify(allFields, null, 2));

  // Preencher campos comuns por seletor
  const fills = [
    ['input[id*="first" i], input[name*="first" i], input[placeholder*="first" i]', INFO.firstName],
    ['input[id*="last" i], input[name*="last" i], input[placeholder*="last" i]', INFO.lastName],
    ['input[type="email"], input[id*="email" i], input[name*="email" i]', INFO.email],
    ['input[id*="company" i], input[name*="company" i], input[placeholder*="company" i]', INFO.company],
    ['input[id*="website" i], input[name*="website" i], input[placeholder*="website" i]', INFO.website],
    ['input[id*="title" i], input[name*="jobtitle" i], input[placeholder*="title" i]', INFO.title],
    ['input[id*="phone" i], input[name*="phone" i], input[type="tel"]', INFO.phone],
    ['textarea', INFO.description],
  ];

  for (const [sel, val] of fills) {
    try {
      const el = await p.$(sel);
      if (el) { await el.fill(val); console.log(`✅ ${sel.substring(0,35)} = "${val.substring(0,30)}"`); }
    } catch(e) {}
  }

  // Tentar selects de country/industry
  try { await p.selectOption('select[id*="country" i], select[name*="country" i]', { label: 'Brazil' }).catch(() => p.selectOption('select[id*="country" i]', { value: 'BR' })); console.log('✅ País selecionado'); } catch(e) {}
  try { await p.selectOption('select[id*="size" i], select[name*="employee" i], select[id*="employee" i]', { index: 1 }); console.log('✅ Tamanho empresa'); } catch(e) {}

  await shot(p, 'form-filled');
  console.log('Screenshot salvo. Verificando estado...');

  const filledFields = await p.$$eval('input:not([type="hidden"]):not([type="submit"]):not([type="checkbox"]), textarea', els =>
    els.filter(e => e.value).map(e => ({ id: e.id, name: e.name, value: e.value.substring(0,30) }))
  );
  console.log('Campos com valor:', JSON.stringify(filledFields));

  await p.waitForTimeout(15000);
  await b.close();
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
