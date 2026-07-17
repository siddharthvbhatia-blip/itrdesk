'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';
const asset = 'ca-siddharth-bhatia-final-r16.jpg';
const outputDir = path.resolve(__dirname, '..', 'test-results');
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${base}/about-ca-siddharth-bhatia.html?desktop-check=20260717-r16`, { waitUntil: 'networkidle' });
    await page.waitForFunction((expected) => {
      const image = document.querySelector('.profile-hero-photo img');
      return image && image.complete && image.naturalWidth >= 150 && image.currentSrc.includes(expected);
    }, asset, { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outputDir, 'about-desktop-r16.png'), fullPage: true });

    const report = await page.evaluate(() => {
      const image = document.querySelector('.profile-hero-photo img');
      const frame = document.querySelector('.profile-hero-photo');
      const heading = document.querySelector('.profile-hero h1');
      const rect = (element) => { const value = element.getBoundingClientRect(); return { left:value.left,top:value.top,right:value.right,bottom:value.bottom,width:value.width,height:value.height }; };
      return {
        image: { complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,currentSrc:image.currentSrc,rect:rect(image),borderRadius:getComputedStyle(image).borderRadius,objectFit:getComputedStyle(image).objectFit },
        frame: { rect:rect(frame),borderRadius:getComputedStyle(frame).borderRadius,overflow:getComputedStyle(frame).overflow },
        heading: rect(heading),
        innerWidth,
        scrollWidth: document.documentElement.scrollWidth
      };
    });

    assert(report.image.currentSrc.includes(asset), `Desktop portrait uses unexpected source: ${report.image.currentSrc}`);
    assert(report.image.complete && report.image.naturalWidth >= 150 && report.image.naturalHeight >= 150, `Desktop portrait did not decode: ${report.image.naturalWidth} x ${report.image.naturalHeight}`);
    assert(Math.abs(report.image.rect.width - report.image.rect.height) <= 2, `Desktop portrait is not square: ${report.image.rect.width} x ${report.image.rect.height}`);
    assert(report.image.rect.width >= 145 && report.image.rect.width <= 165, `Desktop portrait has unsafe size: ${report.image.rect.width}`);
    assert(report.image.borderRadius.includes('50%') || parseFloat(report.image.borderRadius) >= report.image.rect.width / 2 - 3, `Desktop portrait is not circular: ${report.image.borderRadius}`);
    assert(report.frame.overflow === 'hidden', `Desktop portrait frame does not clip safely: ${report.frame.overflow}`);
    assert(report.heading.left >= report.frame.rect.right + 20, 'Desktop portrait overlaps the profile heading');
    assert(report.scrollWidth <= report.innerWidth + 2, `Desktop page horizontal overflow: ${report.scrollWidth} > ${report.innerWidth}`);

    fs.writeFileSync(path.join(outputDir, 'desktop-profile-r16.json'), JSON.stringify(report, null, 2));
    console.log('PASS desktop final portrait decode, circle and separation checks', report);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
