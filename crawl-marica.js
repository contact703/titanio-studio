const https = require('https');
const http = require('http');
const { URL } = require('url');

const baseUrl = 'https://maricafilmcommission.com';
const visited = new Set();
const toVisit = [baseUrl, baseUrl + '/pt/'];
const allUrls = [];

function fetch(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const req = proto.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve({ redirect: res.headers.location });
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, status: res.statusCode }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function extractLinks(html, currentUrl) {
  const links = [];
  const regex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const url = new URL(match[1], currentUrl);
      if (url.hostname === 'maricafilmcommission.com' && !url.pathname.includes('/wp-')) {
        links.push(url.origin + url.pathname);
      }
    } catch (e) {}
  }
  return links;
}

async function crawl() {
  while (toVisit.length > 0 && visited.size < 100) {
    const url = toVisit.shift();
    if (visited.has(url)) continue;
    visited.add(url);
    
    try {
      const result = await fetch(url);
      if (result.redirect) {
        const newUrl = new URL(result.redirect, url).href;
        if (!visited.has(newUrl)) toVisit.push(newUrl);
        continue;
      }
      if (result.status === 200) {
        allUrls.push(url);
        console.error('Found:', url);
        const links = extractLinks(result.html, url);
        for (const link of links) {
          if (!visited.has(link) && !toVisit.includes(link)) {
            toVisit.push(link);
          }
        }
      }
    } catch (e) {
      console.error('Error:', url, e.message);
    }
  }
  console.log(JSON.stringify(allUrls, null, 2));
}

crawl();
