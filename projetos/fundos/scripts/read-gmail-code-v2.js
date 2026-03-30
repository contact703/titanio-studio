/**
 * Victor Capital — Ler código Microsoft do Gmail (perfil copiado)
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';
// Pegar o tmpdir do argumento ou usar default
const CHROME_COPY = process.argv[2] || '/tmp/chrome-titanio-copy';

let step = 0;
async function shot(page, label) {
  step++;
  const p = path.join(OUTDIR, `gmail-${String(step).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`📸 ${p}`);
}

async function run() {
  console.log('🔍 Usando perfil Chrome copiado:', CHROME_COPY);
  
  const browser = await chromium.launchPersistentContext(CHROME_COPY, {
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    viewport: { width: 1280, height: 900 },
    slowMo: 300,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  console.log('📧 Abrindo Gmail...');
  await page.goto('https://mail.google.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await shot(page, '01-loaded');
  console.log('URL:', page.url());
  console.log('Título:', await page.title());

  // Se chegou na caixa de entrada, buscar email da Microsoft
  if (page.url().includes('mail.google.com')) {
    console.log('✅ Gmail carregado!');
    
    // Buscar emails da Microsoft
    await page.goto('https://mail.google.com/mail/u/0/#search/from%3Amicrosoft+newer_than%3A1d', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await shot(page, '02-search');
    
    // Listar assuntos dos emails
    const subjects = await page.$$eval('.y6', els => els.map(e => e.innerText?.trim()).filter(Boolean));
    console.log('📩 Emails Microsoft encontrados:', subjects);
    
    // Clicar no primeiro resultado
    const firstEmail = await page.$('.zA');
    if (firstEmail) {
      await firstEmail.click();
      await page.waitForTimeout(3000);
      await shot(page, '03-email-aberto');
      
      const body = await page.$$eval('.a3s.aiL, .a3s', els => els.map(e => e.innerText).join('\n'));
      console.log('\n📧 Corpo:', body.substring(0, 800));
      
      const code = body.match(/\b(\d{6,8})\b/)?.[1];
      if (code) {
        console.log('\n🔑 CÓDIGO MICROSOFT:', code);
        fs.writeFileSync('/tmp/ms-code.txt', code);
      }
    } else {
      console.log('❌ Nenhum email da Microsoft encontrado. Verificando inbox...');
      await page.goto('https://mail.google.com/mail/u/0/#inbox', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      await shot(page, '03-inbox');
    }
  } else {
    console.log('⚠️ Gmail pediu login. URL:', page.url());
    await shot(page, '02-login-required');
  }

  await page.waitForTimeout(5000);
  await browser.close();
  console.log('\n✅ Pronto. Screenshots em:', OUTDIR);
}

run().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
