import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const baseDir = '/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/marica-site-mirror/curl-site';

async function extractUrls() {
  const htmlFiles = [
    'index.html', 'pt/index.html', 'pt/locacoes.html', 'pt/envie-locacao.html', 
    'pt/contato.html', 'pt/sobre.html', 'en/index.html', 'en/locations.html',
    'en/send-location.html', 'en/contact.html', 'en/about.html'
  ];
  
  const urls = new Set();
  const urlRegex = /https:\/\/maricafilmcommission\.com\/wp-content\/[^"'\s>)]+/g;
  const fontRegex = /https:\/\/fonts\.(googleapis|gstatic)\.com\/[^"'\s>)]+/g;
  
  for (const file of htmlFiles) {
    try {
      const content = await fs.readFile(path.join(baseDir, file), 'utf-8');
      for (const match of content.matchAll(urlRegex)) {
        urls.add(match[0].replace(/&amp;/g, '&'));
      }
      for (const match of content.matchAll(fontRegex)) {
        urls.add(match[0].replace(/&amp;/g, '&'));
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
  
  return [...urls];
}

async function downloadAssets(urls) {
  const assetsDir = path.join(baseDir, 'assets');
  await fs.mkdir(assetsDir, { recursive: true });
  
  let downloaded = 0;
  let failed = 0;
  
  // Filter out video files and data URIs
  const validUrls = urls.filter(url => 
    !url.includes('.mp4') && !url.includes('.mov') && 
    !url.includes('.webm') && !url.startsWith('data:')
  );
  
  console.log(`Downloading ${validUrls.length} assets...`);
  
  for (const url of validUrls) {
    try {
      // Create a filename from the URL
      let filename = url.replace(/https:\/\/[^/]+\//, '').replace(/[?&]/g, '_').replace(/=/g, '-');
      filename = filename.substring(0, 200); // Limit filename length
      
      const filePath = path.join(assetsDir, filename);
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Download with curl
      await execAsync(`curl -sL --max-time 30 "${url}" -o "${filePath}"`, { maxBuffer: 50 * 1024 * 1024 });
      downloaded++;
      
      if (downloaded % 10 === 0) {
        console.log(`  Progress: ${downloaded}/${validUrls.length}`);
      }
    } catch (e) {
      failed++;
    }
  }
  
  console.log(`Downloaded: ${downloaded}, Failed: ${failed}`);
  return { downloaded, failed };
}

async function fixHtmlLinks() {
  const htmlFiles = [
    'index.html', 'pt/index.html', 'pt/locacoes.html', 'pt/envie-locacao.html', 
    'pt/contato.html', 'pt/sobre.html', 'en/index.html', 'en/locations.html',
    'en/send-location.html', 'en/contact.html', 'en/about.html'
  ];
  
  for (const file of htmlFiles) {
    try {
      const filePath = path.join(baseDir, file);
      let content = await fs.readFile(filePath, 'utf-8');
      
      // Replace wp-content URLs with local paths
      content = content.replace(
        /https:\/\/maricafilmcommission\.com\/wp-content\//g,
        '/assets/wp-content/'
      );
      
      // Fix internal navigation
      content = content.replace(/https:\/\/maricafilmcommission\.com\/pt\/home-portugues\/?/g, '/pt/');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/en\/home\/?/g, '/en/');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/pt\/locacoes\/?/g, '/pt/locacoes.html');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/en\/locations\/?/g, '/en/locations.html');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/pt\/envie-uma-locacao\/?/g, '/pt/envie-locacao.html');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/en\/send-a-location\/?/g, '/en/send-location.html');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/pt\/contato\/?/g, '/pt/contato.html');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/en\/contact\/?/g, '/en/contact.html');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/pt\/sobre\/?/g, '/pt/sobre.html');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/en\/about\/?/g, '/en/about.html');
      content = content.replace(/https:\/\/maricafilmcommission\.com\/?(['"])/g, '/$1');
      
      await fs.writeFile(filePath, content);
      console.log(`Fixed: ${file}`);
    } catch (e) {
      console.error(`Error fixing ${file}:`, e.message);
    }
  }
}

async function main() {
  console.log('Extracting URLs...');
  const urls = await extractUrls();
  console.log(`Found ${urls.length} asset URLs`);
  
  // Save URL list
  await fs.writeFile(path.join(baseDir, 'asset-urls.json'), JSON.stringify(urls, null, 2));
  
  console.log('Downloading assets...');
  await downloadAssets(urls);
  
  console.log('Fixing HTML links...');
  await fixHtmlLinks();
  
  console.log('Done!');
}

main().catch(console.error);
