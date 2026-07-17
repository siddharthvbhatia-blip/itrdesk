'use strict';
const assert = require('assert');
const { chromium } = require('playwright');

const base = process.env.BASE_URL || 'http://127.0.0.1:4173';

async function snapshot(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
      borderRadius: style.borderRadius,
      position: style.position
    };
  });
}

function assertCircle(label, value) {
  assert(Math.abs(value.width - value.height) <= 2, `${label} is not square: ${value.width} x ${value.height}`);
  assert(value.width >= 120 && value.width <= 180, `${label} has unsafe width ${value.width}`);
  const percentageCircle = value.borderRadius.includes('%') && parseFloat(value.borderRadius) >= 49;
  const pixelCircle = !value.borderRadius.includes('%') && parseFloat(value.borderRadius) >= value.width / 2 - 3;
  assert(percentageCircle || pixelCircle, `${label} is not circular: radius ${value.borderRadius}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const about = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await about.goto(`${base}/about-ca-siddharth-bhatia.html?mobile-check=1`, { waitUntil: 'networkidle' });
    await about.waitForTimeout(500);
    const aboutFrame = await snapshot(about, '.profile-hero-photo');
    const aboutImage = await snapshot(about, '.profile-hero-photo img');
    assertCircle('About portrait frame', aboutFrame);
    assertCircle('About portrait image', aboutImage);
    const sidebar = await snapshot(about, '.profile-sidebar');
    assert(!['sticky', 'fixed'].includes(sidebar.position), `About sidebar remains ${sidebar.position}`);
    const aboutOverflow = await about.evaluate(() => ({ inner: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert(aboutOverflow.scroll <= aboutOverflow.inner + 2, `About page horizontal overflow: ${aboutOverflow.scroll} > ${aboutOverflow.inner}`);
    const guideGap = await about.evaluate(() => {
      const side = document.querySelector('.profile-sidebar').getBoundingClientRect();
      const guide = document.querySelector('.section.muted .seo-card').getBoundingClientRect();
      return guide.top - side.bottom;
    });
    assert(guideGap >= -1, `About sidebar overlaps guide cards by ${-guideGap}px`);

    const home = await browser.newPage({ viewport: { width: 360, height: 800 } });
    await home.goto(`${base}/index.html?mobile-check=1`, { waitUntil: 'networkidle' });
    await home.waitForSelector('.professional-verification');
    await home.waitForTimeout(500);
    const homePortrait = await snapshot(home, '.professional-portrait img');
    assertCircle('Homepage portrait', homePortrait);
    const blocks = await home.locator('.professional-card > .professional-portrait, .professional-card > .professional-copy, .professional-card > .professional-verification').evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    }));
    assert.strictEqual(blocks.length, 3, `Expected 3 homepage professional blocks, found ${blocks.length}`);
    for (let index = 1; index < blocks.length; index += 1) {
      assert(blocks[index].top >= blocks[index - 1].bottom - 1, `Homepage professional blocks ${index - 1} and ${index} overlap`);
    }
    const homeOverflow = await home.evaluate(() => ({ inner: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert(homeOverflow.scroll <= homeOverflow.inner + 2, `Homepage horizontal overflow: ${homeOverflow.scroll} > ${homeOverflow.inner}`);

    console.log('PASS Chromium 360px circular portrait and no-overlap checks', { aboutFrame, aboutImage, sidebarPosition: sidebar.position, guideGap, homePortrait, blocks });
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
