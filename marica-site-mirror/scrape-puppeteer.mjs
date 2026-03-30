import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.join(__dirname, 'site');

const pages = [
  { url: 'https://maricafilmcommission.com/', name: 'index.html' },
  { url: 'https://maricafilmcommission.com/pt/home-portugues/', name: 'pt/index.html' },
  { url: 'https://maricafilmcommission.com/en/home/', name: 'en/index.html' },
  { url: 'https://maricafilmcommission.com/pt/locacoes/', name: 'pt/locacoes.html' },
  { url: 'https://maricafilmcommission.com/en/locations/', name: 'en/locations.html' },
  { url: 'https://maricafilmcommission.com/pt/envie-uma-locacao/', name: 'pt/envie-locacao.html' },
  { url: 'https://maricafilmcommission.com/en/send-a-location/', name: 'en/send-location.html' },
  { url: 'https://maricafilmcommission.com/pt/contato/', name: 'pt/contato.html' },
  { url: 'https://maricafilmcommission.com/en/contact/', name: 'en/contact.html' },
  { url: 'https://maricafilmcommission.com/pt/sobre/', name: 'pt/sobre.html' },
  { url: 'https://maricafilmcommission.com/en/about/', name: 'en/about.html' },
];

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {}
}

async function downloadAssets(page, html, baseUrl) {
  const assets = new Set();
  
  // Extract CSS, JS, and image URLs
  const cssMatches = html.matchAll(/href=["']([^"']+\.css[^"']*)/g);
  const jsMatches = html.matchAll(/src=["']([^"']+\.js[^"']*)/g);
  const imgMatches = html.matchAll(/src=["']([^"']+\.(jpg|jpeg|png|gif|webp|svg)[^"']*)/gi);
  const bgMatches = html.matchAll(/url\(['"]?([^'")\s]+\.(jpg|jpeg|png|gif|webp|svg)[^'")\s]*)/gi);
  
  for (const m of cssMatches) assets.add(m[1]);
  for (const m of jsMatches) assets.add(m[1]);
  for (const m of imgMatches) assets.add(m[1]);
  for (const m of bgMatches) assets.add(m[1]);
  
  console.log(`  Found ${assets.size} assets`);
  return assets;
}

async function scrapePage(browser, pageInfo) {
  console.log(`Scraping: ${pageInfo.url}`);
  const page = await browser.newPage();
  
  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait for Elementor to render
    await page.waitForTimeout(3000);
    
    // Get the full rendered HTML
    const html = await page.content();
    
    // Save HTML
    const filePath = path.join(siteDir, pageInfo.name);
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, html);
    console.log(`  Saved: ${pageInfo.name} (${(html.length / 1024).toFixed(1)} KB)`);
    
    // Collect assets
    return await downloadAssets(page, html, pageInfo.url);
  } catch (e) {
    console.error(`  Error: ${e.message}`);
    return new Set();
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('Starting Puppeteer scrape...');
  await ensureDir(siteDir);
  await ensureDir(path.join(siteDir, 'pt'));
  await ensureDir(path.join(siteDir, 'en'));
  await ensureDir(path.join(siteDir, 'assets'));
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const allAssets = new Set();
  
  for (const pageInfo of pages) {
    const assets = await scrapePage(browser, pageInfo);
    for (const a of assets) allAssets.add(a);
  }
  
  await browser.close();
  
  console.log(`\nDone! Scraped ${pages.length} pages`);
  console.log(`Total unique assets found: ${allAssets.size}`);
  
  // Save asset list for later download
  await fs.writeFile(
    path.join(siteDir, 'assets.json'),
    JSON.stringify([...allAssets], null, 2)
  );
}

main().catch(console.error);
