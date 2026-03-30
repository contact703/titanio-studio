/**
 * Debug — mapear exatamente o botão Sign Up / Login
 */
const { chromium } = require('playwright');
const fs = require('fs');

const OUTDIR = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/projetos/fundos/screenshots/nvidia-phoenix';

(async () => {
  const b = await chromium.launch({ headless: false, slowMo: 400 });
  const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
  page.setDefaultTimeout(25000);

  await page.goto('https://programs.nvidia.com/phoenix/application?ncid=no-ncid', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  try { await page.click('button:has-text("Accept All")', { timeout: 3000 }); } catch(e) {}
  await page.waitForTimeout(1500);

  // Preencher email
  await page.fill('#input-30', 'tiago@titaniofilms.com');
  await page.waitForTimeout(800);

  // Mapear TODOS os botões
  const allBtns = await page.$$eval('button', btns => btns.map(b => ({
    text: b.innerText.trim().substring(0,50),
    type: b.type,
    class: b.className.substring(0,80),
    id: b.id,
    disabled: b.disabled,
    visible: b.offsetParent !== null
  })));
  console.log('TODOS OS BOTÕES:');
  console.log(JSON.stringify(allBtns, null, 2));

  // Screenshot com email preenchido
  await page.screenshot({ path: OUTDIR + '/debug-btn.png', fullPage: true });
  console.log('📸 ' + OUTDIR + '/debug-btn.png');

  // Tentar clicar de múltiplas formas
  // 1. Por texto exato
  try {
    await page.getByRole('button', { name: /sign up/i }).click({ timeout: 3000 });
    console.log('✅ Role button click funcionou');
  } catch(e) {
    console.log('❌ Role button: ' + e.message.substring(0,60));
  }

  await page.waitForTimeout(3000);
  await page.screenshot({ path: OUTDIR + '/debug-after-click.png' });
  console.log('URL: ' + page.url());

  // Aguardar para ver o que aconteceu
  await page.waitForTimeout(10000);
  await page.screenshot({ path: OUTDIR + '/debug-final.png' });
  console.log('URL final: ' + page.url());

  await b.close();
})().catch(e => console.error('ERRO:', e.message));
