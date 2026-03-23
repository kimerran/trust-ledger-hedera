const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const slidesPath = path.resolve(__dirname, 'slides.html');
  const outputPath = path.resolve(__dirname, 'trustledger-pitch-deck.pdf');

  if (!fs.existsSync(slidesPath)) {
    console.error('slides.html not found at', slidesPath);
    process.exit(1);
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  console.log('Loading slides.html...');
  await page.goto(`file://${slidesPath}`, { waitUntil: 'networkidle0' });

  console.log('Exporting PDF...');
  await page.pdf({
    path: outputPath,
    width: '1280px',
    height: '720px',
    printBackground: true,
    pageRanges: '',
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  const kb = Math.round(stats.size / 1024);
  console.log(`Done: ${outputPath} (${kb} KB)`);
})();
