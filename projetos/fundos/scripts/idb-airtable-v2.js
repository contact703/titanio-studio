// IDB Lab Airtable v2 - Via iframe frames
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

const DADOS = {
  nome: 'Tiago Arakilian Affonso',
  email: 'tiago@titaniofilms.com',
  empresa: 'Titanio Studio',
  site: 'https://titaniofilms.com',
  descricao: 'VoxDescriber is an AI-powered audio description system for 6.5 million visually impaired Brazilians. Uses WhisperX, Qwen2.5 LLM, and Piper TTS. Works offline. Complies with NBR 15290. Target: media companies, broadcasters, OTT platforms mandated by accessibility law.',
  pais: 'Brazil',
  setor: 'AI / Accessibility / Media Technology',
  etapa: 'Pre-revenue / MVP',
};

(async () => {
  const ts = new Date().toISOString();
  log(`\n---\n### IDB Lab Airtable v2 — ${ts}`);
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  try {
    await page.goto('https://airtable.com/apperI6xBpfHml1rE/pagSorajtGqp8nX7h/form', { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(6000);
    await shot(page, 'at2-01-loaded');
    log(`URL: ${page.url()}`);
    log(`Title: ${await page.title()}`);
    
    // Listar frames
    const frames = page.frames();
    log(`Frames: ${frames.length}`);
    frames.forEach((f, i) => log(`  Frame ${i}: ${f.url()}`));
    
    // Procurar campos no frame principal com wait
    await page.waitForSelector('input, [role="textbox"], [contenteditable="true"]', { timeout: 10000 }).catch(() => {});
    
    // Listar todos os elementos interativos
    const allInputs = await page.$$eval('input, textarea, [role="textbox"], [contenteditable="true"], select', els =>
      els.map(e => ({
        tag: e.tagName, type: e.type || '', id: e.id, name: e.name || '',
        placeholder: e.getAttribute('placeholder') || '',
        'aria-label': e.getAttribute('aria-label') || '',
        role: e.getAttribute('role') || ''
      }))
      .filter(e => !['hidden', 'submit'].includes(e.type))
    );
    log(`Inputs encontrados: ${JSON.stringify(allInputs.slice(0,30))}`);
    
    // Airtable usa [contenteditable] ou inputs específicos
    const contentEditables = await page.$$('[contenteditable="true"]');
    log(`ContentEditable: ${contentEditables.length}`);
    
    // Listar labels visíveis
    const labels = await page.$$eval('[data-testid="field-name"], label, .fieldLabelContainer, h2', els =>
      els.map(e => e.textContent.trim()).filter(t => t.length > 0 && t.length < 150)
    );
    log(`Labels visíveis: ${JSON.stringify(labels.slice(0,20))}`);
    
    // Tirar screenshot da estrutura atual
    const bodyHtml = await page.evaluate(() => document.body.innerHTML.substring(0, 3000));
    log(`HTML snippet: ${bodyHtml.substring(0, 1000)}`);
    
    // Tentar clicar e preencher contenteditable
    for (let i = 0; i < Math.min(contentEditables.length, 5); i++) {
      try {
        const label = await page.evaluate((el, idx) => {
          // Tentar achar label acima
          let p = el.parentElement;
          for (let j = 0; j < 5; j++) {
            const lbl = p?.querySelector('label, [class*="label"], h2, h3, strong');
            if (lbl) return lbl.textContent.trim();
            p = p?.parentElement;
          }
          return `field_${idx}`;
        }, contentEditables[i], i);
        
        log(`ContentEditable ${i}: label="${label}"`);
        
        await contentEditables[i].click();
        await page.waitForTimeout(500);
        
        if (/name|nome/i.test(label)) await contentEditables[i].fill(DADOS.nome);
        else if (/email/i.test(label)) await contentEditables[i].fill(DADOS.email);
        else if (/company|empresa|org/i.test(label)) await contentEditables[i].fill(DADOS.empresa);
        else if (/website|site|url/i.test(label)) await contentEditables[i].fill(DADOS.site);
        else if (/country|pais/i.test(label)) await contentEditables[i].fill(DADOS.pais);
        else if (/description|projeto|project|summary/i.test(label)) await contentEditables[i].fill(DADOS.descricao);
        
        log(`✅ Campo ${i} preenchido`);
      } catch(e) {
        log(`⚠️ ContentEditable ${i}: ${e.message.substring(0,80)}`);
      }
    }
    
    await shot(page, 'at2-02-filled');
    
    // Tentar submit
    try {
      await page.click('button[data-testid="form-submit-btn"], button:has-text("Submit"), button:has-text("Send")', { timeout: 5000 });
      await page.waitForTimeout(4000);
      await shot(page, 'at2-03-submitted');
      const txt = await page.evaluate(() => document.body.innerText.substring(0, 400));
      log(`Resposta: ${txt}`);
      if (/thank|success/i.test(txt)) log('🎉 IDB Lab Airtable: SUBMETIDO COM SUCESSO!');
    } catch(e) {
      log(`⚠️ Submit Airtable: ${e.message.substring(0,100)}`);
    }
    
    await shot(page, 'at2-99-final');
    log(`📌 STATUS IDB Airtable v2: Formulário explorado via frames/contenteditable`);

  } catch(e) {
    log(`❌ ERRO IDB Airtable v2: ${e.message.substring(0,200)}`);
    await shot(page, 'at2-error').catch(() => {});
  } finally {
    await browser.close();
    log('🏁 idb-airtable-v2 finalizado\n');
  }
})();
