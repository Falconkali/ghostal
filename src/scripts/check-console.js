const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  await page.goto('https://ghostal.xyz/#pricing', { waitUntil: 'networkidle2' });
  
  // Wait a bit to ensure everything initializes
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
})();
