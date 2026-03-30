// NVIDIA Inception v5 - Direto no formulário sem Google auth
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-v5';
const LOG = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/submissao-log.md';

function log(msg) {
  const ts = new Date().toISOString();
  console.log(msg);
  fs.appendFileSync(LOG, msg + '\n');
}

async function shot(page, name) {
  const file = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  log(`📸 ${file}`);
  return file;
}

(async () => {
  const ts = new Date().toISOString();
  log(`\n---\n### NVIDIA Inception v5 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    // Step 1: Ir direto para o formulário de aplicação NVIDIA Inception
    await page.goto('https://www.nvidia.com/en-us/startups/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await shot(page, '01-landing');
    log(`URL: ${page.url()}`);
    
    // Procurar botão Apply/Join
    const applyBtns = await page.$$eval('a, button', els => 
      els.filter(e => /apply|join|inception|start/i.test(e.textContent + e.href))
         .map(e => ({ text: e.textContent.trim().substring(0,60), href: e.href || '', tag: e.tagName }))
    );
    log(`Botões Apply: ${JSON.stringify(applyBtns.slice(0,10))}`);
    
    // Tentar clicar no Join/Apply
    try {
      await page.click('text=/join now|apply now|join inception/i', { timeout: 5000 });
      await page.waitForTimeout(2000);
      await shot(page, '02-after-click');
      log(`URL após click: ${page.url()}`);
    } catch(e) {
      log(`⚠️ Botão não clicado: ${e.message.substring(0,100)}`);
    }
    
    // Tentar URL direta do programa
    await page.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await shot(page, '03-phoenix-form');
    log(`URL Phoenix: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Analisar campos disponíveis
    const campos = await page.$$eval('input, select, textarea, button', els =>
      els.map(e => ({ tag: e.tagName, type: e.type || '', id: e.id, name: e.name, placeholder: e.placeholder || '', value: e.value || '' }))
         .filter(e => e.tag !== 'INPUT' || !['hidden'].includes(e.type))
    );
    log(`Campos: ${JSON.stringify(campos.slice(0,20))}`);
    
    // Verificar se tem opção "More Sign In Options" ou similar
    const textoBotoes = await page.$$eval('button, a', els => 
      els.map(e => e.textContent.trim()).filter(t => t.length > 0 && t.length < 100)
    );
    log(`Botões/links texto: ${JSON.stringify(textoBotoes.slice(0,30))}`);
    
    // Tentar email field primeiro (caso não precise Google)
    try {
      const emailField = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
      if (emailField) {
        await emailField.fill('tiago@titaniofilms.com');
        log('✅ Email preenchido: tiago@titaniofilms.com');
        await shot(page, '04-email-filled');
        
        // Tentar continuar
        await page.keyboard.press('Tab');
        await page.waitForTimeout(1000);
        await shot(page, '05-after-tab');
      }
    } catch(e) {
      log(`⚠️ Email field: ${e.message.substring(0,100)}`);
    }
    
    // Status final
    await shot(page, '99-final');
    log(`URL final: ${page.url()}`);
    log(`⚠️ NVIDIA: Bloqueado por hCaptcha e Google auth — senhas incorretas. Necessita intervenção manual.`);
    log(`📌 STATUS: BLOQUEADO_AUTH — próximo passo: Tiago fazer login em https://programs.nvidia.com/phoenix/application?ncid=no-ncid com conta Google`);

  } catch(e) {
    log(`❌ ERRO: ${e.message.substring(0,200)}`);
    await shot(page, 'error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 nvidia-v5 finalizado\n');
  }
})();
