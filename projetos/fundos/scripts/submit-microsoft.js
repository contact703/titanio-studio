/**
 * Victor Capital — Auto-submissão Microsoft for Startups
 * Titanio Producoes Artisticas Ltda | CNPJ 08.103.457/0001-33
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const COMPANY = {
  name: 'Titanio Studio',
  website: 'https://titaniofilms.com',
  email: 'contact@titaniofilms.com',
  country: 'Brazil',
  firstName: 'Tiago',
  lastName: 'Affonso',
  phone: '+553183838181',
  description: 'Titanio Studio is a Brazilian AI startup building accessibility and media technology. Our flagship product, VoxDescriber, is an offline AI-powered audio description tool for visually impaired users, targeting 6.5 million Brazilians with visual disabilities in compliance with NBR 15290. We use local AI models (WhisperX, Qwen2.5-VL, Piper TTS) to generate professional-grade audio descriptions without cloud dependency.',
};

async function screenshot(page, name) {
  const p = path.join(OUTDIR, `ms-${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`📸 ${p}`);
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log('🔵 Abrindo Microsoft for Startups...');
  await page.goto('https://foundershub.startups.microsoft.com/signup', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Aceitar cookies se aparecer
  try {
    await page.click('button:has-text("Aceitar")', { timeout: 5000 });
    console.log('✅ Cookies aceitos');
  } catch(e) {}

  await page.waitForTimeout(2000);
  await screenshot(page, '01-loaded');

  // Rolar para o formulário
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(1500);
  await screenshot(page, '02-scrolled');

  // Mapear todos os campos interativos
  const fields = await page.$$eval('input, select, textarea, button[type="submit"], a[href*="signup"], a[href*="register"]', els =>
    els.map(e => ({ tag: e.tagName, type: e.type, name: e.name, id: e.id, placeholder: e.placeholder, text: e.innerText?.substring(0,60), ariaLabel: e.getAttribute('aria-label'), href: e.href }))
  );
  console.log('📋 Campos/elementos:', JSON.stringify(fields, null, 2));

  // Verificar se há botão de "Get started" ou similar
  const ctaSelectors = [
    'a:has-text("Get started")',
    'a:has-text("Apply now")',
    'a:has-text("Sign up")',
    'a:has-text("Join")',
    'button:has-text("Get started")',
    'button:has-text("Apply")',
    '[data-testid*="signup"]',
    '.cta',
    'a[href*="apply"]',
    'a[href*="join"]',
  ];

  for (const sel of ctaSelectors) {
    try {
      const el = await page.$(sel);
      if (el) {
        const text = await el.innerText();
        const href = await el.getAttribute('href');
        console.log(`🔗 CTA encontrado: "${text}" → ${href}`);
      }
    } catch(e) {}
  }

  await screenshot(page, '03-full-page');

  // Pegar todo o HTML para análise
  const html = await page.content();
  const formSection = html.match(/<form[\s\S]*?<\/form>/gi)?.[0]?.substring(0, 3000) || 'Nenhum form encontrado';
  console.log('\n📄 Form HTML:', formSection.substring(0, 1000));

  // Verificar se precisa de login Microsoft primeiro
  const loginLink = await page.$('a[href*="login.microsoft"], a[href*="microsoftonline"], a[href*="microsoft.com/signin"]');
  if (loginLink) {
    const href = await loginLink.getAttribute('href');
    console.log('🔐 Login Microsoft necessário:', href);
  }

  console.log('\n⏳ Aguardando 15s para inspeção...');
  await page.waitForTimeout(15000);
  await screenshot(page, '04-final');

  await browser.close();
  console.log('✅ Script finalizado. Screenshots em:', OUTDIR);
}

run().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
