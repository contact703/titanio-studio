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

const INFO = {
  firstName: 'Tiago',
  lastName: 'Affonso',
  email: 'contact@titaniofilms.com',
  company: 'Titanio Studio',
  website: 'https://titaniofilms.com',
  country: 'Brazil',
  employees: '1-10',
  description: 'Titanio Studio builds AI-powered accessibility tools. VoxDescriber generates audio descriptions for visually impaired users using local AI (WhisperX, Qwen2.5-VL, Piper TTS). GPU acceleration via NVIDIA would reduce inference time from minutes to seconds, enabling real-time audio description for 6.5M visually impaired Brazilians.',
};

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(20000);

  console.log('🟢 Abrindo NVIDIA Inception...');
  await p.goto('https://www.nvidia.com/en-us/startups/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(3000);
  await shot(p, 'loaded');
  console.log('Title:', await p.title());

  // Procurar botão apply/join
  const ctaSelectors = [
    'a:has-text("Apply")', 'a:has-text("Join")', 'a:has-text("Get started")',
    'button:has-text("Apply")', 'a[href*="inception"]', 'a[href*="apply"]',
    'a:has-text("Register")', '.cta-button', '[data-cta]'
  ];
  
  for (const sel of ctaSelectors) {
    const el = await p.$(sel);
    if (el) {
      const txt = await el.innerText().catch(() => '');
      const href = await el.getAttribute('href').catch(() => '');
      console.log(`🔗 CTA: "${txt.trim()}" -> ${href}`);
    }
  }

  await shot(p, 'cta-check');

  // Tentar clicar no primeiro CTA encontrado
  let clicked = false;
  for (const sel of ctaSelectors) {
    try {
      await p.click(sel, { timeout: 3000 });
      console.log('✅ Clicou CTA:', sel);
      clicked = true;
      break;
    } catch(e) {}
  }

  await p.waitForTimeout(4000);
  await shot(p, 'after-click');
  console.log('URL:', p.url());

  // Mapear formulário se abriu
  const inputs = await p.$$eval('input:not([type="hidden"]), select, textarea', els =>
    els.map(e => ({ tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder, label: e.getAttribute('aria-label') || '' }))
  );
  console.log('Inputs:', JSON.stringify(inputs));

  await p.waitForTimeout(15000);
  await b.close();
  console.log('✅ Screenshots:', OUTDIR);
})().catch(e => console.error('ERRO:', e.message.substring(0,100)));
