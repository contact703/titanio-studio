// YC Signup v2 - Clicar em "Create an account" primeiro
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/yc-v2';
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
  log(`\n---\n### YC Signup v2 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 600 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    await page.goto('https://account.ycombinator.com/?continue=https%3A%2F%2Fapply.ycombinator.com%2Fhome', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await shot(page, 'sv2-01-initial');
    log(`URL: ${page.url()}`);
    
    // Clicar em "Create an account." para exibir o formulário
    try {
      await page.click('text="Create an account."', { timeout: 8000 });
      log('✅ Clicou "Create an account."');
      await page.waitForTimeout(3000);
      await shot(page, 'sv2-02-after-create-click');
    } catch(e) {
      log(`⚠️ Create an account.: ${e.message.substring(0,100)}`);
      // Tentar outros textos
      try {
        await page.click('text=/sign up|create|register/i', { timeout: 5000 });
        await page.waitForTimeout(2000);
        await shot(page, 'sv2-02-alt');
      } catch(e2) {
        log(`⚠️ Alt: ${e2.message.substring(0,100)}`);
      }
    }
    
    log(`URL após click: ${page.url()}`);
    
    // Aguardar campos visíveis
    await page.waitForSelector('input:visible', { timeout: 10000 }).catch(() => {});
    
    // Listar campos visíveis agora
    const visibleFields = await page.$$eval('input:not([type="hidden"])', els =>
      els.filter(e => {
        const rect = e.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .map(e => ({ type: e.type, id: e.id, name: e.name, placeholder: e.placeholder, visible: true }))
    );
    log(`Campos visíveis: ${JSON.stringify(visibleFields)}`);
    
    await shot(page, 'sv2-03-form-visible');
    
    // Preencher campos visíveis
    const fillVisible = async (id, name, value) => {
      for (const selector of [`#${id}`, `input[name="${name}"]`]) {
        if (!id && !name) continue;
        const el = selector === '#' ? null : await page.$(selector).catch(() => null);
        if (el) {
          const isVisible = await el.isVisible();
          if (isVisible) {
            await el.fill(value);
            log(`✅ ${selector}: ${value.substring(0,40)}`);
            return true;
          }
        }
      }
      return false;
    };
    
    await fillVisible('_r_1_', '', 'Tiago');
    await fillVisible('_r_2_', '', 'Arakilian Affonso');
    await fillVisible('_r_3_', '', 'tiago@titaniofilms.com');
    await fillVisible('ycid-input', 'username', 'tiago_titanio');
    await fillVisible('password-input', 'password', 'TitanioYC2026!');
    await fillVisible('_r_4_', '', 'https://www.linkedin.com/in/tiago-arakilian/');
    
    // Tentar por ordem (first visible text input)
    const textInputs = await page.$$('input[type="text"]:visible, input:not([type]):visible');
    log(`Inputs visíveis: ${textInputs.length}`);
    
    const values = ['Tiago', 'Arakilian Affonso', 'tiago@titaniofilms.com', 'tiago_titanio'];
    for (let i = 0; i < Math.min(textInputs.length, 4); i++) {
      try {
        await textInputs[i].fill(values[i] || '');
        log(`✅ Input ${i}: ${values[i]}`);
      } catch(e) {}
    }
    
    // Password
    const pwdInputs = await page.$$('input[type="password"]:visible');
    if (pwdInputs.length > 0) {
      await pwdInputs[0].fill('TitanioYC2026!');
      log('✅ Password');
    }
    
    await shot(page, 'sv2-04-filled');
    
    // Submit
    try {
      await page.click('button:has-text("Sign Up"), input[value="Sign Up"], button[type="submit"]:visible', { timeout: 8000 });
      await page.waitForTimeout(6000);
      await shot(page, 'sv2-05-result');
      log(`URL resultado: ${page.url()}`);
      
      const txt = await page.evaluate(() => document.body.innerText.substring(0, 600));
      log(`Texto resultado: ${txt}`);
      
      if (page.url().includes('apply.ycombinator.com') || /welcome|dashboard|application/i.test(txt)) {
        log('🎉 YC CADASTRO REALIZADO COM SUCESSO!');
      } else if (/email|verif|confirm/i.test(txt)) {
        log('📧 YC: Email de verificação enviado para tiago@titaniofilms.com');
      } else if (/error|invalid|already/i.test(txt)) {
        log(`⚠️ YC: Erro no cadastro: ${txt.substring(0, 200)}`);
      }
    } catch(e) {
      log(`⚠️ Submit final: ${e.message.substring(0,100)}`);
      await shot(page, 'sv2-05-err');
    }
    
    await shot(page, 'sv2-99-final');
    log(`URL final: ${page.url()}`);
    log(`📌 STATUS YC v2: tiago@titaniofilms.com / TitanioYC2026! / user: tiago_titanio`);

  } catch(e) {
    log(`❌ ERRO: ${e.message.substring(0,200)}`);
    await shot(page, 'sv2-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 yc-signup-v2 finalizado\n');
  }
})();
