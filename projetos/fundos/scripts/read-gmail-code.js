/**
 * Victor Capital — Ler código Microsoft do Gmail via Chrome existente
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots';
const CHROME_PROFILE = '/Volumes/TITA_039/MAC_MINI_03/Library/Application Support/Google/Chrome';

let step = 0;
async function shot(page, label) {
  step++;
  const p = path.join(OUTDIR, `gmail-${String(step).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`📸 ${p}`);
  return p;
}

async function run() {
  console.log('🔍 Abrindo Chrome com perfil existente (sessão já logada)...');
  
  const browser = await chromium.launchPersistentContext(CHROME_PROFILE, {
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
    viewport: { width: 1280, height: 900 },
    slowMo: 300,
  });

  const page = await browser.newPage();

  // Abrir Gmail e buscar email da Microsoft
  console.log('📧 Abrindo Gmail...');
  await page.goto('https://mail.google.com/mail/u/0/#search/from%3Amicrosoft+subject%3Acódigo', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await shot(page, 'gmail-loaded');
  console.log('URL:', page.url());

  // Se não logou, tentar inbox diretamente
  if (page.url().includes('accounts.google.com')) {
    console.log('⚠️ Gmail pediu login — tentando inbox sem busca');
    await page.goto('https://mail.google.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await shot(page, 'gmail-inbox');
  }

  // Verificar se está logado e mostrar emails recentes
  const subject = await page.title();
  console.log('Título:', subject);

  // Buscar emails da Microsoft com código
  const emails = await page.$$eval('[data-thread-id], .zA', els => 
    els.slice(0, 10).map(e => ({ text: e.innerText?.substring(0, 150) }))
  );
  console.log('📩 Emails recentes:', JSON.stringify(emails, null, 2));

  // Clicar no email mais recente da Microsoft
  try {
    await page.click('.zA:first-child', { timeout: 5000 });
    await page.waitForTimeout(2000);
    await shot(page, 'email-aberto');
    
    // Extrair código do email
    const body = await page.$$eval('.a3s, .gmail_quote', els => els.map(e => e.innerText).join('\n'));
    console.log('📧 Corpo do email:', body.substring(0, 500));
    
    // Procurar código de 6-8 dígitos
    const codeMatch = body.match(/\b(\d{6,8})\b/);
    if (codeMatch) {
      console.log('✅ CÓDIGO ENCONTRADO:', codeMatch[1]);
      fs.writeFileSync('/tmp/ms-code.txt', codeMatch[1]);
    } else {
      console.log('❌ Código não encontrado no corpo. Verificar screenshot.');
    }
  } catch(e) {
    console.log('⚠️ Não clicou no email:', e.message);
  }

  await page.waitForTimeout(8000);
  await shot(page, 'final');
  await browser.close();
}

run().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
