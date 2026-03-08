import { createRequire } from 'module';
const require = createRequire('/opt/homebrew/lib/node_modules/@playwright/mcp/');
const { chromium } = require('playwright');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1400, height: 700 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});
const page = await context.newPage();

await page.goto('http://localhost:3004/dashboard/experiments/cmmi5n23g000a0ay6vfv7y7zj', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

await page.screenshot({
  path: '/Users/sammii/development/flip/screenshot.png',
  type: 'png',
});

// Also save to portfolio public assets
await page.screenshot({
  path: '/Users/sammii/development/sammii-hk.github.io/public/assets/images/flip.png',
  type: 'png',
});

console.log('Screenshots saved!');
await browser.close();
