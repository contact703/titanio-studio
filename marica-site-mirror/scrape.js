const scrape = require('website-scraper');
const path = require('path');

const urls = [
  'https://maricafilmcommission.com/',
  'https://maricafilmcommission.com/pt/home-portugues/',
  'https://maricafilmcommission.com/en/home/',
  'https://maricafilmcommission.com/pt/locacoes/',
  'https://maricafilmcommission.com/en/locations/',
  'https://maricafilmcommission.com/pt/envie-uma-locacao/',
  'https://maricafilmcommission.com/en/send-a-location/',
  'https://maricafilmcommission.com/pt/contato/',
  'https://maricafilmcommission.com/en/contact/',
  'https://maricafilmcommission.com/pt/sobre/',
  'https://maricafilmcommission.com/en/about/',
];

const options = {
  urls: urls,
  directory: path.resolve(__dirname, 'site'),
  recursive: true,
  maxRecursiveDepth: 3,
  maxDepth: 3,
  requestConcurrency: 2,
  sources: [
    { selector: 'img', attr: 'src' },
    { selector: 'img', attr: 'data-src' },
    { selector: 'img', attr: 'data-lazy-src' },
    { selector: 'link[rel="stylesheet"]', attr: 'href' },
    { selector: 'script', attr: 'src' },
    { selector: 'a', attr: 'href' },
    { selector: 'source', attr: 'src' },
    { selector: 'video', attr: 'poster' },
    { selector: '[style]', attr: 'style' },
  ],
  subdirectories: [
    { directory: 'img', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'] },
    { directory: 'css', extensions: ['.css'] },
    { directory: 'js', extensions: ['.js'] },
    { directory: 'fonts', extensions: ['.woff', '.woff2', '.ttf', '.eot', '.otf'] },
  ],
  request: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  },
  urlFilter: function(url) {
    if (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('.webm')) return false;
    if (url.includes('google.com/maps')) return false;
    if (url.includes('facebook.com') || url.includes('instagram.com') || url.includes('twitter.com')) return false;
    if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) return true;
    if (url.includes('maricafilmcommission.com')) return true;
    return false;
  }
};

console.log('Starting scrape of', urls.length, 'pages...');
scrape(options)
  .then((result) => {
    console.log('Done! Downloaded', result.length, 'resources');
  })
  .catch((err) => {
    console.error('Error:', err);
  });
