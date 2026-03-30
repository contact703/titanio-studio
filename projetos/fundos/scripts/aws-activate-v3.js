// AWS Activate v3 - Criar conta AWS completa + preencher accountName
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/aws-activate-v2';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG, msg + '\n');
}

async function shot(page, name) {
  const file = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  log(`📸 ${file}`);
}

(async () => {
  const ts = new Date().toISOString();
  log(`\n---\n### AWS Activate v3 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    await page.goto('https://signin.aws.amazon.com/signup?request_type=register', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await shot(page, 'v3-01-form');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Preencher email
    const emailEl = await page.$('#emailAddress');
    if (emailEl) {
      await emailEl.fill('contact@titaniofilms.com');
      log('✅ Email preenchido: contact@titaniofilms.com');
    }
    
    // Preencher accountName (campo que faltou)
    const accountNameEl = await page.$('#accountName');
    if (accountNameEl) {
      await accountNameEl.fill('Titanio Studio');
      log('✅ Account name preenchido: Titanio Studio');
    }
    
    await shot(page, 'v3-02-filled');
    
    // Submit
    try {
      await page.click('button.awsui_button_vjswe, button[type="submit"], .awsui-button-variant-primary', { timeout: 5000 });
      await page.waitForTimeout(3000);
      await shot(page, 'v3-03-after-submit');
      log(`URL após submit: ${page.url()}`);
      log(`Title após: ${await page.title()}`);
      
      const pageText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      log(`Conteúdo: ${pageText}`);
      
    } catch(e) {
      // Tentar clicar pelo texto
      log(`⚠️ Botão v1: ${e.message.substring(0,100)}`);
      try {
        await page.click('text=/verify|continue|next|criar|create/i', { timeout: 5000 });
        await page.waitForTimeout(3000);
        await shot(page, 'v3-03-alt-submit');
        log(`URL alt: ${page.url()}`);
      } catch(e2) {
        log(`⚠️ Botão v2: ${e2.message.substring(0,100)}`);
        
        // Inspecionar botões disponíveis
        const btns = await page.$$eval('button, input[type="submit"]', els =>
          els.map(e => ({ tag: e.tagName, type: e.type, text: e.textContent.trim(), class: e.className.substring(0,80) }))
        );
        log(`Botões disponíveis: ${JSON.stringify(btns)}`);
        await shot(page, 'v3-04-debug');
        
        // Tentar clicar em qualquer botão visível
        try {
          const btn = await page.$('button:not([disabled])');
          if (btn) {
            await btn.click();
            await page.waitForTimeout(2000);
            await shot(page, 'v3-05-btn-click');
            log(`URL depois: ${page.url()}`);
          }
        } catch(e3) {}
      }
    }
    
    // Verificar se passou para verificação de email
    const finalUrl = page.url();
    const finalTitle = await page.title();
    log(`URL final: ${finalUrl}`);
    log(`Title final: ${finalTitle}`);
    
    if (finalUrl.includes('verify') || finalTitle.toLowerCase().includes('verify')) {
      log('✅ AWS: Passou para verificação de email! Checar contact@titaniofilms.com');
    } else if (finalUrl === 'https://signin.aws.amazon.com/signup?request_type=register') {
      log('⚠️ AWS: Ainda na mesma página. Pode haver erro de validação ou CAPTCHA invisível.');
    }
    
    await shot(page, 'v3-99-final');
    log(`📌 STATUS AWS v3: Email=contact@titaniofilms.com, AccountName=Titanio Studio`);

  } catch(e) {
    log(`❌ ERRO AWS v3: ${e.message.substring(0,200)}`);
    await shot(page, 'v3-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 aws-activate-v3 finalizado\n');
  }
})();
