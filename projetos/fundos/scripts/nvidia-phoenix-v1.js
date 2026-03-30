/**
 * Victor Capital — NVIDIA Inception Application
 * URL: https://programs.nvidia.com/phoenix/application?ncid=no-ncid
 * Email: tiago@titaniofilms.com (NÃO contact@)
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-phoenix';
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const LOG_FILE = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

let step = 0;
async function shot(page, label) {
  step++;
  const fp = path.join(OUTDIR, `${String(step).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: fp, fullPage: false });
  console.log('📸', fp);
  return fp;
}

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG_FILE, msg + '\n');
}

const DATA = {
  firstName: 'Tiago',
  lastName: 'Affonso',
  email: 'tiago@titaniofilms.com',  // Email pessoal conforme instrução
  company: 'Titanio Studio',
  website: 'https://titaniofilms.com',
  country: 'Brazil',
  title: 'CEO',
  phone: '+5531838381881',
  employees: '1-10',
  description: 'VoxDescriber is an offline AI-powered audio description tool for 6.5 million visually impaired Brazilians. We use NVIDIA GPU-accelerated models: WhisperX for speech recognition, Qwen2.5-VL for visual understanding, and Piper TTS for speech synthesis — fully compliant with NBR 15290. NVIDIA Inception would help us scale real-time video AI inference from minutes to seconds.',
};

(async () => {
  log('\n## NVIDIA Inception — ' + new Date().toISOString());
  log('URL: https://programs.nvidia.com/phoenix/application?ncid=no-ncid');

  const b = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  try {
    log('📡 Navegando para formulário NVIDIA Phoenix...');
    await page.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await page.waitForTimeout(4000);
    await shot(page, 'loaded');
    log('URL: ' + page.url());
    log('Title: ' + await page.title());

    // Fechar cookie banners
    for (const sel of ['button:has-text("Accept All")', 'button:has-text("Accept")', '#cookie-accept', '.accept-cookies']) {
      try { await page.click(sel, { timeout: 2000 }); log('✅ Cookie aceito'); break; } catch(e) {}
    }
    await page.waitForTimeout(1500);

    // Mapear todos os campos do formulário
    const inputs = await page.$$eval(
      'input:not([type="hidden"]):not([type="submit"]), select, textarea',
      els => els.map(e => ({
        tag: e.tagName, type: e.type || '', id: e.id || '',
        name: e.name || '', placeholder: (e.placeholder||'').substring(0,40),
        label: (e.getAttribute('aria-label')||'').substring(0,40),
        class: e.className.substring(0,50)
      }))
    );
    log('📋 Campos encontrados: ' + inputs.length);
    console.log(JSON.stringify(inputs, null, 2));

    await shot(page, 'form-state');

    // Tentar preencher campo id="input-30" (email principal conforme instrução)
    try {
      await page.fill('#input-30', DATA.email);
      log('✅ input-30 (email) preenchido: ' + DATA.email);
    } catch(e) {
      log('⚠️ input-30 não encontrado: ' + e.message.substring(0,60));
    }

    // Tentar preencher por padrões comuns
    const fieldMap = [
      ['[id*="email" i], [name*="email" i], [type="email"]', DATA.email],
      ['[id*="firstName" i], [id*="first_name" i], [name*="firstName" i], [placeholder*="First" i]', DATA.firstName],
      ['[id*="lastName" i], [id*="last_name" i], [name*="lastName" i], [placeholder*="Last" i]', DATA.lastName],
      ['[id*="company" i], [name*="company" i], [placeholder*="company" i]', DATA.company],
      ['[id*="website" i], [name*="website" i], [placeholder*="website" i]', DATA.website],
      ['[id*="title" i], [id*="jobtitle" i], [name*="title" i], [placeholder*="title" i]', DATA.title],
      ['[id*="phone" i], [name*="phone" i], [placeholder*="phone" i]', DATA.phone],
    ];

    for (const [sel, val] of fieldMap) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.fill(val);
          const id = await el.getAttribute('id');
          log(`✅ Campo ${id || sel.substring(0,30)} = ${val}`);
        }
      } catch(e) {}
    }

    // Tentar selects (country, employees)
    try {
      const countryEl = await page.$('[id*="country" i], [name*="country" i]');
      if (countryEl) {
        await countryEl.selectOption({ label: 'Brazil' }).catch(() =>
          countryEl.selectOption({ value: 'Brazil' }).catch(() =>
            countryEl.selectOption({ value: 'BR' })
          )
        );
        log('✅ Country: Brazil');
      }
    } catch(e) {}

    try {
      const empEl = await page.$('[id*="employee" i], [id*="size" i], [name*="employee" i]');
      if (empEl) {
        await empEl.selectOption({ label: '1-10' }).catch(() =>
          empEl.selectOption({ value: '1-10' })
        );
        log('✅ Employees: 1-10');
      }
    } catch(e) {}

    await shot(page, 'filled');

    // Verificar se há botão "Sign Up / Login"
    const signupBtns = await page.$$('button:has-text("Sign"), a:has-text("Sign Up"), button:has-text("Login"), a:has-text("Login"), button:has-text("Register")');
    log(`🔘 Botões de signup encontrados: ${signupBtns.length}`);
    for (const btn of signupBtns) {
      const txt = await btn.innerText().catch(() => '');
      log('  - ' + txt.trim());
    }

    // Clicar "Sign Up / Login" se encontrado
    try {
      await page.click('button:has-text("Sign Up"), a:has-text("Sign Up"), button:has-text("Sign up")', { timeout: 5000 });
      log('✅ Clicou Sign Up');
      await page.waitForTimeout(3000);
      await shot(page, 'after-signup-click');
    } catch(e) {
      log('ℹ️ Botão Sign Up não encontrado separadamente');
    }

    // Verificar se há botão de submit
    try {
      const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Apply")');
      if (submitBtn) {
        const txt = await submitBtn.innerText().catch(() => 'submit');
        log('🔘 Botão submit encontrado: ' + txt.trim());
        await shot(page, 'before-submit');
        // NÃO submeter automaticamente — tirar screenshot e pausar
        log('⏸️ PAUSANDO antes de submeter — verificar manualmente');
      }
    } catch(e) {}

    await shot(page, 'final-state');

    // Aguardar para análise manual
    log('⏳ Aguardando 30s para análise...');
    await page.waitForTimeout(30000);
    
    await shot(page, 'end');
    log('✅ Script NVIDIA Phoenix concluído. Ver screenshots em: ' + OUTDIR);

  } catch(e) {
    log('❌ ERRO: ' + e.message);
    await shot(page, 'error').catch(() => {});
  } finally {
    await b.close();
  }
})();
