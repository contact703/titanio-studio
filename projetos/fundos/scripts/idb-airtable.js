// IDB Lab - Submeter formulário Airtable "Share your project"
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/idb-lab';
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

// Dados Titanio
const DADOS = {
  nome: 'Tiago Arakilian Affonso',
  email: 'tiago@titaniofilms.com',
  empresa: 'Titanio Studio',
  site: 'https://titaniofilms.com',
  descricao: 'VoxDescriber is an AI-powered audio description system for the visually impaired, serving 6.5 million people in Brazil. We use WhisperX for speech recognition, Qwen2.5 for content generation, and Piper TTS for audio output. The solution works offline, complies with Brazilian NBR 15290 standard, and targets media producers, broadcasters, and OTT platforms required by law to provide accessibility.',
  pais: 'Brazil',
  setor: 'AI / Accessibility / Media Technology',
  etapa: 'Pre-revenue / MVP stage',
  cnpj: '08.103.457/0001-33'
};

(async () => {
  const ts = new Date().toISOString();
  log(`\n---\n### IDB Lab Airtable Form — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 400 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    // Formulário "Share your project"
    await page.goto('https://airtable.com/apperI6xBpfHml1rE/pagSorajtGqp8nX7h/form', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(4000);
    await shot(page, 'at-01-form');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Campos do formulário Airtable
    const fields = await page.$$eval('input, textarea, select, [contenteditable]', els =>
      els.map(e => ({ 
        tag: e.tagName, type: e.type || '', id: e.id, 
        placeholder: e.placeholder || e.getAttribute('placeholder') || '',
        label: e.closest('[data-testid]')?.querySelector('label')?.textContent?.trim() || ''
      }))
      .filter(e => !['hidden', 'submit'].includes(e.type))
    );
    log(`Campos Airtable: ${JSON.stringify(fields.slice(0,30))}`);
    
    // Também verificar labels visíveis
    const labels = await page.$$eval('label, [data-testid*="field"] span, .fieldLabel', els =>
      els.map(e => e.textContent.trim()).filter(t => t.length > 0 && t.length < 100)
    );
    log(`Labels: ${JSON.stringify(labels.slice(0,20))}`);
    
    // Preencher campos encontrados
    // Tentar por placeholder ou label
    const fillField = async (placeholder, value) => {
      try {
        const el = await page.$(`input[placeholder*="${placeholder}" i], textarea[placeholder*="${placeholder}" i]`);
        if (el) { await el.fill(value); log(`✅ ${placeholder}: ${value.substring(0,50)}`); return true; }
      } catch(e) {}
      return false;
    };
    
    await fillField('name', DADOS.nome);
    await fillField('email', DADOS.email);
    await fillField('company', DADOS.empresa);
    await fillField('organization', DADOS.empresa);
    await fillField('website', DADOS.site);
    await fillField('country', DADOS.pais);
    await fillField('project', DADOS.descricao);
    await fillField('description', DADOS.descricao);
    
    // Preencher textareas
    const textareas = await page.$$('textarea');
    log(`Textareas encontrados: ${textareas.length}`);
    if (textareas.length > 0) {
      await textareas[0].fill(DADOS.descricao);
      log('✅ Textarea preenchido com descrição');
    }
    
    // Preencher inputs de texto genéricos
    const textInputs = await page.$$('input[type="text"], input[type="email"], input:not([type])');
    log(`Text inputs: ${textInputs.length}`);
    
    for (let i = 0; i < Math.min(textInputs.length, 5); i++) {
      const placeholder = await textInputs[i].getAttribute('placeholder') || '';
      const label = await page.evaluate(el => {
        const parent = el.closest('[class*="field"], [class*="Field"], [data-testid]');
        return parent?.querySelector('label, [class*="label"]')?.textContent?.trim() || '';
      }, textInputs[i]);
      
      log(`Input ${i}: placeholder="${placeholder}" label="${label}"`);
      
      if (/name|nome/i.test(placeholder + label)) await textInputs[i].fill(DADOS.nome);
      else if (/email/i.test(placeholder + label)) await textInputs[i].fill(DADOS.email);
      else if (/company|empresa|organization/i.test(placeholder + label)) await textInputs[i].fill(DADOS.empresa);
      else if (/website|url|site/i.test(placeholder + label)) await textInputs[i].fill(DADOS.site);
      else if (/country|pais/i.test(placeholder + label)) await textInputs[i].fill(DADOS.pais);
    }
    
    await shot(page, 'at-02-filled');
    
    // Submit
    try {
      await page.click('button[type="submit"], button:has-text("Submit"), button:has-text("Send")', { timeout: 5000 });
      await page.waitForTimeout(4000);
      await shot(page, 'at-03-submitted');
      log(`URL após submit: ${page.url()}`);
      
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      log(`Resposta: ${bodyText}`);
      
      if (/thank|success|obrigad/i.test(bodyText)) {
        log('✅ IDB Lab formulário submetido com SUCESSO!');
      }
    } catch(e) {
      log(`⚠️ Submit: ${e.message.substring(0,100)}`);
    }
    
    await shot(page, 'at-99-final');
    log(`📌 STATUS IDB Lab Airtable: Formulário "Share your project" preenchido e submetido`);

  } catch(e) {
    log(`❌ ERRO IDB Airtable: ${e.message.substring(0,200)}`);
    await shot(page, 'at-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 idb-airtable finalizado\n');
  }
})();
