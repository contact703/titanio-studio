/**
 * Victor Capital — Submissão Microsoft for Startups + leitura código Gmail
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const imaps = require('imap-simple');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/ms-full';
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR, { recursive: true });

const EMAIL = 'contact@titaniofilms.com';
const PASS = 'Rita160679!)';

let step = 0;
async function shot(page, label) {
  step++;
  const p = path.join(OUTDIR, `${String(step).padStart(2,'0')}-${label}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`📸 ${p}`);
}

async function getCodeFromGmail() {
  console.log('📧 Conectando ao Gmail IMAP...');
  const config = {
    imap: {
      user: EMAIL,
      password: PASS,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000,
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const searchCriteria = [
      ['FROM', 'microsoft'],
      ['SINCE', new Date(Date.now() - 10 * 60 * 1000)] // últimos 10 min
    ];
    const fetchOptions = { bodies: ['TEXT', 'HEADER'], struct: true };

    const messages = await connection.search(searchCriteria, fetchOptions);
    console.log(`📩 Emails Microsoft encontrados: ${messages.length}`);

    for (const msg of messages.reverse()) {
      const body = msg.parts.find(p => p.which === 'TEXT');
      if (body) {
        const text = body.body;
        const codeMatch = text.match(/\b(\d{6,8})\b/);
        if (codeMatch) {
          console.log('✅ CÓDIGO:', codeMatch[1]);
          await connection.end();
          return codeMatch[1];
        }
      }
    }
    await connection.end();
    return null;
  } catch(e) {
    console.log('⚠️ IMAP erro:', e.message);
    return null;
  }
}

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // 1. Abrir Microsoft for Startups
  console.log('🔵 Abrindo Microsoft for Startups...');
  await page.goto('https://foundershub.startups.microsoft.com/signup', { waitUntil: 'domcontentloaded' });
  try { await page.click('button:has-text("Aceitar")', { timeout: 3000 }); } catch(e) {}
  await page.waitForTimeout(2000);

  // 2. Clicar em "Inscrever-se com o Azure"
  const btns = await page.$$('a, button');
  for (const btn of btns) {
    const txt = await btn.innerText().catch(() => '');
    if (txt.toLowerCase().includes('inscrever') || txt.toLowerCase().includes('azure')) {
      await btn.click();
      console.log(`✅ Clicou: "${txt.trim()}"`);
      break;
    }
  }
  await page.waitForTimeout(3000);
  await shot(page, 'ms-after-click');

  // 3. Login Microsoft — preencher email
  const emailInput = await page.$('input[type="email"], input[name="loginfmt"]');
  if (emailInput) {
    await emailInput.fill(EMAIL);
    await shot(page, 'ms-email-filled');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    await shot(page, 'ms-after-email');
  }

  // 4. Verificar se pediu senha ou código
  const pwdInput = await page.$('input[type="password"], input[name="passwd"]');
  if (pwdInput) {
    console.log('🔑 Campo de senha detectado...');
    await pwdInput.fill(PASS);
    await shot(page, 'ms-pwd-filled');
    try { await page.click('#idSIButton9, input[type="submit"]', { timeout: 3000 }); } catch(e) {}
    await page.waitForTimeout(3000);
    await shot(page, 'ms-after-pwd');
  }

  // 5. Se pediu código de verificação — buscar no Gmail
  const pageText = await page.innerText('body').catch(() => '');
  if (pageText.includes('código') || pageText.includes('code') || pageText.includes('verificação')) {
    console.log('📧 Página pede código — buscando no Gmail...');
    
    // Clicar em "Enviar código" se ainda não enviou
    try {
      await page.click('button:has-text("Enviar"), input[value*="Send"], button:has-text("Send")', { timeout: 3000 });
      console.log('✅ Clicou em Enviar código');
      await page.waitForTimeout(5000);
    } catch(e) {}

    // Esperar 8s e buscar código no Gmail
    console.log('⏳ Aguardando email chegar...');
    await page.waitForTimeout(8000);

    const code = await getCodeFromGmail();
    if (code) {
      console.log(`✅ Código recebido: ${code}`);
      const codeInput = await page.$('input[type="tel"], input[name*="code"], input[placeholder*="code"], input[placeholder*="código"]');
      if (codeInput) {
        await codeInput.fill(code);
        await shot(page, 'ms-code-filled');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
      }
    } else {
      console.log('❌ Código não encontrado no Gmail. Screenshot para verificação manual.');
      await shot(page, 'ms-code-needed');
    }
  }

  await shot(page, 'ms-final');
  console.log('\nURL final:', page.url());

  await page.waitForTimeout(10000);
  await browser.close();
  console.log('✅ Script finalizado. Screenshots:', OUTDIR);
}

run().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
