/**
 * Victor Capital — Auto-submissão Microsoft for Startups (Self-serve path)
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

let step = 0;
async function shot(page, label) {
  step++;
  const p = path.join(OUTDIR, `ms2-${String(step).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`📸 ${p}`);
  return p;
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto('https://foundershub.startups.microsoft.com/signup', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Aceitar cookies
  try { await page.click('button:has-text("Aceitar")', { timeout: 4000 }); } catch(e) {}
  await page.waitForTimeout(2000);

  // Clicar em "Inscrever-se com o Azure" (self-serve, $5k)
  console.log('🔵 Clicando em Inscrever-se com o Azure...');
  try {
    await page.click('button:has-text("Inscrever-se"), a:has-text("Inscrever-se"), button:has-text("Azure"), a:has-text("Azure")', { timeout: 5000 });
    console.log('✅ Clicou no botão Azure');
  } catch(e) {
    // Tentar por posição — segundo card
    const buttons = await page.$$('button, a.button, a[class*="btn"], a[class*="cta"]');
    console.log(`Botões encontrados: ${buttons.length}`);
    if (buttons.length >= 2) {
      await buttons[buttons.length - 1].click();
      console.log('✅ Clicou no último botão/CTA');
    }
  }

  await page.waitForTimeout(3000);
  await shot(page, 'after-click');
  console.log('URL atual:', page.url());

  // Aguardar navegação para Microsoft login ou próxima etapa
  await page.waitForTimeout(4000);
  await shot(page, 'next-step');
  console.log('URL:', page.url());

  // Ver campos desta etapa
  const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder })));
  console.log('Inputs:', JSON.stringify(inputs));

  // Se chegou na tela de login Microsoft
  const emailInput = await page.$('input[type="email"], input[name="loginfmt"], input[id*="email"]');
  if (emailInput) {
    console.log('🔑 Tela de login Microsoft detectada — preenchendo email...');
    await emailInput.fill('contact@titaniofilms.com');
    await shot(page, 'email-filled');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await shot(page, 'after-email');
    console.log('URL:', page.url());
  }

  await page.waitForTimeout(10000);
  await shot(page, 'final');

  await browser.close();
  console.log('\n✅ Finalizado. Verificar screenshots em:', OUTDIR);
}

run().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
