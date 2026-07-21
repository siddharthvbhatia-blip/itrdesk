'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const outputDir = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(outputDir, { recursive: true });

async function inspect(page, url, mobile) {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const logo = document.querySelector('.ca-india-logo');
    const brand = document.querySelector('.brand-with-ca-logo');
    const copy = document.querySelector('.brand-copy');
    const rect = element => element ? (() => { const r = element.getBoundingClientRect(); return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}; })() : null;
    return {
      primary: root.getPropertyValue('--green').trim(),
      dark: root.getPropertyValue('--green-dark').trim(),
      cream: root.getPropertyValue('--cream').trim(),
      logo: logo ? { complete:logo.complete,naturalWidth:logo.naturalWidth,naturalHeight:logo.naturalHeight,rect:rect(logo),src:logo.currentSrc } : null,
      brand: rect(brand),
      copy: rect(copy),
      themeMeta: document.querySelector('meta[name="theme-color"]')?.content || '',
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth
    };
  });
  if (mobile) await page.screenshot({ path:path.join(outputDir,'blue-white-home-mobile-r22.png'), fullPage:true });
  else await page.screenshot({ path:path.join(outputDir,'blue-white-home-desktop-r22.png'), fullPage:true });
  return data;
}

(async () => {
  const browser = await chromium.launch({ headless:true });
  try {
    const desktop = await browser.newPage({ viewport:{ width:1440,height:900 } });
    const home = await inspect(desktop, `${base}/index.html?theme=r22`, false);
    assert.equal(home.primary, '#17639a', `Desktop primary colour is ${home.primary}`);
    assert.equal(home.dark, '#0c4772', `Desktop dark blue is ${home.dark}`);
    assert.equal(home.cream, '#f6faff', `Desktop muted background is ${home.cream}`);
    assert.equal(home.themeMeta, '#17639a', `Theme meta is ${home.themeMeta}`);
    assert(home.logo && home.logo.complete && home.logo.naturalWidth >= 300 && home.logo.naturalHeight >= 200, `CA logo did not decode: ${home.logo && home.logo.naturalWidth} x ${home.logo && home.logo.naturalHeight}`);
    assert(home.logo.src.includes('ca-india-logo-r22.webp'), `Unexpected CA logo source: ${home.logo.src}`);
    assert(home.logo.rect.width >= 54 && home.logo.rect.width <= 62, `Desktop logo width unsafe: ${home.logo.rect.width}`);
    assert(home.logo.rect.right <= home.copy.left + 1, 'CA logo overlaps brand text');
    assert(home.scrollWidth <= home.innerWidth + 2, `Desktop horizontal overflow: ${home.scrollWidth} > ${home.innerWidth}`);

    const mobilePage = await browser.newPage({ viewport:{ width:360,height:800 } });
    const mobile = await inspect(mobilePage, `${base}/index.html?theme=r22-mobile`, true);
    assert.equal(mobile.primary, '#17639a', `Mobile primary colour is ${mobile.primary}`);
    assert(mobile.logo && mobile.logo.complete && mobile.logo.naturalWidth >= 300, 'Mobile CA logo did not decode');
    assert(mobile.logo.rect.width >= 44 && mobile.logo.rect.width <= 52, `Mobile logo width unsafe: ${mobile.logo.rect.width}`);
    assert(mobile.logo.rect.right <= mobile.copy.left + 1, 'Mobile CA logo overlaps brand text');
    assert(mobile.scrollWidth <= mobile.innerWidth + 2, `Mobile horizontal overflow: ${mobile.scrollWidth} > ${mobile.innerWidth}`);

    const calculator = await browser.newPage({ viewport:{ width:390,height:844 } });
    await calculator.goto(`${base}/calculator.html?theme=r22`, { waitUntil:'networkidle' });
    await calculator.waitForTimeout(400);
    const calculatorTheme = await calculator.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--green').trim());
    assert.equal(calculatorTheme, '#17639a', `Calculator did not receive global blue theme: ${calculatorTheme}`);

    fs.writeFileSync(path.join(outputDir,'blue-white-r22.json'), JSON.stringify({home,mobile,calculatorTheme},null,2));
    console.log('PASS decoded CA logo, desktop/mobile brand geometry, blue-white variables and global calculator theme');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
